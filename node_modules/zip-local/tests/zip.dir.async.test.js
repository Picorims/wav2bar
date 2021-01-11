var fs = require('fs');
var expect = require('chai').expect;
var zipper = require('../main.js');
var JSZip = require('jszip');

var localMemory = {}; // used for passing variables between tests

describe("Zipping directories asynchronously", function () {

    /* Test 1: zips a directory in memory without errors */
    it("should zip a directory in memory without errors", function (done) {

        zipper.zip("./tests/assets/hello", function (error, zipped) {

            expect(error).to.equal(null);

            localMemory.T1ZippedBuffer = zipped.memory();

            done();
        });
    });

    /* Test 2: making sure that the zipped buffer from Test 1 contains correct data */
    it("checks if the zipped buffer contains correct data (using JSZip)", function () {

        var zipped = JSZip.make(localMemory.T1ZippedBuffer);

        expect(zipped.files).to.have.property("world/").with.property('dir', true) &&
        expect(zipped.files).to.have.property("says-hello") &&
        expect(zipped.file("says-hello").asText()).to.equal('Hello') &&
        expect(zipped.files).to.have.property('world/says-world') &&
        expect(zipped.file("world/says-world").asText()).to.equal('World');

    });

    /* Test 3: zips a directory to disk without errors */
    it("should zip a directory to disk without errors", function (done) {

        zipper.zip("./tests/assets/hello", function (error, zipped) {

            expect(error).to.equal(null);

            zipped.save("./tests/assets/dirs.async.T3Pack.zip", function (error) {

                expect(error).to.equal(null);

                // make sure that the file exists on disk
                fs.readdir("./tests/assets/", function (err, entries) {

                    expect(entries).to.include('dirs.async.T3Pack.zip');

                    done();
                });
            });
        });
    });

    /* Test 4: making sure that the zipped file from Test 3 contains correct data */
    it("checks if the zipped file contains correct data (using JSZip)", function (done) {

        fs.readFile("./tests/assets/dirs.async.T3Pack.zip", function (err, data) {

            var zipped = JSZip.make(data);

            expect(zipped.files).to.have.property("world/").with.property('dir', true) &&
            expect(zipped.files).to.have.property("says-hello") &&
            expect(zipped.file("says-hello").asText()).to.equal('Hello') &&
            expect(zipped.files).to.have.property('world/says-world') &&
            expect(zipped.file("world/says-world").asText()).to.equal('World');

            done();
        });
    });

});
