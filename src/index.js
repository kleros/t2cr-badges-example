import React, { Component } from "react";
import ReactDOM from "react-dom";
import Web3 from "web3";

import { t2crABI, badgeABI } from "./abis";

import "./styles.css";

class App extends Component {
  state = {
    web3: null,
    tokenData: null,
    t2crContract: null,
    badgeContract: null
  };

  componentDidMount() {
    const web3 = new Web3(window.web3.currentProvider);
    const t2crContract = new web3.eth.Contract(
      t2crABI,
      "0x7a2e4142f573994f76ffe9d8236ba141beed2810"
    );
    const badgeContract = new web3.eth.Contract(
      badgeABI,
      "0x1f28f15360c4ebbec6abf90ae57fabe7423d040c"
    );
    this.setState({ web3, t2crContract, badgeContract });
  }

  fetchData = async () => {
    const { t2crContract, badgeContract } = this.state;

    // Get tokens addresses that have the badge.
    let tokensWithBadges = (await badgeContract.methods
      .queryAddresses(
        "0x0000000000000000000000000000000000000000", // A token address to start/end the query from. Set to zero means unused.
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
        true // Return oldest first.
      )
      .call()).values;

    // Since the contract returns fixed sized arrays, we must filter unused items.
    tokensWithBadges = tokensWithBadges.filter(
      address => address !== "0x0000000000000000000000000000000000000000"
    );
    // Construct and add addresses the response object.
    const tokenData = {};
    tokensWithBadges.forEach(address => {
      tokenData[address] = {};
    });

    // Fetch all token IDs for each address.
    await Promise.all(
      tokensWithBadges.map(async address => {
        let tokenIDs = (await t2crContract.methods
          .queryTokens(
            "0x0000000000000000000000000000000000000000", // A token address to start/end the query from. Set to zero means unused.
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
            true,
            address // Return oldest first.
          )
          .call()).values;

        // As with addresses, the contract returns a fixed sized array so it is necessary to filter out unused slots.
        tokenIDs = tokenIDs.filter(
          tokenID =>
            tokenID !==
            "0x0000000000000000000000000000000000000000000000000000000000000000"
        );
        // Add token IDs to the information object.
        tokenIDs.forEach(tokenID => {
          tokenData[address] = {
            ...tokenData[address],
            [tokenID]: {
              ...tokenData[address][tokenID],
              [tokenID]: {}
            }
          };
        });
      })
    );

    // With the token IDs, get the information and add it to the object.
    await Promise.all(
      Object.keys(tokenData).map(
        async address =>
          await Promise.all(
            Object.keys(tokenData[address]).map(async tokenID => {
              tokenData[address][
                tokenID
              ] = await t2crContract.methods.getTokenInfo(tokenID).call();
            })
          )
      )
    );
    this.setState({ tokenData });
  };

  render() {
    const { web3, tokenData } = this.state;
    if (!web3)
      return (
        <div>
          <h1>Waiting Metamask</h1>
          <small>
            <h5>
              Remeber to have metamask installed and set to the Kovan testnet.
            </h5>
          </small>
        </div>
      );
    else
      return (
        <div className="text-center body">
          <div id="metamask-loaded">
            <div className="fetch-tokens">
              <h1 className="h3 mb-3 font-weight-normal">
                Fetch Tokens With Badges
              </h1>
              <small>Remeber to set metamask network to Kovan</small>
              <br />
              <br />
              <button
                className="btn btn-primary btn-block"
                onClick={this.fetchData}
                type="button"
              >
                Fetch All
              </button>
              <br />
            </div>
            {tokenData && (
              <div className="output">
                <pre id="data-display">
                  {JSON.stringify(tokenData, null, 2)}
                </pre>
                <div id="symbols">
                  {Object.keys(tokenData).map(address => {
                    return Object.keys(tokenData[address]).map(tokenID => {
                      const { symbolMultihash } = tokenData[address][tokenID];
                      return (
                        <img
                          key={tokenID}
                          src={`https://staging-cfs.s3.us-east-2.amazonaws.com/${symbolMultihash}`}
                          className="img-thumbnail symbol"
                          alt="symbol"
                        />
                      );
                    });
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
