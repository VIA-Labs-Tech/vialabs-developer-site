---
sidebar_position: 1
---

# Cross-Chain Token Quickstart

Build and deploy an ERC20 token that can be transferred across blockchains using VIA Labs.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [MetaMask](https://metamask.io/) or another Web3 wallet
- Testnet tokens on at least two networks (see [Testnet Tokens](/docs/general/testnet-tokens))
- [Hardhat](https://hardhat.org/) or [Foundry](https://getfoundry.sh/)

## Step 1: Clone the Quickstart Repo

```bash
git clone https://github.com/VIA-Labs-Tech/quickstart-token.git
cd quickstart-token
npm install
```

## Step 2: Configure Environment

Create a `.env` file:

```bash
PRIVATE_KEY=your_wallet_private_key
```

## Step 3: Deploy the Token Contract

Deploy to your chosen test networks:

```bash
npx hardhat deploy --network sepolia
npx hardhat deploy --network fuji
```

The deployment script will:
1. Deploy the token contract
2. Configure the VIA Labs cross-chain client
3. Set up the token on both networks

## Step 4: Bridge Tokens

Once deployed, you can bridge tokens between chains:

```solidity
// Transfer tokens from Sepolia to Fuji
function bridge(uint amount) external {
    _burn(msg.sender, amount);
    bytes memory payload = abi.encode(msg.sender, amount);
    _sendMessage(43113, payload); // Fuji chain ID
}
```

## Step 5: Test the Frontend

```bash
npm run dev
```

Open the local development server to interact with your cross-chain token through a web interface.

## Next Steps

- Customize the token (name, symbol, supply)
- Add more chains to the deployment
- Integrate with your existing DeFi application
- Read the [SDK Reference](/docs/general/package) for advanced features
