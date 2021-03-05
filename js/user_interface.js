//MIT License - Copyright (c) 2020-2021 Picorims

//USER INTERFACE PROCESS (CONTROL PANEL INCLUDED)

var control_panel, screen_interface, screen;//MAIN HTML ELEMENTS

var tab;//all tabs
var tab_label;//all tab labels

var zoom;//screen zoom value
var zoom_index;//selected zoom
var zoom_list;//list of allowed zoom values

var audio_range_update;//setInterval that updates audio range
var audio_range_used;//if the user uses the range
var audio_time_update;//setInterval that updates audio time display

var help; //help strings



/*
##############
INITIALIZATION
##############
*/

//user interface initialization
async function InitUI() {

    //DISPLAY VERSION
    document.title = document.title + " " + software_version;
    document.getElementById("software_version").innerHTML = `${software_version} ${software_status}`;

    //HTML DEFINITIONS
    control_panel = document.getElementById("control_panel");
    screen_interface = document.getElementById("interface");
    screen = document.getElementById("screen");

    //SCREEN SIZE
    //short syntax for the program
    screen.width = 1280;
    screen.height = 720;
    //apply it
    screen.style.width = screen.width+"px";
    screen.style.height = screen.height+"px";

    //TABS
    tab = {
        project: document.getElementById("project_tab"),
        objects: document.getElementById("objects_tab"),
        export: document.getElementById("export_tab"),
        settings: document.getElementById("settings_tab"),
        help: document.getElementById("help_tab"),
    }



    //TAB LABELS
    tab_label = {
        project: document.getElementById("project_label"),
        objects: document.getElementById("objects_label"),
        export: document.getElementById("export_label"),
        settings: document.getElementById("settings_label"),
        help: document.getElementById("help_label"),
    }

    tab_label.project.onclick = function() {
        HideAnyTab();
        ShowTab(tab.project, tab_label.project);
    }
    tab_label.objects.onclick = function() {
        HideAnyTab();
        ShowTab(tab.objects, tab_label.objects);
    }
    tab_label.export.onclick = function() {
        HideAnyTab();
        ShowTab(tab.export, tab_label.export);
    }
    tab_label.settings.onclick = function() {
        HideAnyTab();
        ShowTab(tab.settings, tab_label.settings);
    }
    tab_label.help.onclick = function() {
        HideAnyTab();
        ShowTab(tab.help, tab_label.help);
    }




    //TABS INITIALIZATION
    HideAnyTab();
    ShowTab(tab.project, tab_label.project);




    //PROJECT TAB
    //fps selection
    document.getElementById("fps_input").value = fps;
    document.getElementById("fps_input").oninput = function() {
        ChangeFPSTo(parseInt(this.value));
    }

    //screen width
    document.getElementById("screen_width_input").value = screen.width;
    document.getElementById("screen_width_input").oninput = function() {
        SetScreenTo(parseInt(this.value), screen.height);

    }

    //screen height
    document.getElementById("screen_height_input").value = screen.height;
    document.getElementById("screen_height_input").oninput = function() {
        SetScreenTo(screen.width, parseInt(this.value));
    }

    //import audio
    document.getElementById("load_audio_button").onclick = function() {
        FileBrowserDialog({
            type: "get_file",
            allowed_extensions: ["wav","mp3","ogg"],
        }, function(result) {
            SaveAudio(result);
        });
    }

    //import save
    document.getElementById("save_file_button").onclick = function() {
        FileBrowserDialog({
            type: "get_file",
            allowed_extensions:["w2bzip"],
        }, function(result) {
            LoadSave(result);
        });
    }

    //export save
    document.getElementById("export_save_button").onclick = function() {
        FileBrowserDialog({
            type: 'save_file',
            allowed_extensions:["w2bzip"],
        }, function(result) {
            ExportSave(result);
        });
    }




    //OBJECTS TAB
    //create object
    document.getElementById("create_object_button").onclick = function() {
        CreateObject();
    }




    //EXPORT TAB
    //choose video path through file browser
    document.getElementById("choose_video_path_button").onclick = function() {
        FileBrowserDialog({
            type: "save_file",
            allowed_extensions: ["mp4"]
        }, function(result) {
            document.getElementById("video_export_path_input").value = result;
        });
    }

    //export
    document.getElementById("export_button").onclick = async function() {
        let input_value = document.getElementById("video_export_path_input").value
        if (input_value == "") {
            MessageDialog("info","please specify the video output path.");
        } else if (!await ipcRenderer.invoke("path-exists",settings.ffmpeg.ffmpeg_path)
                || !await ipcRenderer.invoke("path-exists",settings.ffmpeg.ffprobe_path) ) {
            MessageDialog("error","FFmpeg and/or FFprobe have an invalid path, or it is missing.");
        } else {
            Export(input_value);
        }
    }





    //SETTINGS TAB
    await InitSettings();
    //choose ffmpeg path through file browser
    document.getElementById("choose_ffmpeg_path_button").onclick = function() {
        FileBrowserDialog({
            type: "get_file",
            allowed_extensions: ["#any"]
        }, function(result) {
            setFFmpegPath(result);
        });
    }
    document.getElementById("ffmpeg_path_input").oninput = function() {
        setFFmpegPath(this.value);
    }

    //choose ffprobe path through file browser
    document.getElementById("choose_ffprobe_path_button").onclick = function() {
        FileBrowserDialog({
            type: "get_file",
            allowed_extensions: ["#any"]
        }, function(result) {
            setFFprobePath(result);
        });
    }
    document.getElementById("ffprobe_path_input").oninput = function() {
        setFFprobePath(this.value);
    }


    //open recommended location for FFmpeg and FFprobe
    document.getElementById("open_ffmpeg_folder").onclick = function() {
        ipcRenderer.invoke("open-folder-in-file-explorer", "./ffmpeg/");
    }



    //HELP AND INFO TAB
    document.getElementById("website_link").onclick = function() { ipcRenderer.invoke("open-in-browser", "https://picorims.github.io/wav2bar-website"); }
    document.getElementById("github_link").onclick = function() { ipcRenderer.invoke("open-in-browser", "https://github.com/Picorims/audio-visualizer-creator"); }
    document.getElementById("twitter_link").onclick = function() { ipcRenderer.invoke("open-in-browser", "https://twitter.com/Picorims"); }
    document.getElementById("youtube_link").onclick = function() { ipcRenderer.invoke("open-in-browser", "https://www.youtube.com/channel/UCf15T29ZZ5RxQcbS9onQq9A"); }
    document.getElementById("discord_link").onclick = function() { ipcRenderer.invoke("open-in-browser", "https://discord.gg/EVGzfdP"); }



    //ZOOM UI
    zoom = 1;
    zoom_index = 5; //1
    zoom_list = [0.1, 0.2, 0.4, 0.6, 0.8, 1, 1.2, 1.4, 1.6, 1.8, 2.0, 2.5, 3.0];
    var zoom_disp = document.getElementById("zoom_display");
    zoom_disp.innerHTML = `${Math.round(zoom*100)}%`;

    //zoom out
    document.getElementById("zoom_out").onclick = function() {
        if (zoom_index > 0) {
            zoom_index--;
            zoom = zoom_list[zoom_index];
        }
        ApplyZoom(zoom);
        zoom_disp.innerHTML = `${Math.round(zoom*100)}%`;
    }

    //zoom in
    document.getElementById("zoom_in").onclick = function() {
        if (zoom_index < zoom_list.length-1) {
            zoom_index++;
            zoom = zoom_list[zoom_index];
        }
        ApplyZoom(zoom);
        zoom_disp.innerHTML = `${Math.round(zoom*100)}%`;
    }

    //choose zoom
    document.getElementById("zoom_value").onclick = function() {
        CreateZoomMenu();
    }






    //HELP UI
    //apply help to existing parameters not generated.
    help = await ipcRenderer.invoke("read-json-file", "./assets/help/help.json");

    var elements = document.getElementsByClassName("panel_param_container");

    for (var i=0; i<elements.length; i++) {
        var help_node = elements[i].getAttribute("data-help");

        switch (help_node) {
            case "fps":                 AppendHelp(elements[i], help.parameter.screen.fps); break;
            case "screen_size":         AppendHelp(elements[i], help.parameter.screen.size); break;
            case "audio":               AppendHelp(elements[i], help.audio.import); break;
            case "save_import":         AppendHelp(elements[i], help.save.import); break;
            case "save_export":         AppendHelp(elements[i], help.save.export); break;
            case "new_object":          AppendHelp(elements[i], help.parameter.object.general.creation); break;
            case "export_video_path":   AppendHelp(elements[i], help.export.video_path); break;
            case "export":              AppendHelp(elements[i], help.export.action); break;
            default: break;
        }
    }





    //RESPONSIVE INTERFACE
    setInterval(LoopUI, 100);
}












