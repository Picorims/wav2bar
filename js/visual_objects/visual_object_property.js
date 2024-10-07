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

import * as object from "./visual_object.js";
import * as utils from "../utils/utils.js";
import * as ui_components from "../ui_components/ui_components.js";
import help from "../../assets/help/help.json" assert {type: "json"}; //not an error, chromium only feature.

/** @type {Object} default values for properties. */
const DEFAULTS = {
    LAYER: 0,
    COORDINATES: {x: 0, y: 0},
    SIZE: {
        "any": {width: 400, height: 100},
        "shape": {width: 400, height: 300},
        "particle_flow": {width: 400, height: 400},
        "timer_straight_bar": {width: 400, height: 20},
        "timer_straight_line_point": {width: 400, height: 14},
        "visualizer_circular_bar": {width: 400, height: 400},
    },
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
    FONT_FAMILY: "verdana",
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


/**
 * Abstract class to manipulate a property of a VisualObject
 * stored in the save at the root of the object.
 * 
 * @abstract
 * @mixes utils.EventMixin
 */
export class VisualObjectProperty {
    /**
     * Creates an instance of VisualObjectProperty.
     * @param {SaveHandler} save_handler The SaveHandler to read and write from.
     * @param {object.VisualObject} visual_object The VisualObject that it manipulates.
     * @param {String} property_name The name of the property in the save.
     * @param {*} default_value The default assigned value.
     * @memberof VisualObjectProperty
     */
    constructor(save_handler, visual_object, property_name) {
        if (this.constructor === VisualObjectProperty) throw new SyntaxError("VisualObjectProperty is an abstract class.");

        //implements mixin
        Object.assign(VisualObjectProperty.prototype, utils.EventMixin);
        this._setupEventMixin([
            "value_changed",
        ]);

        this._save_handler = save_handler;
        /** @type {object.VisualObject} */
        this._visual_object = visual_object;
        //name in the save, name used by the object for data access.
        this._property_name = property_name;
        this._default_value = this.getDefaultValue();
        this._allowed_values = null; //used by some properties with a defined list of values.
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


    /**
     * Get the default value of the VisualObjectProperty.
     *
     * @abstract
     * @return {*}
     * @memberof VisualObjectProperty
     */
    getDefaultValue() {
        throw new Error("getDefaultValue must be implemented in a VisualObjectProperty.");
    }


    /**
     * Returns the current stored value in save for the property.
     *
     * @return {*} 
     * @memberof VisualObjectProperty
     */
    getCurrentValue() {
        return this._save_handler.getVisualObjectData(this._visual_object.id)[this._property_name];
    }

    
    /**
     * Registers or changes a value in the save for that property
     *
     * @param {*} value
     * @memberof VisualObjectProperty
     */
    setSave(value) {
        let data = {};
        data[this._property_name] = value;
        this._save_handler.mergeVisualObjectData(this._visual_object.id, data);
        this.triggerEvent("value_changed", value);
    }


    /**
     * Registers or Changes a value in the save after verifying it.
     * This is designed mainly for UI interaction but can also be used
     * for protected value assignation (with verification, and fail when
     * the value is not valid).
     *
     * @param {*} value
     * @memberof VisualObjectProperty
     */
    setSaveUISafe(value) {
        if (!this.hasValidValue(value)) {
            utils.CustomLog("warn", `${this.constructor.name}: Ignored invalid value from user interface (${value}).`);
        } else {
            this.setSave(value);
        }
    }


    /**
     * Verifies the value and overwrite it if it is not valid.
     *
     * @memberof VisualObjectProperty
     */
    verify() {
        let value = this.getCurrentValue();
        if (utils.IsUndefined(value)) throw new Error("Can't verify a value if it doesn't exist!");
        if (!this.hasValidValue(value)) {
            utils.CustomLog("warn", `${this._visual_object.constructor.name} ${this._visual_object.id}, ${this.constructor.name} (property "${this._property_name}"): Invalid value (${value})! Set to ${this._default_value}.`);
            this.setSave(this._default_value);
        }
    }


    /**
     * returns if a value is valid.
     * 
     * @example
     * - number: match ranges,
     * - string: match regexp,
     * - etc.
     * 
     * @abstract
     * @param {*} value
     * @return {Boolean} is valid
     * @memberof VisualObjectProperty
     */
    hasValidValue(value) {
        throw new Error("hasValidValue must be implemented in a VisualObjectProperty.");
    }
}














//#################################
// SHARED PROPERTIES (all objects)
//#################################


/**
 * name property, define object's display name.
 *
 * @export
 * @class VPName
 * @extends {VisualObjectProperty}
 */
export class VPName extends VisualObjectProperty {
    /**
     * Creates an instance of VPName.
     * @param {SaveHandler} save_handler The SaveHandler to read and write from.
     * @param {object.VisualObject} visual_object The VisualObject that it manipulates.
     * @memberof VPName
     */
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "name");

        //create associated ui
        if (!this._save_handler.owner_project.export_mode) {
            this._ui_parameter = new ui_components.UIParameterString(
                this._visual_object.parameter_rack,
                "Name",
                this.getCurrentValue(),
                () => {
                    this.rename(this._ui_parameter.value);
                }
            );
            this._ui_parameter.help_string = help.parameter.object.general.name;
            this._visual_object.parameter_rack.rename(this.getCurrentValue());    
        }
    }

    /**
     * Get the default value of the visual object property.
     * If it is undefined, assign a value.
     *
     * @memberof VPName
     * @override
     * @return {String}
     */
    getDefaultValue() {
        if (this._default_value) return this._default_value;
        else {
            this._default_value = `object${utils.RandomInt(0, 999999)}`;
            return this._default_value;
        }
    }

    /**
     * The value is valid if not undefined, and if it is a non empty string.
     *
     * @param {*} value
     * @return {Boolean} is valid
     * @memberof VPName
     * @override
     */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAString(value) && value !== "");
    }

    /**
     * Renames the object with the new named passed in argument.
     *
     * @param {*} name The new object name
     * @memberof VPName
     */
    rename(name) {
        this.setSaveUISafe(name);
        this._visual_object.parameter_rack.rename(name);
    };
}



/**
 * layer property, defines the order of display of objects.
 *
 * @export
 * @class VPLayer
 * @extends {VisualObjectProperty}
 */
export class VPLayer extends VisualObjectProperty {
    /**
     * Creates an instance of VPLayer.
     * @param {SaveHandler} save_handler The SaveHandler to read and write from.
     * @param {object.VisualObject} visual_object The VisualObject that it manipulates.
     * @memberof VPLayer
     */
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "layer");

        //create associated ui
        if (!this._save_handler.owner_project.export_mode) {
            this._ui_parameter = new ui_components.UIParameterNumInputList(
                this._visual_object.parameter_rack,
                "",
                false,
                [{
                    title: "Layer",
                    unit: "",
                    default_value: this.getCurrentValue(),
                    min: 0,
                    step: 1,
                    callback: () => {
                        this.setSaveUISafe(parseInt(this._ui_parameter.value(0)));
                    }
                }]
            );
            this._ui_parameter.help_string = help.parameter.object.general.layer;
        }
    }

    /**
     * Get the default value of the visual object property.
     * If it is undefined, assign a value.
     *
     * @memberof VPLayer
     * @override
     * @return {Integer}
     */
    getDefaultValue() {
        if (this._default_value) return this._default_value;
        else {
            this._default_value = DEFAULTS.LAYER;
            return this._default_value;
        };
    }

    /**
     * The value is valid if it is an integer superior or equal to 0.
     *
     * @override
     * @param {*} value
     * @return {Boolean} is valid
     * @memberof VPLayer
     */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAnInt(value) && value >= 0);
    }
}



