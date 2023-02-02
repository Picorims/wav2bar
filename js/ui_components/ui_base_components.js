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

import * as utils from "../utils/utils.js";

/**
 * base class for creating UI components.
 * A base component is a div that can contain other stuff.
 *
 * @export
 * @class UIComponent
 * @deprecated
 */
export class UIComponent {
    /**
     * Creates an instance of UIComponent.
     * @memberof UIComponent
     */
    constructor() {
        this._DOM_container = document.createElement("div");
        this._DOM_parent = null;
        this._UI_parent = null;
        this._display = null;
    }
    // Getters
    get DOM_container() {
        return this._DOM_container;
    }

    //getters and setters for parent container
    get DOM_parent() {return this._DOM_parent;}
    set DOM_parent(parent) {
        if (this._DOM_parent !== null) this._DOM_parent.removeChild(this._DOM_container);
        this._DOM_parent = parent;
        parent.appendChild(this._DOM_container);
    }

    //getters and setters for parent container that is a UIComponent
    get UI_parent() {return this._UI_parent;}
    set UI_parent(parent) {
        this.DOM_parent = parent.DOM_container; //using the setter!
        this._UI_parent = parent;
    }

    //getters and setters for changing display
    get display() {return this._display;}
    set display(display) {
        this._display = display;
        this._DOM_container.style.display = display;
    }
}



/**
 * grid of buttons to interact with
 *
 * @export
 * @class UIButtonGrid
 * @extends {UIComponent}
 */
export class UIButtonGrid extends UIComponent {
    /**
     * Creates an instance of UIButtonGrid.
     * @param {Number} rows The number of rows.
     * @param {Number} columns The number of columns.
     * @param {Array} button_definitions The config for all the buttons.
     * @param {Boolean} togglable If togglable mode is used (classic buttons otherwise).
     * @memberof UIButtonGrid
     */
    constructor(rows, columns, button_definitions, togglable) {
        super();

        //error checking
        if (!utils.IsAnInt(rows)) throw new SyntaxError("rows count must be an integer.");
        if (!utils.IsAnInt(columns)) throw new SyntaxError("columns count must be an integer.");
        if (!utils.IsAnArray(button_definitions)) throw new SyntaxError("button_definitions must be an array");
        else {
            for (let i=0; i<button_definitions.length; i++) {
                if (!utils.IsAnArray(button_definitions[i])) throw new SyntaxError("button_definitions must be a list of arrays");
                else {
                    for (let j=0; j<button_definitions[i].length; j++) {
                        if (!utils.IsAnObject(button_definitions[i][j])) throw new SyntaxError(`button definition ${i}, ${j} is not an object.`);
                    }
                }
            }
        }
        if (!utils.IsABoolean(togglable)) throw new SyntaxError("togglable must be a boolean");
        
        //attributes
        this._rows = rows;
        this._columns = columns;
        this._button_definitions = button_definitions;
        this._togglable = togglable;
        if (togglable) {
            this._toggles = [];
            for (let i = 0; i < this._rows; i++) {
                this._toggles[i] = [];
                for (let j = 0; j < this._columns; j++) {
                    this._toggles[i][j] = false;
                }
            }
        }

        //Setup grid
        this._buttons = [];
        this._DOM_container.classList.add("button_grid");
        this._DOM_container.style.display = "grid";
        this._DOM_container.style.gridTemplateRows = `repeat(${this._rows}, 1fr)`; //1fr = proportionally
        this._DOM_container.style.gridTemplateColumns = `repeat(${this._columns}, 1fr)`; //1fr = proportionally

        //create buttons
        for (let i = 0; i < this._rows; i++) {
            let row = [];
            //create the row
            for (let j = 0; j < this._columns; j++) {
                //setup button
                let button = document.createElement("button");
                this._DOM_container.appendChild(button);
                button.classList.add("button_grid_button", "panel_button");
                button.innerHTML = this._button_definitions[i][j].innerHTML;

                //callback
                button.onclick = () => {
                    if (this._togglable) {
                        //toggle the boolean and return the new value.
                        this._toggles[i][j] = !this._toggles[i][j];
                        button.classList.toggle("toggled");
                        this._button_definitions[i][j].callback(this._toggles[i][j]);
                    } else {
                        //no toggle mode, only callback
                        this._button_definitions[i][j].callback();
                    }
                };
                row.push(button);
            }
            //add the row to the list of rows
            this._buttons.push(row);
        }
    }
    get rows() {return this._rows;}
    get columns() {return this._columns;}
    
    /**
     * Get the HTML DOM element corresponding to the button at the given position,
     * starting from 0.
     *
     * @param {Number} row Row position
     * @param {Number} column Column position
     * @return {HTMLElement} The corresponding button.
     * @memberof UIButtonGrid
     */
    getButton(row, column) {return this._buttons[row][column];}
    
