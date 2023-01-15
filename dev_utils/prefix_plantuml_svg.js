//Wav2Bar - Free software for creating audio visualization (motion design) videos
//Copyright (C) 2023  Picorims <picorims.contact@gmail.com>

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

const fs = require("fs").promises;
const path = require("path");
// eslint-disable-next-line no-unused-vars
const colors = require("colors");
const prefix = "<!--MIT License - Copyright (c) 2020-2021 Picorims-->";
const regexp = new RegExp(/^.*\.svg$/);

//inspired from https://stackoverflow.com/questions/32511789/looping-through-files-in-a-folder-node-js
async function prefixSVG(rootPath, level) {
    let commentPrefix = "";
    for (let i = 0; i < level; i++) commentPrefix += "|-";

    //open directory
    const dir = await fs.opendir(rootPath);

    //for each file
    for await (const dirEntry of dir) {
        let subPath = path.resolve(rootPath, dirEntry.name);

        //console.log(dirEntry.name, `\tdir: ${dirEntry.isDirectory()}`.green, `file: ${dirEntry.isFile()}`.yellow);
        if (dirEntry.isFile() && regexp.test(dirEntry.name)) {
            //prefix svg files
            fs.readFile(subPath)
                .then(buffer => {
                    let data = prefix + "\n\n" + buffer.toString();
                    return fs.writeFile(subPath, data);
                }); 
            console.log(`${commentPrefix} ${dirEntry.name} prefixed.`.cyan);

        } else if (dirEntry.isDirectory()) {
            //explore subfolders

            console.log(`${commentPrefix} exploring ${dirEntry.name}`.magenta);
            await prefixSVG(subPath, level+1);
            //console.log(`${commentPrefix} explored ${dirEntry.name}`.magenta);
        }

    }
}

if (!process.argv[2] || process.argv[2] === "") {
    console.log("Missing directory to explore argument.");
} else {
    prefixSVG(process.argv[2], 0).catch(console.error);
}