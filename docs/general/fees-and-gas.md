---
sidebar_position: 4
---

# Fees & Gas

Understanding the cost structure for cross-chain messaging with VIA Labs.

## How Fees Work

Cross-chain messages incur two types of costs:

1. **Source chain gas** — The gas cost of calling `_sendMessage()` on the originating chain
2. **Relay fee** — A small fee paid to validators for relaying and executing the message on the destination chain

## Fee Estimation

Fees vary based on:
- Source and destination chain gas prices
- Payload size
- Network congestion

:::note
Detailed fee estimation APIs and tools are coming soon. Check back for updates.
:::

## Testnet Usage

Testnet transactions use testnet tokens and are free. See [Testnet Tokens](/docs/general/testnet-tokens) for faucet links.
