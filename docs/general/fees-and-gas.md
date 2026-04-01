---
sidebar_position: 4
---

# Fees & Gas

How cross-chain messaging costs work, and what you need to configure.

---

## What You Pay to Send a Message

Every cross-chain message has **two costs**, both paid on the source chain at send time:

| Cost | What it is | Paid in | Paid by |
|------|-----------|---------|---------|
| **Source chain gas** | Normal transaction gas for calling `messageSend()` | Native token (ETH, MATIC, etc.) | User or calling contract |
| **Delivery fee** | Covers validation and delivery to the destination chain | Native token, included as `msg.value` | User or calling contract |

That's it for most chains. The `msg.value` you include with `messageSend()` covers everything on the destination side — VIA Labs handles execution there.

---

## Protocol Fee (ERC-20)

The VIA Gateway has a fee collector (`FeeCollectorV1`) that can charge an ERC-20 token fee per message (e.g., USDC). This is **separate** from the native gas costs above.

**Currently this fee is set to zero on all chains.** The mechanism exists but is not active.

If fees are ever enabled:
- Your contract auto-approves the fee token when you call `setMessageGateway()` — no manual approval needed
- Use `setMaxFee()` to cap the maximum fee per message — if the fee exceeds your cap, `messageSend()` reverts
- Setting `setMaxFee(0)` means no cap (accepts any fee amount)

---

## Gas Refunds (Destination Side)

When a relayer delivers your message on the destination chain, they spend gas. The gas refund system reimburses them from your contract's WETH balance.

**For all chains except Ethereum mainnet, VIA Labs handles destination gas automatically — you don't need to do anything.**

### Ethereum Mainnet Exception

Ethereum gas is 10-100x more expensive than L2s and spikes unpredictably. If your contract receives messages **on Ethereum mainnet**, you need to:

1. **Fund your contract with WETH** — the relayer is reimbursed from this balance
2. **Set a `maxGas` cap** — limits how much a relayer can claim per message

```solidity
// After deployment on Ethereum:
myContract.setMaxGas(0.05 ether);  // Cap at 0.05 WETH per message
// Then deposit WETH into your contract
```

### How Gas Refunds Work

The gas refund system is **trust-based**. The relayer self-reports how much gas they spent — there is no on-chain gas metering. The flow:

1. Relayer calls `process()` on the destination gateway with a `gasRefundAmount`
2. `GasRefundV1` checks the amount against your `maxGas` cap
3. If within cap, WETH is transferred from your contract to the relayer
4. If `maxGas` is exceeded, the entire delivery reverts with `GasMaxCap`

**`maxGas` is your only protection.** A typical message delivery costs 0.001–0.01 ETH in gas. Set `maxGas` to 2–5x your expected cost as a safety margin.

| `maxGas` value | Behavior |
|---------------|----------|
| `0` (default) | **No cap — dangerous.** Relayer can claim up to your entire WETH balance. |
| Non-zero | Reverts if claimed amount exceeds cap. |

---

## What Developers Need to Configure

| Function | When to use | Default |
|----------|------------|---------|
| `setMaxFee(amount)` | Cap the ERC-20 protocol fee per message | `0` (no cap) — safe while fees are zero |
| `setMaxGas(amount)` | Cap the gas refund per message | `0` (no cap) — **set this if receiving on Ethereum** |

Both are called on your contract (inherited from `ViaIntegrationV1`). See the [ViaIntegrationV1 reference](/docs/general/ref-via-integration) for details.

---

## Summary

| Scenario | What you pay | What you configure |
|----------|-------------|-------------------|
| **Send from any chain** | Source gas + `msg.value` for delivery | Nothing — just include `msg.value` |
| **Receive on L2/non-Ethereum** | Nothing | Nothing — VIA Labs covers destination gas |
| **Receive on Ethereum mainnet** | WETH from your contract balance | Fund WETH + `setMaxGas()` |

---

## Testnet

Testnet fees are negligible. See [Testnet Tokens](/docs/general/testnet-tokens) for faucet links.

---

## Acceptable Use

VIA Labs reserves the right to throttle or suspend processing for traffic that is inorganic, malicious, or places excessive burden on relay infrastructure. This applies to both testnet and mainnet.
