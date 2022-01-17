//Wav2Bar - Free software for creating audio visualization (motion design) videos
//Copyright (C) 2022  Picorims <picorims.contact@gmail.com>

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

//ELECTRON STARTUP AND MAIN PROCESS

//electron dependencies
const { app,
    BrowserWindow,
    ipcMain,
    shell} = require("electron");

//node js dependencies
const path = require("path");
const fs = require("fs");//file system
const fsExtra = require("fs-extra");
const zipper = require("zip-local");
const os = require("os");
const ft = require("fourier-transform/asm");
require("./node_modules/log4js/lib/appenders/stdout");
require("./node_modules/log4js/lib/appenders/console");
const log4js = require("log4js");
let main_log, main_renderer_log, export_log;
// eslint-disable-next-line no-unused-vars
const colors = require("colors");

//software version
const software_version = require("./package.json").version;
const software_status = "Indev";

//fluent-ffmpeg dependencies
const ffmpeg = require("fluent-ffmpeg");
var ffmpeg_path = "";
var ffprobe_path = "";

//set process directory to the position of main.js (i.e root of the app)
process.chdir(__dirname);
//folder to write temp data and user data
let working_dir;
let cant_write_to_root = false;



/*
#####################
COMMAND LINE ARGUMENT
#####################
*/

/** @type {*} yargs argv output. */
const argv = require("yargs")(process.argv.slice(2))
    .scriptName("wav2bar")
    .command("load <savefile>", "Loads Wav2Bar with a save file.", (yargs) => {
        yargs.positional("savefile", {
            describe: "save file to load",
            type: "string",
        });
    }, (argv) => {
        let regexp = new RegExp(/\.w2bzip$/,"g");
        if (!regexp.test(argv.savefile)) {
            console.log("Missing .w2bzip extension.".red);
            app.quit();
        }
    })
    .command("export", "exports a project as a video file.", (yargs) => {
        yargs.option("input", {
            alias: "i",
            describe: "The path of the save file to export.",
            demandOption: "The input save file is required.",
            type: "string",
            nargs: 1
        }).option("output", {
            alias: "o",
            describe: "The path of the exported video.",
            demandOption: "The output video path is required.",
            type: "string",
            nargs: 1
        }).option("jpeg", {
            alias: "j",
            describe: "Use experimental jpeg export.",
            type: "boolean",
        });
    }, (argv) => {
        let regexpI = new RegExp(/\.w2bzip$/,"g");
        let regexpO = new RegExp(/\.mp4$/,"g");
        if (!regexpI.test(argv.input)) {
            console.log("Missing .w2bzip extension.".red);
            app.quit();
        }
        if (!regexpO.test(argv.output)) {
            console.log("Missing .mp4 extension.".red);
            app.quit();
        }
    })
    .help()
    .strict()
    .argv;


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let export_win;
exports.win = win;
exports.export_win = export_win;

/**
 * Creates the main app window.
 *
 */
function createWindow () {
    main_log.info("creating main renderer...");

    // Create the browser window.
    const { width, height } = require("electron").screen.getPrimaryDisplay().workAreaSize;//screen size
    win = new BrowserWindow({
        icon: path.join(__dirname, "assets/icons/wav2bar_square_logo.png"),
        width: width,
        minWidth: 750,
        minHeight: 500,
        height: height,
        backgroundColor: "#040608",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        show: false,
    });
    //win.webContents.id = 1; READONLY

    win.once("ready-to-show", () => {
        win.show();
    });

    // and load the index.html of the app.
    win.loadFile("index.html");

    // Open the DevTools.
    win.webContents.openDevTools();

    //Hide menu bar
    win.setMenuBarVisibility(false);

    // Emitted when the window is closed.
    win.on("closed", () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        main_log.info("closing main renderer...");
        win = null;
    });

    main_log.info("main renderer created.");
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
    PreInit();
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        main_log.info("quitting...");
        try {
            fsExtra.emptyDirSync(path.resolve(working_dir, "./temp")); //clear cache
        }
        catch (error) {
            main_log.error("Couldn't clear all the cache because some files are still busy.");
        }
        app.quit();
    }
});

