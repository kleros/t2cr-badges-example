# Token² Curated Registry

The Kleros-powered token curated list of tokens.

## Quick Start

Learn how to fetch tokens with a given badge from the example below:

[![Edit T2CR and Badges](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/t2cr-and-badges-nyqi6?fontsize=14)

## Important
On the example above, we make use of a view contract (a contract that does not have any functions that write to storage) to return token information in batches and also return the number of decimal places published by the contract.

The ERC20 standard however, **does not** require that token contracts implement the `decimals()` function. In these cases (like the DGD token), the view contract of the example will return the field with the value `0` and so you must take special care if you want to use this.

