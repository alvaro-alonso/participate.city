import React from 'react';
import Web3 from "web3";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import merkleTree from "merkle-lib";
import SHA256 from "crypto-js/sha256";
import { initialize } from 'zokrates-js';

import VotingArtifact from "./build/contracts/Voting.json";
import './App.css';

const invalidProofMsg = 'Incorrect proof of eligibility';


class Election extends React.Component {

  constructor(props) {
    super(props);
    this.address = this.props.match.params.id;
    this.state = { 
      status: '',
    };
    if (window.ethereum) {
      // use MetaMask's provider
      this.web3 = new Web3(window.ethereum);
      window.ethereum.enable();
      console.log('ethereum detected');
    } else {
      this.web3 = new Web3( Web3.currentProvider || "http://127.0.0.1:7545");
    }
    this.start();
  }


  async start() {
    try {
      // get contract instance
      const networkId = await this.web3.eth.net.getId();
      const deployedNetwork = VotingArtifact.networks[networkId];
      console.log(`network: ${networkId}\ndeployedNetwork: ${deployedNetwork}`);
      this.meta = new this.web3.eth.Contract(
        VotingArtifact.abi,
        this.address,
      );

      // get accounts
      const accounts = await this.web3.eth.getAccounts();
      this.account = accounts[0];
      this.getBudget();
      await this.getCandidates();
      this.getVotes();

    } catch (error) {
      console.error("Could not connect to contract or chain.");
      console.error(error);
    }
  }

  async getCandidates() {
    const { getCandidates } = this.meta.methods;
    const candidateHexs = await getCandidates().call();
    this.candidates = candidateHexs.map((candidate) => Web3.utils.hexToUtf8(candidate));
  }

  async getVotes() {
    const { totalVotesFor } = this.meta.methods;
    const balanceTable = document.getElementById("voteTable");

    const results = await Promise.all(this.candidates.map((candidate) => totalVotesFor(Web3.utils.asciiToHex(candidate)).call()));
    balanceTable.innerHTML = '';
    let rowNum = 0;
    for (const votes of results) {
      const row = balanceTable.insertRow(rowNum);
      const nameCell = row.insertCell(0);
      const balanceCell = row.insertCell(1);
      nameCell.innerHTML = this.candidates[rowNum];
      balanceCell.innerHTML = votes;
      rowNum += 1;
    }
  }

  async getBudget() {
    const { getBalance } = this.meta.methods;
    const budgetDiv = document.getElementById("budget");
    const budget = await getBalance().call();
    budgetDiv.innerHTML = budget;
  }

  async voteFor() {
    const { candidates } = this;
    const publicKey = document.getElementById("publickey").value; 
    const privateKey = document.getElementById("privateKey").value;
    const candidate = document.getElementById("candidate").value;

    // check that the keys have the right length and format (HEX)
    if (publicKey.length !== 32 || privateKey.length !== 32) {
      const key = (publicKey.length !== 32) ? 'public' : 'private';
      this.setState({
        status: `${key} key invalid format`,
      });
      return;
    }

    // check that candidate name is valid
    if(!(candidates.includes(candidate))) {
      this.setState({
        status: `Wrong candidate. Please choose between ${this.candidates}`,
      });
      return;
    } else {
      this.setState({
        status: 'Your vote is being processed, have some patience',
      });
    }

    const { getVoters, getProvingKey, voteForCandidate } = this.meta.methods;
    const voters = await getVoters().call();
    const pubKeyInd = 0; // index where pubKey is 

    // failed proof if pubKey not in voters
    if (pubKeyInd < 0) {
      this.setState({
        status: invalidProofMsg,
      })
      return;
    }

    // const tree  = merkleTree(voters, SHA256);;
    // const directionPath = 2**tree.length; // get the direction path formula
    // const treePath = tree.getTreePath(publicKey); // get treePath of pub key

    // const splitBigInt = (binInt) => {
      
    // };
    // const args = {

    // };

    // const zokratesProvider = await initialize();
    // const provingKey = await getProvingKey().call();
    // const witness = await zokratesProvider.computeWitness(provingKey, args);
    // const { proof, input } = zokratesProvider.generateProof(witness);

    // // check error-handling in ethereum
    // await voteForCandidate(Web3.utils.asciiToHex(candidate), proof, input).send({ from: this.account });

    // this.setState({
    //   status: 'Your vote has been processed',
    // });

    // this.getVotes();
    // this.getBudget();
  }

  render () {
    return (
      <div>
        <div className="table-responsive">
          <h1>Voting App — Example Truffle Dapp</h1>

          <div className="container">
            <p>election budget:</p>
            <p id="budget"></p>
          </div>

          <table id="voteTable" className="table table-bordered"></table>
        </div>

        <p>{this.state.status}</p>

        <div className="container" id="actions">
          <input type="text" id="candidate" placeholder="choose a candidate" />

          <div className="container" id="proof">
            <input type="text" id="public_key" placeholder="public key" />
            <input type="text" id="private_key" placeholder="private key" />
          </div>

          <button onClick={this.voteFor.bind(this)} >Vote</button>
          <Link to="/" ><button>Home</button></Link>
        </div>

      </div>
    );
  }
}

  
export default withRouter(Election);
