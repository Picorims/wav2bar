//MIT License - Copyright (c) 2020-2021 Picorims

import * as utils from "../utils/utils.js";
import * as property from "./visual_object_property.js";
import * as ui_components from "../ui_components/ui_components.js";

//base class for visual objects. They base themselves on their data from a SaveHandler
//to get and store data. If an id is provided, it inspects an existing data set.
//Otherwuse the data set is created.
/**@abstract */
export class VisualObject {
    constructor(save_handler, rack_parent, id = "") {
        if (this.constructor === VisualObject) throw new SyntaxError("VisualObjectProperty is an abstract class.");
        if (utils.IsUndefined(save_handler)) throw new SyntaxError("SaveHandler required as an argument for a VisualObject.");
        if (!utils.IsAnElement(rack_parent)) throw new SyntaxError("rack_parent must be a DOM parent for the rack.");

        this._save_handler = save_handler;
        this._owner_project = this._save_handler.owner_project;
        this._rack_parent = rack_parent;
        /**@type {Object.<property.VisualObjectProperty>} */
        this._properties = {};
        /**@type {HTMLElement} */
        this._element = null;
        this._id = id;
        this._TYPE = null, //defined by a visual object

        //register object in save
        //generates an id if none is provided
        this._save_handler.addVisualObject(this);




        //create category
        this._parameter_rack = new ui_components.UIParameterRack(
            this._rack_parent,
            `UI-${this._id}`,
            "",
            {
                default_closed: true,
                user_can_edit_name: false,
            }
        );
        //kill button action
        this._parameter_rack.delete_callback = () => {
            this._save_handler.deleteVisualObject(this._id);
        }





        //shared properties
        this._properties["name"] = new property.VPName(this._save_handler, this);
        this._properties["layer"] = new property.VPLayer(this._save_handler, this);
        this._properties["coordinates"] = new property.VPCoordinates(this._save_handler, this);
        this._properties["size"] = new property.VPSize(this._save_handler, this);
        this._properties["rotation"] = new property.VPRotation(this._save_handler, this);
        this._properties["svg_filter"] = new property.VPSVGFilter(this._save_handler, this);
    
        

        //svg filters
        this._svg_filter_div = document.createElement("div");
        document.body.appendChild(this._svg_filter_div);
        this._svg_filter_div.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' version='1.1'><defs></defs></svg>";        



        //shared data updates
        this._properties["layer"].subscribeToEvent("value_changed", (value) => {
            this._element.style.zIndex = value;
        });

        this._properties["coordinates"].subscribeToEvent("value_changed", (value) => {
            this._element.style.left = value.x + "px";
            this._element.style.top = value.y + "px";
        });

        this._properties["size"].subscribeToEvent("value_changed", (value) => {
            this._element.style.width = value.width + "px";
            this._element.style.height = value.height + "px";
        });

        this._properties["rotation"].subscribeToEvent("value_changed", (value) => {
            this._element.style.transform = `rotate(${value}deg)`;
        });

        this._properties["svg_filter"].subscribeToEvent("value_changed", (value) => {
            if (value !== "") {
                this._svg_filter_div.children[0].children[0].innerHTML = ""; //clear content

                let str = "";
                let filters = value.split("[#]");
                
                //load filters in DOM
                for (let i = 0; i < filters.length; i++) {
                    let id = `${this._id}-FILTER-${i}`;

                    //load filter
                    filters[i] = filters[i].replace(/id=".*?"/,"").replace("<filter",`<filter id="${id}"`);
                    this._svg_filter_div.children[0].children[0].innerHTML += filters[i];
                    
                    //add in css
                    let strToAdd = `url('#${id}')`;
                    str += strToAdd;
                    
                    //spacing
                    if (i < filters.length-1) str += " ";
                }

                //apply CSS
                this._element.style.filter = str;
            }
        });
    }

    get id() {return this._id;}
    get parameter_rack() {return this._parameter_rack;}

    getThisData() {return this._save_handler.save_data.objects[this._id]}

    //generate a UUID for the object
    generateID() {
        let id;
        do {
            id = utils.uuidv4();
        }
        while (!this.validID(id) || !this.uniqueID(id));

        this._id = id;
    }

