//MIT License - Copyright (c) 2020 Picorims

const { BrowserWindowProxy } = require("electron");

//MAIN PROCESS, PAGE INITIALIZATION

var fps, stop_animating, animating, frame_count, fps_interval, time; //fps related variables
var fps_array, fps_array_max_length; //fps display

var audio_file, audio_file_type , current_time, audio_duration; //audio file related
var audio, source, context, analyzer, ctx_frequency_array; //Web Audio API related
var frequency_array; //spectrum array
var audio_position_string;// ??:?? | ??:??

var objects = [];//all objects inside the screen
var objects_callback = [];
var volume;//audio average volume




/*
######################################
GLOBAL INITIALIZATION AND AUDIO IMPORT
######################################
*/

window.onload = function() {InitPage();};

function InitPage() {//page initialization

    //PREPARE SAVE
    DefaultSave();
    setInterval(SyncSave, 500);


    //FPS PREPARATION
    stop_animating = false;
    frame_count = 0;
    fps_array = [];
    fps = current_save.fps;
    animating = false;
    setInterval(UpdateFPSDisplay, 1000);



    //UI INITIALIZATION
    InitUI();
}




function LoadAudio(file_data, type) {//load an audio file into the app. type: "file" || "url"  
    if (IsUndefined(file_data)) throw "LoadAudio: No file data provided, couldn't load the audio file.";
    if ( (type!=="file") && (type!=="url") ) throw `LoadAudio: ${type} is not a valid audio file type!`;

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
    if (type==="file") SetupAudioUI();
    //file objects are only loaded from the main window, and they are also the only type of file
    //loaded here (in the main window). So this is the only case requiring audio UI.


    //prepare data collection
    ctx_frequency_array = new Uint8Array(analyser.frequencyBinCount);//0 to 1023 => length=1024.
    
}



















/*
#########
ANIMATION
#########
*/


function StartAnimating(fps) {//prepare fps animation
    // initialize the timer variables and start the animation
    if (!IsANumber(fps)) throw `StartAnimating: ${fps} is not a valid fps value, start aborted.`;

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
        UpdateTimeDisplay();
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




function DrawFrame() {//update and draw the screen
    

    //#################
    //AUDIO CALCULATION
    //#################


    //collect frequency data
    analyser.getByteFrequencyData(ctx_frequency_array);
    frequency_array = LinearToLog(ctx_frequency_array);

    //time update
    current_time = audio.currentTime;
    audio_duration = audio.duration;

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
















//###
//FPS
//###

function UpdateFPSDisplay() {//display FPS regularly
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