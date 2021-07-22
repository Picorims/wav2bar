//MIT License - Copyright (c) 2020-2021 Picorims

const { ipcRenderer } = require("electron");
const { Logger } = require("log4js");

const software_version = '0.2.1'; //current build version
const software_status = 'Indev';
let working_dir; //working directory for user, temp, logs...
let root_dir; //root of the app (where main.js is located, and html/css folders)
let os; //operating system

var can_close_window_safely = false;//set to true when the user confirmed exit

//MAIN PROCESS, PAGE INITIALIZATION

//stores es module imports (loaded through promises as this is not a module and thus, "import" can't be used)
let imports = {
    utils: null,
    ui_components: null,
};

var fps, stop_animating, animating, frame_count, fps_interval, time; //fps related variables
var fps_array, fps_array_max_length; //fps display

var audio_file, audio_file_type , current_time, audio_duration; //audio file related
var audio, source, context, analyzer, ctx_frequency_array; //Web Audio API related
var frequency_array; //spectrum array
var vol_prev_frequency_array, vol_frequency_array; //for volume smoothing
var audio_position_string;// ??:?? | ??:??

var objects = [];//all objects inside the screen
var objects_callback = [];
var volume;//audio average volume




/*
######################################
GLOBAL INITIALIZATION AND AUDIO IMPORT
######################################
*/

window.onload = function() {GetWorkingDir();};
window.onbeforeunload = function(event) {PrepareWindowClose(event);};

//get the main process working directory for user, temp, log, etc.
//before initializing the page.
function GetWorkingDir() {
    CustomLog("debug","Getting main config...");
    ipcRenderer.invoke('get-working-dir').then(dir => {
        working_dir = dir;
        return ipcRenderer.invoke('get-os');
    }).then(operating_system => {
        os = operating_system;
        return ipcRenderer.invoke('get-app-root');
    }).then(root => {
        root_dir = root;
        CustomLog("debug","Getting main config done.");
        LoadModules();
    });
}

//load ES modules required
function LoadModules() {
    CustomLog("debug","Loading modules...");
    import("./utils/utils.js").then(module => {
        imports.utils = module;
    }).then(() => {
        CustomLog("debug","Loading modules done.");
        InitPage();
    }).catch(error => {
        CustomLog("error", `couldn't load modules: ${error}`);
    });
}

function InitPage() {//page initialization

    //PREPARE SAVE
    InitSave();


    //FPS PREPARATION
    stop_animating = false;
    frame_count = 0;
    fps_array = [];
    fps = current_save.fps;
    animating = false;
    if (!export_mode) setInterval(UpdateFPSDisplay, 1000);



    //UI INITIALIZATION
    if (!export_mode) InitUI();
}




function PrepareWindowClose(event) {
    CustomLog("info", "The window will be closed.");

    if (!can_close_window_safely && !export_mode) {
        event.returnValue = false;

        
        MessageDialog("confirm","Are you sure you want to quit? All unsaved changes will be lost!", function(success) {
            if (success) {
                can_close_window_safely = true;
                window.close();
            }
        });
    } else {
        CloseAudio();
    }
}




async function SaveAudio(path) {
    await CloseAudio();

    let filename = path.replace(/^.*[\\\/]/, '');
    let new_path = `${working_dir}/temp/current_save/assets/audio/`;

    //is an audio file already imported ?
    let path_exists = await ipcRenderer.invoke("path-exists", new_path);
    let audio_exists;
    if (path_exists) {
        let audio_dir_content = await ipcRenderer.invoke("read-dir", new_path);
        audio_exists = (audio_dir_content.length !== 0);
    } else {
        audio_exists = false;
    }

    //cache audio in current save.
    if (audio_exists) await ipcRenderer.invoke("empty-dir", new_path);
        else await ipcRenderer.invoke("make-dir", new_path)
    await ipcRenderer.invoke("copy-file", path, `${new_path}${filename}`);

    //keep new audio name in memory;
    current_save.audio_filename = filename;

    //load audio
    let audio_path = await ipcRenderer.invoke("get-full-path", `${new_path}${filename}`);
    LoadAudio(audio_path, 'url');
}




