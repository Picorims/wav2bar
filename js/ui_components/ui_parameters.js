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
import * as ui from "./ui_base_components.js";
import * as help from "./ui_append_help.js";

//parameters UI used in the control panel. Each class is a template.

/**
 * base parameter for building all specific parameters in the control panel.
 *
 * @export
 * @class UIParameter
 * @extends {ui.UIComponent}
 */
export class UIParameter extends ui.UIComponent {
    /**
     * Creates an instance of UIParameter.
     * @param {ui.UIComponent|HTMLElement} parent Container of the component.
     * @param {String} title The displayed title
     * @param {Boolean} parent_title_visible If a title element should be displayed.
     * @memberof UIParameter
     */
    constructor(parent, title, parent_title_visible) {
        super();
        this._parent = parent;
        this._title = title;
        this._parent_title_visible = parent_title_visible;
        this._help_string = "";

        //setup element
        if (parent instanceof ui.UIComponent) this.UI_parent = this._parent;
        else this.DOM_parent = this._parent;
        this._DOM_container.classList.add("panel_param_container");

        //container for everything
        this._container = document.createElement("div");
        this._DOM_container.appendChild(this._container);
        this._container.classList.add("panel_param_subcontainer");

        //name
        if (parent_title_visible) {
            this._label = document.createElement("span");
            this._container.appendChild(this._label);
            this._label.innerHTML = `${title}: `;    
        }

        //help on the side of the UI.
        this._help = new help.UIHelp(this._DOM_container, this._help_string);
    }

    set class_list(class_list) {
        if (!utils.IsAnArray(class_list)) throw new Error("UINumberInput: array required.");
        this._input.className = class_list.join(" ");
    }

    set help_string(string) {
        this._help_string = string;
        this._help.help_msg = string;
    }
}



/**
 * string parameter
 *
 * @export
 * @class UIParameterString
 * @extends {UIParameter}
 */
export class UIParameterString extends UIParameter {
    /**
     * Creates an instance of UIParameterString.
     * @param {ui.UIComponent|HTMLElement} parent Container of the component.
     * @param {String} title Displayed title.
     * @param {String} default_value Default value for the input.
     * @param {Function} callback Function to call when user inputs data.
     * @memberof UIParameterString
     */
    constructor(parent, title, default_value, callback) {
        super(parent, title, false);
        this._default_value = default_value;

        //element
        this._string_input = new ui.UIStringInput(this._title + ": ", this._default_value);
        this._string_input.DOM_container.style.width = "100%";
        this._string_input.DOM_parent = this._container;
        this._string_input.input_class_list = ["panel_input", "panel_input_string"];

        //function
        this._string_input.oninput = callback;
    }

    get value() {return this._string_input.value;}
}


/**
 * Color picker parameter with an associated string input.
 *
 * @export
 * @class UIParameterColor
 * @extends {UIParameterString}
 */
export class UIParameterColor extends UIParameterString {
    /**
     * Creates an instance of UIParameterColor.
     * @param {ui.UIComponent|HTMLElement} parent Container of the component.
     * @param {String} title Displayed title.
     * @param {String} default_value Default value for the input.
     * @param {Function} callback Function to call when user inputs data.
     * @memberof UIParameterColor
     */
    constructor(parent, title, default_value, callback) {
        super(parent, title, default_value, callback);

        this._color_picker = new ui.UIColorPicker(this._string_input);
        this._container.appendChild(this._color_picker.DOM_container);
    }
}



/**
 * parameter with a list of numeric inputs
 *
 * @export
 * @class UIParameterNumInputList
 * @extends {UIParameter}
 */
