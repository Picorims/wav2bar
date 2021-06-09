//MIT License - Copyright (c) 2020-2021 Picorims

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
        if (!IsAString(id)) throw `object_method.validateID: ${IDBCursor} is not a string.`;

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
    },

    //transforms an absolute path into a CSS path given the working directory
    //This might be a big gas engine, option to test: using absolute path that starts with /.
    fullPathToCSSPath: function(working_dir, absolute_path) {
        //setup working directory information
        working_dir = working_dir.replace(/^.*\/$/, "").replace(/^.*\\$/, ""); //remove last (anti)slash
        let splitter = (os === "win32") ? "\\" : "\/";
        
        //find the number of upper levels from the working directory.
        //-1 because we don't want to count what is before the root slash
        //(either empty or drive letter)
        let number_of_upper_levels = working_dir.split(splitter).count - 1;

        //build relative path
        let relative_path = "";
        //apply upper jumps
        for (let i = 0; i < number_of_upper_levels; i++) relative_path += "../";
        //format absolute path to be appended by using only / and removing the root part
        if (os === "win32") absolute_path = absolute_path.split("\\").join("\/");
        //remove everything until the first occurence of a /
        absolute_path = absolute_path.replace(/[^\/]*/, "");

        relative_path += absolute_path;
        return relative_path;
    }
};