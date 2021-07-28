# Command Line Interface

## Using the CLI

### Source Code

`npm start -- -- [args]`, args being the subcommand and its arguments.

### Compiled source

`<executable_path> -- [args]`

If you are on Windows:

`start /wait <executable_path> -- [args]`.

## Commands

`.` is `<executable_path>`.
An invalid command won't launch the app and throw an error.

### no sub-command

`. [--help] [--version]`

Get help and software version. With no flags, launches the app.

### load

`. load <savefile>`

Launches the app with the specified save file.
- `<savefile>`: .w2bzip save file to load immediately.

### export

`. export <args>`

Export a project given as input into a video file specified as output.
- `<-i|--input> <input_save>`: Path to the input project in .w2bzip format.
- `<-o|--output> <video_path>`: Path for the output .mp4 video.
- `[-j|--jpeg]`: Use JPEG export instead of PNG export for  screenshots.