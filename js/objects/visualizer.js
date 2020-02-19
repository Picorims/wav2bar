//MIT License - Copyright (c) 2019 Picorims and Mischa

//VISUALIZER OBJECT PROCESS

/*data = {
    id: ?, (string, name)
    layer: 1, (integer)
    x: ?, (px)
    y: ?, (px)
    width: ?, (px)
    height: ?, (px)
    rotation: ?, (deg)
    radius: ?, (px)
    type: ("straight"||"straight-wave"||"circular"),
    points_count: ?, (integer)
    analyser_range: [?, ?], (between 0 and 1023 included, min < max)
    color: ?, (string, hex, rgb, rgba)
    bar_thickness: ?, (px)
    border_radius: ?, (css border-radius, string)
    box_shadow: ?, (css box-shadow, string)
}*/

function Visualizer(data) {
    this.data = data;//collect data
    this.data.object_type = "visualizer";
    this.bars = [];//contain all bars for type "straight" and "straight-wave"
    objects.push(this);//add the object to the list

    
    
    
    //########################################
    //FUNCTION TO APPLY DATA TO THE VISUALIZER
    //########################################

    this.updateData = function(data) {
        //NOTE: it is NOT possible to change the visualizer type (data.type) and id (data.id). A new visualizer must be created in such case!
        
        if (data.id === this.data.id) {//if he is the targeted element (remove executes for all objects!)
            this.data = data;//recollect data
            this.data.object_type = "visualizer";

            
            //APPLY DATA
            this.element.style.zIndex = this.data.layer;//layer
            this.element.style.left = this.data.x+"px";//x
            this.element.style.top = this.data.y+"px";//y
            this.element.style.width = this.data.width+"px";//width
            this.element.style.height = this.data.height+"px";//height
            if (this.data.type === "straight-wave") {
                this.element.width = this.data.width;//width
                this.element.height = this.data.height;//height
            }
            this.element.style.transform = `rotate(${this.data.rotation}deg)`;//rotation


            //UPDATE BARS (points_count)
            if ( (this.data.type === "straight") || (this.data.type === "circular") ) {
                //remove existing bars
                for (var i=0; i < this.bars.length; i++) {
                    this.bars[i].remove();
                }
                this.bars = [];

                //create all bars
                var rot_step = 2*Math.PI/this.data.points_count;//for "circular" only
                var rot_pos = 0;                                // ^^^^

                for (var i=0; i < this.data.points_count; i++) {
                    //create a bar
                    var bar_element = document.createElement("div");
                    this.element.appendChild(bar_element);
                    this.bars.push( bar_element );
                    bar_element.style.zIndex = this.data.layer;
                    bar_element.style.width = this.data.bar_thickness+"px";//bar_thickness
                    bar_element.style.minHeight = this.data.bar_thickness+"px";// ^^^^
                    bar_element.style.backgroundColor = this.data.color;//color
                    bar_element.style.borderRadius = this.data.border_radius;//border_radius
                    bar_element.style.boxShadow = this.data.box_shadow;//box shadow

                    //apply rotation for circular mode
                    if (this.data.type === "circular") {
                        //centering
                        bar_element.style.position = "absolute";
                        var center_x = (this.element.offsetWidth / 2) - (bar_element.offsetWidth / 2);
                        var center_y = (this.element.offsetHeight/2);
                        bar_element.style.left = (center_x + Math.cos(rot_pos) * this.data.radius) + "px";//radius
                        bar_element.style.top = (center_y + Math.sin(rot_pos) * this.data.radius) + "px";// ^^^^
                        
                        //transform
                        bar_element.style.transformOrigin = "center top";
                        bar_element.style.transform = `scale(-1,-1) rotate( ${rot_pos+Math.PI/2}rad )`;
                        
                        //iterate
                        rot_pos += rot_step;
                    }
                }
            }

        }
        //END OF updateData();
    }





    //###################
    //CREATE HTML ELEMENT
    //###################

    //canvas or div depending of the context
    if (this.data.type === "straight-wave") {this.element = document.createElement("canvas");}   
        else if ( (this.data.type === "straight") || (this.data.type === "circular") ) {this.element = document.createElement("div");}
    
    //basic parameters
    screen.appendChild(this.element);
    this.element.style.position = "absolute";
    this.element.style.display = "inline-block";
    this.element.style.overflow = "hidden";

    //setup flex for a straight visualizer
    if (this.data.type === "straight") {
        this.element.style.display = "flex";
        this.element.style.flexWrap = "nowrap";
        this.element.style.justifyContent = "space-between";
        this.element.style.alignItems = "flex-end";
    }


    
    
    
    
    //#############################
    //APPLY DATA FOR THE FIRST TIME
    //#############################
    this.updateData(this.data);



    //###############
    //SAVE THE OBJECT
    //###############
    current_save.objects.push(this.data);









    //##################################
    //FUNCTION TO ANIMATE THE VISUALIZER
    //##################################
    this.update = function() {
        //collect audio data
        var visualizer_frequency_array = MappedArray(frequency_array, this.data.points_count, this.data.analyser_range[0], this.data.analyser_range[1]);
        
        //STRAIGHT OR CIRCULAR
        //====================
        if ( (this.data.type === "straight") || (this.data.type === "circular") ) {
    
            var rot_step = 2*Math.PI/this.data.points_count;//for "circular" only
            var rot_pos = 0;                                // ^^^^
            
            for (var i = 0; i < this.bars.length; i++) {
                //apply data to each bar
                this.bars[i].style.height = (visualizer_frequency_array[i]/255*this.data.height)+"px";//proportionality to adapt to the full height. (max volume = 255)
                
                if (this.data.type === "circular") {//fix rotation
                    this.bars[i].style.height = ( visualizer_frequency_array[i]/255*(this.data.height/2 - this.data.radius) )+"px";//proportionality to adapt to the full height. (max volume = 255)

                    var bar_element = this.bars[i];
                    
                    //centering
                    var center_x = (this.element.offsetWidth / 2) - (bar_element.offsetWidth / 2);
                    var center_y = (this.element.offsetHeight/2);
                    bar_element.style.left = (center_x + Math.cos(rot_pos) * this.data.radius) + "px";//radius
                    bar_element.style.top = (center_y + Math.sin(rot_pos) * this.data.radius) + "px";// ^^^^
                    
                    //transform
                    bar_element.style.transformOrigin = "center top";
                    bar_element.style.transform = `scale(-1,-1) rotate( ${rot_pos+Math.PI/2}rad )`;
                    
                    //iterate
                    rot_pos += rot_step;
                }

            }

            //END OF STRAIGHT OR CIRCULAR
        
        }
        


        //STRAIGHT WAVE
        //=============
        else if (this.data.type === "straight-wave") {
            var visualizer_cvs = this.element;

            //canvas context
            var vis_ctx = visualizer_cvs.getContext("2d");


            //divide the canvas into equal parts
            var wave_step = (visualizer_cvs.width / this.data.points_count);//create step
            var wave_step_pos = wave_step/2;//start centered.

            //clear
            vis_ctx.clearRect(0, 0, visualizer_cvs.width, visualizer_cvs.height);

            
            
            //CREATE THE WAVE
            vis_ctx.beginPath();
            vis_ctx.moveTo(0, visualizer_cvs.height);
            //make all wave points
            for (var i=0; i < this.data.points_count; i++) {
                //place a new bezier point
                // => parameters
                var x = wave_step_pos;
                var y = visualizer_cvs.height - (visualizer_frequency_array[i]/255*this.data.height);//proportionality to adapt to the full height. (max volume = 255)
                var ctrl_point_1_x = (i===0) ? x-(wave_step/4) : x-(wave_step/2);//the first point creates a bezier with a width 2 times smaller, so it has to be taken in count!
                var ctrl_point_1_y = (visualizer_cvs.height - (visualizer_frequency_array[i-1]/255*this.data.height) ) || visualizer_cvs.height;//at the same height of the previous point, if that one exists.
                var ctrl_point_2_x = ctrl_point_1_x;
                var ctrl_point_2_y = y;
                // => canvas draw
                vis_ctx.bezierCurveTo(ctrl_point_1_x, ctrl_point_1_y, ctrl_point_2_x, ctrl_point_2_y, x, y);
                wave_step_pos += wave_step;
            }
            //END THE WAVE
            //place a new bezier point
            // => parameters
            var x = visualizer_cvs.width;
            var y = visualizer_cvs.height;
            var ctrl_point_1_x = x-(wave_step/4);//the last point creates a bezier with a width 2 times smaller, so it has to be taken in count!
            var ctrl_point_1_y = visualizer_cvs.height - (visualizer_frequency_array[this.data.points_count-1]/255*this.data.height);//last bar height.
            var ctrl_point_2_x = ctrl_point_1_x;
            var ctrl_point_2_y = y;
            // => canvas draw
            vis_ctx.bezierCurveTo(ctrl_point_1_x, ctrl_point_1_y, ctrl_point_2_x, ctrl_point_2_y, x, y);
            
            
            //DRAW THE WAVE ON THE CANVAS
            vis_ctx.fillStyle = this.data.color;
            vis_ctx.fill();



            //DEBUG #########################################################################################################
            //DEBUG #########################################################################################################
            //DEBUG #########################################################################################################
            //DEBUG #########################################################################################################
            // var wave_step_pos = wave_step/2;//start centered.
            // var r = 180;
            // for (var i=0; i < bars; i++) {
            //     vis_ctx.beginPath();
            //     var x = wave_step_pos;
            //     var y = visualizer_cvs.height - (visualizer_frequency_array[i]/255*this.data.height);//proportionality to adapt to the full height. (max volume = 255)
            //     vis_ctx.arc(x, y, 3, 0, 2*Math.PI);
            //     vis_ctx.fillStyle = `rgb(${r},0,0)`;
            //     vis_ctx.fill();

            //     vis_ctx.beginPath();
            //     var ctrl_point_1_x = (i===0) ? x-(wave_step/4) : x-(wave_step/2);
            //     var ctrl_point_1_y = (visualizer_cvs.height - (visualizer_frequency_array[i-1]/255*this.data.height) ) || visualizer_cvs.height;//at the same height of the previous point, if that one exists.
            //     vis_ctx.arc(ctrl_point_1_x, ctrl_point_1_y, 3, 0, 2*Math.PI);
            //     vis_ctx.fillStyle = `rgb(0,${r},0)`;
            //     vis_ctx.fill();

            //     vis_ctx.beginPath();
            //     var ctrl_point_2_x = ctrl_point_1_x;
            //     var ctrl_point_2_y = y;
            //     vis_ctx.arc(ctrl_point_2_x, ctrl_point_2_y, 3, 0, 2*Math.PI);
            //     vis_ctx.fillStyle = `rgb(0,0,${r})`;
            //     vis_ctx.fill();


            //     wave_step_pos += wave_step;
            //     r += 20;
            // }
            // vis_ctx.beginPath();
            // var x = visualizer_cvs.width;
            // var y = visualizer_cvs.height;
            // vis_ctx.arc(x, y, 3, 0, 2*Math.PI);
            // vis_ctx.fillStyle = `rgb(${r},0,0)`;
            // vis_ctx.fill();

            // vis_ctx.beginPath();
            // var ctrl_point_1_x = x-(wave_step/4);
            // var ctrl_point_1_y = visualizer_cvs.height - (visualizer_frequency_array[this.data.points_count-1]/255*this.data.height);//last bar height.
            // vis_ctx.arc(ctrl_point_1_x, ctrl_point_1_y, 3, 0, 2*Math.PI);
            // vis_ctx.fillStyle = `rgb(0,${r},0)`;
            // vis_ctx.fill();

            // vis_ctx.beginPath();
            // var ctrl_point_2_x = ctrl_point_1_x;
            // var ctrl_point_2_y = y;
            // vis_ctx.arc(ctrl_point_2_x, ctrl_point_2_y, 3, 0, 2*Math.PI);
            // vis_ctx.fillStyle = `rgb(0,0,${r})`;
            // vis_ctx.fill();
            //###########################################################################################
            //###########################################################################################
            //###########################################################################################
            //###########################################################################################

            //END OF STRAIGHT WAVE

        }


        //END OF update();

        //finished updating
        return true;
    }







    //##################################
    //FUNCTION TO ANIMATE THE VISUALIZER
    //##################################

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