const Voting = artifacts.require('Voting');
const BN256G2 = artifacts.require('BN256G2');
const Pairing = artifacts.require('Pairing');
const Verifier = artifacts.require('Verifier');
const Register = artifacts.require('ElectionRegistry');

const toHex = (candidates) => candidates.map((cand) => web3.utils.asciiToHex(cand));
const voters = [
  '92b34907ec85874ab6faadaa1fd32b3e86c1211c8fb9350a8bf13bd5caf1ff29',
  '5d18f5dbfb0469a7136a3f3f95f46b3b1dbf434e1f9d95574ed8d40f8a40d0f1',
  'ad8dfd7d9441a9c44a796a319cf9a9cc80b056e06b7a3923cc20ce0c8ce1c4a9',
  '2b0a27e9cf8c514a1f01f7b905d6646b066b86a40f87c8fad4277c35cf85eec2',
  '369850511d58b5a40f57279d8ef1e18f84bfed2884ee463307a67077e4c75bf2',
  '9f762e459a5c3c6130ddaa04efa3d9aaf29424e73cb079b4f99a651332b8935a',
  '6760fd62081bbc67ae0320d61122e54871d026be124f41e11df2336077a93c39',
  '5bd9416d7cb4ff4560398e9d6b242fc3aaccea9c456038dcfb548a9ad8593945',
].map((voter) => '0x' + voter);
// const tree = merkleTree
const candidates2 = ['Vishnu', 'Jon', 'Maria'];
const setup = { value: 1000000000000000, gas: 6700000 };

module.exports = async function(deployer) {
  await deployer.deploy(Register);
  const register = await Register.deployed();

};
