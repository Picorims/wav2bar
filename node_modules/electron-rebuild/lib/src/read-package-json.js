"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readPackageJson = void 0;
const fs = require("fs-extra");
const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function readPackageJson(dir, safe = false) {
    try {
        return await fs.readJson(path.resolve(dir, 'package.json'));
    }
    catch (err) {
        if (safe) {
            return {};
        }
        else {
            throw err;
        }
    }
}
exports.readPackageJson = readPackageJson;
//# sourceMappingURL=read-package-json.js.map