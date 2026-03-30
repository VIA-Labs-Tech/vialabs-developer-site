---
sidebar_label: Lock & Release Token
title: Lock & Release Token
description: Lock tokens on the source chain and release from a pre-funded pool on the destination.
---

# Lock & Release Token

Lock existing tokens on the source chain and release equivalent tokens from a pre-funded liquidity pool on the destination chain. Users receive the **original token** on both sides — no wrapped or synthetic tokens.

**Use this pattern when:**
- You don't control the token (can't mint/burn)
- You want users to hold the **original token** (not a synthetic) on the destination chain
- You can manage liquidity pools on each destination chain

:::tip Choosing a Bridge Pattern
| Pattern | Token control | Liquidity needed | Destination token |
|---------|--------------|-----------------|-------------------|
| [Burn & Mint](/docs/examples/burn-mint-token) | You control it | No | Same token (minted) |
| [Lock & Mint](/docs/examples/lock-mint-token) | You don't control it | No | Wrapped/synthetic version |
| **Lock & Release** | You don't control it | Yes, pre-funded | Original token |
:::

---

## Prerequisites

- [Node.js](https://nodejs.org/) v16+
- [MetaMask](https://metamask.io/) or another Web3 wallet
- Testnet tokens on two chains — see [Testnet Tokens](/docs/general/testnet-tokens)
- Familiarity with [Hello World](/docs/examples/hello-world) example
- **Liquidity** — you must pre-fund destination contracts with tokens before users can bridge

---

## The Contract

Create `contracts/LockReleaseBridge.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@vialabs-tech/contracts/ViaIntegrationV1.sol";

/// @title LockReleaseBridge
/// @notice Lock tokens on source chain, release from pre-funded pool on destination.
///         Requires liquidity to be deposited before users can bridge.
contract LockReleaseBridge is Ownable, ViaIntegrationV1 {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;

    error ZeroAmount();
    error InvalidMessage();
    error InsufficientLiquidity(uint256 requested, uint256 available);
    error InsufficientBalance(uint256 requested, uint256 available);

    constructor(address tokenAddress) Ownable() ViaIntegrationV1(msg.sender) {
        token = IERC20(tokenAddress);
    }

    /// @notice Lock tokens and send a cross-chain message to release on destination
    function bridge(
        bytes32 tokenRecipient,
        uint64 destChainId,
        uint256 amount
    ) external payable returns (uint256) {
        if (amount == 0) revert ZeroAmount();
        token.safeTransferFrom(msg.sender, address(this), amount);
        bytes memory data = abi.encode(tokenRecipient, amount);
        return messageSend(destChainId, data, 1);
    }

    /// @notice Add liquidity — anyone can deposit tokens for release on this chain
    function deposit(uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        token.safeTransferFrom(msg.sender, address(this), amount);
    }

    /// @notice Owner withdraws tokens (liquidity management)
    function withdraw(IERC20 tokenAddress, uint256 amount) external onlyOwner {
        if (amount == 0) revert ZeroAmount();
        uint256 balance = tokenAddress.balanceOf(address(this));
        if (amount > balance) revert InsufficientBalance(amount, balance);
        tokenAddress.safeTransfer(msg.sender, amount);
    }

    /// @notice Called automatically — releases pre-deposited tokens to recipient
    function messageProcess(
        uint256, uint64, bytes32, bytes32,
        bytes memory onChainData,
        bytes memory, uint256
    ) internal override {
        (bytes32 tokenRecipient, uint256 amount) = abi.decode(
            onChainData, (bytes32, uint256)
        );
        address recipient = _bytes32ToAddress(tokenRecipient);
        if (amount < 1 || recipient == address(0)) revert InvalidMessage();

        uint256 available = token.balanceOf(address(this));
        if (amount > available) revert InsufficientLiquidity(amount, available);

        token.safeTransfer(recipient, amount);
    }
}
```

---

## Deployment & Setup

Deploy one instance per chain, each with that chain's token address. The `token` address is immutable and can differ across chains (e.g., USDC on Ethereum has a different contract address than USDC on Polygon).

| Step | Action | Purpose |
|------|--------|---------|
| 1 | Deploy `LockReleaseBridge(tokenAddress)` on each chain | Creates the bridge |
| 2 | `setMessageGateway(gatewayAddress)` on each chain | Connects to VIA Gateway |
| 3 | `setMessageEndpoints(chainIds, bridgeAddresses)` on each chain | Maps peer bridges |
| 4 | `deposit(amount)` on each **destination** chain | **Funds the liquidity pool** |

---

## Bridge Flow

```
Source Chain                              Destination Chain
────────────                              ──────────────────
User approves bridge for USDC
User calls bridge()
  ↓ safeTransferFrom(user → bridge)
  ↓ USDC now locked in bridge contract
  ↓ messageSend(destChainId, data, 1)
  ↓ Gateway emits SendRequested
                                          Relayer delivers message
                                            ↓ messageProcess()
                                            ↓ Check: balanceOf(this) >= amount?
                                            ↓ safeTransfer(recipient, amount)
                                            ↓ User receives USDC from pool
```

The contract's token balance IS the available liquidity. Locked tokens from incoming bridges add to the pool. Released tokens subtract from it.

---

## Liquidity Management

:::danger Critical: Liquidity Must Be Pre-Funded
The destination contract **must hold enough tokens** to release before any user can bridge to that chain. If the pool doesn't have enough tokens, `messageProcess()` reverts with `InsufficientLiquidity`, the gateway emits an `Error` event, and the user's tokens **remain locked on the source chain** with no automatic release.
:::

### How Liquidity Works

- **Deposits**: Anyone can call `deposit()` to add tokens to the pool
- **Withdrawals**: Only the owner can call `withdraw()` to remove tokens
- **Incoming bridges** add to the pool (tokens locked from other chains increase the balance)
- **Outgoing releases** subtract from the pool

### Monitoring Recommendations

Liquidity pools can drain unexpectedly if bridge traffic is asymmetric (more users bridging TO a chain than FROM it). We strongly recommend:

1. **Set up balance monitoring** — watch `token.balanceOf(bridgeAddress)` on every destination chain
2. **Configure threshold alerts** — send SMS, email, or Slack notifications when liquidity drops below a safety threshold (e.g., 20% of target balance)
3. **Automate top-ups** — scripts that deposit additional tokens when balances get low
4. **Monitor the `Error` event** on the gateway contract — this fires when a release fails due to insufficient liquidity

### What Happens When Liquidity Runs Out

| Step | What happens |
|------|-------------|
| 1 | User locks tokens on source chain (succeeds) |
| 2 | Message is sent cross-chain (succeeds) |
| 3 | `messageProcess()` checks balance — not enough tokens |
| 4 | Function reverts with `InsufficientLiquidity` |
| 5 | Gateway catches the revert and emits `Error(txId, reason)` |
| 6 | Message is marked as processed (cannot be replayed) |
| 7 | Tokens remain locked on source chain |
| 8 | **Recovery requires manual intervention** — fund the destination pool and coordinate with VIA Labs, or the owner manually releases source tokens |

---

## Security Considerations

- **Owner can withdraw all liquidity** — including tokens that back locked assets from other chains. Use a **multisig or timelock** as the owner in production.
- **`deposit()` is permissionless** — anyone can add liquidity, but there is no per-depositor accounting. Only the owner can withdraw. Deposits are effectively donations to the pool.
- **Token addresses differ per chain** — USDC on Ethereum is a different contract than USDC on Polygon. Each deployment specifies its own token address at construction.

---

## Next Steps

- [Burn & Mint Token](/docs/examples/burn-mint-token) — for tokens you control (simpler, no liquidity needed)
- [Lock & Mint Token](/docs/examples/lock-mint-token) — bridge tokens you don't control without liquidity pools
- [SDK Reference](/docs/general/package) — full API documentation
