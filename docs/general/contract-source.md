---
sidebar_position: 1
sidebar_label: Contract Source
title: Contract Source
description: Copy the ViaIntegrationV1 base contract and required interfaces into your project.
---

# Contract Source

To build with VIA Labs, your contract inherits from **ViaIntegrationV1** — an abstract Solidity contract that handles gateway connections, message routing, and security. It gives you two functions:

- **`messageSend()`** — send data to a contract on another chain
- **`messageProcess()`** — receive data from a contract on another chain (you override this)

For the full API, see the [ViaIntegrationV1 reference](/docs/general/ref-via-integration).

ViaIntegrationV1 has 4 interface dependencies that must exist in the same folder for it to compile. You don't interact with these directly — they're internal plumbing between your contract and the VIA Gateway.

## Setup

Create a `contracts/via/` folder in your project and copy in **5 files**:

```
contracts/
├── via/
│   ├── ViaIntegrationV1.sol       ← the contract you inherit
│   ├── IViaGatewayV1.sol          ← dependency (gateway interface)
│   ├── IViaIntegrationV1.sol      ← dependency (delivery interface)
│   ├── IFeeCollector.sol          ← dependency (fee interface)
│   └── IGasCollector.sol          ← dependency (gas interface)
└── YourContract.sol
```

Then inherit it:

```solidity
import "./via/ViaIntegrationV1.sol";

contract YourContract is ViaIntegrationV1 {
    constructor() ViaIntegrationV1(msg.sender) {}

    function messageProcess(
        uint256, uint64, bytes32, bytes32,
        bytes memory onChainData, bytes memory, uint256
    ) internal override {
        // your cross-chain logic here
    }
}
```

ViaIntegrationV1 also imports `IERC20` from OpenZeppelin, so install that:

```bash
npm install @openzeppelin/contracts
```

---

## ViaIntegrationV1.sol

<details>
<summary>Expand to copy — contracts/via/ViaIntegrationV1.sol</summary>

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IViaGatewayV1} from "./IViaGatewayV1.sol";
import {IViaIntegrationV1} from "./IViaIntegrationV1.sol";
import {IGasCollector} from "./IGasCollector.sol";
import {IFeeCollector} from "./IFeeCollector.sol";

