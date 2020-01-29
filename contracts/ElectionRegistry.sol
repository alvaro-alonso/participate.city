pragma solidity >=0.4.21 <0.6.0;

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

