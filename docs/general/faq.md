---
sidebar_position: 6
---

# FAQ

Frequently asked questions about VIA Labs cross-chain infrastructure.

## General

### What is VIA Labs?

VIA Labs provides bridgeless cross-chain communication infrastructure. Instead of traditional bridges that lock and mint tokens, VIA Labs enables direct smart contract messaging across blockchains.

### How is this different from a bridge?

Traditional bridges lock tokens on one chain and mint wrapped versions on another. VIA Labs enables arbitrary message passing between smart contracts — tokens, NFTs, data, governance votes, or any other payload can be sent cross-chain natively.

### How many networks are supported?

VIA Labs supports 200+ public and private networks. See the full list on the [Supported Networks](/docs/general/supported-networks) page.

## Development

### What programming language do I need?

Smart contracts are written in **Solidity**. The VIA Labs SDK extends your Solidity contracts with cross-chain messaging capabilities.

### How long does a cross-chain message take?

Delivery time depends on the source and destination chain finality times. Most messages are delivered within 1-5 minutes.

### Can I send arbitrary data cross-chain?

Yes. The `_sendMessage()` function accepts any ABI-encoded payload. You can send tokens, NFT metadata, strings, structs, or any data your application needs.

## Security

### How are messages validated?

VIA Labs uses a 4-layer security model (VIA, Chain, Project, PoS) to validate every cross-chain message. See the [Technology Overview](/docs/general/technology-overview) for details.

### Has the protocol been audited?

For the latest security information and audit reports, visit the [VIA Labs main site](https://vialabs.tech).
