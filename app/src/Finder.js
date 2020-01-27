import React from 'react';
import Web3 from "web3";
import VotingArtifact from "./build/contracts/Voting.json";

import './App.css';


class Finder extends React.Component {

  constructor(props) {
    super(props);
    this.state = { 
      status: '',
      contracts: [],
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
        deployedNetwork.address,
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

  async showElections(results) {
    const resultsTable = document.getElementById("resultsTable");
    resultsTable.innerHTML = '';
    let rowNum = 0;
    for (const election of results) {
      const row = resultsTable.insertRow(rowNum);
      const nameCell = row.insertCell(0);
      nameCell.innerHTML = election;
      rowNum += 1;
    }
  }

  async search() {

    const institution = document.getElementById("institution_finder").value;
    if (institution) {
      this.setState({
        status: 'Your vote is being processed, have some patience',
      });
      const { findContract } = this.meta.methods;
      const searchResults = await findContract(institution).call();
      if(searchResults.length > 0) {
        this.setState({
          status: 'Your vote has been processed',
          contracts: searchResults,
        });
        this.showElections(searchResults);
      } else {
        this.setState({ status: `No search results found for address: ${institution}`})
      }
    } 

  }

  render() {
    return (
      <div>
        <h1>Voting App — Finder</h1>

        <p>{this.state.status}</p>

        <div className="container" id="actions">
          <input type="text" id="institution_finder" placeholder="search for an institution" />
          <button onClick={this.search.bind(this)}>Search</button>
        </div>

        <div className="table-responsive">
          <table id="resultsTable" className="table table-bordered"></table>
        </div>
      </div>
    );
  }
}

  
export default Finder;
