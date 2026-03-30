---
sidebar_position: 1
sidebar_label: Legal & Disclaimers
title: Legal & Disclaimers
description: Terms of use, liability limitations, and disclaimers for VIA Labs cross-chain infrastructure.
---

# Legal & Disclaimers

By using VIA Labs infrastructure, tools, documentation, or any component of the VIA Network, you acknowledge and agree to the following terms.

---

## No Guarantee of Message Delivery or Timing

VIA Labs does not guarantee that any particular cross-chain message will be relayed, delivered, confirmed, or executed on any destination network, nor that any such message will be processed within any particular time frame.

Cross-chain messaging depends on third-party networks, validators, RPC providers, and blockchain infrastructure outside of VIA Labs' direct control. Message delivery may be impacted by:

- Chain congestion or network outages
- Block reorganizations (reorgs) on source or destination chains
- Forks or consensus failures on connected networks
- Configuration changes to third-party infrastructure
- Failures of RPC providers or validator nodes

Developers are responsible for designing their contracts and applications to tolerate message delays, failures, retries, and out-of-order processing. Messages may not arrive in sequential order due to gas dynamics and other external factors. Appropriate safeguards should include idempotency checks, timeout handling, and retry mechanisms.

By using VIA Labs infrastructure, you accept that failures, delays, or duplications in message delivery are inherent risks of cross-chain communication and do not give rise to any claim against VIA Labs.

---

## Non-Custodial Nature

VIA Labs does not at any time take custody or control of any digital assets, private keys, or wallets belonging to developers, integrators, or end-users. All on-chain transactions and contract calls executed using the VIA Network are initiated and authorized by the developer, their integrators, or end-users, and are processed directly on the applicable blockchain(s).

Developers are solely responsible for:

- The security of their wallets, private keys, and access credentials
- The design, security, and behavior of smart contracts and applications they deploy or integrate with the VIA Network
- Any loss of assets or value resulting from bugs, vulnerabilities, misconfigurations, or logic errors in their contracts or systems

VIA Labs has no responsibility or liability for any such losses.

---

## Developer Responsibility

By integrating with VIA Labs infrastructure, developers accept full responsibility for:

- **Contract security** — ensuring deployed contracts are audited, tested, and free from vulnerabilities
- **Endpoint configuration** — correctly setting trusted peer contracts via `setMessageEndpoints()` on all chains
- **Safety caps** — configuring appropriate `maxFee` and `maxGas` limits to protect their contracts
- **Liquidity management** — maintaining sufficient balances for lock-release bridges and WETH funding on Ethereum
- **Error handling** — designing applications to handle failed messages, including cases where tokens are burned or locked but the destination message fails
- **Access control** — securing the `projectOwner` key and using multisigs or timelocks where appropriate

---

## Limitation of Liability

The VIA Network is permissionless infrastructure. By using it, you acknowledge and agree that:

- **VIA Labs is not liable** for any direct, indirect, incidental, special, consequential, exemplary, or punitive damages arising from the use of VIA Labs infrastructure, including but not limited to loss of funds, lost profits, lost revenues, loss of data, or business interruption
- **There are no refunds, clawbacks, or compensation** for on-chain losses, trading losses, failed messages, or any other damages arising from the use of the VIA Network
- **Use is entirely at your own risk** — VIA Labs provides infrastructure on an "as-is" and "as-available" basis with no warranties of any kind, express or implied

This limitation applies regardless of the cause — whether arising from the VIA Network's operation, downtime, unavailability, message failures, smart contract bugs, blockchain reorgs, validator failures, or any other cause whatsoever.

---

## Acceptable Use Policy

Access to the VIA Network infrastructure (relayers and RPC endpoints) is provided subject to acceptable usage limits. VIA Labs reserves the right to throttle or temporarily suspend processing for traffic patterns that are inorganic, malicious (e.g., spam attacks), or that place an excessive burden on the relay infrastructure relative to the gas fees collected.

This policy applies to both Testnet and Mainnet environments to ensure stability for all network participants. VIA Labs reserves the right to charge or limit usage in the event of malicious spam or abuse.

See [Fees & Gas](/docs/general/fees-and-gas#acceptable-use-policy) for the complete Acceptable Use Policy.

---

## Permissionless Infrastructure

The VIA Network operates as permissionless cross-chain messaging infrastructure. VIA Labs does not control, approve, or endorse any specific project, token, or application built using its protocol. Developers are solely responsible for compliance with applicable laws, regulations, and licensing requirements in their respective jurisdictions.

---

## Changes to These Terms

VIA Labs reserves the right to update these terms at any time. Continued use of VIA Labs infrastructure after changes are posted constitutes acceptance of the updated terms.

---

## Contact

For questions about these terms, reach out via [Discord](https://discord.gg/h4rBhukkWz) or visit [vialabs.tech](https://vialabs.tech).
