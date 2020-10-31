# Token² Curated Registry

The Kleros-powered [token curated list of tokens](https://tokens.kleros.io).

## Get The List

Do you just want the list of tokens? Here you go: [https://t2crtokens.eth.link](https://t2crtokens.eth.link).

The one caveat is the following: This list follows the Uniswap's token lists schema where the decimals field is obligatory. Tokens that revert when the `decimals()` function of its contract is called will not be included in this list unless there is an accepted submission for it in the [Token Decimals TCR](https://curate.kleros.io/tcr/0x8eFfF9BB64ED3d766a26a18e873cf171E67BeCf2).

## Important

Keep in mind that the T2CR is a registry that enforces correctness of the token information. If you want a list of tokens that adhere to extra information (such as bug-free, secure, decentralized, non scam tokens) you should look into token badges.

For more in-depth knowledge into the criteria, see the listing policies of the T2CR and each badge.
Below are some listing criteria as of 31st of October 2020. For the latest criteria visit [tokens.kleros.io](tokens.kleros.io) or see the latest `MetaEvidence` event emitted by the TCR contract (addresses in the `Deployed Contracts` section).
- [T2CR](https://ipfs.kleros.io/ipfs/QmbqgkZoGu7jJ8nTqee4NypEhK7YVBEJJmPJbJxz8Bx8nY/t2cr-primary-doc.pdf)
- [ERC20](https://ipfs.kleros.io/ipfs/QmTgWyAp642wEkCMFj3XyoJTMrTFBtW82c3f3ZsVqRRERa/erc20-standard-token-badge-primary-document.pdf)
- [Stablecoin](https://ipfs.kleros.io/ipfs/QmazSC1jtkTyK1WJMG92SSz3aHUjBcYTMDxo3oFinH9QhL/stablecoin-badge.pdf)
- [TrueCryptosystem](https://ipfs.kleros.io/ipfs/QmVEbT5LktUzdfmqqpgTdZx88oNuij8JC128oXkQpSocqb/true-cryptosystem-badge.pdf)

## Fetch From The Contract

Learn how to fetch tokens with a given badge from the example below:

[![Edit T2CR and Badges](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/t2cr-and-badges-nyqi6?fontsize=14)

## Important
On the example above, we make use of a view contract (a contract that does not have any functions that write to storage) to return token information in batches and also return the number of decimal places published by the contract.

The ERC20 standard however, **does not** require that token contracts implement the `decimals()` function. In these cases (like the DGD token), the view contract of the example will return the field with the value `0` and so you must take special care if you want to use this.

## Deployed Contracts

### Mainnet
- [T²CR Contract](https://etherscan.io/address/0xebcf3bca271b26ae4b162ba560e243055af0e679#contracts)
- [Ethfinex Listing Badge](https://etherscan.io/address/0x916deab80dfbc7030277047cd18b233b3ce5b4ab#contracts)
- [ERC20 Standard Badge](https://etherscan.io/address/0xcb4aae35333193232421e86cd2e9b6c91f3b125f#contracts)
- [View Contract](https://etherscan.io/address/0xdc06b2e32399d3db41e69da4d112cf85dde4103f#code)

### Kovan
- [T²CR Contract](https://kovan.etherscan.io/address/0x25dd2659a1430cdbd678615c7409164ae486c146#code)
- [Ethfinex Listing Badge](https://kovan.etherscan.io/address/0x78895ec026aeff2db73bc30e623c39e1c69b1386#contracts)
- [ERC20 Standard Badge](https://kovan.etherscan.io/address/0xd58bdd286e8155b6223e2a62932ae3e0a9a75759#contracts)