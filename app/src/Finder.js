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
import Deployer from "./Deployer";
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
      console.log(this.web3);
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
      // get accounts
      const accounts = await this.web3.eth.getAccounts();
      this.setState({
        meta: new this.web3.eth.Contract(
          Artifact.abi,
          deployedNetwork.address,
        ),
        account: accounts[0],
      });

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
        status: 'Searching...',
        searchedAccount: institution,
        searched: '',
      });
      const { findContract } = this.state.meta.methods;
      const searchResults = await findContract(institution).call();

      this.setState({
        status: '',
        searchResults,
        resultNumber: searchResults.length,
      });
      this.showElections();
    } 

  }

  hideFinder() {
    this.setState({ hide: true });
  }

  showFinder() {
    this.setState({ hide: false });
  }

  updateSearchBox(event) {
    this.setState({searched : event.target.value});
  }

  render() {
    const {
      hide,
      meta,
      account,
      resultNumber,
      searchResults,
      searchedAccount,
      searched,
    } = this.state;
    const finder = <>
      <div>
          <h1>Voting App — Finder</h1>

          <Link to="/deploy_election"><button>create election</button></Link>

          <p>{this.state.status}</p>

          <div className="container" id="actions">
            <input type="text" id="institutionFinder" value={searched} onChange={this.updateSearchBox.bind(this)} placeholder="search for an institution"/>
            <button onClick={this.search.bind(this)}>Search</button>
          </div>

          <p>{ searchResults ? `${resultNumber} results for account: ${searchedAccount}` : '' }</p>
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
            <Route path="/deploy_election" children={<Deployer meta={meta} account={account} web3={this.web3} />}></Route>
            <Route path="/" onClick={this.showFinder.bind(this)} ></Route>
          </Switch>
        </div>
      </Router>
    );
  }
}

  
export default Finder;
