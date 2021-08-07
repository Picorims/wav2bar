//MIT License - Copyright (c) 2020-2021 Picorims

const {ipcRenderer} = require("electron");

const software_version = '0.3.0'; //current build version
const software_status = 'Indev';
let working_dir; //working directory for user, temp, logs...
let root_dir; //root of the app (where main.js is located, and html/css folders)
let os; //operating system
let argv;

var can_close_window_safely = false;//set to true when the user confirmed exit

//MAIN PROCESS, PAGE INITIALIZATION

//stores es module imports (loaded through promises as this is not a module and thus, "import" can't be used)
let imports = {
    utils: null,
    ui_components: null,
    system: null,
    save: null,
    visual_objects: null,
};

var stop_animating, animating, frame_count, fps_interval, time; //fps related variables
var fps_array, fps_array_max_length; //fps display

var audio_file, audio_file_type , current_time, audio_duration; //audio file related
var audio, source, context, analyzer, ctx_frequency_array; //Web Audio API related
var frequency_array; //spectrum array
var vol_prev_frequency_array, vol_frequency_array; //for volume smoothing
var audio_position_string;// ??:?? | ??:??

let save_handler = null;
//var objects = [];//all objects inside the screen
var objects_callback = [];
var volume;//audio average volume








/*
###############
SAVE MANAGEMENT
###############
*/

//handles everything related to save: import, export, data access.
class SaveHandler {
    constructor() {
        Object.assign(SaveHandler.prototype, imports.utils.EventMixin);
        this.setupEventMixin([
            "test",
        ]);    

        this._CURRENT_SAVE_VERSION = 4;

        this._save_data = {};
        this._lock_save_sync = false;
        this._objects = {};

        this.loadDefaultSave();
        imports.utils.CustomLog("debug",'syncing save object every 500ms, starting from now.');
    }

    get save_data() {
        return this._save_data;
    }
    set save_data(save_data) {
        this._save_data = save_data;
    }

    set screen(screen) {
        if (imports.utils.IsUndefined(screen.width) || imports.utils.IsUndefined(screen.height)) throw new SyntaxError("screen must be like {width: value, height: value}.");
        this._save_data.screen = screen;
    }

    set fps(fps) {
        if (!imports.utils.IsAnInt(fps)) throw new SyntaxError("fps must be an integer.");
        this._save_data.fps = fps;
    }

    rewriteSoftwareInfo() {
        this._save_data.software_version_used = `${software_version} ${software_status}`;
    }

    //set the save data to default values
    loadDefaultSave() {
        this._save_data = {
            //1 -> Wav2Bar 0.1.0 indev before save revamp (image embedding, music embedding)
            //2 -> Wav2Bar 0.1.0 Beta to 0.1.2 Beta
            //3 -> Wav2Bar 0.2.0 Beta to 0.2.2 Beta
            //4 -> Wav2Bar 0.3.0 Indev and after
            save_version: this._CURRENT_SAVE_VERSION,
            software_version_used: `${software_version} ${software_status}`,
            screen: {width: 1280, height: 720},
            fps: 60,
            audio_filename: "",
            objects: {},
        }
        imports.utils.CustomLog('info','loaded default save.');
    }