/**
 * coordinates property, defines an object's position.
 * the button grid needs a VPSize to exist on the object
 * in order to work properly.
 * 
 * @export
 * @class VPCoordinates
 * @extends {VisualObjectProperty}
 */
export class VPCoordinates extends VisualObjectProperty {
    /**
     * Creates an instance of VPCoordinates.
     * @param {SaveHandler} save_handler The SaveHandler to read and write from.
     * @param {object.VisualObject} visual_object The VisualObject that it manipulates.
     * @memberof VPCoordinates
     */
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "coordinates");

        //create associated ui
        if (!this._save_handler.owner_project.export_mode) {
            this._ui_parameter = new ui_components.UIParameterInputsAndButtonGrid(
                this._visual_object.parameter_rack,
                "",
                false,
                [{
                    title: "X",
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
                    title: "Y",
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
            this._ui_parameter.help_string = help.parameter.object.general.pos;
        }
    }

    /**
     * Get the default value of the visual object property.
     * If it is undefined, assign a value.
     *
     * @memberof VPCoordinates
     * @override
     * @return {Object}
     */
    getDefaultValue() {
        if (this._default_value) return this._default_value;
        else {
            this._default_value = JSON.parse(JSON.stringify(DEFAULTS.COORDINATES));
            return this._default_value;
        };
    }

    /**
     * The value is valid if it is an object with an "x" integer and a "y" integer.
     *
     * @override
     * @param {*} value
     * @return {Boolean} is valid
     * @memberof VPCoordinates
     */
    hasValidValue(value) {
        return (!utils.IsUndefined(value.x) && !utils.IsUndefined(value.y) && utils.IsAnInt(value.x) && utils.IsAnInt(value.y));
    }
}



/**
 * size property, defines an object's size.
 *
 * @export
 * @class VPSize
 * @extends {VisualObjectProperty}
 */
export class VPSize extends VisualObjectProperty {
    /**
     * Creates an instance of VPSize.
     * @param {SaveHandler} save_handler The SaveHandler to read and write from.
     * @param {object.VisualObject} visual_object The VisualObject that it manipulates.
     * @memberof VPSize
     */
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "size");
    
        //create associated ui
        if (!this._save_handler.owner_project.export_mode) {
            this._ui_parameter = new ui_components.UIParameterInputsAndButtonGrid(
                this._visual_object.parameter_rack,
                "",
                false,
                [{
                    title: "Width",
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
                    title: "Height",
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
            this._ui_parameter.help_string = help.parameter.object.general.size;
        }
    }

    /**
     * Get the default value of the visual object property.
     * If it is undefined, assign a value.
     *
     * @memberof VPSize
     * @override
     */
    getDefaultValue() {
        if (this._default_value) return this._default_value;
        else {
            this._default_value = JSON.parse(JSON.stringify(DEFAULTS.SIZE["any"]));
            return this._default_value;
        }

        //TODO: handle types
        // if (utils.IsUndefined(DEFAULTS.SIZE[visual_object.type])) {
        //     return JSON.parse(JSON.stringify(DEFAULTS.SIZE["any"]));
        // } else {
        //     return JSON.parse(JSON.stringify(DEFAULTS.SIZE[visual_object.type]));
        // }
    }

    /**
     * The value is valid if it is an object with "width" and "height" being integers superior or equal to 0.
     *
     * @override
     * @param {*} value
     * @return {Boolean} is valid
     * @memberof VPSize
     */
    hasValidValue(value) {
        return (!utils.IsUndefined(value.width) && !utils.IsUndefined(value.height) && utils.IsAnInt(value.width) && utils.IsAnInt(value.height) && value.width >= 0 && value.height >= 0);
    }
}




/**
 * rotation property, sets the rotation of the object
 *
 * @export
 * @class VPRotation
 * @extends {VisualObjectProperty}
 */
export class VPRotation extends VisualObjectProperty {
    /**
     * Creates an instance of VPRotation.
     * @param {SaveHandler} save_handler The SaveHandler to read and write from.
     * @param {object.VisualObject} visual_object The VisualObject that it manipulates.
     * @memberof VPRotation
     */
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "rotation");
        
        //create associated UI
        if (!this._save_handler.owner_project.export_mode) {
            this._ui_parameter = new ui_components.UIParameterNumInputList(
                this._visual_object.parameter_rack,
                "",
                false,
                [{
                    title: "Rotation (degrees)",
                    unit: "°",
                    default_value: this.getCurrentValue(),
                    min: 0,
                    step: 1,
                    callback: () => {
                        this.setSaveUISafe(parseInt(this._ui_parameter.value(0)));
                    }
                }]
            );
            this._ui_parameter.help_string = help.parameter.object.general.rotation;
        }
    }

    /**
     * Get the default value of the visual object property.
     * If it is undefined, assign a value.
     *
     * @memberof VPRotation
     * @override
     * @return {Number}
     */
    getDefaultValue() {
        if (this._default_value) return this._default_value;
        else {
            this._default_value = DEFAULTS.ROTATION;
            return this._default_value;
        }
    }

    /**
     * The value is valid if it is an integer.
     * 
     * @override
     * @param {*} value
     * @return {Boolean} is valid
     * @memberof VPRotation
     */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAnInt(value));
    }
}



/**
 * Visual property for defining an svg filter applied on an object
 *
 * @export
 * @class VPSVGFilter
 * @extends {VisualObjectProperty}
 */
export class VPSVGFilter extends VisualObjectProperty {
    /**
     * Creates an instance of VPSVGFilter.
     * @param {SaveHandler} save_handler The SaveHandler to read and write from.
     * @param {object.VisualObject} visual_object The VisualObject that it manipulates.
     * @memberof VPSVGFilter
     */
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "svg_filter");

        // create associated UI
        if (!this._save_handler.owner_project.export_mode) {
            this._ui_parameter = new ui_components.UIParameterString(
                this._visual_object.parameter_rack,
                "SVG Filters (advanced, read help)",
                this.getCurrentValue(),
                () => {
                    this.setSaveUISafe(this._ui_parameter.value);
                }
            );
            this._ui_parameter.help_string = help.parameter.object.general.svg_filters;
        }
    }

    /**
     * Get the default value of the visual object property.
     * If it is undefined, assign a value.
     *
     * @memberof VPSVGFilter
     * @override
     * @return {String}
     */
    getDefaultValue() {
        if (this._default_value) return this._default_value;
        else {
            this._default_value = DEFAULTS.SVG_FILTER;
            return this._default_value;
        };
    }

    /**
     * The value is valid if it doesn't contain a <script> tag, includes a <filter> tag and is a string.
     * @override
     * @param {*} value
     * @return {Boolean} is valid
     * @memberof VPSVGFilter
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

/**
 * Visual property for changing the overall color of an object.
 *
 * @export
 * @class VPColor
 * @extends {VisualObjectProperty}
 */
