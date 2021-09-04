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
        if (!imports.utils.IsAString(id)) throw `${id} is not a string.`;
        
        return id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i) !== null;
    }

    //verify if the id exists in the save.
    uniqueID(id) {
        if (!imports.utils.IsAString(id)) throw `${id} is not a string.`;
        
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