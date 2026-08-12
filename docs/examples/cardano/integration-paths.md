---
sidebar_label: Integration Paths
title: Cardano Integration Paths
description: How a team gets a token live on Cardano with VIA — the two integration paths and what to prepare.
---

# Integration Paths

Get your token live on Cardano with VIA. Two paths, one guided process.

Cardano integrations are built together with VIA. The on-chain half is open to inspect, and the reference clients are [audited](/docs/general/audits). Onboarding runs as a guided process — VIA compiles, deploys, and registers the integration with you.

This page covers launching your own token. Bridging USDM is different: those contracts are already deployed, and anyone can use them without permission.

:::info Why guided?
A working integration is more than compiled validators. It must register in the on-chain project registry, and VIA's off-chain driver must support it. We handle both parts with you, so your first bridge transaction works.
:::

---

## Path 1 — Reference Clients as Shipped

The fastest path. Pick one of the two audited reference clients and use it exactly as it is:

- **Mint & burn** — for tokens you control. Supply burns on one side and mints on the other.
- **Lock & release** — for tokens you do not control. Tokens lock on one side and release on the other.

You choose:

- the token name
- the routes — which chains it moves between, in both directions
- the admin key that controls the integration

VIA compiles the validators, deploys them, and registers the integration in the on-chain project registry. You are part of every step.

Routes are not fixed at compile time. The route allowlist lives in state your admin key controls. You can add or remove routes later without recompiling.

---

## Path 2 — Custom Logic

Some tokens need more than the reference clients provide. Two common cases:

- a custom `chain_data` shape — the payload your messages carry
- custom validator logic on the Cardano side

Custom logic needs a matching executor added to VIA's off-chain driver. We design that executor together. Scope varies:

- A small change becomes a reviewed addition to the driver.
- A large change becomes a dedicated project with VIA.

Either way, start the conversation early. Custom scope is easier to shape before you write code.

---

## Plan Both Directions

Every integration has a sender side and a receiver side. A token that leaves Cardano must also come back. Plan both directions:

- **Cardano → destination** — what happens on Cardano, and what happens on arrival
- **Destination → Cardano** — the reverse

Each side lists the chains and senders it accepts. Configure both, or tokens move in only one direction.

---

## What to Prepare

Bring answers to these before you reach out. They shape the whole integration.

1. **The token.** Which token, and on which chain does it live today?
2. **The chains.** Where should it go? List every route you want, in both directions.
3. **The pattern.** Mint & burn if you control the token. Lock & release if you do not.
4. **The admin key.** Decide who holds it and how you protect it. It controls your routes.
5. **Testnet first.** Plan a full test on Cardano Preprod, and on Midnight Preview for Midnight routes. Testnet and mainnet builds are separate — a Preprod deployment never touches mainnet.

:::warning Keys stay with you
Never share a private key or mnemonic with anyone — including VIA. VIA never asks for your keys.
:::

---

## Next Steps

- Study the reference client: [Mint & Burn Client](/docs/examples/cardano/mint-burn-client)
- Ready to talk? [Work With Us — For Developers](/docs/work-with-us/developers)