app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.



/**
 * Creates the export window.
 *
 */
function createExportWin() {
    main_log.info("creating window for export...");

    export_win = new BrowserWindow({
        icon: path.join(__dirname, "assets/icons/wav2bar_square_logo.png"),
        width: 1500,
        height: 1000,
        resizable: false,
        frame: false,
        enableLargerThanScreen: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            nativeWindowOpen: true,
            backgroundThrottling: false,
        },
    });
    //win.webContents.id = 2; READONLY

    //load the export.html of the app.
    export_win.loadFile("./html/export.html");

    //open dev tools
    //export_win.webContents.openDevTools();

    // export_win.webContents.on("paint", (event, dirty, image) => {
    //     // updateBitmap(dirty, image.getBitmap())
    // });

    main_log.info("export window created.");
}
//exports.createExportWin = createExportWin;

/**
 * Creates an export window
 */
ipcMain.handle("create-export-win", async () => {
    createExportWin();
});

/**
 * Resizes the export window to the new dimensions specified.
 * 
 * @param {Number} width
 * @param {Number} height
 */
ipcMain.handle("resize-export-window", async (event, width, height) => {
    export_win.setSize(width, height);
    main_log.info(`export window: new size: ${width}x${height}`);
});






/**
 * creates a window to display any local html page
 *
 * @param {String} link
 */
function CreateHTMLDisplayWin(link) {
    main_log.info("creating HTML window...");

    let html_win = new BrowserWindow({
        icon: path.join(__dirname, "assets/icons/wav2bar_square_logo.png"),
        width: 1000,
        height: 500,
        resizable: true,
        frame: true,
        enableLargerThanScreen: false,
        webPreferences: {
            nodeIntegration: false,
            nativeWindowOpen: true,
        },
    });

    //load link
    html_win.loadFile(link);

    //Hide menu bar
    win.setMenuBarVisibility(false);


    main_log.info("HTML window created");
}


























//===================================================================================
//===================================================================================
//===================================================================================

/**
 * find working directory to write user and temp data before starting initialization
 *
 */
function PreInit() {
    working_dir = __dirname;
    let test_path = `${__dirname}/test.txt`;
    fs.promises.writeFile(test_path, "can write : OK")
        .then(() => {
            fsExtra.removeSync(test_path);
            Init();
        })
        .catch(() => {
            cant_write_to_root = true;
            working_dir = path.resolve(app.getPath("appData"), "/Wav2Bar");
            if (!fs.existsSync(working_dir)) fs.mkdirSync(working_dir);

            Init();
        });
}

/**
 * main initialization
 *
 */
function Init() {
    let path_temp = path.resolve(working_dir, "./temp");
    let path_temp_render = path.resolve(working_dir, "./temp/render");
    let path_temp_current_save = path.resolve(working_dir, "./temp/current_save");
    let path_user = path.resolve(working_dir, "./user");
    let path_user_settings = path.resolve(working_dir, "./user/settings");
    let path_logs = path.resolve(working_dir, "./logs");

    //create temp directory
    if (!fs.existsSync(path_temp)) fs.mkdirSync(path_temp);
    //clear existing cache if files remains from the last execution
    fsExtra.emptyDirSync(path_temp);
    //recreate the temp hierarchy
    if (!fs.existsSync(path_temp_render)) fs.mkdirSync(path_temp_render);
    if(!fs.existsSync(path_temp_current_save)) fs.mkdirSync(path_temp_current_save);

    //create user directory
    if(!fs.existsSync(path_user)) fs.mkdirSync(path_user);
    if(!fs.existsSync(path_user_settings)) fs.mkdirSync(path_user_settings);

    //create logs directory
    if(!fs.existsSync(path_logs)) fs.mkdirSync(path_logs);



    //Setup log
    let date = new Date();
    let log_name = date.toJSON().split(":").join("-");//replace : with -
    let log_path = path.resolve(path_logs, `${log_name}.log`);

    log4js.configure({
        appenders: {
            file: {type: "file", filename: log_path},
            console: {type: "console"},
        },
        categories: {
            main: {appenders: ["file","console"], level: "trace"},//main process
            main_renderer: {appenders: ["file","console"], level: "trace"},//main renderer process of the app
            export: {appenders: ["file","console"],level: "trace"},//export process
            default: {appenders: ["file","console"],level: "trace"},
        },
    });

    main_log = log4js.getLogger("main");
    main_renderer_log = log4js.getLogger("main_renderer");
    export_log = log4js.getLogger("export");

    main_log.info(`Running Wav2Bar v${software_version} ${software_status}`);
    if (cant_write_to_root) main_log.warn("Can't write in app's root folder. Writing in app data folder provided by the OS.");
    main_log.info(`Working directory: ${working_dir}`);

    //open main window
    createWindow();
}



