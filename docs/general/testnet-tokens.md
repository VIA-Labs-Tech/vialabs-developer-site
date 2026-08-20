---
sidebar_position: 5
---

# Testnet Tokens

You'll need testnet tokens to deploy contracts and send cross-chain messages on test networks.

## Faucets

| Network | Faucet |
|---------|--------|
| Sepolia (Ethereum) | [alchemy.com/faucets/ethereum-sepolia](https://www.alchemy.com/faucets/ethereum-sepolia) |
| Avalanche Fuji | [core.app/tools/testnet-faucet](https://core.app/tools/testnet-faucet) |
| Base Sepolia | [alchemy.com/faucets/base-sepolia](https://www.alchemy.com/faucets/base-sepolia) |
| BNB Testnet | [testnet.bnbchain.org/faucet-smart](https://testnet.bnbchain.org/faucet-smart) |
| Arbitrum Sepolia | [faucet.quicknode.com/arbitrum/sepolia](https://faucet.quicknode.com/arbitrum/sepolia) |
| Cardano Preprod (ADA) | [docs.cardano.org/cardano-testnets](https://docs.cardano.org/cardano-testnets/tools/faucet/) — select **Preprod** |
| Cardano Preprod (tUSDM) | [tusdm.moneta.global](https://tusdm.moneta.global) |
| Midnight Preview (tDUST) | [docs.midnight.network](https://docs.midnight.network/) |

The VIA Cardano route runs on **Preprod** (not Preview) — pick the Preprod network in the Cardano faucet. Its Midnight counterpart is **Midnight Preview**, where tDUST pays transaction fees.

## Tips

- Most faucets require you to connect a wallet or enter your address
- Some faucets have daily limits — request tokens early
- If a faucet is down, search for alternative faucets for that network
- Keep testnet tokens in a dedicated development wallet

:::tip
When testing cross-chain messaging, make sure you have tokens on **both** the source and destination test networks.
:::

:::info Need help with testnet tokens?
If any faucets aren't working or you're having trouble getting testnet tokens, [contact us on Discord](https://discord.gg/h4rBhukkWz) and we can help you get some native gas to get started.
:::

:::warning Mainnet has no faucets
On the mainnet pair you bridge real assets: USDM and ADA on Cardano, and Midnight fees in DUST — which is generated from registered NIGHT, not acquired. See [Fees: DUST](/docs/examples/midnight/overview#fees-dust).
:::
