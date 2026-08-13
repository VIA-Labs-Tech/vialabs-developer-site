---
sidebar_label: Overview
title: Building on Midnight
description: How VIA cross-chain messaging works on Midnight — the Compact client shape, endpoints to any chain, and the tested version set.
---

# Building on Midnight

VIA connects Midnight to its cross-chain network, and it is live on Midnight mainnet. Midnight is not a single-route chain — a client authorizes peers per chain, and any VIA-connected chain can be one. The examples and addresses on this page use Midnight Preview and Cardano Preprod.

The live reference integration is USDM, deployed and bridging both directions between Midnight and Cardano — see the [USDM bridge guide](/docs/examples/guides/usdm-cardano-midnight). This page covers how a Midnight client works.

---

## How a Midnight Client Is Shaped

Midnight contracts are written in Compact. A VIA client on Midnight is one Compact contract. The deployed USDM client is the reference shape.

The constructor takes the chain ID and seeds a unique transaction-ID base from it. Two core circuits do the bridging:

- **`bridge`** — starts an outbound transfer. It checks that the system is enabled and the destination endpoint is authorized. It collects the configured fee, burns the token amount from the caller, assigns a unique tx ID, and stores the outbound message. It returns the tx ID.
- **`process`** — completes an inbound transfer. Only an allowlisted relayer can call it. It checks replay protection, the source endpoint, and that this contract and chain are the intended destination. Then it marks the message processed and mints to the recipient.

Admin circuits configure the contract — endpoints, relayers, fees, and pause.

Every circuit call needs a zero-knowledge proof. A proof server generates it — local by default (`http://localhost:6300`), or remote.

:::info Source access
The Compact client source is proprietary to VIA Labs LLC (© 2026, all rights reserved). You receive it when we build your integration together. The [USDM bridge package](https://www.npmjs.com/package/@via-labs-tech/usdm-bridge) is separate — it is public and MIT.
:::

---

## Endpoints: Any Chain Can Be a Peer

The client's endpoint registry is keyed by chain ID. It is not specific to any one chain:

```compact
export ledger endpoints: Map<Uint<64>, Map<Bytes<32>, Boolean>>;

export circuit setEndpoint(_chainId: Uint<64>, _address: Bytes<32>, _enabled: Boolean): []
```

A message passes only if its source pair — chain ID plus 32-byte contract identity — is enabled in this map. The owner configures it, one call per peer.

**Example — an EVM peer.** VIA chain IDs on EVM chains equal the EVM chain IDs. To accept messages from a contract on Sepolia, the owner enables it:

```
setEndpoint(11155111, <contract address, left-padded to 32 bytes>, true)
```

The EVM side is a standard VIA integration — the same contracts as [Hello World](/docs/examples/hello-world) and [Burn & Mint Token](/docs/examples/burn-mint-token). On EVM, non-EVM identities travel as `bytes32`, so the Midnight client appears there as its 32-byte contract address.

**Example — the Cardano peer.** The same call with VIA's Cardano Preprod chain ID (`2273266`) authorizes a Cardano contract. The deployed USDM client runs exactly this route today — see the [USDM bridge guide](/docs/examples/guides/usdm-cardano-midnight).

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
- [Building on Cardano](/docs/examples/cardano/overview) — the other half of the Cardano route
- [Audits](/docs/general/audits) — what has been audited and by whom
