//MIT License - Copyright (c) 2019 Picorims and Mischa

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


    //###################################
    //FUNCTION TO APPLY DATA TO THE TIMER
    //###################################

    this.updateData = function(data) {
        //NOTE: it is NOT possible to change the timer type (data.type) and id (data.id). A new timer must be created in such case!
        
        if (data.id === this.data.id) {//if he is the targeted element (remove executes for all objects!)
            this.data = data;//recollect data
            this.data.object_type = "timer";

            
            //APPLY DATA
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