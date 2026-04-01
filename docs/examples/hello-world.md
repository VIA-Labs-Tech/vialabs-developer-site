---
sidebar_label: Hello World
title: Hello World — Cross-Chain Message
description: Send a simple cross-chain message between two EVM contracts using VIA Labs.
---

# Hello World

Send a string from one chain to another. One contract, two deployments, under 30 lines of Solidity.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v16+
- A wallet with testnet ETH on Sepolia and testnet MATIC on Amoy — see [Testnet Tokens](/docs/general/testnet-tokens)

---

## Step 1: Create the Project

```bash
mkdir hello-via && cd hello-via
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install @openzeppelin/contracts
npx hardhat init
```

Select **Create a TypeScript project** when prompted. Accept the defaults.

---

## Step 2: Add the VIA Contracts

Copy the VIA Labs base contract and interfaces into your project. Create the folder and files:

```bash
mkdir contracts/via
```

Copy all 5 files from the [Contract Source](/docs/general/contract-source) page into `contracts/via/`:

- `ViaIntegrationV1.sol`
- `IViaGatewayV1.sol`
- `IViaIntegrationV1.sol`
- `IFeeCollector.sol`
- `IGasCollector.sol`

---

## Step 3: Write the Contract

Create `contracts/HelloVIA.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./via/ViaIntegrationV1.sol";

contract HelloVIA is ViaIntegrationV1 {
    string public lastMessage;
    uint64 public lastSourceChain;

    event MessageReceived(uint64 sourceChainId, string message);

    constructor() ViaIntegrationV1(msg.sender) {}

    function sendMessage(
        uint64 destChainId,
        string calldata message
    ) external payable returns (uint256) {
        return messageSend(destChainId, abi.encode(message), 1);
    }

    function messageProcess(
        uint256,
        uint64 sourceChainId,
        bytes32,
        bytes32,
        bytes memory onChainData,
        bytes memory,
        uint256
    ) internal override {
        string memory message = abi.decode(onChainData, (string));
        lastMessage = message;
        lastSourceChain = sourceChainId;
        emit MessageReceived(sourceChainId, message);
    }
}
```

What this does:
- `sendMessage()` — encodes a string and sends it to another chain via `messageSend()`
- `messageProcess()` — receives the message on the destination chain, decodes it, stores it

---

## Step 4: Configure Hardhat

Replace `hardhat.config.ts` with:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    amoy: {
      url: process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};

export default config;
```

Install dotenv:

```bash
npm install --save-dev dotenv
```

Create `.env`:

```bash
PRIVATE_KEY=your_wallet_private_key_here
SEPOLIA_RPC_URL=https://rpc.sepolia.org
AMOY_RPC_URL=https://rpc-amoy.polygon.technology
```

:::danger
Never commit `.env` to git. Add it to `.gitignore`.
:::

---

## Step 5: Write the Deploy Script

Create `scripts/deploy.ts`:

```typescript
import { ethers } from "hardhat";

async function main() {
  const HelloVIA = await ethers.getContractFactory("HelloVIA");
  const contract = await HelloVIA.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log("HelloVIA deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

---

## Step 6: Deploy to Both Chains

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

Save the output address. Then:

```bash
npx hardhat run scripts/deploy.ts --network amoy
```

Save that address too. You now have two contract addresses:

```
SEPOLIA_CONTRACT=0x...   ← from first deploy
AMOY_CONTRACT=0x...      ← from second deploy
```

---

## Step 7: Configure the Contracts

Create `scripts/configure.ts`:

```typescript
import { ethers } from "hardhat";

// ---- FILL THESE IN ----
const CONTRACT_ADDRESS = "";        // deployed HelloVIA address on THIS chain
const GATEWAY_ADDRESS = "";         // VIA Gateway address on THIS chain
const REMOTE_CHAIN_ID = 0;          // chain ID of the OTHER chain
const REMOTE_CONTRACT_ADDRESS = ""; // deployed HelloVIA address on the OTHER chain
// ------------------------

async function main() {
  const contract = await ethers.getContractAt("HelloVIA", CONTRACT_ADDRESS);

  // 1. Connect to the VIA Gateway
  console.log("Setting gateway...");
  const tx1 = await contract.setMessageGateway(GATEWAY_ADDRESS);
  await tx1.wait();
  console.log("Gateway set.");

  // 2. Tell the contract where its peer lives on the other chain
  console.log("Setting endpoint...");
  const tx2 = await contract.setMessageEndpoints(
    [REMOTE_CHAIN_ID],
    [ethers.zeroPadValue(REMOTE_CONTRACT_ADDRESS, 32)]
  );
  await tx2.wait();
  console.log("Endpoint set. Configuration complete.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

Run it on Sepolia (fill in addresses first):

```bash
npx hardhat run scripts/configure.ts --network sepolia
```

Then update the constants for the Amoy side and run:

```bash
npx hardhat run scripts/configure.ts --network amoy
```

:::caution Gateway Addresses
VIA Gateway testnet addresses are available on the [Supported Networks](/docs/general/supported-networks) page. Testnet gateways are being deployed — check the page for the latest status.
:::

---

## Step 8: Send a Message

Create `scripts/send.ts`:

```typescript
import { ethers } from "hardhat";

const CONTRACT_ADDRESS = ""; // your HelloVIA on Sepolia
const DEST_CHAIN_ID = 80002; // Amoy

async function main() {
  const contract = await ethers.getContractAt("HelloVIA", CONTRACT_ADDRESS);

  console.log("Sending message...");
  const tx = await contract.sendMessage(
    DEST_CHAIN_ID,
    "Hello from Sepolia!",
    { value: ethers.parseEther("0.001") }
  );
  await tx.wait();
  console.log("Message sent! TX:", tx.hash);
  console.log("Wait 1-5 minutes for cross-chain delivery.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

```bash
npx hardhat run scripts/send.ts --network sepolia
```

---

## Step 9: Verify on Destination

Create `scripts/read.ts`:

```typescript
import { ethers } from "hardhat";

const CONTRACT_ADDRESS = ""; // your HelloVIA on Amoy

async function main() {
  const contract = await ethers.getContractAt("HelloVIA", CONTRACT_ADDRESS);
  const message = await contract.lastMessage();
  const sourceChain = await contract.lastSourceChain();
  console.log("Last message:", message);
  console.log("From chain:", sourceChain.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

```bash
npx hardhat run scripts/read.ts --network amoy
```

Expected output after delivery:

```
Last message: Hello from Sepolia!
From chain: 11155111
```

---

## Project Structure

When you're done, your project looks like:

```
hello-via/
├── contracts/
│   ├── via/
│   │   ├── ViaIntegrationV1.sol
│   │   ├── IViaGatewayV1.sol
│   │   ├── IViaIntegrationV1.sol
│   │   ├── IFeeCollector.sol
│   │   └── IGasCollector.sol
│   └── HelloVIA.sol
├── scripts/
│   ├── deploy.ts
│   ├── configure.ts
│   ├── send.ts
│   └── read.ts
├── .env
├── hardhat.config.ts
└── package.json
```

---

## Next Steps

- [Burn & Mint Token](/docs/examples/burn-mint-token) — deploy a cross-chain ERC20 token
- [Lock & Release Token](/docs/examples/lock-release-token) — bridge existing tokens like USDC
- [Contract Source](/docs/general/contract-source) — ViaIntegrationV1 and reference implementations
