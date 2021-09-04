//MIT License - Copyright (c) 2020-2021 Picorims

import * as object from "./visual_object.js";
import * as utils from "../utils/utils.js";
import * as ui_components from "../ui_components/ui_components.js";

const DEFAULTS = {
    LAYER: 0,
    COORDINATES: {x: 0, y: 0},
    SIZE: {width: 400, height: 100},
    ROTATION: 0,
    SVG_FILTER: "",

    COLOR: "#ffffff",
    BORDER_RADIUS: "",
    BOX_SHADOW: "",

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
        this._ui_parameter = new imports.ui_components.UIParameterString(
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
        this._ui_parameter = new imports.ui_components.UIParameterString(
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
        
        this._ui_parameter = new imports.ui_components.UIParameterString(
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