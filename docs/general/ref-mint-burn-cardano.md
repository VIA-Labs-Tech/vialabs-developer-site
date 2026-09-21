---
sidebar_label: VIAMintBurnTokenCardano
title: VIAMintBurnTokenCardano Reference
description: Reference for the VIAMintBurnTokenCardano token contract, the EVM side of a burn and mint route with Cardano.
---

# VIAMintBurnTokenCardano

A cross-chain ERC20 token for routes that include Cardano. It burns on the source chain and mints on the destination, like [VIAMintBurnTokenMinimal](/docs/general/ref-mint-burn). The difference is the message format. This contract packs every message in [VILR](/docs/examples/cardano/overview#the-chain_data-format-vilr), the format that VIA's Cardano clients read and write.

**Use when your token lives on Cardano and on one or more EVM chains.** Deploy this contract on every EVM chain in the route. `VIAMintBurnTokenMinimal` encodes its message with `abi.encode`, and a Cardano client cannot decode that format.

The VILR format is specific to Cardano. Copies of this contract on two EVM chains can still send messages to each other.

For the full source code, see [Contract Source](/docs/general/contract-source#viamintburntokencardanosol). For the Cardano side of the route, see [Burn & Mint Client](/docs/examples/cardano/mint-burn-client).

**Inherits:** ERC20, ERC20Burnable, Ownable, [ViaIntegrationV1](/docs/general/ref-via-integration)

---

## What You Can and Cannot Change

This contract is a reference implementation. Copy it, then change it to fit your token. The protocol fixes one function. The rest is your design choice.

### Cannot Change: messageProcess

The gateway delivers every incoming message through `messageProcess`. [ViaIntegrationV1](/docs/general/ref-via-integration#messageprocess) sets the name and the parameters of this function. **You cannot change them.** Declare the function exactly as the source does.

The function reads `amount` and `destination_recipient` from the VILR payload in `onChainData`. It converts the recipient to an address and mints to it. It does not read the other payload fields. The VILR layout fixes the positions of the two fields, so keep both reads as they are. For the layout, see [Message Encoding](#message-encoding).

### Can Change: Everything Else

Nothing in the protocol calls the other functions. Their names and their arguments are your design choice.

- **Constructor.** `name`, `symbol`, and `initialSupply` are ordinary ERC20 inputs. The total supply across all chains is the sum of the initial supplies. If the full supply mints on Cardano at init, pass `0` for `initialSupply`. The deployer becomes both the ERC20 `owner` and the ViaIntegrationV1 `projectOwner`.
- **`mint`.** Restricted to the owner. No burn on another chain matches these tokens, so each call raises the total supply across chains.
- **`bridge`.** Your users call this function to start a transfer. It burns from `msg.sender`, packs the VILR payload, and calls `messageSend()`. Keep those three steps. The first argument, `tokenRecipient`, follows the [Recipient Format](#recipient-format). The `text` argument is not used, because the VILR payload has no text field. Include `msg.value` if the gateway requires fees.

---

## Values That Must Match Cardano

Two values tie this contract to your token on Cardano.

- **`cardanoToken`.** The cross-chain identity of the token on Cardano: `keccak256(policyId ++ assetName)`. See [Token Identity](/docs/examples/cardano/overview#token-identity). The contract writes this value into every message as the source token and the destination token. A wrong value makes every mint on Cardano fail. The contract stores the value as immutable, so you cannot change it after deployment. The constructor reverts with `InvalidMessage` if the value is zero.
- **Decimals.** Amounts cross chains as raw integers, with no scaling. `decimals()` returns `6`. The value must equal the decimals of the token on Cardano. If your Cardano token uses another value, change this function before you deploy.

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

Set one endpoint for each chain in the route, in both directions. For Cardano, the chain ID is the VIA chain ID: `2273265` for Mainnet, `2273266` for Preprod. `bridge()` takes the same ID as the destination.

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
