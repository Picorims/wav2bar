//MIT License - Copyright (c) 2020 Picorims

//VISUALIZER OBJECT PROCESS

/*data = {
    object_type: "visualizer",
    id: ?, (UUID)
    name: ?, (string)
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
    visualization_smoothing: {
        type: ("constant_decay"||"proportional_decrease"||"average"),
        factor: ?, (positive value)
    },
    visualizti
    color: ?, (string, hex, rgb, rgba)
    bar_thickness: ?, (px)
    border_radius: ?, (css border-radius, string)
    box_shadow: ?, (css box-shadow, string)
}*/

function Visualizer(glob_data) {
    if (IsUndefined(glob_data)) throw "Visualizer: data missing!";

    this.data = glob_data;//collect data
    this.data.object_type = "visualizer";
    this.bars = [];//contain all bars for type "straight" and "straight-wave"
    objects.push(this);//add the object to the list

    
    

    //########################################
    //VERIFY RECEIVED DATA, SET DEFAULT VALUES
    //########################################

    //Note: ignore_undefined is useful when we only want to verify the given values without setting any default value
    //(invalid data is still overwritten)

    this.verifyData = function(data, ignore_undefined) {
        if (IsUndefined(data)) throw "Visualizer.verifyData: data missing!";
        if ( !IsUndefined(ignore_undefined) && !(ignore_undefined === "IGNORE_UNDEFINED") ) throw "Visualizer.verifyData: IGNORE_UNDEFINED is the only valid node.";

        if ( IsUndefined(ignore_undefined) ) ignore_undefined = "";

        //ID
        if ( IsUndefined(data.id) || !IsAString(data.id) || !object_method.validID(data.id, this) ) {
            console.error("Visualizer object: received an object with an unspecified/invalid ID! A random ID is given.");
            data.id = object_method.generateID();
        }

        //name
        if ( IsUndefined(data.name) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.name = "";} 
        if ( !IsUndefined(data.name) && !IsAString(data.name) || data.name === "" ) {
            console.warn("Visualizer object: Invalid name! Set to 'visualizer'.");
            data.name = "visualizer";
        }

        //layer
        if ( IsUndefined(data.layer) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.layer = 0;}
        if ( !IsUndefined(data.layer) && (!IsAnInt(data.layer) || (data.layer <= -1)) ) {
            console.warn("Visualizer object: Invalid layer! Set to 0.");
            data.layer = 0;
        }

        //x
        if ( IsUndefined(data.x) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.x = 0;}
        if ( !IsUndefined(data.x) && !IsAnInt(data.x) ) {
            console.warn("Visualizer object: Invalid x coordinate! Set to 0.");
            data.x = 0;
        }

        //y
        if ( IsUndefined(data.y) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.y = 0;}
        if ( !IsUndefined(data.y) && !IsAnInt(data.y) ) {
            console.warn("Visualizer object: Invalid y coordinate! Set to 0.");
            data.y = 0;
        }

        //width
        if ( IsUndefined(data.width) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.width = 300;}
        if ( !IsUndefined(data.width) && (!IsAnInt(data.width) || (data.width < 0)) ) {
            console.warn("Visualizer object: Invalid width! Set to 300.");
            data.width = 300;
        }

        //height
        if ( IsUndefined(data.height) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.height = 100;}
        if ( !IsUndefined(data.height) && (!IsAnInt(data.height) || (data.height < 0)) ) {
            console.warn("Visualizer object: Invalid height! Set to 100.");
            data.height = 100;
        }

        //rotation
        if ( IsUndefined(data.rotation) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.rotation = 0;}
        if ( !IsUndefined(data.rotation) && !IsAnInt(data.rotation) ) {
            console.warn("Visualizer object: Invalid rotation! Set to 0.");
            data.rotation = 0;
        }

        //radius
        if ( IsUndefined(data.radius) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.radius = 50;}
        if ( !IsUndefined(data.radius) && (!IsAnInt(data.radius) || (data.radius < 0)) ) {
            console.warn("Visualizer object: Invalid radius! Set to 50.");
            data.radius = 50;
        }

        //type
        if ( IsUndefined(data.type) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.type = "straight";}
        if ( !IsUndefined(data.type) && (!IsAString(data.type) || ( (data.type !== "straight") && (data.type !== "straight-wave") && (data.type !== "circular") )) ) {
            console.warn("Visualizer object: Invalid type! Set to straight.");
            data.type = "straight";
        }

        //points count
        if ( IsUndefined(data.points_count) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.points_count = 50;}
        if ( !IsUndefined(data.points_count) && (!IsAnInt(data.points_count) || (data.points_count < 0)) ) {
            console.warn("Visualizer object: Invalid points count! Set to 50.");
            data.points_count = 50;
        }

        //analyser range
        if ( IsUndefined(data.analyser_range) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.analyser_range = [0,750];}
        if ( !IsUndefined(data.analyser_range) && (!IsAnArray(data.analyser_range) || (data.analyser_range.length !== 2) || !IsAnInt(data.analyser_range[0]) || !IsAnInt(data.analyser_range[1]) || (data.analyser_range[0] < 0) || (data.analyser_range[0] > 1023) || (data.analyser_range[1] < 0) || (data.analyser_range[1] > 1023)) ) {
            console.warn("Visualizer object: Invalid analyser range! Set to [0,750].");
            data.analyser_range = [0,750];
        }

        //visualization smoothing (prevent errors related to an incomplete path)
        if ( IsUndefined(data.visualization_smoothing) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.visualization_smoothing = {type: undefined, factor: undefined};}

        
        if ( !IsUndefined(data.visualization_smoothing) ) {//it is undefined if it has not been set before in the data argument and IGNORE_UNDEFINED is active
            //visualization smoothing type
            if ( IsUndefined(data.visualization_smoothing.type) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.visualization_smoothing.type = "proportional_decrease";}
            if ( !IsUndefined(data.visualization_smoothing.type) && (!IsAString(data.visualization_smoothing.type) || ( (data.visualization_smoothing.type !== "proportional_decrease") && (data.visualization_smoothing.type !== "constant_decay")  && (data.visualization_smoothing.type !== "average") )) ) {
                console.warn("Visualizer object: Invalid visualization smoothing type! Set to proportional_decrease.");
                data.visualization_smoothing.type = "proportional_decrease";
            }

            //visualization smoothing factor
            if ( IsUndefined(data.visualization_smoothing.factor) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.visualization_smoothing.factor = 2;}
            if ( !IsUndefined(data.visualization_smoothing.factor) && (!IsANumber(data.visualization_smoothing.factor) || (data.visualization_smoothing.factor < 0)) ) {
                console.warn("Visualizer object: Invalid visualization smoothing factor! Set to 2.");
                data.visualization_smoothing.factor = 2;
            }
        }

        //color
        if ( IsUndefined(data.color) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.color = "#fff";}
        if ( !IsUndefined(data.color) && !IsAString(data.color) ) {
            console.warn("Visualizer object: Invalid color! White color is applied."); //do not detect css errors!
            data.color = "#fff";
        }

        //bar thickness
        if ( IsUndefined(data.bar_thickness) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.bar_thickness = 2;}
        if ( !IsUndefined(data.bar_thickness) && (!IsAnInt(data.bar_thickness) || (data.bar_thickness < 0)) ) {
            console.warn("Visualizer object: Invalid bar thickness! Set to 2.");
            data.bar_thickness = 2;
        }

        //border-radius
        if ( IsUndefined(data.border_radius) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.border_radius = "";}
        if ( !IsUndefined(data.border_radius) && !IsAString(data.border_radius) ) {
            console.warn("Visualizer object: Invalid border-radius! No border-radius is applied."); //do not detect css errors!
            data.border_radius = "";
        }

        //box-shadow
        if ( IsUndefined(data.box_shadow) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.box_shadow = "";}
        if ( !IsUndefined(data.box_shadow) && !IsAString(data.box_shadow) ) {
            console.warn("Visualizer object: Invalid box-shadow! No box-shadow is applied."); //do not detect css errors!
            data.box_shadow = "";
        }

        return data;

    }

    this.data = this.verifyData(this.data);




    //##################################
    //FUNCTION TO MERGE TWO DATA OBJECTS
    //##################################

    this.mergeData = function(data_to_add, data_receiver) {
        if (IsUndefined(data_to_add)) throw "Visualizer.mergeData: data missing!";
        if (IsUndefined(data_receiver)) throw "Visualizer.mergeData: data_destination missing!";

        for (key of Object.keys(data_to_add)) { //only update the changed nodes in data_to_add
            if (IsAnObject(data_to_add[key]) && !IsAnArray(data_to_add[key])) {
                //there are multiple sub keys in this key, they must be considered independently.
                this.mergeData(data_to_add[key], data_receiver[key]);
            } else {
                //The key is a simple value, it can be processed directly
                data_receiver[key] = data_to_add[key];
            }
        }

        return data_receiver;
    }


    
    //########################################
    //FUNCTION TO APPLY DATA TO THE VISUALIZER
    //########################################

    this.updateData = function(data) {
        if (IsUndefined(data)) throw "Visualizer.updateData: data missing!";
        //NOTE: it is NOT possible to change the visualizer type (data.type) and id (data.id). A new visualizer must be created in such case!
        
        if ( IsUndefined(data.id) ) {
            console.error("Visualizer object: No ID specified!");
            return;
        }

        if (data.id === this.data.id) {//if he is the targeted element (remove executes for all objects!)
            //LOAD DATA
            this.data_backup = JSON.parse(JSON.stringify(this.data)); //keep a copy of the existing data
            this.data = data;//recollect data
            this.data.object_type = "visualizer";

            //VERIFY DATA
            this.data = this.verifyData(this.data, "IGNORE_UNDEFINED");
            
            //APPLY DATA
            this.data = this.mergeData(this.data, this.data_backup); //simple assignement would overwrite existing data
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

        //radius
        AddParameter(
            {
                object_id: this.data.id,
                type: "value",
                settings: {
                    default: this.data.radius,
                    min: 0,
                    step: 1,    
                },
                title: "Radius",
                help: help.parameter.object.visualizer.circular_kind.radius,
            },
            function(id, value) {
                
                var this_object = object_method.getByID(id);

                this_object.updateData({
                    id: id,
                    radius: value,
                });
            }    
        );

        //points count
        AddParameter(
            {
                object_id: this.data.id,
                type: "value",
                settings: {
                    default: this.data.points_count,
                    min: 0,
                    step: 1,    
                },
                title: "Points count",
                help: help.parameter.object.visualizer.general.points_count,
            },
            function(id, value) {
                
                var this_object = object_method.getByID(id);

                this_object.updateData({
                    id: id,
                    points_count: value,
                });
            }
        );

        //analyzer range
        AddParameter(
            {
                object_id: this.data.id,
                type: "value-xy",
                settings: {
                    default_x: this.data.analyser_range[0],
                    default_y: this.data.analyser_range[1],
                    min: 0,
                    max: 1023,
                    step: 1    
                },
                title: "Analyzer range",
                help: help.parameter.object.visualizer.general.analyser_range,
            },
            function(id, value1, value2) {
                
                var this_object = object_method.getByID(id);

                this_object.updateData({
                    id: id,
                    analyser_range: [value1, value2],
                });
            }
        );

        //visualization smoothing type
        AddParameter(
            {
                object_id: this.data.id,
                type: "choice",
                settings: {
                    default: this.data.visualization_smoothing.type,
                    list:["proportional decrease", "constant decay", "average"],    
                },
                title: "Visualization smoothing type",
                help: help.parameter.object.text.type,//TODO
            },
            function(id, value) {
                
                var this_object = object_method.getByID(id);

                this_object.updateData({
                    id: id,
                    visualization_smoothing: {
                        type: value.replace(" ","_"),
                    },
                });
            }
        );

        //visualization smoothing factor
        AddParameter(
            {
                object_id: this.data.id,
                type: "value",
                settings: {
                    default: this.data.visualization_smoothing.factor,
                    min: 0,
                    step: 0.001,
                },
                title: "Visualization smoothing factor",
                help: help.parameter.object.visualizer.bar_kind.bar_thickness,//TODO
            },
            function(id, value) {
                
                var this_object = object_method.getByID(id);

                this_object.updateData({
                    id: id,
                    visualization_smoothing: {
                        factor: value,
                    }
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

        //bar thickness
        AddParameter(
            {
                object_id: this.data.id,
                type: "value",
                settings: {
                    default: this.data.bar_thickness,
                    min: 0,
                    step: 1,    
                },
                title: "Bar thickness",
                help: help.parameter.object.visualizer.bar_kind.bar_thickness,
            },
            function(id, value) {
                
                var this_object = object_method.getByID(id);

                this_object.updateData({
                    id: id,
                    bar_thickness: value,
                });
            }
        );

        //border-radius
        AddParameter(
            {
                object_id: this.data.id,
                type: "string",
                settings: {
                    default: this.data.border_radius,
                },
                title: "Border Radius",
                help: help.parameter.object.general.border_radius,
            },
            function(id, value) {

                var this_object = object_method.getByID(id);

                this_object.updateData({
                    id: id,
                    border_radius: value,
                });
            }    
        );

        //box-shadow
        AddParameter(
            {
                object_id: this.data.id,
                type: "string",
                settings: {
                    default: this.data.box_shadow,
                },
                title: "Box Shadow",
                help: help.parameter.object.general.shadow,
            },
            function(id, value) {

                var this_object = object_method.getByID(id);

                this_object.updateData({
                    id: id,
                    box_shadow: value,
                });
            }
        );
    }






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
                this.bars[i].style.height = (visualizer_frequency_array[i]/256*this.data.height)+"px";//proportionality to adapt to the full height. (max volume = 256)
                
                if (this.data.type === "circular") {//fix rotation
                    this.bars[i].style.height = ( visualizer_frequency_array[i]/256*(this.data.height/2 - this.data.radius) )+"px";//proportionality to adapt to the full height. (max volume = 256)

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
            var wave_step = (visualizer_cvs.width / (this.data.points_count-1));//create steps
            var wave_step_pos = 0;

            //clear
            vis_ctx.clearRect(0, 0, visualizer_cvs.width, visualizer_cvs.height);

            
            
            //CREATE THE WAVE
            vis_ctx.beginPath();
            vis_ctx.moveTo(visualizer_frequency_array[i]/256*this.data.height, visualizer_cvs.height);
            //make all wave points
            for (var i=0; i < this.data.points_count; i++) {
                //place a new bezier point
                // => parameters
                var x = wave_step_pos;
                var y = visualizer_cvs.height - (visualizer_frequency_array[i]/256*this.data.height);//proportionality to adapt to the full height. (max volume = 256)
                var ctrl_point_1_x = (i===0) ? x-(wave_step/4) : x-(wave_step/2);//the first point creates a bezier with a width 2 times smaller, so it has to be taken in count!
                var ctrl_point_1_y = (visualizer_cvs.height - (visualizer_frequency_array[i-1]/256*this.data.height) ) || visualizer_cvs.height;//at the same height of the previous point, if that one exists.
                var ctrl_point_2_x = ctrl_point_1_x;
                var ctrl_point_2_y = y;
                // => canvas draw
                vis_ctx.bezierCurveTo(ctrl_point_1_x, ctrl_point_1_y, ctrl_point_2_x, ctrl_point_2_y, x, y);
                wave_step_pos += wave_step;
            }
            // //END THE WAVE
            vis_ctx.lineTo(visualizer_cvs.width, visualizer_cvs.height);
            
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
            //     var y = visualizer_cvs.height - (visualizer_frequency_array[i]/256*this.data.height);//proportionality to adapt to the full height. (max volume = 256)
            //     vis_ctx.arc(x, y, 3, 0, 2*Math.PI);
            //     vis_ctx.fillStyle = `rgb(${r},0,0)`;
            //     vis_ctx.fill();

            //     vis_ctx.beginPath();
            //     var ctrl_point_1_x = (i===0) ? x-(wave_step/4) : x-(wave_step/2);
            //     var ctrl_point_1_y = (visualizer_cvs.height - (visualizer_frequency_array[i-1]/256*this.data.height) ) || visualizer_cvs.height;//at the same height of the previous point, if that one exists.
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
            // var ctrl_point_1_y = visualizer_cvs.height - (visualizer_frequency_array[this.data.points_count-1]/256*this.data.height);//last bar height.
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
        if (!IsAString(id)) throw `Visualizer.remove: ${id} is not a valid ID.`;

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