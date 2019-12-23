//MIT License - Copyright (c) 2019 Picorims and Mischa

//MAIN PROCESS, PAGE INITIALIZATION

//NOTE - THIS WILL BE CLEANED UP LATER ON, WHEN CRAFTING THE OBJECT SYSTEM ENGINE

var container, background, canvas, visualizer_cvs, title, visualizer,
timer, timer_bar, time,
volume,
visualizer_frequency_array;

var visualizer_mode = "straight";//straight || circular || straight-wave
var particle_mode = "radial";//radial || directional
var particle_direction = Math.PI/6;//in radians, from 0 to 2PI;
var bars = 100;
var visualizer_radius = 150;//for circular
var particles = [];
var max_probability = 0.85; //INVERTED SCALE: 1 -> 0; 0.75 -> 0.25; 0 -> 1;
var center_x, center_y;
var analyser_range = [0,800];//for straight mode test
//var analyser_range = [150,600];//for circular test

function InitPage() {//page initialization
    //HTML definitions
    container = document.getElementById("container");
    background = document.getElementById("background");
    canvas = document.getElementById("particles");
    title = document.getElementById("title");
    visualizer = document.getElementById("visualizer");
    timer = document.getElementById("timer");
    timer_bar = document.getElementById("timer_bar");
    time = document.getElementById("time");




    //create main structure
    audio = new Audio();
    context = new window.AudioContext();
    analyser = context.createAnalyser();

    //audio
    audio.src = "Skylike - Lights (Original).mp3";
    source = context.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(context.destination);
    document.getElementById("start_button").onclick = function() { audio.play() };

    //prepare data collection
    frequency_array = new Uint8Array(analyser.frequencyBinCount);//0 to 1023 => length=1024.

    //create vizualizer
    CreateVisualizer();

    //loop
    AnimationLooper();
}

function CreateVisualizer() {//prepare the visualizer and create the range of bars for audio visualization
    //prepare container
    switch (visualizer_mode) {
        case "circular":
            //position and dimension
            size = window.innerHeight/2;
            visualizer.style.width = size+"px";
            visualizer.style.height = size+"px";
            visualizer.style.top = (window.innerHeight/2) - (visualizer.offsetHeight/2) + "px";
            visualizer.style.left = (window.innerWidth/2) - (visualizer.offsetWidth/2) + "px";

            //switch to absolute positioning instead of flex box for the bars.
            visualizer.style.position = "absolute";
            visualizer.style.display = "inline-block";
            break
        case "straight" || "straight-wave":
            //position and dimension
            visualizer.style.width = window.innerWidth*0.9+"px";
            visualizer.style.left = (window.innerWidth/2) - (visualizer.offsetWidth/2) + "px";
            break
        default:
            throw `AnimationLooper: ${visualizer_mode} is not a valid visualizer type!`
    }

    if (visualizer_mode==="straight" || visualizer_mode==="circular") {
        //create all bars
        var rot_step = 2*Math.PI/bars;
        var rot_pos = 0;
        for (var i=0; i<bars; i++) {
            //create a bar
            var bar_element = document.createElement("div");
            visualizer.appendChild(bar_element);
            bar_element.id = "bar"+i;
            bar_element.className = "visualizer_bar";

            //apply rotation for circular mode
            if (visualizer_mode==="circular") {
                //centering
                bar_element.style.position = "absolute";
                var center_x = (visualizer.offsetWidth / 2) - (bar_element.offsetWidth / 2);
                var center_y = (visualizer.offsetHeight/2);
                bar_element.style.left = center_x + Math.cos(rot_pos)*visualizer_radius + "px";
                bar_element.style.top = center_y + Math.sin(rot_pos)*visualizer_radius + "px";
                //transform
                bar_element.style.transformOrigin = "center top";
                bar_element.style.transform = `scale(-1,1) rotate( ${rot_pos+Math.PI/2}rad )`;
                //iterate
                rot_pos += rot_step;
            }
        }
    }

    if (visualizer_mode==="straight-wave") {//prepare canvas for the visualization
        visualizer_cvs = document.createElement("canvas");
        visualizer.appendChild(visualizer_cvs);
        visualizer_cvs.id = "visualizer_cvs";
        visualizer_cvs.style.width = visualizer.offsetWidth + "px";
        visualizer_cvs.style.height = visualizer.offsetHeight + "px";
        visualizer_cvs.style.position = "absolute";
        visualizer_cvs.style.top = 0;
        visualizer_cvs.style.left = 0;
    }
}




