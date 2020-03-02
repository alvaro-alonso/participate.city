const Voting = artifacts.require('Voting');
const BN256G2 = artifacts.require('BN256G2');
const Pairing = artifacts.require('Pairing');
const Verifier = artifacts.require('Verifier');
const Register = artifacts.require('ElectionRegistry');

const toHex = (candidates) => candidates.map((cand) => web3.utils.asciiToHex(cand));
const candidates1 = ['Rama', 'Nick', 'Jose'];
const candidates2 = ['Vishnu', 'Jon', 'Maria'];
const setup = { value: 1000000000000000, gas: 6700000 };

module.exports = async function(deployer) {
  deployer.deploy(BN256G2);
  deployer.deploy(Pairing);
  deployer.link(BN256G2, Verifier);
  deployer.deploy(Verifier);
  deployer.link(BN256G2, Voting);

  await deployer.deploy(Register);
  const registerAdd = await Register.deployed();
  deployer.deploy(Voting, registerAdd, web3.utils.asciiToHex('treeRoot'), toHex(candidates1), toHex(candidates2), setup);
};
