//MIT License - Copyright (c) 2020-2021 Picorims

//TEXT OBJECT PROCESS

/*data = {
    object_type: "text",
    id: ?, (UUID)
    name: ?, (string)
    layer: ?, (integer)
    x: ?, (px)
    y: ?, (px)
    width: ?, (px)
    height: ?, (px)
    rotation: ?, (deg)
    type: ("any"||"time"),
    text: "", (string)
    font_size: ?, (px)
    color: ?, (string: hex, rgb, rgba)
    italic: true/false, (bool)
    bold: true/false, (bool)
    underline: true/false, (bool)
    overline: true/false, (bool)
    line_through: true/false, (bool)
    text_align: ("left"||"center"||"right"),
    text_shadow: ?, (string, css text-shadow)
}*/

function Text(glob_data) {
    if (imports.utils.IsUndefined(glob_data)) throw "Text: data missing!";

    this.data = glob_data;//collect data
    this.data.object_type = "text";
    objects.push(this);//add the object to the list

    //default values
    this.DEFAULTS = {
        NAME: this.data.object_type,
        LAYER: 0,
        X: 0,
        Y: 0,
        WIDTH: 400,
        HEIGHT: 100,
        ROTATION: 0,
        TYPE: "any",
        TEXT: "Displayed Text",
        FONT_SIZE: 20,
        COLOR: "#ffffff",
        ITALIC: false,
        BOLD: false,
        UNDERLINE: false,
        OVERLINE: false,
        LINE_THROUGH: false,
        TEXT_ALIGN: "center",
        TEXT_SHADOW: "",
    };


    //########################################
    //VERIFY RECEIVED DATA, SET DEFAULT VALUES
    //########################################

    //Note: ignore_undefined is useful when we only want to verify the given values without setting any default value
    //(invalid data is still overwritten)

    this.verifyData = function(data, ignore_undefined) {
        if (imports.utils.IsUndefined(data)) throw "Text.verifyData: data missing!";
        if ( !imports.utils.IsUndefined(ignore_undefined) && !(ignore_undefined === "IGNORE_UNDEFINED") ) throw "Text.verifyData: IGNORE_UNDEFINED is the only valid node.";

        if ( imports.utils.IsUndefined(ignore_undefined) ) ignore_undefined = "";

        //ID
        if ( imports.utils.IsUndefined(data.id) || !imports.utils.IsAString(data.id) || !object_method.validID(data.id, this) ) {
            CustomLog("error","Text object: received an object with an unspecified/invalid ID! A random ID is given.");
            data.id = object_method.generateID();
        }

        //name
        if ( imports.utils.IsUndefined(data.name) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.name = this.DEFAULTS.NAME;}
        if ( !imports.utils.IsUndefined(data.name) && !imports.utils.IsAString(data.name) || data.name === "" ) {
            CustomLog("warn",`Text object: Invalid name! Set to '${this.DEFAULTS.NAME}'.`);
            data.name = this.DEFAULTS.NAME;
        }

        //layer
        if ( imports.utils.IsUndefined(data.layer) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.layer = this.DEFAULTS.LAYER;}
        if ( !imports.utils.IsUndefined(data.layer) && (!imports.utils.IsAnInt(data.layer) || (data.layer <= -1)) ) {
            CustomLog("warn",`Text object: Invalid layer! Set to ${this.DEFAULTS.LAYER}.`);
            data.layer = this.DEFAULTS.LAYER;
        }

        //x
        if ( imports.utils.IsUndefined(data.x) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.x = this.DEFAULTS.X;}
        if ( !imports.utils.IsUndefined(data.x) && !imports.utils.IsAnInt(data.x) ) {
            CustomLog("warn",`Text object: Invalid x coordinate! Set to ${this.DEFAULTS.X}.`);
            data.x = this.DEFAULTS.X;
        }

        //y
        if ( imports.utils.IsUndefined(data.y) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.y = this.DEFAULTS.Y;}
        if ( !imports.utils.IsUndefined(data.y) && !imports.utils.IsAnInt(data.y) ) {
            CustomLog("warn",`Text object: Invalid y coordinate! Set to ${this.DEFAULTS.Y}.`);
            data.y = this.DEFAULTS.Y;
        }

        //width
        if ( imports.utils.IsUndefined(data.width) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.width = this.DEFAULTS.WIDTH;}
        if ( !imports.utils.IsUndefined(data.width) && (!imports.utils.IsAnInt(data.width) || (data.width < 0)) ) {
            CustomLog("warn",`Text object: Invalid width! Set to ${this.DEFAULTS.WIDTH}.`);
            data.width = this.DEFAULTS.WIDTH;
        }

        //height
        if ( imports.utils.IsUndefined(data.height) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.height = this.DEFAULTS.HEIGHT;}
        if ( !imports.utils.IsUndefined(data.height) && (!imports.utils.IsAnInt(data.height) || (data.height < 0)) ) {
            CustomLog("warn",`Text object: Invalid height! Set to ${this.DEFAULTS.HEIGHT}.`);
            data.height = this.DEFAULTS.HEIGHT;
        }

        //rotation
        if ( imports.utils.IsUndefined(data.rotation) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.rotation = this.DEFAULTS.ROTATION;}
        if ( !imports.utils.IsUndefined(data.rotation) && !imports.utils.IsAnInt(data.rotation) ) {
            CustomLog("warn",`Text object: Invalid rotation! Set to ${this.DEFAULTS.ROTATION}.`);
            data.rotation = this.DEFAULTS.ROTATION;
        }

        //type
        if ( imports.utils.IsUndefined(data.type) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.type = this.DEFAULTS.TYPE;}
        if ( !imports.utils.IsUndefined(data.type) && (!imports.utils.IsAString(data.type) || ( (data.type !== "any") && (data.type !== "time") )) ) {
            CustomLog("warn",`Text object: Invalid type! Set to ${this.DEFAULTS.TYPE}.`);
            data.type = this.DEFAULTS.TYPE;
        }

        //text
        if ( imports.utils.IsUndefined(data.text) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.text = this.DEFAULTS.TEXT;}
        if ( !imports.utils.IsUndefined(data.text) && (!imports.utils.IsAString(data.text) || (data.text.indexOf("\\") > -1)) ) {
            CustomLog("warn",`Text object: Invalid text! Set to "${this.DEFAULTS.TEXT}". (backslashes '\\' are not allowed)`);
            data.text = this.DEFAULTS.TEXT;
        }

        //font size
        if ( imports.utils.IsUndefined(data.font_size) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.font_size = this.DEFAULTS.FONT_SIZE;}
        if ( !imports.utils.IsUndefined(data.font_size) && (!imports.utils.IsAnInt(data.font_size) || (data.font_size < 0)) ) {
            CustomLog("warn",`Text object: Invalid font size! Set to ${this.DEFAULTS.FONT_SIZE}.`); //do not detect css errors!
            data.font_size = this.DEFAULTS.FONT_SIZE;
        }

        //color
        if ( imports.utils.IsUndefined(data.color) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.color = this.DEFAULTS.COLOR;}
        if ( !imports.utils.IsUndefined(data.color) && !imports.utils.IsAString(data.color) ) {
            CustomLog("warn",`Text object: Invalid color! Set to ${this.DEFAULTS.COLOR}.`); //do not detect css errors!
            data.color = this.DEFAULTS.COLOR;
        }

        //italic
        if ( imports.utils.IsUndefined(data.italic) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.italic = this.DEFAULTS.ITALIC;}
        if ( !imports.utils.IsUndefined(data.italic) && !imports.utils.IsABoolean(data.italic) ) {
            CustomLog("warn",`Text object: Invalid status for italic! Set to ${this.DEFAULTS.ITALIC}.`);
            data.italic = this.DEFAULTS.ITALIC;
        }

        //bold
        if ( imports.utils.IsUndefined(data.bold) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.bold = this.DEFAULTS.BOLD;}
        if ( !imports.utils.IsUndefined(data.bold) && !imports.utils.IsABoolean(data.bold) ) {
            CustomLog("warn",`Text object: Invalid status for bold! Set to ${this.DEFAULTS.BOLD}.`);
            data.bold = this.DEFAULTS.BOLD;
        }

        //underline
        if ( imports.utils.IsUndefined(data.underline) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.underline = this.DEFAULTS.UNDERLINE;}
        if ( !imports.utils.IsUndefined(data.underline) && !imports.utils.IsABoolean(data.underline) ) {
            CustomLog("warn",`Text object: Invalid status for underline! Set to ${this.DEFAULTS.UNDERLINE}.`);
            data.underline = this.DEFAULTS.UNDERLINE;
        }

        //overline
        if ( imports.utils.IsUndefined(data.overline) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.overline = this.DEFAULTS.OVERLINE;}
        if ( !imports.utils.IsUndefined(data.overline) && !imports.utils.IsABoolean(data.overline) ) {
            CustomLog("warn",`Text object: Invalid status for overline! Set to ${this.DEFAULTS.OVERLINE}.`);
            data.overline = this.DEFAULTS.OVERLINE;
        }

        //line-through
        if ( imports.utils.IsUndefined(data.line_through) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.line_through = this.DEFAULTS.LINE_THROUGH;}
        if ( !imports.utils.IsUndefined(data.line_through) && !imports.utils.IsABoolean(data.line_through) ) {
            CustomLog("warn",`Text object: Invalid status for line-through! Set to ${this.DEFAULTS.LINE_THROUGH}.`);
            data.line_through = this.DEFAULTS.LINE_THROUGH;
        }

        //text align
        if ( imports.utils.IsUndefined(data.text_align) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.text_align = this.DEFAULTS.TEXT_ALIGN;}
        if ( !imports.utils.IsUndefined(data.text_align) && (!imports.utils.IsAString(data.text_align) || ( (data.text_align !== "left") && (data.text_align !== "center") && (data.text_align !== "right") )) ) {
            CustomLog("warn",`Text object: Invalid text align! Set to ${this.DEFAULTS.TEXT_ALIGN}.`);
            data.text_align = this.DEFAULTS.TEXT_ALIGN;
        }

        //text shadow
        if ( imports.utils.IsUndefined(data.text_shadow) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.text_shadow = this.DEFAULTS.TEXT_SHADOW;}
        if ( !imports.utils.IsUndefined(data.text_shadow) && !imports.utils.IsAString(data.text_shadow) ) {
            CustomLog("warn",`Text object: Invalid text-shadow! Set to ${this.DEFAULTS.TEXT_SHADOW}.`); //do not detect css errors!
            data.text_shadow = this.DEFAULTS.TEXT_SHADOW;
        }

        return data;

    }

    this.data = this.verifyData(this.data);






    //##################################
    //FUNCTION TO APPLY DATA TO THE TEXT
    //##################################

    this.updateData = function(data) {
        if (imports.utils.IsUndefined(data)) throw "Text.updateData: data missing!";

        //NOTE: it is NOT possible to change the text id (data.id). A new text must be created in such case!

        if ( imports.utils.IsUndefined(data.id) ) {
            CustomLog("error","Text object: No ID specified!");
            return;
        }

        if (data.id === this.data.id) {//if he is the targeted element (remove executes for all objects!)
            //LOAD DATA
            this.data_backup = JSON.parse(JSON.stringify(this.data)); //keep a copy of the existing data
            this.data = data;//recollect data
            this.data.object_type = "text";

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
            this.element.innerHTML = this.data.text;//text
            this.element.style.fontSize = this.data.font_size+"px";//font_size
            this.element.style.color = this.data.color;//color
            this.element.style.fontStyle = (this.data.italic)? "italic":"";//italic
            this.element.style.fontWeight = (this.data.bold)? "bold":"";//bold
            //underline, overline, line-trough
            var underline = (this.data.underline)? "underline":"";
            var overline = (this.data.overline)? "overline":"";
            var line_through = (this.data.line_through)? "line-through":"";
            this.element.style.textDecoration = ` ${underline} ${overline} ${line_through}`;
            if (!this.data.underline && !this.data.overline && !this.data.line_through) this.element.style.textDecoration = ""; //fixes css not updating
            this.element.style.textAlign = this.data.text_align;//text align
            this.element.style.textShadow = this.data.text_shadow;//text shadow
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
    this.element.style.overflowWrap = "break-word";



    //#############################
    //APPLY DATA FOR THE FIRST TIME
    //#############################
    this.updateData(this.data);




    //#####################
    //CREATE USER INTERFACE
    //#####################
    if (!export_mode) {

        //create category
        this.parameter_container = new imports.ui_components.UIParameterRack(tab.objects, `UI-${this.data.id}`, this.data.name, '<i class="ri-text"></i>', {
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
            type: null,
            font_size: null,
            color: null,
            decoration: null,
            text_align: null,
            text_shadow: null,
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

        //type
        this.parameters.type = new imports.ui_components.UIParameterChoice(
            this.parameter_container,
            "Text type",
            ["any","time"],
            this.data.type,
            () => {
                this.updateData({
                    id: this.data.id,
                    type: this.parameters.type.value,
                });
            }
        );
        this.parameters.type.help_string = help.parameter.object.text.type;

        //text
        this.parameters.text = new imports.ui_components.UIParameterString(
            this.parameter_container,
            "Displayed text",
            this.data.text,
            () => {
                this.updateData({
                    id: this.data.id,
                    text: this.parameters.text.value,
                });
            }
        );
        this.parameters.text.help_string = help.parameter.object.text.text_content;

        //font_size
        this.parameters.font_size = new imports.ui_components.UIParameterNumInputList(
            this.parameter_container,
            "",
            false,
            [{
                title: "Font size :",
                unit: "px",
                default_value: this.data.font_size,
                min: 0,
                step: 1,
                callback: () => {
                    this.updateData({
                        id: this.data.id,
                        font_size: parseInt(this.parameters.font_size.value(0))
                    });
                }
            }]
        );
        this.parameters.font_size.help_string = help.parameter.object.text.font_size;

        //color
        this.parameters.color = new imports.ui_components.UIParameterString(
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

        //text decoration
        this.parameters.decoration = new imports.ui_components.UIParameterButtonGrid(
            this.parameter_container,
            "Text decoration",
            1, 5,
            [[
                {
                    innerHTML: '<i class="ri-italic"></i>',
                    callback: (bool) => {
                        this.updateData({
                            id: this.data.id,
                            italic: bool,
                        });
                    }
                }, {
                    innerHTML: '<i class="ri-bold"></i>',
                    callback: (bool) => {
                        this.updateData({
                            id: this.data.id,
                            bold: bool,
                        });
                    }
                }, {
                    innerHTML: '<i class="ri-underline"></i>',
                    callback: (bool) => {
                        this.updateData({
                            id: this.data.id,
                            underline: bool,
                        });
                    }
                }, {
                    innerHTML: '<span style="text-decoration: overline">O</span>',
                    callback: (bool) => {
                        this.updateData({
                            id: this.data.id,
                            overline: bool,
                        });
                    }
                }, {
                    innerHTML: '<i class="ri-strikethrough"></i>',
                    callback: (bool) => {
                        this.updateData({
                            id: this.data.id,
                            line_through: bool,
                        });
                    }
                }
            ]], true);
        if (this.data.italic) this.parameters.decoration.toggle(0,0);
        if (this.data.bold) this.parameters.decoration.toggle(0,1);
        if (this.data.underline) this.parameters.decoration.toggle(0,2);
        if (this.data.overline) this.parameters.decoration.toggle(0,3);
        if (this.data.line_through) this.parameters.decoration.toggle(0,4);
        this.parameters.decoration.help_string = help.parameter.object.text.decoration;

        //text align
        this.parameters.text_align = new imports.ui_components.UIParameterChoice(
            this.parameter_container,
            "Text align",
            ["left","center","right"],
            this.data.text_align,
            () => {
                this.updateData({
                    id: this.data.id,
                    text_align: this.parameters.text_align.value,
                });
            }
        );
        this.parameters.text_align.help_string = help.parameter.object.text.text_align;

        //text-shadow
        this.parameters.text_shadow = new imports.ui_components.UIParameterString(
            this.parameter_container,
            "Box Shadow (CSS)",
            this.data.text_shadow,
            () => {
                this.updateData({
                    id: this.data.id,
                    text_shadow: this.parameters.text_shadow.value,
                });
            }
        );
        this.parameters.text_shadow.help_string = help.parameter.object.general.shadow;
        
    }




    //############################
    //FUNCTION TO ANIMATE THE TEXT
    //############################

    this.update = function() {
        if (this.data.type === "time") {
            //update time

            //find elapsed time
            var time_pos_sec = Math.floor(current_time)%60;
            if (time_pos_sec < 10) time_pos_sec = "0"+time_pos_sec;
            var time_pos_min = Math.floor(current_time/60);

            //find total time
            var time_length_sec = Math.floor(audio_duration)%60;
            if (time_length_sec < 10) time_length_sec = "0"+time_length_sec;
            var time_length_min = Math.floor(audio_duration/60);

            //apply time
            this.element.innerHTML = `${time_pos_min}:${time_pos_sec} | ${time_length_min}:${time_length_sec}`;

        }

        //finished updating
        return true;
    }



    //###########################
    //FUNCTION TO REMOVE THE TEXT
    //###########################

    this.remove = function(id) {
        if (!imports.utils.IsAString(id)) throw `Text.remove: ${id} is not a valid ID.`;

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