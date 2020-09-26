'use strict'

const getHomePage = require('./gethomepage')

/**
 * Generate default configuration values from the given parsed `package.json`.
 *
 * @param {object} pkg - the parsed `package.json` file
 * @param {?object} fallbacks - fallback default value for certain options, currently:
 * * `revision`
 */
module.exports = function getDefaultsFromPackageJSON (pkg, fallbacks = {}) {
  return {
    arch: undefined,
    bin: pkg.name || 'electron',
    execArguments: [],
    categories: [
      'GNOME',
      'GTK',
      'Utility'
    ],
    description: pkg.description,
    genericName: pkg.genericName || pkg.productName || pkg.name,
    homepage: getHomePage(pkg),
    mimeType: [],
    name: pkg.name || 'electron',
    productDescription: pkg.productDescription || pkg.description,
    productName: pkg.productName || pkg.name,
    revision: pkg.revision || fallbacks.revision
  }
}
