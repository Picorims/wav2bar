'use strict'

const replaceScopeName = require('./replacescopename')

/**
 * Sanitizes a package name for use as an installer name.
 *
 * Includes running `replaceScopeName`.
 *
 * @param {string} name - the Node package name to normalize
 * @param {string} allowedCharacterRange - a `RegExp` range (minus the square brackets) of allowable
 * characters for the given installer
 * @param {?string} [replacement='-'] - the character(s) to replace invalid characters with
 */
module.exports = function sanitizeName (name, allowedCharacterRange, replacement) {
  replacement = replacement || '-'

  return replaceScopeName(name, replacement).replace(new RegExp(`[^${allowedCharacterRange}]`, 'g'), replacement)
}