export class VPColor extends VisualObjectProperty {
    /**
     * Creates an instance of VPColor.
     * @param {SaveHandler} save_handler The SaveHandler to read and write from.
     * @param {object.VisualObject} visual_object The VisualObject that it manipulates.
     * @memberof VPColor
     */
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "color");

        //create associated UI
        if (!this._save_handler.owner_project.export_mode) {
            this._ui_parameter = new ui_components.UIParameterColor(
                this._visual_object.parameter_rack,
                "Color (hex, rgb, rgba)",
                this.getCurrentValue(),
                () => {
                    this.setSaveUISafe(this._ui_parameter.value);
                }
            );
            this._ui_parameter.help_string = help.parameter.object.general.color;
        }
    }

    
    /**
     * Get the default value of the visual object property.
     * If it is undefined, assign a value.
     *
     * @memberof VPColor
     * @override
     * @return {String}
     */
    getDefaultValue() {
        if (this._default_value) return this._default_value;
        else {
            this._default_value = utils.RandomColor();
            return this._default_value;
        };
    }

    /**
     * The value is valid if it is a string.
     * @override
     * @param {*} value
     * @return {Boolean} is valid
     * @memberof VPColor
     */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAString(value));
    }
}



/**
 * property to control border radius of any HTML object using the CSS syntax
 *
 * @export
 * @class VPBorderRadius
 * @extends {VisualObjectProperty}
 */
export class VPBorderRadius extends VisualObjectProperty {
    /**
     * Creates an instance of VPBorderRadius.
     * @param {SaveHandler} save_handler The SaveHandler to read and write from.
     * @param {object.VisualObject} visual_object The VisualObject that it manipulates.
     * @memberof VPBorderRadius
     */
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "border_radius");

        //create associated UI
        if (!this._save_handler.owner_project.export_mode) {
            this._ui_parameter = new ui_components.UIParameterString(
                this._visual_object.parameter_rack,
                "Border radius (CSS)",
                this.getCurrentValue(),
                () => {
                    this.setSaveUISafe(this._ui_parameter.value)
                }
            );
            this._ui_parameter.help_string = help.parameter.object.general.border_radius;
        }
    }

    /**
     * Get the default value of the visual object property.
     * If it is undefined, assign a value.
     *
     * @memberof VPBorderRadius
     * @override
     * @return {String}
     */
    getDefaultValue() {
        if (this._default_value) return this._default_value;
        else {
            this._default_value = DEFAULTS.BORDER_RADIUS;
            return this._default_value;
        };
    }

    /**
     * The value is valid if it is a string.
     *
     * @override
     * @param {*} value
     * @return {Boolean} is valid
     * @memberof VPBorderRadius
     */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAString(value));
    }    
}



/**
 * property to control box shadow of any HTML object using the CSS syntax
 *
 * @export
 * @class VPBoxShadow
 * @extends {VisualObjectProperty}
 */
export class VPBoxShadow extends VisualObjectProperty {
    /**
     * Creates an instance of VPBoxShadow.
     * @param {SaveHandler} save_handler The SaveHandler to read and write from.
     * @param {object.VisualObject} visual_object The VisualObject that it manipulates.
     * @memberof VPBoxShadow
     */
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "box_shadow");

        //create associated UI
        if (!this._save_handler.owner_project.export_mode) {
            this._ui_parameter = new ui_components.UIParameterString(
                this._visual_object.parameter_rack,
                "Box Shadow (CSS)",
                this.getCurrentValue(),
                () => {
                    this.setSaveUISafe(this._ui_parameter.value)
                }
            );
            this._ui_parameter.help_string = help.parameter.object.general.shadow;
        }
    }

    /**
     * Get the default value of the visual object property.
     * If it is undefined, assign a value.
     *
     * @memberof VPBoxShadow
     * @override
     * @return {String}
     */
    getDefaultValue() {
        if (this._default_value) return this._default_value;
        else {
            this._default_value = DEFAULTS.BOX_SHADOW;
            return this._default_value;
        };
    }

    /**
     * The value is valid if it is a string.
     *
     * @override
     * @param {*} value
     * @return {Boolean} is valid
     * @memberof VPBoxShadow
     */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAString(value));
    }    
}



/**
 * visual property to define a CSS based background. It supports color, gradients, and images.
 *
 * @export
 * @class VPBackground
 * @extends {VisualObjectProperty}
 */
export class VPBackground extends VisualObjectProperty {
    /**
     * Creates an instance of VPBackground.
     * @param {SaveHandler} save_handler The SaveHandler to read and write from.
     * @param {object.VisualObject} visual_object The VisualObject that it manipulates.
     * @memberof VPBackground
     */
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "background");

        //create associated UI
        if (!this._save_handler.owner_project.export_mode) {
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
            this._ui_parameter.help_string = help.parameter.object.shape.bgnd;
        }
    }

    /**
     * Parse a background size CSS property into an object with separate values.
     *
     * @param {*} bgnd_size
     * @return {Object} An object resuming the properties.
     * @memberof VPBackground
     */
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

    /**
     * craft a CSS background size property from given information.
     *
     * @param {String} size_type
     * @param {String} size_x
     * @param {String} size_y
     * @return {String} result
     * @memberof VPBackground
     */
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

    /**
     * parse a background repeat CSS property into separated values.
     *
     * @param {String} bgnd_repeat
     * @return {Object} {repeat_x: string, repeat_y: string}
     * @memberof VPBackground
     */
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

    /**
     * Craft a background repeat property from given information.
     *
     * @param {String} repeat_x
     * @param {String} repeat_y
     * @return {String} result
     * @memberof VPBackground
     */
    stringifyBackgroundRepeat(repeat_x, repeat_y) {
        if (repeat_x && repeat_y) return "repeat";
        else if (repeat_x && !repeat_y) return "repeat-x";
        else if (!repeat_x && repeat_y) return "repeat-y";
        else if (!repeat_x && !repeat_y) return "no-repeat";
    }

    /**
     * Get the default value of the visual object property.
     * If it is undefined, assign a value.
     *
     * @memberof VPBackground
     * @override
     */
    getDefaultValue() {
        if (this._default_value) return this._default_value;
        else {
            this._default_value = JSON.parse(JSON.stringify(DEFAULTS.BACKGROUND));
            this._default_value.last_color = utils.RandomColor();
            return this._default_value;
        };
    }

    /**
     * The value is valid if it is an object where all nodes are string.
     * - type: "color", "gradient", "image"
     * - last_color: any string
     * - last_gradient: any string
     * - last_image: any string
     * - size: any string
     * - repeat: "no-repeat", "repeat", "repeat-x", "repeat-y"
     *
     * @override
     * @param {*} value
     * @return {Boolean} is valid
     * @memberof VPBackground
     */
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


