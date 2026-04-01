---
sidebar_label: Lock & Release Token
title: Lock & Release Token
description: Lock tokens on the source chain and release from a pre-funded pool on the destination.
---

# Lock & Release Token

Lock existing tokens on the source chain and release from a pre-funded pool on the destination. Users get the **original token** on both sides — no synthetics.

**Use this when you don't control the token** and can manage liquidity on each destination chain.

:::tip Choosing a Bridge Pattern
| Pattern | Token control | Liquidity needed | Destination token |
|---------|--------------|-----------------|-------------------|
| [Burn & Mint](/docs/examples/burn-mint-token) | You control it | No | Same token (minted) |
| [Lock & Mint](/docs/examples/lock-mint-token) | You don't control it | No | Wrapped/synthetic version |
| **Lock & Release** | You don't control it | Yes, pre-funded | Original token |
:::

---

## Prerequisites

- A working Hardhat project with VIA contracts — complete the [Hello World](/docs/examples/hello-world) guide first
- Testnet tokens on two chains — see [Testnet Tokens](/docs/general/testnet-tokens)
- **Liquidity** — you must pre-fund destination contracts before users can bridge

---

## Step 1: Copy the Contract

Copy `VIALockerRelease.sol` from the [Contract Source](/docs/general/contract-source) page into your `contracts/` directory. See the [full reference](/docs/general/ref-locker-release) for API details.

---

## Step 2: Deploy

Create `scripts/deploy-bridge.ts`:

```typescript
import { ethers } from "hardhat";

const TOKEN_ADDRESS = ""; // ERC20 token address on THIS chain

async function main() {
  const Bridge = await ethers.getContractFactory("VIALockerRelease");
  const bridge = await Bridge.deploy(TOKEN_ADDRESS);
  await bridge.waitForDeployment();
  console.log("VIALockerRelease deployed to:", await bridge.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

Deploy on both chains. The `TOKEN_ADDRESS` can differ per chain (e.g., USDC has different addresses on Ethereum vs Polygon).

```bash
npx hardhat run scripts/deploy-bridge.ts --network sepolia
npx hardhat run scripts/deploy-bridge.ts --network amoy
```

---

## Step 3: Configure

Same pattern as [Hello World — Step 7](/docs/examples/hello-world#step-7-configure-the-contracts). On each chain, call `setMessageGateway()` and `setMessageEndpoints()` pointing at the peer bridge contract.

---

## Step 4: Fund Liquidity

Before anyone can bridge TO a chain, that chain's bridge contract must hold tokens. Create `scripts/deposit.ts`:

```typescript
import { ethers } from "hardhat";

const BRIDGE_ADDRESS = ""; // VIALockerRelease on destination chain
const TOKEN_ADDRESS = "";  // ERC20 token on destination chain
const AMOUNT = ethers.parseEther("10000");

async function main() {
  const token = await ethers.getContractAt("IERC20", TOKEN_ADDRESS);
  const bridge = await ethers.getContractAt("VIALockerRelease", BRIDGE_ADDRESS);

  console.log("Approving...");
  const approveTx = await token.approve(BRIDGE_ADDRESS, AMOUNT);
  await approveTx.wait();

  console.log("Depositing liquidity...");
  const depositTx = await bridge.deposit(AMOUNT);
  await depositTx.wait();
  console.log("Done. Bridge has", ethers.formatEther(AMOUNT), "tokens available.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

```bash
npx hardhat run scripts/deposit.ts --network amoy
```

---

## Step 5: Bridge Tokens

Create `scripts/bridge.ts`:

```typescript
import { ethers } from "hardhat";

const BRIDGE_ADDRESS = ""; // VIALockerRelease on source chain
const TOKEN_ADDRESS = "";  // ERC20 token on source chain
const DEST_CHAIN_ID = 80002;
const RECIPIENT = "";
const AMOUNT = ethers.parseEther("100");

async function main() {
  const token = await ethers.getContractAt("IERC20", TOKEN_ADDRESS);
  const bridge = await ethers.getContractAt("VIALockerRelease", BRIDGE_ADDRESS);

  console.log("Approving...");
  const approveTx = await token.approve(BRIDGE_ADDRESS, AMOUNT);
  await approveTx.wait();

  const recipientBytes32 = ethers.zeroPadValue(RECIPIENT, 32);

  console.log("Bridging...");
  const tx = await bridge.bridge(
    recipientBytes32,
    DEST_CHAIN_ID,
    AMOUNT,
    { value: ethers.parseEther("0.001") }
  );
  await tx.wait();
  console.log("TX:", tx.hash);
  console.log("Tokens locked. Wait 1-5 minutes for release on destination.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

```bash
npx hardhat run scripts/bridge.ts --network sepolia
```

---

## Liquidity Management

:::danger
The destination contract **must hold enough tokens** before users bridge. If the pool is empty, `messageProcess()` reverts with `InsufficientLiquidity`, tokens stay locked on source, and recovery is manual. See [Error Reference](/docs/general/error-reference#insufficientliquidity).
:::

- **Monitor `token.balanceOf(bridgeAddress)`** on every destination chain
- **Watch the `Error` event** on the gateway contract — fires when a release fails
- **Owner can withdraw** via `withdraw()` — use a multisig in production

---

## Next Steps

- [Burn & Mint Token](/docs/examples/burn-mint-token) — for tokens you control (no liquidity needed)
- [Lock & Mint Token](/docs/examples/lock-mint-token) — bridge without liquidity pools (synthetic on destination)
- [Contract Source](/docs/general/contract-source) — ViaIntegrationV1 and reference implementations
