//MIT License - Copyright (c) 2020-2021 Picorims

//PARTICLE FLOW OBJECT PROCESS

/*data = {
    object_type: "particle_flow",
    id: ?, (UUID)
    name: ?, (string)
    layer: ?, (integer)
    x: ?, (px)
    y: ?, (px)
    width: ?, (px)
    height: ?, (px)
    particle_radius_range: [?, ?], (min and max integer, radius)
    type: ("radial"||"directional"),
    center: { //spawn position
        x: ?, (px)
        y: ?, (px)
    },
    particle_direction: ,(rad, between 0 and 2PI)
    spawn_probability: ?, (float) //probability to spawn a particle at each test (0: none, 1: full)
    spawn_tests: ?, (int >=1) //how many spawn tests are done at every frame
    color: ?, (string: hex, rgb, rgba)
}*/

function ParticleFlow(glob_data) {
    if (imports.utils.IsUndefined(glob_data)) throw "ParticleFlow: data missing!";

    this.data = glob_data;//collect data
    this.data.object_type = "particle_flow";
    this.particles = [];//contain all particles
    objects.push(this);//add the object to the list

    //default values
    this.DEFAULTS = {
        NAME: this.data.object_type,
        LAYER: 0,
        X: 0,
        Y: 0,
        WIDTH: 300,
        HEIGHT: 300,
        PARTICLE_RADIUS_RANGE: [1,2],
        TYPE: "radial",
        CENTER: {
            X: 1,
            Y: 1,
        },
        PARTICLE_DIRECTION: 0,
        SPAWN_PROBABILITY: 0.75,
        SPAWN_TESTS: 1,
        COLOR: "#ffffff",
    }


    //########################################
    //VERIFY RECEIVED DATA, SET DEFAULT VALUES
    //########################################

    //Note: ignore_undefined is useful when we only want to verify the given values without setting any default value
    //(invalid data is still overwritten)

    this.verifyData = function(data, ignore_undefined) {
        if (imports.utils.IsUndefined(data)) throw "ParticleFlow.verifyData: data missing!";
        if ( !imports.utils.IsUndefined(ignore_undefined) && !(ignore_undefined === "IGNORE_UNDEFINED") ) throw "ParticleFlow.verifyData: IGNORE_UNDEFINED is the only valid node.";


        if ( imports.utils.IsUndefined(ignore_undefined) ) ignore_undefined = "";

        //ID
        if ( imports.utils.IsUndefined(data.id) || !imports.utils.IsAString(data.id) || !object_method.validID(data.id, this) ) {
            CustomLog("error","Particle Flow object: received an object with an unspecified/invalid ID! A random ID is given.");
            data.id = object_method.generateID();
        }

        //name
        if ( imports.utils.IsUndefined(data.name) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.name = this.DEFAULTS.NAME;}
        if ( !imports.utils.IsUndefined(data.name) && !imports.utils.IsAString(data.name) || data.name === "" ) {
            CustomLog("warn",`Particle Flow object: Invalid name! Set to '${this.DEFAULTS.NAME}'.`);
            data.name = this.DEFAULTS.NAME;
        }

        //layer
        if ( imports.utils.IsUndefined(data.layer) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.layer = this.DEFAULTS.LAYER;}
        if ( !imports.utils.IsUndefined(data.layer) && (!imports.utils.IsAnInt(data.layer) || (data.layer <= -1)) ) {
            CustomLog("warn",`Particle Flow object: Invalid layer! Set to ${this.DEFAULTS.LAYER}.`);
            data.layer = this.DEFAULTS.LAYER;
        }

        //x
        if ( imports.utils.IsUndefined(data.x) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.x = this.DEFAULTS.X;}
        if ( !imports.utils.IsUndefined(data.x) && !imports.utils.IsAnInt(data.x) ) {
            CustomLog("warn",`Particle Flow object: Invalid x coordinate! Set to ${this.DEFAULTS.X}.`);
            data.x = this.DEFAULTS.X;
        }

        //y
        if ( imports.utils.IsUndefined(data.y) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.y = this.DEFAULTS.Y;}
        if ( !imports.utils.IsUndefined(data.y) && !imports.utils.IsAnInt(data.y) ) {
            CustomLog("warn",`Particle Flow object: Invalid y coordinate! Set to ${this.DEFAULTS.Y}.`);
            data.y = this.DEFAULTS.Y;
        }

        //width
        if ( imports.utils.IsUndefined(data.width) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.width = this.DEFAULTS.WIDTH;}
        if ( !imports.utils.IsUndefined(data.width) && (!imports.utils.IsAnInt(data.width) || (data.width < 0)) ) {
            CustomLog("warn",`Particle Flow object: Invalid width! Set to ${this.DEFAULTS.WIDTH}.`);
            data.width = this.DEFAULTS.WIDTH;
        }

        //height
        if ( imports.utils.IsUndefined(data.height) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.height = this.DEFAULTS.HEIGHT;}
        if ( !imports.utils.IsUndefined(data.height) && (!imports.utils.IsAnInt(data.height) || (data.height < 0)) ) {
            CustomLog("warn",`Particle Flow object: Invalid height! Set to ${this.DEFAULTS.HEIGHT}.`);
            data.height = this.DEFAULTS.HEIGHT;
        }

        //particle_radius_range
        if ( imports.utils.IsUndefined(data.particle_radius_range) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.particle_radius_range = this.DEFAULTS.PARTICLE_RADIUS_RANGE;}
        if ( !imports.utils.IsUndefined(data.particle_radius_range) && (!imports.utils.IsAnArray(data.particle_radius_range) || (data.particle_radius_range.length !== 2) || !imports.utils.IsAnInt(data.particle_radius_range[0]) || !imports.utils.IsAnInt(data.particle_radius_range[1])) ) {
            CustomLog("warn",`Particle Flow object: Invalid particle radius range! Set to [${this.DEFAULTS.PARTICLE_RADIUS_RANGE[0]},${this.DEFAULTS.PARTICLE_RADIUS_RANGE[1]}].`);
            data.particle_radius_range = this.DEFAULTS.PARTICLE_RADIUS_RANGE;
        }

        //type
        if ( imports.utils.IsUndefined(data.type) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.type = this.DEFAULTS.TYPE;}
        if ( !imports.utils.IsUndefined(data.type) && (!imports.utils.IsAString(data.type) || ( (data.type !== "radial") && (data.type !== "directional") )) ) {
            CustomLog("warn",`Particle Flow object: Invalid type! Set to ${this.DEFAULTS.TYPE}.`);
            data.type = this.DEFAULTS.TYPE;
        }

        //center
        if ( imports.utils.IsUndefined(data.center) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.center = {x:this.DEFAULTS.CENTER.X, y:this.DEFAULTS.CENTER.Y};}
        if ( !imports.utils.IsUndefined(data.center) && (!imports.utils.IsAnObject(data.center) || !imports.utils.IsAnInt(data.center.x) || !imports.utils.IsAnInt(data.center.y)) ) {
            CustomLog("warn",`Particle Flow object: Invalid center coordinates! Set to (${this.DEFAULTS.CENTER.X},${this.DEFAULTS.CENTER.Y}).`);
            data.center = {x:this.DEFAULTS.CENTER.X, y:this.DEFAULTS.CENTER.Y};
        }

        //particle direction
        if ( imports.utils.IsUndefined(data.particle_direction) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.particle_direction = this.DEFAULTS.PARTICLE_DIRECTION;}
        if ( !imports.utils.IsUndefined(data.particle_direction) && (!imports.utils.IsANumber(data.particle_direction) || (data.particle_direction < 0) || (data.particle_direction > 2*Math.PI)) ) {
            CustomLog("warn",`Particle Flow object: Invalid particle direction! Set to ${this.DEFAULTS.PARTICLE_DIRECTION}.`);
            data.particle_direction = this.DEFAULTS.PARTICLE_DIRECTION;
        }

        //spawn probability
        if ( imports.utils.IsUndefined(data.spawn_probability) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.spawn_probability = this.DEFAULTS.SPAWN_PROBABILITY;}
        if ( !imports.utils.IsUndefined(data.spawn_probability) && (!imports.utils.IsANumber(data.spawn_probability) || (data.spawn_probability < 0) || (data.spawn_probability > 1)) ) {
            CustomLog("warn",`Particle Flow object: Invalid spawn probability! Set to ${this.DEFAULTS.SPAWN_PROBABILITY}.`);
            data.spawn_probability = this.DEFAULTS.SPAWN_PROBABILITY;
        }

        //spawn tests
        if ( imports.utils.IsUndefined(data.spawn_tests) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.spawn_tests = this.DEFAULTS.SPAWN_TESTS;}
        if ( !imports.utils.IsUndefined(data.spawn_tests) && (!imports.utils.IsAnInt(data.spawn_tests) || (data.spawn_tests < 1)) ) {
            CustomLog("warn",`Particle Flow object: Invalid number of spawn tests! Set to ${this.DEFAULTS.SPAWN_TESTS}.`);
            data.spawn_probability = this.DEFAULTS.SPAWN_TESTS;
        }

        //color
        if ( imports.utils.IsUndefined(data.color) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.color = this.DEFAULTS.COLOR;}
        if ( !imports.utils.IsUndefined(data.color) && !imports.utils.IsAString(data.color) ) {
            CustomLog("warn",`Particle Flow object: Invalid color! Set to ${this.DEFAULTS.COLOR}.`); //do not detect css errors!
            data.color = this.DEFAULTS.COLOR;
        }

        return data;

    }

    this.data = this.verifyData(this.data);




    





    //###########################################
    //FUNCTION TO APPLY DATA TO THE PARTICLE FLOW
    //###########################################

    this.updateData = function(data) {
        if (imports.utils.IsUndefined(data)) throw "ParticleFlow.updateData: data missing!";
        //NOTE: it is NOT possible to change the particle flow type (data.type) and id (data.id). A new particle flow must be created in such case!

        if ( imports.utils.IsUndefined(data.id) ) {
            CustomLog("error","Particle Flow object: No ID specified!");
            return;
        }

        if (data.id === this.data.id) {//if he is the targeted element (remove executes for all objects!)
            //LOAD DATA
            this.data_backup = JSON.parse(JSON.stringify(this.data)); //keep a copy of the existing data
            this.data = data;//recollect data
            this.data.object_type = "particle_flow";

            //VERIFY DATA
            this.data = this.verifyData(this.data, "IGNORE_UNDEFINED");

            //APPLY DATA
            this.data = object_method.mergeData(this.data, this.data_backup); //simple assignement would overwrite existing data
            this.element.style.zIndex = this.data.layer;//layer
            this.element.style.left = this.data.x+"px";//x
            this.element.style.top = this.data.y+"px";//y
            this.element.style.width = this.data.width+"px";//width
            this.element.style.height = this.data.height+"px";//height
            // FOR CANVAS ###
            this.element.width = this.data.width;//width
            this.element.height = this.data.height;//height
            // ##############
        }


        //END OF updateData();
    }





    //###################
    //CREATE HTML ELEMENT
    //###################

    //canvas creation
    this.element = document.createElement("canvas");
    screen.appendChild(this.element);

    //basic parameters
    this.element.style.position = "absolute";
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
        this.parameter_container = new imports.ui_components.UIParameterRack(tab.objects, `UI-${this.data.id}`, this.data.name, '<i class="ri-loader-line"></i>', {
            default_closed: true,
        });
        this.parameter_container.delete_callback = () => {
            this.remove(this.data.id);
        }
        this.parameter_container.rename_callback = () => {
            InputDialog("Enter a new name for the object:", (result) => {
                this.updateData({id: this.data.id, name: result});
                this.parameter_container.rename(result);
            });
        }

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
            function(id, value) {  //id, type, parameters, name, callback with id
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

        //particle_radius_range
        AddParameter(
            {
                object_id: this.data.id,
                type: "value-xy",
                settings: {
                    default_x: this.data.particle_radius_range[0],
                    default_y: this.data.particle_radius_range[1],
                    min: 1,
                    step: 1,
                },
                title: "Particle size range",
                help: help.parameter.object.particles.ptcl_size,
            },
            function(id, value1, value2) {

                var this_object = object_method.getByID(id);

                this_object.updateData({
                    id: id,
                    particle_radius_range: [value1, value2],
                });
            }
        );

        //type
        AddParameter(
            {
                object_id: this.data.id,
                type: "choice",
                settings: {
                    default: this.data.type,
                    list:["radial", "directional"],
                },
                title: "Movement type",
                help: help.parameter.object.particles.mvmt_type,
            },
            function(id, value) {

                var this_object = object_method.getByID(id);

                this_object.updateData({
                    id: id,
                    type: value,
                });
            }
        );

        //center
        AddParameter(
            {
                object_id: this.data.id,
                type: "value-xy",
                settings: {
                    default_x: this.data.center.x,
                    default_y: this.data.center.y,
                    step: 1,
                },
                title: "Center position (radial)",
                help: help.parameter.object.particles.center_pos,
            },
            function(id, value1, value2) {

                var this_object = object_method.getByID(id);

                this_object.updateData({
                    id: id,
                    center: {
                        x: value1,
                        y: value2,
                    },
                });
            }
        );

        //direction
        AddParameter(
            {
                object_id: this.data.id,
                type: "value",
                settings: {
                    default: this.data.direction,
                    min: 0,
                    max: 360,
                    step: 1,
                },
                title: "Direction (directional)",
                help: help.parameter.object.particles.direction,
            },
            function(id, value) {

                var this_object = object_method.getByID(id);
                value = value * (2*Math.PI / 360);//conversion in radians

                this_object.updateData({
                    id: id,
                    particle_direction: value,
                });
            }
        );

        //spawn probability
        AddParameter(
            {
                object_id: this.data.id,
                type: "value",
                settings: {
                    default: this.data.spawn_probability,
                    min: 0,
                    max: 1,
                    step: 0.01,
                },
                title: "Spawn probability",
                help: help.parameter.object.particles.spawn_probability,
            },
            function(id, value) {

                var this_object = object_method.getByID(id);

                this_object.updateData({
                    id: id,
                    spawn_probability: value,
                });
            }
        );

        //spawn tests
        AddParameter(
            {
                object_id: this.data.id,
                type: "value",
                settings: {
                    default: this.data.spawn_tests,
                    min: 1,
                    step: 1,
                },
                title: "Spawn tests per frame",
                help: help.parameter.object.particles.spawn_tests,
            },
            function(id, value) {

                var this_object = object_method.getByID(id);

                this_object.updateData({
                    id: id,
                    spawn_tests: value,
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
                help: help.parameter.object.particles.ptcl_color,
            },
            function(id, value) {

                var this_object = object_method.getByID(id);

                this_object.updateData({
                    id: id,
                    color: value,
                });
            }
        );
    }





    //#####################################
    //FUNCTION TO ANIMATE THE PARTICLE FLOW
    //#####################################
    this.update = function() {
        var canvas = this.element;
        var ctx = canvas.getContext("2d");


        //IF AUDIO IS PLAYING
        var audio_progress = current_time/audio_duration;
        if (audio_progress !== 0 && audio_progress !== 1) {

            //clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            //probability to spawn a new particle
            for (let i=0; i<this.data.spawn_tests; i++) {
                if (Math.random() < this.data.spawn_probability) {
                    this.particles.push(new Particle(this.data, canvas));
                }
            }

            //update all particles
            for (let i=this.particles.length-1; i>=0; i--) {
                this.particles[i].update();
                //display if it hasn't been deleted
                if (this.particles[i]) this.particles[i].display();
            }

        }

        //END OF update();

        //finished updating
        return true;
    }







    //####################################
    //FUNCTION TO REMOVE THE PARTICLE FLOW
    //####################################

    this.remove = function(id) {
        if (!imports.utils.IsAString(id)) throw `ParticleFlow.remove: ${id} is not a valid ID.`;

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








function Particle(data, canvas) {//control each particle's behavior with an independant process.
    if (imports.utils.IsUndefined(data)) throw "Particle: data missing!";
    if (!imports.utils.IsAnElement(canvas)) throw "Particle: No valid canvas!";

    this.data = data;//main process data transfer

    //size and context of the canvas
    var ctx = canvas.getContext("2d");

    //PARAMETERS
    this.radius = imports.utils.RandomInt(this.data.particle_radius_range[0], this.data.particle_radius_range[1]);
    this.speed = 0;

    //direction
    if (this.data.type === "radial") this.direction = Math.random() * 2*Math.PI;
    if (this.data.type === "directional") this.direction = this.data.particle_direction;

    //spawn coordinates
    if (this.data.type === "radial") {
        //spawn to the center
        this.x = this.data.center.x;
        this.y = this.data.center.y;
    }
    if (this.data.type === "directional") {
        //SPAWN METHODS
        //spawn the particle arround the screen, depending of the direction.
        //set spawn within the allowed boundaries of the screen
        var x_min = -this.radius;
        var x_max = canvas.width + this.radius;
        var y_min = -this.radius;
        var y_max = canvas.height + this.radius;
        this.leftSpawn = function() {
            this.x = x_min;
            this.y = imports.utils.RandomInt(y_min, y_max);
        }
        this.rightSpawn = function() {
            this.x = x_max;
            this.y = imports.utils.RandomInt(y_min, y_max);
        }
        this.topSpawn = function() {
            this.x = imports.utils.RandomInt(x_min, x_max);
            this.y = y_min;
        }
        this.bottomSpawn = function() {
            this.x = imports.utils.RandomInt(x_min, x_max);
            this.y = y_max;
        }


        //DEFINE THE SPAWN TYPE
        this.spawn_type;//on which sides of the screen particles can spawn;
        //left || bottom-left || bottom || bottom-right || right || top-right || top || top-left;

        var PI = Math.PI;
        var axis_direction = true;
        //cases with a direction aligned with an axis
        switch (this.data.particle_direction) {
            case 2*PI:
            case 0:             this.spawn_type = "left";   break;
            case PI/2:          this.spawn_type = "top"; break;
            case PI:            this.spawn_type = "right";  break;
            case (3*PI)/2:      this.spawn_type = "bottom";    break;
            default: axis_direction = false;
        }
        //other cases
        if      (imports.utils.InInterval(this.data.particle_direction, [0       , PI/2    ], "excluded")) {this.spawn_type = "top-left"}
        else if (imports.utils.InInterval(this.data.particle_direction, [PI/2    , PI      ], "excluded")) {this.spawn_type = "top-right"}
        else if (imports.utils.InInterval(this.data.particle_direction, [PI      , (3*PI)/2], "excluded")) {this.spawn_type = "bottom-right"}
        else if (imports.utils.InInterval(this.data.particle_direction, [(3*PI)/2, 2*PI    ], "excluded")) {this.spawn_type = "bottom-left"}
        else if (!axis_direction) throw `Particle: ${this.data.particle_direction} is not a valid particle direction. It must be a radian value between 0 and 2PI!`


        //APPLY THE SPAWN TYPE
        var random = imports.utils.RandomInt(0,1);

        switch (this.spawn_type) {
            //====================================================
            case "left": this.leftSpawn(); break;
            //====================================================
            case "bottom-left":
                if (random==0) this.bottomSpawn();
                    else this.leftSpawn(); break;
            //====================================================
            case "bottom": this.bottomSpawn(); break;
            //====================================================
            case "bottom-right":
                if (random==0) this.bottomSpawn();
                    else this.rightSpawn(); break;
            //====================================================
            case "right": this.rightSpawn(); break;
             //====================================================
            case "top-right":
                if (random==0) this.topSpawn();
                    else this.rightSpawn(); break;
            //====================================================
            case "top": this.topSpawn(); break;
            //====================================================
            case "top-left":
                if (random==0) this.topSpawn();
                    else this.leftSpawn(); break;
            //====================================================
            default: throw `Particle: ${this.spawn_type} is not a valid spawn type!`
        }
    }




    //METHODS
    this.update = function() {
        //compute speed
        this.speed = volume/20;
        this.x_velocity = Math.cos(this.direction) * this.speed;
        this.y_velocity = Math.sin(this.direction) * this.speed;

        //apply speed
        this.x += this.x_velocity;
        this.y += this.y_velocity;

        //kill particle being out or range
        if (this.x > (canvas.width + this.radius)
        || this.x < (- this.radius)
        || this.y > (canvas.height + this.radius)
        || this.y < (- this.radius) )
        {//if below screen :
            //find back the particle array
            var particles;
            for (var object of objects) {
                if (object.data.id === this.data.id) {

                    particles = object.particles;
                    break//stop searching
                }
            }

            //remove the particle
            let index = particles.indexOf(this);//find it in the list,
            particles.splice(index, 1);// and delete it.
        }
    };
    this.display = function() {
        ctx.fillStyle = this.data.color;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
        ctx.fill();
    };
}
