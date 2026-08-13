---
sidebar_label: Overview & Concepts
title: Building on Cardano
description: How VIA cross-chain messaging works on Cardano — UTxOs, validators, the VILR message format, and what you build vs what VIA supplies.
---

# Building on Cardano

VIA messaging on Cardano is the same protocol you know from the [Technology Overview](/docs/general/technology-overview) — validators sign, relayers deliver, the destination verifies. What changes is the execution model. This page explains the Cardano-specific concepts before you write any code.

:::info Mainnet and testnet
VIA is live on Cardano mainnet. The examples and addresses in these pages use **Cardano Preprod** (VIA chain ID `2273266`), with routes to Midnight and EVM testnets. Gateway addresses are on [Supported Networks](/docs/general/supported-networks).
:::

---

## How Cardano Differs from EVM

Cardano uses the eUTxO model. There are no contracts with storage and no events. Instead, validators approve how UTxOs are spent, and minting policies approve how tokens are created or burned.

This changes how a VIA integration looks. One term first: on these pages, **your client** means your integration — the validator and minting policy you deploy.

| EVM | Cardano |
|-----|---------|
| Your contract inherits `ViaIntegrationV1` | Your client is a validator plus a minting policy |
| You call `messageSend()` | You produce a **send_request UTxO** |
| The gateway emits an event | The UTxO itself is the message |
| State lives in contract storage | Config lives in a state UTxO |

The key idea: **a message is a UTxO**. VIA's network watches for these UTxOs the same way it watches for gateway events on EVM chains.

---

## The Two-Stage Send

Sending a message takes two stages.

**Stage 1 — you create the request.** Your transaction produces a send_request UTxO. It carries two things: an inline datum of type `SendRequested`, and exactly one auth token whose asset name is `send_request`.

```mermaid
flowchart LR
    TX[Your transaction] --> UTXO
    subgraph UTXO[The send_request UTxO]
        direction TB
        DATUM["SendRequested datum<br/>(the message)"]
        TOKEN["1 auth token<br/>(asset name: send_request)"]
    end
    UTXO --> VIA["VIA picks up the message<br/>and burns the auth token"]
```

The datum inside the UTxO is the message itself:

```
SendRequested {
  sender: ScriptHash,      // your client validator
  recipient: ByteArray,    // the receiving contract on the destination chain
  dest_chain: Int,         // VIA chain ID of the destination
  chain_data: ByteArray,   // the VILR-encoded payload (next section)
  confirmations: Int,      // block confirmations to wait before relay
}
```

All five fields are mandatory. A send_request UTxO without a valid `SendRequested` datum is not a valid message.

**Stage 2 — VIA picks it up.** The validator network sees the UTxO, waits for the requested confirmations, and validates the message. When the message is processed, the auth token is burned. The burn is what guarantees each request is handled exactly once.

---

## The chain_data Format (VILR)

The `chain_data` field carries the token-transfer payload. It uses a fixed byte layout that starts with the ASCII magic `VILR`. Fields are packed in order with no padding.

| Offset | Width (bytes) | Field | Description |
|--------|---------------|-------|-------------|
| 0 | 4 | `magic` | `0x56494C52` — ASCII "VILR" |
| 4 | 4 | `version` | Always `1` |
| 8 | 32 | `amount` | Token amount to transfer (uint256) |
| 40 | 32 | `source_token` | Token identity on the source chain (next section) |
| 72 | 4 | `source_depositor_prefix` | Reserved — must be `0` |
| 76 | 28 | `source_depositor` | Payment key hash of the depositor |
| 104 | 32 | `destination_token` | Token identity on the destination chain |
| 136 | 32 | `destination_recipient` | Recipient on the destination chain |
| 168 | 32 | `max_fee` | Fee cap for the transfer; `0` means no cap |
| 200 | 4 | `hook_data_len` | Length of `hook_data` in bytes |
| 204 | variable | `hook_data` | Optional payload for the recipient |

:::info hook_data on a Cardano destination
When Cardano is the destination chain, `hook_data` is enforced against the recipient output. Empty `hook_data` means the recipient output must carry `NoDatum`. Non-empty `hook_data` must equal the CBOR of the recipient output's inline datum.
:::

---

## Token Identity

Cardano tokens are identified by a policy ID and an asset name. Cross-chain, VIA needs one fixed-width identity. So a Cardano token's cross-chain identity is:

```
keccak256(policyId ++ assetName)
```

This 32-byte hash is what the EVM side sees as the Cardano token. It is also what you put in the `source_token` and `destination_token` fields.

`source_token`, `destination_token`, and `destination_recipient` are each **exactly 32 bytes**. No shorter, no longer. Addresses and identities smaller than 32 bytes are padded to fit.

---

## Routes: Which Senders You Accept

Your client does not accept messages from just anywhere. It holds an allowlist:

```
supported_routes: List<{source_chain: Int, sender: ByteArray}>
```

Each entry names a source chain and a specific sender on that chain. A message only passes if its origin matches an entry. This is the Cardano equivalent of `setMessageEndpoints()` on EVM — you decide which remote contracts you trust.

The list lives in an admin-updatable **state UTxO**, marked by a singleton NFT and read as a reference input. Because it is data, not code, you can add or remove routes without recompiling your validator.

---

## The Project Registry

Every VIA integration on Cardano registers a node in an on-chain project registry, and your client registers itself in the same transaction. Registration happens together with VIA during onboarding — the details are on the [Integration Paths](/docs/examples/cardano/integration-paths) page.

---

## What VIA Supplies, What You Build

**VIA supplies:**

- The protocol validators, already deployed on Cardano Preprod
- The network policy IDs your client takes as compile-time parameters (so a Preprod build and a mainnet build are different builds)
- The off-chain driver that watches send_request UTxOs and delivers messages

**You build:**

- Your client validator and minting policy
- Your state UTxO configuration — routes, admin keys

Launching your own cross-chain token on Cardano or Midnight is a guided process. You build the client, and VIA reviews it, wires it into the network, and deploys with you. Bridging **USDM** through the already-deployed contracts needs no onboarding at all — that path is permissionless.

Expect protocol fees of a few ADA per message on each chain, plus normal network fees.

---

## Next Steps

- [Integration Paths](/docs/examples/cardano/integration-paths) — out-of-box vs custom, and how onboarding works
- [Burn & Mint Client](/docs/examples/cardano/mint-burn-client) — the reference client validator, piece by piece
- [USDM: Cardano ↔ Midnight](/docs/examples/guides/usdm-cardano-midnight) — bridge USDM today, no onboarding required
