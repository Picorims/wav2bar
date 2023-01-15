//Wav2Bar - Free software for creating audio visualization (motion design) videos
//Copyright (C) 2023  Picorims <picorims.contact@gmail.com>

//This program is free software: you can redistribute it and/or modify
//it under the terms of the GNU General Public License as published by
//the Free Software Foundation, either version 3 of the License, or
//any later version.

//This program is distributed in the hope that it will be useful,
//but WITHOUT ANY WARRANTY; without even the implied warranty of
//MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//GNU General Public License for more details.

//You should have received a copy of the GNU General Public License
//along with this program.  If not, see <https://www.gnu.org/licenses/>.

const {ipcRenderer} = require("electron");
/** @type {object} enumerates available log types */
export const LOG_T = {
    TRACE: "trace",
    DEBUG: "debug",
    INFO: "info",
    LOG: "log",
    WARN: "warn",
    ERROR: "error",
    FATAL: "fatal",
};

/**
 * Logs to the console and to file a message of the given type.
 *
 * @export
 * @param {String} type trace, debug, info, log, warn, error, fatal
 * @param {String} log associated message to log.
 */
export function CustomLog(type, log) {
    switch (type) {
        case "trace":
            console.log("[TRACE] ",log);
            break;
        case "debug":
            console.debug(log);
            break;
        case "info":
            console.info(log);
            break;
        case "log":
            console.log(log);
            break;
        case "warn":
            console.warn(log);
            break;
        case "error":
            console.error(log);
            break;
        case "fatal":
            console.error("[FATAL] ",log);
            break;
    }
    ipcRenderer.invoke("log", type, log);
}
