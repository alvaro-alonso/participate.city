const fs = require('fs');
const { PublicKey, PrivateKey } = require('babyjubjub');
 
const voters = [];

for (let i = 0; i < 6; i++) {
  //get PrivateKey object(field, hexstring)
  let sk = PrivateKey.getRandObj().field;
  //get PrivateKey object from field(or hexstring)
  let privKey = new PrivateKey(sk);
  //get PublicKey object from privateKey object
  let pubKey = PublicKey.fromPrivate(privKey);
  const voter = {
    privatekey: privKey.s.n.toString(),
    point_x: pubKey.p.x.n.toString(),
    point_y: pubKey.p.y.n.toString(),
  };
  console.log(voter);
  voters.push(voter);
}

let data = JSON.stringify(voters);
fs.writeFileSync('voters.json', data);