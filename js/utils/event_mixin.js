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


/**
 * Mixin to manage custom events: setup events,
 * subscribe (or unsubscribe) to events, emit events.
 * 
 * @mixin EventMixin
 * @export
 */
export let EventMixin = {
    /**
     * Setup the events for the class, by creating the event list to subscribe to.
     * 
     * @param {Array} events_list The list of events that can be triggered.
     * @memberof EventMixin
     * @access protected
     */
    _setupEventMixin: function(events_list) {
        this._event_handlers = {};
        for (const event of events_list) {
            this._event_handlers[event] = [];
        }
    },

    /**
     * Allows a new event for subscription.
     * @param {String} name event name
     */
    _createEvent: function(name) {
        if (this._event_handlers[name] !== undefined) throw new Error("_createEvent: this event already exist.");
        this._event_handlers[name] = [];
        //TODO test
    },

    /**
     * Removes an event and all its current handlers (they won't be called again).
     * The event can't be subscribed to again.
     * @param {String} name event name
     */
    _deleteEvent: function(name) {
        if (this._event_handlers[name] === undefined) throw new Error("_createEvent: this event does not exist.");
        delete this._event_handlers[name];
        //TODO test
    },

    /**
     * Adds a handler to an event
     * 
     * @param {String} event targetted event
     * @param {Function} function_handler callback to associate
     * @memberof EventMixin
     */
    subscribeToEvent: function(event, function_handler) {
        // https://stackoverflow.com/questions/12017693/why-use-object-prototype-hasownproperty-callmyobj-prop-instead-of-myobj-hasow
        // TD;DR: It is safer this way to avoid it missing or being overriden
        if (!Object.prototype.hasOwnProperty.call(this._event_handlers, event)) throw new Error(`"${event}" event doesn't exist.`);

        this._event_handlers[event].push(function_handler);
    },

    /**
     * Removes a handler to an event
     * 
     * @param {String} event targetted event
     * @param {Function} function_handler callback to associate
     * @memberof EventMixin
     */
    unsubscribeToEvent: function(event, function_handler) {
        // https://stackoverflow.com/questions/12017693/why-use-object-prototype-hasownproperty-callmyobj-prop-instead-of-myobj-hasow
        // TD;DR: It is safer this way to avoid it missing or being overriden
        if (!Object.prototype.hasOwnProperty.call(this._event_handlers, event)) throw new Error(`"${event}" event doesn't exist.`);

        let handlers = this._event_handlers[event];
        for (let i = handlers.length-1; i >= 0; i--) {
            if (handlers[i] === function_handler) {
                handlers.splice(i, 1);
            }
        }
    },

    /**
     * Triggers an event (call all its handlers)
     * 
     * @param {String} event The event to trigger
     * @param  {...any} args The arguments to pass to handlers.
     * @memberof EventMixin
     */
    triggerEvent: function (event, ...args) {
        this._event_handlers[event].forEach(handler => {
            handler(...args);
        });
    },

    /**
     * Returns if functions are listening to the given event.
     * @param {String} event 
     * @returns 
     */
    hasHandlers: function(event) {
        return this._event_handlers[event].length > 0;
    }
};