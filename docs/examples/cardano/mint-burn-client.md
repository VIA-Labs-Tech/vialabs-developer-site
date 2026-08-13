---
sidebar_label: Mint & Burn Client
title: Mint & Burn Client
description: A guided read-through of VIA's audited mint-and-burn reference client for Cardano, written in Aiken.
---

# Mint & Burn Client

Read the source of VIA's mint-and-burn reference client for Cardano. It is the Cardano counterpart of the EVM [Burn & Mint Token](/docs/examples/burn-mint-token) example. Sending burns the token on Cardano. Receiving mints it. Total supply across chains stays constant.

This page walks the real Aiken source, top to bottom. Read it to understand how a Cardano integration hangs together before you build one.

:::info What this page is
This is a read-through, not a deploy tutorial. The code comes from VIA's audited reference sources and targets testnet: Cardano Preprod, with routes to Midnight Preview or EVM testnets. Launching your own token on Cardano or Midnight is a guided process — you build and deploy it together with VIA. Bridging USDM through the contracts VIA has already deployed is permissionless. See [Integration Paths](/docs/examples/cardano/integration-paths) for both routes.
:::

---

## The Two Validators

The integration is two Aiken validators that work as a pair.

**The state script** is small — 43 lines. Its mint branch bootstraps a singleton state NFT. The NFT sits in a UTxO at the script's own address and holds the client's config as an inline datum.

```aiken
validator mint_burn_state_script(
  seed_input: OutputReference,
  admin: VerificationKeyHash,
) {
  mint(_redeemer: Data, policy_id: PolicyId, transaction: Transaction) {
    mint_burn_state.validate_mint_init_state(
      transaction,
      policy_id,
      seed_input,
    )
  }
```

The datum is a `MintBurnStateDatum`. Its key field is `supported_routes` — a list of `{source_chain, sender}` pairs. This is the allowlist of remote contracts that may mint on Cardano through your client.

Only the admin can change it. The spend branch checks the admin signature, then lets the datum change while the NFT stays where it is:

```aiken
spend(
  datum: Option<MintBurnStateDatum>,
  redeemer: MintBurnStateRedeemer,
  output_reference: OutputReference,
  transaction: Transaction,
) {
  expect Some(current_datum) = datum
  mint_burn_state.validate_spend_update_state(
    transaction,
    output_reference,
    current_datum,
    admin,
    redeemer,
  )
}
```

Because the routes live in a datum, you can add or remove routes without recompiling or redeploying anything.

**The client** is a minting policy. Every bridged token on Cardano exists under its policy ID. It accepts three redeemer paths:

- **Init** — seeds the local supply and registers the client. The init redeemer follows VIA's project-registry authority shape.
- **`BurnForVia { dest_chain, dest_client, confirmations, deposit_info }`** — the send path.
- **`MintFromVia { via_witness_idx, deposit_info }`** — the receive path.

`deposit_info` appears in both directions. It describes one transfer: `amount`, `source_token`, `source_depositor`, `destination_token`, `destination_recipient`, `max_fee`, `hook_data`, and a version.

---

## Init: One Transaction, Three Effects

Initialization is one transaction that does three things at once. Here is the start of `validate_init`:

```aiken
let Transaction { inputs, mint, outputs, .. } = transaction
expect Some(_consumed) = find_input(inputs, utxo_ref)

expect Some(Pair(token_name, minted_amount)) =
  single_policy_delta(mint, policy_id)
expect token_name == bridged_token_name
if !no_policy_activity(mint, via_processed_txs_policy_id) {
  False
} else if minted_amount <= 0 {
  False
} else if
  sum_policy_tokens(outputs, policy_id, bridged_token_name) != minted_amount
{
  False
} else {
```

The `utxo_ref` parameter names one specific seed UTxO. The transaction must consume it. A UTxO can be spent only once, so init can run only once.

The same transaction must:

1. **Mint the initial supply.** The mint must be positive, under your token name only, and every minted token must appear in the outputs.
2. **Create the state UTxO.** The `else` branch checks for exactly one output that carries the state NFT. Its inline datum must be a well-formed `MintBurnStateDatum` at the current version.
3. **Register with the project registry.** The init redeemer itself carries the registry-authority shape. VIA's registry insert runs in the same transaction, so the client is known to the network from the moment it exists.

