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

//EXPORTING THE PROJECT INTO A VIDEO || RENDERER PROCESS PART (completely excluded from main window process)

/*globals imports, ipcRenderer, project, working_dir */

let path = require("path");

let received_data;
let screen;//HTML screen element
let audio_file_path;
let PCM_data, sample_rate, duration, channel_count;
//var offline_context, offline_analyser, offline_source, offline_freq_data, audio_rendered;
let frames_to_render, frames_rendered;
let export_array;
let event;

/**
 * callback to the main window that the renderer windows exists
 *
 */
// eslint-disable-next-line no-unused-vars
function ConfirmCreation() {
    imports.utils.CustomLog("debug","renderer created");

    //confirm that the window exists when it is ready
    ipcRenderer.sendTo(1, "renderer-exists");
    InitRender();
}

/**
 * Show information to the main GUI window. Previous text is overriden.
 * @param {string} str 
 */
function SendExportContext(str) {
    ipcRenderer.sendTo(1, "update-export-context", str);
}

/**
 * render initialization
 *
 */
function InitRender() {

    imports.utils.CustomLog("debug","initialization of the renderer.");
    screen = document.getElementById("screen");

    //collecting needed data
    //once avoid the listener to be persistent (if it was,
    //on window re-open, a new listener would stack upon this
    //one, making multiple process stacking on forever.
    ipcRenderer.once("data-sent", (event, data) => {
        imports.utils.CustomLog("debug","received data from the main renderer.");
        received_data = data;
        InitExport(data);

    });
}




/**
 * prepare video export
 *
 * @param {Object} data Everything needed to do the export.
 * @return {*} 
 */
async function InitExport(data) {
    if (imports.utils === null) { //wait for modules to load.
        imports.utils.CustomLog("debug","Waiting for modules to load...");
        setTimeout(() => InitExport(data), 500);
        return;
    }
    if (!imports.utils.IsAnObject(data)) throw "InitExport: invalid data provided!";



    //LOAD SAVE
    project.save_handler.save_data = data.save;
    project.save_handler.applyLoadedSave();
    imports.utils.CustomLog("debug","save loaded into the renderer");



    //SCREEN SETUP
    screen.style.width = project.save_handler.save_data.screen.width + "px";
    screen.style.height = project.save_handler.save_data.screen.height + "px";

    //adapt window size to screen
    await ipcRenderer.invoke("resize-export-window", project.save_handler.save_data.screen.width, project.save_handler.save_data.screen.height);



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
    };






    //PROCESS AUDIO
    imports.utils.CustomLog("debug","processing audio...");
    GetAudioData();
}







/**
 * Transform the audio temp file into PCM data, use FFT on it to get the waveform for each frame.
 *
 */
function GetAudioData() {

    //GET BUFFER FROM THE AUDIO FILE. Cf. function definition.
    GetAudioBuffer(function(audio_buffer) {

        duration = audio_buffer.duration;      //time
        sample_rate = audio_buffer.sampleRate; //number of samples (one value) per second
        channel_count = audio_buffer.numberOfChannels;

        //STEREO FUSION TO A SINGLE INTERLEAVED PCM ARRAY
        SendExportContext("Interleaving PCM data if needed (this might take a while for large stereo files)...");
        if (audio_buffer.numberOfChannels > 1) {
            // Float32Array samples
            const [left, right] =  [audio_buffer.getChannelData(0), audio_buffer.getChannelData(1)];

            // interleaved
            const interleaved = new Float32Array(left.length + right.length);
            for (let src=0, dst=0; src < left.length; src++, dst+=2) {
                interleaved[dst] =   left[src];
                interleaved[dst+1] = right[src];
            }

            PCM_data = interleaved;
        } else {
            PCM_data = audio_buffer.getChannelData(0);
        }


        

        imports.utils.CustomLog("debug","audio processed. Preparing to render...");
        PrepareRendering(duration);
    });

}



/**
 * get the buffer array from the audio file
 *
 * @param {Function} callback
 */
function GetAudioBuffer(callback) {
    if (imports.utils.IsUndefined(callback)) throw "GetAudioBuffer: Please provide a callback.";

    //setup
    var context = new AudioContext();

    //file url
    var url = audio_file_path.replace(/\\/g,"/");
    imports.utils.CustomLog("debug", `audio source: ${url}`);

    //get buffer
    SendExportContext("[BUFFER 1/4] Caching audio file in memory (this might take a while for large files)...");
    fetch(url)
        .then(response => {
            SendExportContext("[BUFFER 2/4] Converting to blob (this might take a while for large files)...");
            return response.blob();
        }) // Gets the response and returns it as a blob
        .then(blob => {
            SendExportContext("[BUFFER 3/4] Converting to array buffer (this might take a while for large files)...");
            new Response(blob).arrayBuffer().then(function(result) {//converts to array buffer
                let array_buffer = result;

                SendExportContext("[BUFFER 4/4] Decoding audio data (this might take a while for large files)...");
                context.decodeAudioData(array_buffer, function(decoded_buffer) {//converts to audio buffer
                    callback(decoded_buffer);//return data

                }, function() {throw "GetAudioBuffer: audio decoding has failed.";});

            });
        });


}














