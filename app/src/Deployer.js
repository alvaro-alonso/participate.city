import React from 'react';
import Web3 from "web3";
import { Link } from "react-router-dom";
import merkleTree from "merkle-lib";
import SHA256 from "crypto-js/sha256";
import { initialize } from 'zokrates-js';
import * as wrapper from 'solc/wrapper';
import VotingArtifact from "./build/contracts/Voting.json";

import './App.css';
import generateZokratesProof from './lib/zokratesProofGeneration';


class Deployer extends React.Component {

  constructor(props) {
    super(props);
    this.web3 = props.web3;
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
    const { budget, candidates, voters } = this.state;
    // const { deployElection } = this.meta.methods;
    if (budget && candidates.length > 0 && voters.length > 0) {
      // const hexCandidates = candidates.map((candidate) => Web3.utils.asciiToHex(candidate));
      const hashedVoter = voters.map((voter) => Web3.utils.sha3(voter));
      const tree = merkleTree(hashedVoter.map(x => new Buffer(x, 'hex')), SHA256);
      const root = Web3.utils.bytesToHex(tree[tree.length - 1].words);
      const rootArray = parseInt(root, 16).toString(2).split('').map(x => parseInt(x));
      rootArray.unshift(0);
      console.log(rootArray);
      const proofZok = generateZokratesProof(voters.length, rootArray);
      console.log(proofZok);
      const zokratesProv = await initialize()
      // use proofZok in production
      const proof = await zokratesProv.compile("def main(private field a) -> (field): return a", "main", () => {});
      console.log(zokratesProv)
      console.log(proof);
      const setup = await zokratesProv.setup(proof.program);
      const verifier = zokratesProv.exportSolidityVerifier(setup.vk, true);
      console.log(verifier);
      var input = {
        language: 'Solidity',
        sources: {
          'verifier.sol': {
            content: verifier,
          },
        },
        settings: {
          outputSelection: {
            '*': {
              '*': ['*']
            }
          }
        } 
      };
      const solc = wrapper(window.Module);
      const output = JSON.parse(solc.compile(JSON.stringify(input)));
      const { BN256G2, Pairing, Verifier } = output.contracts["verifier.sol"]
      console.log(output.contracts);
      console.log(BN256G2);
      console.log(BN256G2.abi);
      const BNContract = new this.web3.eth.Contract(BN256G2.abi);
      const PairingContract = new this.web3.eth.Contract(Pairing.abi);
      const VerifierContract = new this.web3.eth.Contract(Verifier.abi);
      const VotingContract = new this.web3.eth.Contract(VotingArtifact.abi);
      console.log(VotingContract);
      // VotingArtifact.bytecode
      // arguments: [
      //   root,
      //   candidates.map((candidate) => Web3.utils.asciiToHex(candidate)),
      //   voters.map((voter) => Web3.utils.asciiToHex(voter)),
      // ],
      BNContract.deploy({
        data: BN256G2.evm.bytecode.object,

      }).send({
        from: this.account,
        value: 1,
        gasPrice: '3000000000'
      })
      .on('error', (error) => {
        console.log(error)
      })
      .on('transactionHash', (transactionHash) => {
        console.log(transactionHash)
      })
      .on('receipt', (receipt) => {
         // receipt will contain deployed contract address
         console.log(receipt)
      })
      .on('confirmation', (confirmationNumber, receipt) => {
        console.log(receipt)
      })
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
