'use strict'

const { promisify } = require('util')

const _ = require('lodash')
const debug = require('debug')('electron-installer-common:installer')
const desktop = require('./desktop')
const error = require('./error')
const fs = require('fs-extra')
const glob = promisify(require('glob'))
const path = require('path')
const template = require('./template')
const tmp = require('tmp-promise')
const { updateSandboxHelperPermissions } = require('./sandboxhelper')

tmp.setGracefulCleanup()

class ElectronInstaller {
  constructor (userSupplied) {
    this.userSupplied = userSupplied
  }

  get appIdentifier () {
    return this.options.name
  }

  get baseAppDir () {
    return 'usr'
  }

  /* istanbul ignore next */
  /**
   * A list of method names to run during `createContents()`.
   */
  get contentFunctions () {
    throw new Error('Please implement contentFunctions')
  }

  /* istanbul ignore next */
  /**
   * The path to the default .desktop file template.
   */
  get defaultDesktopTemplatePath () {
    throw new Error('Please implement defaultDesktopTemplatePath')
  }

  /**
   * The Linux pixmap icon path, relative to the `baseAppDir`.
   */
  get pixmapIconPath () {
    return path.join('share', 'pixmaps', `${this.appIdentifier}.png`)
  }

  get sourceDir () {
    if (this.options) {
      return this.options.src
    } else if (this.userSupplied.src) {
      return this.userSupplied.src
    } else if (this.userSupplied.options) {
      return this.userSupplied.options.src
    }

    return undefined
  }

  /**
   * The directory that the bundled application is copied to, relative to `stagingDir`.
   */
  get stagingAppDir () {
    return path.join(this.stagingDir, this.baseAppDir, 'lib', this.appIdentifier)
  }

  /**
   * Copies the bundled application into the staging directory.
   */
  async copyApplication (ignoreFunc) {
    debug(`Copying application to ${this.stagingAppDir}`)

    return error.wrapError('copying application directory', async () => {
      await fs.ensureDir(this.stagingAppDir, '0755')
      return fs.copy(this.sourceDir, this.stagingAppDir, { filter: ignoreFunc })
    })
  }

  /**
   * Create hicolor icon for the package.
   */
  async copyHicolorIcons () {
    return Promise.all(_.map(this.options.icon, (iconSrc, resolution) => {
      const iconExt = ['scalable', 'symbolic'].includes(resolution) ? 'svg' : 'png'
      const iconName = resolution === 'symbolic' ? `${this.appIdentifier}-symbolic` : this.appIdentifier
      const iconFile = path.join(this.stagingDir, this.baseAppDir, 'share', 'icons', 'hicolor', resolution, 'apps', `${iconName}.${iconExt}`)

      return error.wrapError('creating hicolor icon file', async () => this.copyIcon(iconSrc, iconFile))
    }))
  }

  /**
   * Generically copy an icon.
   */
  async copyIcon (src, dest) {
    debug(`Copying icon file at from "${src}" to "${dest}"`)

    if (!await fs.pathExists(src)) {
      throw new Error(`The icon "${src}" does not exist`)
    }
    await fs.ensureDir(path.dirname(dest), '0755')
    await fs.copy(src, dest)
    return fs.chmod(dest, '0644')
  }

  /**
   * Copy `LICENSE` from the root of the app to a different location.
   */
  async copyLicense (copyrightFile) {
    const licenseSrc = path.join(this.sourceDir, 'LICENSE')
    debug(`Copying license file from ${licenseSrc}`)

    return fs.copy(licenseSrc, copyrightFile)
  }

  /**
   * Copy icons into the appropriate locations on Linux.
   */
  async copyLinuxIcons () {
    if (_.isObject(this.options.icon)) {
      return this.copyHicolorIcons()
    } else if (this.options.icon) {
      return this.copyPixmapIcon()
    }
  }

  /**
   * Create pixmap icon for the package.
   */
  async copyPixmapIcon () {
    const iconFile = path.join(this.stagingDir, this.baseAppDir, this.pixmapIconPath)

    return error.wrapError('creating pixmap icon file', async () => this.copyIcon(this.options.icon, iconFile))
  }

