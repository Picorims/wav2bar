//MIT License - Copyright (c) 2020-2021 Picorims

import * as object from "./visual_object.js";
import * as utils from "../utils/utils.js";
import * as ui_components from "../ui_components/ui_components.js";
import help from "../../assets/help/help.json" assert {type: "json"}; //not an error, chromium only feature.

const DEFAULTS = {
    LAYER: 0,
    COORDINATES: {x: 0, y: 0},
    SIZE: {width: 400, height: 100},
    ROTATION: 0,
    SVG_FILTER: "",

    COLOR: "#ffffff",
    BORDER_RADIUS: "",
    BOX_SHADOW: "",
    BACKGROUND: {
        type: "color",
        last_color: "#ffffff",
        last_gradient: "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(255,255,255,1) 100%)",
        last_image: "",
        size: "",
        repeat: "no-repeat",
    },

    TEXT_TYPE: "any",
    TEXT_CONTENT: "text",
    FONT_SIZE: 20,
    TEXT_DECORATION: {
        italic: false,
        bold: false,
        underline: false,
        overline: false,
        line_through: false,
    },
    TEXT_ALIGN: {
        horizontal: "center",
        vertical: "top",
    },
    TEXT_SHADOW: "",

    TIMER_INNER_SPACING: 2,
    BORDER_THICKNESS: 2,

    PARTICLE_RADIUS_RANGE: [1,2],
    FLOW_TYPE: "radial",
    FLOW_CENTER: {x: 0, y: 0},
    FLOW_DIRECTION: 0,
    PARTICLE_SPAWN_PROBABILITY: 0.75,
    PARTICLE_SPAWN_TESTS: 1,

    VISUALIZER_RADIUS: 30,
    VISUALIZER_POINTS_COUNT: 50,
    VISUALIZER_ANALYZER_RANGE: [0, 750],
    VISUALIZATION_SMOOTHING_TYPE: "average",
    VISUALIZATION_SMOOTHING_FACTOR: 0.7,
    VISUALIZER_BAR_THICKNESS: 2,
}

//abstract class to manipulate a property of a VisualObject
//stored in the save at the root of the object.
/**
 * @abstract
 * @borrows utils.EventMixin
 */
export class VisualObjectProperty {
    constructor(save_handler, visual_object, property_name, default_value) {
        if (this.constructor === VisualObjectProperty) throw new SyntaxError("VisualObjectProperty is an abstract class.");

        //implements mixin
        Object.assign(VisualObjectProperty.prototype, utils.EventMixin);
        this.setupEventMixin([
            "value_changed",
        ]);

        this._save_handler = save_handler;
        /** @type {object.VisualObject} */
        this._visual_object = visual_object;
        //name in the save, name used by the object for data access.
        this._property_name = property_name;
        this._default_value = default_value;
        this._allowed_values = []; //used by some properties with a defined list of values.
        this._ui_parameter = null;

        if (!this._visual_object instanceof object.VisualObject) throw new SyntaxError("visual object must be a VisualObject.");
        if (!utils.IsAString(this._property_name)) throw new SyntaxError("Property name must be a string.");
        if (utils.IsUndefined(this._default_value)) throw new SyntaxError("Missing default value for the property.");

        //register property in save if it doesn't exist, or verify it otherwise.
        if (utils.IsUndefined(this.getCurrentValue())) {
            this.setSave(this._default_value);
        } else {
            this.verify();
        }
    }

    //get the current stored value in save
    getCurrentValue() {
        return this._save_handler.getVisualObjectData(this._visual_object.id)[this._property_name];
    }

    //register or change value in save
    setSave(value) {
        let data = {};
        data[this._property_name] = value;
        this._save_handler.mergeVisualObjectData(this._visual_object.id, data);
        this.triggerEvent("value_changed", value);
    }

    //register or change value in save, after verifying it, designed
    //for UI interaction.
    setSaveUISafe(value) {
        if (!this.hasValidValue(value)) {
            utils.CustomLog("warn", `${this.constructor.name}: Ignored invalid value from user interface (${value}).`);
        } else {
            this.setSave(value);
        }
    }

    //verify the value and overwrite it if it is not valid.
    verify() {
        if (utils.IsUndefined(this.getCurrentValue())) throw new Error("Can't verify a value if it doesn't exist!");
        if (!this.hasValidValue(this.getCurrentValue())) {
            utils.CustomLog("warn", `${this._visual_object.constructor.name} ${this._visual_object.id}, ${this.constructor.name} (property "${this._property_name}"): Invalid value! Set to ${this._default_value}.`);
            this.setSave(this._default_value);
        }
    }

    //returns if a value is valid (number: match ranges, string: match regexp, etc.)
    /**
     * @abstract
     */
    hasValidValue(value) {
        throw new Error("hasValidValue must be implemented in a VisualObject.");
    }
}














//#################################
// SHARED PROPERTIES (all objects)
//#################################


//name property, define object's display name.
export class VPName extends VisualObjectProperty {
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "name", `object${utils.RandomInt(0, 999999)}`);

        //create associated ui
        this._ui_parameter = new ui_components.UIParameterString(
            this._visual_object.parameter_rack,
            "Name: ",
            this.getCurrentValue(),
            () => {
                this.rename(this._ui_parameter.value);
            }
        );
        this._visual_object.parameter_rack.rename(this.getCurrentValue());
    }

    /**
     * @override
     */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAString(value) && value !== "");
    }

    rename(name) {
        this.setSaveUISafe(name);
        this._visual_object.parameter_rack.rename(name);
    };
}



