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

// THIS MODULE IS LOADED AFTER ALL COMPONENTS MODULES TO FIRE CALLBACKS THAT
// FIRED BEFORE, BUT NEED COMPONENTS TO BE READY.

import { callPendingDOMCallbacks } from "./web_ui_custom_component.js";
let fired = false;

/**
 * Function that fires after all custom components loaded to
 * call pending callbacks related to DOM and custom components.
 * 
 * **Exported because it is needed for the module to be able to be imported.
 * It has *NO* effect after being fired.**
 * @access {private}
 */
export function _CustomComponentsReady() {
    if (!fired) callPendingDOMCallbacks();
    fired = true;
}