    /**
     * Enable or disable a given button. Only works in togglable mode.
     *
     * @param {Number} i Row position
     * @param {Number} j Column position
     * @memberof UIButtonGrid
     */
    toggle(i, j) {//row, column
        if (!this._togglable) throw new Error("toggle() only works in togglable mode!");
        this._toggles[i][j] = !this._toggles[i][j];
        this._buttons[i][j].classList.toggle("toggled");
    }
}



/**
 * Number input with associated label
 *
 * @export
 * @class UINumberInput
 * @extends {UIComponent}
 */
export class UINumberInput extends UIComponent {
    /**
     * Creates an instance of UINumberInput.
     * @param {String} title Displayed title
     * @param {String} unit Displayed unit
     * @param {Number} default_value Default value in the input.
     * @memberof UINumberInput
     */
    constructor(title, unit, default_value) {
        super();
        this._title = title;
        this._unit = unit;
        this._default_value = default_value;
        this._min = null;
        this._max = null;
        this._step = null;

        //create elements
        this._DOM_container.style.display = "flex";
        this._DOM_container.style.alignItems = "center";
        this._DOM_container.style.justifyContent = "space-between";
        
        if (title !== "") {
            this._label = document.createElement("span");
            this._DOM_container.appendChild(this._label);
            this._label.innerHTML = this._title;
            this._label.style.width = "50%";
            this._label.style.textAlign = "left";
            this._label.style.paddingRight = "5px";
            this._label.style.boxSizing = "border-box";
        }

        this._input = document.createElement("input");
        this._DOM_container.appendChild(this._input);
        this._input.value = this._default_value;
        this._input.type = "number";
        this._input.style.width = (title === "")? "85%" : "35%";

        this._label_unit = document.createElement("span");
        this._DOM_container.appendChild(this._label_unit);
        this._label_unit.innerHTML = this._unit;
        this._label_unit.style.width = "15%";
        this._label_unit.style.textAlign = "left";
        this._label_unit.style.marginLeft = "2px";

        //event trigger
        this._input_event = new Event("input", {
            bubbles: true,
            cancelable: true,
        });
    }

    get value() {return this._input.value;}
    set value(value) {this._input.value = value;}

    set min(min) {
        this._min = min;
        this._input.min = min;
    }
    set max(max) {
        this._max = max;
        this._input.max = max;
    }
    set step(step) {
        this._step = step;
        this._input.step = step;
    }
    set input_class_list(class_list) {
        if (!utils.IsAnArray(class_list)) throw new Error("UINumberInput: array required.");
        this._input.className = "";
        this._input.classList.add(...class_list);
    }

    set oninput(function_callback) {
        this._input.oninput = function() {
            let no_value = utils.IsUndefined(this.value) || this.value === "";
            let valid = false;
            if (!no_value) {
                let value = parseFloat(this.value);
                let min = parseFloat(this.min);
                let max = parseFloat(this.max);
                valid = (isNaN(min) || value >= min) && (isNaN(max) || value <= max);
            }

            //the callback is only called if the value is defined and valid.
            if (!no_value && valid) {
                this.classList.remove("input_invalid");
                function_callback();
            } else {
                this.classList.add("input_invalid");
            }
        };
    }

    /**
     * Send an 'input' event to the DOM input.
     *
     * @memberof UINumberInput
     */
    trigger() {this._input.dispatchEvent(this._input_event);}
}



/**
 * String input that supports regular expression checking.
 *
 * @export
 * @class UIStringInput
 * @extends {UIComponent}
 */
export class UIStringInput extends UIComponent {
    /**
     * Creates an instance of UIStringInput.
     * @param {String} title Displayed title
     * @param {String} default_value Default value in the input.
     * @memberof UIStringInput
     */
    constructor(title, default_value) {
        super();
        this._title = title;
        this._default_value = default_value;
        this._pattern = "^.*$"; //everything

        //create elements
        this._DOM_container.style.display = "flex";
        this._DOM_container.style.alignItems = "center";
        this._DOM_container.style.justifyContent = "space-between";

        if (title !== "") {
            this._label = document.createElement("span");
            this._DOM_container.appendChild(this._label);
            this._label.innerHTML = this._title;
            this._label.style.textAlign = "left";
            this._label.style.width = "50%";
            this._label.style.paddingRight = "5px";
            this._label.style.boxSizing = "border-box";
        }

        this._input = document.createElement("input");
        this._DOM_container.appendChild(this._input);
        this._input.value = this._default_value;
        this._input.type = "text";
        this._input.style.width = (title === "")? "100%" : "50%";
        this._input.pattern = this._pattern;
    }

    get input() {return this._input;}

    get value() {return this._input.value;}
    set value(value) {this._input.value = value;}

