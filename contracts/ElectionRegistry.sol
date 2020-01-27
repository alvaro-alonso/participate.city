pragma solidity >=0.4.21 <0.6.0;

contract ElectionRegistry {
  mapping(address => address[]) user_elections;

  function register(address election) public {
    user_elections[msg.sender].push(election) - 1; // -1 is very important
  }

  function findContract(address user) view public returns (address[] memory){
    return user_elections[user];
  }
}

