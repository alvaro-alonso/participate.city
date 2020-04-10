const fs = require('fs');
const { PublicKey, PrivateKey } = require('babyjubjub');
const { MerkleTree } = require("merkletreejs");
const ecc = require('eosjs-ecc');
const Web3Utils = require('web3-utils');
 
const voters = [];

for (let i = 0; i < 56; i++) {
  //get PrivateKey object(field, hexstring)
  let sk = PrivateKey.getRandObj().field;
  //get PrivateKey object from field(or hexstring)
  let privKey = new PrivateKey(sk);
  //get PublicKey object from privateKey object
  let pubKey = PublicKey.fromPrivate(privKey);
  const decToBNStr = (bn) => bn.toString().replace(".", "").replace(/([eE][-+]?[0-9]+).*$/, "")
  const x = decToBNStr(pubKey.p.x.n), y = decToBNStr(pubKey.p.y.n);
  const num = Buffer.from([...(Web3Utils.toBN(x).toArray()), ...(Web3Utils.toBN(y).toArray())]);
  const voter = {
    privatekey: decToBNStr(privKey.s.n),
    point_x: x,
    point_y: y,
    hash: ecc.sha256(num),
  };
  console.log(JSON.stringify(voter));
}
