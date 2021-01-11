var fs = require('fs');
var expect = require('chai').expect;
var zipper = require('../main.js');
var JSZip = require('jszip');

var localMemory = {}; // used for passing variables between tests


describe("Unzipping synchronously", function () {

    it("unzips a .zip file in memory without errors", function () {

        localMemory.T1ZippedFS = zipper.sync.unzip("./tests/assets/hello.zip").memory();
    });

    it("checks if the ZippedFS object contains correct data", function () {

        expect(localMemory.T1ZippedFS.contents()).to.include("hello/says-hello") &&
        expect(localMemory.T1ZippedFS.read("hello/says-hello", 'text')).to.equal("Hello") &&
        expect(localMemory.T1ZippedFS.contents()).to.include("hello/world/says-world") &&
        expect(localMemory.T1ZippedFS.read("hello/world/says-world", 'text')).to.equal("World");
    });

    it("unzips a .zip file to disk without errors", function () {

        fs.mkdirSync("./tests/assets/hello-sync-unzip");
        zipper.sync.unzip("./tests/assets/hello.zip").save("./tests/assets/hello-sync-unzip/");
    });

    it("checks if unzipped files on disk contain correct data", function (done) {

        fs.readFile("./tests/assets/hello-sync-unzip/hello/says-hello", 'utf8', function (err, data) {

            if (err)
                throw err;

            expect(data).to.equal("Hello");

            fs.readFile("./tests/assets/hello-sync-unzip/hello/world/says-world", 'utf8', function (err, world_data) {

                if (err)
                    throw err;

                expect(world_data).to.equal("World");

                done();
            });
        });
    });

    it("unzips a file directly from the buffer containing it", function () {

        var buff = fs.readFileSync("./tests/assets/hello.zip");

        localMemory.T5ZippedFS = zipper.sync.unzip(buff).memory();
    });

    it("checks if the ZippedFS object contains correct data", function () {

        expect(localMemory.T5ZippedFS.contents()).to.include("hello/says-hello") &&
        expect(localMemory.T5ZippedFS.read("hello/says-hello", 'text')).to.equal("Hello") &&
        expect(localMemory.T5ZippedFS.contents()).to.include("hello/world/says-world") &&
        expect(localMemory.T5ZippedFS.read("hello/world/says-world", 'text')).to.equal("World");
    });

    it("uses existing folders without throwing EEXIST error", function() {
        zipper.sync.unzip("./tests/assets/hello.zip").save("./tests/assets/hello-unzip-exists");
    });

});
