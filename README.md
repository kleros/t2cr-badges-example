# Token² Curated Registry & Badges

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

> Note: Since metamask's web3 js doesn't provide a Promise enabled api, callback functions are wrapped in Promises manually:
> ```
>const promisify = (inner) =>
>  new Promise((resolve, reject) =>
>    inner((err, res) => {
>      if (err)
>        reject(err)
>      else
>        resolve(res)
>    })
>  )
>```


With both instances, we can query the contracts to get token information:

1. Fetch a batch of token addresses that have either the "Registered" or "ClearingRequested" status, as both mean that the token has the badge.

```
const addresses = (await promisify(cb =>
    badgeContract.queryAddresses(
      0, // A token address to start/end the query from. Set to zero means unused.
      10, // Number of items to return at once.
      [
        false, // Do not include absent tokens.
        true, // Include registered tokens.
        false, // Do not include tokens with registration requests.
        true, // Include tokens with clearing requests.
        false, // Do not include tokens with challenged registration requests.
        true, // Include tokens with challenged clearing requests.
        false, // Include token if caller is the author of a pending request.
        false // Include token if caller is the challenger of a pending request.
      ],
      true, // Return oldest first.
      cb
    )
  ))[0]
    .filter(address => address !== '0x0000000000000000000000000000000000000000')
```
2. Fetch all token IDs for those addresses from the T2CR:

```
// Fetch token IDs
  const tokenIDPromises = addresses.map(address => promisify(cb =>
    t2cr.queryTokens(
      0, // Whether to start/end the query from/at some token.
      10, // Number of items to return at once.
      [
        false, // Do not include absent tokens.
        true, // Include registered tokens.
        false, // Do not include tokens with registration requests.
        true, // Include tokens with clearing requests.
        false, // Do not include tokens with challenged registration requests.
        true, // Include tokens with challenged clearing requests.
        false, // Include token if caller is the author of a pending request.
        false // Include token if caller is the challenger of a pending request.
      ],
      true, // Return oldest first.
      address, // The token address.
      cb)
  )
  )
  const addressIDArr = await Promise.all(tokenIDPromises)
  const tokenIDs = []
  addressIDArr.forEach((addrs, i) => {
    addrs[0].filter(tokenID => tokenID !== '0x0000000000000000000000000000000000000000000000000000000000000000')
      .forEach(tokenID => {
        tokensData[Object.keys(tokensData)[i]][tokenID] = {}
        tokenIDs.push(tokenID)
      })
  })
```

3. Once we have token IDs, fetch token information for each one and add it to the displayed object.

```
const tokenInfoPromises = tokenIDs.map(tokenID => promisify(cb => t2cr.getTokenInfo(tokenID, cb)))
const tokenInfos = await Promise.all(tokenInfoPromises)
tokenIDs.forEach((tokenID, i) => {
  const tokenInfo = {
    name: tokenInfos[i][0],
    ticker: tokenInfos[i][1],
    addr: tokenInfos[i][2],
    symbolMultihash: tokenInfos[i][3],
    networkID: tokenInfos[i][4]
  }
  tokensData[tokenInfo.addr][tokenID] = tokenInfo
})
```
## Symbol Multihash and Token Image.

The returned data includes the field `symbolMultihash`. This is value is a commitment to the image with the symbol of a token (more information below). With it, the token symbol can be fetched from an off-chain storage. Example.:

`https://staging-cfs.s3.us-east-2.amazonaws.com/BcczM5HCLj24wSWU6tDUpnVrbrxJNj7dwdjnUkaRpLXDFztUMjuMRfESGgYfW5guE3yXYAP71awL39LmSixrSMYgig`



## Computing a token's ID

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
