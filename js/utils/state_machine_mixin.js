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
import * as obj from "./object_utils.js";
import * as clone from "./deep_clone.js";
import * as equals from "./deep_equals.js";

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
     * @param {Array<String>} additional_events add other events to the event mixin
     * @memberof StateMachineMixin
     * @access protected
     */
    _setupStateMachineMixin: function(class_ref, initial_tree, additional_events = []) {
        Object.assign(class_ref.prototype, EventMixin);
        //deep copy the state
        this._machine_state = clone.deepClone(initial_tree);

        /**
         * List of validators stored as the following:
         * ```
         * "path": {fn: function(), msg: "A message explaining the rules"}
         * ```
         */
        this._validators = {};
        this._state_paths = this._getStatePaths(this._machine_state, "");
        this._setupEventMixin([...this._state_paths, ...additional_events]);
        this._pending_notifications = {};
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

        return clone.deepClone(value);
    },

    /**
     * Sets the new state value, after calling its preprocessors.
     * @param {String} state_path path of the state separated by slashes ("/").
     * @param {*} value The new value desired for the state
     * @param {Boolean} pending_notifications Weather paths to notify should be cached or emitted.
     * If cached, any event triggering multiple times will only fire once after the end of a setState with
     * `pending_notifications = false`. This mecanism prevents duplicate events when setting the state of
     * a (potentially complex) object.
     * @returns {Boolean} modified
     * @throws Throws an error if the state does not exist.
     * @memberof StateMachineMixin
     */
    setState: function(state_path, value, pending_notifications = false) {
        if (this.getState(state_path) === value) return;
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
        this._assertState(state_path, value);

        //change the value of the desired key
        let is_obj = type.IsAnObject(value) && !type.IsAnArray(value);
        if (is_obj) {
            //if it is an object, change all of its listed states.
            let object = value;
            for (let key in object) {
                if (obj.objHasOwnProp(object, key)) {
                    let modifiedLocal = this.setState(`${state_path}/${key}`, object[key], true);
                    if (modifiedLocal) modified = true;
                }
            }
        } else {
            //assign
            if (!equals.deepEquals(container[modified_key], value)) {
                container[modified_key] = clone.deepClone(value);
                modified = true;
            }
        }
        if (modified) {
            // prevents multiple calls of the same event within a single setState() call
            this._pending_notifications[state_path] = value;
            this._notifyParents(state_path, true);

            if (!pending_notifications) {
                this._callPendingNotifications();
            }
        }
        return modified;
    },

    /**
     * Trigger an event for every parent of a given path by going up the tree up to the root.
     * @param {String} state_path
     * @param {Boolean} [pending_notifications=true] see `setState()`.
     * @access private
     */
    _notifyParents: function(state_path, pending_notifications = false) {
        let truncatePathRegExp = /\/[^/]*$/g; // removes "/stuff" from "bla/thing/stuff"
        let isAtRootRegExp = /^[^/]+$/g; // no slash

        if (!isAtRootRegExp.test(state_path)) {
            let path = state_path.replace(truncatePathRegExp, "");

            // for each parent
            let done = false;
            while (!done) {
                done = isAtRootRegExp.test(path);

                if (pending_notifications) {
                    this._pending_notifications[path] = this.getState(path);
                } else {
                    this._triggerState(state_path, this.getState(path));
                }
    
                path = path.replace(truncatePathRegExp, "");
            }
        }
    },

    /**
     * Call all pending notifications (events), then free up the queue.
     * @access private
     */
    _callPendingNotifications: function() {
        for (let key in this._pending_notifications) {
            this._triggerState(key, this._pending_notifications[key]);
        }
        this._pending_notifications = {};
    },

    /**
     * Registers a function to call on every state change attempt to ensure
     * that a value is valid.
     * 
     * The value is directly verified upon registration, ensuring a safe
     * initial state.
     * @param {String} state_path path of the state separated by slashes ("/").
     * @param {function(): Boolean} validator The validator to call for the state.
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
            this._assertState(state_path, this.getState(state_path));
        }
    },

    /**
     * @param {String} state_path path of the state separated by slashes ("/").
     * @returns {Boolean}
     * @access protected
     */
    _validatorExists: function(state_path) {
        let validator = this._validators[state_path];
        return !type.IsUndefined(validator);
    },

    /**
     * Returns if the provided value is valid. If there is no validator,
     * it returns true. Otherwise, it returns the validity of the value.
     * @param {String} state_path path of the state separated by slashes ("/").
     * @param {*} value The value to assert.
     * @returns {Boolean}
     * @memberof StateMachineMixin
     */
    verifyState: function(state_path, value) {
        if (!this._validatorExists(state_path)) {
            throw new Error(`verifyState: ${state_path} do not have any validator.`);
        }

        let validator = this._validators[state_path];
        return validator.fn(value);
    },

    /**
     * Throws an error if the given value isn't valid for a given state
     * @param {String} state_path path of the state separated by slashes ("/").
     * @param {*} value The value to assert.
     */
    _assertState: function(state_path, value) {
        if (this._validatorExists(state_path) && !this.verifyState(state_path, value)) {
            throw new Error(`_assertState: ${value} is not a valid value
            for ${state_path} as per the following rules:
            ${this._validators[state_path].msg}`);
        }
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
    },

    /**
     * Link two states from two state machines (it can be the same machine,
     * in theory (not tested)). When one state triggers an event, the other
     * is set to the updated value. Since setState() does nothing when two
     * values are equal, there is no infinite loop.
     * @param {String} state_path The state path to bind to in the current machine
     * @param {StateMachineMixin} external_machine The other machine to bind to
     * @param {String} external_state_path The other machine's state to bind to
     */
    bindStates: function(state_path, external_machine, external_state_path) {
        this.subscribeToState(state_path, (value) => {
            external_machine.setState(external_state_path, value);
        });

        external_machine.subscribeToState(external_state_path, (value) => {
            this.setState(state_path, value);
        });
    },

    /**
     * Triggers the state's associated event if one or more handlers exists, by deep cloning the given value
     * and transmitting it to the handler as a parameter.
     * @param {String} state_path The state path to notify
     * @param {*} value The value (reference) to pass to the handlers
     * @access private
     */
    _triggerState: function(state_path, value) {
        if (this.hasHandlers(state_path)) {
            this.triggerEvent(state_path, clone.deepClone(value));
        }
    }
};
