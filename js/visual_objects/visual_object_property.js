//MIT License - Copyright (c) 2020-2021 Picorims

import * as object from "./visual_object.js";
import * as utils from "../utils/utils.js";

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

        if (!this._visual_object instanceof object.VisualObject) throw new SyntaxError("visual object must be a VisualObject.");
        if (!utils.IsAString(this._property_name)) throw new SyntaxError("Property name must be a string.");
        if (utils.IsUndefined(this._default_value)) throw new SyntaxError("Missing default value for the property.");

        //register property in save
        let data = {};
        data[this._property_name] = this._default_value;
        this._save_handler.mergeVisualObjectData(this._visual_object.id, data);
    }
}

export class VPLayer extends VisualObjectProperty {
    constructor(save_handler, visual_object) {
        super(save_handler, visual_object, "layer", DEFAULTS.LAYER);
    }
}