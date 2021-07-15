//MIT License - Copyright (c) 2020-2021 Picorims

//IMAGE OBJECT PROCESS

/*data = {
    object_type: "image",
    id: ?, (UUID)
    name: ?, (string)
    layer: ?, (integer)
    x: ?, (px)
    y: ?, (px)
    width: ?, (px)
    height: ?, (px)
    rotation: ?, (deg)
    background: {
        type: "color"|"gradient"|"image",
        last_color: css color,
        last_gradient: css gradient,
        last_image: image name, (path: ./temp/current_save/assets/object_id/background/image_name_with_extension)
        size: ?, (string, css background-size for image resizing, shrinking, repeating)
        repeat: no-repeat|repeat-x|repeat-y|repeat,
    },
    border_radius: ?, (string, css border-radius)
    box_shadow: ?, (string, css box-shadow)
}*/

function Image(glob_data) {
    if (imports.utils.IsUndefined(glob_data)) throw "Image: data missing!";

    this.data = glob_data;//collect data
    this.data.object_type = "image";
    objects.push(this);//add the object to the list

    //default values
    this.DEFAULTS = {
        NAME: this.data.object_type,
        LAYER: 0,
        X: 0,
        Y: 0,
        WIDTH: 100,
        HEIGHT: 100,
        ROTATION: 0,
        BACKGROUND: {
            TYPE: "color",
            LAST_COLOR: "#ffffff",
            LAST_GRADIENT: "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(255,255,255,1) 100%)",
            LAST_IMAGE: "",
            SIZE: "",
            REPEAT: "no-repeat",
        },
        BORDER_RADIUS: "",
        BOX_SHADOW: "",
    };


    //########################################
    //VERIFY RECEIVED DATA, SET DEFAULT VALUES
    //########################################

    //Note: ignore_undefined is useful when we only want to verify the given values without setting any default value
    //(invalid data is still overwritten)

    this.verifyData = function(data, ignore_undefined) {
        if (imports.utils.IsUndefined(data)) throw "Image.verifyData: data missing!";
        if ( !imports.utils.IsUndefined(ignore_undefined) && !(ignore_undefined === "IGNORE_UNDEFINED") ) throw "Image.verifyData: IGNORE_UNDEFINED is the only valid node.";


        if ( imports.utils.IsUndefined(ignore_undefined) ) ignore_undefined = "";

        //ID
        if ( imports.utils.IsUndefined(data.id) || !imports.utils.IsAString(data.id) || !object_method.validID(data.id, this) ) {
            CustomLog("error","Image object: received an object with an unspecified/invalid ID! A random ID is given.");
            data.id = object_method.generateID();
        }

        //name
        if ( imports.utils.IsUndefined(data.name) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.name = this.DEFAULTS.NAME;}
        if ( !imports.utils.IsUndefined(data.name) && !imports.utils.IsAString(data.name) || data.name === "" ) {
            CustomLog("warn",`Image object: Invalid name! Set to '${this.DEFAULTS.NAME}'.`);
            data.name = this.DEFAULTS.NAME;
        }

        //layer
        if ( imports.utils.IsUndefined(data.layer) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.layer = this.DEFAULTS.LAYER;}
        if ( !imports.utils.IsUndefined(data.layer) && (!imports.utils.IsAnInt(data.layer) || (data.layer <= -1)) ) {
            CustomLog("warn",`Image object: Invalid layer! Set to ${this.DEFAULTS.LAYER}.`);
            data.layer = this.DEFAULTS.LAYER;
        }

        //x
        if ( imports.utils.IsUndefined(data.x) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.x = this.DEFAULTS.X;}
        if ( !imports.utils.IsUndefined(data.x) && !imports.utils.IsAnInt(data.x) ) {
            CustomLog("warn",`Image object: Invalid x coordinate! Set to ${this.DEFAULTS.X}.`);
            data.x = this.DEFAULTS.X;
        }

        //y
        if ( imports.utils.IsUndefined(data.y) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.y = this.DEFAULTS.Y;}
        if ( !imports.utils.IsUndefined(data.y) && !imports.utils.IsAnInt(data.y) ) {
            CustomLog("warn",`Image object: Invalid y coordinate! Set to ${this.DEFAULTS.Y}.`);
            data.y = this.DEFAULTS.Y;
        }

        //width
        if ( imports.utils.IsUndefined(data.width) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.width = this.DEFAULTS.WIDTH;}
        if ( !imports.utils.IsUndefined(data.width) && (!imports.utils.IsAnInt(data.width) || (data.width < 0)) ) {
            CustomLog("warn",`Image object: Invalid width! Set to ${this.DEFAULTS.WIDTH}.`);
            data.width = this.DEFAULTS.WIDTH;
        }

        //height
        if ( imports.utils.IsUndefined(data.height) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.height = this.DEFAULTS.HEIGHT;}
        if ( !imports.utils.IsUndefined(data.height) && (!imports.utils.IsAnInt(data.height) || (data.height < 0)) ) {
            CustomLog("warn",`Image object: Invalid height! Set to ${this.DEFAULTS.HEIGHT}.`);
            data.height = this.DEFAULTS.HEIGHT;
        }

        //rotation
        if ( imports.utils.IsUndefined(data.rotation) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.rotation = this.DEFAULTS.ROTATION;}
        if ( !imports.utils.IsUndefined(data.rotation) && !imports.utils.IsAnInt(data.rotation) ) {
            CustomLog("warn",`Image object: Invalid rotation! Set to ${this.DEFAULTS.ROTATION}.`);
            data.rotation = this.DEFAULTS.ROTATION;
        }

        //background
        if ( imports.utils.IsUndefined(data.background) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.background = {type: null, last_color: null, last_gradient: null, last_image: null};}

        if (!imports.utils.IsUndefined(data.background)) {//it is undefined if it has not been set before in the data argument and IGNORE_UNDEFINED is active

            //type
            if ( imports.utils.IsUndefined(data.background.type) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.background.type = this.DEFAULTS.BACKGROUND.TYPE;}
            if ( !imports.utils.IsUndefined(data.background.type) && (!imports.utils.IsAString(data.background.type) || ( (data.background.type !== "color") && (data.background.type !== "gradient") && (data.background.type !== "image") )) ) {
                CustomLog("warn",`Image object: Invalid background type! Set to ${this.DEFAULTS.BACKGROUND.TYPE}.`);
                data.background.type = this.DEFAULTS.BACKGROUND.TYPE;
            }

            //last color
            if ( imports.utils.IsUndefined(data.background.last_color) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.background.last_color = this.DEFAULTS.BACKGROUND.LAST_COLOR;}
            if ( !imports.utils.IsUndefined(data.background.last_color) && !imports.utils.IsAString(data.background.last_color) ) {
                CustomLog("warn",`Image object: Invalid background color! Set to ${this.DEFAULTS.BACKGROUND.LAST_COLOR}.`); //do not detect css errors!
                data.background.last_color = this.DEFAULTS.BACKGROUND.LAST_COLOR;
            }

            //last gradient
            if ( imports.utils.IsUndefined(data.background.last_gradient) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.background.last_gradient = this.DEFAULTS.BACKGROUND.LAST_GRADIENT;}
            if ( !imports.utils.IsUndefined(data.background.last_gradient) && !imports.utils.IsAString(data.background.last_gradient) ) {
                CustomLog("warn",`Image object: Invalid background gradient! Set to ${this.DEFAULTS.BACKGROUND.LAST_GRADIENT}.`); //do not detect css errors!
                data.background.last_gradient = this.DEFAULTS.BACKGROUND.LAST_GRADIENT;
            }

            //last image
            if ( imports.utils.IsUndefined(data.background.last_image) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.background.last_image = this.DEFAULTS.BACKGROUND.LAST_IMAGE;}
            if ( !imports.utils.IsUndefined(data.background.last_image) && !imports.utils.IsAString(data.background.last_image) ) {
                CustomLog("warn","Image object: Invalid background image! Value ignored."); //do not detect css errors!
                data.background.last_image = this.DEFAULTS.BACKGROUND.LAST_IMAGE;
            }

            //size
            if ( imports.utils.IsUndefined(data.background.size) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.background.size = this.DEFAULTS.BACKGROUND.SIZE;}
            if ( !imports.utils.IsUndefined(data.background.size) && !imports.utils.IsAString(data.background.size) ) {
                CustomLog("warn",`Image object: Invalid size! Set to "${this.DEFAULTS.BACKGROUND.SIZE}".`); //do not detect css errors!
                data.background.size = this.DEFAULTS.BACKGROUND.SIZE;
            }

            //repeat
            if ( imports.utils.IsUndefined(data.background.repeat) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.background.repeat = this.DEFAULTS.BACKGROUND.REPEAT;}
            if ( !imports.utils.IsUndefined(data.background.repeat) && (!imports.utils.IsAString(data.background.repeat) || ( (data.background.repeat !== "no-repeat") && (data.background.repeat !== "repeat") && (data.background.repeat !== "repeat-x") && (data.background.repeat !== "repeat-y") )) ) {
                CustomLog("warn",`Image object: Invalid repeat type! Set to '${this.DEFAULTS.BACKGROUND.REPEAT}'.`);
                data.background.repeat = this.DEFAULTS.BACKGROUND.REPEAT;
            }

        }

        //border-radius
        if ( imports.utils.IsUndefined(data.border_radius) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.border_radius = this.DEFAULTS.BORDER_RADIUS;}
        if ( !imports.utils.IsUndefined(data.border_radius) && !imports.utils.IsAString(data.border_radius) ) {
            CustomLog("warn",`Image object: Invalid border-radius! Set to "${this.DEFAULTS.BORDER_RADIUS}".`); //do not detect css errors!
            data.border_radius = this.DEFAULTS.BORDER_RADIUS;
        }

        //box-shadow
        if ( imports.utils.IsUndefined(data.box_shadow) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.box_shadow = this.DEFAULTS.BOX_SHADOW;}
        if ( !imports.utils.IsUndefined(data.box_shadow) && !imports.utils.IsAString(data.box_shadow) ) {
            CustomLog("warn",`Image object: Invalid box-shadow! Set to "${this.DEFAULTS.BOX_SHADOW}".`); //do not detect css errors!
            data.box_shadow = this.DEFAULTS.BOX_SHADOW;
        }

        return data;

    }

    this.data = this.verifyData(this.data);




    




    //###################################
    //FUNCTION TO APPLY DATA TO THE IMAGE
    //###################################

    this.updateData = function(data) {
        if (imports.utils.IsUndefined(data)) throw "Image.updateData: data missing!";
        //NOTE: it is NOT possible to change the image id (data.id). A new image must be created in such case!

        if ( imports.utils.IsUndefined(data.id) ) {
            CustomLog("error","Image object: No ID specified!");
            return;
        }

        if (data.id === this.data.id) {//if he is the targeted element (remove executes for all objects!)
            //LOAD DATA
            this.data_backup = JSON.parse(JSON.stringify(this.data)); //keep a copy of the existing data
            this.data = data;//recollect data
            this.data.object_type = "image";

            //VERIFY DATA
            this.data = this.verifyData(this.data, "IGNORE_UNDEFINED");

            //APPLY DATA
            this.data = object_method.mergeData(this.data, this.data_backup); //simple assignement would overwrite existing data
            this.element.style.zIndex = this.data.layer;//layer
            this.element.style.width = this.data.width+"px";//width
            this.element.style.height = this.data.height+"px";//height
            this.element.style.left = this.data.x+"px";//x
            this.element.style.top = this.data.y+"px";//y
            this.element.style.transform = `rotate(${this.data.rotation}deg)`;//rotation
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
                        let url;
                        let full_path = `${working_dir}/temp/current_save/assets/${this.data.id}/background/${this.data.background.last_image}`
                        if (export_mode) url = object_method.fullPathToCSSPath(`${root_dir}/html`, full_path);
                        else url = object_method.fullPathToCSSPath(`${root_dir}`, full_path);
                        this.element.style.backgroundImage = `url("${url}")`;
                    } else {
                        this.element.style.backgroundImage = "";
                        this.element.style.backgroundColor = "#000000";
                    }
                    this.element.style.backgroundRepeat = this.data.background.repeat;
                    break;
            }
            this.element.style.backgroundSize = this.data.background.size;//background size
            this.element.style.borderRadius = this.data.border_radius;//
            this.element.style.boxShadow = this.data.box_shadow;
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
        this.parameter_container = new imports.ui_components.UIParameterRack(tab.objects, `UI-${this.data.id}`, this.data.name, '<i class="ri-image-fill"></i>', {
            default_closed: true,
        });
        this.parameter_container.delete_callback = () => {
            this.remove(this.data.id);
        }
        this.parameter_container.rename_callback = () => {
            InputDialog("Enter a new name for the object:", (result) => {
                this.updateData({id: this.data.id, name: result});
                this.parameter_container.rename(result);
            });
        }

        this.parameters = {
            layer: null,
            coordinates: null,
            size: null,
            rotation: null,
            border_radius: null,
            box_shadow: null,
        };

        //layer
        this.parameters.layer = new imports.ui_components.UIParameterNumInputList(
            this.parameter_container,
            "",
            false,
            [{
                title: "Layer :",
                unit: "",
                default_value: this.data.layer,
                min: 0,
                step: 1,
                callback: () => {
                    this.updateData({
                        id: this.data.id,
                        layer: parseInt(this.parameters.layer.value(0))
                    });
                }
            }]
        );
        this.parameters.layer.help_string = help.parameter.object.general.layer;

        // let thing = new imports.ui_components.UIButtonGrid(2 , 2, [
        //     [
        //         {
        //             innerHTML: '<i class="ri-file-edit-line"></i></i>',
        //             callback: (b) => {console.log("a" + b)}
        //         }, {
        //             innerHTML: '<i class="ri-file-edit-line"></i></i>',
        //             callback: (b) => {console.log("b" + b)}
        //         }
        //     ],[
        //         {
        //             innerHTML: '<i class="ri-file-edit-line"></i></i>',
        //             callback: (b) => {console.log("c" + b)}
        //         }, {
        //             innerHTML: '<i class="ri-file-edit-line"></i></i>',
        //             callback: (b) => {console.log("d" + b)}
        //         }
        //     ]
        // ], true);
        // thing.toggle(1,1);
        // thing.UI_parent = this.parameters.layer;

        //x and y
        this.parameters.coordinates = new imports.ui_components.UIParameterNumInputList(
            this.parameter_container,
            "",
            false,
            [{
                title: "X :",
                unit: "px",
                default_value: this.data.x,
                step: 1,
                callback: () => {
                    this.updateData({
                        id: this.data.id,
                        x: parseInt(this.parameters.coordinates.value(0))
                    });
                }
            },
            {
                title: "Y :",
                unit: "px",
                default_value: this.data.y,
                step: 1,
                callback: () => {
                    this.updateData({
                        id: this.data.id,
                        y: parseInt(this.parameters.coordinates.value(1))
                    });
                }
            }]
        );
        this.parameters.coordinates.help_string = help.parameter.object.general.pos;

        //width and height
        this.parameters.size = new imports.ui_components.UIParameterNumInputList(
            this.parameter_container,
            "",
            false,
            [{
                title: "Width :",
                unit: "px",
                default_value: this.data.width,
                min: 0,
                step: 1,
                callback: () => {
                    this.updateData({
                        id: this.data.id,
                        width: parseInt(this.parameters.size.value(0))
                    });
                }
            },
            {
                title: "Height :",
                unit: "px",
                default_value: this.data.height,
                min: 0,
                step: 1,
                callback: () => {
                    this.updateData({
                        id: this.data.id,
                        height: parseInt(this.parameters.size.value(1))
                    });
                }
            }]
        );
        this.parameters.size.help_string = help.parameter.object.general.size;

        //rotation
        this.parameters.rotation = new imports.ui_components.UIParameterNumInputList(
            this.parameter_container,
            "",
            false,
            [{
                title: "Rotation (degrees) :",
                unit: "°",
                default_value: this.data.rotation,
                min: 0,
                step: 1,
                callback: () => {
                    this.updateData({
                        id: this.data.id,
                        rotation: parseInt(this.parameters.rotation.value(0))
                    });
                }
            }]
        );
        this.parameters.rotation.help_string = help.parameter.object.general.rotation;

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

        //border radius
        this.parameters.border_radius = new imports.ui_components.UIParameterString(
            this.parameter_container,
            "Border radius (CSS)",
            this.data.border_radius,
            () => {
                this.updateData({
                    id: this.data.id,
                    border_radius: this.parameters.border_radius.value,
                });
            }
        );
        this.parameters.border_radius.help_string = help.parameter.object.general.border_radius;

        //box-shadow
        this.parameters.box_shadow = new imports.ui_components.UIParameterString(
            this.parameter_container,
            "Box Shadow (CSS)",
            this.data.box_shadow,
            () => {
                this.updateData({
                    id: this.data.id,
                    box_shadow: this.parameters.box_shadow.value,
                });
            }
        );
        this.parameters.box_shadow.help_string = help.parameter.object.general.shadow;

    }




    //#############################
    //FUNCTION TO ANIMATE THE IMAGE
    //#############################

    this.update = function() {
        //nothing (this cannot be removed, or it will trigger errors.)

        //finished updating
        return true;
    }




    //############################
    //FUNCTION TO REMOVE THE IMAGE
    //############################

    this.remove = function(id) {
        if (!imports.utils.IsAString(id)) throw `Image.remove: ${id} is not a valid ID.`;

        if (this.data.id === id) {//if he is the targeted element (remove executes for all objects!)
            //remove index
            var index = objects.indexOf(this);
            objects.splice(index, 1);

            //remove element
            this.element.remove();
        }
    }


    //END OF THE OBJECT
}