//layer property, defines the order of display of objects.
export class VPLayer extends VisualObjectProperty {
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "layer", DEFAULTS.LAYER);

        //create associated ui
        this._ui_parameter = new ui_components.UIParameterNumInputList(
            this._visual_object.parameter_rack,
            "",
            false,
            [{
                title: "Layer :",
                unit: "",
                default_value: this.getCurrentValue(),
                min: 0,
                step: 1,
                callback: () => {
                    this.setSaveUISafe(parseInt(this._ui_parameter.value(0)));
                }
            }]
        );
        //this.parameters.layer.help_string = help.parameter.object.general.layer;
    }

    /**
     * @override
     */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAnInt(value) && value >= 0);
    }
}



//coordinates property, defines an object's position.
//the button grid needs a VPSize to exist on the object in order to work properly.
export class VPCoordinates extends VisualObjectProperty {
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "coordinates", JSON.parse(JSON.stringify(DEFAULTS.COORDINATES)));

        //create associated ui
        this._ui_parameter = new ui_components.UIParameterInputsAndButtonGrid(
            this._visual_object.parameter_rack,
            "",
            false,
            [{
                title: "X :",
                unit: "px",
                default_value: this.getCurrentValue().x,
                step: 1,
                callback: () => {
                    this.setSaveUISafe({
                        x: parseInt(this._ui_parameter.value(0)),
                        y: this.getCurrentValue().y,
                    });
                }
            },
            {
                title: "Y :",
                unit: "px",
                default_value: this.getCurrentValue().y,
                step: 1,
                callback: () => {
                    this.setSaveUISafe({
                        x: this.getCurrentValue().x,
                        y: parseInt(this._ui_parameter.value(1)),
                    });
                }
            }],
            2, 3, [
                [
                    {
                        innerHTML: '<i class="ri-align-left"></i>',
                        callback: () => {
                            this._ui_parameter.forceValue(0, 0, true);
                        }
                    },{
                        innerHTML: '<i class="ri-align-center"></i>',
                        callback: () => {
                            let obj_width = this._save_handler.getVisualObjectData(this._visual_object.id).size.width;
                            let pos = this._save_handler.save_data.screen.width/2 - obj_width/2;
                            this._ui_parameter.forceValue(0, pos, true);
                        }
                    },{
                        innerHTML: '<i class="ri-align-right"></i>',
                        callback: () => {
                            let obj_width = this._save_handler.getVisualObjectData(this._visual_object.id).size.width;
                            let pos = this._save_handler.save_data.screen.width - obj_width;
                            this._ui_parameter.forceValue(0, pos, true);
                        }
                    }
                ],[
                    {
                        innerHTML: '<i class="ri-align-top"></i>',
                        callback: () => {
                            this._ui_parameter.forceValue(1, 0, true);
                        }
                    },{
                        innerHTML: '<i class="ri-align-vertically"></i>',
                        callback: () => {
                            let obj_height = this._save_handler.getVisualObjectData(this._visual_object.id).size.height;
                            let pos = this._save_handler.save_data.screen.height/2 - obj_height/2;
                            this._ui_parameter.forceValue(1, pos, true);
                        }
                    },{
                        innerHTML: '<i class="ri-align-bottom"></i>',
                        callback: () => {
                            let obj_height = this._save_handler.getVisualObjectData(this._visual_object.id).size.height;
                            let pos = this._save_handler.save_data.screen.height - obj_height;
                            this._ui_parameter.forceValue(1, pos, true);
                        }
                    }
                ]
            ], false
        );
        //this.parameters.coordinates.help_string = help.parameter.object.general.pos;
    }

    /**
     * @ovveride
     */
    hasValidValue(value) {
        return (!utils.IsUndefined(value.x) && !utils.IsUndefined(value.y) && utils.IsAnInt(value.x) && utils.IsAnInt(value.y));
    }
}



//size property, defines an object's size.
export class VPSize extends VisualObjectProperty {
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "size", JSON.parse(JSON.stringify(DEFAULTS.SIZE)));
    
        //create associated ui
        this._ui_parameter = new ui_components.UIParameterInputsAndButtonGrid(
            this._visual_object.parameter_rack,
            "",
            false,
            [{
                title: "Width :",
                unit: "px",
                default_value: this.getCurrentValue().width,
                min: 0,
                step: 1,
                callback: () => {
                    this.setSaveUISafe({
                        width: parseInt(this._ui_parameter.value(0)),
                        height: this.getCurrentValue().height,
                    });
                }
            },
            {
                title: "Height :",
                unit: "px",
                default_value: this.getCurrentValue().height,
                min: 0,
                step: 1,
                callback: () => {
                    this.setSaveUISafe({
                        width: this.getCurrentValue().width,
                        height: parseInt(this._ui_parameter.value(1)),
                    });
                }
            }],
            1, 3, [
                [
                    {
                        innerHTML: '&#11020;',
                        callback: () => {
                            this._ui_parameter.forceValue(0, this._save_handler.save_data.screen.width, true);
                        }
                    },{
                        innerHTML: '&#11021;',
                        callback: () => {
                            this._ui_parameter.forceValue(1, this._save_handler.save_data.screen.height, true);
                        }
                    },{
                        innerHTML: '<i class="ri-fullscreen-line"></i>',
                        callback: () => {
                            this._ui_parameter.forceValue(0, this._save_handler.save_data.screen.width, true);
                            this._ui_parameter.forceValue(1, this._save_handler.save_data.screen.height, true);
                        }
                    }
                ]
            ], false
        );
        //this.parameters.size.help_string = help.parameter.object.general.size;
    }

    /**
     * @override
     */
    hasValidValue(value) {
        return (!utils.IsUndefined(value.width) && !utils.IsUndefined(value.height) && utils.IsAnInt(value.width) && utils.IsAnInt(value.height) && value.width >= 0 && value.height >= 0);
    }
}