function LoadAudio(file_data, type) {//load an audio file into the app. type: "file" || "url"
    if (imports.utils.IsUndefined(file_data)) throw "LoadAudio: No file data provided, couldn't load the audio file.";
    if ( (type!=="file") && (type!=="url") ) throw `LoadAudio: ${type} is not a valid audio file type!`;

    CustomLog("info","loading audio...");

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
    //disable the Web Audio API visualization smoothing, as each visualizer
    //implements it's own smoothing system.
    analyser.smoothingTimeConstant = 0;

    //audio source
    audio.src = (type==="url")? file_data : window.URL.createObjectURL(file_data); //"url" -> file_data is an url || "file" -> generate url from file
    source = context.createMediaElementSource(audio);




    //setup
    source.connect(analyser);
    analyser.connect(context.destination);
    if (!export_mode) SetupAudioUI(); //no need for UI in export mode.


    //prepare data collection
    ctx_frequency_array = new Uint8Array(analyser.frequencyBinCount);//0 to 1023 => length=1024.

    CustomLog("info","audio loaded successfully.");
}

function CloseAudio() {
    CustomLog("info","Closing audio context if any...");
    if (!imports.utils.IsUndefined(context)) context.close();
    if (!export_mode) document.getElementById("opened_audio").innerHTML = current_save.audio_filename;
    CustomLog("info","Audio context closed.");
}


















/*
#########
ANIMATION
#########
*/


function StartAnimating(fps) {//prepare fps animation
    // initialize the timer variables and start the animation
    if (!imports.utils.IsANumber(fps)) throw `StartAnimating: ${fps} is not a valid fps value, start aborted.`;

    stop_animating = false;
    animating = true;
    fps_interval = 1000 / fps; //in ms
    time = {};//object
    time.then = performance.now();
    time.start = time.then;

    Animate();
    CustomLog('info','animation started.');
}


function StopAnimating() {//stop the fps animation loop
    stop_animating = true;
    animating = false;
    CustomLog('info','animation stopped.');
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


    
    if (export_mode) {
        //time update
        current_time = frames_rendered/fps;
        audio_duration = duration;
    } else {
        //collect frequency data
        analyser.getByteFrequencyData(ctx_frequency_array);
        frequency_array = imports.utils.LinearToLog(ctx_frequency_array);  

        //time update
        current_time = audio.currentTime;
        audio_duration = audio.duration;
    }

    

    //smoothing
    vol_frequency_array = frequency_array;
    if (imports.utils.IsUndefined(vol_prev_frequency_array)) vol_prev_frequency_array = vol_frequency_array;

    //This is very similar to the smoothing system used by the Web Audio API.
    //The formula is the following (|x|: absolute value of x):
    //new[i] = factor * previous[i] + (1-factor) * |current[i]|

    //factor = 0 disables the smoothing. factor = 1 freezes everything and keep previous[i] forever.
    //factor not belonging to [0,1] creates uncontrolled behaviour.
    var smooth_factor = 0.7;
    for (let i=0; i<vol_frequency_array.length; i++) {
        vol_frequency_array[i] = smooth_factor * vol_prev_frequency_array[i] + (1-smooth_factor) * Math.abs(vol_frequency_array[i]);
    }
    vol_prev_frequency_array = vol_frequency_array; // for next iteration

    //volume update
    volume = 0;
    var sum = 0;
    for (var i=0; i<vol_frequency_array.length-100; i++) {
        sum += vol_frequency_array[i];
    }
    volume = sum/(vol_frequency_array.length-100); //0 to 120 most of the time

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
    document.getElementById("fps").innerHTML = `${average_fps}FPS`;
}






















//#######
//LOGGING
//#######

function CustomLog(type, log) {
    switch (type) {
        case 'trace':
            console.log('[TRACE] ',log);
            break;
        case 'debug':
            console.debug(log);
            break;
        case 'info':
            console.info(log);
            break;
        case 'log':
            console.log(log);
            break;
        case 'warn':
            console.warn(log);
            break;
        case 'error':
            console.error(log);
            break;
        case 'fatal':
            console.error('[FATAL] ',log);
            break;
    }
    ipcRenderer.invoke('log', type, log);
}

//catch all window error (throws...)
window.onerror = function GlobalErrorHandler(error_msg, url, line_number) {
    CustomLog("error",`${error_msg}\nsource: ${url}\n line: ${line_number}`);
    return false;
}