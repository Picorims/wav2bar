"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var temp = __importStar(require("temp"));
var util_1 = require("util");
temp.track();
var createTempDir = util_1.promisify(temp.mkdir);
exports.createTempDir = createTempDir;
//# sourceMappingURL=temp-utils.js.map