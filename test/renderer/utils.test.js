// eslint-disable-next-line quotes, semi
'use-strict'

//see https://github.com/jprichardson/electron-mocha/issues/180
const {expect} = require('chai');
const _require = require('esm')(module);
const utils = _require('../../js/utils/utils.js');

describe('utils', () => {
    describe('type_checking', () => {
        describe('IsANumber', () => {
            it('rejects null and undefined', () => {
                expect(utils.IsANumber(null)).to.equal(false);
                expect(utils.IsANumber(undefined)).to.equal(false);
            });

            it('rejects objects, functions and strings', () => {
                function fun() {}
                expect(utils.IsANumber(new Object())).to.equal(false);
                expect(utils.IsANumber(fun)).to.equal(false);
                expect(utils.IsANumber("5")).to.equal(false);
            });

            it('accepts numbers', () => {
                expect(utils.IsANumber(Math.random())).to.equal(true);
                expect(utils.IsANumber(Math.floor(Math.random()))).to.equal(true);
                expect(utils.IsANumber(-Math.random())).to.equal(true);
                expect(utils.IsANumber(-Math.floor(Math.random()))).to.equal(true);
            });

            it('accepts infinity', () => {
                expect(utils.IsANumber(Infinity)).to.equal(true);
                expect(utils.IsANumber(-Infinity)).to.equal(true);
            });

            it('rejects NaN', () => {
                expect(utils.IsANumber(NaN)).to.equal(false);
            });
        });



        describe('IsAnInt', () => {
            it('rejects null and undefined', () => {
                expect(utils.IsAnInt(null)).to.equal(false);
                expect(utils.IsAnInt(undefined)).to.equal(false);
            });

            it('rejects objects, functions and strings', () => {
                function fun() {}
                expect(utils.IsAnInt(new Object())).to.equal(false);
                expect(utils.IsAnInt(fun)).to.equal(false);
                expect(utils.IsAnInt("5")).to.equal(false);
            });

            it('accepts integers', () => {
                expect(utils.IsAnInt(Math.floor(Math.random()))).to.equal(true);
                expect(utils.IsAnInt(-Math.floor(Math.random()))).to.equal(true);
            });

            it('reject non integers', () => {
                expect(utils.IsAnInt(Math.random())).to.equal(false);
                expect(utils.IsAnInt(-Math.random())).to.equal(false);
            });

            it('rejects infinity', () => {
                expect(utils.IsAnInt(Infinity)).to.equal(false);
                expect(utils.IsAnInt(-Infinity)).to.equal(false);
            });

            it('rejects NaN', () => {
                expect(utils.IsAnInt(NaN)).to.equal(false);
            });
        });



        describe('IsAString', () => {
            it('rejects null and undefined', () => {
                expect(utils.IsAString(null)).to.equal(false);
                expect(utils.IsAString(undefined)).to.equal(false);
            });

            it('rejects objects, functions and numbers', () => {
                function fun() {}
                expect(utils.IsAString(new Object())).to.equal(false);
                expect(utils.IsAString(fun)).to.equal(false);
                expect(utils.IsAString(5)).to.equal(false);
            });
        });



        describe('IsABoolean', () => {
            it('rejects null and undefined', () => {
                expect(utils.IsABoolean(null)).to.equal(false);
                expect(utils.IsABoolean(undefined)).to.equal(false);
            });

            it('rejects objects, functions and numbers', () => {
                function fun() {}
                expect(utils.IsABoolean(new Object())).to.equal(false);
                expect(utils.IsABoolean(fun)).to.equal(false);
                expect(utils.IsABoolean(5)).to.equal(false);
            });

            it('rejects 0 and 1', () => {
                expect(utils.IsABoolean(0)).to.equal(false);
                expect(utils.IsABoolean(1)).to.equal(false);
            });

            it('rejects "true" and "false"', () => {
                expect(utils.IsABoolean("true")).to.equal(false);
                expect(utils.IsABoolean("false")).to.equal(false);
            });

            it('accepts true and false', () => {
                expect(utils.IsABoolean(true)).to.equal(true);
                expect(utils.IsABoolean(false)).to.equal(true);
            });
        });



        describe('IsAnArray', () => {
            it('rejects null and undefined', () => {
                expect(utils.IsAnArray(null)).to.equal(false);
                expect(utils.IsAnArray(undefined)).to.equal(false);
            });

            it('rejects objects, functions, numbers and strings', () => {
                function fun() {}
                expect(utils.IsAnArray(new Object())).to.equal(false);
                expect(utils.IsAnArray(fun)).to.equal(false);
                expect(utils.IsAnArray(5)).to.equal(false);
                expect(utils.IsAnArray("array")).to.equal(false);
            });

            it('Accepts Array and Uint8Array', () => {
                function fun() {}
                expect(utils.IsAnArray([])).to.equal(true);
                expect(utils.IsAnArray([5,8,984])).to.equal(true);
                expect(utils.IsAnArray(new Array())).to.equal(true);
                expect(utils.IsAnArray(new Uint8Array())).to.equal(true);
            });
        });



        describe('IsAnObject', () => {
            it('rejects null and undefined', () => {
                expect(utils.IsAnObject(null)).to.equal(false);
                expect(utils.IsAnObject(undefined)).to.equal(false);
            });

            it('rejects functions, numbers and strings', () => {
                function fun() {}
                expect(utils.IsAnObject(fun)).to.equal(false);
                expect(utils.IsAnObject(5)).to.equal(false);
                expect(utils.IsAnObject("array")).to.equal(false);
            });

            it('Accepts Array and Uint8Array', () => {
                function fun() {}
                expect(utils.IsAnObject([])).to.equal(true);
                expect(utils.IsAnObject([5,8,984])).to.equal(true);
                expect(utils.IsAnObject(new Array())).to.equal(true);
                expect(utils.IsAnObject(new Uint8Array())).to.equal(true);
            });

            it('Accepts Object and {}', () => {
                expect(utils.IsAnObject(new Object())).to.equal(true);
                expect(utils.IsAnObject({})).to.equal(true);
            });
        });



        describe('IsUndefined', () => {
            it('accepts null and undefined', () => {
                expect(utils.IsUndefined(null)).to.equal(true);
                expect(utils.IsUndefined(undefined)).to.equal(true);
            });

            it('rejects functions, numbers, objects and strings', () => {
                function fun() {}
                expect(utils.IsUndefined(fun)).to.equal(false);
                expect(utils.IsUndefined(5)).to.equal(false);
                expect(utils.IsUndefined(new Object())).to.equal(false);
                expect(utils.IsUndefined("array")).to.equal(false);
            });

            it('rejects NaN', () => {
                expect(utils.IsUndefined(NaN)).to.equal(false);
            });
        });



        describe('IsAnElement', () => {
            it('rejects null and undefined', () => {
                expect(utils.IsAnElement(null)).to.equal(false);
                expect(utils.IsAnElement(undefined)).to.equal(false);
            });

            it('rejects functions, numbers, objects and strings', () => {
                function fun() {}
                expect(utils.IsAnElement(fun)).to.equal(false);
                expect(utils.IsAnElement(5)).to.equal(false);
                expect(utils.IsAnElement(new Object())).to.equal(false);
                expect(utils.IsAnElement("array")).to.equal(false);
            });

            it('accepts HTML Elements from the DOM', () => {
                let elt = document.createElement("div");
                expect(utils.IsAnElement(elt)).to.equal(true);
            });
        });



        describe('IsAFunction', () => {
            it('rejects null and undefined', () => {
                expect(utils.IsAFunction(null)).to.equal(false);
                expect(utils.IsAFunction(undefined)).to.equal(false);
            });

            it('rejects numbers, objects and strings', () => {
                expect(utils.IsAFunction(5)).to.equal(false);
                expect(utils.IsAFunction(new Object())).to.equal(false);
                expect(utils.IsAFunction("array")).to.equal(false);
            });

            it('accepts functions and arrow functions', () => {
                function fun() {}
                expect(utils.IsAFunction(fun)).to.equal(true);
                expect(utils.IsAFunction(() => {})).to.equal(true);
            });
        });
    });



    

    describe('event_mixin', () => {
        describe('EventMixin', () => {
            class testClass {
                constructor() {
                    Object.assign(testClass.prototype, utils.EventMixin);
                    this._setupEventMixin(["a", "b", "c"]);
                }
            }

            it('has all the required methods', () => {
                let c = new testClass();
                let methods = [
                    "_setupEventMixin",
                    "subscribeToEvent",
                    "unsubscribeToEvent",
                    "triggerEvent"
                ];
                for (let method of methods) {
                    expect(c).to.be.an('object').that.respondTo(method);
                }
            });

            it('initializes and trigger events correctly', function(done) {
                let c = new testClass();
                this.timeout(1000);

                c.subscribeToEvent("c", () => {
                    done();
                })
                c.triggerEvent("c");
            });

            it('lets unsubscribe to events', () => {
                let c = new testClass();
                let func = () => {
                    expect.fail("The object did not unsubscribe from the event.");
                }

                c.subscribeToEvent("c", func);
                c.unsubscribeToEvent("c", func);
                c.triggerEvent("c");
            });
        });
    });





    describe('state_machine_mixin', () => {
        describe('StateMachineMixin', () => {
            let initialState = {
                a: "a state value",
                "b": 13,
                c: [3,5],
                d: {
                    e: true,
                    f: null
                }
            };

            class testClass {
                constructor() {
                    Object.assign(testClass.prototype, utils.StateMachineMixin);
                    this._setupStateMachineMixin(testClass, initialState);
                }
            }

            class testClass2 extends testClass {
                constructor() {
                    super();
                    this._registerValidator("b", (value) => (value >= 0), "It must be positive.");
                    this._registerValidator("d/e", (value) => (value === true || value === false), "It must be a boolean.");
                }
            }

            it('has all the required methods', () => {
                let c = new testClass();
                let methods = [
                    // event mixin
                    "_setupEventMixin",
                    "subscribeToEvent",
                    "unsubscribeToEvent",
                    "triggerEvent",
                    // state machine mixin
                    "_setupStateMachineMixin",
                    "getState"
                ];
                for (let method of methods) {
                    expect(c).to.be.an('object').that.respondTo(method);
                }
            });

            it('returns the value of a state with get', () => {
                let c = new testClass();

                let assertStateExplorable = (initial_path, object) => {
                    if (!initial_path) initial_path = "";
                    for (let key in object) {
                        let path = initial_path + key;
                        let value = object[key];

                        if (typeof value === "object") {
                            // If it is an object, we explore it as well
                            // to test all paths and not just equality
                            assertStateExplorable(path + "/", value);

                            expect(c.getState(path)).to.deep.equal(value);
                        } else if (typeof value === "array") {
                            expect(c.getState(path)).to.deep.equal(value);
                        } else {
                            expect(c.getState(path)).to.equal(value);
                        }
                    }
                }
                assertStateExplorable(false, initialState);
            });

            it('allow new state values', () => {
                let c = new testClass();

                // TODO
                // - handle when the path doesn't exist (for get too)
                c.setState("a", "new value");
                expect(c.getState("a")).to.equal("new value");
                c.setState("d/e", false);
                expect(c.getState("d/e")).to.equal(false);
                c.setState("c", [7,8]);
                expect(c.getState("c")).to.deep.equal([7,8]);

                c.setState("d", {e: true, f: "test"});
                expect(c.getState("d")).to.deep.equal({e: true, f: "test"});
                expect(c.getState("d/f")).to.equal("test");
                
                c.setState("d", {f: "test2"});
                expect(c.getState("d")).to.deep.equal({e: true, f: "test2"});
                expect(c.getState("d/f")).to.equal("test2");
            });

            it('throws an exception when a value does not exist', () => {
                let c = new testClass();

                expect(() => {c.getState("unknown")}).to.throw();
                expect(() => {c.setState("unknown", 1)}).to.throw();
                expect(() => {c.getState("d/unknown")}).to.throw();
                expect(() => {c.setState("d/unknown", 2)}).to.throw();
                expect(() => {c.setState("d", {unknown: "a"})}).to.throw();
            });

            it('supports using validators on states', () => {
                let c = new testClass2();

                expect(() => {c.setState("b", 5)}).to.not.throw();
                expect(c.getState("b")).to.equal(5);
                expect(() => {c.setState("b", -5)}).to.throw();

                expect(() => {c.setState("d/e", false)}).to.not.throw();
                expect(c.getState("d/e")).to.equal(false);
                expect(() => {c.setState("d/e", -5)}).to.throw();

                expect(() => {c.setState("d", {e: true, f: null})}).to.not.throw();
                expect(c.getState("d")).to.deep.equal({e: true, f: null});
                expect(() => {c.setState("d", {e: 1, f: null})}).to.throw();
            });

            it('allows to subscribe to a state change', function(done) {
                let c = new testClass2();

                this.timeout(1000);
                expect(c._state_paths).to.be.of.length(6);

                c.subscribeToState("a", (value) => {
                    expect(value).to.equal("foo");
                    done();
                })
                c.setState("a", "foo");
            });

            it('lets unsubscribe to state', () => {
                let c = new testClass2();
                let func = () => {
                    expect.fail("The object did not unsubscribe from the event.");
                }

                c.subscribeToState("c", func);
                c.unsubscribeToState("c", func);
                c.setState("c", [9]);
            });
        });
    });
});