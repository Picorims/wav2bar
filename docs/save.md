# Save format

## Table of Contents
1. [v1](#v1)
2. [v2](#v2)
3. [v3](#v3)
4. [v4](#v4)

## v1

### Information

- **Affect versions:** beta 0.1.0 indev;
- **Extension:** .w2bzip (previously .json);
- **Backward compatibility:** none;
- **else:**
    - images are not saved (they are found if the url is valid).
    - audio is not saved.

### Breaking Changes

No breaking change

### Other changes

Initial save version

### archive structure

```
root
|-data.json
\
```
- **data.json:** Stores all the save data.

### data structure
```json
{
    "save_version": 1,
    "software_version_used": "0.1.0",
    "screen": {
        "width": int,
        "height": int
    },
    "fps": int,
    "objects": []
}
```

### objects structure

#### background
```json
{
    "object_type": "background",
    "id": "uuidv4",
    "name": "name of object",
    "layer": int >= -1,
    "background": "css background string",
    "size": "css background-size string"
}
```

#### image
```json
{
    "object_type": "image",
    "id": "uuidv4",
    "name": "name_of_object",
    "layer": int >= -1,
    "x": int, //(px)
    "y": int, //(px)
    "width": int >= 0, //(px)
    "height": int >= 0, //(px)
    "rotation": int_angle, //(deg)
    "background": "css background string",
    "size": "css background-size string",
    "border_radius": "css border-radius string",
    "box_shadow": "css box-shadow string",
}
```

#### particle flow
```json
{
    "object_type": "particle_flow",
    "id": "uuidv4",
    "name": "name of object",
    "layer": int >= -1,
    "x": int, //(px)
    "y": int, //(px)
    "width": int >= 0, //(px)
    "height": int >= 0, //(px)
    "particle_radius_range": [min_int_radius, max_int_radius], //(px) (min > max possible)
    "type": "radial"|"directional",
    "center": { //spawn position
        "x": int, //(px)
        "y": int, //(px)
    },
    "particle_direction": 0 <= float_angle <= 2PI, //(radian)
    "spawn_probability": 0 <= float <= 1, //probability to spawn a particle at each test (0: none, 1: full)
    "spawn_tests": int >= 1, //how many spawn tests are done at every frame
    "color": "string", //(hex, rgb, rgba)
}
```

#### text
```json
{
    "object_type": "text",
    "id": "uuidv4",
    "name": "name of object",
    "layer": int >= -1,
    "x": int, //(px)
    "y": int, //(px)
    "width": int >= 0, //(px)
    "height": int >= 0, //(px)
    "rotation": int_angle, //(deg)
    "type": "any"|"time",
    "text": "text content",
    "font_size": int >= 0, //(px)
    "color": "string", //(hex, rgb, rgba)
    "italic": true|false, (bool)
    "bold": true|false, (bool)
    "underline": true|false, (bool)
    "overline": true|false, (bool)
    "line_through": true|false, (bool)
    "text_align": "left"|"center"|"right",
    "text_shadow": "css text-shadow string",
}
```

#### timer
```json
{
    "object_type": "timer",
    "id": "uuidv4",
    "name": "name of object",
    "layer": int >= -1,
    "x": int, //(px)
    "y": int, //(px)
    "width": int >= 0, //(px)
    "height": int >= 0, //(px)
    "rotation": int_angle, //(deg)
    "type": "bar"|"point",
    "color": "string", //(hex, rgb, rgba)
    "border_to_bar_space": int >= 0, //(px)
    "border_thickness": int >= 0, //(px)
    "border_radius": "css broder-radius string",
    "box_shadow": "css box-shadow string",
}
```

#### visualizer
```json
{
    "object_type": "visualizer",
    "id": "uuidv4",
    "name": "name of object",
    "layer": int >= -1,
    "x": int, //(px)
    "y": int, //(px)
    "width": int >= 0, //(px)
    "height": int >= 0, //(px)
    "rotation": int, //(deg)
    "radius": int >= 0, //(px)
    "type": "straight"|"straight-wave"|"circular",
    "points_count": int > 0,
    "analyser_range": [int, int], //(between 0 and 1023 included) (min > max possible)
    "visualization_smoothing": {
        "type": "constant_decay"|"proportional_decrease"|"average",
        "factor": float >= 0,
    },
    "color": "string", //(hex, rgb, rgba)
    "bar_thickness": int >= 0, //(px)
    "border_radius": "css broder-radius string",
    "box_shadow": "css box-shadow string",
}
```

---

## v2

### Information

- **Affect versions:** beta 0.1.0 indev to beta 0.1.2;
- **Extension:** .w2bzip;
- **Backward compatibility:** none;
- **else:**
    - audio is not saved.

### Breaking Changes

- Background storage has changed: `background` is now an object
with all the required information.
- `size` is now `background.size`.

### Other changes

- last color, last gradient and last image used are all saved.
- background repeat is now configurable.

### archive structure

```
root
|-data.json
|-assets
|   |-[OBJECT_ID]
|   |   |-background
|   |   |   |-[IMAGE_NAME]
|   |   \   \
|   |-audio
|   |   |-[AUDIO_FILENAME]
\   \   \
```
- **data.json:** Stores all the save data.

### data structure
```json
{
    "save_version": 2,
    "software_version_used": "[SOFTWARE_VERSION] [STATUS]", //ex: 0.1.0 beta
    "screen": {
        "width": int,
        "height": int
    },
    "fps": int,
    "audio_filename": "string",
    "objects": []
}
```

### objects structure

#### background
```json
{
    "object_type": "background",
    "id": "uuidv4",
    "name": "name of object",
    "layer": int >= -1,
    "background": {
        "type": "color"|"gradient"|"image",
        "last_color": "string", //(hex, rgb, rgba)
        "last_gradient": "css gradient",
        "last_image": "image_name", //(path: ./temp/current_save/assets/object_id/background/image_name_with_extension)
        "size": "css background-size string",
        "repeat": "no-repeat"|"repeat-x"|"repeat-y"|"repeat",
    },
}
```

#### image
```json
{
    "object_type": "image",
    "id": "uuidv4",
    "name": "name_of_object",
    "layer": int >= -1,
    "x": int, //(px)
    "y": int, //(px)
    "width": int >= 0, //(px)
    "height": int >= 0, //(px)
    "rotation": int_angle, //(deg)
    "background": {
        "type": "color"|"gradient"|"image",
        "last_color": "string", //(hex, rgb, rgba)
        "last_gradient": "css gradient",
        "last_image": "image_name", //(path: ./temp/current_save/assets/object_id/background/image_name_with_extension)
        "size": "css background-size string",
        "repeat": "no-repeat"|"repeat-x"|"repeat-y"|"repeat",
    },
    "border_radius": "css border-radius string",
    "box_shadow": "css box-shadow string",
}
```

#### particle flow
```json
{
    "object_type": "particle_flow",
    "id": "uuidv4",
    "name": "name of object",
    "layer": int >= -1,
    "x": int, //(px)
    "y": int, //(px)
    "width": int >= 0, //(px)
    "height": int >= 0, //(px)
    "particle_radius_range": [min_int_radius, max_int_radius], //(px) (min > max possible)
    "type": "radial"|"directional",
    "center": { //spawn position
        "x": int, //(px)
        "y": int, //(px)
    },
    "particle_direction": 0 <= float_angle <= 2PI, //(radian)
    "spawn_probability": 0 <= float <= 1, //probability to spawn a particle at each test (0: none, 1: full)
    "spawn_tests": int >= 1, //how many spawn tests are done at every frame
    "color": "string", //(hex, rgb, rgba)
}
```

#### text
```json
{
    "object_type": "text",
    "id": "uuidv4",
    "name": "name of object",
    "layer": int >= -1,
    "x": int, //(px)
    "y": int, //(px)
    "width": int >= 0, //(px)
    "height": int >= 0, //(px)
    "rotation": int_angle, //(deg)
    "type": "any"|"time",
    "text": "text content",
    "font_size": int >= 0, //(px)
    "color": "string", //(hex, rgb, rgba)
    "italic": true|false, (bool)
    "bold": true|false, (bool)
    "underline": true|false, (bool)
    "overline": true|false, (bool)
    "line_through": true|false, (bool)
    "text_align": "left"|"center"|"right",
    "text_shadow": "css text-shadow string",
}
```

#### timer
```json
{
    "object_type": "timer",
    "id": "uuidv4",
    "name": "name of object",
    "layer": int >= -1,
    "x": int, //(px)
    "y": int, //(px)
    "width": int >= 0, //(px)
    "height": int >= 0, //(px)
    "rotation": int_angle, //(deg)
    "type": "bar"|"point",
    "color": "string", //(hex, rgb, rgba)
    "border_to_bar_space": int >= 0, //(px)
    "border_thickness": int >= 0, //(px)
    "border_radius": "css broder-radius string",
    "box_shadow": "css box-shadow string",
}
```

#### visualizer
```json
{
    "object_type": "visualizer",
    "id": "uuidv4",
    "name": "name of object",
    "layer": int >= -1,
    "x": int, //(px)
    "y": int, //(px)
    "width": int >= 0, //(px)
    "height": int >= 0, //(px)
    "rotation": int, //(deg)
    "radius": int >= 0, //(px)
    "type": "straight"|"straight-wave"|"circular",
    "points_count": int > 0,
    "analyser_range": [int, int], //(between 0 and 1023 included) (min > max possible)
    "visualization_smoothing": {
        "type": "constant_decay"|"proportional_decrease"|"average",
        "factor": float >= 0,
    },
    "color": "string", //(hex, rgb, rgba)
    "bar_thickness": int >= 0, //(px)
    "border_radius": "css broder-radius string",
    "box_shadow": "css box-shadow string",
}
```
---

## v3

### Information

- **Affect versions:** beta 0.2.0 indev to beta 0.2.2;
- **Extension:** .w2bzip;
- **Backward compatibility:** v2, new values should be ignored;
- **else:**
    - Nothing.

### Breaking Changes

- None.

### Other changes

- SVG filters support.

### archive structure

```
root
|-data.json
|-assets
|   |-[OBJECT_ID]
|   |   |-background
|   |   |   |-[IMAGE_NAME]
|   |   \   \
|   |-audio
|   |   |-[AUDIO_FILENAME]
\   \   \
```
- **data.json:** Stores all the save data.

### data structure
```json
{
    "save_version": 3,
    "software_version_used": "[SOFTWARE_VERSION] [STATUS]", //ex: 0.1.0 beta
    "screen": {
        "width": int,
        "height": int
    },
    "fps": int,
    "audio_filename": "string",
    "objects": []
}
```

### objects structure

#### background
```json
{
    "object_type": "background",
    "id": "uuidv4",
    "name": "name of object",
    "layer": int >= -1,
    "background": {
        "type": "color"|"gradient"|"image",
        "last_color": "string", //(hex, rgb, rgba)
        "last_gradient": "css gradient",
        "last_image": "image_name", //(path: ./temp/current_save/assets/object_id/background/image_name_with_extension)
        "size": "css background-size string",
        "repeat": "no-repeat"|"repeat-x"|"repeat-y"|"repeat",
    },
    "svg_filters": "string", //(list of <filter> tag separated by "[#]")
}
```

#### image
```json
{
    "object_type": "image",
    "id": "uuidv4",
    "name": "name_of_object",
    "layer": int >= -1,
    "x": int, //(px)
    "y": int, //(px)
    "width": int >= 0, //(px)
    "height": int >= 0, //(px)
    "rotation": int_angle, //(deg)
    "background": {
        "type": "color"|"gradient"|"image",
        "last_color": "string", //(hex, rgb, rgba)
        "last_gradient": "css gradient",
        "last_image": "image_name", //(path: ./temp/current_save/assets/object_id/background/image_name_with_extension)
        "size": "css background-size string",
        "repeat": "no-repeat"|"repeat-x"|"repeat-y"|"repeat",
    },
    "border_radius": "css border-radius string",
    "box_shadow": "css box-shadow string",
    "svg_filters": "string", //(list of <filter> tag separated by "[#]")
}
```

#### particle flow
```json
{
    "object_type": "particle_flow",
    "id": "uuidv4",
    "name": "name of object",
    "layer": int >= -1,
    "x": int, //(px)
    "y": int, //(px)
    "width": int >= 0, //(px)
    "height": int >= 0, //(px)
    "particle_radius_range": [min_int_radius, max_int_radius], //(px) (min > max possible)
    "type": "radial"|"directional",
    "center": { //spawn position
        "x": int, //(px)
        "y": int, //(px)
    },
    "particle_direction": 0 <= float_angle <= 2PI, //(radian)
    "spawn_probability": 0 <= float <= 1, //probability to spawn a particle at each test (0: none, 1: full)
    "spawn_tests": int >= 1, //how many spawn tests are done at every frame
    "color": "string", //(hex, rgb, rgba)
    "svg_filters": "string", //(list of <filter> tag separated by "[#]")
}
```

#### text
```json
{
    "object_type": "text",
    "id": "uuidv4",
    "name": "name of object",
    "layer": int >= -1,
    "x": int, //(px)
    "y": int, //(px)
    "width": int >= 0, //(px)
    "height": int >= 0, //(px)
    "rotation": int_angle, //(deg)
    "type": "any"|"time",
    "text": "text content",
    "font_size": int >= 0, //(px)
    "color": "string", //(hex, rgb, rgba)
    "italic": true|false, (bool)
    "bold": true|false, (bool)
    "underline": true|false, (bool)
    "overline": true|false, (bool)
    "line_through": true|false, (bool)
    "text_align": "left"|"center"|"right",
    "text_shadow": "css text-shadow string",
    "svg_filters": "string", //(list of <filter> tag separated by "[#]")
}
```

#### timer
```json
{
    "object_type": "timer",
    "id": "uuidv4",
    "name": "name of object",
    "layer": int >= -1,
    "x": int, //(px)
    "y": int, //(px)
    "width": int >= 0, //(px)
    "height": int >= 0, //(px)
    "rotation": int_angle, //(deg)
    "type": "bar"|"point",
    "color": "string", //(hex, rgb, rgba)
    "border_to_bar_space": int >= 0, //(px)
    "border_thickness": int >= 0, //(px)
    "border_radius": "css broder-radius string",
    "box_shadow": "css box-shadow string",
    "svg_filters": "string", //(list of <filter> tag separated by "[#]")
}
```

#### visualizer
```json
{
    "object_type": "visualizer",
    "id": "uuidv4",
    "name": "name of object",
    "layer": int >= -1,
    "x": int, //(px)
    "y": int, //(px)
    "width": int >= 0, //(px)
    "height": int >= 0, //(px)
    "rotation": int, //(deg)
    "radius": int >= 0, //(px)
    "type": "straight"|"straight-wave"|"circular",
    "points_count": int > 0,
    "analyser_range": [int, int], //(between 0 and 1023 included) (min > max possible)
    "visualization_smoothing": {
        "type": "constant_decay"|"proportional_decrease"|"average",
        "factor": float >= 0,
    },
    "color": "string", //(hex, rgb, rgba)
    "bar_thickness": int >= 0, //(px)
    "border_radius": "css broder-radius string",
    "box_shadow": "css box-shadow string",
    "svg_filters": "string", //(list of <filter> tag separated by "[#]")
}
```

---

## v4

### Information

- **Affect versions:** beta 0.3.0 indev and above;
- **Extension:** .w2bzip;
- **Backward compatibility:** none;
- **else:**
    - Now an object property sharing the same name is managed the same way. The value testing is exactly the same. They only may be interpreted differently by the objects themselves depending of the context. However, interpretation differences should remain small.

### Breaking Changes

- Object storage has completely changed in a way that can't be understood by previous version parsers. ID storage has changed, and many property names and structure have changed as well.
- Split types into more specific types.
- Removed background object.
- Timer positioning has changed. The same values from the precedent version won't produce the same results.

### Other changes

- Particle flows support rotation
- version used for initial creation is now stored independently from its version lastly used to save it.

### archive structure

```
root
|-data.json
|-assets
|   |-[OBJECT_ID]
|   |   |-background
|   |   |   |-[IMAGE_NAME]
|   |   \   \
|   |-audio
|   |   |-[AUDIO_FILENAME]
\   \   \
```
- **data.json:** Stores all the save data.

### data structure
```json
{
    "save_version": 4,
    "software_version_used": "[SOFTWARE_VERSION] [STATUS]", //ex: 0.1.0 beta
    "software_version_first_created": "[SOFTWARE_VERSION] [STATUS]", //ex: 0.1.0 beta
    "screen": {
        "width": int,
        "height": int
    },
    "fps": int,
    "audio_filename": "string",
    "objects": {
        "uuid": {
            //data
        },
        "uuid": {
            //data
        }
        //...
    }
}
```

### global properties

- **__general information:__**
    - `save_version`:
        - **type:** integer
        - **allowed values:** value >= 1
        - **description:** Defines the save version used, the number corresponding to the version described in this document.
    - `software_version_used`:
        - **type:** string
        - **allowed values:** any string
        - **description:** Wav2Bar version in which the save was last modified.
    - `software_version_first_created`:
        - **type:** string
        - **allowed values:** any string
        - **description:** Wav2Bar version in which the save was first created. This is useful to know through which conversions the save went.
- **__project properties:__**
    - `screen`:
        - **type:** object

                {
                    width: integer
                    height: integer
                }
        - **allowed values:** values >= 1
        - **description:** Defines the project's resolution (including for the exported video).
    - `fps`:
        - **type:** integer
        - **allowed values:** values >= 1
        - **description:** Defines the project's frames per second (including for the exported video).
    - `audio_filename`:
        - **type:** string
        - **allowed values:** any string
        - **description:** Name of the audio file in the save used for the project for data visualization. This is also the audio added along the video.
    - `objects`:
        - **type:** object

                {
                    uuid: {
                        ...
                    },
                    ...
                }
        - **allowed values:** object that is a collection of visual objects, describe by their uuid as the root node and its properties listed inside. Useless nodes in a visual object will be ignored.
        - **description:** Stores all the visual objects. For more information see the object properties section and the different type structures.


### objects structure

This is documented from a created save with default values. For more information about properties themselves, go to object properties section.

#### shape

```json
{
    "name": random,
    "layer": 0,
    "coordinates": {
        "x": 0,
        "y": 0
    },
    "size": {
        "width": 400,
        "height": 300
    },
    "rotation": 0,
    "svg_filter": "",
    "visual_object_type": "shape",
    "border_radius": "",
    "box_shadow": "",
    "background": {
        "type": "color",
        "last_color": "#ffffff",
        "last_gradient": "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(255,255,255,1) 100%)",
        "last_image": "",
        "size": "",
        "repeat": "no-repeat"
    }
}
```

#### particle flow

```json
{
    "name": random,
    "layer": 0,
    "coordinates": {
        "x": 0,
        "y": 0
    },
    "size": {
        "width": 400,
        "height": 400
    },
    "rotation": 0,
    "svg_filter": "",
    "visual_object_type": "particle_flow",
    "particle_radius_range": [
        1,
        2
    ],
    "flow_type": "radial",
    "flow_center": {
        "x": 0,
        "y": 0
    },
    "flow_direction": 0,
    "particle_spawn_probability": 0.75,
    "particle_spawn_tests": 1,
    "color": "#ffffff"
}
```

#### text

```json
{
    "name": random,
    "layer": 0,
    "coordinates": {
        "x": 0,
        "y": 0
    },
    "size": {
        "width": 400,
        "height": 100
    },
    "rotation": 0,
    "svg_filter": "",
    "visual_object_type": "text",
    "text_type": "any",
    "text_content": "text",
    "font_size": 20,
    "color": "#ffffff",
    "text_decoration": {
        "italic": false,
        "bold": false,
        "underline": false,
        "overline": false,
        "line_through": false
    },
    "text_align": {
        "horizontal": "center",
        "vertical": "top"
    },
    "text_shadow": ""
}
```

#### timer straight bar

```json
{
    "name": random,
    "layer": 0,
    "coordinates": {
        "x": 0,
        "y": 0
    },
    "size": {
        "width": 400,
        "height": 20
    },
    "rotation": 0,
    "svg_filter": "",
    "color": "#ffffff",
    "border_thickness": 2,
    "border_radius": "",
    "box_shadow": "",
    "visual_object_type": "timer_straight_bar",
    "timer_inner_spacing": 2
}
```

#### timer straight line point

```json
{
    "name": random,
    "layer": 0,
    "coordinates": {
        "x": 0,
        "y": 0
    },
    "size": {
        "width": 400,
        "height": 14
    },
    "rotation": 0,
    "svg_filter": "",
    "color": "#ffffff",
    "border_thickness": 2,
    "border_radius": "",
    "box_shadow": "",
    "visual_object_type": "timer_straight_line_point"
}
```

#### visualizer straight bar

```json
{
    "name": random,
    "layer": 0,
    "coordinates": {
        "x": 0,
        "y": 0
    },
    "size": {
        "width": 400,
        "height": 100
    },
    "rotation": 0,
    "svg_filter": "",
    "visualizer_points_count": 50,
    "visualizer_analyzer_range": [
        0,
        750
    ],
    "visualization_smoothing_type": "average",
    "visualization_smoothing_factor": 0.7,
    "color": "#ffffff",
    "border_radius": "",
    "box_shadow": "",
    "visualizer_bar_thickness": 2,
    "visual_object_type": "visualizer_straight_bar"
}
```

#### visualizer straight wave

```json
{
    "name": random,
    "layer": 0,
    "coordinates": {
        "x": 0,
        "y": 0
    },
    "size": {
        "width": 400,
        "height": 100
    },
    "rotation": 0,
    "svg_filter": "",
    "visualizer_points_count": 50,
    "visualizer_analyzer_range": [
        0,
        750
    ],
    "visualization_smoothing_type": "average",
    "visualization_smoothing_factor": 0.7,
    "color": "#ffffff",
    "visual_object_type": "visualizer_straight_wave"
}
```

#### visualizer circular bar

```json
{
    "name": random,
    "layer": 0,
    "coordinates": {
        "x": 0,
        "y": 0
    },
    "size": {
        "width": 400,
        "height": 400
    },
    "rotation": 0,
    "svg_filter": "",
    "visualizer_points_count": 50,
    "visualizer_analyzer_range": [
        0,
        750
    ],
    "visualization_smoothing_type": "average",
    "visualization_smoothing_factor": 0.7,
    "color": "#ffffff",
    "border_radius": "",
    "box_shadow": "",
    "visualizer_bar_thickness": 2,
    "visual_object_type": "visualizer_circular_bar",
    "visualizer-radius": 30
}
```

### object properties

> Note: `undefined` and `null` are never valid. `NaN` won't be accepted in number properties.

- **__type:__**
    - `visual_object_type`:
        - **type:** string
        - **allowed values:** `["shape","particle_flow","text","timer_straight_bar","timer_straight_line_point","visualizer_straight_bar","visualizer_straight_wave","visualizer_circular_bar"]`
        - **description:** unique type identifier to recognize what the data describes.
- **__common fully shared:__**
    - `name`:
        - **type:** string
        - **allowed values:** Non empty string
        - **description:** Visual object name in the user interface.
    - `layer`:
        - **type:** integer
        - **allowed values:** value >= 0
        - **description:** Order of drawing of objects. The higher the value, the more to the front an object is. The order is defined by this value on all objects from highest to lowest.
    - `coordinates`:
        - **type:** object
            
                {
                    "x": int
                    "y": int
                }
        - **allowed values:** any integer
        - **description:** Position of the object in pixels from the top left of the screen.
    - `size`:
        - **type:** object
            
                {
                    "width": int
                    "height": int
                }
        - **allowed values:** value >= 0
        - **description:** Object size in pixels.
    - `rotation`:
        - **type:** integer
        - **allowed values:** any integer
        - **description:** Object rotation in degrees.
    - `svg_filter`:
        - **type:** string
        - **allowed values:** List of `<filter>` tags separated by `[#]` with no `<script>` tag.
        - **description:** SVG filters to apply on the object.
- **__common:__**
    - `color`:
        - **type:** string
        - **allowed values:** hexadecimal, rgb, rgba, hsv color, using CSS or canvas string syntax.
        - **description:** Object's filling color.
    - `border_radius`:
        - **type:** string
        - **allowed values:** any string
        - **description:** CSS border-radius property to apply on the object.
    - `box_shadow`:
        - **type:** string
        - **allowed values:** any string
        - **description:** CSS box-shadow property to apply on the object.
    - `background`:
        - **type:** object

                {
                    type: string,
                    last_color: string,
                    last_gradient: string,
                    last_image: string,
                    size: string,
                    repeat: string,
                }
        - **allowed values:**
            - type: `["color","gradient","image"]`
            - last_color: hex, rgb, rgba, hsv color, CSS syntax.
            - last_gradient: css gradient.
            - last_image: name of the image with the extension, stored in the background folder of the object.
            - size: `"contain"|"cover"|"x%"|"x% y%"` (x and y being values)
            - repeat: `["no-repeat","repeat","repeat-x","repeat-y"]`
        - **description:** Background applied to the object, filling it completely.
- **__text properties:__**
    - `text_type`:
        - **type:** String
        - **allowed values:** `"any"|"time"`
        - **description:** Defines the text behaviour. any means it is non interpreted input from the user. Other types describe generated text.
            - time: time description of the audio track (elapsed time and duration).
    - `text_content`:
        - **type:** String
        - **allowed values:** Any string without any "\".
        - **description:** Text content displayed by the object.
    - `font_size`:
        - **type:** integer
        - **allowed values:** value >= 0
        - **description:** Font size in pixels of the displayed text.
    - `text_decoration`:
        - **type:** object

                {
                    italic: boolean,
                    bold: boolean,
                    underline: boolean,
                    overline: boolean,
                    line_through: boolean
                }
        - **allowed values:** object with all nodes defined and valid booleans, no string.
        - **description:** Describe text decoration enabled on display.
    - `text_align`:
        - **type:** object

                {
                    horizontal: string
                }
        - **allowed values:**
            - horizontal: `["left","center","right"]`
        - **description:** Describe how text is positioned in the object's container.
    - `text_shadow`:
        - **type:** string
        - **allowed values:** any string
        - **description:** CSS text-shadow to apply to the displayed text.
- **__timer properties:__**
    - `timer_inner_spacing`:
        - **type:** integer
        - **allowed values:** value >= 0
        - **description:** Spacing between the exterior/border of the timer and its inner shape.
    - `border_thickness`:
        - **type:** integer
        - **allowed values:** value >= 0
        - **description:** Thickness of the border of the timer
- **__particle flow properties:__**
    - `particle_radius_range`:
        - **type:** array
        - **allowed values:** array of length 2 of integers.
        - **description:** Range within which a random radius/size is picked for spawned particles.
    - `flow_type`:
        - **type:** string
        - **allowed values:** `["radial","directional"]`
        - **description:** Describes how the particles behave and flow globally, and what is the global result.
    - `flow_center`:
        - **type:** object

                {
                    x: integer,
                    y: integer
                }
        - **allowed values:** an object with all nodes and any integers.
        - **description:** Sets where the particles spawn when the spawn is a point.
    - `flow_direction`:
        - **type:** integer
        - **allowed values:** value between 0 and 360
        - **description:** Direction in degrees in which the particles go, when it is unidirectional.
    - `particle_spawn_probability`:
        - **type:** float
        - **allowed values:** value between 0 and 1
        - **description:** Probability to spawn a particle for each test.
    - `particle_spawn_tests`:
        - **type:** integer
        - **allowed values:** value >= 1
        - **description:** How many times per frame a spawn test is performed. In other words, how many times per frame an attempt to spawn a particle is done. Thus, it also defines the maximum of spawned particles per frame.
- **__visualizer properties:__**
    - `visualizer_radius`:
        - **type:** integer
        - **allowed values:** value >= 0
        - **description:** For circular visualizer, defines their display radius.
    - `visualizer_points_count`:
        - **type:** integer
        - **allowed values:** value >= 0
        - **description:** Precision of the visualizer, how many points of the frequency array are represented. If it exceeds the inner technical precision, more points will be drawn for the same values (there will be duplicates).
    - `visualizer_analyzer_range`:
        - **type:** array
        - **allowed values:** 2 values between 0 and 1023
        - **description:** Drawn range for the visualizer. 0 maps to 20Hz and 1023 maps to 20000Hz. The scale is logarithmic.
    - `visualization_smoothing_type`:
        - **type:** string
        - **allowed values:** `["proportional_decrease","linear_decrease","average"]`
        - **description:** Interpolation type of the frequency array between frames.
    - `visualization_smoothing_factor`:
        - **type:** float
        - **allowed values:** value >= 0
        - **description:** Parameter for the visualization smoothing type. Its behaviour differs depending of the mode.
    - `visualizer_bar_thickness`:
        - **type:** integer
        - **allowed values:** value >= 0
        - **description:** For bar visualizer, defines each bar's thickness.
