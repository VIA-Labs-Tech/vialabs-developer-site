---
sidebar_label: Lock & Mint Token
title: Lock & Mint Token
description: Lock tokens on the source chain and mint a synthetic version on the destination — no liquidity pools needed.
---

# Lock & Mint Token

Lock existing tokens you don't control (like USDC) on the source chain and mint a synthetic/wrapped version on the destination chain. This eliminates the need for pre-funded liquidity pools on every destination.

**Use this pattern when:**
- You want to bridge a token you don't control (can't mint/burn the original)
- You don't want to manage liquidity pools on every destination chain
- You're comfortable with users holding a wrapped representation on the destination

:::tip Choosing a Bridge Pattern
| Pattern | Token control | Liquidity needed | Destination token |
|---------|--------------|-----------------|-------------------|
| [Burn & Mint](/docs/examples/burn-mint-token) | You control it | No | Same token (minted) |
| **Lock & Mint** | You don't control it | No | Wrapped/synthetic version |
| [Lock & Release](/docs/examples/lock-release-token) | You don't control it | Yes, pre-funded | Original token |
:::

---

## Prerequisites

- [Node.js](https://nodejs.org/) v16+
- [MetaMask](https://metamask.io/) or another Web3 wallet
- Testnet tokens on two chains — see [Testnet Tokens](/docs/general/testnet-tokens)
- Familiarity with [Hello World](/docs/examples/hello-world) and [Burn & Mint Token](/docs/examples/burn-mint-token) examples

---

## Overview

This pattern uses **three contracts**:

```
Source Chain                         Destination Chain
────────────                        ──────────────────
LockBridge.sol                      MintBridge.sol
  ↓ locks USDC                        ↓ mints viaUSDC
  ↓ messageSend()                     ↓ messageProcess()
                                    SyntheticToken.sol
                                      ↓ ERC20 with minter role
                                      ↓ (Circle's bridged standard)
```

On the source chain, real tokens are locked in the bridge contract. On the destination chain, a synthetic token (e.g., `viaUSDC`) is minted to the recipient. When bridging back, the synthetic is burned and the original is released.

The synthetic token follows [Circle's bridged USDC standard](https://github.com/circlefin/stablecoin-evm) — a battle-tested pattern with a configurable minter role, avoiding the need for a custom audit on the token contract itself.

---

## Contract 1: Synthetic Token (Destination Chain)

Create `contracts/SyntheticToken.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title SyntheticToken
/// @notice Wrapped representation of a token locked on another chain.
///         Uses Circle's minter pattern — the owner controls which addresses
///         (bridge contracts) can mint and burn.
contract SyntheticToken is ERC20, ERC20Burnable, Ownable {

    mapping(address => bool) public minters;
    mapping(address => uint256) public minterAllowance;

    event MinterConfigured(address indexed minter, uint256 allowance);
    event MinterRemoved(address indexed minter);

    error NotMinter();
    error MintAllowanceExceeded(uint256 requested, uint256 remaining);

    modifier onlyMinter() {
        if (!minters[msg.sender]) revert NotMinter();
        _;
    }

    constructor(
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) Ownable() {}

    /// @notice Owner configures a minter with an allowance
    /// @param minter Address to authorize (typically a bridge contract)
    /// @param allowance Maximum tokens this minter can create
    function configureMinter(
        address minter,
        uint256 allowance
    ) external onlyOwner {
        minters[minter] = true;
        minterAllowance[minter] = allowance;
        emit MinterConfigured(minter, allowance);
    }

    /// @notice Owner removes a minter
    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        minterAllowance[minter] = 0;
        emit MinterRemoved(minter);
    }

    /// @notice Mint tokens — only callable by authorized minters
    function mint(address to, uint256 amount) external onlyMinter {
        uint256 remaining = minterAllowance[msg.sender];
        if (amount > remaining) {
            revert MintAllowanceExceeded(amount, remaining);
        }
        minterAllowance[msg.sender] = remaining - amount;
        _mint(to, amount);
    }
}
```

**Key design points:**
- No initial supply — tokens are only created when backed by locked originals
- Minter allowance provides a safety cap on how many tokens a bridge can create
- Owner can add/remove minters — enabling multi-bridge support or emergency revocation
- Inherits `ERC20Burnable` so the bridge can call `burnFrom()` when bridging back

---

## Contract 2: Lock Bridge (Source Chain)

Create `contracts/LockBridge.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@vialabs-tech/contracts/ViaIntegrationV1.sol";

/// @title LockBridge
/// @notice Locks tokens on the source chain and sends a cross-chain message
///         to mint synthetic tokens on the destination.
contract LockBridge is ViaIntegrationV1 {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;

    error ZeroAmount();
    error InvalidMessage();

    constructor(address tokenAddress) ViaIntegrationV1(msg.sender) {
        token = IERC20(tokenAddress);
    }

    /// @notice Lock tokens and send a mint message to the destination chain
    function bridge(
        bytes32 tokenRecipient,
        uint64 destChainId,
        uint256 amount
    ) external payable returns (uint256) {
        if (amount == 0) revert ZeroAmount();
        token.safeTransferFrom(msg.sender, address(this), amount);
        bytes memory data = abi.encode(tokenRecipient, amount);
        return messageSend(destChainId, data, 1);
    }

    /// @notice Release locked tokens when synthetic tokens are burned on another chain
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
        token.safeTransfer(recipient, amount);
    }
}
```

---

## Contract 3: Mint Bridge (Destination Chain)

Create `contracts/MintBridge.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@vialabs-tech/contracts/ViaIntegrationV1.sol";

interface ISyntheticToken {
    function mint(address to, uint256 amount) external;
    function burnFrom(address account, uint256 amount) external;
}

/// @title MintBridge
/// @notice Mints synthetic tokens on the destination chain when originals
///         are locked on the source chain. Burns synthetics when bridging back.
contract MintBridge is ViaIntegrationV1 {

    ISyntheticToken public immutable syntheticToken;

    error ZeroAmount();
    error InvalidMessage();

    constructor(address syntheticTokenAddress) ViaIntegrationV1(msg.sender) {
        syntheticToken = ISyntheticToken(syntheticTokenAddress);
    }

    /// @notice Burn synthetic tokens and send a release message to the source chain
    function bridge(
        bytes32 tokenRecipient,
        uint64 destChainId,
        uint256 amount
    ) external payable returns (uint256) {
        if (amount == 0) revert ZeroAmount();
        syntheticToken.burnFrom(msg.sender, amount);
        bytes memory data = abi.encode(tokenRecipient, amount);
        return messageSend(destChainId, data, 1);
    }

    /// @notice Called automatically — mints synthetic tokens to recipient
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
        syntheticToken.mint(recipient, amount);
    }
}
```

---

## Deployment Order

| Step | Chain | Contract | Action |
|------|-------|----------|--------|
| 1 | Destination | `SyntheticToken` | Deploy with `("Via USDC", "viaUSDC")` |
| 2 | Source | `LockBridge` | Deploy with `(usdcAddress)` |
| 3 | Destination | `MintBridge` | Deploy with `(syntheticTokenAddress)` |
| 4 | Destination | `SyntheticToken` | `configureMinter(mintBridgeAddress, type(uint256).max)` |
| 5 | Source | `LockBridge` | `setMessageGateway()` + `setMessageEndpoints()` |
| 6 | Destination | `MintBridge` | `setMessageGateway()` + `setMessageEndpoints()` |

---

## Bridge Flow

### Source → Destination (Lock → Mint)

```
Source Chain                              Destination Chain
────────────                              ──────────────────
User approves LockBridge for USDC
User calls LockBridge.bridge()
  ↓ safeTransferFrom(user → bridge)
  ↓ messageSend(destChainId, data, 1)
  ↓ Gateway emits SendRequested
                                          Relayer delivers message
                                            ↓ MintBridge.messageProcess()
                                            ↓ syntheticToken.mint(recipient, amount)
                                            ↓ User receives viaUSDC
```

### Destination → Source (Burn → Release)

```
Destination Chain                         Source Chain
──────────────────                        ────────────
User approves MintBridge for viaUSDC
User calls MintBridge.bridge()
  ↓ syntheticToken.burnFrom(user, amount)
  ↓ messageSend(sourceChainId, data, 1)
  ↓ Gateway emits SendRequested
                                          Relayer delivers message
                                            ↓ LockBridge.messageProcess()
                                            ↓ token.safeTransfer(recipient, amount)
                                            ↓ User receives original USDC
```

---

## Security Considerations

- **Minter allowance** acts as a safety cap — even if the bridge is compromised, it can only mint up to the configured allowance
- **Owner can revoke minters** instantly — emergency response to bridge vulnerabilities
- **Locked tokens back the synthetic supply** — the LockBridge contract's token balance should always equal or exceed the synthetic token's total supply across all destination chains
- **Use a multisig or timelock** as the SyntheticToken owner in production

---

## Next Steps

- [Lock & Release Token](/docs/examples/lock-release-token) — bridge existing tokens with pre-funded liquidity (original token on both sides)
- [Burn & Mint Token](/docs/examples/burn-mint-token) — for tokens you control
- [SDK Reference](/docs/general/package) — full API documentation
