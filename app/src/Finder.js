import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from "react-router-dom";

import Election from "./Election";
import Deployer from "./Deployer";
import RegistryArtifact from "./build/contracts/ElectionRegistry.json";
import './App.css';
import { web3Provider, start } from './lib/connectionUtils';


class Finder extends React.Component {

  constructor(props) {
    super(props);
    this.provider = web3Provider();
    this.state = { 
      status: '',
      hide: props.hide ? props.hide: false,
    };
    // use MetaMask's provider
    start(this.provider, RegistryArtifact)
      .then((artifact) => {
        this.setState(artifact);
      });
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
      artifactAdress,
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
            <Route path="/election/:id" children={<Election provider={this.provider} />} ></Route>
            <Route path="/deploy_election" children={<Deployer register={artifactAdress} account={account} provider={this.provider} />}></Route>
            <Route path="/" onClick={this.showFinder.bind(this)} ></Route>
          </Switch>
        </div>
      </Router>
    );
  }
}

  
export default Finder;
