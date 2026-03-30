---
sidebar_position: 3
sidebar_label: Interface Reference
title: Interface Reference
description: Solidity interfaces for VIA Labs cross-chain contracts — IViaGatewayV1, IViaIntegrationV1, IFeeCollector, IGasCollector.
---

# Interface Reference

The VIA Labs protocol defines a set of Solidity interfaces that standardize how contracts communicate. These interfaces ensure that project contracts interact with the gateway through a stable API — enabling upgrades to the underlying implementation without changing project contracts.

---

## IViaGatewayV1

The gateway interface used by `ViaIntegrationV1` to send messages and configure project-level settings.

### Messaging

#### `send()`

```solidity
function send(
    bytes32 recipient,
    uint64 destChainId,
    bytes calldata chainData,
    uint16 confirmations
) external payable returns (uint256);
```

Send a cross-chain message. Collects fees, assigns a unique transaction ID, and emits `SendRequested` for the relayer network.

**Called by:** `ViaIntegrationV1.messageSend()` — project contracts never call this directly.

### Project Configuration

#### `setProjectSigner(bool enabled)`

Register or deregister a Project-layer signer. Called through `ViaIntegrationV1.setProjectSigner()`.

#### `setProjectRelayer(bool enabled)`

Register or deregister a Project-layer relayer. Called through `ViaIntegrationV1.setProjectRelayer()`.

#### `setRequiredProjectSignerCounts(uint256 amount)`

Set the number of Project-layer signatures required for your project. Called through `ViaIntegrationV1.setRequiredProjectSignerCounts()`.

#### `setIsProjectRelayerRestricted(bool restricted)`

Restrict message delivery to project-specific relayers only. Called through `ViaIntegrationV1.setIsProjectRelayerRestricted()`.

### Getters

#### `feeCollector() → address`

Returns the fee collector contract address. Used internally by `setMessageGateway()` to auto-approve fee tokens.

#### `gasCollector() → address`

Returns the gas refund collector contract address. Used internally by `setMessageGateway()` to auto-approve gas tokens.

---

## IViaIntegrationV1

The delivery interface — defines the single function the gateway calls to deliver messages to project contracts.

```solidity
function messageProcessFromGateway(
    uint256 txId,
    uint64 sourceChainId,
    bytes32 sender,
    bytes32 recipient,
    bytes memory onChainData,
    bytes memory offChainData,
    uint256 gasReimbursementAmount
) external;
```

This is intentionally minimal. The gateway doesn't need to know anything about your business logic — it just needs a standard way to deliver messages. Any contract that implements this interface can receive cross-chain messages through VIA Gateway.

**Called by:** `ViaGatewayV1.processCall()` after full signature validation and gas refund.

:::note
You don't implement this interface directly. `ViaIntegrationV1` implements it and adds security checks (gateway validation, endpoint verification) before calling your `messageProcess()` override.
:::

---

## IFeeCollector

The fee collection interface. This controls the **ERC-20 token fee** (e.g., USDC), which is separate from the native gas costs paid by the message sender.

#### `setMaxFee(uint256 amount)`

Set a maximum cap on the ERC-20 token fee your project will pay per message. This does NOT affect the native gas fee paid by the message sender — it only caps the optional ERC-20 protocol fee.

:::note
VIA Labs is currently setting this fee to zero on all chains. The `setMaxFee` function exists as a safety mechanism in case fees are ever re-enabled. Most developers do not need to call this.
:::

**Called through:** `ViaIntegrationV1.setMaxFee()`

---

## IGasCollector

The gas refund interface. This controls how relayers are reimbursed for destination chain gas costs from the project contract's WETH balance.

#### `setMaxGas(uint256 amount)`

Set a maximum cap on the gas refund a relayer can claim per message from your contract's WETH balance. `0` = no cap.

:::note
For most chains, VIA Labs handles destination gas automatically and projects don't need WETH in their contracts. The exception is **Ethereum mainnet** — projects receiving messages on Ethereum may need to fund WETH and configure this cap. See [Fees & Gas](/docs/general/fees-and-gas) for details.
:::

**Called through:** `ViaIntegrationV1.setMaxGas()`

---

## Related

- [SDK Reference](/docs/general/package) — the full `ViaIntegrationV1` API
- [Technology Overview](/docs/general/technology-overview) — architecture and security model
