//MIT License - Copyright (c) 2020-2021 Picorims

//EXPORTING THE PROJECT INTO A VIDEO || RENDERER PROCESS PART (completely excluded from main window process)

var path = require("path");
var export_mode = true; //in export window

var received_data;
var screen;//HTML screen element
var audio_file_path;
var PCM_data, sample_rate, duration;
//var offline_context, offline_analyser, offline_source, offline_freq_data, audio_rendered;
var frames_to_render, frames_rendered;
var export_array;
var event;

var progress_window;//progress bar

//callback to the main window that the renderer windows exists
function ConfirmCreation() {
    CustomLog("debug","renderer created");

    //confirm that the window exists when it is ready
    ipcRenderer.sendTo(1, "renderer-exists");
    InitRender();
}


function InitRender() {//render initialization

    CustomLog("debug","initialization of the renderer.");
    screen = document.getElementById("screen");

    //collecting needed data
    ipcRenderer.once("data-sent", (event, data) => {//once avoid the listener to be persistent (if it was,
                                                    //on window re-open, a new listener would stack upon this
                                                    //one, making multiple process stacking on forever.
        CustomLog("debug","received data of the main renderer.");
        received_data = data;
        InitExport(data);

    });
}





async function InitExport(data) {//prepare video export
    if (!IsAnObject(data)) throw "InitExport: invalid data provided!";

    //SCREEN SETUP
    screen.width = data.screen.width;
    screen.height = data.screen.height;
    screen.style.width = screen.width + "px";
    screen.style.height = screen.height + "px";

    //adapt window size to screen (if the screen is bigger than the user screen resolution,
    //the window will take the size of the user screen. Multiple screenshots will then be
    //required to render an entire frame)
    //remote.getCurrentWindow().setSize(screen.width, screen.height);
    await ipcRenderer.invoke('resize-export-window', screen.width, screen.height);




    //LOAD SAVE
    current_save = data.save;
    ApplyLoadedSave();
    CustomLog("debug","save loaded into the renderer");





    //LOAD AUDIO FROM TEMP FILE LEGACY WAY
    // audio_file_path;
    // switch (data.audio_file_type) {
    //     case "audio/mp3":
    //     case "audio/mpeg":
    //         audio_file_path = path.join(__dirname, "../temp/temp.mp3");//.. because __dirname goes in /html.
    //         break;


    //     case "audio/wav":
    //     case "audio/x-wav":
    //         audio_file_path = path.join(__dirname, "../temp/temp.wav");
    //         break;


    //     case "application/ogg":
    //         audio_file_path = path.join(__dirname, "../temp/temp.ogg");
    //         break;

    //     default:
    //         throw `InitExport: ${type} is not a valid audio type!`;
    // }
    // CustomLog("debug",`locating audio: ${audio_file_path}`);

    
    
    //LOAD AUDIO FROM TEMP FILE
    audio_file_path = path.join(__dirname, `../temp/temp.${data.audio_file_extension}`);
    CustomLog("debug",`using audio: ${audio_file_path}`);




    //EVENTS
    event = {
        render_loop: new Event("render-loop"),
    }






    //PROCESS AUDIO
    CustomLog("debug","processing audio...");
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

        CustomLog("debug","audio processed. Preparing to render...");
        PrepareRendering(duration);
    });

}




function GetAudioBuffer(callback) {//get the buffer array from the audio file
    if (IsUndefined(callback)) throw `GetAudioBuffer: Please provide a callback.`

    //setup
    var context = new AudioContext();

    //file url
    var url = audio_file_path.replace(/\\/g,"/");
    CustomLog("debug", `audio source: ${url}`);

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
    fps = current_save.fps;
    export_array = [0, duration];//from when to when in seconds to export, based on audio length.
    //interval type: [x,y[

    //SPECTRUM STORAGE USED BY THE OBJECTS
    frequency_array = [];

    CustomLog("info","renderer ready, starting...");

    StartRendering(fps);
}





function StartRendering(fps) {//prepare rendering
    // initialize the timer variables and start the animation
    if (!IsANumber(fps)) throw `StartRendering: ${fps} is not a valid fps value, rendering aborted.`;

    frames_to_render = Math.floor((export_array[1] - export_array[0]) * fps);
    frames_rendered = 0;

    document.addEventListener("render-loop", Render);
    Render();
}




async function Render() {//render every frame into an image

    //if frame ready (all objects finished rendering)
    if ( UpdateFinished() ) {

        //update progress display
        CustomLog("info",`rendered: ${frames_rendered}/${frames_to_render}`);
        ipcRenderer.sendTo(1, "export-progress", frames_to_render, frames_rendered);

        //if there is still frames to draw
        if (frames_rendered < frames_to_render) {

            //the previous frame is rendered only now because the render of this one is now finished (UpdateFinished = true). it wasn't the case before
            await ipcRenderer.invoke('export-screen', {width: screen.width, height: screen.height, top:0, left:0}, `frame${frames_rendered}`);

            //get waveform data
            var length = 8192;//output is length/2
            var waveform = new Float32Array(length);
            var current_time = frames_rendered/fps;
            var center_point = Math.floor(current_time*sample_rate*2); //2 channels in PCM_data, pos in seconds -> pos in samples

            //take a portion of the PCM data
            for (var i = center_point-(length/2), j=0 ; i < center_point+(length/2); i++, j++) {
                waveform[j] = (i >= 0)? PCM_data[i] : 0;
            }

            //get spectrum
            var spectrum = await ipcRenderer.invoke('pcm-to-spectrum', waveform);

            //scale from 0-1 to 0-255 (used format in the Web Audio API because of Int8Array)
            frequency_array = [];
            for (var i=0; i<spectrum.length; i++) {
                frequency_array.push( (1 - Math.exp(-32*spectrum[i])) * 255 );//(amplification with ceiling) * (scale to 0-255)
            }
            frequency_array = MappedArray(frequency_array, 1024, 0, 1023); //TEMP FIX FOR EXPORT VISUALIZATION. Ideally, visualization should work no matter the array size.
            frequency_array = LinearToLog(frequency_array);
            //console.log(frequency_array);

            //Draw the new frame now that the previous finished exporting .
            //render frame, recall loop
            CustomLog("info",`audio time: ${current_time}`);
            DrawFrame();
            frames_rendered++;
            document.dispatchEvent(event.render_loop);



        }//if all frames have been rendered and this is the last frame to export, stop the loop and export the last frame
        else {

            await ipcRenderer.invoke('export-screen', {width: screen.width, height: screen.height, top:0, left:0}, `frame${frames_rendered}`);

            document.removeEventListener("render-loop", Render);
            ipcRenderer.sendTo(1, "frames-rendered");
            var data = received_data;
            var export_duration = export_array[1] - export_array[0];
            ipcRenderer.invoke("create-video", data.screen, data.audio_file_type, fps, export_duration, data.output_path)
            .then( () => {
                CustomLog("info","shutting down the renderer...");
                window.close();
            })
            .catch( (error) => {
                CustomLog("error",`The video encoding failed: ${error}`);
                alert(`The video encoding failed. For more information, see the logs.\n\n${error}`);
                window.close();
            });

        }

    } else {
        document.dispatchEvent(event.render_loop);
    }


}