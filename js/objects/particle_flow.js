//MIT License - Copyright (c) 2020 Picorims

//PARTICLE FLOW OBJECT PROCESS

/*data = {
    id: ?, (string, name)
    layer: ?, (integer)
    x: ?, (px)
    y: ?, (px)
    width: ?, (px)
    height: ?, (px)
    particle_radius_range: [?, ?], (min and max integer, radius)
    type: ("radial"||"directional"),
    center: {
        x: ?, (px)
        y: ?, (px)
    },
    particle_direction: ,(rad, between 0 and 2PI)
    max_spawn_probability: ?, (float) //IT IS SUPPOSED TO BE SO, BUT IT'S REVERSED AND NOT COMPLETELY TRUE, IT WILL BE IMPROVED (eg: 0 is a lot, 1 is small probability)
    color: ?, (string: hex, rgb, rgba)
}*/

function ParticleFlow(data) {
    this.data = data;//collect data
    this.data.object_type = "particle_flow";
    this.particles = [];//contain all particles
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
            console.error("Particle Flow object: received an object with an unspecified/invalid ID! A random ID is given.");
            data.id = `${Math.random()}`;
        }

        //layer
        if ( IsUndefined(data.layer) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.layer = 0;}
        if ( !IsUndefined(data.layer) && (!IsAnInt(data.layer) || (data.layer <= -1)) ) {
            console.warn("Particle Flow object: Invalid layer! Set to 0.");
            data.layer = 0;
        }

        //x
        if ( IsUndefined(data.x) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.x = 0;}
        if ( !IsUndefined(data.x) && !IsAnInt(data.x) ) {
            console.warn("Particle Flow object: Invalid x coordinate! Set to 0.");
            data.x = 0;
        }

        //y
        if ( IsUndefined(data.y) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.y = 0;}
        if ( !IsUndefined(data.y) && !IsAnInt(data.y) ) {
            console.warn("Particle Flow object: Invalid y coordinate! Set to 0.");
            data.y = 0;
        }

        //width
        if ( IsUndefined(data.width) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.width = 100;}
        if ( !IsUndefined(data.width) && (!IsAnInt(data.width) || (data.width < 0)) ) {
            console.warn("Particle Flow object: Invalid width! Set to 100.");
            data.width = 100;
        }

        //height
        if ( IsUndefined(data.height) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.height = 100;}
        if ( !IsUndefined(data.height) && (!IsAnInt(data.height) || (data.height < 0)) ) {
            console.warn("Particle Flow object: Invalid height! Set to 100.");
            data.height = 100;
        }

        //particle_radius_range
        if ( IsUndefined(data.particle_radius_range) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.particle_radius_range = [1,2];}
        if ( !IsUndefined(data.particle_radius_range) && (!IsAnArray(data.particle_radius_range) || (data.particle_radius_range.length !== 2) || !IsAnInt(data.particle_radius_range[0]) || !IsAnInt(data.particle_radius_range[1])) ) {
            console.warn("Particle Flow object: Invalid particle radius range! Set to [1,2].");
            data.particle_radius_range = [1,2];
        }

        //type
        if ( IsUndefined(data.type) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.type = "radial";}
        if ( !IsUndefined(data.type) && (!IsAString(data.type) || ( (data.type !== "radial") && (data.type !== "directional") )) ) {
            console.warn("Particle Flow object: Invalid type! Set to radial.");
            data.type = "radial";
        }

        //center
        if ( IsUndefined(data.center) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.center = {x:1, y:1};}
        if ( !IsUndefined(data.center) && (!IsAnObject(data.center) || !IsAnInt(data.center.x) || !IsAnInt(data.center.y)) ) {
            console.warn("Particle Flow object: Invalid center coordinates! Set to (0,0).");
            data.center = {x:1, y:1};
        }

        //particle direction
        if ( IsUndefined(data.particle_direction) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.particle_direction = 0;}
        if ( !IsUndefined(data.particle_direction) && (!IsANumber(data.particle_direction) || (data.particle_direction < 0) || (data.particle_direction > 2*Math.PI)) ) {
            console.warn("Particle Flow object: Invalid particle direction! Set to 0.");
            data.particle_direction = 0;
        }

        //max spawn probability
        if ( IsUndefined(data.max_spawn_probability) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.max_spawn_probability = 0.75;}
        if ( !IsUndefined(data.max_spawn_probability) && (!IsANumber(data.max_spawn_probability) || (data.max_spawn_probability < 0) || (data.max_spawn_probability > 1)) ) {
            console.warn("Particle Flow object: Invalid max spawn probability! Set to 0,75.");
            data.max_spawn_probability = 0.75;
        }

        //color
        if ( IsUndefined(data.color) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.color = "#fff";}
        if ( !IsUndefined(data.color) && !IsAString(data.color) ) {
            console.warn("Particle Flow object: Invalid color! White color is applied."); //do not detect css errors!
            data.color = "#fff";
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





    //###########################################
    //FUNCTION TO APPLY DATA TO THE PARTICLE FLOW
    //###########################################

    this.updateData = function(data) {
        //NOTE: it is NOT possible to change the particle flow type (data.type) and id (data.id). A new particle flow must be created in such case!
        
        if ( IsUndefined(data.id) ) {
            console.error("Particle Flow object: No ID specified!");
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
            this.data = this.mergeData(this.data, this.data_backup); //simple assignement would overwrite existing data
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



    //###############
    //SAVE THE OBJECT
    //###############
    current_save.objects.push(this.data);









    //#####################################
    //FUNCTION TO ANIMATE THE PARTICLE FLOW
    //#####################################
    this.update = function() {
        var canvas = this.element;
        var ctx = canvas.getContext("2d");
        
        
        //IF AUDIO IS PLAYING
        var audio_progress = audio.currentTime/audio.duration;
        if (audio_progress !== 0 && audio_progress !== 1) {
            
            //clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            //probability to spawn a new particle
            probability = this.data.max_spawn_probability - volume/400;
            if (Math.random() > probability) {
                this.particles.push(new Particle(this.data, canvas));
            }

            //update all particles
            for (var particle of this.particles) {
                particle.update();
                particle.display();
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








function Particle(data, canvas) {//control each particle's behavior with an independant process.
    this.data = data;//main process data transfer

    //size and context of the canvas
    var ctx = canvas.getContext("2d");

    //PARAMETERS
    this.radius = RandomInt(this.data.particle_radius_range[0], this.data.particle_radius_range[1]);
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
            this.y = RandomInt(y_min, y_max);
        }
        this.rightSpawn = function() {
            this.x = x_max;
            this.y = RandomInt(y_min, y_max);
        }
        this.topSpawn = function() {
            this.x = RandomInt(x_min, x_max);
            this.y = y_min;
        }
        this.bottomSpawn = function() {
            this.x = RandomInt(x_min, x_max);
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
        if      (InInterval(this.data.particle_direction, [0       , PI/2    ], "excluded")) {this.spawn_type = "top-left"}
        else if (InInterval(this.data.particle_direction, [PI/2    , PI      ], "excluded")) {this.spawn_type = "top-right"}
        else if (InInterval(this.data.particle_direction, [PI      , (3*PI)/2], "excluded")) {this.spawn_type = "bottom-right"}
        else if (InInterval(this.data.particle_direction, [(3*PI)/2, 2*PI    ], "excluded")) {this.spawn_type = "bottom-left"}
        else if (!axis_direction) throw `Particle: ${this.data.particle_direction} is not a valid particle direction. It must be a radian value between 0 and 2PI!`
        

        //APPLY THE SPAWN TYPE
        var random = RandomInt(0,1);

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
