"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const path = require("path");
exports.getTempPath = () => {
    return process.env.TEMP || process.env.TMPDIR || '/tmp';
};
exports.getTempFilePath = (fileName, extension) => {
    const tempFolderPath = path.join(fs.mkdtempSync(path.join(exports.getTempPath(), fileName)));
    const tempFilePath = path.join(tempFolderPath, `${fileName}.${extension}`);
    return { tempFolderPath, tempFilePath };
};
//# sourceMappingURL=fs-helper.js.map