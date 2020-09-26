'use strict'

const fs = require('fs-extra')
const path = require('path')

/**
 * Reads the Electron version from the bundled Electron app's "version" file.
 *
 * The content of the version file pre-4.0 is the tag name, e.g. "v1.8.1".
 * The content of the version file post-4.0 is just the version.
 * Both of these are acceptable to the `semver` module.
 */
module.exports = async function readElectronVersion (appDir) {
  const tag = await fs.readFile(path.resolve(appDir, 'version'))
  return tag.toString().trim()
}
