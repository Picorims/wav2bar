//MIT License - Copyright (c) 2020-2021 Picorims

const {ipcRenderer} = require("electron");

/** @type {String} */
const working_dir = await ipcRenderer.invoke("get-working-dir");
/** @type {String} */
const os = await ipcRenderer.invoke("get-os");
/** @type {String} */
const root_dir = await ipcRenderer.invoke("get-app-root");
/** @type {String} */
const argv = await ipcRenderer.invoke("argv");

export {working_dir, os, root_dir, argv};