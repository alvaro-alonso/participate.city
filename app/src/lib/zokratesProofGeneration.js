
const generateZokratesProof = (voterNumber, treeRoot) => {
  
  const treeDepth = Math.ceil(Math.log2(voterNumber));
  const iterations =[...Array(treeDepth).keys()];
  const treeIteration = (i) => {
    return `
      preimage = multiplex(directionSelector[${i}], currentDigest, pathHash${i})
      lhs = preimage[0..256]
      rhs = preimage[256..512]
      currentDigest = sha256(lhs, rhs)
    `;
  };
  const treePathGenerator = iterations.map(i => treeIteration(i)).join('');
  const treePathInputParams = iterations.map(i => `private field[2] pathDigest${i}`).join(', ');
  const pathUnpacking = iterations.map(i => `pathHash${i} = combine256(pathDigest${i})`).join('\n');

  return `
  import "ecc/babyjubjubParams" as context
  import "ecc/proofOfOwnership" as proofOfOwnership
  import "hashes/sha256/512bitPadded" as sha256
  import "utils/pack/nonStrictUnpack256" as unpack256
  import "utils/pack/unpack128" as unpack128
  import "hashes/utils/256bitsDirectionHelper" as multiplex


  def combine256(field[2] values) -> (field[256]):
      a = unpack128(values[0])
      b = unpack128(values[1])
      return [...a, ...b]

  def main(private field[2] pk, private field sk, private field[${treeDepth}] directionSelector, private field[2] leafDigest, ${treePathInputParams}) -> (field):

      context = context()
      1 == proofOfOwnership(pk, sk, context) 

      lhs = unpack256(pk[0])
      rhs = unpack256(pk[1])
      leafHash = sha256(lhs, rhs)
      leafHash == combine256(leafDigest)
      ${pathUnpacking} 

      field[256] currentDigest = leafHash
      ${treePathGenerator}
      [${treeRoot}] == currentDigest

      return 1
  `;
}

export default generateZokratesProof