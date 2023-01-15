import {WebUICustomComponent, register} from "../web_ui_custom_component.js";
import * as utils from "../../utils/utils.js";

const TAG = "ui-help-node";
// useful for intellisense and auto completion
const PROPS = {
    help: "help"
};
// declared here to have both in sight at the same time
const PROPS_DEFAULTS = {
    help: ""
};

/**
 * Hoverable node that displays text in a floating bubble,
 * designed to display help.
 */
export class WebUIHelpNode extends WebUICustomComponent {
    /**
     * List of properties of the element, accessible to the user.
     * @enum
     */
    PROPS = {...PROPS};

    constructor() {
        super(TAG, {
            props: {...PROPS_DEFAULTS}
        });

        /** @type {HTMLDivElement} */
        this._help_node = this._shadow_root.querySelector(".ui-help-node");
        /** @type {HTMLDivElement} */
        this._bubble = null;

        // interactivity
        let show_help = () => {
            let help = this.getProp(PROPS.help);
            if (help !== "") {
                this._bubble = DisplayHelpMsg(this, help);
            }
        };

        let hide_help = () => {
            if (this.getProp(PROPS.help) !== "") {
                this._bubble.remove();
            }
        };

        this.onDOMReady(() => {
            this._help_node.addEventListener("pointerenter", show_help);
            this._help_node.addEventListener("pointerleave", hide_help);
        }, () => {
            this._help_node.removeEventListener("pointerenter", show_help);
            this._help_node.removeEventListener("pointerleave", hide_help);
        });

        
    }
}
await register(TAG, WebUIHelpNode, "");

/**
 * Displays the help message linked to a question mark element of a parameter.
 *
 * @param {HTMLElement} question_mark
 * @param {String} content
 * @returns the DOM container
 */
function DisplayHelpMsg(question_mark, content) {//display a help message at the given coordinates
    if( !utils.IsAnElement(question_mark) ) throw new Error(`DisplayHelpMsg: ${question_mark} is not a DOM element.`);
        
    //msg container
    var msg = document.createElement("div");
    document.body.appendChild(msg);
    msg.classList.add("help_msg", "dialog_box", "fadein_dialog");
    msg.innerHTML = content;

    //positioning
    var pos = question_mark.getBoundingClientRect();
    msg.style.top = `${pos.top + 30}px`;
    msg.style.left = `${pos.left + 30}px`;

    return msg;
}