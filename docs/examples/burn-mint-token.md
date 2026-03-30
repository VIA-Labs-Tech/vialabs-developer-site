---
sidebar_label: Burn & Mint Token
title: Burn & Mint Token
description: Deploy a cross-chain ERC20 token that burns on the source chain and mints on the destination.
---

# Burn & Mint Token

Deploy a cross-chain ERC20 token that burns on the source chain and mints on the destination chain. Total supply stays constant across all chains — tokens are destroyed on one side and created on the other.

**Use this pattern when you control the token** — you have mint and burn authority on every chain. If you need to bridge a token you don't control (like USDC), see [Lock & Mint Token](/docs/examples/lock-mint-token) or [Lock & Release Token](/docs/examples/lock-release-token).

:::tip Choosing a Bridge Pattern
| Pattern | Token control | Liquidity needed | Destination token |
|---------|--------------|-----------------|-------------------|
| **Burn & Mint** | You control it | No | Same token (minted) |
| [Lock & Mint](/docs/examples/lock-mint-token) | You don't control it | No | Wrapped/synthetic version |
| [Lock & Release](/docs/examples/lock-release-token) | You don't control it | Yes, pre-funded | Original token |
:::

---

## Prerequisites

- [Node.js](https://nodejs.org/) v16+
- [MetaMask](https://metamask.io/) or another Web3 wallet
- Testnet tokens on two chains — see [Testnet Tokens](/docs/general/testnet-tokens)
- Familiarity with [Hello World](/docs/examples/hello-world) example

---

## Simple Pattern

A single contract that IS the ERC20 token AND the bridge. Quick to deploy, easy to understand.

### The Contract

Create `contracts/SimpleToken.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@vialabs-tech/contracts/ViaIntegrationV1.sol";

contract SimpleToken is ERC20, ERC20Burnable, Ownable, ViaIntegrationV1 {

    error ZeroAmount();
    error InvalidMessage();

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable() ViaIntegrationV1(msg.sender) {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    /// @notice Owner can mint new tokens
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /// @notice Bridge tokens to another chain — burns on source, mints on destination
    function bridge(
        bytes32 tokenRecipient,
        uint64 destChainId,
        uint256 amount
    ) external payable returns (uint256) {
        if (amount == 0) revert ZeroAmount();
        _burn(msg.sender, amount);
        bytes memory data = abi.encode(tokenRecipient, amount);
        return messageSend(destChainId, data, 1);
    }

    /// @notice Called automatically on the destination chain — mints tokens to recipient
    function messageProcess(
        uint256, uint64, bytes32, bytes32,
        bytes memory onChainData,
        bytes memory, uint256
    ) internal override {
        (bytes32 tokenRecipient, uint256 amount) = abi.decode(
            onChainData, (bytes32, uint256)
        );
        address recipient = _bytes32ToAddress(tokenRecipient);
        if (amount < 1 || recipient == address(0)) revert InvalidMessage();
        _mint(recipient, amount);
    }
}
```

### How It Works

1. User calls `bridge()` with a recipient address, destination chain, and amount
2. Tokens are **burned** immediately from the caller's balance
3. The message is sent cross-chain via `messageSend()`
4. On the destination chain, `messageProcess()` **mints** the same amount to the recipient

Deploy one instance per chain. Each instance can mint and burn independently — set endpoints to point each chain's instance at its peers.

:::caution
**Burns are irreversible.** If the destination `messageProcess()` fails (e.g., contract is paused), the source tokens are already burned. The gateway emits an `Error` event but there is no automatic refund. Recovery requires the owner to manually mint replacement tokens.
:::

---

## Recommended Production Pattern

For production deployments, we recommend separating the **token contract** from the **bridge contract**. This is the same pattern Circle uses for their [bridged USDC standard](https://github.com/circlefin/stablecoin-evm).

### Why Separate?

| Benefit | Explanation |
|---------|-------------|
| **Protocol independence** | If you want to switch messaging protocols or add multiple bridges, you only change the bridge contract. The token contract — and all user balances — stay untouched. |
| **Risk isolation** | If the bridge contract has a vulnerability, the token contract is a separate address. You can pause or replace the bridge without affecting normal token transfers. |
| **Multi-bridge support** | The token can authorize multiple bridge contracts simultaneously. Users can bridge via VIA Labs AND another protocol if needed. |
| **Industry standard** | Circle, major stablecoin issuers, and enterprise token projects all use this pattern. Auditors expect it. |

### Contract 1: The Token

Create `contracts/BridgeableToken.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title BridgeableToken
/// @notice ERC20 token with configurable minter role for cross-chain bridges.
/// @dev The owner manages which addresses have mint authority. Multiple minters
///      can be authorized simultaneously (e.g., multiple bridge protocols).
contract BridgeableToken is ERC20, ERC20Burnable, Ownable {

    mapping(address => bool) public minters;

    event MinterUpdated(address indexed minter, bool authorized);

    error NotMinter();

    modifier onlyMinter() {
        if (!minters[msg.sender]) revert NotMinter();
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable() {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    /// @notice Owner authorizes or revokes minter addresses
    function setMinter(address minter, bool authorized) external onlyOwner {
        minters[minter] = authorized;
        emit MinterUpdated(minter, authorized);
    }

    /// @notice Authorized minters can mint tokens (used by bridge contracts)
    function mint(address to, uint256 amount) external onlyMinter {
        _mint(to, amount);
    }
}
```

### Contract 2: The Bridge

Create `contracts/TokenBridge.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@vialabs-tech/contracts/ViaIntegrationV1.sol";

interface IBridgeableToken {
    function mint(address to, uint256 amount) external;
    function burnFrom(address account, uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);
}

/// @title TokenBridge
/// @notice Cross-chain bridge that burns tokens on source and mints on destination.
/// @dev Separated from the token contract for protocol independence and risk isolation.
contract TokenBridge is ViaIntegrationV1 {

    IBridgeableToken public immutable token;

    error ZeroAmount();
    error InvalidMessage();

    constructor(address tokenAddress) ViaIntegrationV1(msg.sender) {
        token = IBridgeableToken(tokenAddress);
    }

    /// @notice Bridge tokens to another chain
    /// @param tokenRecipient Recipient address on destination chain (bytes32, left-padded)
    /// @param destChainId Destination chain ID
    /// @param amount Amount of tokens to bridge
    function bridge(
        bytes32 tokenRecipient,
        uint64 destChainId,
        uint256 amount
    ) external payable returns (uint256) {
        if (amount == 0) revert ZeroAmount();
        token.burnFrom(msg.sender, amount);
        bytes memory data = abi.encode(tokenRecipient, amount);
        return messageSend(destChainId, data, 1);
    }

    /// @notice Called automatically on destination chain — mints tokens to recipient
    function messageProcess(
        uint256, uint64, bytes32, bytes32,
        bytes memory onChainData,
        bytes memory, uint256
    ) internal override {
        (bytes32 tokenRecipient, uint256 amount) = abi.decode(
            onChainData, (bytes32, uint256)
        );
        address recipient = _bytes32ToAddress(tokenRecipient);
        if (amount < 1 || recipient == address(0)) revert InvalidMessage();
        token.mint(recipient, amount);
    }
}
```

### Deployment Order

1. **Deploy `BridgeableToken`** on each chain with `(name, symbol, initialSupply)`
2. **Deploy `TokenBridge`** on each chain with the token address from step 1
3. **Authorize the bridge as a minter**: `token.setMinter(bridgeAddress, true)` on each chain
4. **Configure the bridge**: `bridge.setMessageGateway(gatewayAddress)` and `bridge.setMessageEndpoints(...)` on each chain
5. **Users approve the bridge**: Before bridging, users call `token.approve(bridgeAddress, amount)` so the bridge can call `burnFrom()`

### Usage

```solidity
// User approves the bridge to burn their tokens
token.approve(bridgeAddress, 1000 * 10**18);

// User bridges 1000 tokens to Polygon
bridge.bridge{value: 0.001 ether}(
    bytes32(uint256(uint160(recipientAddress))),  // recipient on destination
    137,                                           // Polygon chain ID
    1000 * 10**18                                  // amount
);
```

---

## Message Encoding

Both patterns encode the same data:

```solidity
// Sender encodes:
bytes memory data = abi.encode(bytes32 tokenRecipient, uint256 amount);

// Receiver decodes:
(bytes32 tokenRecipient, uint256 amount) = abi.decode(onChainData, (bytes32, uint256));
```

All addresses are encoded as `bytes32`, left-padded with zeroes. Use `_bytes32ToAddress()` (inherited from `ViaIntegrationV1`) to convert back.

---

## Next Steps

- [Lock & Mint Token](/docs/examples/lock-mint-token) — bridge tokens you don't control without liquidity pools
- [Lock & Release Token](/docs/examples/lock-release-token) — bridge existing tokens with pre-funded liquidity
- [SDK Reference](/docs/general/package) — full API documentation
