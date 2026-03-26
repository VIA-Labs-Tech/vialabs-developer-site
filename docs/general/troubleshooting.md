---
sidebar_position: 7
---

# Troubleshooting

Common issues and their solutions when working with VIA Labs cross-chain messaging.

## Message Not Delivered

**Symptom:** You sent a cross-chain message but the destination contract's `messageProcess()` was never called.

**Possible causes:**
1. **Insufficient gas** — Ensure you have enough gas on the source chain for the `messageSend()` call
2. **Contract not configured** — Verify `setMessageGateway()` was called with the correct gateway address and `setMessageEndpoints()` was called with the correct chain IDs and contract addresses
3. **Wrong chain ID** — Double-check the destination chain ID passed to `messageSend()`
4. **Destination chain congestion** — Messages may be delayed during high network activity

Check your transaction status on [VIA Scan](https://scan.vialabs.tech) to see where your message is in the delivery pipeline.

## Transaction Reverted

**Symptom:** The transaction reverts when calling `messageSend()`.

**Possible causes:**
1. **Gateway not set** — Ensure `setMessageGateway()` has been called with the correct gateway address
2. **Destination chain not configured** — The destination chain must be set via `setMessageEndpoints()` before sending
3. **Payload encoding error** — Ensure your `abi.encode()` call matches the expected format
4. **Insufficient balance** — Check that you have enough native tokens for gas

## Contract Deployment Issues

**Symptom:** Contract deployment fails or the deployed contract doesn't work cross-chain.

**Checklist:**
- [ ] Contract inherits from `ViaIntegrationV1`
- [ ] `setMessageGateway()` is called with the correct VIA Gateway address for the network
- [ ] `setMessageEndpoints()` is called with the correct chain IDs and remote contract addresses
- [ ] The `projectOwner` address is correctly set in the constructor
- [ ] The contract has been deployed on all chains it needs to communicate with

## Still Need Help?

- Check your transaction on [VIA Scan](https://scan.vialabs.tech)
- If your issue isn't covered here, reach out through our [developer channels](/docs/work-with-us/developers)
