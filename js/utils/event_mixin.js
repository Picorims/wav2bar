//MIT License - Copyright (c) 2020-2021 Picorims

//Mixin to manage custom events: setup events, subscribe (or unsubscribe) to events, emit events.
export let EventMixin = {
    // Create the event list to subscribe to.
    setupEventMixin: function (events_list) {
        this._event_handlers = {};
        for (const event of events_list) {
            this._event_handlers[event] = [];
        }
    },

    //add a handler to an event
    subscribeToEvent: function (event, function_handler) {
        if (!this._event_handlers.hasOwnProperty(event)) throw new Error(`"${event}" event doesn't exist.`);

        this._event_handlers[event].push(function_handler);
    },

    //remove a handler to an event
    unsubscribeToEvent: function (event, function_handler) {
        if (!this._event_handlers.hasOwnProperty(event)) throw new Error(`"${event}" event doesn't exist.`);

        let handlers = this._event_handlers[event];
        for (let i = handlers.length-1; i >= 0; i--) {
            if (handlers[i] === handler) {
                handlers.splice(i, 1);
            }
        }
    },

    //trigger an event (call all its handlers)
    triggerEvent: function (event, ...args) {
        this._event_handlers[event].forEach(handler => {
            handler(...args);
        });
    } 
}