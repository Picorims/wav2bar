//MIT License - Copyright (c) 2020-2021 Picorims

//
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
     */
    setupEventMixin: function (events_list) {
        this._event_handlers = {};
        for (const event of events_list) {
            this._event_handlers[event] = [];
        }
    },

    /**
     * Adds a handler to an event
     * 
     * @param {String} event targetted event
     * @param {Function} function_handler callback to associate
     * @memberof EventMixin
     */
    subscribeToEvent: function (event, function_handler) {
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
    unsubscribeToEvent: function (event, function_handler) {
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
    } 
};