//MIT License - Copyright (c) 2020 Picorims

//SAVING AND LOADING USER SAVES OR PRESETS

var current_save;

function DefaultSave() {//set the save data to default values
    current_save = {
        save_version: 1,
        screen: {width: 1280, height: 720},
        fps: 60,
        objects: [],
    }
}




function LoadSave(save_file) {//load a user save or a preset (JSON format)
    if (!IsAnObject(save_file)) throw "LoadSave: no valid save file given!";

    console.log("Loading the save...");

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

    var file_reader = new FileReader();    
    file_reader.onload = function(e) {
        
        //get parsed data
        var save = JSON.parse(file_reader.result);
        
        //clone it into the current_save (direct assign doesn't work)
        current_save = JSON.parse(JSON.stringify(save));
        console.log(current_save);

        ApplyLoadedSave();

    }
    file_reader.readAsText(save_file, "utf-8");

}






function ApplyLoadedSave() {//read and apply a loaded user save

    //CREATE OBJECTS

    //because objects are created in current_data.objects during the for loop,
    //objects are constantly added in it, and using it as a reference for length make
    //the loop to never end.
    //So the array and it's length are separately saved.
    var objects_data_list = current_save.objects.slice();    
    console.log(objects_data_list);


    //create all objects
    for (var i=0; i<objects_data_list.length; i++) {
        
        //get data
        var object_data = objects_data_list[i];

        //avoid overflow
        if (i>100) {
            throw "LoadSave: infernal loop stopped!";
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

        console.log(`Added ${type}, if it is a valid object type.`);

    }




    console.log("Save loaded!", current_save);

}




function ExportSaveAsJSON() {//export the current save to JSON format.

    console.log("generating download file...");
    
    //update current save
    current_save.screen.width = screen.width;
    current_save.screen.height = screen.height;
    current_save.fps = fps;
    current_save.objects = [];

    for (var i=0; i < objects.length; i++) {
        current_save.objects.push(objects[i].data);
    }
    console.log(current_save);


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


}