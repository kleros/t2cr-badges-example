# T²CR Documentation

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

## Development

Assuming you have Python already, install MkDocs:

1. `pip install mkdocs`
2. `mkdocs serve`

Open up http://127.0.0.1:8000/ in your web browser to see the docs documentation.