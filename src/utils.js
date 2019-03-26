'use strict'

/**
 * Helper to parse a string into a number.
 *
 * @param {string} str The string representation of a number.
 * @returns {number} The number.
 */
const toInt = str => Number.parseInt(str, 10)

/**
 * Helper to translate seconds to milliseconds.
 *
 * @param {number} secs The number of seconds.
 * @returns {number} The number of milliseconds.
 */
const toMs = secs => secs * 1000

/**
 * Helper to translate milliseconds to seconds.
 *
 * @param {number} ms The number of milliseconds.
 * @returns {number} The number of seconds.
 */
const toSec = ms => Math.round(ms / 1000)

module.exports = {
  toInt,
  toMs,
  toSec
}