    async loadSave(save_file_path) {//load a user save or a preset (JSON format)
        if (!imports.utils.IsAString(save_file_path)) throw "LoadSave: No valid path provided!";
    
        imports.utils.CustomLog("info", "Backing up currently opened save...");
        this.exportSave(`${working_dir}/temp/before_new_save_open.w2bzip`, true);
        await CloseAudio();
    
        imports.utils.CustomLog("info","Loading the save...");
        this._lock_save_sync = true;
    
        //ERASE CURRENT DATA
    
        //because objects are removed from the array trough splice() during the for loop,
        //indexes are constantly changed and the loop ends up not going trough all indexes.
        //So the array and it's length are separately saved, and this list is kept intact
        //to iterate trough every object.
        var objects_list = objects.slice();
    
        for (var i=0; i<objects_list.length; i++) {
            var object = objects_list[i];
    
            object.remove(object.data.id);
        }
    
    
    
    
        //LOAD NEW DATA
        //the data must be extracted from the file in order to be able to read it.
        ipcRenderer.once("finished-caching-save", async (event) => {
            //read data cached in ./temp/current_save
            imports.utils.CustomLog("info","reading the save...");
    
            const JSON_data = await ipcRenderer.invoke("read-json-file",`${working_dir}/temp/current_save/data.json`);
            this._save_data = JSON.parse(JSON.stringify(JSON_data)); //copy data
    
            //check version
            if (this._save_data.save_version > this._CURRENT_SAVE_VERSION) {
                //newer version
    
                imports.utils.CustomLog("error",`The save can't be opened because its version (${this._save_data.save_version}) is greater than the supported version (${this._CURRENT_SAVE_VERSION})`);
                MessageDialog("error", `This project has been created in a newer version of Wav2Bar (${this._save_data.software_version_used}). To be able to open this project, please upgrade your installed version.`);
                this._lock_save_sync = false;
            } else if (this._save_data.save_version < this._CURRENT_SAVE_VERSION) {
                //older version
    
                imports.utils.CustomLog("warning",`The supported save version is ${this._CURRENT_SAVE_VERSION} but the provided save is of version ${this._save_data.save_version}`);
                MessageDialog("confirm",`This project has been created in an older version of Wav2Bar (${this._save_data.software_version_used}). Do you want to upgrade it ? (Always backup your project before converting it!)`,
                    (confirmed) => {
                        if (confirmed) {
                            this.convertSave();
                            this.applyLoadedSave();
                        } else {
                            imports.utils.CustomLog("info", "Save load aborted, loading back the project in it's old state.");
                            this.loadSave(`${working_dir}/temp/before_new_save_open.w2bzip`);
                        }
                        this._lock_save_sync = false;
                    });
            } else {
                //same version
                this.applyLoadedSave();
                this._lock_save_sync = false;
            }
            if (!export_mode) document.getElementById("opened_save").innerHTML = save_file_path;
        });
        await ipcRenderer.invoke("cache-save-file", save_file_path);
    }





