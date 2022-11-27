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
                    this.setupEventMixin(["a", "b", "c"]);
                }
            }

            it('has all the required methods', () => {
                let c = new testClass();
                let methods = [
                    "setupEventMixin",
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
});