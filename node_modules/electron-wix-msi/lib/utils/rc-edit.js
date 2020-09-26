"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const path = require("path");
const rcedit = require("rcedit");
const rcinfo = require("rcinfo");
const fs_helper_1 = require("./fs-helper");
function getExtractIcon() {
    if (process.platform === 'win32') {
        return require('exe-icon-extractor').extractIcon;
    }
    else {
        return (_, __) => {
            throw Error('Not implemented');
        };
    }
}
function getFileInfo(exePath) {
    const promise = new Promise((resolve, reject) => {
        rcinfo(exePath, (error, info) => error ? reject(error) : resolve(info));
    });
    return promise;
}
function extractIconFromApp(exePath, tempFolder) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const buffer = getExtractIcon()(exePath, 'large');
            const iconPath = path.join(tempFolder, 'app.ico');
            yield fs.writeFile(iconPath, buffer);
            return iconPath;
        }
        catch (error) {
            console.error('Unable to extract icon from exe. Please provide an explicit icon via parameter.', error);
            return '';
        }
    });
}
function createStubExe(appDirectory, exe, name, manufacturer, description, version, icon) {
    var _a, _b, _c, _d, _e, _f;
    return __awaiter(this, void 0, void 0, function* () {
        const { tempFolderPath, tempFilePath } = fs_helper_1.getTempFilePath(exe, 'exe');
        const stubPath = path.join(__dirname, '../../vendor/StubExecutable.exe');
        yield fs.copyFile(stubPath, tempFilePath);
        const appExe = path.join(appDirectory, `${exe}.exe`);
        let appIconPath;
        if (!icon) {
            appIconPath = yield extractIconFromApp(appExe, path.join(tempFolderPath));
        }
        let rcOptions;
        let rcInfo;
        try {
            rcInfo = yield getFileInfo(appExe);
        }
        catch (error) {
            console.warn('Unable to read file info from exe. Falling back to packaging description.', error);
        }
        rcOptions = {
            'version-string': {
                CompanyName: ((_a = rcInfo) === null || _a === void 0 ? void 0 : _a.CompanyName) || manufacturer,
                FileDescription: ((_b = rcInfo) === null || _b === void 0 ? void 0 : _b.FileDescription) || description,
                LegalCopyright: ((_c = rcInfo) === null || _c === void 0 ? void 0 : _c.LegalCopyright) || `${new Date().getFullYear()}@${manufacturer}`,
                ProductName: ((_d = rcInfo) === null || _d === void 0 ? void 0 : _d.ProductName) || name
            },
            'file-version': ((_e = rcInfo) === null || _e === void 0 ? void 0 : _e.FileVersion) || version,
            'product-version': ((_f = rcInfo) === null || _f === void 0 ? void 0 : _f.ProductVersion) || version,
            icon: icon || appIconPath
        };
        yield rcedit(tempFilePath, rcOptions);
        return tempFilePath;
    });
}
exports.createStubExe = createStubExe;
//# sourceMappingURL=rc-edit.js.map