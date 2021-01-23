//MIT License - Copyright (c) 2020-2021 Picorims

//SAVING AND LOADING USER SAVES OR PRESETS

//all data of the project that can be saved is in this variable.
//It is used for saving and exporting data, never for getting data in a process.
var current_save;
const save_version = 2;

function DefaultSave() {//set the save data to default values
    current_save = {
        //1 -> Wav2Bar 0.1.0 indev before save revamp (image embedding, music embedding)
        //2 -> Wav2Bar 0.1.0 Beta and after
        save_version: save_version,
        software_version_used: `${software_version} ${software_status}`,
        screen: {width: 1280, height: 720},
        fps: 60,
        objects: [],
    }
    CustomLog('info','loaded default save.');
}




async function LoadSave(save_file_path) {//load a user save or a preset (JSON format)
    if (!IsAString(save_file_path)) throw "LoadSave: No valid path provided!";

    CustomLog("info","Loading the save...");

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
        ApplyLoadedSave();
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




    CustomLog("info","Save loaded!");

}










function SyncSave() { //function that updates the current save with latest data
    
    current_save.software_version_used = software_version;
    current_save.screen.width = screen.width;
    current_save.screen.height = screen.height;
    current_save.fps = fps;
    current_save.objects = [];

    for (var i=0; i < objects.length; i++) {
        current_save.objects.push(objects[i].data);
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