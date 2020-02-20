//MIT License - Copyright (c) 2020 Picorims

//MAIN PROCESS, PAGE INITIALIZATION

var control_panel, screen_interface, screen;//MAIN HTML ELEMENTS
var fps, stop_animating, animating, frame_count, fps_interval, time; //fps related variables
var fps_array, fps_array_max_length;
var volume;
var current_save; //all data of the project that can be saved
var audio, audio_file, audio_file_type, source, context, analyzer, frequency_array;//audio object for JavaScript / audio File() object / file format / audio API required modules
var objects = [];//all objects inside the screen
var objects_callback = [];


function InitPage() {//page initialization
    //HTML DEFINITIONS
    control_panel = document.getElementById("control_panel");
    screen_interface = document.getElementById("interface");
    screen = document.getElementById("screen");
    InitUI();
    


    //SCREEN SIZE
    //short syntax
    screen.width = 1280;
    screen.height = 720;
    //apply it
    screen.style.width = screen.width+"px";
    screen.style.height = screen.height+"px";





    //PREPARE SAVE
    DefaultSave();

    



    //FPS PREPARATION
    stop_animating = false;
    frame_count = 0;
    fps_array = [];
    fps = 60;
    animating = false;
    setInterval(UpdateFPS, 1000);
}




function LoadAudio(file_data, type) {//load an audio file into the app. type: "file" || "url"
    if (typeof is_offline === undefined) is_offline = false;//optional argument    

    //stop current audio
    if (typeof audio !== "undefined") {
        audio.pause();
        audio.currentTime = 0;
    }


    //store audio
    //clone the audio file so it can still be used even if the file is moved or renamed. Otherwise it
    //would fail.
    if (type==="file") {
        console.log(file_data.type);

        var cloned_file = new File([file_data], {type: file_data.type});
        audio_file_type = file_data.type;
        
        file_data = cloned_file;
        audio_file = cloned_file;
    }


    //LOAD

    //modules
    audio = new Audio();
    context = new window.AudioContext();
    analyser = context.createAnalyser();

    //audio source
    audio.src = (type==="url")? file_data : window.URL.createObjectURL(file_data); //"url" -> file_data is an url || "file" -> generate url from file
    source = context.createMediaElementSource(audio);
    



    //setup
    source.connect(analyser);
    analyser.connect(context.destination);
    if (type==="file") document.getElementById("start_button").onclick = function() { 
        if (!animating) StartAnimating(fps);
        audio.play();
    };//file objects are only loaded from the main window, and they are also the only type of file
    //loaded here. So this is the only case requiring to update the "START" button!


    //prepare data collection
    frequency_array = new Uint8Array(analyser.frequencyBinCount);//0 to 1023 => length=1024.
    
}








function ApplyZoom(zoom) {//function that apply to the screen the zoom given in the control_panel.
    screen.style.transformOrigin = "0 0";
    screen.style.transform = `scale(${zoom})`;
}



function StartAnimating(fps) {//prepare fps animation
    // initialize the timer variables and start the animation

    stop_animating = false;
    animating = true;
    fps_interval = 1000 / fps; //in ms
    time = {};//object
    time.then = performance.now();
    time.start = time.then;

    Animate();
}


function StopAnimating() {//stop the fps animation loop
    stop_animating = true;
    animating = false;
}

// the animation loop calculates time elapsed since the last loop
// and only draws if the specified fps interval is achieved
function Animate() {

    //stop animating if requested
    if (stop_animating) return;
    
    // request another frame
    requestAnimationFrame(Animate);

    // calc elapsed time since last loop
    time.now = performance.now();
    time.elapsed = time.now - time.then;

    // if enough time has elapsed and all objects finished rendering, draw the next frame
    if ( (time.elapsed > fps_interval) && (UpdateFinished()) ) {

        //add this frame duration to the frame array
        fps_array.push(   parseInt(1000/ (time.now - time.then) )  );

        // Get ready for next frame by setting then=now, but also adjust for your
        // specified fps_interval not being a multiple of user screen RAF's interval
        //(16.7ms for 60fps for example).
        time.then = time.now - (time.elapsed % fps_interval);

        //Draw the frame
        DrawFrame();
    }
}



function UpdateFinished() {//returns if all the objects have finished updating.
    var finished_render = true;
    //if one object didn't finish rendering, returns false
    for (var i=0; i<objects_callback.length; i++) {
        if (!objects_callback[i]) finished_render = false;
    }
    
    return finished_render;
}



function UpdateFPS() {//display FPS regularly
    fps_array_max_length = 10;
    
    //maintain the max length of the array
    if (fps_array.length > fps_array_max_length) {
        
        var overflow = fps_array.length - fps_array_max_length;
        fps_array.splice(0, overflow);
    }

    //calculates average FPS from the fps array
    var sum = 0;
    for (var index of fps_array) {
        sum += index;
    }
    var average_fps = sum / fps_array_max_length;

    //display fps
    document.getElementById("fps").innerHTML = average_fps;
}



function DrawFrame() {//update and draw the screen
    //#################
    //CSS RECALCULATION
    //#################
    //HTML elements dimension and margins recalculation to make the page responsive
    
    
    //screen interface
    var interface_padding = window.getComputedStyle(screen_interface).getPropertyValue("padding-left"); //padding-left defined trough "padding" is only accessible that way!
    var interface_padding_value = parseInt( interface_padding.replace("px","") );

    screen_interface.style.width = ( window.innerWidth - control_panel.offsetWidth - (interface_padding_value*2) ) + "px";
    screen_interface.style.height = ( window.innerHeight - (interface_padding_value*2) )+"px";
    screen_interface.style.top = 0;
    screen_interface.style.left = control_panel.offsetWidth+"px";

    
    //screen positioning
    var screen_margin_left = (screen_interface.offsetWidth/2) - (screen.width/2) - interface_padding_value;
    var screen_margin_top = (window.innerHeight/2) - (screen.height/2);
    
    screen.style.marginLeft = (screen_margin_left > 0) ? (screen_margin_left+"px") : "0px";
    screen.style.marginTop =  (screen_margin_top > 0)  ? (screen_margin_top+"px")  : "0px";




    
    
    //#################
    //AUDIO CALCULATION
    //#################


    //collect frequency data
    analyser.getByteFrequencyData(frequency_array);


    //volume update
    volume = 0;
    var sum = 0;
    for (var i=0; i<frequency_array.length-100; i++) {
        sum += frequency_array[i];
    }
    volume = sum/(frequency_array.length-100); //0 to 120 most of the time


    //update all objects
    objects_callback = [];
    for (var i=0; i<objects.length; i++) {
        objects_callback[i] = false;//reset all callbacks to false
        objects_callback[i] = objects[i].update();//set to true once update is finished
    }
   
    
    //end of a frame
}