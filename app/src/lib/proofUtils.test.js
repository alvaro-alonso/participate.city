import {
  validKey,
  hashPubKey,
  calculateMerklePath,
 } from './proofUtils';


test('Proof Utils: Public Key Format Verification', () => {
  // incorrect values
  expect(validKey('')).toBeFalsy();
  expect(validKey('0x')).toBeFalsy();
  expect(validKey('1323')).toBeFalsy();
  expect(validKey('abcdef')).toBeFalsy();
  expect(validKey('a393b')).toBeFalsy();
  expect(validKey('0xh98')).toBeFalsy();
  
  // correct values
  expect(validKey('0x1a')).toBeTruthy();
});

test('Proof Utils: SHA256 Public Key Hashing Function', () => {

  const x1 = '0x2b224fe2b54f1790e2ce0332a6d2ee9c1a059eeeb2ef4ee1c773086976b54fc5';
  const y1 = '0x13c9658e7df70fad7758beee0974d042b105000dd641b169860d5eba8ccc4369';
  expect(hashPubKey(x1, y1)).toBe('92b34907ec85874ab6faadaa1fd32b3e86c1211c8fb9350a8bf13bd5caf1ff29');

  const x2 = '0x218bfc699f719f500e478178f5e7af0632c0b45d5be5eb77c703e0eed81941f2';
  const y2 = '0x7397f3c6810b2fe4d504af7decf68256f5993ef1ae953243fd6eef85233a35f';
  expect(hashPubKey(x2, y2)).toBe('2122f330922f684ee1c4c49b7e2bcece07da650dfc4a4632b9412a3fa9b0e9f9');

  // test that trailing zeros have no effect on the hashing
  const x3 = '0x1';
  const y3 = '0x0';
  expect(hashPubKey(x3, y3)).toBe('47dc540c94ceb704a23875c11273e16bb0b8a87aed84de911f2133568115f254');

  const x4 = '0x01';
  expect(hashPubKey(x4, y3)).toBe('47dc540c94ceb704a23875c11273e16bb0b8a87aed84de911f2133568115f254');

  const y4 = '0x00';
  expect(hashPubKey(x3, y4)).toBe('47dc540c94ceb704a23875c11273e16bb0b8a87aed84de911f2133568115f254');
});

test('Proof Utils: Calculate Merkle Path', () => {
  const errorMsg = 'voterIndex and TreeDepth must be positive, and voterIndex in a valid Range';
  expect(() => calculateMerklePath(-1, 1)).toThrow(RangeError);
  expect(() => calculateMerklePath(1, -1)).toThrowError(errorMsg);
  expect(calculateMerklePath(0, 1)).toStrictEqual(['0']);
  expect(calculateMerklePath(3, 2)).toStrictEqual(['1', '1']);
  expect(calculateMerklePath(2, 2)).toStrictEqual(['0', '1']);
  expect(calculateMerklePath(1, 3)).toStrictEqual(['1', '0', '0']);
  expect(calculateMerklePath(5, 3)).toStrictEqual(['1', '0', '1']);
});