/**
 * text type property, sets if the object uses user text or time generated text.
 *
 * @export
 * @class VPTextType
 * @extends {VisualObjectProperty}
 */
export class VPTextType extends VisualObjectProperty {
    /**
     * Creates an instance of VPTextType.
     * @param {SaveHandler} save_handler The SaveHandler to read and write from.
     * @param {object.VisualObject} visual_object The VisualObject that it manipulates.
     * @memberof VPTextType
     */
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "text_type");
    
        this._allowed_values = ["any","time"];
        this.verify(); //reverify as the first verification ignored the line below.

        //create associated UI
        if (!this._save_handler.owner_project.export_mode) {
            this._ui_parameter = new ui_components.UIParameterChoice(
                this._visual_object.parameter_rack,
                "Text type",
                this._allowed_values,
                this.getCurrentValue(),
                () => {
                    this.setSaveUISafe(this._ui_parameter.value);
                }
            );
            this._ui_parameter.help_string = help.parameter.object.text.type;
        }
    }

    /**
     * Get the default value of the visual object property.
     * If it is undefined, assign a value.
     *
     * @memberof VPTextType
     * @override
     * @return {String}
     */
    getDefaultValue() {
        if (this._default_value) return this._default_value;
        else {
            this._default_value = DEFAULTS.TEXT_TYPE;
            return this._default_value;
        };
    }

    /**
     * The value is valid if it belongs to the list of allowed values.
     * 
     * @override
     * @param {*} value
     * @return {Boolean} is valid
     * @memberof VPTextType
     */
    hasValidValue(value) {
        //the second undefined for allowed values handles when verify is called when allowed values has not been initialized.
        //There is no way to initialize that subclass property before the call of super() ends.
        //So when undefined, the test ignores such property. This is why reverifying in the constructor is important.
        return (!utils.IsUndefined(value) && utils.IsAString(value) && (utils.IsUndefined(this._allowed_values) || this._allowed_values.includes(value)));
    }
}




/**
 * text content property, text to be displayed for the object.
 *
 * @export
 * @class VPTextContent
 * @extends {VisualObjectProperty}
 */
export class VPTextContent extends VisualObjectProperty {
    /**
     * Creates an instance of VPTextContent.
     * @param {SaveHandler} save_handler The SaveHandler to read and write from.
     * @param {object.VisualObject} visual_object The VisualObject that it manipulates.
     * @memberof VPTextContent
     */
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "text_content");
        
        // create associated UI        
        if (!this._save_handler.owner_project.export_mode) {
            this._ui_parameter = new ui_components.UIParameterString(
                this._visual_object.parameter_rack,
                "Displayed text",
                this.getCurrentValue(),
                () => {
                    this.setSaveUISafe(this._ui_parameter.value);
                }
            );
            this._ui_parameter.help_string = help.parameter.object.text.text_content;
        }
    }
    
    /**
     * Get the default value of the visual object property.
     * If it is undefined, assign a value.
     *
     * @memberof VPTextContent
     * @override
     * @return {String}
     */
    getDefaultValue() {
        if (this._default_value) return this._default_value;
        else {
            this._default_value = DEFAULTS.TEXT_CONTENT;
            return this._default_value;
        };
    }

    /**
     * The value is valid if it is a string with no backslashes.
     *
     * @override
     * @param {*} value
     * @return {Boolean} is valid
     * @memberof VPTextContent
     */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAString(value) && !(value.indexOf("\\") > -1));
    }
}

/**
 * font family property, font family for the object.
 *
 * @export
 * @class VPFontFamily
 * @extends {VisualObjectProperty}
 */
export class VPFontFamily extends VisualObjectProperty {
    /**
     * Creates an instance of VPFontFamily.
     * @param {SaveHandler} save_handler The SaveHandler to read and write from.
     * @param {object.VisualObject} visual_object The VisualObject that it manipulates.
     * @memberof VPFontFamily
     */
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "font_family");
        
        // create associated UI        
        if (!this._save_handler.owner_project.export_mode) {
            this._ui_parameter = new ui_components.UIParameterString(
                this._visual_object.parameter_rack,
                "Font family",
                this.getCurrentValue(),
                () => {
                    this.setSaveUISafe(this._ui_parameter.value);
                }
            );
            this._ui_parameter.help_string = help.parameter.object.text.font_family;
        }
    }
    
    /**
     * Get the default value of the visual object property.
     * If it is undefined, assign a value.
     *
     * @memberof VPFontFamily
     * @override
     * @return {String}
     */
    getDefaultValue() {
        if (this._default_value) return this._default_value;
        else {
            this._default_value = DEFAULTS.FONT_FAMILY;
            return this._default_value;
        };
    }

    /**
     * Only checking for \ like the text_content. Could possibly add validation to state if the font exists. 
     *
     * @override
     * @param {*} value
     * @return {Boolean} is valid
     * @memberof VPFontFamily
     */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAString(value) && !(value.indexOf("\\") > -1));
    }
}

/**
 * Visual property to set the font size of a text based object
 *
 * @export
 * @class VPFontSize
 * @extends {VisualObjectProperty}
 */
export class VPFontSize extends VisualObjectProperty {
    /**
     * Creates an instance of VPFontSize.
     * @param {SaveHandler} save_handler The SaveHandler to read and write from.
     * @param {object.VisualObject} visual_object The VisualObject that it manipulates.
     * @memberof VPFontSize
     */
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "font_size");

        //Create associated UI
        if (!this._save_handler.owner_project.export_mode) {
            this._ui_parameter = new ui_components.UIParameterNumInputList(
                this._visual_object.parameter_rack,
                "",
                false,
                [{
                    title: "Font size",
                    unit: "px",
                    default_value: this.getCurrentValue(),
                    min: 0,
                    step: 1,
                    callback: () => {
                        this.setSaveUISafe(parseInt(this._ui_parameter.value(0)));
                    }
                }]
            );
            this._ui_parameter.help_string = help.parameter.object.text.font_size;
        }
    }

    /**
     * Get the default value of the visual object property.
     * If it is undefined, assign a value.
     *
     * @memberof VPFontSize
     * @override
     * @return {Integer}
     */
    getDefaultValue() {
        if (this._default_value) return this._default_value;
        else {
            this._default_value = DEFAULTS.FONT_SIZE;
            return this._default_value;
        };
    }

    /**
     * The value is valid if it is an integer superior or equal to 0.
     *
     * @override
     * @param {*} value
     * @return {Boolean} is valid
     * @memberof VPFontSize
     */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAnInt(value) && value >= 0);
    }
}



/**
 * Visual property for changing text formatting and decoration,
 * like bold, italic or underline.
 * 
 * @export
 * @class VPTextDecoration
 * @extends {VisualObjectProperty}
 */
