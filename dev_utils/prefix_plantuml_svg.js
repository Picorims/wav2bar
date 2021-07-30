//MIT License - Copyright (c) 2020-2021 Picorims

const fs = require("fs").promises;
const path = require("path");
const colors = require("colors");
const prefix = "<!--MIT License - Copyright (c) 2020-2021 Picorims-->"
const regexp = new RegExp(/^.*\.svg$/);

//inspired from https://stackoverflow.com/questions/32511789/looping-through-files-in-a-folder-node-js
async function prefixSVG(rootPath, level) {
    let commentPrefix = "";
    for (let i = 0; i < level; i++) commentPrefix += "|-";

    //open directory
    const dir = await fs.opendir(rootPath)

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
  
prefixSVG(process.argv[2], 0).catch(console.error);