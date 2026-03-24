---
sidebar_position: 3
---

# Private Oracle Quickstart

Connect off-chain data sources (APIs, AI models, databases) to your smart contracts using VIA Labs Private Oracles.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [MetaMask](https://metamask.io/) or another Web3 wallet
- Testnet tokens (see [Testnet Tokens](/docs/general/testnet-tokens))
- An API key for your data source (e.g., OpenAI for AI oracles)

## Step 1: Clone the Quickstart Repo

```bash
git clone https://github.com/VIA-Labs-Tech/quickstart-oracle.git
cd quickstart-oracle
npm install
```

## Step 2: Configure Environment

Create a `.env` file:

```bash
PRIVATE_KEY=your_wallet_private_key
OPENAI_API_KEY=your_openai_key  # Optional: for AI oracle examples
```

## Step 3: Deploy the Oracle Contract

```bash
npx hardhat deploy --network sepolia
```

## Step 4: Run the Oracle Node

The oracle node listens for on-chain requests and responds with off-chain data:

```bash
npm run oracle
```

The node will:
1. Monitor the blockchain for oracle requests
2. Fetch data from your configured source
3. Submit the response back to the smart contract

## Step 5: Launch the Dashboard

```bash
npm run dev
```

Use the web dashboard to submit oracle queries and view responses.

## How Private Oracles Work

Unlike public oracle networks, VIA Labs Private Oracles give you full control:

- **You run the oracle node** — Your data, your infrastructure
- **Any data source** — REST APIs, databases, AI models, IoT devices
- **Cross-chain capable** — Oracle responses can be relayed to contracts on other chains
- **Low latency** — Direct connection without third-party oracle networks

## Next Steps

- Connect your own API endpoint
- Build a price feed oracle
- Create an AI-powered smart contract
- Explore cross-chain oracle patterns