//rotation property, sets the rotation of the object
export class VPRotation extends VisualObjectProperty {
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "rotation", DEFAULTS.ROTATION);
        
        //create associated UI
        this._ui_parameter = new ui_components.UIParameterNumInputList(
            this._visual_object.parameter_rack,
            "",
            false,
            [{
                title: "Rotation (degrees) :",
                unit: "°",
                default_value: this.getCurrentValue(),
                min: 0,
                step: 1,
                callback: () => {
                    this.setSaveUISafe(parseInt(this._ui_parameter.value(0)));
                }
            }]
        );
        //this.parameters.rotation.help_string = help.parameter.object.general.rotation;
    }

    /**
     * @override
     */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAnInt(value));
    }
}



// Visual property for defining an svg filter applied on an object
export class VPSVGFilter extends VisualObjectProperty {
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "svg_filter", DEFAULTS.SVG_FILTER);

        // create associated UI
        this._ui_parameter = new ui_components.UIParameterString(
            this._visual_object.parameter_rack,
            "SVG Filters (advanced, read help)",
            this.getCurrentValue(),
            () => {
                this.setSaveUISafe(this._ui_parameter.value);
            }
        );
        // this.parameters.svg_filters.help_string = help.parameter.object.general.svg_filters;

    }

    /**
     * @override
     */
    hasValidValue(value) {
        let no_script = !value.includes("<script>");
        let valid_tag = (value.includes("<filter") && value.includes("</filter>"));
        return (!utils.IsUndefined(value) && utils.IsAString(value) && valid_tag && no_script);
    }
}










//###################
// COMMON PROPERTIES
//###################

// Visual property for changing the overall color of an object.
export class VPColor extends VisualObjectProperty {
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "color", DEFAULTS.COLOR);

        //create associated UI
        this._ui_parameter = new ui_components.UIParameterColor(
            this._visual_object.parameter_rack,
            "Color (hex, rgb, rgba)",
            this.getCurrentValue(),
            () => {
                this.setSaveUISafe(this._ui_parameter.value);
            }
        );
        // this.parameters.color.help_string = help.parameter.object.general.color;
    }

    /**
     * @override
     */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAString(value));
    }
}



//property to control border radius of any HTML object using the CSS syntax
export class VPBorderRadius extends VisualObjectProperty {
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "border_radius", DEFAULTS.BORDER_RADIUS);

        //create associated UI
        this._ui_parameter = new ui_components.UIParameterString(
            this._visual_object.parameter_rack,
            "Border radius (CSS)",
            this.getCurrentValue(),
            () => {
                this.setSaveUISafe(this._ui_parameter.value)
            }
        );
        // this.parameters.border_radius.help_string = help.parameter.object.general.border_radius;
    }

    /**
    * @override
    */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAString(value));
    }    
}



//property to control box shadow of any HTML object using the CSS syntax
export class VPBoxShadow extends VisualObjectProperty {
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "box_shadow", DEFAULTS.BOX_SHADOW);

        //create associated UI
        this._ui_parameter = new ui_components.UIParameterString(
            this._visual_object.parameter_rack,
            "Box Shadow (CSS)",
            this.getCurrentValue(),
            () => {
                this.setSaveUISafe(this._ui_parameter.value)
            }
        );
        // this.parameters.box_shadow.help_string = help.parameter.object.general.shadow;
    }

    /**
    * @override
    */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAString(value));
    }    
}



