---
sidebar_position: 1
sidebar_label: Contract Source
title: Contract Source
description: Copy the ViaIntegrationV1 base contract and required interfaces into your project.
---

# Contract Source

To build with VIA Labs, your contract inherits from **ViaIntegrationV1** — the base contract that handles gateway connections, message routing, and security. It gives you two functions:

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

ViaIntegrationV1 imports `IERC20` from OpenZeppelin, and the reference token contracts below use OpenZeppelin 4 (`Ownable` changed its constructor in v5), so install version 4:

```bash
npm install @openzeppelin/contracts@^4
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

### VIAMintBurnTokenMinimal.sol

<details>
<summary>Expand to copy — contracts/VIAMintBurnTokenMinimal.sol</summary>

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {ViaIntegrationV1} from "./via/ViaIntegrationV1.sol";

contract VIAMintBurnTokenMinimal is
    ERC20,
    ERC20Burnable,
    Ownable,
    ViaIntegrationV1
{
    error ZeroAmount();
    error InvalidMessage();

    /// @notice Deploy a cross-chain mintable/burnable token with ViaGateway integration
    /// @dev This is a REFERENCE IMPLEMENTATION demonstrating the burn-on-source, mint-on-destination pattern.
    ///      Combines ERC20, ERC20Burnable, Ownable, and ViaIntegrationV1 for full cross-chain functionality.
    ///      The deployer becomes both the ERC20 owner and the ViaIntegrationV1 projectOwner.
    /// @param name Token name (e.g., "Via Token")
    /// @param symbol Token symbol (e.g., "VIA")
    /// @param initialSupply Initial supply in whole tokens (will be multiplied by decimals)
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable() ViaIntegrationV1(msg.sender) {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    /// @notice Mint new tokens to a specified address
    /// @dev Standard ERC20 minting function restricted to owner.
    ///      Used for initial distribution or minting on destination chain after bridge.
    /// @param to Address to receive the minted tokens
    /// @param amount Amount of tokens to mint (in wei, including decimals)
    /// @custom:requires Only callable by contract owner
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /// @notice Bridge tokens to another blockchain using ViaGateway
    /// @dev REFERENCE IMPLEMENTATION of cross-chain token transfer:
    ///      1. Burns tokens from msg.sender on source chain
    ///      2. Encodes (recipient, amount) as cross-chain message
    ///      3. Calls messageSend() to initiate cross-chain transfer via ViaGateway
    ///      4. On destination chain, messageProcess() mints tokens to recipient
    ///
    ///      PREREQUISITES (see ViaIntegrationV1 configuration):
    ///      - Gateway must be configured via setMessageGateway()
    ///      - Destination endpoint must be set via setMessageEndpoints()
    ///      - Fee token must be approved to feeCollector (done automatically by setMessageGateway)
    ///      - Include msg.value if fees are required
    /// @param tokenRecipient Recipient address on destination chain (bytes32, left-padded)
    /// @param destChainId Destination blockchain's chain ID (e.g., 1 for Ethereum, 43114 for Avalanche)
    /// @param amount Amount of tokens to bridge (in wei, including decimals)
    /// @return txId Unique transaction identifier for tracking this cross-chain transfer
    /// @custom:security Tokens are burned immediately. Ensure gateway and endpoints are correctly configured.
    function bridge(
        bytes32 tokenRecipient,
        uint64 destChainId,
        uint256 amount
    ) external payable returns (uint256) {
        if (amount == 0) revert ZeroAmount();

        _burn(msg.sender, amount);

        bytes memory chainData = abi.encode(tokenRecipient, amount);

        uint256 txId = messageSend(destChainId, chainData, 1);

        return txId;
    }

    /// @notice Process incoming cross-chain messages from ViaGateway (internal override)
    /// @dev REFERENCE IMPLEMENTATION of message processing:
    ///      Called by ViaIntegrationV1.messageProcessFromGateway() after validation.
    ///      Decodes the bridge message and mints tokens to the recipient on destination chain.
    ///
    ///      This demonstrates the receive-side of the burn-on-source, mint-on-destination pattern.
    ///      Projects should override this function to implement their custom cross-chain logic.
    /// @param txId Transaction identifier from source chain
    /// @param sourceChainId Chain ID where tokens were burned
    /// @param sender Source contract address (should match configured endpoint)
    /// @param recipient This contract's address on destination chain
    /// @param onChainData Encoded (tokenRecipient, amount) from bridge()
    /// @param offChainData Additional relayer-provided data (unused in this implementation)
    /// @param gasRefundAmount Gas refund paid to relayer (unused in this implementation)
    function messageProcess(
        uint256 txId,
        uint64 sourceChainId,
        // @note Contract "endpoint" sending this message that we are receiving
        bytes32 sender,
        // @note Contract "endpoint" receiving this message, us, address(this)
        bytes32 recipient,
        bytes memory onChainData,
        bytes memory offChainData,
        uint256 gasRefundAmount
    ) internal override {
        (bytes32 tokenRecipient, uint256 amount) = abi.decode(
            onChainData,
            (bytes32, uint256)
        );

        address recipientAddress = _bytes32ToAddress(tokenRecipient);

        if (amount < 1 || recipientAddress == address(0)) revert InvalidMessage();

        _mint(recipientAddress, amount);
    }
}
```