  /**
   * Create the symlink to the binary for the package.
   */
  async createBinarySymlink () {
    const binSrc = path.join('../lib', this.appIdentifier, this.options.bin)
    const binDest = path.join(this.stagingDir, this.baseAppDir, 'bin', this.appIdentifier)
    debug(`Symlinking binary from ${binSrc} to ${binDest}`)

    const bundledBin = path.join(this.sourceDir, this.options.bin)

    return error.wrapError('creating binary symlink', async () => {
      if (!await fs.pathExists(bundledBin)) {
        throw new Error(`could not find the Electron app binary at "${bundledBin}". You may need to re-bundle the app using Electron Packager's "executableName" option.`)
      }
      await fs.ensureDir(path.dirname(binDest), '0755')
      return fs.symlink(binSrc, binDest, 'file')
    })
  }

  /**
   * Generate the contents of the package in "parallel" by calling the methods specified in
   * `contentFunctions` getter through `Promise.all`.
   */
  async createContents () {
    debug('Creating contents of package')

    return error.wrapError('creating contents of package', async () => Promise.all(this.contentFunctions.map(func => this[func]())))
  }

  /**
   * Create copyright for the package.
   */
  async createCopyright () {
    const copyrightFile = path.join(this.stagingDir, this.baseAppDir, 'share', 'doc', this.appIdentifier, 'copyright')
    debug(`Creating copyright file at ${copyrightFile}`)

    return error.wrapError('creating copyright file', async () => {
      await fs.ensureDir(path.dirname(copyrightFile), '0755')
      await this.copyLicense(copyrightFile)
      await fs.chmod(copyrightFile, '0644')
    })
  }

  /**
   * Create the freedesktop.org .desktop file for the package.
   *
   * See: http://standards.freedesktop.org/desktop-entry-spec/latest/
   */
  async createDesktopFile () {
    const templatePath = this.options.desktopTemplate || this.defaultDesktopTemplatePath
    const baseDir = path.join(this.stagingDir, this.baseAppDir, 'share', 'applications')
    return desktop.createDesktopFile(templatePath, baseDir, this.appIdentifier, this.options)
  }

  /**
   * Create temporary directory where the contents of the package will live.
   */
  async createStagingDir () {
    debug('Creating staging directory')

    return error.wrapError('creating staging directory', async () => {
      const dir = await tmp.dir({ prefix: 'electron-installer-', unsafeCleanup: true })
      this.stagingDir = path.join(dir.path, `${this.appIdentifier}_${this.options.version}_${this.options.arch}`)
      return fs.ensureDir(this.stagingDir, '0755')
    })
  }

  async createTemplatedFile (templatePath, dest, filePermissions) {
    return template.createTemplatedFile(templatePath, dest, this.options, filePermissions)
  }

  /**
   * Flattens and merges default values, CLI-supplied options, and API-supplied options.
   */
  generateOptions () {
    this.options = _.defaults({}, this.userSupplied, this.userSupplied.options, this.defaults)
  }

  /**
   * Move the package to the specified destination.
   *
   * Also adds `packagePaths` to `options`, which is an `Array` of the absolute paths to the
   * moved packages.
   */
  async movePackage () {
    debug('Moving package to destination')

    return error.wrapError('moving package files', async () => {
      const files = await glob(this.packagePattern)
      this.options.packagePaths = await Promise.all(files.map(async file => {
        const renameTemplate = this.options.rename(this.options.dest, path.basename(file))
        const dest = _.template(renameTemplate)(this.options)
        debug(`Moving file ${file} to ${dest}`)
        await fs.move(file, dest, { clobber: true })
        return dest
      }))
    })
  }

  /**
   * For Electron versions that support the setuid sandbox on Linux, changes the permissions of
   * the `chrome-sandbox` executable as appropriate.
   */
  async updateSandboxHelperPermissions () {
    return updateSandboxHelperPermissions(this.stagingAppDir)
  }
}

module.exports = ElectronInstaller
