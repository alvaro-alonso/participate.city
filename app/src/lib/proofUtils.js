import web3 from "web3";
import ecc from "eosjs-ecc";


export const incorrectPublicKeyFormat = (publicKey) => {
  const pubKey = web3.utils.toBN(publicKey);
  return publicKey.length > 77 || publicKey.length < 76 || !(web3.utils.isBN(pubKey));
}

export const incorrectPrivateKeyFormat = (privateKey) => {
  const privKey = web3.utils.toBN(privateKey);
  return privateKey.length > 39 || privateKey.length < 37 || !(web3.utils.isBN(privKey));
}

export const hashPubKey = (pointX, pointY) => {
  const x = web3.utils.toBN(pointX), y = web3.utils.toBN(pointY);
  const num = [...(x.toArray()), ...(y.toArray())];
  return ecc.sha256(num);
}

export const calculateMerklePath = (voterIndex, treeDepth) => {
  const pathNum = Math.pow(2, treeDepth) + voterIndex;
  const path = pathNum.toString(2).split('').reverse();
  path.pop();
  return path;
}

const bytesToNumberStr = (byteArray) => {
  return web3.utils.hexToNumberString(web3.utils.bytesToHex(byteArray));
}

export const splitBN = (intArray) => {
  return [bytesToNumberStr(intArray.slice(0, 16)), bytesToNumberStr(intArray.slice(16, intArray.length))];
}