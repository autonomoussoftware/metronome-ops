'use strict'

const crypto = require('crypto')
const MerkleTree = require('merkletreejs')

/**
 * Hash data using SHA-256 algorithm.
 *
 * @param {Buffer} data The data to hash.
 * @returns {Buffer} The hash.
 */
const sha256 = data => crypto.createHash('sha256').update(data).digest()

/**
 * Calculate the merkle root of an array of hashes.
 *
 * All hashes shall be prefixed with `0x`.
 *
 * @param {string[]} hashes The hashes.
 * @returns {string} The merkle root.
 */
function calcMerkleRoot (hashes) {
  const leaves = hashes.map(x => Buffer.from(x.slice(2), 'hex'))
  // @ts-ignore: TS seems unable to properly identify `MerkleTree` as a class.
  const tree = new MerkleTree(leaves, sha256)
  return `0x${tree.getRoot().toString('hex')}`
}

module.exports = calcMerkleRoot
