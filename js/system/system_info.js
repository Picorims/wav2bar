//MIT License - Copyright (c) 2020-2021 Picorims

const {ipcRenderer} = require("electron");

const working_dir = await ipcRenderer.invoke('get-working-dir');
const os = await ipcRenderer.invoke('get-os');
const root_dir = await ipcRenderer.invoke('get-app-root');
const argv = await ipcRenderer.invoke('argv');

export {working_dir, os, root_dir, argv}