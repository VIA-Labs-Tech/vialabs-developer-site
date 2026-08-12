---
sidebar_label: Overview & USDM Bridge
title: Building on Midnight
description: Bridge USDM between Cardano Preprod and Midnight Preview, and see how a Midnight client contract is shaped in Compact.
---

# Building on Midnight

VIA connects Midnight to Cardano. The connection is live on testnet: Midnight Preview bridges to Cardano Preprod today. USDM is the working integration — you can move it in both directions right now.

:::info Testnet only
Everything on this page is testnet: Cardano Preprod and Midnight Preview. No mainnet addresses or values appear here.
:::

---

## The Working Example: USDM Bridge

The [`@via-labs-tech/usdm-bridge`](https://www.npmjs.com/package/@via-labs-tech/usdm-bridge) npm package bridges USDM in both directions. It is public and MIT-licensed. It runs headless in Node.js — use it as a library or run the bundled CLI.

```ts
import { bridgeUSDM } from '@via-labs-tech/usdm-bridge'

const { txHash } = await bridgeUSDM({
    direction: 'cardano-to-midnight', // or 'midnight-to-cardano'
    amount: '5',
    recipient: 'mn_addr_preview1...', // or addr_test1... for midnight-to-cardano
})
```

Bridging through the already-deployed contracts is permissionless. Anyone can move testnet USDM today. The full walkthrough — wallets, environment, CLI commands — is in the [USDM bridge guide](/docs/examples/guides/usdm-cardano-midnight).

### Deployed Testnet Contracts

| Network | VIA chain ID | Contract |
|---------|-------------|----------|
| Midnight Preview | `64364450` | USDM gateway: `471dfe55c866fdbc085c9011a51f0cd0e9c9bfca6bb985c35f7716b6e73e485c` |
| Cardano Preprod | `2273266` | Gateway: `addr_test1wp4erajtev047rws58fdj6gz6hpvh53wlk7ccc65sld5xusx4z54g`<br/>Lock-release policy ID: `76fbe9f6c8761cc6744c34a1f30915037e38c01197d6e7c9d2fcc1d3` |

The chain IDs are VIA protocol IDs — the routing keys for cross-chain messages. USDM uses 6 decimals on every chain. The package exports all of these as `CONTRACTS` and `USDM_DECIMALS`, so you rarely need to copy them by hand.

---

## How a Midnight Client Is Shaped

Midnight contracts are written in Compact. A VIA client on Midnight is one Compact contract. The USDM client (`ClientContractCardano.compact`) is the reference shape.

The constructor takes the chain ID and seeds a unique transaction-ID base from it. Two core circuits do the bridging:

- **`bridge`** — starts a transfer toward Cardano. It checks that the system is enabled and the destination endpoint is authorized. It collects the configured fee, burns the USDM amount from the caller, assigns a unique tx ID, and stores the outbound message. It returns the tx ID.
- **`process`** — completes an inbound transfer from Cardano. Only an allowlisted relayer can call it. It checks replay protection, the source endpoint, and that this contract and chain are the intended destination. Then it marks the message processed and mints USDM to the recipient.

Admin circuits configure the contract:

- **`setEndpoint`** — enable or disable a peer contract on another chain
- **`setRelayer`** — enable or disable a relayer's permission to call `process`
- **`setFee`** — set the fee token type and amount
- **`collectFees`** — send accumulated fees to a recipient
- **`setSystemEnabled`** — pause or resume the whole contract
- **`transferOwnership`** / **`setViaSupport`** — rotate the two admin roles (owner and VIA support)

Every circuit call needs a zero-knowledge proof. Your machine generates it locally through a proof server (default `http://localhost:6300`). Proving never leaves your environment.

:::info Source access
The Compact client source is proprietary to VIA Labs LLC (© 2026, all rights reserved). You receive it when we build your integration together. The USDM bridge package above is separate — it is public and MIT.
:::

---

## Version Compatibility

The USDM client compiles under Compact `language_version >= 0.21.0`. These `@midnight-ntwrk` package versions are the tested set:

| Package | Version |
|---------|---------|
| `@midnight-ntwrk/compact-runtime` | 0.15.0 |
| `@midnight-ntwrk/ledger-v8` | 8.0.3 |
| `@midnight-ntwrk/midnight-js-contracts` | 4.0.4 |
| `@midnight-ntwrk/midnight-js-http-client-proof-provider` | 4.0.4 |
| `@midnight-ntwrk/midnight-js-indexer-public-data-provider` | 4.0.4 |
| `@midnight-ntwrk/midnight-js-level-private-state-provider` | 4.0.4 |
| `@midnight-ntwrk/midnight-js-network-id` | 4.0.4 |
| `@midnight-ntwrk/midnight-js-node-zk-config-provider` | 4.0.4 |
| `@midnight-ntwrk/midnight-js-types` | 4.0.4 |
| `@midnight-ntwrk/midnight-js-utils` | 4.0.4 |
| `@midnight-ntwrk/onchain-runtime-v2` | 2.0.1 |
| `@midnight-ntwrk/wallet-sdk-abstractions` | 2.0.0 |
| `@midnight-ntwrk/wallet-sdk-address-format` | 3.1.0 |
| `@midnight-ntwrk/wallet-sdk-dust-wallet` | 3.0.0 |
| `@midnight-ntwrk/wallet-sdk-facade` | 3.0.0 |
| `@midnight-ntwrk/wallet-sdk-hd` | 3.0.1 |
| `@midnight-ntwrk/wallet-sdk-shielded` | 2.1.0 |
| `@midnight-ntwrk/wallet-sdk-unshielded-wallet` | 2.1.0 |

:::info Pinned versions
The pins matter. The Midnight SDK packages version independently, and this combination is the one the working USDM client ships with. Start from these exact versions.
:::

---

## Integration Reality

Two things to know before you plan a Midnight integration.

**Launching your own integration is a guided process.** You build it together with VIA — the same model as [Cardano](/docs/examples/cardano/overview). Bridging USDM through the deployed contracts needs no permission; deploying a new client does.

**Relayers on Midnight run from an allowlist.** The contract checks the caller against relayers the owner has enabled — there is no on-chain signature verification on Midnight yet.

---

## Next Steps

- [USDM Bridge Guide](/docs/examples/guides/usdm-cardano-midnight) — bridge testnet USDM end to end
- [Building on Cardano](/docs/examples/cardano/overview) — the other half of the route
- [Audits](/docs/general/audits) — what has been audited and by whom
