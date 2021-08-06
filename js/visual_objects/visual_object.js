//MIT License - Copyright (c) 2020-2021 Picorims

import * as utils from "../utils/utils.js";

//base class for visual objects
export class VisualObject {
    constructor(save_handler, id = "") {
        if (utils.IsUndefined(save_handler)) throw new SyntaxError("SaveHandler required as an argument for a VisualObject.");

        this._save_handler = save_handler;
        this._verifiers = [];
        this._updaters = [];
        this._element = null;
        this._id = id;

        //register object in save
        //generates an id if none is provided
        this._save_handler.addVisualObject(this);
    }

    get id() {return this._id;}
    getThisData() {return this._save_handler.save_data.objects[this._id]}

    //generate a UUID for the object
    generateID() {
        let id;
        do {
            id = utils.uuidv4();
        }
        while (!this.validID(id) || !this.uniqueID(id));

        this._id = id;
    }

    //validate an id to be an UUID.
    validID(id) {
        if (!imports.utils.IsAString(id)) throw `${id} is not a string.`;
        
        return id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i) !== null;
    }

    //verify if the id exists in the save.
    uniqueID(id) {
        if (!imports.utils.IsAString(id)) throw `${id} is not a string.`;
        
        let valid = true;
        let ids = this._save_handler.getVisualObjectIDs();
        ids.forEach(existing_id => {
            //if the ID is identical, then it is not valid.
            //(otherwise himself would be a false positive)
            if (existing_id === id) valid = false;            
        });
        return valid;
    }


    //destroy VisualObject
    destroy() {
        if (this._element) this._element.remove();
    }
}



export class VText extends VisualObject {
    constructor(save_handler) {
        super(save_handler);
        this.getThisData().type = "text";
    }
}