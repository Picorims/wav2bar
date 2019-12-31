//MIT License - Copyright (c) 2019 Picorims and Mischa

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
    text_shadow: ?, (string, css text-shadow)
}*/

function Text(data) {
    this.data = data;//collect data
    objects.push(this);//add the object to the list


    //##################################
    //FUNCTION TO APPLY DATA TO THE TEXT
    //##################################

    this.updateData = function(data) {
        //NOTE: it is NOT possible to change the text id (data.id). A new text must be created in such case!
        
        if (data.id === this.data.id) {//if he is the targeted element (remove executes for all objects!)
            this.data = data;//recollect data

            
            //APPLY DATA
            this.element.style.zIndex = this.data.layer;//layer
            this.element.style.width = this.data.width+"px";//width
            this.element.style.height = this.data.height+"px";//height
            this.element.style.left = this.data.x+"px";//x
            this.element.style.top = this.data.y+"px";//y
            this.element.style.transform = `rotate(${this.data.rotation}deg)`;//rotation
            this.element.innerHTML = this.data.text;//text
            this.element.style.fontSize = this.data.font_size+"px";//font_size
            this.element.style.color = this.data.color;//color
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
    }



    //###########################
    //FUNCTION TO REMOVE THE TEXT
    //###########################

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