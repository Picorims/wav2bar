//Wav2Bar - Free software for creating audio visualization (motion design) videos
//Copyright (C) 2022  Picorims <picorims.contact@gmail.com>

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

//MODULE GATHERING ALL SUBMODULES RELATED TO CREATING USER INTERFACES.

/* eslint-disable no-unused-vars */

export * from "./ui_base_components.js";
export * from "./ui_parameters.js";
export * from "./ui_append_help.js";
export * from "./ui_object_frame.js";
export * from "./ui_loading_frame.js";
export * from "./web_ui_custom_component.js";

export * from "./layout/web_ui_split_layout/web_ui_split_layout.js";
export * from "./web_ui_label_block/web_ui_label_block.js";
export * from "./parameter/web_ui_parameter/web_ui_parameter.js";
export * from "./web_ui_help_node/web_ui_help_node.js";
export * from "./web_ui_bind_input/web_ui_bind_input.js";
export * from "./web_ui_file_picker/web_ui_file_picker.js";

// loaded last to ensure all components were loaded when this code is called
import { _CustomComponentsReady } from "./dom_ready.js";
_CustomComponentsReady();