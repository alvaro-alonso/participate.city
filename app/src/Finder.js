import React, {useState} from 'react';
import { Link } from "react-router-dom";

// import Election from "./Election";
// import Deployer from "./Deployer";
import RegistryArtifact from "./build/contracts/ElectionRegistry.json";
import './App.css';
import { start } from './lib/connectionUtils';


function Finder ({ warning }) {

  const [status, setStatus] = useState('First, Log in with metamask to your Ethereum account to create an election');
  const [searchResults, setSearchResults] = useState();
  const [account, setAccount] = useState();
  const [register, setRegister] = useState();
  const [searchedAccount, setSearchedAccount] = useState();
  const [searched, setSearched] = useState();
  const [resultNumber, setResultNumber] = useState();

  start(RegistryArtifact).then((registryObj) => {
    if (registryObj.account && registryObj.artifact) {
      setAccount(registryObj.account);
      setRegister(registryObj.artifact);
      setStatus('');
    }
  });

  const showElections = () => {
    if (searchResults) {
      return searchResults.map((election) => {
        const link = `/election/${election}`
        return (<tr key={election}>
          <td><Link to={link}>{election}</Link></td>
        </tr>);
      });
    } else {
        return (<></>);
    }
  }

  const search = async () => {
    // Check if not account

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

  const updateSearchBox = (event) => {
    setSearched(event.target.value);
  }

  return (<>
    <div class="hoc container clear">
      { warning }

      <div class="form-block">
        <h1 class="title">Election Finder</h1>

        <div class="form-block">
          <p>{status}</p>

          <div className="input-field search-box" id="actions">
            <input class="inline" type="text" id="institutionFinder" value={searched} onChange={updateSearchBox} placeholder="search for an institution"/>
            <button class="btn inline" onClick={search} disabled={!account} >Search</button>
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

      </div>
    </div>
  </>);
}

  
export default Finder;
