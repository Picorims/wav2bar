//MIT License - Copyright (c) 2020 Picorims

//TEXT OBJECT PROCESS

/*data = {
    id: ?, (string, name)
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

function Text(data) {
    this.data = data;//collect data
    this.data.object_type = "text";
    objects.push(this);//add the object to the list






    //########################################
    //VERIFY RECEIVED DATA, SET DEFAULT VALUES
    //########################################

    //Note: ignore_undefined is useful when we only want to verify the given values without setting any default value
    //(invalid data is still overwritten)

    this.verifyData = function(data, ignore_undefined) {
        if ( IsUndefined(ignore_undefined) ) ignore_undefined = "";

        //ID
        if ( IsUndefined(data.id) || !IsAString(data.id) ) {
            console.error("Text object: received an object with an unspecified/invalid ID! A random ID is given.");
            data.id = `${Math.random()}`;
        }

        //layer
        if ( IsUndefined(data.layer) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.layer = 0;}
        if ( !IsUndefined(data.layer) && (!IsAnInt(data.layer) || (data.layer <= -1)) ) {
            console.warn("Text object: Invalid layer! Set to 0.");
            data.layer = 0;
        }

        //x
        if ( IsUndefined(data.x) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.x = 0;}
        if ( !IsUndefined(data.x) && !IsAnInt(data.x) ) {
            console.warn("Text object: Invalid x coordinate! Set to 0.");
            data.x = 0;
        }

        //y
        if ( IsUndefined(data.y) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.y = 0;}
        if ( !IsUndefined(data.y) && !IsAnInt(data.y) ) {
            console.warn("Text object: Invalid y coordinate! Set to 0.");
            data.y = 0;
        }

        //width
        if ( IsUndefined(data.width) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.width = 100;}
        if ( !IsUndefined(data.width) && (!IsAnInt(data.width) || (data.width < 0)) ) {
            console.warn("Text object: Invalid width! Set to 100.");
            data.width = 100;
        }

        //height
        if ( IsUndefined(data.height) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.height = 100;}
        if ( !IsUndefined(data.height) && (!IsAnInt(data.height) || (data.height < 0)) ) {
            console.warn("Text object: Invalid height! Set to 100.");
            data.height = 100;
        }

        //rotation
        if ( IsUndefined(data.rotation) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.rotation = 0;}
        if ( !IsUndefined(data.rotation) && !IsAnInt(data.rotation) ) {
            console.warn("Text object: Invalid rotation! Set to 0.");
            data.rotation = 0;
        }

        //type
        if ( IsUndefined(data.type) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.type = "any";}
        if ( !IsUndefined(data.type) && (!IsAString(data.type) || ( (data.type !== "any") && (data.type !== "time") )) ) {
            console.warn("Text object: Invalid type! Set to any.");
            data.type = "any";
        }

        //text
        if ( IsUndefined(data.text) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.text = "text";}
        if ( !IsUndefined(data.text) && (!IsAString(data.text) || (data.text.indexOf("\\") > -1)) ) {
            console.warn("Text object: Invalid text! No text is applied. (backslashes '\\' are not allowed)");
            data.text = "text";
        }

        //font size
        if ( IsUndefined(data.font_size) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.font_size = 20;}
        if ( !IsUndefined(data.font_size) && (!IsAnInt(data.font_size) || (data.font_size < 0)) ) {
            console.warn("Text object: Invalid font size! Set to 20."); //do not detect css errors!
            data.font_size = 20;
        }

        //color
        if ( IsUndefined(data.color) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.color = "#fff";}
        if ( !IsUndefined(data.color) && !IsAString(data.color) ) {
            console.warn("Text object: Invalid color! White color is applied."); //do not detect css errors!
            data.color = "#fff";
        }

        //italic
        if ( IsUndefined(data.italic) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.italic = false;}
        if ( !IsUndefined(data.italic) && !IsABoolean(data.italic) ) {
            console.warn("Text object: Invalid status for italic! Set to false.");
            data.italic = false;
        }

        //bold
        if ( IsUndefined(data.bold) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.bold = false;}
        if ( !IsUndefined(data.bold) && !IsABoolean(data.bold) ) {
            console.warn("Text object: Invalid status for bold! Set to false.");
            data.bold = false;
        }

        //underline
        if ( IsUndefined(data.underline) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.underline = false;}
        if ( !IsUndefined(data.underline) && !IsABoolean(data.underline) ) {
            console.warn("Text object: Invalid status for underline! Set to false.");
            data.underline = false;
        }

        //overline
        if ( IsUndefined(data.overline) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.overline = false;}
        if ( !IsUndefined(data.overline) && !IsABoolean(data.overline) ) {
            console.warn("Text object: Invalid status for overline! Set to false.");
            data.overline = false;
        }

        //line-through
        if ( IsUndefined(data.line_through) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.line_through = false;}
        if ( !IsUndefined(data.line_through) && !IsABoolean(data.line_through) ) {
            console.warn("Text object: Invalid status for line-through! Set to false.");
            data.line_through = false;
        }

        //text align
        if ( IsUndefined(data.text_align) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.text_align = "center";}
        if ( !IsUndefined(data.text_align) && (!IsAString(data.text_align) || ( (data.text_align !== "left") && (data.text_align !== "center") && (data.text_align !== "right") )) ) {
            console.warn("Text object: Invalid text align! Set to center.");
            data.text_align = "center";
        }

        //text shadow
        if ( IsUndefined(data.text_shadow) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.text_shadow = "";}
        if ( !IsUndefined(data.text_shadow) && !IsAString(data.text_shadow) ) {
            console.warn("Text object: Invalid text-shadow! No text-shadow is applied."); //do not detect css errors!
            data.text_shadow = "";
        }

        return data;

    }

    this.data = this.verifyData(this.data);




    //##################################
    //FUNCTION TO MERGE TWO DATA OBJECTS
    //##################################

    this.mergeData = function(data, data_destination) {
        for (key of Object.keys(data)) {
            data_destination[key] = data[key];
        }

        return data_destination;
    }



    //##################################
    //FUNCTION TO APPLY DATA TO THE TEXT
    //##################################

    this.updateData = function(data) {
        //NOTE: it is NOT possible to change the text id (data.id). A new text must be created in such case!
        
        if ( IsUndefined(data.id) ) {
            console.error("Text object: No ID specified!");
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
            this.data = this.mergeData(this.data, this.data_backup); //simple assignement would overwrite existing data
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
            this.element.style.textDecoration = `${underline} ${overline} ${line_through}`;
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



    //###############
    //SAVE THE OBJECT
    //###############
    current_save.objects.push(this.data);




    //#####################
    //CREATE USER INTERFACE
    //#####################

    //create category
    CreateObjectContainer(this.data.id);
    
    //layer
    AddParameter(this.data.id, "value", {min: 0, step: 1}, "Layer", function(id, value) {   //id, type, parameters, name, callback with id
                                                                                            //and returned value by the input
        var this_object = object_method.getByID(id);

        this_object.updateData({
            id: id,
            layer: value,
        });
    });

    //x and y
    AddParameter(this.data.id, "value-xy", {step: 1}, "Coordinates", function(id, value1, value2) {
        
        var this_object = object_method.getByID(id);

        this_object.updateData({
            id: id,
            x: value1,
            y: value2,
        });
    });

    //width and height
    AddParameter(this.data.id, "value-xy", {min: 0, step: 1}, "Width and Height", function(id, value1, value2) {
        
        var this_object = object_method.getByID(id);

        this_object.updateData({
            id: id,
            width: value1,
            height: value2,
        });
    });

    //rotation
    AddParameter(this.data.id, "value", {min: 0, step: 1}, "Rotation (degrees)", function(id, value) {
        
        var this_object = object_method.getByID(id);

        this_object.updateData({
            id: id,
            rotation: value,
        });
    });

    //type
    AddParameter(this.data.id, "choice", {list:["any", "time"]}, "Text type", function(id, value) {
        
        var this_object = object_method.getByID(id);

        this_object.updateData({
            id: id,
            type: value,
        });
    });

    //text
    AddParameter(this.data.id, "string", {}, "Text", function(id, value) {

        var this_object = object_method.getByID(id);

        this_object.updateData({
            id: id,
            text: value,
        });
    });

    //font size
    AddParameter(this.data.id, "value", {min: 0, step: 1}, "Font size", function(id, value) {
        
        var this_object = object_method.getByID(id);

        this_object.updateData({
            id: id,
            font_size: value,
        });
    });

    //color
    AddParameter(this.data.id, "string", {}, "Color", function(id, value) {

        var this_object = object_method.getByID(id);

        this_object.updateData({
            id: id,
            color: value,
        });
    });

    //italic
    AddParameter(this.data.id, "checkbox", {}, "Italic", function(id, value) {
        
        var this_object = object_method.getByID(id);

        this_object.updateData({
            id: id,
            italic: value,
        });
    });

    //bold
    AddParameter(this.data.id, "checkbox", {}, "Bold", function(id, value) {
        
        var this_object = object_method.getByID(id);

        this_object.updateData({
            id: id,
            bold: value,
        });
    });

    //underline
    AddParameter(this.data.id, "checkbox", {}, "Underline", function(id, value) {
        
        var this_object = object_method.getByID(id);

        this_object.updateData({
            id: id,
            underline: value,
        });
    });

    //overline
    AddParameter(this.data.id, "checkbox", {}, "Overline", function(id, value) {
        
        var this_object = object_method.getByID(id);

        this_object.updateData({
            id: id,
            overline: value,
        });
    });

    //line through
    AddParameter(this.data.id, "checkbox", {}, "Line through", function(id, value) {
        
        var this_object = object_method.getByID(id);

        this_object.updateData({
            id: id,
            line_through: value,
        });
    });

    //text align
    AddParameter(this.data.id, "choice", {list:["left", "center", "right"]}, "Text align", function(id, value) {
        
        var this_object = object_method.getByID(id);

        this_object.updateData({
            id: id,
            text_align: value,
        });
    });

    //text-shadow
    AddParameter(this.data.id, "string", {}, "Text Shadow", function(id, value) {

        var this_object = object_method.getByID(id);

        this_object.updateData({
            id: id,
            text_shadow: value,
        });
    });





    //############################
    //FUNCTION TO ANIMATE THE TEXT
    //############################

    this.update = function() {
        if (this.data.type === "time") {
            //update time

            //find elapsed time
            var time_pos_sec = Math.floor(audio.currentTime)%60;
            if (time_pos_sec < 10) time_pos_sec = "0"+time_pos_sec;
            var time_pos_min = Math.floor(audio.currentTime/60);
            
            //find total time
            var time_length_sec = Math.floor(audio.duration)%60;
            if (time_length_sec < 10) time_length_sec = "0"+time_length_sec;
            var time_length_min = Math.floor(audio.duration/60);
            
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
        if (this.data.id === id) {//if he is the targeted element (remove executes for all objects!)
            //remove index
            var index = objects.indexOf(this);
            objects.splice(index, 1);

            //remove from save
            var index = current_save.objects.indexOf(this.data);
            current_save.objects.splice(index, 1);
            
            //remove element
            this.element.remove();
        }
    }


    //END OF THE OBJECT
}