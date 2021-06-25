//MIT License - Copyright (c) 2020-2021 Picorims

import * as utils from "../utils/utils.js";
import * as ui from "./ui_base_components.js";

//parameters UI used in the control panel. Each class is a template.

//base parameter
export class UIParameter extends ui.UIComponent {
    constructor(parent, title, parent_title_visible) {
        super();
        this._parent = parent;
        this._title = title;
        this._parent_title_visible = parent_title_visible;

        //container
        this._container = this._DOM_container;
        this._parent.appendChild(this._container);
        this._container.classList.add("panel_param_container");

        //name
        if (parent_title_visible) {
            this._label = document.createElement("span");
            this._container.appendChild(this._label);
            this._label.innerHTML = `${title}: `;    
        }
    }

    set class_list(class_list) {
        if (!utils.IsAnArray(class_list)) throw new Error("UINumberInput: array required.");
        this._input.className = class_list.join(" ");
    }
}



//string parameter
export class UIParameterString extends UIParameter {
    constructor(parent, title, default_value, callback) {
        super(parent, title, false);
        this._default_value = default_value;

        //element
        this._string_input = new ui.UIStringInput(this._title, this._default_value);
        this._container.appendChild(this._string_input.DOM_container);
        this._string_input.input_class_list = ["panel_input", "panel_input_string"];

        //function
        this._string_input.oninput = callback;
    }

    get value() {return this._string_input.value}
}



//parameter with a list of numeric inputs
export class UIParameterNumInputList extends UIParameter {
    constructor(parent, title, input_definition_list) {
        super(parent, title, true);
        this._input_definition_list = input_definition_list;
        let template = "{title: string, unit: string, default_value: number, callback: function, min (optional): value, max (optional): value, step (optional): value}"
        if (!utils.IsAnArray(this._input_definition_list)) throw new Error(`UIParameterNumInputList: The input definition list must be an array of ${template}`);

        //create inputs
        this._inputs = [];
        let list = this._input_definition_list

        for (let i = 0; i < this._input_definition_list.length; i++) {
            let input = new ui.UINumberInput(list[i].title, list[i].unit, list[i].default_value);
            this._inputs.push(input);
            this._container.appendChild(input.DOM_container);
            input.input_class_list = ["panel_input"];

            //optional values
            if (!utils.IsUndefined(list[i].min)) input.min = list[i].min;
            if (!utils.IsUndefined(list[i].max)) input.max = list[i].max;
            if (!utils.IsUndefined(list[i].step)) input.step = list[i].step;

            //callback
            input.oninput = list[i].callback;
        }
    }

    //get value of input by index
    value(index) {
        return this._inputs[index].value;
    }
}



//parameter with a list of choices
export class UIParameterChoice extends UIParameter {
    constructor(parent, title, options_list, default_value, callback) {
        super(parent, title, false);
        this._options_list = options_list;
        this._default_value = default_value;

        //create element
        this._list = new ui.UIChoiceList(this._title, this._options_list, this._default_value);
        this._container.appendChild(this._list.DOM_container);
        this._list.input_class_list = ["panel_input", "panel_input_list"];

        //callback
        this._list.oninput = callback;
    }

    get value() {return this._list.value};
}



//parameter with a checkbox
export class UIParameterCheckBox extends UIParameter {
    constructor(parent, title, default_value, callback) {
        super(parent, title, false);
        this._default_value = default_value;
        
        //create checkbox
        this._checkbox = new ui.UICheckBox(this._title, this._default_value);
        this._container.appendChild(this._checkbox.DOM_container);
        this._checkbox.input_class_list = ["panel_input", "panel_input_checkbox"];

        //callback
        this._checkbox.oninput = callback;
    }

    get checked() {return this._checkbox.checked}
}



