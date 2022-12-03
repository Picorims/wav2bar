//Wav2Bar - Free software for creating audio visualization (motion design) videos
//Copyright (C) 2022  Picorims <picorims.contact@gmail.com>

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

import * as obj from "./object_utils.js";
import * as type from "./type_checking.js";

/**
 * Deep clones a value. support primitives, arrays (composed of the same things),
 * and objects (composed of the same things).
 * @param {*} value value to clone
 * @returns {*} copy
 */
export function deepClone(value) {
    let clone;

    if (type.IsAnArray(value)) {
        clone = arrayDeepClone(value);
    } else if (type.IsAnObject(value)) {
        clone = objDeepClone(value);
    } else {
        clone = value;
    }            

    return clone;
}



/**
 * Deep clones an object. support primitives, arrays (composed of the same things),
 * and objects (composed of the same things).
 * @param {Object} object object to clone
 * @returns {Object} copy
 */
function objDeepClone(object) {
    let new_obj = {};
    for (let key in object) {
        if (obj.objHasOwnProp(object, key)) {
            new_obj[key] = deepClone(object[key]);
        }
    }
    return new_obj;
}


/**
 * Deep clones an array. support primitives, arrays (composed of the same things),
 * and objects (composed of the same things).
 * @param {Array} array array to clone
 * @returns {Array} copy
 */

function arrayDeepClone(array) {
    let new_array = [];
    for (let i = 0; i < array.length; i++) {
        new_array[i] = deepClone(array[i]);
    }
    return new_array;
}