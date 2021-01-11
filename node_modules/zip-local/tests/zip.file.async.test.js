var fs = require('fs');
var expect = require('chai').expect;
var zipper = require('../main.js');
var JSZip = require('jszip');

var localMemory = {}; // used for passing variables between tests

describe("Zipping files asynchrnously", function () {

    /* Test 1 : zipping a file in memory asynchrnously without errors */
    it("should zip a file in memory without any errors", function (done) {

        zipper.zip("./tests/assets/hello-world", function (error, zipped) {

            expect(error).to.equal(null);

            localMemory.T1ZippedBuffer = zipped.memory();

            done();
        });
    });

    /* Test 2: making sure that the zipped buffer from Test 1 contains correct data */
    it("checks if the zipped buffer contains correct data (using JSZip)", function () {

        var zipped = JSZip.make(localMemory.T1ZippedBuffer);

        expect(zipped.files).to.have.property("hello-world") &&
        expect(zipped.file("hello-world").asText()).to.equal("Hello World.");

    });

    /* Test 3: zipping a file to disk asynchrnously without errors */
    it("should zip a file to disk without any errors", function (done) {

        zipper.zip("./tests/assets/hello-world", function (error, zipped) {

            expect(error).to.equal(null);

            zipped.save("./tests/assets/files.async.T3Pack.zip", function (error) {

                expect(error).to.equal(null);

                // make sure that the file exists on disk
                fs.readdir("./tests/assets/", function (err, entries) {

                    expect(entries).to.include('files.async.T3Pack.zip');

                    done();
                });
            })
        });
    });

    /* Test 4: making sure that the zipped file from Test 3 contains correct data */
    it("checks if the zipped file contains correct data (using JSZip)", function (done) {

        fs.readFile("./tests/assets/files.async.T3Pack.zip", function (err, data) {

            var zipped = JSZip.make(data);

            expect(zipped.files).to.have.property("hello-world") &&
            expect(zipped.file("hello-world").asText()).to.equal("Hello World.");

            done();
        });
    });

    /* Test 5: zipping a file from the buffer containing it */
    it("zips a file directly from the buffer containing it", function (done) {

        var buff = fs.readFileSync("./tests/assets/hello-world");

        zipper.zip(buff, "hello-world", function (error, zipped) {

            expect(error).to.equal(null);

            localMemory.T5ZippedBuffer = zipped.memory();

            done();
        });
    });

    /* Test 6: making sure that the zipped buffer from Test 5 contains correct data */
    it("checks if the zipped buffer contains correct data (using JSZip)", function () {

        var zipped = JSZip.make(localMemory.T5ZippedBuffer);

        expect(zipped.files).to.have.property("hello-world") &&
        expect(zipped.file("hello-world").asText()).to.equal("Hello World.");

    });

    /* Test 7: zipping a ZippedFS from an unzipped file */
    it("zips a ZippedFS form a previously unzipped files", function (done) {

        var unzippedfs = zipper.sync.unzip("./tests/assets/hello.zip").memory();

        zipper.zip(unzippedfs, function (error, zipped) {

            expect(error).to.equal(null);

            localMemory.T7ZippedBuffer = zipped.memory();

            done();
        });
    });

    /* Test 8: making sure that the zipped buffer from Test 7 contains correct data */
    it("checks if the zipped buffer contains correct data", function () {

        var T8ZippedFS = zipper.sync.unzip(localMemory.T7ZippedBuffer).memory();

        expect(T8ZippedFS.contents()).to.include("hello/says-hello") &&
        expect(T8ZippedFS.read("hello/says-hello", 'text')).to.equal("Hello") &&
        expect(T8ZippedFS.contents()).to.include("hello/world/says-world") &&
        expect(T8ZippedFS.read("hello/world/says-world", 'text')).to.equal("World");

    });

});
