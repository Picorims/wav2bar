//MIT License - Copyright (c) 2020-2021 Picorims

import * as Type from "./type_checking.js";

//function returning randomized values

//give a random integer between min and max.
export function RandomInt(min, max) {
    if (!Type.IsANumber(min)) throw `RandomInt: ${min} is not a valid min value.`;
    if (!Type.IsANumber(max)) throw `RandomInt: ${max} is not a valid max value.`;

    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

//taken from https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
//This should only be used in non sensitive contexts!
export function uuidv4() {//uuid v4 generator.
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }