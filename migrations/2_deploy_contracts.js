const Voting = artifacts.require('Voting');
const BN256G2 = artifacts.require('BN256G2');
const Pairing = artifacts.require('Pairing');
const Verifier = artifacts.require('Verifier');
const Register = artifacts.require('ElectionRegistry');

const toHex = (candidates) => candidates.map((cand) => web3.utils.asciiToHex(cand));
const voters = [
  '92b34907ec85874ab6faadaa1fd32b3e86c1211c8fb9350a8bf13bd5caf1ff29',
  '5d18f5dbfb0469a7136a3f3f95f46b3b1dbf434e1f9d95574ed8d40f8a40d0f1',
];
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

  await deployer.deploy(Voting, registerAdd.address, web3.utils.asciiToHex('treeRoot'), toHex(voters), toHex(candidates2), setup);
};
