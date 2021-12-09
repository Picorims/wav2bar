//MIT License - Copyright (c) 2020-2021 Picorims

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
                this.DOM_container.parentNode.removeChild(this.DOM_container);
            }, this._TIMEOUT);
            this._visible = false;
        }
    }
}