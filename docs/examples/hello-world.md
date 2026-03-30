---
sidebar_label: Hello World
title: Hello World — Cross-Chain Message
description: Send a simple cross-chain message between two EVM contracts using VIA Labs.
---

# Hello World

Send a simple message from one chain to another using VIA Labs cross-chain messaging. This is the simplest possible integration — a single contract that sends and receives string messages across chains.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v16+
- [MetaMask](https://metamask.io/) or another Web3 wallet
- Testnet tokens on two chains — see [Testnet Tokens](/docs/general/testnet-tokens)
- [Hardhat](https://hardhat.org/) or [Foundry](https://book.getfoundry.sh/) installed

---

## Overview

You will deploy **one contract** on two different chains. Each contract can send a string message to its counterpart on the other chain. When a message arrives, it's stored and can be read by anyone.

The entire contract is under 30 lines of Solidity.

---

## Step 1: Install the SDK

```bash
npm install @vialabs-tech/contracts
```

---

## Step 2: Write the Contract

Create `contracts/HelloVIA.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@vialabs-tech/contracts/ViaIntegrationV1.sol";

contract HelloVIA is ViaIntegrationV1 {
    string public lastMessage;
    uint64 public lastSourceChain;

    event MessageReceived(uint64 sourceChainId, string message);

    constructor() ViaIntegrationV1(msg.sender) {}

    /// @notice Send a message to a contract on another chain
    function sendMessage(
        uint64 destChainId,
        string calldata message
    ) external payable returns (uint256) {
        bytes memory payload = abi.encode(message);
        return messageSend(destChainId, payload, 1);
    }

    /// @notice Called automatically when a message arrives from another chain
    function messageProcess(
        uint256,           // txId
        uint64 sourceChainId,
        bytes32,           // sender
        bytes32,           // recipient
        bytes memory onChainData,
        bytes memory,      // offChainData
        uint256            // gasRefundAmount
    ) internal override {
        string memory message = abi.decode(onChainData, (string));
        lastMessage = message;
        lastSourceChain = sourceChainId;
        emit MessageReceived(sourceChainId, message);
    }
}
```

**What's happening here:**

1. `HelloVIA` inherits from `ViaIntegrationV1` — this gives it all the cross-chain plumbing
2. `sendMessage()` encodes a string and calls `messageSend()` to dispatch it through the VIA Gateway
3. `messageProcess()` is called automatically when a validated message arrives from another chain — it decodes the string and stores it

That's it. Two functions. Everything else — gateway connection, signature validation, endpoint verification — is handled by `ViaIntegrationV1`.

---

## Step 3: Deploy to Two Chains

Deploy `HelloVIA` on two testnet chains (e.g., Sepolia and Amoy). Note the deployed contract address on each chain.

### Using Hardhat

```bash
npx hardhat run scripts/deploy.js --network sepolia
npx hardhat run scripts/deploy.js --network amoy
```

### Using Foundry

```bash
forge create HelloVIA --rpc-url $SEPOLIA_RPC --private-key $PRIVATE_KEY
forge create HelloVIA --rpc-url $AMOY_RPC --private-key $PRIVATE_KEY
```

---

## Step 4: Configure

After deployment, run these two configuration calls **on each chain**. These connect your contract to the VIA Gateway and tell it where its counterpart lives.

### On Sepolia

```solidity
// Connect to the VIA Gateway on Sepolia
helloVIA.setMessageGateway(SEPOLIA_GATEWAY_ADDRESS);

// Tell the contract where its peer on Amoy lives
uint64[] memory chains = new uint64[](1);
bytes32[] memory endpoints = new bytes32[](1);
chains[0] = 80002;  // Amoy chain ID
endpoints[0] = bytes32(uint256(uint160(AMOY_CONTRACT_ADDRESS)));
helloVIA.setMessageEndpoints(chains, endpoints);
```

### On Amoy

```solidity
// Connect to the VIA Gateway on Amoy
helloVIA.setMessageGateway(AMOY_GATEWAY_ADDRESS);

// Tell the contract where its peer on Sepolia lives
uint64[] memory chains = new uint64[](1);
bytes32[] memory endpoints = new bytes32[](1);
chains[0] = 11155111;  // Sepolia chain ID
endpoints[0] = bytes32(uint256(uint160(SEPOLIA_CONTRACT_ADDRESS)));
helloVIA.setMessageEndpoints(chains, endpoints);
```

:::tip
Gateway addresses for each chain are available in the [Supported Networks](/docs/general/supported-networks) page.
:::

---

## Step 5: Send a Message

Call `sendMessage()` on the Sepolia contract, targeting Amoy:

```solidity
helloVIA.sendMessage{value: 0.001 ether}(
    80002,                    // Amoy chain ID
    "Hello from Sepolia!"     // Your message
);
```

The `msg.value` covers the destination chain gas cost.

---

## Step 6: Verify

After a few moments (depending on chain finality), check the Amoy contract:

```solidity
helloVIA.lastMessage();      // "Hello from Sepolia!"
helloVIA.lastSourceChain();  // 11155111 (Sepolia)
```

Your message traveled from Sepolia → VIA Gateway → Validators → VIA Gateway → Amoy. The three-layer security model validated it, and the gateway delivered it to your contract.

---

## How It Works

```
Sepolia                                      Amoy
────────                                     ────
User calls sendMessage()
  ↓ abi.encode("Hello from Sepolia!")
  ↓ messageSend(80002, payload, 1)
  ↓ ViaGatewayV1.send() → emit SendRequested
                                              Relayer calls ViaGatewayV1.process()
                                                ↓ Signature validation (3 layers)
                                                ↓ messageProcessFromGateway()
                                                ↓ messageProcess() override
                                                ↓ lastMessage = "Hello from Sepolia!"
                                                ↓ emit MessageReceived
```

---

## Next Steps

- [Burn & Mint Token](/docs/examples/burn-mint-token) — deploy a cross-chain ERC20 token
- [Lock & Release Token](/docs/examples/lock-release-token) — bridge existing tokens like USDC
- [SDK Reference](/docs/general/package) — full API documentation
