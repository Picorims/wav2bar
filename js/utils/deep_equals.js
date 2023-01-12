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

import * as type from "./type_checking.js";
import * as obj from "./object_utils.js";

/**
 * Recursive equality.
 * Handles recursivity on objects ({...}) and arrays ([...]).
 * Order is not important for object keys, but it is for array values.
 * @param {*} val1 
 * @param {*} val2 
 * @returns {Boolean}
 */
export function deepEquals(val1, val2) {
    //same type
    if (typeof val1 !== typeof val2) return false;
    //deep equal
    if (type.IsAnArray(val1)) {
        //array
        if (!arrayDeepEquals(val1, val2)) return false;
    } else if (type.IsAnObject(val1)) {
        //object
        if (!objDeepEquals(val1, val2)) return false;
    } else {
        //simple value
        if (type.equalsNaN(val1) && type.equalsNaN(val2)) return true;
        return val1 === val2;
    }

    //equal
    return true;
}


/**
 * Recursively check if two objects are equal (order of keys is not important).
 * @param {Object} object1 
 * @param {Object} object2 
 * @returns {Boolean}
 */
function objDeepEquals(object1, object2) {
    if (!type.IsAnObject(object1) || !type.IsAnObject(object2)) {
        throw new Error("parameters must be objects.");
    }

    for (let key in object1) {
        if (obj.objHasOwnProp(object1, key)) {
            //key exists
            if (!Object.keys(object2).includes(key)) return false;
            //same value
            if (!deepEquals(object2[key], object1[key])) return false;
        }
    }
    return true;
}


/**
 * Recursively check if two arrays are equal (order is important)
 * using === on all values,
 * calling `objDeepEqual` on objects,
 * calling `arrayDeepEquals` on arrays.
 * @param {Array} array1 
 * @param {Array} array2 
 * @returns {Boolean}
 */
function arrayDeepEquals(array1, array2) {
    if (!type.IsAnArray(array1) || !type.IsAnArray(array2)) {
        throw new Error("parameters must be objects.");
    }
    if (array1.length !== array2.length) return false;
    for (let i = 0; i < array1.length; i++) {
        if (!deepEquals(array1[i], array2[i])) return false;
    }
    return true;
}