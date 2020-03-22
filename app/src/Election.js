import React from 'react';
import Web3 from "web3";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import MerkleTree from "merkletreejs";
import ecc from 'eosjs-ecc';
import { initialize } from 'zokrates-js';

import './App.css';
import {
  incorrectPrivateKeyFormat,
  incorrectPublicKeyFormat,
  hashPubKey,
  calculateMerklePath,
  splitBN,
} from './lib/utils';
import { generateZokratesProof } from "./lib/zokratesProofGeneration";
import VotingArtifact from "./build/contracts/Voting.json";

const invalidProofMsg = 'Incorrect proof of eligibility';


class Election extends React.Component {

  constructor(props) {
    super(props);
    this.address = this.props.match.params.id;
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
      const deployedNetwork = VotingArtifact.networks[networkId];
      console.log(`network: ${networkId}\ndeployedNetwork: ${deployedNetwork}`);
      this.meta = new this.web3.eth.Contract(
        VotingArtifact.abi,
        this.address,
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

  async getVotes() {
    const { totalVotesFor } = this.meta.methods;
    const balanceTable = document.getElementById("voteTable");

    const results = await Promise.all(this.candidates.map((candidate) => totalVotesFor(Web3.utils.asciiToHex(candidate)).call()));
    balanceTable.innerHTML = '';
    let rowNum = 0;
    for (const votes of results) {
      const row = balanceTable.insertRow(rowNum);
      const nameCell = row.insertCell(0);
      const balanceCell = row.insertCell(1);
      nameCell.innerHTML = this.candidates[rowNum];
      balanceCell.innerHTML = votes;
      rowNum += 1;
    }
  }

  async getBudget() {
    const { getBalance } = this.meta.methods;
    const budgetDiv = document.getElementById("budget");
    const budget = await getBalance().call();
    budgetDiv.innerHTML = budget;
  }

  async voteFor() {
    const { candidates } = this;
    const { getVoters, getRoot, voteForCandidate } = this.meta.methods;

    const pointX = document.getElementById("pointX").value, pointY = document.getElementById("pointY").value;
    const privateKey = document.getElementById("privateKey").value;
    const candidate = document.getElementById("candidate").value;

    // check that the keys have the right length and is a bigNumber
    if (incorrectPublicKeyFormat(pointX) || incorrectPublicKeyFormat(pointY) || incorrectPrivateKeyFormat(privateKey)) {
      this.setState({
        status: 'invalid format of arguments',
      });
      return;
    }

    // check that candidate name is valid
    if(!(candidates.includes(candidate))) {
      this.setState({
        status: `Wrong candidate. Please choose between ${this.candidates}`,
      });
      return;
    } else {
      this.setState({
        status: 'Your vote is being processed, have some patience',
      });
    }

    let voters = await getVoters().call();
    voters = voters.map((voter) => voter.substring(2));
    const treeRoot = await getRoot().call();
    const rootNumber = Web3.utils.hexToNumberString(treeRoot);
    const zokratesProvider = await initialize();
    const zokratesCode = generateZokratesProof(voters.length, rootNumber);
    const program = await zokratesProvider.compile(zokratesCode, "main", () => {});
    console.log(zokratesCode);
    const hashedPubKey = hashPubKey(pointX, pointY); 
    console.log(`voters: ${voters}`);
    const pubKeyInd = voters.indexOf(hashedPubKey); // index where pubKey is 

    // failed proof if pubKey not in voters
    if (pubKeyInd < 0) {
      this.setState({
        status: invalidProofMsg,
      })
      return;
    }

    const treeDepth = Math.ceil(Math.log2(voters.length));
    const merklePath = calculateMerklePath(pubKeyInd, treeDepth);
    console.log(`inxed of user : ${pubKeyInd}\nmerkle path: ${merklePath}`);
    const tree = new MerkleTree(voters, ecc.sha256);
    const treeProof = tree.getProof(hashedPubKey);
    console.log(`created tree root ${tree.getRoot().toString('hex')}
    election root: ${treeRoot}
    proof: ${treeProof}
    tree: ${tree.print()}
    `);
    const treePath = treeProof.map((node) => node.data);
    console.log(treePath);
    console.log(treePath.map(node => splitBN(node)));
    const witness = [
      [pointX.toString(), pointY.toString()],
      privateKey.toString(),
      merklePath,
      splitBN(Web3.utils.hexToBytes('0x' + hashedPubKey)),
    ].concat(treePath.map(node => splitBN(node)));
    console.log(witness);
    let witnessOut;
    try {
      witnessOut = await zokratesProvider.computeWitness(program, witness);
      console.log(witnessOut);
      if (parseInt(JSON.parse(witnessOut.output)[0]) !== 1) {
        this.setState({
          status: 'Wrong proof!',
        });
        return;
      }
    } catch (error) {
      console.warn(error);
      return;
    }

    const { pk } = await zokratesProvider.setup(program.program);
    const proofJSON = await zokratesProvider.generateProof(program.program, witnessOut.witness, pk);
    const { proof, inputs } = JSON.parse(proofJSON);
    console.log(proof, inputs);
    const proofValues = Object.values(proof);
    console.log(proofValues);
    voteForCandidate(Web3.utils.asciiToHex(candidate), proofValues, inputs)
    .send({
      from: this.account,
      gasPrice: 3000000000,
    })
    .on('error', (error) => {
      this.setState({
        status: error,
      });
    })
    .on('transactionHash', (transactionHash) => {
      console.log(transactionHash)
    })
    .on('receipt', async (receipt) => {
      console.log(receipt);
      console.log(`Election registered at: ${this.account}\nElection address: ${receipt.contractAddress}`);
      this.getVotes();
    })
    .on('confirmation', (confirmationNumber, receipt) => {
      console.log(receipt)
    });
  }

  render () {
    return (
      <div>
        <div className="table-responsive">
          <h1>Election</h1>

          <div className="container">
            <p>election budget:</p>
            <p id="budget"></p>
          </div>

          <table id="voteTable" className="table table-bordered"></table>
        </div>

        <p>{this.state.status}</p>

        <div className="container" id="actions">
          <div className="container" id="candidate-container" >
            <h3> Candidate </h3>
            <input type="text" id="candidate" placeholder="choose a candidate" />
          </div>

          <div className="container" id="proof">
            <h3> Proof </h3>
            <input type="text" id="privateKey" placeholder="private key" />
            <input type="text" id="pointX" placeholder="public key #1" />
            <input type="text" id="pointY" placeholder="public key #2" />
          </div>

          <div>
            <button onClick={this.voteFor.bind(this)} >Vote</button>
            <Link to="/" ><button>Home</button></Link>
          </div>
        </div>

      </div>
    );
  }
}

  
export default withRouter(Election);