function AnimationLooper() {//animate the visualizer
    //HTML elements dimension and margins recalculation to make the page responsive
    container.style.width = window.innerWidth+"px";
    container.style.height = window.innerHeight+"px";

    title.style.marginTop = 0.4*window.innerHeight+"px";
    
    //audio visualizer setup depending of the visualization mode
    switch (visualizer_mode) {
        case "circular":
            visualizer.style.top = (window.innerHeight/2) - (visualizer.offsetHeight/2) + "px";
            visualizer.style.left = (window.innerWidth/2) - (visualizer.offsetWidth/2) + "px";
            break
        case "straight":
            visualizer.style.width = window.innerWidth*0.9+"px";
            visualizer.style.left = (window.innerWidth/2) - (visualizer.offsetWidth/2) + "px";
            break
        case "straight-wave":
            visualizer.style.width = window.innerWidth*0.9+"px";
            visualizer.style.left = (window.innerWidth/2) - (visualizer.offsetWidth/2) + "px";

            visualizer_cvs.style.width = visualizer.offsetWidth + "px";
            visualizer_cvs.style.height = visualizer.offsetHeight + "px";
            break
        default:
            throw `AnimationLooper: ${visualizer_mode} is not a valid visualizer type!`
    }

    timer.style.width = window.innerWidth*0.9+"px";
    timer.style.left = (window.innerWidth/2) - (timer.offsetWidth/2) + "px";
    
    timer_bar.style.height = timer.offsetHeight - 20 + "px";
    timer_bar.style.marginTop = ((timer.offsetHeight-10)/2) - (timer_bar.offsetHeight/2) + "px";
    
    time.style.marginLeft = (window.innerWidth/2) - (time.offsetWidth/2) + "px";


    
    
    
    //update canvas
    CanvasLooper();
    
    //collect frequency data
    analyser.getByteFrequencyData(frequency_array);
    visualizer_frequency_array = MappedArray(frequency_array, bars, analyser_range[0], analyser_range[1]);
    
    if (visualizer_mode==="straight"||visualizer_mode==="circular") {
        var rot_step = 2*Math.PI/bars;
        var rot_pos = 0;
        for (var i = 0; i < bars; i++) {
            //apply data to each bar
            document.getElementById("bar"+i).style.height = (visualizer_frequency_array[i]*0.7)+"px";
            
            if (visualizer_mode==="circular") {//fix rotation
                var bar_element = document.getElementById("bar"+i);
                //centering
                var center_x = (visualizer.offsetWidth / 2) - (bar_element.offsetWidth / 2);
                var center_y = (visualizer.offsetHeight/2);
                bar_element.style.left = center_x + Math.cos(rot_pos)*visualizer_radius + "px";
                bar_element.style.top = center_y + Math.sin(rot_pos)*visualizer_radius + "px";
                //transform
                bar_element.style.transformOrigin = "center top";
                bar_element.style.transform = `scale(-1,-1) rotate( ${rot_pos+Math.PI/2}rad )`;
                //iterate
                rot_pos += rot_step;
            }
        }
    }

    
    //apply brightness filter
    // volume = 0;
    // var sum = 0;
    // for (var i=0; i<frequency_array.length-100; i++) {
    //     sum += frequency_array[i];
    // }
    // volume = sum/(frequency_array.length-100); //0 to 120 most of the time
    // if (volume>100) {
    //     filter_percent = (volume<104)? volume: 104;
    // } else {
    //     filter_percent = 100;
    // }
    // background.style.filter = `brightness(${filter_percent}%)`;
    

    //update timer
    timer_bar.style.width = (audio.currentTime/audio.duration) * (timer.offsetWidth - 20) + "px";//-20 takes in count the "margin"
    
    
    //update time
    var time_pos_sec = Math.floor(audio.currentTime)%60;
    if (time_pos_sec < 10) time_pos_sec = "0"+time_pos_sec;
    var time_pos_min = Math.floor(audio.currentTime/60);
    
    var time_length_sec = Math.floor(audio.duration)%60;
    if (time_length_sec < 10) time_length_sec = "0"+time_length_sec;
    var time_length_min = Math.floor(audio.duration/60);
    
    time.innerHTML = `${time_pos_min}:${time_pos_sec} | ${time_length_min}:${time_length_sec}`;

    
    //end of a frame
    window.requestAnimationFrame(AnimationLooper);
}





