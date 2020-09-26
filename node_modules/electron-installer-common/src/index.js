'use strict'

const dependencies = require('./dependencies')
const desktop = require('./desktop')
const ElectronInstaller = require('./installer')
const error = require('./error')
const getDefaultsFromPackageJSON = require('./defaults')
const getHomePage = require('./gethomepage')
const readElectronVersion = require('./readelectronversion')
const readMetadata = require('./readmetadata')
const replaceScopeName = require('./replacescopename')
const sanitizeName = require('./sanitizename')
const { spawn } = require('@malept/cross-spawn-promise')
const template = require('./template')
const sandboxHelper = require('./sandboxhelper')

module.exports = {
  ...dependencies,
  ...sandboxHelper,
  createDesktopFile: desktop.createDesktopFile,
  createTemplatedFile: template.createTemplatedFile,
  ElectronInstaller,
  errorMessage: error.errorMessage,
  generateTemplate: template.generateTemplate,
  getDefaultsFromPackageJSON,
  getHomePage,
  readElectronVersion,
  readMetadata,
  replaceScopeName,
  sanitizeName,
  spawn,
  wrapError: error.wrapError
}