/*
####
LOOP
####
*/
function LoopUI() {//UI responsive update


    //###########################
    //CSS POSITIONS RECALCULATION
    //###########################
    //HTML elements dimension and margins recalculation to make the page responsive


    //screen interface
    var interface_padding = window.getComputedStyle(screen_interface).getPropertyValue("padding-left"); //padding-left defined trough "padding" is only accessible that way!
    var interface_padding_value = parseInt( interface_padding.replace("px","") );

    screen_interface.style.width = ( window.innerWidth - control_panel.offsetWidth - (interface_padding_value*2) ) + "px";
    screen_interface.style.height = ( window.innerHeight - (interface_padding_value*2) )+"px";
    screen_interface.style.top = 0;
    screen_interface.style.left = control_panel.offsetWidth+"px";

    //fix the inner space of the interface containing the screen
    var extra_space = 100;
    var screen_border = parseInt( window.getComputedStyle(screen).getPropertyValue("border-width").replace("px","") );
    var screen_width  = (screen.width + screen_border*2)  * zoom;
    var screen_height = (screen.height + screen_border*2) * zoom;

    var inner_spacing_width  = screen_width  + (2*extra_space);
    var inner_spacing_height = screen_height + (2*extra_space)
    document.getElementById("inner_spacing_fixer").style.width  = inner_spacing_width  + "px";
    document.getElementById("inner_spacing_fixer").style.height = inner_spacing_height + "px";

    screen.style.left = (screen_width   < screen_interface.offsetWidth)?  screen_interface.offsetWidth/2  - screen_width/2  + "px" : extra_space + "px";
    screen.style.top  = (screen_height  < screen_interface.offsetHeight)? screen_interface.offsetHeight/2 - screen_height/2 + "px" : extra_space + "px";

}













/*
###############
SHOW / HIDE TAB
###############
*/

//hides any tab shown
function HideAnyTab() {
    for (i of Object.keys(tab) ) {
        tab[i].style.left = -1000+"px";
        tab[i].style.display = "none";
        tab_label[i].classList.remove("selected_tab");
    }
}

//show the tab given in parameter
function ShowTab(tab, tab_label) {
    if (!IsAnElement(tab)) throw "ShowTab: tab isn't a DOM element.";
    if (!IsAnElement(tab_label)) throw "ShowTab: tab_label isn't a DOM element.";

    tab.style.left = 0;
    tab.style.display = "inline-block";
    tab_label.classList.add("selected_tab");
}







/*
######
SCREEN
######
*/

function SetScreenTo(width, height) {//changes the screen size to the given values
    if(!IsAnInt(width)) throw `SetScreenTo: ${width} is not an integer.`;
    if(!IsAnInt(height)) throw `SetScreenTo: ${width} is not an integer.`;

    //update screen
    screen.width = width;
    screen.height = height;
    screen.style.width = width+"px";
    screen.style.height = height+"px";

    //update background size
    for (var i=0; i<objects.length; i++) {
        if (objects[i].data.object_type === "background") {
            objects[i].update();
        }
    }

    //update UI
    if (!export_mode) {
        document.getElementById("screen_width_input").value = screen.width;
        document.getElementById("screen_height_input").value = screen.height;
    }

    CustomLog("info",`screen set to ${width}x${height}`);
}



function ChangeFPSTo(new_fps) {//changes the FPS used by restarting the animation with the right FPS
    //error check
    if (!IsAnInt(new_fps)) throw `ChangeFPSto: ${new_fps} is not an integer or a valid FPS value.`;

    //trigger update
    fps = new_fps;
    StopAnimating();
    if (audio && !audio.paused) StartAnimating(new_fps);

    //update UI
    if (!export_mode) document.getElementById("fps_input").value = fps;

    CustomLog("info",`FPS set to ${new_fps}`);
}









/*
####
ZOOM
####
*/

//creates a dropdown menu to choose the zoom
function CreateZoomMenu() {
    var zoom_value = document.getElementById("zoom_value");

    //create all options as a dropdown menu
    for (var i=0; i< zoom_list.length; i++) {
        //element
        var zoom_option = document.createElement("div");
        document.getElementById("top_UI").appendChild( zoom_option );
        zoom_option.classList.add("dropdown_option", "zoom_option");

        //position
        var btn_pos = zoom_value.getBoundingClientRect();
        var option_height = zoom_option.getBoundingClientRect().height;
        zoom_option.style.top = `${btn_pos.top + btn_pos.height + option_height*i }px`;
        zoom_option.style.left = `${btn_pos.left}px`;

        //value
        zoom_option.innerHTML = `${ zoom_list[i]*100 }%`;
        zoom_option.setAttribute("data-zoom-index", i);

        //action
        zoom_option.onclick = function() {

            //apply
            zoom_index = parseFloat( this.getAttribute("data-zoom-index") );
            ApplyZoom(zoom_list[zoom_index]);
            KillZoomMenu();

            //display
            var zoom_disp = document.getElementById("zoom_display");
            zoom_disp.innerHTML = `${Math.round(zoom*100)}%`;
        };


    }

    //close if the user clicks elsewhere
    setTimeout(() => {window.onclick = function() {
        KillZoomMenu();
        window.onclick = null;
    }},100);

}

//destroy the menu created below
function KillZoomMenu() {
    var elements = document.getElementsByClassName("zoom_option");
    var elements = [...elements];//unlink the array from live count by replacing it by a clone of it

    for (var i=0; i < elements.length; i++) {
        elements[i].remove();
    }
}

//function that apply to the screen the zoom given in the control_panel.
function ApplyZoom(zoom_value) {
    if (!IsANumber(zoom_value)) throw `ApplyZoom: ${zoom_value} is not a valid zoom value.`;

    zoom = zoom_value;
    screen.style.transformOrigin = "0 0";
    screen.style.transform = `scale(${zoom})`;

    CustomLog("info",`Zoom changed to ${zoom_value}`);
}









/*
#############
AUDIO CONTROL
#############
*/

