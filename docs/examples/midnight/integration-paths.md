---
sidebar_label: Integration Paths
title: Midnight Integration Paths
description: How a team gets a token live on Midnight with VIA — the two token patterns and what to prepare.
---

# Integration Paths

This page covers launching your own cross-chain native token on Midnight. Transferring tokens VIA already supports, for example USDM, is permissionless — follow the [Transfer USDM guide](/docs/examples/guides/usdm-cardano-midnight).

Like [Cardano](/docs/examples/cardano/integration-paths), Midnight integrations are built together with VIA. The setup is simpler. Your integration is one Compact contract, deployed from compiled artifacts. Its configuration lives inside it — endpoints, relayers, and fees are a few admin circuit calls. There is no separate registry step.

There are two token patterns:

1. **[Burn & Mint Client](/docs/examples/midnight/mint-burn-client)** — for a token your contract issues on Midnight. Sending burns it on Midnight. The destination chain mints it. This is also the client for Lock & Mint, where the token locks on another chain and your contract mints it on Midnight — the pattern USDM runs today.
2. **[Lock & Release Client](/docs/examples/midnight/lock-release-client)** — for a token that already exists on Midnight and that your contract does not issue. Sending locks it in the contract. Receiving releases it from the locked pool.

VIA supplies your VIA chain ID, the relayer key your contract allowlists, and the endpoint configuration on the far side.

---

## What to Prepare

1. **The token.** A Midnight-native token (burn & mint), or one that lives on another chain (lock & mint).
2. **The chains.** List every route you want, in both directions.
3. **The admin key.** The owner role controls endpoints, relayers, fees, and pause. Decide who holds it.
4. **Testnet first.** Plan a full test on Midnight Preview before mainnet.

:::warning Keys stay with you
Never share a private key or mnemonic with anyone — including VIA. VIA never asks for your keys.
:::

---

## Next Steps

- [Building on Midnight](/docs/examples/midnight/overview) — the client shape and version pins
- [Transfer USDM guide](/docs/examples/guides/usdm-cardano-midnight) — the live pattern, end to end
- Ready to talk? [Work With Us — For Developers](/docs/work-with-us/developers)
