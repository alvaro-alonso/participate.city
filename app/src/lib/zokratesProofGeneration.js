
const generateZokratesProof = (voterNumber) => {
  
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
  import "utils/pack/pack256" as pack256
  import "hashes/utils/256bitsDirectionHelper" as multiplex


  def combine256(field[2] values) -> (field[256]):
      a = unpack128(values[0])
      b = unpack128(values[1])
      return [...a, ...b]

  def main(field[2] rootDigest, private field[2] pk, private field sk, private field[${treeDepth}] directionSelector, private field[2] leafDigest, ${treePathInputParams}) -> (field):

      context = context()
      1 == proofOfOwnership(pk, sk, context) 

      lhs = unpack256(pk[0])
      rhs = unpack256(pk[1])
      leafHash = sha256(lhs, rhs)
      leafHash == combine256(leafDigest)
      ${pathUnpacking} 

      field[256] currentDigest = leafHash
      ${treePathGenerator}

      treeRoot = combine256(rootDigest)
      treeRoot == currentDigest

      return 1
  `;
}

const votingCode = `
pragma solidity 0.6.1;
pragma experimental ABIEncoderV2;

import './verifier.sol';
import './electionRegistry.sol';


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
  mapping (bytes32 => bool) votingRecord;
  event logWithdrawal(address receiver, uint amount);

  constructor(
    address registryAdd,
    bytes32 root,
    bytes32[] memory registry,
    bytes32[] memory candidateNames
  ) public payable {
    merkleRoot = root;
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
    Proof memory proof,
    uint[3] memory input
  ) public returns (bool) {
    require(validCandidate(candidate), "Invalid candidate name");
    bytes32 electionRoot = bytes32((input[0] << (16 * 8)) + input[1]);
    require(electionRoot == merkleRoot, "Invalid election");
    bytes32 hashedProof = serializeProof(proof, input);
    require(unusedProof(hashedProof), "Proof already used");
    require(verifyTx(proof, input), "Incorrect proof given");
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

  function serializeProof(Proof memory proof, uint256[3] memory input) internal pure returns (bytes32) {
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
`;

const electionRegister = `
pragma solidity ^0.6.1;


contract ElectionRegistry {
  mapping(address => address[]) user_elections;
  event logRegistration(address election);

  function register(address owner, address election) public {
    user_elections[owner].push(election); // -1 is very important
    emit logRegistration(election);
  }

  function findContract(address user) public returns (address[] memory){
    return user_elections[user];
  }
}
`;

export { generateZokratesProof, votingCode, electionRegister }