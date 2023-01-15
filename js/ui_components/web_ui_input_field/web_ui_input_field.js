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

const TAG = "ui-input-field";
// useful for intellisense and auto completion
const PROPS = {
    value: "value",
    type: "type",
    name: "name",
    min: "min",
    max: "max",
    step: "step"
};
// declared here to have both in sight at the same time
const PROPS_DEFAULTS = {
    value: "",
    type: "str",
    name: "label",
    min: 0,
    max: 100,
    step: 1
};


export class WebUIInputField extends WebUICustomComponent {
    /**
     * List of properties of the element, accessible to the user.
     * @enum
     */
    PROPS = {...PROPS};

    constructor() {
        super(TAG, {
            props: {...PROPS_DEFAULTS},
        });

        /** @type {uiComponents.WebUIBindInput} */
        let bind_input = this._shadow_root.querySelector(".ui-input-field-bind");
        this.bindProps(PROPS.value, bind_input, bind_input.PROPS.value);
        this.bindProps(PROPS.type, bind_input, bind_input.PROPS.type);
        
        /** @type {uiComponents.WebUILabelBlock} */
        let label_block = this._shadow_root.querySelector(".ui-input-field-label");
        this.bindProps(PROPS.name, label_block, label_block.PROPS.name);

        // /** @type {HTMLInputElement} */
        let input = this._shadow_root.querySelector(".ui-input-field-input");

        this.autoSubscribeToProp(PROPS.type, (type) => {
            input.classList.remove("panel_input_checkbox");
            switch (type) {
                case bind_input.TYPES.INTEGER:
                case bind_input.TYPES.FLOAT:
                    input.type = "number"; break;
                case bind_input.TYPES.STRING:
                    input.type = "text"; break;
                case bind_input.TYPES.BOOL:
                    input.type = "checkbox";
                    input.classList.add("panel_input_checkbox");
                    break;
                default:
                    throw new Error("WebUIInputField: invalid input type: " + type);
            }
        });
        this.autoSubscribeToProp(PROPS.min, (min) => {input.min = min;});
        this.autoSubscribeToProp(PROPS.max, (max) => {input.max = max;});
        this.autoSubscribeToProp(PROPS.step, (step) => {input.step = step;});
    }
}
await register(TAG, WebUIInputField);
