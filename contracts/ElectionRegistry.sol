pragma solidity ^0.6.1;


contract ElectionRegistry {
  mapping(address => address[]) user_elections;
  event logRegistration(address election);

  function register(address owner, address election) public returns (uint) {
    user_elections[owner].push(election); // -1 is very important
    // emit logRegistration(election);
    return 1;
  }

  function findContract(address user) public returns (address[] memory){
    return user_elections[user];
  }
}