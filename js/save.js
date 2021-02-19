//MIT License - Copyright (c) 2020-2021 Picorims

//SAVING AND LOADING USER SAVES OR PRESETS

//all data of the project that can be saved is in this variable.
//It is used for saving and exporting data, never for getting data in a process.
var current_save;
const current_save_version = 2;
var lock_save_sync = false;


//save initialization
function InitSave() {
    DefaultSave();
    CustomLog("debug",'syncing save object every 500ms, starting from now.');
    setInterval(SyncSave, 500);
}

function DefaultSave() {//set the save data to default values
    current_save = {
        //1 -> Wav2Bar 0.1.0 indev before save revamp (image embedding, music embedding)
        //2 -> Wav2Bar 0.1.0 Beta and after
        save_version: current_save_version,
        software_version_used: `${software_version} ${software_status}`,
        screen: {width: 1280, height: 720},
        fps: 60,
        audio_filename: "",
        objects: [],
    }
    CustomLog('info','loaded default save.');
}




async function LoadSave(save_file_path) {//load a user save or a preset (JSON format)
    if (!IsAString(save_file_path)) throw "LoadSave: No valid path provided!";

    CustomLog("info", "Backing up currently opened save...");
    ExportSave("./temp/before_new_save_open.w2bzip");

    CustomLog("info","Loading the save...");
    lock_save_sync = true;

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
        CustomLog("info","reading the save...");

        const JSON_data = await ipcRenderer.invoke("read-json-file","./temp/current_save/data.json");
        current_save = JSON.parse(JSON.stringify(JSON_data)); //copy data

        //check version
        if (current_save.save_version > current_save_version) {
            //newer version

            CustomLog("error",`The save can't be opened because its version (${current_save.save_version}) is greater than the supported version (${current_save_version})`);
            MessageDialog("error", `This project has been created in a newer version of Wav2Bar (${current_save.software_version_used}). To be able to open this project, please upgrade your installed version.`);
            lock_save_sync = false;
        } else if (current_save.save_version < current_save_version) {
            //older version

            CustomLog("warning",`The supported save version is ${current_save_version} but the provided save is of version ${current_save.save_version}`);
            MessageDialog("confirm",`This project has been created in an older version of Wav2Bar (${current_save.software_version_used}). Do you want to upgrade it ? (Always backup your project before converting it!)`,
                function(confirmed) {
                    if (confirmed) {
                        ConvertSave();
                        ApplyLoadedSave();
                    } else {
                        CustomLog("info", "Save load aborted, loading back the project in it's old state.");
                        LoadSave("./temp/before_new_save_open.w2bzip");
                    }
                    lock_save_sync = false;
                });
        } else {
            //same version
            ApplyLoadedSave();
            lock_save_sync = false;
        }
    });
    await ipcRenderer.invoke("cache-save-file", save_file_path);

    // var file_reader = new FileReader();
    // file_reader.onload = function(e) {

    //     //get parsed data
    //     var save = JSON.parse(file_reader.result);

    //     //clone it into the current_save (direct assign doesn't work)
    //     current_save = JSON.parse(JSON.stringify(save));

    //     ApplyLoadedSave();

    // }
    // file_reader.readAsText(save_file, "utf-8");

}




//upgrade an older save file to the current version.
//versions are documented in [root]/docs/save.md.
function ConvertSave(log_array = []) {
    //something's wrong ?
    CustomLog("debug", JSON.stringify(current_save));
    if (current_save.save_version > current_save_version) throw `Can't convert the save: the save version (${current_save.save_version}) is greater than the supported version (${current_save_version})!`;

    //Does it still needs to be converted ?
    else if (current_save.save_version < current_save_version) {
        CustomLog("info",`Converting the save from version ${current_save.save_version} to ${current_save.save_version + 1}. The goal is ${current_save_version}.`);

        switch (current_save.save_version) {
            case 1:
                //convert objects
                for (obj of current_save.objects) {
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
                current_save.audio_filename = "";
            break;



            default:
                CustomLog("error",`A save of version ${current_save.save_version} can't be converted!`);
        }
        current_save.save_version++;
        CustomLog("info", `Save converted to version ${current_save.save_version}!`);
        ConvertSave(log_array);
    } else {
        //finished conversion.
        CustomLog("info", `Conversion done!`);

        //conversion logs
        if (log_array.length > 0) {
            let log_string = "Conversion details:\n";
            for (msg of log_array) {
                log_string += "- " + msg + '\n';
            }
            CustomLog("info", log_string);
            MessageDialog("info", log_string.split("\n").join("<br>"));
        }
    }
}






function ApplyLoadedSave() {//read and apply a loaded user save
    CustomLog('info','applying save...');
    //CREATE OBJECTS

    //because objects are created in current_data.objects during the for loop,
    //objects are constantly added in it, and using it as a reference for length make
    //the loop to never end.
    //So the array and it's length are separately saved.
    var objects_data_list = current_save.objects.slice();


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

        CustomLog("info",`Added ${type}.`);

    }



    //apply FPS
    ChangeFPSTo(current_save.fps);

    //apply screen size
    SetScreenTo(current_save.screen.width, current_save.screen.height);

    //apply audio
    if (current_save.audio_filename !== "") {
        ipcRenderer.invoke("get-full-path", `./temp/current_save/assets/audio/${current_save.audio_filename}`).then((result => {
            LoadAudio(result, "url");
        }));
    }


    CustomLog("info","Save loaded!");

}










function SyncSave() { //function that updates the current save with latest data
    if (!lock_save_sync) {
        current_save.software_version_used = `${software_version} ${software_status}`;
        current_save.screen.width = screen.width;
        current_save.screen.height = screen.height;
        current_save.fps = fps;
        //audio_filename not needed to sync
        current_save.objects = [];

        for (var i=0; i < objects.length; i++) {
            current_save.objects.push(objects[i].data);
        }
    } else {
        CustomLog("debug","Save syncing locked, didn't synchronize data.");
    }
}













//legacy save export
function ExportSaveAsJSON() {//export the current save to JSON format.

    CustomLog("info","generating download file for the save...");

    //update current save
    SyncSave();


    //prepare data for export
    var exported_save = JSON.stringify(current_save);
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

    CustomLog("info","save file provided for download.");
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
function ExportSave(save_path) {
    if (!IsAString(save_path)) throw `ExportSave: ${save_path} is an invalid save path (not a string).`;

    CustomLog("info","generating save file...");
    //update the current save
    SyncSave();

    //update JSON data in temp save
    var save_data = JSON.stringify(current_save);
    ipcRenderer.invoke("write-json-file", "./temp/current_save/data.json", save_data);

    //package file
    ipcRenderer.invoke("create-save-file", save_path);
    CustomLog("info","save file generated!");
}