    //validate an id to be an UUID.
    validID(id) {
        if (!utils.IsAString(id)) throw `${id} is not a string.`;
        
        return id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i) !== null;
    }

    //verify if the id exists in the save.
    uniqueID(id) {
        if (!utils.IsAString(id)) throw `${id} is not a string.`;
        
        let valid = true;
        let ids = this._save_handler.getVisualObjectIDs();
        ids.forEach(existing_id => {
            //if the ID is identical, then it is not valid.
            //(otherwise himself would be a false positive)
            if (existing_id === id) valid = false;            
        });
        return valid;
    }

    //sets the name of an object from the exterior
    setName(name) {
        this._properties["name"].rename(name);
    }

    //used by visual object constructors to defined their type as a string in save data
    setType(type) {
        if (this.getThisData().visual_object_type) throw new SyntaxError("Object type already set, no modification allowed.");
        this._save_handler.mergeVisualObjectData(this._id, {visual_object_type: type});
    }

    //write the type for a new visual object,
    //and make sure the read data come from an object of the same type.
    assertType() {
        if (!this.getThisData().visual_object_type) this.setType(this._TYPE);
        if (this.getThisData().visual_object_type !== this._TYPE) throw new Error(`Trying to access data from a non ${this._TYPE} object! Aborting initialization.`);
    }

    // trigger object data update, by triggering all visual properties.
    triggerUpdateData() {
        for (const key in this._properties) {
            if (Object.hasOwnProperty.call(this._properties, key)) {
                const property = this._properties[key];
                property.triggerEvent("value_changed", property.getCurrentValue());
            }
        }
    }

    //update object display
    /**@abstract */
    update() {
        throw new SyntaxError("VisualObject: update() must be implemented.");
    }

    //destroy VisualObject
    destroy() {
        if (this._element) this._element.remove();
    }
}

















//Visual Object to display customizable text. It can also display the time passing by.
export class VText extends VisualObject {
    constructor(save_handler, rack_parent, id = "") {
        super(save_handler, rack_parent, id);
        this._TYPE = "text";
        this.assertType();
        this._parameter_rack.icon = '<i class="ri-text"></i>';

        //#################
        //UNIQUE PROPERTIES
        //#################

        this._properties["text_type"] = new property.VPTextType(this._save_handler, this);
        this._properties["text_content"] = new property.VPTextContent(this._save_handler, this);
        this._properties["font_size"] = new property.VPFontSize(this._save_handler, this);
        this._properties["color"] = new property.VPColor(this._save_handler, this);
        this._properties["text_decoration"] = new property.VPTextDecoration(this._save_handler, this);
        this._properties["text_align"] = new property.VPTextAlign(this._save_handler, this);
        this._properties["text_shadow"] = new property.VPTextShadow(this._save_handler, this);


        //###################
        //CREATE HTML ELEMENT
        //###################

        //canvas or div depending of the context
        this._element = document.createElement("div");

        //basic parameters
        screen.appendChild(this._element);
        this._element.style.position = "absolute";
        this._element.style.display = "inline-block";
        this._element.style.overflowWrap = "break-word";
        

        //###########
        //UPDATE DATA
        //###########

        this._properties["text_content"].subscribeToEvent("value_changed", (value) => {
            this._element.innerHTML = value;
        });

        this._properties["font_size"].subscribeToEvent("value_changed", (value) => {
            this._element.style.fontSize = value + "px";
        });

        this._properties["color"].subscribeToEvent("value_changed", (value) => {
            this._element.style.color = value;
        });

        this._properties["text_decoration"].subscribeToEvent("value_changed", (value) => {
            //italic
            this._element.style.fontStyle = (value.italic)? "italic":"";
            //bold
            this._element.style.fontWeight = (value.bold)? "bold":"";
            //underline, overline, line-trough
            let underline = (value.underline)? "underline":"";
            let overline = (value.overline)? "overline":"";
            let line_through = (value.line_through)? "line-through":"";
            this._element.style.textDecoration = ` ${underline} ${overline} ${line_through}`;
            //fixes css not updating
            if (!value.underline && !value.overline && !value.line_through) this._element.style.textDecoration = "";
        });

        this._properties["text_align"].subscribeToEvent("value_changed", (value) => {
            this._element.style.textAlign = value.horizontal;
        });

        this._properties["text_shadow"].subscribeToEvent("value_changed", (value) => {
            this._element.style.textShadow = value;
        });

        //mandatory for initialization
        this.triggerUpdateData();
    }

    /**@override */
    update() {
        if (this.getThisData().text_type === "time") {
            //update time
            let current_time = this._owner_project.getAudioCurrentTime();
            let audio_duration = this._owner_project.getAudioDuration();

            //find elapsed time
            let time_pos_sec = Math.floor(current_time)%60;
            if (time_pos_sec < 10) time_pos_sec = "0"+time_pos_sec;
            let time_pos_min = Math.floor(current_time/60);

            //find total time
            let time_length_sec = Math.floor(audio_duration)%60;
            if (time_length_sec < 10) time_length_sec = "0"+time_length_sec;
            let time_length_min = Math.floor(audio_duration/60);

            //apply time
            this._element.innerHTML = `${time_pos_min}:${time_pos_sec} | ${time_length_min}:${time_length_sec}`;
        }

        //finished updating
        return true;
    }
}










