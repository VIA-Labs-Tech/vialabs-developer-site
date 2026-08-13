---
sidebar_label: USDM Bridge
title: USDM Bridge
description: The deployed USDM bridge between Midnight Preview and Cardano Preprod — the public package, the contracts, and how to use them.
---

# USDM Bridge

USDM is the live reference integration on Midnight. It is deployed on Midnight Preview and Cardano Preprod, and you can move testnet USDM in both directions right now.

The [`@via-labs-tech/usdm-bridge`](https://www.npmjs.com/package/@via-labs-tech/usdm-bridge) npm package does the bridging. It is public and MIT-licensed. It runs headless in Node.js — use it as a library or run the bundled CLI.

```ts
import { bridgeUSDM } from '@via-labs-tech/usdm-bridge'

const { txHash } = await bridgeUSDM({
    direction: 'cardano-to-midnight', // or 'midnight-to-cardano'
    amount: '5',
    recipient: 'mn_addr_preview1...', // or addr_test1... for midnight-to-cardano
})
```

Bridging through the already-deployed contracts is permissionless. Anyone can move testnet USDM today. The full walkthrough — wallets, environment, CLI commands — is in the [USDM bridge guide](/docs/examples/guides/usdm-cardano-midnight).

---

## Deployed Testnet Contracts

| Network | VIA chain ID | Contract |
|---------|-------------|----------|
| Midnight Preview | `64364450` | USDM gateway: `471dfe55c866fdbc085c9011a51f0cd0e9c9bfca6bb985c35f7716b6e73e485c` |
| Cardano Preprod | `2273266` | Gateway: `addr_test1wp4erajtev047rws58fdj6gz6hpvh53wlk7ccc65sld5xusx4z54g`<br/>Lock-release policy ID: `76fbe9f6c8761cc6744c34a1f30915037e38c01197d6e7c9d2fcc1d3` |

The chain IDs are VIA protocol IDs — the routing keys for cross-chain messages. USDM uses 6 decimals on every chain. The package exports all of these as `CONTRACTS` and `USDM_DECIMALS`, so you rarely need to copy them by hand.

---

## Next Steps

- [USDM Bridge Guide](/docs/examples/guides/usdm-cardano-midnight) — bridge testnet USDM end to end
- [Building on Midnight](/docs/examples/midnight/overview) — how a Midnight client works, and peers beyond Cardano
- [Building on Cardano](/docs/examples/cardano/overview) — the Cardano side of the route
