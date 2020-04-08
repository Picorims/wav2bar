//MIT License - Copyright (c) 2020 Picorims

//TIMER OBJECT PROCESS

/*data = {
    id: ?, (string, name)
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

function Timer(data) {
    this.data = data;//collect data
    this.data.object_type = "timer";
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
            console.error("Timer object: received an object with an unspecified/invalid ID! A random ID is given.");
            data.id = `${Math.random()}`;
        }

        //layer
        if ( IsUndefined(data.layer) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.layer = 0;}
        if ( !IsUndefined(data.layer) && (!IsAnInt(data.layer) || (data.layer <= -1)) ) {
            console.warn("Timer object: Invalid layer! Set to 0.");
            data.layer = 0;
        }

        //x
        if ( IsUndefined(data.x) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.x = 0;}
        if ( !IsUndefined(data.x) && !IsAnInt(data.x) ) {
            console.warn("Timer object: Invalid x coordinate! Set to 0.");
            data.x = 0;
        }

        //y
        if ( IsUndefined(data.y) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.y = 0;}
        if ( !IsUndefined(data.y) && !IsAnInt(data.y) ) {
            console.warn("Timer object: Invalid y coordinate! Set to 0.");
            data.y = 0;
        }

        //width
        if ( IsUndefined(data.width) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.width = 100;}
        if ( !IsUndefined(data.width) && (!IsAnInt(data.width) || (data.width < 0)) ) {
            console.warn("Timer object: Invalid width! Set to 100.");
            data.width = 100;
        }

        //height
        if ( IsUndefined(data.height) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.height = 10;}
        if ( !IsUndefined(data.height) && (!IsAnInt(data.height) || (data.height < 0)) ) {
            console.warn("Timer object: Invalid height! Set to 10.");
            data.height = 10;
        }

        //rotation
        if ( IsUndefined(data.rotation) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.rotation = 0;}
        if ( !IsUndefined(data.rotation) && !IsAnInt(data.rotation) ) {
            console.warn("Timer object: Invalid rotation! Set to 0.");
            data.rotation = 0;
        }

        //type
        if ( IsUndefined(data.type) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.type = "bar";}
        if ( !IsUndefined(data.type) && (!IsAString(data.type) || ( (data.type !== "bar") && (data.type !== "point") )) ) {
            console.warn("Timer object: Invalid type! Set to bar.");
            data.type = "bar";
        }

        //color
        if ( IsUndefined(data.color) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.color = "#fff";}
        if ( !IsUndefined(data.color) && !IsAString(data.color) ) {
            console.warn("Timer object: Invalid color! White color is applied."); //do not detect css errors!
            data.color = "#fff";
        }

        //border to bar space
        if ( IsUndefined(data.border_to_bar_space) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.border_to_bar_space = 2;}
        if ( !IsUndefined(data.border_to_bar_space) && (!IsAnInt(data.border_to_bar_space) || (data.border_to_bar_space < 0)) ) {
            console.warn("Timer object: Invalid border to bar space! Set to 2.");
            data.border_to_bar_space = 2;
        }
        
        //border thickness
        if ( IsUndefined(data.border_thickness) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.border_thickness = 2;}
        if ( !IsUndefined(data.border_thickness) && (!IsAnInt(data.border_thickness) || (data.border_thickness < 0)) ) {
            console.warn("Timer object: Invalid border thickness! Set to 2.");
            data.border_thickness = 2;
        }

        //border-radius
        if ( IsUndefined(data.border_radius) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.border_radius = "";}
        if ( !IsUndefined(data.border_radius) && !IsAString(data.border_radius) ) {
            console.warn("Timer object: Invalid border-radius! No border-radius is applied."); //do not detect css errors!
            data.border_radius = "";
        }

        //box-shadow
        if ( IsUndefined(data.box_shadow) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.box_shadow = "";}
        if ( !IsUndefined(data.box_shadow) && !IsAString(data.box_shadow) ) {
            console.warn("Timer object: Invalid box-shadow! No box-shadow is applied."); //do not detect css errors!
            data.box_shadow = "";
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



    //###################################
    //FUNCTION TO APPLY DATA TO THE TIMER
    //###################################

    this.updateData = function(data) {
        //NOTE: it is NOT possible to change the timer type (data.type) and id (data.id). A new timer must be created in such case!
        
        if ( IsUndefined(data.id) ) {
            console.error("Timer object: No ID specified!");
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
            this.data = this.mergeData(this.data, this.data_backup); //simple assignement would overwrite existing data
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

    //color
    AddParameter(this.data.id, "string", {}, "Color", function(id, value) {

        var this_object = object_method.getByID(id);

        this_object.updateData({
            id: id,
            color: value,
        });
    });

    //border to bar space
    AddParameter(this.data.id, "value", {min: 0, step: 1}, "Space between the border and the bar", function(id, value) {
        
        var this_object = object_method.getByID(id);

        this_object.updateData({
            id: id,
            border_to_bar_space: value,
        });
    });

    //border thickness
    AddParameter(this.data.id, "value", {min: 0, step: 1}, "Border thickness", function(id, value) {
        
        var this_object = object_method.getByID(id);

        this_object.updateData({
            id: id,
            border_thickness: value,
        });
    });

    //border-radius
    AddParameter(this.data.id, "string", {}, "Border Radius", function(id, value) {

        var this_object = object_method.getByID(id);

        this_object.updateData({
            id: id,
            border_radius: value,
        });
    });

    //box-shadow
    AddParameter(this.data.id, "string", {}, "Box Shadow", function(id, value) {

        var this_object = object_method.getByID(id);

        this_object.updateData({
            id: id,
            box_shadow: value,
        });
    });





    //############################
    //FUNCTION TO ANIMATE THE TEXT
    //############################

    this.update = function() {
        if (this.data.type === "bar") {
            this.element.child.style.width = ( (this.data.width - 2*this.data.border_to_bar_space) * (audio.currentTime / audio.duration) ) + "px";
        } else if (this.data.type === "point") {
            this.element.child.style.left = ( -(this.data.height/2) + this.data.width * (audio.currentTime / audio.duration) ) + "px";
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