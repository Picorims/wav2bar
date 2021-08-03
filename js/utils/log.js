//MIT License - Copyright (c) 2020-2021 Picorims

const {ipcRenderer} = require("electron");

export function CustomLog(type, log) {
    switch (type) {
        case 'trace':
            console.log('[TRACE] ',log);
            break;
        case 'debug':
            console.debug(log);
            break;
        case 'info':
            console.info(log);
            break;
        case 'log':
            console.log(log);
            break;
        case 'warn':
            console.warn(log);
            break;
        case 'error':
            console.error(log);
            break;
        case 'fatal':
            console.error('[FATAL] ',log);
            break;
    }
    ipcRenderer.invoke('log', type, log);
}