//object to display the evolution of time in a graphical way.
/**@abstract */
export class VTimer extends VisualObject {
    constructor(save_handler, rack_parent, id = "") {
        super(save_handler, rack_parent, id);
        this._parameter_rack.icon = '<i class="ri-timer-2-line"></i>';
    
        //#################
        //UNIQUE PROPERTIES
        //#################

        this._properties["color"] = new property.VPColor(this._save_handler, this);
        this._properties["border_thickness"] = new property.VPBorderThickness(this._save_handler, this);
        this._properties["border_radius"] = new property.VPBorderRadius(this._save_handler, this);
        this._properties["box_shadow"] = new property.VPBoxShadow(this._save_handler, this);
    }
}



//Straight timer with a growing bar and a border.
export class VTimerStraightBar extends VTimer {
    constructor(save_handler, rack_parent, id = "") {
        super(save_handler, rack_parent, id);
        this._TYPE = "timer_straight_bar";
        this.assertType();

        //#################
        //UNIQUE PROPERTIES
        //#################

        this._properties["timer_inner_spacing"] = new property.VPTimerInnerSpacing(this._save_handler, this);


        //###################
        //CREATE HTML ELEMENT
        //###################

        //parent
        this._element = document.createElement("div");
        screen.appendChild(this._element);
        this._element.style.position = "absolute";
        this._element.style.display = "inline-block";
        this._element.style.border = "0px solid black";
        this._element.style.boxSizing = "border-box";

        //child
        this._element_child = document.createElement("div");
        this._element.appendChild(this._element_child)
        this._element_child.style.display = "inline-block";
        this._element_child.style.float = "left";
        this._element_child.style.width = "100%";
        this._element_child.style.height = "100%";

        //###########
        //UPDATE DATA
        //###########

        this._properties["color"].subscribeToEvent("value_changed", (value) => {
            this._element.style.borderColor = value;
            this._element_child.style.backgroundColor = value;
        });

        this._properties["border_thickness"].subscribeToEvent("value_changed", (value) => {
            this._element.style.borderWidth = value + "px";
        });

        this._properties["border_radius"].subscribeToEvent("value_changed", (value) => {
            this._element.style.borderRadius = value;
            this._element_child.style.borderRadius = value;
        });

        this._properties["box_shadow"].subscribeToEvent("value_changed", (value) => {
            this._element.style.boxShadow = value;
            this._element_child.style.boxShadow = value;
        });

        this._properties["timer_inner_spacing"].subscribeToEvent("value_changed", (value) => {
            this._element.style.padding = value + "px";
        });

        //mandatory for initialization
        this.triggerUpdateData();

    }

    /**@override */
    update() {
        let current_time = this._owner_project.getAudioCurrentTime();
        let audio_duration = this._owner_project.getAudioDuration();

        this._element_child.style.width = current_time/audio_duration * 100 + "%";

        //finished updating
        return true;
    }
}



//Straight timer with a line and a cursor moving on it.
export class VTimerStraightLinePoint extends VTimer {
    constructor(save_handler, rack_parent, id = "") {
        super(save_handler, rack_parent, id);
        this._TYPE = "timer_straight_line_point";
        this.assertType();

        //###################
        //CREATE HTML ELEMENT
        //###################

        //parent
        this._element = document.createElement("div");
        screen.appendChild(this._element);
        this._element.style.position = "absolute";
        this._element.style.display = "inline-flex";
        this._element.style.alignItems = "center";
        this._element.style.justifyContent = "center";

        //line
        this._element_line = document.createElement("div");
        this._element.appendChild(this._element_line)
        this._element_line.style.display = "inline-block";
        this._element_line.style.width = "100%";

        //cursor
        this._element_cursor = document.createElement("div");
        this._element.appendChild(this._element_cursor)
        this._element_cursor.style.position = "absolute";
        this._element_cursor.style.display = "inline-block";
        this._element_cursor.style.top = "0%";


        //###########
        //UPDATE DATA
        //###########

        this._properties["size"].subscribeToEvent("value_changed", (value) => {
            this._element_cursor.style.width = value.height + "px";
            this._element_cursor.style.height = value.height + "px";
            this._element_cursor.style.borderRadius = value.height/2 + "px";
        });

        this._properties["color"].subscribeToEvent("value_changed", (value) => {
            this._element_line.style.backgroundColor = value;
            this._element_cursor.style.backgroundColor = value;
        });

        this._properties["border_thickness"].subscribeToEvent("value_changed", (value) => {
            this._element_line.style.height = value + "px"; //ISSUE HERE
        });

        this._properties["border_radius"].subscribeToEvent("value_changed", (value) => {
            this._element_line.style.borderRadius = value;
        });

        this._properties["box_shadow"].subscribeToEvent("value_changed", (value) => {
            this._element_line.style.boxShadow = value;
            this._element_cursor.style.boxShadow = value;
        });

        //mandatory for initialization
        this.triggerUpdateData();
    }

