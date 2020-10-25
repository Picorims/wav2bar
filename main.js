//MIT License - Copyright (c) 2020 Picorims

//ELECTRON STARTUP AND MAIN PROCESS

//electron dependencies
const { app,
    BrowserWindow,
    ipcMain,
    webContents,
    shell, 
    ipcRenderer} = require('electron');

//node js dependencies
var path = require("path");
var fs = require("fs");//file system
var ft = require('fourier-transform/asm');


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
        frame: false,
        enableLargerThanScreen: true,
        webPreferences: {
            nodeIntegration: true,
            nativeWindowOpen: true,
        },
    })
    win.webContents.id = 2;
    
    ipcMain.on("i-got-it", (event) => {console.log("damnit");});

    //load the export.html of the app.
    export_win.loadFile('./html/export.html');

    //open dev tools
    export_win.webContents.openDevTools();

    export_win.webContents.on('paint', (event, dirty, image) => {
        // updateBitmap(dirty, image.getBitmap())
    })

}
exports.createExportWin = createExportWin;




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






let ReadJSONFile = function(path) {//read a JSON file at the specified path
    return JSON.parse(fs.readFileSync(path));
}
exports.ReadJSONFile = ReadJSONFile;


let OpenInBrowser = function(link) {//open provided link in external browser
    shell.openExternal(link);
}
exports.OpenInBrowser = OpenInBrowser;







let WriteAudioToTemp = function (arrayBuffer, type) {//exports Int8Array object to file in ./temp
    console.log("writing file of type: ",type);
    switch (type) {
        case "audio/x-wav":
        case "audio/wav":
            fs.writeFileSync("./temp/temp.wav", arrayBuffer);
            break;


        case "audio/mpeg":
        case "audio/mp3":
            fs.writeFileSync("./temp/temp.mp3", arrayBuffer);
            break;


        case "application/ogg":
            fs.writeFileSync("./temp/temp.ogg", arrayBuffer);
            break;


        default:
            throw `WriteAudioToTemp: ${type} is not a valid audio type!`;
        
    }
    
}
exports.WriteAudioToTemp = WriteAudioToTemp;








let SendEventToExportWin = function (event, data) {//send an event to the rendering window (export_win)
    //console.log(`sending event ${event} to window with id ${web_contents_id}, with data: ${data}`);
    export_win.webContents.send(event, data);
}
exports.SendEventToExportWin = SendEventToExportWin;





function PCMtoSpectrum(waveform) {//takes a Float32Array and get waveform data from it 
    //get normalized magnitudes for frequencies from 0 to 22050 with interval 44100/1024 ≈ 43Hz
    var spectrum = ft(waveform);
    return spectrum;
}
exports.PCMtoSpectrum = PCMtoSpectrum;




let ExportScreen = function (screen_data, name, callback) {//exports the app's rendering screen as an image
    console.log("==================\ncapturing requested at: ", screen_data);
    console.log("frame: ",name);
    

    //capture the screen
    export_win.capturePage(screen_data).then( function(image) {//screen_data: x,y,width,height.
        console.log("captured! Writing file...", image);
        
        //create the file
        fs.writeFile(`./temp/render/${name}.png`, image.toPNG(), (err) => {
            if (err) throw err
            console.log("image of the screen created!\n==================");
            if (callback) callback();
        });

    });



}
exports.ExportScreen = ExportScreen;




function CreateVideo(screen, audio_format, fps, duration, callback) {//generates final video from generated framesa and audio contained in temp folder
    
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
            callback();
            win.webContents.send("encoding-finished", true);
        })
        .on('error', function(err) {
            console.log('an error happened: ' + err.message);
            win.webContents.send("encoding-finished", false);
        })
        .save("video.mp4");


}
exports.CreateVideo = CreateVideo;