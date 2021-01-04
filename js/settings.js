//MIT License - Copyright (c) 2020-2021 Picorims

//USER SETTINGS MANIPULATION

var settings;//user settings. see ./users/settings/default_settings.json.

//settings initialization. Go reading the .json save.
async function InitSettings() {
    CustomLog("info","initializing settings...");

    if (!await ipcRenderer.invoke("path-exists", "./user/settings/user_settings.json")) {
        //no user settings found, loading default settings
        CustomLog("warn","No user settings found. Loading default settings.");
        settings = await ipcRenderer.invoke("read-json-file", "./user/settings/default_settings.json");
    } else {
        //user settings found
        CustomLog("info","user settings found.");
        settings = await ipcRenderer.invoke("read-json-file", "./user/settings/user_settings.json");
    }

    //add software version
    settings.software_version_used = `${software_version} ${software_status}`;
    SaveSettings();
    LoadSettings();

    CustomLog("info","settings loaded:");
    CustomLog("info", JSON.stringify(settings));
}

//load settings in the app
function LoadSettings() {
    CustomLog("info","loading settings...");

    //set FFmpeg paths
    document.getElementById("ffmpeg_path_input").value = settings.ffmpeg.ffmpeg_path;
    ipcRenderer.invoke("set-ffmpeg-path", settings.ffmpeg.ffmpeg_path);
    document.getElementById("ffprobe_path_input").value = settings.ffmpeg.ffprobe_path;
    ipcRenderer.invoke("set-ffprobe-path", settings.ffmpeg.ffprobe_path);

    CustomLog("info","loaded settings!");
}

//save settings into a .json file
async function SaveSettings() {
    CustomLog("info", "saving settings...");
    await ipcRenderer.invoke("write-json-file", "./user/settings/user_settings.json", JSON.stringify(settings));
    CustomLog("info", "settings saved!");
}