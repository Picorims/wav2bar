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

import * as type from "./type_checking.js";

/**
 * Merges a data_to_add object onto a data_receiver object,
 * overwriting the concerned properties.
 *
 * @export
 * @param {Object} data_to_add The data to merge onto the object.
 * @param {Object} data_receiver The object to merge onto.
 * @return {Object} The object resulting of the merging.
 */
export function mergeData(data_to_add, data_receiver) {
    if (type.IsUndefined(data_to_add)) throw "object_method.mergeData: data missing!";
    if (type.IsUndefined(data_receiver)) throw "object_method.mergeData: destination data missing!";

    for (let key of Object.keys(data_to_add)) { //only update the changed nodes in data_to_add
        if (type.IsAnObject(data_to_add[key]) && !type.IsAnArray(data_to_add[key])) {
            //there are multiple sub keys in this key, they must be considered independently.
            //if the receiver doesn't have a corresponding object, create it.
            if (!type.IsAnObject(data_receiver[key])) data_receiver[key] = {};
            mergeData(data_to_add[key], data_receiver[key]);
        } else {
            //The key is a simple value, it can be processed directly
            data_receiver[key] = data_to_add[key];
        }
    }

    return data_receiver;
}



/**
 * Add a mixin of an object by assigning its properties to the object prototype.
 * (Arrow functions aren't supported as it doesn't redefine `this` in the right context!)
 * @export
 * @param {Object} object The object for which its prototype should receive the mixin
 * @param {Object} mixin The mixin to use on the object
 */
export function useMixin(object, mixin) {
    Object.assign(object.prototype, mixin);
}



/**
 * Shorthand for `Object.prototype.hasOwnProperty.call(object, prop)`.
 * @param {Object} object The object to call `hasOwnProperty` on
 * @param {String} prop The property to seek
 * @returns {Boolean}
 */
export function objHasOwnProp(object, prop) {
    return Object.prototype.hasOwnProperty.call(object, prop);
}