    /**@override */
    update() {
        let current_time = this._owner_project.getAudioCurrentTime();
        let audio_duration = this._owner_project.getAudioDuration();
        let time_ratio = current_time / audio_duration;
        let cursor_size_percent = (this._element_cursor.offsetWidth / this._element.offsetWidth * 100);

        this._element_cursor.style.left = (time_ratio * 100) - (time_ratio * cursor_size_percent) + "%";

        //finished updating
        return true;
    }
}












//Visual object displaying a flow of particles in a container, based on volume.
export class VParticleFlow extends VisualObject {
    constructor(save_handler, rack_parent, id = "") {
        super(save_handler, rack_parent, id);
        this._TYPE = "particle_flow";
        this.assertType();
        this._parameter_rack.icon = '<i class="ri-loader-line"></i>';

        this._particles = [];

        //#################
        //UNIQUE PROPERTIES
        //#################

        this._properties["particle_radius_range"] = new property.VPParticleRadiusRange(this._save_handler, this);
        this._properties["flow_type"] = new property.VPFlowType(this._save_handler, this);
        this._properties["flow_center"] = new property.VPFlowCenter(this._save_handler, this);
        this._properties["flow_direction"] = new property.VPFlowDirection(this._save_handler, this);
        this._properties["particle_spawn_probability"] = new property.VPParticleSpawnProbability(this._save_handler, this);
        this._properties["particle_spawn_tests"] = new property.VPParticleSpawnTests(this._save_handler, this);
        this._properties["color"] = new property.VPColor(this._save_handler, this);
        

        //###################
        //CREATE HTML ELEMENT
        //###################

        //canvas creation
        this._element = document.createElement("canvas");
        screen.appendChild(this._element);

        //basic parameters
        this._element.style.position = "absolute";
        this._element.style.display = "inline-block";
        this._element.style.overflow = "hidden";


        //###########
        //UPDATE DATA
        //###########

        this._properties["size"].subscribeToEvent("value_changed", (value) => {
            this._element.width = value.width;
            this._element.height = value.height;
        });

        //mandatory for initialization
        this.triggerUpdateData();
    }

    get canvas() {return this._element;}
    get ctx() {return this._element.getContext("2d");}
    get properties() {return this._properties;}
    get volume() {return this._owner_project.volume}

    /**@override */
    update() {
        let canvas = this._element;
        let ctx = canvas.getContext("2d");


        //IF AUDIO IS PLAYING
        let current_time = this._owner_project.getAudioCurrentTime();
        let audio_duration = this._owner_project.getAudioDuration();
        let audio_progress = current_time / audio_duration;

        if (audio_progress !== 0 && audio_progress !== 1) {

            //clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = this._properties["color"].getCurrentValue();
            ctx.fillStyle = "#ffffff";

            //probability to spawn a new particle
            let spawn_tests = this._properties["particle_spawn_tests"].getCurrentValue();
            let spawn_probability = this._properties["particle_spawn_probability"].getCurrentValue();
            for (let i = 0; i < spawn_tests; i++) {
                if (Math.random() < spawn_probability) {
                    this._particles.push(new Particle(this));
                }
            }

            //update all particles
            ctx.beginPath();
            for (let i = this._particles.length-1; i >= 0; i--) {
                this._particles[i].update();
                //display if it hasn't been deleted
                if (this._particles[i]) this._particles[i].display();
            }
            ctx.fill();

        }

        //finished updating
        return true;
    }

    //remove a particle from the list of particles. It stops drawing it and kill it.
    killParticle(particle) {
        //remove the particle
        let index = this._particles.indexOf(particle);//find it in the list,
        this._particles.splice(index, 1);// and delete it.
    }
}



