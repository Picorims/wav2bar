//MIT License - Copyright (c) 2020-2021 Picorims

//EXPORTING THE PROJECT INTO A VIDEO || MAIN PROCESS PART (completely excluded from renderer window process)

/*globals imports, project, ipcRenderer, MessageDialog*/

/** @type {Number} allow setting the max progress through every progress event.*/
var max_frames;

/**
 * Launches the rendering process which will export the video
 *
 * @param {String} path Where to save the video.
 * @return {Boolean} 
 */
// eslint-disable-next-line no-unused-vars
function Export(path) {
    if (project.save_handler.save_data.audio_filename === "") {
        MessageDialog("warn","No audio file selected!");
        return false;
    }

    imports.utils.CustomLog("info","Exporting...");
    project.user_interface.loadingMode(true);
    project.stopAnimating();//this avoids useless background process in the main window

    //wait callback
    //once avoid the listener to be persistent (if it was,
    //on window re-open, a new listener would stack upon this
    //one, making multiple process stacking on forever.
    ipcRenderer.once("renderer-exists", async () => {
        imports.utils.CustomLog("debug","renderer created, sending data...");


        //data to send to the renderer process (the project, so it can be recreated into the new window)
        let filename = project.save_handler.save_data.audio_filename;
        let extension = filename.replace(/^.*\./,"");
        if (imports.utils.IsUndefined(project.audio_file_type)) {
            switch (extension.toLowerCase()) {
                case "mp3": project.audio_file_type = "audio/mp3"; break;
                case "wav": project.audio_file_type = "audio/wav"; break;
                case "ogg": project.audio_file_type = "application/ogg"; break;
                default: throw "Export: Unknown audio type!";
            }
        }
        var data = {
            save: project.save_handler.save_data,
            audio_file_type: project.audio_file_type,
            audio_file_extension: extension,
            output_path: path,
            use_jpeg: document.getElementById("experimental_export_input").checked,
        };

        //cache audio for rendering in a separate file.
        let from_path = `${project.working_dir}/temp/current_save/assets/audio/${filename}`;
        let to_path = `${project.working_dir}/temp/temp.${extension}`;
        await ipcRenderer.invoke("copy-file", from_path, to_path);
        
        //send data to the export window renderer
        await ipcRenderer.invoke("send-event-to-export-win", "data-sent", data);

        //LEGACY AUDIO CACHING FOR File() OBJECT
        // //write audio into temp directory because putting it in data result in a memory overflow
        // //getting buffer from audio file
        // new Response(audio_file).arrayBuffer().then(async result => {
        //     audio_buffer = result;

        //     imports.utils.CustomLog("info",`file type: ${audio_file.type}`)
        //     //requesting file write
        //     await ipcRenderer.invoke("write-audio-to-temp", new Uint8Array(audio_buffer), audio_file_type);

        //     //send required data to the renderer
        //     await ipcRenderer.invoke("send-event-to-export-win", "data-sent", data);
        // });



        //track progress
        var start = performance.now();

        //reset
        document.getElementById("export_frame_span").innerHTML = "";
        document.getElementById("export_frame_progress").style.width = "0%";
        document.getElementById("export_encoding_span").innerHTML = "";
        document.getElementById("export_encoding_progress").style.width = "0%";

        //events
        ipcRenderer.on("export-progress", (event, max, progress) => {
            //progress display
            document.getElementById("export_frame_span").innerHTML = `${progress}/${max}`;
            document.getElementById("export_frame_progress").style.width = `${progress/max*100}%`;
            max_frames = max;

            //time estimation
            let now = performance.now();
            let ellapsed = now-start;
            //estimate the total time it will take based on the ellapsed time,
            //the number of frames rendered and the total number of frames
            //to render, using proportionality.
            //This works because most frames usually takes the same amount of time to render.
            let total_estimation = (ellapsed/progress)*max;
            let time_left_estimation = total_estimation-ellapsed;
            let hours = Math.floor(time_left_estimation/3600000);// /1000/60/60
            let mins = Math.floor((time_left_estimation/60000)%60);// /1000/60
            let secs = Math.floor((time_left_estimation/1000)%60);
            mins = (mins<10)? "0"+mins : mins;
            secs = (secs<10)? "0"+secs : secs;

            document.getElementById("export_frame_time_span").innerHTML = `${hours}:${mins}:${secs}`;
        });
        ipcRenderer.once("frames-rendered", () => {
            ipcRenderer.removeAllListeners("export-progress");
        });

        ipcRenderer.on("encoding-progress", (event, info) => {
            //progress display
            document.getElementById("export_encoding_span").innerHTML = `${info.frames}/${max_frames+1}`;
            document.getElementById("export_encoding_progress").style.width = `${info.frames/(max_frames+1)*100}%`;

            //time estimation
            let now = performance.now();
            let ellapsed = now-start;
            //estimate the total time it will take based on the ellapsed time,
            //the number of frames rendered and the total number of frames
            //to render, using proportionality.
            //This works because most frames usually takes the same amount of time to render.
            let total_estimation = (ellapsed/info.frames)*(max_frames+1);//ffmpeg renders one more frame
            let time_left_estimation = total_estimation-ellapsed;
            let hours = Math.floor(time_left_estimation/3600000);// /1000/60/60
            let mins = Math.floor((time_left_estimation/60000)%60);// /1000/60
            let secs = Math.floor((time_left_estimation/1000)%60);
            mins = (mins<10)? "0"+mins : mins;
            secs = (secs<10)? "0"+secs : secs;

            document.getElementById("export_encoding_time_span").innerHTML = `${hours}:${mins}:${secs}`;
        });
        ipcRenderer.once("encoding-finished", (event, success) => {
            ipcRenderer.removeAllListeners("encoding-progress");
            project.user_interface.loadingMode(false);
            if (success) {
                let now = performance.now();
                let ellapsed = now-start;
                let hours = Math.floor(ellapsed/3600000);// /1000/60/60
                let mins = Math.floor((ellapsed/60000)%60);// /1000/60
                let secs = Math.floor((ellapsed/1000)%60);
                mins = (mins<10)? "0"+mins : mins;
                secs = (secs<10)? "0"+secs : secs;

                MessageDialog("info",`The video has been successfully created in ${hours}:${mins}:${secs} !`);
                imports.utils.CustomLog("info",`The video has been successfully created in ${hours}:${mins}:${secs} !`);
            }
            else MessageDialog("error","An error occurred during the encoding process. For more information, see the logs.");
        });

    });

    //create renderer window
    ipcRenderer.invoke("create-export-win");

    return true;
}