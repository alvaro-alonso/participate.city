import React, {useState} from 'react';
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


function Finder (props) {

  const provider = web3Provider();
  const [status, setStatus] = useState();
  const [searchResults, setSearchResults] = useState();
  const [showSearchResults, setShowSearchResults] = useState(props.hide || true);
  const [account, setAccount] = useState();
  const [register, setRegister] = useState();
  const [registerAddress, setRegisterAddress] = useState();
  const [searchedAccount, setSearchedAccount] = useState();
  const [searched, setSearched] = useState();
  const [resultNumber, setResultNumber] = useState();

  // use MetaMask's provider
  start(provider, RegistryArtifact)
    .then((registerArt) => {
      const { artifact, artifactAddress, account } = registerArt;
      setAccount(account);
      setRegister(artifact);
      setRegisterAddress(artifactAddress);
    });

  const showElections = () => {
    if (searchResults) {
      return searchResults.map((election) => {
        const link = `/election/${election}`
        return (<tr key={election}>
          <td><Link to={link} onClick={hideSearchResults}>{election}</Link></td>
        </tr>);
      });
    } else {
        return (<></>);
    }
  }

  const search = async () => {
    const inputSearchField = document.getElementById("institutionFinder")
    const institution = inputSearchField.value;

    if (institution) {
      setStatus('Searching...');
      setSearchedAccount(institution);
      setSearched('');

      const { findElection } = register.methods;
      const searchResults = await findElection(institution).call();

      setStatus('');
      setSearchResults(searchResults);
      setResultNumber(searchResults.length);

      showElections();
    } 
  }

  const hideSearchResults = () => {
    setShowSearchResults(false);
  }

  const showSearch = () => {
    setShowSearchResults(true);
  }

  const updateSearchBox = (event) => {
    setSearched(event.target.value);
  }

  const finder = <>
    <div>
        <h1>Voting App — Finder</h1>

        <Link to="/deploy_election"><button>create election</button></Link>

        <p>{status}</p>

        <div className="container" id="actions">
          <input type="text" id="institutionFinder" value={searched} onChange={updateSearchBox} placeholder="search for an institution"/>
          <button onClick={search}>Search</button>
        </div>

        <p>{ searchResults ? `${resultNumber} results for account: ${searchedAccount}` : '' }</p>
        <div className="table-responsive">
          <table id="resultsTable" className="table table-bordered">
            <tbody>
              {showElections()}
            </tbody>
          </table>
        </div>
      </div>
  </>;

  return (
    <Router basename='/app'>
      {showSearchResults ? finder : <></>} 

      <div>
        <Switch>
          <Route path="/election/:id" children={<Election provider={provider} />} ></Route>
          <Route path="/deploy_election" children={<Deployer register={registerAddress} account={account} provider={provider} />} ></Route>
          <Route path="/" onClick={showSearch} ></Route>
        </Switch>
      </div>
    </Router>
  );
}

  
export default Finder;
