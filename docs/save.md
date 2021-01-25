# Save format

## Table of Contents
1. [v1](#v1)
1. [v2](#v2)

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
- **data.json:** Stores All the save data.

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

- **Affect versions:** beta 0.1.0 indev and above;
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
\   \   \   \
```
- **data.json:** Stores All the save data.

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