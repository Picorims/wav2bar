//MIT License - Copyright (c) 2020-2021 Picorims

import * as object from "./visual_object.js";
import * as utils from "../utils/utils.js";
import * as ui_components from "../ui_components/ui_components.js";

const DEFAULTS = {
    LAYER: 0,
    COORDINATES: {x: 0, y: 0},
    SIZE: {width: 0, height: 0},
    ROTATION: 0,
    TEXT_TYPE: "any",
    TEXT_CONTENT: "",
    FONT_SIZE: 20,
    COLOR: "#ffffff",
}

//abstract class to manipulate a property of a VisualObject
//stored in the save at the root of the object.
export class VisualObjectProperty {
    constructor(save_handler, visual_object, property_name, default_value) {
        if (this.constructor === VisualObjectProperty) throw new SyntaxError("VisualObjectProperty is an abstract class.");

        this._save_handler = save_handler;
        /** @type {object.VisualObject} */
        this._visual_object = visual_object;
        //name in the save, name used by the object for data access.
        this._property_name = property_name;
        this._default_value = default_value;
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
    hasValidValue(value) {
        throw new Error("hasValidValue must be implemented in a VisualObject.");
    }
}



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
                this.setSaveUISafe(this._ui_parameter.value);
                this._visual_object.parameter_rack.rename(this.getCurrentValue());
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



//text type property, sets if the object uses user text or time generated text.
export class VPTextType extends VisualObjectProperty {
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "text_type", DEFAULTS.TEXT_TYPE);
    
        this._allowed_values = ["any","time"];

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



// 
export class VPColor extends VisualObjectProperty {
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "color", DEFAULTS.COLOR);

        //create associated UI
        this._ui_parameter = new imports.ui_components.UIParameterColor(
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