export class UIParameterNumInputList extends UIParameter {
    /**
     * Creates an instance of UIParameterNumInputList.
     * @param {ui.UIComponent|HTMLElement} parent Container of the component.
     * @param {String} title The displayed title
     * @param {Boolean} parent_title_visible If a title element should be displayed.
     * @param {Array} input_definition_list Array with the config of all inputs.
     * @memberof UIParameterNumInputList
     */
    constructor(parent, title, parent_title_visible, input_definition_list) {
        super(parent, title, parent_title_visible);
        this._input_definition_list = input_definition_list;
        let template = "{title: string, unit: string, default_value: number, callback: function, min (optional): value, max (optional): value, step (optional): value}";
        if (!utils.IsAnArray(this._input_definition_list)) throw new Error(`UIParameterNumInputList: The input definition list must be an array of ${template}`);

        //create inputs
        this._inputs = [];
        let list = this._input_definition_list;

        for (let i = 0; i < list.length; i++) {
            let input = new ui.UINumberInput(`${list[i].title}: `, list[i].unit, list[i].default_value);
            input.DOM_container.style.width = "100%";
            this._inputs.push(input);
            input.DOM_parent = this._container;
            input.input_class_list = ["panel_input"];

            //optional values
            if (!utils.IsUndefined(list[i].min)) input.min = list[i].min;
            if (!utils.IsUndefined(list[i].max)) input.max = list[i].max;
            if (!utils.IsUndefined(list[i].step)) input.step = list[i].step;

            //callback
            input.oninput = list[i].callback;
        }
    }

    /**
     * get value of input by index
     *
     * @param {Number} index Index in the list of inputs. The order is defined by the config.
     * @return {Number} The value stored in the said input.
     * @memberof UIParameterNumInputList
     */
    value(index) {
        return this._inputs[index].value;
    }
}



/**
 * parameter for combinating a list of numeric inputs with
 * a button grid. The buttons config can be used to create
 * actions that directly interacts with the inputs.
 *
 * @export
 * @class UIParameterInputsAndButtonGrid
 * @extends {UIParameterNumInputList}
 */
export class UIParameterInputsAndButtonGrid extends UIParameterNumInputList {
    /**
     * Creates an instance of UIParameterInputsAndButtonGrid.
     * @param {ui.UIComponent|HTMLElement} parent Container of the component.
     * @param {String} title The displayed title
     * @param {Boolean} parent_title_visible If a title element should be displayed.
     * @param {Array} input_definition_list Array with the config of all inputs.
     * @param {Number} rows The number of rows.
     * @param {Number} columns The number of columns.
     * @param {Array} button_definitions The config for all the buttons.
     * @param {Boolean} togglable If togglable mode is used (classic buttons otherwise).
     * @memberof UIParameterInputsAndButtonGrid
     */
    constructor(parent, title, parent_title_visible, input_definition_list, rows, columns, button_definitions, togglable) {
        super(parent, title, parent_title_visible, input_definition_list);

        if (input_definition_list.length !== 2) throw new SyntaxError("UIParameterPosition: exactly 2 inputs are required.");

        this._rows = rows;
        this._columns = columns;
        this._button_definitions = button_definitions;
        this._togglable = togglable;

        this._button_grid = new ui.UIButtonGrid(this._rows, this._columns, this._button_definitions, this._togglable);
        this._button_grid.DOM_container.style.margin = "0 auto";
        this._button_grid.DOM_parent = this._container;
    }

    /**
     * Enable or disable a given button. Only works in togglable mode.
     *
     * @param {Number} i Row position
     * @param {Number} j Column position
     * @memberof UIParameterInputsAndButtonGrid
     */
    toggle(i, j) {this._button_grid.toggle(i, j);}

    /**
     * Force an input to receive a given value, and optionally fires its callback
     * after the value has been assigned.
     *
     * @param {Number} i Position of the input (config order)
     * @param {Number} value The value to assign to the input
     * @param {Boolean} dispatch_event If the input event should be triggered (call its callback).
     * @memberof UIParameterInputsAndButtonGrid
     */
    forceValue(i, value, dispatch_event) {
        this._inputs[i].value = value;
        if (dispatch_event) this._inputs[i].trigger();
    }
}



/**
 * parameter with a list of choices
 *
 * @export
 * @class UIParameterChoice
 * @extends {UIParameter}
 */
export class UIParameterChoice extends UIParameter {
    /**
     * Creates an instance of UIParameterChoice.
     * @param {ui.UIComponent|HTMLElement} parent Container of the component.
     * @param {String} title The displayed title
     * @param {Array} options_list An array of strings corresponding to the options to choose from.
     * @param {String} default_value The default option chosen.
     * @param {Function} callback The function to call when the user performs an action.
     * @memberof UIParameterChoice
     */
    constructor(parent, title, options_list, default_value, callback) {
        super(parent, title, false);
        this._options_list = options_list;
        this._default_value = default_value;

        //create element
        this._list = new ui.UIChoiceList(`${this._title}: `, this._options_list, this._default_value);
        this._list.DOM_container.style.width = "100%";
        this._list.DOM_parent = this._container;
        this._list.input_class_list = ["panel_input", "panel_input_list"];

        //callback
        this._list.oninput = callback;
    }

