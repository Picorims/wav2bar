//MIT License - Copyright (c) 2020 Picorims

//EXPORTING THE PROJECT INTO A VIDEO || RENDERER PROCESS PART (completely excluded from main window process)

const { remote, ipcRenderer } = require("electron");
var path = require("path");
var main = remote.require("./main");


var received_data;
var screen;//HTML screen element
var audio_file_path;
var offline_context, offline_analyser, offline_source, offline_freq_data, audio_rendered;
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
    ApplyLoadedSave();


    
    
    
    
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
    LoadAudio(audio_file_path, "url");//is_offline = true (offline context)
    
    



    //EVENTS
    event = {
        render_loop: new Event("render-loop"),
    }



    //FPS PREPARATION
    frame_count = 0;
    fps_array = [];
    fps = 60;
    export_array = [0,10];//from when to when in seconds to export, based on audio length.
    //interval type: [x,y[

    

    //START RENDERING ONLY WHEN THE AUDIO IS FULLY READY TO BE PLAYED WITHOUT LATENCY
    SeekAudioReady();
}

function SeekAudioReady() {//what must be executed when the audio is ready to be played
    
    //Enough data is available—and the download rate is high enough—that the media
    //can be played through to the end without interruption.
    console.log(audio.readyState);
    if (audio.readyState === 4) {

        StartRendering(fps);
        
        
        /*
        ###############################
        OFFLINE CONTEXT EXPERIMENTATION
        ###############################
        */
        
        // //GET BUFFER FROM File() object of the song. Cf. function definition.
        // GetAudioBuffer(function(buffer) {
        //     console.log(buffer);

        //     //PREPARE AUDIO DATA COLLECTION
        //     //the array buffer must be transformed into an audio buffer to be read.
        //     context.decodeAudioData(buffer, function(audio_buffer) {
                
        //         //modules
        //         offline_context = new OfflineAudioContext(2, audio_buffer.length, 44100);//channels, length, sampleRate
        //         offline_analyser = offline_context.createAnalyser();
        //         offline_source = offline_context.createBufferSource();
        //         offline_source.buffer = audio_buffer;
                
        //         //connect modules
        //         offline_source.connect(offline_analyser);
        //         offline_source.connect(offline_context.destination);

        //         //prepare frequency array
        //         offline_freq_data = new Uint8Array(offline_analyser.frequencyBinCount);

        //         //render audio
        //         audio_rendered = false;
        //         offline_source.start(0);
                
        //         offline_context.startRendering();
        //         offline_context.oncomplete = function() {
        //             audio_rendered = true;
        //             console.log("done!");
        //         }

        //     });

            
        // });


    } else {
        setTimeout(SeekAudioReady, 100);
    }

}



function GetAudioBuffer(callback) {//get the buffer array from the audio_file File() object
        
        //file url
        var url = audio_file_path.replace(/\\/g,"/");
        console.log(url);
        
        //request
        var request = new XMLHttpRequest();

        request.open("GET", url, true);
        request.responceType = "arraybuffer";

        //when the request is completed
        request.onload = function() {
            //console.log(request.response);
        }

        request.send();
}





function StartRendering(fps) {//prepare rendering
    // initialize the timer variables and start the animation

    frames_to_render = (export_array[1] - export_array[0]) * fps;
    frames_rendered = 0;
    audio.currentTime = 0;//in SECONDS
    audio.play();

    document.addEventListener("render-loop", Render);
    Render();
}




function Render() {//render every frame into an image

    //if frame ready (all objects finished rendering)
    if ( UpdateFinished() ) {

        console.log(frames_to_render,"/",frames_rendered);

        //if there is still frames to draw
        if (frames_rendered < frames_to_render) {
    
            //the previous frame is rendered only now because the render of this one is now finished (UpdateFinished = true). it wasn't the case before
            main.ExportScreen({width: screen.width, height: screen.height, top:0, left:0}, `frame${frames_rendered}`, function() {
                frames_rendered++;
                console.log(frames_rendered);
                
                //prepare data collection at the targeted position
                audio.currentTime = frames_rendered * (1/fps); //1000/fps = one frame duration in ms. /1000 set it to seconds.
                //Draw the new frame now that the previous finished exporting
                context.resume().then(function() {
                    //collect frequency data (audio must be playing to get data from it)
                    analyser.getByteFrequencyData(frequency_array);
                    //stop audio from continuing to play to draw the frame for this position
                    context.suspend().then(function() {
                        
                        //render frame, recall loop 
                        console.log("audio time:",audio.currentTime);
                        RenderFrame();
                        document.dispatchEvent(event.render_loop);
                    
                    });
                });
                
            });

    
        }//if all frames have been rendered and this is the last frame to export, stop the loop and export the last frame
        else {
            
            main.ExportScreen({width: screen.width, height: screen.height, top:0, left:0}, `frame${frames_rendered}`, function() {
                document.removeEventListener("render-loop", Render);
                var data = received_data;
                main.CreateVideo(data.screen, data.audio_file_type);
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