//Wav2Bar - Free software for creating audio visualization (motion design) videos
//Copyright (C) 2023  Picorims <picorims.contact@gmail.com>

//This program is free software: you can redistribute it and/or modify
//it under the terms of the GNU General Public License as published by
//the Free Software Foundation, either version 3 of the License, or
//any later version.

//This program is distributed in the hope that it will be useful,
//but WITHOUT ANY WARRANTY; without even the implied warranty of
//MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//GNU General Public License for more details.

//You should have received a copy of the GNU General Public License
//along with this program.  If not, see <https://www.gnu.org/licenses/>.

/*globals MessageDialog, frames_rendered, duration, tab, FileBrowserDialog, ChangeFPSTo, SetScreenTo, SetupAudioUI, InitUI, ConfirmCreation, Export */

const {ipcRenderer} = require("electron");

/** @type {String} current build version*/
const software_version = "0.3.2-indev";
/** @type {String} current build type */
let working_dir; //working directory for user, temp, logs...
let root_dir; //root of the app (where main.js is located, and html/css folders)
let os; //operating system
let argv;

var can_close_window_safely = false;//set to true when the user confirmed exit

//MAIN PROCESS, PAGE INITIALIZATION

/** @type {Object} stores ES module imports (loaded through promises as this is not a module and thus, "import" can't be used)*/
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

/**
 * handles everything related to save: import, export, data access.
 *
 * @class SaveHandler
 */
class SaveHandler {
    /**
     * Creates an instance of SaveHandler.
     * @memberof SaveHandler
     */
    constructor() {
        Object.assign(SaveHandler.prototype, imports.utils.EventMixin);
        // this._setupEventMixin([
        //     "test",
        // ]);

        /** @type {Project} */
        this._owner_project = null;

        this._CURRENT_SAVE_VERSION = 4;

        this._save_data = {};
        this._lock_save_sync = false;
        this._objects = {};

        this.loadDefaultSave();
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

    /**
     * Updates the save version used field with the information of this build.
     *
     * @memberof SaveHandler
     */
    rewriteSoftwareInfo() {
        this._save_data.software_version_used = `${software_version}`;
    }

    /**
     * set the save data to default values
     *
     * @memberof SaveHandler
     */
    loadDefaultSave() {
        this._save_data = {
            //1 -> Wav2Bar 0.1.0 indev before save revamp (image embedding, music embedding)
            //2 -> Wav2Bar 0.1.0 Beta to 0.1.2 Beta
            //3 -> Wav2Bar 0.2.0 Beta to 0.2.2 Beta
            //4 -> Wav2Bar 0.3.0 Indev and after
            save_version: this._CURRENT_SAVE_VERSION,
            software_version_used: `${software_version}`,
            software_version_first_created: `${software_version}`, //to never change!
            screen: {width: 1280, height: 720},
            fps: 60,
            audio_filename: "",
            objects: {},
        };
        imports.utils.CustomLog("info","loaded default save.");
    }

    /**
     * load a user save or a preset (JSON format)
     *
     * @param {String} save_file_path
     * @param {Boolean} no_warnings If a dialog should be displayed when the save is outdated. If enabled, the save will be auto updated, and a warning will be logged.
     * @memberof SaveHandler
     */
    async loadSave(save_file_path, no_warnings = false) {
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
        ipcRenderer.once("finished-caching-save", async () => {
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
                if (no_warnings) {
                    imports.utils.CustomLog("warning", `This project has been created in an older version of Wav2Bar (${this._save_data.software_version_used}). Upgrading the temporary version...`);
                    this._owner_project.user_interface.loadingMode(true);
                    this.convertSave([], true);
                    this.applyLoadedSave();
                    this._owner_project.user_interface.loadingMode(false);
                } else {
                    MessageDialog("confirm",`This project has been created in an older version of Wav2Bar (${this._save_data.software_version_used}). Do you want to upgrade it ? (Always backup your project before converting it!)`,
                        (confirmed) => {
                            if (confirmed) {
                                this._owner_project.user_interface.loadingMode(true);
                                this.convertSave();
                                this.applyLoadedSave();
                                this._owner_project.user_interface.loadingMode(false);
                            } else {
                                imports.utils.CustomLog("info", "Save load aborted, loading back the project in it's old state.");
                                this.loadSave(`${working_dir}/temp/before_new_save_open.w2bzip`);
                            }
                            this._lock_save_sync = false;
                        }
                    );
                }
            } else {
                //same version
                this._owner_project.user_interface.loadingMode(true);
                this.applyLoadedSave();
                this._lock_save_sync = false;
                this._owner_project.user_interface.loadingMode(false);
            }
            // if (!this._owner_project.export_mode) document.getElementById("opened_save").innerHTML = save_file_path;
            if (!this._owner_project.export_mode) document.getElementById("load-save-picker").setProp("path", save_file_path);
        });
        await ipcRenderer.invoke("cache-save-file", save_file_path);
    }





