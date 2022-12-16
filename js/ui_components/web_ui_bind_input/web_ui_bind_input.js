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

import {webUICustomComponent, register} from "../web_ui_custom_component.js";

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
 */
export class webUIBindInput extends webUICustomComponent {
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
    };

    constructor() {
        super(TAG, {
            props: {...PROPS_DEFAULTS}
        });

        let input = this.querySelector("input");
        if (!(input instanceof HTMLInputElement)) {
            throw new Error("webUIBindInput: The child must be an <input> HTML element.");
        }
        this.onDOMReadyOnce(() => {
            this._updateProp(input.value);

            // bind from prop to input
            this.subscribeToProp(PROPS.value, (value) => {
                input.value = value;
            });

            // bind from input to prop
            input.addEventListener("input", () => {
                this._updateProp(input.value);
            });
        });
    }

    /**
     * Updates the prop with the input value using the appropriate type
     * @param {String} value input raw value
     */
    _updateProp(value) {
        let v;
        let type = this.getProp(PROPS.type);
        if (type === this.TYPES.STRING) {
            v = value;
        } else if (type === this.TYPES.INTEGER) {
            v = parseInt(value);
        } else if (type === this.TYPES.FLOAT) {
            v = parseFloat(value);
        } else {
            throw new Error("_updateProp: unknown type for input value binding: " + type);
        }
        this.setProp(PROPS.value, v);
    }
}
await register(TAG, webUIBindInput);