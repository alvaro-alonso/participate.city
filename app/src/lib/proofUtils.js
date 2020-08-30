import web3 from "web3";
import ecc from "eosjs-ecc";


export const validKey = (keyStr) => {
  const numberStr = keyStr.replace('0x', '')
  if (web3.utils.isHexStrict(keyStr) && numberStr !== '') return true;
  else return false;
}

export const hashPubKey = (pointX, pointY) => {
  const x = web3.utils.toBN(pointX), y = web3.utils.toBN(pointY);
  const num = Buffer.from([...(x.toArray()), ...(y.toArray())]);
  return ecc.sha256(num);
}

export const calculateMerklePath = (voterIndex, treeDepth) => {
  if (voterIndex < 0 || treeDepth < 0 || voterIndex >= Math.pow(2, treeDepth)) {
    throw new RangeError('voterIndex and TreeDepth must be positive, and voterIndex in a valid Range');
  }

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