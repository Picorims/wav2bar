//MIT License - Copyright (c) 2020 Picorims

//METHODS TO MANIPULATE OBJECTS
var object_method = {
    
    //function that returns the last object in the object list with the matching id
    //(considering an ID is unique, it always match the right object)
    getByID: function(id) {
        if (!IsAString(id)) throw `object_method.getByID: ${object_id} is not a valid ID.`;
        
        var object;
        for (var obj of objects) {
            if (obj.data.id === id) object = obj;
        }

        return object;

    },

    //function that returns if an ID is valid (unique uuid v4)
    validID: function(id, corresponding_object) {
        if (!IsAString(id)) throw `object_method.validateID: ${object_id} is not a string.`;

        var valid = true;
        if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i) == null) {
            valid = false;
        }
        else {
            for (var obj of objects) {
                //if the ID is identical, and it is another object than the object
                //we are validating the ID for (otherwise himself would be a false positive)
                if (obj.data.id === id && obj !== corresponding_object) valid = false;
            }    
        }

        return valid;
    },

    generateID: function() {
        var id;
        do {
            id = uuidv4();
        }
        while (!this.validID(id));

        return id;
    }
};