//this function is called by the function LoadAudio() which load audio files.
//it cannot be called by the global UI initialization because of the access to the audio process,
//which has to be created with an audio file.

//it initialize the audio control at the top of the screen
function SetupAudioUI() {
    //DOM elements (range excluded)
    var play_audio = document.getElementById("play_audio");
    var pause_audio = document.getElementById("pause_audio");
    var stop_audio = document.getElementById("stop_audio");
    var audio_to_start = document.getElementById("audio_to_start");
    var audio_to_end = document.getElementById("audio_to_end");
    var loop_audio = document.getElementById("loop_audio");

    //DISPLAY TITLE OF LOADED AUDIO
    document.getElementById("opened_audio").innerHTML = current_save.audio_filename;

    //PLAY
    play_audio.onclick = function() {
        if (!animating) StartAnimating(fps);
        audio.play();

        //update visuals
        play_audio.classList.add("activated");
        pause_audio.classList.remove("activated");
        stop_audio.classList.remove("activated");
    };


    //PAUSE
    pause_audio.onclick = function() {
        if (animating) StopAnimating();
        audio.pause();

        //update visuals
        play_audio.classList.remove("activated");
        pause_audio.classList.add("activated");
        stop_audio.classList.remove("activated");
    }


    //STOP
    stop_audio.onclick = function() {
        if (animating) StopAnimating();
        audio.pause();
        audio.currentTime = 0;

        //update visuals
        play_audio.classList.remove("activated");
        pause_audio.classList.remove("activated");
        stop_audio.classList.add("activated");
    }


    //TO START
    audio_to_start.onclick = function() {
        audio.currentTime = 0;
    }


    //TO END
    audio_to_end.onclick = function() {
        audio.currentTime = audio.duration;
    }


    //LOOP
    audio.loop = false;
    loop_audio.onclick = function() {
        audio.loop = (audio.loop) ?  false : true;

        //update visuals
        loop_audio.classList.toggle("activated");
    }


    //RANGE
    //init
    var audio_range = document.getElementById("audio_range");
    audio_range.min = 0;
    var wait_for_audio_ready = setInterval(function() {//seek required to not get a NaN value
        if (audio.readyState === 4) {
            audio_range.max = audio.duration;
            clearInterval(wait_for_audio_ready);
        }
    }, 10);

    //know if it is used
    audio_range.onmousedown = function() {
        audio_range_used = true;
    }
    audio_range.onmouseup = function() {
        audio_range_used = false;
    }

    //position update
    if (!audio_range_update) {
        audio_range_update = setInterval(UpdateAudioRange, 200);
    }

    //ability to change audio_position
    audio_range.oninput = function() {
        audio.currentTime = audio_range.value;
    }


    //TIME DISPLAY
    if (!audio_time_update) {
        audio_time_update = setInterval(UpdateTimeDisplay, 200);
    }

}

//updates the cursor position of the audio range input to match the audio position
function UpdateAudioRange() {
    if (!audio_range_used) {
        var audio_range = document.getElementById("audio_range");
        audio_range.value = audio.currentTime;
    }
}

//update the string indicating the time position
function UpdateTimeDisplay() {

    //find elapsed time
    var time_pos_sec = Math.floor(audio.currentTime)%60;
    if (time_pos_sec < 10) time_pos_sec = "0"+time_pos_sec;
    var time_pos_min = Math.floor(audio.currentTime/60);

    //find total time
    var time_length_sec = Math.floor(audio.duration)%60;
    if (time_length_sec < 10) time_length_sec = "0"+time_length_sec;
    var time_length_min = Math.floor(audio.duration/60);

    //apply time
    document.getElementById("time_display").innerHTML = `${time_pos_min}:${time_pos_sec} | ${time_length_min}:${time_length_sec}`;


    //if both are equal, update display to indicates it's not playing anymore (if not loop mode)
    if ( (audio.currentTime === audio.duration) && !audio.loop ) {
        document.getElementById("play_audio").classList.remove("activated");
        document.getElementById("pause_audio").classList.add("activated");
    }
}















/*
###############
OBJECT CREATION
###############
*/

//function that creates an object using the given parameters
function CreateObject() {

    //get name
    var name = document.getElementById("create_object_input").value;

    //get type
    var type = document.getElementById("create_object_select").value;

    //create object
    switch (type) {
        case "background":
            new Background({name: name});
            break;

        case "image":
            new Image({name: name});
            break;

        case "particle_flow":
            new ParticleFlow({name: name});
            break;

        case "text":
            new Text({name: name});
            break;




        case "timer_bar":
            new Timer({name: name, type:"bar"});
            break;

        case "timer_point":
            new Timer({name: name, type:"point"});
            break;





        case "visualizer_straight":
            new Visualizer({name: name, type:"straight"});
            break;

        case "visualizer_straight_wave":
            new Visualizer({name: name, type:"straight-wave"});
            break;

        case "visualizer_circular":
            new Visualizer({name: name, type:"circular"});
            break;

        default:
            throw `CreateObject: ${type} is an unknown object type!`;

    }

}















/*
############################
OBJECTS PARAMETER CONTAINERS
############################
*/

//function that creates an object container with no parameters, ready for an object with the given ID.
function CreateObjectContainer(object_id) {
    if (!IsAString(object_id)) throw `CreateObjectContainer: ${object_id} is not a valid ID.`;

    //CREATE ELEMENT
    var container = document.createElement("div");
    tab.objects.appendChild(container);

    //CONFIGURE ELEMENT
    container.id = `UI-${object_id}`;
    container.classList.add("object_param_container");
    container.setAttribute("data-closed", "false");//custom attribute to know if the object container is closed

    //GET OBJECT
    var obj_data = object_method.getByID(object_id).data;

    //ADD SUB ELEMENTS
    //banner
    var banner = document.createElement("div");
    container.appendChild(banner);
    banner.classList.add("object_param_banner");

    //title container
    var title_container = document.createElement("div");
    banner.appendChild(title_container);
    title_container.classList.add("object_param_title");

    //name of the title_container
    var title = document.createElement("span");
    title_container.appendChild(title);
    title.innerHTML = obj_data.name;

    //icon in the title_container
    var icon = document.createElement("div");
    banner.appendChild(icon);
    icon.classList.add("object_param_icon", "object_param_type");

    //assign icon related to object type
    switch (obj_data.object_type) {
        case "background":
            icon.innerHTML = '<i class="ri-landscape-fill"></i>';
            break;

        case "image":
            icon.innerHTML = '<i class="ri-image-fill"></i>';
            break;

        case "particle_flow":
            icon.innerHTML = '<i class="ri-loader-line"></i>';
            break;

        case "text":
            icon.innerHTML = '<i class="ri-text"></i>';
            break;

        case "timer":
            icon.innerHTML = '<i class="ri-timer-2-line"></i>';
            break;

        case "visualizer":
            icon.innerHTML = '<i class="ri-rhythm-line"></i>';
            break;

        default:
            throw `CreateObjectContainer: ${obj_data.object_type} is an unknown object type!`;
    }

    //arrow
    var arrow = document.createElement("div");
    banner.appendChild(arrow);
    arrow.innerHTML = '<i class="ri-arrow-right-s-line"></i>';
    arrow.classList.add("object_param_icon", "object_param_arrow");

    //deletion cross
    var cross = document.createElement("div");
    banner.appendChild(cross);
    cross.innerHTML = '<i class="ri-close-circle-fill"></i>';
    cross.classList.add("object_param_icon", "object_param_cross");

    //edit button
    var edit = document.createElement("div");
    banner.appendChild(edit);
    edit.innerHTML = '<i class="ri-pencil-fill"></i>';
    edit.classList.add("object_param_icon", "object_param_edit");


    //ability to open and close the object parameters' container
    title_container.onclick = function() {
        ToggleOpen(container);
    }
    arrow.onclick = function() {
        ToggleOpen(container);
    }
    //defaults to closed
    ToggleOpen(container);

    //object deletion
    cross.onclick = function() {
        object_method.getByID(object_id).remove(object_id);
        //NOTE: this also deletes this container.
    }

    //object renaming
    edit.onclick = function() {
        InputDialog("Enter a new name for the object:", function(result, args) {

            object_method.getByID(args[0]).updateData({id: args[0], name: result});
            args[1].innerHTML = result;

        }, [object_id, title]); //passed arguments
    }
}


