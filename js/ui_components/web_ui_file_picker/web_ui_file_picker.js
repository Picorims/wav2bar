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

import {WebUICustomComponent, register} from "../web_ui_custom_component.js";

const TAG = "ui-file-picker";
// useful for intellisense and auto completion
const PROPS = {
    path: "path",
    type: "type",
    button_text: "button_text",
    opened_span_text: "opened_span_text",
    show_input: "show_input"
};
// declared here to have both in sight at the same time
const PROPS_DEFAULTS = {
    path: "",
    type: ["#any"],
    button_text: "BROWSE",
    opened_span_text: "Opened",
    show_input: false
};

const STATES = {
    allowed_extensions: "allowed_extensions"
};
const STATES_DEFAULTS = {
    allowed_extensions: ["#any"]
};

const EVENTS = {
    path_chosen: "path_chosen"
};

/**
 * Component that allows picking a path through the file picker dialog.
 */
export class WebUIFilePicker extends WebUICustomComponent {
    /**
     * List of properties of the element, accessible to the user.
     * @enum
     */
    PROPS = {...PROPS};

    /**
     * List of states of the element, accessible to the user.
     * @enum
     */
    STATES = {...STATES};

    /**
     * List of events of the element, accessible to the user.
     * @enum
     */
    EVENTS = {...EVENTS};

    constructor() {
        super(TAG, {
            props: {...PROPS_DEFAULTS},
            states: {...STATES_DEFAULTS},
            events: {...EVENTS}
        });

        /** @type {uiComponents.WebUIBindInput} */
        let input = this._shadow_root.querySelector(".ui-file-picker-input");
        /** @type {HTMLButtonElement} */
        let browse_btn = this._shadow_root.querySelector(".ui-file-picker-button");
        /** @type {HTMLSpanElement} */
        let path_disp = this._shadow_root.querySelector(".ui-file-picker-path-disp");
        /** @type {HTMLSpanElement} */
        let opened_span = this._shadow_root.querySelector(".ui-file-picker-opened-span");

        let click_fn = () => {
            window.FileBrowserDialog({
                type: "get_file",
                allowed_extensions: ["#any"]
            }, (result) => {
                this.setProp(PROPS.path, result);
                this.triggerEvent(EVENTS.path_chosen, result);
            });
        };

        this.onDOMReadyOnce(() => {
            this.subscribeToProp(PROPS.button_text, (text) => {
                browse_btn.textContent = text;
            });
            this.subscribeToProp(PROPS.path, (path) => {
                path_disp.textContent = path;
            });
            this.subscribeToProp(PROPS.opened_span_text, (text) => {
                opened_span.textContent = text;
            });
            this.bindStates(`props/${this.PROPS.path}`, input, `props/${input.PROPS.value}`);
        });

        this.onDOMReady(() => {
            browse_btn.addEventListener("click", click_fn);
        }, () => {
            browse_btn.removeEventListener("click", click_fn);
        });

        // TODO : button event listener + fix label block
    }
}
await register(TAG, WebUIFilePicker);
