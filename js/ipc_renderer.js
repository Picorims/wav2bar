//MIT License - Copyright (c) 2020-2021 Picorims

const { ipcRenderer } = require("electron");
export const invoke = ipcRenderer.invoke;