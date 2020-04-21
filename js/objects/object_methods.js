//MIT License - Copyright (c) 2020 Picorims

//METHODS TO MANIPULATE OBJECTS

var object_method = {
    
    //function that returns the last object in the object list with the matching id
    //(considering an ID is unique, it always match the right object)
    getByID: function(id) {
        if (!IsAString(object_id)) throw `object_method.getByID: ${object_id} is not a valid ID.`;
        
        var object;
        for (var obj of objects) {
            if (obj.data.id === id) object = obj;
        }

        return object;

    },
};