//visual property to define a CSS based background. It supports color, gradients, and images.
export class VPBackground extends VisualObjectProperty {
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "background", DEFAULTS.BACKGROUND);

        //create associated UI
        let parsed_size = this.parseBackgroundSize(this.getCurrentValue().size);
        let parsed_repeat = this.parseBackgroundRepeat(this.getCurrentValue().repeat);
        this._ui_parameter = new ui_components.UIParameterBackgroundPicker(
            this._visual_object.parameter_rack,
            "Background",
            {//defaults
                color: this.getCurrentValue().last_color,
                gradient: this.getCurrentValue().last_gradient,
                //line below doesn't work because not a relative path
                image: (this.getCurrentValue().last_image !== "")? `url(${this._save_handler.owner_project.working_dir}/temp/current_save/assets/${this._visual_object.id}/background/${this.getCurrentValue().last_image})` : "",
                type: this.getCurrentValue().type,
                size_type: parsed_size.size_type,
                size_x: parsed_size.size_x,
                size_y: parsed_size.size_y,
                repeat_x: parsed_repeat.repeat_x,
                repeat_y: parsed_repeat.repeat_y,
            },
            this._visual_object.id,
        );

        this._ui_parameter.img_picker_onclick = async () => {
            await this._save_handler.owner_project.user_interface.FileBrowserDialog({
                type: "get_file",
                allowed_extensions: ["avif","jpg","jpeg","jfif","pjpeg","pjp","png","svg","webp","bmp","ico","cur"],
                //source: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img
            }, async (result) => {
                let file_info = await this._save_handler.saveObjectBackgroundImage(result, this._visual_object.id);

                //update display and keep new name in memory;
                this._ui_parameter.img_disp_background_image = `url("${file_info.new_path}${file_info.filename}")`; //doesn't work because not a relative path
                this._ui_parameter.default_image = file_info.filename;
            
                //trigger callback to update the object and save
                this._ui_parameter.triggerOnInput();
            });
        }
        
        this._ui_parameter.input_image_callback = this._ui_parameter.input_else_callback = (id, type, value, size_type, size_x, size_y, repeat_x, repeat_y) => {
            this.setSaveUISafe({
                type: type,
                last_color: (type === "color")? value : this.getCurrentValue().last_color,
                last_gradient: (type === "gradient")? value : this.getCurrentValue().last_gradient,
                last_image: (type === "image")? value : this.getCurrentValue().last_image,
                size: (type === "image")? this.stringifyBackgroundSize(size_type, size_x, size_y) : this.getCurrentValue().size,
                repeat: (type === "image")? this.stringifyBackgroundRepeat(repeat_x, repeat_y) : this.getCurrentValue().repeat,        
            });
        };
        this._ui_parameter.size_step = 1;
        //HELP TODO
    }

    //parse a background size CSS property into an object with separate values.
    parseBackgroundSize(bgnd_size) {
        let bgnd_size_array = bgnd_size.split(" ");
        let def_size_type, def_size_x, def_size_y;
        let val_percent_regex = new RegExp(/[0-9]+%/);//no g flag so it doesn't keep track of last index
        if (bgnd_size_array[0] === "contain") {
            def_size_type = "contain";
            def_size_x = def_size_y = "100";

        } else if (bgnd_size_array[0] === "cover") {
            def_size_type = "cover";
            def_size_x = def_size_y = "100";

        } else if ( bgnd_size_array.length === 1 && val_percent_regex.test(bgnd_size_array[0]) ) {
            def_size_type = "scale_size_control";
            def_size_x = bgnd_size_array[0].replace("%","");
            def_size_y = "100";

        } else if ( bgnd_size_array.length === 2 && val_percent_regex.test(bgnd_size_array[0]) && val_percent_regex.test(bgnd_size_array[1]) ) {
            def_size_type = "width_height_size_control";
            def_size_x = bgnd_size_array[0].replace("%","");
            def_size_y = bgnd_size_array[1].replace("%","");

        } else {
            def_size_type = "cover";
            def_size_x = def_size_y = "100";
        }

        return {
            size_type: def_size_type,
            size_x: def_size_x,
            size_y: def_size_y,
        }
    }

    //craft a CSS background size property from given information.
    stringifyBackgroundSize(size_type, size_x, size_y) {
        switch (size_type) {
            case "contain":
            case "cover":
                return size_type;
            case "scale_size_control":
                return size_x + "%";
            case "width_height_size_control":
                return `${size_x}% ${size_y}%`;
        }
    }

    //parse a background repeat CSS property into separated values.
    parseBackgroundRepeat(bgnd_repeat) {
        let repeat_x_bool, repeat_y_bool;
        switch (bgnd_repeat) {
            case "repeat":
                repeat_x_bool = repeat_y_bool = true;
                break;
            case "repeat-x":
                repeat_x_bool = true;
                repeat_y_bool = false;
                break;
            case "repeat-y":
                repeat_x_bool = false;
                repeat_y_bool = true;
                break;
            case "no-repeat":
            default:
                repeat_x_bool = repeat_y_bool = false;
                break;
        }

        return {
            repeat_x: repeat_x_bool,
            repeat_y: repeat_y_bool,
        }
    }

    //Craft a background repeat property from given information.
    stringifyBackgroundRepeat(repeat_x, repeat_y) {
        if (repeat_x && repeat_y) return "repeat";
        else if (repeat_x && !repeat_y) return "repeat-x";
        else if (!repeat_x && repeat_y) return "repeat-y";
        else if (!repeat_x && !repeat_y) return "no-repeat";
    }

    /**@override */
    hasValidValue(value) {
        if (utils.IsUndefined(value)) return false;
        if (!utils.IsAnObject(value)) return false;

        if (utils.IsUndefined(value.type)
            || utils.IsUndefined(value.last_color)
            || utils.IsUndefined(value.last_gradient)
            || utils.IsUndefined(value.last_image)
            || utils.IsUndefined(value.size)
            || utils.IsUndefined(value.repeat))
            return false;
        
        //values exist
        let valid_types = ["color","gradient","image"]
        let valid_type = utils.IsAString(value.type) && valid_types.includes(value.type);
        
        let valid_color = utils.IsAString(value.last_color);
        let valid_gradient = utils.IsAString(value.last_gradient);
        let valid_image = utils.IsAString(value.last_image);
        let valid_size = utils.IsAString(value.size);
        
        let valid_repeat_values = ["no-repeat","repeat","repeat-x","repeat-y"];
        let valid_repeat = utils.IsAString(value.repeat) && valid_repeat_values.includes(value.repeat);

        return valid_type && valid_color && valid_gradient && valid_image && valid_size && valid_repeat;
    }
}










