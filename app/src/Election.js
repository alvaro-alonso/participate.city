import React from 'react';
import web3 from "web3";
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
} from './lib/proofUtils';
import { web3Provider, start } from './lib/connectionUtils';
import { generateZokratesSourceCode, calculateTreeDepth } from "./lib/zokratesProofGeneration";
import VotingArtifact from "./build/contracts/Voting.json";

const invalidProofMsg = 'Incorrect proof of eligibility';


class Election extends React.Component {

  constructor(props) {
    super(props);
    const address = props.match.params.id;
    this.provider =  web3Provider(props.provider);
    this.state = { 
      status: '',
      address,
    };

    start(this.provider, VotingArtifact, address)
      .then((electionArt) => {
        const { artifact, artifactAddress, account } = electionArt;
        this.setState({
          account,
          election: artifact,
          electionAddress: artifactAddress,
        });
        this.getBudget();
        this.getCandidates()
          .then(() => this.getVotes() );
    });
  }

  async getCandidates() {
    const { getCandidates } = this.state.election.methods;
    const candidateHexs = await getCandidates().call();
    const candidates = candidateHexs.map((candidate) => web3.utils.hexToUtf8(candidate));
    this.setState({ candidates });
  }

  async getVotes() {
    const { candidates, election } = this.state;
    const { totalVotesFor } = election.methods;
    const balanceTable = document.getElementById("voteTable");

    const results = await Promise.all(candidates.map((candidate) => totalVotesFor(web3.utils.asciiToHex(candidate)).call()));
    balanceTable.innerHTML = '';
    let rowNum = 0;
    for (const votes of results) {
      const row = balanceTable.insertRow(rowNum);
      const nameCell = row.insertCell(0);
      const balanceCell = row.insertCell(1);
      nameCell.innerHTML = candidates[rowNum];
      balanceCell.innerHTML = votes;
      rowNum += 1;
    }
  }

  async getBudget() {
    const { getBalance } = this.state.election.methods;
    const budgetDiv = document.getElementById("budget");
    const budget = await getBalance().call();
    budgetDiv.innerHTML = budget;
  }

  async voteFor() {
    const { candidate, candidates, privKey, pointX, pointY, election, account } = this.state
    const { getVoters, getRoot, voteForCandidate } = election.methods;

    // check that the keys have the right length and is a bigNumber
    if (incorrectPublicKeyFormat(pointX) || incorrectPublicKeyFormat(pointY) || incorrectPrivateKeyFormat(privKey)) {
      this.setState({
        status: 'invalid format of arguments',
      });
      return;
    }

    // check that candidate name is valid
    if(!(candidates.includes(candidate))) {
      this.setState({
        status: `Wrong candidate. Please choose between ${candidates}`,
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
    const zokratesProvider = await initialize();
    const zokratesCode = generateZokratesSourceCode(calculateTreeDepth(voters.length));
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
      splitBN(web3.utils.hexToBytes(treeRoot)),
      [pointX.toString(), pointY.toString()],
      privKey.toString(),
      merklePath,
      splitBN(web3.utils.hexToBytes('0x' + hashedPubKey)),
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

    const proofStart = performance.now();
    const { pk } = await zokratesProvider.setup(program.program);
    const proofJSON = await zokratesProvider.generateProof(program.program, witnessOut.witness, pk);
    const { proof, inputs } = JSON.parse(proofJSON);
    console.log(proof, inputs);
    const proofValues = Object.values(proof);
    const proofEnd = performance.now();
    const proofDuration = proofEnd - proofStart;
    console.log(`Time needed to generate proof: ${proofDuration}`);
    console.log(proofValues);
    const gasPrice = await this.provider.eth.getGasPrice();
    voteForCandidate(web3.utils.asciiToHex(candidate), proofValues, inputs)
    .send({
      from: account,
      gasPrice,
    })
    .on('error', (error) => {
      console.log(error);
      this.setState({
        status: '501: something went wrong',
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


  updateCandidate(event){
    this.setState({ candidate: event.target.value });
  }

  updatePrivKey(event){
    this.setState({ privKey: event.target.value });
  }

  updatePointX(event){
    this.setState({ pointX: event.target.value });
  }

  updatePointY(event){
    this.setState({ pointY: event.target.value });
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
            <input type="text" id="candidate" value={this.state.candidate} onChange={this.updateCandidate.bind(this)} placeholder="choose a candidate" />
          </div>

          <div className="container" id="proof">
            <h3> Proof </h3>
            <input type="text" id="privateKey" value={this.state.privKey} onChange={this.updatePrivKey.bind(this)} placeholder="private key" />
            <input type="text" id="pointX" value={this.state.pointX} onChange={this.updatePointX.bind(this)} placeholder="public key #1" />
            <input type="text" id="pointY" value={this.state.pointY} onChange={this.updatePointY.bind(this)} placeholder="public key #2" />
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