//particle of a particle flow visual object
class Particle {
    constructor(parent) {
        if (!parent) throw new SyntaxError("particle parent visual object required.");
        /**@type {VParticleFlow} */
        this._parent = parent;

        //radius and speed
        let radius_range = this._parent.properties["particle_radius_range"].getCurrentValue();
        this._radius = utils.RandomInt(radius_range[0], radius_range[1]);
        this._speed = 0;
        this._direction = 0;

        //coordinates
        this._x = 0;
        this._y = 0;
        this._x_min = -this._radius;
        this._x_max = this._parent.canvas.width + this._radius;
        this._y_min = -this._radius;
        this._y_max = this._parent.canvas.height + this._radius;
        this._x_velocity = 0;
        this._y_velocity = 0;

        //flow type based properties
        let type = this._parent.properties["flow_type"].getCurrentValue();

        //RADIAL
        if (type === "radial") {
            this._direction = Math.random() * 2*Math.PI;

            //spawn to the center
            let center = this._parent.properties["flow_center"].getCurrentValue();
            this._x = center.x;
            this._y = center.y;            
        }

        //DIRECTIONAL
        if (type === "directional") {
            this._direction = this._parent.properties["flow_direction"].getCurrentValue() * (2*Math.PI / 360);
        
            //DEFINE THE SPAWN TYPE
            this._spawn_type;//on which sides of the screen particles can spawn;
            //left || bottom-left || bottom || bottom-right || right || top-right || top || top-left;
    
            let PI = Math.PI;
            let axis_direction = true;
            //cases with a direction aligned with an axis
            switch (this._direction) {
                case 2*PI:
                case 0:             this._spawn_type = "left"; break;
                case PI/2:          this._spawn_type = "top"; break;
                case PI:            this._spawn_type = "right"; break;
                case (3*PI)/2:      this._spawn_type = "bottom"; break;
                default: axis_direction = false;
            }
            //other cases
            if      (utils.InInterval(this._direction, [0       , PI/2    ], "excluded")) {this._spawn_type = "top-left"}
            else if (utils.InInterval(this._direction, [PI/2    , PI      ], "excluded")) {this._spawn_type = "top-right"}
            else if (utils.InInterval(this._direction, [PI      , (3*PI)/2], "excluded")) {this._spawn_type = "bottom-right"}
            else if (utils.InInterval(this._direction, [(3*PI)/2, 2*PI    ], "excluded")) {this._spawn_type = "bottom-left"}
            else if (!axis_direction)
                throw new Error(`Particle: ${this._direction} is not a valid particle direction. It must be a radian value between 0 and 2PI!`);
    
    
            //APPLY THE SPAWN TYPE
            let random = utils.RandomInt(0,1);
    
            switch (this._spawn_type) {
                //====================================================
                case "left": this.leftSpawn(); break;
                //====================================================
                case "bottom-left":
                    if (random === 0) this.bottomSpawn();
                        else this.leftSpawn(); break;
                //====================================================
                case "bottom": this.bottomSpawn(); break;
                //====================================================
                case "bottom-right":
                    if (random === 0) this.bottomSpawn();
                        else this.rightSpawn(); break;
                //====================================================
                case "right": this.rightSpawn(); break;
                 //====================================================
                case "top-right":
                    if (random === 0) this.topSpawn();
                        else this.rightSpawn(); break;
                //====================================================
                case "top": this.topSpawn(); break;
                //====================================================
                case "top-left":
                    if (random === 0) this.topSpawn();
                        else this.leftSpawn(); break;
                //====================================================
                default: throw new Error(`Particle: ${this._spawn_type} is not a valid spawn type!`);
            }
        }
    }

    //SPAWN METHODS
    //spawn the particle arround the screen, depending of the direction.
    //set spawn within the allowed boundaries of the screen
    leftSpawn() {
        this._x = this._x_min;
        this._y = utils.RandomInt(this._y_min, this._y_max);
    }
    rightSpawn() {
        this._x = this._x_max;
        this._y = utils.RandomInt(this._y_min, this._y_max);
    }
    topSpawn() {
        this._x = utils.RandomInt(this._x_min, this._x_max);
        this._y = this._y_min;
    }
    bottomSpawn() {
        this._x = utils.RandomInt(this._x_min, this._x_max);
        this._y = this._y_max;
    }


    update() {
        //compute speed
        this._speed = this._parent.volume/20;
        this._x_velocity = Math.cos(this._direction) * this._speed;
        this._y_velocity = Math.sin(this._direction) * this._speed;

        //apply speed
        this._x += this._x_velocity;
        this._y += this._y_velocity;

        //kill particle being out or range (left the screen)
        if (this._x > this._x_max || this._x < this._x_min || this._y > this._y_max || this._y < this._y_min ) {
            this._parent.killParticle(this);
        }
    };
    display() {
        let ctx = this._parent.ctx;
        ctx.moveTo(this._x, this._y);
        ctx.arc(this._x, this._y, this._radius, 0, 2*Math.PI);
    };
}