function CanvasLooper() {//part of the update loop targeting only the canvas
    ParticleCanvasLoop();
    if (visualizer_mode==="straight-wave") VisualizerCanvasLoop();
}


function VisualizerCanvasLoop() {//visualizers generated through canvas.
    //set canvas context and size
    visualizer_cvs.width = visualizer.offsetWidth;
    visualizer_cvs.height = visualizer.offsetHeight;
    vis_ctx = visualizer_cvs.getContext("2d");

    //collect frequency data
    analyser.getByteFrequencyData(frequency_array);
    visualizer_frequency_array = MappedArray(frequency_array, bars, analyser_range[0], analyser_range[1]);

    //divide the canvas into equal parts
    var wave_step = (visualizer_cvs.width / bars);//create step
    var wave_step_pos = wave_step/2;//start centered.

    //clear
    vis_ctx.clearRect(0, 0, visualizer_cvs.width, visualizer_cvs.height);

    //create the wave
    vis_ctx.beginPath();
    vis_ctx.moveTo(0, visualizer_cvs.height);
    //make all wave points
    for (var i=0; i < bars; i++) {
        //place a new bezier point
        var x = wave_step_pos;
        var y = visualizer_cvs.height - visualizer_frequency_array[i];
        var ctrl_point_1_x = (i===0) ? x-(wave_step/4) : x-(wave_step/2);
        var ctrl_point_1_y = (visualizer_cvs.height - visualizer_frequency_array[i-1]) || visualizer_cvs.height;//at the same height of the previous point, if that one exists.
        var ctrl_point_2_x = ctrl_point_1_x;
        var ctrl_point_2_y = y;
        vis_ctx.bezierCurveTo(ctrl_point_1_x, ctrl_point_1_y, ctrl_point_2_x, ctrl_point_2_y, x, y);
        wave_step_pos += wave_step;
    }
    //end the wave
    var x = visualizer_cvs.width;
    var y = visualizer_cvs.height;
    var ctrl_point_1_x = x-(wave_step/4);
    var ctrl_point_1_y = visualizer_cvs.height - visualizer_frequency_array[bars-1];//last bar height.
    var ctrl_point_2_x = x-(wave_step/4);
    var ctrl_point_2_y = y;
    vis_ctx.bezierCurveTo(ctrl_point_1_x, ctrl_point_1_y, ctrl_point_2_x, ctrl_point_2_y, x, y);
    vis_ctx.fillStyle = "#ffffff";
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
    //     var y = visualizer_cvs.height - visualizer_frequency_array[i];
    //     vis_ctx.arc(x, y, 3, 0, 2*Math.PI);
    //     vis_ctx.fillStyle = `rgb(${r},0,0)`;
    //     vis_ctx.fill();

    //     vis_ctx.beginPath();
    //     var ctrl_point_1_x = (i===0) ? x-(wave_step/4) : x-(wave_step/2);
    //     var ctrl_point_1_y = (visualizer_cvs.height - visualizer_frequency_array[i-1]) || visualizer_cvs.height;//at the same height of the previous point, if that one exists.
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
    // var ctrl_point_1_y = visualizer_cvs.height - visualizer_frequency_array[bars-1];//last bar height.
    // vis_ctx.arc(ctrl_point_1_x, ctrl_point_1_y, 3, 0, 2*Math.PI);
    // vis_ctx.fillStyle = `rgb(0,${r},0)`;
    // vis_ctx.fill();

    // vis_ctx.beginPath();
    // var ctrl_point_2_x = x-(wave_step/4);
    // var ctrl_point_2_y = y;
    // vis_ctx.arc(ctrl_point_2_x, ctrl_point_2_y, 3, 0, 2*Math.PI);
    // vis_ctx.fillStyle = `rgb(0,0,${r})`;
    // vis_ctx.fill();
    //###########################################################################################
    //###########################################################################################
    //###########################################################################################
    //###########################################################################################
    }


