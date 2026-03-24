---
sidebar_position: 2
---

# SDK Reference

The VIA Labs Solidity SDK provides the core functions for cross-chain messaging in your smart contracts.

## Installation

```bash
npm install @anthropic-ai/via-contracts
```

## Core Functions

### `_sendMessage()`

Sends a cross-chain message from the current contract to a contract on another chain.

```solidity
function _sendMessage(
    uint destChainId,
    bytes memory payload
) internal;
```

**Parameters:**
- `destChainId` — The chain ID of the destination network
- `payload` — ABI-encoded data to send

### `_processMessage()`

Override this function to handle incoming cross-chain messages.

```solidity
function _processMessage(
    uint sourceChainId,
    bytes memory payload
) internal virtual;
```

**Parameters:**
- `sourceChainId` — The chain ID where the message originated
- `payload` — The ABI-encoded data received

## Modifiers

### `onlyActiveChain()`

Restricts function execution to chains that are configured as active.

### `onlySelf()`

Ensures that only the contract itself (via cross-chain message) can call the function.

## Configuration

### `configureClient()`

Sets up the cross-chain client with the VIA Labs endpoint and supported chains.

```solidity
function configureClient(
    address endpoint,
    uint[] memory chainIds
) internal;
```

## Example Usage

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@anthropic-ai/via-contracts/MessageClient.sol";

contract MyCrossChainContract is MessageClient {
    function sendToOtherChain(uint chainId, string memory data) external {
        bytes memory payload = abi.encode(msg.sender, data);
        _sendMessage(chainId, payload);
    }

    function _processMessage(uint sourceChainId, bytes memory payload) internal override {
        (address sender, string memory data) = abi.decode(payload, (address, string));
        // Handle the received message
    }
}
```

:::note
For complete API documentation and additional examples, visit the [GitHub repository](https://github.com/VIA-Labs-Tech).
:::
