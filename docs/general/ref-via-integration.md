---
sidebar_label: ViaIntegrationV1
title: ViaIntegrationV1 Reference
description: API reference for the ViaIntegrationV1 base contract — functions, parameters, errors.
---

# ViaIntegrationV1

The abstract base contract your project inherits from. It connects to the VIA Gateway, manages endpoint configuration, and routes cross-chain messages.

For the full source code, see [Contract Source](/docs/general/contract-source).

---

## Messaging

These are the two functions you use in your contract.

### messageSend

Send a cross-chain message. Call this from your contract's public functions.

```solidity
function messageSend(
    uint64 destChainId,
    bytes memory chainData,
    uint16 confirmations
) internal returns (uint256 txId);
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `destChainId` | `uint64` | Chain ID of the destination network |
| `chainData` | `bytes` | ABI-encoded payload |
| `confirmations` | `uint16` | Block confirmations before processing. `0` = fastest, higher = safer. |

**Returns** `uint256 txId` — unique identifier for tracking the message.

The caller must include `msg.value` to cover destination chain gas. Reverts with `AddressZero` if the gateway isn't set, or `DestinationChainNotSet` if the destination chain has no endpoint.

### messageProcess

Override this to handle incoming messages. Called automatically by the gateway after validation.

```solidity
function messageProcess(
    uint256 txId,
    uint64 sourceChainId,
    bytes32 sender,
    bytes32 recipient,
    bytes memory onChainData,
    bytes memory offChainData,
    uint256 gasRefundAmount
) internal virtual;
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `txId` | `uint256` | Transaction ID from the source chain |
| `sourceChainId` | `uint64` | Chain ID where the message originated |
| `sender` | `bytes32` | Source contract address (left-padded) |
| `recipient` | `bytes32` | This contract's address (left-padded) |
| `onChainData` | `bytes` | The payload from `messageSend()` |
| `offChainData` | `bytes` | Additional relayer-provided data |
| `gasRefundAmount` | `uint256` | Gas refunded to the relayer |

---

## Configuration

All configuration functions are restricted to `onlyProjectOwner`.

### setMessageGateway

```solidity
function setMessageGateway(address gateway_) external onlyProjectOwner;
```

Connect to the VIA Gateway on this chain. **Must be called before sending or receiving.** Automatically queries the gateway for fee/gas collector addresses and approves their tokens.

### setMessageEndpoints

```solidity
function setMessageEndpoints(
    uint64[] calldata chains,
    bytes32[] calldata endpoints
) external onlyProjectOwner;
```

Map remote chain IDs to your contract addresses on those chains. Messages from unmapped chains are rejected.

| Parameter | Type | Description |
|-----------|------|-------------|
| `chains` | `uint64[]` | Remote chain IDs (e.g., `[1, 137, 42161]`) |
| `endpoints` | `bytes32[]` | Your contract addresses on those chains (left-padded) |

### setMaxFee

```solidity
function setMaxFee(uint256 amount) external onlyProjectOwner;
```

Cap the ERC-20 protocol fee per message. `0` = no cap. Currently fees are zero on all chains.

### setMaxGas

```solidity
function setMaxGas(uint256 amount) external onlyProjectOwner;
```

Cap the gas refund a relayer can claim per message. `0` = no cap. Only relevant for Ethereum mainnet destinations — see [Fees & Gas](/docs/general/fees-and-gas).

### transferProjectOwnership

```solidity
function transferProjectOwnership(address newOwner) external onlyProjectOwner;
```

Single-step, immediate transfer. The new owner gets all `onlyProjectOwner` permissions. Cannot be set to zero address.

---

## Advanced

Optional functions for enterprise projects that want additional control over security and relay infrastructure.

### setSignerWhitelist

```solidity
function setSignerWhitelist(address addr, bool enabled) external onlyProjectOwner;
```

Add/remove addresses from the project signer whitelist. Whitelisted addresses can register as Project-layer signers.

### setRequiredProjectSignerCounts

```solidity
function setRequiredProjectSignerCounts(uint256 amount) external onlyProjectOwner;
```

Set required project-layer signatures. `0` = disabled (rely on VIA and Chain layers only).

### setRelayerWhitelist

```solidity
function setRelayerWhitelist(address addr, bool enabled) external onlyProjectOwner;
```

Add/remove project-specific relayers.

### setIsProjectRelayerRestricted

```solidity
function setIsProjectRelayerRestricted(bool restricted) external onlyProjectOwner;
```

When `true`, only project-whitelisted relayers can deliver messages for your project.

---

## Helpers

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `_addressToBytes32` | `address addr` | `bytes32` | Convert address to bytes32 (left-padded) |
| `_bytes32ToAddress` | `bytes32 addr` | `address` | Convert bytes32 back to address |

---

## Errors

| Error | When |
|-------|------|
| `AddressZero` | Gateway not set, or `transferProjectOwnership` to zero address |
| `DestinationChainNotSet` | No endpoint configured for the destination chain |
| `InvalidLength` | `chains` and `endpoints` arrays have different lengths |
| `NotOwner` | Caller is not `projectOwner` |
| `NotGateway` | Incoming message not from the configured gateway |
| `InvalidSender` | Incoming message from an unrecognized source endpoint |
| `NotAuthorized` | Caller not in relayer/signer whitelist |