    get value() {return this._list.value;}
}



/**
 * parameter with a checkbox
 *
 * @export
 * @class UIParameterCheckBox
 * @extends {UIParameter}
 */
export class UIParameterCheckBox extends UIParameter {
    /**
     * Creates an instance of UIParameterCheckBox.
     * @param {ui.UIComponent|HTMLElement} parent Container of the component.
     * @param {String} title The displayed title
     * @param {Boolean} default_value If the checkbox is checked by default.
     * @param {Function} callback The function to call on user input.
     * @memberof UIParameterCheckBox
     */
    constructor(parent, title, default_value, callback) {
        super(parent, title, false);
        this._default_value = default_value;
        
        //create checkbox
        this._checkbox = new ui.UICheckBox(this._title, this._default_value);
        this._checkbox.DOM_container.style.width = "100%";
        this._checkbox.DOM_parent = this._container;
        this._checkbox.input_class_list = ["panel_input", "panel_input_checkbox"];

        //callback
        this._checkbox.oninput = callback;
    }

    get checked() {return this._checkbox.checked;}
}



/**
 * parameter for making a grid of buttons to interact with
 *
 * @export
 * @class UIParameterButtonGrid
 * @extends {UIParameter}
 */
export class UIParameterButtonGrid extends UIParameter {
    /**
     * Creates an instance of UIParameterButtonGrid.
     * @param {ui.UIComponent|HTMLElement} parent Container of the component.
     * @param {String} title The displayed title
     * @param {Number} rows The number of rows.
     * @param {Number} columns The number of columns.
     * @param {Array} button_definitions The config for all the buttons.
     * @param {Boolean} togglable If togglable mode is used (classic buttons otherwise).
     * @memberof UIParameterButtonGrid
     */
    constructor(parent, title, rows, columns, button_definitions, togglable) {
        super(parent, title, true);
        this._rows = rows;
        this._columns = columns;
        this._button_definitions = button_definitions;
        this._togglable = togglable;

        this._button_grid = new ui.UIButtonGrid(this._rows, this._columns, this._button_definitions, this._togglable);
        this._button_grid.DOM_container.style.margin = "0 auto";
        this._button_grid.DOM_parent = this._container;
    }

    /**
     * Enable or disable a given button. Only works in togglable mode.
     *
     * @param {Number} i Row position
     * @param {Number} j Column position
     * @memberof UIParameterButtonGrid
     */
    toggle(i, j) {this._button_grid.toggle(i, j);}
}



/**
 * parameter for background picking for visual objects.
 *
 * @export
 * @class UIParameterBackgroundPicker
 * @extends {UIParameter}
 */
