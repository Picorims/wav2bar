'use strict'

/**
 * Normalizes a scoped package name for use as an OS package name.
 *
 * @param {?string} [name=''] - the Node package name to normalize
 * @param {?string} [divider='-'] - the character(s) to replace slashes with
 */
module.exports = function replaceScopeName (name, divider) {
  name = name || ''
  divider = divider || '-'
  return name.replace(/^@/, '').replace('/', divider)
}
