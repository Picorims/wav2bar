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

const TAG = "ui-split-layout";
export default TAG;

/**
 * Note that horizontal direction hasn't been implemented right now.
 * Only the CSS has been paved in preparation of this change.
 */

await register(TAG, class extends webUICustomComponent {
    /**
     * List of attributes of the element
     * @enum
     */
    ATTR = {
        direction: "data-direction",
        size: "data-size",
        size_min: "data-size-min",
        size_max: "data-size-max"
    };

    /**
     * List of possible directions for the property `direction`
     * @enum
     */
    DIR = {
        vertical: "vertical"
    };

    constructor() {
        super(TAG);
        
        /**
         * TODO fix this because illegal to initialize attributes
         * - attribute object with name:value pairs in the base custom element
         * - on upgrade, assign values to the dom
         * - getters and setters
         * - middleware mechanism for getters and setters
         * - state machine
         * - update doc
         */
        this.direction = this.DIR.vertical;
        let separator = this._shadow_root.querySelector(".ui_split_layout_separator");

        //make separator functional
        separator.addEventListener("mousedown", () => {
            let moving = (e) => {
                let mouseX = e.clientX;
                let hostX = this.getBoundingClientRect().x;
                let size = mouseX - hostX;
                //keep the mouse centered on the separator while resizing
                this.size = size - (separator.clientWidth / 2);
            };
            document.addEventListener("mousemove", moving);

            document.addEventListener("mouseup", function killLoop() {
                this.removeEventListener("mousemove", moving);
                this.removeEventListener("mouseup", killLoop);
            });
        });

    }
    
    /**
     * Defines if the split direction is vertical or horizontal. 
     *
     * @param {"vertical"} direction
     * @returns {string}
     */
    set direction(direction) {
        if (direction === this.DIR.vertical) {
            this.setAttribute(this.ATTR.direction, direction);
        } else {
            throw new Error("ui-split-layout: only vertical direction is allowed.");
        }
    }
    get direction() {
        return this.getAttribute(this.ATTR.direction);
    }

    /**
     * Defines the size for the resizable element
     *
     * @param {number} size
     * @returns {number}
     */
    set size(size) {
        if (size < this.sizeMin) size = this.sizeMin;
        if (size > this.sizeMax) size = this.sizeMax;
        this._shadow_root.querySelector(".ui_split_layout_container_1").style.width = `${size}px`;

        this.setAttribute(this.ATTR.size, size);
    }
    get size() {
        return parseFloat(this.getAttribute(this.ATTR.size));
    }

    /**
     * Defines the minimum size allowed for the resizable element
     *
     * @param {number} size_min
     * @returns {number}
     */
    set sizeMin(size_min) {
        this.setAttribute(this.ATTR.size_min, size_min);
    }
    get sizeMin() {
        return parseFloat(this.getAttribute(this.ATTR.size_min));
    }

    /**
     * Defines the maxnimum size allowed for the resizable element
     *
     * @param {number} size_max
     * @returns {number}
     */
    set sizeMax(size_max) {
        this.setAttribute(this.ATTR.size_max, size_max);
    }
    get sizeMax() {
        return parseFloat(this.getAttribute(this.ATTR.size_max));
    }
});