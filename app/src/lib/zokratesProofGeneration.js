
const generateZokratesProof = (voterNumber, treeRoot) => {
  
  const treeDepth = Math.ceil(Math.log2(voterNumber));
  const iterations =[...Array(treeDepth).keys()];
  const treeIteration = (i) => {
    return `
      preimage = multiplex(directionSelector[${i}], leafHash, pathHash${i})
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
  // return `
  // import "ecc/babyjubjubParams" as context
  // import "ecc/proofOfOwnership" as proofOfOwnership
  // import "hashes/sha256/512bitPadded" as sha256
  // import "utils/pack/nonStrictUnpack256" as unpack256
  // import "utils/pack/unpack128" as unpack128
  // import "hashes/utils/256bitsDirectionHelper" as multiplex
  
  
  // // Merke-Tree inclusion proof for tree depth 3 
  // def merkleTreePath(field[256] rootDigest, private field[3] directionSelector, private field[256] leafDigest, field[256] pathDigest0, field[256] pathDigest1, field[256] pathDigest2) -> (field):
  //   // private field[256] PathDigest1, private field[256] PathDigest2
  //   //Setup
  //   field[256] currentDigest = leafDigest
    
  //   //Loop up the tree
  //   preimage = multiplex(directionSelector[0], currentDigest, pathDigest0)
  //   field[256] lhs = preimage[0..256]
  //   field[256] rhs = preimage[256..512]
  //   currentDigest = sha256(lhs, rhs)
  
  //   //Loop up the tree
  //   preimage = multiplex(directionSelector[1], currentDigest, pathDigest1)
  //   lhs = preimage[0..256]
  //   rhs = preimage[256..512]
  //   currentDigest = sha256(lhs, rhs)
  
  //   //Loop up the tree
  //   preimage = multiplex(directionSelector[2], currentDigest, pathDigest2)
  //   lhs = preimage[0..256]
  //   rhs = preimage[256..512]
  //   currentDigest = sha256(lhs, rhs)
  
  //   rootDigest == currentDigest
    
  //   return 1
  
  // def combine256(field[2] values) -> (field[256]):
  //     a = unpack128(values[0])
  //     b = unpack128(values[1])
  //     return [...a, ...b]
  
  // def main(private field[2] pk, private field sk, field[2] rootDigest, private field[3] directionPath, private field[2] leafDigest, private field[2] pathDigest0, private field[2] pathDigest1, private field[2] pathDigest2) -> (field):
  
  //     context = context()
  //     1 == proofOfOwnership(pk, sk, context) 
  
  //     lhs = unpack256(pk[0])
  //     rhs = unpack256(pk[1])
  //     leafHash = sha256(lhs, rhs)
  //     leafHash == combine256(leafDigest)
  //     rootHash = combine256(rootDigest)
  //     pathHash0 = combine256(pathDigest0)
  //     pathHash1 = combine256(pathDigest1)
  //     pathHash2 = combine256(pathDigest2)
      
  //     1 == merkleTreePath(rootHash, directionPath, leafHash, pathHash0, pathHash1, pathHash2)
  
  //     return 1
  // `;
}

export default generateZokratesProof