export class UIParameterBackgroundPicker extends UIParameter {
    /**
     * Creates an instance of UIParameterBackgroundPicker.
     * @param {ui.UIComponent|HTMLElement} parent Container of the component.
     * @param {String} title The displayed title
     * @param {Object} defaults Defaults values organized in an object.
     * @param {*} object_id The ID of the object to interact with, necessary for the component to work.
     * @memberof UIParameterBackgroundPicker
     */
    constructor(parent, title, defaults, object_id) {
        super(parent, title, true);
        
        /**
         * defaults = {
         *      color: value;
         *      gradient: value;
         *      image: value; (full backgroundImage value with url()!)
         *      type: color|gradient|image;
         *      size_type: cover|contain|scale_size_control|width_height_size_control,
         *      size_x: value (string),
         *      size_y: value (string),
         *      repeat_x: value (boolean),
         *      repeat_y: value (boolean),
         * }
         */
        this._defaults = defaults;
        this._object_id = object_id;
        this._input_image_callback = function() {};
        this._input_else_callback = function() {};

        this._input_event = new Event("input", {
            bubbles: true,
            cancelable: true,
        });

        //MAIN UI

        //mode picker
        this._list = new ui.UIChoiceList("Type: ", ["color","gradient","image"], this._defaults.type);
        this._list.DOM_container.style.width = "100%";
        this._list.DOM_parent = this._container;
        this._list.input_class_list = ["panel_input", "panel_input_list"];
    
        //input for all modes
        let default_value;
        switch (this._defaults.type) {
            case "color": default_value = this._defaults.color; break;
            case "gradient": default_value = this._defaults.gradient; break;
            case "image": default_value = ""; break;
        }
        this._input = new ui.UIStringInput("", default_value);
        this._input.DOM_container.style.width = "100%";
        this._input.DOM_parent = this._container;
        this._input.input_class_list = ["panel_input", "panel_input_string"];

        //color picker
        this._color_picker = new ui.UIColorPicker(this._input);
        this._color_picker.DOM_parent = this._container;
        this._color_picker.value = this._defaults.color;
        this._color_picker.DOM_container.style.display = (this._defaults.type === "color")? "initial" : "none";

        //image display
        //using a div make more sense, so it matches the behaviour of the screen,
        //that also uses a div to handle colors and gradients.
        this._img_disp = document.createElement("div");
        this._container.appendChild(this._img_disp);
        this._img_disp.classList.add("panel_img_display");
        if (this._defaults.image !== "") {
            this._img_disp.style.backgroundImage = this._defaults.image;
        }
        //DISABLED, IMAGE PATHS CAN'T BE DEFINED WHILE object_method
        //IS IMPOSSIBLE TO ACCESS
        this._img_disp.style.display = "none";

        //image picker
        this._img_picker = document.createElement("button");
        this._img_picker.style.width = "100%";
        this._container.appendChild(this._img_picker);
        this._img_picker.classList.add("panel_button");
        this._img_picker.innerHTML = "BROWSE";

        //this._img_picker.onclick defined through getter




        //BACKGROUND SIZE

        //size mode picker
        this._size_mode_picker = new ui.UIChoiceList("Background size: ", ["contain","cover","scale_size_control","width_height_size_control"], this._defaults.size_type);
        this._size_mode_picker.DOM_container.style.width = "100%";
        this._size_mode_picker.DOM_parent = this._container;
        this._size_mode_picker.input_class_list = ["panel_input", "panel_input_list"];
        
        //size control by values
        this._bgnd_size_inputs = document.createElement("div");
        this._container.appendChild(this._bgnd_size_inputs);

        //first input
        this._bgnd_size_input1 = new ui.UINumberInput("", "%", this._defaults.size_x);
        this._bgnd_size_input1.DOM_container.style.width = "100%";
        this._bgnd_size_input1.DOM_parent = this._bgnd_size_inputs;
        this._bgnd_size_input1.display = (this._defaults.size_type === "scale_size_control" || this._defaults.size_type === "width_height_size_control")? "flex":"none";
        this._bgnd_size_input1.input_class_list = ["panel_input"];
        this._bgnd_size_input1.oninput = () => {
            this._defaults.size_x = this._bgnd_size_input1.value;
            //update background
            this._input.triggerOninput();
        };

        //second input
        this._bgnd_size_input2 = new ui.UINumberInput("", "%", this._defaults.size_y);
        this._bgnd_size_input2.DOM_container.style.width = "100%";
        this._bgnd_size_input2.DOM_parent = this._bgnd_size_inputs;
        this._bgnd_size_input2.display = (this._defaults.size_type === "width_height_size_control")? "flex":"none";
        this._bgnd_size_input2.input_class_list = ["panel_input"];
        this._bgnd_size_input2.oninput = () => {
            this._defaults.size_y = this._bgnd_size_input2.value;
            //update background
            this._input.triggerOninput();
        };




        //BACKGROUND REPEAT UI
        this._repeat_x_input = new ui.UICheckBox("Background repeat X: ", this._defaults.repeat_x);
        this._repeat_x_input.DOM_container.style.width = "100%";
        this._repeat_x_input.DOM_parent = this._container;
        this._repeat_x_input.input_class_list = ["panel_input", "panel_input_checkbox"];
        
        this._repeat_y_input = new ui.UICheckBox("Background repeat Y: ", this._defaults.repeat_y);
        this._repeat_y_input.DOM_container.style.width = "100%";
        this._repeat_y_input.DOM_parent = this._container;
        this._repeat_y_input.input_class_list = ["panel_input", "panel_input_checkbox"];

        this._repeat_x_input.oninput = this._repeat_y_input.oninput = () => {
            this._input.triggerOninput();
        };




        //LIST FUNCTIONS

        //option choice
        let image_UI = [/*this._img_disp,*/ this._img_picker, this._size_mode_picker.DOM_container, this._bgnd_size_inputs, this._repeat_x_input.DOM_container, this._repeat_y_input.DOM_container];
        if (this._defaults.type === "image") image_UI.forEach(element => element.style.display = (element.tagName === "BUTTON")? "initial":"flex");
        else image_UI.forEach(element => element.style.display = "none");
        this._list.oninput = () => {
            //update UI
            switch (this._list.value) {
                case "color":
                    this._input.display = "flex";
                    this._input.value = this._defaults.color;
                    this._color_picker.DOM_container.style.display = "initial";
                    image_UI.forEach(element => element.style.display = "none");
                    break;
                case "gradient":
                    this._input.display = "flex";
                    this._input.value = this._defaults.gradient;
                    this._color_picker.DOM_container.style.display = "none";
                    image_UI.forEach(element => element.style.display = "none");
                    break;
                case "image":
                    this._input.display = "flex";
                    this._input.value = "";
                    this._color_picker.DOM_container.style.display = "none";
                    image_UI.forEach(element => element.style.display = (element.tagName === "BUTTON")? "initial":"flex");
                    break;
            }

            //update background on type switch
            this._input.triggerOninput();
        };

        //background size type choice
        this._size_mode_picker.oninput = () => {
            switch (this._size_mode_picker.value) {
                case "cover":
                case "contain":
                    this._bgnd_size_input1.display = "none";
                    this._bgnd_size_input2.display = "none";
                    break;
                case "scale_size_control":
                    this._bgnd_size_input1.display = "flex";
                    this._bgnd_size_input2.display = "none";
                    break;
                case "width_height_size_control":
                    this._bgnd_size_input1.display = "flex";
                    this._bgnd_size_input2.display = "flex";
                    break;
            }

            //update background on size type switch
            this._input.triggerOninput();
        };




        //MAIN FUNCTION
        this._input.oninput = () => {
            if (this._list.value === "image") this._input_image_callback(this._object_id, this._list.value, this._defaults.image, this._size_mode_picker.value, this._defaults.size_x, this._defaults.size_y, this._repeat_x_input.checked, this._repeat_y_input.checked);
            else this._input_else_callback(this._object_id, this._list.value, this._input.value);
        
            //keep in memory the changes to when the users change of type, he gets back what he wrote.
            switch (this._list.value) {
                case "color": this._defaults.color = this._input.value; break;
                case "gradient": this._defaults.gradient = this._input.value; break;
                //image changes managed by image picker button
            }
        };
    }