//function that opens or closes an object container
function ToggleOpen(DOM_container) {
    if (!IsAnElement(DOM_container)) throw "ToggleOpen: the argument is not a DOM element.";

    var closed = DOM_container.getAttribute("data-closed");

    if (closed === "true") {
        DOM_container.classList.remove("object_param_closed");
        DOM_container.setAttribute("data-closed", "false");
    }
    else {
        DOM_container.classList.add("object_param_closed");
        DOM_container.setAttribute("data-closed", "true");
    }
}




//function to add a parameter to an object parameter container
/**args {
 *  object_id: uuid,
 *  type: string|value|value-xy|choice|checkbox|background-picker,
 *  settings: {cf mode settings},
 *  title: string,
 * }
 */
function AddParameter(args, callback) {
    if (!IsAString(args.object_id)) throw `AddParameter: ${args.object_id} is not a valid ID.`;

    if ( (args.type!=="string") && (args.type!=="value") && (args.type!=="value-xy") && (args.type!=="choice") && (args.type!=="checkbox") && (args.type!=="background-picker") ) {
        throw `AddParameter: ${args.type} is not a valid parameter type.`;
    }
    if (!IsAnObject(args.settings))    throw "AddParameter: The parameters provided aren't of type object.";
    if (!IsAString(args.title))          throw "AddParameter: The title must be a string!";
    if (IsUndefined(callback))      throw "AddParameter: Callback missing.";


    //CREATE ELEMENT
    var param_container = document.createElement("div");
    var parent = document.getElementById(`UI-${args.object_id}`);
    parent.appendChild(param_container);

    //CONFIGURE ELEMENT
    param_container.classList.add("panel_param_container");

    //ADD NAME
    var title_elt = document.createElement("span");
    param_container.appendChild(title_elt);
    title_elt.innerHTML = `${args.title}: `;


    //CONFIGURE TYPE
    switch (args.type) {
        case "string":
            /**settings:
             * default: value,
             */

            //element
            var input = document.createElement("input");
            param_container.appendChild(input);
            input.classList.add("panel_input", "panel_input_string");
            input.value = args.settings.default;

            //function
            input.oninput = function() {
                callback(args.object_id, input.value);
            }
        break;



        case "value":
            /**settings:
             * default: value,
             * min: value, (optional)
             * max: value, (optional)
             * step: value, (optional)
             */

            //element
            var input = document.createElement("input");
            param_container.appendChild(input);
            input.classList.add("panel_input", "panel_input");
            input.type = "number";
            input.value = args.settings.default;
            if ( !IsUndefined(args.settings.min) ) input.min = args.settings.min;
            if ( !IsUndefined(args.settings.max) ) input.max = args.settings.max;
            if ( !IsUndefined(args.settings.step) ) input.step = args.settings.step;

            //function
            input.oninput = function() {
                callback(args.object_id, parseFloat(input.value) );
            }
        break;



        case "value-xy":
            /**settings:
             * default_x: value,
             * default_y: value,
             * min: value, (optional)
             * max: value, (optional)
             * step: value, (optional)
             */

            //elements
            var input_container = document.createElement("div");
            param_container.appendChild(input_container);

            var input1 = document.createElement("input");
            input_container.appendChild(input1);
            input1.classList.add("panel_input", "panel_input");
            input1.type = "number";
            input1.value = args.settings.default_x;
            if ( !IsUndefined(args.settings.min) ) input1.min = args.settings.min;
            if ( !IsUndefined(args.settings.max) ) input1.max = args.settings.max;
            if ( !IsUndefined(args.settings.step) ) input1.step = args.settings.step;

            var input2 = document.createElement("input");
            input_container.appendChild(input2);
            input2.classList.add("panel_input", "panel_input");
            input2.type = "number";
            input2.value = args.settings.default_y;
            if ( !IsUndefined(args.settings.min) ) input2.min = args.settings.min;
            if ( !IsUndefined(args.settings.max) ) input2.max = args.settings.max;
            if ( !IsUndefined(args.settings.step) ) input2.step = args.settings.step;

            //functions
            input1.oninput = function() {
                callback(args.object_id, parseFloat(input1.value), parseFloat(input2.value) );
            }
            input2.oninput = function() {
                callback(args.object_id, parseFloat(input1.value), parseFloat(input2.value) );
            }
        break;



        case "choice":
            /**settings:
             * default: value;
             * list:[option1, option2, ...] (strings)
             */

            //element
            var list = document.createElement("select");
            param_container.appendChild(list);
            list.classList.add("panel_input", "panel_input_list");

            //options
            for (var i=0; i< args.settings.list.length; i++) {
                var option = document.createElement("option");
                list.appendChild(option);
                option.innerHTML = args.settings.list[i];
                option.value = args.settings.list[i];
            }
            list.value = args.settings.default;

            //function
            list.oninput = function() {
                callback(args.object_id, list.value);
            }
        break;



        case "checkbox":
            /**settings:
             * default: boolean;
             */

            //element
            var input = document.createElement("input");
            param_container.appendChild(input);
            input.classList.add("panel_input", "panel_input_checkbox");
            input.type = "checkbox";
            input.checked = args.settings.default;

            //function
            input.oninput = function() {
                callback(args.object_id, input.checked);
            }
        break;



        case "background-picker":
            /**settings:
             * default_color: value;
             * default_gradient: value;
             * default_image: value; (only filename!)
             * default_type: color|gradient|image;
             * default_size_type: cover|contain|scale_size_control|width_height_size_control,
             * default_size_x: value (string),
             * default_size_y: value (string),
             * size_min: value, (optional)
             * size_max: value, (optional)
             * size_step: value, (optional)
            */



            //event to trigger on main input when user change settings
            var input_event = new Event('input', {
                bubbles: true,
                cancelable: true,
            });



            //MAIN UI

            //mode picker
            var list = document.createElement("select");
            param_container.appendChild(list);
            list.classList.add("panel_input", "panel_input_list");

            //options
            let background_options = ["color","gradient","image"];
            for (let i = 0; i < background_options.length; i++) {
                let option = document.createElement("option");
                list.appendChild(option);
                option.innerHTML = background_options[i];
                option.value = background_options[i];
            }
            list.value = args.settings.default_type;

            //input for all modes
            var input = document.createElement("input");
            param_container.appendChild(input);
            input.classList.add("panel_input", "panel_input_string");
            switch (args.settings.default_type) {
                case "color": input.value = args.settings.default_color; break;
                case "gradient": input.value = args.settings.default_gradient; break;
                case "image": input.value = ""; break;
            }

            //image display
            //using a div make more sense, so it matches the behaviour of the screen,
            //that also uses a div to handle colors and gradients.
            var img_disp = document.createElement("div");
            param_container.appendChild(img_disp);
            img_disp.classList.add("panel_img_display");
            if (args.settings.default_image !== "") {
                img_disp.style.backgroundImage = `url(./temp/current_save/assets/${args.object_id}/background/${args.settings.default_image})`;
            }

            //image picker
            var img_picker = document.createElement("button");
            param_container.appendChild(img_picker);
            img_picker.classList.add("panel_button");
            img_picker.innerHTML = "BROWSE";

            img_picker.onclick = function() {
                FileBrowserDialog({
                    type: "get_file",
                    allowed_extensions: ["avif","jpg","jpeg","jfif","pjpeg","pjp","png","svg","webp","bmp","ico","cur"],
                    //source: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img
                }, async (result) => {
                    //copying file
                    let filename = result.replace(/^.*[\\\/]/, '');
                    let new_path = `./temp/current_save/assets/${args.object_id}/background/`;
                    
                    //is an image file already imported ?
                    let path_exists = await ipcRenderer.invoke("path-exists", new_path);
                    let image_exists;
                    if (path_exists) {
                        let image_dir_content = await ipcRenderer.invoke("read-dir", new_path);
                        image_exists = (image_dir_content.length !== 0);
                    } else {
                        image_exists = false;
                    }

                    //cache image in current save
                    if (image_exists) await ipcRenderer.invoke("empty-dir", new_path);
                        else await ipcRenderer.invoke("make-dir", new_path)
                    await ipcRenderer.invoke("copy-file", result, `${new_path}${filename}`);

                    //update display and keep new name in memory;
                    img_disp.style.backgroundImage = `url("${new_path}${filename}")`;
                    args.settings.default_image = filename;
                    console.log(img_disp.style.backgroundImage);

                    //update object
                    callback(args.object_id, list.value, filename);
                });
            }









            //BACKGROUND SIZE

            var size_title_elt = document.createElement("span");
            param_container.appendChild(size_title_elt);
            size_title_elt.innerHTML = "Background size: ";

            //size mode picker
            var bgnd_size_mode_list = document.createElement("select");
            param_container.appendChild(bgnd_size_mode_list);
            bgnd_size_mode_list.classList.add("panel_input", "panel_input_list");

            //options
            let background_size_options = ["contain","cover","scale_size_control","width_height_size_control"];
            for (let i = 0; i < background_size_options.length; i++) {
                let option = document.createElement("option");
                bgnd_size_mode_list.appendChild(option);
                option.innerHTML = background_size_options[i].split("_").join(" ");
                option.value = background_size_options[i];
            }
            bgnd_size_mode_list.value = args.settings.default_size_type;

            //size control by values
            var bgnd_size_inputs = document.createElement("div");
            param_container.appendChild(bgnd_size_inputs);

            var bgnd_size_input_div1 = document.createElement("div");
            bgnd_size_inputs.appendChild(bgnd_size_input_div1);
            bgnd_size_input_div1.style.display = (args.settings.default_size_type === "scale_size_control" || args.settings.default_size_type === "width_height_size_control")? "initial":"none";

            var bgnd_size_input_1 = document.createElement("input");
            bgnd_size_input_div1.appendChild(bgnd_size_input_1);
            bgnd_size_input_1.classList.add("panel_input", "panel_input");
            bgnd_size_input_1.type = "number";
            bgnd_size_input_1.value = args.settings.default_size_x;
            if ( !IsUndefined(args.settings.size_min) ) bgnd_size_input_1.min = args.settings.size_min;
            if ( !IsUndefined(args.settings.size_max) ) bgnd_size_input_1.max = args.settings.size_max;
            if ( !IsUndefined(args.settings.size_step) ) bgnd_size_input_1.step = args.settings.size_step;
            bgnd_size_input_1.oninput = function() {
                args.settings.default_size_x = this.value;
                //update background
                input.dispatchEvent(input_event);
            };

            var bgnd_size_input_1_unit = document.createElement("span");
            bgnd_size_input_div1.appendChild(bgnd_size_input_1_unit);
            bgnd_size_input_1_unit.innerHTML = "%";

            var bgnd_size_input_div2 = document.createElement("div");
            bgnd_size_inputs.appendChild(bgnd_size_input_div2);
            bgnd_size_input_div2.style.display = (args.settings.default_size_type === "width_height_size_control")? "initial":"none";

            var bgnd_size_input_2 = document.createElement("input");
            bgnd_size_input_div2.appendChild(bgnd_size_input_2);
            bgnd_size_input_2.classList.add("panel_input", "panel_input");
            bgnd_size_input_2.type = "number";
            bgnd_size_input_2.value = args.settings.default_size_y;
            if ( !IsUndefined(args.settings.size_min) ) bgnd_size_input_2.min = args.settings.size_min;
            if ( !IsUndefined(args.settings.size_max) ) bgnd_size_input_2.max = args.settings.size_max;
            if ( !IsUndefined(args.settings.size_step) ) bgnd_size_input_2.step = args.settings.size_step;
            bgnd_size_input_2.oninput = function() {
                args.settings.default_size_y = this.value;
                //update background
                input.dispatchEvent(input_event);
            };

            var bgnd_size_input_2_unit = document.createElement("span");
            bgnd_size_input_div2.appendChild(bgnd_size_input_2_unit);
            bgnd_size_input_2_unit.innerHTML = "%";




            //BACKGROUND REPEAT UI
            var repeat_x_div = document.createElement("div");
            param_container.appendChild(repeat_x_div);

            var repeat_x_title = document.createElement("span");
            repeat_x_div.appendChild(repeat_x_title);
            repeat_x_title.innerHTML = "Background repeat X: ";

            var repeat_x_input = document.createElement("input");
            repeat_x_div.appendChild(repeat_x_input);
            repeat_x_input.classList.add("panel_input", "panel_input_checkbox");
            repeat_x_input.type = "checkbox";
            repeat_x_input.checked = args.settings.default_repeat_x;

            var repeat_y_div = document.createElement("div");
            param_container.appendChild(repeat_y_div);

            var repeat_y_title = document.createElement("span");
            repeat_y_div.appendChild(repeat_y_title);
            repeat_y_title.innerHTML = "Background repeat Y: ";

            var repeat_y_input = document.createElement("input");
            repeat_y_div.appendChild(repeat_y_input);
            repeat_y_input.classList.add("panel_input", "panel_input_checkbox");
            repeat_y_input.type = "checkbox";
            repeat_y_input.checked = args.settings.default_repeat_y;

            repeat_x_input.oninput = repeat_y_input.oninput = function() {
                input.dispatchEvent(input_event);
            }




            //LIST FUNCTIONS

            //option choice
            let image_UI = [img_disp, img_picker, size_title_elt, bgnd_size_mode_list, bgnd_size_inputs, repeat_x_div, repeat_y_div];
            if (args.settings.default_type === "image") image_UI.forEach(element => element.style.display = "initial");
                else image_UI.forEach(element => element.style.display = "none");
            list.oninput = function() {
                //update UI
                switch (list.value) {
                    case "color":
                        input.style.display = "initial";
                        input.value = args.settings.default_color;
                        image_UI.forEach(element => element.style.display = "none");
                    break;
                    case "gradient":
                        input.style.display = "initial";
                        input.value = args.settings.default_gradient;
                        image_UI.forEach(element => element.style.display = "none");
                    break;
                    case "image":
                        input.style.display = "none";
                        input.value = "";
                        image_UI.forEach(element => element.style.display = "initial");
                    break;
                }

                //update background on type switch
                input.dispatchEvent(input_event);
            }

            //background size type choice
            bgnd_size_mode_list.oninput = function() {
                switch (bgnd_size_mode_list.value) {
                    case "cover":
                    case "contain":
                        bgnd_size_input_div1.style.display = "none";
                        bgnd_size_input_div2.style.display = "none";
                    break;
                    case "scale_size_control":
                        bgnd_size_input_div1.style.display = "initial";
                        bgnd_size_input_div2.style.display = "none";
                    break;
                    case "width_height_size_control":
                        bgnd_size_input_div1.style.display = "initial";
                        bgnd_size_input_div2.style.display = "initial";
                    break;
                }

                //update background on size type switch
                input.dispatchEvent(input_event);
            }


            //MAIN FUNCTION

            //function
            input.oninput = function() {
                if (list.value === "image") callback(args.object_id, list.value, args.settings.default_image, bgnd_size_mode_list.value, args.settings.default_size_x, args.settings.default_size_y, repeat_x_input.checked, repeat_y_input.checked);
                    else callback(args.object_id, list.value, input.value);

                //keep in memory the changes to when the users change of type, he gets back what he wrote.
                switch (list.value) {
                    case "color": args.settings.default_color = input.value; break;
                    case "gradient": args.settings.default_gradient = input.value; break;
                    //image changes managed by image picker button
                }
            }
        break;



        default:
            throw "AddParameter: no type specified for the parameter";
    }


    //APPEND HELP TO THE END
    AppendHelp(param_container, args.help);

}















