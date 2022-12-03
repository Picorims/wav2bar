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
const PROPS = {
    direction: "direction",
    size: "size",
    size_min: "size_min",
    size_max: "size_max"
};
const PROPS_DEFAULTS = {
    direction: "vertical",
    size: null,
    size_min: 0,
    size_max: 999999
};

export default TAG;

/**
 * Note that horizontal direction hasn't been implemented right now.
 * Only the CSS has been paved in preparation of this change.
 */

export class webUISplitLayout extends webUICustomComponent {
    /**
     * List of properties of the element
     * @enum
     */
    PROPS = {...PROPS};

    /**
     * List of possible directions for the property `direction`
     * @enum
     */
    DIR = {
        vertical: "vertical"
    };

    constructor() {
        super(TAG, {
            props: {...PROPS_DEFAULTS}
        });

        // direction
        this._registerValidator(
            `props/${PROPS.direction}`,
            (value) => (value === this.DIR.vertical),
            "ui-split-layout: only vertical direction is allowed."
        );

        // size
        let min = this.getProp(PROPS.size_min);
        let max = this.getProp(PROPS.size_max);
        if (this.getProp(PROPS.size) === null) {
            this.setProp(PROPS.size, (min + max) / 2);
        }
        this._registerValidator(
            `props/${PROPS.size}`,
            (value) => (value !== null
                && value >= this.getProp(PROPS.size_min)
                && value <= this.getProp(PROPS.size_max)
            ),
            `ui-split-layout: The size must be within
            size-min and size-max, and must not be null`
        );

        this.subscribeToState(`props/${PROPS.size}`, (size) => {
            this._setContainerSize(size);
        });
        this._setContainerSize(this.getProp(PROPS.size));
        
        /**
         * TODO fix this because illegal to initialize attributes
         * - OK attribute object with name:value pairs in the base custom element
         * - OK on upgrade, assign values to the dom
         * - OK getters and setters
         * - USE SUBSCRIBE AND VALIDATORS middleware mechanism for getters and setters
         * - OK state machine
         * - OK deep equals
         * - OK deep clone
         * - OK fix errors
         * - update doc (diagrams, dev guidelines)
         */

        /**
         * commit msg: enrich webUICustomComponent, doc and utils, fix errors in split layout and state machine
         */

        let separator = this._shadow_root.querySelector(".ui_split_layout_separator");

        //make separator functional
        separator.addEventListener("mousedown", () => {
            let moving = (e) => {
                let mouseX = e.clientX;
                let hostX = this.getBoundingClientRect().x;
                let size = mouseX - hostX;
                //keep the mouse centered on the separator while resizing
                let final_size = size - (separator.clientWidth / 2);

                let min = this.getProp(PROPS.size_min);
                let max = this.getProp(PROPS.size_max);
                if (final_size > max) final_size = max;
                if (final_size < min) final_size = min;

                this.setProp(PROPS.size, final_size);
            };
            document.addEventListener("mousemove", moving);

            document.addEventListener("mouseup", function killLoop() {
                this.removeEventListener("mousemove", moving);
                this.removeEventListener("mouseup", killLoop);
            });
        });

    }

    /**
     * Apply the given size to the first container (style.width)
     * @param {Number} size The size to apply
     */
    _setContainerSize(size) {
        this._shadow_root.querySelector(".ui_split_layout_container_1").style.width = `${size}px`;
    }
    
    /**
     * Defines if the split direction is vertical or horizontal. 
     *
     * @param {"vertical"} direction
     * @returns {string}
     */
    // set direction(direction) {
    //     if (direction === this.DIR.vertical) {
    //         this.setAttribute(this.PROPS.direction, direction);
    //     } else {
    //         throw new Error("ui-split-layout: only vertical direction is allowed.");
    //     }
    // }
    // get direction() {
    //     return this.getAttribute(this.PROPS.direction);
    // }

    /**
     * Defines the size for the resizable element
     *
     * @param {number} size
     * @returns {number}
     */
    // set size(size) {
    //     if (size < this.sizeMin) size = this.sizeMin;
    //     if (size > this.sizeMax) size = this.sizeMax;
    //     this._shadow_root.querySelector(".ui_split_layout_container_1").style.width = `${size}px`;

    //     this.setAttribute(this.PROPS.size, size);
    // }
    // get size() {
    //     return parseFloat(this.getAttribute(this.PROPS.size));
    // }

    /**
     * Defines the minimum size allowed for the resizable element
     *
     * @param {number} size_min
     * @returns {number}
     */
    // set sizeMin(size_min) {
    //     this.setAttribute(this.PROPS.size_min, size_min);
    // }
    // get sizeMin() {
    //     return parseFloat(this.getAttribute(this.PROPS.size_min));
    // }

    /**
     * Defines the maxnimum size allowed for the resizable element
     *
     * @param {number} size_max
     * @returns {number}
     */
    // set sizeMax(size_max) {
    //     this.setAttribute(this.PROPS.size_max, size_max);
    // }
    // get sizeMax() {
    //     return parseFloat(this.getAttribute(this.PROPS.size_max));
    // }
}

await register(TAG, webUISplitLayout);