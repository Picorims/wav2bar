//MIT License - Copyright (c) 2020 Picorims

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
function InitUI() {

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
        help: document.getElementById("help_tab"),
    }



    //TAB LABELS
    tab_label = {
        project: document.getElementById("project_label"),
        objects: document.getElementById("objects_label"),
        export: document.getElementById("export_label"),
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
    document.getElementById("audio_file_input").onchange = function() {
        console.log(this.files[0]);
        if (this.files[0]) LoadAudio(this.files[0], 'file');
    }

    //import save
    document.getElementById("save_file_input").onchange = function() {
        if (this.files[0]) LoadSave(this.files[0]);
    }

    //export save
    document.getElementById("export_save_button").onclick = function() {
        ExportSaveAsJSON();
    }




    //OBJECTS TAB
    //create object
    document.getElementById("create_object_button").onclick = function() {
        CreateObject();
    }




    //EXPORT TAB
    //export
    document.getElementById("export_button").onclick = function() { Export(); }




    //HELP AND INFO TAB
    document.getElementById("website_link").onclick = function() { main.OpenInBrowser("https://picorims.github.io/wav2bar-website"); }
    document.getElementById("github_link").onclick = function() { main.OpenInBrowser("https://github.com/Picorims/audio-visualizer-creator"); }
    document.getElementById("twitter_link").onclick = function() { main.OpenInBrowser("https://twitter.com/Picorims"); }
    document.getElementById("youtube_link").onclick = function() { main.OpenInBrowser("https://www.youtube.com/channel/UCf15T29ZZ5RxQcbS9onQq9A"); }
    document.getElementById("discord_link").onclick = function() { main.OpenInBrowser("https://discord.gg/EVGzfdP"); }



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
    help = main.ReadJSONFile("./assets/help/help.json");

    var elements = document.getElementsByClassName("panel_param_container");

    for (var i=0; i<elements.length; i++) {
        var help_node = elements[i].getAttribute("data-help");

        switch (help_node) {
            case "fps":         AppendHelp(elements[i], help.parameter.screen.fps); break;
            case "screen_size": AppendHelp(elements[i], help.parameter.screen.size); break;
            case "audio":       AppendHelp(elements[i], help.audio.import); break;
            case "save_import": AppendHelp(elements[i], help.save.import); break;
            case "save_export": AppendHelp(elements[i], help.save.export); break;
            case "new_object":  AppendHelp(elements[i], help.parameter.object.general.creation); break;
            case "export":      AppendHelp(elements[i], help.export.action); break;
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
    //title container
    var title_container = document.createElement("div");
    container.appendChild(title_container);
    title_container.classList.add("object_param_title");
    
    //icon in the title_container
    var icon = document.createElement("span");
    title_container.appendChild(icon);

    //name of the title_container
    var title = document.createElement("span");
    title_container.appendChild(title);
    title.innerHTML = obj_data.name;
    
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
    container.appendChild(arrow);
    arrow.innerHTML = '<i class="ri-arrow-right-s-line"></i>';
    arrow.classList.add("object_param_arrow");

    //deletion cross
    var cross = document.createElement("div");
    container.appendChild(cross);
    cross.innerHTML = '<i class="ri-close-circle-fill"></i>';
    cross.classList.add("object_param_cross");

    //edit button
    var edit = document.createElement("div");
    container.appendChild(edit);
    edit.innerHTML = '<i class="ri-pencil-fill"></i>';
    edit.classList.add("object_param_edit");


    //ability to open and close the object parameters' container
    title_container.onclick = function() {
        ToggleOpen(this);
    }
    arrow.onclick = function() {
        ToggleOpen(this);
    }
    //defaults to closed
    ToggleOpen(title_container);

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
function ToggleOpen(title_container) {
    if (!IsAnElement(title_container)) throw "ToggleOpen: the argument is not a DOM element.";
    
    var parent = title_container.parentNode; //the container
    var closed = parent.getAttribute("data-closed");
    
    if (closed === "true") {
        parent.classList.remove("object_param_closed");
        parent.setAttribute("data-closed", "false");
    }
    else {
        parent.classList.add("object_param_closed");
        parent.setAttribute("data-closed", "true");
    }
}




//function to add a parameter to an object parameter container
function AddParameter(args, callback) {
    if (!IsAString(args.object_id)) throw `AddParameter: ${args.object_id} is not a valid ID.`;
    
    if ( (args.type!=="string") && (args.type!=="value") && (args.type!=="value-xy") && (args.type!=="choice") && (args.type!=="checkbox") ) {
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
             * min: value,
             * max: value,
             * step: value,
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
        break



        case "value":
            /**settings:
             * default: value,
             * min: value,
             * max: value,
             * step: value,
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
        break



        case "value-xy":
            /**settings:
             * default_x: value,
             * default_y: value,
             * min: value,
             * max: value,
             * step: value,
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
        break



        case "choice":
            /**settings:
             * default: value;
             * list:[option1, option2, ...] (strings)
             */

            //element
            var list = document.createElement("select");
            param_container.appendChild(list);
            list.classList.add("panel_input", "panel_input_list");
            list.value = args.settings.default;

            //options
            for (var i=0; i< args.settings.list.length; i++) {
                var option = document.createElement("option");
                list.appendChild(option);
                option.innerHTML = args.settings.list[i];
                option.value = args.settings.list[i];
            }
            
            //function
            list.oninput = function() {
                callback(args.object_id, list.value);
            }
        break



        case "checkbox":
            /**settings:
             * default: value;
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
        break



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

    var tmp_input_id = "input" + Math.floor(performance.now());

    //create elements
    var container = document.createElement("div");
    document.body.appendChild(container);
    container.classList.add("dialog_box", "sticky_dialog");

    var msg = document.createElement("span");
    container.appendChild(msg);
    msg.innerHTML = message;

    var input = document.createElement("input");
    container.appendChild(input);
    input.classList.add("panel_input", "panel_input_string", "dialog_input");
    input.id = tmp_input_id;

    var cancel_button = document.createElement("button");
    container.appendChild(cancel_button);
    cancel_button.classList.add("panel_button", "dialog_button");
    cancel_button.innerHTML = "Cancel";
    cancel_button.onclick = function() {
        this.parentElement.remove();
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
        this.parentElement.remove();
    }

    //centering (once every element is created)
    container.style.left = window.innerWidth/2 - container.offsetWidth/2 + "px";
    container.style.top = window.innerHeight/2 - container.offsetHeight/2 + "px";
}