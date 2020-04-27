pragma solidity ^0.6.1;


contract ElectionRegistry {
  mapping(address => address[]) elections;
  mapping(uint => address) verifiers;
  event logRegistration(address electionAdd);

  function registerElection(address owner, address electionAdd) public returns (uint) {
    elections[owner].push(electionAdd); // -1 is very important
    emit logRegistration(electionAdd);
    return 1;
  }

  function registerVerifier(uint size, address electionAdd) public returns (bool) {
    require(verifiers[size] == address(0), "verifier contract already exists");
    verifiers[size] = electionAdd;
    return true;
  }

  function findElection(address user) public view returns (address[] memory) {
    return elections[user];
  }

  function findVerifier(uint size) public view returns (address) {
    return verifiers[size];
  }
}