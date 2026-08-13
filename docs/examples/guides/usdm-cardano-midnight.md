---
sidebar_label: "Bridge USDM: Cardano ↔ Midnight"
title: "Bridge USDM: Cardano ↔ Midnight"
description: Move testnet USDM between Cardano Preprod and Midnight Preview, both directions, from one CLI.
---

# Bridge USDM: Cardano ↔ Midnight

Move testnet USDM from Cardano Preprod to Midnight Preview, then back. One CLI, both directions. You bridge against VIA's deployed contracts — no onboarding, no approval, no sign-up.

:::info The permissionless path
The USDM contracts are live on both testnets. Anyone can bridge through them, and this guide does exactly that. Launching your **own** token on Cardano or Midnight works differently: it is a guided process you do together with VIA. The [Cardano overview](/docs/examples/cardano/overview) explains both.
:::

---

## Prerequisites

- [Node.js](https://nodejs.org/) v22+
- A Cardano Preprod wallet (mnemonic) holding **tUSDM and ADA**
- A Midnight Preview wallet (mnemonic) holding **tDUST** — you do not need USDM there; bridging from Cardano mints it to you
- For Midnight → Cardano only: a Midnight proof server (local by default; remote works too)

Faucets for ADA and tDUST are on the [Testnet Tokens](/docs/general/testnet-tokens) page. Use the **Preprod** network in the Cardano faucet. For tUSDM on Preprod, use the [tUSDM faucet](https://tusdm.moneta.global).

Chain reads need no API key. The CLI uses Koios' free public Preprod tier by default. If you prefer Blockfrost, set `BLOCKFROST_PROJECT_ID` in `.env` and the CLI switches over.

---

## Step 1: Install

```bash
npm install @via-labs-tech/usdm-bridge
```

Or work from a checkout of the package:

```bash
npm install
npm run build
cp .env.example .env
```

The commands below use the checkout form, `node bridge.mjs`. If you installed from npm, run the same scripts from the package directory instead:

```bash
node node_modules/@via-labs-tech/usdm-bridge/bridge.mjs ...
```

Either way, run from the directory that holds your `.env`. The CLI reads it from the working directory.

---

## Step 2: Configure `.env`

Create a `.env` file with your two wallet mnemonics:

```bash
# Cardano wallet — 12/15/24 words. Must hold tUSDM + ADA on Preprod.
CARDANO_MNEMONIC="word1 word2 word3 ... word24"

# Midnight wallet — BIP39 mnemonic. Must hold USDM + tDUST on Preview.
MIDNIGHT_MNEMONIC="word1 word2 word3 ... word24"

# Proof server — only needed for Midnight -> Cardano. This is the default:
# PROOF_SERVER_URL=http://localhost:6300
```

:::warning Throwaway testnet wallets only
Use fresh wallets created for this guide. Never put a mnemonic from a wallet that holds real funds in `.env`. Keep `.env` out of git — everything in it stays on your machine.
:::

Strictly, `CARDANO_MNEMONIC` is needed for Cardano → Midnight and `MIDNIGHT_MNEMONIC` for Midnight → Cardano. But set both: when you omit a recipient, the CLI derives your own destination address from the other mnemonic.

Optional variables (`MIDNIGHT_SEED`, `BLOCKFROST_PROJECT_ID`, `KOIOS_URL`, `MIDNIGHT_NODE_URL`, `MIDNIGHT_INDEXER_URL`, `MIDNIGHT_INDEXER_WS_URL`, `WALLET_STATE_FILE`) are documented in the package's `.env.example`. The defaults work.

---

## Step 3: Check Balances

```bash
node balance.mjs
```

This syncs your Midnight wallet and prints every balance it knows about: unshielded (NIGHT, USDM), shielded, and DUST.

:::info First run syncs from genesis
The first sync of the Midnight wallet walks the chain from genesis. It takes several minutes. The state is cached in `wallet-state.json`, so later runs start fast. Running `balance.mjs` first is a good way to get the sync out of the way before you bridge.
:::

`balance.mjs` covers the Midnight side. Check your Cardano tUSDM and ADA in your Preprod wallet or a Preprod explorer.

---

## Step 4: Cardano → Midnight

```bash
node bridge.mjs c2m 5 mn_addr_preview1...
```

Omit the recipient to send to your own Midnight wallet:

```bash
node bridge.mjs c2m 5
```

The amount is whole USDM — `5` means 5 USDM.

What happens:

1. The CLI builds a Cardano transaction that locks your tUSDM at VIA's lock-release client. The same transaction creates the `send_request` that tells the network where the tokens go.
2. The CLI signs, submits, and waits for the lock transaction to confirm.
3. VIA's network picks up the request and delivers the message to Midnight.
4. The USDM contract on Midnight mints to your recipient.

Run `node balance.mjs` again to see the USDM arrive on Midnight.

---

## Step 5: Midnight → Cardano

This direction proves a ZK circuit, so it needs a Midnight proof server — local on port `6300` by default, or remote if you point `PROOF_SERVER_URL` at one. Midnight's own documentation at [docs.midnight.network](https://docs.midnight.network/) covers proof-server setup. Start it before you bridge.

Then:

```bash
node bridge.mjs m2c 5 addr_test1...
```

Omit the recipient to send to your own Cardano wallet:

```bash
node bridge.mjs m2c 5
```

What happens:

1. The CLI syncs your Midnight wallet (cached in `wallet-state.json` after the first run).
2. It calls the `bridge` circuit on VIA's USDM gateway contract. Your proof server generates the proof, and the circuit burns the USDM on Midnight.
3. The message routes to Cardano, and VIA releases tUSDM from the lock-release client to your recipient.

Check the result in your Preprod wallet or explorer.

---

## Use It as a Library

The CLI is a thin wrapper. The same bridge is one function call from your own Node code:

```ts
import { bridgeUSDM } from '@via-labs-tech/usdm-bridge'

const { txHash } = await bridgeUSDM({
    direction: 'cardano-to-midnight', // or 'midnight-to-cardano'
    amount: '5',
    recipient: 'mn_addr_preview1...', // or addr_test1... for midnight-to-cardano
})
```

The package also exports the building blocks: `getLucid`, `getSpendableUtxos`, `getEnterpriseAddress`, `koiosProvider`, `deriveMidnightAddress`, and the config constants (`CONTRACTS`, `USDM_DECIMALS`, ...). Configuration comes from the environment, same as the CLI. Secrets stay server-side — never ship them to a client.

---

## What's Happening Under the Hood

Both directions ride VIA's standard Cardano/Midnight message flow. The [Cardano overview](/docs/examples/cardano/overview) covers the concepts in full. Here is how this guide maps onto them:

- **`send_request`** — every Cardano-source message starts as a UTxO at the sending contract. Its datum names the sender, the recipient, and the destination chain. VIA's validators watch for these UTxOs and deliver the messages they carry.
- **`chain_data`** — the byte payload inside the request. For USDM it encodes the transfer: amount, source token, destination token, recipient.
- **Routes** — each contract lists the source chains and senders it accepts. The deployed USDM contracts already carry the Cardano ↔ Midnight route in both directions. That is why this guide has no configuration step.

The contracts you bridge against:

| Chain | Chain ID | Contract |
|-------|----------|----------|
| Cardano Preprod | `2273266` | Lock-release client: `addr_test1wp4erajtev047rws58fdj6gz6hpvh53wlk7ccc65sld5xusx4z54g` |
| Midnight Preview | `64364450` | USDM gateway contract: `471dfe55c866fdbc085c9011a51f0cd0e9c9bfca6bb985c35f7716b6e73e485c` |

USDM uses 6 decimals on both chains. The Midnight ZK assets ship inside the package (`artifacts/midnight`) and are read from disk — nothing to download.

---

## Next Steps

- [Cardano Overview](/docs/examples/cardano/overview) — the full Cardano/Midnight integration model
- [Lock & Release Token](/docs/examples/lock-release-token) — the same bridge pattern on EVM chains
- [Testnet Tokens](/docs/general/testnet-tokens) — faucets and help getting test funds
- Want your own token on Cardano or Midnight? That is a guided integration — [reach out on Discord](https://discord.gg/h4rBhukkWz) and we build it together.
