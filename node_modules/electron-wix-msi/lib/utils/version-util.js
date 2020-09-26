"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const semver = require("semver");
const fs_helper_1 = require("./fs-helper");
function isWindowsCompliant(version) {
    const versionArray = version.split('.');
    if (versionArray.length !== 4) {
        return false;
    }
    for (let i = 0; i < 4; i++) {
        if (isNaN(Number(versionArray[i]))) {
            return false;
        }
    }
    return true;
}
function getWindowsCompliantVersion(input) {
    if (isWindowsCompliant(input)) {
        return input;
    }
    const parsed = semver.parse(input);
    if (parsed) {
        return `${parsed.major}.${parsed.minor}.${parsed.patch}.0`;
    }
    else {
        throw new Error('Could not parse semantic version input string');
    }
}
exports.getWindowsCompliantVersion = getWindowsCompliantVersion;
function createInstallInfoFile(manufacturer, appName, productCode, installVersion, arch) {
    const { tempFilePath } = fs_helper_1.getTempFilePath('.installInfo', 'json');
    fs.writeJSONSync(tempFilePath, {
        manufacturer,
        appName,
        productCode,
        arch,
        installVersion,
    });
    return tempFilePath;
}
exports.createInstallInfoFile = createInstallInfoFile;
//# sourceMappingURL=version-util.js.map