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

/** @type {String} */
const working_dir = await ipcRenderer.invoke("get-working-dir");
/** @type {String} */
const os = await ipcRenderer.invoke("get-os");
/** @type {String} */
const root_dir = await ipcRenderer.invoke("get-app-root");
/** @type {String} */
const argv = await ipcRenderer.invoke("argv");

export {working_dir, os, root_dir, argv};