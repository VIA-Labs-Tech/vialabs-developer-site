---
sidebar_position: 4
---

# Fees & Gas

Understanding the cost structure for cross-chain messaging with VIA Labs.

---

## Overview

VIA Labs charges **no protocol fee**. There is no fixed USDC charge, no subscription, and no token requirement. The only cost to send a cross-chain message is the **source chain gas**, which covers the operational cost of validating and delivering your message to the destination chain. Destination chain gas is handled by VIA Labs — integrating projects don't need to fund gas on destination chains.

<div className="diagram-container">
  <img src="/img/fees-overview-c.svg" alt="Fee flow overview" />
</div>

---

## Two-Cost Structure

Every cross-chain message incurs exactly **two gas costs**, both paid in the source chain's native token at the time of sending.

### 1. Source Chain Gas

The standard gas cost of executing your `messageSend()` transaction on the originating chain.

- Paid by the **user or calling contract** as part of the normal transaction
- Denominated in the **source chain's native token** (ETH, MATIC, AVAX, BNB, etc.)
- Varies based on source chain gas prices

### 2. Message Delivery Cost

A small amount of native gas included in your transaction to cover the cost of validating and delivering the message to the destination chain.

- Included as `msg.value` in the `messageSend()` call
- Denominated in the **source chain's native token**
- Covers validation, relay, and destination chain execution — handled entirely by VIA Labs
- Developers and end users don't need to hold tokens on the destination chain or manage gas there


### Ethereum Exception

For **all chains except Ethereum mainnet**, VIA Labs handles destination gas automatically — projects don't need to fund anything on the destination side.

**Ethereum is different.** Gas on Ethereum mainnet is 10–100x more expensive than Layer 2 chains and can spike unpredictably during periods of network congestion. This makes flat-rate subsidization impractical for Ethereum as a destination chain.

If your project receives cross-chain messages **on Ethereum mainnet**, you need to:

1. **Fund your Ethereum contract with WETH** (Wrapped ETH) — this is the balance relayers are reimbursed from
2. **Set a `maxGas` cap** via `setMaxGas()` — this limits how much WETH a relayer can claim per message

```
WETH Funding Flow (Ethereum Destination Only)
──────────────────────────────────────────────

1. Project owner deposits WETH into the project contract on Ethereum
2. A cross-chain message arrives from another chain
3. Relayer calls process() on the Ethereum gateway to deliver it
4. Relayer is reimbursed from the project contract's WETH balance
5. Project contract's WETH balance decreases

   Project Contract (Ethereum)
   ┌──────────────────────────┐
   │  WETH Balance: 0.5 ETH  │ ← Owner funds this
   │                          │
   │  maxGas: 0.05 ETH       │ ← Safety cap per message
   └──────────┬───────────────┘
              │ Relayer delivers message
              ▼
   Relayer receives ≤ 0.05 ETH  ← Capped by maxGas
```

:::tip
Monitor your contract's WETH balance on Ethereum. If it runs out, incoming messages will fail until you top it up. See [Interface Reference — IGasCollector](/docs/general/interfaces#igascollector) for details on `setMaxGas()`.
:::

---

## What Affects Cost

| Factor | Impact |
|--------|--------|
| **Source chain gas price** | High-traffic chains (Ethereum mainnet) cost more than L2s |
| **Destination chain gas price** | Affects the pre-paid amount required for relay execution |

---

## No Hidden Fees

| | VIA Labs |
|---|---|
| **Protocol fee** | None |
| **Token requirement** | None |
| **Payment currency** | Source chain native gas only |
| **Subscription** | None |
| **Payload surcharge** | None — same cost regardless of data size |
| **Value-based fee** | None — sending 1 token or 1 million costs the same |
| **Complexity surcharge** | None — complex contract logic doesn't increase cost |
| **Congestion markup** | None — destination chain congestion doesn't affect price |

---

## Fee Estimation

Gas estimates are calculated automatically when you call `messageSend()`. The function will revert if insufficient `msg.value` is provided to cover destination gas.

:::tip
For testnet development, fees are negligible. Use testnet faucets to get free tokens — see [Testnet Tokens](/docs/general/testnet-tokens).
:::

---

## Testnet Usage

Testnet transactions use testnet tokens and are effectively free. See [Testnet Tokens](/docs/general/testnet-tokens) for faucet links.

---

## Acceptable Use Policy

Access to the VIA Network infrastructure (relayers and RPC endpoints) is provided subject to acceptable usage limits. VIA Labs reserves the right to throttle or temporarily suspend processing for traffic patterns that are inorganic, malicious (e.g., spam attacks), or that place an excessive burden on the relay infrastructure relative to the gas fees collected. This policy applies to both Testnet and Mainnet environments to ensure stability for all network participants.

VIA Labs reserves the right to charge or limit usage in the event of malicious spam or abuse.