    get list_value() {return this._list.value;}

    set img_disp_background_image(background) {
        this._img_disp.style.backgroundImage = background;
    }

    set img_picker_onclick(callback) {
        this._img_picker.onclick = callback;
    }

    set input_image_callback(callback) {
        this._input_image_callback = callback;
    }
    set input_else_callback(callback) {
        this._input_else_callback = callback;
    }

    set default_image(value) {
        this._defaults.image = value;
    }
    set size_min(min) {
        this._bgnd_size_input1.min = min;
        this._bgnd_size_input2.min = min;
    }
    set size_max(max) {
        this._bgnd_size_input1.max = max;
        this._bgnd_size_input2.max = max;
    }
    set size_step(step) {
        this._bgnd_size_input1.step = step;
        this._bgnd_size_input2.step = step;
    }

    /**
     * triggers the main string input event
     *
     * @memberof UIParameterBackgroundPicker
     */
    triggerOnInput() {
        this._input.triggerOninput();
    }
}
















/**
 * toggleable container that can be opened/close, and contains a list of child elements
 *
 * @export
 * @class UIParameterRack
 * @extends {ui.UIComponent}
 */
export class UIParameterRack extends ui.UIComponent {
    /**
     * Creates an instance of UIParameterRack.
     * @param {ui.UIComponent|HTMLElement} parent Container of the component.
     * @param {String} id The HTML id attribute value to assign to the container.
     * @param {String} title The displayed title
     * @param {Object} settings Component configuration.
     * @memberof UIParameterRack
     */
    constructor(parent, id, title, settings) {
        super();
        this._parent = parent;
        this._id = id;
        this._title = title;
        this._icon = "";
        this._settings = settings;

        //setup optional arguments
        this._DEFAULT_DEFAULT_CLOSED = false;
        this._DEFAULT_USER_CAN_EDIT_NAME = true;
        this._DEFAULT_USER_CAN_DELETE = true;
        if (utils.IsUndefined(settings)) {
            this._settings = {
                default_closed: this._DEFAULT_DEFAULT_CLOSED,
                user_can_edit_name: this._DEFAULT_USER_CAN_EDIT_NAME,
                user_can_delete: this._DEFAULT_USER_CAN_DELETE,
            };
        }
        if (utils.IsUndefined(this._settings.default_closed)) this._settings.default_closed = this._DEFAULT_DEFAULT_CLOSED;
        if (utils.IsUndefined(this._settings.user_can_edit_name)) this._settings.user_can_edit_name = this._DEFAULT_USER_CAN_EDIT_NAME;
        if (utils.IsUndefined(this._settings.user_can_delete)) this._settings.user_can_delete = this._DEFAULT_USER_CAN_DELETE;

        this._delete_callback = function() {};
        this._rename_callback = function() {};
        this._closed = false;

        //CREATE ELEMENT
        this.DOM_parent = parent;

        //CONFIGURE ELEMENT
        this.DOM_container.id = id;
        this.DOM_container.classList.add("object_param_container");

        //ADD SUB ELEMENTS
        //banner
        this._banner = document.createElement("div");
        this._DOM_container.appendChild(this._banner);
        this._banner.classList.add("object_param_banner");

        //title container
        this._title_container = document.createElement("div");
        this._banner.appendChild(this._title_container);
        this._title_container.classList.add("object_param_title");

        //name of the title_container
        this._title_span = document.createElement("span");
        this._title_container.appendChild(this._title_span);
        this._title_span.innerHTML = this._title;

        //icon in the title_container
        this._icon_container = document.createElement("div");
        this._banner.appendChild(this._icon_container);
        this._icon_container.classList.add("object_param_icon", "object_param_type");
        this._icon_container.innerHTML = this._icon;

        //arrow
        this._arrow = document.createElement("div");
        this._banner.appendChild(this._arrow);
        this._arrow.innerHTML = "<i class=\"ri-arrow-right-s-line\"></i>";
        this._arrow.classList.add("object_param_icon", "object_param_arrow");

        //deletion cross
        if (this._settings.user_can_delete) {
            this._cross_button = document.createElement("div");
            this._banner.appendChild(this._cross_button);
            this._cross_button.innerHTML = "<i class=\"ri-close-circle-fill\"></i>";
            this._cross_button.classList.add("object_param_icon", "object_param_cross");

            //object deletion
            this._cross_button.onclick = () => {
                this.delete();
            };

        }

        //edit button
        if (this._settings.user_can_edit_name) {
            this._edit_button = document.createElement("div");
            this._banner.appendChild(this._edit_button);
            this._edit_button.innerHTML = "<i class=\"ri-pencil-fill\"></i>";
            this._edit_button.classList.add("object_param_icon", "object_param_edit");

            //object renaming
            this._edit_button.onclick = () => {
                this._rename_callback(); //The user call itself the rename() function in its function
            };
        }


        //ability to open and close the object parameters' container
        this._title_container.onclick = this._arrow.onclick = () => {
            this.toggleOpen();
        };
        //default
        if (this._settings.default_closed) this.toggleOpen();

        
    }

    get closed() {return this._closed;}
    set closed(closed) {if (closed !== this._closed) this.toggleOpen();}

    set delete_callback(callback) {this._delete_callback = callback;}
    set rename_callback(callback) {this._rename_callback = callback;}

    set icon(icon) {
        this._icon = icon;
        this._icon_container.innerHTML = icon;
    }

    /**
     * function that opens or closes the rack depending of its state.
     *
     * @memberof UIParameterRack
     */
    toggleOpen() {
        if (this._closed) {
            this._DOM_container.classList.remove("object_param_closed");
            this._closed = false;
        }
        else {
            this._DOM_container.classList.add("object_param_closed");
            this._closed = true;
        }
    }

    /**
     * call the delete callback and remove itslef.
     *
     * @memberof UIParameterRack
     */
    delete() {
        this._delete_callback(); //user action on remove
        this.removeSelf();
    }

    /**
     * remove itself from the document
     *
     * @memberof UIParameterRack
     */
    removeSelf() {
        this._DOM_container.remove();
    }

    /**
     * rename the title bar of the display
     *
     * @param {*} name
     * @memberof UIParameterRack
     */
    rename(name) {
        this._title_span.innerHTML = name;
    }
}