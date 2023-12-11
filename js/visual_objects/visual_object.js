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

import * as utils from "../utils/utils.js";
import * as property from "./visual_object_property.js";
import * as ui_components from "../ui_components/ui_components.js";


/**
 * //base class for visual objects. They base themselves on their data from a SaveHandler
 * to get and store data. If an id is provided, it inspects an existing data set.
 * Otherwuse the data set is created.
 *
 * @abstract
 * @export
 * @class VisualObject
 */
export class VisualObject {
    /**
     * Creates an instance of VisualObject.
     * @param {SaveHandler} save_handler The SaveHandler where data is loaded and stored.
     * @param {HTMLElement} [rack_parent=null] The DOM element in which the rack is placed in the UI.
     * @param {string} [id=""] The assigned unique ID for the object.
     * @memberof VisualObject
     */
    constructor(save_handler, rack_parent = null, id = "") {
        if (this.constructor === VisualObject) throw new SyntaxError("VisualObject is an abstract class.");
        if (utils.IsUndefined(save_handler)) throw new SyntaxError("SaveHandler required as an argument for a VisualObject.");
        if (!utils.IsAnElement(rack_parent) && rack_parent !== null) throw new SyntaxError("rack_parent must be a DOM parent for the rack.");

        this._save_handler = save_handler;
        this._owner_project = this._save_handler.owner_project;
        this._screen = this._owner_project.screen;
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
        if (!this._owner_project.export_mode) {
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
            };    
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
    get type() {return this._TYPE;}

    /**
     * Return the data stored in the SaveHandler for this object.
     *
     * @return {Object} 
     * @memberof VisualObject
     */
    getThisData() {return this._save_handler.save_data.objects[this._id];}

    /**
     * generate a UUID for the object
     *
     * @memberof VisualObject
     */
    generateID() {
        let id;
        do {
            id = utils.uuidv4();
        }
        while (!this.validID(id) || !this.uniqueID(id));

        this._id = id;
    }

    /**
     * validate an id to be an UUID.
     *
     * @param {String} id The ID to verify.
     * @return {Boolean} 
     * @memberof VisualObject
     */
    validID(id) {
        if (!utils.IsAString(id)) throw `${id} is not a string.`;
        
        return id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i) !== null;
    }

    /**
     * verify if the id exists in the save. Returns if it is unique, in other words if no identical ID exists in the save.
     *
     * @param {String} id
     * @return {Boolean} 
     * @memberof VisualObject
     */
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

    /**
     * sets the name of an object from the exterior
     *
     * @param {String} name The new name.
     * @memberof VisualObject
     */
    setName(name) {
        this._properties["name"].rename(name);
    }

    /**
     * used by visual object constructors to defined their type as a string in save data
     *
     * @param {String} type
     * @memberof VisualObject
     */
    setType(type) {
        if (this.getThisData().visual_object_type) throw new SyntaxError("Object type already set, no modification allowed.");
        this._save_handler.mergeVisualObjectData(this._id, {visual_object_type: type});
    }

    /**
     * write the type for a new visual object,
     * and make sure the read data come from an object of the same type.
     *
     * @memberof VisualObject
     */
    assertType() {
        if (!this.getThisData().visual_object_type) this.setType(this._TYPE);
        if (this.getThisData().visual_object_type !== this._TYPE) throw new Error(`Trying to access data from a non ${this._TYPE} object! Aborting initialization.`);
    }

    /**
     * trigger object data update, by triggering all visual properties.
     *
     * @memberof VisualObject
     */
    triggerUpdateData() {
        for (const key in this._properties) {
            if (Object.hasOwnProperty.call(this._properties, key)) {
                const property = this._properties[key];
                property.triggerEvent("value_changed", property.getCurrentValue());
            }
        }
    }

    /**
     * update object display
     *
     * @abstract
     * @memberof VisualObject
     * @return {Boolean}
     */
    update() {
        throw new SyntaxError("VisualObject: update() must be implemented.");
    }

    /**
     * destroy VisualObject
     *
     * @memberof VisualObject
     */
    destroy() {
        if (this._element) this._element.remove();
        this._parameter_rack.removeSelf();
    }
}

















/**
 * Visual Object to display customizable text. It can also display the time passing by.
 *
 * @export
 * @class VText
 * @extends {VisualObject}
 */
