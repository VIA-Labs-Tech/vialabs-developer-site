---
sidebar_position: 3
---

# Supported Networks

VIA Labs supports cross-chain communication across **150+ mainnets** and **80+ testnets**, including both public and private networks.

The tables below list the VIA Gateway contract address for each network with a live VG-1 deployment. Pass the gateway address for your network to `setMessageGateway()` when configuring your contract.

:::info Chain IDs
VIA uses standard EVM chain IDs — the same value returned by `eth_chainId` on each network. Use these as the `destChainId` in `messageSend()` and in `setMessageEndpoints()`.

Cardano and Midnight use VIA-assigned chain IDs and their own client architecture — the Cardano gateway is a validator address, and the Midnight entry is a Compact contract address (on Midnight mainnet the gateway and the USDM token are one contract, serving all routes under a single chain ID; Preview registered one ID per route). See [Building on Cardano](/docs/examples/cardano/overview) and [Building on Midnight](/docs/examples/midnight/overview).

Stellar also uses a VIA-assigned chain ID, and its gateway is a Soroban contract. Stellar routes, and the Ethereum-side gateways that serve them, are listed on [VIA on Stellar](/docs/examples/stellar/overview#deployed-contracts).
:::

## Testnets

| Network | Chain ID | Gateway Address |
|---|---|---|
| Ethereum Sepolia | `11155111` | `0x6cdc2ed3321f4e6bf835b03af691d418bbb350ba` |
| Avalanche Fuji | `43113` | `0x6cdc2ed3321f4e6bf835b03af691d418bbb350ba` |
| Base Sepolia | `84532` | `0x6cdc2ed3321f4e6bf835b03af691d418bbb350ba` |
| Arbitrum Sepolia | `421614` | `0x6cdc2ed3321f4e6bf835b03af691d418bbb350ba` |
| OP Sepolia | `11155420` | `0x6cdc2ed3321f4e6bf835b03af691d418bbb350ba` |
| BSC Testnet | `97` | `0x6cdc2ed3321f4e6bf835b03af691d418bbb350ba` |
| OP BNB Testnet | `5611` | `0x6cdc2ed3321f4e6bf835b03af691d418bbb350ba` |
| Hyper EVM Testnet | `998` | `0x6cdc2ed3321f4e6bf835b03af691d418bbb350ba` |
| Polygon Amoy | `80002` | `0x6cdc2ed3321f4e6bf835b03af691d418bbb350ba` |
| Robinhood Testnet | `46630` | `0x6cdc2ed3321f4e6bf835b03af691d418bbb350ba` |
| Upside Testnet | `61872` | `0x6cdc2ed3321f4e6bf835b03af691d418bbb350ba` |
| PandaSea Testnet | `7770` | `0x4d0e6355875485480c43f2d6e94fbf4bf287921c` |
| Cardano Preprod | `2273266` | `addr_test1wp4erajtev047rws58fdj6gz6hpvh53wlk7ccc65sld5xusx4z54g` |
| Midnight Preview | `64364450` | `471dfe55c866fdbc085c9011a51f0cd0e9c9bfca6bb985c35f7716b6e73e485c` |
| Stellar Testnet | `5555555555` | `CAMRA4FFQUG3XBVNPE2NZGDX5MGOX4OWODMNOXD3WODOQLPBQG4RPMAQ` |

## Mainnets

| Network | Chain ID | Gateway Address |
|---|---|---|
| Arbitrum One | `42161` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| Arc | `5042` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| Avalanche | `43114` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| Base | `8453` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| Berachain | `80094` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| BOB | `60808` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| BSC | `56` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| Cardano | `2273265` | `addr1w8jacv9c2a0qs55rnx9y37up9fgkf44yqrylcp05mta5tygf67l6y` |
| CELO | `42220` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| Cronos | `25` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| Ethereum | `1` | `0xf77d64586538339e8ed6ef9a3154ad939ef5a79a` |
| Etherlink | `42793` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| Gnosis | `100` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| Ink | `57073` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| Kaia | `8217` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| Katana | `747474` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| Linea | `59144` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| Mantle | `5000` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| Mega ETH | `4326` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| Midnight | `64364449` | `65023744190a4fc7c8ac9a3dfbc8cfc28f63d2aaa431ceda1d88fdb9a096a6a1` |
| Monad | `143` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| Morph | `2818` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| OP BNB | `204` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| Optimism | `10` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| PandaSea | `7776` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| Pharos | `1672` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| Plasma | `9745` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| Plume | `98866` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| Polygon | `137` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| PulseChain | `369` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| Robinhood | `4663` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| Ronin | `2020` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| Scroll | `534352` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| Sei | `1329` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| Soneium | `1868` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| Sonic | `146` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| Stable | `988` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| Stellar | `5731147` | `CB4TJPBTN6L72FGJLL2ZQHMKUZVSETA4N7HO6KFM4I27MMVOJ2UUEEWL` |
| Tempo | `4217` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| Unichain | `130` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| Upside | `61873` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| Worldchain | `480` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| X Layer | `196` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |
| ZKsync Era | `324` | `0xdd19500d7022f03ed51938e3a336e922fe982a56` |

Additional mainnet gateways are being rolled out — this table is updated as each deployment goes live.

## Adding a New Network

If you need support for a network not currently listed, visit [vialabs.tech](https://vialabs.tech) and click the **Onboarding Assistance** button in the top right corner to submit a request.
