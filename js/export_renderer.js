//MIT License - Copyright (c) 2020-2021 Picorims

//EXPORTING THE PROJECT INTO A VIDEO || RENDERER PROCESS PART (completely excluded from main window process)

let path = require("path");

let received_data;
let screen;//HTML screen element
let audio_file_path;
let PCM_data, sample_rate, duration;
//var offline_context, offline_analyser, offline_source, offline_freq_data, audio_rendered;
let frames_to_render, frames_rendered;
let export_array;
let event;

var progress_window;//progress bar

//callback to the main window that the renderer windows exists
function ConfirmCreation() {
    imports.utils.CustomLog("debug","renderer created");

    //confirm that the window exists when it is ready
    ipcRenderer.sendTo(1, "renderer-exists");
    InitRender();
}


function InitRender() {//render initialization

    imports.utils.CustomLog("debug","initialization of the renderer.");
    screen = document.getElementById("screen");

    //collecting needed data
    ipcRenderer.once("data-sent", (event, data) => {//once avoid the listener to be persistent (if it was,
                                                    //on window re-open, a new listener would stack upon this
                                                    //one, making multiple process stacking on forever.
        imports.utils.CustomLog("debug","received data from the main renderer.");
        received_data = data;
        InitExport(data);

    });
}





async function InitExport(data) {//prepare video export
    if (imports.utils === null) { //wait for modules to load.
        imports.utils.CustomLog("debug","Waiting for modules to load...");
        setTimeout(() => InitExport(data), 500);
        return;
    }
    if (!imports.utils.IsAnObject(data)) throw "InitExport: invalid data provided!";

    working_dir = await ipcRenderer.invoke('get-working-dir');
    os = await ipcRenderer.invoke('get-os');
    root_dir = await ipcRenderer.invoke('get-app-root');

    //SCREEN SETUP
    screen.style.width = project.save_handler.save_data.screen.width + "px";
    screen.style.height = project.save_handler.save_data.screen.height + "px";

    //adapt window size to screen
    await ipcRenderer.invoke('resize-export-window', project.save_handler.save_data.screen.width, project.save_handler.save_data.screen.height);




    //LOAD SAVE
    project.save_handler.save_data = data.save;
    project.save_handler.applyLoadedSave();
    imports.utils.CustomLog("debug","save loaded into the renderer");





    //LOAD AUDIO FROM TEMP FILE LEGACY WAY
    // audio_file_path;
    // switch (data.audio_file_type) {
    //     case "audio/mp3":
    //     case "audio/mpeg":
    //         audio_file_path = path.join(working_dir, "/temp/temp.mp3");//.. because __dirname goes in /html.
    //         break;


    //     case "audio/wav":
    //     case "audio/x-wav":
    //         audio_file_path = path.join(working_dir, "/temp/temp.wav");
    //         break;


    //     case "application/ogg":
    //         audio_file_path = path.join(working_dir, "/temp/temp.ogg");
    //         break;

    //     default:
    //         throw `InitExport: ${type} is not a valid audio type!`;
    // }
    // imports.utils.CustomLog("debug",`locating audio: ${audio_file_path}`);

    
    
    //LOAD AUDIO FROM TEMP FILE
    audio_file_path = path.join(working_dir, `/temp/temp.${data.audio_file_extension}`);
    imports.utils.CustomLog("debug",`using audio: ${audio_file_path}`);




    //EVENTS
    event = {
        render_loop: new Event("render-loop"),
    }






    //PROCESS AUDIO
    imports.utils.CustomLog("debug","processing audio...");
    GetAudioData();
}








function GetAudioData() {//Transform the audio temp file into PCM data, use FFT on it to get the waveform for each frame.

    //GET BUFFER FROM THE AUDIO FILE. Cf. function definition.
    GetAudioBuffer(function(audio_buffer) {

        duration = audio_buffer.duration;      //time
        sample_rate = audio_buffer.sampleRate; //number of samples (one value) per second

        //STEREO FUSION TO A SINGLE INTERLEAVED PCM ARRAY

        // Float32Array samples
        const [left, right] =  [audio_buffer.getChannelData(0), audio_buffer.getChannelData(1)];

        // interleaved
        const interleaved = new Float32Array(left.length + right.length);
        for (let src=0, dst=0; src < left.length; src++, dst+=2) {
            interleaved[dst] =   left[src];
            interleaved[dst+1] = right[src];
        }

        PCM_data = interleaved;

        imports.utils.CustomLog("debug","audio processed. Preparing to render...");
        PrepareRendering(duration);
    });

}




