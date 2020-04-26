import React from 'react';
import web3 from "web3";
import { Link } from "react-router-dom";
import MerkleTree from "merkletreejs";
import ecc from 'eosjs-ecc';

import RegistryArtifact from "./build/contracts/ElectionRegistry.json";
import VotingArtifact from "./build/contracts/Voting.json";
import VerifierArtifact from "./build/contracts/Verifier.json";
import VerifierGammas from "./build/verifierGammas.json";

import './App.css';
import {
  incorrectPublicKeyFormat,
  hashPubKey,
} from './lib/proofUtils';
import { web3Provider, start } from './lib/connectionUtils';
import { calculateTreeDepth } from './lib/zokratesProofGeneration';


class Deployer extends React.Component {

  constructor(props) {
    super(props);
    this.provider = web3Provider(props.provider);
    this.state = { 
      status: '',
      budget: '',
      register: props.register,
      account: props.account,
      candidates: [],
      voters: [],
    };
    if (!props.register || !props.account) {
      start(this.provider, RegistryArtifact).then((registerArt) => {
        const { artifact, artifactAddress, account } = registerArt;
        this.setState({
          account,
          register: artifact,
          registerAddress: artifactAddress,
        });
        console.log(this.state);
      })
    }
  }

  updateCandidateField(event){
    this.setState({insertedCandidate : event.target.value})
  }

  updatePointX(event){
    this.setState({ pointX: event.target.value });
  }

  updatePointY(event){
    this.setState({ pointY: event.target.value });
  }

  updateBudget(event){
    const budget = parseInt(event.target.value);
    if (Number.isNaN(budget)){
      this.setState({
        budget: '',
        status: 'budget must be and integer',
      });
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
    let { pointX, pointY, voters } = this.state;
    if (incorrectPublicKeyFormat(pointX) || incorrectPublicKeyFormat(pointY)) {
      this.setState({
        status: 'Wrong Format of Public Key',
      });
      return;
    }

    
    const insertedVoter = hashPubKey(pointX, pointY);
    if (voters.includes(insertedVoter)) {
      this.setState({
        status: 'voter already inserted',
      });
    } else {
      voters.push(insertedVoter);
      this.setState({
        voters,
        status: '',
        pointX: '',
        pointY: '',
      });
    }
  }

  async deploy() {
    const { budget, candidates, voters, register, registerAddress, account } = this.state;
    if (budget && candidates.length > 0 && voters.length > 0) {
      const { findVerifier } = register.methods;
      const treeDepth = calculateTreeDepth(voters.length);
      let verifierAddress = await findVerifier(treeDepth).call();
      console.log(verifierAddress);

      if (web3.utils.toBN(verifierAddress) <= 0)  {
        const gamma = VerifierGammas[treeDepth.toString()];
        if (!gamma) {
          this.setState({
            status: "election size currently not support",
          })
          return;
        }

        const verifierContract = new this.provider.eth.Contract(VerifierArtifact.abi);
        const verifier = await verifierContract.deploy({
          data: VerifierArtifact.bytecode,
          arguments: [
            gamma,          
            treeDepth,
            registerAddress,
          ],
        }).send({
          from: account,
          gasPrice: 3000000000
        })

        console.log(verifier);
        verifierAddress = verifier._address;

      } 

      const tree = new MerkleTree(voters, ecc.sha256);
      tree.print();
      const root = '0x' + tree.getRoot().toString('hex');
      
      const VotingContract = new this.provider.eth.Contract(VotingArtifact.abi);
      console.log(VotingContract);
      
      VotingContract.deploy({
        data: VotingArtifact.bytecode,
        arguments: [
          registerAddress,
          verifierAddress,
          root,
          voters.map((voter) => '0x' + voter),
          candidates.map((candidate) => web3.utils.asciiToHex(candidate)),
        ],
      }).send({
        from: account,
        value: budget,
        gasPrice: 3000000000
      })
      .on('error', (error) => {
        console.log(error)
      })
      .on('transactionHash', (transactionHash) => {
        console.log(transactionHash)
      })
      .on('receipt', async (receipt) => {
        console.log(receipt);
        console.log(`Election registered at: ${account}\nElection address: ${receipt.contractAddress}`);
      })
      .on('confirmation', (confirmationNumber, receipt) => {
        console.log(receipt)
      });
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
          <input type="text" id="point-x" value={this.state.pointX} onChange={this.updatePointX.bind(this)} placeholder="insert point x" />
          <input type="text" id="point-y" value={this.state.pointY} onChange={this.updatePointY.bind(this)} placeholder="insert point y" />
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
