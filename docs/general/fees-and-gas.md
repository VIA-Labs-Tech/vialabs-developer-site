---
sidebar_position: 4
---

# Fees & Gas

Understanding the cost structure for cross-chain messaging with VIA Labs.

---

## Overview

VIA Labs charges **no protocol fee**. There is no fixed USDC charge, no subscription, and no token requirement. You only pay the native gas costs of the blockchains you use.

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'fontSize': '18px'}}}%%
flowchart LR
    subgraph SRC["⛓️ Source Chain"]
        C1["📝 Your Contract<br/>calls messageSend()"]
    end

    subgraph FEES["💰 What You Pay"]
        direction TB
        F1["⛽ <b>Source Gas</b><br/>Paid in native token"]
        F2["⛽ <b>Destination Gas</b><br/>Pre-paid in native token"]
    end

    subgraph DST["⛓️ Destination Chain"]
        C2["📝 Your Contract<br/>messageProcess() runs"]
    end

    C1 --> F1 & F2
    F1 -. "covers source tx" .-> SRC
    F2 -. "covers relay" .-> C2

    style SRC fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#e2e8f0
    style DST fill:#1e293b,stroke:#8b5cf6,stroke-width:2px,color:#e2e8f0
    style FEES fill:#1e293b,stroke:#f59e0b,stroke-width:2px,color:#e2e8f0
    style C1 fill:#0f172a,stroke:#334155,color:#93c5fd
    style C2 fill:#0f172a,stroke:#334155,color:#c4b5fd
    style F1 fill:#0f172a,stroke:#334155,color:#fcd34d
    style F2 fill:#0f172a,stroke:#334155,color:#fcd34d
```

---

## Two-Cost Structure

Every cross-chain message incurs exactly **two gas costs**, both paid in the source chain's native token at the time of sending.

### 1. Source Chain Gas

The standard gas cost of executing your `messageSend()` transaction on the originating chain.

- Paid by the **user or calling contract** as part of the normal transaction
- Denominated in the **source chain's native token** (ETH, MATIC, AVAX, BNB, etc.)
- Varies based on payload size and source chain gas prices

### 2. Destination Chain Gas

The gas cost of executing the relay transaction on the destination chain, estimated and collected upfront.

- Included as `msg.value` in the `messageSend()` call
- Denominated in the **source chain's native token** (automatically converted)
- Covers the validator's cost of calling the Gateway contract on the destination chain

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'fontSize': '18px'}}}%%
flowchart TB
    USER["👤 User / dApp"] --> CALL["📝 messageSend()"]

    CALL --> GAS1["⛽ Source Gas<br/>used by source tx"]
    CALL --> GAS2["💎 msg.value<br/>pre-pays destination gas"]

    GAS1 --> SRC["→ Source chain validators"]
    GAS2 --> RELAY["→ VIA relay for<br/>destination execution"]

    style USER fill:#1e293b,stroke:#64748b,stroke-width:1px,color:#e2e8f0
    style CALL fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#93c5fd
    style GAS1 fill:#0f172a,stroke:#f59e0b,stroke-width:1px,color:#fcd34d
    style GAS2 fill:#0f172a,stroke:#f59e0b,stroke-width:1px,color:#fcd34d
    style SRC fill:#0f172a,stroke:#334155,stroke-width:1px,color:#94a3b8
    style RELAY fill:#0f172a,stroke:#334155,stroke-width:1px,color:#94a3b8
```

---

## What Affects Cost

| Factor | Impact |
|--------|--------|
| **Payload size** | Larger `bytes` payloads cost more gas to encode and decode |
| **Source chain gas price** | High-traffic chains (Ethereum mainnet) cost more than L2s |
| **Destination chain gas price** | Affects the `msg.value` required for relay execution |
| **Destination chain congestion** | Spikes in destination gas prices may increase relay cost |
| **Contract logic complexity** | More complex `messageProcess()` logic uses more destination gas |

---

## No Hidden Fees

| | VIA Labs | Traditional Bridges |
|---|---|---|
| **Protocol fee** | None | Often 0.1–0.5% of value |
| **Token requirement** | None | Many require holding/staking a protocol token |
| **Payment currency** | Source chain native gas only | Often requires specific tokens (USDC, protocol token) |
| **Subscription** | None | Some charge monthly/annual fees |

---

## Fee Estimation

Gas estimates are calculated automatically when you call `messageSend()`. The function will revert if insufficient `msg.value` is provided to cover destination gas.

:::tip
For testnet development, fees are negligible. Use testnet faucets to get free tokens — see [Testnet Tokens](/docs/general/testnet-tokens).
:::

---

## Testnet Usage

Testnet transactions use testnet tokens and are effectively free. See [Testnet Tokens](/docs/general/testnet-tokens) for faucet links.
