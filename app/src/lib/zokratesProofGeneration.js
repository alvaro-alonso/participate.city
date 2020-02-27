
const generateZokratesProof = (voterNumber, treeRoot) => {
  
  const treeDepth = Math.ceil(Math.log2(voterNumber));
  const iterations =[...Array(treeDepth).keys()];
  const treeIteration = (i) => {
    return `
      preimage = multiplex(directionSelector[${i}], currentDigest, pathHash${i})
      lhs = preimage[0..256]
      rhs = preimage[256..512]
      currentDigest = sha256(lhs, rhs)
    `;
  };
  const treePathGenerator = iterations.map(i => treeIteration(i)).join('');
  const treePathInputParams = iterations.map(i => `private field[2] pathDigest${i}`).join(', ');
  const pathUnpacking = iterations.map(i => `pathHash${i} = combine256(pathDigest${i})`).join('\n');

  return `
  import "ecc/babyjubjubParams" as context
  import "ecc/proofOfOwnership" as proofOfOwnership
  import "hashes/sha256/512bitPadded" as sha256
  import "utils/pack/nonStrictUnpack256" as unpack256
  import "utils/pack/unpack128" as unpack128
  import "hashes/utils/256bitsDirectionHelper" as multiplex


  def combine256(field[2] values) -> (field[256]):
      a = unpack128(values[0])
      b = unpack128(values[1])
      return [...a, ...b]

  def main(private field[2] pk, private field sk, private field[${treeDepth}] directionSelector, private field[2] leafDigest, ${treePathInputParams}) -> (field):

      context = context()
      1 == proofOfOwnership(pk, sk, context) 

      lhs = unpack256(pk[0])
      rhs = unpack256(pk[1])
      leafHash = sha256(lhs, rhs)
      leafHash == combine256(leafDigest)
      ${pathUnpacking} 

      field[256] currentDigest = leafHash
      ${treePathGenerator}
      [${treeRoot}] == currentDigest

      return 1
  `;
}

const votingCode = `
pragma solidity 0.6.1;
pragma experimental ABIEncoderV2;

import 'verifier.sol';


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
  bytes32[] public candidateList;
  bytes32[] public voters;

  // withdraw tocken variables
  mapping (address => bool) votingRecord;
  event logWithdrawal(address receiver, uint amount);

  constructor(bytes32 root, bytes32[] memory registry, bytes32[] memory candidateNames) public payable {
    merkleRoot = root;
    voters = registry;
    candidateList = candidateNames;
  }

  function getCandidates() public returns (bytes32[] memory) {
    return candidateList;
  }

  // This function returns the total votes a candidate has received so far
  function totalVotesFor(bytes32 candidate) public returns (uint256) {
    require(validCandidate(candidate), "Invalid candidate name");
    return votesReceived[candidate];
  }

  // This function increments the vote count for the specified candidate. This
  // is equivalent to casting a vote
  function voteForCandidate(
    bytes32 candidate,
    Proof memory proof,
    uint[1] memory input
  ) public payable returns (bool) {
    require(verifyTx(proof, input), "Incorrect proof given");
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

  function getBalance() public view returns (uint) {
    return address(this).balance;
  }
}
`;

export { generateZokratesProof, votingCode }