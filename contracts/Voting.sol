pragma solidity 0.6.1;
pragma experimental ABIEncoderV2;

import './Verifier.sol';
import './ElectionRegistry.sol';


contract Voting {
  /* mapping field below is equivalent to an associative array or hash.
  The key of the mapping is candidate name stored as type bytes32 and value is
  an unsigned integer to store the vote count
  */

  mapping (bytes32 => uint256) public votesReceived;

  /* Solidity doesn't let you pass in an array of strings in the constructor (yet).
  We will use an array of bytes32 instead to store the list of candidates
  */
  address public verifier;
  bytes32 public merkleRoot;
  bytes32[] public candidateList;
  bytes32[] private voters;

  // withdraw tocken variables
  mapping (bytes32 => bool) votingRecord;
  event logWithdrawal(address receiver, uint amount);

  constructor(
    address registryAddress,
    address verifierAddress,
    bytes32 root,
    bytes32[] memory registry,
    bytes32[] memory candidateNames
  ) public payable {
    verifier = verifierAddress;
    merkleRoot = root;
    voters = registry;
    candidateList = candidateNames;
    ElectionRegistry(registryAddress).registerElection(msg.sender, address(this));
  }

  function getCandidates() public view returns (bytes32[] memory) {
    return candidateList;
  }

  function getVoters() public view returns (bytes32[] memory) {
    return voters;
  }

  function getRoot() public view returns (bytes32) {
    return merkleRoot;
  }

  function getBalance() public view returns (uint) {
    return address(this).balance;
  }

  // This function returns the total votes a candidate has received so far
  function totalVotesFor(bytes32 candidate) public view returns (uint256) {
    require(validCandidate(candidate), "Invalid candidate name");
    return votesReceived[candidate];
  }

  // This function increments the vote count for the specified candidate. This
  // is equivalent to casting a vote
  function voteForCandidate(
    bytes32 candidate,
    Verifier.Proof memory proof,
    uint[3] memory input
  ) public returns (bool) {
    require(validCandidate(candidate), "Invalid candidate name");
    bytes32 electionRoot = bytes32((input[0] << (16 * 8)) + input[1]);
    require(electionRoot == merkleRoot, "Invalid election");
    bytes32 hashedProof = serializeProof(proof, input);
    require(unusedProof(hashedProof), "Proof already used");
    require(Verifier(verifier).verifyTx(proof, input), "Incorrect proof given");
    votingRecord[hashedProof] = true;
    votesReceived[candidate] += 1;
    return true;
  }

  function validCandidate(bytes32 candidate) public view returns (bool) {
    for(uint i = 0; i < candidateList.length; i++) {
      if (candidateList[i] == candidate) {
        return true;
      }
    }
    return false;
  }

  function serializeProof(Verifier.Proof memory proof, uint256[3] memory input) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked(
      proof.a.X,
      proof.a.Y,
      proof.b.X[0],
      proof.b.X[1],
      proof.b.Y[0],
      proof.b.Y[1],
      proof.c.X,
      proof.c.Y,
      input[0],
      input[1],
      input[2]
    ));
  }

  function unusedProof(bytes32 proof) internal view returns (bool) {
    if (votingRecord[proof] == true) {
        return false;
    } else {
        return true;
    }
  }
}