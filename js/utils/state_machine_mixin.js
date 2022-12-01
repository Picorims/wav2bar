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

import { EventMixin } from "./event_mixin.js";
import * as type from "./type_checking.js";

/**
 * Mixin to implement a state machine on an object, built
 * on top of the EventMixin. It allows initializing a state,
 * get and set state values, subscribing to state changes
 * and adding validators to state changes.
 * 
 * **State data supports what JSON supports :** null, booleans, numbers,
 * strings, arrays and objects composed of such types.
 * 
 * **Note:** Currently an object using this mixin can't directly use the
 * EventMixin (i.e register other events than states). Either create a protected
 * add event function for the EventMixin (cleaner), or use a toggled boolean as an
 * event dispatcher (quick hack).
 * 
 * @mixin StateMachineMixin
 * @export
 */
export let StateMachineMixin = {
    /**
     * setup the state machine with the tree provided. Values of the tree
     * are used as default values.
     * @param {Object} class_ref The reference to the class definition
     * @param {Object} initial_tree The initial state machine tree, with default
     * values in it.
     * @memberof StateMachineMixin
     * @access protected
     */
    _setupStateMachineMixin: function(class_ref, initial_tree) {
        Object.assign(class_ref.prototype, EventMixin);
        //deep copy the state
        this._machine_state = JSON.parse(JSON.stringify(initial_tree));

        /**
         * List of validators stored as the following:
         * ```
         * "path": {fn: function(), msg: "A message explaining the rules"}
         * ```
         */
        this._validators = {};
        this._state_paths = this._getStatePaths(this._machine_state, "");
        this._setupEventMixin(this._state_paths);
    },

    /**
     * Browse the object and returns a list of the paths corresponding to all the available states.
     * @param {Object} object The object to explore
     * @param {String} root The root to start with (paths are then of the form "<root>/...")
     * @returns {Array<String>}
     * @memberof StateMachineMixin
     * @access protected
     */
    _getStatePaths: function(object, root) {
        let keys = [];
        for (let key in object) {
            let val = object[key];
            let path = (root === "") ? key : `${root}/${key}`;
            keys.push(path);
            if (type.IsAnObject(val) && !type.IsAnArray(val)) {
                keys = [...keys, ...this._getStatePaths(val, path)];
            }
        }
        return keys;
    },

    /**
     *  Gets the current value of a state
     *
     * @param {String} state_path path of the state separated by slashes ("/").
     * @return {*}
     * @throws Throws an error if the state does not exist.
     * @memberof StateMachineMixin
     */
    getState: function(state_path) {
        let path_array = state_path.split("/");
        let value = this._machine_state;
        //dynamically retreive the value inside the tree by using the path
        for (let step of path_array) {
            value = value[step];
            if (value === undefined) throw new Error(`getState: ${state_path} does not exist.`);
        }

        return value;
    },

    /**
     * Sets the new state value, after calling its preprocessors.
     * @param {String} state_path path of the state separated by slashes ("/").
     * @param {*} value The new value desired for the state
     * @returns {Boolean} modified
     * @throws Throws an error if the state does not exist.
     * @memberof StateMachineMixin
     */
    setState: function(state_path, value) {
        let modified = false;
        let path_array = state_path.split("/");
        //remove the last element from the path
        //and save its key to change its value at the end
        let modified_key = path_array.pop();
        let container = this._machine_state;

        //find the targetted object in the tree
        for (let i = 0; i < path_array.length; i++) {
            container = container[path_array[i]];
            if (container === undefined) throw new Error(`setState: ${state_path} does not exist.`);
        }
        if (container[modified_key] === undefined) throw new Error(`setState: ${state_path} does not exist.`);
        
        //make sure the value is allowed
        if (!this._verify(state_path, value)) {
            throw new Error(`setState: ${value} is not a valid value
            for ${state_path} as per the following rules:
            ${this._validators[state_path].msg}`);
        }

        //change the value of the desired key
        let is_obj = type.IsAnObject(value) && !type.IsAnArray(value);
        if (is_obj) {
            //if it is an object, change all of its listed states.
            let obj = value;
            for (let key in obj) {
                if (Object.hasOwnProperty.call(obj, key)) {
                    modified = this.setState(`${state_path}/${key}`, obj[key]);
                }
            }
        } else {
            //assign
            if (type.IsAnArray(value)) {
                // path for optimization
                container[modified_key] = JSON.parse(JSON.stringify(value));
                modified = true;
            } else {
                if (container[modified_key] !== value) {
                    container[modified_key] = value;
                    modified = true;
                }
            }
        }
        if (modified) {
            if (type.IsAnObject(value) || type.IsAnArray(value)) {
                // path for optimization
                this.triggerEvent(state_path, JSON.parse(JSON.stringify(value)));
            } else {
                this.triggerEvent(state_path, value);
            }
        }
        return modified;
    },

    /**
     * 
     * @param {String} state_path path of the state separated by slashes ("/").
     * @param {Function} validator The validator to call for the state.
     * @param {String} rules_msg The message to display when a state isn't valid.
     * It should describe the rules of validation useful to the developer.
     * It must return a boolean value asserting the validity of value.
     * @memberof StateMachineMixin
     * @access protected
     */
    _registerValidator: function(state_path, validator, rules_msg) {
        if (!type.IsAFunction(validator)) throw new Error("registerValidator: The validator is not a function.");
        if (!type.IsUndefined(this._validators[state_path])) {
            throw new Error(`registerValidator: a validator already exists for ${state_path}`);
        } else {
            this._validators[state_path] = {
                fn: validator,
                msg: rules_msg
            };
        }
    },

    /**
     * Returns if the provided value is valid. If there is no validator,
     * it returns true. Otherwise, it returns the validity of the value.
     * @param {String} state_path path of the state separated by slashes ("/").
     * @param {*} value The value to assert.
     * @returns {Boolean}
     * @memberof StateMachineMixin
     * @access protected
     */
    _verify: function(state_path, value) {
        let validator = this._validators[state_path];
        let validator_exists = !type.IsUndefined(validator);
        return !validator_exists || validator_exists && validator.fn(value);
    },

    /**
     * Listen to changes of a state
     * 
     * @param {String} state_path targetted state
     * @param {Function} function_handler callback to associate
     * @memberof StateMachineMixin
     */
    subscribeToState: function(state_path, function_handler) {
        this.subscribeToEvent(state_path, function_handler);
    },

    /**
     * Removes a handler for a state
     * 
     * @param {String} state_path targetted state
     * @param {Function} function_handler callback to associate
     * @memberof StateMachineMixin
     */
    unsubscribeToState: function(state_path, function_handler) {
        this.unsubscribeToEvent(state_path, function_handler);
    }
};