function ParticleCanvasLoop() {//particles canvas animation
    // set to the size of device
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext("2d");
    
    // find the center of the window
    center_x = canvas.width / 2;
    center_y = canvas.height / 2;

    //get audio volume
    volume = 0;
    var sum = 0;
    for (var i=0; i<frequency_array.length-100; i++) {
        sum += frequency_array[i];
    }
    volume = sum/(frequency_array.length-100); //0 to 120 most of the time

    
    
    //IF AUDIO IS PLAYING
    audio_progress = audio.currentTime/audio.duration;
    if (audio_progress !== 0 && audio_progress !== 1) {
        
        //probability to spawn a new particle
        probability = max_probability - volume/400;
        if (Math.random() > probability) {
            particles.push(new Particle());
        }

        //update all particles
        for (var particle of particles) {
            particle.update();
            particle.display();
        }

    }
}


function Particle() {//control particle behavior. Each particle has an independant process.
    //PARAMETERS
    this.radius = RandomInt(3,6);
    this.speed = 0;
    
    //direction
    if (particle_mode==="radial") this.direction = Math.random() * 2*Math.PI;
    if (particle_mode==="directional") this.direction = particle_direction;
    
    //spawn coordinates
    if (particle_mode==="radial") {
        //spawn to the center
        this.x = center_x;
        this.y = center_y;
    }
    if (particle_mode==="directional") {
        //SPAWN METHODS
        //spawn the particle arround the screen, depending of the direction.
        //set spawn within the allowed boundaries of the screen
        var x_min = -150;
        var x_max = window.innerWidth + 150;
        var y_min = -150;
        var y_max = window.innerHeight + 150;
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
        switch (particle_direction) {
            case 2*PI:
            case 0:             this.spawn_type = "left";   break;
            case PI/2:          this.spawn_type = "top"; break;
            case PI:            this.spawn_type = "right";  break;
            case (3*PI)/2:      this.spawn_type = "bottom";    break;
            default: axis_direction = false;
        }
        //other cases
        if      (InInterval(particle_direction, [0       , PI/2    ], "excluded")) {this.spawn_type = "top-left"}
        else if (InInterval(particle_direction, [PI/2    , PI      ], "excluded")) {this.spawn_type = "top-right"}
        else if (InInterval(particle_direction, [PI      , (3*PI)/2], "excluded")) {this.spawn_type = "bottom-right"}
        else if (InInterval(particle_direction, [(3*PI)/2, 2*PI    ], "excluded")) {this.spawn_type = "bottom-left"}
        else if (!axis_direction) throw `Particle: ${particle_direction} is not a valid particle direction. It must be a radian value between 0 and 2PI!`
        

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
        if (this.x > window.innerWidth+200
        || this.x < -200
        || this.y > window.innerHeight+200
        || this.y < -200) 
        {//if below window :
            let index = particles.indexOf(this);//find it in the list,
            particles.splice(index, 1);// and delete it.
        }
    };
    this.display = function() {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
        ctx.fill();
    };
}
