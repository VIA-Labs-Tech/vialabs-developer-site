---
sidebar_position: 3
sidebar_label: Private Oracle
title: Private Oracle — Cross-Chain Random Number
description: Build a verifiable random number oracle that delivers randomness from an off-chain source to smart contracts on any chain.
---

# Private Oracle

Build a cross-chain oracle that fetches verifiable random numbers from an off-chain source and delivers them to smart contracts on any chain. This demonstrates the **Private Oracle** pattern — where you control the data source, the oracle node, and the delivery infrastructure.

Unlike public oracle networks (Chainlink VRF, etc.), Private Oracles give you full control over your data pipeline. You run the oracle, you choose the source, and VIA Labs handles the cross-chain delivery.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v16+
- [MetaMask](https://metamask.io/) or another Web3 wallet
- Testnet tokens on two chains — see [Testnet Tokens](/docs/general/testnet-tokens)
- Familiarity with [Hello World](/docs/examples/hello-world) example

---

## Overview

The Private Oracle pattern has three components:

```
Off-Chain Driver (Node.js)         Source Chain              Destination Chain
──────────────────────────         ────────────              ──────────────────
1. Fetches random number
   from random.org API
2. Calls oracle contract    →     OracleWriter.sol
   with the data                    ↓ messageSend()
                                    ↓ VIA Gateway
                                                              OracleReader.sol
                                                                ↓ messageProcess()
                                                                ↓ stores randomness
                                                                ↓ contracts can read it
```

The off-chain driver is a simple script that runs on your server. It fetches data from any source (API, database, AI model, IoT device) and submits it to a smart contract. VIA Gateway then delivers it to contracts on other chains.

---

## Contract 1: Oracle Writer (Source Chain)

Create `contracts/OracleWriter.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@vialabs-tech/contracts/ViaIntegrationV1.sol";

/// @title OracleWriter
/// @notice Receives data from an off-chain oracle driver and sends it cross-chain.
///         Only the designated oracle operator can submit data.
contract OracleWriter is ViaIntegrationV1 {

    address public oracleOperator;
    uint256 public lastRequestId;

    event RandomnessRequested(uint256 indexed requestId, uint64 destChainId);
    event RandomnessSubmitted(uint256 indexed requestId, uint256 randomNumber);

    error NotOperator();
    error ZeroValue();

    modifier onlyOperator() {
        if (msg.sender != oracleOperator) revert NotOperator();
        _;
    }

    constructor(address operator) ViaIntegrationV1(msg.sender) {
        oracleOperator = operator;
    }

    /// @notice Oracle operator submits a random number and sends it cross-chain
    /// @param destChainId Destination chain to deliver the randomness to
    /// @param randomNumber The random number fetched off-chain
    function submitRandomness(
        uint64 destChainId,
        uint256 randomNumber
    ) external payable onlyOperator returns (uint256) {
        if (randomNumber == 0) revert ZeroValue();

        lastRequestId++;
        bytes memory data = abi.encode(lastRequestId, randomNumber, block.timestamp);

        emit RandomnessSubmitted(lastRequestId, randomNumber);
        return messageSend(destChainId, data, 1);
    }

    /// @notice Update the oracle operator address
    function setOracleOperator(address operator) external onlyProjectOwner {
        oracleOperator = operator;
    }

    /// @notice Not used on the writer side — this contract only sends
    function messageProcess(
        uint256, uint64, bytes32, bytes32,
        bytes memory, bytes memory, uint256
    ) internal override {
        // Writer does not receive messages
    }
}
```

---

## Contract 2: Oracle Reader (Destination Chain)

Create `contracts/OracleReader.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@vialabs-tech/contracts/ViaIntegrationV1.sol";

/// @title OracleReader
/// @notice Receives cross-chain randomness from OracleWriter and makes it
///         available to other contracts on this chain.
contract OracleReader is ViaIntegrationV1 {

    struct RandomResult {
        uint256 requestId;
        uint256 randomNumber;
        uint256 timestamp;
        uint64 sourceChainId;
    }

    RandomResult public latestResult;
    mapping(uint256 => RandomResult) public results;
    uint256 public totalResults;

    event RandomnessReceived(
        uint256 indexed requestId,
        uint256 randomNumber,
        uint64 sourceChainId
    );

    constructor() ViaIntegrationV1(msg.sender) {}

    /// @notice Called automatically when randomness arrives from another chain
    function messageProcess(
        uint256,
        uint64 sourceChainId,
        bytes32, bytes32,
        bytes memory onChainData,
        bytes memory, uint256
    ) internal override {
        (uint256 requestId, uint256 randomNumber, uint256 timestamp) =
            abi.decode(onChainData, (uint256, uint256, uint256));

        RandomResult memory result = RandomResult({
            requestId: requestId,
            randomNumber: randomNumber,
            timestamp: timestamp,
            sourceChainId: sourceChainId
        });

        latestResult = result;
        results[requestId] = result;
        totalResults++;

        emit RandomnessReceived(requestId, randomNumber, sourceChainId);
    }

    /// @notice Get a random number within a range (e.g., for dice rolls, lotteries)
    /// @param max Upper bound (exclusive)
    function getRandomInRange(uint256 max) external view returns (uint256) {
        require(latestResult.randomNumber != 0, "No randomness available");
        return latestResult.randomNumber % max;
    }
}
```

---

## Off-Chain Driver (Node.js)

Create `oracle-driver.js`:

```javascript
const { ethers } = require("ethers");

// Configuration
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ORACLE_WRITER_ADDRESS = process.env.ORACLE_WRITER_ADDRESS;
const DEST_CHAIN_ID = parseInt(process.env.DEST_CHAIN_ID);
const INTERVAL_MS = 60000; // Fetch every 60 seconds

// OracleWriter ABI (only what we need)
const ABI = [
  "function submitRandomness(uint64 destChainId, uint256 randomNumber) external payable returns (uint256)"
];

async function fetchRandomNumber() {
  // Fetch from random.org's integer API (free, no key required)
  const response = await fetch(
    "https://www.random.org/integers/?num=1&min=1&max=1000000000&col=1&base=10&format=plain&rnd=new"
  );
  const text = await response.text();
  return BigInt(text.trim());
}

async function submitToChain(randomNumber) {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const oracle = new ethers.Contract(ORACLE_WRITER_ADDRESS, ABI, wallet);

  const tx = await oracle.submitRandomness(
    DEST_CHAIN_ID,
    randomNumber,
    { value: ethers.parseEther("0.001") } // msg.value for destination gas
  );

  console.log(`Submitted randomness: ${randomNumber}`);
  console.log(`TX: ${tx.hash}`);
  await tx.wait();
  console.log("Confirmed. Message sent cross-chain.");
}

async function run() {
  console.log("Oracle driver started.");
  console.log(`Delivering to chain ${DEST_CHAIN_ID} every ${INTERVAL_MS / 1000}s`);

  while (true) {
    try {
      const randomNumber = await fetchRandomNumber();
      await submitToChain(randomNumber);
    } catch (error) {
      console.error("Error:", error.message);
    }
    await new Promise(resolve => setTimeout(resolve, INTERVAL_MS));
  }
}

run();
```

Run with:

```bash
RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY \
PRIVATE_KEY=your_private_key \
ORACLE_WRITER_ADDRESS=0x... \
DEST_CHAIN_ID=80002 \
node oracle-driver.js
```

---

## Deployment & Setup

| Step | Chain | Action |
|------|-------|--------|
| 1 | Source | Deploy `OracleWriter(operatorAddress)` |
| 2 | Destination | Deploy `OracleReader()` |
| 3 | Source | `setMessageGateway()` + `setMessageEndpoints()` |
| 4 | Destination | `setMessageGateway()` + `setMessageEndpoints()` |
| 5 | Your server | Run `oracle-driver.js` |

---

## How It Works

```
Your Server                  Source Chain (Sepolia)          Destination (Amoy)
───────────                  ─────────────────────          ──────────────────
Fetch random number
from random.org
       ↓
Call submitRandomness()  →   OracleWriter
                               ↓ abi.encode(requestId, number, timestamp)
                               ↓ messageSend(destChainId, data, 1)
                               ↓ Gateway emits SendRequested
                                                              Relayer delivers
                                                                ↓ OracleReader.messageProcess()
                                                                ↓ Stores result
                                                                ↓ emit RandomnessReceived

                                                              Other contracts call
                                                              reader.getRandomInRange(100)
                                                                ↓ returns 0-99
```

---

## Why Private Oracles?

| Feature | Private Oracle (VIA Labs) | Public Oracle Networks |
|---------|--------------------------|----------------------|
| **Data source** | Any — APIs, databases, AI, IoT | Limited to supported feeds |
| **Control** | You run the oracle node | Third-party operated |
| **Cost** | Source chain gas only | Oracle fees + gas |
| **Latency** | Direct — no oracle network queue | Depends on network congestion |
| **Privacy** | Your data stays private | Data may be public |
| **Cross-chain** | Built-in via VIA Gateway | Usually single-chain |

---

## Use Cases

This pattern works for any off-chain data you want on-chain:

- **Random numbers** — lotteries, gaming, NFT trait generation
- **Price feeds** — custom pricing data from proprietary sources
- **AI/ML outputs** — LLM responses, prediction models, sentiment analysis
- **IoT sensor data** — temperature, location, supply chain tracking
- **Sports scores** — live game data for prediction markets
- **Compliance data** — KYC/AML attestations, regulatory checks

---

## Next Steps

- [Hello World](/docs/examples/hello-world) — simplest cross-chain message
- [Burn & Mint Token](/docs/examples/burn-mint-token) — cross-chain ERC20
- [SDK Reference](/docs/general/package) — full API documentation
