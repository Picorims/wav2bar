// eslint-disable-next-line quotes, semi
'use-strict'

//see https://github.com/jprichardson/electron-mocha/issues/180
const {expect} = require('chai');
// const _require = require('esm')(module);
// const utils = _require('../../js/utils/utils.js');

describe('utils', () => {
    it("loads", async () => {
        await loadUtils();
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



            describe('equalsNaN', () => {
                it('accepts NaN', () => {
                    expect(utils.equalsNaN(NaN)).to.be.true;
                });
                it('rejects everything else', () => {
                    let test_values = [Infinity, -Infinity, {}, [], [[]], [0], [1],
                            null, undefined, 0, 1, 4, 7.8, "NaN", "str", "4", "4.5", "4,5", true, false];
                    for (v of test_values) expect(utils.equalsNaN(v)).to.be.false;
                });
            });
        });
    
    
    
    
    
        describe('deep_equal', () => {
            describe('deepEquals', () => {
                it('behaves correctly with simple values', () => {
                    expect(utils.deepEquals(1, 1)).to.be.true;
                    expect(utils.deepEquals(1, 2)).to.be.false;
                    expect(utils.deepEquals("1", "1")).to.be.true;
                    expect(utils.deepEquals("1", "2")).to.be.false;
                    expect(utils.deepEquals(1, "1")).to.be.false;
                    expect(utils.deepEquals(true, false)).to.be.false;
                    expect(utils.deepEquals(true, true)).to.be.true;
                    expect(utils.deepEquals(null, null)).to.be.true;
                    expect(utils.deepEquals(null, undefined)).to.be.false;
                    expect(utils.deepEquals(undefined, undefined)).to.be.true;
                    expect(utils.deepEquals(5.5, 5.6)).to.be.false;
                    expect(utils.deepEquals(5.5, 5.5)).to.be.true;
                });
                it('behaves correctly with simple objects', () => {
                    let a = {
                        a: 1,
                        b: true,
                        c: null,
                        d: undefined,
                        e: "string",
                        f: 5.8,
                    }
                    let b = {
                        a: 1,
                        b: true,
                        c: null,
                        d: undefined,
                        e: "string",
                        f: 5.8,
                    }
                    let c = {
                        a: 1,
                        b: true,
                        c: null,
                        d: undefined,
                        e: "string_diff",
                        f: 5.8,
                    }
                    let d = {
                        b: true,
                        a: 1,
                        c: null,
                        d: undefined,
                        e: "string",
                        f: 5.8,
                    }
                    expect(utils.deepEquals(a,b)).to.be.true;
                    expect(utils.deepEquals(a,c)).to.be.false;
                    expect(utils.deepEquals(a,d)).to.be.true;
                });
                it('behaves correctly with nested objects', () => {
                    let a = {
                        a: 5,
                        b: {
                            c: 4,
                            foo: {
                                bar: "baz",
                                key: null,
                            },
                            d: "wow"
                        }
                    }
                    let b = {
                        a: 5,
                        b: {
                            c: 4,
                            foo: {
                                bar: "baz",
                                key: null,
                            },
                            d: "wow"
                        }
                    }
                    let bBis = {
                        b: {
                            c: 4,
                            d: "wow",
                            foo: {
                                key: null,
                                bar: "baz",
                            },
                        },
                        a: 5,
                    }
                    let c = {
                        a: 5,
                        b: {
                            c: 4,
                            foo: {
                                bar: "different",
                                key: null,
                            },
                            d: "wow"
                        }
                    }
                    let d = {
                        a: 5,
                        b: {
                            c: 4,
                            foo: "bar",
                            d: "wow"
                        }
                    }
                    expect(utils.deepEquals(a,a)).to.be.true;
                    expect(utils.deepEquals(a,b)).to.be.true;
                    expect(utils.deepEquals(a,bBis)).to.be.true;
    
                    expect(utils.deepEquals(a,c)).to.be.false;
                    expect(utils.deepEquals(a,d)).to.be.false;
                });
                it('behaves correctly with simple arrays', () => {
                    let a = [1, 8.9, true, "str", null, undefined];
                    let b = [1, 8.9, true, "str", null, undefined];
                    let c = [1, 8.9, true, "str", null];
                    let d = [1, 8.9, true, "str", undefined, null];
                    let e = [1, 8.9, false, "str", null, undefined];
                    let f = [];
                    let g = [];
                    expect(utils.deepEquals(a,a)).to.be.true;
                    expect(utils.deepEquals(a,b)).to.be.true;
    
                    expect(utils.deepEquals(a,c)).to.be.false;
                    expect(utils.deepEquals(a,d)).to.be.false;
                    expect(utils.deepEquals(a,e)).to.be.false;
                    expect(utils.deepEquals(a,f)).to.be.false;
    
                    expect(utils.deepEquals(f,g)).to.be.true;
                });
                it('behaves correctly with nested arrays', () => {
                    let a = [1, [2,3,4]];
                    let b = [1, [2,3,4]];
                    let c = [1, [2,5,4]];
                    let d = [1, [3,4]];
                    let e = [5,8,"sdfok",[["foo",[]],[[[[5, "3", undefined]],[8,[true, 5]],[]]]], 89, null];
                    let f = [5,8,"sdfok",[["foo",[]],[[[[5, "3", undefined]],[8,[true, 5]],[]]]], 89, null];
                    let g = [5,8,"sdfok",[[[]],[[[[5, "3", undefined]],[8,[true, 5]],[]]]], 89, null];
                    let h = [5,8,"sdfok",[["foo",[]],[[8,[[5, "3", undefined]],[8,[true, 5]],[]]]], 89, null];
                    let i = [5,8,"sdfok",[["foo",[]],[[[[5, "3"]],[8,[true, 5]],[]]]], 89, null];
                
                    expect(utils.deepEquals(a,a)).to.be.true;
                    expect(utils.deepEquals(a,b)).to.be.true;
    
                    expect(utils.deepEquals(a,c)).to.be.false;
                    expect(utils.deepEquals(a,d)).to.be.false;
                    expect(utils.deepEquals(a,e)).to.be.false;
    
                    expect(utils.deepEquals(e,f)).to.be.true;
    
                    expect(utils.deepEquals(e,g)).to.be.false;
                    expect(utils.deepEquals(e,h)).to.be.false;
                    expect(utils.deepEquals(e,i)).to.be.false;
                });
                it('handles all kinds of variables', () => {
                    let a = {
                        8984: 45,
                        "foo": "bar",
                        baz: [5, null, "stuff", {
                            some: "kind",
                            of: "obj",
                            its: true,
                        }],
                        someother: {
                            object: "here"
                        }
                    };
                    let b = {
                        8984: 45,
                        "foo": "bar",
                        baz: [5, null, "stuff", {
                            some: "kind",
                            of: "obj",
                            its: true,
                        }],
                        someother: {
                            object: "here"
                        }
                    };
                    let c = [8984, "foo", "bar", undefined, [
                            5, null, "stuff", {
                                some: "kind",
                                of: "obj",
                                its: true,
                                arr: [],
                                obj: {}
                            }
                        ], {
                            object: "here",
                            key: undefined,
                        }
                    ];
                    let d = [8984, "foo", "bar", undefined, [
                            5, null, "stuff", {
                                some: "kind",
                                of: "obj",
                                its: true,
                                arr: [],
                                obj: {}
                            }
                        ], {
                            object: "here",
                            key: undefined,
                        }
                    ];
    
                    expect(utils.deepEquals(a,a)).to.be.true;
                    expect(utils.deepEquals(a,b)).to.be.true;
                    expect(utils.deepEquals(c,c)).to.be.true;
                    expect(utils.deepEquals(c,d)).to.be.true;
    
                    expect(utils.deepEquals(a,c)).to.be.false;
    
                });
            });
        });
    
    
    
    
    
        describe('deep_clone', () => {
            describe('deepClone', () => {
                it('clones simple values', () => {
                    let tests = [
                        null,
                        undefined,
                        5,
                        8.9,
                        "string stuff",
                        true,
                        false,
                        [],
                        {}
                    ];
                    for (let test of tests) {
                        expect(utils.deepClone(test)).to.deep.equal(test);
                    }                
                });
    
                it('clones complex values', () => {
                    let tests = [
                        {
                            a: 5,
                            b: {
                                c: 4,
                                foo: {
                                    bar: "different",
                                    key: null,
                                },
                                d: "wow"
                            }
                        },
                        [8984, "foo", "bar", undefined, [
                                5, null, "stuff", {
                                    some: "kind",
                                    of: "obj",
                                    its: true,
                                    arr: [],
                                    obj: {}
                                }
                            ], {
                                object: "here",
                                key: undefined,
                            }
                        ],
                        {
                            8984: 45,
                            "foo": "bar",
                            baz: [5, null, "stuff", {
                                some: "kind",
                                of: "obj",
                                its: true,
                            }],
                            someother: {
                                object: "here"
                            }
                        }
                    ];
                    for (let test of tests) {
                        expect(utils.deepClone(test)).to.deep.equal(test);
                    }                
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
                        "triggerEvent",
                        "hasHandlers"
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

                it('correctly reports if handlers exist', () => {
                    let c = new testClass();
                    let func = () => {};
                    expect(c.hasHandlers("c")).to.be.false;
                    c.subscribeToEvent("c", func);
                    expect(c.hasHandlers("c")).to.be.true;
                    c.unsubscribeToEvent("c", func);
                    expect(c.hasHandlers("c")).to.be.false;
                });
            });
        });
    
    
    
    
    
        describe('state_machine_mixin', () => {
            describe('StateMachineMixin', () => {
                let initial_state = {
                    a: "a state value",
                    "b": 13,
                    c: [3,5],
                    d: {
                        e: true,
                        f: null
                    }
                };
    
                let initial_state2 = {
                    direction: "vertical",
                    size: 200,
                    size_min: 0,
                    size_max: 999999
                };
    
                let initial_state3 = {
                    str: "str",
                    int: 8,
                    tab: [78,23],
                    obj: {
                        e: false,
                        f: null,
                    },
                };
    
                class testClass {
                    constructor(init_state = initial_state, additional_events = []) {
                        Object.assign(testClass.prototype, utils.StateMachineMixin);
                        this._setupStateMachineMixin(testClass, init_state, additional_events);
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
                        "_getStatePaths",
                        "getState",
                        "setState",
                        "_notifyParents",
                        "_callPendingNotifications",
                        "_registerValidator",
                        "_validatorExists",
                        "verifyState",
                        "_assertState",
                        "subscribeToState",
                        "unsubscribeToState",
                        "bindStates",
                        "_triggerState"
                    ];
                    for (let method of methods) {
                        expect(c).to.be.an('object').that.respondTo(method);
                    }
                });
    
                it('returns the value of a state with get', function() {
                    let c = new testClass();
                    let d = new testClass(initial_state2);
    
                    this.timeout(1000);

                    let assertStateExplorable = (class_instance, initial_path, object) => {
                        if (!initial_path) initial_path = "";
                        for (let key in object) {
                            let path = initial_path + key;
                            let value = object[key];

                            if (typeof value === "object" && !(value instanceof Array)) {
                                // If it is an object, we explore it as well
                                // to test all paths and not just equality
                                assertStateExplorable(class_instance, path + "/", value);
    
                                expect(class_instance.getState(path)).to.deep.equal(value);
                            } else if (value instanceof Array) {
                                expect(class_instance.getState(path)).to.deep.equal(value);
                                for (let i=0; i < value.length; i++) {
                                    expect(class_instance.getState(path+"/"+i)).to.deep.equal(value[i]);
                                }
                            } else {
                                expect(class_instance.getState(path)).to.equal(value);
                            }
                        }
                    }
                    assertStateExplorable(c, false, initial_state);
                    assertStateExplorable(d, false, initial_state2);
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

                    c.setState("c/0", 3);
                    expect(c.getState("c/0")).to.equal(3);
                });

                it('does not allow NaN', () => {
                    let c = new testClass();
                    expect(() => {c.setState("a", NaN)}).to.throw();
                });
    
                it('throws an exception when a value does not exist', () => {
                    let c = new testClass();
    
                    expect(() => {c.getState("unknown")}).to.throw();
                    expect(() => {c.setState("unknown", 1)}).to.throw();
                    expect(() => {c.getState("d/unknown")}).to.throw();
                    expect(() => {c.setState("d/unknown", 2)}).to.throw();
                    expect(() => {c.setState("d", {unknown: "a"})}).to.throw();
                    expect(() => {c.setState("c/2", 5)}).to.throw();
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
                    expect(c._state_paths).to.be.of.length(8);
    
                    c.subscribeToState("a", (value) => {
                        expect(value).to.equal("foo");
                        done();
                    })
                    c.setState("a", "foo");
                });

                it('allows to subscribe to a state change happening in children (object)', function(done) {
                    let c = new testClass2();
    
                    this.timeout(1000);
    
                    c.subscribeToState("d", (value) => {
                        expect(value).to.deep.equal({e: true, f: 5});
                        done();
                    })
                    c.setState("d/f", 5);
                });
    
                it('allows to subscribe to a state change happening in children (array)', function(done) {
                    let c = new testClass2();
    
                    this.timeout(1000);
    
                    c.subscribeToState("c", (value) => {
                        expect(value[0]).to.deep.equal(15);
                        done();
                    })
                    c.setState("c/0", 15);
                });
    
                it('allows to subscribe to a state change happening in parent (object)', function(done) {
                    let c = new testClass2();
    
                    this.timeout(1000);
    
                    c.subscribeToState("d/f", (value) => {
                        expect(value).to.deep.equal(5);
                        done();
                    })
                    c.setState("d", {e: true, f: 5});
                });
    
                it('allows to subscribe to a state change happening in parent (array)', function(done) {
                    let c = new testClass2();
    
                    this.timeout(1000);
    
                    c.subscribeToState("c", (value) => {
                        expect(value).to.deep.equal([15,5]);
                        done();
                    })
                    c.setState("c/0", 15);
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
    
                it('supports data binding', () => {
                    let c1 = new testClass();
                    let c3 = new testClass(initial_state3);
                    
                    let tests = [
                        {
                            machine: c1,
                            path: "a",
                            other_machine: c3,
                            other_path: "str",
                            test_val: "a string"
                        },
                        {
                            machine: c3,
                            path: "int",
                            other_machine: c1,
                            other_path: "b",
                            test_val: 45
                        },
                        {
                            machine: c1,
                            path: "c",
                            other_machine: c3,
                            other_path: "tab",
                            test_val: [45,87],
                        },
                        {
                            machine: c3,
                            path: "obj",
                            other_machine: c1,
                            other_path: "d",
                            test_val: {e: true, f: null}
                        },
                        {
                            machine: c1,
                            path: "d/e",
                            other_machine: c3,
                            other_path: "obj/e",
                            test_val: 45
                        }
                    ];
    
                    for (let test of tests) {
                        test.machine.bindStates(test.path, test.other_machine, test.other_path);
                        let init = test.machine.getState(test.path);
                        let init_other = test.other_machine.getState(test.other_path);
                        expect(init_other).to.deep.equal(init);
                        test.machine.setState(test.path, test.test_val);
                        let res = test.other_machine.getState(test.other_path);
                        expect(res).to.deep.equal(test.test_val);
                    }
                });

                it('supports events next to states', function(done) {
                    let c1 = new testClass(initial_state, ["test_event"]);

                    this.timeout(1000);
                    c1.subscribeToEvent("test_event", () => {
                        done();
                    });
                    c1.triggerEvent("test_event");
                });
            });
        });
    });
});