    /**
     * Upgrades an older save file to the current version.
     * Versions are documented in [root]/docs/save.md.
     * @param {*} [log_array=[]] An array of strings that store log messages to display at the end, and to write to the logs file.
     * It is used for warnings and errors of conversion.
     * @param {Boolean} no_dialog If no dialog should be displayed concerning warnings. They are still logged to file.
     * @memberof SaveHandler
     */
    convertSave(log_array = [], no_dialog = false) {
        //something's wrong ?
        imports.utils.CustomLog("debug", JSON.stringify(this._save_data));
        if (this._save_data.save_version > this._CURRENT_SAVE_VERSION) throw `Can't convert the save: the save version (${this._save_data.save_version}) is greater than the supported version (${this._CURRENT_SAVE_VERSION})!`;

        //Does it still needs to be converted ?
        else if (this._save_data.save_version < this._CURRENT_SAVE_VERSION) {
            imports.utils.CustomLog("info",`Converting the save from version ${this._save_data.save_version} to ${this._save_data.save_version + 1}. The goal is ${this._CURRENT_SAVE_VERSION}.`);

            switch (this._save_data.save_version) {
                //v1 to v2
                case 1:
                    //convert objects
                    for (let obj of this._save_data.objects) {
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


                //v2 to v3
                case 2:
                    //nothing to do, "svg_filters" property is automatically created by objects.
                    break;


                //v3 to v4
                case 3:
                    this._save_data.software_version_first_created = this._save_data.software_version_used;
                    
                    //convert objects
                    // eslint-disable-next-line no-case-declarations
                    let old_objects = JSON.parse(JSON.stringify(this._save_data.objects));
                    this._save_data.objects = {};
                    for (let obj of old_objects) {
                        this.convertObjV3ToV4(obj, this._save_data);
                    }
                    break;



                default:
                    imports.utils.CustomLog("error",`A save of version ${this._save_data.save_version} can't be converted!`);
            }
            this._save_data.save_version++;
            imports.utils.CustomLog("info", `Save converted to version ${this._save_data.save_version}!`);
            this.convertSave(log_array, no_dialog);
        } else {
            //finished conversion.
            imports.utils.CustomLog("info", "Conversion done!");

            //conversion logs
            if (log_array.length > 0) {
                let log_string = "Conversion details:\n";
                for (let msg of log_array) {
                    log_string += "- " + msg + "\n";
                }
                imports.utils.CustomLog("info", log_string);
                if (!no_dialog) MessageDialog("info", log_string.split("\n").join("<br>"));
            }
        }
    }

    /**
     * Converts one object from v3 to v4 by getting its old data and building the new data from it in the save.
     *
     * @param {Object} old_object The object to convert in its V3 format.
     * @param {Object} save The save to manipulate
     * @memberof SaveHandler
     */
    convertObjV3ToV4(old_object, save) {
        //create object
        save.objects[old_object.id] = {};
        let object = save.objects[old_object.id];

        if (old_object.object_type === "background") {
            
            object.visual_object_type = "shape";
            object.name = old_object.name;
            object.layer = old_object.layer;
            object.coordinates = {
                x: 0,
                y: 0
            };
            object.size = {
                width: save.screen.width,
                height: save.screen.height
            };
            object.rotation = 0;
            object.svg_filter = old_object.svg_filters;
            object.border_radius = "";
            object.box_shadow = "";
            object.background = JSON.parse(JSON.stringify(old_object.background));
        
        } else if (old_object.object_type === "image") {
            
            object.visual_object_type = "shape";
            object.name = old_object.name;
            object.layer = old_object.layer;
            object.coordinates = {
                x: old_object.x,
                y: old_object.y
            };
            object.size = {
                width: old_object.width,
                height: old_object.height
            };
            object.rotation = old_object.rotation;
            object.svg_filter = old_object.svg_filters;
            object.border_radius = old_object.border_radius;
            object.box_shadow = old_object.box_shadow;
            object.background = JSON.parse(JSON.stringify(old_object.background));

        } else if (old_object.object_type === "particle_flow") {

            object.visual_object_type = "particle_flow";
            object.name = old_object.name;
            object.layer = old_object.layer;
            object.coordinates = {
                x: old_object.x,
                y: old_object.y
            };
            object.size = {
                width: old_object.width,
                height: old_object.height
            };
            object.rotation = 0;
            object.svg_filter = old_object.svg_filters;
            object.particle_radius_range = JSON.parse(JSON.stringify(old_object.particle_radius_range));
            object.flow_type = old_object.type;
            object.flow_center = JSON.parse(JSON.stringify(old_object.center));
            object.flow_direction = Math.round(old_object.particle_direction * 180 / Math.PI);
            object.particle_spawn_probability = old_object.spawn_probability;
            object.particle_spawn_tests = old_object.spawn_tests;
            object.color = old_object.color;

        } else if (old_object.object_type === "text") {

            object.visual_object_type = "text";
            object.name = old_object.name;
            object.layer = old_object.layer;
            object.coordinates = {
                x: old_object.x,
                y: old_object.y
            };
            object.size = {
                width: old_object.width,
                height: old_object.height
            };
            object.rotation = old_object.rotation;
            object.svg_filter = old_object.svg_filters;
            object.text_type = old_object.type;
            object.text_content = old_object.text;
            object.font_size = old_object.font_size;
            object.color = old_object.color;
            object.text_decoration = {
                italic: old_object.italic,
                bold: old_object.bold,
                underline: old_object.underline,
                overline: old_object.overline,
                line_through: old_object.line_through
            };
            object.text_align = {
                horizontal: old_object.text_align,
                vertical: "top"
            };
            object.text_shadow = old_object.text_shadow;

        } else if (old_object.object_type === "timer") {

            object.name = old_object.name;
            object.layer = old_object.layer;
            object.coordinates = {
                x: old_object.x,
                y: old_object.y
            };
            object.size = {
                width: old_object.width,
                height: old_object.height
            };
            object.rotation = old_object.rotation;
            object.svg_filter = old_object.svg_filters;
            object.color = old_object.color;
            object.border_thickness = old_object.border_thickness;
            object.border_radius = old_object.border_radius;
            object.box_shadow = old_object.box_shadow;

            //split in 2 types
            if (old_object.type === "bar") {
                object.visual_object_type = "timer_straight_bar";
                object.timer_inner_spacing = old_object.border_to_bar_space;
            
                //adjust size
                object.size.width += 2 * object.border_thickness;
                object.size.height += 2 * object.border_thickness;

            } else if (old_object.type === "point") {
                object.visual_object_type = "timer_straight_line_point";
            
                //adjust size and position
                object.size.width += 2 * object.border_thickness;
                object.coordinates.x -= object.size.height/2 - object.border_thickness;
                object.coordinates.y -= object.size.height/2 - object.border_thickness;
                object.border_thickness *= 2;

            } else throw new Error(`${old_object.type} is an unknown timer type.`);
        
        } else if (old_object.object_type === "visualizer") {

            object.name = old_object.name;
            object.layer = old_object.layer;
            object.coordinates = {
                x: old_object.x,
                y: old_object.y
            };
            object.size = {
                width: old_object.width,
                height: old_object.height
            };
            object.rotation = old_object.rotation;
            object.visualizer_points_count = old_object.points_count;
            object.visualizer_analyzer_range = old_object.analyser_range;
            object.visualization_smoothing_type = old_object.visualization_smoothing.type;
            object.visualization_smoothing_factor = old_object.visualization_smoothing.factor;
            object.svg_filter = old_object.svg_filters;
            object.color = old_object.color;

            //split in 3 types
            if (old_object.type === "straight") {
                object.visual_object_type = "visualizer_straight_bar";
                object.visualizer_bar_thickness = old_object.bar_thickness;
                object.border_radius = old_object.border_radius;
                object.box_shadow = old_object.box_shadow;

            } else if (old_object.type === "straight-wave") {
                object.visual_object_type = "visualizer_straight_wave";
            
            } else if (old_object.type === "circular") {
                object.visual_object_type = "visualizer_circular_bar";
                object.visualizer_bar_thickness = old_object.bar_thickness;
                object.border_radius = old_object.border_radius;
                object.box_shadow = old_object.box_shadow;
                object.radius = old_object.radius;
            
            } else throw new Error(`${old_object.type} is an unknown visualizer type.`);


        } else throw new Error(`${old_object.object_type} is an unknown object type.`);
    }





    /**
     * read and apply a loaded user save
     *
     * @memberof SaveHandler
     */
    applyLoadedSave() {
        imports.utils.CustomLog("info","applying save...");

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
                this._owner_project.loadAudio(result, "url");
                // if (!this._owner_project.export_mode) document.getElementById("opened_audio").innerHTML = this._save_data.audio_filename;
                if (!this._owner_project.export_mode) document.getElementById("load-audio-picker").setProp("path", this._save_data.audio_filename);
            }));
        }

        //update version in which the save was used and edited.
        this.rewriteSoftwareInfo();

        imports.utils.CustomLog("info","Save loaded!");

    }













    /**
     * legacy save export, exports the current save to JSON format (everything but binary/external files).
     *
     * @memberof SaveHandler
     */
    exportSaveAsJSON() {

        imports.utils.CustomLog("info","generating download file for the save...");

        //prepare data for export
        var exported_save = JSON.stringify(this._save_data);
        var data_string = "data:text/json; charset=utf-8," + encodeURIComponent(exported_save);

        //create downloader element
        var downloader = document.createElement("a");
        downloader.href = data_string;
        downloader.download = "save.json";
        document.body.appendChild(downloader); // required for firefox

        //trigger download
        downloader.click();

        //remove downloader element
        downloader.remove();

        imports.utils.CustomLog("info","save file provided for download.");
    }




    /**
     * save project to file
     * 
     * structure:
     * ```txt
     * project_name.w2bzip (renamed .zip file)
     * |- data.json
     * |- assets
     * |    |- (audio, images, etc...)
     * |    /
     * /
     * ```
     *
     * @param {String} save_path where to store the path.
     * @param {boolean} [no_dialog=false] If it should be notified to the user using a dialog.
     * @memberof SaveHandler
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



    /**
     * Creates a VisualObject for new or existing data. Usage: data load, new object creation from UI.
     * empty ID generates a random new ID.
     *
     * @param {String} type The object type.
     * @param {String} [name=null] The object's display name.
     * @param {string} [obj_id=""] The object's unique ID.
     * @memberof SaveHandler
     */
    createVisualObject(type, name = null, obj_id = "") {
        let obj;
        let container = (this._owner_project.export_mode)? null : tab.objects;
        switch (type) {
            case "shape":                       obj = new imports.visual_objects.VShape(this, container, obj_id); break;
            case "particle_flow":               obj = new imports.visual_objects.VParticleFlow(this, container, obj_id); break;
            case "text":                        obj = new imports.visual_objects.VText(this, container, obj_id); break;
            case "timer_straight_bar":          obj = new imports.visual_objects.VTimerStraightBar(this, container, obj_id); break;
            case "timer_straight_line_point":   obj = new imports.visual_objects.VTimerStraightLinePoint(this, container, obj_id); break;
            case "visualizer_straight_bar":     obj = new imports.visual_objects.VVisualizerStraightBar(this, container, obj_id); break;
            case "visualizer_circular_bar":     obj = new imports.visual_objects.VVisualizerCircularBar(this, container, obj_id); break;
            case "visualizer_straight_wave":    obj = new imports.visual_objects.VVisualizerStraightWave(this, container, obj_id); break;
            default: throw new SyntaxError(`LoadSave: ${type} is not a valid object type. Is the save corrupted ?`);
        }
        if (name) obj.setName(name);
    }

    /**
     * Adds a visual object to the existing list of visual object.
     * (object = VisualObject instance, VisualObjects register themselves in the save with this function.)
     *
     * @param {VisualObject} object
     * @memberof SaveHandler
     */
    addVisualObject(object) {
        if (object.id === "") {
            object.generateID(); //generate id
            this._save_data.objects[object.id] = {};//register in save data
        
        } else if (!object.getThisData()) {
            throw new SyntaxError(`providing an ID for a VisualObject implies that it is registered in the save, but it is not! ("${object.id}"). If you want to create an object, leave this empty.`);
        } else if (this._objects[object.id]) {
            throw new Error("There is already an object inspecting " + object.id);
        }
        this._objects[object.id] = object; //keep a reference.
    }

    /**
     * Removes a visual object from the save based on its id.
     *
     * @param {String} id Object's unique id.
     * @memberof SaveHandler
     */
    deleteVisualObject(id) {
        this._objects[id].destroy();
        delete this._objects[id];
        delete this._save_data.objects[id];
    }

    /**
     * Removes all visual objects saved
     *
     * @memberof SaveHandler
     */
    deleteAllVisualObjects() {
        let ids = this.getVisualObjectIDs();
        for (let i=0; i<ids.length; i++) {
            this.deleteVisualObject(ids[i]);
        }
    }

    /**
     * get the object's data in a manipulable way.
     *
     * @param {String} id Object's unique id.
     * @return {Object} The object's data. 
     * @memberof SaveHandler
     */
    getVisualObjectData(id) {
        return this._save_data.objects[id];
    }

    /**
     * Overwrites existing data of an object with new data, for all mentioned properties.
     *
     * @param {String} id Object's unique id.
     * @param {*} data The data to incorporate.
     * @memberof SaveHandler
     */
    mergeVisualObjectData(id, data) {
        this._save_data.objects[id] = imports.utils.mergeData(data, this._save_data.objects[id]);
    }

    /**
     * get an array of all objects IDs
     *
     * @return {*} 
     * @memberof SaveHandler
     */
    getVisualObjectIDs() {
        let ids = [];
        for (let key in this._save_data.objects) ids.push(key);
        return ids;
    }

    /**
     * Copies an image from the given path and saves it in the current save, then returns
     * the file name and the new path of the saved image.
     *
     * @param {String} path Source path
     * @param {String} obj_id Object's unique ID.
     * @return {Object}
     * ```
     *  return {
            filename: filename,
            new_path: new_path,
        }
     * ``` 
     * @memberof SaveHandler
     */
    async saveObjectBackgroundImage(path, obj_id) {
        //copying file
        // eslint-disable-next-line no-useless-escape
        let filename = path.replace(/^.*[\\\/]/, "");
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
        else await ipcRenderer.invoke("make-dir", new_path);
        await ipcRenderer.invoke("copy-file", path, `${new_path}${filename}`);
        
        return {
            filename: filename,
            new_path: new_path,
        };
    }






    /*
    #####
    AUDIO
    #####
    */


    /**
     * Saves an audio file in the save.
     *
     * @param {String} path The audio source path.
     * @memberof SaveHandler
     */
    async saveAudio(path) {
        await this._owner_project.closeAudio();

        // eslint-disable-next-line no-useless-escape
        let filename = path.replace(/^.*[\\\/]/, "");
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
        else await ipcRenderer.invoke("make-dir", new_path);
        await ipcRenderer.invoke("copy-file", path, `${new_path}${filename}`);

        //keep new audio name in memory;
        this._save_data.audio_filename = filename;

        //load audio
        let audio_path = await ipcRenderer.invoke("get-full-path", `${new_path}${filename}`);
        this._owner_project.loadAudio(audio_path, "url");
    }


}






