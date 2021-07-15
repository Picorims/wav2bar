//MIT License - Copyright (c) 2020-2021 Picorims

//VISUALIZER OBJECT PROCESS

/*data = {
    object_type: "visualizer",
    id: ?, (UUID)
    name: ?, (string)
    layer: 1, (integer)
    x: ?, (px)
    y: ?, (px)
    width: ?, (px)
    height: ?, (px)
    rotation: ?, (deg)
    radius: ?, (px)
    type: ("straight"||"straight-wave"||"circular"),
    points_count: ?, (integer)
    analyser_range: [?, ?], (between 0 and 1023 included, min < max)
    visualization_smoothing: {
        type: ("constant_decay"||"proportional_decrease"||"average"),
        factor: ?, (positive value)
    },
    color: ?, (string, hex, rgb, rgba)
    bar_thickness: ?, (px)
    border_radius: ?, (css border-radius, string)
    box_shadow: ?, (css box-shadow, string)
}*/

function Visualizer(glob_data) {
    if (imports.utils.IsUndefined(glob_data)) throw "Visualizer: data missing!";

    this.data = glob_data;//collect data
    this.data.object_type = "visualizer";
    this.bars = [];//contain all bars for type "straight" and "straight-wave"
    objects.push(this);//add the object to the list

    //default values
    this.DEFAULTS = {
        NAME: this.data.object_type,
        LAYER: 0,
        X: 0,
        Y: 0,
        WIDTH: 300,
        HEIGHT: 100,
        ROTATION: 0,
        RADIUS: 50,
        TYPE: "straight",
        POINTS_COUNT: 50,
        ANALYSER_RANGE: [0,750],
        VISUALIZATION_SMOOTHING: {
            TYPE: "average",
            FACTOR: 0.7,
        },
        COLOR: "#ffffff",
        BAR_THICKNESS: 2,
        BORDER_RADIUS: "",
        BOX_SHADOW: "",
    }


    //########################################
    //VERIFY RECEIVED DATA, SET DEFAULT VALUES
    //########################################

    //Note: ignore_undefined is useful when we only want to verify the given values without setting any default value
    //(invalid data is still overwritten)

    this.verifyData = function(data, ignore_undefined) {
        if (imports.utils.IsUndefined(data)) throw "Visualizer.verifyData: data missing!";
        if ( !imports.utils.IsUndefined(ignore_undefined) && !(ignore_undefined === "IGNORE_UNDEFINED") ) throw "Visualizer.verifyData: IGNORE_UNDEFINED is the only valid node.";

        if ( imports.utils.IsUndefined(ignore_undefined) ) ignore_undefined = "";

        //ID
        if ( imports.utils.IsUndefined(data.id) || !imports.utils.IsAString(data.id) || !object_method.validID(data.id, this) ) {
            CustomLog("error","Visualizer object: received an object with an unspecified/invalid ID! A random ID is given.");
            data.id = object_method.generateID();
        }

        //name
        if ( imports.utils.IsUndefined(data.name) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.name = this.DEFAULTS.NAME;}
        if ( !imports.utils.IsUndefined(data.name) && !imports.utils.IsAString(data.name) || data.name === "" ) {
            CustomLog("warn",`Visualizer object: Invalid name! Set to '${this.DEFAULTS.NAME}'.`);
            data.name = this.DEFAULTS.NAME;
        }

        //layer
        if ( imports.utils.IsUndefined(data.layer) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.layer = this.DEFAULTS.LAYER;}
        if ( !imports.utils.IsUndefined(data.layer) && (!imports.utils.IsAnInt(data.layer) || (data.layer <= -1)) ) {
            CustomLog("warn",`Visualizer object: Invalid layer! Set to ${this.DEFAULTS.LAYER}.`);
            data.layer = this.DEFAULTS.LAYER;
        }

        //x
        if ( imports.utils.IsUndefined(data.x) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.x = this.DEFAULTS.X;}
        if ( !imports.utils.IsUndefined(data.x) && !imports.utils.IsAnInt(data.x) ) {
            CustomLog("warn",`Visualizer object: Invalid x coordinate! Set to ${this.DEFAULTS.X}.`);
            data.x = this.DEFAULTS.X;
        }

        //y
        if ( imports.utils.IsUndefined(data.y) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.y = this.DEFAULTS.Y;}
        if ( !imports.utils.IsUndefined(data.y) && !imports.utils.IsAnInt(data.y) ) {
            CustomLog("warn",`Visualizer object: Invalid y coordinate! Set to ${this.DEFAULTS.Y}.`);
            data.y = this.DEFAULTS.Y;
        }

        //width
        if ( imports.utils.IsUndefined(data.width) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.width = this.DEFAULTS.WIDTH;}
        if ( !imports.utils.IsUndefined(data.width) && (!imports.utils.IsAnInt(data.width) || (data.width < 0)) ) {
            CustomLog("warn",`Visualizer object: Invalid width! Set to ${this.DEFAULTS.WIDTH}.`);
            data.width = this.DEFAULTS.WIDTH;
        }

        //height
        if ( imports.utils.IsUndefined(data.height) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.height = this.DEFAULTS.HEIGHT;}
        if ( !imports.utils.IsUndefined(data.height) && (!imports.utils.IsAnInt(data.height) || (data.height < 0)) ) {
            CustomLog("warn",`Visualizer object: Invalid height! Set to ${this.DEFAULTS.HEIGHT}.`);
            data.height = this.DEFAULTS.HEIGHT;
        }

        //rotation
        if ( imports.utils.IsUndefined(data.rotation) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.rotation = this.DEFAULTS.ROTATION;}
        if ( !imports.utils.IsUndefined(data.rotation) && !imports.utils.IsAnInt(data.rotation) ) {
            CustomLog("warn",`Visualizer object: Invalid rotation! Set to ${this.DEFAULTS.ROTATION}.`);
            data.rotation = this.DEFAULTS.ROTATION;
        }

        //radius
        if ( imports.utils.IsUndefined(data.radius) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.radius = this.DEFAULTS.RADIUS;}
        if ( !imports.utils.IsUndefined(data.radius) && (!imports.utils.IsAnInt(data.radius) || (data.radius < 0)) ) {
            CustomLog("warn",`Visualizer object: Invalid radius! Set to ${this.DEFAULTS.RADIUS}.`);
            data.radius = this.DEFAULTS.RADIUS;
        }

        //type
        if ( imports.utils.IsUndefined(data.type) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.type = this.DEFAULTS.TYPE;}
        if ( !imports.utils.IsUndefined(data.type) && (!imports.utils.IsAString(data.type) || ( (data.type !== "straight") && (data.type !== "straight-wave") && (data.type !== "circular") )) ) {
            CustomLog("warn",`Visualizer object: Invalid type! Set to ${this.DEFAULTS.TYPE}.`);
            data.type = this.DEFAULTS.TYPE;
        }

        //points count
        if ( imports.utils.IsUndefined(data.points_count) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.points_count = this.DEFAULTS.POINTS_COUNT;}
        if ( !imports.utils.IsUndefined(data.points_count) && (!imports.utils.IsAnInt(data.points_count) || (data.points_count < 0)) ) {
            CustomLog("warn",`Visualizer object: Invalid points count! Set to ${this.DEFAULTS.POINTS_COUNT}.`);
            data.points_count = this.DEFAULTS.POINTS_COUNT;
        }

        //analyser range
        if ( imports.utils.IsUndefined(data.analyser_range) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.analyser_range = this.DEFAULTS.ANALYSER_RANGE;}
        if ( !imports.utils.IsUndefined(data.analyser_range) && (!imports.utils.IsAnArray(data.analyser_range) || (data.analyser_range.length !== 2) || !imports.utils.IsAnInt(data.analyser_range[0]) || !imports.utils.IsAnInt(data.analyser_range[1]) || (data.analyser_range[0] < 0) || (data.analyser_range[0] > 1023) || (data.analyser_range[1] < 0) || (data.analyser_range[1] > 1023)) ) {
            CustomLog("warn",`Visualizer object: Invalid analyser range! Set to [${this.DEFAULTS.ANALYSER_RANGE[0]},${this.DEFAULTS.ANALYSER_RANGE[1]}].`);
            data.analyser_range = this.DEFAULTS.ANALYSER_RANGE;
        }

        //visualization smoothing (prevent errors related to an incomplete path)
        if ( imports.utils.IsUndefined(data.visualization_smoothing) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.visualization_smoothing = {type: null, factor: null};}


        if ( !imports.utils.IsUndefined(data.visualization_smoothing) ) {//it is undefined if it has not been set before in the data argument and IGNORE_UNDEFINED is active
            //visualization smoothing type
            if ( imports.utils.IsUndefined(data.visualization_smoothing.type) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.visualization_smoothing.type = this.DEFAULTS.VISUALIZATION_SMOOTHING.TYPE;}
            if ( !imports.utils.IsUndefined(data.visualization_smoothing.type) && (!imports.utils.IsAString(data.visualization_smoothing.type) || ( (data.visualization_smoothing.type !== "proportional_decrease") && (data.visualization_smoothing.type !== "constant_decay")  && (data.visualization_smoothing.type !== "average") )) ) {
                CustomLog("warn",`Visualizer object: Invalid visualization smoothing type! Set to ${this.DEFAULTS.VISUALIZATION_SMOOTHING.TYPE}.`);
                data.visualization_smoothing.type = this.DEFAULTS.VISUALIZATION_SMOOTHING.TYPE;
            }

            //visualization smoothing factor
            if ( imports.utils.IsUndefined(data.visualization_smoothing.factor) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.visualization_smoothing.factor = this.DEFAULTS.VISUALIZATION_SMOOTHING.FACTOR;}
            if ( !imports.utils.IsUndefined(data.visualization_smoothing.factor) && (!imports.utils.IsANumber(data.visualization_smoothing.factor) || (data.visualization_smoothing.factor < 0)) ) {
                CustomLog("warn",`Visualizer object: Invalid visualization smoothing factor! Set to ${this.DEFAULTS.VISUALIZATION_SMOOTHING.FACTOR}.`);
                data.visualization_smoothing.factor = this.DEFAULTS.VISUALIZATION_SMOOTHING.FACTOR;
            }
        }

        //color
        if ( imports.utils.IsUndefined(data.color) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.color = this.DEFAULTS.COLOR;}
        if ( !imports.utils.IsUndefined(data.color) && !imports.utils.IsAString(data.color) ) {
            CustomLog("warn",`Visualizer object: Invalid color! Set to ${this.DEFAULTS.COLOR}.`); //do not detect css errors!
            data.color = this.DEFAULTS.COLOR;
        }

        //bar thickness
        if ( imports.utils.IsUndefined(data.bar_thickness) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.bar_thickness = this.DEFAULTS.BAR_THICKNESS;}
        if ( !imports.utils.IsUndefined(data.bar_thickness) && (!imports.utils.IsAnInt(data.bar_thickness) || (data.bar_thickness < 0)) ) {
            CustomLog("warn",`Visualizer object: Invalid bar thickness! Set to ${this.DEFAULTS.BAR_THICKNESS}.`);
            data.bar_thickness = this.DEFAULTS.BAR_THICKNESS;
        }

        //border-radius
        if ( imports.utils.IsUndefined(data.border_radius) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.border_radius = this.DEFAULTS.BORDER_RADIUS;}
        if ( !imports.utils.IsUndefined(data.border_radius) && !imports.utils.IsAString(data.border_radius) ) {
            CustomLog("warn",`Visualizer object: Invalid border-radius! Set to ${this.DEFAULTS.BORDER_RADIUS}.`); //do not detect css errors!
            data.border_radius = this.DEFAULTS.BORDER_RADIUS;
        }

        //box-shadow
        if ( imports.utils.IsUndefined(data.box_shadow) && !(ignore_undefined === "IGNORE_UNDEFINED") ) {data.box_shadow = this.DEFAULTS.BOX_SHADOW;}
        if ( !imports.utils.IsUndefined(data.box_shadow) && !imports.utils.IsAString(data.box_shadow) ) {
            CustomLog("warn",`Visualizer object: Invalid box-shadow! Set to ${this.DEFAULTS.BOX_SHADOW}.`); //do not detect css errors!
            data.box_shadow = this.DEFAULTS.BOX_SHADOW;
        }

        return data;

    }

    this.data = this.verifyData(this.data);




    



    //########################################
    //FUNCTION TO APPLY DATA TO THE VISUALIZER
    //########################################

    this.updateData = function(data) {
        if (imports.utils.IsUndefined(data)) throw "Visualizer.updateData: data missing!";
        //NOTE: it is NOT possible to change the visualizer type (data.type) and id (data.id). A new visualizer must be created in such case!

        if ( imports.utils.IsUndefined(data.id) ) {
            CustomLog("error","Visualizer object: No ID specified!");
            return;
        }

        if (data.id === this.data.id) {//if he is the targeted element (remove executes for all objects!)
            //LOAD DATA
            this.data_backup = JSON.parse(JSON.stringify(this.data)); //keep a copy of the existing data
            this.data = data;//recollect data
            this.data.object_type = "visualizer";

            //VERIFY DATA
            this.data = this.verifyData(this.data, "IGNORE_UNDEFINED");

            //APPLY DATA
            this.data = object_method.mergeData(this.data, this.data_backup); //simple assignement would overwrite existing data
            this.element.style.zIndex = this.data.layer;//layer
            this.element.style.left = this.data.x+"px";//x
            this.element.style.top = this.data.y+"px";//y
            this.element.style.width = this.data.width+"px";//width
            this.element.style.height = this.data.height+"px";//height
            if (this.data.type === "straight-wave") {
                this.element.width = this.data.width;//width
                this.element.height = this.data.height;//height
            }
            this.element.style.transform = `rotate(${this.data.rotation}deg)`;//rotation


            //UPDATE BARS (points_count)
            if ( (this.data.type === "straight") || (this.data.type === "circular") ) {
                //remove existing bars
                for (var i=0; i < this.bars.length; i++) {
                    this.bars[i].remove();
                }
                this.bars = [];

                //create all bars
                var rot_step = 2*Math.PI/this.data.points_count;//for "circular" only
                var rot_pos = 0;                                // ^^^^

                for (var i=0; i < this.data.points_count; i++) {
                    //create a bar
                    var bar_element = document.createElement("div");
                    this.element.appendChild(bar_element);
                    this.bars.push( bar_element );
                    bar_element.style.zIndex = this.data.layer;
                    bar_element.style.width = this.data.bar_thickness+"px";//bar_thickness
                    bar_element.style.minHeight = this.data.bar_thickness+"px";// ^^^^
                    bar_element.style.backgroundColor = this.data.color;//color
                    bar_element.style.borderRadius = this.data.border_radius;//border_radius
                    bar_element.style.boxShadow = this.data.box_shadow;//box shadow

                    //apply rotation for circular mode
                    if (this.data.type === "circular") {
                        //centering
                        bar_element.style.position = "absolute";
                        var center_x = (this.element.offsetWidth / 2) - (bar_element.offsetWidth / 2);
                        var center_y = (this.element.offsetHeight/2);
                        bar_element.style.left = (center_x + Math.cos(rot_pos) * this.data.radius) + "px";//radius
                        bar_element.style.top = (center_y + Math.sin(rot_pos) * this.data.radius) + "px";// ^^^^

                        //transform
                        bar_element.style.transformOrigin = "center top";
                        bar_element.style.transform = `scale(-1,-1) rotate( ${rot_pos+Math.PI/2}rad )`;

                        //iterate
                        rot_pos += rot_step;
                    }
                }
            }

        }
        //END OF updateData();
    }





    //###################
    //CREATE HTML ELEMENT
    //###################

    //canvas or div depending of the context
    if (this.data.type === "straight-wave") {this.element = document.createElement("canvas");}
        else if ( (this.data.type === "straight") || (this.data.type === "circular") ) {this.element = document.createElement("div");}

    //basic parameters
    screen.appendChild(this.element);
    this.element.style.position = "absolute";
    this.element.style.display = "inline-block";
    this.element.style.overflow = "hidden";

    //setup flex for a straight visualizer
    if (this.data.type === "straight") {
        this.element.style.display = "flex";
        this.element.style.flexWrap = "nowrap";
        this.element.style.justifyContent = "space-between";
        this.element.style.alignItems = "flex-end";
    }






    //#############################
    //APPLY DATA FOR THE FIRST TIME
    //#############################
    this.updateData(this.data);




    //#####################
    //CREATE USER INTERFACE
    //#####################
    if (!export_mode) {

        //create category
        this.parameter_container = new imports.ui_components.UIParameterRack(tab.objects, `UI-${this.data.id}`, this.data.name, '<i class="ri-rhythm-line"></i>', {
            default_closed: true,
        });
        this.parameter_container.delete_callback = () => {
            this.remove(this.data.id);
        }
        this.parameter_container.rename_callback = () => {
            InputDialog("Enter a new name for the object:", (result) => {
                this.updateData({id: this.data.id, name: result});
                this.parameter_container.rename(result);
            });
        }

        this.parameters = {
            layer: null,
            coordinates: null,
            size: null,
            rotation: null,
            radius: null,
            points_count: null,
            analyser_range: null,
            visualization_smoothing_type: null,
            visualization_smoothing_factor: null,
            color: null,
            bar_thickness: null,
            border_radius: null,
            box_shadow: null,
        };

        //layer
        this.parameters.layer = new imports.ui_components.UIParameterNumInputList(
            this.parameter_container,
            "",
            false,
            [{
                title: "Layer :",
                unit: "",
                default_value: this.data.layer,
                min: 0,
                step: 1,
                callback: () => {
                    this.updateData({
                        id: this.data.id,
                        layer: parseInt(this.parameters.layer.value(0))
                    });
                }
            }]
        );
        this.parameters.layer.help_string = help.parameter.object.general.layer;

        //x and y
        this.parameters.coordinates = new imports.ui_components.UIParameterNumInputList(
            this.parameter_container,
            "",
            false,
            [{
                title: "X :",
                unit: "px",
                default_value: this.data.x,
                step: 1,
                callback: () => {
                    this.updateData({
                        id: this.data.id,
                        x: parseInt(this.parameters.coordinates.value(0))
                    });
                }
            },
            {
                title: "Y :",
                unit: "px",
                default_value: this.data.y,
                step: 1,
                callback: () => {
                    this.updateData({
                        id: this.data.id,
                        y: parseInt(this.parameters.coordinates.value(1))
                    });
                }
            }]
        );
        this.parameters.coordinates.help_string = help.parameter.object.general.pos;

        //width and height
        this.parameters.size = new imports.ui_components.UIParameterNumInputList(
            this.parameter_container,
            "",
            false,
            [{
                title: "Width :",
                unit: "px",
                default_value: this.data.width,
                min: 0,
                step: 1,
                callback: () => {
                    this.updateData({
                        id: this.data.id,
                        width: parseInt(this.parameters.size.value(0))
                    });
                }
            },
            {
                title: "Height :",
                unit: "px",
                default_value: this.data.height,
                min: 0,
                step: 1,
                callback: () => {
                    this.updateData({
                        id: this.data.id,
                        height: parseInt(this.parameters.size.value(1))
                    });
                }
            }]
        );
        this.parameters.size.help_string = help.parameter.object.general.size;

        //rotation
        this.parameters.rotation = new imports.ui_components.UIParameterNumInputList(
            this.parameter_container,
            "",
            false,
            [{
                title: "Rotation (degrees) :",
                unit: "°",
                default_value: this.data.rotation,
                min: 0,
                step: 1,
                callback: () => {
                    this.updateData({
                        id: this.data.id,
                        rotation: parseInt(this.parameters.rotation.value(0))
                    });
                }
            }]
        );
        this.parameters.rotation.help_string = help.parameter.object.general.rotation;

        //radius
        this.parameters.radius = new imports.ui_components.UIParameterNumInputList(
            this.parameter_container,
            "",
            false,
            [{
                title: "Radius (circular visualizer) :",
                unit: "px",
                default_value: this.data.radius,
                min: 0,
                step: 1,
                callback: () => {
                    this.updateData({
                        id: this.data.id,
                        radius: parseInt(this.parameters.radius.value(0))
                    });
                }
            }]
        );
        this.parameters.radius.help_string = help.parameter.object.visualizer.circular_kind.radius;

        //points count
        this.parameters.points_count = new imports.ui_components.UIParameterNumInputList(
            this.parameter_container,
            "",
            false,
            [{
                title: "Points count :",
                unit: "px",
                default_value: this.data.points_count,
                min: 0,
                step: 1,
                callback: () => {
                    this.updateData({
                        id: this.data.id,
                        points_count: parseInt(this.parameters.points_count.value(0))
                    });
                }
            }]
        );
        this.parameters.points_count.help_string = help.parameter.object.visualizer.general.points_count;

        //analyser range
        this.parameters.analyser_range = new imports.ui_components.UIParameterNumInputList(
            this.parameter_container,
            "Analyser Range",
            true,
            [{
                title: "Min :",
                unit: "",
                default_value: this.data.analyser_range[0],
                min: 0,
                max: 1023,
                step: 1,
                callback: () => {
                    this.updateData({
                        id: this.data.id,
                        analyser_range: [parseInt(this.parameters.analyser_range.value(0)), parseInt(this.parameters.analyser_range.value(1))]
                    });
                }
            },
            {
                title: "Max :",
                unit: "",
                default_value: this.data.analyser_range[1],
                min: 0,
                max: 1023,
                step: 1,
                callback: () => {
                    this.updateData({
                        id: this.data.id,
                        analyser_range: [parseInt(this.parameters.analyser_range.value(0)), parseInt(this.parameters.analyser_range.value(1))]
                    });
                }
            }]
        );
        this.parameters.analyser_range.help_string = help.parameter.object.visualizer.general.analyser_range;

        //type
        this.parameters.visualization_smoothing_type = new imports.ui_components.UIParameterChoice(
            this.parameter_container,
            "Visualization smoothing type",
            ["proportional decrease", "constant decay", "average"],
            this.data.visualization_smoothing.type.replace("_"," "),
            () => {
                this.updateData({
                    id: this.data.id,
                    visualization_smoothing: {
                        type: this.parameters.visualization_smoothing_type.value.replace(" ","_"),
                    }
                });
            }
        );
        this.parameters.visualization_smoothing_type.help_string = help.parameter.object.visualizer.general.visualization_smoothing.type;

        //visualization smoothing_factor
        this.parameters.visualization_smoothing_factor = new imports.ui_components.UIParameterNumInputList(
            this.parameter_container,
            "",
            false,
            [{
                title: "Visualization smoothing factor :",
                unit: "",
                default_value: this.data.visualization_smoothing.factor,
                min: 0,
                max: 1,
                step: 0.01,
                callback: () => {
                    this.updateData({
                        id: this.data.id,
                        visualization_smoothing: {
                            factor: parseFloat(this.parameters.visualization_smoothing_factor.value(0)),
                        }
                    });
                }
            }]
        );
        this.parameters.visualization_smoothing_factor.help_string = help.parameter.object.visualizer.general.visualization_smoothing.factor;

        //color
        this.parameters.color = new imports.ui_components.UIParameterString(
            this.parameter_container,
            "Color (hex, rgb, rgba)",
            this.data.color,
            () => {
                this.updateData({
                    id: this.data.id,
                    color: this.parameters.color.value,
                });
            }
        );
        this.parameters.color.help_string = help.parameter.object.general.color;

        //bar thickness
        this.parameters.bar_thickness = new imports.ui_components.UIParameterNumInputList(
            this.parameter_container,
            "",
            false,
            [{
                title: "Bar thickness :",
                unit: "",
                default_value: this.data.bar_thickness,
                min: 0,
                step: 1,
                callback: () => {
                    this.updateData({
                        id: this.data.id,
                        bar_thickness: parseInt(this.parameters.bar_thickness.value(0))
                    });
                }
            }]
        );
        this.parameters.bar_thickness.help_string = help.parameter.object.visualizer.bar_kind.bar_thickness;

        //border radius
        this.parameters.border_radius = new imports.ui_components.UIParameterString(
            this.parameter_container,
            "Border radius (CSS)",
            this.data.border_radius,
            () => {
                this.updateData({
                    id: this.data.id,
                    border_radius: this.parameters.border_radius.value,
                });
            }
        );
        this.parameters.border_radius.help_string = help.parameter.object.general.border_radius;

        //box-shadow
        this.parameters.box_shadow = new imports.ui_components.UIParameterString(
            this.parameter_container,
            "Box Shadow (CSS)",
            this.data.box_shadow,
            () => {
                this.updateData({
                    id: this.data.id,
                    box_shadow: this.parameters.box_shadow.value,
                });
            }
        );
        this.parameters.box_shadow.help_string = help.parameter.object.general.shadow;

    }






    //##################################
    //FUNCTION TO ANIMATE THE VISUALIZER
    //##################################
    this.update = function() {
        //collect audio data
        var visualizer_frequency_array = imports.utils.MappedArray(frequency_array, this.data.points_count, this.data.analyser_range[0], this.data.analyser_range[1]);

        //apply visualization smoothing
        if (imports.utils.IsUndefined(this.previous_visualizer_frequency_array)) this.previous_visualizer_frequency_array = visualizer_frequency_array;
        var smooth_type = this.data.visualization_smoothing.type;
        var smooth_factor = this.data.visualization_smoothing.factor;

        for (let i=0; i<visualizer_frequency_array.length; i++) {

            if (smooth_type === "constant_decay") {
                //The new value can't decrease more than the factor value between current[i] and previous[i].
                //The decrease is linear as long as the new value is below the old value minus the factor.
                //This factor defines how quick the decay is.

                //factor = 0 prevents from decreasing. factor > (maximum possible value for current[i]) disables the smoothing.
                let scaled_smooth_factor = smooth_factor * 255; //0 to 1 -> 0 to max array value (255 with Int8Array)
                let max_decay_limit = this.previous_visualizer_frequency_array[i] - scaled_smooth_factor;
                if (visualizer_frequency_array[i] < max_decay_limit ) {
                    visualizer_frequency_array[i] = max_decay_limit;
                }

            } else if (smooth_type === "proportional_decrease") {
                //The new value can't decrease more than the previous[i]*factor.
                //The higher current[i] is, the more impacted it is, making low smoothing for high values,
                //but high smoothing for low values.
                //The decrease is proportional as long as the new value is below the old value multiplicated by the factor.

                //factor = 1 prevents from decreasing. factor > 1 indefinitely increase quicker and quicker previous[i].
                //factor = 0 disables the smoothing
                max_proportional_decay_limit = this.previous_visualizer_frequency_array[i] * smooth_factor;
                if (visualizer_frequency_array[i] < max_proportional_decay_limit) {
                    visualizer_frequency_array[i] = max_proportional_decay_limit;
                }

            } else if (smooth_type === "average") {
                //This is very similar to the smoothing system used by the Web Audio API.
                //The formula is the following (|x|: absolute value of x):
                //new[i] = factor * previous[i] + (1-factor) * |current[i]|

                //factor = 0 disables the smoothing. factor = 1 freezes everything and keep previous[i] forever.
                //factor not belonging to [0,1] creates uncontrolled behaviour.
                visualizer_frequency_array[i] = smooth_factor * this.previous_visualizer_frequency_array[i] + (1-smooth_factor) * Math.abs(visualizer_frequency_array[i]);
            }

        }

        this.previous_visualizer_frequency_array = visualizer_frequency_array;



        //STRAIGHT OR CIRCULAR
        //====================
        if ( (this.data.type === "straight") || (this.data.type === "circular") ) {

            var rot_step = 2*Math.PI/this.data.points_count;//for "circular" only
            var rot_pos = 0;                                // ^^^^

            for (var i = 0; i < this.bars.length; i++) {
                //apply data to each bar
                this.bars[i].style.height = (visualizer_frequency_array[i]/256*this.data.height)+"px";//proportionality to adapt to the full height. (max volume = 256)

                if (this.data.type === "circular") {//fix rotation
                    this.bars[i].style.height = ( visualizer_frequency_array[i]/256*(this.data.height/2 - this.data.radius) )+"px";//proportionality to adapt to the full height. (max volume = 256)

                    var bar_element = this.bars[i];

                    //centering
                    var center_x = (this.element.offsetWidth / 2) - (bar_element.offsetWidth / 2);
                    var center_y = (this.element.offsetHeight/2);
                    bar_element.style.left = (center_x + Math.cos(rot_pos) * this.data.radius) + "px";//radius
                    bar_element.style.top = (center_y + Math.sin(rot_pos) * this.data.radius) + "px";// ^^^^

                    //transform
                    bar_element.style.transformOrigin = "center top";
                    bar_element.style.transform = `scale(-1,-1) rotate( ${rot_pos+Math.PI/2}rad )`;

                    //iterate
                    rot_pos += rot_step;
                }

            }

            //END OF STRAIGHT OR CIRCULAR

        }



        //STRAIGHT WAVE
        //=============
        else if (this.data.type === "straight-wave") {
            var visualizer_cvs = this.element;

            //canvas context
            var vis_ctx = visualizer_cvs.getContext("2d");


            //divide the canvas into equal parts
            var wave_step = (visualizer_cvs.width / (this.data.points_count-1));//create steps
            var wave_step_pos = 0;

            //clear
            vis_ctx.clearRect(0, 0, visualizer_cvs.width, visualizer_cvs.height);



            //CREATE THE WAVE
            vis_ctx.beginPath();
            vis_ctx.moveTo(visualizer_frequency_array[i]/256*this.data.height, visualizer_cvs.height);
            //make all wave points
            for (var i=0; i < this.data.points_count; i++) {
                //place a new bezier point
                // => parameters
                var x = wave_step_pos;
                var y = visualizer_cvs.height - (visualizer_frequency_array[i]/256*this.data.height);//proportionality to adapt to the full height. (max volume = 256)
                var ctrl_point_1_x = (i===0) ? x-(wave_step/4) : x-(wave_step/2);//the first point creates a bezier with a width 2 times smaller, so it has to be taken in count!
                var ctrl_point_1_y = (visualizer_cvs.height - (visualizer_frequency_array[i-1]/256*this.data.height) ) || visualizer_cvs.height;//at the same height of the previous point, if that one exists.
                var ctrl_point_2_x = ctrl_point_1_x;
                var ctrl_point_2_y = y;
                // => canvas draw
                vis_ctx.bezierCurveTo(ctrl_point_1_x, ctrl_point_1_y, ctrl_point_2_x, ctrl_point_2_y, x, y);
                wave_step_pos += wave_step;
            }
            // //END THE WAVE
            vis_ctx.lineTo(visualizer_cvs.width, visualizer_cvs.height);

            //DRAW THE WAVE ON THE CANVAS
            vis_ctx.fillStyle = this.data.color;
            vis_ctx.fill();



            //DEBUG #########################################################################################################
            //DEBUG #########################################################################################################
            //DEBUG #########################################################################################################
            //DEBUG #########################################################################################################
            // var wave_step_pos = wave_step/2;//start centered.
            // var r = 180;
            // for (var i=0; i < bars; i++) {
            //     vis_ctx.beginPath();
            //     var x = wave_step_pos;
            //     var y = visualizer_cvs.height - (visualizer_frequency_array[i]/256*this.data.height);//proportionality to adapt to the full height. (max volume = 256)
            //     vis_ctx.arc(x, y, 3, 0, 2*Math.PI);
            //     vis_ctx.fillStyle = `rgb(${r},0,0)`;
            //     vis_ctx.fill();

            //     vis_ctx.beginPath();
            //     var ctrl_point_1_x = (i===0) ? x-(wave_step/4) : x-(wave_step/2);
            //     var ctrl_point_1_y = (visualizer_cvs.height - (visualizer_frequency_array[i-1]/256*this.data.height) ) || visualizer_cvs.height;//at the same height of the previous point, if that one exists.
            //     vis_ctx.arc(ctrl_point_1_x, ctrl_point_1_y, 3, 0, 2*Math.PI);
            //     vis_ctx.fillStyle = `rgb(0,${r},0)`;
            //     vis_ctx.fill();

            //     vis_ctx.beginPath();
            //     var ctrl_point_2_x = ctrl_point_1_x;
            //     var ctrl_point_2_y = y;
            //     vis_ctx.arc(ctrl_point_2_x, ctrl_point_2_y, 3, 0, 2*Math.PI);
            //     vis_ctx.fillStyle = `rgb(0,0,${r})`;
            //     vis_ctx.fill();


            //     wave_step_pos += wave_step;
            //     r += 20;
            // }
            // vis_ctx.beginPath();
            // var x = visualizer_cvs.width;
            // var y = visualizer_cvs.height;
            // vis_ctx.arc(x, y, 3, 0, 2*Math.PI);
            // vis_ctx.fillStyle = `rgb(${r},0,0)`;
            // vis_ctx.fill();

            // vis_ctx.beginPath();
            // var ctrl_point_1_x = x-(wave_step/4);
            // var ctrl_point_1_y = visualizer_cvs.height - (visualizer_frequency_array[this.data.points_count-1]/256*this.data.height);//last bar height.
            // vis_ctx.arc(ctrl_point_1_x, ctrl_point_1_y, 3, 0, 2*Math.PI);
            // vis_ctx.fillStyle = `rgb(0,${r},0)`;
            // vis_ctx.fill();

            // vis_ctx.beginPath();
            // var ctrl_point_2_x = ctrl_point_1_x;
            // var ctrl_point_2_y = y;
            // vis_ctx.arc(ctrl_point_2_x, ctrl_point_2_y, 3, 0, 2*Math.PI);
            // vis_ctx.fillStyle = `rgb(0,0,${r})`;
            // vis_ctx.fill();
            //###########################################################################################
            //###########################################################################################
            //###########################################################################################
            //###########################################################################################

            //END OF STRAIGHT WAVE

        }


        //END OF update();

        //finished updating
        return true;
    }







    //##################################
    //FUNCTION TO ANIMATE THE VISUALIZER
    //##################################

    this.remove = function(id) {
        if (!imports.utils.IsAString(id)) throw `Visualizer.remove: ${id} is not a valid ID.`;

        if (this.data.id === id) {//if he is the targeted element (remove executes for all objects!)
            //remove index
            var index = objects.indexOf(this);
            objects.splice(index, 1);

            //remove element
            this.element.remove();
        }
    }


    //END OF THE OBJECT
}