//#################
// TEXT PROPERTIES
//#################


//text type property, sets if the object uses user text or time generated text.
export class VPTextType extends VisualObjectProperty {
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "text_type", DEFAULTS.TEXT_TYPE);
    
        this._allowed_values = ["any","time"];
        this.verify(); //reverify as the first verification ignored the line below.

        //create associated UI
        this._ui_parameter = new ui_components.UIParameterChoice(
            this._visual_object.parameter_rack,
            "Text type",
            this._allowed_values,
            this.getCurrentValue(),
            () => {
                this.setSaveUISafe(this._ui_parameter.value);
            }
        );
        //this.parameters.type.help_string = help.parameter.object.text.type;
    }

    /**
     * @override
     */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAString(value) && this._allowed_values.includes(value));
    }
}



// text content property, text to be displayed for the object.
export class VPTextContent extends VisualObjectProperty {
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "text_content", DEFAULTS.TEXT_CONTENT);
        
        // create associated UI
        
        this._ui_parameter = new ui_components.UIParameterString(
            this._visual_object.parameter_rack,
            "Displayed text",
            this.getCurrentValue(),
            () => {
                this.setSaveUISafe(this._ui_parameter.value);
            }
        );
        // this.parameters.text.help_string = help.parameter.object.text.text_content;
    }

    /**
     * @override
     */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAString(value) && !(value.indexOf("\\") > -1));
    }
}



// Visual property to set the font size of a text based object
export class VPFontSize extends VisualObjectProperty {
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "font_size", DEFAULTS.FONT_SIZE);

        //Create associated UI
        this._ui_parameter = new ui_components.UIParameterNumInputList(
            this._visual_object.parameter_rack,
            "",
            false,
            [{
                title: "Font size :",
                unit: "px",
                default_value: this.getCurrentValue(),
                min: 0,
                step: 1,
                callback: () => {
                    this.setSaveUISafe(parseInt(this._ui_parameter.value(0)));
                }
            }]
        );
        // this.parameters.font_size.help_string = help.parameter.object.text.font_size;
    }

    /**
     * @override
     */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAnInt(value) && value >= 0);
    }
}



// Visual property for changing text formatting and decoration,
// like bold, italic or underline.
export class VPTextDecoration extends VisualObjectProperty {
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "text_decoration", DEFAULTS.TEXT_DECORATION);
    
        //create associated UI
        this._ui_parameter = new ui_components.UIParameterButtonGrid(
            this._visual_object.parameter_rack,
            "Text decoration",
            1, 5,
            [[
                {
                    innerHTML: '<i class="ri-italic"></i>',
                    callback: (bool) => {
                        this.setSaveUISafe({
                            italic: bool,
                            bold: this.getCurrentValue().bold,
                            underline: this.getCurrentValue().underline,
                            overline: this.getCurrentValue().overline,
                            line_through: this.getCurrentValue().line_through,
                        });
                    }
                }, {
                    innerHTML: '<i class="ri-bold"></i>',
                    callback: (bool) => {
                        this.setSaveUISafe({
                            italic: this.getCurrentValue().italic,
                            bold: bool,
                            underline: this.getCurrentValue().underline,
                            overline: this.getCurrentValue().overline,
                            line_through: this.getCurrentValue().line_through,
                        });
                    }
                }, {
                    innerHTML: '<i class="ri-underline"></i>',
                    callback: (bool) => {
                        this.setSaveUISafe({
                            italic: this.getCurrentValue().italic,
                            bold: this.getCurrentValue().bold,
                            underline: bool,
                            overline: this.getCurrentValue().overline,
                            line_through: this.getCurrentValue().line_through,
                        });
                    }
                }, {
                    innerHTML: '<span style="text-decoration: overline">O</span>',
                    callback: (bool) => {
                        this.setSaveUISafe({
                            italic: this.getCurrentValue().italic,
                            bold: this.getCurrentValue().bold,
                            underline: this.getCurrentValue().underline,
                            overline: bool,
                            line_through: this.getCurrentValue().line_through,
                        });
                    }
                }, {
                    innerHTML: '<i class="ri-strikethrough"></i>',
                    callback: (bool) => {
                        this.setSaveUISafe({
                            italic: this.getCurrentValue().italic,
                            bold: this.getCurrentValue().bold,
                            underline: this.getCurrentValue().underline,
                            overline: this.getCurrentValue().overline,
                            line_through: bool,
                        });
                    }
                }
            ]], true);
        if (this.getCurrentValue().italic) this._ui_parameter.toggle(0,0);
        if (this.getCurrentValue().bold) this._ui_parameter.toggle(0,1);
        if (this.getCurrentValue().underline) this._ui_parameter.toggle(0,2);
        if (this.getCurrentValue().overline) this._ui_parameter.toggle(0,3);
        if (this.getCurrentValue().line_through) this._ui_parameter.toggle(0,4);
        // this.parameters.decoration.help_string = help.parameter.object.text.decoration;
    }

    /**
     * @override
     */
    hasValidValue(value) {
        if (utils.IsUndefined(value) || !utils.IsAnObject(value)) return false;

        let all_defined = true;
        let all_valid = true;
        let count = 0;

        //test values, count them
        for (const bool in value) {
            if (Object.hasOwnProperty.call(value, bool)) {
                const bool_value = value[bool];
                if (utils.IsUndefined(bool_value)) all_defined = false;
                if (!utils.IsABoolean(bool_value)) all_valid = false;
                count++;    
            }
        }
        let valid_value = all_defined && all_valid && (count = 5);
        return valid_value;
    }
}



