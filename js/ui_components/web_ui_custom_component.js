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

/**
 * Base class that simplifies creating custom web components.
 * Their information must be declared in `web_ui_custom_components.js`
 * in order for them to work!
 *
 * @export
 * @class webUICustomComponent
 * @extends {HTMLElement}
 */
export class webUICustomComponent extends HTMLElement {
    /**
     * Initialize the component with a shadow root filled with
     * the template associated with the provided tag.
     * @param {string} tag tag used by the component in templates.
     * @memberof webUICustomComponent
     */
    constructor(tag) {
        if (templates[tag] === undefined) throw new Error("webUICustomComponent: unknown tag. Make sure it has been declared!");
        super();
        let template_content = templates[tag].content;
        this._shadow_root = this.attachShadow({mode: "open"});
        this._shadow_root.appendChild(template_content.cloneNode(true));
    
        //support "hidden" prop
        let style = document.createElement("style");
        style.textContent = `
        :host[hidden] {
            display: none;
        }
        `;
        this._shadow_root.appendChild(style);
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
 * @param {string} tag
 * @param {Function} class_ref
 */
export async function register(tag, class_ref) {
    const tag_to_folder = "web_" + tag.replaceAll("-","_");
    const template_path = `./js/ui_components/${tag_to_folder}/${tag_to_folder}.html`;
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