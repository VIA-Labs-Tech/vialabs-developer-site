---
sidebar_label: Integration Paths
title: Cardano Integration Paths
description: How a team gets a token live on Cardano with VIA — the two integration paths and what to prepare.
---

# Integration Paths

This page covers launching your own token on Cardano. Bridging USDM is different: those contracts are already deployed, and using them is permissionless.

There are two possible integration paths:

1. **Use a reference client as shipped** — mint & burn or lock & release, exactly as they are.
2. **Custom logic** — your own `chain_data` shape or validator logic.

Both paths are built together with VIA. The on-chain half is open to inspect, and the reference clients are [audited](/docs/general/audits).

Integrations are not limited to tokens. The same message layer carries news, sports results, numbers, text — any data.

:::info Why guided?
A working integration is more than compiled validators. Your integration must register in the on-chain project registry, and VIA's message layer must support your messages. You handle the on-chain side; VIA wires up the message layer with you.
:::

---

## Path 1 — Reference Clients as Shipped

The fastest path. Pick one of the two audited reference clients and use it exactly as it is:

- **[Burn & mint](/docs/examples/cardano/mint-burn-client)** — for tokens you control. Supply burns on one side and mints on the other.
- **[Lock & release](/docs/examples/cardano/lock-release-client)** — for pre-existing or non-upgradable tokens, yours or not. Tokens lock in a vault on Cardano and release when they return.

These are the two audited Cardano contracts. Paired with the far side of a route, they form the three patterns from the EVM docs: burn here and mint there is **Burn & Mint**; lock here and mint there is **Lock & Mint**; lock here and release there is **Lock & Release**.

You choose:

- the token name
- the routes — which chains it moves between, in both directions
- the admin key that controls the integration

You compile, deploy, and register the integration yourself. Registration is authorized by your own credentials — the deployer's seed UTxO for burn & mint, or the admin key for lock & release. The admin key is a compile-time parameter: set it carefully. The reference client cannot change it later; a custom design can add its own key-rotation logic.

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

---

## What to Prepare

Bring answers to these before you reach out. They shape the whole integration.

1. **The token.** Which token, and on which chain does it live today?
2. **The chains.** Where should it go? List every route you want, in both directions.
3. **The pattern.** Burn & mint if you control the token and its supply. Lock & release if the token is pre-existing or not upgradable — yours or not.
4. **The admin key.** Decide who holds it and how you protect it. It controls your routes.
5. **Testnet first.** Plan a full test on Cardano Preprod. Testnet and mainnet builds are separate — a Preprod deployment never touches mainnet.

:::warning Keys stay with you
Never share a private key or mnemonic with anyone — including VIA. VIA never asks for your keys.
:::

---

## Next Steps

- Study the reference client: [Burn & Mint Client](/docs/examples/cardano/mint-burn-client)
- Ready to talk? [Work With Us — For Developers](/docs/work-with-us/developers)