// visual property for positioning text in its container
export class VPTextAlign extends VisualObjectProperty {
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "text_align", DEFAULTS.TEXT_ALIGN);

        this._allowed_values = ["left","center","right"];
        this.verify(); //reverify as the first verification ignored the line below.

        //create associated UI
        this._ui_parameter = new ui_components.UIParameterChoice(
            this._visual_object.parameter_rack,
            "Text align",
            this._allowed_values,
            this.getCurrentValue().horizontal,
            () => {
                this.setSaveUISafe({
                    horizontal: this._ui_parameter.value,
                    vertical: this.getCurrentValue().vertical,
                });
            }
        );
        // this.parameters.text_align.help_string = help.parameter.object.text.text_align;
    }

    /**
     * @override
     */
    hasValidValue(value) {
        if (utils.IsUndefined(value) || !utils.IsAnObject(value)) return false;

        return (utils.IsAString(value.horizontal) && this._allowed_values.includes(value.horizontal));
    }
}



// Visual property for manipulating css text-shadow
export class VPTextShadow extends VisualObjectProperty {
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "text_shadow", DEFAULTS.TEXT_SHADOW);
        
        // create associated UI
        this._ui_parameter = new ui_components.UIParameterString(
            this._visual_object.parameter_rack,
            "Text Shadow (CSS)",
            this.getCurrentValue(),
            () => {
                this.setSaveUISafe(this._ui_parameter.value);
            }
        );
        // this.parameters.text_shadow.help_string = help.parameter.object.general.shadow;
    }

    /**
     * @override
     */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAString(value));
    }
}











//##################
// TIMER PROPERTIES
//##################

//Visual property to define spacing between the timer content and its border.
export class VPTimerInnerSpacing extends VisualObjectProperty {
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "timer_inner_spacing", DEFAULTS.TIMER_INNER_SPACING);

        //create associated UI
        this._ui_parameter = new ui_components.UIParameterNumInputList(
            this._visual_object.parameter_rack,
            "",
            false,
            [{
                title: "Timer inner spacing :",
                unit: "px",
                default_value: this.getCurrentValue(),
                min: 0,
                step: 1,
                callback: () => {
                    this.setSaveUISafe(parseInt(this._ui_parameter.value(0)));
                }
            }]
        );
        // this.parameters.border_to_bar_space.help_string = help.parameter.object.timer.space_between;
    }

    /**
     * @override
     */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAnInt(value) && value >= 0);
    }    
}



//visual property to define the thickness of the border of a timer, or of the line of the timer
export class VPBorderThickness extends VisualObjectProperty {
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "border_thickness", DEFAULTS.BORDER_THICKNESS);

        //create associated UI
        this._ui_parameter = new ui_components.UIParameterNumInputList(
            this._visual_object.parameter_rack,
            "",
            false,
            [{
                title: "Border thickness :",
                unit: "px",
                default_value: this.getCurrentValue(),
                min: 0,
                step: 1,
                callback: () => {
                    this.setSaveUISafe(parseInt(this._ui_parameter.value(0)))
                }
            }]
        );
        // this.parameters.border_thickness.help_string = help.parameter.object.timer.border_thickness;
    }

    /**
     * @override
     */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAnInt(value) && value >= 0);
    }
}











//##########################
// PARTICLE FLOW PROPERTIES
//##########################

//property to define the range in which to pick a radius for a particle, using an array of 2 values.
export class VPParticleRadiusRange extends VisualObjectProperty {
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "particle_radius_range", DEFAULTS.PARTICLE_RADIUS_RANGE);

        //create associated UI
        this._ui_parameter = new ui_components.UIParameterNumInputList(
            this._visual_object.parameter_rack,
            "Particle size range",
            true,
            [{
                title: "Min :",
                unit: "px",
                default_value: this.getCurrentValue()[0],
                min: 1,
                step: 1,
                callback: () => {
                    this.setSaveUISafe([
                        parseInt(this._ui_parameter.value(0)),
                        parseInt(this._ui_parameter.value(1))
                    ]);
                }
            },
            {
                title: "Max :",
                unit: "px",
                default_value: this.getCurrentValue()[1],
                min: 1,
                step: 1,
                callback: () => {
                    this.setSaveUISafe([
                        parseInt(this._ui_parameter.value(0)),
                        parseInt(this._ui_parameter.value(1))
                    ]);
                }
            }]
        );
        // this.parameters.particle_radius_range.help_string = help.parameter.object.particles.ptcl_size;
    }

    /**@override */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAnArray(value) && value.length === 2 && utils.IsAnInt(value[0]) && utils.IsAnInt(value[1]));
    }
}