//parameter for background picking
export class UIParameterBackgroundPicker extends UIParameter {
    constructor(parent, title, defaults, object_id) {
        super(parent, title, true);
        /*
        defaults = {
            color: value;
            gradient: value;
            image: value; (full backgroundImage value with url()!)
            type: color|gradient|image;
            size_type: cover|contain|scale_size_control|width_height_size_control,
            size_x: value (string),
            size_y: value (string),
            repeat_x: value (boolean),
            repeat_y: value (boolean),
        }
        */
        this._defaults = defaults;
        this._object_id = object_id;
        this._input_image_callback = function() {};
        this._input_else_callback = function() {};

        this._input_event = new Event('input', {
            bubbles: true,
            cancelable: true,
        });

        //MAIN UI

        //mode picker
        this._list = new ui.UIChoiceList("type", ["color","gradient","image"], this._defaults.type);
        this._container.appendChild(this._list.DOM_container);
        this._list.input_class_list = ["panel_input", "panel_input_list"];
    
        //input for all modes
        let default_value;
        switch (this._defaults.type) {
            case "color": default_value = this._defaults.color; break;
            case "gradient": default_value = this._defaults.gradient; break;
            case "image": default_value = ""; break;
        }
        this._input = new ui.UIStringInput("", default_value);
        this._container.appendChild(this._input.DOM_container);
        this._input.input_class_list = ["panel_input", "panel_input_string"];

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
        this._container.appendChild(this._img_picker);
        this._img_picker.classList.add("panel_button");
        this._img_picker.innerHTML = "BROWSE";

        //this._img_picker.onclick defined through getter




        //BACKGROUND SIZE

        //size mode picker
        this._size_mode_picker = new ui.UIChoiceList("Background size: ", ["contain","cover","scale_size_control","width_height_size_control"], this._defaults.size_type);
        this._container.appendChild(this._size_mode_picker.DOM_container);
        this._size_mode_picker.input_class_list = ["panel_input", "panel_input_list"];
        
        //size control by values
        this._bgnd_size_inputs = document.createElement("div");
        this._container.appendChild(this._bgnd_size_inputs);

        //first input
        this._bgnd_size_input1 = new ui.UINumberInput("", "%", this._defaults.size_x);
        this._bgnd_size_inputs.appendChild(this._bgnd_size_input1.DOM_container);
        this._bgnd_size_input1.DOM_container.style.display = (this._defaults.size_type === "scale_size_control" || this._defaults.size_type === "width_height_size_control")? "initial":"none";
        this._bgnd_size_input1.input_class_list = ["panel_input"];
        this._bgnd_size_input1.oninput = () => {
            this._defaults.size_x = this._bgnd_size_input1.value;
            //update background
            this._input.triggerOninput();
        }

        //second input
        this._bgnd_size_input2 = new ui.UINumberInput("", "%", this._defaults.size_y);
        this._bgnd_size_inputs.appendChild(this._bgnd_size_input2.DOM_container);
        this._bgnd_size_input2.DOM_container.style.display = (this._defaults.size_type === "width_height_size_control")? "initial":"none";
        this._bgnd_size_input2.input_class_list = ["panel_input"];
        this._bgnd_size_input2.oninput = () => {
            this._defaults.size_y = this._bgnd_size_input2.value;
            //update background
            this._input.triggerOninput();
        }




        //BACKGROUND REPEAT UI
        this._repeat_x_input = new ui.UICheckBox("Background repeat X: ", this._defaults.repeat_x);
        this._container.appendChild(this._repeat_x_input.DOM_container);
        this._repeat_x_input.input_class_list = ["panel_input", "panel_input_checkbox"];
        
        this._repeat_y_input = new ui.UICheckBox("Background repeat Y: ", this._defaults.repeat_y);
        this._container.appendChild(this._repeat_y_input.DOM_container);
        this._repeat_y_input.input_class_list = ["panel_input", "panel_input_checkbox"];

        this._repeat_x_input.oninput = this._repeat_y_input.oninput = () => {
            this._input.triggerOninput();
        }




        //LIST FUNCTIONS

        //option choice
        let image_UI = [/*this._img_disp,*/ this._img_picker, this._size_mode_picker.DOM_container, this._bgnd_size_inputs, this._repeat_x_input.DOM_container, this._repeat_y_input.DOM_container];
        if (this._defaults.type === "image") image_UI.forEach(element => element.style.display = "initial");
            else image_UI.forEach(element => element.style.display = "none");
        this._list.oninput = () => {
            //update UI
            switch (this._list.value) {
                case "color":
                    this._input.DOM_container.style.display = "initial";
                    this._input.value = this._defaults.color;
                    image_UI.forEach(element => element.style.display = "none");
                break;
                case "gradient":
                    this._input.DOM_container.style.display = "initial";
                    this._input.value = this._defaults.gradient;
                    image_UI.forEach(element => element.style.display = "none");
                break;
                case "image":
                    this._input.DOM_container.style.display = "none";
                    this._input.value = "";
                    image_UI.forEach(element => element.style.display = "initial");
                break;
            }

            //update background on type switch
            this._input.triggerOninput();
        }

        //background size type choice
        this._size_mode_picker.oninput = () => {
            switch (this._size_mode_picker.value) {
                case "cover":
                case "contain":
                    this._bgnd_size_input1.DOM_container.style.display = "none";
                    this._bgnd_size_input2.DOM_container.style.display = "none";
                break;
                case "scale_size_control":
                    this._bgnd_size_input1.DOM_container.style.display = "initial";
                    this._bgnd_size_input2.DOM_container.style.display = "none";
                break;
                case "width_height_size_control":
                    this._bgnd_size_input1.DOM_container.style.display = "initial";
                    this._bgnd_size_input2.DOM_container.style.display = "initial";
                break;
            }

            //update background on size type switch
            this._input.triggerOninput();
        }




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
        }
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
}