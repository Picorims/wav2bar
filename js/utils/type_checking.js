//MIT License - Copyright (c) 2020-2021 Picorims

//type checking functions

export function IsANumber(value) {//returns true if the given variable is a number.
    return (typeof value === "number" && !isNaN(value));
}

export function IsAnInt(value) {//returns true if the given variable is an integer. (IsANumber() included in it)
    return( (typeof value === "number") && Number.isInteger(value) );
}

export function IsAString(value) {//returns true if the given variable is a string.
    return (typeof value === "string");
}

export function IsABoolean(value) {//returns true if the given variable is a boolean. (true or false)
    return ( (value === true) || (value === false) )
}

export function IsAnArray(value) {//returns true if the given variable is an array.
    return (  (typeof value === "object")    &&    ( (value instanceof Array) || (value instanceof Uint8Array) )  );
}

export function IsAnObject(value) {//returns true if the given variable is an Object of any kind.
    return ( (typeof value === 'object') && (value !== null) )
}

export function IsUndefined(value) {//returns true if the given variable is either undefined or null.
    return (  (value===undefined) || (value===null)  );
}

export function IsAnElement(value) {//returns true if the given variable is an HTML DOM element.
    return value instanceof HTMLElement;
}