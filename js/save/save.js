// //MIT License - Copyright (c) 2020-2021 Picorims

// import utils from "../utils/utils.js";

// //class for save management of a project.
// export class Save {
    
//     _DEFAULT_SAVE = {
//         //1 -> Wav2Bar 0.1.0 indev before save revamp (image embedding, music embedding)
//         //2 -> Wav2Bar 0.1.0 Beta to 0.1.2 Beta
//         //3 -> Wav2Bar 0.2.0 Beta and after
//         save_version: current_save_version,
//         software_version_used: `${software_version} ${software_status}`,
//         screen: {width: 1280, height: 720},
//         fps: 60,
//         audio_filename: "",
//         objects: [],
//     };
    
//     constructor() {
//         this._save_data = {};
//     }

//     //load default save
//     loadDefault() {
//         this._save_data = this._DEFAULT_SAVE;
//     }

//     //load a user save in .w2bzip format
//     load(save_file_path) {
//         if (!utils.IsAString(save_file_path)) throw "LoadSave: No valid path provided!";

//         utils.CustomLog("info", "Backing up currently opened save...");
//         this.export(`${working_dir}/temp/before_new_save_open.w2bzip`, true);
//         await CloseAudio();

//         utils.CustomLog("info","Loading the save...");
//         lock_save_sync = true;

//         //ERASE CURRENT DATA

//         //because objects are removed from the array trough splice() during the for loop,
//         //indexes are constantly changed and the loop ends up not going trough all indexes.
//         //So the array and it's length are separately saved, and this list is kept intact
//         //to iterate trough every object.
//         var objects_list = objects.slice();

//         for (var i=0; i<objects_list.length; i++) {
//             var object = objects_list[i];

//             object.remove(object.data.id);
//         }




//         //LOAD NEW DATA
//         //the data must be extracted from the file in order to be able to read it.
//         ipcRenderer.once("finished-caching-save", async (event) => {
//             //read data cached in ./temp/current_save
//             utils.CustomLog("info","reading the save...");

//             const JSON_data = await ipcRenderer.invoke("read-json-file",`${working_dir}/temp/current_save/data.json`);
//             current_save = JSON.parse(JSON.stringify(JSON_data)); //copy data

//             //check version
//             if (current_save.save_version > current_save_version) {
//                 //newer version

//                 utils.CustomLog("error",`The save can't be opened because its version (${current_save.save_version}) is greater than the supported version (${current_save_version})`);
//                 MessageDialog("error", `This project has been created in a newer version of Wav2Bar (${current_save.software_version_used}). To be able to open this project, please upgrade your installed version.`);
//                 lock_save_sync = false;
//             } else if (current_save.save_version < current_save_version) {
//                 //older version

//                 utils.CustomLog("warning",`The supported save version is ${current_save_version} but the provided save is of version ${current_save.save_version}`);
//                 MessageDialog("confirm",`This project has been created in an older version of Wav2Bar (${current_save.software_version_used}). Do you want to upgrade it ? (Always backup your project before converting it!)`,
//                     function(confirmed) {
//                         if (confirmed) {
//                             ConvertSave();
//                             ApplyLoadedSave();
//                         } else {
//                             utils.CustomLog("info", "Save load aborted, loading back the project in it's old state.");
//                             LoadSave(`${working_dir}/temp/before_new_save_open.w2bzip`);
//                         }
//                         lock_save_sync = false;
//                     });
//             } else {
//                 //same version
//                 ApplyLoadedSave();
//                 lock_save_sync = false;
//             }
//             if (!export_mode) document.getElementById("opened_save").innerHTML = save_file_path;
//         });
//         await ipcRenderer.invoke("cache-save-file", save_file_path);

//         //LEGACY JSON LOADING, to use if support comes back

//         // var file_reader = new FileReader();
//         // file_reader.onload = function(e) {

//         //     //get parsed data
//         //     var save = JSON.parse(file_reader.result);

//         //     //clone it into the current_save (direct assign doesn't work)
//         //     current_save = JSON.parse(JSON.stringify(save));

//         //     ApplyLoadedSave();

//         // }
//         // file_reader.readAsText(save_file, "utf-8");
//     }



//     //save project to file
//     /**
//      * structure:
//      * project_name.w2bzip (renamed .zip file)
//      * |- data.json
//      * |- assets
//      * |    |- (audio, images, etc...)
//      * |    /
//      * /
//      */
//     export(save_path, no_dialog = false) {
//         if (!imports.utils.IsAString(save_path)) throw `ExportSave: ${save_path} is an invalid save path (not a string).`;
//         if (!imports.utils.IsABoolean(no_dialog)) throw `ExportSave: ${no_dialog} must be a boolean for no_dialog value!`;

//         imports.utils.CustomLog("info","generating save file...");
//         //update the current save
//         SyncSave();

//         //update JSON data in temp save
//         var save_data = JSON.stringify(current_save);
//         ipcRenderer.invoke("write-json-file", `${working_dir}/temp/current_save/data.json`, save_data);

//         //package file
//         ipcRenderer.invoke("create-save-file", save_path);

//         if (!no_dialog) MessageDialog("info","The save has been created!");
//         imports.utils.CustomLog("info","save file generated!");
//     }
// }