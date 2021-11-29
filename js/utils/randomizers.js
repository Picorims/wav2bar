//MIT License - Copyright (c) 2020-2021 Picorims

import * as Type from "./type_checking.js";

//function returning randomized values

/**
 * Gives a random integer between min and max.
 *
 * @export
 * @param {*} min minimum value included.
 * @param {*} max maximum value included.
 * @return {*} A random value.
 */
export function RandomInt(min, max) {
    if (!Type.IsANumber(min)) throw `RandomInt: ${min} is not a valid min value.`;
    if (!Type.IsANumber(max)) throw `RandomInt: ${max} is not a valid max value.`;

    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

/**
 * taken from https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
 * This should only be used in non sensitive contexts!
 * Generates a UUID v4 string.
 * 
 * @export
 * @return {String} 
 */
export function uuidv4() {//uuid v4 generator.
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        let r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}



/**
 * Returns a random color, avoiding too dark colors: If two most significant values are inferior to 0x4,
 * the last significant value will be superior or equal to 0x4.
 *
 * @return {String} color in hexadecimal format #?????? 
 */
export function RandomColor() {
    let hex = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];
    let color = "#";
    let leadingZeros = 0;
    for (let i = 0; i < 6; i++) {
        if (i%2 === 0) {
            let random = RandomInt(0,15);
            if (leadingZeros >= 2) random = RandomInt(5,15);
            if (random < 4) leadingZeros++;
            color += hex[random];
            
        }
        else color += hex[RandomInt(0,15)];
    }
    return color;
}
