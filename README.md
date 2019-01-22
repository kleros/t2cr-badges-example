# Tokens² Curated List & Badges

This demo demonstrates how to fetch all tokens with badges using only Metamask.
Please run `yarn` followed by `yarn start`. The html must be served as Metamask won't interact with `file://`.

Also make sure you have metamask unlocked on the Kovan network.

## Code comments

There are two TCR contracts with which we must interact:

- T2CR contract: Contains all submissions for each token address.
- Badge contract: Contains all addresses that have a badge.

We provide the abi for both contracts and instantiate them.


```
// Setup contracts.
const { web3 } = window
const t2cr = web3.eth.contract(t2crABI()).at('0x6c09d067bc434a4c9d2689e5ae58bed4cfb5711c')
const badgeContract = web3.eth.contract(badgeContractABI()).at('0x3122520ba9fcc100930e399a5ae021dd281ca949')

const tokenData = {}
```

Note: Since metamask's web3 js doesn't provide a Promise enabled api, we are must use callbacks and update the tokenData object manually. In production you should use an instance with supported async/await.

With both instances, we can query the contracts to get token information:

1. Fetch a batch of token addresses that have either the "Registered" or "ClearingRequested" status, as both mean that the token has the badge.

```
function fetchAllBadges() {
    // Return all token addresses that have the badge.
    badgeContract.queryAddresses(
        0,         // A token address to start/end the query from. Set to zero means unused.
        10,        // Number of items to return at once.
        [
            false, // Do not include absent tokens.
            true,  // Include registered tokens.
            false, // Do not include tokens with registration requests.
            true,  // Include tokens with clearing requests.
            false, // Do not include tokens with challenged registration requests.
            true,  // Include tokens with challenged clearing requests.
            false, // Include token if caller is the author of a pending request.
            false  // Include token if caller is the challenger of a pending request.
        ],
        true,      // Return oldest first.
        (err, data) => {
            if (err) throw err
            const addresses = data[0].filter(tokenAddr => tokenAddr != '0x0000000000000000000000000000000000000000')
            fetchTokenIDs(addresses) // Fetch tokenIDs
        }
    )
}
```
2. Fetch all token IDs for those addresses from the T2CR:

```
function fetchTokenIDs(addresses) {
    for (let addr of addresses) {
        // Return token information for every submission of an address
        t2cr.queryTokens(
            0,         // Whether to start/end the query from/at some token.
            10,        // Number of items to return at once.
            [
                false, // Do not include absent tokens.
                true,  // Include registered tokens.
                false, // Do not include tokens with registration requests.
                true,  // Include tokens with clearing requests.
                false, // Do not include tokens with challenged registration requests.
                true,  // Include tokens with challenged clearing requests.
                false, // Include token if caller is the author of a pending request.
                false  // Include token if caller is the challenger of a pending request.
            ],
            true,      // Return oldest first.
            addr,      // The token address.'
            (err, data) => {
                if (err) throw err
                const tokenIDs = data[0].filter(tokenID => tokenID != '0x0000000000000000000000000000000000000000000000000000000000000000')
                for (let tokenID of tokenIDs)
                    fetchTokenData(tokenID, addr)
            }
        )
    }
}
```

3. Once we have tokenIDs, fetch token information for each one and add it to the displayed object.

```
function fetchTokenData(tokenID, addr) {
    t2cr.getTokenInfo(tokenID, (err, data) => {
        if (err) throw err

        // Add information to the tokenData object.
        tokenData[addr] = {
            ...tokenData[addr],
            [tokenID]: data
        }
        const output = document.getElementById('data-display')
        output.innerHTML = JSON.stringify(tokenData, undefined, 2)
        output.style.visibility = 'visible'
    })
}
```


## T²CR Contract.

### Is an item on the list?

The Token² Curated List implements [Permission Interface](https://github.com/kleros/kleros-interaction/blob/master/contracts/standard/permission/PermissionInterface.sol). This means anyone can check if a token is on the list by calling `isPermitted(bytes32 _value)` where `_value` is the `keccac256` hash of the token's [tighly packed](https://solidity.readthedocs.io/en/develop/abi-spec.html#non-standard-packed-mode) data:

- name
- ticker
- address // The token's Ethereum address, if it is running on an EVM based network.
- symbolMultihash // Multihash of the token's symbol image.
- networkID // The ID of the token's network. ETH if the token is deployed on the Ethereum mainnet.

This can be computed with web3js 1.0 [`soliditySha3()`](https://web3js.readthedocs.io/en/1.0/web3-utils.html?highlight=soliditySha3#soliditysha3) function. See example below:

```
const ID = web3.utils.soliditySha3(
    'Pinakion',
    'PNK',
    '0x93ED3FBe21207Ec2E8f2d3c3de6e058Cb73Bc04d',
    '0x9638d9a8ac3eceb75dac165d34448d13fbb7b079a22aabe70309b23616ef35cc',
    'ETH'
)
```

> **Tip**: You can use the [archon](https://archon.readthedocs.io/en/latest/hashing.html) library provided by Kleros to calculate multihashes:

`const fileMultihash = archon.utils.multihashFile(fileData, 0x1b) // keccak-256`