/*
##################
PROJECT MANAGEMENT
##################
*/

/**
 * The class to manipulate a project as a whole.
 * It stores the app and project information, handles rendering, host a SaveHandler, etc.
 *
 * @class Project
 */
class Project {
    /**
     * Creates an instance of Project.
     * @param {Boolean} export_mode If it is created in an export context (no user interface).
     * @memberof Project
     */
    constructor(export_mode) {
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
        };

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

    get save_handler() {return this._save_handler;}
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

    get screen() {return document.getElementById("screen");}

    get audio_file_type() {return this._audio_file_type;}
    set audio_file_type(audio_file_type) {this._audio_file_type = audio_file_type;}

    get frequency_array() {return this._frequency_array;}
    set frequency_array(frequency_array) {this._frequency_array = frequency_array;}
    /**
     * Adds a value manually to the frequency array.
     *
     * @param {Number} value the new value.
     * @memberof Project
     */
    addToFrequencyArray(value) {this._frequency_array.push(value);}

    /*
    #########
    ANIMATION
    #########
    */

    /**
     * start screen visuals by starting audio and animation
     *
     * @memberof Project
     */
    playVisuals() {
        if (!this._animating) this.startAnimating(this._save_handler.fps);
        this._audio.play();
    }

    /**
     * pause audio and animation
     *
     * @memberof Project
     */
    pauseVisuals() {
        if (this._animating) this.stopAnimating();
        this._audio.pause();
    }

