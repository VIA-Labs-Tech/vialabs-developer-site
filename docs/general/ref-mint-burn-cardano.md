---
sidebar_label: VIAMintBurnTokenCardano
title: VIAMintBurnTokenCardano Reference
description: API reference for the VIAMintBurnTokenCardano token contract, the EVM side of a burn and mint route with Cardano.
---

# VIAMintBurnTokenCardano

A cross-chain ERC20 token for routes that include Cardano. It burns on the source chain and mints on the destination, like [VIAMintBurnTokenMinimal](/docs/general/ref-mint-burn). The difference is the message format. This contract packs every message in [VILR](/docs/examples/cardano/overview#the-chain_data-format-vilr), the format that VIA's Cardano clients read and write.

**Use when your token lives on Cardano and on one or more EVM chains.** Deploy this contract on every EVM chain in the route. `VIAMintBurnTokenMinimal` encodes its message with `abi.encode`, and a Cardano client cannot decode that format.

The contract also sends to and receives from other EVM chains, because both sides pack and read the same layout. Transfers between two EVM chains go direct. They do not pass through Cardano.

For the full source code, see [Contract Source](/docs/general/contract-source#viamintburntokencardanosol). For the Cardano side of the route, see [Burn & Mint Client](/docs/examples/cardano/mint-burn-client).

**Inherits:** ERC20, ERC20Burnable, Ownable, [ViaIntegrationV1](/docs/general/ref-via-integration)

---

## Constructor

```solidity
constructor(
    string memory name,
    string memory symbol,
    uint256 initialSupply,
    bytes32 cardanoToken
)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `string` | Token name (e.g., "My Token") |
| `symbol` | `string` | Token symbol (e.g., "MTK") |
| `initialSupply` | `uint256` | Supply in whole tokens — multiplied by `10 ** decimals()` |
| `cardanoToken` | `bytes32` | Cross-chain identity of the token on Cardano: `keccak256(policyId ++ assetName)`. See [Token Identity](/docs/examples/cardano/overview#token-identity). |

The contract stores `cardanoToken` as an immutable value. You cannot change it after deployment. The constructor reverts with `InvalidMessage` if the value is zero.

The total supply across all chains is the sum of the initial supplies. If the full supply mints on Cardano at init, pass `0` for `initialSupply`.

Deployer becomes both the ERC20 `owner` and the ViaIntegrationV1 `projectOwner`.

---

## Functions

### decimals

```solidity
function decimals() public pure override returns (uint8);
```

Returns `6`. Amounts cross chains as raw integers, with no scaling. The value must equal the decimals of the token on Cardano. If your Cardano token uses another value, change this function before you deploy.

### mint

```solidity
function mint(address to, uint256 amount) external onlyOwner;
```

Mint tokens to any address. Restricted to owner. No burn on another chain matches these tokens, so they raise the total supply across chains.

### bridge

```solidity
function bridge(
    bytes32 tokenRecipient,
    uint64 destChainId,
    uint256 amount,
    string calldata text
) external payable returns (uint256 txId);
```

Burn tokens from `msg.sender` on this chain and send a VILR message to mint on the destination.

| Parameter | Type | Description |
|-----------|------|-------------|
| `tokenRecipient` | `bytes32` | Recipient on the destination chain. The format depends on the destination. See [Recipient Format](#recipient-format). |
| `destChainId` | `uint64` | Destination chain ID. For Cardano, use the VIA chain ID: `2273265` for Mainnet, `2273266` for Preprod. |
| `amount` | `uint256` | Amount to transfer, in base units |
| `text` | `string` | Not used. The VILR payload has no text field. |

Include `msg.value` if the gateway requires fees. Returns a `txId` for tracking.

### messageProcess

```solidity
function messageProcess(
    uint256 txId, uint64 sourceChainId, bytes32 sender, bytes32 recipient,
    bytes memory onChainData, bytes memory offChainData, uint256 gasRefundAmount
) internal override;
```

Called automatically by the gateway. Reads `amount` and `destination_recipient` from the VILR payload in `onChainData`, converts the recipient to an address, and mints to it. It does not read the other payload fields.

---

## Recipient Format

`tokenRecipient` is always 32 bytes. What goes in it depends on the destination chain.

| Destination | Format |
|-------------|--------|
| EVM chain | The address, left-padded with zeros. Use `_addressToBytes32()`. |
| Cardano | A 4-byte tag, then the 28-byte credential hash. Tag `0x00000001` is a payment key hash. Tag `0x00000002` is a script hash. |

A Cardano recipient with a payment key looks like this:

```
0x00000001 ++ <28-byte payment key hash>
```

---

## Endpoints

Set one endpoint for each chain in the route, in both directions.

- **On this contract:** call `setMessageEndpoints()`. For Cardano, the endpoint is the policy ID of your Cardano client, left-padded with zeros to 32 bytes. For another EVM chain, the endpoint is the address of this contract on that chain, left-padded the same way.
- **On Cardano:** add this contract to the [route list](/docs/examples/cardano/overview#routes-which-senders-you-accept) of your client. The `source_chain` is the EVM chain ID. The `sender` is this contract's address, left-padded with zeros to 32 bytes.

---

## Message Encoding

```solidity
// bridge() packs 204 bytes:
abi.encodePacked(
    bytes4(0x56494c52),  // magic "VILR"
    uint32(1),           // version
    amount,              // uint256
    CARDANO_TOKEN,       // source_token
    uint32(0),           // source depositor prefix (reserved)
    bytes28(0),          // source depositor (not set)
    CARDANO_TOKEN,       // destination_token
    tokenRecipient,      // destination_recipient
    uint256(0),          // max_fee
    uint32(0)            // hook_data length
)

// messageProcess() reads:
// amount          at byte offset 8
// tokenRecipient  at byte offset 136
```

The contract always sends a `max_fee` of zero and no hook data. With no hook data, the Cardano output that pays the recipient carries no datum. For the full layout, see [The chain_data Format (VILR)](/docs/examples/cardano/overview#the-chain_data-format-vilr).

---

## Errors

| Error | When |
|-------|------|
| `ZeroAmount` | `bridge()` called with `amount == 0` |
| `InvalidMessage` | Decoded amount < 1 or recipient is zero address. Also thrown by the constructor when `cardanoToken` is zero. |

Burns are irreversible. If delivery fails on the destination, tokens are already burned on the source. On an EVM destination, recovery requires the owner to manually `mint()` replacements. The Cardano client has no owner mint.
