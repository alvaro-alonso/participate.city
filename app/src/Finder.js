import React from 'react';
import Web3 from "web3";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  // useParams
} from "react-router-dom";

import Election from "./Election";
import Artifact from "./build/contracts/ElectionRegistry.json";
import './App.css';


class Finder extends React.Component {

  constructor(props) {
    super(props);
    this.state = { 
      status: '',
      hide: props.hide ? props.hide: false,
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
          <td><Link to={link} onClick={this.hideFinder.bind(this)}>{election}</Link></td>
        </tr>);
      });
    } else {
        return (<></>);
    }
  }

  async search() {

    const inputSearchField = document.getElementById("institutionFinder")
    const institution = inputSearchField.value;

    if (institution) {
      this.setState({
        status: 'Your vote is being processed, have some patience',
        searchedAccount: institution,
        searched: null,
      });
      const { findContract } = this.meta.methods;
      const searchResults = await findContract(institution).call()
      if(searchResults && searchResults.length > 0) {
        this.setState({
          status: '',
          searchResults,
          resultNumber: searchResults.length,
        });
        this.showElections();
      } else {
        this.setState({ 
          status: `No search results found for address: ${this}`,
          resultNumber: 0,
        })
      }
    } 

  }

  hideFinder() {
    this.setState({ hide: true });
  }

  showFinder() {
    this.setState({ hide: false });
  }

  render() {
    const { hide } = this.state;
    const finder = <>
      <div>
          <h1>Voting App — Finder</h1>

          <p>{this.state.status}</p>

          <div className="container" id="actions">
            <input type="text" id="institutionFinder" value={this.state.searched} placeholder="search for an institution" onFocus="this.state.searched=''"/>
            <button onClick={this.search.bind(this)}>Search</button>
          </div>

          <p>{ this.state.searchResults ? `${this.state.resultNumber} results for account: ${this.state.searchedAccount}` : '' }</p>
          <div className="table-responsive">
            <table id="resultsTable" className="table table-bordered">
              <tbody>
                {this.showElections()}
              </tbody>
            </table>
          </div>
        </div>
    </>;

    return (
      <Router>
        {!hide ? finder : <></>} 

        <div>
          <Switch>
            <Route path="/election/:id" children={<Election />} ></Route>
            <Route path="/" onClick={this.showFinder.bind(this)} ></Route>
            {/* <Route path="/election/:id" render={(props) => <Election {...props} showFinder={this.showFinder.bind(this)}/>}></Route>} */}
          </Switch>
        </div>
      </Router>
    );
  }
}

  
export default Finder;
