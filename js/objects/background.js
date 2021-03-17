//MIT License - Copyright (c) 2020-2021 Picorims

//BACKGROUND OBJECT PROCESS

/*data = {
    object_type: "background",
    id: ?, (UUID)
    name: ?, (string)
    layer: ?, (integer)
    background: {
        type: "color"|"gradient"|"image",
        last_color: css color,
        last_gradient: css gradient,
        last_image: image name, (path: ./temp/current_save/assets/object_id/background/image_name_with_extension)
        size: ?, (string, css background-size for image resizing, shrinking, repeating)
        repeat: no-repeat|repeat-x|repeat-y|repeat,
    },
}*/

function Background(glob_data) {
    if (IsUndefined(glob_data)) throw "Background: data missing!";

    this.data = glob_data;//collect data
    this.data.object_type = "background";
    objects.push(this);//add the object to the list




    //########################################
    //VERIFY RECEIVED DATA, SET DEFAULT VALUES
    //########################################

    //Note: ignore_undefined is useful when we only want to verify the given values without setting any default value
    //(invalid data is still overwritten)

    this.verifyData = function(data, ignore_undefined) {
        if (IsUndefined(data)) throw "Background.verifyData: data missing!";
        if ( !IsUndefined(ignore_undefined) && !(ignore_undefined === "IGNORE_UNDEFINED") ) throw "Background.verifyData: IGNORE_UNDEFINED is the only valid node.";

        if ( IsUndefined(ignore_undefined) ) ignore_undefined = "";

        //ID
        if ( IsUndefined(data.id) || !IsAString(data.id) || !object_method.validID(data.id, this) ) {
            CustomLog("error","Background object: received an object with an unspecified/invalid ID! A random ID is given.");
            data.id = object_method.generateID();
        }

        //name
        if ( IsUndefined(data.name) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.name = "";}
        if ( !IsUndefined(data.name) && !IsAString(data.name) || data.name === "" ) {
            CustomLog("warn","Background object: Invalid name! Set to 'background'.");
            data.name = "background";
        }

        //layer
        if ( IsUndefined(data.layer) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.layer = 0;}
        if ( !IsUndefined(data.layer) && (!IsAnInt(data.layer) || (data.layer <= -1)) ) {
            CustomLog("warn","Background object: Invalid layer! Set to 0.");
            data.layer = 0;
        }

        //background
        if ( IsUndefined(data.background) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.background = {type: null, last_color: null, last_gradient: null, last_image: null};}

        if (!IsUndefined(data.background)) {//it is undefined if it has not been set before in the data argument and IGNORE_UNDEFINED is active

            //type
            if ( IsUndefined(data.background.type) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.background.type = "color";}
            if ( !IsUndefined(data.background.type) && (!IsAString(data.background.type) || ( (data.background.type !== "color") && (data.background.type !== "gradient") && (data.background.type !== "image") )) ) {
                CustomLog("warn","Background object: Invalid background type! Set to color.");
                data.background.type = "color";
            }

            //last color
            if ( IsUndefined(data.background.last_color) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.background.last_color = "#ffffff";}
            if ( !IsUndefined(data.background.last_color) && !IsAString(data.background.last_color) ) {
                CustomLog("warn","Background object: Invalid background color! Set to #ffffff."); //do not detect css errors!
                data.background.last_color = "#ffffff";
            }

            //last gradient
            if ( IsUndefined(data.background.last_gradient) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.background.last_gradient = "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(255,255,255,1) 100%)";}
            if ( !IsUndefined(data.background.last_gradient) && !IsAString(data.background.last_gradient) ) {
                CustomLog("warn","Background object: Invalid background gradient! Set to a basic gradient."); //do not detect css errors!
                data.background.last_gradient = "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(255,255,255,1) 100%)";
            }

            //last image
            if ( IsUndefined(data.background.last_image) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.background.last_image = "";}
            if ( !IsUndefined(data.background.last_image) && !IsAString(data.background.last_image) ) {
                CustomLog("warn","Background object: Invalid background image! Value ignored."); //do not detect css errors!
                data.background.last_image = "";
            }

            //size
            if ( IsUndefined(data.background.size) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.background.size = "";}
            if ( !IsUndefined(data.background.size) && !IsAString(data.background.size) ) {
                CustomLog("warn","Background object: Invalid size! No css size is applied."); //do not detect css errors!
                data.background.size = "";
            }

            //repeat
            if ( IsUndefined(data.background.repeat) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.background.repeat = "no-repeat";}
            if ( !IsUndefined(data.background.repeat) && (!IsAString(data.background.repeat) || ( (data.background.repeat !== "no-repeat") && (data.background.repeat !== "repeat") && (data.background.repeat !== "repeat-x") && (data.background.repeat !== "repeat-y") )) ) {
                CustomLog("warn","Background object: Invalid repeat type! Set to no-repeat.");
                data.background.repeat = "no-repeat";
            }

        }

        return data;

    }

    this.data = this.verifyData(this.data);




    //##################################
    //FUNCTION TO MERGE TWO DATA OBJECTS
    //##################################

    this.mergeData = function(data_to_add, data_receiver) {
        if (IsUndefined(data_to_add)) throw "Background.mergeData: data missing!";
        if (IsUndefined(data_receiver)) throw "Background.mergeData: data_destination missing!";

        for (key of Object.keys(data_to_add)) { //only update the changed nodes in data_to_add
            if (IsAnObject(data_to_add[key]) && !IsAnArray(data_to_add[key])) {
                //there are multiple sub keys in this key, they must be considered independently.
                this.mergeData(data_to_add[key], data_receiver[key]);
            } else {
                //The key is a simple value, it can be processed directly
                data_receiver[key] = data_to_add[key];
            }
        }

        return data_receiver;
    }





    //########################################
    //FUNCTION TO APPLY DATA TO THE BACKGROUND
    //########################################

    this.updateData = function(data) {
        if (IsUndefined(data)) throw "Background.updateData: data missing!";
        //NOTE: it is NOT possible to change the background id (data.id). A new background must be created in such case!

        if ( IsUndefined(data.id) ) {
            CustomLog("error","Background object: No ID specified!");
            return;
        }

        if (data.id === this.data.id) {//if he is the targeted element (remove executes for all objects!)
            //LOAD DATA
            this.data_backup = JSON.parse(JSON.stringify(this.data)); //keep a copy of the existing data
            this.data = data;//recollect data
            this.data.object_type = "background";

            //VERIFY DATA
            this.data = this.verifyData(this.data, "IGNORE_UNDEFINED");

            //APPLY DATA
            this.data = this.mergeData(this.data, this.data_backup); //simple assignement would overwrite existing data
            this.element.style.zIndex = this.data.layer;//layer
            switch (this.data.background.type) {//background
                case "color":
                    this.element.style.background = "";
                    this.element.style.backgroundColor = this.data.background.last_color;
                    this.element.backgroundImage = "";
                    break;
                case "gradient":
                    this.element.style.background = this.data.background.last_gradient;
                    this.element.style.backgroundColor = "";
                    this.element.backgroundImage = "";
                    break;
                case "image":
                    this.element.style.background = "";
                    this.element.style.backgroundColor = "";
                    if (this.data.background.last_image !== "") {
                        if (export_mode) this.element.style.backgroundImage = `url("../temp/current_save/assets/${this.data.id}/background/${this.data.background.last_image}")`;
                        else this.element.style.backgroundImage = `url("./temp/current_save/assets/${this.data.id}/background/${this.data.background.last_image}")`;
                    } else {
                        this.element.style.backgroundImage = "";
                        this.element.style.backgroundColor = "#000000";
                    }
                    this.element.style.backgroundRepeat = this.data.background.repeat;
                    break;
            }
            this.element.style.backgroundSize = this.data.background.size;//size

            //SET BACKGROUND TO SCREEN SIZE
            this.element.style.width = screen.width + "px";
            this.element.style.height = screen.height + "px";
        }


        //END OF updateData();
    }




    //###################
    //CREATE HTML ELEMENT
    //###################

    //canvas or div depending of the context
    this.element = document.createElement("div");

    //basic parameters
    screen.appendChild(this.element);
    this.element.style.position = "absolute";
    this.element.style.top = 0;
    this.element.style.left = 0;
    this.element.style.display = "inline-block";
    this.element.style.overflow = "hidden";



    //#############################
    //APPLY DATA FOR THE FIRST TIME
    //#############################
    this.updateData(this.data);





    //#####################
    //CREATE USER INTERFACE
    //#####################
    if (!export_mode) {
        //create category
        CreateObjectContainer(this.data.id);

        //layer
        AddParameter(
            {
                object_id: this.data.id,
                type: "value",
                settings: {
                    default: this.data.layer,
                    min: 0,
                    step: 1,
                },
                title: "Layer",
                help: help.parameter.object.general.layer,
            },
            function(id, value) {  //id, type, parameters, name, callback with id
                                                                                //and returned value by the input
                var this_object = object_method.getByID(id);

                this_object.updateData({
                    id: id,
                    layer: value,
                });
            }
        );

        //background
        let bgnd_size_array = this.data.background.size.split(" ");
        let def_size_type, def_size_x, def_size_y;
        let val_percent_regex = new RegExp(/[0-9]+%/);//no g flag so it doesn't keep track of last index
        if (bgnd_size_array[0] === "contain") {
            def_size_type = "contain";
            def_size_x = def_size_y = "";
        } else if (bgnd_size_array[0] === "cover") {
            def_size_type = "cover";
            def_size_x = def_size_y = "";
        } else if ( bgnd_size_array.length === 1 && val_percent_regex.test(bgnd_size_array[0]) ) {
            def_size_type = "scale_size_control";
            def_size_x = bgnd_size_array[0].replace("%","");
            def_size_y = "";
        } else if ( bgnd_size_array.length === 2 && val_percent_regex.test(bgnd_size_array[0]) && val_percent_regex.test(bgnd_size_array[1]) ) {
            def_size_type = "width_height_size_control";
            def_size_x = bgnd_size_array[0].replace("%","");
            def_size_y = bgnd_size_array[1].replace("%","");
        } else {
            def_size_type = "cover";
            def_size_x = def_size_y = "";
        }
        let repeat_x_bool, repeat_y_bool;
        switch (this.data.background.repeat) {
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
        AddParameter(
            {
                object_id: this.data.id,
                type: "background-picker",
                settings: {
                    default_type: this.data.background.type,
                    default_color: this.data.background.last_color,
                    default_gradient: this.data.background.last_gradient,
                    default_image: this.data.background.last_image,
                    default_size_type: def_size_type,
                    default_size_x: def_size_x,
                    default_size_y: def_size_y,
                    default_repeat_x: repeat_x_bool,
                    default_repeat_y: repeat_y_bool,
                    size_step: 1,
                },
                title: "Background",
                help: help.parameter.object.image.bgnd,
            },
            function(id, type, value, size_type, size_x, size_y, repeat_x, repeat_y) {

                var this_object = object_method.getByID(id);
                var updated_data = {
                    id: id,
                    background: {
                        type: type,
                    }
                }
                switch (type) {
                    case "color": updated_data.background.last_color = value; break;
                    case "gradient": updated_data.background.last_gradient = value; break;
                    case "image":
                        updated_data.background.last_image = value;
                        switch (size_type) {
                            case "contain":
                            case "cover":
                                updated_data.background.size = size_type;
                                break;
                            case "scale_size_control":
                                updated_data.background.size = size_x+"%";
                                break;
                            case "width_height_size_control":
                                updated_data.background.size = `${size_x}% ${size_y}%`;
                                break;
                        }
                        if (repeat_x && repeat_y) updated_data.background.repeat = "repeat";
                        else if (repeat_x && !repeat_y) updated_data.background.repeat = "repeat-x";
                        else if (!repeat_x && repeat_y) updated_data.background.repeat = "repeat-y";
                        else if (!repeat_x && !repeat_y) updated_data.background.repeat = "no-repeat";
                        break;
                }

                this_object.updateData(updated_data);
            }
        );
    }






    //##################################
    //FUNCTION TO ANIMATE THE BACKGROUND
    //##################################

    this.update = function() {
        this.element.style.width = screen.width+"px";
        this.element.style.height = screen.height+"px";

        //finished updating
        return true;
    }




    //####################################
    //FUNCTION TO REMOVE THE PARTICLE FLOW
    //####################################

    this.remove = function(id) {
        if (!IsAString(id)) throw `Background.remove: ${id} is not a valid ID.`;

        if (this.data.id === id) {//if he is the targeted element (remove executes for all objects!)
            //remove index
            var index = objects.indexOf(this);
            objects.splice(index, 1);

            //remove UI
            document.getElementById(`UI-${id}`).remove();

            //remove element
            this.element.remove();
        }
    }


    //END OF THE OBJECT
}