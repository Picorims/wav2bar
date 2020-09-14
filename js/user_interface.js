//MIT License - Copyright (c) 2020 Picorims

//USER INTERFACE PROCESS (CONTROL PANEL INCLUDED)

var control_panel, screen_interface, screen;//MAIN HTML ELEMENTS

var tab;//all tabs
var tab_label;//all tab labels

var zoom;//screen zoom value

var audio_range_update;//setInterval that updates audio range
var audio_range_used;//if the user uses the range
var audio_time_update;//setInterval that updates audio time display




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




    //ZOOM UI
    zoom = 1;
    var zoom_disp = document.getElementById("zoom_display");
    zoom_disp.innerHTML = Math.round(zoom*100);
    
    //zoom out
    document.getElementById("zoom_out").onclick = function() {
        if (zoom >= 0.3) zoom -= 0.2;
        ApplyZoom(zoom);
        zoom_disp.innerHTML = Math.round(zoom*100);
    }

    //zoom in
    document.getElementById("zoom_in").onclick = function() {
        if (zoom < 1.9) zoom += 0.2;
        ApplyZoom(zoom);
        zoom_disp.innerHTML = Math.round(zoom*100);
    }

    //choose zoom
    document.getElementById("zoom_value").onclick = function() {
        CreateZoomMenu();
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

    
    //screen positioning
    var screen_margin_left = (screen_interface.offsetWidth/2) - (screen.width/2) - interface_padding_value;
    var screen_margin_top = (window.innerHeight/2) - (screen.height/2);
    
    screen.style.marginLeft = (screen_margin_left > 0) ? (screen_margin_left+"px") : "0px";
    screen.style.marginTop =  (screen_margin_top > 0)  ? (screen_margin_top+"px")  : "0px";


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
    var zoom_list = [0.1, 0.2, 0.4, 0.6, 0.8, 1, 1.2, 1.4, 1.6, 1.8, 2.0];
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
        
        //action
        zoom_option.onclick = function() {
            
            //apply
            var zoom_value = parseFloat( this.innerHTML.replace("%", "") ) / 100;
            ApplyZoom(zoom_value);
            KillZoomMenu();

            //display
            var zoom_disp = document.getElementById("zoom_display");
            zoom_disp.innerHTML = Math.round(zoom_value*100);

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

    //get ID
    var id = document.getElementById("create_object_input").value;
    if (id === "") {
        alert("please specify an ID. (keep it unique!)");
        return;
    } else {
        for (var i=0; i < objects.length; i++) {
            if (objects[i].data.id === id) {
                alert("This ID is already used!");
                return;
            }
        }
    }

    //get type
    var type = document.getElementById("create_object_select").value;

    //create object
    switch (type) {
        case "background":
            new Background({id:id});
            break;

        case "image":
            new Image({id:id});
            break;

        case "particle_flow":
            new ParticleFlow({id:id});
            break;

        case "text":
            new Text({id:id});
            break;




        case "timer_bar":
            new Timer({id:id, type:"bar"});
            break;

        case "timer_point":
            new Timer({id:id, type:"point"});
            break;





        case "visualizer_straight":
            new Visualizer({id:id, type:"straight"});
            break;

        case "visualizer_straight_wave":
            new Visualizer({id:id, type:"straight-wave"});
            break;

        case "visualizer_circular":
            new Visualizer({id:id, type:"circular"});
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
    container.id = `UI${object_id}`;
    container.classList.add("object_param_container");
    container.setAttribute("data-closed", "false");//custom attribute to know if the object container is closed


    //ADD SUB ELEMENTS
    //title container
    var title_container = document.createElement("div");
    container.appendChild(title_container);
    title_container.classList.add("object_param_title");
    title_container.innerHTML = object_id;
    var obj_type = object_method.getByID(object_id).data.object_type;
    switch (obj_type) {
        case "background":
            title_container.innerHTML = '<i class="fas fa-mountain"></i> ' + title_container.innerHTML;
            break;

        case "image":
            title_container.innerHTML = '<i class="fas fa-image"></i> ' + title_container.innerHTML;
            break;

        case "particle_flow":
            title_container.innerHTML = '<i class="fas fa-certificate"></i> ' + title_container.innerHTML;
            break;

        case "text":
            title_container.innerHTML = '<i class="fas fa-heading"></i> ' + title_container.innerHTML;
            break;

        case "timer":
            title_container.innerHTML = '<i class="fas fa-clock"></i> ' + title_container.innerHTML;
            break;

        case "visualizer":
            title_container.innerHTML = '<i class="fas fa-chart-bar"></i> ' + title_container.innerHTML;
            break;

        default:
            throw `CreateObjectContainer: ${obj_type} is an unknown object type!`;
    }

    //arrow
    var arrow = document.createElement("div");
    container.appendChild(arrow);
    arrow.innerHTML = '<i class="fas fa-angle-right"></i>';
    arrow.classList.add("object_param_arrow");

    //deletion cross
    var cross = document.createElement("div");
    container.appendChild(cross);
    cross.innerHTML = '<i class="fas fa-times-circle"></i>';
    cross.classList.add("object_param_cross");

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
function AddParameter(object_id, type, parameters, title, callback) {
    if (!IsAString(object_id)) throw `AddParameter: ${object_id} is not a valid ID.`;
    
    if ( (type!=="string") && (type!=="value") && (type!=="value-xy") && (type!=="choice") && (type!=="checkbox") ) {
        throw `AddParameter: ${type} is not a valid parameter type.`;
    }
    if (!IsAnObject(parameters))    throw "AddParameter: The parameters provided aren't of type object.";
    if (!IsAString(title))          throw "AddParameter: The title must be a string!";
    if (IsUndefined(callback))      throw "AddParameter: Callback missing.";

    
    //CREATE ELEMENT    
    var param_container = document.createElement("div");
    var parent = document.getElementById(`UI${object_id}`);
    parent.appendChild(param_container);

    //CONFIGURE ELEMENT
    param_container.classList.add("panel_param_container");

    //ADD NAME
    var title_elt = document.createElement("span");
    param_container.appendChild(title_elt);
    title_elt.innerHTML = `${title}: `;


    //CONFIGURE TYPE
    switch (type) {
        case "string":
            /**parameters:
             * default: value,
             * min: value,
             * max: value,
             * step: value,
             */

            //element
            var input = document.createElement("input");
            param_container.appendChild(input);
            input.classList.add("panel_input", "panel_input_string");
            input.value = parameters.default;
            
            //function
            input.oninput = function() {
                callback(object_id, input.value);
            }
        break



        case "value":
            /**parameters:
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
            input.value = parameters.default;
            if ( !IsUndefined(parameters.min) ) input.min = parameters.min;
            if ( !IsUndefined(parameters.max) ) input.max = parameters.max;
            if ( !IsUndefined(parameters.step) ) input.step = parameters.step;
            
            //function
            input.oninput = function() {
                callback(object_id, parseFloat(input.value) );
            }
        break



        case "value-xy":
            /**parameters:
             * default_x: value,
             * default_y: value,
             * min: value,
             * max: value,
             * step: value,
             */

            //elements
            var input1 = document.createElement("input");
            param_container.appendChild(input1);
            input1.classList.add("panel_input", "panel_input");
            input1.type = "number";
            input1.value = parameters.default_x;
            if ( !IsUndefined(parameters.min) ) input1.min = parameters.min;
            if ( !IsUndefined(parameters.max) ) input1.max = parameters.max;
            if ( !IsUndefined(parameters.step) ) input1.step = parameters.step;

            var input2 = document.createElement("input");
            param_container.appendChild(input2);
            input2.classList.add("panel_input", "panel_input");
            input2.type = "number";
            input2.value = parameters.default_y;
            if ( !IsUndefined(parameters.min) ) input2.min = parameters.min;
            if ( !IsUndefined(parameters.max) ) input2.max = parameters.max;
            if ( !IsUndefined(parameters.step) ) input2.step = parameters.step;
            
            //functions
            input1.oninput = function() {
                callback(object_id, parseFloat(input1.value), parseFloat(input2.value) );
            }
            input2.oninput = function() {
                callback(object_id, parseFloat(input1.value), parseFloat(input2.value) );
            }
        break



        case "choice":
            /**parameters:
             * default: value;
             * list:[option1, option2, ...] (strings)
             */

            //element
            var list = document.createElement("select");
            param_container.appendChild(list);
            list.classList.add("panel_input", "panel_input_list");
            list.value = parameters.default;

            //options
            for (var i=0; i< parameters.list.length; i++) {
                var option = document.createElement("option");
                list.appendChild(option);
                option.innerHTML = parameters.list[i];
                option.value = parameters.list[i];
            }
            
            //function
            list.oninput = function() {
                callback(object_id, list.value);
            }
        break



        case "checkbox":
            /**parameters:
             * default: value;
             */

            //element
            var input = document.createElement("input");
            param_container.appendChild(input);
            input.classList.add("panel_input", "panel_input_checkbox");
            input.type = "checkbox";
            input.checked = parameters.default;
            
            //function
            input.oninput = function() {
                callback(object_id, input.checked);
            }
        break



        default:
            throw "AddParameter: no type specified for the parameter";
    }

}