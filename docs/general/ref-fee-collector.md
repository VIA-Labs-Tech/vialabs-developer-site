---
sidebar_label: FeeCollectorV1
title: FeeCollectorV1 Reference
description: API reference for the FeeCollectorV1 fee collection contract.
---

# FeeCollectorV1

Collects ERC-20 token fees from project contracts when they send cross-chain messages. Deployed and configured by VIA Labs — developers interact with it indirectly through `ViaIntegrationV1.setMaxFee()`.

**Currently fees are set to zero on all chains.** This contract exists as infrastructure for future fee models.

For the fee mechanics overview, see [Fees & Gas](/docs/general/fees-and-gas).

---

## How Fees Are Resolved

When `pay(sender)` is called by the gateway, the fee amount is resolved:

| `whitelist[sender]` | Fee charged | Meaning |
|---------------------|-------------|---------|
| `0` (default) | `feeAmount` (global default) | Standard rate |
| `1` to `9998` | That exact value | Custom rate for this sender |
| `9999` | `0` | Free pass (`FREE` constant) |
| `10000+` | That exact value | Custom rate |

If `maxFee[sender]` is set and the resolved fee exceeds it, the entire `send()` reverts with `FeeMaxCap`.

---

## Dual-Fee System

FeeCollectorV1 can collect two independent fees in a single `pay()` call:

### 1. ERC-20 Token Fee

- Collected via `safeTransferFrom(sender, beneficiary, amount)`
- Amount resolved by whitelist logic above
- Project auto-approves the token when calling `setMessageGateway()`

### 2. Native Gas Fee (Optional)

- Collected in native currency (ETH, MATIC, etc.) via `msg.value`
- Enabled per-sender via `sourceGasAmountWhitelist[sender] = true`
- Must be exact — `msg.value` must equal `sourceGasAmount`
- Sent to `beneficiary` via low-level call

Native gas fee is collected **before** the token fee. Both go to the same `beneficiary`.

---

## Functions (Owner)

| Function | Parameters | Description |
|----------|------------|-------------|
| `setAmount` | `uint256 amount` | Set the global default fee (in token smallest units) |
| `setToken` | `address addr` | Set the ERC-20 fee token (e.g., USDC) |
| `setBeneficiary` | `address addr` | Set where collected fees go |
| `setWhitelist` | `address addr`, `uint256 amount` | Per-sender custom fee. `0` = use default, `9999` = free |
| `setSourceGasAmount` | `uint256 amount` | Set native gas fee amount (in wei) |
| `setSourceGasWhitelist` | `address addr`, `bool enabled` | Enable/disable native gas fee for a sender |

## Functions (Project)

| Function | Parameters | Description |
|----------|------------|-------------|
| `setMaxFee` | `uint256 amount` | Cap the fee per message. Called by the project contract (`msg.sender`). `0` = no cap. |

## Functions (Gateway)

| Function | Parameters | Description |
|----------|------------|-------------|
| `pay` | `address sender` | Collect fees. Only callable by the gateway. |

---

## Errors

| Error | When |
|-------|------|
| `CallerMismatch` | `pay()` called by non-gateway address |
| `FeeMaxCap` | Resolved fee exceeds `maxFee[sender]` |
| `InvalidSourceGasFee` | `msg.value` doesn't match `sourceGasAmount` |
| `SourceGasFeeNotPaid` | Native gas fee transfer to beneficiary failed |

---

## Token Approval

Developers don't manually approve the fee token. When `ViaIntegrationV1.setMessageGateway()` is called, it automatically:

1. Queries `gateway.feeCollector()` to get this contract's address
2. Queries `feeCollector.feeToken()` to get the token address
3. Calls `feeToken.approve(feeCollector, type(uint256).max)`
