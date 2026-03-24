---
sidebar_position: 7
---

# Troubleshooting

Common issues and their solutions when working with VIA Labs cross-chain messaging.

## Message Not Delivered

**Symptom:** You sent a cross-chain message but the destination contract's `_processMessage()` was never called.

**Possible causes:**
1. **Insufficient gas** — Ensure you have enough gas on the source chain for the `_sendMessage()` call
2. **Destination chain congestion** — Messages may be delayed during high network activity
3. **Contract not configured** — Verify `configureClient()` was called with the correct endpoint and chain IDs
4. **Wrong chain ID** — Double-check the destination chain ID

## Transaction Reverted

**Symptom:** The transaction reverts when calling `_sendMessage()`.

**Possible causes:**
1. **`onlyActiveChain` modifier** — The destination chain may not be configured as active
2. **Payload encoding error** — Ensure your `abi.encode()` call matches the expected format
3. **Insufficient balance** — Check that you have enough native tokens for gas + relay fees

## Contract Deployment Issues

**Symptom:** Contract deployment fails or the deployed contract doesn't work cross-chain.

**Checklist:**
- [ ] Contract inherits from `MessageClient`
- [ ] `configureClient()` is called in the constructor or initialization
- [ ] The VIA Labs endpoint address is correct for the network
- [ ] All supported chain IDs are passed to `configureClient()`

## Still Need Help?

If your issue isn't covered here, reach out through our [developer channels](/docs/work-with-us/developers).