export class VPTextDecoration extends VisualObjectProperty {
    /**
     * Creates an instance of VPTextDecoration.
     * @param {SaveHandler} save_handler The SaveHandler to read and write from.
     * @param {object.VisualObject} visual_object The VisualObject that it manipulates.
     * @memberof VPTextDecoration
     */
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "text_decoration");
    
        //create associated UI
        if (!this._save_handler.owner_project.export_mode) {
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
            this._ui_parameter.help_string = help.parameter.object.text.decoration;
        }
    }
    
    /**
     * Get the default value of the visual object property.
     * If it is undefined, assign a value.
     *
     * @memberof VPTextDecoration
     * @override
     * @return {Object}
     */
    getDefaultValue() {
        if (this._default_value) return this._default_value;
        else {
            this._default_value = DEFAULTS.TEXT_DECORATION;
            return this._default_value;
        };
    }

    /**
     * The value is valid if it is an object of n boolean nodes.
     *
     * @override
     * @param {*} value
     * @return {Boolean} is valid
     * @memberof VPTextDecoration
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



/**
 * visual property for positioning text in its container
 *
 * @export
 * @class VPTextAlign
 * @extends {VisualObjectProperty}
 */
export class VPTextAlign extends VisualObjectProperty {
    /**
     * Creates an instance of VPTextAlign.
     * @param {SaveHandler} save_handler The SaveHandler to read and write from.
     * @param {object.VisualObject} visual_object The VisualObject that it manipulates.
     * @memberof VPTextAlign
     */
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "text_align");

        this._allowed_values = ["left","center","right"];
        this.verify(); //reverify as the first verification ignored the line below.

        //create associated UI
        if (!this._save_handler.owner_project.export_mode) {
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
            this._ui_parameter.help_string = help.parameter.object.text.text_align;
        }
    }
    
    /**
     * Get the default value of the visual object property.
     * If it is undefined, assign a value.
     *
     * @memberof VPTextAlign
     * @override
     * @return {String}
     */
    getDefaultValue() {
        if (this._default_value) return this._default_value;
        else {
            this._default_value = DEFAULTS.TEXT_ALIGN;
            return this._default_value;
        };
    }

    /**
     * The value is valid if it is an object where nodes belongs to the list of allowed values.
     *
     * @override
     * @param {*} value
     * @return {Boolean} is valid
     * @memberof VPTextAlign
     */
    hasValidValue(value) {
        if (utils.IsUndefined(value) || !utils.IsAnObject(value)) return false;
        //the second undefined for allowed values handles when verify is called when allowed values has not been initialized.
        //There is no way to initialize that subclass property before the call of super() ends.
        //So when undefined, the test ignores such property. This is why reverifying in the constructor is important.
        return (utils.IsAString(value.horizontal) && (utils.IsUndefined(this._allowed_values) || this._allowed_values.includes(value.horizontal)));
    }
}



/**
 * Visual property for manipulating css text-shadow
 *
 * @export
 * @class VPTextShadow
 * @extends {VisualObjectProperty}
 */
export class VPTextShadow extends VisualObjectProperty {
    /**
     * Creates an instance of VPTextShadow.
     * @param {SaveHandler} save_handler The SaveHandler to read and write from.
     * @param {object.VisualObject} visual_object The VisualObject that it manipulates.
     * @memberof VPTextShadow
     */
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "text_shadow");
        
        // create associated UI
        if (!this._save_handler.owner_project.export_mode) {
            this._ui_parameter = new ui_components.UIParameterString(
                this._visual_object.parameter_rack,
                "Text Shadow (CSS)",
                this.getCurrentValue(),
                () => {
                    this.setSaveUISafe(this._ui_parameter.value);
                }
            );
            this._ui_parameter.help_string = help.parameter.object.general.shadow;
        }
    }

    /**
     * Get the default value of the visual object property.
     * If it is undefined, assign a value.
     *
     * @memberof VPTextShadow
     * @override
     * @return {String}
     */
    getDefaultValue() {
        if (this._default_value) return this._default_value;
        else {
            this._default_value = DEFAULTS.TEXT_SHADOW;
            return this._default_value;
        };
    }

    /**
     * The value is valid if it is a string.
     *
     * @override
     * @param {*} value
     * @return {Boolean} is valid
     * @memberof VPTextShadow
     */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAString(value));
    }
}











//##################
// TIMER PROPERTIES
//##################

/**
 * Visual property to define spacing between the timer content and its border.
 *
 * @export
 * @class VPTimerInnerSpacing
 * @extends {VisualObjectProperty}
 */
export class VPTimerInnerSpacing extends VisualObjectProperty {
    /**
     * Creates an instance of VPTimerInnerSpacing.
     * @param {SaveHandler} save_handler The SaveHandler to read and write from.
     * @param {object.VisualObject} visual_object The VisualObject that it manipulates.
     * @memberof VPTimerInnerSpacing
     */
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "timer_inner_spacing");

        //create associated UI
        if (!this._save_handler.owner_project.export_mode) {
            this._ui_parameter = new ui_components.UIParameterNumInputList(
                this._visual_object.parameter_rack,
                "",
                false,
                [{
                    title: "Timer inner spacing",
                    unit: "px",
                    default_value: this.getCurrentValue(),
                    min: 0,
                    step: 1,
                    callback: () => {
                        this.setSaveUISafe(parseInt(this._ui_parameter.value(0)));
                    }
                }]
            );
            this._ui_parameter.help_string = help.parameter.object.timer.space_between;
        }
    }
    
    /**
     * Get the default value of the visual object property.
     * If it is undefined, assign a value.
     *
     * @memberof VPTimerInnerSpacing
     * @override
     * @return {Integer}
     */
    getDefaultValue() {
        if (this._default_value) return this._default_value;
        else {
            this._default_value = DEFAULTS.TIMER_INNER_SPACING;
            return this._default_value;
        };
    }

    /**
     * The value is valid if it is an integer superior or equal to 0.
     *
     * @override
     * @param {*} value
     * @return {Boolean} is valid
     * @memberof VPTimerInnerSpacing
     */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAnInt(value) && value >= 0);
    }    
}



/**
 * visual property to define the thickness of the border of a timer, or of the line of the timer
 *
 * @export
 * @class VPBorderThickness
 * @extends {VisualObjectProperty}
 */
export class VPBorderThickness extends VisualObjectProperty {
    /**
     * Creates an instance of VPBorderThickness.
     * @param {SaveHandler} save_handler The SaveHandler to read and write from.
     * @param {object.VisualObject} visual_object The VisualObject that it manipulates.
     * @memberof VPBorderThickness
     */
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "border_thickness");

        //create associated UI
        if (!this._save_handler.owner_project.export_mode) {
            this._ui_parameter = new ui_components.UIParameterNumInputList(
                this._visual_object.parameter_rack,
                "",
                false,
                [{
                    title: "Border thickness",
                    unit: "px",
                    default_value: this.getCurrentValue(),
                    min: 0,
                    step: 1,
                    callback: () => {
                        this.setSaveUISafe(parseInt(this._ui_parameter.value(0)))
                    }
                }]
            );
            this._ui_parameter.help_string = help.parameter.object.timer.border_thickness;
        }
    }

    /**
     * Get the default value of the visual object property.
     * If it is undefined, assign a value.
     *
     * @memberof VPBorderThickness
     * @override
     * @return {Integer}
     */
    getDefaultValue() {
        if (this._default_value) return this._default_value;
        else {
            this._default_value = DEFAULTS.BORDER_THICKNESS;
            return this._default_value;
        };
    }

    /**
     * The value is valid if it is an integer superior or equal to 0.
     *
     * @override
     * @param {*} value
     * @return {Boolean} is valid
     * @memberof VPBorderThickness
     */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAnInt(value) && value >= 0);
    }
}











