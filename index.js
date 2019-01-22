// Setup contracts.
const { web3 } = window
const t2cr = web3.eth.contract(t2crABI()).at('0x7a2e4142f573994f76ffe9d8236ba141beed2810')
const badgeContract = web3.eth.contract(badgeContractABI()).at('0x1f28f15360c4ebbec6abf90ae57fabe7423d040c')


async function fetchAllBadges() {
    // Return all token addresses that have the badge.
    const tokensData = {}
    const addresses = (await promisify(cb =>
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
            cb
        )
    ))[0]
        .filter(address => address !== '0x0000000000000000000000000000000000000000')

    addresses.forEach(address => {tokensData[address] = {}})

    const tokenIDPromises = addresses.map(address => promisify(cb =>
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
            address,   // The token address.'
            cb)
    )
    )

    const addressIDArr = await Promise.all(tokenIDPromises)
    const tokenIDs = []
    addressIDArr.forEach((addrs, index) => {
        addrs[0].filter(tokenID => tokenID !== '0x0000000000000000000000000000000000000000000000000000000000000000')
            .forEach(tokenID => {
                tokensData[Object.keys(tokensData)[index]][tokenID] = {}
                tokenIDs.push(tokenID)
            })
    })

    const tokenInfoPromises = promisify(cb => t2cr.getTokenInfo(tokenID, cb))
    Object.keys(tokensData).forEach(address => {
        Object.keys(tokensData[address]).forEach(async tokenID => {
            const tokenData = await promisify(cb =>
                t2cr.getTokenInfo(tokenID, cb)
            )
            tokensData[address][tokenID] = tokenData
        })
    })

    const output = document.getElementById('data-display')
    output.innerHTML = JSON.stringify(tokensData, undefined, 2)
    output.style.visibility = 'visible'
}

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

const promisify = (inner) =>
    new Promise((resolve, reject) =>
        inner((err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        })
    )

