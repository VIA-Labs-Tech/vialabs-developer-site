---
sidebar_label: GasRefundV1
title: GasRefundV1 Reference
description: API reference for the GasRefundV1 trust-based gas refund contract.
---

# GasRefundV1

Reimburses relayers for gas costs when they deliver cross-chain messages on the destination chain. The refund is paid from the project contract's WETH balance.

**This is a trust-based system.** The relayer self-reports the gas amount — there is no on-chain gas metering. `maxGas` is the project's only protection against over-refunding.

For the fee mechanics overview, see [Fees & Gas](/docs/general/fees-and-gas).

---

## How Refunds Work

When the gateway calls `refund(project, relayer, gasRefundAmount)`:

1. **Resolve amount** — check if there's a whitelist override for this project
2. **Check cap** — if `maxGas[project]` is set and the amount exceeds it, revert
3. **Check balance** — project must have enough WETH
4. **Check allowance** — project must have approved this contract (done automatically by `setMessageGateway()`)
5. **Transfer** — send WETH to relayer (or unwrap to native ETH first)

### Refund Resolution

| `whitelist[project]` | Refund amount | Meaning |
|----------------------|---------------|---------|
| `0` (default) | Relayer's claimed `gasRefundAmount` | Trust the relayer |
| `9999` | `0` | No refund (FREE constant) |
| Any other value | That exact value | Fixed refund, ignores relayer's claim |

### maxGas Cap

| `maxGas[project]` | Behavior |
|-------------------|----------|
| `0` (default) | **No cap — dangerous.** Relayer can claim up to the project's full WETH balance. |
| Non-zero | Reverts with `GasMaxCap` if refund exceeds cap. |

**Always set `maxGas` to a reasonable value.** Typical delivery costs 0.001–0.01 ETH. Set to 2–5x expected cost.

---

## Delivery Modes

| Mode | `unwrap` setting | How relayer gets paid | Gas cost |
|------|-----------------|----------------------|----------|
| Direct | `false` | WETH transferred directly from project to relayer | Lower |
| Unwrapped | `true` | WETH transferred to GasRefundV1, unwrapped to ETH, sent to relayer | Higher |

Most relayers prefer native ETH (unwrapped mode).

---

## Functions (Owner)

| Function | Parameters | Description |
|----------|------------|-------------|
| `setGasToken` | `address addr` | Set the WETH address. Auto-approves for withdraw. |
| `setUnwrap` | `bool unwrap_` | `true` = unwrap WETH to ETH for relayers |
| `setGateway` | `address addr` | Update the authorized gateway address |
| `setWhitelist` | `address addr`, `uint256 amount` | Per-project fixed refund. `0` = use relayer's claim, `9999` = no refund |

## Functions (Project)

| Function | Parameters | Description |
|----------|------------|-------------|
| `setMaxGas` | `uint256 amount` | Cap the refund per message. Called by the project contract (`msg.sender`). `0` = no cap. |

## Functions (Gateway)

| Function | Parameters | Description |
|----------|------------|-------------|
| `refund` | `address recipient`, `address relayer`, `uint256 gasRefundAmount` | Reimburse relayer. Only callable by the gateway. |

## View Functions

| Function | Returns | Description |
|----------|---------|-------------|
| `getGasToken` | `address` | WETH address. Used by `ViaIntegrationV1.setMessageGateway()` for auto-approval. |

---

## Errors

| Error | When |
|-------|------|
| `CallerMismatch` | `refund()` called by non-gateway address |
| `GasMaxCap` | Refund exceeds `maxGas[project]` |
| `InsufficientBalance` | Project doesn't have enough WETH |
| `InsufficientAllowance` | Project hasn't approved enough WETH |
| `NotRefunded` | Native ETH transfer to relayer failed (unwrap mode) |

---

## WETH Approval

Developers don't manually approve WETH. When `ViaIntegrationV1.setMessageGateway()` is called, it automatically:

1. Queries `gateway.gasCollector()` to get this contract's address
2. Queries `gasCollector.getGasToken()` to get the WETH address
3. Calls `WETH.approve(gasCollector, type(uint256).max)`

---

## Security Notes

- Gas refund failures are currently **silently ignored** by the gateway — if `refund()` reverts, the message is still delivered
- The relayer has no on-chain gas verification — `maxGas` is the sole protection
- Setting `maxGas(0)` means a relayer can drain the entire WETH balance in one message
