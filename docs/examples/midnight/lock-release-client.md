---
sidebar_label: Lock & Release Client
title: Lock & Release Client
description: An overview of VIA's lock-and-release reference client for Midnight, written in Compact.
---

# Lock & Release Client

This page describes VIA's lock-and-release reference client for Midnight. The source is not published — you receive the complete package during onboarding. This is the vault client. It does **not** issue the token it transfers. Use it for a token that already exists on Midnight, or one you cannot upgrade — yours or not. Sending locks the token in the contract. Receiving releases it.

:::info What this page is
This is an overview, not a deploy tutorial. Launching your own token on Midnight is a guided process with VIA. Transferring tokens VIA already supports, for example USDM, is permissionless: follow the [Transfer USDM guide](/docs/examples/guides/usdm-cardano-midnight). See [Integration Paths](/docs/examples/midnight/integration-paths) for both routes.
:::

**Two clients, three patterns.** VIA has two reference clients on Midnight: this one and the [Burn & Mint Client](/docs/examples/midnight/mint-burn-client). Lock here plus mint there is Lock & Mint. Lock here plus release there is Lock & Release. Burn here plus mint there is Burn & Mint.

:::warning Unshielded only
Every token movement in this client is unshielded, over a `Bytes<32>` token color. Amounts, recipients, and balances are public on chain — that is inherent to the unshielded token model. Shielded tokens move as coins through Zswap and would be a different contract.
:::

---

## Shape of the Client

The client is one Compact contract, built from VIA's module set. The modules cover message state and replay tracking, the endpoint and relayer allowlists, role-based access control, fee configuration and accounting, and payload encoding.

Two circuits are required to send a cross-chain message — `bridge` outbound and `process` inbound — and the rest is configuration.

---

## The Constructor

```compact
constructor(_chainId: Uint<64>, _tokenColor: Bytes<32>, _destToken: Bytes<32>)
```

| Parameter | Description |
|---|---|
| `_chainId` | **VIA assigns this.** It identifies your deployment inside VIA's ecosystem of chains and seeds its transaction-ID range. Use the ID VIA gives you. |
| `_tokenColor` | The color of the token this contract locks and releases. Sealed after deployment. |
| `_destToken` | This token's asset identifier on the destination chain. Sealed, so a live deployment cannot be repointed at another asset. |

The constructor also initializes access control, deriving the owner and viaSupport identities from secrets the deployer holds.

### The color is supplied, not derived

This is the structural difference from the burn-and-mint side. That client issues its token, so its color is `tokenType(tokenName, kernel.self())` — a pure function of its own address, derived on demand. Here the token is foreign. There is nothing to derive it from, so the deployer supplies the color and it is sealed.

---

## Roles

Three roles guard the contract. None of them is the transaction's caller identity: each role is proven by holding a secret off chain, with only the derived public identity stored on chain.

| Role | Controls |
|---|---|
| `owner` | Endpoints, relayers, ownership transfer, and unpausing |
| `viaSupport` | Fees, fee collection, and pausing |
| `relayers` | `process()` — the inbound path |

Pausing is asymmetric: the owner may pause or unpause, while viaSupport may only pause.

:::warning Do not use ownPublicKey()
`ownPublicKey()` is not a `msg.sender` on Midnight and is unrelated to the identities this contract stores. Roles here are proven by key derivation. Extend that pattern for any role you add.
:::

---

## bridge: The Send Path

```compact
export circuit bridge(_recipient: Bytes<32>, _destChain: Uint<64>, _chainData: Bytes<64>, _confirmations: Uint<16>): Uint<128>
```

`_recipient` is the peer client on the destination chain, which must be a registered endpoint for `_destChain`. The endpoint registry is keyed by chain ID and 32-byte identity, so any VIA-connected chain can be a peer.

The circuit collects the fee, assigns a unique transaction ID, locks the transfer amount in the contract, and stores the outbound message. It returns the transaction ID.

The same receive-into-contract move that means *burn* on the issuing client means *lock* here. Nothing is destroyed: the tokens sit in the contract, and the destination mints or releases against them. Which of the two it is depends on the far side of the route, not on this contract.

**The transfer amount passes through untouched.** The fee is charged separately, in its own token, so nothing is deducted from what the caller sent. The caller must hold the fee token in addition to the tokens being locked.

**There is no `burn()` circuit on this side.** The burn-and-mint client exposes one, because it issues the token and receiving it into the contract genuinely takes it out of circulation. Here, the same call would only deposit tokens into the release pool. Nothing is burned, no cross-chain transfer starts, and the deposit cannot be recovered.

---

## process: The Receive Path

```compact
export circuit process(_txId: Uint<128>, _sourceChainId: Uint<64>, _destChainId: Uint<64>, _sender: Bytes<32>, _recipient: Bytes<32>, _onChainData: Bytes<204>, _offChainData: Bytes<64>): UserAddress
```

Inbound delivery is relayer-only. The circuit validates the message — replay protection, the source endpoint, the intended destination, and the payload's destination token — then marks the transfer processed and releases the tokens to the recipient.

A release is additionally bounded by the contract's own balance in the locked token.

:::warning Fund the pool
Releases come from tokens this contract holds. Keep each deployment funded in the locked color, and monitor its balance — a release cannot complete against a pool that is short.
:::

---

## The VILR Payload

Callers always supply the compact 64-byte form — recipient at `[0-31]`, big-endian amount at `[32-63]`. `bridge()` expands it into the 204-byte VILR payload stored on the message:

| Range | Field |
|---|---|
| `[0-3]` | magic `"VILR"` |
| `[4-7]` | version |
| `[8-39]` | amount, big-endian |
| `[40-71]` | source_token |
| `[72-103]` | reserved |
| `[104-135]` | dest_token |
| `[136-167]` | dest_recip |
| `[168-199]` | max_fee |
| `[200-203]` | hook_data_len |

204 bytes is the payload with no hook data. An integration may append hook bytes past `[203]` and set `hook_data_len` accordingly, which makes the payload longer than the fixed width these circuits take.

:::info The plain 64-byte variant
The client also ships a non-VILR variant that carries the caller's 64-byte payload as supplied, for routes that do not need the VILR envelope. The message module has to match the payload width, so the two are chosen at build time.
:::

---

## Fees

One fee, charged in its own token, configured by viaSupport:

```compact
export circuit setFee(_color: Bytes<32>, _amount: Uint<64>): []
```

Two constraints apply:

- **The fee token must differ from the token being transferred cross-chain**, which keeps fee balances out of the release pool.
- **The amount is capped at 65535**, which the accumulator's width requires.

`_amount` is in units of 1000 base units — `_amount = 1` charges 1000. Charge and payout run through the same accumulator, so collection is bounded by what was actually charged. Setting `_amount` to 0 disables the fee.

---

## Where the Rest Lives

The client builds on VIA's Compact module set. You receive the full package, with the network values for your target network, when you start an integration.

- [Building on Midnight](/docs/examples/midnight/overview) — the client shape and the pinned SDK versions
- [Burn & Mint Client](/docs/examples/midnight/mint-burn-client) — the issuing counterpart on Midnight
- [Lock & Release Client](/docs/examples/cardano/lock-release-client) — the Cardano equivalent
- [Integration Paths](/docs/examples/midnight/integration-paths) — what to prepare