---

## BurnForVia: The Send Path

To send tokens off Cardano, the depositor burns them and posts a send request. The policy first checks the shape of `deposit_info`: current version, positive amount, non-negative `max_fee`, non-empty `dest_client`, and 32-byte token and recipient hashes. Then the core rules:

```aiken
when single_policy_delta(mint, policy_id) is {
  Some(Pair(token_name, minted_amount)) ->
    if token_name != bridged_token_name {
      trace @"ClientTest.BurnForVia: wrong bridged token name"
      False
    } else if minted_amount != -amount {
      trace @"ClientTest.BurnForVia: burn amount mismatch"
      False
    } else if source_token != token_hash(policy_id, bridged_token_name) {
      trace @"ClientTest.BurnForVia: source token hash mismatch"
      False
    } else if !signed_by_source_depositor(transaction, source_depositor) {
      trace @"ClientTest.BurnForVia: source depositor did not sign"
      False
    } else if !send_request_mint_is_exact(mint, send_request_policy_id) {
      trace @"ClientTest.BurnForVia: send_request mint mismatch"
      False
```

Four rules carry the weight:

- **Burn exactly the bridged amount.** The policy's own mint delta must equal `-amount`. Nothing more, nothing less.
- **The token identity must match.** VIA identifies a Cardano token by a 32-byte hash:

```aiken
fn token_hash(policy_id: PolicyId, token_name: AssetName) -> ByteArray {
  keccak_256(bytearray.concat(policy_id, token_name))
}
```

  This hash is what the destination chain sees as the source token.

- **The depositor signs.** `source_depositor` must appear in the transaction's signatories. Nobody can burn your tokens for you.
- **Exactly one `send_request` auth token is minted.** The asset name is literally `send_request` (hex `73656e645f72657175657374`).

The send request must live at VIA's send-request spending script. The client does not hardcode that script hash. It reads it from an authenticated reference input, so VIA can publish it once on chain. The output's inline datum is a `SendRequested`:

```aiken
let expected_chain_data =
  deposit_intent.encode_deposit_intent(deposit_info)
expect send_requested: SendRequested = output_datum

let SendRequested {
  sender,
  recipient,
  dest_chain: actual_dest_chain,
  chain_data,
  confirmations: actual_confirmations,
} = send_requested
```

Every field must match the burn. The `sender` is your client's policy ID. The `recipient` is `dest_client` on the destination chain. The `chain_data` must equal the byte encoding of `deposit_info`, produced by VIA's `deposit_intent` module. If all fields match, the message is queued. VIA's message layer picks up the UTxO and carries the transfer to the destination.

:::info Read the traces
Every failure path traces a message, like `ClientTest.BurnForVia: burn amount mismatch`. VIA builds with `aiken build --tracing-mode verbose`, so a failing transaction tells you exactly which rule it broke.
:::

---

## MintFromVia: The Receive Path

When VIA delivers a message to Cardano, the transaction mints fresh tokens to the recipient. The policy assumes nothing about that transaction. It re-checks everything:

- **Fresh mint only.** No bridged tokens may appear among the inputs. The mint is the only source of these tokens in the transaction, which keeps the payout accounting exact.
- **Pay the recipient exactly.** `destination_recipient` decodes to a Cardano credential — a key or a script. Exactly one output pays that credential exactly `amount` of the token, and the outputs in total hold exactly `amount`.
- **The route must be allowed.** The transaction references the state UTxO by its NFT. The message's source chain and sender must appear in `supported_routes`.
- **VIA must witness the delivery in the same transaction.** `via_witness_idx` points into the transaction's redeemer list. At that index, the policy expects a mint under VIA's processed-transactions policy with an `Insert` redeemer:

```aiken
expect redeemer: ViaTxRedeemer = data
when redeemer is {
  ViaTxRedeemer.Insert {
    source_chain,
    sender,
    dest_chain: _,
    recipient,
    on_chain_data,
    ..
  } ->
    // `dest_chain` is enforced centrally by `minting_via_tx`, so reference
    // clients only need to prove the allowed route plus recipient/payload.
    and {
      route_is_supported(supported_routes, source_chain, sender),
      recipient == expected_recipient,
      on_chain_data == expected_on_chain_data,
    }
  _ -> False
}
```

