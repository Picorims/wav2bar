'use strict'

const fs = require('fs-extra')
const path = require('path')

/**
 * Returns the path to chrome-sandbox if it exists, undefined otherwise.
 */
async function sandboxHelperPath (appDir) {
  const helperPath = path.join(appDir, 'chrome-sandbox')
  if (await fs.pathExists(helperPath)) {
    return helperPath
  }
}

module.exports = {
  hasSandboxHelper: async function hasSandboxHelper (appDir) {
    return typeof (await sandboxHelperPath(appDir)) !== 'undefined'
  },
  /**
   * For Electron versions that support the setuid sandbox on Linux, changes the permissions of
   * the `chrome-sandbox` executable as appropriate.
   *
   * The sandbox helper executable must have the setuid (`+s` / `0o4000`) bit set.
   *
   * This doesn't work on Windows because you can't set that bit there.
   *
   * See: https://github.com/electron/electron/pull/17269#issuecomment-470671914
   */
  updateSandboxHelperPermissions: async function updateSandboxHelperPermissions (appDir) {
    const helperPath = await sandboxHelperPath(appDir)
    if (typeof helperPath !== 'undefined') {
      return fs.chmod(helperPath, 0o4755)
    }
  }
}
