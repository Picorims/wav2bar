/*!
 * get-installed-path <https://github.com/tunnckoCore/get-installed-path>
 *
 * Copyright (c) Charlike Mike Reagent <@tunnckoCore> (http://i.am.charlike.online)
 * Released under the MIT license.
 */

'use strict'

const fs = require('fs')
const path = require('path')
const modules = require('global-modules')

/**
 * > Get installed path of globally or locally `name` package.
 * By default it checks if `name` exists as directory in [global-modules][]
 * directory of the system. Pass `opts.local` to get path of `name`
 * package from local directory or from `opts.cwd`. Returns rejected
 * promise if module not found in global/local `node_modules` folder or
 * if it exist but is not a directory.
 *
 * **Example**
 *
 * ```js
 * const getInstalledPath = require('get-installed-path')
 *
 * getInstalledPath('npm').then((path) => {
 *   console.log(path)
 *   // => '/home/charlike/.nvm/path/to/lib/node_modules/npm'
 * })
 *
 * getInstalledPath('foo-bar-barwerwlekrjw').catch((err) => {
 *   console.log(err.message)
 *   // => 'module not found "foo-bar-barwerwlekrjw" in path ...'
 * })
 *
 * getInstalledPath('npm', {
 *   local: true
 * }).catch((err) => {
 *   console.log(err.message)
 *   // => 'module not found "foo-bar-barwerwlekrjw" in path ...'
 * })
 *
 * getInstalledPath('global-modules', {
 *   local: true
 * }).then((path) => {
 *   console.log(path)
 *   // => '~/code/get-installed-path/node_modules/global-modules'
 * })
 *
 * // If you are using it for some sub-directory
 * // pass `opts.cwd` to be where the `node_modules`
 * // folder is.
 * process.chidr('foo-bar-baz')
 * getInstalledPath('global-modules', {
 *   local: true,
 *   cwd: '../'
 * }).then((path) => {
 *   console.log(path)
 *   // => '~/code/get-installed-path/node_modules/global-modules'
 * })
 *
 * // When searching for the path of a package that is required
 * // by several other packages, its path may not be in the
 * // closest node_modules. In this case, to search recursively,
 * // you can use the following:
 * getInstalledPath('npm', {
 *  paths: process.mainModule.paths
 * }).then((path) => {
 *  // ...
 * })
 * // `process.mainModule` refers to the location of the current
 * // entry script.
 * ```
 *
 * @param  {String} `name` package name
 * @param  {Object} `opts` pass `opts.local` to check locally
 * @return {Promise} rejected promise if `name` not a string or is empty string
 * @api public
 */

module.exports = function getInstalledPath (name, opts) {
  return new Promise((resolve, reject) => {
    if (!isValidString(name)) {
      const message = 'get-installed-path: expect `name` to be string'
      return reject(new TypeError(message))
    }

    const targetPaths = defaults(name, opts)
    const statPath = (filepath) =>
      fs.stat(filepath, (e, stats) => {
        if (e && targetPaths.length > 0) {
          statPath(targetPaths.shift())
          return
        } else if (e) {
          const label = 'get-installed-path:'
          const msg = `${label} module not found "${name}" in path ${filepath}`
          return reject(new Error(msg))
        }

        if (stats.isDirectory()) {
          return resolve(filepath)
        }

        const msg = `Possibly "${name}" is not a directory: ${filepath}`
        let err = new Error('get-installed-path: some error occured! ' + msg)
        reject(err)
      })
    statPath(targetPaths.shift())
  })
}

/**
 * > Get installed path of a `name` package synchronous.
 *
 * **Example**
 *
 * ```js
 * const getInstalledPath = require('get-installed-path')
 *
 * const npmPath = getInstalledPath.sync('npm')
 * console.log(npmPath)
 * // => '/home/charlike/.nvm/path/to/lib/node_modules/npm'
 *
 * const gmPath = getInstalledPath.sync('global-modules', { local: true })
 * console.log(gmPath)
 * // => '~/code/get-installed-path/node_modules/global-modules'
 * ```
 *
 * @name   .sync
 * @param  {String} `name` package name
 * @param  {Object} `opts` pass `opts.local` to check locally
 * @return {Boolean} or throw `TypeError` if `name` not a string or is empty string
 * @api public
 */

module.exports.sync = function getInstalledPathSync (name, opts) {
  if (!isValidString(name)) {
    throw new TypeError('get-installed-path: expect `name` to be string')
  }

  const filePaths = defaults(name, opts)
  const firstPath = filePaths[0]
  const modulePath = filePaths.find((filePath) => {
    let stat = null

    try {
      stat = fs.statSync(filePath)
    } catch (e) {
      return false
    }

    if (stat.isDirectory()) {
      return true
    }

    const msg = `Possibly "${name}" is not a directory: ${filePath}`
    throw new Error('get-installed-path: some error occured! ' + msg)
  })

  if (!modulePath) {
    const label = 'get-installed-path:'
    const msg = `${label} module not found "${name}" in path ${firstPath}`
    throw new Error(msg)
  }

  return modulePath
}

function isValidString (val) {
  return typeof val === 'string' ? val.length > 0 : false
}

function defaults (name, opts) {
  opts = opts && typeof opts === 'object' ? opts : {}
  opts.cwd = typeof opts.cwd === 'string' ? opts.cwd : process.cwd()
  if (opts.paths) {
    return opts.paths.map((modulePath) => path.join(modulePath, name))
  } else if (opts.local) {
    return [path.join(opts.cwd, 'node_modules', name)]
  }
  return [path.join(modules, name)]
}