/*
##################
HELP HOVER BUTTONS
##################
*/

//Append to a DOM element with the class ".panel_param_container" a question mark displaying the help.
//The path is indicated by the data-help attribute.
function AppendHelp(DOM_elt, help_string) {

    if( !IsAnElement(DOM_elt) ) throw `AppendHelp: ${DOM_elt} is not a DOM element.`;
    if (!IsAString(help_string) ) throw `AppendHelp: ${help_string} is not a string.`;

    //create help hover button
    var question_mark = document.createElement("div");
    DOM_elt.appendChild(question_mark);
    question_mark.className = "question_mark";
    question_mark.innerHTML = "<i class='ri-question-line'></i>";

    //help display
    question_mark.setAttribute("data-content", help_string);

    question_mark.onpointerenter = function() {
        this.setAttribute("data-hover", "true");

        //display delay
        setTimeout(DisplayHelpMsg(this), 1000);
    }

    question_mark.onpointerleave = function() {
        this.setAttribute("data-hover", "false");
        var msgs = document.getElementsByClassName("help_msg");

        for (var i=msgs.length-1; i>=0; i--) {
            msgs[i].remove();
        }
    }
}



//Display the help message linked to a question mark element of a parameter.
function DisplayHelpMsg(question_mark) {//display a help message at the given coordinates

    if( !IsAnElement(question_mark) ) throw `DisplayHelpMsg: ${question_mark} is not a DOM element.`;

    //only display if the pointer is on the question_mark
    if (question_mark.getAttribute("data-hover") === "true") {
        //msg container
        var msg = document.createElement("div");
        document.body.appendChild(msg);
        msg.classList.add("help_msg","dialog_box","fadein_dialog");
        msg.innerHTML = question_mark.getAttribute("data-content");

        //positioning
        var pos = question_mark.getBoundingClientRect();
        msg.style.top = `${pos.top + 30}px`;
        msg.style.left = `${pos.left + 30}px`;
    }

}
















