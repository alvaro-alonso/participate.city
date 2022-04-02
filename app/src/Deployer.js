import React, {useEffect, useState} from 'react';
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
import { EditableEntry } from './components';

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

  useEffect(() => {
    start(RegistryArtifact).then((registryObj) => {
      if (registryObj.account && registryObj.artifact) {
        setProvider(registryObj.provider);
        setAccount(registryObj.account);
        setRegister(registryObj.artifact);
        setRegisterAddr(registryObj.artifactAddress);
        setStatus('');
      }
    });
  }, [account]);

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

  const deleteCandidate = (id) => {
    const filteredCandidates = candidates.filter(candidate => id !== candidate);
    setCandidates(filteredCandidates);
  };

  const deleteVoter = (id) => {
    const filteredVoters = voters.filter(voter => id !== voter);
    setVoters(filteredVoters);
  };
  
  const editableList = (array, deleteFunc) => {
    return array.map(element => <EditableEntry element={element} delete={() => deleteFunc(element)} />);
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
    <div className="hoc container clear">
      { props.warning }

      <div className="form-block">

        <h1 className="title"><b>Election Deployment</b></h1>
        <p id="status">{status}</p>

        <div className="form-fields">

          <div className="input-field">
            <label htmlFor="budget"> Election Budget:</label>
            <input type="number" min="0" id="budget" disabled={!account} value={budget} onChange={updateBudget} placeholder="elections budget" />
          </div>

          <div className="input-field">
            <label htmlFor="candidate">Election Candidates:</label>
            <input type="text" className="inline" id="candidate" disabled={!account} value={insertCandidate} onChange={updateCandidateField} placeholder="insert candidate" />
            <button className="inline" id="addCandidateButton" onClick={addCandidate} disabled={!account}>add</button>
            <ul className="fa-ul">
              { editableList(candidates, deleteCandidate) }
            </ul>

          </div>
          
          <div className="input-field">
            <label htmlFor="point-x">Election Voters:</label>
            <input type="text" className="inline" id="point-x" disabled={!account} value={pointX} onChange={updatePointX} placeholder="insert point x" />
            <input type="text" className="inline" id="point-y" disabled={!account} value={pointY} onChange={updatePointY} placeholder="insert point y" />
            <button className="inline" onClick={addVoter} disabled={!account}>add</button>
            <ul className="fa-ul">
              { editableList(voters, deleteVoter) }
            </ul>
          </div>

        </div>

        <button className="btn" onClick={deploy} disabled={!account}>Deploy</button>

      </div>
    </div>
  );
}

export default Deployer;