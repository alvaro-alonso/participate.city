import React from 'react';
import { initialize } from 'zokrates-js';
import Web3 from "web3";
import { withRouter } from "react-router";

import VotingArtifact from "./build/contracts/Voting.json";
import './App.css';
import compZK from './build/zk-proof/out';



class Election extends React.Component {

  constructor(props) {
    super(props);
    this.address = this.props.match.params.id;
    this.state = { 
      status: '',
    };
    this.zk_proving_key = this.loadZK();
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

  async loadZK() {
    initialize().then(async (zokrates) => {
      const { 1: proving_key } = await zokrates.setup(compZK);
      console.log(proving_key);
      return proving_key;
    });
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
    try {
      const zkProof = JSON.parse(document.getElementById("proof").value); 
      var { proof, inputs } = zkProof;
      var { a, b, c } = proof;
    } catch (error) {
      this.setState({
        status: `Wrong input for proof at ${error}`,
      });
      return -1;
    }

    const candidate = document.getElementById("candidate").value;
    if (candidates.includes(candidate)) {
      this.setState({
        status: 'Your vote is being processed, have some patience',
      });
      // updateStatus('Your vote is being processed, have some patience', this);
      const { voteForCandidate } = this.meta.methods;
      await voteForCandidate(Web3.utils.asciiToHex(candidate), a, b, c, inputs).send({ from: this.account });
      this.setState({
        status: 'Your vote has been processed',
      });
      // updateStatus('Your vote has been processed', this);
    } else {
      this.setState({
        status: `Wrong candidate. Please choose between ${this.candidates}`,
      });
      // updateStatus(`Wrong candidate. Please choose between ${this.candidates}`, this);
    }

    this.getVotes();
    this.getBudget();
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
        <input type="text" id="proof" placeholder="insert proof" />
        <button onClick={this.voteFor.bind(this)} >Vote</button>
        </div>
      </div>
    );
  }
}

  
export default withRouter(Election);
