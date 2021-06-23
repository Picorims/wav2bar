//MIT License - Copyright (c) 2020-2021 Picorims

//METHODS TO MANIPULATE OBJECTS
var object_method = {

    //function that returns the last object in the object list with the matching id
    //(considering an ID is unique, it always match the right object)
    getByID: function(id) {
        if (!imports.utils.IsAString(id)) throw `object_method.getByID: ${object_id} is not a valid ID.`;

        var object;
        for (var obj of objects) {
            if (obj.data.id === id) object = obj;
        }

        return object;

    },

    //function that returns if an ID is valid (unique uuid v4)
    validID: function(id, corresponding_object) {
        if (!imports.utils.IsAString(id)) throw `object_method.validateID: ${IDBCursor} is not a string.`;

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
            id = imports.utils.uuidv4();
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
    },

    mergeData: function(data_to_add, data_receiver) {
        if (imports.utils.IsUndefined(data_to_add)) throw "object_method.mergeData: data missing!";
        if (imports.utils.IsUndefined(data_receiver)) throw "object_method.mergeData: destination data missing!";

        for (key of Object.keys(data_to_add)) { //only update the changed nodes in data_to_add
            if (imports.utils.IsAnObject(data_to_add[key]) && !imports.utils.IsAnArray(data_to_add[key])) {
                //there are multiple sub keys in this key, they must be considered independently.
                object_method.mergeData(data_to_add[key], data_receiver[key]);
            } else {
                //The key is a simple value, it can be processed directly
                data_receiver[key] = data_to_add[key];
            }
        }

        return data_receiver;
    },
};