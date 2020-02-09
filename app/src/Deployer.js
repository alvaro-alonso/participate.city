import React from 'react';
import Web3 from "web3";
import { Link } from "react-router-dom";
import merkleTree from "merkle-lib";
import SHA256 from "crypto-js/sha256";

import './App.css';


class Deployer extends React.Component {

  constructor(props) {
    super(props);
    this.meta = props.meta;
    this.account = props.account;
    this.state = { 
      status: '',
      candidates: [],
      voters: [],
    };
    console.log(props);
  }

  updateCandidateField(event){
    this.setState({insertedCandidate : event.target.value})
  }

  updateVoterField(event){
    this.setState({insertedVoter : event.target.value})
  }

  updateBudget(event){
    const budget = parseInt(event.target.value);
    if (Number.isNaN(budget)){
      this.setState({
        budget: undefined,
        status: 'budget must be and integer'});
    } else {
      this.setState({
        budget,
        status: '',
      });
    }
  }

  addCandidate() {
    let { insertedCandidate, candidates } = this.state;
    candidates.push(insertedCandidate);
    this.setState({
      candidates,
      insertedCandidate: '',
    });
  }

  addVoter() {
    let { insertedVoter, voters } = this.state;
    voters.push(insertedVoter);
    this.setState({
      voters,
      insertedVoter: '',
    });
  }

  async deploy() {
    const { budget, candidates } = this.state;
    const { deployElection } = this.meta.methods;
    if (budget && candidates.length > 0) {
      const hexCandidates = candidates.map((candidate) => Web3.utils.asciiToHex(candidate));
      const hashedVoter = this.state.voters.map((voter) => Web3.utils.sha3(voter));
      const tree = merkleTree(hashedVoter.map(x => new Buffer(x, 'hex')), SHA256);
      const treeStr = tree.map(x => x.toString());
      const root = treeStr[treeStr.length - 1];
      const electionAdd = await deployElection(hexCandidates, budget, root, hashedVoter).send({ from: this.account, value: budget});
      console.log(this.state.voters);
      console.log(hashedVoter);
      console.log(treeStr);
      console.log(`election deployed at: ${electionAdd}`);
    }
  }

  render() {
    return (
      <div>
        <h1>Deployer</h1>

        <p>{this.state.status}</p>

        <div className="container">
          <p>Election budget:</p>
          <input type="text" id="budget" value={this.state.budget} onChange={this.updateBudget.bind(this)} placeholder="elections budget"></input>
        </div>

        <div className="container" id="candidates">
          <p>Candidates</p>
          <input type="text" id="candidate" value={this.state.insertedCandidate} onChange={this.updateCandidateField.bind(this)} placeholder="insert candidate" />
          <button onClick={this.addCandidate.bind(this)}>add</button>
          {this.state.candidates.length > 0? <ul>{this.state.candidates.map(candidate => <li key={candidate}>{candidate}</li>)}</ul> : null}
        </div>

        <div className="container" id="voters">
          <p>Voters</p>
          <input type="text" id="voters" value={this.state.insertedVoter} onChange={this.updateVoterField.bind(this)} placeholder="insert voter" />
          <button onClick={this.addVoter.bind(this)}>add</button>
          {this.state.voters.length > 0? <ul>{this.state.voters.map(voter => <li key={voter}>{voter}</li>)}</ul> : null}
        </div>

        <button onClick={this.deploy.bind(this)}>Deploy</button>
        <Link to="/" ><button>Home</button></Link>
      </div>
    );
  }
}

  
export default Deployer;
