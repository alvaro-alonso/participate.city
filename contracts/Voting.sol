pragma solidity ^0.6.1;

import './verifier.sol';
import './ElectionRegistry.sol';


contract Voting is Verifier {
  /* mapping field below is equivalent to an associative array or hash.
  The key of the mapping is candidate name stored as type bytes32 and value is
  an unsigned integer to store the vote count
  */

  mapping (bytes32 => uint256) public votesReceived;

  /* Solidity doesn't let you pass in an array of strings in the constructor (yet).
  We will use an array of bytes32 instead to store the list of candidates
  */

  bytes32 public merkleRoot;
  uint8[] public provingKey;
  bytes32[] public candidateList;
  bytes32[] public voters;

  // withdraw tocken variables
  mapping (address => bool) votingRecord;
  event logWithdrawal(address receiver, uint amount);

  constructor(
    address registryAdd,
    bytes32 root,
    uint8[] memory provingSetup,
    bytes32[] memory registry,
    bytes32[] memory candidateNames
  ) public payable {
    merkleRoot = root;
    provingKey = provingSetup;
    voters = registry;
    candidateList = candidateNames;
    ElectionRegistry(registryAdd).register(msg.sender, address(this));
  }

  function getCandidates() public view returns (bytes32[] memory) {
    return candidateList;
  }

  function getVoters() public view returns (bytes32[] memory) {
    return voters;
  }

  function getProvingKey() public view returns (uint8[] memory) {
    return provingKey;
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
    uint[2] memory a,
    uint[2][2] memory b,
    uint[2] memory c,
    uint[1] memory input
  ) public payable returns (bool) {
    require(verifyTx(a, b, c, input), "Incorrect proof given");
    votingRecord[msg.sender] = true;
    require(validCandidate(candidate), "Invalid candidate name");
    votesReceived[candidate] += 1;
    withdraw(msg.sender, 1 szabo);
    return true;
  }

  function withdraw(address payable voter, uint amount) internal returns (bool success) {
    if (address(this).balance < amount && votingRecord[voter] != true) return false;
    votingRecord[voter] = false;
    voter.transfer(amount);
    emit logWithdrawal(voter, amount);
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

}