//MIT License - Copyright (c) 2020 Picorims

//ELECTRON STARTUP AND MAIN PROCESS

//electron dependencies
const { app,
    BrowserWindow,
    ipcMain,
    webContents,
    shell, 
    ipcRenderer,
    contentTracing} = require('electron');

//node js dependencies
const path = require("path");
const fs = require("fs");//file system
const os = require("os");
const ft = require('fourier-transform/asm');
require('./node_modules/log4js/lib/appenders/stdout');
require('./node_modules/log4js/lib/appenders/console');
const log4js = require("log4js");
let main_log, main_renderer_log, export_log;
const software_version = require("./package.json").version;
const software_status = 'Beta';

//fluent-ffmpeg dependencies
var ffmpeg = require("fluent-ffmpeg");

//set process directory to the position of main.js (i.e root of the app)
process.chdir(__dirname);


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let export_win;
exports.win = win;
exports.export_win = export_win;

function createWindow () {
    Init();
    main_log.info(`creating main renderer...`);

    // Create the browser window.
    const { width, height } = require('electron').screen.getPrimaryDisplay().workAreaSize;//screen size
    win = new BrowserWindow({
        icon: path.join(__dirname, "assets/icons/wav2bar_square_logo.png"),
        width: width,
        minWidth: 750,
        minHeight: 500,
        height: height,
        backgroundColor: "#000000",
        webPreferences: {
            nodeIntegration: true,
        },
    })
    //win.webContents.id = 1; READONLY

    // and load the index.html of the app.
    win.loadFile('index.html');

    // Open the DevTools.
    win.webContents.openDevTools();

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        main_log.info("closing main renderer...");
        win = null
    })

    main_log.info("main renderer created.");
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        main_log.info("quitting...");
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.



//this window is for video export
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
            nativeWindowOpen: true,
        },
    })
    //win.webContents.id = 2; READONLY
    
    //load the export.html of the app.
    export_win.loadFile('./html/export.html');

    //open dev tools
    //export_win.webContents.openDevTools();

    export_win.webContents.on('paint', (event, dirty, image) => {
        // updateBitmap(dirty, image.getBitmap())
    })

    main_log.info("export window created.");
}
//exports.createExportWin = createExportWin;

ipcMain.handle("create-export-win", async () => {
    createExportWin();
});
ipcMain.handle("resize-export-window", async (event, width, height) => {
    export_win.setSize(width, height);
    main_log.info(`export window: new size: ${width}x${height}`);
});


























//===================================================================================
//===================================================================================
//===================================================================================


function Init() {//main initialization
    
    //create temp directory
    if (!fs.existsSync("./temp")) {
        fs.mkdirSync("./temp");   
    }
    if (!fs.existsSync("./temp/render")) {
        fs.mkdirSync("./temp/render");
    }
    if(!fs.existsSync("./temp/current_save")) {
        fs.mkdirSync("./temp/current_save");
    }



    //Setup log
    let date = new Date();

    // if(!fs.existsSync("./logs")) {
    //     fs.mkdirSync("./logs");
    // }

    let log_name = date.toJSON().split(":").join("-");//replace : with -

    log4js.configure({
        appenders: {
            file: {type: "file", filename: `./logs/${log_name}.log`},
            console: {type: "console"},
        },
        categories: {
            main: {appenders: ['file','console'], level: 'trace'},//main process
            main_renderer: {appenders: ['file','console'], level: 'trace'},//main renderer process of the app
            export: {appenders: ['file','console'],level: 'trace'},//export process
            default: {appenders: ['file','console'],level: 'trace'},
        },
    });

    main_log = log4js.getLogger('main');
    main_renderer_log = log4js.getLogger('main_renderer');
    export_log = log4js.getLogger('export');

    main_log.info(`Running Wav2Bar v${software_version} ${software_status}`);
    
}






//log4js logging from renderer
ipcMain.handle('log', (event, type, log) => {
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
        case 'trace':
            logger.trace(log);
            break;
        case 'debug':
            logger.debug(log);
            break;
        case 'info':
            logger.info(log);
            break;
        case 'log':
            logger.log(log);
            break;
        case 'warn':
            logger.warn(log);
            break;
        case 'error':
            logger.error(log);
            break;
        case 'fatal':
            logger.fatal(log);
            break;
    }
});






//read a JSON file at the specified path, and return the content of this file as a string.
ipcMain.handle('read-json-file', async (event, path) => {
    var file_content;

    try {
        main_log.debug(`reading ${path}...`);
        file_content = await fs.promises.readFile(path);
        main_log.debug(`reading ${path} done.`);
        return JSON.parse(file_content);
    } catch (error) {
        main_log.error(`could not read ${path}: ${error}`)
        throw new Error("read-json-file: invalid path provided.");
    }
});




//open provided link in external browser
ipcMain.handle('open-in-browser', async (event, link) => {
    main_log.warn(`opening ${link} in an external browser.`);
    shell.openExternal(link);
});



//returns the OS's home path directory
ipcMain.handle('get-home-path', async (event) => {
    return os.homedir();
});




