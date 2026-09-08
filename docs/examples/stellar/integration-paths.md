---
sidebar_label: Integration Paths
title: Stellar Integration Paths
description: How a team gets a token or a message flow live on Stellar with VIA — the two integration paths and what to prepare.
---

# Integration Paths

This page covers launching your own integration on Stellar. Transferring VIAT is different: those contracts are already deployed, and using them is permissionless.

There are two possible integration paths:

1. **Use the reference client as shipped** — the burn & mint token client, exactly as it is.
2. **Custom logic** — your own Soroban contract built on the `message-client` crate, with your own payload shape.

Both paths are built together with VIA. The on-chain half is open to inspect, and the reference client and the gateway are [audited](/docs/general/audits).

Integrations are not limited to tokens. The same message layer carries prices, results, numbers, text — any data.

:::info Why guided?
A working integration is more than a deployed contract. Your client needs the gateway address and VIA chain ID for each of its networks, a matching endpoint on the far side of every route, and VIA's message layer must support your messages. You handle the on-chain side; VIA wires up the message layer with you.
:::

---

## Path 1 — Reference Client as Shipped

The fastest path. Use the audited reference client exactly as it is:

- **[Burn & mint](/docs/examples/stellar/mint-burn-client)** — for tokens you control. Supply burns on one side and mints on the other. The client is a Soroban fungible token with cross-chain send and receive built in.

Paired with the far side of a route, it forms two of the three patterns from the EVM docs: burn here and mint there is **Burn & Mint**; lock on the other chain and mint here is **Lock & Mint**.

You choose:

- the token name, symbol, and initial supply
- the routes — which chains it moves between, in both directions
- the owner key that controls the integration

You compile, deploy, and configure the client yourself. The constructor sets the owner in the same transaction that deploys the contract, so there is no moment when someone else can claim it. The owner can transfer ownership later and can change routes at any time without redeploying.

Route configuration lives in contract storage, not in the compiled code. The same `.wasm` file works on testnet and mainnet; only the constructor arguments, the gateway address, and the endpoints differ.

---

## Path 2 — Custom Logic

Some integrations need more than the reference client provides. Common cases:

- a custom payload shape — the data your messages carry
- a vault for a token that already exists on Stellar, such as a Stellar Asset Contract, where sending locks the token and receiving releases it
- messages that are not token transfers — a price feed, a vote, a state update

The `message-client` crate handles the messaging half of any of these. You implement one function, `message_process()`, and call `message_send()` from your own logic.

VIA's message layer delivers a custom payload without changes, with one exception: a sender on Ethereum that puts Stellar addresses inside the payload needs the same address handling the reference token gets. We design that together. Scope varies:

- A small change becomes a reviewed addition.
- A large change becomes a dedicated project with VIA.

Either way, start the conversation early. Custom scope is easier to shape before you write code.

---

## Plan Both Directions

Every integration has a sender side and a receiver side. A token that leaves Stellar must also come back. Plan both directions:

- **Stellar → destination** — what happens on Stellar, and what happens on arrival
- **Destination → Stellar** — the reverse, including how the recipient is addressed (a 32-byte account or contract ID)

---

## What to Prepare

Bring answers to these before you reach out. They shape the whole integration.

1. **The token.** Which token, and on which chain does it live today?
2. **The chains.** Where should it go? List every route you want, in both directions.
3. **The pattern.** Burn & mint if you control the token and its supply. A custom vault if the token is pre-existing or not upgradable — yours or not.
4. **The owner key.** Decide who holds it and how you protect it. It controls your gateway setting and your routes.
5. **Testnet first.** Plan a full test on Stellar testnet with Ethereum Sepolia. Testnet and mainnet are separate deployments.

:::warning Keys stay with you
Never share a secret seed or private key with anyone — including VIA. VIA never asks for your keys.
:::

---

## Next Steps

- Study the reference client: [Burn & Mint Client](/docs/examples/stellar/mint-burn-client)
- Ready to talk? [Work With Us — For Developers](/docs/work-with-us/developers)
