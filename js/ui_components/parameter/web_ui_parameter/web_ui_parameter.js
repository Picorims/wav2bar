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

import {webUICustomComponent, register} from "../../web_ui_custom_component.js";

const TAG = "ui-parameter";
// useful for intellisense and auto completion
const PROPS = {
    title: "title",
    help: "help"
};
// declared here to have both in sight at the same time
const PROPS_DEFAULTS = {
    title: "",
    help: ""
};

/**
 * Container designed for hosting parameters.
 * Provides a help node with a help bubble, as well
 * as an optional title.
 */
export class webUIParameter extends webUICustomComponent {
    /**
     * List of properties of the element, accessible to the user.
     * @enum
     */
    PROPS = {...PROPS};

    constructor() {
        super(TAG, {
            props: {...PROPS_DEFAULTS}
        });

        /** @type {import("../../web_ui_help_node/web_ui_help_node.js").webUIHelpNode} */
        this._help_node = this._shadow_root.querySelector("ui-help-node");
        this._title_elt = this._shadow_root.querySelector(".ui_parameter_title");
    
        this.onDOMReadyOnce(() => {
            this.subscribeToProp(PROPS.help, (content) => {
                this._help_node.setProp(this._help_node.PROPS.help, content);
            });
    
            this.subscribeToProp(PROPS.title, (title) => {
                this._title_elt.innerText = (title === "") ? "" : `${title}: `;
            });    
        });
    }
}

await register(TAG, webUIParameter, "parameter");