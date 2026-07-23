---
sidebar_position: 3
---

# Supported Networks

VIA Labs supports cross-chain communication across **140+ mainnets** and **80+ testnets**, including both public and private networks.

The tables below list the VIA Gateway contract address for each network with a live VG-1 deployment. Pass the gateway address for your network to `setMessageGateway()` when configuring your contract.

:::info Chain IDs
VIA uses standard EVM chain IDs — the same value returned by `eth_chainId` on each network. Use these as the `destChainId` in `messageSend()` and in `setMessageEndpoints()`.
:::

## Testnets

| Network | Chain ID | Gateway Address |
|---|---|---|
| Ethereum Sepolia | `11155111` | `0x6cdc2ed3321f4e6bf835b03af691d418bbb350ba` |
| Avalanche Fuji | `43113` | `0x6cdc2ed3321f4e6bf835b03af691d418bbb350ba` |
| Base Sepolia | `84532` | `0x6cdc2ed3321f4e6bf835b03af691d418bbb350ba` |
| Arbitrum Sepolia | `421614` | `0x6cdc2ed3321f4e6bf835b03af691d418bbb350ba` |
| OP Sepolia | `11155420` | `0x6cdc2ed3321f4e6bf835b03af691d418bbb350ba` |
| BSC Testnet | `97` | `0x6cdc2ed3321f4e6bf835b03af691d418bbb350ba` |
| OP BNB Testnet | `5611` | `0x6cdc2ed3321f4e6bf835b03af691d418bbb350ba` |
| Hyper EVM Testnet | `998` | `0x6cdc2ed3321f4e6bf835b03af691d418bbb350ba` |
| Polygon Amoy | `80002` | `0x6cdc2ed3321f4e6bf835b03af691d418bbb350ba` |
| Robinhood Testnet | `46630` | `0x6cdc2ed3321f4e6bf835b03af691d418bbb350ba` |
| Upside Testnet | `61872` | `0x6cdc2ed3321f4e6bf835b03af691d418bbb350ba` |
| PandaSea Testnet | `7770` | `0x4d0e6355875485480c43f2d6e94fbf4bf287921c` |

## Mainnets

| Network | Chain ID | Gateway Address |
|---|---|---|
| Avalanche | `43114` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| PandaSea | `7776` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |

Additional mainnet gateways are being rolled out — this table is updated as each deployment goes live.

Cardano and Midnight integrations are in development and use a different client architecture — see the [Cardano](/docs/examples/cardano-coming-soon) and [Midnight](/docs/examples/midnight-coming-soon) pages.

## Adding a New Network

If you need support for a network not currently listed, visit [vialabs.tech](https://vialabs.tech) and click the **Onboarding Assistance** button in the top right corner to submit a request.
