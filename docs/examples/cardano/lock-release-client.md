---
sidebar_label: Lock & Release Client
title: Lock & Release Client
description: A guided read-through of VIA's audited lock-and-release reference client for Cardano, written in Aiken.
---

# Lock & Release Client

This page shows the source of VIA's lock-and-release reference client for Cardano, piece by piece. The full source is not published — the excerpts here come from it, and you receive the complete package during onboarding. This is the vault client. Use it for a token that already exists on Cardano, or one you cannot upgrade — yours or not. Sending locks the token in the vault. Receiving releases it from the vault. The deployed USDM bridge runs this client on Cardano.

:::info What this page is
This is a read-through, not a deploy tutorial. The code comes from VIA's audited reference sources and targets testnet: Cardano Preprod, with routes to Midnight Preview or EVM testnets. Bridging your own token from Cardano is a guided process with VIA. Bridging tokens VIA already supports, for example USDM, is permissionless: follow the [USDM bridge guide](/docs/examples/guides/usdm-cardano-midnight). See [Integration Paths](/docs/examples/cardano/integration-paths) for both routes.
:::

**Two clients, three patterns.** VIA has two audited reference clients on Cardano: this one and the [Burn & Mint Client](/docs/examples/cardano/mint-burn-client). Pair either one with the far side of a route and the familiar patterns appear. Burn here plus mint there is Burn & Mint. Lock here plus mint there is Lock & Mint. Lock here plus release there is Lock & Release.

---

## Inside the Reference Client

The reference integration uses two Aiken validators that work as a pair. Your own design can use one validator or many — the pairing is a choice, not a rule.

**The state script** has the same shape as the Burn & Mint Client's. Its mint branch bootstraps a singleton state NFT. The NFT holds a datum whose key field is `supported_routes` — the allowlist of remote contracts that may release from your vault.

```aiken
validator lock_release_state_script(
  seed_input: OutputReference,
  admin: VerificationKeyHash,
) {
  mint(_redeemer: Data, policy_id: PolicyId, transaction: Transaction) {
    lock_release_state.validate_mint_init_state(
      transaction,
      policy_id,
      seed_input,
    )
  }
```

Only the admin can update the routes — and `admin` is a compile-time parameter, so it cannot be swapped later. Because the routes live in a datum, you can add or remove routes without recompiling or redeploying anything.

**The client** owns the vault. Unlike the Burn & Mint Client, which is a minting policy, this one is a spending validator: the locked tokens sit in UTxOs at its address. Its mint branch runs once, at init. Its spend branch guards every vault action through five redeemer paths:

```aiken
pub type LockReleaseSpendRedeemer {
  LockForVia {
    dest_chain: Int,
    dest_client: ByteArray,
    confirmations: Int,
    deposit_info: DepositInfo,
  }
  ReleaseFromVia { route_idx: Int }
  RebalanceLiquidity
  AddLiquidity { amount: Int }
  RemoveLiquidity { amount: Int }
}
```

`deposit_info` is the same structure the Burn & Mint Client uses. It describes one transfer: `amount`, `source_token`, `source_depositor`, `destination_token`, `destination_recipient`, `max_fee`, `hook_data`, and a version.

**The vault is not one UTxO.** Liquidity splits across *lanes* — separate UTxOs, each marked by a lane NFT. Parallel lanes let several transfers run at once without contending for a single UTxO. You choose the lane count at compile time, up to `max_lane_count` of 16.

Init consumes a seed UTxO, so it runs exactly once. It mints one NFT per lane, creates the state UTxO, and requires the admin signature. The init redeemer follows VIA's project-registry authority shape: the admin key authorizes this client's registration in the registry. Registration is required for every integration; the timing is a design choice.

---

## LockForVia: The Send Path

To send tokens off Cardano, the depositor deposits them into a lane and posts a send request. The transaction spends one lane UTxO and returns it with more tokens inside. The validator first checks the shape of the whole transaction:

```aiken
list.length(own_inputs) == 1,
list.length(own_outputs) == 1,
no_policy_activity(transaction.mint, policy_id),
no_policy_activity(transaction.mint, via_processed_txs_policy_id),
confirmations >= 0,
bytearray.length(dest_client) > 0,
list.has(transaction.extra_signatories, deposit_info.source_depositor),
exact_send_request_mint(transaction.mint, send_request_policy_id),
deposit_info.version == deposit_intent_version,
deposit_info.amount > 0,
deposit_info.max_fee >= 0,
bytearray.length(deposit_info.destination_token) == 32,
bytearray.length(deposit_info.destination_recipient) == 32,
deposit_info.source_token == token_hash(locked_asset_policy_id, locked_asset_name),
```

Then the core rules:

- **The lane grows by exactly the amount.** `new_locked == old_locked + deposit_info.amount`. The lane keeps its NFT and carries no assets other than the locked token.
- **The depositor signs.** Nobody can lock tokens in your name.
- **The token identity must match.** `source_token` must equal the token's 32-byte identity: `keccak_256(policy_id ++ token_name)`.
- **Exactly one `send_request` auth token is minted.** The send-request output carries a `SendRequested` inline datum. Its `sender` is your client's script hash, its `recipient` is `dest_client`, and its `chain_data` is the byte encoding of `deposit_info`. Every field must match the lock.

If all rules pass, the message is queued. VIA's message layer picks up the UTxO and carries the transfer to the destination.

---

## ReleaseFromVia: The Receive Path

When VIA delivers a message back to Cardano, the transaction pays the recipient straight from a lane. The validator re-checks everything:

- **The route must be allowed.** The transaction references the state UTxO. `route_idx` selects one entry from `supported_routes`.
- **VIA must witness the delivery in the same transaction.** The validator finds the mint under VIA's processed-transactions policy and reads its `Insert` redeemer. Its source chain and sender must match the selected route. Its recipient must be this client.
- **Pay the recipient exactly.** `destination_recipient` decodes to a Cardano credential — a key or a script. Exactly one output pays that credential exactly `amount` of the vaulted token. The recipient may not be the vault script itself.
- **The lane shrinks by exactly the amount.** A release pays out real tokens, so the lane must already hold them:

```aiken
} else if old_locked < deposit_info.amount {
  trace @"LR.Release: insufficient lane liquidity"
  False
} else if new_locked != old_locked - deposit_info.amount {
  trace @"LR.Release: locked amount transition mismatch"
  False
```

In a balanced route, returning tokens were locked here earlier, so the liquidity exists. The admin also manages lane balances directly, through three more redeemer paths. `AddLiquidity` deposits tokens into a lane. `RemoveLiquidity` withdraws them. `RebalanceLiquidity` moves tokens between lanes without changing the total. All three require the admin signature.

`hook_data` follows the same rules as the Burn & Mint Client: empty means the recipient output carries `NoDatum`; non-empty must equal the CBOR bytes of its inline datum.

:::warning USDM
Do NOT use `hook_data` with USDM. Leave it empty.
:::

---

## Parameters

The client takes eight parameters:

```aiken
validator lock_release_client_test_v4(
  seed_utxo_ref: OutputReference,
  admin: VerificationKeyHash,
  lane_count: Int,
  locked_asset_policy_id: PolicyId,
  locked_asset_name: AssetName,
  send_request_policy_id: PolicyId,
  via_processed_txs_policy_id: PolicyId,
  lock_release_state_policy_id: PolicyId,
) {
```

Together with the state script's two parameters, they split cleanly:

| You supply | VIA supplies (network-specific) |
|---|---|
| `seed_input` — the UTxO the state script consumes at init. Makes the state NFT unique. | `send_request_policy_id` — the shared send-request auth token policy. |
| `admin` — the key that authorizes init, registration, route updates, and liquidity operations. The state script and the client each take one; the reference deployment uses the same key for both. | `via_processed_txs_policy_id` — the policy that proves VIA delivered a message. |
| `seed_utxo_ref` — the seed UTxO for the client. Makes init one-shot. | |
| `lane_count` — how many liquidity lanes the vault runs. | |
| `locked_asset_policy_id`, `locked_asset_name` — the token the vault holds. | |

The eighth client parameter, `lock_release_state_policy_id`, is derived. Parameter application is a two-step process:

1. Apply `seed_input` and `admin` to the state script. Compute its script hash.
2. Pass that hash to the client as `lock_release_state_policy_id`, together with the other seven parameters.

:::warning Builds are network-specific
The two VIA policy IDs are compile-time parameters. A build for Cardano Preprod is valid only on Cardano Preprod. Never reuse a compiled script on another network.
:::

---

## The Midnight Variant

Midnight mints are `Uint<64>`. A Cardano amount is a plain integer and can exceed that. So a dedicated copy of this client exists for Midnight routes. It caps outbound amounts:

```aiken
/// Largest amount that can be represented by Midnight's canonical `Uint<64>`
/// VILR amount field.
pub const max_uint64: Int = 18_446_744_073_709_551_615
```

The cap applies to `LockForVia` only. Every other path passes through to the base client unchanged. A matching copy of the state script exists too; its rules are identical. USDM runs this variant.

---

## Where the Rest Lives

The client builds on VIA's on-chain library modules. You receive the full package, with the network values for your target network, when you start an integration.

Putting your own token behind a vault is a guided process: you build, deploy, and register your client, and VIA wires your integration into the message layer.

Bridging tokens VIA already supports, for example USDM, needs no sign-off from anyone. That path is permissionless. Follow the [USDM bridge guide](/docs/examples/guides/usdm-cardano-midnight).

- [Integration Paths](/docs/examples/cardano/integration-paths) — choose your route onto Cardano and Midnight
- [Lock & Release Token](/docs/examples/lock-release-token) — the EVM vault counterpart of this client
