---
sidebar_label: VIALockerRelease
title: VIALockerRelease Reference
description: API reference for the VIALockerRelease lock-and-release bridge contract.
---

# VIALockerRelease

A cross-chain bridge that locks tokens on the source chain and releases from a pre-funded pool on the destination. Users receive the **original token** on both sides — no synthetics or wrapped versions.

**Use when you don't control the token** (USDC, WETH, etc.) and can manage liquidity on each destination chain.

For the full source code, see [Contract Source](/docs/general/contract-source). For the deployment walkthrough, see [Lock & Release Token](/docs/examples/lock-release-token).

**Inherits:** Ownable, [ViaIntegrationV1](/docs/general/ref-via-integration)

---

## Constructor

```solidity
constructor(address _token)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `_token` | `address` | The ERC20 token this bridge handles. Immutable after deployment. |

The token address can differ per chain (e.g., USDC has different addresses on Ethereum vs Polygon). Deployer becomes both `owner` and `projectOwner`.

---

## Functions

### bridge

```solidity
function bridge(
    bytes32 tokenRecipient,
    uint64 destChainId,
    uint256 amount
) external payable returns (uint256 txId);
```

Lock tokens from `msg.sender` and send a release message to the destination. Caller must have approved this contract first.

| Parameter | Type | Description |
|-----------|------|-------------|
| `tokenRecipient` | `bytes32` | Recipient on destination chain (left-padded). Use `_addressToBytes32()`. |
| `destChainId` | `uint64` | Destination chain ID |
| `amount` | `uint256` | Amount to bridge (in wei) |

Include `msg.value` for destination gas.

### deposit

```solidity
function deposit(uint256 amount) external;
```

Fund the liquidity pool on this chain. **Anyone can call** — not restricted to owner. Caller must have approved this contract. Destination chains must be funded before users can bridge to them.

### withdraw

```solidity
function withdraw(IERC20 tokenAddress, uint256 amount) external onlyOwner;
```

Withdraw tokens from the contract. Accepts any ERC20 address (not just the configured token), so it can recover accidentally-sent tokens too.

### messageProcess

```solidity
function messageProcess(
    uint256 txId, uint64 sourceChainId, bytes32 sender, bytes32 recipient,
    bytes memory onChainData, bytes memory offChainData, uint256 gasRefundAmount
) internal override;
```

Called automatically by the gateway. Decodes `(bytes32 tokenRecipient, uint256 amount)` from `onChainData` and releases tokens from the pool.

---

## Message Encoding

```solidity
// bridge() encodes:
abi.encode(bytes32 tokenRecipient, uint256 amount)

// messageProcess() decodes:
(bytes32 tokenRecipient, uint256 amount) = abi.decode(onChainData, (bytes32, uint256));
```

---

## Errors

| Error | When |
|-------|------|
| `ZeroAmount` | `bridge()` or `deposit()` called with `amount == 0` |
| `InvalidMessage` | Decoded amount < 1 or recipient is zero address |
| `InsufficientLiquidity` | Pool doesn't have enough tokens to release |
| `InsufficientBalance` | `withdraw()` amount exceeds contract balance |

### What happens when liquidity runs out

If `messageProcess()` reverts with `InsufficientLiquidity`:
1. The gateway emits an `Error` event
2. The message is marked as processed (cannot be replayed)
3. Tokens remain **locked on the source chain**
4. Recovery requires manual intervention — fund the pool and coordinate with VIA Labs, or the owner releases source tokens directly

---

## Liquidity

- **Monitor `token.balanceOf(bridgeAddress)`** on every destination chain
- **Watch the gateway `Error` event** — fires when a release fails
- **Use a multisig** as the owner in production — the owner can withdraw all liquidity
- **`deposit()` is permissionless** — no per-depositor accounting. Deposits are effectively donations to the pool.