    /**
     * stop animation and reset audio position
     *
     * @memberof Project
     */
    stopVisuals() {
        this.pauseVisuals();
        this._audio.currentTime = 0;
    }

    /**
     * prepare fps animation
     *
     * @param {Number} fps
     * @memberof Project
     */
    startAnimating(fps) {
        // initialize the timer variables and start the animation
        if (!imports.utils.IsANumber(fps)) throw `StartAnimating: ${fps} is not a valid fps value, start aborted.`;

        this._stop_animating = false;
        this._animating = true;
        this._fps_interval = 1000 / fps; //in ms
        this._time.then = performance.now();
        this._time.start = this._time.then;

        this.animate();
        imports.utils.CustomLog("info","animation started.");
    }

    /**
     * stop the fps animation loop
     *
     * @memberof Project
     */
    stopAnimating() {
        this._stop_animating = true;
        this._animating = false;
        imports.utils.CustomLog("info","animation stopped.");
    }

    /**
     * The animation loop calculates time elapsed since the last loop
     * and only draws if the specified fps interval is achieved
     *
     * @return {*} 
     * @memberof Project
     */
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


    /**
     * returns if all the objects have finished updating.
     *
     * @return {Boolean} 
     * @memberof Project
     */
    updateFinished() {
        let finished_render = true;
        //if one object didn't finish rendering, returns false
        for (let i = 0; i < this._objects_callback.length; i++) {
            if (!this._objects_callback[i]) finished_render = false;
        }

        return finished_render;
    }



