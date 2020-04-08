//MIT License - Copyright (c) 2020 Picorims

//METHODS TO MANIPULATE OBJECTS

var object_method = {
    
    //function that returns an object with the matching id
    getByID: function(id) {
        
        var object;
        for (var obj of objects) {
            if (obj.data.id === id) object = obj;
            break
        }

        return object;

    },
};