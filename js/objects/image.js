//MIT License - Copyright (c) 2019 Picorims and Mischa

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
    objects.push(this);//add the object to the list



    //###################################
    //FUNCTION TO APPLY DATA TO THE IMAGE
    //###################################

    this.updateData = function(data) {
        //NOTE: it is NOT possible to change the image id (data.id). A new image must be created in such case!
        
        if (data.id === this.data.id) {//if he is the targeted element (remove executes for all objects!)
            this.data = data;//recollect data

            
            //APPLY DATA
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




    //#############################
    //FUNCTION TO ANIMATE THE IMAGE
    //#############################

    this.update = function() {
        //nothing (this cannot be removed, or it will trigger errors.)
    }




    //############################
    //FUNCTION TO REMOVE THE IMAGE
    //############################

    this.remove = function(id) {
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