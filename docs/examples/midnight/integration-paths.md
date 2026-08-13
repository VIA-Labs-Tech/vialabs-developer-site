---
sidebar_label: Integration Paths
title: Midnight Integration Paths
description: How a team gets a token live on Midnight with VIA — the two reference patterns and what to prepare.
---

# Integration Paths

This page covers launching your own token on Midnight. Bridging tokens that are already deployed, for example USDM, is permissionless — follow the [USDM bridge guide](/docs/examples/guides/usdm-cardano-midnight).

Like [Cardano](/docs/examples/cardano/integration-paths), Midnight integrations are built together with VIA. The setup is simpler. Your integration is one Compact contract, and its configuration lives inside it — endpoints, relayers, and fees are a few admin circuit calls. There is no separate registry step.

---

## The Two Reference Patterns

1. **Lock & release** — for tokens that already exist on Midnight. The client takes the tokens into its own balance when sending, and pays out from that balance when receiving. This is the reference pattern for Midnight ↔ EVM routes today.

2. **Burn & mint** — for tokens your client controls. Sending burns the token on Midnight. Receiving mints it fresh to the recipient. Total supply across chains stays constant. USDM runs this pattern on the Cardano route today.

Either pattern can pair with any VIA-connected chain — the [endpoint registry](/docs/examples/midnight/overview#endpoints-any-chain-can-be-a-peer) is keyed by chain ID. The message payload differs by route: EVM routes use a compact 64-byte layout, and Cardano routes use the VILR format described in [Building on Cardano](/docs/examples/cardano/overview).

Both patterns share the same frame:

- **Endpoints** — which contracts on which chains you accept
- **Relayers** — the allowlist of callers who may deliver inbound messages
- **Fees** — an optional per-bridge fee, taken from the bridged amount
- **Controls** — pause, plus two admin roles (owner, and VIA support)

---

## What to Prepare

1. **The token.** An existing Midnight token (lock & release), or one your client mints (burn & mint).
2. **The chains.** List every route you want, in both directions.
3. **The admin key.** The owner role controls endpoints, relayers, and pause. Decide who holds it.
4. **Testnet first.** Plan a full test on Midnight Preview before mainnet.

:::warning Keys stay with you
Never share a private key or mnemonic with anyone — including VIA. VIA never asks for your keys.
:::

---

## Next Steps

- [Building on Midnight](/docs/examples/midnight/overview) — the client shape and version pins
- [USDM Bridge Guide](/docs/examples/guides/usdm-cardano-midnight) — the live pattern, end to end
- Ready to talk? [Work With Us — For Developers](/docs/work-with-us/developers)