//property to set the global flow type (behaviour)
export class VPFlowType extends VisualObjectProperty {
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "flow_type", DEFAULTS.FLOW_TYPE);

        this._allowed_values = ["radial","directional"];
        this.verify(); //reverify as the first verification ignored the line below.

        //create associated UI
        this._ui_parameter = new ui_components.UIParameterChoice(
            this._visual_object.parameter_rack,
            "Type",
            this._allowed_values,
            this.getCurrentValue(),
            () => {
                this.setSaveUISafe(this._ui_parameter.value);
            }
        );
        //HELP TODO
    }

    /**@override */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAString(value) && this._allowed_values.includes(value));
    }
}



//property to set the coordinates of spawning for radial particle flows
export class VPFlowCenter extends VisualObjectProperty {
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "flow_center", DEFAULTS.FLOW_CENTER);

        //create associated UI
        this._ui_parameter = new ui_components.UIParameterNumInputList(
            this._visual_object.parameter_rack,
            "Center position (radial)",
            true,
            [{
                title: "X :",
                unit: "px",
                default_value: this.getCurrentValue().x,
                step: 1,
                callback: () => {
                    this.setSaveUISafe({
                        x: parseInt(this._ui_parameter.value(0)),
                        y: parseInt(this._ui_parameter.value(1)),
                    });
                }
            },
            {
                title: "Y :",
                unit: "px",
                default_value: this.getCurrentValue().y,
                step: 1,
                callback: () => {
                    this.setSaveUISafe({
                        x: parseInt(this._ui_parameter.value(0)),
                        y: parseInt(this._ui_parameter.value(1)),
                    });
                }
            }]
        );
        // this.parameters.center.help_string = help.parameter.object.particles.center_pos;
    }

    /**@override */
    hasValidValue(value) {
        let keys_defined = !utils.IsUndefined(value.x) && !utils.IsUndefined(value.y);
        let keys_are_int = utils.IsAnInt(value.x) && utils.IsAnInt(value.y);
        return (!utils.IsUndefined(value) && utils.IsAnObject(value) && keys_defined && keys_are_int);
    }
}



// property to define in which direction particles go
export class VPFlowDirection extends VisualObjectProperty {
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "flow_direction", DEFAULTS.FLOW_DIRECTION);

        //create associated UI
        this._ui_parameter = new ui_components.UIParameterNumInputList(
            this._visual_object.parameter_rack,
            "",
            false,
            [{
                title: "Direction (directional) :",
                unit: "°",
                default_value: this.getCurrentValue(),
                min: 0,
                max: 360,
                step: 1,
                callback: () => {
                    this.setSaveUISafe(parseInt(this._ui_parameter.value(0)));
                }
            }]
        );
        // this.parameters.direction.help_string = help.parameter.object.particles.direction;
    }

    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAnInt(value) && value >= 0 && value <= 360);
    }
}



// Visual property for defining the spawn probability of a particle
export class VPParticleSpawnProbability extends VisualObjectProperty {
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "particle_spawn_probability", DEFAULTS.PARTICLE_SPAWN_PROBABILITY);

        //create associated UI
        this._ui_parameter = new ui_components.UIParameterNumInputList(
            this._visual_object.parameter_rack,
            "",
            false,
            [{
                title: "Spawn probability :",
                unit: "",
                default_value: this.getCurrentValue(),
                min: 0,
                max: 1,
                step: 0.01,
                callback: () => {
                    this.setSaveUISafe(parseFloat(this._ui_parameter.value(0)));
                }
            }]
        );
        // this.parameters.spawn_probability.help_string = help.parameter.object.particles.spawn_probability;
    }

    /**@override */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsANumber(value) && value >= 0 && value <= 1)
    }
}



//Property that defines the spawn tests: how much time the probability is tested.
export class VPParticleSpawnTests extends VisualObjectProperty {
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "particle_spawn_tests", DEFAULTS.PARTICLE_SPAWN_TESTS);

        //create associated UI
        this._ui_parameter = new ui_components.UIParameterNumInputList(
            this._visual_object.parameter_rack,
            "",
            false,
            [{
                title: "Spawn tests per frame :",
                unit: "",
                default_value: this.getCurrentValue(),
                min: 1,
                step: 1,
                callback: () => {
                    this.setSaveUISafe(parseInt(this._ui_parameter.value(0)));
                }
            }]
        );
        // this.parameters.spawn_tests.help_string = help.parameter.object.particles.spawn_tests;
    }

    /**@override */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAnInt(value) && value >= 1);
    }
}
















//#######################
// VISUALIZER PROPERTIES
//#######################

//property that handle the inner radius of a circular visualizer
export class VPVisualizerRadius extends VisualObjectProperty {
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "visualizer-radius", DEFAULTS.VISUALIZER_RADIUS);

        //create associated UI
        this._ui_parameter = new ui_components.UIParameterNumInputList(
            this._visual_object.parameter_rack,
            "",
            false,
            [{
                title: "Radius (circular visualizer) :",
                unit: "px",
                default_value: this.getCurrentValue(),
                min: 0,
                step: 1,
                callback: () => {
                    this.setSaveUISafe(parseInt(this._ui_parameter.value(0)));
                }
            }]
        );
        // this.parameters.radius.help_string = help.parameter.object.visualizer.circular_kind.radius;
    }

    /**@override */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAnInt(value) && value >= 0);
    }
}