    /**
     * Updates and draws the screen
     *
     * @memberof Project
     */
    drawFrame() {


        //#################
        //AUDIO CALCULATION
        //#################


        
        if (this._export_mode) {
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
        let i = 0;
        for (const obj in this._save_handler.objects) {
            if (Object.hasOwnProperty.call(this._save_handler.objects, obj)) {
                const element = this._save_handler.objects[obj];
                this._objects_callback[i] = false;//reset all callbacks to false
                this._objects_callback[i] = element.update();//set to true once update is finished
                i++;
            }
        }


        //end of a frame
    }



    /*
    #####
    AUDIO
    #####
    */


    /**
     * load an audio file into the app. type: "file" || "url"
     *
     * @param {*} file_data source data.
     * @param {String} type data type
     * @memberof Project
     */
    loadAudio(file_data, type) {
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
        if (!this._export_mode) SetupAudioUI(); //no need for UI in export mode.
    
    
        //prepare data collection
        this._ctx_frequency_array = new Uint8Array(this._analyser.frequencyBinCount);//0 to 1023 => length=1024.
    
        imports.utils.CustomLog("info","audio loaded successfully.");
    }
    
    /**
     * Stops the audio process
     *
     * @memberof Project
     */
    closeAudio() {
        imports.utils.CustomLog("info","Closing audio context if any...");
        if (!imports.utils.IsUndefined(this._context)) this._context.close();
        // if (!this._export_mode) document.getElementById("opened_audio").innerHTML = project.save_handler.save_data.audio_filename;
        if (!this._export_mode) document.getElementById("load-audio-picker").setProp("path", project.save_handler.save_data.audio_filename);
        imports.utils.CustomLog("info","Audio context closed.");
    }

    /**
     * returns if the audio is in state 4, so it can be manipulated.
     *
     * @return {Boolean} 
     * @memberof Project
     */
    audioReady() {
        return this._audio.readyState === 4;
    }

    /**
     * get the duration of audio object
     *
     * @return {Number} 
     * @memberof Project
     */
    getAudioDuration() {
        return this._audio.duration;
    }

    /**
     * set audio playing time to start.
     *
     * @memberof Project
     */
    audioToStart() {
        this._audio.currentTime = 0;
    }
    
    /**
     * set audio playing time to end.
     *
     * @memberof Project
     */
    audioToEnd() {
        this._audio.currentTime = this._audio.duration;
    }

    /**
     * sets audio object current time in seconds
     *
     * @param {Number} currentTime The new time position in seconds
     * @memberof Project
     */
    setAudioCurrentTime(currentTime) {
        this._audio.currentTime = currentTime;
    }

    /**
     * gets audio object current time in seconds
     *
     * @return {Number}  The time position in seconds
     * @memberof Project
     */
    getAudioCurrentTime() {
        if (this.export_mode) {
            return this._current_time;
        } else {
            return this._audio.currentTime;
        }
    }

    /**
     * toggle if the audio should be played forever in loop mode.
     *
     * @memberof Project
     */
    audioLoopToggle() {
        this._audio.loop = (this._audio.loop) ?  false : true;
    }

    /**
     * returns if the audio object is in loop mode.
     *
     * @return {Boolean} 
     * @memberof Project
     */
    getAudioIsLooping() {
        return this._audio.loop;
    }

    /**
     * Returns the project's frequency array.
     *
     * @return {Array} 
     * @memberof Project
     */
    getFrequencyArray() {
        return this._frequency_array;
    }




    //###
    //FPS
    //###

    /**
     * display FPS regularly
     *
     * @memberof Project
     */
    updateFPSDisplay() {
        //maintain the max length of the array
        if (this._fps_array.length > this._FPS_ARRAY_MAX_LENGTH) {

            let overflow = this._fps_array.length - this._FPS_ARRAY_MAX_LENGTH;
            this._fps_array.splice(0, overflow);
        }

        //calculates average FPS from the fps array
        let sum = 0;
        for (let i = 0; i < this._fps_array.length; i++) {
            sum += this._fps_array[i];
        }
        let average_fps = sum / this._FPS_ARRAY_MAX_LENGTH;

        //display fps
        document.getElementById("fps").innerHTML = `${average_fps}FPS`;
    }

    /**
     * change the project fps, taking into account a potential ongoing animation process
     *
     * @param {Number} fps
     * @memberof Project
     */
    setFPS(fps) {
        this._save_handler.fps = fps;
        this.stopAnimating();
        if (this._audio && !this._audio.paused) this.startAnimating(fps);
    }
}






/**
 * bridge class to interact with global context user interface
 *
 * @class UserInterface
 */
class UserInterface {
    constructor(owner_project) {
        this._screen = document.getElementById("screen");
        this._object_frame = new imports.ui_components.UIObjectFrame(); //add to #interface
        this._object_frame.DOM_parent = document.getElementById("interface");
        this._owner_project = owner_project;

        this._loading_frame = new imports.ui_components.UILoadingFrame();
    }