function GetAudioBuffer(callback) {//get the buffer array from the audio file
    if (imports.utils.IsUndefined(callback)) throw `GetAudioBuffer: Please provide a callback.`

    //setup
    var context = new AudioContext();

    //file url
    var url = audio_file_path.replace(/\\/g,"/");
    imports.utils.CustomLog("debug", `audio source: ${url}`);

    //get buffer
    fetch(url)
        .then(response => response.blob()) // Gets the response and returns it as a blob
        .then(blob => {
            new Response(blob).arrayBuffer().then(function(result) {//converts to array buffer
                array_buffer = result;

                context.decodeAudioData(array_buffer, function(decoded_buffer) {//converts to audio buffer
                    callback(decoded_buffer);//return data

                }, function() {throw "GetAudioBuffer: audio decoding has failed."});

            });
        });


}















function PrepareRendering() {//define important variables

    //FPS PREPARATION
    frame_count = 0;
    export_array = [0, duration];//from when to when in seconds to export, based on audio length.
    //export_array = [0,10];
    //interval type: [x,y[

    //SPECTRUM STORAGE USED BY THE OBJECTS
    project.frequency_array = [];

    imports.utils.CustomLog("info","renderer ready, starting...");

    StartRendering(project.save_handler.save_data.fps);
}





function StartRendering(fps) {//prepare rendering
    // initialize the timer variables and start the animation
    if (!imports.utils.IsANumber(fps)) throw `StartRendering: ${fps} is not a valid fps value, rendering aborted.`;

    frames_to_render = Math.floor((export_array[1] - export_array[0]) * fps);
    frames_rendered = 0;

    document.addEventListener("render-loop", Render);
    Render();
}




async function Render() {//render every frame into an image

    //if frame ready (all objects finished rendering)
    if ( project.updateFinished() ) {

        //update progress display
        imports.utils.CustomLog("info",`rendered: ${frames_rendered}/${frames_to_render}`);
        ipcRenderer.sendTo(1, "export-progress", frames_to_render, frames_rendered);

        //if there is still frames to draw
        if (frames_rendered < frames_to_render) {

            //the previous frame is rendered only now because the render of this one is now finished (UpdateFinished = true). it wasn't the case before
            await ipcRenderer.invoke('export-screen', {width: project.save_handler.save_data.screen.width, height: project.save_handler.save_data.screen.height, top:0, left:0}, `frame${frames_rendered}`, received_data.use_jpeg);

            //get waveform data
            var length = 8192;//output is length/2
            var waveform = new Float32Array(length);
            var current_time = frames_rendered/project.save_handler.save_data.fps;
            var center_point = Math.floor(current_time*sample_rate*2); //2 channels in PCM_data, pos in seconds -> pos in samples

            //take a portion of the PCM data
            for (var i = center_point-(length/2), j=0 ; i < center_point+(length/2); i++, j++) {
                waveform[j] = (i >= 0)? PCM_data[i] : 0;
            }

            //get spectrum
            var spectrum = await ipcRenderer.invoke('pcm-to-spectrum', waveform);

            //scale from 0-1 to 0-255 (used format in the Web Audio API because of Int8Array)
            project.frequency_array = [];
            for (var i=0; i<spectrum.length; i++) {
                project.addToFrequencyArray( (1 - Math.exp(-32*spectrum[i])) * 255 );//(amplification with ceiling) * (scale to 0-255)
            }
            project.frequency_array = imports.utils.MappedArray(project.frequency_array, 1024, 0, 1023); //TEMP FIX FOR EXPORT VISUALIZATION. Ideally, visualization should work no matter the array size.
            project.frequency_array = imports.utils.LinearToLog(project.frequency_array);
            //console.log(project.frequency_array);

            //Draw the new frame now that the previous finished exporting .
            //render frame, recall loop
            imports.utils.CustomLog("info",`audio time: ${current_time}`);
            project.drawFrame();
            frames_rendered++;
            document.dispatchEvent(event.render_loop);



        }//if all frames have been rendered and this is the last frame to export, stop the loop and export the last frame
        else {

            await ipcRenderer.invoke('export-screen', {width: project.save_handler.save_data.screen.width, height: project.save_handler.save_data.screen.height, top:0, left:0}, `frame${frames_rendered}`, received_data.use_jpeg);

            document.removeEventListener("render-loop", Render);
            ipcRenderer.sendTo(1, "frames-rendered");
            var data = received_data;
            var export_duration = export_array[1] - export_array[0];
            ipcRenderer.invoke("create-video", project.save_handler.save_data.screen, data.audio_file_type, project.save_handler.save_data.fps, export_duration, data.output_path, received_data.use_jpeg)
            .then( () => {
                imports.utils.CustomLog("info","shutting down the renderer...");
                window.close();
            })
            .catch( (error) => {
                imports.utils.CustomLog("error",`The video encoding failed: ${error}`);
                alert(`The video encoding failed. For more information, see the logs.\n\n${error}`);
                window.close();
            });

        }

    } else {
        document.dispatchEvent(event.render_loop);
    }


}