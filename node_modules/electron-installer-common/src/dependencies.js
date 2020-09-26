'use strict'

const _ = require('lodash')
const semver = require('semver')

/**
 * Determine whether libatspi2 is necessary, given the Electron version.
 */
function getATSPIDepends (version, dependencyMap) {
  return semver.gte(version, '5.0.0-beta.1') ? [dependencyMap.atspi] : []
}

/**
 * Determine whether DRM is a necessary dependency, given the Electron version.
 */
function getDRMDepends (version, dependencyMap) {
  return semver.gte(version, '9.0.0-beta.1') ? [dependencyMap.drm] : []
}

/**
 * Determine whether GBM is a necessary dependency, given the Electron version.
 */
function getGBMDepends (version, dependencyMap) {
  return semver.gte(version, '9.0.0-beta.1') ? [dependencyMap.gbm] : []
}

/**
 * Determine whether GConf is a necessary dependency, given the Electron version.
 */
function getGConfDepends (version, dependencyMap) {
  return semver.lt(version, '3.0.0-beta.1') ? [dependencyMap.gconf] : []
}

/**
 * Determine the GTK dependency based on the Electron version in use.
 */
function getGTKDepends (version, dependencyMap) {
  return semver.gte(version, '2.0.0-beta.1') ? dependencyMap.gtk3 : dependencyMap.gtk2
}

/**
 * Determine the dependencies for the `shell.moveItemToTrash` Electron API, based on the
 * Electron version in use.
 *
 * @return {string[]} an ordered list of dependencies that are OR'd together by the installer module.
 */
function getTrashDepends (version, dependencyMap) {
  if (semver.lt(version, '1.4.1')) {
    return [dependencyMap.gvfs]
  } else if (semver.lt(version, '1.7.2')) {
    return _.flatten([dependencyMap.kdeCliTools, dependencyMap.kdeRuntime, dependencyMap.trashCli, dependencyMap.gvfs])
  } else {
    return _.flatten([dependencyMap.kdeCliTools, dependencyMap.kdeRuntime, dependencyMap.trashCli, dependencyMap.glib2, dependencyMap.gvfs])
  }
}

/**
 * Determine whether libuuid is necessary, given the Electron version.
 */
function getUUIDDepends (version, dependencyMap) {
  return semver.satisfies(version, '>=4.0.0-beta.1 <8.0.0-beta.1') ? [dependencyMap.uuid] : []
}

/**
 * Determine whether dri3 extension for X C Binding is a necessary dependency, given the Electron version.
 */
function getXcbDri3Depends (version, dependencyMap) {
  return semver.gte(version, '9.0.0-beta.1') ? [dependencyMap.xcbDri3] : []
}

/**
 * Determine whether libXss is a necessary dependency, given the Electron version.
 */
function getXssDepends (version, dependencyMap) {
  return semver.lt(version, '10.0.0-beta.1') ? [dependencyMap.xss] : []
}

module.exports = {
  /**
   * Determine the default dependencies for an Electron application.
   */
  getDepends: function getDepends (version, dependencyMap) {
    return [
      getGTKDepends(version, dependencyMap),
      dependencyMap.notify,
      dependencyMap.nss,
      dependencyMap.xtst,
      dependencyMap.xdgUtils
    ].concat(getATSPIDepends(version, dependencyMap))
      .concat(getDRMDepends(version, dependencyMap))
      .concat(getGBMDepends(version, dependencyMap))
      .concat(getGConfDepends(version, dependencyMap))
      .concat(getUUIDDepends(version, dependencyMap))
      .concat(getXcbDri3Depends(version, dependencyMap))
      .concat(getXssDepends(version, dependencyMap))
  },
  getATSPIDepends,
  getDRMDepends,
  getGBMDepends,
  getGConfDepends,
  getGTKDepends,
  getTrashDepends,
  getUUIDDepends,
  getXcbDri3Depends,
  getXssDepends,

  /**
   * Merge the user specified dependencies (from either the API or the CLI) with the respective
   * default dependencies, given the `dependencyKey`.
   *
   * @param {object} data - the user-specified data
   * @param {string} dependencyKey - the dependency type (e.g., `depends` for Debian
   * runtime dependencies)
   * @param {object} defaults - the default options for the installer module
   *
   */
  mergeUserSpecified: function mergeUserSpecified (data, dependencyKey, defaults) {
    if (data.options) { // options passed programmatically
      return _.union(defaults[dependencyKey], data.options[dependencyKey])
    } else { // options passed via command-line
      return _.union(defaults[dependencyKey], data[dependencyKey])
    }
  }
}
