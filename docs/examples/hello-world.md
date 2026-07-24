---
sidebar_label: Hello World
title: Hello World — Cross-Chain Message
description: Send a simple cross-chain message between two EVM contracts using VIA Labs.
---

# Hello World

Send a string from one chain to another. One contract, two deployments, under 30 lines of Solidity.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v20+ (LTS) — Hardhat 2 officially supports Node 20/22/24
- A wallet with testnet ETH on Sepolia and testnet AVAX on Avalanche Fuji — see [Testnet Tokens](/docs/general/testnet-tokens)

---

## Step 1: Create the Project

```bash
mkdir hello-via && cd hello-via
npm init -y
npm install --save-dev hardhat@^2 @nomicfoundation/hardhat-toolbox@^5 typescript@~5.8.0 ts-node @types/node
npm install @openzeppelin/contracts@^4
npx hardhat init
```

Select **Create a TypeScript project** when prompted. Accept the defaults.

:::info Pinned versions
The version pins matter. Hardhat 3 changed the config format and requires ESM projects — this guide uses Hardhat 2. OpenZeppelin 5 changed the `Ownable` constructor — the VIA reference contracts use OpenZeppelin 4. TypeScript is pinned to 5.8 because 5.9+ is incompatible with `ts-node`, which Hardhat 2 uses to run TypeScript scripts.
:::

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
      url: process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    fuji: {
      url: process.env.FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc",
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
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
```

The defaults above are free public endpoints and work as-is. They are rate-limited — if you hit timeouts, create a free RPC key (Alchemy, Infura, QuickNode) and put your keyed URL in `.env`.

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
npx hardhat run scripts/deploy.ts --network fuji
```

Save that address too. You now have two contract addresses:

```
SEPOLIA_CONTRACT=0x...   ← from first deploy
FUJI_CONTRACT=0x...      ← from second deploy
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

:::tip Gateway address and chain IDs
The VIA Gateway address on both Sepolia and Fuji is `0x6cdc2ed3321f4e6bf835b03af691d418bbb350ba` — the full list for every network is on the [Supported Networks](/docs/general/supported-networks) page.

VIA uses standard EVM chain IDs: Sepolia is `11155111`, Fuji is `43113`.
:::

Run it on Sepolia (fill in addresses first):

```bash
npx hardhat run scripts/configure.ts --network sepolia
```

Then update the constants for the Fuji side and run:

```bash
npx hardhat run scripts/configure.ts --network fuji
```

---

## Step 8: Send a Message

Create `scripts/send.ts`:

```typescript
import { ethers } from "hardhat";

const CONTRACT_ADDRESS = ""; // your HelloVIA on Sepolia
const DEST_CHAIN_ID = 43113; // Fuji

async function main() {
  const contract = await ethers.getContractAt("HelloVIA", CONTRACT_ADDRESS);

  console.log("Sending message...");
  const tx = await contract.sendMessage(DEST_CHAIN_ID, "Hello from Sepolia!");
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

:::info Delivery fees
On testnets, message delivery is currently free — you don't need to attach any value to the send. On mainnet, delivery fees may apply; see [Fees & Gas](/docs/general/fees-and-gas).
:::

---

## Step 9: Verify on Destination

Create `scripts/read.ts`:

```typescript
import { ethers } from "hardhat";

const CONTRACT_ADDRESS = ""; // your HelloVIA on Fuji

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
npx hardhat run scripts/read.ts --network fuji
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
