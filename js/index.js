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

/**@type {Project} */
let project = null;








/*
###############
SAVE MANAGEMENT
###############
*/

//handles everything related to save: import, export, data access.
class SaveHandler {
    constructor() {
        Object.assign(SaveHandler.prototype, imports.utils.EventMixin);
        // this.setupEventMixin([
        //     "test",
        // ]);

        /** @type {Project} */
        this._owner_project = null;

        this._CURRENT_SAVE_VERSION = 4;

        this._save_data = {};
        this._lock_save_sync = false;
        this._objects = {};

        this.loadDefaultSave();
        imports.utils.CustomLog("debug",'syncing save object every 500ms, starting from now.');
    }

    set owner_project(owner_project) {this._owner_project = owner_project;}
    get owner_project() {return this._owner_project;}

    get save_data() {
        return this._save_data;
    }
    set save_data(save_data) {
        this._save_data = save_data;
    }

    get objects() {return this._objects;}

    set screen(screen) {
        if (imports.utils.IsUndefined(screen.width) || imports.utils.IsUndefined(screen.height)) throw new SyntaxError("screen must be like {width: value, height: value}.");
        this._save_data.screen = screen;
    }

    get fps() {return this._save_data.fps;}
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
            software_version_first_created: `${software_version} ${software_status}`, //to never change!
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
        await this._owner_project.closeAudio();

        //necessary because once new data is injected in the SaveHandler,
        //old IDs are lost. Thus their VisualObject would still be around if we don't
        //remove them here.
        this.deleteAllVisualObjects();
    
