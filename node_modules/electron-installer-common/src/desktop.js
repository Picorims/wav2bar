'use strict'

const { createTemplatedFile } = require('./template')
const debug = require('debug')('electron-installer-common:desktop')
const path = require('path')
const { wrapError } = require('./error')

module.exports = {
  createDesktopFile: async function createDesktopFile (templatePath, dir, baseName, options) {
    const dest = path.join(dir, `${baseName}.desktop`)
    debug(`Creating desktop file at ${dest}`)

    return wrapError('creating desktop file', () => createTemplatedFile(templatePath, dest, options, 0o644))
  }
}