/**
 * retunrs the process `argv`.
 * @return {*}
 */
ipcMain.handle("argv", () => {
    return argv;
});

/**
 * returnss if the window sending the call is the export window.
 * @return {Boolean}
 */
ipcMain.handle("is-export-win", async (event) => {
    if (!export_win) return false;
    else return event.sender.id === export_win.webContents.id;
});


/**
 * log4js logging from renderer
 * 
 * @param {String} type
 * @param {String} log
 */
ipcMain.handle("log", (event, type, log) => {
    var logger;
    switch (event.sender.id) {
        case win.webContents.id: logger = main_renderer_log; break;
        case export_win.webContents.id: logger = export_log; break;
        default:
            logger = main_log;
            main_log.warn(`receiving logs from an unknown renderer with id ${event.sender.id}!`);
            break;
    }

    switch (type) {
        case "trace":
            logger.trace(log);
            break;
        case "debug":
            logger.debug(log);
            break;
        case "info":
            logger.info(log);
            break;
        case "log":
            logger.log(log);
            break;
        case "warn":
            logger.warn(log);
            break;
        case "error":
            logger.error(log);
            break;
        case "fatal":
            logger.fatal(log);
            break;
    }
});




/**
 * Get the process' working directory.
 * 
 * @return {String}
 */
ipcMain.handle("get-working-dir", async () => {
    return working_dir;
});

/**
 * Get the process' root.
 * 
 * @return {String}
 */

ipcMain.handle("get-app-root", async () => {
    return __dirname;
});




//
/**
 * read a JSON file at the specified path, and return the content of this file as a string.
 * 
 * @param {String} path JSON file path
 * @returns {Object}
 */
ipcMain.handle("read-json-file", async (event, path) => {
    var file_content;

    try {
        main_log.debug(`reading ${path}...`);
        file_content = await fs.promises.readFile(path);
        main_log.debug(`reading ${path} done.`);
        return JSON.parse(file_content);
    } catch (error) {
        main_log.error(`could not read ${path}: ${error}`);
        throw new Error("read-json-file: invalid path provided.");
    }
});



/**
 * write a JSON file at the specified path
 * 
 * @param {String} path Output path
 * @param {String} json_string Stringified JSON data.
 */
ipcMain.handle("write-json-file", async (event, path, json_string) => {
    try {
        main_log.debug(`writing json file to ${path}.`);
        await fs.promises.writeFile(path, json_string);
        main_log.debug(`wrote json file to ${path}.`);
    } catch (error) {
        main_log.error(`could not write ${path}: ${error}`);
        throw new Error(`write-json-file: failed to write file at ${path}.`);
    }
});



/**
 * copy file at the specified path
 * 
 * @param {String} path
 * @param {String} new_path
 */
ipcMain.handle("copy-file", async (event, path, new_path) => {
    try {
        main_log.debug(`copying ${path} to ${path}.`);
        await fs.promises.copyFile(path, new_path);
        main_log.debug(`copied ${path} to ${path}.`);
    } catch (error) {
        main_log.error(`could not copy ${path} to ${new_path}: ${error}`);
        throw new Error(`copy-file: failed to copy ${path} to ${new_path}.`);
    }
});



