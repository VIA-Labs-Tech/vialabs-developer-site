---
sidebar_position: 2
---

# SDK Reference

The VIA Labs SDK provides the base contract and core functions for cross-chain messaging. Your smart contract inherits from `ViaIntegrationV1` and connects to the VIA Gateway — infrastructure that VIA Labs deploys and maintains on all supported chains.

## Installation

Each supported chain has its own SDK package. Install the package for the chain you are building on:

```bash
# EVM chains (Ethereum, Polygon, Arbitrum, Base, etc.)
npm install @vialabs-tech/contracts
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
- `offChainData` — Additional context provided during message delivery
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

### `setMaxFee()`

Sets a safety cap on the maximum fee your contract will pay per message. Reverts the send if the fee exceeds this cap.

```solidity
function setMaxFee(uint256 amount) external onlyProjectOwner;
```

**Parameters:**
- `amount` — Maximum fee in token smallest units. `0` = no cap.

### `setMaxGas()`

Sets a safety cap on the maximum gas refund per message.

```solidity
function setMaxGas(uint256 amount) external onlyProjectOwner;
```

**Parameters:**
- `amount` — Maximum gas refund in wei. `0` = no cap.

### `transferProjectOwnership()`

Transfers project ownership to a new address. The new owner immediately gains all `onlyProjectOwner` permissions. This is a single-step transfer — ensure the address is correct before calling.

```solidity
function transferProjectOwnership(address newOwner) external onlyProjectOwner;
```

**Parameters:**
- `newOwner` — Address of the new project owner (cannot be zero address)

:::info Additional Security Option
For additional security, a multisig or governance contract can be used as the project owner address.
:::

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

import "@vialabs-tech/contracts/ViaIntegrationV1.sol";

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

## Advanced Configuration

These functions are optional and typically used by enterprise projects that want additional control over their security and relay infrastructure.

### `setSignerWhitelist()`

Add or remove addresses from the project signer whitelist. Whitelisted addresses can register as Project-layer signers, adding a third validation layer on top of VIA and Chain layers.

```solidity
function setSignerWhitelist(address addr, bool enabled) external onlyProjectOwner;
```

### `setRequiredProjectSignerCounts()`

Set the number of Project-layer signatures required for your project. Set to `0` to disable project-layer validation (rely on VIA and Chain layers only).

```solidity
function setRequiredProjectSignerCounts(uint256 amount) external onlyProjectOwner;
```

### `setRelayerWhitelist()`

Add or remove addresses from the project relayer whitelist.

```solidity
function setRelayerWhitelist(address addr, bool enabled) external onlyProjectOwner;
```

### `setIsProjectRelayerRestricted()`

When enabled, only project-specific relayers can deliver messages for your project.

```solidity
function setIsProjectRelayerRestricted(bool restricted) external onlyProjectOwner;
```

## Deployment & Setup

### Hardhat

#### Configuration

Add the VIA Labs contracts to your `hardhat.config.ts`:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    amoy: {
      url: process.env.AMOY_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};

export default config;
```

#### Deployment Script

Create `scripts/deploy.ts`:

```typescript
import { ethers } from "hardhat";

async function main() {
  const Contract = await ethers.getContractFactory("YourContract");
  const contract = await Contract.deploy(/* constructor args */);
  await contract.waitForDeployment();
  console.log("Deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

#### Post-Deployment Configuration

After deploying on each chain, run these configuration calls:

```typescript
import { ethers } from "hardhat";

async function configure() {
  const contract = await ethers.getContractAt("YourContract", "DEPLOYED_ADDRESS");

  // 1. Connect to VIA Gateway
  await contract.setMessageGateway("GATEWAY_ADDRESS");

  // 2. Set trusted endpoints on remote chains
  const chains = [80002];  // e.g., Amoy chain ID
  const endpoints = [
    ethers.zeroPadValue("REMOTE_CONTRACT_ADDRESS", 32)
  ];
  await contract.setMessageEndpoints(chains, endpoints);

  console.log("Configuration complete");
}

configure().catch(console.error);
```

### Foundry

#### Configuration

Add dependencies to `foundry.toml`:

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib", "node_modules"]
solc_version = "0.8.17"
```

#### Deployment Script

Create `script/Deploy.s.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "forge-std/Script.sol";
import "../src/YourContract.sol";

contract DeployScript is Script {
    function run() external {
        vm.startBroadcast();
        YourContract c = new YourContract(/* constructor args */);
        console.log("Deployed to:", address(c));
        vm.stopBroadcast();
    }
}
```

```bash
forge script script/Deploy.s.sol --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast
```

#### Post-Deployment Configuration

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "forge-std/Script.sol";

interface IConfigurable {
    function setMessageGateway(address gateway_) external;
    function setMessageEndpoints(uint64[] calldata chains, bytes32[] calldata endpoints) external;
}

contract ConfigureScript is Script {
    function run() external {
        vm.startBroadcast();
        IConfigurable c = IConfigurable(DEPLOYED_ADDRESS);
        c.setMessageGateway(GATEWAY_ADDRESS);

        uint64[] memory chains = new uint64[](1);
        bytes32[] memory endpoints = new bytes32[](1);
        chains[0] = 80002; // Amoy
        endpoints[0] = bytes32(uint256(uint160(REMOTE_CONTRACT_ADDRESS)));
        c.setMessageEndpoints(chains, endpoints);

        vm.stopBroadcast();
    }
}
```

:::note
For complete examples and starter repos, visit the [GitHub organization](https://github.com/VIA-Labs-Tech).
:::
