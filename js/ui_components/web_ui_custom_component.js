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
 * @type {Array<{this: Object, fn: Function}>}
 */
let pending_DOM_callbacks = [];
let custom_components_loaded = false;

/**
 * Call callbacks from DOMReady() that fired too early from connectedCallback(),
 * after all custom components were loaded.
 */
export function callPendingDOMCallbacks() {
    for (const entry of pending_DOM_callbacks) {
        entry.fn.call(entry.this);
    }
    custom_components_loaded = true;
    console.log(pending_DOM_callbacks);
    pending_DOM_callbacks = [];
}

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

        /**
         * @type {Array<{fn: Function, once: Boolean}>}
         */
        this._DOM_ready_callbacks = [];
        
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
        // attribute refreshing is performed by the DOM ready listener in the constructor
        // this._refreshAttributes();

        // bind attributes to props (from prop to attr only)
        let bind_props_and_attrs_handlers = {};
        for (let prop in this._props) {
            if (utils.objHasOwnProp(this._props, prop)) {
                bind_props_and_attrs_handlers[prop] = () => {
                    this.setAttribute(this.attrFromProp(prop), this.getProp(prop));
                };
            }
        }
        this.onDOMReady(() => {
            for (let prop in this._props) {
                if (utils.objHasOwnProp(this._props, prop)) {
                    this.subscribeToProp(prop, bind_props_and_attrs_handlers[prop]);
                }
            }
        }, () => {
            for (let prop in this._props) {
                if (utils.objHasOwnProp(this._props, prop)) {
                    this.unsubscribeToProp(prop, bind_props_and_attrs_handlers[prop]);
                }
            }
        });
    }

    /**
     * HTMLElement function that fires when the element is added to the DOM
     */
    connectedCallback() {
        // attribute refreshing is performed by the DOM ready listener in the constructor
        // this._refreshAttributes();

        // DOM handlers
        for (let i = this._DOM_ready_callbacks.length -1; i >= 0; i--) {
            let entry = this._DOM_ready_callbacks[i];
            if (entry.enabled) {
                if (custom_components_loaded) {
                
                    entry.fn();
                    // some callbacks only fire once
                    if (entry.once) {
                        if (entry.destroyer === null) this._DOM_ready_callbacks.splice(i, 1);
                        else entry.enabled = false;
                    }    
                } else pending_DOM_callbacks.push({this: this, fn: entry.fn});
            }
            
        }        
    }

    /**
     * HTMLElement function that fires when the element is removed from the DOM
     */
    disconnectedCallback() {
        // DOM handlers
        for (let i = this._DOM_ready_callbacks.length -1; i >= 0; i--) {
            let entry = this._DOM_ready_callbacks[i];
            if (entry.destroyer !== null) {
                if (custom_components_loaded) {
                    
                    entry.destroyer();
                    // some callbacks only fire once
                    if (entry.once) this._DOM_ready_callbacks.splice(i, 1);
                }
                else pending_DOM_callbacks.push({this: this, fn: entry.destroyer});
            }
        }
    }

    /**
     * Function fired when the connectedCallback() function is fired (component)
     * on DOM, and after all custom components loaded.
     * @param {Function} callback 
     * @param {Function} destroyer The function to call when the component gets off the DOM
     * (to remove an event listener for example)
     */
    onDOMReady(callback, destroyer = null) {
        this._DOM_ready_callbacks.push({fn: callback, once: false, destroyer: destroyer, enabled: true});
    }

    /**
     * Function fired ***once*** when the connectedCallback() function is fired (component)
     * on DOM, and after all custom components loaded.
     * @param {Function} callback 
     * @param {Function} destroyer The function to call when the component gets off the DOM
     */
    onDOMReadyOnce(callback, destroyer = null) {
        this._DOM_ready_callbacks.push({fn: callback, once: true, destroyer: destroyer, enabled: true});
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
                this.setAttribute(this.attrFromProp(prop), this.getProp(prop));
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
        this.setState(`props/${prop}`, value);
        // attribute refreshing is performed by the DOM ready listener in the constructor
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

    /**
     * Stop listening to property changes
     * @param {String} prop The property to not listen to
     * @param {function(any)} function_handler The function that was called
     */
    unsubscribeToProp(prop, function_handler) {
        this.unsubscribeToState(`props/${prop}`, function_handler);
    }
}



/** @type {object} List of template DOM objects for each tag */
let templates = {};

let global_stylesheets = [
    "style.css"
];

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
    bindGlobalStyles(template);
    templates[tag] = template;
    console.log(template);
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

/**
 * Appends all global stylesheets to the template by adding link elements to it.
 * @param {HTMLTemplateElement} template The template to append style to
 */
function bindGlobalStyles(template) {
    for (const path of global_stylesheets) {
        const link_element = document.createElement("link");
        link_element.setAttribute("rel", "stylesheet");
        link_element.setAttribute("href", path);
        template.content.appendChild(link_element);
    }
}