---
sidebar_position: 2
---

# SDK Reference

The VIA Labs SDK provides the base contract and core functions for cross-chain messaging. Your smart contract inherits from `ViaIntegrationV1` and connects to the VIA Gateway — infrastructure that VIA Labs deploys and maintains on all supported chains.

## Installation

Each supported chain has its own SDK package. Install the package for the chain you are building on:

```bash
# EVM chains (Ethereum, Polygon, Arbitrum, Base, etc.)
npm install @anthropic-ai/via-contracts
```

:::note
If your application integrates with multiple chains, you will need to install and deploy the appropriate package for each specific chain. Cardano (Aiken) and Midnight (Compact) packages are coming soon.
:::

## Core Functions

These are the two functions every cross-chain contract uses.

### `messageSend()`

Sends a cross-chain message from the current contract to a contract on another chain. Call this from your contract's public functions to initiate cross-chain communication.

```solidity
function messageSend(
    uint64 destChainId,
    bytes memory chainData,
    uint16 confirmations
) internal returns (uint256);
```

**Parameters:**
- `destChainId` — The chain ID of the destination network
- `chainData` — ABI-encoded payload to send
- `confirmations` — Number of block confirmations to wait before processing. This is developer-defined — you can set it to `0` for fastest delivery or any higher value for additional security. There is no required minimum.

**Returns:** A transaction ID that can be used to track the message.

:::note
The sender must include `msg.value` to cover destination chain gas. The function will revert if the gateway is not set or the destination chain is not configured.
:::

### `messageProcess()`

Override this function to handle incoming cross-chain messages. This is called automatically by the VIA Gateway when a validated message arrives from another chain.

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

**Parameters:**
- `txId` — Unique transaction identifier from the source chain
- `sourceChainId` — Chain ID where the message originated
- `sender` — Sender contract address on source chain (bytes32, left-padded)
- `recipient` — This contract's address (bytes32, left-padded)
- `onChainData` — Message payload that was included in signature validation
- `offChainData` — Additional data provided by the relayer (not signed)
- `gasRefundAmount` — Amount of gas refunded to the relayer

## Configuration

After deploying your contract, configure it to connect to the VIA network.

### `setMessageGateway()`

Connects your contract to the VIA Gateway on the current chain. This must be called before sending or receiving messages.

```solidity
function setMessageGateway(address gateway_) external onlyProjectOwner;
```

### `setMessageEndpoints()`

Configures the contract addresses on remote chains that your contract can communicate with. Messages from unmapped chains will be rejected.

```solidity
function setMessageEndpoints(
    uint64[] calldata chains,
    bytes32[] calldata endpoints
) external onlyProjectOwner;
```

**Parameters:**
- `chains` — Array of remote chain IDs (e.g., `[1, 137, 42161]` for Ethereum, Polygon, Arbitrum)
- `endpoints` — Array of your contract addresses on those chains (bytes32, left-padded)

### Constructor

```solidity
constructor(address projectOwner_);
```

The `projectOwner` has access to all configuration functions (`setMessageGateway`, `setMessageEndpoints`, etc.). For added security, you can use a multisig or governance contract as the project owner.

## Modifiers

### `onlyProjectOwner`

Restricts configuration functions to the project owner address set in the constructor.

### `onlyMessageGatewayAndEndpoint`

Validates that incoming messages are from the configured gateway and an expected source chain endpoint. Applied internally to `messageProcessFromGateway()` — you don't need to use this directly.

## Helper Functions

### `_addressToBytes32()` / `_bytes32ToAddress()`

Utility functions for converting between `address` and `bytes32` formats, needed when working with `setMessageEndpoints()` and message parameters.

```solidity
function _addressToBytes32(address addr) internal pure returns (bytes32);
function _bytes32ToAddress(bytes32 addr) internal pure returns (address);
```

## Example Usage

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@anthropic-ai/via-contracts/ViaIntegrationV1.sol";

contract MyCrossChainContract is ViaIntegrationV1 {
    constructor(address owner) ViaIntegrationV1(owner) {}

    function sendToOtherChain(uint64 chainId, string memory data) external payable {
        bytes memory payload = abi.encode(msg.sender, data);
        messageSend(chainId, payload, 1);
    }

    function messageProcess(
        uint256,
        uint64 sourceChainId,
        bytes32,
        bytes32,
        bytes memory onChainData,
        bytes memory,
        uint256
    ) internal override {
        (address sender, string memory data) = abi.decode(onChainData, (address, string));
        // Handle the received message
    }
}
```

## Deployment & Setup

### Hardhat

#### Configuration

<!-- TODO: Developer to add hardhat.config.ts example -->

#### Deployment Script

<!-- TODO: Developer to add deployment script -->

#### Post-Deployment Configuration

<!-- TODO: Developer to add setMessageGateway/setMessageEndpoints setup script -->

### Foundry

#### Configuration

<!-- TODO: Developer to add foundry.toml example -->

#### Deployment Script

<!-- TODO: Developer to add forge script example -->

#### Post-Deployment Configuration

<!-- TODO: Developer to add post-deployment configuration script -->

:::note
For complete examples and starter repos, visit the [GitHub organization](https://github.com/VIA-Labs-Tech).
:::
