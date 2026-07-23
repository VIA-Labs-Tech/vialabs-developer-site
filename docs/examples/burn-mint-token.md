---
sidebar_label: Burn & Mint Token
title: Burn & Mint Token
description: Deploy a cross-chain ERC20 token that burns on the source chain and mints on the destination.
---

# Burn & Mint Token

Deploy a cross-chain ERC20 that burns on the source chain and mints on the destination. Total supply stays constant — tokens are destroyed on one side and created on the other.

**Use this when you control the token.** If you need to bridge a token you don't control (like USDC), see [Lock & Release](/docs/examples/lock-release-token).

:::tip Choosing a Bridge Pattern
| Pattern | Token control | Liquidity needed | Destination token |
|---------|--------------|-----------------|-------------------|
| **Burn & Mint** | You control it | No | Same token (minted) |
| [Lock & Mint](/docs/examples/lock-mint-token) | You don't control it | No | Wrapped/synthetic version |
| [Lock & Release](/docs/examples/lock-release-token) | You don't control it | Yes, pre-funded | Original token |
:::

---

## Prerequisites

- A working Hardhat project with VIA contracts — complete the [Hello World](/docs/examples/hello-world) guide first
- Testnet tokens on two chains — see [Testnet Tokens](/docs/general/testnet-tokens)

---

## Step 1: Copy the Contract

Copy `VIAMintBurnTokenMinimal.sol` from the [Contract Source](/docs/general/contract-source#viamintburntokenminimalsol) page into your `contracts/` directory. See the [full reference](/docs/general/ref-mint-burn) for API details.

---

## Step 2: Deploy

Mint the entire initial supply on **one chain only** — the destination deployment starts at zero and only receives tokens when they're bridged in. This is what keeps total supply constant across chains.

Create `scripts/deploy-token.ts`:

```typescript
import { ethers } from "hardhat";

// Mint the full supply on the source chain (Sepolia).
// Set this to 0 before deploying to the destination chain (Fuji).
const INITIAL_SUPPLY = 1000000;

async function main() {
  const Token = await ethers.getContractFactory("VIAMintBurnTokenMinimal");
  const token = await Token.deploy("My Token", "MTK", INITIAL_SUPPLY);
  await token.waitForDeployment();
  console.log("Deployed to:", await token.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

Deploy to Sepolia with the full supply:

```bash
npx hardhat run scripts/deploy-token.ts --network sepolia
```

Then change `INITIAL_SUPPLY` to `0` and deploy to Fuji:

```bash
npx hardhat run scripts/deploy-token.ts --network fuji
```

Save both addresses.

---

## Step 3: Configure

Same pattern as [Hello World — Step 7](/docs/examples/hello-world#step-7-configure-the-contracts). On each chain, call `setMessageGateway()` and `setMessageEndpoints()` pointing at the peer contract.

---

## Step 4: Bridge Tokens

Create `scripts/bridge.ts`:

```typescript
import { ethers } from "hardhat";

const TOKEN_ADDRESS = "";       // your contract on source chain
const DEST_CHAIN_ID = 43113;    // Fuji
const RECIPIENT = "";           // recipient address on destination chain
const AMOUNT = ethers.parseEther("100");

async function main() {
  const token = await ethers.getContractAt("VIAMintBurnTokenMinimal", TOKEN_ADDRESS);

  const recipientBytes32 = ethers.zeroPadValue(RECIPIENT, 32);

  console.log("Bridging", ethers.formatEther(AMOUNT), "tokens...");
  const tx = await token.bridge(recipientBytes32, DEST_CHAIN_ID, AMOUNT);
  await tx.wait();
  console.log("TX:", tx.hash);
  console.log("Tokens burned. Wait 1-5 minutes for mint on destination.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

```bash
npx hardhat run scripts/bridge.ts --network sepolia
```

:::info Delivery fees
On testnets, message delivery is currently free — no value needs to be attached to `bridge()`. On mainnet, delivery fees may apply; see [Fees & Gas](/docs/general/fees-and-gas).
:::

:::caution
**Burns are irreversible.** If destination `messageProcess()` fails, source tokens are already burned. Recovery requires the owner to manually mint replacement tokens.
:::

---

## Next Steps

- [Lock & Release Token](/docs/examples/lock-release-token) — bridge tokens you don't control
- [Contract Source](/docs/general/contract-source) — ViaIntegrationV1 and reference implementations
