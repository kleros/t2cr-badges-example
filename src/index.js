import React, { Component } from "react";
import ReactDOM from "react-dom";
import Web3 from "web3";

import { t2crABI, badgeABI } from "./abis";

import "./styles.css";

const zeroAddress = "0x0000000000000000000000000000000000000000";
const zeroSubmissionID =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
const filter = [
  false, // Do not include tokens which are not on the TCR.
  true, // Include registered tokens.
  false, // Do not include tokens with pending registration requests.
  true, // Include tokens with pending clearing requests.
  false, // Do not include tokens with challenged registration requests.
  true, // Include tokens with challenged clearing requests.
  false, // Include token if caller is the author of a pending request.
  false // Include token if caller is the challenger of a pending request.
];

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

    // Fetch addresses of tokens that have the badge.
    // Since the contract returns fixed sized arrays, we must filter out unused items.
    const addressesWithBadge = (await badgeContract.methods
      .queryAddresses(
        zeroAddress, // A token address to start/end the query from. Set to zero means unused.
        100, // Number of items to return at once.
        filter,
        true // Return oldest first.
      )
      .call()).values.filter(address => address !== zeroAddress);

    // Fetch their submission IDs on the T2CR.
    // As with addresses, the contract returns a fixed sized array so we filter out unused slots.
    const submissionIDs = [].concat(
      ...(await Promise.all(
        addressesWithBadge.map(address =>
          t2crContract.methods
            .queryTokens(
              zeroSubmissionID, // A token ID from which to start/end the query from. Set to zero means unused.
              100, // Number of items to return at once.
              filter,
              true, // Return oldest first.
              address // The token address for which to return the submissions.
            )
            .call()
            .then(res => res.values.filter(ID => ID !== zeroSubmissionID))
        )
      ))
    );

    // With the token IDs, get the information and add it to the object.
    const tokenData = (await Promise.all(
      submissionIDs.map(ID => t2crContract.methods.getTokenInfo(ID).call())
    )).reduce((acc, submission) => {
      if (acc[submission.addr]) acc[submission.addr].push(submission);
      else acc[submission.addr] = [submission];
      return acc;
    }, {});
    this.setState({ tokenData });
  };

  render() {
    const { tokenData } = this.state;
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
              <pre id="data-display">{JSON.stringify(tokenData, null, 2)}</pre>
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