export class VText extends VisualObject {
    /**
     * Creates an instance of VText.
     * @param {SaveHandler} save_handler The SaveHandler where data is loaded and stored.
     * @param {HTMLElement} rack_parent The DOM element in which the rack is placed in the UI.
     * @param {string} [id=""] The assigned unique ID for the object.
     * @memberof VText
     */
    constructor(save_handler, rack_parent, id = "") {
        super(save_handler, rack_parent, id);
        this._TYPE = "text";
        this.assertType();
        if (!this._owner_project.export_mode) this._parameter_rack.icon = "<i class=\"ri-text\"></i>";

        //#################
        //UNIQUE PROPERTIES
        //#################

        this._properties["text_type"] = new property.VPTextType(this._save_handler, this);
        this._properties["text_content"] = new property.VPTextContent(this._save_handler, this);
	this._properties["font_family"] = new property.VPFontFamily(this._save_handler, this);
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
        this._screen.appendChild(this._element);
        this._element.style.position = "absolute";
        this._element.style.display = "inline-block";
        this._element.style.overflowWrap = "break-word";
        

        //###########
        //UPDATE DATA
        //###########

        this._properties["text_content"].subscribeToEvent("value_changed", (value) => {
            this._element.innerHTML = value;
        });

	this._properties["font_family"].subscribeToEvent("value_changed", (value) => {
            this._element.style.fontFamily = value;
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

    /**
     * Updates this object's display.
     *
     * @override
     * @return {Boolean} 
     * @memberof VText
     */
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










/**
 * object to display the evolution of time in a graphical way.
 *
 * @abstract
 * @export
 * @class VTimer
 * @extends {VisualObject}
 */
export class VTimer extends VisualObject {
    /**
     * Creates an instance of VTimer.
     * @param {SaveHandler} save_handler The SaveHandler where data is loaded and stored.
     * @param {HTMLElement} rack_parent The DOM element in which the rack is placed in the UI.
     * @param {string} [id=""] The assigned unique ID for the object.
     * @memberof VTimer
     */
    constructor(save_handler, rack_parent, id = "") {
        super(save_handler, rack_parent, id);
        if (this.constructor === VTimer) throw new SyntaxError("VTimer is an abstract class.");
        if (!this._owner_project.export_mode) this._parameter_rack.icon = "<i class=\"ri-timer-2-line\"></i>";
    
        //#################
        //UNIQUE PROPERTIES
        //#################

        this._properties["color"] = new property.VPColor(this._save_handler, this);
        this._properties["border_thickness"] = new property.VPBorderThickness(this._save_handler, this);
        this._properties["border_radius"] = new property.VPBorderRadius(this._save_handler, this);
        this._properties["box_shadow"] = new property.VPBoxShadow(this._save_handler, this);
    }
}



/**
 * Straight timer with a growing bar and a border.
 *
 * @export
 * @class VTimerStraightBar
 * @extends {VTimer}
 */
export class VTimerStraightBar extends VTimer {
    /**
     * Creates an instance of VTimerStraightBar.
     * @param {SaveHandler} save_handler The SaveHandler where data is loaded and stored.
     * @param {HTMLElement} rack_parent The DOM element in which the rack is placed in the UI.
     * @param {string} [id=""] The assigned unique ID for the object.
     * @memberof VTimerStraightBar
     */
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
        this._screen.appendChild(this._element);
        this._element.style.position = "absolute";
        this._element.style.display = "inline-block";
        this._element.style.border = "0px solid black";
        this._element.style.boxSizing = "border-box";

        //child
        this._element_child = document.createElement("div");
        this._element.appendChild(this._element_child);
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

    /**
     * Updates this object's display.
     *
     * @override
     * @return {Boolean} 
     * @memberof VTimerStraightBar
     */
    update() {
        let current_time = this._owner_project.getAudioCurrentTime();
        let audio_duration = this._owner_project.getAudioDuration();

        this._element_child.style.width = current_time/audio_duration * 100 + "%";

        //finished updating
        return true;
    }
}



/**
 * Straight timer with a line and a cursor moving on it.
 *
 * @export
 * @class VTimerStraightLinePoint
 * @extends {VTimer}
 */
export class VTimerStraightLinePoint extends VTimer {
    /**
     * Creates an instance of VTimerStraightLinePoint.
     * @param {SaveHandler} save_handler The SaveHandler where data is loaded and stored.
     * @param {HTMLElement} rack_parent The DOM element in which the rack is placed in the UI.
     * @param {string} [id=""] The assigned unique ID for the object.
     * @memberof VTimerStraightLinePoint
     */
    constructor(save_handler, rack_parent, id = "") {
        super(save_handler, rack_parent, id);
        this._TYPE = "timer_straight_line_point";
        this.assertType();

        //###################
        //CREATE HTML ELEMENT
        //###################

        //parent
        this._element = document.createElement("div");
        this._screen.appendChild(this._element);
        this._element.style.position = "absolute";
        this._element.style.display = "inline-flex";
        this._element.style.alignItems = "center";
        this._element.style.justifyContent = "center";

        //line
        this._element_line = document.createElement("div");
        this._element.appendChild(this._element_line);
        this._element_line.style.display = "inline-block";
        this._element_line.style.width = "100%";

        //cursor
        this._element_cursor = document.createElement("div");
        this._element.appendChild(this._element_cursor);
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

    /**
     * Updates this object's display.
     *
     * @override
     * @return {Boolean} 
     * @memberof VTimerStraightLinePoint
     */
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












/**
 * Visual object displaying a flow of particles in a container, based on volume.
 *
 * @export
 * @class VParticleFlow
 * @extends {VisualObject}
 */
export class VParticleFlow extends VisualObject {
    /**
     * Creates an instance of VParticleFlow.
     * @param {SaveHandler} save_handler The SaveHandler where data is loaded and stored.
     * @param {HTMLElement} rack_parent The DOM element in which the rack is placed in the UI.
     * @param {string} [id=""] The assigned unique ID for the object.
     * @memberof VParticleFlow
     */
    constructor(save_handler, rack_parent, id = "") {
        super(save_handler, rack_parent, id);
        this._TYPE = "particle_flow";
        this.assertType();
        if (!this._owner_project.export_mode) this._parameter_rack.icon = "<i class=\"ri-loader-line\"></i>";

        this._particles = [];
        this._is_static_update = false;
        this._draw_particles = true;
        this._is_regen_update = false;

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
        this._screen.appendChild(this._element);

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
            this.staticUpdate();

        });

        this._properties["particle_radius_range"].subscribeToEvent("value_changed", () => {
            this.regenUpdate();
        });

        this._properties["flow_type"].subscribeToEvent("value_changed", () => {
            this.regenUpdate();
        });

        this._properties["flow_center"].subscribeToEvent("value_changed", () => {
            this.regenUpdate();
        });

        this._properties["flow_direction"].subscribeToEvent("value_changed", () => {
            this.regenUpdate();
        });

        this._properties["particle_spawn_probability"].subscribeToEvent("value_changed", () => {
            this.regenUpdate();
        });

        this._properties["particle_spawn_tests"].subscribeToEvent("value_changed", () => {
            this.regenUpdate();
        });

        this._properties["color"].subscribeToEvent("value_changed", () => {
            this.staticUpdate();
        });

        //mandatory for initialization
        this.triggerUpdateData();
    }

    get canvas() {return this._element;}
    get ctx() {return this._element.getContext("2d");}
    get properties() {return this._properties;}
    get volume() {return this._owner_project.volume;}
    get is_regen_update() {return this._is_regen_update;}

    /**
     * Updates this object's display.
     *
     * @override
     * @return {Boolean} 
     * @memberof VParticleFlow
     */
    update() {
        let canvas = this._element;
        let ctx = canvas.getContext("2d");

        //clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = this._properties["color"].getCurrentValue();

        //probability to spawn a new particle
        if (!this._is_static_update) {
            let spawn_tests = this._properties["particle_spawn_tests"].getCurrentValue();
            let spawn_probability = this._properties["particle_spawn_probability"].getCurrentValue();
            for (let i = 0; i < spawn_tests; i++) {
                if (Math.random() < spawn_probability) {
                    this._particles.push(new Particle(this));
                }
            }    
        }

        //update all particles
        ctx.beginPath();
        for (let i = this._particles.length-1; i >= 0; i--) {
            if (!this._is_static_update) this._particles[i].update();
            //display if it hasn't been deleted
            if (this._particles[i] && this._draw_particles) this._particles[i].display();
        }
        ctx.fill();

        //finished updating
        return true;
    }

    /**
     * Render particles without moving them.
     *
     * @memberof VParticleFlow
     */
    staticUpdate() {
        this._is_static_update = true;
        this.update();
        this._is_static_update = false;
    }

    /**
     * Update particles without rendering them.
     *
     * @memberof VParticleFlow
     */
    noDrawUpdate() {
        this._draw_particles = false;
        this.update();
        this._draw_particles = true;
    }

    /**
     * Performs many updates then one draw, useful for getting a whole new display of particles.
     *
     * @memberof VParticleFlow
     */
    regenUpdate() {
        this._is_regen_update = true;
        let size = this._properties["size"].getCurrentValue();
        let count = Math.max(size.width, size.height) / 4; 
        for (let i = 0; i < count; i++) this.noDrawUpdate();
        this.staticUpdate();
        this._is_regen_update = false;
    }

    /**
     * remove a particle from the list of particles. It stops drawing it and kill it.
     *
     * @param {Particle} particle
     * @memberof VParticleFlow
     */
    killParticle(particle) {
        //remove the particle
        let index = this._particles.indexOf(particle);//find it in the list,
        this._particles.splice(index, 1);// and delete it.
    }
}



/**
 * particle of a particle flow visual object
 *
 * @class Particle
 */
class Particle {
    /**
     * Creates an instance of Particle.
     * @param {VParticleFlow} parent
     * @memberof Particle
     */
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
            if      (utils.InInterval(this._direction, [0       , PI/2    ], "excluded")) {this._spawn_type = "top-left";}
            else if (utils.InInterval(this._direction, [PI/2    , PI      ], "excluded")) {this._spawn_type = "top-right";}
            else if (utils.InInterval(this._direction, [PI      , (3*PI)/2], "excluded")) {this._spawn_type = "bottom-right";}
            else if (utils.InInterval(this._direction, [(3*PI)/2, 2*PI    ], "excluded")) {this._spawn_type = "bottom-left";}
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
    /**
     * Place the particle to a random position on the left border of the screen.
     *
     * @memberof Particle
     */
    leftSpawn() {
        this._x = this._x_min;
        this._y = utils.RandomInt(this._y_min, this._y_max);
    }
    /**
     * Place the particle to a random position on the right border of the screen.
     *
     * @memberof Particle
     */
    rightSpawn() {
        this._x = this._x_max;
        this._y = utils.RandomInt(this._y_min, this._y_max);
    }
    /**
     * Place the particle to a random position on the top border of the screen.
     *
     * @memberof Particle
     */
    topSpawn() {
        this._x = utils.RandomInt(this._x_min, this._x_max);
        this._y = this._y_min;
    }
    /**
     * Place the particle to a random position on the bottom border of the screen.
     *
     * @memberof Particle
     */
    bottomSpawn() {
        this._x = utils.RandomInt(this._x_min, this._x_max);
        this._y = this._y_max;
    }


    /**
     * Update the particle variables.
     *
     * @memberof Particle
     */
    update() {
        //compute speed
        this._speed = (this._parent.is_regen_update)? 10 : this._parent.volume/20;
        this._x_velocity = Math.cos(this._direction) * this._speed;
        this._y_velocity = Math.sin(this._direction) * this._speed;

        //apply speed
        this._x += this._x_velocity;
        this._y += this._y_velocity;

        //kill particle being out or range (left the screen)
        if (this._x > this._x_max || this._x < this._x_min || this._y > this._y_max || this._y < this._y_min ) {
            this._parent.killParticle(this);
        }
    }

    /**
     * Update the display and draw the particle.
     *
     * @memberof Particle
     */
    display() {
        let ctx = this._parent.ctx;
        ctx.moveTo(this._x, this._y);
        ctx.arc(this._x, this._y, this._radius, 0, 2*Math.PI);
    }
}














/**
 * Foundation for all visualizer Visual Objects.
 *
 * @abstract
 * @export
 * @class VVisualizer
 * @extends {VisualObject}
 */
export class VVisualizer extends VisualObject {
    /**
     * Creates an instance of VVisualizer.
     * @param {SaveHandler} save_handler The SaveHandler where data is loaded and stored.
     * @param {HTMLElement} rack_parent The DOM element in which the rack is placed in the UI.
     * @param {string} [id=""] The assigned unique ID for the object.
     * @memberof VVisualizer
     */
    constructor(save_handler, rack_parent, id = "") {
        super(save_handler, rack_parent, id);
        if (this.constructor === VVisualizer) throw new SyntaxError("VVisualizer is an abstract class.");
        if (!this._owner_project.export_mode) this._parameter_rack.icon = "<i class=\"ri-rhythm-line\"></i>";

        //visualization frequency array used for drawing
        this._freq_array = null;
        this._prev_freq_array = null;
        this._reset_visualization_smoothing = true;
    
        //#################
        //UNIQUE PROPERTIES
        //#################

        this._properties["visualizer_points_count"] = new property.VPVisualizerPointsCount(this._save_handler, this);
        this._properties["visualizer_analyser_range"] = new property.VPVisualizerAnalyserRange(this._save_handler, this);
        this._properties["visualization_smoothing_type"] = new property.VPVisualizationSmoothingType(this._save_handler, this);
        this._properties["visualization_smoothing_factor"] = new property.VPVisualizationSmoothingFactor(this._save_handler, this);
        this._properties["color"] = new property.VPColor(this._save_handler, this);


        //###################
        //CREATE HTML ELEMENT
        //###################



        //###########
        //UPDATE DATA
        //###########

        this._properties["visualizer_points_count"].subscribeToEvent("value_changed", () => {
            this._reset_visualization_smoothing = true;
            this.update();
        });
        this._properties["visualizer_analyser_range"].subscribeToEvent("value_changed", () => {
            this._reset_visualization_smoothing = true;
            this.update();
        });
        this._properties["visualization_smoothing_type"].subscribeToEvent("value_changed", () => {
            this._reset_visualization_smoothing = true;
        });
        this._properties["visualization_smoothing_factor"].subscribeToEvent("value_changed", () => {
            this._reset_visualization_smoothing = true;
        });
    }

    /**
     * Updates this object's display.
     *
     * @override
     * @return {Boolean} 
     * @memberof VVisualizer
     */
    update() {
        //collect audio data
        let points_count = this._properties["visualizer_points_count"].getCurrentValue();
        let analyser_range = this._properties["visualizer_analyser_range"].getCurrentValue();
        let original_freq_array = this._owner_project.getFrequencyArray();
        //if not yet initialized because no audio, put arbitrary values.
        if (original_freq_array === null) {
            original_freq_array = [];
            for (let i = 0; i < 1024; i++) original_freq_array.push(0); //workaround while MappedArray() is broken
        }
        this._freq_array = utils.MappedArray(original_freq_array, points_count, analyser_range[0], analyser_range[1]);

        //apply visualization smoothing
        if (utils.IsUndefined(this._prev_freq_array) || this._reset_visualization_smoothing) {
            this._prev_freq_array = this._freq_array;
            this._reset_visualization_smoothing = false;
        }
        var smooth_type = this._properties["visualization_smoothing_type"].getCurrentValue();
        var smooth_factor = this._properties["visualization_smoothing_factor"].getCurrentValue();

        for (let i = 0; i < this._freq_array.length; i++) {

            if (smooth_type === "linear_decrease") {
                //The new value can't decrease more than the factor value between current[i] and previous[i].
                //The decrease is linear as long as the new value is below the old value minus the factor.
                //This factor defines how quick the decay is.

                //factor = 0 prevents from decreasing. factor > (maximum possible value for current[i]) disables the smoothing.
                let scaled_smooth_factor = smooth_factor * 255; //0 to 1 -> 0 to max array value (255 with Int8Array)
                let max_decay_limit = this._prev_freq_array[i] - scaled_smooth_factor;
                if (this._freq_array[i] < max_decay_limit ) {
                    this._freq_array[i] = max_decay_limit;
                }

            } else if (smooth_type === "proportional_decrease") {
                //The new value can't decrease more than the previous[i]*factor.
                //The higher current[i] is, the more impacted it is, making low smoothing for high values,
                //but high smoothing for low values.
                //The decrease is proportional as long as the new value is below the old value multiplicated by the factor.

                //factor = 1 prevents from decreasing. factor > 1 indefinitely increase quicker and quicker previous[i].
                //factor = 0 disables the smoothing
                let max_proportional_decay_limit = this._prev_freq_array[i] * smooth_factor;
                if (this._freq_array[i] < max_proportional_decay_limit) {
                    this._freq_array[i] = max_proportional_decay_limit;
                }

            } else if (smooth_type === "average") {
                //This is very similar to the smoothing system used by the Web Audio API.
                //The formula is the following (|x|: absolute value of x):
                //new[i] = factor * previous[i] + (1-factor) * |current[i]|

                //factor = 0 disables the smoothing. factor = 1 freezes everything and keep previous[i] forever.
                //factor not belonging to [0,1] creates uncontrolled behaviour.
                this._freq_array[i] = smooth_factor * this._prev_freq_array[i] + (1-smooth_factor) * Math.abs(this._freq_array[i]);
            }

        }

        this._prev_freq_array = this._freq_array;        
    }
}



/**
 * Abstart Visual Object for all bar visualizers
 *
 * @abstract
 * @export
 * @class VVisualizerBar
 * @extends {VVisualizer}
 */
export class VVisualizerBar extends VVisualizer {
    /**
     * Creates an instance of VVisualizerBar.
     * @param {SaveHandler} save_handler The SaveHandler where data is loaded and stored.
     * @param {HTMLElement} rack_parent The DOM element in which the rack is placed in the UI.
     * @param {string} [id=""] The assigned unique ID for the object.
     * @memberof VVisualizerBar
     */
    constructor(save_handler, rack_parent, id = "") {
        super(save_handler, rack_parent, id);
        if (this.constructor === VVisualizerBar) throw new SyntaxError("VVisualizerBar is an abstract class.");
        
        this._bars = [];
        this._exclude_bar_count_update = false;

        //#################
        //UNIQUE PROPERTIES
        //#################

        this._properties["border_radius"] = new property.VPBorderRadius(this._save_handler, this);
        this._properties["box_shadow"] = new property.VPBoxShadow(this._save_handler, this);
        this._properties["visualizer_bar_thickness"] = new property.VPVisualizerBarThickness(this._save_handler, this);


        //###################
        //CREATE HTML ELEMENT
        //###################

        this._element = document.createElement("div");
        this._screen.appendChild(this._element);
        this._element.style.position = "absolute";
        this._element.style.display = "inline-block";
        this._element.style.overflow = "hidden";


        //###########
        //UPDATE DATA
        //###########

        this._properties["color"].subscribeToEvent("value_changed", value => {
            for (let i = 0; i < this._bars.length; i++) {
                const bar = this._bars[i];
                bar.style.backgroundColor = value;
            }
        });
        this._properties["border_radius"].subscribeToEvent("value_changed", value => {
            for (let i = 0; i < this._bars.length; i++) {
                const bar = this._bars[i];
                bar.style.borderRadius = value;
            }
        });
        this._properties["box_shadow"].subscribeToEvent("value_changed", value => {
            for (let i = 0; i < this._bars.length; i++) {
                const bar = this._bars[i];
                bar.style.boxShadow = value;
            }
        });
        this._properties["visualizer_bar_thickness"].subscribeToEvent("value_changed", value => {
            for (let i = 0; i < this._bars.length; i++) {
                const bar = this._bars[i];
                bar.style.width = value + "px";
                bar.style.minHeight = value + "px";
            }
        });
        this._properties["visualizer_points_count"].subscribeToEvent("value_changed", () => {
            this.updateBars();
        });
    }

    /**
     * Updates all the bars of the visualizer on all of its characteristics.
     * Remove or add bars if needed to match points count.
     *
     * @memberof VVisualizerBar
     */
    updateBars() {
        if (!this._exclude_bar_count_update) {

            //update bar count
            let points_count = this._properties["visualizer_points_count"].getCurrentValue();
            let initial_length = this._bars.length;

            if (initial_length < points_count) {
                //add missing bars
                for (let i = 0; i < points_count - initial_length; i++) {
                    let bar = document.createElement("div");
                    this._element.appendChild(bar);
                    bar.style.zIndex = "inherit";
                    this._bars.push(bar);
                }
            } else if (initial_length > points_count) {
                //remove excessive bars
                for (let i = initial_length - 1; i >= points_count; i--) {
                    let bar = this._bars[i];
                    bar.remove();
                    this._bars.pop();
                }
            }

            //update bar visual object properties without triggering this function again.
            this._exclude_bar_count_update = true;
            this.triggerUpdateData();
            this._exclude_bar_count_update = false;
        }
    }

    /**
     * Updates this object's display.
     *
     * @return {Boolean} 
     * @memberof VVisualizerBar
     */
    update() {
        super.update();
        let height = this._properties["size"].getCurrentValue().height;

        for (let i = 0; i < this._bars.length; i++) {
            //proportionality to adapt to the full height. (max volume = 256)
            this._bars[i].style.height = (this._freq_array[i] / 256 * height) + "px";
        }
    }
}



/**
 * Visualizer that is made of parallel straight lines on a straight line path.
 *
 * @export
 * @class VVisualizerStraightBar
 * @extends {VVisualizerBar}
 */
export class VVisualizerStraightBar extends VVisualizerBar {
    /**
     * Creates an instance of VVisualizerStraightBar.
     * @param {SaveHandler} save_handler The SaveHandler where data is loaded and stored.
     * @param {HTMLElement} rack_parent The DOM element in which the rack is placed in the UI.
     * @param {string} [id=""] The assigned unique ID for the object.
     * @memberof VVisualizerStraightBar
     */
    constructor(save_handler, rack_parent, id = "") {
        super(save_handler, rack_parent, id);
        this._TYPE = "visualizer_straight_bar";
        this.assertType();

        //###################
        //CREATE HTML ELEMENT
        //###################

        this._element.style.display = "flex";
        this._element.style.flexWrap = "nowrap";
        this._element.style.justifyContent = "space-between";
        this._element.style.alignItems = "flex-end";


        //###########
        //UPDATE DATA
        //###########

        //mandatory for initialization
        this.triggerUpdateData();

    }

    /**
     * Updates this object's display.
     *
     * @return {Boolean} 
     * @memberof VVisualizerStraightBar
     */
    update() {
        super.update();

        //finished updating
        return true;
    }
}



/**
 * Visualizer that is made of straight bar organized around a circle like rays.
 *
 * @export
 * @class VVisualizerCircularBar
 * @extends {VVisualizerBar}
 */
export class VVisualizerCircularBar extends VVisualizerBar {
    /**
     * Creates an instance of VVisualizerCircularBar.
     * @param {SaveHandler} save_handler The SaveHandler where data is loaded and stored.
     * @param {HTMLElement} rack_parent The DOM element in which the rack is placed in the UI.
     * @param {string} [id=""] The assigned unique ID for the object.
     * @memberof VVisualizerCircularBar
     */
    constructor(save_handler, rack_parent, id = "") {
        super(save_handler, rack_parent, id);
        this._TYPE = "visualizer_circular_bar";
        this.assertType();

        //#################
        //UNIQUE PROPERTIES
        //#################

        this._properties["visualizer_radius"] = new property.VPVisualizerRadius(this._save_handler, this);


        //###########
        //UPDATE DATA
        //###########

        this._properties["visualizer_radius"].subscribeToEvent("value_changed", () => {
            this.updateBars();
        });

        //mandatory for initialization
        this.triggerUpdateData();

    }

    /**
     * Updates all the bars of the visualizer on all of its characteristics.
     * Remove or add bars if needed to match points count.
     *
     * @memberof VVisualizerCircularBar
     */
    updateBars() {
        super.updateBars();
        this.updateBarsRotation();
    }

    /**
     * Do the repositioning of all the bars accordingly in a circular way based on radius.
     *
     * @memberof VVisualizerCircularBar
     */
    updateBarsRotation() {
        let points_count = this._properties["visualizer_points_count"].getCurrentValue();
        let radius = this._properties["visualizer_radius"].getCurrentValue();
        let rot_step = 2*Math.PI / points_count;
        let rot_pos = 0;

        for (let i = 0; i < this._bars.length; i++) {
            const bar = this._bars[i];
            
            //centering
            bar.style.position = "absolute";
            let center_x = (this._element.offsetWidth / 2) - (bar.offsetWidth / 2);
            let center_y = (this._element.offsetHeight / 2);
            bar.style.left = (center_x + Math.cos(rot_pos) * radius) + "px";
            bar.style.top = (center_y + Math.sin(rot_pos) * radius) + "px";

            //transform
            bar.style.transformOrigin = "center top";
            bar.style.transform = `scale(-1,-1) rotate( ${rot_pos + Math.PI / 2}rad )`;

            //iterate
            rot_pos += rot_step;                
        }
    }

    /**
     * Updates this object's display.
     *
     * @return {Boolean} 
     * @memberof VVisualizerCircularBar
     */
    update() {
        super.update();
        let height = this._properties["size"].getCurrentValue().height;
        let radius = this._properties["visualizer_radius"].getCurrentValue();

        for (let i = 0; i < this._bars.length; i++) {
            //proportionality to adapt to the full height. (max volume = 256)
            this._bars[i].style.height = (this._freq_array[i] / 256 * (height/2 - radius)) + "px";        
        }

        //fix rotation;
        this.updateBarsRotation();

        //finished updating
        return true;
    }
}



/**
 * Visualizer that represent the spectrum as waves, on a linear base
 *
 * @export
 * @class VVisualizerStraightWave
 * @extends {VVisualizer}
 */
export class VVisualizerStraightWave extends VVisualizer {
    /**
     * Creates an instance of VVisualizerStraightWave.
     * @param {SaveHandler} save_handler The SaveHandler where data is loaded and stored.
     * @param {HTMLElement} rack_parent The DOM element in which the rack is placed in the UI.
     * @param {string} [id=""] The assigned unique ID for the object.
     * @memberof VVisualizerStraightWave
     */
    constructor(save_handler, rack_parent, id = "") {
        super(save_handler, rack_parent, id);
        this._TYPE = "visualizer_straight_wave";
        this.assertType();

        this._debug = false;

        //###################
        //CREATE HTML ELEMENT
        //###################

        this._element = document.createElement("canvas");
        this._screen.appendChild(this._element);
        this._element.style.position = "absolute";
        this._element.style.display = "inline-block";
        this._element.style.overflow = "hidden";


        //###########
        //UPDATE DATA
        //###########

        this._properties["size"].subscribeToEvent("value_changed", (value) => {
            this._element.width = value.width;
            this._element.height = value.height;
            this.update();
        });

        this._properties["color"].subscribeToEvent("value_changed", () => {
            this.update();
        });

        //mandatory for initialization
        this.triggerUpdateData();

    }

    /**
     * Updates this object's display.
     *
     * @return {Boolean} 
     * @memberof VVisualizerStraightWave
     */
    update() {
        super.update();

        let points_count = this._properties["visualizer_points_count"].getCurrentValue();
        let height = this._properties["size"].getCurrentValue().height;
        let color = this._properties["color"].getCurrentValue();

        let visualizer_cvs = this._element;
        //canvas context
        let vis_ctx = visualizer_cvs.getContext("2d");

        //divide the canvas into equal parts
        let wave_step = visualizer_cvs.width / (points_count-1);//create steps
        let wave_step_pos = 0;

        //clear
        vis_ctx.clearRect(0, 0, visualizer_cvs.width, visualizer_cvs.height);



        //CREATE THE WAVE
        vis_ctx.beginPath();
        vis_ctx.moveTo(0, visualizer_cvs.height);
        vis_ctx.lineTo(0, this._freq_array[0] / 256 * height);

        let x, y, ctrl_point_1_x, ctrl_point_1_y, ctrl_point_2_x, ctrl_point_2_y;

        //make all wave points
        for (let i = 0; i < points_count; i++) {
            //place a new bezier point

            // => parameters
            x = wave_step_pos;
            //proportionality to adapt to the full height. (max volume = 256)
            y = visualizer_cvs.height - (this._freq_array[i] / 256 * height);
            //the first point creates a bezier with a width 2 times smaller, so it has to be taken in count!
            ctrl_point_1_x = (i === 0) ? x-(wave_step/4) : x-(wave_step/2);
            //1_y at the same height of the previous point, if that one exists.
            ctrl_point_1_y = (visualizer_cvs.height - (this._freq_array[i-1] / 256 * height)) || visualizer_cvs.height;
            ctrl_point_2_x = ctrl_point_1_x;
            ctrl_point_2_y = y;

            // => canvas draw
            vis_ctx.bezierCurveTo(ctrl_point_1_x, ctrl_point_1_y, ctrl_point_2_x, ctrl_point_2_y, x, y);
            wave_step_pos += wave_step;
        }
        // //END THE WAVE
        vis_ctx.lineTo(visualizer_cvs.width, visualizer_cvs.height);

        //DRAW THE WAVE ON THE CANVAS
        vis_ctx.fillStyle = color;
        vis_ctx.fill();



        //DEBUG vvvv#########################################################################################################

        if (this._debug) {
            let wave_step_pos = 0;
            let color_strength = 180;
    
            for (let i = 0; i < points_count; i++) {
                vis_ctx.beginPath();
                x = wave_step_pos;
                //proportionality to adapt to the full height. (max volume = 256)
                y = visualizer_cvs.height - (this._freq_array[i] / 256 * height);
                vis_ctx.arc(x, y, 3, 0, 2*Math.PI);
                vis_ctx.fillStyle = `rgb(${color_strength},0,0)`;
                vis_ctx.fill();
    
                vis_ctx.beginPath();
                ctrl_point_1_x = (i === 0) ? x-(wave_step/4) : x-(wave_step/2);
                //at the same height of the previous point, if that one exists.
                ctrl_point_1_y = (visualizer_cvs.height - (this._freq_array[i-1] / 256 * height) ) || visualizer_cvs.height;
                vis_ctx.arc(ctrl_point_1_x, ctrl_point_1_y, 3, 0, 2*Math.PI);
                vis_ctx.fillStyle = `rgb(0,${color_strength},0)`;
                vis_ctx.fill();
    
                vis_ctx.beginPath();
                ctrl_point_2_x = ctrl_point_1_x;
                ctrl_point_2_y = y;
                vis_ctx.arc(ctrl_point_2_x, ctrl_point_2_y, 3, 0, 2*Math.PI);
                vis_ctx.fillStyle = `rgb(0,0,${color_strength})`;
                vis_ctx.fill();
    
    
                wave_step_pos += wave_step;
                color_strength += 20;
            }
            vis_ctx.beginPath();
            x = visualizer_cvs.width;
            y = visualizer_cvs.height;
            vis_ctx.arc(x, y, 3, 0, 2*Math.PI);
            vis_ctx.fillStyle = `rgb(${color_strength},0,0)`;
            vis_ctx.fill();
    
            vis_ctx.beginPath();
            ctrl_point_1_x = x - (wave_step/4);
            ctrl_point_1_y = visualizer_cvs.height - (this._freq_array[points_count-1] / 256 * height);//last bar height.
            vis_ctx.arc(ctrl_point_1_x, ctrl_point_1_y, 3, 0, 2*Math.PI);
            vis_ctx.fillStyle = `rgb(0,${color_strength},0)`;
            vis_ctx.fill();
    
            vis_ctx.beginPath();
            ctrl_point_2_x = ctrl_point_1_x;
            ctrl_point_2_y = y;
            vis_ctx.arc(ctrl_point_2_x, ctrl_point_2_y, 3, 0, 2*Math.PI);
            vis_ctx.fillStyle = `rgb(0,0,${color_strength})`;
            vis_ctx.fill();    
        }

        //DEBUG ^^^^###########################################################################################

        //END OF STRAIGHT WAVE

        //finished updating
        return true;
    }
}















/**
 * Visual object to represent a basic shape, like a square or ellipse.
 * This object supports multiple background options.
 *
 * @export
 * @class VShape
 * @extends {VisualObject}
 */
export class VShape extends VisualObject {
    /**
     * Creates an instance of VShape.
     * @param {SaveHandler} save_handler The SaveHandler where data is loaded and stored.
     * @param {HTMLElement} rack_parent The DOM element in which the rack is placed in the UI.
     * @param {string} [id=""] The assigned unique ID for the object.
     * @memberof VShape
     */
    constructor(save_handler, rack_parent, id = "") {
        super(save_handler, rack_parent, id);
        this._TYPE = "shape";
        this.assertType();
        if (!this._owner_project.export_mode) this._parameter_rack.icon = "<i class=\"ri-image-fill\"></i>";

        //#################
        //UNIQUE PROPERTIES
        //#################

        this._properties["border_radius"] = new property.VPBorderRadius(this._save_handler, this);
        this._properties["box_shadow"] = new property.VPBoxShadow(this._save_handler, this);
        this._properties["background"] = new property.VPBackground(this._save_handler, this);

        //###################
        //CREATE HTML ELEMENT
        //###################

        //canvas or div depending of the context
        this._element = document.createElement("div");

        //basic parameters
        this._screen.appendChild(this._element);
        this._element.style.position = "absolute";
        this._element.style.display = "inline-block";
        this._element.style.overflow = "hidden";


        //###########
        //UPDATE DATA
        //###########

        this._properties["border_radius"].subscribeToEvent("value_changed", (value) => {
            this._element.style.borderRadius = value;
        });

        this._properties["box_shadow"].subscribeToEvent("value_changed", (value) => {
            this._element.style.boxShadow = value;
        });

        this._properties["background"].subscribeToEvent("value_changed", (value) => {
            switch (value.type) {//background
                case "color":
                    this._element.style.background = "";
                    this._element.style.backgroundColor = value.last_color;
                    this._element.style.backgroundImage = "";
                    break;
                case "gradient":
                    this._element.style.backgroundImage = "";
                    this._element.style.background = value.last_gradient;
                    this._element.style.backgroundColor = "";
                    break;
                case "image":
                    this._element.style.background = "";
                    this._element.style.backgroundColor = "";
                    if (value.last_image !== "") {
                        let url;
                        let full_path = `${this._owner_project.working_dir}/temp/current_save/assets/${this._id}/background/${value.last_image}`;
                        
                        //set url to use for css
                        if (this._owner_project.export_mode) {
                            url = this.fullPathToCSSPath(`${this._owner_project.root_dir}/html`, full_path);
                        } else {
                            url = this.fullPathToCSSPath(`${this._owner_project.root_dir}`, full_path);
                        }
                        
                        this._element.style.backgroundImage = `url("${url}")`;
                    } else {
                        this._element.style.backgroundImage = "";
                        this._element.style.backgroundColor = "#000000";
                    }
                    this._element.style.backgroundRepeat = value.repeat;
                    break;
            }
            this._element.style.backgroundSize = value.size;//background size
        });


        //mandatory for initialization
        this.triggerUpdateData();
    }

    /**
     * transforms an absolute path into a CSS path given the working directory
     * This might be a big gas engine, option to test: using absolute path that starts with /.
     *
     * @param {String} working_dir absolute path of the working directory of the app.
     * @param {String} absolute_path absolute path of the image.
     * @return {String} a relative path to the image. 
     * @memberof VShape
     */
    fullPathToCSSPath(working_dir, absolute_path) {
        //setup working directory information
        working_dir = working_dir.replace(/^.*\/$/, "").replace(/^.*\\$/, ""); //remove last (anti)slash
        let splitter = (this._owner_project.os === "win32") ? "\\" : "/";
        
        //find the number of upper levels from the working directory.
        //-1 because we don't want to count what is before the root slash
        //(either empty or drive letter)
        let number_of_upper_levels = working_dir.split(splitter).count - 1;

        //build relative path
        let relative_path = "";
        //apply upper jumps
        for (let i = 0; i < number_of_upper_levels; i++) relative_path += "../";
        //format absolute path to be appended by using only / and removing the root part
        if (this._owner_project.os === "win32") absolute_path = absolute_path.split("\\").join("/");
        //remove everything until the first occurence of a /
        absolute_path = absolute_path.replace(/[^/]*/, "");

        relative_path += absolute_path;

        return relative_path;
    }

    /**
     * Updates this object's display.
     *
     * @override
     * @return {Boolean} 
     * @memberof VShape
     */
    update() {
        //nothing but returning true.
        //finished updating
        return true;
    }
}