    //upgrade an older save file to the current version.
    //versions are documented in [root]/docs/save.md.
    convertSave(log_array = []) {
        //something's wrong ?
        imports.utils.CustomLog("debug", JSON.stringify(this._save_data));
        if (this._save_data.save_version > this._CURRENT_SAVE_VERSION) throw `Can't convert the save: the save version (${this._save_data.save_version}) is greater than the supported version (${this._CURRENT_SAVE_VERSION})!`;

        //Does it still needs to be converted ?
        else if (this._save_data.save_version < this._CURRENT_SAVE_VERSION) {
            imports.utils.CustomLog("info",`Converting the save from version ${this._save_data.save_version} to ${this._save_data.save_version + 1}. The goal is ${this._CURRENT_SAVE_VERSION}.`);

            switch (this._save_data.save_version) {
                case 1:
                    //convert objects
                    for (obj of this._save_data.objects) {
                        if (obj.object_type === "background" || obj.object_type === "image") {
                            //cache legacy data
                            let legacy_bgnd = obj.background;
                            let legacy_size = obj.size;

                            //delete useless keys
                            delete obj.size;

                            //CONVERT DATA
                            obj.background = {};
                            obj.background.size = legacy_size;

                            //process legacy_bgnd
                            //NOTE: images, repeat scheme, and other color schemes are lost in the process.
                            //NOTE: validity of the data isn't verified (number ranges, syntax...).

                            // hex or rgb or rgba
                            let color_regexp = new RegExp(/^#[0-9a-fA-F]{3,8}$|^rgb\(\d{1,3},\d{1,3},\d{1,3}\)$|^rgba\(\d{1,3},\d{1,3},\d{1,3},[01]\.?\d*\)$/);
                            //recognize css gradient functions.
                            let gradient_regexp = new RegExp(/gradient\(/);
                            //remove misleading spaces
                            legacy_bgnd = legacy_bgnd.split(" ").join("");
                            if (color_regexp.test(legacy_bgnd)) {
                                obj.background.type = "color";
                                obj.background.last_color = legacy_bgnd;
                                obj.background.last_gradient = "";
                            } else if (gradient_regexp.test(legacy_bgnd)) {
                                obj.background.type = "gradient";
                                obj.background.last_color = "";
                                obj.background.last_gradient = legacy_bgnd;
                            } else {
                                obj.background.type = "color";
                                obj.background.last_color = "#fff";
                                obj.background.last_gradient = "";
                                log_array.push(`[1 -> 2] Couldn't convert background for ${obj.name}, assigned a default value.`);
                            }

                            //other missing nodes
                            obj.background.last_image = "";
                            obj.background.repeat = "no-repeat";
                        }
                    }

                    //create audio node
                    this._save_data.audio_filename = "";
                break;



                case 2:
                    //nothing to do, "svg_filters" property is automatically created by objects.
                break;



                default:
                    imports.utils.CustomLog("error",`A save of version ${this._save_data.save_version} can't be converted!`);
            }
            this._save_data.save_version++;
            imports.utils.CustomLog("info", `Save converted to version ${this._save_data.save_version}!`);
            this.convertSave(log_array);
        } else {
            //finished conversion.
            imports.utils.CustomLog("info", `Conversion done!`);

            //conversion logs
            if (log_array.length > 0) {
                let log_string = "Conversion details:\n";
                for (msg of log_array) {
                    log_string += "- " + msg + '\n';
                }
                imports.utils.CustomLog("info", log_string);
                MessageDialog("info", log_string.split("\n").join("<br>"));
            }
        }
    }






    applyLoadedSave() {//read and apply a loaded user save
        imports.utils.CustomLog('info','applying save...');
        //CREATE OBJECTS

        //because objects are created in current_data.objects during the for loop,
        //objects are constantly added in it, and using it as a reference for length make
        //the loop to never end.
        //So the array and it's length are separately saved.
        var objects_data_list = this._save_data.objects.slice();


        //create all objects
        for (var i=0; i<objects_data_list.length; i++) {

            //get data
            var object_data = objects_data_list[i];

            //avoid overflow
            if (i>255) {
                throw `LoadSave: Maximum object count reached (${i-1})`;
            }

            //create relevant object
            var type = object_data.object_type;
            if (type === "background")          {new Background(object_data)}
            else if (type === "image")          {new Image(object_data)}
            else if (type === "particle_flow")  {new ParticleFlow(object_data)}
            else if (type === "text")           {new Text(object_data)}
            else if (type === "timer")          {new Timer(object_data)}
            else if (type === "visualizer")     {new Visualizer(object_data)}
            else {throw `LoadSave: ${type} is not a valid object type. Is the save corrupted ?`}

            imports.utils.CustomLog("info",`Added ${type}.`);

        }



        //apply FPS
        ChangeFPSTo(this._save_data.fps);

        //apply screen size
        SetScreenTo(this._save_data.screen.width, this._save_data.screen.height);

        //apply audio
        if (this._save_data.audio_filename !== "") {
            ipcRenderer.invoke("get-full-path", `${working_dir}/temp/current_save/assets/audio/${this._save_data.audio_filename}`).then((result => {
                LoadAudio(result, "url");
                if (!export_mode) document.getElementById("opened_audio").innerHTML = this._save_data.audio_filename;
            }));
        }

        this.rewriteSoftwareInfo();

        imports.utils.CustomLog("info","Save loaded!");

    }













    //legacy save export
    exportSaveAsJSON() {//export the current save to JSON format.

        imports.utils.CustomLog("info","generating download file for the save...");

        //prepare data for export
        var exported_save = JSON.stringify(this._save_data);
        var data_string = "data:text/json; charset=utf-8," + encodeURIComponent(exported_save);

        //create downloader element
        var downloader = document.createElement('a');
        downloader.href = data_string;
        downloader.download = "save.json";
        document.body.appendChild(downloader); // required for firefox

        //trigger download
        downloader.click();

        //remove downloader element
        downloader.remove();

        imports.utils.CustomLog("info","save file provided for download.");
    }



    //save project to file
    /**
     * structure:
     * project_name.w2bzip (renamed .zip file)
     * |- data.json
     * |- assets
     * |    |- (audio, images, etc...)
     * |    /
     * /
     */
    exportSave(save_path, no_dialog = false) {
        if (!imports.utils.IsAString(save_path)) throw `ExportSave: ${save_path} is an invalid save path (not a string).`;
        if (!imports.utils.IsABoolean(no_dialog)) throw `ExportSave: ${no_dialog} must be a boolean for no_dialog value!`;

        imports.utils.CustomLog("info","generating save file...");

        //update JSON data in temp save
        let save_data = JSON.stringify(this._save_data);
        ipcRenderer.invoke("write-json-file", `${working_dir}/temp/current_save/data.json`, save_data);

        //package file
        ipcRenderer.invoke("create-save-file", save_path);

        if (!no_dialog) MessageDialog("info","The save has been created!");
        imports.utils.CustomLog("info","save file generated!");
    }





    //add a visual object to the existing list of visual object
    //(class instances, objects register themselves in the save.)
    addVisualObject(object) {
        if (object.id === "") {
            object.generateID(); //generate id
            this._save_data.objects[object.id] = {};//register in save data
        
        } else if (!object.getThisData()) {
            throw new SyntaxError(`providing an ID for a VisualObject implies that it is registered in the save, but it is not! ("${id}"). If you want to create an object, leave this empty.`);
        } else if (this._save_data.objects[object.id]) {
            throw new Error("There is already an object inspecting " + object.id);
        }
        this._objects[object.id] = object; //keep a reference.
    }

    //remove a visual object from the save based on its id.
    deleteVisualObject(id) {
        this._objects[id].destroy();
        delete this._objects[id];
        delete this._save_data.objects[id];
    }

    //get the object's data in a manipulable way.
    getVisualObjectData(id) {
        return this._save_data.objects[id];
    }

    //overwrite existing data of an object with new data,
    //for all mentioned properties.
    mergeVisualObjectData(id, data) {
        this._save_data.objects[id] = imports.utils.mergeData(data, this._save_data.objects[id]);
    }

    getVisualObjectIDs() {
        let ids = [];
        for (let key in this._save_data.objects) ids.push(key);
        return ids;
    }
}







/*
#####################
GLOBAL INITIALIZATION
#####################
*/

window.onload = function() {LoadModules();};
window.onbeforeunload = function(event) {PrepareWindowClose(event);};

//load ES modules required
function LoadModules() {
    import("./system/system.js").then(module => {
        imports.system = module;
        working_dir = module.working_dir;
        root_dir = module.root_dir;
        os = module.os;
        argv = module.argv;
        return import("./utils/utils.js");
    }).then(module => {
        imports.utils = module;
        return import("./visual_objects/visual_objects.js");
    }).then(module => {
        imports.visual_objects = module;
        imports.utils.CustomLog("debug","Loading modules done.");
        //PreSetup();
        InitPage();
    })/*.catch(error => {
        console.log("could not load modules: " + error);
    });*/
}

function InitPage() {//page initialization

    //PREPARE SAVE
    save_handler = new SaveHandler();


    //FPS PREPARATION
    stop_animating = false;
    frame_count = 0;
    fps_array = [];
    animating = false;
    if (!export_mode) setInterval(UpdateFPSDisplay, 1000);



    //UI INITIALIZATION
    if (!export_mode) InitUI();

    //CLI
    console.log(argv);

    //load save passed through CLI if any.
    if (argv._[0] === "load") LoadSave(argv.savefile);
    if (argv._[0] === "export") LoadSave(argv.input);

    //enable experimental jpeg from CLI
    if (argv._[0] === "export" && argv.jpeg) document.getElementById("experimental_export_input").checked = argv.jpeg;

    //launch export if any
    if (argv._[0] === "export") setTimeout(() => {
        Export(argv.output);
    }, 5000);
}




function PrepareWindowClose(event) {
    imports.utils.CustomLog("info", "The window will be closed.");

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









//#######
//LOGGING
//#######

//catch all window error (throws...)
window.onerror = function GlobalErrorHandler(error_msg, url, line_number) {
    imports.utils.CustomLog("error",`${error_msg}\nsource: ${url}\n line: ${line_number}`);
    return false;
}






/*
#####
AUDIO
#####
*/



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
    save_handler.save_data.audio_filename = filename;

    //load audio
    let audio_path = await ipcRenderer.invoke("get-full-path", `${new_path}${filename}`);
    LoadAudio(audio_path, 'url');
}




function LoadAudio(file_data, type) {//load an audio file into the app. type: "file" || "url"
    if (imports.utils.IsUndefined(file_data)) throw "LoadAudio: No file data provided, couldn't load the audio file.";
    if ( (type!=="file") && (type!=="url") ) throw `LoadAudio: ${type} is not a valid audio file type!`;

    imports.utils.CustomLog("info","loading audio...");

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

    imports.utils.CustomLog("info","audio loaded successfully.");
}

function CloseAudio() {
    imports.utils.CustomLog("info","Closing audio context if any...");
    if (!imports.utils.IsUndefined(context)) context.close();
    if (!export_mode) document.getElementById("opened_audio").innerHTML = save_handler.save_data.audio_filename;
    imports.utils.CustomLog("info","Audio context closed.");
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
    imports.utils.CustomLog('info','animation started.');
}


function StopAnimating() {//stop the fps animation loop
    stop_animating = true;
    animating = false;
    imports.utils.CustomLog('info','animation stopped.');
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
        current_time = frames_rendered/save_handler.save_data.fps;
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
