---
sidebar_label: "Transfer USDM: Cardano ↔ Midnight"
title: "Transfer USDM: Cardano ↔ Midnight"
description: Transfer native USDM between Cardano and Midnight, both directions, on mainnet or testnet, from one CLI.
---

# Transfer USDM: Cardano ↔ Midnight

Follow this guide to transfer native USDM between Cardano and Midnight using one CLI for both directions. It runs on **mainnet or testnet** — a single environment variable selects the network pair. Plugging into deployed contracts is permissionless.

VIA is not a bridge. It is a cross-chain messaging network, and this transfer is one application built on top of it.

:::info The permissionless path
The USDM contracts are live on Cardano Mainnet ↔ Midnight mainnet and on Cardano Preprod ↔ Midnight Preview — anyone can use them. Launching your **own** cross-chain native token on Cardano or Midnight works differently: it is a guided process you do together with VIA. The [Cardano overview](/docs/examples/cardano/overview) explains both.
:::

---

## Networks

Cross-chain Native Transfers (CCNTs) for USDM are live on testnet and mainnet, selected by `NETWORK` in `.env`:

| `NETWORK` | Cardano side | Midnight side |
|-----------|--------------|---------------|
| `testnet` (default) | Preprod | Preview |
| `mainnet` | Mainnet | mainnet |

The deployed contracts only route within their pair, so mixed combinations do not exist. Everything below — commands, code, recipients — is identical on both networks.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v22+
- A Cardano wallet (mnemonic) holding **USDM and ADA** on your chosen network
- A Midnight wallet (mnemonic) with **DUST capacity** — you do not need USDM there; transferring from Cardano mints it to you
- For Midnight → Cardano only: a Midnight proof server (local by default; remote works too)

