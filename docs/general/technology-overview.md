---
sidebar_position: 1
---

# Technology Overview

VIA Labs enables **direct cross-chain smart contract communication** without traditional bridges. Messages flow securely between chains using a multi-layered validation protocol.

## Architecture

VIA Labs uses a decentralized network of validators to relay messages between blockchains. The system is designed for:

- **Security** — Multi-layered validation with VIA, Chain, Project, and Proof-of-Stake layers
- **Speed** — Messages are delivered as fast as the destination chain's finality allows
- **Flexibility** — Support for arbitrary message passing, not just token transfers

## How It Works

1. A smart contract on the source chain calls `_sendMessage()` from the VIA Labs SDK
2. VIA Labs validators detect and validate the message
3. The message is relayed to the destination chain
4. The destination contract's `_processMessage()` function is called with the payload

## Security Model

VIA Labs implements a 4-layer security model:

| Layer | Description |
|-------|-------------|
| **VIA Layer** | Core protocol validation |
| **Chain Layer** | Native chain finality verification |
| **Project Layer** | Per-project configuration and access control |
| **PoS Layer** | Proof-of-Stake validator consensus |

## Use Cases

- **Cross-Chain Tokens** — ERC20 tokens that exist natively on multiple chains
- **Cross-Chain NFTs** — NFTs that can move between blockchains
- **Private Oracles** — Off-chain data feeds connected to smart contracts
- **Cross-Chain Governance** — DAO voting across multiple networks
- **Web2-Web3 Integration** — Connect traditional APIs to smart contracts
