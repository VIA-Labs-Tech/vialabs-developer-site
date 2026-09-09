---
sidebar_label: Overview & Concepts
title: VIA on Stellar
description: What is deployed on Stellar, how a cross-chain transfer works, and the five rules that explain everything you'll see on chain.
---

# VIA on Stellar

VIA cross-chain messaging is live between Stellar (Soroban) and Ethereum, in both directions, on mainnet and testnet. The reference integration is **VIAT**, a burn-and-mint token: try it in the [VIAT transfer app](https://stellar.anytoany.xyz/). The Stellar contracts are the VG1 contracts audited by Hashlock — see [Audits](/docs/general/audits).

This page is everything you need to **use and understand** the deployment. Building your own integration is a guided process with VIA — see [Integration Paths](/docs/examples/stellar/integration-paths).

---

## How a transfer works

1. **Send** — you call `bridge()` on the VIAT token you hold. It burns your amount and hands the gateway a message with the recipient, amount, and an optional memo.
2. **Sign** — VIA's validators watch the source gateway and sign the message (ed25519 on the Stellar side).
3. **Deliver** — a relayer submits the signed message to the destination gateway, which verifies the signatures and calls the token, which mints to the recipient.

Replays are rejected on chain, total supply across chains stays constant, and transfers complete in one to three minutes. Only the token contract is yours to touch — gateways, validators, and relayers are infrastructure.

---

## Deployed contracts

**Mainnet** — Stellar ⇄ Ethereum

| | Stellar mainnet | Ethereum mainnet |
|---|---|---|
| VIA chain ID | `5731147` | `1` |
| Gateway | `CB4TJPBTN6L72FGJLL2ZQHMKUZVSETA4N7HO6KFM4I27MMVOJ2UUEEWL` | `0xDaA038AdB967A9aF11570D13Af8D723007EEf7eC` |
| VIAT token | `CCV4X6S5TM4IVWIIWMLK6S5J3M34B64RJTLD5TF6QKDGVJKYFZQWJ3OV` | `0x64F47B4A956DAFF307333F6A99DDB70beC9144E6` |

**Testnet** — Stellar testnet ⇄ Ethereum Sepolia

| | Stellar testnet | Ethereum Sepolia |
|---|---|---|
| VIA chain ID | `5555555555` | `11155111` |
| Gateway | `CAMRA4FFQUG3XBVNPE2NZGDX5MGOX4OWODMNOXD3WODOQLPBQG4RPMAQ` | `0xaA6917086C29beFBd2e918E2B7E657Cec8A5E674` |
| VIAT token | `CCCIGW2URB5RDLE3AMOJ2RCOX2SM6YEWR4KAEMYWT5ECERDIMZQX3H2R` | `0x425647EDDE512bBc38D1032e87895b086859824e` |

Gateway addresses for every VIA network are on [Supported Networks](/docs/general/supported-networks).

---

## Five rules that explain everything

1. **Chain IDs are VIA routing identifiers, not Stellar concepts.** Every message ID is `source chain ID × 10²³ + counter` — an ID starting `5731147…` came from Stellar mainnet, `11155111…` from Sepolia. Follow any message by its ID on [VIA Scan](https://scan.vialabs.tech).

2. **Decimals: 7 on Stellar, 18 on EVM, always 18 on the wire.** The Stellar client scales by 10¹¹ in each direction, so 5 tokens on Stellar arrive as 5 tokens on Ethereum — `5·10⁷` there, `5·10¹⁸` here, same 5 tokens.

3. **Addresses cross chains as raw bytes.** Stellar → Ethereum carries the 20-byte hex address. Ethereum → Stellar carries the 32-byte Stellar public key (the `G...` string is that value, base32-encoded).

4. **A Stellar recipient must already exist on the ledger** — funded with the minimum XLM balance at least once. Tokens sent to a never-created account are delivered to an unusable contract-typed twin and are **not recoverable**. Fund first, bridge second.

5. **Only a contract can send a message.** The gateway rejects calls straight from a wallet — users interact with the token client, and the client calls the gateway. That's why the sender you see on the far side is always the token contract, never a wallet.

---

## Fees

- A transfer costs normal Stellar network fees in XLM (or gas on the EVM side). No VIA protocol fee is charged on Stellar routes during the launch period. Relayers pay the destination-side fees.
- Stellar finalizes in about five seconds; the reference client requests zero confirmations. Delivery time is set by the validator's polling interval.
- **Testnet:** the transfer app's faucet buttons hand out 100 VIAT per click on either chain. SDF resets Stellar testnet quarterly — testnet addresses change after each reset; mainnet addresses are stable.
- Explorers: [stellar.expert](https://stellar.expert/explorer/public) for Stellar, [Etherscan](https://etherscan.io) for the EVM side.

---

## Going deeper

- [Integration Paths](/docs/examples/stellar/integration-paths) — launching your own token or message flow with VIA
- [Burn & Mint Client](/docs/examples/stellar/mint-burn-client) — the reference client's source, explained piece by piece
- [Technology Overview](/docs/general/technology-overview) — the validator/relayer model shared by every VIA chain
