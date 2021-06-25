//MIT License - Copyright (c) 2020-2021 Picorims

/*
##################
HELP HOVER BUTTONS
##################
*/

//Append to a DOM element with the class ".panel_param_container" a question mark displaying the help.
//The path is indicated by the data-help attribute.
export function AppendHelp(DOM_elt, help_string) {

    if( !imports.utils.IsAnElement(DOM_elt) ) throw `AppendHelp: ${DOM_elt} is not a DOM element.`;
    if (!imports.utils.IsAString(help_string) ) throw `AppendHelp: ${help_string} is not a string.`;

    //create help hover button
    var question_mark = document.createElement("div");
    DOM_elt.appendChild(question_mark);
    question_mark.className = "question_mark";
    question_mark.innerHTML = "<i class='ri-question-line'></i>";

    //help display
    question_mark.setAttribute("data-content", help_string);

    question_mark.onpointerenter = function() {
        this.setAttribute("data-hover", "true");

        //display delay
        setTimeout(DisplayHelpMsg(this), 1000);
    }

    question_mark.onpointerleave = function() {
        this.setAttribute("data-hover", "false");
        var msgs = document.getElementsByClassName("help_msg");

        for (var i=msgs.length-1; i>=0; i--) {
            msgs[i].remove();
        }
    }
}



//Display the help message linked to a question mark element of a parameter.
function DisplayHelpMsg(question_mark) {//display a help message at the given coordinates

    if( !imports.utils.IsAnElement(question_mark) ) throw `DisplayHelpMsg: ${question_mark} is not a DOM element.`;

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