    get screen() {return this._screen;}
    set owner_project(owner_project) {this._owner_project = owner_project;}

    //bridge to interact with user_interface.js file browser dialog
    async FileBrowserDialog(settings, callback, args) {
        await FileBrowserDialog(settings, callback, args);
    }

    /**
     * Defines if the UI should be locked behind a loading screen.
     * It has no effect when passing the same state as it actually
     * is.
     *
     * @param {boolean} is_loading
     * @memberof UserInterface
     */
    loadingMode(is_loading) {
        if (is_loading) this._loading_frame.show();
        else this._loading_frame.hide();
    }
}







/*
#####################
GLOBAL INITIALIZATION
#####################
*/

window.onload = function() {LoadModules();};
window.onbeforeunload = function(event) {PrepareWindowClose(event);};

/**
 * load ES modules required
 *
 */
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
        return import("./ui_components/ui_components.js");
    }).then(module => {
        imports.ui_components = module;
        return import("./visual_objects/visual_objects.js");
    }).then(module => {
        imports.visual_objects = module;
        imports.utils.CustomLog("debug","Loading modules done.");

        //know if the window is a main window (with GUI) or an export window (screen only)
        return ipcRenderer.invoke("is-export-win");
    }).then((export_mode) => {
        InitPage(export_mode);
    }).catch(error => {
        console.log("could not load modules: " + error);
        console.log(error.stack);
    });
}

