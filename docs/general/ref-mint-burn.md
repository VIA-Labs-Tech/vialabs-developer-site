---
sidebar_label: VIAMintBurnTokenMinimal
title: VIAMintBurnTokenMinimal Reference
description: API reference for the VIAMintBurnTokenMinimal cross-chain token contract.
---

# VIAMintBurnTokenMinimal

A cross-chain ERC20 token that burns on the source chain and mints on the destination. Total supply stays constant across all chains. This is the reference implementation from the VIA Labs contract suite.

**Use when you control the token** — you have mint/burn authority on every chain.

For the full source code, see [Contract Source](/docs/general/contract-source). For the deployment walkthrough, see [Burn & Mint Token](/docs/examples/burn-mint-token).

**Inherits:** ERC20, ERC20Burnable, Ownable, [ViaIntegrationV1](/docs/general/ref-via-integration)

---

## Constructor

```solidity
constructor(string memory name, string memory symbol, uint256 initialSupply)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `string` | Token name (e.g., "My Token") |
| `symbol` | `string` | Token symbol (e.g., "MTK") |
| `initialSupply` | `uint256` | Supply in whole tokens — multiplied by `10 ** decimals()` |

Deployer becomes both the ERC20 `owner` and the ViaIntegrationV1 `projectOwner`.

---

## Functions

### mint

```solidity
function mint(address to, uint256 amount) external onlyOwner;
```

Mint tokens to any address. Restricted to owner.

### bridge

```solidity
function bridge(
    bytes32 tokenRecipient,
    uint64 destChainId,
    uint256 amount
) external payable returns (uint256 txId);
```

Burn tokens from `msg.sender` on this chain and send a message to mint on the destination.

| Parameter | Type | Description |
|-----------|------|-------------|
| `tokenRecipient` | `bytes32` | Recipient address on destination chain (left-padded). Use `_addressToBytes32()`. |
| `destChainId` | `uint64` | Destination chain ID |
| `amount` | `uint256` | Amount to bridge (in wei) |

Include `msg.value` for destination gas. Returns a `txId` for tracking.

### messageProcess

```solidity
function messageProcess(
    uint256 txId, uint64 sourceChainId, bytes32 sender, bytes32 recipient,
    bytes memory onChainData, bytes memory offChainData, uint256 gasRefundAmount
) internal override;
```

Called automatically by the gateway. Decodes `(bytes32 tokenRecipient, uint256 amount)` from `onChainData` and mints to the recipient.

---

## Message Encoding

```solidity
// bridge() encodes:
abi.encode(bytes32 tokenRecipient, uint256 amount)

// messageProcess() decodes:
(bytes32 tokenRecipient, uint256 amount) = abi.decode(onChainData, (bytes32, uint256));
```

---

## Errors

| Error | When |
|-------|------|
| `ZeroAmount` | `bridge()` called with `amount == 0` |
| `InvalidMessage` | Decoded amount < 1 or recipient is zero address |

Burns are irreversible. If `messageProcess()` fails on the destination, tokens are already burned on the source. Recovery requires the owner to manually `mint()` replacements.