//read a directory and return its content
ipcMain.handle('read-dir', async (event, path) => {
    try {
        //get files
        main_log.debug(`reading directory ${path}`);
        files = await fs.promises.readdir(path);

        //differentiate files and folders
        var files_object = [];
        for (let i=0; i<files.length; i++) {

            files_object.push({name: files[i], type: "unknown"});
            
            let file_path = path + '\\' + files[i];
            const stat = await fs.promises.lstat(file_path);
            
            if (stat.isFile()) {
                files_object[i].type = "file";
            } else if (stat.isDirectory()) {
                files_object[i].type = "directory";
            }

        }

        main_log.debug(`reading directory ${path} done`);
        return files_object;

    } catch (error) {
        throw new Error(`read-dir: impossible to read this directory: ${error}`);
    }
});




//create a directory
ipcMain.handle('make-dir', async (event, path) => {
    try {
        main_log.info(`making directory ${path}`);
        await fs.promises.mkdir(path);
        main_log.info(`${path} created.`);
    } catch (error) {
        main_log.error(`error making ${path}: ${error}`);
        throw new Error(`make-dir: impossible to create this directory: ${error}`);
    }
});








//exports Int8Array object to file in ./temp
ipcMain.handle('write-audio-to-temp', async (event, arrayBuffer, type) => {
    main_log.debug(`writing file of type ${type} in temp directory...`);
    switch (type) {
        case "audio/x-wav":
        case "audio/wav":
            await fs.promises.writeFile("./temp/temp.wav", arrayBuffer);
            break;


        case "audio/mpeg":
        case "audio/mp3":
            await fs.promises.writeFile("./temp/temp.mp3", arrayBuffer);
            break;


        case "application/ogg":
            await fs.promises.writeFile("./temp/temp.ogg", arrayBuffer);
            break;


        default:
            throw new Error(`WriteAudioToTemp: ${type} is not a valid audio type!`);
        
    }

    main_log.debug("audio cached.");
} );







//send an event to the rendering window (export_win)
ipcMain.handle('send-event-to-export-win', async (event, send_event, data) => {
    main_log.debug(`sending event ${send_event} to export window.`);
    export_win.webContents.send(send_event, data);
});






//takes a Float32Array and get waveform data from it 
ipcMain.handle('pcm-to-spectrum', async (event, waveform) => {
    //get normalized magnitudes for frequencies from 0 to 22050 with interval 44100/1024 ≈ 43Hz
    var spectrum = ft(waveform);
    return spectrum;
});




//exports the app's rendering screen as an image
ipcMain.handle('export-screen', async (event, screen_data, name) => {
    return new Promise( async (resolve, reject) => {
        
        main_log.info(`Capture requested.`);
        main_log.info(`frame: ${name}`);
        
        try {
            //capture the screen
            image = await export_win.capturePage(screen_data);//screen_data: x,y,width,height.    
            main_log.info("captured! Writing file...");
                
            //create the file
            await fs.promises.writeFile(`./temp/render/${name}.png`, image.toPNG());
            main_log.info("image of the screen created!");
            resolve();
        } catch (error) {
            reject(error);
            main_log.error(error);
        }
    });
});





//creates a video using ffmpeg from a set of frames and an audio file
ipcMain.handle('create-video', async (event, screen, audio_format, fps, duration, output_path) => {
    return new Promise( (resolve, reject) => {
        main_log.info(`creating video: ${screen.width}x${screen.height}, ${audio_format}, ${fps}fps, duration: ${duration}s, at ${output_path}`);

        //get audio path
        var audio_file_path;
        switch (audio_format) {
            case "audio/mp3":
            case "audio/mpeg":
                audio_file_path = path.join(__dirname, "/temp/temp.mp3");//.. because __dirname goes in /html.
                break;


            case "audio/wav":
            case "audio/x-wav":
                audio_file_path = path.join(__dirname, "/temp/temp.wav");
                break;

            
            case "application/ogg":
                audio_file_path = path.join(__dirname, "/temp/temp.ogg");
                break;
            
            default:
                throw `InitExport: ${type} is not a valid audio type!`;
        }


        //ffmpeg location
        var ffmpeg_path = path.join(__dirname, "/ffmpeg/ffmpeg-4.2.1-win32-static/bin/ffmpeg.exe");
        var ffprobe_path = path.join(__dirname, "/ffmpeg/ffmpeg-4.2.1-win32-static/bin/ffprobe.exe");
        ffmpeg.setFfmpegPath(ffmpeg_path);
        ffmpeg.setFfprobePath(ffprobe_path);

        //DEBUG
        // ffmpeg.getAvailableEncoders((err, encoders) => {
        //     console.log('getAvailableEncoders', encoders);
        // });

        //command
        var command = ffmpeg()
            .addInput("./temp/render/frame%d.png")
            .inputFPS(fps)
            .addInput(audio_file_path)
            .size(`${screen.width}x${screen.height}`)
            .fps(fps)
            .duration(duration)
            .videoCodec("libx264")
            .outputOptions(['-pix_fmt yuv420p'])//avoid possible trouble in some apps like QuickTime
            .on('start', function() {
                main_log.info("started creating the video...");
            })
            .on('progress', function(info) {
                main_log.info(`${info.frames} frames rendered, ${info.timemark} seconds rendered`);
                win.webContents.send("encoding-progress", info);
            })
            .on('end', function() {
                main_log.info('Video created!');
                resolve();
                win.webContents.send("encoding-finished", true);
            })
            .on('error', function(error) {
                main_log.error('an error occured in the process: ' + error.message);
                reject(error);
                win.webContents.send("encoding-finished", false);
            })
            .save(output_path);
    
    });
});