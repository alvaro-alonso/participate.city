const fs = require('fs');
const { MerkleTree } = require("merkletreejs");
const ecc = require('eosjs-ecc');
const Web3Utils = require('web3-utils');

const voters = JSON.parse(fs.readFileSync('./voters.json'));
const hashes = voters.map(({ hash }) => hash);
const tree = new MerkleTree(hashes, ecc.sha256);
tree.print();