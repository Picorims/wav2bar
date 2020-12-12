//MIT License - Copyright (c) 2020 Picorims

//EXPORTING THE PROJECT INTO A VIDEO || MAIN PROCESS PART (completely excluded from renderer window process)

var export_mode = false; //not in export window
var max_frames; //allow setting the max progress through every progress event.

function Export(path) {//Launch the rendering process which will export the video
    if (typeof audio === "undefined") {
        alert("No audio file selected!");
        return;
    }

    console.log("Exporting...");
    StopAnimating();//this avoids useless background process in the main window

    //create renderer window
    ipcRenderer.invoke('create-export-win');

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
            output_path: path,
        }


        //write audio into temp directory because putting it in data result in a memory overflow
        //getting buffer from audio file
        console.log(audio_file);
        new Response(audio_file).arrayBuffer().then(async result => {
            audio_buffer = result;

            console.log(audio_buffer, audio_file.type);
            //requesting file write
            await ipcRenderer.invoke("write-audio-to-temp", new Uint8Array(audio_buffer), audio_file_type);

            //send required data to the renderer
            await ipcRenderer.invoke("send-event-to-export-win", "data-sent", data);
        });
        


        //track progress

        //reset
        document.getElementById("export_frame_span").innerHTML = "";
        document.getElementById("export_frame_progress").style.width = "0%";
        document.getElementById("export_encoding_span").innerHTML = "";
        document.getElementById("export_encoding_progress").style.width = "0%";

        //events
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