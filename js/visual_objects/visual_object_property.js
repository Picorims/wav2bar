//MIT License - Copyright (c) 2020-2021 Picorims

import * as object from "./visual_object.js";
import * as utils from "../utils/utils.js";
import * as ui_components from "../ui_components/ui_components.js";

const DEFAULTS = {
    LAYER: 0,
    COORDINATES: {x: 0, y: 0},
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