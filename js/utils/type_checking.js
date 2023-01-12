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

//type checking functions

/**
 * Returns if the given value is a Number.
 *
 * @export
 * @param {*} value
 * @return {Boolean} 
 */
export function IsANumber(value) {//returns true if the given variable is a number.
    return (typeof value === "number" && !isNaN(value));
}

/**
 * Returns if the given value is an integer.
 *
 * @export
 * @param {*} value
 * @return {Boolean} 
 */
export function IsAnInt(value) {//returns true if the given variable is an integer. (IsANumber() included in it)
    return( (typeof value === "number") && Number.isInteger(value) );
}

/**
 * Returns if the given value is a String.
 *
 * @export
 * @param {*} value
 * @return {Boolean} 
 */
export function IsAString(value) {//returns true if the given variable is a string.
    return (typeof value === "string");
}

/**
 * Returns if the given value is a boolean.
 *
 * @export
 * @param {*} value
 * @return {Boolean} 
 */
export function IsABoolean(value) {//returns true if the given variable is a boolean. (true or false)
    return ( (value === true) || (value === false) );
}

/**
 * Returns if the given value is an array object.
 *
 * @export
 * @param {*} value
 * @return {Boolean} 
 */
export function IsAnArray(value) {//returns true if the given variable is an array.
    return (  (typeof value === "object")    &&    ( (value instanceof Array) || (value instanceof Uint8Array) )  );
}

/**
 * Returns if the given value is an object.
 *
 * @export
 * @param {*} value
 * @return {Boolean} 
 */
export function IsAnObject(value) {//returns true if the given variable is an Object of any kind.
    return ( (typeof value === "object") && (value !== null) );
}

/**
 * Returns if the given value is undefined or null.
 *
 * @export
 * @param {*} value
 * @return {Boolean} 
 */
export function IsUndefined(value) {//returns true if the given variable is either undefined or null.
    return (  (value===undefined) || (value===null)  );
}

/**
 * Returns if the given value is an HTMLElement.
 *
 * @export
 * @param {*} value
 * @return {Boolean} 
 */
export function IsAnElement(value) {//returns true if the given variable is an HTML DOM element.
    return value instanceof HTMLElement;
}

/**
 * Returns if the given value is a Function.
 *
 * @export
 * @param {*} value
 * @return {Boolean} 
 */
export function IsAFunction(value) {
    return (typeof value === "function");
}

/**
 * Returns if the value is strictly equals to NaN. It differs from
 * isNaN that only returns if the value is equivalent to NaN.
 * @param {*} value 
 * @returns {Boolean}
 */
export function equalsNaN(value) {
    // isNaN is more for safety than anything else
    // see https://dorey.github.io/JavaScript-Equality-Table/
    // the only value not strictly equal to itself of type number is NaN.
    // Other values not strictly equal to themselves are of type object.
    return (typeof value === "number" && value !== value && isNaN(value));
}