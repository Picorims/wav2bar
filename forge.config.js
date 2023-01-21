const path = require("path");

module.exports = {
    packagerConfig: {
        appCopyright: "Copyright (C) 2023 Picorims <picorims.contact@gmail.com> - GPL-3.0-or-later",
        icon: "assets/icons/wav2bar_square_logo",
        name: "Wav2Bar",
        executableName: "wav2bar",
        overwrite: true,
        ignore: "/ffmpeg|/user/settings/user_settings.json|/logs|/.vscode|/temp",
        win32metadata: {
            CompanyName: "Picorims",
            FileDescription: "Wav2Bar - A tool to create and export audio visualization mainly for the music industry"
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
                description: "Wav2Bar - A tool to create and export audio visualization mainly for the music industry",
                exe: "Wav2Bar",
                name: "Wav2Bar",
                shortcutFolderName: "Wav2Bar",
                manufacturer: "Picorims",
                version: "0.3.2",
                icon: path.resolve(__dirname, "./assets/icons/wav2bar_square_logo.ico"),
                ui: {
                    chooseDirectory: true,
                    images: {
                        background: path.resolve(__dirname, "./assets/installer/installer_banner_493x312.png"),
                        banner: path.resolve(__dirname, "./assets/installer/installer_banner_493x58.png")
                    }
                }
            }
        }
    ]
};