/**
 * define important variables
 *
 */
function PrepareRendering() {
    SendExportContext("Preparing rendering...");

    //FPS PREPARATION
    export_array = [0, duration];//from when to when in seconds to export, based on audio length.
    //export_array = [0,10];
    //interval type: [x,y[

    //SPECTRUM STORAGE USED BY THE OBJECTS
    project.frequency_array = [];

    imports.utils.CustomLog("info","renderer ready, starting...");

    StartRendering(project.save_handler.save_data.fps);
}




/**
 * prepare rendering
 *
 * @param {Number} fps The framerate to use.
 */
function StartRendering(fps) {
    // initialize the timer variables and start the animation
    if (!imports.utils.IsANumber(fps)) throw `StartRendering: ${fps} is not a valid fps value, rendering aborted.`;

    frames_to_render = Math.floor((export_array[1] - export_array[0]) * fps);
    frames_rendered = 0;

    SendExportContext("Rendering...");

    document.addEventListener("render-loop", Render);
    Render();
}



/**
 * render every frame into an image
 *
 */
async function Render() {

    //if frame ready (all objects finished rendering)
    if ( project.updateFinished() ) {

        //update progress display
        if (frames_rendered % 100 === 0 || frames_rendered >= frames_to_render) imports.utils.CustomLog("info",`rendered: ${frames_rendered}/${frames_to_render}`);
        ipcRenderer.sendTo(1, "export-progress", frames_to_render, frames_rendered);

        //if there is still frames to draw
        if (frames_rendered < frames_to_render) {

            //the previous frame is rendered only now because the render of this one is now finished (UpdateFinished = true). it wasn't the case before
            await ipcRenderer.invoke("export-screen", {width: project.save_handler.save_data.screen.width, height: project.save_handler.save_data.screen.height, top:0, left:0}, `frame${frames_rendered}`, received_data.use_jpeg, frames_rendered);

            //get waveform data
            var length = 8192;//output is length/2
            var waveform = new Float32Array(length);
            var current_time = frames_rendered/project.save_handler.save_data.fps;
            var center_point = Math.floor(current_time * sample_rate * channel_count); //2 channels in PCM_data, pos in seconds -> pos in samples

            //take a portion of the PCM data
            for (let i = center_point-(length/2), j=0 ; i < center_point+(length/2); i++, j++) {
                waveform[j] = (i >= 0)? PCM_data[i] : 0;
            }

            //get spectrum
            var spectrum = await ipcRenderer.invoke("pcm-to-spectrum", waveform);

            //scale from 0-1 to 0-255 (used format in the Web Audio API because of Int8Array)
            project.frequency_array = [];
            for (let i = 0; i < spectrum.length; i++) {
                project.addToFrequencyArray( (1 - Math.exp(-32*spectrum[i])) * 255 );//(amplification with ceiling) * (scale to 0-255)
            }
            project.frequency_array = imports.utils.MappedArray(project.frequency_array, 1024, 0, 1023); //TEMP FIX FOR EXPORT VISUALIZATION. Ideally, visualization should work no matter the array size.
            project.frequency_array = imports.utils.LinearToLog(project.frequency_array);
            //console.log(project.frequency_array);

            //Draw the new frame now that the previous finished exporting .
            //render frame, recall loop
            if (frames_rendered % 100 === 0) imports.utils.CustomLog("info",`audio time: ${current_time}`);
            project.drawFrame();
            frames_rendered++;
            document.dispatchEvent(event.render_loop);



        }//if all frames have been rendered and this is the last frame to export, stop the loop and export the last frame
        else {

            await ipcRenderer.invoke("export-screen", {width: project.save_handler.save_data.screen.width, height: project.save_handler.save_data.screen.height, top:0, left:0}, `frame${frames_rendered}`, received_data.use_jpeg, frames_rendered);

            document.removeEventListener("render-loop", Render);
            ipcRenderer.sendTo(1, "frames-rendered");
            var data = received_data;
            var export_duration = export_array[1] - export_array[0];
            SendExportContext("Encoding video...");
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