    set pattern(pattern) {
        if (typeof pattern === "object") pattern = pattern.toString();
        this._pattern = pattern;
        this._input.pattern = pattern.replace(/^\//,"").replace(/\/$/,""); //remove the // around the regexp.
    }
    set input_class_list(class_list) {
        if (!utils.IsAnArray(class_list)) throw new Error("UINumberInput: array required.");
        this._input.className = "";
        this._input.classList.add(...class_list);
    }

    set oninput(function_callback) {
        this._input.oninput = function() {
            let regexp = new RegExp(this.pattern);
            let valid = regexp.test(this.value);

            //valid if the regular expression matches
            if (valid) {
                this.classList.remove("input_invalid");
                function_callback();
            } else {
                this.classList.add("input_invalid");
            }
        };
    }

    /**
     * Triggers an 'input' event on the DOM input element.
     *
     * @memberof UIStringInput
     */
    triggerOninput() {
        this._input.dispatchEvent(new Event("input", {
            bubbles: true,
            cancelable: true,
        }));
    }
}


/**
 * Color picker component to choose a color in the hex format.
 * It uses the browser HTML color picker.
 *
 * @export
 * @class UIColorPicker
 * @extends {UIComponent}
 */
export class UIColorPicker extends UIComponent {
    /**
     * Creates an instance of UIColorPicker.
     * @param {UIStringInput} string_input The attached string input to write the result to.
     * @memberof UIColorPicker
     */
    constructor(string_input) {
        super();
        if (!(string_input instanceof UIStringInput)) throw new SyntaxError("string_input must be a UIStringInput");
        this._string_input = string_input;

        //HTML color picker
        this._color_picker = document.createElement("input");
        this._color_picker.type = "color";
        this._DOM_container.appendChild(this._color_picker);
        this._color_picker.classList.add("panel_input","panel_input_color");
        
        //data-binding
        this._color_picker.oninput = () => {
            this._string_input.value = this._color_picker.value;
            this._string_input.triggerOninput();
        };
        this._string_input.input.addEventListener("input", () => {
            this._color_picker.value = this._string_input.value;
        });
        this._color_picker.value = this._string_input.value;
    }
    set value(value) {this._color_picker.value = value;}
}



/**
 * Component to make a choice between a list of values
 *
 * @export
 * @class UIChoiceList
 * @extends {UIComponent}
 */
export class UIChoiceList extends UIComponent {
    /**
     * Creates an instance of UIChoiceList.
     * @param {String} title Displayed title
     * @param {Array} options_list Array of strings, corresponding to the possible choices.
     * @param {String} default_value Default selected value.
     * @memberof UIChoiceList
     */
    constructor(title, options_list, default_value) {
        super();
        this._title = title;
        this._options_list = options_list;
        this._default_value = default_value;

        //create elements
        this._DOM_container.style.display = "flex";
        this._DOM_container.style.alignItems = "center";
        this._DOM_container.style.justifyContent = "space-between";

        if (title !== "") {
            this._label = document.createElement("span");
            this._DOM_container.appendChild(this._label);
            this._label.innerHTML = this._title;
            this._label.style.textAlign = "left";
            this._label.style.width = "50%";
            this._label.style.paddingRight = "5px";
            this._label.style.boxSizing = "border-box";
        }

        this._input = document.createElement("select");
        this._DOM_container.appendChild(this._input);

        //options
        for (let i = 0; i < this._options_list.length; i++) {
            let option = document.createElement("option");
            this._input.appendChild(option);
            option.innerHTML = this._options_list[i];
            option.value = this._options_list[i];
        }
        this._input.value = this._default_value;
        
        this._input.style.width = (title === "")? "100%" : "50%";
    }

    get value() {return this._input.value;}
    set value(value) {this._input.value = value;}

    set input_class_list(class_list) {
        if (!utils.IsAnArray(class_list)) throw new Error("UINumberInput: array required.");
        this._input.className = "";
        this._input.classList.add(...class_list);
    }

    set oninput(function_callback) {
        this._input.oninput = function_callback;
    }
}



/**
 * Checkbox component.
 *
 * @export
 * @class UICheckBox
 * @extends {UIComponent}
 */
export class UICheckBox extends UIComponent {
    /**
     * Creates an instance of UICheckBox.
     * @param {String} title The displayed title
     * @param {Boolean} default_value The default value assigned to the checkbox element.
     * @memberof UICheckBox
     */
    constructor(title, default_value) {
        super();
        this._title = title;
        this._default_value = default_value;

        //create elements
        this._DOM_container.style.display = "flex";
        this._DOM_container.style.alignItems = "center";
        this._DOM_container.style.justifyContent = "space-between";

        if (title !== "") {
            this._label = document.createElement("span");
            this._DOM_container.appendChild(this._label);
            this._label.innerHTML = this._title;
            this._label.style.textAlign = "left";
            this._label.style.marginRight = "10px";
        }

        this._input = document.createElement("input");
        this._DOM_container.appendChild(this._input);
        this._input.type = "checkbox";
        this._input.checked = this._default_value;        
    }

    get checked() {return this._input.checked;}
    set checked(checked) {this._input.checked = checked;}

    set input_class_list(class_list) {
        if (!utils.IsAnArray(class_list)) throw new Error("UINumberInput: array required.");
        this._input.className = "";
        this._input.classList.add(...class_list);
    }

    set oninput(function_callback) {
        this._input.oninput = function_callback;
    }

}