</details>

### VIALockerRelease.sol

<details>
<summary>Expand to copy — contracts/VIALockerRelease.sol</summary>

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ViaIntegrationV1} from "./via/ViaIntegrationV1.sol";

/// @title VIALockerRelease
/// @notice Cross-chain bridge using lock-on-source, release-on-destination pattern.
/// @dev Use this instead of VIAMintBurnToken when you can't mint/burn the token
///      (e.g. USDC, WETH, or any token where you're not the owner/minter).
///      Each chain deployment can have a different token address.
///      Destination chains must be pre-funded with tokens via deposit().
contract VIALockerRelease is Ownable, ViaIntegrationV1 {
    using SafeERC20 for IERC20;

    /// @notice The ERC20 token this contract locks/releases (can differ per chain)
    IERC20 public immutable token;

    error ZeroAmount();
    error InvalidMessage();
    error InsufficientLiquidity(uint256 requested, uint256 available);
    error InsufficientBalance(uint256 requested, uint256 available);
    error AmountMismatch(uint256 expected, uint256 received);

    /// @notice Deployer becomes both Ownable owner and ViaIntegrationV1 projectOwner.
    /// @dev After deployment: setMessageGateway(), setMessageEndpoints(), then deposit().
    constructor(address _token) Ownable() ViaIntegrationV1(msg.sender) {
        token = IERC20(_token);
    }

    /// @notice Lock tokens and send a cross-chain message to release on destination chain
    /// @dev Caller must have approved this contract. Include msg.value if gateway fees apply.
    /// @param tokenRecipient Recipient address on destination chain (bytes32, left-padded)
    /// @param destChainId Destination chain ID
    /// @param amount Amount of tokens to bridge (in wei)
    /// @return txId Cross-chain transaction identifier
    function bridge(
        bytes32 tokenRecipient,
        uint64 destChainId,
        uint256 amount
    ) external payable returns (uint256) {
        if (amount == 0) revert ZeroAmount();

        uint256 balanceBefore = token.balanceOf(address(this));
        token.safeTransferFrom(msg.sender, address(this), amount);
        uint256 received = token.balanceOf(address(this)) - balanceBefore;
        if (received != amount) revert AmountMismatch(amount, received);

        bytes memory chainData = abi.encode(tokenRecipient, amount);
        uint256 txId = messageSend(destChainId, chainData, 1);

        return txId;
    }

    /// @notice Process incoming cross-chain message — release tokens to recipient
    /// @dev Called by ViaIntegrationV1 after gateway validation. Reverts if insufficient liquidity.
    ///      Message payload: abi.encode(bytes32 tokenRecipient, uint256 amount)
    function messageProcess(
        uint256 txId,
        uint64 sourceChainId,
        // @note Contract "endpoint" sending this message that we are receiving
        bytes32 sender,
        // @note Contract "endpoint" receiving this message, us, address(this)
        bytes32 recipient,
        bytes memory onChainData,
        bytes memory offChainData,
        uint256 gasRefundAmount
    ) internal override {
        (bytes32 tokenRecipient, uint256 amount) = abi.decode(onChainData, (bytes32, uint256));
        address recipientAddress = _bytes32ToAddress(tokenRecipient);

        if (amount < 1 || recipientAddress == address(0)) revert InvalidMessage();

        uint256 bal = token.balanceOf(address(this));
        if (bal < amount) revert InsufficientLiquidity(amount, bal);

        token.safeTransfer(recipientAddress, amount);
    }

    /// @notice Deposit tokens to fund releases on this chain
    /// @dev Anyone can deposit liquidity — not restricted to owner.
    function deposit(uint256 amount) external {
        if (amount == 0) revert ZeroAmount();

        uint256 balanceBefore = token.balanceOf(address(this));
        token.safeTransferFrom(msg.sender, address(this), amount);
        uint256 received = token.balanceOf(address(this)) - balanceBefore;
        if (received != amount) revert AmountMismatch(amount, received);
    }

    /// @notice Withdraw any ERC20 token held by this contract
    /// @dev Allows recovery of the configured token or any accidentally-sent tokens.
    /// @param tokenAddress The ERC20 token to withdraw
    /// @param amount Amount to withdraw (in wei)
    function withdraw(IERC20 tokenAddress, uint256 amount) external onlyOwner {
        if (amount == 0) revert ZeroAmount();
        uint256 bal = tokenAddress.balanceOf(address(this));
        if (amount > bal) revert InsufficientBalance(amount, bal);

        SafeERC20.safeTransfer(tokenAddress, msg.sender, amount);
    }
}
```

</details>
