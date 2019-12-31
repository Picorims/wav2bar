//MIT License - Copyright (c) 2019 Picorims and Mischa

//MAIN PROCESS, PAGE INITIALIZATION

//NOTE - THIS WILL BE CLEANED UP LATER ON, WHEN CRAFTING THE OBJECT SYSTEM ENGINE

var control_panel, screen_interface, screen;//MAIN HTML ELEMENTS
var volume;
var objects = [];//all objects inside the screen


function InitPage() {//page initialization
    //HTML DEFINITIONS
    control_panel = document.getElementById("control_panel");
    screen_interface = document.getElementById("interface");
    screen = document.getElementById("screen");
    


    //SCREEN SIZE
    //short syntax
    screen.width = 1280;
    screen.height = 720;
    //apply it
    screen.style.width = screen.width+"px";
    screen.style.height = screen.height+"px";



    //AUDIO SETUP
    //modules
    audio = new Audio();
    context = new window.AudioContext();
    analyser = context.createAnalyser();

    //setup
    audio.src = "TheFatRat & Anjulie - Close To The Sun.mp3";
    source = context.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(context.destination);
    document.getElementById("start_button").onclick = function() { audio.play() };

    //prepare data collection
    frequency_array = new Uint8Array(analyser.frequencyBinCount);//0 to 1023 => length=1024.

    
    
    
    //LAUNCH TEMPLATE (temporary method!)
    Template();



    //LOOP LAUNCH
    AnimationLooper();
}




function ApplyZoom(zoom) {//function that apply to the screen the zoom given in the control_panel.
    screen.style.transformOrigin = "0 0";
    screen.style.transform = `scale(${zoom})`;
}



function AnimationLooper() {//animate the visualizer
    //#################
    //CSS RECALCULATION
    //#################
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




    
    
    //#################
    //AUDIO CALCULATION
    //#################


    //collect frequency data
    analyser.getByteFrequencyData(frequency_array);


    //volume update
    volume = 0;
    var sum = 0;
    for (var i=0; i<frequency_array.length-100; i++) {
        sum += frequency_array[i];
    }
    volume = sum/(frequency_array.length-100); //0 to 120 most of the time


    //update all objects
    for (var i=0; i<objects.length; i++) {
        objects[i].update();
    }
   
    
    //end of a frame
    window.requestAnimationFrame(AnimationLooper);
}