/*
#######
DIALOGS
#######
*/

//Creates a dialog box with an input, a cancel button and a confirm button. Handle events.
//args allows for passing arguments to the callback.
function InputDialog(message, callback, args) {

    if ( !IsAString(message) ) throw `InputDialog: ${message} is not a string.`;
    if (IsUndefined(callback)) throw `InputDialog: callback missing!`;

    //create elements
    var background_container = document.createElement("div");
    document.body.appendChild(background_container);
    background_container.classList.add("background_dialog_container");

    var container = document.createElement("div");
    background_container.appendChild(container);
    container.classList.add("dialog_box", "sticky_dialog");

    var msg = document.createElement("span");
    container.appendChild(msg);
    msg.innerHTML = message;

    var tmp_input_id = "input" + Math.floor(performance.now());

    var input = document.createElement("input");
    container.appendChild(input);
    input.classList.add("panel_input", "panel_input_string", "dialog_input");
    input.id = tmp_input_id;

    var cancel_button = document.createElement("button");
    container.appendChild(cancel_button);
    cancel_button.classList.add("panel_button", "dialog_button");
    cancel_button.innerHTML = "Cancel";
    cancel_button.onclick = function() {
        background_container.remove();
    }

    var confirm_button = document.createElement("button");
    container.appendChild(confirm_button);
    confirm_button.classList.add("panel_button", "dialog_button");
    confirm_button.innerHTML = "Confirm";
    confirm_button.setAttribute("data-tmp-input-id", tmp_input_id);
    confirm_button.onclick = function() {
        var input = document.getElementById(this.getAttribute("data-tmp-input-id"));
        var result = input.value;
        callback(result, args);
        background_container.remove();
    }

}




//Creates a dialog box with a message. Handle events.
//args allows for passing arguments to the callback.
function MessageDialog(type, message, callback, args) {

    if ( !IsAString(type)    ) throw `MessageDialog: ${message} must be a string`;
    else if (type!=="info" && type!=="warn" && type!=="error" && type!=="confirm") throw `MessageDialog: ${message} must be "info", "warn" or "error"`;
    if ( !IsAString(message) ) throw `MessageDialog: ${message} is not a string.`;
    if (IsUndefined(callback) && type==="confirm") throw `MessageDialog: callback missing!`;

    //create elements
    var background_container = document.createElement("div");
    document.body.appendChild(background_container);
    background_container.classList.add("background_dialog_container");

    var container = document.createElement("div");
    background_container.appendChild(container);
    container.classList.add("dialog_box", "sticky_dialog");

    //title of the container
    var title = document.createElement("h1");
    container.appendChild(title);
    title.classList.add("dialog_title");
    title.innerHTML = type;

    var msg_container = document.createElement("div");
    container.appendChild(msg_container);
    msg_container.classList.add("dialog_msg_with_icon");

    //icon
    var icon = document.createElement("span");
    msg_container.appendChild(icon);
    icon.classList.add("dialog_big_icon");
    switch (type) {
        case "info":
            icon.innerHTML = '<i class="ri-information-line"></i>';
            icon.classList.add("blue");
            break;
        case "warn":
            icon.innerHTML = '<i class="ri-alert-line"></i>';
            icon.classList.add("blue");
            break;
        case "error":
            icon.innerHTML = '<i class="ri-error-warning-line"></i>';
            icon.classList.add("red");
            break;
        case "confirm":
            icon.innerHTML = '<i class="ri-question-line"></i>';
            icon.classList.add("blue");
            break;
    }

    //message
    var msg = document.createElement("p");
    msg_container.appendChild(msg);
    msg.innerHTML = message;

    //cancel and confirm action buttons
    if (type==="confirm") {
        var cancel_button = document.createElement("button");
        container.appendChild(cancel_button);
        cancel_button.classList.add("panel_button", "dialog_button");
        cancel_button.innerHTML = "Cancel";
        cancel_button.onclick = function() {
            background_container.remove();
            if (callback) callback(false, args);
        }
    }

    //button to close if not in confirm mode.
    var confirm_button = document.createElement("button");
    container.appendChild(confirm_button);
    confirm_button.classList.add("panel_button", "dialog_button");
    confirm_button.innerHTML = (type==="confirm")? "Confirm" : "OK";
    confirm_button.onclick = function() {
        if (callback) callback(true, args);
        background_container.remove();
    }

}


