//##########################
// PARTICLE FLOW PROPERTIES
//##########################

/**
 * property to define the range in which to pick a radius for a particle, using an array of 2 values.
 *
 * @export
 * @class VPParticleRadiusRange
 * @extends {VisualObjectProperty}
 */
export class VPParticleRadiusRange extends VisualObjectProperty {
    /**
     * Creates an instance of VPParticleRadiusRange.
     * @param {SaveHandler} save_handler The SaveHandler to read and write from.
     * @param {object.VisualObject} visual_object The VisualObject that it manipulates.
     * @memberof VPParticleRadiusRange
     */
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "particle_radius_range");

        //create associated UI
        if (!this._save_handler.owner_project.export_mode) {
            this._ui_parameter = new ui_components.UIParameterNumInputList(
                this._visual_object.parameter_rack,
                "Particle size range",
                true,
                [{
                    title: "Min",
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
                    title: "Max",
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
            this._ui_parameter.help_string = help.parameter.object.particles.ptcl_size;
        }
    }
    
    /**
     * Get the default value of the visual object property.
     * If it is undefined, assign a value.
     *
     * @memberof VPParticleRadiusRange
     * @override
     * @return {Array}
     */
    getDefaultValue() {
        if (this._default_value) return this._default_value;
        else {
            this._default_value = DEFAULTS.PARTICLE_RADIUS_RANGE;
            return this._default_value;
        };
    }

    /**
     * The value is valid if it is an array of two integers.
     *
     * @override
     * @param {*} value
     * @return {Boolean} is valid
     * @memberof VPParticleRadiusRange
     */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAnArray(value) && value.length === 2 && utils.IsAnInt(value[0]) && utils.IsAnInt(value[1]));
    }
}



/**
 * property to set the global flow type (behaviour)
 *
 * @export
 * @class VPFlowType
 * @extends {VisualObjectProperty}
 */
export class VPFlowType extends VisualObjectProperty {
    /**
     * Creates an instance of VPFlowType.
     * @param {SaveHandler} save_handler The SaveHandler to read and write from.
     * @param {object.VisualObject} visual_object The VisualObject that it manipulates.
     * @memberof VPFlowType
     */
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "flow_type");

        this._allowed_values = ["radial","directional"];
        this.verify(); //reverify as the first verification ignored the line below.

        //create associated UI
        if (!this._save_handler.owner_project.export_mode) {
            this._ui_parameter = new ui_components.UIParameterChoice(
                this._visual_object.parameter_rack,
                "Type",
                this._allowed_values,
                this.getCurrentValue(),
                () => {
                    this.setSaveUISafe(this._ui_parameter.value);
                }
            );
            this._ui_parameter.help_string = help.parameter.object.particles.flow_type;
        }
    }
    
    /**
     * Get the default value of the visual object property.
     * If it is undefined, assign a value.
     *
     * @memberof VPFlowType
     * @override
     * @return {String}
     */
    getDefaultValue() {
        if (this._default_value) return this._default_value;
        else {
            this._default_value = DEFAULTS.FLOW_TYPE;
            return this._default_value;
        };
    }

    /**
     * The value is valid if it belongs to the list of allowed values.
     *
     * @override
     * @param {*} value
     * @return {Boolean} is valid
     * @memberof VPFlowType
     */
    hasValidValue(value) {
        //the second undefined for allowed values handles when verify is called when allowed values has not been initialized.
        //There is no way to initialize that subclass property before the call of super() ends.
        //So when undefined, the test ignores such property. This is why reverifying in the constructor is important.
        return (!utils.IsUndefined(value) && utils.IsAString(value) && (utils.IsUndefined(this._allowed_values) || this._allowed_values.includes(value)));
    }
}



/**
 * property to set the coordinates of spawning for radial particle flows
 *
 * @export
 * @class VPFlowCenter
 * @extends {VisualObjectProperty}
 */
export class VPFlowCenter extends VisualObjectProperty {
    /**
     * Creates an instance of VPFlowCenter.
     * @param {SaveHandler} save_handler The SaveHandler to read and write from.
     * @param {object.VisualObject} visual_object The VisualObject that it manipulates.
     * @memberof VPFlowCenter
     */
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "flow_center");

        //create associated UI
        if (!this._save_handler.owner_project.export_mode) {
            this._ui_parameter = new ui_components.UIParameterNumInputList(
                this._visual_object.parameter_rack,
                "Center position (radial)",
                true,
                [{
                    title: "X",
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
                    title: "Y",
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
            this._ui_parameter.help_string = help.parameter.object.particles.center_pos;
        }
    }
    
    /**
     * Get the default value of the visual object property.
     * If it is undefined, assign a value.
     *
     * @memberof VPFlowCenter
     * @override
     * @return {Object}
     */
    getDefaultValue() {
        if (this._default_value) return this._default_value;
        else {
            this._default_value = DEFAULTS.FLOW_CENTER;
            return this._default_value;
        };
    }

    /**
     * The value is valid if it is an object where "x" and "y" are integers.
     *
     * @override
     * @param {*} value
     * @return {Boolean} is valid
     * @memberof VPFlowCenter
     */
    hasValidValue(value) {
        let keys_defined = !utils.IsUndefined(value.x) && !utils.IsUndefined(value.y);
        let keys_are_int = utils.IsAnInt(value.x) && utils.IsAnInt(value.y);
        return (!utils.IsUndefined(value) && utils.IsAnObject(value) && keys_defined && keys_are_int);
    }
}



/**
 * property to define in which direction particles go
 *
 * @export
 * @class VPFlowDirection
 * @extends {VisualObjectProperty}
 */
export class VPFlowDirection extends VisualObjectProperty {
    /**
     * Creates an instance of VPFlowDirection.
     * @param {SaveHandler} save_handler The SaveHandler to read and write from.
     * @param {object.VisualObject} visual_object The VisualObject that it manipulates.
     * @memberof VPFlowDirection
     */
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "flow_direction");

        //create associated UI
        if (!this._save_handler.owner_project.export_mode) {
            this._ui_parameter = new ui_components.UIParameterNumInputList(
                this._visual_object.parameter_rack,
                "",
                false,
                [{
                    title: "Direction (directional)",
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
            this._ui_parameter.help_string = help.parameter.object.particles.direction;
        }
    }

    /**
     * Get the default value of the visual object property.
     * If it is undefined, assign a value.
     *
     * @memberof VPFlowDirection
     * @override
     * @return {Integer}
     */
    getDefaultValue() {
        if (this._default_value) return this._default_value;
        else {
            this._default_value = DEFAULTS.FLOW_DIRECTION;
            return this._default_value;
        };
    }

    /**
     * The value is valid if it is a value between 0 and 360.
     *
     * @override
     * @param {*} value
     * @return {Boolean} is valid
     * @memberof VPFlowDirection
     */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAnInt(value) && value >= 0 && value <= 360);
    }
}



