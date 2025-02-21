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

import * as ui_components from "./ui_base_components.js";

/**
 * Frame that takes the entire screen and atach itself to the body, over everything else.
 *
 * @export
 * @class UILoadingFrame
 * @extends {ui_components.UIComponent}
 */
export class UILoadingFrame extends ui_components.UIComponent {
    /**
     * Creates an instance of UILoadingFrame.
     * @memberof UILoadingFrame
     */
    constructor() {
        super();
        this.DOM_container.classList.add("loading_frame");
        this._visible = false;
        this._TIMEOUT = 200;
        this.DOM_container;

        let loading_container = document.createElement("div");
        loading_container.classList.add("loading_frame_loading_container");
        this.DOM_container.appendChild(loading_container);
        
        let loading_item1 = document.createElement("div");
        loading_item1.classList.add("loading_frame_loading_item", "item1");
        loading_container.appendChild(loading_item1);
        
        let loading_item2 = document.createElement("div");
        loading_item2.classList.add("loading_frame_loading_item", "item2");
        loading_container.appendChild(loading_item2);
        
        let loading_item3 = document.createElement("div");
        loading_item3.classList.add("loading_frame_loading_item", "item3");
        loading_container.appendChild(loading_item3);
    }

    /**
     * Show the loading frame and append it to body.
     *
     * @memberof UILoadingFrame
     */
    show() {
        if (!this._visible) {
            document.body.appendChild(this._DOM_container);
            setTimeout(() => {
                this.DOM_container.classList.add("visible");
            }, 100);
            this._visible = true;    
        }
    }

    /**
     * Hide the loading frame and detach it from the body once
     * the timeout is ellapsed.
     *
     * @memberof UILoadingFrame
     */
    hide() {
        if (this._visible) {
            this.DOM_container.classList.remove("visible");
            setTimeout(() => {
                if (this.DOM_container.parentNode) {
                    this.DOM_container.parentNode.removeChild(this.DOM_container);
                }
            }, this._TIMEOUT);
            this._visible = false;
        }
    }
}