---
sidebar_position: 9
sidebar_label: Error Reference
title: Error Reference
description: Common Solidity errors from VIA Labs contracts and how to resolve them.
---

# Error Reference

These are the errors you may encounter when integrating with VIA Labs cross-chain messaging. All errors listed here are thrown by the `ViaIntegrationV1` base contract or within your project contract's `messageProcess()` override.

---

## Configuration Errors

### `AddressZero`

**When:** You called `messageSend()` but haven't configured the gateway yet.

**Fix:** Call `setMessageGateway(gatewayAddress)` on your contract before sending any messages. This is the most common setup issue for new deployments.

```solidity
// Must be called before any message operations
myContract.setMessageGateway(GATEWAY_ADDRESS);
```

### `DestinationChainNotSet`

**When:** You called `messageSend()` with a destination chain ID that has no configured endpoint.

**Fix:** Call `setMessageEndpoints()` with the chain ID and your contract's address on that chain.

```solidity
uint64[] memory chains = new uint64[](1);
bytes32[] memory endpoints = new bytes32[](1);
chains[0] = 137;  // Polygon
endpoints[0] = bytes32(uint256(uint160(YOUR_POLYGON_CONTRACT)));
myContract.setMessageEndpoints(chains, endpoints);
```

### `InvalidLength`

**When:** The `chains` and `endpoints` arrays passed to `setMessageEndpoints()` have different lengths.

**Fix:** Ensure both arrays have the same number of elements.

### `NotOwner`

**When:** A non-owner address tried to call a configuration function (`setMessageGateway`, `setMessageEndpoints`, `setMaxFee`, etc.).

**Fix:** Call the function from the `projectOwner` address set in the constructor. Use `transferProjectOwnership()` if you need to change the owner.

---

## Message Delivery Errors

### `NotGateway`

**When:** A message was delivered to your contract from an address that isn't the configured gateway.

**Cause:** This is a security check — it means someone tried to call `messageProcessFromGateway()` directly instead of going through the proper gateway validation flow. This should not happen during normal operation.

### `InvalidSender`

**When:** An incoming message came from a contract address that doesn't match any configured endpoint for that source chain.

**Cause:** Either the source contract address wasn't added via `setMessageEndpoints()`, or the source contract is misconfigured. Verify endpoints on both chains.

---

## Bridge-Specific Errors

### `ZeroAmount`

**When:** A bridge function was called with `amount == 0`.

**Fix:** Provide a non-zero amount.

### `InvalidMessage`

**When:** The `messageProcess()` override decoded an invalid message — typically `amount < 1` or a zero-address recipient.

**Cause:** The source contract encoded invalid data, or the encoding/decoding formats don't match between source and destination.

### `InsufficientLiquidity`

**When:** (Lock-Release pattern only) The destination contract doesn't hold enough tokens to release to the recipient.

**What happens:**
1. The message processing fails
2. The gateway emits an `Error` event with the transaction ID
3. The message is marked as processed (cannot be replayed)
4. Tokens remain **locked on the source chain**

**Fix:** Fund the destination contract with more tokens via `deposit()`. For recovery of locked source tokens, coordinate with the contract owner.

:::tip
Monitor your lock-release contract balances and set up alerts when liquidity drops below a safety threshold. See [Lock & Release Token](/docs/examples/lock-release-token#liquidity-management) for monitoring recommendations.
:::

---

## Related

- [Troubleshooting](/docs/general/troubleshooting) — common issues and their solutions
- [Contract Source](/docs/general/contract-source) — ViaIntegrationV1 and reference implementations
- [FAQ](/docs/general/faq) — frequently asked questions