/**
 * Visual property for defining the spawn probability of a particle
 *
 * @export
 * @class VPParticleSpawnProbability
 * @extends {VisualObjectProperty}
 */
export class VPParticleSpawnProbability extends VisualObjectProperty {
    /**
     * Creates an instance of VPParticleSpawnProbability.
     * @param {SaveHandler} save_handler The SaveHandler to read and write from.
     * @param {object.VisualObject} visual_object The VisualObject that it manipulates.
     * @memberof VPParticleSpawnProbability
     */
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "particle_spawn_probability");

        //create associated UI
        if (!this._save_handler.owner_project.export_mode) {
            this._ui_parameter = new ui_components.UIParameterNumInputList(
                this._visual_object.parameter_rack,
                "",
                false,
                [{
                    title: "Spawn probability",
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
            this._ui_parameter.help_string = help.parameter.object.particles.spawn_probability;
        }
    }
    
    /**
     * Get the default value of the visual object property.
     * If it is undefined, assign a value.
     *
     * @memberof VPParticleSpawnProbability
     * @override
     * @return {Number}
     */
    getDefaultValue() {
        if (this._default_value) return this._default_value;
        else {
            this._default_value = DEFAULTS.PARTICLE_SPAWN_PROBABILITY;
            return this._default_value;
        };
    }

    /**
     * The value is valid if it is a number between 0 and 1.
     *
     * @override
     * @param {*} value
     * @return {Boolean} is valid
     * @memberof VPParticleSpawnProbability
     */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsANumber(value) && value >= 0 && value <= 1)
    }
}



/**
 * Property that defines the spawn tests: how much time the probability is tested.
 *
 * @export
 * @class VPParticleSpawnTests
 * @extends {VisualObjectProperty}
 */
export class VPParticleSpawnTests extends VisualObjectProperty {
    /**
     * Creates an instance of VPParticleSpawnTests.
     * @param {SaveHandler} save_handler The SaveHandler to read and write from.
     * @param {object.VisualObject} visual_object The VisualObject that it manipulates.
     * @memberof VPParticleSpawnTests
     */
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "particle_spawn_tests");

        //create associated UI
        if (!this._save_handler.owner_project.export_mode) {
            this._ui_parameter = new ui_components.UIParameterNumInputList(
                this._visual_object.parameter_rack,
                "",
                false,
                [{
                    title: "Spawn tests per frame",
                    unit: "",
                    default_value: this.getCurrentValue(),
                    min: 1,
                    step: 1,
                    callback: () => {
                        this.setSaveUISafe(parseInt(this._ui_parameter.value(0)));
                    }
                }]
            );
            this._ui_parameter.help_string = help.parameter.object.particles.spawn_tests;
        }
    }
    
    /**
     * Get the default value of the visual object property.
     * If it is undefined, assign a value.
     *
     * @memberof VPParticleSpawnTests
     * @override
     * @return {Number}
     */
    getDefaultValue() {
        if (this._default_value) return this._default_value;
        else {
            this._default_value = DEFAULTS.PARTICLE_SPAWN_TESTS;
            return this._default_value;
        };
    }

    /**
     * The value is valid if it is an integer superior or equal to 1.
     *
     * @override
     * @param {*} value
     * @return {Boolean} is valid
     * @memberof VPParticleSpawnTests
     */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAnInt(value) && value >= 1);
    }
}
















//#######################
// VISUALIZER PROPERTIES
//#######################

/**
 * property that handle the inner radius of a circular visualizer
 *
 * @export
 * @class VPVisualizerRadius
 * @extends {VisualObjectProperty}
 */
export class VPVisualizerRadius extends VisualObjectProperty {
    /**
     * Creates an instance of VPVisualizerRadius.
     * @param {SaveHandler} save_handler The SaveHandler to read and write from.
     * @param {object.VisualObject} visual_object The VisualObject that it manipulates.
     * @memberof VPVisualizerRadius
     */
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "visualizer-radius");

        //create associated UI
        if (!this._save_handler.owner_project.export_mode) {
            this._ui_parameter = new ui_components.UIParameterNumInputList(
                this._visual_object.parameter_rack,
                "",
                false,
                [{
                    title: "Radius (circular visualizer)",
                    unit: "px",
                    default_value: this.getCurrentValue(),
                    min: 0,
                    step: 1,
                    callback: () => {
                        this.setSaveUISafe(parseInt(this._ui_parameter.value(0)));
                    }
                }]
            );
            this._ui_parameter.help_string = help.parameter.object.visualizer.circular_kind.radius;
        }
    }
    
     /**
     * Get the default value of the visual object property.
     * If it is undefined, assign a value.
     *
     * @memberof VPVisualizerRadius
     * @override
     * @return {Integer}
     */
    getDefaultValue() {
        if (this._default_value) return this._default_value;
        else {
            this._default_value = DEFAULTS.VISUALIZER_RADIUS;
            return this._default_value;
        };
    }

   /**
     * The value is valid if it is an integer superior or equal to 0.
     *
     * @override
     * @param {*} value
     * @return {Boolean} is valid
     * @memberof VPVisualizerRadius
     */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAnInt(value) && value >= 0);
    }
}



/**
 * property that defines the number of points used to draw a visualizer (its precision in other words)
 *
 * @export
 * @class VPVisualizerPointsCount
 * @extends {VisualObjectProperty}
 */
export class VPVisualizerPointsCount extends VisualObjectProperty {
    /**
     * Creates an instance of VPVisualizerPointsCount.
     * @param {SaveHandler} save_handler The SaveHandler to read and write from.
     * @param {object.VisualObject} visual_object The VisualObject that it manipulates.
     * @memberof VPVisualizerPointsCount
     */
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "visualizer_points_count");

        //create associated UI
        if (!this._save_handler.owner_project.export_mode) {
            this._ui_parameter = new ui_components.UIParameterNumInputList(
                this._visual_object.parameter_rack,
                "",
                false,
                [{
                    title: "Points count",
                    unit: "px",
                    default_value: this.getCurrentValue(),
                    min: 0,
                    step: 1,
                    callback: () => {
                        this.setSaveUISafe(parseInt(this._ui_parameter.value(0)));
                    }
                }]
            );
            this._ui_parameter.help_string = help.parameter.object.visualizer.general.points_count;
        }
    }
    
    /**
     * Get the default value of the visual object property.
     * If it is undefined, assign a value.
     *
     * @memberof VPVisualizerPointsCount
     * @override
     * @return {Integer}
     */
    getDefaultValue() {
        if (this._default_value) return this._default_value;
        else {
            this._default_value = DEFAULTS.VISUALIZER_POINTS_COUNT;
            return this._default_value;
        };
    }

    /**
     * The value is valid if it is an integer superior or equal to 0.
     *
     * @override
     * @param {*} value
     * @return {Boolean} is valid
     * @memberof VPVisualizerPointsCount
     */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAnInt(value) && value >= 0);
    }
}



/**
 * Property to define the range of display for the spectrum of a visualizer.
 *
 * @export
 * @class VPVisualizerAnalyserRange
 * @extends {VisualObjectProperty}
 */
