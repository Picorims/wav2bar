//MIT License - Copyright (c) 2020 Picorims

//EXPORTING THE PROJECT INTO A VIDEO || MAIN PROCESS PART (completely excluded from renderer window process)

const { remote, ipcRenderer } = require("electron");
var main = remote.require("./main");
var export_win = main.export_win;
var export_mode = false; //not in export window
var max_frames; //allow setting the max progress through every progress event.

function Export() {//Launch the rendering process which will export the video
    if (typeof audio === "undefined") {
        alert("No audio file selected!");
        return;
    }

    console.log("Exporting...");
    StopAnimating();//this avoids useless background process in the main window

    //create renderer window
    main.createExportWin();

    //wait callback
    ipcRenderer.once("renderer-exists", (event) => {//once avoid the listener to be persistent (if it was,
                                                    //on window re-open, a new listener would stack upon this
                                                    //one, making multiple process stacking on forever.
        console.log("renderer created, sending data...");
        

        //data to send to the renderer process (the project, so it can be recreated into the new window)
        var data = {
            screen: {
                width: screen.width,
                height: screen.height,
            },
            save: current_save,
            audio_file_type: audio_file_type,
        }


        //write audio into temp directory because putting it in data result in a memory overflow
        //getting buffer from audio file
        console.log(audio_file);
        new Response(audio_file).arrayBuffer().then(function(result) {
            audio_buffer = result;

            console.log(audio_buffer, audio_file.type);
            //requesting file write
            main.WriteAudioToTemp(new Int8Array(audio_buffer), audio_file_type);


            //send required data to the renderer
            main.SendEventToExportWin("data-sent", data);
        });
        


        //track progress
        ipcRenderer.on("export-progress", (event, max, progress) => {
            document.getElementById("export_frame_span").innerHTML = `${progress}/${max}`;
            document.getElementById("export_frame_progress").style.width = `${progress/max*100}%`;
            max_frames = max;
        });
        ipcRenderer.once("frames-rendered", (event) => {
            ipcRenderer.removeAllListeners("export-progress");
        });

        ipcRenderer.on("encoding-progress", (event, info) => {
            document.getElementById("export_encoding_span").innerHTML = `${info.frames}/${max_frames+1}`;
            document.getElementById("export_encoding_progress").style.width = `${info.frames/(max_frames+1)*100}%`;
        });
        ipcRenderer.once("encoding-finished", (event, success) => {
            ipcRenderer.removeAllListeners("encoding-progress");
            if (success) alert("The video has been successfully created!");
            else alert("An error occurred during the process");
        });

    });

}