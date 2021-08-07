//MIT License - Copyright (c) 2020-2021 Picorims

import * as object from "./visual_object.js";
import * as utils from "../utils/utils.js";
import * as ui_components from "../ui_components/ui_components.js";

const DEFAULTS = {
    LAYER: 0,
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

export class VPLayer extends VisualObjectProperty {
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "layer", DEFAULTS.LAYER);

        //create associated ui.
        this._ui_parameter = new ui_components.UIParameterNumInputList(
            this._visual_object.parameter_rack,
            "",
            false,
            [{
                title: "Layer :",
                unit: "",
                default_value: this._default_value,
                min: 0,
                step: 1,
                callback: () => {
                    let value = parseInt(this._ui_parameter.value(0));
                    if (!this.hasValidValue(value)) {
                        utils.CustomLog("warn", `${this.constructor.name}: Ignored invalid value from user interface (${value}).`);
                    } else {
                        this.setSave(value);
                    }
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