**On testnet:** faucets for ADA and tDUST are on the [Testnet Tokens](/docs/general/testnet-tokens) page. Use the **Preprod** network in the Cardano faucet. For tUSDM on Preprod, use the [tUSDM faucet](https://tusdm.moneta.global).

**On mainnet:** USDM is [Moneta's fiat-backed stablecoin](https://moneta.global) on Cardano, and DUST is generated — not bought or transferred — by registering **NIGHT** you hold on Cardano to your Midnight wallet's dust key. See [DUST on mainnet](#dust-on-mainnet) below before attempting Midnight → Cardano.

Chain reads need no API key. The CLI uses Koios' free public tier for the selected network by default. If you prefer Blockfrost, set `BLOCKFROST_PROJECT_ID` in `.env` and the CLI switches over.

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

Create a `.env` file with the network and your wallet mnemonics:

```bash
# mainnet or testnet (the default)
NETWORK=testnet

# Cardano wallet — 12/15/24 words. Must hold USDM + ADA on the selected network.
CARDANO_MNEMONIC="word1 word2 word3 ... word24"

# Midnight wallet — BIP39 mnemonic.
MIDNIGHT_MNEMONIC="word1 word2 word3 ... word24"

# Proof server — only needed for Midnight -> Cardano. This is the default:
# PROOF_SERVER_URL=http://localhost:6300
```

Every wallet secret also takes a network suffix that wins on its network — so both networks' wallets can live in one `.env`, and `NETWORK` picks between them:

```bash
CARDANO_MNEMONIC_PREPROD="..."
CARDANO_MNEMONIC_MAINNET="..."
MIDNIGHT_MNEMONIC_PREVIEW="..."
MIDNIGHT_MNEMONIC_MAINNET="..."
```

The plain (unsuffixed) name is the shared fallback for both networks.

:::warning Wallet hygiene
On testnet, use fresh throwaway wallets. On mainnet, use a dedicated operational wallet holding only what you intend to transfer plus fees — never your main holdings. Keep `.env` out of git — everything in it stays on your machine.
:::

Strictly, the Cardano mnemonic is needed for Cardano → Midnight and the Midnight mnemonic for Midnight → Cardano. But set both: when you omit a recipient, the CLI derives your own destination address from the other mnemonic.

Optional variables (`MIDNIGHT_SEED`, `BLOCKFROST_PROJECT_ID`, `KOIOS_URL`, `MIDNIGHT_NODE_URL`, `MIDNIGHT_INDEXER_URL`, `MIDNIGHT_INDEXER_WS_URL`, `WALLET_STATE_FILE`) are documented in the package's `.env.example`. The defaults work.

---

## Step 3: Check Balances

```bash
node balance-cardano.mjs   # Cardano side: ADA + USDM
node balance.mjs           # Midnight side: USDM, DUST
```

`balance.mjs` syncs your Midnight wallet and prints every balance it knows about, with the USDM entry labeled by its token color.

:::info First run syncs from genesis
The first sync of the Midnight wallet walks the chain from genesis. It takes several minutes and prints progress as it goes. The state is cached per network (`wallet-state.json` on testnet, `wallet-state.mainnet.json` on mainnet), so later runs start fast. Running `balance.mjs` first is a good way to get the sync out of the way before you start transferring cross-chain.
:::

---

## Step 4: Cardano → Midnight

```bash
node bridge.mjs c2m 5 mn_addr1...
```

Omit the recipient to send to your own Midnight wallet:

```bash
node bridge.mjs c2m 5
```

The amount is whole USDM — `5` means 5 USDM.

What happens:

1. The CLI builds a Cardano transaction that locks your USDM at VIA's lock-release client. The same transaction creates the `send_request` that tells the network where the tokens go.
2. The CLI signs, submits, and waits for the lock transaction to confirm.
3. VIA's network picks up the request, waits out the source-chain confirmations, and delivers the message to Midnight.
4. The USDM contract on Midnight mints to your recipient.

Run `node balance.mjs` again to see the USDM arrive on Midnight.

:::info Mainnet takes longer by design
Validators wait for source-chain confirmations before attesting a message: **1 block on testnet, 150 Cardano blocks (≈50 minutes) on mainnet**. For example, a mainnet transfer that has not arrived after 10 minutes is still awaiting confirmations. Check the status of your transfers at [scan.vialabs.tech](https://scan.vialabs.tech).
:::

---

## Step 5: Midnight → Cardano

This direction proves a ZK circuit, so it needs a Midnight proof server — local on port `6300` by default, or remote if you point `PROOF_SERVER_URL` at one. Midnight's own documentation at [docs.midnight.network](https://docs.midnight.network/) covers proof-server setup. Start it before initiating a cross-chain native transfer. The same server proves either network; the package selects the matching ZK artifacts automatically.

Then:

```bash
node bridge.mjs m2c 5 addr1...
```

Omit the recipient to send to your own Cardano wallet:

```bash
node bridge.mjs m2c 5
```

What happens:

1. The CLI syncs your Midnight wallet (cached after the first run).
2. It calls the `bridge` circuit on VIA's USDM gateway contract. Your proof server generates the proof, and the circuit burns the USDM on Midnight. Fees are paid in DUST.
3. The message routes to Cardano (after **1 confirmation on testnet, 180 on mainnet**), and VIA releases USDM from the lock-release client to your recipient.

Check the result with `node balance-cardano.mjs` or an explorer.

### DUST on mainnet

Midnight transaction fees are paid in DUST, and DUST cannot be bought or transferred — it accrues to a wallet's **dust key** from **NIGHT held on Cardano** that has been registered for generation:

1. NIGHT is a Cardano-native token. You hold it in a Cardano wallet.
2. A registration, signed by that Cardano wallet's stake key, points the NIGHT's generation at a Midnight dust address (`mn_dust1...`).
3. DUST then accrues over hours toward a capacity proportional to the registered NIGHT.

The dust key is **not** the wallet's receive address (`mn_addr1...`) — it is a separate key the wallet derives. A registration pointed at a different wallet's dust key generates DUST your wallet can never spend. If a transfer cannot pay fees it fails fast with an `OUT OF DUST` error that prints your wallet's exact dust address, so you can check where your registration actually points. (On testnet, tDUST comes from the faucet and none of this applies.)

---

## Use It as a Library

The CLI is a thin wrapper. The same transfer is one function call from your own Node code:

```ts
import { bridgeUSDM } from '@via-labs-tech/usdm-bridge'

const { txHash } = await bridgeUSDM({
    direction: 'cardano-to-midnight', // or 'midnight-to-cardano'
    amount: '5',
    recipient: 'mn_addr1...', // or addr1... for midnight-to-cardano
})
```

The package also exports the building blocks: `getLucid`, `getSpendableUtxos`, `getEnterpriseAddress`, `koiosProvider`, `deriveMidnightAddress`, and the config constants (`NETWORK`, `IS_MAINNET`, `CONTRACTS`, `USDM_TOKEN_COLOR`, `USDM_DECIMALS`, ...). Configuration comes from the environment, same as the CLI. Secrets stay server-side — never ship them to a client.

---

## Use It in a Browser

Same call, plus the connected wallet. No mnemonics and no proof server anywhere — the user's wallet extension signs (Cardano, CIP-30) and proves (Midnight, connector API v4):

```ts
import { bridgeUSDM } from '@via-labs-tech/usdm-bridge'

// Cardano -> Midnight: any CIP-30 wallet
await bridgeUSDM({
    direction: 'cardano-to-midnight',
    amount: '5',
    recipient: 'mn_addr1...',
    wallet: 'eternl', // just the name — the package finds it on window.cardano
})

// Midnight -> Cardano: a connector-v4 Midnight wallet.
// Proving happens INSIDE the extension.
await bridgeUSDM({
    direction: 'midnight-to-cardano',
    amount: '5',
    recipient: 'addr1...',
    wallet: '1am', // just the name — the package finds it on window.midnight
})
```

Optional `onStatus: (step) => ...` streams every phase (`building → completing → signing → submitting → confirming` / `joining → proving → confirming`) for progress UIs. Your frontend owns wallet discovery, connect, and balances — the wallet apis provide all of it.

### The Vite setup

The dependency stack (Cardano's CML, Midnight's ledger runtime) is wasm + legacy-CJS heavy, and the required workarounds are not guessable. The essentials:

- **`vite-plugin-wasm`** — the Cardano and Midnight wasm modules fail to load without it. No `vite-plugin-top-level-await` (it breaks on Vite 7; `build.target: 'esnext'` handles TLA natively).
- **`vite-plugin-node-polyfills`** with `include: ['buffer', 'events', 'process', 'util', 'stream', 'string_decoder']` and `globals: { Buffer: true, process: true }` — missing any of these fails at runtime, not build time.
- **`define`**: `'process.env.NODE_ENV'`, `global: 'globalThis'`, your baked-in env vars (below), and `'process.version': '"v22.0.0"'` — the last one in **both** `define` and `optimizeDeps.esbuildOptions.define`, or the page dies in dev. Never set `process.versions.node` instead.
- **`resolve.alias`**: `'@midnight-ntwrk/ledger' → '@midnight-ntwrk/ledger-v8'`.
- **`optimizeDeps.exclude`**: the package plus `@midnight-ntwrk/onchain-runtime-v2`, `ledger-v8`, `midnight-js-network-id`, `dapp-connector-api` — pre-bundling breaks the wasm modules.
- **`build`**: `{ target: 'esnext', commonjsOptions: { transformMixedEsModules: true } }`.
- **https dev server** (`@vitejs/plugin-basic-ssl`) — wallet extensions require a secure context.

Configuration is the same env vars as on a server, baked in at build time:

```ts
define: {
    'process.env': JSON.stringify({
        NETWORK: 'testnet',
        // BLOCKFROST_PROJECT_ID: '...' — set it for Blockfrost (CORS-open);
        // unset, chain reads go through a same-origin /koios proxy, because
        // public Koios cannot be called cross-origin.
    }),
}
```

Two more pieces: serve the package's ZK assets at `/artifacts/midnight` (symlink or copy `node_modules/@via-labs-tech/usdm-bridge/artifacts/midnight/<network>` into `public/`), and never bake a real API key into a production bundle — anything in `define` is readable in devtools.

A complete working app — wallet discovery, both directions, progress UI, the full `vite.config.ts` — is at [cct-demo](https://github.com/VIA-Labs-Tech/cct-demo), and the package's `FRONTEND.md` explains every config line, the pitfalls, and a troubleshooting checklist.

---

## What's Happening Under the Hood

Both directions use VIA's standard Cardano/Midnight message flow. The [Cardano overview](/docs/examples/cardano/overview) covers the concepts in full. Here is how this guide maps onto them:

- **`send_request`** — every Cardano-source message starts as a UTxO at the sending contract. Its datum names the sender, the recipient, and the destination chain. VIA's validators watch for these UTxOs and deliver the messages they carry.
- **`chain_data`** — the byte payload inside the request. For USDM it encodes the transfer: amount, source token, destination token, recipient. The destination token is named by the asset's identity **on the destination chain** — for Midnight, the USDM token color below.
- **Routes** — each contract lists the source chains and senders it accepts. The deployed USDM contracts already carry the Cardano ↔ Midnight route in both directions. That is why this guide has no configuration step.

The contracts behind these transfers — note that every value is per-network, because the Cardano scripts compile their parameters in (see [the Cardano overview](/docs/examples/cardano/overview) for why):

**Testnet (Cardano Preprod ↔ Midnight Preview)**

| | Value |
|---|---|
| Cardano chain id | `2273266` |
| Lock-release client (policy id) | `76fbe9f6c8761cc6744c34a1f30915037e38c01197d6e7c9d2fcc1d3` |
| Midnight chain id | `64364450` |
| USDM gateway contract | `471dfe55c866fdbc085c9011a51f0cd0e9c9bfca6bb985c35f7716b6e73e485c` |
| USDM token color (Midnight) | `003bacd9a361ba0d425e408776020e40271375e8b8de42d73eec046a44947d73` |

**Mainnet (Cardano Mainnet ↔ Midnight mainnet)**

| | Value |
|---|---|
| Cardano chain id | `2273265` |
| Lock-release client (policy id) | `f8fe0d08c5f266f464254ee8d12fabec446fb71e19fdee5de30bd234` |
| Midnight chain id | `64364449` |
| USDM gateway contract | `65023744190a4fc7c8ac9a3dfbc8cfc28f63d2aaa431ceda1d88fdb9a096a6a1` |
| USDM token color (Midnight) | `8c2c22bc0c37fa999d0611cb5c570f587938ac5ffc8b0925143dad4c0764e94b` |

On Midnight mainnet the gateway and the USDM token are **one contract** (there are no contract-to-contract calls on Midnight), so mainnet runs a single chain id; testnet registered one id per transfer direction. USDM uses 6 decimals on every chain. The ZK assets for both networks ship inside the package (`artifacts/midnight/<network>`) and are read from disk — nothing to download.

---

## Next Steps

- [Cardano Overview](/docs/examples/cardano/overview) — the full Cardano/Midnight integration model
- [Lock & Release Token](/docs/examples/lock-release-token) — the same lock-and-release pattern on EVM chains
- [Testnet Tokens](/docs/general/testnet-tokens) — faucets and help getting test funds
- Want your own token on Cardano or Midnight? That is a guided integration — [reach out on Discord](https://discord.gg/h4rBhukkWz) and we build it together.
