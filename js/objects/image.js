//MIT License - Copyright (c) 2020 Picorims

//IMAGE OBJECT PROCESS

/*data = {
    id: ?, (string, name)
    layer: ?, (integer)
    x: ?, (px)
    y: ?, (px)
    width: ?, (px)
    height: ?, (px)
    rotation: ?, (deg)
    background: ?, (string, css background)
    size: ?, (string, css background-size for image resizing, shrinking, repeating)
    border_radius: ?, (string, css border-radius)
    box_shadow: ?, (string, css box-shadow)
}*/

function Image(data) {
    this.data = data;//collect data
    this.data.object_type = "image";
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
            console.error("Image object: received an object with an unspecified/invalid ID! A random ID is given.");
            data.id = `${Math.random()}`;
        }

        //layer
        if ( IsUndefined(data.layer) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.layer = 0;}
        if ( !IsUndefined(data.layer) && (!IsAnInt(data.layer) || (data.layer <= -1)) ) {
            console.warn("Image object: Invalid layer! Set to 0.");
            data.layer = 0;
        }

        //x
        if ( IsUndefined(data.x) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.x = 0;}
        if ( !IsUndefined(data.x) && !IsAnInt(data.x) ) {
            console.warn("Image object: Invalid x coordinate! Set to 0.");
            data.x = 0;
        }

        //y
        if ( IsUndefined(data.y) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.y = 0;}
        if ( !IsUndefined(data.y) && !IsAnInt(data.y) ) {
            console.warn("Image object: Invalid y coordinate! Set to 0.");
            data.y = 0;
        }

        //width
        if ( IsUndefined(data.width) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.width = 100;}
        if ( !IsUndefined(data.width) && (!IsAnInt(data.width) || (data.width < 0)) ) {
            console.warn("Image object: Invalid width! Set to 100.");
            data.width = 100;
        }

        //height
        if ( IsUndefined(data.height) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.height = 100;}
        if ( !IsUndefined(data.height) && (!IsAnInt(data.height) || (data.height < 0)) ) {
            console.warn("Image object: Invalid height! Set to 100.");
            data.height = 100;
        }

        //rotation
        if ( IsUndefined(data.rotation) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.rotation = 0;}
        if ( !IsUndefined(data.rotation) && !IsAnInt(data.rotation) ) {
            console.warn("Image object: Invalid rotation! Set to 0.");
            data.rotation = 0;
        }

        //background
        if ( IsUndefined(data.background) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.background = "#fff";}
        if ( !IsUndefined(data.background) && !IsAString(data.background) ) {
            console.warn("Image object: Invalid background! A white background is applied."); //do not detect css errors!
            data.background = "#fff";
        }

        //size
        if ( IsUndefined(data.size) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.size = "";}
        if ( !IsUndefined(data.size) && !IsAString(data.size) ) {
            console.warn("Image object: Invalid size! No css size is applied."); //do not detect css errors!
            data.size = "";
        }

        //border-radius
        if ( IsUndefined(data.border_radius) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.border_radius = "";}
        if ( !IsUndefined(data.border_radius) && !IsAString(data.border_radius) ) {
            console.warn("Image object: Invalid border-radius! No border-radius is applied."); //do not detect css errors!
            data.border_radius = "";
        }

        //box-shadow
        if ( IsUndefined(data.box_shadow) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.box_shadow = "";}
        if ( !IsUndefined(data.box_shadow) && !IsAString(data.box_shadow) ) {
            console.warn("Image object: Invalid box-shadow! No box-shadow is applied."); //do not detect css errors!
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
    //FUNCTION TO APPLY DATA TO THE IMAGE
    //###################################

    this.updateData = function(data) {
        //NOTE: it is NOT possible to change the image id (data.id). A new image must be created in such case!
        
        if ( IsUndefined(data.id) ) {
            console.error("Image object: No ID specified!");
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
            this.data = this.mergeData(this.data, this.data_backup); //simple assignement would overwrite existing data
            this.element.style.zIndex = this.data.layer;//layer
            this.element.style.width = this.data.width+"px";//width
            this.element.style.height = this.data.height+"px";//height
            this.element.style.left = this.data.x+"px";//x
            this.element.style.top = this.data.y+"px";//y
            this.element.style.transform = `rotate(${this.data.rotation}deg)`;//rotation
            this.element.style.background = this.data.background;//background
            this.element.style.backgroundSize = this.data.size;//size
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



    //###############
    //SAVE THE OBJECT
    //###############
    current_save.objects.push(this.data);



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