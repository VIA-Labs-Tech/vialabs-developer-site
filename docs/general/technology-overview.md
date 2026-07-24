---
sidebar_position: 1
---

# Technology Overview

VIA Labs enables **direct cross-chain smart contract communication**. Messages flow securely between chains using a multi-layered validation protocol powered by **VG-1 (VIA Gateway 1)**, our production infrastructure for cross-chain message routing.

---

## The Big Picture

Connect smart contracts on any blockchain to smart contracts on any other blockchain. A message sent from Chain A arrives on Chain B — carrying whatever payload your application needs.

<div className="diagram-container">
  <img src="/img/big-picture-c.svg" alt="Chain A to Chain B via VIA Labs Network" />
</div>

Any data that can be encoded can be sent cross-chain: token transfers, governance instructions, IoT sensor readings, medical records, enterprise system events, or real-world asset attestations.

---

## Architecture

VIA Labs deploys and maintains **ViaGatewayV1** contracts on all supported chains. Developers inherit from a base contract, `ViaIntegrationV1`, to connect their smart contracts to the gateway. There is no need to deploy or manage gateway infrastructure. VIA Labs uses a decentralized network of off-chain validator nodes to relay messages between blockchains. The system is designed for:

- **Security** — Up to three independent validation layers sign off on every message before execution
- **Speed** — Developers choose the number of block confirmations to wait before relay. Set to 0 for fastest delivery, or increase for additional protection against source chain block reorganizations
- **Flexibility** — Support for arbitrary message passing, not just token transfers
- **Universality** — 140+ EVM and non-EVM chains supported from a single integration

---

## How It Works

Cross-chain messaging follows four steps:

1. **Your contract calls `messageSend()`** — encodes the payload and sends it to the VIA Gateway on the source chain
2. **The VIA Gateway emits an event** — picked up by the validator network listening across all configured chains
3. **Validators verify and sign** — every configured security layer independently validates the message
4. **A relayer delivers the message** — the validated message is submitted to the VIA Gateway on the destination chain, which calls `messageProcess()` on your recipient contract

<div className="diagram-container">
  <img src="/img/how-it-works.svg" alt="Cross-chain message flow: Your Contract to VIA Gateway to Validators to Your Contract" />
</div>

---

## Security Model

VIA Labs supports a **three-layer security model**. The layers are functionally identical — each is an independent set of signers, and every signer validates messages the same way. What separates the layers is who runs the signers and who controls whether they're part of a project's configuration:

<div className="diagram-container">
  <img src="/img/security-model.svg" alt="Three-layer security model: VIA Layer, Chain Layer, Project Layer" />
</div>

| Layer             | Signers run by           |
| ----------------- | ------------------------ |
| **VIA Layer**     | VIA Labs                 |
| **Chain Layer**   | Chain-specific operators |
| **Project Layer** | Your team                |

Every layer is optional — which layers validate a project's messages depends entirely on configuration. The VIA Layer is enabled by default, and most projects start there. Projects that want additional, independently operated signatures can be configured for the Chain Layer and/or run their own Project Layer signers.

Signatures from every configured layer are verified **on-chain** by the destination Gateway contract before the message is forwarded to the recipient.

:::note
**Midnight:** layered signature validation is not yet available on Midnight — the chain's current architecture does not support the required on-chain signature verification. It will be enabled once signature support is added to the chain.
:::

Each configured layer has **veto power** — if any configured layer withholds its signature, the message is rejected. An external attacker must compromise signers from every configured layer simultaneously to forge a message.

### Message Delivery

Blockchains cannot natively communicate with each other — there is no way for a contract on Chain A to directly call a contract on Chain B. Cross-chain messaging works by emitting events on the source chain that are picked up by off-chain actors who deliver them to the destination.

VIA Labs operates a network of **relayers** that handle message delivery automatically. Relayers are distinct from validators/signers:

| Role                   | What they do                                                                                   | Who operates them                                                   |
| ---------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| **Validators/Signers** | Verify message integrity and sign attestations across the configured security layers           | VIA Labs, chain-specific operators, and optionally the project team |
| **Relayers**           | Deliver validated messages to the destination chain by submitting them to the Gateway contract | VIA Labs (enterprise projects can optionally run their own)         |

Relayers cannot forge or alter messages — they can only deliver messages that have been signed by the required validators. If a relayer submits an invalid message, the Gateway contract rejects it on-chain.

<div className="diagram-container">
  <img src="/img/message-delivery.svg" alt="Message delivery: a message from the source chain is signed by VIA, Chain, and Project signers, then delivered by relayers to the destination" />
</div>

Examples of invalid messages, and where the infrastructure stops each one:

<div className="diagram-container">
  <img src="/img/invalid-messages.svg" alt="Four scenarios and how they are stopped: a forged message fails the on-chain signature check at the destination Gateway; a stolen signer key can't clear the VIA Layer's 2-of-3 signature floor; a fully compromised VIA Layer is vetoed by the Project Layer's own signer; a source chain reorg is caught by the VIA Layer waiting for confirmations" />
</div>

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
