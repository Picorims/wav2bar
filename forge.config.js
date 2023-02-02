const path = require("path");
const packageJson = require("./package.json");

const description = "Wav2Bar - " + packageJson.description;

module.exports = {
    packagerConfig: {
        appCopyright: "Copyright (C) 2023 Picorims <picorims.contact@gmail.com> - GPL-3.0-or-later",
        icon: "assets/icons/wav2bar_square_logo",
        name: "Wav2Bar",
        executableName: "wav2bar",
        overwrite: true,
        ignore: "/ffmpeg|/user/settings/user_settings.json|/logs|/.vscode|/temp|/.github",
        win32metadata: {
            CompanyName: packageJson.author,
            FileDescription: description
        },
        appCategoryType: "public.app-category.video"
    },
    makers: [
        {
            name: "@electron-forge/maker-zip",
            platforms: [
                "win32",
                "darwin",
                "linux"
            ]
        },
        {
            name: "@electron-forge/maker-wix",
            config: {
                description: description,
                exe: "Wav2Bar",
                name: "Wav2Bar",
                shortcutFolderName: "Wav2Bar",
                manufacturer: packageJson.author,
                version: packageJson.version,
                icon: path.resolve(__dirname, "./assets/icons/wav2bar_square_logo.ico"),
                ui: {
                    chooseDirectory: true,
                    images: {
                        background: path.resolve(__dirname, "./assets/installer/installer_banner_493x312.png"),
                        banner: path.resolve(__dirname, "./assets/installer/installer_banner_493x58.png")
                    }
                }
            }
        },
        // {
        //     // https://github.com/electron/forge/issues/2561 can't work
        //     name: "@electron-forge/maker-flatpak",
        //     config: {
        //         options: {
        //             base: "org.electronjs.Electron2.BaseApp",
        //             baseVersion: "22.08",
        //             categories: ["AudioVideo","Video","Graphics"],
        //             branch: "develop", //TODO change to main
        //             description: description,
        //             genericName: "Wav2Bar",
        //             icon: path.resolve(__dirname, "./assets/icons/wav2bar_square_logo.png"),
        //             id: "com.picorims.wav2bar",
        //             mimeType: ["audio/x-wav", "audio/wav", "audio/mpeg", "audio/mp3", "application/ogg"],
        //             productName: "Wav2Bar"
        //         }
        //     }
        // }
    ]
};