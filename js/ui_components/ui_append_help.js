//MIT License - Copyright (c) 2020-2021 Picorims

import * as ui from "./ui_base_components.js";
import * as utils from "../utils/utils.js";

/*
##################
HELP HOVER BUTTONS
##################
*/

/**
 * question mark you can hover to display a help message
 *
 * @export
 * @class UIHelp
 * @extends {ui.UIComponent}
 */
export class UIHelp extends ui.UIComponent {
    /**
     * Creates an instance of UIHelp.
     * @param {HTMLDivElement} parent
     * @param {String} help_string String to display to the user.
     * @memberof UIHelp
     */
    constructor(parent, help_string) {
        super();
        if( !utils.IsAnElement(parent) ) throw new Error(`AppendHelp: ${parent} is not a DOM element.`);
        if (!utils.IsAString(help_string) ) throw new Error(`AppendHelp: ${help_string} is not a string.`);

        this.DOM_parent = parent;
        this._help_string = help_string;

        //setup element
        this._DOM_container.className = "question_mark";
        this._DOM_container.innerHTML = "<i class='ri-question-line'></i>";

        //help display
        this._DOM_container.setAttribute("data-content", this._help_string);
    
        this._DOM_container.onpointerenter = function() {
            this.setAttribute("data-hover", "true");
    
            //display delay
            setTimeout(DisplayHelpMsg(this), 1000);
        }
    
        this._DOM_container.onpointerleave = function() {
            this.setAttribute("data-hover", "false");
            var msgs = document.getElementsByClassName("help_msg");
    
            for (var i=msgs.length-1; i>=0; i--) {
                msgs[i].remove();
            }
        }
    }
    get help_msg() {return this._help_string}
    set help_msg(string) {
        this._help_string = string;
        this._DOM_container.setAttribute("data-content", this._help_string);
    }
}



/**
 * Displays the help message linked to a question mark element of a parameter.
 *
 * @param {HTMLElement} question_mark
 */
function DisplayHelpMsg(question_mark) {//display a help message at the given coordinates

    if( !imports.utils.IsAnElement(question_mark) ) throw new Error(`DisplayHelpMsg: ${question_mark} is not a DOM element.`);

    //only display if the pointer is on the question_mark
    if (question_mark.getAttribute("data-hover") === "true") {
        //msg container
        var msg = document.createElement("div");
        document.body.appendChild(msg);
        msg.classList.add("help_msg","dialog_box","fadein_dialog");
        msg.innerHTML = question_mark.getAttribute("data-content");

        //positioning
        var pos = question_mark.getBoundingClientRect();
        msg.style.top = `${pos.top + 30}px`;
        msg.style.left = `${pos.left + 30}px`;
    }

}