/**
 * page initialization
 *
 * @param {Boolean} export_mode If the process is in an export context (no user interface, no CLI analysis).
 */
function InitPage(export_mode) {

    //SETUP PROJECT AND PREPARE SAVE
    project = new Project(export_mode);
    project.save_handler = new SaveHandler();

    imports.utils.CustomLog("debug", `is export window: ${export_mode}`);
    if (!export_mode) {
        //UI INITIALIZATION
        project.user_interface = new UserInterface();
        InitUI();
        setInterval(function() {project.updateFPSDisplay();}, 1000);

        //CLI
        console.log(argv);

        //load save passed through CLI if any.
        if (argv._[0] === "load") project.save_handler.loadSave(argv.savefile);
        if (argv._[0] === "export") project.save_handler.loadSave(argv.input, true);

        //enable experimental jpeg from CLI
        if (argv._[0] === "export" && argv.jpeg) {
            /** @type {uiComponents.WebUIInputField} */
            let elt = document.getElementById("experimental-export-input");
            elt.setProp(elt.PROPS.value, argv.jpeg);
        }
        //launch export if any
        if (argv._[0] === "export") setTimeout(() => {
            Export(argv.output);
        }, 5000);
    } else {
        ConfirmCreation();
    }
}



/**
 * Closes a window after user's confirmation.
 *
 * @param {BeforeUnloadEvent} event
 */
function PrepareWindowClose(event) {
    imports.utils.CustomLog("info", "The window will be closed.");

    if (!can_close_window_safely && !project.export_mode) {
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

/**
 * catch all window error (throws...)
 *
 * @param {String} error_msg
 * @param {String} url
 * @param {Number} line_number
 * @return {Boolean} 
 */
function GlobalErrorHandler(error_msg, url, line_number) {
    imports.utils.CustomLog("error",`${error_msg}\nsource: ${url}\n line: ${line_number}`);
    return false;
}

window.onerror = GlobalErrorHandler;






