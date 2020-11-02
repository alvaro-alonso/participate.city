import React, {useState} from 'react';
import web3 from "web3";
// import { Link } from "react-router-dom";
import MerkleTree from "merkletreejs";
import ecc from 'eosjs-ecc';

import RegistryArtifact from "./build/contracts/ElectionRegistry.json";
import VotingArtifact from "./build/contracts/Voting.json";
import VerifierArtifact from "./build/contracts/Verifier.json";
import VerifierGammas from "./build/verifierGammas.json";

import './App.css';
import { validKey, hashPubKey } from './lib/proofUtils';
import { start } from './lib/connectionUtils';
import { calculateTreeDepth } from './lib/zokratesProofGeneration';

const budgetInputErrorMsg = 'budget must be a positive integer';

export function Deployer (props) {

  const [provider, setProvider] = useState()
  const [register, setRegister] = useState();
  const [account, setAccount] = useState();
  const [candidates, setCandidates] = useState([]);
  const [voters, setVoters] = useState([]);

  const [registerAddr, setRegisterAddr] = useState();
  const [status, setStatus] = useState('First, Log in with metamask to your Ethereum account to create an election');
  const [budget, setBudget] = useState('');
  const [insertCandidate, setInsertCandidate] = useState('');
  const [pointX, setPointX] = useState();
  const [pointY, setPointY] = useState();

  start(RegistryArtifact).then((registryObj) => {
    if (registryObj.account && registryObj.artifact) {
      setProvider(registryObj.provider);
      setAccount(registryObj.account);
      setRegister(registryObj.artifact);
      setRegisterAddr(registryObj.artifactAddress);
      setStatus('');
    }
  });

  const updateCandidateField = (event) => {
    setInsertCandidate(event.target.value);
  }

  const updatePointX = (event) => {
    setPointX(event.target.value);
  }

  const updatePointY = (event) => {
    setPointY(event.target.value);
  }

  const updateBudget = (event) => {
    const input  = event.target.value;
    const budget = parseInt(input);
    if (Number.isNaN(budget) | budget < 0){
      setBudget('');
      setStatus(budgetInputErrorMsg);
    } else {
      setBudget(budget);
      setStatus();
    }
  }

  const addCandidate = () => {
    if (candidates.includes(insertCandidate)) {
      setStatus('Candidate Name already inserted. Make sure candidates names are unique');
      setInsertCandidate();
    } else {
      setCandidates([...candidates, insertCandidate]);
      setInsertCandidate('');
      setStatus();
    }
  }

  const addVoter = () => {
    if (validKey(pointX) || validKey(pointY)) {
      setStatus('Wrong Format of Public Key');
      return;
    }

    const insertedVoter = hashPubKey(pointX, pointY);
    if (voters.includes(insertedVoter)) {
      setStatus('voter already inserted');
    } else {
      setVoters([...voters, insertedVoter]);
      setStatus('');
      setPointX('');
      setPointY('');
    }
  }

  const deploy = async () => {

    if (budget && candidates.length > 0 && voters.length > 0) {
      const { findVerifier } = register.methods;
      const treeDepth = calculateTreeDepth(voters.length);
      let verifierAddress = await findVerifier(treeDepth).call();
      console.log(verifierAddress);
      const gasPrice = await provider.eth.getGasPrice();

      if (web3.utils.toBN(verifierAddress) <= 0)  {
        setStatus("Election verifier has not been deployed yet. deploying...");

        const gamma = VerifierGammas[treeDepth.toString()];
        if (!gamma) {
          setStatus("election size currently not support");
          return;
        }

        const verifierContract = new provider.eth.Contract(VerifierArtifact.abi);
        const verifier = await verifierContract.deploy({
          data: VerifierArtifact.bytecode,
          arguments: [
            gamma,          
            treeDepth,
            registerAddr,
          ],
        }).send({
          from: account,
          gasPrice,
        })

        console.log(verifier);
        verifierAddress = verifier._address;

      } 

      setStatus('Deploying election...');

      const tree = new MerkleTree(voters, ecc.sha256);
      tree.print();
      const root = '0x' + tree.getRoot().toString('hex');
      
      const VotingContract = new provider.eth.Contract(VotingArtifact.abi);
      console.log(VotingContract);
      
      VotingContract.deploy({
        data: VotingArtifact.bytecode,
        arguments: [
          registerAddr,
          verifierAddress,
          root,
          voters.map((voter) => '0x' + voter),
          candidates.map((candidate) => web3.utils.asciiToHex(candidate)),
        ],
      }).send({
        from: account,
        value: budget,
        gasPrice,
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

  return (
    <div class="hoc container clear">
      <div class="form-block">

        <h1 class="title"><b>Election Deployment</b></h1>
        <p id="status">{status}</p>

        <div class="form-fields">

          <div class="input-field">
            <label for="budget"> Election Budget:</label>
            <input type="number" min="0" id="budget" value={budget} onChange={updateBudget} placeholder="elections budget" />
          </div>

          <div class="input-field">
            <label for="candidate">Election Candidates:</label>
            <input type="text" class="inline" id="candidate" value={insertCandidate} onChange={updateCandidateField} placeholder="insert candidate" />
            <button class="inline" id="addCandidateButton" onClick={addCandidate}>add</button>
            {candidates.length > 0? <ul>{candidates.map(candidate => <li key={candidate}>{candidate}</li>)}</ul> : null}
          </div>
          
          <div class="input-field">
            <label for="point-x">Election Voters:</label>
            <input type="text" class="inline" id="point-x" value={pointX} onChange={updatePointX} placeholder="insert point x" />
            <input type="text" class="inline" id="point-y" value={pointY} onChange={updatePointY} placeholder="insert point y" />
            <button class="inline" onClick={addVoter}>add</button>
            {voters.length > 0? <ul>{voters.map(voter => <li key={voter}>{voter}</li>)}</ul> : null}
          </div>

        </div>

        <button class="btn" onClick={deploy} disabled={!account}>Deploy</button>

      </div>
    </div>
  );
}

export default Deployer;