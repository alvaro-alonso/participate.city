var Voting = artifacts.require('Voting');

module.exports = function(deployer) {
  deployer.deploy(Voting, ['Rama', 'Nick', 'Jose'].map((candidate) => web3.utils.asciiToHex(candidate)), {gas: 6700000});
};
