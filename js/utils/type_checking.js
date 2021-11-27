//MIT License - Copyright (c) 2020-2021 Picorims

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
    return ( (value === true) || (value === false) )
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
    return ( (typeof value === 'object') && (value !== null) )
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