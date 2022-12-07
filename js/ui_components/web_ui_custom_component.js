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

import * as utils from "../utils/utils.js";

/**
 * Base class that simplifies creating custom web components.
 * Their information must be declared in `web_ui_custom_components.js`
 * in order for them to work!
 *
 * @export
 * @class webUICustomComponent
 * @extends {HTMLElement}
 * @mixes StateMachineMixin
 */
export class webUICustomComponent extends HTMLElement {
    /**
     * Initialize the component with a shadow root filled with
     * the template associated with the provided tag.
     * @param {string} tag tag used by the component in templates.
     * @param {{props: {}, states: {}, private_states: {}}} props_and_states
     * Base for the state machine.
     * 
     * Use props for properties accessible from HTML, states for complex properties
     * of the element, and private_state for any other use case reserved to the
     * object itself (to use the state machine mixin as is). Props should be modified
     * using `getProp(prop)` and `setProp(prop, value)`, while other values can
     * be accessed using `getState("namespace/${state}")` and
     * `setState("namespace/${state}", value)`. It is recommended to define
     * getters and setters for public states instead of letting the user use those
     * methods directly.
     * 
     * Don't hesitate to make use of `StateMachineMixin`'s `_registerValidator`
     * to put rules on allowed values and `subscribeToState` to perform reactive
     * changes based on props and states.
     * @memberof webUICustomComponent
     */
    constructor(tag, props_and_states = {}) {
        super();
        // test in static block for optimization
        utils.useMixin(webUICustomComponent, utils.StateMachineMixin);
        
        //load template
        if (templates[tag] === undefined) throw new Error("webUICustomComponent: unknown tag. Make sure it has been declared!");
        let template_content = templates[tag].content;
        this._shadow_root = this.attachShadow({mode: "open"});
        this._shadow_root.appendChild(template_content.cloneNode(true));

        //setup props and states
        this._props = props_and_states.props;
        this._setupStateMachineMixin(webUICustomComponent, props_and_states);

        //load existing values from attributes, and set not defined ones
        this._refreshProperties();
        this._refreshAttributes();
    }

    /**
     * HTMLElement function that fires when the element is added to the DOM
     */
    connectedCallback() {
        this._refreshAttributes();
    }

    /**
     * Outputs "data-prop-name" from "prop_name" to get the attribute
     * name from the property name.
     * @param {string} prop the property name
     * @returns the attribute string
     */
    attrFromProp(prop) {
        return `data-${prop.replaceAll("_","-")}`;
    }

    /**
     * Synchronize attributes and props
     * @private
     */
    _refreshAttributes() {
        for (let prop in this._props) {
            if (Object.hasOwnProperty.call(this._props, prop)) {
                this.setAttribute(this.attrFromProp(prop), this._props[prop]);
            }
        }
    }

    /**
     * Load values from HTML attributes into properties
     * to initialize existing values
     * @private
     */
    _refreshProperties() {
        for (let prop in this._props) {
            let value = this.getAttribute(this.attrFromProp(prop));
            
            if (!utils.IsUndefined(value)) {
                let intRegExp = /^[0-9]+/g;
                let floatRegExp = /^[0-9]+\.[0-9]+/g;                

                if (intRegExp.test(value)) {
                    this.setProp(prop, parseInt(value));
                } else if (floatRegExp.test(value)) {
                    this.setProp(prop, parseFloat(value));
                } else {
                    this.setProp(prop, value);
                }
            }
        }
    }

    /**
     * @param {String} prop The property to get the value of
     * @returns
     */
    getProp(prop) {
        return this.getState(`props/${prop}`);
    }

    /**
     * 
     * @param {String} prop The property to set the value of
     * @param {*} value 
     */
    setProp(prop, value) {
        let changed = this.setState(`props/${prop}`, value);
        if (changed) this.setAttribute(this.attrFromProp(prop), value);
    }

    /**
     * Listen to property changes, and get the value when it changes.
     * It fires once with the current value for initialization.
     * @param {String} prop The property to listen to
     * @param {function(any)} function_handler The function to call, with the value available as an argument
     */
    subscribeToProp(prop, function_handler) {
        this.subscribeToState(`props/${prop}`, function_handler);
        this.triggerEvent(`props/${prop}`, this.getProp(prop));
    }
}



/** @type {object} List of template DOM objects for each tag */
let templates = {};

/**
 * Register a component by defining it in customElements and caching its template.
 * The path is deudcted by looking at `./web_<tag_name_underscores>/web_<tag_name_underscores>.html`
 * relative to the `web_ui_custom_elements.js` module. Thus the tag and file and folder names should
 * be consistent!
 *
 * @export
 * @param {String} tag
 * @param {Function} class_ref
 * @param {String} path The path to the folder containing the component folder (root is `ui_components`).
 * 
 * ex: "foo/bar" leads to "ui_components/foo/bar/<tag>/<tag>.js".
 */
export async function register(tag, class_ref, path = "") {
    const tag_to_folder = "web_" + tag.replaceAll("-","_");
    // add trailing slash if missing
    let noSlash = /[^/]$/g;
    if (path !== "" && noSlash.test(path)) path = path + "/";

    const template_path = `./js/ui_components/${path}${tag_to_folder}/${tag_to_folder}.html`;
    const template = await getTemplate(template_path);
    templates[tag] = template;
    customElements.define(tag, class_ref);
    console.log("defined " + tag);
}

/**
 * Fetches the HTML file provided as a path and return the parsed
 * template element contained within it.
 *
 * @param {string} template_path
 * @return {HTMLTemplateElement} 
 */
async function getTemplate(template_path) {
    const dom_parser = new DOMParser();
    const file = await fetch(template_path);
    const text = await file.text();
    const html = dom_parser.parseFromString(text, "text/html");
    return html.querySelector("template");
}