abstract contract ViaIntegrationV1 is IViaIntegrationV1 {
    bytes32 constant EMPTY_BYTES =
        0x0000000000000000000000000000000000000000000000000000000000000000;

    address public gateway;
    address public feeCollector;
    address public gasCollector;
    address public projectOwner;
    mapping(uint64 => bytes32) public contractEndpoints;
    mapping(address => bool) public projectRelayers;
    mapping(address => bool) public projectSigners;

    event SetSigner(address, bool);
    event SetRelayer(address, bool);
    event ProjectOwnershipTransferred(address previousOwner, address newOwner);

    error AddressZero();
    error NotAuthorized();
    error DestinationChainNotSet();
    error InvalidLength();
    error NotOwner();
    error NotGateway();
    error InvalidSender();

    modifier onlyProjectOwner() {
        _onlyProjectOwner();
        _;
    }

    modifier onlyMessageGatewayAndEndpoint(
        uint64 sourceChainId,
        bytes32 sender
    ) {
        if (msg.sender != gateway) revert NotGateway();
        bytes32 allowedSender = contractEndpoints[sourceChainId];
        if (sender != allowedSender) revert InvalidSender();
        _;
    }

    modifier onlyAllowedRelayer() {
        if (projectRelayers[msg.sender] != true) revert NotAuthorized();
        _;
    }

    modifier onlyAllowedSigner() {
        if (projectSigners[msg.sender] != true) revert NotAuthorized();
        _;
    }

    constructor(address projectOwner_) {
        projectOwner = projectOwner_;
    }

    function messageProcessFromGateway(
        uint256 txId,
        uint64 sourceChainId,
        bytes32 sender,
        bytes32 recipient,
        bytes memory onChainData,
        bytes memory offChainData,
        uint256 gasRefundAmount
    ) external override onlyMessageGatewayAndEndpoint(sourceChainId, sender) {
        messageProcess(
            txId, sourceChainId, sender, recipient,
            onChainData, offChainData, gasRefundAmount
        );
    }

    function setRelayerWhitelist(address addr, bool enabled) external onlyProjectOwner {
        projectRelayers[addr] = enabled;
        emit SetRelayer(addr, enabled);
    }

    function setSignerWhitelist(address addr, bool enabled) external onlyProjectOwner {
        projectSigners[addr] = enabled;
        emit SetSigner(addr, enabled);
    }

    function setRequiredProjectSignerCounts(uint256 amount) external onlyProjectOwner {
        IViaGatewayV1(gateway).setRequiredProjectSignerCounts(amount);
    }

    function setIsProjectRelayerRestricted(bool restricted) external onlyProjectOwner {
        IViaGatewayV1(gateway).setIsProjectRelayerRestricted(restricted);
    }

    function setMessageGateway(address gateway_) external onlyProjectOwner {
        gateway = gateway_;
        gasCollector = IViaGatewayV1(gateway).gasCollector();
        feeCollector = IViaGatewayV1(gateway).feeCollector();

        if (gasCollector != address(0)) {
            address currentGasToken = IGasCollector(gasCollector).getGasToken();
            if (currentGasToken != address(0))
                IERC20(currentGasToken).approve(gasCollector, type(uint256).max);
        }

        if (feeCollector != address(0)) {
            address currentFeeToken = IFeeCollector(feeCollector).feeToken();
            if (currentFeeToken != address(0))
                IERC20(currentFeeToken).approve(feeCollector, type(uint256).max);
        }
    }

    function setMaxFee(uint256 amount) external onlyProjectOwner {
        IFeeCollector(feeCollector).setMaxFee(amount);
    }

    function setMaxGas(uint256 amount) external onlyProjectOwner {
        IGasCollector(gasCollector).setMaxGas(amount);
    }

    function transferProjectOwnership(address newOwner) external onlyProjectOwner {
        if (newOwner == address(0)) revert AddressZero();
        address oldOwner = projectOwner;
        projectOwner = newOwner;
        emit ProjectOwnershipTransferred(oldOwner, newOwner);
    }

    function setMessageEndpoints(
        uint64[] calldata chains,
        bytes32[] calldata endpoints
    ) external onlyProjectOwner {
        if (chains.length != endpoints.length) revert InvalidLength();
        uint256 chainsLength = chains.length;
        for (uint256 x = 0; x < chainsLength; x++) {
            contractEndpoints[chains[x]] = endpoints[x];
        }
    }

    function setProjectRelayer(bool enabled) external onlyAllowedRelayer {
        IViaGatewayV1(gateway).setProjectRelayer(enabled);
    }

    function setProjectSigner(bool enabled) external onlyAllowedSigner {
        IViaGatewayV1(gateway).setProjectSigner(enabled);
    }

    function messageSend(
        uint64 destChainId,
        bytes memory chainData,
        uint16 confirmations
    ) internal returns (uint256) {
        if (gateway == address(0)) revert AddressZero();
        if (contractEndpoints[destChainId] == EMPTY_BYTES)
            revert DestinationChainNotSet();

        uint256 txId = IViaGatewayV1(gateway).send{value: msg.value}(
            contractEndpoints[destChainId],
            destChainId,
            chainData,
            confirmations
        );
        return txId;
    }

    function messageProcess(
        uint256, uint64, bytes32, bytes32,
        bytes memory, bytes memory, uint256
    ) internal virtual {
        revert("messageProcess() not impl");
    }

    function _onlyProjectOwner() internal view {
        if (msg.sender != projectOwner) revert NotOwner();
    }

    function _bytes32ToAddress(bytes32 addr) internal pure returns (address) {
        return address(uint160(uint256(addr)));
    }

    function _addressToBytes32(address addr) internal pure returns (bytes32) {
        return bytes32(uint256(uint160(addr)));
    }
}
```

</details>

---

## Interface Dependencies

These 4 files are imported by ViaIntegrationV1. Copy them into `contracts/via/` — you don't need to read or modify them.

<details>
<summary>Expand to copy all 4 interface files</summary>

```solidity title="contracts/via/IViaGatewayV1.sol"
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

interface IViaGatewayV1 {
    function send(
        bytes32 recipient, uint64 destChainId,
        bytes calldata chainData, uint16 confirmations
    ) external payable returns (uint256);
    function setProjectRelayer(bool enabled) external;
    function setProjectSigner(bool enabled) external;
    function setRequiredProjectSignerCounts(uint256 amount) external;
    function setIsProjectRelayerRestricted(bool restricted) external;
    function feeCollector() external view returns (address);
    function gasCollector() external view returns (address);
}
```

```solidity title="contracts/via/IViaIntegrationV1.sol"
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

interface IViaIntegrationV1 {
    function messageProcessFromGateway(
        uint256 txId, uint64 sourceChainId, bytes32 sender,
        bytes32 recipient, bytes memory onChainData,
        bytes memory offChainData, uint256 gasReimbursementAmount
    ) external;
    function transferProjectOwnership(address newOwner) external;
}
```

```solidity title="contracts/via/IFeeCollector.sol"
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

interface IFeeCollector {
    function pay(address sender) external payable;
    function setMaxFee(uint256 amount) external;
    function feeToken() external view returns (address);
}
```

```solidity title="contracts/via/IGasCollector.sol"
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

interface IGasCollector {
    function refund(address recipient, address relayer, uint256 gasRefundAmount) external;
    function setMaxGas(uint256 amount) external;
    function getGasToken() external view returns (address);
}
```

</details>

---

## Reference Implementations

Tested contracts from the VIA Labs contract suite. Copy into `contracts/` and use directly.

| Contract | Pattern | Full Reference |
|----------|---------|----------------|
| **VIAMintBurnTokenMinimal.sol** | Burn on source, mint on destination | [Reference](/docs/general/ref-mint-burn) \| [Build Guide](/docs/examples/burn-mint-token) |
| **VIALockerRelease.sol** | Lock on source, release from pool on destination | [Reference](/docs/general/ref-locker-release) \| [Build Guide](/docs/examples/lock-release-token) |
