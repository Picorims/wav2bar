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
    win.webContents.id = 1;

    // and load the index.html of the app.
    win.loadFile('index.html');

    // Open the DevTools.
    win.webContents.openDevTools();

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    })
    
    Init();
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
    console.log("creating window for rendering...");
    
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
    win.webContents.id = 2;
    
    //load the export.html of the app.
    export_win.loadFile('./html/export.html');

    //open dev tools
    export_win.webContents.openDevTools();

    export_win.webContents.on('paint', (event, dirty, image) => {
        // updateBitmap(dirty, image.getBitmap())
    })

}
//exports.createExportWin = createExportWin;

ipcMain.handle("create-export-win", async () => {
    createExportWin();
});
ipcMain.handle("resize-export-window", async (event, width, height) => {
    export_win.setSize(width, height);
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

}






// let ReadJSONFile = function(path) {//read a JSON file at the specified path
//     return JSON.parse(fs.readFileSync(path));
// }
// exports.ReadJSONFile = ReadJSONFile;

//read a JSON file at the specified path, and return the content of this file as a string.
ipcMain.handle('read-json-file', async (event, path) => {
    var file_content;
    try {
        file_content = await fs.promises.readFile(path);
        return JSON.parse(file_content);
    } catch (error) {
        throw new Error("read-json-file: invalid path provided.");
    }
});


// let OpenInBrowser = function(link) {//open provided link in external browser
//     shell.openExternal(link);
// }
// exports.OpenInBrowser = OpenInBrowser;

//open provided link in external browser
ipcMain.handle('open-in-browser', async (event, link) => {
    shell.openExternal(link);
});




ipcMain.handle('get-home-path', async (event) => {
    return os.homedir();
});




//read a directory and return its content
ipcMain.handle('read-dir', async (event, path) => {
    try {
        //get files
        files = await fs.promises.readdir(path);
        console.log(path);
        console.log(files);

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

        return files_object;

    } catch (error) {
        throw new Error(`read-dir: impossible to read this directory: ${error}`);
    }
});




//create a directory
ipcMain.handle('make-dir', async (event, path) => {
    try {
        await fs.promises.mkdir(path);
    } catch (error) {
        throw new Error(`make-dir: impossible to create this directory: ${error}`);
    }
});







// let WriteAudioToTemp = function (arrayBuffer, type) {//exports Int8Array object to file in ./temp
//     console.log("writing file of type: ",type);
//     switch (type) {
//         case "audio/x-wav":
//         case "audio/wav":
//             fs.writeFileSync("./temp/temp.wav", arrayBuffer);
//             break;


//         case "audio/mpeg":
//         case "audio/mp3":
//             fs.writeFileSync("./temp/temp.mp3", arrayBuffer);
//             break;


//         case "application/ogg":
//             fs.writeFileSync("./temp/temp.ogg", arrayBuffer);
//             break;


//         default:
//             throw `WriteAudioToTemp: ${type} is not a valid audio type!`;
        
//     }
    
// }
// exports.WriteAudioToTemp = WriteAudioToTemp;

//exports Int8Array object to file in ./temp

ipcMain.handle('write-audio-to-temp', async (event, arrayBuffer, type) => {
    console.log("writing file of type: ",type);
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

    console.log("done!");
} );







// let SendEventToExportWin = function (event, data) {//send an event to the rendering window (export_win)
//     //console.log(`sending event ${event} to window with id ${web_contents_id}, with data: ${data}`);
//     export_win.webContents.send(event, data);
// }
// exports.SendEventToExportWin = SendEventToExportWin;

//send an event to the rendering window (export_win)
ipcMain.handle('send-event-to-export-win', async (event, send_event, data) => {
    console.log(`sending event ${event} to export window with data: ${data}`);
    export_win.webContents.send(send_event, data);
});





// function PCMtoSpectrum(waveform) {//takes a Float32Array and get waveform data from it 
//     //get normalized magnitudes for frequencies from 0 to 22050 with interval 44100/1024 ≈ 43Hz
//     var spectrum = ft(waveform);
//     return spectrum;
// }
// exports.PCMtoSpectrum = PCMtoSpectrum;

//takes a Float32Array and get waveform data from it 
ipcMain.handle('pcm-to-spectrum', async (event, waveform) => {
    //get normalized magnitudes for frequencies from 0 to 22050 with interval 44100/1024 ≈ 43Hz
    var spectrum = ft(waveform);
    return spectrum;
});


// let ExportScreen = function (screen_data, name, callback) {//exports the app's rendering screen as an image
//     console.log("==================\ncapturing requested at: ", screen_data);
//     console.log("frame: ",name);
    

//     //capture the screen
//     export_win.capturePage(screen_data).then( function(image) {//screen_data: x,y,width,height.
//         console.log("captured! Writing file...", image);
        
//         //create the file
//         fs.writeFile(`./temp/render/${name}.png`, image.toPNG(), (err) => {
//             if (err) throw err
//             console.log("image of the screen created!\n==================");
//             if (callback) callback();
//         });

//     });



// }
// exports.ExportScreen = ExportScreen;

//exports the app's rendering screen as an image
ipcMain.handle('export-screen', async (event, screen_data, name) => {
    return new Promise( async (resolve, reject) => {
        
        console.log("==================\ncapturing requested at: ", screen_data);
        console.log("frame: ",name);
        
        try {
            //capture the screen
            image = await export_win.capturePage(screen_data);//screen_data: x,y,width,height.    
            console.log("captured! Writing file...", image);
                
            //create the file
            await fs.promises.writeFile(`./temp/render/${name}.png`, image.toPNG());
            console.log("image of the screen created!\n==================");
            resolve();
        } catch (error) {
            reject(error);
        }
    });
});




// function CreateVideo(screen, audio_format, fps, duration, callback) {//generates final video from generated framesa and audio contained in temp folder
    
//     //get audio path
//     var audio_file_path;
//     switch (audio_format) {
//         case "audio/mp3":
//         case "audio/mpeg":
//             audio_file_path = path.join(__dirname, "/temp/temp.mp3");//.. because __dirname goes in /html.
//             break;


//         case "audio/wav":
//         case "audio/x-wav":
//             audio_file_path = path.join(__dirname, "/temp/temp.wav");
//             break;

        
//         case "application/ogg":
//             audio_file_path = path.join(__dirname, "/temp/temp.ogg");
//             break;
        
//         default:
//             throw `InitExport: ${type} is not a valid audio type!`;
//     }


//     //ffmpeg location
//     var ffmpeg_path = path.join(__dirname, "/ffmpeg/ffmpeg-4.2.1-win32-static/bin/ffmpeg.exe");
//     var ffprobe_path = path.join(__dirname, "/ffmpeg/ffmpeg-4.2.1-win32-static/bin/ffprobe.exe");
//     ffmpeg.setFfmpegPath(ffmpeg_path);
//     ffmpeg.setFfprobePath(ffprobe_path);

//     // ffmpeg.getAvailableEncoders((err, encoders) => {
//     //     console.log('getAvailableEncoders', encoders);
//     // });

//     //command
//     var command = ffmpeg()
//         .addInput("./temp/render/frame%d.png")
//         .inputFPS(fps)
//         .addInput(audio_file_path)
//         .size(`${screen.width}x${screen.height}`)
//         .fps(fps)
//         .duration(duration)
//         .videoCodec("libx264")
//         .outputOptions(['-pix_fmt yuv420p'])//avoid possible trouble in some apps like QuickTime
//         .on('start', function() {
//             console.log("========================\nstarted creating the video...")
//         })
//         .on('progress', function(info) {
//             console.log('progress ' + info.percent + '%');
//             win.webContents.send("encoding-progress", info);
//         })
//         .on('end', function() {
//             console.log('Video created!');
//             callback();
//             win.webContents.send("encoding-finished", true);
//         })
//         .on('error', function(err) {
//             console.log('an error happened: ' + err.message);
//             win.webContents.send("encoding-finished", false);
//         })
//         .save("video.mp4");


// }
// exports.CreateVideo = CreateVideo;

ipcMain.handle('create-video', async (event, screen, audio_format, fps, duration, output_path) => {
    return new Promise( (resolve, reject) => {
        
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
                console.log("========================\nstarted creating the video...")
            })
            .on('progress', function(info) {
                console.log('progress ' + info.percent + '%');
                win.webContents.send("encoding-progress", info);
            })
            .on('end', function() {
                console.log('Video created!');
                resolve();
                win.webContents.send("encoding-finished", true);
            })
            .on('error', function(error) {
                console.log('an error happened: ' + error.message);
                reject(error);
                win.webContents.send("encoding-finished", false);
            })
            .save(output_path);
    
    });
});