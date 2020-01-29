import React from 'react';
import Web3 from "web3";
import Artifact from "./build/contracts/ElectionRegistry.json";

import './App.css';


class Finder extends React.Component {

  constructor(props) {
    super(props);
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
      const deployedNetwork = Artifact.networks[networkId];
      console.log(`network: ${networkId}\ndeployedNetwork: ${deployedNetwork}`);
      this.meta = new this.web3.eth.Contract(
        Artifact.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await this.web3.eth.getAccounts();
      this.account = accounts[0];

    } catch (error) {
      console.error("Could not connect to contract or chain.");
      console.error(error);
    }
  }

  showElections() {
    if (this.state.searchResults) {
      return this.state.searchResults.map((election) => {
        const link = `/election/${election}`
        return (<tr key={election}>
          <td><a href={link}>{election}</a></td>
        </tr>);
      });
    } else {
        return (<></>);
    }
  }

  async search() {

    const institution = document.getElementById("institutionFinder").value;
    if (institution) {
      this.setState({
        status: 'Your vote is being processed, have some patience',
      });
      const { findContract } = this.meta.methods;
      const searchResults = await findContract(institution).call()//.send({from: this.account});//.call();
      if(searchResults && searchResults.length > 0) {
        this.setState({
          status: '',
          searchResults,
        });
        this.showElections();
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
          <input type="text" id="institutionFinder" placeholder="search for an institution" />
          <button onClick={this.search.bind(this)}>Search</button>
        </div>

        <div className="table-responsive">
          <table id="resultsTable" className="table table-bordered">
            <tbody>
              {this.showElections()}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

  
export default Finder;
