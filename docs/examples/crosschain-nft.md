---
sidebar_position: 2
---

# Cross-Chain NFT Quickstart

Deploy NFTs that can move seamlessly between blockchains using VIA Labs.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [MetaMask](https://metamask.io/) or another Web3 wallet
- Testnet tokens on at least two networks (see [Testnet Tokens](/docs/general/testnet-tokens))

## Step 1: Clone the Quickstart Repo

```bash
git clone https://github.com/VIA-Labs-Tech/quickstart-nft.git
cd quickstart-nft
npm install
```

## Step 2: Configure Environment

Create a `.env` file:

```bash
PRIVATE_KEY=your_wallet_private_key
```

## Step 3: Deploy the NFT Contract

```bash
npx hardhat deploy --network sepolia
npx hardhat deploy --network fuji
```

## Step 4: Mint and Bridge NFTs

Mint an NFT on the source chain, then bridge it to another chain:

```solidity
function bridgeNFT(uint tokenId, uint destChainId) external {
    require(ownerOf(tokenId) == msg.sender, "Not owner");
    _burn(tokenId);
    bytes memory payload = abi.encode(msg.sender, tokenId, tokenURI(tokenId));
    _sendMessage(destChainId, payload);
}
```

The NFT appears on the destination chain with the same token ID and metadata.

## Step 5: Launch the Frontend

```bash
npm run dev
```

## Key Concepts

- **Blockchain-agnostic NFTs** — Your NFT exists natively on whichever chain the holder chooses
- **Metadata preservation** — Token URI and attributes follow the NFT across chains
- **No wrapping** — Unlike bridge-wrapped NFTs, these are native assets on every chain

## Next Steps

- Customize the NFT collection (art, metadata, minting logic)
- Add marketplace integration
- Explore the [SDK Reference](/docs/general/package) for advanced messaging
