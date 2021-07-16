//MIT License - Copyright (c) 2020-2021 Picorims

//TIMER OBJECT PROCESS

/*data = {
    object_type: "timer",
    id: ?, (UUID)
    name: ?, (string)
    layer: ?, (integer)
    x: ?, (px)
    y: ?, (px)
    width: ?, (px)
    height: ?, (px)
    rotation: ?, (deg)
    type: ("bar"||"point"),
    color: ?, (string: hex, rgb, rgba)
    border_to_bar_space: ?, (px)
    border_thickness: ?, (px)
    border_radius: ?, (string, css border-radius)
    box_shadow: ?, (string, css box-shadow)
}*/

function Timer(glob_data) {
    if (imports.utils.IsUndefined(glob_data)) throw "Timer: data missing!";

    this.data = glob_data;//collect data
    this.data.object_type = "timer";
    objects.push(this);//add the object to the list

    //default values
    this.DEFAULTS = {
        NAME: this.data.object_type,
        LAYER: 0,
        X: 0,
        Y: 0,
        WIDTH: 100,
        HEIGHT: 10,
        ROTATION: 0,
        TYPE: "bar",
        COLOR: "#ffffff",
        BORDER_TO_BAR_SPACE: 2,
        BORDER_THICKNESS: 2,
        BORDER_RADIUS: "",
        BOX_SHADOW: "",
    };


    //########################################
    //VERIFY RECEIVED DATA, SET DEFAULT VALUES
    //########################################

    //Note: ignore_undefined is useful when we only want to verify the given values without setting any default value
    //(invalid data is still overwritten)

    this.verifyData = function(data, ignore_undefined) {
        if (imports.utils.IsUndefined(data)) throw "Timer.verifyData: data missing!";
        if ( !imports.utils.IsUndefined(ignore_undefined) && !(ignore_undefined === "IGNORE_UNDEFINED") ) throw "Timer.verifyData: IGNORE_UNDEFINED is the only valid node.";


        if ( imports.utils.IsUndefined(ignore_undefined) ) ignore_undefined = "";

        //ID
        if ( imports.utils.IsUndefined(data.id) || !imports.utils.IsAString(data.id) || !object_method.validID(data.id, this) ) {
            CustomLog("error","Timer object: received an object with an unspecified/invalid ID! A random ID is given.");
            data.id = object_method.generateID();
        }

        //name
        if ( imports.utils.IsUndefined(data.name) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.name = this.DEFAULTS.NAME;}
        if ( !imports.utils.IsUndefined(data.name) && !imports.utils.IsAString(data.name) || data.name === "" ) {
            CustomLog("warn",`Timer object: Invalid name! Set to '${this.DEFAULTS.NAME}'.`);
            data.name = this.DEFAULTS.NAME;
        }

        //layer
        if ( imports.utils.IsUndefined(data.layer) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.layer = this.DEFAULTS.LAYER;}
        if ( !imports.utils.IsUndefined(data.layer) && (!imports.utils.IsAnInt(data.layer) || (data.layer <= -1)) ) {
            CustomLog("warn",`Timer object: Invalid layer! Set to ${this.DEFAULTS.LAYER}.`);
            data.layer = this.DEFAULTS.LAYER;
        }

        //x
        if ( imports.utils.IsUndefined(data.x) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.x = this.DEFAULTS.X;}
        if ( !imports.utils.IsUndefined(data.x) && !imports.utils.IsAnInt(data.x) ) {
            CustomLog("warn",`Timer object: Invalid x coordinate! Set to ${this.DEFAULTS.X}.`);
            data.x = this.DEFAULTS.X;
        }

        //y
        if ( imports.utils.IsUndefined(data.y) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.y = this.DEFAULTS.Y;}
        if ( !imports.utils.IsUndefined(data.y) && !imports.utils.IsAnInt(data.y) ) {
            CustomLog("warn",`Timer object: Invalid y coordinate! Set to ${this.DEFAULTS.Y}.`);
            data.y = this.DEFAULTS.Y;
        }

        //width
        if ( imports.utils.IsUndefined(data.width) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.width = this.DEFAULTS.WIDTH;}
        if ( !imports.utils.IsUndefined(data.width) && (!imports.utils.IsAnInt(data.width) || (data.width < 0)) ) {
            CustomLog("warn",`Timer object: Invalid width! Set to ${this.DEFAULTS.WIDTH}.`);
            data.width = this.DEFAULTS.WIDTH;
        }

        //height
        if ( imports.utils.IsUndefined(data.height) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.height = this.DEFAULTS.HEIGHT;}
        if ( !imports.utils.IsUndefined(data.height) && (!imports.utils.IsAnInt(data.height) || (data.height < 0)) ) {
            CustomLog("warn",`Timer object: Invalid height! Set to ${this.DEFAULTS.HEIGHT}.`);
            data.height = this.DEFAULTS.HEIGHT;
        }

        //rotation
        if ( imports.utils.IsUndefined(data.rotation) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.rotation = this.DEFAULTS.ROTATION;}
        if ( !imports.utils.IsUndefined(data.rotation) && !imports.utils.IsAnInt(data.rotation) ) {
            CustomLog("warn",`Timer object: Invalid rotation! Set to ${this.DEFAULTS.ROTATION}.`);
            data.rotation = this.DEFAULTS.ROTATION;
        }

        //type
        if ( imports.utils.IsUndefined(data.type) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.type = this.DEFAULTS.TYPE;}
        if ( !imports.utils.IsUndefined(data.type) && (!imports.utils.IsAString(data.type) || ( (data.type !== "bar") && (data.type !== "point") )) ) {
            CustomLog("warn",`Timer object: Invalid type! Set to ${this.DEFAULTS.TYPE}.`);
            data.type = this.DEFAULTS.TYPE;
        }

        //color
        if ( imports.utils.IsUndefined(data.color) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.color = this.DEFAULTS.COLOR;}
        if ( !imports.utils.IsUndefined(data.color) && !imports.utils.IsAString(data.color) ) {
            CustomLog("warn",`Timer object: Invalid color! Set to ${this.DEFAULTS.COLOR}.`); //do not detect css errors!
            data.color = this.DEFAULTS.COLOR;
        }

        //border to bar space
        if ( imports.utils.IsUndefined(data.border_to_bar_space) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.border_to_bar_space = this.DEFAULTS.BORDER_TO_BAR_SPACE;}
        if ( !imports.utils.IsUndefined(data.border_to_bar_space) && (!imports.utils.IsAnInt(data.border_to_bar_space) || (data.border_to_bar_space < 0)) ) {
            CustomLog("warn",`Timer object: Invalid border to bar space! Set to ${this.DEFAULTS.BORDER_TO_BAR_SPACE}.`);
            data.border_to_bar_space = this.DEFAULTS.BORDER_TO_BAR_SPACE;
        }

        //border thickness
        if ( imports.utils.IsUndefined(data.border_thickness) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.border_thickness = this.DEFAULTS.BORDER_THICKNESS;}
        if ( !imports.utils.IsUndefined(data.border_thickness) && (!imports.utils.IsAnInt(data.border_thickness) || (data.border_thickness < 0)) ) {
            CustomLog("warn",`Timer object: Invalid border thickness! Set to ${this.DEFAULTS.BORDER_THICKNESS}.`);
            data.border_thickness = this.DEFAULTS.BORDER_THICKNESS;
        }

        //border-radius
        if ( imports.utils.IsUndefined(data.border_radius) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.border_radius = this.DEFAULTS.BORDER_RADIUS;}
        if ( !imports.utils.IsUndefined(data.border_radius) && !imports.utils.IsAString(data.border_radius) ) {
            CustomLog("warn",`Timer object: Invalid border-radius! Set to "${this.DEFAULTS.BORDER_RADIUS}".`); //do not detect css errors!
            data.border_radius = this.DEFAULTS.BORDER_RADIUS;
        }

        //box-shadow
        if ( imports.utils.IsUndefined(data.box_shadow) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.box_shadow = this.DEFAULTS.BOX_SHADOW;}
        if ( !imports.utils.IsUndefined(data.box_shadow) && !imports.utils.IsAString(data.box_shadow) ) {
            CustomLog("warn",`Timer object: Invalid box-shadow! Set to "${this.DEFAULTS.BOX_SHADOW}".`); //do not detect css errors!
            data.box_shadow = this.DEFAULTS.BOX_SHADOW;
        }

        return data;

    }

    this.data = this.verifyData(this.data);




    



    //###################################
    //FUNCTION TO APPLY DATA TO THE TIMER
    //###################################

    this.updateData = function(data) {
        if (imports.utils.IsUndefined(data)) throw "Timer.updateData: data missing!";
        //NOTE: it is NOT possible to change the timer type (data.type) and id (data.id). A new timer must be created in such case!

        if ( imports.utils.IsUndefined(data.id) ) {
            CustomLog("error","Timer object: No ID specified!");
            return;
        }

        if (data.id === this.data.id) {//if he is the targeted element (remove executes for all objects!)
            //LOAD DATA
            this.data_backup = JSON.parse(JSON.stringify(this.data)); //keep a copy of the existing data
            this.data = data;//recollect data
            this.data.object_type = "timer";

            //VERIFY DATA
            this.data = this.verifyData(this.data, "IGNORE_UNDEFINED");

            //APPLY DATA
            this.data = object_method.mergeData(this.data, this.data_backup); //simple assignement would overwrite existing data
            this.element.style.zIndex = this.data.layer;//layer
            this.element.style.width = this.data.width+"px";//width
            if (this.data.type === "bar") this.element.style.height = this.data.height+"px";//height
            this.element.style.left = this.data.x+"px";//x
            this.element.style.top = this.data.y+"px";//y
            this.element.style.transform = `rotate(${this.data.rotation}deg)`;//rotation
            this.element.style.border = `${this.data.border_thickness}px solid ${this.data.color}`;//color, border_thickness
            this.element.style.borderRadius = this.data.border_radius;//border_radius
            this.element.style.boxShadow = this.data.box_shadow;//box_shadow



            //APPLY DATA TO CHILD ELEMENT
            var child = this.element.child;
            child.style.zIndex = this.data.layer;//layer
            child.style.backgroundColor = this.data.color;//color
            child.style.boxShadow = this.data.box_shadow;//box_shadow

            if (this.data.type === "bar") {
                child.style.top = this.data.border_to_bar_space + "px";
                child.style.left = this.data.border_to_bar_space + "px";
                child.style.width = (this.data.width - 2*this.data.border_to_bar_space) + "px";//width
                child.style.height = (this.data.height - 2*this.data.border_to_bar_space) + "px";//height
                child.style.borderRadius = this.data.border_radius;//border_radius
            } else if (this.data.type === "point") {
                child.style.top = -(this.data.height/2) + "px";
                child.style.left = -(this.data.height/2) + "px";
                child.style.width = this.data.height + "px";
                child.style.height = this.data.height + "px";//height
                child.style.borderRadius = (this.data.height/2) + "px";//border_radius
            }

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

    //child
    this.element.child = document.createElement("div");
    this.element.appendChild(this.element.child)
    this.element.child.style.position = "absolute";
    this.element.child.style.display = "inline-block";



    //#############################
    //APPLY DATA FOR THE FIRST TIME
    //#############################
    this.updateData(this.data);




    //#####################
    //CREATE USER INTERFACE
    //#####################
    if (!export_mode) {

        //create category
        this.parameter_container = new imports.ui_components.UIParameterRack(tab.objects, `UI-${this.data.id}`, this.data.name, '<i class="ri-timer-2-line"></i>', {
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
            color: null,
            border_to_bar_space: null,
            border_thickness: null,
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

        //x and y
        this.parameters.coordinates = new imports.ui_components.UIParameterInputsAndButtonGrid(
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
            }],
            2, 3, [
                [
                    {
                        innerHTML: '<i class="ri-align-left"></i>',
                        callback: () => {
                            this.parameters.coordinates.forceValue(0, 0, true);
                        }
                    },{
                        innerHTML: '<i class="ri-align-center"></i>',
                        callback: () => {
                            let pos = current_save.screen.width/2 - this.data.width/2;
                            this.parameters.coordinates.forceValue(0, pos, true);
                        }
                    },{
                        innerHTML: '<i class="ri-align-right"></i>',
                        callback: () => {
                            let pos = current_save.screen.width - this.data.width;
                            this.parameters.coordinates.forceValue(0, pos, true);
                        }
                    }
                ],[
                    {
                        innerHTML: '<i class="ri-align-top"></i>',
                        callback: () => {
                            this.parameters.coordinates.forceValue(1, 0, true);
                        }
                    },{
                        innerHTML: '<i class="ri-align-vertically"></i>',
                        callback: () => {
                            let pos = current_save.screen.height/2 - this.data.height/2;
                            this.parameters.coordinates.forceValue(1, pos, true);
                        }
                    },{
                        innerHTML: '<i class="ri-align-bottom"></i>',
                        callback: () => {
                            let pos = current_save.screen.height - this.data.height;
                            this.parameters.coordinates.forceValue(1, pos, true);
                        }
                    }
                ]
            ], false
        );
        this.parameters.coordinates.help_string = help.parameter.object.general.pos;

        //width and height
        this.parameters.size = new imports.ui_components.UIParameterInputsAndButtonGrid(
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
            }],
            1, 3, [
                [
                    {
                        innerHTML: '&#11020;',
                        callback: () => {
                            this.parameters.size.forceValue(0, current_save.screen.width, true);
                        }
                    },{
                        innerHTML: '&#11021;',
                        callback: () => {
                            this.parameters.size.forceValue(1, current_save.screen.height, true);
                        }
                    },{
                        innerHTML: '<i class="ri-fullscreen-line"></i>',
                        callback: () => {
                            this.parameters.size.forceValue(0, current_save.screen.width, true);
                            this.parameters.size.forceValue(1, current_save.screen.height, true);
                        }
                    }
                ]
            ], false
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

        //color
        this.parameters.color = new imports.ui_components.UIParameterColor(
            this.parameter_container,
            "Color (hex, rgb, rgba)",
            this.data.color,
            () => {
                this.updateData({
                    id: this.data.id,
                    color: this.parameters.color.value,
                });
            }
        );
        this.parameters.color.help_string = help.parameter.object.general.color;

        //border to bar space
        this.parameters.border_to_bar_space = new imports.ui_components.UIParameterNumInputList(
            this.parameter_container,
            "",
            false,
            [{
                title: "Bar timer inner spacing :",
                unit: "px",
                default_value: this.data.border_to_bar_space,
                min: 0,
                step: 1,
                callback: () => {
                    this.updateData({
                        id: this.data.id,
                        border_to_bar_space: parseInt(this.parameters.border_to_bar_space.value(0))
                    });
                }
            }]
        );
        this.parameters.border_to_bar_space.help_string = help.parameter.object.timer.space_between;

        this.parameters.border_thickness = new imports.ui_components.UIParameterNumInputList(
            this.parameter_container,
            "",
            false,
            [{
                title: "Border thickness :",
                unit: "px",
                default_value: this.data.border_thickness,
                min: 0,
                step: 1,
                callback: () => {
                    this.updateData({
                        id: this.data.id,
                        border_thickness: parseInt(this.parameters.border_thickness.value(0))
                    });
                }
            }]
        );
        this.parameters.border_thickness.help_string = help.parameter.object.timer.border_thickness;


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





    //############################
    //FUNCTION TO ANIMATE THE TEXT
    //############################

    this.update = function() {
        if (this.data.type === "bar") {
            this.element.child.style.width = ( (this.data.width - 2*this.data.border_to_bar_space) * (current_time / audio_duration) ) + "px";
        } else if (this.data.type === "point") {
            this.element.child.style.left = ( -(this.data.height/2) + this.data.width * (current_time / audio_duration) ) + "px";
        }

        //finished updating
        return true;
    }



    //###########################
    //FUNCTION TO REMOVE THE TEXT
    //###########################

    this.remove = function(id) {
        if (!imports.utils.IsAString(id)) throw `Timer.remove: ${id} is not a valid ID.`;

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