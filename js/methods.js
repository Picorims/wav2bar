//MIT License - Copyright (c) 2019 Picorims and Mischa

//USEFUL METHODS USED IN THE PROGRAM. THIS SHOULD ONLY CONTAIN GENERAL NON SPECIFIC METHODS, MANIPULATING ALL SORT OF DATA.

function RandomInt(min, max) {//give a random integer between min and max.
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function MappedArray(array, new_length, min, max) {//function that remaps an array, within the given min and max, to a new length.
    //CHECK VARIABLES
    if ( !IsAnArray(array) )                    throw `MappedArray: ${array} is not an array!`;
    if ( !IsANumber(new_length) )               throw `MappedArray: ${new_length} is not a number!`;
    if ( !IsUndefined(min) && !IsANumber(min) ) throw `MappedArray: ${min} is not a number!`;
    if ( !IsUndefined(min) && !IsANumber(max) ) throw `MappedArray: ${max} is not a number!`;
    for (var i=0; i< array.length; i++) {
        if ( IsUndefined(array[i]) ) throw `MappedArray: the value ${i} of the array is undefined or null!`
    }
    
    //DEFINITIONS
    if ( IsUndefined(min) || IsUndefined(max) ) {//if min or max not specified.
        min = 0;
        max = array.length-1;
    }

    var new_array = [];
    var step = (   (max-min+1) / new_length   ) * new_length / (new_length-1);//range length / new length.
    //Proportionality to one less equal part (* new_length / (new_length-1)) is here so the step goes up to the last
    //value of the array when dividing the range into equal parts. (as the final increment would otherwise stop 1 equal part before the last value).
    
    var increment = min;//we start a the minimum of the range
    
    //We want to take at equal distance a "new_length" number of values in the old array, from min to max.
    //In order to know how much we need to increment, we create a step.
    //If the range length is inferior than the new length, step < 1 since we have to get some values multiple times
    //to match the new length.
    //If the range length is superior than the new length, step > 1 since we have to skip some values to match the new length.

    


    //ARRAY CREATION
    for (var i = 0; i<new_length; i++) {
        if (increment === array.length) {     new_array.push(  array[ parseInt(increment-1) ]  )     }
            else                        {     new_array.push(  array[ parseInt(increment) ]    )     }
        increment += step;
    }

    //RETURN THE NEW ARRAY TO THE CALL
    return new_array;
}


function InInterval(value, interval, type) {//returns if the given value is in the interval [min,max] included or excluded;
    switch (type) {
        case "included":
            return (   (value >= interval[0]) && (value <= interval[1])   );
        case "excluded":
            return (   (value > interval[0])  && (value < interval[1])   );
        default:
            throw `InInterval: ${type} is not a valid interval type! (included or excluded)`
    }
}



function IsANumber(value) {//return true if the given variable is a number.
    return (typeof value === "number");
}
function IsAnArray(value) {//return true if the given variable is an array.
    return (  (typeof value === "object")    &&    ( (value instanceof Array) || (value instanceof Uint8Array) )  );
}
function IsUndefined(value) {//return true if the given variable is either undefined or null.
    return (  (value===undefined) || (value===null)  );
}