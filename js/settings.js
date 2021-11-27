//MIT License - Copyright (c) 2020-2021 Picorims

//USER SETTINGS MANIPULATION

var settings;//user settings. see ./users/settings/default_settings.json.
var current_settings_version = 1;

/**
 * settings initialization. Go reading the .json save.
 *
 */
async function InitSettings() {
    imports.utils.CustomLog("info","initializing settings...");
    let default_settings_path = "./user/settings/default_settings.json";
    let user_settings_path = `${working_dir}/user/settings/user_settings.json`;

    if (!await ipcRenderer.invoke("path-exists", user_settings_path)) {
        //no user settings found, loading default settings
        imports.utils.CustomLog("warn","No user settings found. Loading default settings.");
        settings = await ipcRenderer.invoke("read-json-file", default_settings_path);
    } else {
        //user settings found
        imports.utils.CustomLog("info","user settings found.");
        settings = await ipcRenderer.invoke("read-json-file", user_settings_path);
    }

    //check version
    if (settings.save_version > current_settings_version) {
        imports.utils.CustomLog("warn",`The settings version (${settings.save_version}) is above the supported version! Loading default settings...`);
        settings = await ipcRenderer.invoke("read-json-file", default_settings_path);
    } else if (settings.save_version < current_settings_version) {
        imports.utils.CustomLog("warn",`The settings version (${settings.save_version}) is below the supported version! Converting the data...`);
        ConvertSettings();
    }

    //add software version
    settings.software_version_used = `${software_version} ${software_status}`;
    SaveSettings();
    LoadSettings();

    if (settings.ffmpeg.ffmpeg_path === "" || settings.ffmpeg.ffprobe_path === "") {
        MessageDialog("warn","FFmpeg and/or FFprobe is/are missing. Wav2Bar can't export videos without these libraries! Packages can be found on ffmpeg.org. Be sure to define the path to these libraries in the settings!");
        ipcRenderer.invoke("open-local-html", "./html/install_ffmpeg.html");
    }

    imports.utils.CustomLog("info","settings loaded:");
    imports.utils.CustomLog("info", JSON.stringify(settings));
}

/**
 * upgrade an older settings file to the current version.
 * versions are documented in [root]/docs/settings.md.
 *
 * @param {Array} [log_array=[]] An array of strings to store log messages that will go with the rest of logs at the end of the process.
 */
function ConvertSettings(log_array = []) {
    //something's wrong ?
    imports.utils.CustomLog("debug", JSON.stringify(settings));
    if (settings.save_version > current_settings_version) throw `Can't convert the settings: the settings version (${settings.save_version}) is greater than the supported version (${current_settings_version})!`;

    //Does it still needs to be converted ?
    else if (settings.save_version < current_settings_version) {
        imports.utils.CustomLog("info",`Converting the settings from version ${settings.save_version} to ${settings.save_version + 1}. The goal is ${current_settings_version}.`);

        switch (settings.save_version) {
            case 1:
                //future v1 to v2 conversion.
            break;



            default:
                imports.utils.CustomLog("error",`Settings of version ${settings.save_version} can't be converted!`);
        }
        settings.save_version++;
        imports.utils.CustomLog("info", `Settings converted to version ${settings.save_version}!`);
        ConvertSave(log_array);
    } else {
        //finished conversion.
        imports.utils.CustomLog("info", `Conversion done!`);

        //conversion logs
        if (log_array.length > 0) {
            let log_string = "Conversion details:\n";
            for (msg of log_array) {
                log_string += "- " + msg + '\n';
            }
            imports.utils.CustomLog("info", log_string);
        }
    }
}


/**
 * load settings in the app
 *
 */
function LoadSettings() {
    imports.utils.CustomLog("info","loading settings...");

    //set FFmpeg paths
    document.getElementById("ffmpeg_path_input").value = settings.ffmpeg.ffmpeg_path;
    ipcRenderer.invoke("set-ffmpeg-path", settings.ffmpeg.ffmpeg_path);
    document.getElementById("ffprobe_path_input").value = settings.ffmpeg.ffprobe_path;
    ipcRenderer.invoke("set-ffprobe-path", settings.ffmpeg.ffprobe_path);

    imports.utils.CustomLog("info","loaded settings!");
}

/**
 * save settings into a .json file
 *
 */
async function SaveSettings() {
    imports.utils.CustomLog("info", "saving settings...");
    await ipcRenderer.invoke("write-json-file", `${working_dir}/user/settings/user_settings.json`, JSON.stringify(settings));
    imports.utils.CustomLog("info", "settings saved!");
}




/**
 * Change FFmpeg path
 *
 * @param {*} path new path
 */
function setFFmpegPath(path) {
    document.getElementById("ffmpeg_path_input").value = path;
    settings.ffmpeg.ffmpeg_path = path;
    ipcRenderer.invoke("set-ffmpeg-path", path);
    SaveSettings();
}

/**
 * Change FFprobe path
 *
 * @param {*} path
 */
function setFFprobePath(path) {
    document.getElementById("ffprobe_path_input").value = path;
    settings.ffmpeg.ffprobe_path = path;
    ipcRenderer.invoke("set-ffprobe-path", path);
    SaveSettings();
}