/*
############
FILE BROWSER
############
*/

//Creates a file browser in-app, and the callback returns the selected path
//including the name of the file/folder.
//The extension is returned as well!
//"args" allows for passing arguments to the callback.
/*settings = {
    type: "get_file"|"get_directory"|"save_file";
    allowed_extensions: ["png", "json" , ...] || ["#any"] || ["#none"];
    display_hidden_files: true|false;
    show_disabled_files: true|false;
}*/
async function FileBrowserDialog(settings, callback, args) {
    if ( !IsAnObject(settings) ) throw `FileBrowserDialog: ${settings} is not an object.`;
    if (IsUndefined(callback)) throw `FileBrowserDialog: callback missing!`;

    //SETTINGS VERIFICATION

    //is undefined
    if (IsUndefined(settings.type)) throw `FileBrowserDialog: Dialog type required!`;
    if (IsUndefined(settings.allowed_extensions)) settings.allowed_extensions = ["#any"];
    if (IsUndefined(settings.display_hidden_files)) settings.display_hidden_files = false;
    if (IsUndefined(settings.show_disabled_files)) settings.show_disabled_files = false;

    //is invalid
    if (!IsUndefined(settings.type) && settings.type !== "get_file" && settings.type !== "get_directory" && settings.type !== "save_file") {
        throw `FileBrowserDialog: ${settings.type} dialog type is invalid! It must be get_file, get_directory, or save_file.`;
    }
    if (!IsUndefined(settings.allowed_extensions) && !IsAnArray(settings.allowed_extensions)) {
        throw `FileBrowserDialog: displayed extentions must be expressed as an array of strings, or ["#none"] or ["#any"].`;
    }
    for (let i=0; i<settings.allowed_extensions.length; i++) {
        if (!IsAString(settings.allowed_extensions[i])) throw `FileBrowserDialog: displayed extentions must be expressed as an array of strings, or ["#none"] or ["#any"].`;
    }
    if (!IsUndefined(settings.display_hidden_files) && !IsABoolean(settings.display_hidden_files)) {
        throw `FileBrowserDialog: display_hidden_files with value ${settings.display_hidden_files} must be a boolean value.`;
    }
    if (!IsUndefined(settings.show_disabled_files) && !IsABoolean(settings.show_disabled_files)) {
        throw `FileBrowserDialog: show_disabled_files with value ${settings.show_disabled_files} must be a boolean value.`;
    }


    //DIALOG CREATION

    //container
    var background_container = document.createElement("div");
    document.body.appendChild(background_container);
    background_container.classList.add("background_dialog_container");

    var container = document.createElement("div");
    background_container.appendChild(container);
    container.classList.add("dialog_box", "sticky_dialog");



    //title of the container
    var title = document.createElement("h1");
    container.appendChild(title);
    title.classList.add("dialog_title");
    title.innerHTML = settings.type.replace("_"," ");



    //top path input, followed by action buttons to the right
    var path_container = document.createElement("div");
    container.appendChild(path_container);
    path_container.classList.add("file_browser_flex_sub_container");

    var path_input = document.createElement("input");
    path_container.appendChild(path_input);
    path_input.classList.add("panel_input", "panel_input_string", "dialog_input", "file_browser_path_input");
    path_input.oninput = async () => {
        try {
            await FillTree(path_input.value, file_browser, path_input, name_input, settings);
        } catch (error) {
            CustomLog("error",`${path_input.value} do not exists: ${error}`);
        }
    }

    //go back button
    var go_back = document.createElement("div");
    path_container.appendChild(go_back);
    go_back.classList.add("file_browser_icon_button");
    go_back.innerHTML = '<i class="ri-arrow-left-circle-line"></i>';
    go_back.onclick = async () => {
        GoBackPrevDirectory(file_browser, path_input, name_input, settings);
    }

    //new folder button
    var new_folder = document.createElement("div");
    path_container.appendChild(new_folder);
    new_folder.classList.add("file_browser_icon_button");
    new_folder.innerHTML = '<i class="ri-folder-add-fill"></i>';
    new_folder.onclick = function () {
        //create folder
        InputDialog("Name of the directory:", async (name, path) => {
            var os = await ipcRenderer.invoke("get-os");
            if (os==="win32") await ipcRenderer.invoke('make-dir', `${path}\\${name}`);
            else await ipcRenderer.invoke('make-dir', `${path}/${name}`);

            var event = new Event('input', {
                bubbles: true,
                cancelable: true,
            });

            path_input.dispatchEvent(event);
        }, path_input.value.replace(/\\$/,"").replace(/\/$/,"")); //path
    }

    //home directory button
    var home_dir = document.createElement("div");
    path_container.appendChild(home_dir);
    home_dir.classList.add("file_browser_icon_button");
    home_dir.innerHTML = '<i class="ri-home-4-line"></i>';
    home_dir.onclick = async () => {
        //go to home directory
        var home_dir = await ipcRenderer.invoke('get-home-path');

        path_input.value = home_dir;

        var event = new Event('input', {
            bubbles: true,
            cancelable: true,
        });

        path_input.dispatchEvent(event);
    }



    //file browser itself
    var file_browser = document.createElement("div");
    container.appendChild(file_browser);
    file_browser.classList.add("file_browser_container");



    //bottom container for file selection
    var file_selection_container = document.createElement("div");
    container.appendChild(file_selection_container);
    file_selection_container.classList.add("file_browser_flex_sub_container");

    //check box to show not allowed files
    var checkbox_title = document.createElement("span");
    file_selection_container.appendChild(checkbox_title);
    checkbox_title.classList.add("file_browser_flex_span");
    checkbox_title.innerHTML = "Show disabled files : ";

    //show all files checkbox
    var show_all_files = document.createElement("input");
    file_selection_container.appendChild(show_all_files);
    show_all_files.classList.add("panel_input", "panel_input_checkbox");
    show_all_files.type = "checkbox";
    show_all_files.checked = false;
    show_all_files.onchange = function() {
        //show/hide disabled files
        settings.show_disabled_files = this.checked;

        var event = new Event('input', {
            bubbles: true,
            cancelable: true,
        });

        path_input.dispatchEvent(event);
    }

    //input for the name of the file
    var tmp_input_id = "input" + Math.floor(performance.now());

    var name_input = document.createElement("input");
    file_selection_container.appendChild(name_input);
    name_input.classList.add("panel_input", "panel_input_string", "dialog_input");
    name_input.placeholder = 'file or folder name';
    name_input.id = tmp_input_id;
    if (settings.type === "get_file" || settings.type === "get_directory") {
        name_input.disabled = "disabled"; //get file should not allow custom names that doesn't exists.
    }



    //cancel button
    var cancel_button = document.createElement("button");
    container.appendChild(cancel_button);
    cancel_button.classList.add("panel_button", "dialog_button");
    cancel_button.innerHTML = "Cancel";
    cancel_button.onclick = function() {
        background_container.remove();
    }

    //confirm button
    var confirm_button = document.createElement("button");
    container.appendChild(confirm_button);
    confirm_button.classList.add("panel_button", "dialog_button");
    confirm_button.innerHTML = "Confirm";
    confirm_button.setAttribute("data-tmp-input-id", tmp_input_id);
    confirm_button.onclick = async function() {

        var name_input = document.getElementById(this.getAttribute("data-tmp-input-id"));
        var extensions = settings.allowed_extensions;

        if ( settings.type === "save_file") {
            if (extensions[0] === "#none") {

                var regexp = new RegExp(/\..*$/,"g"); //has a dot with anything after it at the end of the path.
                if (regexp.test(name_input.value)) {
                    MessageDialog("warn","no extension allowed!")
                    return;

                }
            } else if (extensions[0] !== "#any") {
                if (!HasValidExtension(name_input.value, extensions)) {
                    MessageDialog("warn",`this extension is not allowed: use one in the following list:\n${extensions}`);
                    return;
                }
            }
        }

        //erase the potential / at the end of the path
        path_input.value = path_input.value.replace(/\\$/,"").replace(/\/$/,"");
        var result;
        var os = await ipcRenderer.invoke("get-os");
        if (settings.type === "get_directory") {
            result = path_input.value;
        } else if (os === "win32") {
            result = `${path_input.value}\\${name_input.value}`;
        } else {
            result = `${path_input.value}/${name_input.value}`;
        }

        callback(result, args);
        background_container.remove();
    }

    //first update of the file browser
    let homedir = await ipcRenderer.invoke('get-home-path');
    FillTree(homedir, file_browser, path_input, name_input, settings);
}


