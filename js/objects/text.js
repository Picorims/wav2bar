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
    if (IsUndefined(glob_data)) throw "Text: data missing!";

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
        if (IsUndefined(data)) throw "Text.verifyData: data missing!";
        if ( !IsUndefined(ignore_undefined) && !(ignore_undefined === "IGNORE_UNDEFINED") ) throw "Text.verifyData: IGNORE_UNDEFINED is the only valid node.";

        if ( IsUndefined(ignore_undefined) ) ignore_undefined = "";

        //ID
        if ( IsUndefined(data.id) || !IsAString(data.id) || !object_method.validID(data.id, this) ) {
            CustomLog("error","Text object: received an object with an unspecified/invalid ID! A random ID is given.");
            data.id = object_method.generateID();
        }

        //name
        if ( IsUndefined(data.name) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.name = this.DEFAULTS.NAME;}
        if ( !IsUndefined(data.name) && !IsAString(data.name) || data.name === "" ) {
            CustomLog("warn",`Text object: Invalid name! Set to '${this.DEFAULTS.NAME}'.`);
            data.name = this.DEFAULTS.NAME;
        }

        //layer
        if ( IsUndefined(data.layer) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.layer = this.DEFAULTS.LAYER;}
        if ( !IsUndefined(data.layer) && (!IsAnInt(data.layer) || (data.layer <= -1)) ) {
            CustomLog("warn",`Text object: Invalid layer! Set to ${this.DEFAULTS.LAYER}.`);
            data.layer = this.DEFAULTS.LAYER;
        }

        //x
        if ( IsUndefined(data.x) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.x = this.DEFAULTS.X;}
        if ( !IsUndefined(data.x) && !IsAnInt(data.x) ) {
            CustomLog("warn",`Text object: Invalid x coordinate! Set to ${this.DEFAULTS.X}.`);
            data.x = this.DEFAULTS.X;
        }

        //y
        if ( IsUndefined(data.y) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.y = this.DEFAULTS.Y;}
        if ( !IsUndefined(data.y) && !IsAnInt(data.y) ) {
            CustomLog("warn",`Text object: Invalid y coordinate! Set to ${this.DEFAULTS.Y}.`);
            data.y = this.DEFAULTS.Y;
        }

        //width
        if ( IsUndefined(data.width) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.width = this.DEFAULTS.WIDTH;}
        if ( !IsUndefined(data.width) && (!IsAnInt(data.width) || (data.width < 0)) ) {
            CustomLog("warn",`Text object: Invalid width! Set to ${this.DEFAULTS.WIDTH}.`);
            data.width = this.DEFAULTS.WIDTH;
        }

        //height
        if ( IsUndefined(data.height) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.height = this.DEFAULTS.HEIGHT;}
        if ( !IsUndefined(data.height) && (!IsAnInt(data.height) || (data.height < 0)) ) {
            CustomLog("warn",`Text object: Invalid height! Set to ${this.DEFAULTS.HEIGHT}.`);
            data.height = this.DEFAULTS.HEIGHT;
        }

        //rotation
        if ( IsUndefined(data.rotation) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.rotation = this.DEFAULTS.ROTATION;}
        if ( !IsUndefined(data.rotation) && !IsAnInt(data.rotation) ) {
            CustomLog("warn",`Text object: Invalid rotation! Set to ${this.DEFAULTS.ROTATION}.`);
            data.rotation = this.DEFAULTS.ROTATION;
        }

        //type
        if ( IsUndefined(data.type) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.type = this.DEFAULTS.TYPE;}
        if ( !IsUndefined(data.type) && (!IsAString(data.type) || ( (data.type !== "any") && (data.type !== "time") )) ) {
            CustomLog("warn",`Text object: Invalid type! Set to ${this.DEFAULTS.TYPE}.`);
            data.type = this.DEFAULTS.TYPE;
        }

        //text
        if ( IsUndefined(data.text) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.text = this.DEFAULTS.TEXT;}
        if ( !IsUndefined(data.text) && (!IsAString(data.text) || (data.text.indexOf("\\") > -1)) ) {
            CustomLog("warn",`Text object: Invalid text! Set to "${this.DEFAULTS.TEXT}". (backslashes '\\' are not allowed)`);
            data.text = this.DEFAULTS.TEXT;
        }

        //font size
        if ( IsUndefined(data.font_size) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.font_size = this.DEFAULTS.FONT_SIZE;}
        if ( !IsUndefined(data.font_size) && (!IsAnInt(data.font_size) || (data.font_size < 0)) ) {
            CustomLog("warn",`Text object: Invalid font size! Set to ${this.DEFAULTS.FONT_SIZE}.`); //do not detect css errors!
            data.font_size = this.DEFAULTS.FONT_SIZE;
        }

        //color
        if ( IsUndefined(data.color) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.color = this.DEFAULTS.COLOR;}
        if ( !IsUndefined(data.color) && !IsAString(data.color) ) {
            CustomLog("warn",`Text object: Invalid color! Set to ${this.DEFAULTS.COLOR}.`); //do not detect css errors!
            data.color = this.DEFAULTS.COLOR;
        }

        //italic
        if ( IsUndefined(data.italic) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.italic = this.DEFAULTS.ITALIC;}
        if ( !IsUndefined(data.italic) && !IsABoolean(data.italic) ) {
            CustomLog("warn",`Text object: Invalid status for italic! Set to ${this.DEFAULTS.ITALIC}.`);
            data.italic = this.DEFAULTS.ITALIC;
        }

        //bold
        if ( IsUndefined(data.bold) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.bold = this.DEFAULTS.BOLD;}
        if ( !IsUndefined(data.bold) && !IsABoolean(data.bold) ) {
            CustomLog("warn",`Text object: Invalid status for bold! Set to ${this.DEFAULTS.BOLD}.`);
            data.bold = this.DEFAULTS.BOLD;
        }

        //underline
        if ( IsUndefined(data.underline) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.underline = this.DEFAULTS.UNDERLINE;}
        if ( !IsUndefined(data.underline) && !IsABoolean(data.underline) ) {
            CustomLog("warn",`Text object: Invalid status for underline! Set to ${this.DEFAULTS.UNDERLINE}.`);
            data.underline = this.DEFAULTS.UNDERLINE;
        }

        //overline
        if ( IsUndefined(data.overline) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.overline = this.DEFAULTS.OVERLINE;}
        if ( !IsUndefined(data.overline) && !IsABoolean(data.overline) ) {
            CustomLog("warn",`Text object: Invalid status for overline! Set to ${this.DEFAULTS.OVERLINE}.`);
            data.overline = this.DEFAULTS.OVERLINE;
        }

        //line-through
        if ( IsUndefined(data.line_through) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.line_through = this.DEFAULTS.LINE_THROUGH;}
        if ( !IsUndefined(data.line_through) && !IsABoolean(data.line_through) ) {
            CustomLog("warn",`Text object: Invalid status for line-through! Set to ${this.DEFAULTS.LINE_THROUGH}.`);
            data.line_through = this.DEFAULTS.LINE_THROUGH;
        }

        //text align
        if ( IsUndefined(data.text_align) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.text_align = this.DEFAULTS.TEXT_ALIGN;}
        if ( !IsUndefined(data.text_align) && (!IsAString(data.text_align) || ( (data.text_align !== "left") && (data.text_align !== "center") && (data.text_align !== "right") )) ) {
            CustomLog("warn",`Text object: Invalid text align! Set to ${this.DEFAULTS.TEXT_ALIGN}.`);
            data.text_align = this.DEFAULTS.TEXT_ALIGN;
        }

        //text shadow
        if ( IsUndefined(data.text_shadow) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.text_shadow = this.DEFAULTS.TEXT_SHADOW;}
        if ( !IsUndefined(data.text_shadow) && !IsAString(data.text_shadow) ) {
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
        if (IsUndefined(data)) throw "Text.updateData: data missing!";

        //NOTE: it is NOT possible to change the text id (data.id). A new text must be created in such case!

        if ( IsUndefined(data.id) ) {
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
            function(id, value) {   //id, type, parameters, name, callback with id
                                                                                                    //and returned value by the input
                var this_object = object_method.getByID(id);

                this_object.updateData({
                    id: id,
                    layer: value,
                });
            }
        );

        //x and y
        AddParameter(
            {
                object_id: this.data.id,
                type: "value-xy",
                settings: {
                    default_x: this.data.x,
                    default_y: this.data.y,
                    step: 1,
                },
                title: "Coordinates",
                help: help.parameter.object.general.pos,
            },
            function(id, value1, value2) {

                var this_object = object_method.getByID(id);

                this_object.updateData({
                    id: id,
                    x: value1,
                    y: value2,
                });
            }
        );

        //width and height
        AddParameter(
            {
                object_id: this.data.id,
                type: "value-xy",
                settings: {
                    default_x: this.data.width,
                    default_y: this.data.height,
                    min: 0,
                    step: 1,
                },
                title: "Width and Height",
                help: help.parameter.object.general.size,
            },
            function(id, value1, value2) {

                var this_object = object_method.getByID(id);

                this_object.updateData({
                    id: id,
                    width: value1,
                    height: value2,
                });
            }
        );

        //rotation
        AddParameter(
            {
                object_id: this.data.id,
                type: "value",
                settings: {
                    default: this.data.rotation,
                    min: 0,
                    step: 1,
                },
                title: "Rotation (degrees)",
                help: help.parameter.object.general.rotation,
            },
            function(id, value) {

                var this_object = object_method.getByID(id);

                this_object.updateData({
                    id: id,
                    rotation: value,
                });
            }
        );

        //type
        AddParameter(
            {
                object_id: this.data.id,
                type: "choice",
                settings: {
                    default: this.data.type,
                    list:["any", "time"],
                },
                title: "Text type",
                help: help.parameter.object.text.type,
            },
            function(id, value) {

                var this_object = object_method.getByID(id);

                this_object.updateData({
                    id: id,
                    type: value,
                });
            }
        );

        //text
        AddParameter(
            {
                object_id: this.data.id,
                type: "string",
                settings: {
                    default: this.data.text,
                },
                title: "Text",
                help: help.parameter.object.text.text_content,
            },
            function(id, value) {

                var this_object = object_method.getByID(id);

                this_object.updateData({
                    id: id,
                    text: value,
                });
            }
        );

        //font size
        AddParameter(
            {
                object_id: this.data.id,
                type: "value",
                settings: {
                    default: this.data.font_size,
                    min: 0,
                    step: 1,
                },
                title: "Font size",
                help: help.parameter.object.text.font_size,
            },
            function(id, value) {

                var this_object = object_method.getByID(id);

                this_object.updateData({
                    id: id,
                    font_size: value,
                });
            }
        );

        //color
        AddParameter(
            {
                object_id: this.data.id,
                type: "string",
                settings: {
                    default: this.data.color,
                },
                title: "Color",
                help: help.parameter.object.general.color,
            },
            function(id, value) {

                var this_object = object_method.getByID(id);

                this_object.updateData({
                    id: id,
                    color: value,
                });
            }
        );

        //italic
        AddParameter(
            {
                object_id: this.data.id,
                type: "checkbox",
                settings: {
                    default: this.data.italic,
                },
                title: "Italic",
                help: help.parameter.object.text.italic,
            },
            function(id, value) {

                var this_object = object_method.getByID(id);

                this_object.updateData({
                    id: id,
                    italic: value,
                });
            }
        );

        //bold
        AddParameter(
            {
                object_id: this.data.id,
                type: "checkbox",
                settings: {
                    default: this.data.bold,
                },
                title: "Bold",
                help: help.parameter.object.text.bold,
            },
            function(id, value) {

                var this_object = object_method.getByID(id);

                this_object.updateData({
                    id: id,
                    bold: value,
                });
            }
        );

        //underline
        AddParameter(
            {
                object_id: this.data.id,
                type: "checkbox",
                settings: {
                    default: this.data.underline,
                },
                title: "Underline",
                help: help.parameter.object.text.underline,
            },
            function(id, value) {

                var this_object = object_method.getByID(id);

                this_object.updateData({
                    id: id,
                    underline: value,
                });
            }
        );

        //overline
        AddParameter(
            {
                object_id: this.data.id,
                type: "checkbox",
                settings: {
                    default: this.data.overline,
                },
                title :"Overline",
                help: help.parameter.object.text.overline,
            },
            function(id, value) {

                var this_object = object_method.getByID(id);

                this_object.updateData({
                    id: id,
                    overline: value,
                });
            }
        );

        //line through
        AddParameter(
            {
                object_id: this.data.id,
                type: "checkbox",
                settings: {
                    default: this.data.line_through,
                },
                title :"Line through",
                help: help.parameter.object.text.line_through,
            },
            function(id, value) {

                var this_object = object_method.getByID(id);

                this_object.updateData({
                    id: id,
                    line_through: value,
                });
            }
        );

        //text align
        AddParameter(
            {
                object_id: this.data.id,
                type: "choice",
                settings: {
                    default: this.data.text_align,
                    list:["left", "center", "right"],
                },
                title: "Text align",
                help: help.parameter.object.text.text_align,
            },
            function(id, value) {

                var this_object = object_method.getByID(id);

                this_object.updateData({
                    id: id,
                    text_align: value,
                });
            }
        );

        //text-shadow
        AddParameter(
            {
                object_id: this.data.id,
                type: "string",
                settings: {
                    default: this.data.text_shadow,
                },
                title: "Text Shadow",
                help: help.parameter.object.general.shadow,
            },
            function(id, value) {

                var this_object = object_method.getByID(id);

                this_object.updateData({
                    id: id,
                    text_shadow: value,
                });
            }
        );
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
        if (!IsAString(id)) throw `Text.remove: ${id} is not a valid ID.`;

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