//property that defines the number of points used to draw a visualizer (its precision in other words)
export class VPVisualizerPointsCount extends VisualObjectProperty {
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "visualizer_points_count", DEFAULTS.VISUALIZER_POINTS_COUNT);

        //create associated UI
        this._ui_parameter = new ui_components.UIParameterNumInputList(
            this._visual_object.parameter_rack,
            "",
            false,
            [{
                title: "Points count :",
                unit: "px",
                default_value: this.getCurrentValue(),
                min: 0,
                step: 1,
                callback: () => {
                    this.setSaveUISafe(parseInt(this._ui_parameter.value(0)));
                }
            }]
        );
        // this.parameters.points_count.help_string = help.parameter.object.visualizer.general.points_count;
    }

    /**@override */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAnInt(value) && value >= 0);
    }
}



export class VPVisualizerAnalyserRange extends VisualObjectProperty {
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "visualizer_analyzer_range", DEFAULTS.VISUALIZER_ANALYZER_RANGE);
    
        // create associated UI
        this._ui_parameter = new ui_components.UIParameterNumInputList(
            this._visual_object.parameter_rack,
            "Analyser Range",
            true,
            [{
                title: "Min :",
                unit: "",
                default_value: this.getCurrentValue()[0],
                min: 0,
                max: 1023,
                step: 1,
                callback: () => {
                    this.setSaveUISafe([parseInt(this._ui_parameter.value(0)), parseInt(this._ui_parameter.value(1))]);
                }
            },
            {
                title: "Max :",
                unit: "",
                default_value: this.getCurrentValue()[1],
                min: 0,
                max: 1023,
                step: 1,
                callback: () => {
                    this.setSaveUISafe([parseInt(this._ui_parameter.value(0)), parseInt(this._ui_parameter.value(1))]);
                }
            }]
        );
        // this.parameters.analyser_range.help_string = help.parameter.object.visualizer.general.analyser_range;
    }

    /**@override */
    hasValidValue(value) {
        let is_array = !utils.IsUndefined(value) && utils.IsAnArray(value) && value.length === 2;
        if (!is_array) return false;
        else {
            let are_integers = utils.IsAnInt(value[0]) && utils.IsAnInt(value[1]);
            if (!are_integers) return false;
                else return (value[0] >= 0 && value[0] <= 1023 && value[1] >= 0 && value[1] <= 1023);
        }
    }
}



//property to choose the visualization smoothing type from one frame to another
export class VPVisualizationSmoothingType extends VisualObjectProperty {
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "visualization_smoothing_type", DEFAULTS.VISUALIZATION_SMOOTHING_TYPE);

        this._allowed_values = ["proportional_decrease","linear_decrease","average"];
        this.verify(); //reverify as the first verification ignored the line below.

        //create associated UI
        this._ui_parameter = new ui_components.UIParameterChoice(
            this._visual_object.parameter_rack,
            "Visualization smoothing type",
            this._allowed_values,
            this.getCurrentValue(),
            () => {
                this.setSaveUISafe(this._ui_parameter.value);
            }
        );
        // this.parameters.visualization_smoothing_type.help_string = help.parameter.object.visualizer.general.visualization_smoothing.type;
    }

    /**@override */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAString(value) && this._allowed_values.includes(value));
    }
}



//property to choose the factor of visualization smoothing, the value influences the mathematical behaviour.
export class VPVisualizationSmoothingFactor extends VisualObjectProperty {
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "visualization_smoothing_factor", DEFAULTS.VISUALIZATION_SMOOTHING_FACTOR);
    
        // create associated UI
        this._ui_parameter = new ui_components.UIParameterNumInputList(
            this._visual_object.parameter_rack,
            "",
            false,
            [{
                title: "Visualization smoothing factor :",
                unit: "",
                default_value: this.getCurrentValue(),
                min: 0,
                max: 1,
                step: 0.01,
                callback: () => {
                    this.setSaveUISafe(parseFloat(this._ui_parameter.value(0)));
                }
            }]
        );
        // this.parameters.visualization_smoothing_factor.help_string = help.parameter.object.visualizer.general.visualization_smoothing.factor;
    }

    /**@override */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsANumber(value) && value >= 0);
    }
}



//property to define the thickness of bars of a bar visualizer (how large a bar is).
export class VPVisualizerBarThickness extends VisualObjectProperty {
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "visualizer_bar_thickness", DEFAULTS.VISUALIZER_BAR_THICKNESS);
         
        // create associated UI
        this._ui_parameter = new ui_components.UIParameterNumInputList(
            this._visual_object.parameter_rack,
            "",
            false,
            [{
                title: "Bar thickness :",
                unit: "",
                default_value: this.getCurrentValue(),
                min: 0,
                step: 1,
                callback: () => {
                    this.setSaveUISafe(parseInt(this._ui_parameter.value(0)));
                }
            }]
        );
        // this.parameters.bar_thickness.help_string = help.parameter.object.visualizer.bar_kind.bar_thickness;
    }

    /**@override */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAnInt(value) && value >= 0);
    }
}
