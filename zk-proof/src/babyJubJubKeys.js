const { PublicKey, PrivateKey } = require('babyjubjub');
 
//get PrivateKey object(field, hexstring)
let sk = PrivateKey.getRandObj().field;
//get PrivateKey object from field(or hexstring)
let privKey = new PrivateKey(sk);
//get PublicKey object from privateKey object
let pubKey = PublicKey.fromPrivate(privKey);
 
//PublicKey.p is <Point> Class
// console.log(pubKey.p);
 
// //return Pub Key (X and Y) --> <Field> Class
// console.log(pubKey.p.x);
// console.log(pubKey.p.y);
 
//Get <BigInteger> Class (X, Y)
console.log(`privatekey:\n${privKey.s.n}`)
console.log(`pubKey-x:\n${pubKey.p.x.n}`);
console.log(`pubKey-y:\n${pubKey.p.y.n}`);