function t2crABI() {
    return [
        {
            "constant": true,
            "inputs": [],
            "name": "challengePeriodDuration",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "governor",
            "outputs": [
                {
                    "name": "",
                    "type": "address"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "arbitratorExtraData",
            "outputs": [
                {
                    "name": "",
                    "type": "bytes"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "loserStakeMultiplier",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "challengeReward",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "sharedStakeMultiplier",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "tokensList",
            "outputs": [
                {
                    "name": "",
                    "type": "bytes32"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "arbitrator",
            "outputs": [
                {
                    "name": "",
                    "type": "address"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "",
                    "type": "address"
                },
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "addressToSubmissions",
            "outputs": [
                {
                    "name": "",
                    "type": "bytes32"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "winnerStakeMultiplier",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "",
                    "type": "bytes32"
                }
            ],
            "name": "tokens",
            "outputs": [
                {
                    "name": "name",
                    "type": "string"
                },
                {
                    "name": "ticker",
                    "type": "string"
                },
                {
                    "name": "addr",
                    "type": "address"
                },
                {
                    "name": "symbolMultihash",
                    "type": "string"
                },
                {
                    "name": "networkID",
                    "type": "string"
                },
                {
                    "name": "status",
                    "type": "uint8"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "MULTIPLIER_PRECISION",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "disputeIDToTokenID",
            "outputs": [
                {
                    "name": "",
                    "type": "bytes32"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "arbitrationFeesWaitingTime",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "name": "_arbitrator",
                    "type": "address"
                },
                {
                    "name": "_arbitratorExtraData",
                    "type": "bytes"
                },
                {
                    "name": "_metaEvidence",
                    "type": "string"
                },
                {
                    "name": "_governor",
                    "type": "address"
                },
                {
                    "name": "_arbitrationFeesWaitingTime",
                    "type": "uint256"
                },
                {
                    "name": "_challengeReward",
                    "type": "uint256"
                },
                {
                    "name": "_challengePeriodDuration",
                    "type": "uint256"
                },
                {
                    "name": "_sharedStakeMultiplier",
                    "type": "uint256"
                },
                {
                    "name": "_winnerStakeMultiplier",
                    "type": "uint256"
                },
                {
                    "name": "_loserStakeMultiplier",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "_requester",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "_challenger",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "_tokenID",
                    "type": "bytes32"
                },
                {
                    "indexed": false,
                    "name": "_status",
                    "type": "uint8"
                },
                {
                    "indexed": false,
                    "name": "_disputed",
                    "type": "bool"
                }
            ],
            "name": "TokenStatusChange",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "_tokenID",
                    "type": "bytes32"
                },
                {
                    "indexed": true,
                    "name": "_contributor",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "_side",
                    "type": "uint8"
                },
                {
                    "indexed": false,
                    "name": "_value",
                    "type": "uint256"
                }
            ],
            "name": "Contribution",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "_tokenID",
                    "type": "bytes32"
                },
                {
                    "indexed": true,
                    "name": "_challenger",
                    "type": "address"
                }
            ],
            "name": "ChallengeDepositPlaced",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "_tokenID",
                    "type": "bytes32"
                },
                {
                    "indexed": true,
                    "name": "_contributor",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "_request",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "name": "_round",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "name": "_value",
                    "type": "uint256"
                }
            ],
            "name": "RewardWithdrawal",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "_metaEvidenceID",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "name": "_evidence",
                    "type": "string"
                }
            ],
            "name": "MetaEvidence",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "_arbitrator",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "_disputeID",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "name": "_metaEvidenceID",
                    "type": "uint256"
                }
            ],
            "name": "Dispute",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "_arbitrator",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "_disputeID",
                    "type": "uint256"
                },
                {
                    "indexed": true,
                    "name": "_party",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "_evidence",
                    "type": "string"
                }
            ],
            "name": "Evidence",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "_arbitrator",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "_disputeID",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "name": "_ruling",
                    "type": "uint256"
                }
            ],
            "name": "Ruling",
            "type": "event"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_name",
                    "type": "string"
                },
                {
                    "name": "_ticker",
                    "type": "string"
                },
                {
                    "name": "_addr",
                    "type": "address"
                },
                {
                    "name": "_symbolMultihash",
                    "type": "string"
                },
                {
                    "name": "_networkID",
                    "type": "string"
                }
            ],
            "name": "requestStatusChange",
            "outputs": [],
            "payable": true,
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_tokenID",
                    "type": "bytes32"
                }
            ],
            "name": "challengeRequest",
            "outputs": [],
            "payable": true,
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_tokenID",
                    "type": "bytes32"
                },
                {
                    "name": "_side",
                    "type": "uint8"
                }
            ],
            "name": "fundLatestRound",
            "outputs": [],
            "payable": true,
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_tokenID",
                    "type": "bytes32"
                },
                {
                    "name": "_request",
                    "type": "uint256"
                },
                {
                    "name": "_round",
                    "type": "uint256"
                }
            ],
            "name": "withdrawFeesAndRewards",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_tokenID",
                    "type": "bytes32"
                }
            ],
            "name": "timeout",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_disputeID",
                    "type": "uint256"
                },
                {
                    "name": "_ruling",
                    "type": "uint256"
                }
            ],
            "name": "rule",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_tokenID",
                    "type": "bytes32"
                },
                {
                    "name": "_evidence",
                    "type": "string"
                }
            ],
            "name": "submitEvidence",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_challengePeriodDuration",
                    "type": "uint256"
                }
            ],
            "name": "changeTimeToChallenge",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_challengeReward",
                    "type": "uint256"
                }
            ],
            "name": "changeChallengeReward",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_governor",
                    "type": "address"
                }
            ],
            "name": "changeGovernor",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_arbitrationFeesWaitingTime",
                    "type": "uint256"
                }
            ],
            "name": "changeArbitrationFeesWaitingTime",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_sharedStakeMultiplier",
                    "type": "uint256"
                }
            ],
            "name": "changeSharedStakeMultiplier",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_winnerStakeMultiplier",
                    "type": "uint256"
                }
            ],
            "name": "changeWinnerStakeMultiplier",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_loserStakeMultiplier",
                    "type": "uint256"
                }
            ],
            "name": "changeLoserStakeMultiplier",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_tokenID",
                    "type": "bytes32"
                }
            ],
            "name": "isPermitted",
            "outputs": [
                {
                    "name": "allowed",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_tokenID",
                    "type": "bytes32"
                }
            ],
            "name": "getTokenInfo",
            "outputs": [
                {
                    "name": "name",
                    "type": "string"
                },
                {
                    "name": "ticker",
                    "type": "string"
                },
                {
                    "name": "addr",
                    "type": "address"
                },
                {
                    "name": "symbolMultihash",
                    "type": "string"
                },
                {
                    "name": "networkID",
                    "type": "string"
                },
                {
                    "name": "status",
                    "type": "uint8"
                },
                {
                    "name": "numberOfRequests",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_tokenID",
                    "type": "bytes32"
                },
                {
                    "name": "_request",
                    "type": "uint256"
                }
            ],
            "name": "getRequestInfo",
            "outputs": [
                {
                    "name": "disputed",
                    "type": "bool"
                },
                {
                    "name": "disputeID",
                    "type": "uint256"
                },
                {
                    "name": "submissionTime",
                    "type": "uint256"
                },
                {
                    "name": "challengeRewardBalance",
                    "type": "uint256"
                },
                {
                    "name": "challengerDepositTime",
                    "type": "uint256"
                },
                {
                    "name": "resolved",
                    "type": "bool"
                },
                {
                    "name": "parties",
                    "type": "address[3]"
                },
                {
                    "name": "numberOfRounds",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_tokenID",
                    "type": "bytes32"
                },
                {
                    "name": "_request",
                    "type": "uint256"
                },
                {
                    "name": "_round",
                    "type": "uint256"
                }
            ],
            "name": "getRoundInfo",
            "outputs": [
                {
                    "name": "appealed",
                    "type": "bool"
                },
                {
                    "name": "oldWinnerTotalCost",
                    "type": "uint256"
                },
                {
                    "name": "paidFees",
                    "type": "uint256[3]"
                },
                {
                    "name": "requiredForSide",
                    "type": "uint256[3]"
                },
                {
                    "name": "totalContributed",
                    "type": "uint256[3]"
                },
                {
                    "name": "feeRewards",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_tokenID",
                    "type": "bytes32"
                },
                {
                    "name": "_request",
                    "type": "uint256"
                },
                {
                    "name": "_round",
                    "type": "uint256"
                },
                {
                    "name": "_contributor",
                    "type": "address"
                }
            ],
            "name": "getContributions",
            "outputs": [
                {
                    "name": "contributions",
                    "type": "uint256[3]"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "tokenCount",
            "outputs": [
                {
                    "name": "count",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "countByStatus",
            "outputs": [
                {
                    "name": "disputed",
                    "type": "uint256"
                },
                {
                    "name": "absent",
                    "type": "uint256"
                },
                {
                    "name": "registered",
                    "type": "uint256"
                },
                {
                    "name": "registrationRequested",
                    "type": "uint256"
                },
                {
                    "name": "clearingRequested",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_cursor",
                    "type": "bytes32"
                },
                {
                    "name": "_count",
                    "type": "uint256"
                },
                {
                    "name": "_filter",
                    "type": "bool[8]"
                },
                {
                    "name": "_oldestFirst",
                    "type": "bool"
                },
                {
                    "name": "_tokenAddr",
                    "type": "address"
                }
            ],
            "name": "queryTokens",
            "outputs": [
                {
                    "name": "values",
                    "type": "bytes32[]"
                },
                {
                    "name": "hasMore",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        }
    ]
}

function badgeContractABI() {
    return [
        {
            "constant": true,
            "inputs": [],
            "name": "challengePeriodDuration",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "governor",
            "outputs": [
                {
                    "name": "",
                    "type": "address"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "arbitratorExtraData",
            "outputs": [
                {
                    "name": "",
                    "type": "bytes"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "loserStakeMultiplier",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "disputeIDToAddress",
            "outputs": [
                {
                    "name": "",
                    "type": "address"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "challengeReward",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "sharedStakeMultiplier",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "arbitrator",
            "outputs": [
                {
                    "name": "",
                    "type": "address"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "winnerStakeMultiplier",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "addresses",
            "outputs": [
                {
                    "name": "status",
                    "type": "uint8"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "MULTIPLIER_PRECISION",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "addressList",
            "outputs": [
                {
                    "name": "",
                    "type": "address"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "arbitrationFeesWaitingTime",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "name": "_arbitrator",
                    "type": "address"
                },
                {
                    "name": "_arbitratorExtraData",
                    "type": "bytes"
                },
                {
                    "name": "_metaEvidence",
                    "type": "string"
                },
                {
                    "name": "_governor",
                    "type": "address"
                },
                {
                    "name": "_arbitrationFeesWaitingTime",
                    "type": "uint256"
                },
                {
                    "name": "_challengeReward",
                    "type": "uint256"
                },
                {
                    "name": "_challengePeriodDuration",
                    "type": "uint256"
                },
                {
                    "name": "_sharedStakeMultiplier",
                    "type": "uint256"
                },
                {
                    "name": "_winnerStakeMultiplier",
                    "type": "uint256"
                },
                {
                    "name": "_loserStakeMultiplier",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "_requester",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "_challenger",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "_address",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "_status",
                    "type": "uint8"
                },
                {
                    "indexed": false,
                    "name": "_disputed",
                    "type": "bool"
                }
            ],
            "name": "AddressStatusChange",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "_address",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "_contributor",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "_side",
                    "type": "uint8"
                },
                {
                    "indexed": false,
                    "name": "_value",
                    "type": "uint256"
                }
            ],
            "name": "Contribution",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "_address",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "_challenger",
                    "type": "address"
                }
            ],
            "name": "ChallengeDepositPlaced",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "_address",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "_contributor",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "_request",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "name": "_round",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "name": "_value",
                    "type": "uint256"
                }
            ],
            "name": "RewardWithdrawal",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "_metaEvidenceID",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "name": "_evidence",
                    "type": "string"
                }
            ],
            "name": "MetaEvidence",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "_arbitrator",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "_disputeID",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "name": "_metaEvidenceID",
                    "type": "uint256"
                }
            ],
            "name": "Dispute",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "_arbitrator",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "_disputeID",
                    "type": "uint256"
                },
                {
                    "indexed": true,
                    "name": "_party",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "_evidence",
                    "type": "string"
                }
            ],
            "name": "Evidence",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "_arbitrator",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "_disputeID",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "name": "_ruling",
                    "type": "uint256"
                }
            ],
            "name": "Ruling",
            "type": "event"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_address",
                    "type": "address"
                }
            ],
            "name": "requestStatusChange",
            "outputs": [],
            "payable": true,
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_address",
                    "type": "address"
                }
            ],
            "name": "challengeRequest",
            "outputs": [],
            "payable": true,
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_address",
                    "type": "address"
                },
                {
                    "name": "_side",
                    "type": "uint8"
                }
            ],
            "name": "fundLatestRound",
            "outputs": [],
            "payable": true,
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_address",
                    "type": "address"
                },
                {
                    "name": "_request",
                    "type": "uint256"
                },
                {
                    "name": "_round",
                    "type": "uint256"
                }
            ],
            "name": "withdrawFeesAndRewards",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_address",
                    "type": "address"
                }
            ],
            "name": "timeout",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_disputeID",
                    "type": "uint256"
                },
                {
                    "name": "_ruling",
                    "type": "uint256"
                }
            ],
            "name": "rule",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_address",
                    "type": "address"
                },
                {
                    "name": "_evidence",
                    "type": "string"
                }
            ],
            "name": "submitEvidence",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_challengePeriodDuration",
                    "type": "uint256"
                }
            ],
            "name": "changeTimeToChallenge",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_challengeReward",
                    "type": "uint256"
                }
            ],
            "name": "changeChallengeReward",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_governor",
                    "type": "address"
                }
            ],
            "name": "changeGovernor",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_arbitrationFeesWaitingTime",
                    "type": "uint256"
                }
            ],
            "name": "changeArbitrationFeesWaitingTime",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_sharedStakeMultiplier",
                    "type": "uint256"
                }
            ],
            "name": "changeSharedStakeMultiplier",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_winnerStakeMultiplier",
                    "type": "uint256"
                }
            ],
            "name": "changeWinnerStakeMultiplier",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_loserStakeMultiplier",
                    "type": "uint256"
                }
            ],
            "name": "changeLoserStakeMultiplier",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_value",
                    "type": "bytes32"
                }
            ],
            "name": "isPermitted",
            "outputs": [
                {
                    "name": "allowed",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_address",
                    "type": "address"
                },
                {
                    "name": "_request",
                    "type": "uint256"
                }
            ],
            "name": "getRequestInfo",
            "outputs": [
                {
                    "name": "disputed",
                    "type": "bool"
                },
                {
                    "name": "disputeID",
                    "type": "uint256"
                },
                {
                    "name": "submissionTime",
                    "type": "uint256"
                },
                {
                    "name": "challengeRewardBalance",
                    "type": "uint256"
                },
                {
                    "name": "challengerDepositTime",
                    "type": "uint256"
                },
                {
                    "name": "resolved",
                    "type": "bool"
                },
                {
                    "name": "parties",
                    "type": "address[3]"
                },
                {
                    "name": "numberOfRounds",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_address",
                    "type": "address"
                },
                {
                    "name": "_request",
                    "type": "uint256"
                },
                {
                    "name": "_round",
                    "type": "uint256"
                }
            ],
            "name": "getRoundInfo",
            "outputs": [
                {
                    "name": "appealed",
                    "type": "bool"
                },
                {
                    "name": "oldWinnerTotalCost",
                    "type": "uint256"
                },
                {
                    "name": "paidFees",
                    "type": "uint256[3]"
                },
                {
                    "name": "requiredForSide",
                    "type": "uint256[3]"
                },
                {
                    "name": "totalContributed",
                    "type": "uint256[3]"
                },
                {
                    "name": "feeRewards",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_address",
                    "type": "address"
                },
                {
                    "name": "_request",
                    "type": "uint256"
                },
                {
                    "name": "_round",
                    "type": "uint256"
                },
                {
                    "name": "_contributor",
                    "type": "address"
                }
            ],
            "name": "getContributions",
            "outputs": [
                {
                    "name": "contributions",
                    "type": "uint256[3]"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "addressCount",
            "outputs": [
                {
                    "name": "count",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "countByStatus",
            "outputs": [
                {
                    "name": "disputed",
                    "type": "uint256"
                },
                {
                    "name": "absent",
                    "type": "uint256"
                },
                {
                    "name": "registered",
                    "type": "uint256"
                },
                {
                    "name": "registrationRequested",
                    "type": "uint256"
                },
                {
                    "name": "clearingRequested",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_cursor",
                    "type": "address"
                },
                {
                    "name": "_count",
                    "type": "uint256"
                },
                {
                    "name": "_filter",
                    "type": "bool[8]"
                },
                {
                    "name": "_oldestFirst",
                    "type": "bool"
                }
            ],
            "name": "queryAddresses",
            "outputs": [
                {
                    "name": "values",
                    "type": "address[]"
                },
                {
                    "name": "hasMore",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        }
    ]
}

