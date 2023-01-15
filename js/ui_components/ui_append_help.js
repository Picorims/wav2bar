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

/*globals imports*/

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
        };
    
        this._DOM_container.onpointerleave = function() {
            this.setAttribute("data-hover", "false");
            var msgs = document.getElementsByClassName("help_msg");
    
            for (var i=msgs.length-1; i>=0; i--) {
                msgs[i].remove();
            }
        };
    }
    get help_msg() {return this._help_string;}
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