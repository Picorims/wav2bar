//MIT License - Copyright (c) 2019 Picorims and Mischa

//EXPORTING THE PROJECT INTO A VIDEO || MAIN PROCESS PART (completely excluded from renderer window process)

const { remote, ipcRenderer } = require("electron");
var main = remote.require("./main");
var export_win = main.export_win;

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
        new Response(audio_file).arrayBuffer().then(function(result) {
            audio_buffer = result;

            console.log(audio_buffer, audio_file.type);
            //requesting file write
            main.WriteAudioToTemp(new Int8Array(audio_buffer), audio_file_type);


            //send required data to the renderer
            main.SendEventToExportWin("data-sent", data);
        });
        


    });

}