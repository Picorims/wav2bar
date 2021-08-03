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
    svg_filters: ?, (string, list of <filter> tag)
}*/

function Background(glob_data) {
    if (imports.utils.IsUndefined(glob_data)) throw "Background: data missing!";

    this.data = glob_data;//collect data
    this.data.object_type = "background";
    objects.push(this);//add the object to the list

    //default values
    this.DEFAULTS = {
        NAME: this.data.object_type,
        LAYER: 0,
        BACKGROUND: {
            TYPE: "color",
            LAST_COLOR: "#ffffff",
            LAST_GRADIENT: "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(255,255,255,1) 100%)",
            LAST_IMAGE: "",
            SIZE: "",
            REPEAT: "no-repeat",
        },
        SVG_FILTERS: "",
    };


    //########################################
    //VERIFY RECEIVED DATA, SET DEFAULT VALUES
    //########################################

    //Note: ignore_undefined is useful when we only want to verify the given values without setting any default value
    //(invalid data is still overwritten)

    this.verifyData = function(data, ignore_undefined) {
        if (imports.utils.IsUndefined(data)) throw "Background.verifyData: data missing!";
        if ( !imports.utils.IsUndefined(ignore_undefined) && !(ignore_undefined === "IGNORE_UNDEFINED") ) throw "Background.verifyData: IGNORE_UNDEFINED is the only valid node.";

        if ( imports.utils.IsUndefined(ignore_undefined) ) ignore_undefined = "";

        //ID
        if ( imports.utils.IsUndefined(data.id) || !imports.utils.IsAString(data.id) || !object_method.validID(data.id, this) ) {
            imports.utils.CustomLog("error","Background object: received an object with an unspecified/invalid ID! A random ID is given.");
            data.id = object_method.generateID();
        }

        //name
        if ( imports.utils.IsUndefined(data.name) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.name = this.DEFAULTS.NAME;}
        if ( !imports.utils.IsUndefined(data.name) && !imports.utils.IsAString(data.name) || data.name === "" ) {
            imports.utils.CustomLog("warn",`Background object: Invalid name! Set to '${this.DEFAULTS.NAME}'.`);
            data.name = this.DEFAULTS.NAME;
        }

        //layer
        if ( imports.utils.IsUndefined(data.layer) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.layer = this.DEFAULTS.LAYER;}
        if ( !imports.utils.IsUndefined(data.layer) && (!imports.utils.IsAnInt(data.layer) || (data.layer <= -1)) ) {
            imports.utils.CustomLog("warn",`Background object: Invalid layer! Set to ${this.DEFAULTS.LAYER}.`);
            data.layer = this.DEFAULTS.LAYER;
        }

        //background
        if ( imports.utils.IsUndefined(data.background) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.background = {type: null, last_color: null, last_gradient: null, last_image: null};}

        if (!imports.utils.IsUndefined(data.background)) {//it is undefined if it has not been set before in the data argument and IGNORE_UNDEFINED is active

            //type
            if ( imports.utils.IsUndefined(data.background.type) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.background.type = this.DEFAULTS.BACKGROUND.TYPE;}
            if ( !imports.utils.IsUndefined(data.background.type) && (!imports.utils.IsAString(data.background.type) || ( (data.background.type !== "color") && (data.background.type !== "gradient") && (data.background.type !== "image") )) ) {
                imports.utils.CustomLog("warn",`Background object: Invalid background type! Set to ${this.DEFAULTS.BACKGROUND.TYPE}.`);
                data.background.type = this.DEFAULTS.BACKGROUND.TYPE;
            }

            //last color
            if ( imports.utils.IsUndefined(data.background.last_color) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.background.last_color = this.DEFAULTS.BACKGROUND.LAST_COLOR;}
            if ( !imports.utils.IsUndefined(data.background.last_color) && !imports.utils.IsAString(data.background.last_color) ) {
                imports.utils.CustomLog("warn",`Background object: Invalid background color! Set to ${this.DEFAULTS.BACKGROUND.LAST_COLOR}.`); //do not detect css errors!
                data.background.last_color = this.DEFAULTS.BACKGROUND.LAST_COLOR;
            }

            //last gradient
            if ( imports.utils.IsUndefined(data.background.last_gradient) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.background.last_gradient = this.DEFAULTS.BACKGROUND.LAST_GRADIENT;}
            if ( !imports.utils.IsUndefined(data.background.last_gradient) && !imports.utils.IsAString(data.background.last_gradient) ) {
                imports.utils.CustomLog("warn",`Background object: Invalid background gradient! Set to ${this.DEFAULTS.BACKGROUND.LAST_GRADIENT}.`); //do not detect css errors!
                data.background.last_gradient = this.DEFAULTS.BACKGROUND.LAST_GRADIENT;
            }

            //last image
            if ( imports.utils.IsUndefined(data.background.last_image) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.background.last_image = this.DEFAULTS.BACKGROUND.LAST_IMAGE;}
            if ( !imports.utils.IsUndefined(data.background.last_image) && !imports.utils.IsAString(data.background.last_image) ) {
                imports.utils.CustomLog("warn","Background object: Invalid background image! Value ignored."); //do not detect css errors!
                data.background.last_image = this.DEFAULTS.BACKGROUND.LAST_IMAGE;
            }

            //size
            if ( imports.utils.IsUndefined(data.background.size) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.background.size = this.DEFAULTS.BACKGROUND.SIZE;}
            if ( !imports.utils.IsUndefined(data.background.size) && !imports.utils.IsAString(data.background.size) ) {
                imports.utils.CustomLog("warn",`Background object: Invalid size! Set to "${this.DEFAULTS.BACKGROUND.SIZE}".`); //do not detect css errors!
                data.background.size = this.DEFAULTS.BACKGROUND.SIZE;
            }

            //repeat
            if ( imports.utils.IsUndefined(data.background.repeat) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.background.repeat = this.DEFAULTS.BACKGROUND.REPEAT;}
            if ( !imports.utils.IsUndefined(data.background.repeat) && (!imports.utils.IsAString(data.background.repeat) || ( (data.background.repeat !== "no-repeat") && (data.background.repeat !== "repeat") && (data.background.repeat !== "repeat-x") && (data.background.repeat !== "repeat-y") )) ) {
                imports.utils.CustomLog("warn",`Background object: Invalid repeat type! Set to "${this.DEFAULTS.BACKGROUND.REPEAT}".`);
                data.background.repeat = this.DEFAULTS.BACKGROUND.REPEAT;
            }

        }

        //svg filter
        if ( imports.utils.IsUndefined(data.svg_filters) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.svg_filters = this.DEFAULTS.SVG_FILTERS;}
        if ( !imports.utils.IsUndefined(data.svg_filters) && data.svg_filters !== "" && (!imports.utils.IsAString(data.svg_filters) || data.svg_filters.includes("<script>") || !data.svg_filters.includes("<filter") || !data.svg_filters.includes("</filter>")) ) {
            imports.utils.CustomLog("warn",`Visualizer object: Invalid svg filters! Set to "${this.DEFAULTS.SVG_FILTERS}".`); //do not detect html errors!
            data.svg_filters = this.DEFAULTS.SVG_FILTERS;
        }

        return data;

    }

    this.data = this.verifyData(this.data);




    





    //########################################
    //FUNCTION TO APPLY DATA TO THE BACKGROUND
    //########################################

    this.updateData = function(data) {
        if (imports.utils.IsUndefined(data)) throw "Background.updateData: data missing!";
        //NOTE: it is NOT possible to change the background id (data.id). A new background must be created in such case!

        if ( imports.utils.IsUndefined(data.id) ) {
            imports.utils.CustomLog("error","Background object: No ID specified!");
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
            this.data = object_method.mergeData(this.data, this.data_backup); //simple assignement would overwrite existing data
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
            this.element.style.backgroundSize = this.data.background.size;//size
            //svg filters
            if (this.data.svg_filters !== "") {
                this.svg_filter_div.children[0].children[0].innerHTML = "";
                let str = "";
                let filters = this.data.svg_filters.split("[#]");
                for (let i = 0; i < filters.length; i++) {
                    let id = `${this.data.id}-FILTER-${i}`;
                    //load filter
                    filters[i] = filters[i].replace(/id=".*?"/,"").replace("<filter",`<filter id="${id}"`);
                    this.svg_filter_div.children[0].children[0].innerHTML += filters[i];
                    //add in css
                    let strToAdd = `url('#${id}')`;
                    str += strToAdd;
                    //spacing
                    if (i < filters.length-1) str += " ";
                }
                this.element.style.filter = str;
                console.log(str);
            }

            //SET BACKGROUND TO SCREEN SIZE
            this.element.style.width = save_handler.save_data.screen.width + "px";
            this.element.style.height = save_handler.save_data.screen.height + "px";
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

    //svg filters
    this.svg_filter_div = document.createElement("div");
    document.body.appendChild(this.svg_filter_div);
    this.svg_filter_div.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' version='1.1'><defs></defs></svg>";




    //#############################
    //APPLY DATA FOR THE FIRST TIME
    //#############################
    this.updateData(this.data);





    //#####################
    //CREATE USER INTERFACE
    //#####################
    if (!export_mode) {
        //create category
        this.parameter_container = new imports.ui_components.UIParameterRack(tab.objects, `UI-${this.data.id}`, this.data.name, '<i class="ri-landscape-fill"></i>', {
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
            svg_filters: null,
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

        //background
        let bgnd_size_array = this.data.background.size.split(" ");
        let def_size_type, def_size_x, def_size_y;
        let val_percent_regex = new RegExp(/[0-9]+%/);//no g flag so it doesn't keep track of last index
        if (bgnd_size_array[0] === "contain") {
            def_size_type = "contain";
            def_size_x = def_size_y = "100";
        } else if (bgnd_size_array[0] === "cover") {
            def_size_type = "cover";
            def_size_x = def_size_y = "100";
        } else if ( bgnd_size_array.length === 1 && val_percent_regex.test(bgnd_size_array[0]) ) {
            def_size_type = "scale_size_control";
            def_size_x = bgnd_size_array[0].replace("%","");
            def_size_y = "100";
        } else if ( bgnd_size_array.length === 2 && val_percent_regex.test(bgnd_size_array[0]) && val_percent_regex.test(bgnd_size_array[1]) ) {
            def_size_type = "width_height_size_control";
            def_size_x = bgnd_size_array[0].replace("%","");
            def_size_y = bgnd_size_array[1].replace("%","");
        } else {
            def_size_type = "cover";
            def_size_x = def_size_y = "100";
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
                    default_size_x: parseFloat(def_size_x),
                    default_size_y: parseFloat(def_size_y),
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
        
        //svg filter
        this.parameters.svg_filters = new imports.ui_components.UIParameterString(
            this.parameter_container,
            "SVG Filters (advanced, read help)",
            this.data.svg_filters,
            () => {
                this.updateData({
                    id: this.data.id,
                    svg_filters: this.parameters.svg_filters.value,
                });
            }
        );
        this.parameters.svg_filters.help_string = help.parameter.object.general.svg_filters;

    }






    //##################################
    //FUNCTION TO ANIMATE THE BACKGROUND
    //##################################

    this.update = function() {
        this.element.style.width = save_handler.save_data.screen.width+"px";
        this.element.style.height = save_handler.save_data.screen.height+"px";

        //finished updating
        return true;
    }




    //####################################
    //FUNCTION TO REMOVE THE PARTICLE FLOW
    //####################################

    this.remove = function(id) {
        if (!imports.utils.IsAString(id)) throw `Background.remove: ${id} is not a valid ID.`;

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