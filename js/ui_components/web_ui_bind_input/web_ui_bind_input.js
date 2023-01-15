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

import {WebUICustomComponent, register} from "../web_ui_custom_component.js";
import * as utils from "../../utils/utils.js";

const TAG = "ui-bind-input";
// useful for intellisense and auto completion
const PROPS = {
    value: "value",
    type: "type"
};
// declared here to have both in sight at the same time
const PROPS_DEFAULTS = {
    value: "",
    type: "str"
};

/**
 * Components that makes databinding between an HTML input and state machines
 * easier, through a synchronized `value` property.
 * 
 * At initialization, the value props get priority over the predefined value
 * of the HTML input.
 */
export class WebUIBindInput extends WebUICustomComponent {
    /**
     * List of properties of the element, accessible to the user.
     * @enum
     */
    PROPS = {...PROPS};

    /**
     * List of available type for value binding
     * @enum
     */
    TYPES = {
        STRING: "str",
        INTEGER: "int",
        FLOAT: "float",
        BOOL: "bool",
    };

    constructor() {
        super(TAG, {
            props: {...PROPS_DEFAULTS}
        });

        let input = this.querySelector("input");
        if (!(input instanceof HTMLInputElement)) {
            throw new Error("WebUIBindInput: The child must be an <input> HTML element.");
        }

        // prevent "" from being parsed into NaN
        let init_type = this.getProp(PROPS.type);
        let init_type_numeric = (init_type === this.TYPES.INTEGER || init_type === this.TYPES.FLOAT); 
        if (this.getProp(PROPS.value) === "" && init_type_numeric) {
            this.setProp(PROPS.value, 0);
        }

        let update_prop = () => {
            if (this.getProp(PROPS.type) === this.TYPES.BOOL) {
                this._updateProp(input.checked);
            } else {
                this._updateProp(input.value);
            }
        };

        // value prop take precedence, so we override input.value first.
        // bind from prop to input
        // (the DOM must be ready to set it up, or it will fail to initialize correctly)
        this.autoSubscribeToProp(PROPS.value, (value) => {
            if (this.getProp(PROPS.type) === this.TYPES.BOOL) {
                input.checked = value;
            } else {
                input.value = value;
            }
        });

        this.onDOMReady(() => {
            // bind from input to prop
            input.addEventListener("input", update_prop);
        }, () => {
            input.removeEventListener("input", update_prop);
        });
    }

    /**
     * Updates the prop with the input value using the appropriate type
     * @param {String} value input raw value
     */
    _updateProp(value) {
        let v;
        let type = this.getProp(PROPS.type);
        if (type === this.TYPES.STRING || type === this.TYPES.BOOL) {
            v = value;
        } else if (type === this.TYPES.INTEGER) {
            v = parseInt(value);
            if (utils.equalsNaN(v)) {
                v = 0;
                utils.CustomLog(utils.LOG_T.WARN, "WebUIBindInput: tried to parse a NaN like value.");
            }
        } else if (type === this.TYPES.FLOAT) {
            v = parseFloat(value);
            if (utils.equalsNaN(v)) {
                v = 0;
                utils.CustomLog(utils.LOG_T.WARN, "WebUIBindInput: tried to parse a NaN like value.");
            }
        } else {
            throw new Error("_updateProp: unknown type for input value binding: " + type);
        }
        this.setProp(PROPS.value, v);
    }
}
await register(TAG, WebUIBindInput);