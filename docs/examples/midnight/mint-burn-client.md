---
sidebar_label: Burn & Mint Client
title: Burn & Mint Client
description: An overview of VIA's burn-and-mint reference client for Midnight, written in Compact.
---

# Burn & Mint Client

This page describes VIA's burn-and-mint reference client for Midnight. The source is not published — you receive the complete package during onboarding. This client **issues** the token it transfers. Sending burns it on Midnight. Receiving mints it. Total supply across chains stays constant.

:::info What this page is
This is an overview, not a deploy tutorial. Launching your own token on Midnight is a guided process with VIA. Transferring tokens VIA already supports, for example USDM, is permissionless: follow the [Transfer USDM guide](/docs/examples/guides/usdm-cardano-midnight). See [Integration Paths](/docs/examples/midnight/integration-paths) for both routes.
:::

**Two clients, three patterns.** VIA has two reference clients on Midnight: this one and the [Lock & Release Client](/docs/examples/midnight/lock-release-client). Pair either with the far side of a route and the familiar patterns appear. Burn here plus mint there is Burn & Mint. Lock there plus mint here is Lock & Mint — the pattern USDM runs today.

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
constructor(_chainId: Uint<64>, _tokenName: Bytes<32>, _destToken: Bytes<32>)
```

| Parameter | Description |
|---|---|
| `_chainId` | **VIA assigns this.** It identifies your deployment inside VIA's ecosystem of chains and seeds its transaction-ID range. Use the ID VIA gives you. |
| `_tokenName` | The token's 32-byte domain separator, right-zero-padded — what `pad(32, "USDM")` produces in Compact. Pad it off chain and pass the bytes. |
| `_destToken` | This token's asset identifier on the destination chain. Sealed, so a live deployment cannot be repointed at another asset. |

The constructor also initializes access control, deriving the owner and viaSupport identities from secrets the deployer holds.

### The token color is derived, never stored

The client is the token's issuer, so its color is a pure function of its own address:

```compact
tokenType(tokenName, kernel.self())
```

This needs neither a ledger field nor a post-deployment transaction. It **cannot** be set in the constructor: a Midnight contract address is a hash of its initial state, so `kernel.self()` there resolves to `dummyContractAddress()` and would store the wrong value. The domain separator is safe to seal, because it is an input to the address rather than derived from it.

Off-chain code can read `tokenName` from ledger state and recompute the color as `rawTokenType(tokenName, contractAddress)`.

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

The circuit collects the fee, assigns a unique transaction ID, burns the transfer amount from the caller, and stores the outbound message. It returns the transaction ID.

**There is no `burnUnshielded` circuit in Compact.** Receiving the tokens into the contract is the burn: they leave the caller and sit in the contract, and the destination mints against them. A standalone `burn(_amount)` circuit exposes the same move for anyone holding the token.

**The transfer amount passes through untouched.** The fee is charged separately, in its own token, so nothing is deducted from what the caller sent and the destination mints exactly that amount. The caller must hold the fee token in addition to the tokens being sent.

---

## process: The Receive Path

```compact
export circuit process(_txId: Uint<128>, _sourceChainId: Uint<64>, _destChainId: Uint<64>, _sender: Bytes<32>, _recipient: Bytes<32>, _onChainData: Bytes<204>, _offChainData: Bytes<64>): UserAddress
```

Inbound delivery is relayer-only. The circuit validates the message — replay protection, the source endpoint, the intended destination, and the payload's destination token — then marks the transfer processed and mints to the recipient.

Minting takes the token's domain separator rather than its color; the color is derived from the contract's own address.

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

- **The fee token must differ from the token being transferred cross-chain**, so fee balances stay separate from token balances.
- **The amount is capped at 65535**, which the accumulator's width requires.

`_amount` is in units of 1000 base units — `_amount = 1` charges 1000. Charge and payout run through the same accumulator, so collection is bounded by what was actually charged. Setting `_amount` to 0 disables the fee.

---

## Where the Rest Lives

The client builds on VIA's Compact module set. You receive the full package, with the network values for your target network, when you start an integration.

- [Building on Midnight](/docs/examples/midnight/overview) — the client shape and the pinned SDK versions
- [Lock & Release Client](/docs/examples/midnight/lock-release-client) — the vault counterpart on Midnight
- [Burn & Mint Client](/docs/examples/cardano/mint-burn-client) — the Cardano equivalent
- [Integration Paths](/docs/examples/midnight/integration-paths) — what to prepare
