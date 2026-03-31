---
sidebar_position: 1
---

# Technology Overview

VIA Labs enables **direct cross-chain smart contract communication** without traditional bridges. Messages flow securely between chains using a multi-layered validation protocol powered by **VG-1 (VIA Gateway 1)**, our production infrastructure for cross-chain message routing.

---

## The Big Picture

At its core, VIA Labs connects smart contracts on any blockchain to smart contracts on any other blockchain. A message sent from Chain A arrives on Chain B — carrying whatever payload your application needs.

<div className="diagram-container">
  <img src="/img/big-picture-c.svg" alt="Chain A to Chain B via VIA Labs Network" />
</div>

Any data that can be encoded can be sent cross-chain: token transfers, governance instructions, IoT sensor readings, medical records, enterprise system events, or real-world asset attestations.

---

## Architecture

VIA Labs deploys and maintains **ViaGatewayV1** contracts on all supported chains. Developers inherit from `ViaIntegrationV1` in their smart contracts and connect to the gateway — there is no need to deploy or manage gateway infrastructure. VIA Labs uses a decentralized network of off-chain validator nodes to relay messages between blockchains. The system is designed for:

- **Security** — Three independent validation layers verify every message before execution
- **Speed** — Developers choose the number of block confirmations to wait before relay. Set to 0 for fastest delivery, or increase for additional protection against source chain block reorganizations
- **Flexibility** — Support for arbitrary message passing, not just token transfers
- **Universality** — 140+ EVM and non-EVM chains supported from a single integration

---

## How It Works

Cross-chain messaging follows four steps:

1. **Your contract calls `messageSend()`** — encodes the payload and sends it to the VIA Gateway on the source chain
2. **The VIA Gateway emits an event** — picked up by the validator network listening across all configured chains
3. **Validators verify and sign** — all three security layers independently validate the message
4. **A relayer delivers the message** — the validated message is submitted to the VIA Gateway on the destination chain, which calls `messageProcess()` on your recipient contract

<div className="diagram-container">
  <img src="/img/how-it-works.svg" alt="Cross-chain message flow: Your Contract to VIA Gateway to Validators to Your Contract" />
</div>

---

## Security Model

VIA Labs implements a **three-layer security model**. Every cross-chain message must pass through all three independent validation layers before it is executed on the destination chain. No single layer can authorize a message alone.

<div className="diagram-container">
  <img src="/img/security-model.svg" alt="Three-layer security model: VIA Layer, Chain Layer, Project Layer" />
</div>

| Layer             | Role                       | What It Validates                                                                     |
| ----------------- | -------------------------- | ------------------------------------------------------------------------------------- |
| **VIA Layer**     | Core protocol validation   | Signature authenticity, message integrity, and relay authorization by the VIA network |
| **Chain Layer**   | Native chain verification  | Source chain finality, transaction inclusion, and on-chain event confirmation         |
| **Project Layer** | Per-project access control | Whitelisted contracts, allowed chains, and project-specific security policies         |

All three signatures are verified **on-chain** by the destination Gateway contract before the message is forwarded to the recipient.

:::note
The **Chain Layer** and **Project Layer** are optional. The VIA Layer is always active by default. Integrating developers can enable the Chain Layer and/or Project Layer for additional security, but they are not required. Most projects start with just the VIA Layer and add additional layers as needed.
:::

Each configured layer has **veto power** — if two layers approve a message but the third rejects it, the message is rejected. An external attacker must compromise signers from all configured layers simultaneously to forge a message. No single point of failure exists.

### Message Delivery

Blockchains cannot natively communicate with each other — there is no way for a contract on Chain A to directly call a contract on Chain B. Cross-chain messaging works by emitting events on the source chain that are picked up by off-chain actors who deliver them to the destination.

VIA Labs operates a network of **relayers** that handle message delivery automatically. Relayers are distinct from validators/signers:

| Role                   | What they do                                                                                   | Who operates them                                                   |
| ---------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| **Validators/Signers** | Verify message integrity and sign attestations across the three security layers                | VIA Labs, chain-specific operators, and optionally the project team |
| **Relayers**           | Deliver validated messages to the destination chain by submitting them to the Gateway contract | VIA Labs (enterprise projects can optionally run their own)         |

Relayers cannot forge or alter messages — they can only deliver messages that have been signed by the required validators. If a relayer submits an invalid message, the Gateway contract rejects it on-chain.

---

## Use Cases

VIA Labs cross-chain messaging is designed for production-grade, enterprise applications across regulated and institutional environments.

| Category       | Use Case                | Description                                                                             |
| -------------- | ----------------------- | --------------------------------------------------------------------------------------- |
| **Finance**    | Tokenized Equities      | Issue equity tokens on one chain, enable compliant trading across multiple networks     |
| **Finance**    | Cross-Chain Stablecoins | Move stablecoins natively without wrapping, maintaining 1:1 backing                     |
| **Finance**    | Cross-Border Settlement | Route payment settlement across chain-specific corridors                                |
| **RWAs**       | Tokenized Real Estate   | Fractionalize property ownership and enable secondary trading across chains             |
| **RWAs**       | Supply Chain Finance    | Track and transfer tokenized invoices and trade finance instruments                     |
| **RWAs**       | Carbon Credit Markets   | Issue, transfer, and retire carbon credits across multiple registries                   |
| **Enterprise** | Private Oracles         | Connect proprietary data feeds or off-chain computation to smart contracts on any chain |
| **Enterprise** | Cross-Chain Identity    | Propagate KYC/AML attestations across chains without re-verification                    |
| **Enterprise** | Multi-Chain Governance  | Execute DAO proposals and voting across all chains where token holders reside           |
