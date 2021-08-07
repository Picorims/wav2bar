//MIT License - Copyright (c) 2020-2021 Picorims

import * as type from "./type_checking.js";

//merge a data_to_add object onto a data_receiver object, overwrite the concerned properties.
export function mergeData(data_to_add, data_receiver) {
    if (type.IsUndefined(data_to_add)) throw "object_method.mergeData: data missing!";
    if (type.IsUndefined(data_receiver)) throw "object_method.mergeData: destination data missing!";

    for (let key of Object.keys(data_to_add)) { //only update the changed nodes in data_to_add
        if (type.IsAnObject(data_to_add[key]) && !type.IsAnArray(data_to_add[key])) {
            //there are multiple sub keys in this key, they must be considered independently.
            object_method.mergeData(data_to_add[key], data_receiver[key]);
        } else {
            //The key is a simple value, it can be processed directly
            data_receiver[key] = data_to_add[key];
        }
    }

    return data_receiver;
}