export class VPVisualizerAnalyserRange extends VisualObjectProperty {
    /**
     * Creates an instance of VPVisualizerAnalyserRange.
     * @param {SaveHandler} save_handler The SaveHandler to read and write from.
     * @param {object.VisualObject} visual_object The VisualObject that it manipulates.
     * @memberof VPVisualizerAnalyserRange
     */
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "visualizer_analyzer_range");
    
        // create associated UI
        if (!this._save_handler.owner_project.export_mode) {
            this._ui_parameter = new ui_components.UIParameterNumInputList(
                this._visual_object.parameter_rack,
                "Analyser Range",
                true,
                [{
                    title: "Min",
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
                    title: "Max",
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
            this._ui_parameter.help_string = help.parameter.object.visualizer.general.analyser_range;
        }
    }
    
    /**
     * Get the default value of the visual object property.
     * If it is undefined, assign a value.
     *
     * @memberof VPVisualizerAnalyserRange
     * @override
     * @return {Array}
     */
    getDefaultValue() {
        if (this._default_value) return this._default_value;
        else {
            this._default_value = DEFAULTS.VISUALIZER_ANALYZER_RANGE;
            return this._default_value;
        };
    }

    /**
     * The value is valid if it is an array of two integers between 0 and 1023.
     *
     * @override
     * @param {*} value
     * @return {Boolean} is valid
     * @memberof VPVisualizerAnalyserRange
     */
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



/**
 * //property to choose the visualization smoothing type from one frame to another
 *
 * @export
 * @class VPVisualizationSmoothingType
 * @extends {VisualObjectProperty}
 */
export class VPVisualizationSmoothingType extends VisualObjectProperty {
    /**
     * Creates an instance of VPVisualizationSmoothingType.
     * @param {SaveHandler} save_handler The SaveHandler to read and write from.
     * @param {object.VisualObject} visual_object The VisualObject that it manipulates.
     * @memberof VPVisualizationSmoothingType
     */
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "visualization_smoothing_type");

        this._allowed_values = ["proportional_decrease","linear_decrease","average"];
        this.verify(); //reverify as the first verification ignored the line below.

        //create associated UI
        if (!this._save_handler.owner_project.export_mode) {
            this._ui_parameter = new ui_components.UIParameterChoice(
                this._visual_object.parameter_rack,
                "Visualization smoothing type",
                this._allowed_values,
                this.getCurrentValue(),
                () => {
                    this.setSaveUISafe(this._ui_parameter.value);
                }
            );
            this._ui_parameter.help_string = help.parameter.object.visualizer.general.visualization_smoothing.type;
        }
    }
    
    /**
     * Get the default value of the visual object property.
     * If it is undefined, assign a value.
     *
     * @memberof VPVisualizationSmoothingType
     * @override
     * @return {String}
     */
    getDefaultValue() {
        if (this._default_value) return this._default_value;
        else {
            this._default_value = DEFAULTS.VISUALIZATION_SMOOTHING_TYPE;
            return this._default_value;
        };
    }

    /**
     * The value is valid if it belongs to the list of allowed values.
     *
     * @override
     * @param {*} value
     * @return {Boolean} is valid
     * @memberof VPVisualizationSmoothingType
     */
    hasValidValue(value) {
        //the second undefined for allowed values handles when verify is called when allowed values has not been initialized.
        //There is no way to initialize that subclass property before the call of super() ends.
        //So when undefined, the test ignores such property. This is why reverifying in the constructor is important.
        return (!utils.IsUndefined(value) && utils.IsAString(value) && (utils.IsUndefined(this._allowed_values) || this._allowed_values.includes(value)));
    }
}



/**
 * property to choose the factor of visualization smoothing, the value influences the mathematical behaviour.
 *
 * @export
 * @class VPVisualizationSmoothingFactor
 * @extends {VisualObjectProperty}
 */
export class VPVisualizationSmoothingFactor extends VisualObjectProperty {
    /**
     * Creates an instance of VPVisualizationSmoothingFactor.
     * @param {SaveHandler} save_handler The SaveHandler to read and write from.
     * @param {object.VisualObject} visual_object The VisualObject that it manipulates.
     * @memberof VPVisualizationSmoothingFactor
     */
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "visualization_smoothing_factor");
    
        // create associated UI
        if (!this._save_handler.owner_project.export_mode) {
            this._ui_parameter = new ui_components.UIParameterNumInputList(
                this._visual_object.parameter_rack,
                "",
                false,
                [{
                    title: "Visualization smoothing factor",
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
            this._ui_parameter.help_string = help.parameter.object.visualizer.general.visualization_smoothing.factor;
        }
    }
    
    /**
     * Get the default value of the visual object property.
     * If it is undefined, assign a value.
     *
     * @memberof VPVisualizationSmoothingFactor
     * @override
     * @return {Number}
     */
    getDefaultValue() {
        if (this._default_value) return this._default_value;
        else {
            this._default_value = DEFAULTS.VISUALIZATION_SMOOTHING_FACTOR;
            return this._default_value;
        };
    }

    /**
     * The value is valid if it is a number superior or equal to 0.
     *
     * @override
     * @param {*} value
     * @return {Boolean} is valid
     * @memberof VPVisualizationSmoothingFactor
     */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsANumber(value) && value >= 0);
    }
}



/**
 * property to define the thickness of bars of a bar visualizer (how large a bar is).
 *
 * @export
 * @class VPVisualizerBarThickness
 * @extends {VisualObjectProperty}
 */
export class VPVisualizerBarThickness extends VisualObjectProperty {
    /**
     * Creates an instance of VPVisualizerBarThickness.
     * @param {SaveHandler} save_handler The SaveHandler to read and write from.
     * @param {object.VisualObject} visual_object The VisualObject that it manipulates.
     * @memberof VPVisualizerBarThickness
     */
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "visualizer_bar_thickness");
         
        // create associated UI
        if (!this._save_handler.owner_project.export_mode) {
            this._ui_parameter = new ui_components.UIParameterNumInputList(
                this._visual_object.parameter_rack,
                "",
                false,
                [{
                    title: "Bar thickness",
                    unit: "",
                    default_value: this.getCurrentValue(),
                    min: 0,
                    step: 1,
                    callback: () => {
                        this.setSaveUISafe(parseInt(this._ui_parameter.value(0)));
                    }
                }]
            );
            this._ui_parameter.help_string = help.parameter.object.visualizer.bar_kind.bar_thickness;
        }
    }
    
    /**
     * Get the default value of the visual object property.
     * If it is undefined, assign a value.
     *
     * @memberof VPVisualizerBarThickness
     * @override
     * @return {Integer}
     */
    getDefaultValue() {
        if (this._default_value) return this._default_value;
        else {
            this._default_value = DEFAULTS.VISUALIZER_BAR_THICKNESS;
            return this._default_value;
        };
    }

    /**
     * The value is valid if it is an integer superior or equal to 0.
     *
     * @override
     * @param {*} value
     * @return {Boolean} is valid
     * @memberof VPVisualizerBarThickness
     */
    hasValidValue(value) {
        return (!utils.IsUndefined(value) && utils.IsAnInt(value) && value >= 0);
    }
}
