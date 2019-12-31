//MIT License - Copyright (c) 2019 Picorims and Mischa

//BACKGROUND OBJECT PROCESS

/*data = {
    id: ?, (string, name)
    layer: ?, (integer)
    background: ?; (string, css background)
    size: ?, (string, css background-size for image resizing, shrinking, repeating)
}*/

function Background(data) {
    this.data = data;//collect data
    objects.push(this);//add the object to the list



    //########################################
    //FUNCTION TO APPLY DATA TO THE BACKGROUND
    //########################################

    this.updateData = function(data) {
        //NOTE: it is NOT possible to change the background id (data.id). A new background must be created in such case!
        
        if (data.id === this.data.id) {//if he is the targeted element (remove executes for all objects!)
            this.data = data;//recollect data

            
            //APPLY DATA
            this.element.style.zIndex = this.data.layer;//layer
            this.element.style.background = this.data.background;//background
            this.element.style.backgroundSize = this.data.size;//size
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




    //####################################
    //FUNCTION TO ANIMATE THE BACKGROUND
    //####################################

    this.update = function() {
        this.element.style.width = screen.width+"px";
        this.element.style.height = screen.height+"px";
    }




    //####################################
    //FUNCTION TO REMOVE THE PARTICLE FLOW
    //####################################

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