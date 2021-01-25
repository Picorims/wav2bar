# Settings save format

## Table of Contents
1. [v1](#v1)

## v1

### Information

- **Affect versions:** beta 0.1.0 indev and above;
- **Extension:** .json;
- **Backward compatibility:** none;

### Breaking Changes

No breaking change

### Other changes

Initial save version

### data structure
```json
{
    "save_version": 1,
    "software_version_used": "[SOFTWARE_VERSION] [STATUS]", //ex: 0.1.0 beta
    "ffmpeg": {
        "ffmpeg_path": "string",
        "ffprobe_path": "string"
    }
}
```