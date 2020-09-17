//MIT License - Copyright (c) 2020 Picorims

//BACKGROUND OBJECT PROCESS

/*data = {
    object_type: "background",
    id: ?, (string, name)
    layer: ?, (integer)
    background: ?, (string, css background)
    size: ?, (string, css background-size for image resizing, shrinking, repeating)
}*/

function Background(data) {
    if (IsUndefined(data)) throw "Background: data missing!";
    
    this.data = data;//collect data
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
        if ( IsUndefined(data.id) || !IsAString(data.id) ) {
            console.error("Background object: received an object with an unspecified/invalid ID! A random ID is given.");
            data.id = `${Math.random()}`;
        }

        //layer
        if ( IsUndefined(data.layer) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.layer = 0;}
        if ( !IsUndefined(data.layer) && (!IsAnInt(data.layer) || (data.layer <= -1)) ) {
            console.warn("Background object: Invalid layer! Set to 0.");
            data.layer = 0;
        }

        //background
        if ( IsUndefined(data.background) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.background = "";}
        if ( !IsUndefined(data.background) && !IsAString(data.background) ) {
            console.warn("Background object: Invalid background! No background is applied."); //do not detect css errors!
            data.background = "";
        }

        //size
        if ( IsUndefined(data.size) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.size = "";}
        if ( !IsUndefined(data.size) && !IsAString(data.size) ) {
            console.warn("Background object: Invalid size! No css size is applied."); //do not detect css errors!
            data.size = "";
        }

        return data;

    }

    this.data = this.verifyData(this.data);




    //##################################
    //FUNCTION TO MERGE TWO DATA OBJECTS
    //##################################

    this.mergeData = function(data, data_destination) {
        if (IsUndefined(data)) throw "Background.mergeData: data missing!";
        if (IsUndefined(data_destination)) throw "Background.mergeData: data_destination missing!";

        for (key of Object.keys(data)) {
            data_destination[key] = data[key];
        }

        return data_destination;
    }





    //########################################
    //FUNCTION TO APPLY DATA TO THE BACKGROUND
    //########################################

    this.updateData = function(data) {
        if (IsUndefined(data)) throw "Background.updateData: data missing!";
        //NOTE: it is NOT possible to change the background id (data.id). A new background must be created in such case!
        
        if ( IsUndefined(data.id) ) {
            console.error("Background object: No ID specified!");
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
            this.element.style.background = this.data.background;//background
            this.element.style.backgroundSize = this.data.size;//size

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
            this.data.id,
            "value",
            {
                default: this.data.layer,
                min: 0,
                step: 1,
            },
            "Layer",
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
        AddParameter(this.data.id, "string", {default: this.data.background}, "Background", function(id, value) {

            var this_object = object_method.getByID(id);

            this_object.updateData({
                id: id,
                background: value,
            });
        });

        //size
        AddParameter(this.data.id, "string", {default: this.data.size}, "Background Size", function(id, value) {

            var this_object = object_method.getByID(id);

            this_object.updateData({
                id: id,
                size: value,
            });
        });
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
            document.getElementById(`UI${id}`).remove();

            //remove element
            this.element.remove();
        }
    }


    //END OF THE OBJECT
}