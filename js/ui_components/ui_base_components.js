//MIT License - Copyright (c) 2020-2021 Picorims

import * as utils from "../utils/utils.js";

//base class for creating UI components. A base component is a div that can contain other stuff.
export class UIComponent {
    constructor() {
        this._DOM_container = document.createElement("div");
    }
    // Getters
    get DOM_container() {
        return this._DOM_container;
    }
}



//grid of buttons to interact with
export class UIButtonGrid extends UIComponent {
    constructor(rows, columns) {
        super();
        this._rows = rows;
        this._columns = columns;

        //Setup grid
        this._buttons = [];
        this._DOM_container.style.display = "grid";
        this._DOM_container.style.gridTemplateRows = `repeat(${this._rows}, 1fr)`; //1fr = proportionally
        this._DOM_container.style.gridTemplateColumns = `repeat(${this._columns}, 1fr)`; //1fr = proportionally

        for (let i = 0; i < this._rows; i++) {
            let row = [];
            //create the row
            for (let j = 0; j < this._columns; j++) {
                let button = document.createElement("button");
                this._DOM_container.appendChild(button);
                row.push(button);
            }
            //add the row to the list of rows
            this._buttons.push(row);
        }
    }
    get rows() {return this._rows;}
    get columns() {return this._columns;}
    getButton(row, column) {return this._buttons[row][column]}
}



//Number input with associated label
export class UINumberInput extends UIComponent {
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
    }

    get value() {return this._input.value}
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
}



//string input that supports regular expression checking.
export class UIStringInput extends UIComponent {
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
            this._label.style.marginRight = "10px";
        }

        this._input = document.createElement("input");
        this._DOM_container.appendChild(this._input);
        this._input.value = this._default_value;
        this._input.type = "text";
        this._input.style.width = (title === "")? "100%" : "45%";
        this._input.pattern = this._pattern;
    }

    get value() {return this._input.value}
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

    triggerOninput() {
        this._input.dispatchEvent(new Event('input', {
            bubbles: true,
            cancelable: true,
        }));
    }
}



//choice between a list of values
export class UIChoiceList extends UIComponent {
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
            this._label.style.marginRight = "10px";
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
        
        this._input.style.width = (title === "")? "100%" : "45%";
    }

    get value() {return this._input.value}
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



//checkbox
export class UICheckBox extends UIComponent {
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

    get checked() {return this._input.checked}
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