/*!
 * resolve-package <https://github.com/tunnckoCore/resolve-package>
 *
 * Copyright (c) Charlike Mike Reagent <@tunnckoCore> (http://i.am.charlike.online)
 * Released under the MIT license.
 */

'use strict'

const fs = require('fs')
const path = require('path')
const get = require('get-installed-path')

/**
 * > Get full absolute path of package with `name` from
 * local node_modules or from globally installed.
 *
 * **Example**
 *
 * ```js
 * const resolvePackage = require('resolve-package')
 *
 * resolvePackage('npm').then((fp) => {
 *   console.log(fp)
 *   // => '~/.nvm/versions/node/v7.0.0/lib/node_modules/npm/lib/npm.js'
 * })
 *
 * resolvePackage('standard').then((fp) => {
 *   console.log(fp)
 *   // => '~/.nvm/versions/node/v7.0.0/lib/node_modules/standard/index.js'
 * })
 *
 * resolvePackage('get-installed-path').then((fp) => {
 *   console.log(fp)
 *   // => '~/code/resolve-package/node_modules/get-installed-path/index.js'
 * })
 *
 * resolvePackage('foo-quqixs-dasdasdh').catch((err) => {
 *   console.error(err) // => Error module not found
 * })
 * ```
 *
 * @name   resolvePackage
 * @param  {String}   `name` package name
 * @param  {Function} `opts` optional options such as below
 * @param  {String}   `opts.cwd` directory where is the `node_modules` folder
 * @param  {String}   `opts.mainFile` main file for directories, default `index.js`
 * @param  {String}   `opts.mainField` name of the package.json's "main" field, default `main`
 * @return {Promise}
 * @api public
 */

const resolvePackage = (name, opts) => new Promise((resolve, reject) => {
  opts = opts && typeof opts === 'object' ? opts : {}
  opts.local = true

  get(name, opts).then(tryLoad(opts, resolve), (e) => {
    opts.local = false
    get(name, opts).then(tryLoad(opts, resolve), reject)
  })
})

const tryLoad = (opts, resolve) => (fp) => {
  readPackage(fp).then(
    (pkg) => {
      if (typeof opts.mainFile === 'string') {
        return resolve(path.resolve(fp, opts.mainFile))
      }
      if (typeof opts.mainField === 'string') {
        fp = path.resolve(fp, pkg[opts.mainField])
        return resolve(fp)
      }
      resolve(path.resolve(fp, pkg.main || ''))
    },
    (e) => {
      const index = typeof opts.mainFile === 'string'
        ? opts.mainFile
        : 'index.js'
      resolve(path.resolve(fp, index))
    }
  )
}

const readPackage = (fp) => new Promise((resolve, reject) => {
  fs.readFile(path.resolve(fp, 'package.json'), 'utf8', (err, str) => {
    if (err) return reject(err)
    const json = JSON.parse(str)
    resolve(json)
  })
})

module.exports = resolvePackage
