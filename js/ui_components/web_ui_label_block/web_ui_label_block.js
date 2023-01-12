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

const TAG = "ui-label-block";
// useful for intellisense and auto completion
const PROPS = {
    name: "name"
};
// declared here to have both in sight at the same time
const PROPS_DEFAULTS = {
    name: "label"
};

/**
 * Container that adds a configurable label to the left.
 */
export class WebUILabelBlock extends WebUICustomComponent {
    /**
     * List of properties of the element, accessible to the user.
     * @enum
     */
    PROPS = {...PROPS};

    constructor() {
        super(TAG, {
            props: {...PROPS_DEFAULTS}
        });

        let label = this._shadow_root.querySelector(".ui_label_block_name");
        this.onDOMReadyOnce(() => {
            this.subscribeToProp(PROPS.name, (value) => {
                label.textContent = `${value}: `;
            });    
        });
    }
}

await register(TAG, WebUILabelBlock);
