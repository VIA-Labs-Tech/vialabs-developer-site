---
sidebar_position: 6
sidebar_label: "FAQ"
description: "Frequently asked questions about VIA Labs cross-chain messaging — getting started, gas fees, security, configuration, and troubleshooting."
keywords: [cross-chain, messaging, FAQ, VIA Labs, multi-chain, interoperability, cross-chain messaging, smart contract, blockchain]
---

import Head from '@docusaurus/Head';

<Head>
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is VIA Labs?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "VIA Labs provides cross-chain communication infrastructure that enables direct smart contract messaging between blockchains. Your contract on one chain sends a message — data, value, instructions — and your contract on another chain receives and processes it."
          }
        },
        {
          "@type": "Question",
          "name": "How do I send a cross-chain message?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Copy the ViaIntegrationV1 base contract into your project, inherit from it, call messageSend() to send messages to other chains, and implement messageProcess() to handle incoming messages."
          }
        },
        {
          "@type": "Question",
          "name": "What programming languages does VIA Labs support?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "VIA Labs currently supports Solidity for EVM chains. Support for Aiken (Cardano) and Compact (Midnight) is in development."
          }
        },
        {
          "@type": "Question",
          "name": "How many blockchain networks does VIA Labs support?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "VIA Labs supports 140+ public and private networks."
          }
        },
        {
          "@type": "Question",
          "name": "How are cross-chain fees calculated?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The sender pays for both source and destination chain gas in a single transaction on the source chain. There are no separate protocol fees — all costs are bundled into native gas. The one exception is Ethereum: contracts receiving messages on Ethereum must hold WETH to cover destination gas."
          }
        },
        {
          "@type": "Question",
          "name": "Are there any protocol fees for cross-chain messaging?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No separate protocol fees. All costs are covered by the native gas you pay when sending a message. This includes both chain execution costs and network operational costs — a single, transparent fee with no hidden charges."
          }
        },
        {
          "@type": "Question",
          "name": "How long does a cross-chain message take?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Between 5 seconds and 5 minutes depending on block time and finality. Most transactions settle within 1 minute after being submitted on the source chain."
          }
        },
        {
          "@type": "Question",
          "name": "How are cross-chain messages validated and secured?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "VIA Labs uses a three-layer security model. Every message must be independently validated by the VIA Layer (protocol-level validation), Chain Layer (native chain verification), and Project Layer (per-project access control defined by the developer)."
          }
        }
      ]
    })}
  </script>
</Head>

# FAQ

## Getting Started

### What is VIA Labs?

VIA Labs provides cross-chain communication infrastructure that enables direct smart contract messaging between blockchains. Your contract on one chain sends a message — data, value, instructions — and your contract on another chain receives and processes it.

### How do I send a cross-chain message?

1. Copy the VIA Labs base contract into your project (see [Contract Source](/docs/general/contract-source))
2. Inherit the `ViaIntegrationV1` base contract in your smart contract
3. Call `messageSend()` to send messages to other chains
4. Implement `messageProcess()` to handle incoming messages

See the [Hello World quickstart](/docs/examples/hello-world) for a complete walkthrough.

### What programming languages are supported?

VIA Labs currently supports **Solidity** for EVM chains. Support for **Aiken** (Cardano) and **Compact** (Midnight) is in development.

### How many networks are supported?

VIA Labs supports **140+ public and private networks**. See the [Supported Networks](/docs/general/supported-networks) page for the full list.

## Gas & Pricing

### How are cross-chain fees calculated?

The sender pays for both source and destination chain gas in a single transaction on the source chain. There are no separate protocol fees — all costs are bundled into native gas. See [Fees & Gas](/docs/general/fees-and-gas) for detailed breakdowns.

:::note Ethereum Exception
When receiving cross-chain messages **on Ethereum**, the developer's deployed contract must hold wrapped ETH (WETH) to cover destination gas costs. This is specific to Ethereum only — on all other chains, the source gas fees cover destination execution automatically.
:::

### Who pays for destination chain gas?

The sender pre-pays destination chain gas as part of the source chain transaction. The `messageSend()` function automatically estimates the required amount. The protocol handles execution on the destination chain.

### Are there any protocol fees?

No separate protocol fees. All costs are covered by the native gas you pay when sending a message. This includes both chain execution costs and network operational costs — a single, transparent fee with no hidden charges.

## Configuration

### Can I send arbitrary data cross-chain?

Yes. The `messageSend()` function accepts any ABI-encoded payload. You can send tokens, NFT metadata, strings, structs, sensor data, oracle feeds, governance votes, or any data your application needs.

### Can I restrict which chains my contract communicates with?

Your contract can only communicate with contracts that you have explicitly deployed and configured. When you call `setMessageEndpoints()`, you define exactly which contract addresses on which chains are authorized to send and receive messages. No other contracts can interact with yours — cross-chain communication is restricted to the endpoints you configure.

### Do I need to deploy on every chain I want to communicate with?

You need a contract deployed on each chain you want to send messages to or receive messages from. Each deployment is configured to recognize its counterparts on other chains via `setMessageEndpoints()`.

## Security

### How are cross-chain messages validated and secured?

VIA Labs uses a three-layer security model. Every message must be independently validated by:

1. **VIA Layer** — Protocol-level validation by the VIA network
2. **Chain Layer** — Native chain verification using on-chain data
3. **Project Layer** — Per-project access control defined by the developer

A message is only executed on the destination chain after passing all three layers. See the [Technology Overview](/docs/general/technology-overview) for details.

### Has the protocol been audited?

For the latest security information and audit reports, visit the [VIA Labs main site](https://vialabs.tech).

## Troubleshooting

### How long does a cross-chain message take?

Between 5 seconds and 5 minutes depending on block time and finality. Most transactions settle within 1 minute after being submitted on the source chain.

### My message hasn't arrived. What should I check?

1. Verify the source transaction was confirmed on-chain
2. Check that both contracts are configured with the appropriate chain IDs
3. Ensure the destination contract has the correct permissions set
4. Visit [Troubleshooting](/docs/general/troubleshooting) for debugging steps, or check your transaction on [VIA Scan](https://scan.vialabs.tech)

### Can a message fail on the destination chain?

Yes. If the destination contract reverts (e.g., due to a logic error, insufficient permissions, or an incorrect payload), the message will not be processed. Check your contract's `messageProcess()` implementation for potential revert conditions.
