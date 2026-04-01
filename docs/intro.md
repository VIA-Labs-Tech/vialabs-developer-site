---
sidebar_position: 1
slug: /
---

# Get Started

VIA Labs provides **cross-chain smart contract messaging** across 140+ networks. Inherit one contract, override one function, send messages between chains.

## Start Building

**[Hello World](/docs/examples/hello-world)** — Send your first cross-chain message in under 30 lines of Solidity. Start here.

More patterns:

- **[Burn & Mint Token](/docs/examples/burn-mint-token)** — Cross-chain ERC20 that burns on source, mints on destination
- **[Lock & Mint Token](/docs/examples/lock-mint-token)** — Lock tokens on source, mint a synthetic on destination
- **[Lock & Release Token](/docs/examples/lock-release-token)** — Lock tokens on one chain, release from a pool on another
- **[Private Oracle](/docs/examples/private-oracle)** — Connect any off-chain data source to smart contracts across chains

## How It Works (30 Seconds)

1. Your contract inherits `ViaIntegrationV1` and calls `messageSend()` to send data to another chain
2. The VIA Gateway + validator network verifies and relays the message
3. Your contract on the destination chain receives it via `messageProcess()`

That's the entire integration. For the full architecture, see [Technology Overview](/docs/general/technology-overview).

## Need Help?

- **[FAQ](/docs/general/faq)** — Common questions
- **[Troubleshooting](/docs/general/troubleshooting)** — Debugging tips
- **[GitHub](https://github.com/VIA-Labs-Tech)** — Code examples and starter repos