The witness must target this client and carry the exact encoded deposit. VIA's processed-transactions policy keeps the record of delivered messages, so a client only mints when the network has proven a matching delivery.

---

## hook_data: Delivery With a Datum

`hook_data` rides along inside `deposit_info`. It controls the datum on the recipient's output:

- **Empty `hook_data`** — the recipient output must carry `NoDatum`.
- **Non-empty `hook_data`** — it must equal the CBOR bytes of the recipient output's inline datum.

```aiken
fn destination_hook_data_matches(output: Output, hook_data: ByteArray) -> Bool {
  if bytearray.length(hook_data) == 0 {
    output.datum == NoDatum
  } else {
    when output.datum is {
      InlineDatum(data) -> builtin.serialise_data(data) == hook_data
      _ -> False
    }
  }
}
```

This lets a sender on another chain deliver tokens straight into a Cardano script, with the exact datum that script expects. For a plain wallet payout, leave it empty.

---

## Parameters

The client takes seven parameters:

```aiken
validator mint_client_test_v4(
  utxo_ref: OutputReference,
  bridged_token_name: AssetName,
  project_registry_policy_id: PolicyId,
  send_request_policy_id: PolicyId,
  spending_send_request_ref_script_auth_policy: PolicyId,
  via_processed_txs_policy_id: PolicyId,
  mint_burn_state_policy_id: PolicyId,
) {
```

Together with the state script's two parameters, they split cleanly:

| You supply | VIA supplies (network-specific) |
|---|---|
| `seed_input` — the UTxO the state script consumes at init. Makes the state NFT unique. | `project_registry_policy_id` — VIA's on-chain project registry. |
| `admin` — the key hash allowed to update the route list. | `send_request_policy_id` — the shared send-request auth token policy. |
| `utxo_ref` — the seed UTxO for the client policy. Makes init one-shot. | `spending_send_request_ref_script_auth_policy` — authenticates the send-request script's reference input. |
| `bridged_token_name` — the asset name of your bridged token. | `via_processed_txs_policy_id` — the policy that proves VIA delivered a message. |

The seventh client parameter, `mint_burn_state_policy_id`, is derived. Parameter application is a two-step process:

1. Apply `seed_input` and `admin` to the state script. Compute its script hash.
2. Pass that hash to the client as `mint_burn_state_policy_id`, together with the other six parameters.

:::warning Builds are network-specific
The four VIA policy IDs are compile-time parameters. A build for Cardano Preprod is valid only on Cardano Preprod. Never reuse a compiled script on another network.
:::

---

## The EVM Side of the Route

This client is deployed on Cardano Preprod and bridges to EVM testnets today. It runs on the same deployment as testnet USDM — there is no separate configuration for Cardano ↔ EVM routes.

The EVM-side contracts are public in [`vg1-evm-contracts`](https://github.com/VIA-Labs-Tech/vg1-evm-contracts/tree/master/src). `ViaMintBurnTokenCardano.sol` is the counterpart built for Cardano routes. The repo also holds the standard `VIAMintBurnToken.sol`, `VIAMintBurnTokenMinimal.sol`, and `VIALockerRelease.sol`.

---

## Where the Rest Lives

The client imports VIA's on-chain library modules: `deposit_intent`, `send_request`, `mint_burn_state`, `project_registry_authority`, and shared types. Those modules, the Preprod policy IDs, and registration all come from VIA during onboarding.

Launching your own token on Cardano or Midnight is a guided process. You and the VIA team do it together: VIA reviews the client, registers it, and connects it to the message layer. The registry and the delivery witness both live on VIA's side of the pair, so this is how the design works — not a waitlist.

Bridging USDM through the contracts VIA has already deployed needs no sign-off from anyone. That path is permissionless.

- [Integration Paths](/docs/examples/cardano/integration-paths) — choose your route onto Cardano and Midnight
- [Burn & Mint Token](/docs/examples/burn-mint-token) — the EVM counterpart of this client
