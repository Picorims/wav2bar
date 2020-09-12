//MIT License - Copyright (c) 2020 Picorims

//EXPORTING THE PROJECT INTO A VIDEO || RENDERER PROCESS PART (completely excluded from main window process)

const { remote, ipcRenderer } = require("electron");
var path = require("path");
var main = remote.require("./main");


var received_data;
var screen;//HTML screen element
var audio_file_path;
var PCM_data, sample_rate, duration;
//var offline_context, offline_analyser, offline_source, offline_freq_data, audio_rendered;
var frames_to_render, frames_rendered;
var export_array;
var event;


//callback to the main window that the renderer windows exists
function ConfirmCreation() {
    console.log("renderer created");
    
    //confirm that the window exists when it is ready
    ipcRenderer.sendTo(1, "renderer-exists");
    InitRender();
}


function InitRender() {//render initialization

    console.log("initialization");
    screen = document.getElementById("screen");
    
    //collecting needed data
    ipcRenderer.once("data-sent", (event, data) => {//once avoid the listener to be persistent (if it was,
                                                    //on window re-open, a new listener would stack upon this
                                                    //one, making multiple process stacking on forever.
        console.log("received data: ", data);
        received_data = data;
        InitExport(data);
    
    });
}





function InitExport(data) {//prepare video export
    if (!IsAnObject(data)) throw "InitExport: invalid data provided!";

    //SCREEN SETUP
    screen.width = data.screen.width;
    screen.height = data.screen.height;
    screen.style.width = screen.width + "px";
    screen.style.height = screen.height + "px";

    //adapt window size to screen (if the screen is bigger than the user screen resolution,
    //the window will take the size of the user screen. Multiple screenshots will then be
    //required to render an entire frame)
    remote.getCurrentWindow().setSize(screen.width, screen.height);

    
    
    
    //LOAD SAVE
    current_save = data.save;
    ApplyLoadedSave("EXPORT");


    
    
    
    
    //LOAD AUDIO FROM TEMP FILE
    audio_file_path;
    switch (data.audio_file_type) {
        case "audio/mp3":
        case "audio/mpeg":
            audio_file_path = path.join(__dirname, "../temp/temp.mp3");//.. because __dirname goes in /html.
            break;


        case "audio/wav":
        case "audio/x-wav":
            audio_file_path = path.join(__dirname, "../temp/temp.wav");
            break;

        
        case "application/ogg":
            audio_file_path = path.join(__dirname, "../temp/temp.ogg");
            break;
        
        default:
            throw `InitExport: ${type} is not a valid audio type!`;
    }
    console.log("locating audio: ", audio_file_path);
    
    
    


    //EVENTS
    event = {
        render_loop: new Event("render-loop"),
    }




    

    //PROCESS AUDIO
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
        console.log(left, PCM_data);

        PrepareRendering(duration);
    });

}




function GetAudioBuffer(callback) {//get the buffer array from the audio file

    //setup
    var context = new AudioContext();
    
    //file url
    var url = audio_file_path.replace(/\\/g,"/");
    console.log(url);

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
    export_array = [0, 57];//from when to when in seconds to export, based on audio length.
    //interval type: [x,y[

    //SPECTRUM STORAGE USED BY THE OBJECTS
    frequency_array = [];

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




function Render() {//render every frame into an image

    //if frame ready (all objects finished rendering)
    if ( UpdateFinished() ) {

        console.log("rendered:",frames_rendered,"/",frames_to_render);

        //if there is still frames to draw
        if (frames_rendered < frames_to_render) {
    
            //the previous frame is rendered only now because the render of this one is now finished (UpdateFinished = true). it wasn't the case before
            main.ExportScreen({width: screen.width, height: screen.height, top:0, left:0}, `frame${frames_rendered}`, function() {
                frames_rendered++;
                console.log(frames_rendered);
                
                //get waveform data
                var length = 8192;//output is length/2
                var waveform = new Float32Array(length);
                var current_time = frames_rendered/60;
                var center_point = Math.floor(current_time*sample_rate*2); //2 channels in PCM_data

                //take a portion of the PCM data
                for (var i = center_point-(length/2), j=0 ; i < center_point+(length/2); i++, j++) {
                    waveform[j] = (i >= 0)? PCM_data[i] : 0;
                }

                //get spectrum
                var spectrum = main.PCMtoSpectrum(waveform);

                //scale from 0-1 to 0-255 (used format in the Web Audio API because of Int8Array)
                frequency_array = [];
                for (var i=0; i<spectrum.length; i++) {
                    frequency_array.push( (1 - Math.exp(-32*spectrum[i])) * 255 );//(amplification with ceiling) * (scale to 0-255) 
                }
                frequency_array = MappedArray(frequency_array, 1024, 0, 1023); //TEMP FIX FOR EXPORT VISUALIZATION
                frequency_array = LinearToLog(frequency_array);
                console.log(frequency_array);
                
                //Draw the new frame now that the previous finished exporting .     
                //render frame, recall loop 
                console.log("audio time:",current_time);
                RenderFrame();
                document.dispatchEvent(event.render_loop);

            });

    
        }//if all frames have been rendered and this is the last frame to export, stop the loop and export the last frame
        else {
            
            main.ExportScreen({width: screen.width, height: screen.height, top:0, left:0}, `frame${frames_rendered}`, function() {
                document.removeEventListener("render-loop", Render);
                var data = received_data;
                var export_duration = export_array[1] - export_array[0];
                main.CreateVideo(data.screen, data.audio_file_type, fps, export_duration);
            });
            
        }

    } else {
        document.dispatchEvent(event.render_loop);
    }


}






function RenderFrame() {//render one frame
    
    //#################
    //AUDIO CALCULATION
    //#################

    //time update
    current_time = frames_rendered/60;
    audio_duration = duration;

    //volume update
    volume = 0;
    var sum = 0;
    for (var i=0; i<frequency_array.length-100; i++) {
        sum += frequency_array[i];
    }
    volume = sum/(frequency_array.length-100); //0 to 120 most of the time


    //update all objects
    objects_callback = [];
    for (var i=0; i<objects.length; i++) {
        objects_callback[i] = false;
        objects_callback[i] = objects[i].update();
    }
   
    
    //end of a frame

}