        imports.utils.CustomLog("info","Loading the save...");
        this._lock_save_sync = true;
    
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
        let i=0;
        for (const id in this._save_data.objects) {
            if (Object.hasOwnProperty.call(this._save_data.objects, id)) {
                const object_data = this._save_data.objects[id];
                
                //avoid overflow
                if (i>255) {
                    throw `LoadSave: Maximum object count reached (${i-1})`;
                }

                //create relevant object
                let type = object_data.visual_object_type;
                this.createVisualObject(type, null, id);
                imports.utils.CustomLog("info",`Added ${type}.`);

                i++;
            }
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

        //update version in which the save was used and edited.
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




    //create a VisualObject for new or existing data.
    //usage: data load, new object creation from UI
    //empty ID generates a random new ID.
    createVisualObject(type, name = null, obj_id = "") {
        let obj;
        switch (type) {
            case "image":                       obj = new imports.visual_objects.VShape(this, tab.objects, obj_id); break;
            case "particle_flow":               obj = new imports.visual_objects.VParticleFlow(this, tab.objects, obj_id); break;
            case "text":                        obj = new imports.visual_objects.VText(this, tab.objects, obj_id); break;
            case "timer_straight_bar":          obj = new imports.visual_objects.VTimerStraightBar(this, tab.objects, obj_id); break;
            case "timer_straight_line_point":   obj = new imports.visual_objects.VTimerStraightLinePoint(this, tab.objects, obj_id); break;
            case "visualizer_straight_bar":     obj = new imports.visual_objects.VVisualizerStraightBar(this, tab.objects, obj_id); break;
            case "visualizer_circular_bar":     obj = new imports.visual_objects.VVisualizerCircularBar(this, tab.objects, obj_id); break;
            case "visualizer_straight_wave":    obj = new imports.visual_objects.VVisualizerStraightWave(this, tab.objects, obj_id); break;
            default: throw new SyntaxError(`LoadSave: ${type} is not a valid object type. Is the save corrupted ?`);
        }
        if (name) obj.setName(name);
    }

    //add a visual object to the existing list of visual object
    //(object = VisualObject instance,
    //VisualObjects register themselves in the save with this function.)
    addVisualObject(object) {
        if (object.id === "") {
            object.generateID(); //generate id
            this._save_data.objects[object.id] = {};//register in save data
        
        } else if (!object.getThisData()) {
            throw new SyntaxError(`providing an ID for a VisualObject implies that it is registered in the save, but it is not! ("${id}"). If you want to create an object, leave this empty.`);
        } else if (this._objects[object.id]) {
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

    //remove all visual objects saved
    deleteAllVisualObjects() {
        let ids = this.getVisualObjectIDs();
        for (let i=0; i<ids.length; i++) {
            this.deleteVisualObject(ids[i]);
        }
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

    //get an array of all objects IDs
    getVisualObjectIDs() {
        let ids = [];
        for (let key in this._save_data.objects) ids.push(key);
        return ids;
    }

    //copy an image from the given path and save it in the current save, then returns
    //the file name and the new path of the saved image.
    async saveObjectBackgroundImage(path, obj_id) {
        //copying file
        let filename = path.replace(/^.*[\\\/]/, '');
        let new_path = `${working_dir}/temp/current_save/assets/${obj_id}/background/`;
        
        //is an image file already imported ?
        let path_exists = await ipcRenderer.invoke("path-exists", new_path);
        let image_exists;
        if (path_exists) {
            let image_dir_content = await ipcRenderer.invoke("read-dir", new_path);
            image_exists = (image_dir_content.length !== 0);
        } else {
            image_exists = false;
        }

        //cache image in current save
        if (image_exists) await ipcRenderer.invoke("empty-dir", new_path);
            else await ipcRenderer.invoke("make-dir", new_path)
        await ipcRenderer.invoke("copy-file", path, `${new_path}${filename}`);
        
        return {
            filename: filename,
            new_path: new_path,
        }
    }






    /*
    #####
    AUDIO
    #####
    */



    async saveAudio(path) {
        await this._owner_project.closeAudio();

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
        this._save_data.audio_filename = filename;

        //load audio
        let audio_path = await ipcRenderer.invoke("get-full-path", `${new_path}${filename}`);
        this._owner_project.loadAudio(audio_path, 'url');
    }


}






/*
##################
PROJECT MANAGEMENT
##################
*/

class Project {
    constructor() {
        /**@type {SaveHandler} */
        this._save_handler = null;
        /**@type {UserInterface} */
        this._user_interface = null;

        this._working_dir = working_dir;
        this._root_dir = root_dir;
        this._os = os;
        this._export_mode = export_mode;

        //ANIMATION PREPARATION
        this._stop_animating = false;
        this._animating = false;

        this._frame_count = 0;
        this._fps_array = [];
        this._fps_interval = null;
        this._FPS_ARRAY_MAX_LENGTH = 10;

        //render loop
        this._time = {
            start: null,
            now: null,
            then: null,
            elapsed: null,
        }

        //frame info
        this._current_time = null;
        this._audio_duration = null;
        this._frequency_array = null;
        this._vol_frequency_array = null;
        this._vol_prev_frequency_array = null;
        this._volume = 0; /*audio average volume, get info, not set*/
    
        this._objects_callback = [];

        //audio
        this._audio = undefined;
        this._audio_file_type = null;
        this._audio_file = null;
        this._source = null;
        this._context = null;
        this._analyser = null;
        this._ctx_frequency_array = null;
    }

    get save_handler() {return this._save_handler}
    set save_handler(save_handler) {
        this._save_handler = save_handler;
        this._save_handler.owner_project = this;
    }

    get user_interface() {return this._user_interface;}
    set user_interface(user_interface) {this._user_interface = user_interface;}

    get working_dir() {return this._working_dir;}
    get root_dir() {return this._root_dir;}
    get export_mode() {return this._export_mode;}
    get os() {return this._os;}

    get volume() {return this._volume;}

    get screen() {return this._user_interface.screen;}

    /*
    #########
    ANIMATION
    #########
    */

    //start screen visuals by starting audio and animation
    playVisuals() {
        if (!this._animating) this.startAnimating(this._save_handler.fps);
        this._audio.play();
    }

    //pause audio and animation
    pauseVisuals() {
        if (this._animating) this.stopAnimating();
        this._audio.pause();
    }

    //stop animation and reset audio position
    stopVisuals() {
        this.pauseVisuals();
        this._audio.currentTime = 0;
    }

    //prepare fps animation
    startAnimating(fps) {
        // initialize the timer variables and start the animation
        if (!imports.utils.IsANumber(fps)) throw `StartAnimating: ${fps} is not a valid fps value, start aborted.`;

        this._stop_animating = false;
        this._animating = true;
        this._fps_interval = 1000 / fps; //in ms
        this._time.then = performance.now();
        this._time.start = this._time.then;

        this.animate();
        imports.utils.CustomLog('info','animation started.');
    }

    //stop the fps animation loop
    stopAnimating() {
        this._stop_animating = true;
        this._animating = false;
        imports.utils.CustomLog('info','animation stopped.');
    }

    // the animation loop calculates time elapsed since the last loop
    // and only draws if the specified fps interval is achieved
    animate() {

        //stop animating if requested
        if (this._stop_animating) return;

        // request another frame
        requestAnimationFrame(() => {this.animate();});

        // calc elapsed time since last loop
        this._time.now = performance.now();
        this._time.elapsed = this._time.now - this._time.then;

        // if enough time has elapsed and all objects finished rendering, draw the next frame
        if ( (this._time.elapsed > this._fps_interval) && (this.updateFinished()) ) {

            //add this frame duration to the frame array
            this._fps_array.push(parseInt(1000 / (this._time.now - this._time.then)));

            // Get ready for next frame by setting then=now, but also adjust for your
            // specified fps_interval not being a multiple of user screen RAF's interval
            //(16.7ms for 60fps for example).
            this._time.then = this._time.now - (this._time.elapsed % this._fps_interval);

            //Draw the frame
            this.drawFrame();
        }
    }


    //returns if all the objects have finished updating.
    updateFinished() {
        let finished_render = true;
        //if one object didn't finish rendering, returns false
        for (let i = 0; i < this._objects_callback.length; i++) {
            if (!this._objects_callback[i]) finished_render = false;
        }

        return finished_render;
    }



    //update and draw the screen
    drawFrame() {


        //#################
        //AUDIO CALCULATION
        //#################


        
        if (export_mode) {
            //time update
            this._current_time = frames_rendered/project.save_handler.save_data.fps;
            this._audio_duration = duration;
        } else {
            //collect frequency data
            this._analyser.getByteFrequencyData(this._ctx_frequency_array);
            this._frequency_array = imports.utils.LinearToLog(this._ctx_frequency_array);  

            //time update
            this._current_time = this._audio.currentTime;
            this._audio_duration = this._audio.duration;
        }

        

        //smoothing
        this._vol_frequency_array = this._frequency_array;
        if (imports.utils.IsUndefined(this._vol_prev_frequency_array)) this._vol_prev_frequency_array = this._vol_frequency_array;

        //This is very similar to the smoothing system used by the Web Audio API.
        //The formula is the following (|x|: absolute value of x):
        //new[i] = factor * previous[i] + (1-factor) * |current[i]|

        //factor = 0 disables the smoothing. factor = 1 freezes everything and keep previous[i] forever.
        //factor not belonging to [0,1] creates uncontrolled behaviour.
        let smooth_factor = 0.7;
        for (let i = 0; i < this._vol_frequency_array.length; i++) {
            this._vol_frequency_array[i] = smooth_factor * this._vol_prev_frequency_array[i] + (1-smooth_factor) * Math.abs(this._vol_frequency_array[i]);
        }
        this._vol_prev_frequency_array = this._vol_frequency_array; // for next iteration

        //volume update
        this._volume = 0;
        let sum = 0;
        for (let i = 0; i < this._vol_frequency_array.length - 100; i++) {
            sum += this._vol_frequency_array[i];
        }
        this._volume = sum / (this._vol_frequency_array.length - 100); //0 to 120 most of the time

        //update all objects
        this._objects_callback = [];
        for (const obj in this._save_handler.objects) {
            if (Object.hasOwnProperty.call(this._save_handler.objects, obj)) {
                const element = this._save_handler.objects[obj];
                this._objects_callback[i] = false;//reset all callbacks to false
                this._objects_callback[i] = element.update();//set to true once update is finished    
            }
        }


        //end of a frame
    }



    /*
    #####
    AUDIO
    #####
    */


    loadAudio(file_data, type) {//load an audio file into the app. type: "file" || "url"
        if (imports.utils.IsUndefined(file_data)) throw "LoadAudio: No file data provided, couldn't load the audio file.";
        if ( (type!=="file") && (type!=="url") ) throw `LoadAudio: ${type} is not a valid audio file type!`;
    
        imports.utils.CustomLog("info","loading audio...");
    
        //stop current audio
        if (typeof this._audio !== "undefined") {
            this._audio.pause();
            this._audio.currentTime = 0;
        }
    
    
        //store audio
        //clone the audio file so it can still be used even if the file is moved or renamed. Otherwise it
        //would fail.
        if (type==="file") {
            console.log(file_data.type);
    
            let cloned_file = new File([file_data], {type: file_data.type});
            this._audio_file_type = file_data.type;
    
            file_data = cloned_file;
            this._audio_file = cloned_file;
        }
    
    
        //LOAD
    
        //modules
        this._audio = new Audio();
        this._audio.loop = false;
        this._context = new window.AudioContext();
        this._analyser = this._context.createAnalyser();
        //disable the Web Audio API visualization smoothing, as each visualizer
        //implements it's own smoothing system.
        this._analyser.smoothingTimeConstant = 0;
    
        //audio source
        this._audio.src = (type==="url")? file_data : window.URL.createObjectURL(file_data); //"url" -> file_data is an url || "file" -> generate url from file
        this._source = this._context.createMediaElementSource(this._audio);
    
    
    
    
        //setup
        this._source.connect(this._analyser);
        this._analyser.connect(this._context.destination);
        if (!export_mode) SetupAudioUI(); //no need for UI in export mode.
    
    
        //prepare data collection
        this._ctx_frequency_array = new Uint8Array(this._analyser.frequencyBinCount);//0 to 1023 => length=1024.
    
        imports.utils.CustomLog("info","audio loaded successfully.");
    }
    
    closeAudio() {
        imports.utils.CustomLog("info","Closing audio context if any...");
        if (!imports.utils.IsUndefined(this._context)) this._context.close();
        if (!export_mode) document.getElementById("opened_audio").innerHTML = project.save_handler.save_data.audio_filename;
        imports.utils.CustomLog("info","Audio context closed.");
    }

    //returns if the audio is in state 4, so it can be manipulated.
    audioReady() {
        return this._audio.readyState === 4;
    }

    //get the duration of audio object
    getAudioDuration() {
        return this._audio.duration;
    }

    //set audio playing time to start.
    audioToStart() {
        this._audio.currentTime = 0;
    }
    
    //set audio playing time to end.
    audioToEnd() {
        this._audio.currentTime = this._audio.duration;
    }

    //sets audio object current time in seconds
    setAudioCurrentTime(currentTime) {
        this._audio.currentTime = currentTime;
    }

    //gets audio object current time in seconds
    getAudioCurrentTime() {return this._audio.currentTime;}

    //toggle if the audio should be played forever in loop mode.
    audioLoopToggle() {
        this._audio.loop = (this._audio.loop) ?  false : true;
    }

    //returns if the audio object is in loop mode.
    getAudioIsLooping() {
        return this._audio.loop;
    }

    getFrequencyArray() {
        return this._frequency_array;
    }




    //###
    //FPS
    //###

    updateFPSDisplay() {//display FPS regularly
        //maintain the max length of the array
        if (this._fps_array.length > this._FPS_ARRAY_MAX_LENGTH) {

            var overflow = this._fps_array.length - this._FPS_ARRAY_MAX_LENGTH;
            this._fps_array.splice(0, overflow);
        }

        //calculates average FPS from the fps array
        var sum = 0;
        for (var index of this._fps_array) {
            sum += index;
        }
        var average_fps = sum / this._FPS_ARRAY_MAX_LENGTH;

        //display fps
        document.getElementById("fps").innerHTML = `${average_fps}FPS`;
    }

    //change the project fps, taking into account a potential ongoing animation process
    setFPS(fps) {
        this._save_handler.fps = fps;
        this.stopAnimating();
        if (this._audio && !this._audio.paused) this.startAnimating(fps);
    }
}






//bridge class to interact with global context user interface
class UserInterface {
    constructor(owner_project) {
        this._screen = document.getElementById("screen");
        this._owner_project = owner_project;
    }

    get screen() {return this._screen;}
    set owner_project(owner_project) {this._owner_project = owner_project}

    //bridge to interact with user_interface.js file browser dialog
    async FileBrowserDialog(settings, callback, args) {
        await FileBrowserDialog(settings, callback, args);
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
    }).catch(error => {
        console.log("could not load modules: " + error);
    });
}

function InitPage() {//page initialization

    //SETUP PROJECT AND PREPARE SAVE
    project = new Project();
    project.save_handler = new SaveHandler();
    project.user_interface = new UserInterface();


    //UI INITIALIZATION
    if (!export_mode) {
        InitUI();
        setInterval(project.updateFPSDisplay(), 1000);
    }

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
        project.closeAudio();
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






