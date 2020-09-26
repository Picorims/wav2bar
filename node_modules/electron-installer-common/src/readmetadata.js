'use strict'

const { promisify } = require('util')

const asar = require('asar')
const fs = require('fs-extra')
const glob = promisify(require('glob'))
const path = require('path')
const { wrapError } = require('./error')

async function determineResourcesDir (src) {
  if (await fs.pathExists(path.join(src, 'resources'))) {
    return 'resources'
  }

  return (await glob('*.app/Contents/Resources', { cwd: src }))[0]
}

async function readPackageJSONFromUnpackedApp (resourcesDir, options) {
  const appPackageJSONPath = path.join(options.src, resourcesDir, 'app', 'package.json')
  options.logger(`Reading package metadata from ${appPackageJSONPath}`)

  return fs.readJson(appPackageJSONPath)
    .catch(err => {
      throw new Error(`Could not find, read, or parse package.json in packaged app '${options.src}':\n${err.message}`)
    })
}

/**
 * Read `package.json` either from `$RESOURCES_DIR/app.asar` (if the app is packaged)
 * or from `$RESOURCES_DIR/app/package.json` (if it is not). `$RESOURCES_DIR` is either
 * `AppName.app/Contents/Resources` on macOS, or `resources` on other platforms.
 *
 * Options used:
 *
 * * `src`: the directory containing the bundled app
 * * `logger`: function that handles debug messages, e.g.,
 *             `debug('electron-installer-something:some-module')`
 */
module.exports = async function readMetadata (options) {
  return wrapError('reading package metadata', async () => {
    const resourcesDir = await determineResourcesDir(options.src)
    if (!resourcesDir) {
      throw new Error('Could not determine resources directory in Electron app')
    }
    const appAsarPath = path.join(options.src, resourcesDir, 'app.asar')

    if (await fs.pathExists(appAsarPath)) {
      options.logger(`Reading package metadata from ${appAsarPath}`)
      return JSON.parse(asar.extractFile(appAsarPath, 'package.json'))
    } else {
      return readPackageJSONFromUnpackedApp(resourcesDir, options)
    }
  })
}