/**
 * open provided link in external browser
 * 
 * @param {String} link
 */
ipcMain.handle("open-in-browser", async (event, link) => {
    main_log.warn(`opening ${link} in an external browser.`);
    shell.openExternal(link);
});

/**
 * open local html path in a new window.
 * 
 * @param {String} link
 */
ipcMain.handle("open-local-html", async (event, link) => {
    CreateHTMLDisplayWin(link);
});



/**
 * open a folder in the file explorer
 * 
 * @param {String} path_to_open
 */
ipcMain.handle("open-folder-in-file-explorer", async (event, path_to_open) => {
    main_log.warn(`opening ${path_to_open}.`);
    var regexp = new RegExp(/^\.\//);
    if (regexp.test(path_to_open)) path_to_open = path.join(__dirname, path_to_open);
    shell.openPath(path_to_open);
});



/**
 * returns the OS's home path directory
 * 
 * @return {String}
 */
ipcMain.handle("get-home-path", async () => {
    return os.homedir();
});

/**
 * returns the OS type
 * 
 * @return {String}
 */
ipcMain.handle("get-os", async () => {
    return process.platform;
});

/**
 * Get tje full path of a relative path, using Node's path.resolve();
 */
ipcMain.handle("get-full-path", async (event, relative_path) => {
    return path.resolve(relative_path);
});





/**
 * return if a path exists
 * 
 * @param {String} path_to_test
 * @return {Boolean}
 */
ipcMain.handle("path-exists", async (event, path_to_test) => {
    return fs.existsSync(path_to_test);
});




/**
 * read a directory and return its content
 * 
 * @param {String} directory
 * @return {Array}
 */
ipcMain.handle("read-dir", async (event, directory) => {
    try {
        //get files
        main_log.debug(`reading directory ${directory}`);
        let files = await fs.promises.readdir(directory);

        //differentiate files and folders
        var files_object = [];

        for (let i=0; i<files.length; i++) {
            //add file to returned list
            files_object.push({name: files[i], type: "unknown"});

            //some files should not be analyzed whatsoever
            try {
                let file_path = path.resolve(directory, files[i]);
                const stat = await fs.promises.lstat(file_path);

                //set file type
                if (stat.isFile()) {
                    files_object[i].type = "file";
                } else if (stat.isDirectory()) {
                    files_object[i].type = "directory";
                }
            } catch {
                files_object[i].type = "locked_file";
            }
        }

        main_log.debug(`reading directory ${directory} done`);
        return files_object;

    } catch (error) {
        throw new Error(`read-dir: impossible to read this directory: ${error}`);
    }
});




/**
 * create a directory
 * 
 * @param {String} path the directory to create
 */
ipcMain.handle("make-dir", async (event, path) => {
    try {
        main_log.info(`making directory ${path}`);
        await fs.promises.mkdir(path, {recursive: true});
        main_log.info(`${path} created.`);
    } catch (error) {
        main_log.error(`error making ${path}: ${error}`);
        throw new Error(`make-dir: impossible to create this directory: ${error}`);
    }
});




/**
 * clear a directory
 * 
 * @param {String} path the directory to clear
 */
ipcMain.handle("empty-dir", async (event, path) => {
    try {
        main_log.info(`clearing directory ${path}`);
        fsExtra.emptyDirSync(path);
        main_log.info(`cleared directory ${path}.`);
    } catch (error) {
        main_log.error(`error clearing ${path}: ${error}`);
        throw new Error(`empty-dir: impossible to empty this directory: ${error}`);
    }
});








/**
 * exports Int8Array object to file in temp folder
 * 
 * @param {Int8Array} arrayBuffer audio data
 * @type {String} file type
 */
ipcMain.handle("write-audio-to-temp", async (event, arrayBuffer, type) => {
    main_log.debug(`writing file of type ${type} in temp directory...`);
    switch (type) {
        case "audio/x-wav":
        case "audio/wav":
            await fs.promises.writeFile(path.resolve(working_dir ,"./temp/temp.wav"), arrayBuffer);
            break;


        case "audio/mpeg":
        case "audio/mp3":
            await fs.promises.writeFile(path.resolve(working_dir ,"./temp/temp.mp3"), arrayBuffer);
            break;


        case "application/ogg":
            await fs.promises.writeFile(path.resolve(working_dir ,"./temp/temp.ogg"), arrayBuffer);
            break;


        default:
            throw new Error(`WriteAudioToTemp: ${type} is not a valid audio type!`);

    }

    main_log.debug("audio cached.");
} );







/**
 * send an event to the rendering window (export_win)
 * 
 * @param {String} send_event
 * @param {*} data
 */
ipcMain.handle("send-event-to-export-win", async (event, send_event, data) => {
    main_log.debug(`sending event ${send_event} to export window.`);
    export_win.webContents.send(send_event, data);
});






/**
 * takes a Float32Array and get waveform data from it
 * 
 * @param {Float32Array} waveform
 */
ipcMain.handle("pcm-to-spectrum", async (event, waveform) => {
    //get normalized magnitudes for frequencies from 0 to 22050 with interval 44100/1024 ≈ 43Hz
    var spectrum = ft(waveform);
    return spectrum;
});




/**
 * exports the app's rendering screen as an image
 * 
 * @param {Object} screen_data
 * @param {String} name
 * @param {Boolean} use_jpeg
 */
ipcMain.handle("export-screen", async (event, screen_data, name, use_jpeg) => {
    
    main_log.info("Capture requested.");
    main_log.info(`frame: ${name}`);

    try {
        //capture the screen
        let image = await export_win.capturePage(screen_data);//screen_data: x,y,width,height.
        main_log.info("captured! Writing file...");

        //create the file
        if (use_jpeg) await fs.promises.writeFile(path.resolve(working_dir, `./temp/render/${name}.jpeg`), image.toJPEG(100));
        else await fs.promises.writeFile(path.resolve(working_dir, `./temp/render/${name}.png`), image.toPNG());
        main_log.info("image of the screen created!");
    } catch (error) {
        main_log.error(error);
        throw error;
    }
});




/**
 * set ffmpeg path
 * 
 * @param {String} path
 */
ipcMain.handle("set-ffmpeg-path", async (event, path) => {
    ffmpeg_path = path;
});

/**
 * set ffprobe path
 * 
 * @param {String} path
 */
ipcMain.handle("set-ffprobe-path", async (event, path) => {
    ffprobe_path = path;
});



/**
 * creates a video using ffmpeg from a set of frames and an audio file
 * 
 * @param {Object} screen screen data
 * @param {String} audio_format audio file type
 * @param {Number} fps framerate
 * @param {Number} duration duration in seconds
 * @param {String} output_path Where the created video is written on disk.
 * @param {Boolean} use_jpeg use jpeg images instead of png
 */
ipcMain.handle("create-video", async (event, screen, audio_format, fps, duration, output_path, use_jpeg) => {
    return new Promise( (resolve, reject) => {
        main_log.info(`creating video: ${screen.width}x${screen.height}, ${audio_format}, ${fps}fps, duration: ${duration}s, at ${output_path}`);

        //get audio path
        var audio_file_path;
        switch (audio_format) {
            case "audio/mp3":
            case "audio/mpeg":
                audio_file_path = path.resolve(working_dir, "./temp/temp.mp3");
                break;


            case "audio/wav":
            case "audio/x-wav":
                audio_file_path = path.resolve(working_dir, "./temp/temp.wav");
                break;


            case "application/ogg":
                audio_file_path = path.resolve(working_dir, "./temp/temp.ogg");
                break;

            default:
                throw `InitExport: ${audio_format} is not a valid audio type!`;
        }


        //ffmpeg location
        main_log.debug(`ffmpeg path: ${ffmpeg_path}`);
        main_log.debug(`ffprobe path: ${ffprobe_path}`);
        ffmpeg.setFfmpegPath(ffmpeg_path);
        ffmpeg.setFfprobePath(ffprobe_path);

        //DEBUG
        // ffmpeg.getAvailableEncoders((err, encoders) => {
        //     console.log('getAvailableEncoders', encoders);
        // });

        //command
        let frames_input = (use_jpeg)? "./temp/render/frame%d.jpeg" : "./temp/render/frame%d.png";
        ffmpeg()
            .addInput(path.resolve(working_dir, frames_input))
            .inputFPS(fps)
            .addInput(audio_file_path)
            .size(`${screen.width}x${screen.height}`)
            .fps(fps)
            .duration(duration)
            .videoCodec("libx264")
            .outputOptions(["-pix_fmt yuv420p"])//avoid possible trouble in some apps like QuickTime
            .on("start", function() {
                main_log.info("started creating the video...");
            })
            .on("progress", function(info) {
                main_log.info(`${info.frames} frames rendered, ${info.timemark} seconds rendered`);
                win.webContents.send("encoding-progress", info);
            })
            .on("end", function() {
                main_log.info("Video created!");
                resolve();
                win.webContents.send("encoding-finished", true);
            })
            .on("error", function(error) {
                main_log.error("an error occured in the process: " + error.message);
                reject(error);
                win.webContents.send("encoding-finished", false);
            })
            .save(output_path);

    });
});



/**
 * Cache the current save data into the provided path
 * 
 * @param {String} save_path Where to write the cache on disk.
 */
ipcMain.handle("cache-save-file", async (event, save_path) => {
    main_log.info(`loading save file at ${save_path}`);
    var sender;
    switch (event.sender.id) {
        case win.webContents.id: sender = win; break;
        case export_win.webContents.id: sender = export_win; break;
    }

    //check extension
    var regexp = /\.w2bzip$/;
    if(!regexp.test(save_path)) {
        main_log.error("failed to create the save file: missing .w2bzip extension!");
        throw "missing .w2bzip extension!";
    }

    let path_save_to_load = path.resolve(working_dir, "./temp/save_to_load.zip");
    let path_current_save = path.resolve(working_dir, "./temp/current_save");

    //copy file in temp and rename it to zip
    await fs.promises.copyFile(save_path, path_save_to_load);

    //cache save
    fsExtra.emptyDirSync(path_current_save);
    await zipper.unzip(path_save_to_load, function (error, unzipped) {
        if (!error) {
            // extract to the current working directory
            unzipped.save(path_current_save, function() {
                sender.webContents.send("finished-caching-save");
            });
        } else {
            main_log.error(`failed at caching the save file: ${error}`);
        }

    });
});




/**
 * function that packages the content of ./temp/current_save (JSON data, assets...) into a save file.
 * 
 * @param {String} save_path Where to write the save on disk.
 */
ipcMain.handle("create-save-file", async (event, save_path) => {
    main_log.info(`creating save file at ${save_path}`);

    //check extension
    var regexp = /\.w2bzip$/;
    if(!regexp.test(save_path)) {
        main_log.error("failed to create the save file: missing .w2bzip extension!");
        throw "missing .w2bzip extension!";
    }

    //zip current save
    var save_path_zip = save_path.replace(".w2bzip",".zip");
    zipper.zip(path.resolve(working_dir, "./temp/current_save"), function(error, zipped) {

        if (!error) {
            zipped.compress(); // compress before exporting

            //save the zipped file to disk
            zipped.save(save_path_zip, function(error) {
                if (!error) {
                    main_log.info("zipped successfully!");

                    //rename .zip to .w2bzip
                    fs.promises.rename(save_path_zip, save_path);
                    main_log.info(`created save file at ${save_path}`);
                } else {
                    main_log.error(`failed at creating the save file: ${error}`);
                }
            });
        } else {
            main_log.error(`failed at creating the save file: ${error}`);
        }
    });
});