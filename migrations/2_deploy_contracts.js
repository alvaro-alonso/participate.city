const Voting = artifacts.require('Voting');
const BN256G2 = artifacts.require('BN256G2');
const Pairing = artifacts.require('Pairing');
const Verifier = artifacts.require('Verifier');
const Register = artifacts.require('ElectionRegistry');

module.exports = function(deployer) {
  deployer.deploy(BN256G2);
  deployer.deploy(Pairing);
  deployer.link(BN256G2, Verifier);
  deployer.deploy(Verifier);
  deployer.link(BN256G2, Voting);
  deployer.deploy(Register).then(() => {
    deployer.deploy(Voting, ['Rama', 'Nick', 'Jose'].map((candidate) => web3.utils.asciiToHex(candidate)), Register.address, { value: 1000000000000000, gas: 6700000});
  });
};
