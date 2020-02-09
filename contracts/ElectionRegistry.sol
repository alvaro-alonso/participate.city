pragma solidity >=0.4.0 <0.6.0;

import "./Voting.sol";

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
  
  function deployElection(bytes32[] memory candidates, uint64 budget, bytes32 root, bytes32[] voters) public payable returns (address Election) {
    require(msg.value >= budget, "Insuficient funds sent to election");
    Voting election = (new Voting).value(budget)(root, voters, candidates);
    address electionAdd = address(election);
    register(msg.sender, electionAdd);
    return electionAdd;
  }
}