//function that go back one folder up in the file explorer
async function GoBackPrevDirectory(file_browser, path_input, name_input, settings) {
    // ".../love/whatever(/)" -> ".../love/"
    //erase the last directory in the path,
    //taking into account if there is a remaining / at the end of the string.
    //translation: /, then a string that do not contain a backslash, then maybe a /, then end of the line ==> become /.

    try {
        var os = await ipcRenderer.invoke("get-os");
        var path;
        if (os==="win32") path = path_input.value.replace(/\\[^\\]*\\?$/,"\\");
        else path = path_input.value.replace(/\/[^\/]*\/?$/,"\/");
        await FillTree(path, file_browser, path_input, name_input, settings);
    } catch (error) {
        CustomLog("error",`${path_input.value} do not exists: ${error}`);
    }
}


//function that takes a path and a DOM container (the file browser dialog container for files and folders)
//and generate the selection UI in it for the provided path
async function FillTree(path, container, path_input, name_input, settings) {

    //get directory content
    const files = await ipcRenderer.invoke('read-dir', path);
    //execution stops if the path do not exists.

    //separate files and folders, and only keep files matching settings
    var files_files = [];
    var files_directories = [];
    var extensions = settings.allowed_extensions;
    for (let i=0; i<files.length; i++) {

        files[i].disabled = false;

        //filter
        let can_push = true;
        if (files[i].type === "file") {

            if (extensions[0] === "#none") { //do not display any file
                if (!settings.show_disabled_files) {
                    can_push = false;
                } else {
                    files[i].disabled = true;
                }

            } else if (extensions[0] !== "#any") { //not set in display all files
                //do not display by default
                //can_push = false;

                //only display if the file has an extension that exists in the list of extensions to display.
                let valid = HasValidExtension(files[i].name, extensions);
                if (!settings.show_disabled_files) {
                    can_push = valid;
                } else if (!valid) {//&& show_disabled_files
                    files[i].disabled = true;
                }
            }

        }

        // filter hidden files
        if (!settings.display_hidden_files) {
            let regexp = /^\..*/;
            if (regexp.test(files[i].name)) can_push = false;
        }

        //organize
        if (can_push) {
            if (files[i].type === "directory") files_directories.push(files[i]);
            else if (files[i].type === "file") files_files.push(files[i]);
        }
    }
    var sorted_files = [{name:"..", type:"directory"}, ...files_directories, ...files_files];

    //delete previous UI
    var children = container.children;
    var count = children.length;
    for (let i=count-1; i>=0; i--) {
        children[i].remove();
    }

    //create UI
    for (let i=0; i<sorted_files.length; i++) {
        let file = sorted_files[i];
        if ( file.type !== "unknown") {//only display files and folders

            //element
            let item = document.createElement("span");
            container.appendChild(item);
            item.classList.add("file_browser_item");
            if (file.disabled) item.classList.add("file_browser_item_disabled");
            if (i%2 === 0) item.classList.add("contrast");

            //content
            let icon;
            if (file.type === "file") {
                if (getExtension(file.name) === "w2bzip") {
                    icon = '<i class="ri-save-3-fill"></i>';
                } else {
                    icon = '<i class="ri-file-fill icon_directory"></i>';
                }
            }
            else if (file.type === "directory") icon = '<i class="ri-folder-3-fill icon_file"></i>';
            else if (file.type === "locked_file") icon = '<i class="ri-lock-2-fill icon_file"></i>';
            item.innerHTML = `${icon} ${file.name}`;

            //event
            if (!file.disabled) {
                item.onclick = async () => {

                    if (file.type === "file") {

                        if (settings.type === "get_file" || settings.type === "save_file") {
                            //set file name to the file selected
                            name_input.value = file.name;
                        }

                    } else if (file.type === "directory") {
                        var os = await ipcRenderer.invoke("get-os");

                        //open directory
                        if (file.name !== "..") {
                            //erase the potential / at the end of the path
                            
                            path_input.value = path_input.value.replace(/\\$/,"").replace(/\/$/,"");
                            path_input.value += (os==="win32")? `\\${file.name}` : `/${file.name}`;

                            var event = new Event('input', {
                                bubbles: true,
                                cancelable: true,
                            });

                            path_input.dispatchEvent(event);

                            //sets the folder name to the selected directory.
                            if (settings.type === "get_directory") name_input.value = file.name;
                        } else {
                            GoBackPrevDirectory(container, path_input, name_input, settings)
                        }
                    }

                }
            }

        }
    }

    //update path
    path_input.value = path;
    path_input.scrollLeft = path_input.scrollWidth;
}



//function that tests if the provided file name matches the list of extensions. It returns false if none of the extensions matches.
//The dot mustn't be included!
function HasValidExtension(file_name, extensions_list) {
    if (!IsAString(file_name)) throw `HasValidExtension: the file name must be a string!`;
    if (!IsAnArray(extensions_list)) {
        throw `HasValidExtension: the extensions list must be an array!`;
    } else {
        for (let i=0; i<extensions_list; i++) {
            if (!IsAString(extensions_list[i])) throw `HasValidExtension: The extensions list must only be made of strings!`;
        }
    }

    var file_matches = false;
    file_name = file_name.toLowerCase();

    for (let i=0; i < extensions_list.length; i++) {
        let regexp = new RegExp(`\.${extensions_list[i].toLowerCase()}$`,"g"); // ends with .my_extension
        if (regexp.test(file_name)) file_matches = true;
    }

    return file_matches;
}


//give a file's extension. ex: test.txt -> "txt". ex2: test -> "".
function getExtension(file_name) {
    return file_name.substring(file_name.lastIndexOf('.')+1, file_name.length) || filename;
}