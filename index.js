//MIT License - Copyright (c) 2019 Picorims and Mischa

//MAIN PROCESS, PAGE INITIALIZATION

var container, background, canvas, title, visualizer,
timer, timer_bar, time,
volume;

var bars = 150;
var particles = [];
var max_probability = 0.85; //INVERTED SCALE: 1 -> 0; 0.75 -> 0.25; 0 -> 1;
var center_x, center_y;
var analyser_range = [0,800];

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

function CreateVisualizer() {//create the range of bars for audio visualization
    for (var i=0; i<bars; i++) {
        //create a bar
        var bar_element = document.createElement("div");
        visualizer.appendChild(bar_element);
        bar_element.id = "bar"+i;
        bar_element.className = "visualizer_bar";
    }
}




function AnimationLooper() {//animate the visualizer
    //HTML elements dimension and margins recalculation to make the page responsive
    container.style.width = window.innerWidth+"px";
    container.style.height = window.innerHeight+"px";

    title.style.marginTop = 0.4*window.innerHeight+"px";

    visualizer.style.width = window.innerWidth*0.9+"px";
    visualizer.style.left = window.innerWidth/2 - visualizer.offsetWidth/2 + "px";
    
    timer.style.width = window.innerWidth*0.9+"px";
    timer.style.left = window.innerWidth/2 - timer.offsetWidth/2 + "px";
    
    timer_bar.style.height = timer.offsetHeight - 20 + "px";
    timer_bar.style.marginTop = (timer.offsetHeight-10)/2 - timer_bar.offsetHeight/2 + "px";
    
    time.style.marginLeft = window.innerWidth/2 - time.offsetWidth/2 + "px";


    
    
    
    //update canvas
    CanvasLooper();
    
    //collect frequency data
    analyser.getByteFrequencyData(frequency_array);
    visualizer_frequency_array = MappedArray(frequency_array, bars, analyser_range[0], analyser_range[1]);
    for (var i = 0; i < bars; i++) {
        //apply data to each bar
        document.getElementById("bar"+i).style.height = (visualizer_frequency_array[i]*0.7)+"px";
    }
    window.requestAnimationFrame(AnimationLooper);

    
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
    timer_bar.style.width = (audio.currentTime/audio.duration) * (timer.offsetWidth - 20) + "px";
    
    
    //update time
    var time_pos_sec = Math.floor(audio.currentTime)%60;
    if (time_pos_sec < 10) time_pos_sec = "0"+time_pos_sec;
    var time_pos_min = Math.floor(audio.currentTime/60);
    
    var time_length_sec = Math.floor(audio.duration)%60;
    if (time_length_sec < 10) time_length_sec = "0"+time_length_sec;
    var time_length_min = Math.floor(audio.duration/60);
    
    time.innerHTML = `${time_pos_min}:${time_pos_sec} | ${time_length_min}:${time_length_sec}`;
}





function CanvasLooper() {//part of the update loop targeting only the canvas
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
    this.x = center_x;
    this.y = center_y;
    this.radius = RandomInt(3,6);
    this.speed = 0;
    this.direction = Math.random() * 2*Math.PI;
    
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
