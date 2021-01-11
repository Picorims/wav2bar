var fs = require('fs');
var expect = require('chai').expect;
var zipper = require('../main.js');
var JSZip = require('jszip');

var localMemory = {}; // used for passing variables between tests


describe("Unzipping asynchronously", function () {

    it("should unzip a .zip file in memory without errors", function (done) {

        zipper.unzip("./tests/assets/hello.zip", function (error, unzipped) {

            expect(error).to.equal(null);

            localMemory.T1ZippedFS = unzipped.memory();

            done();
        });
    });

    it("checks if the ZippedFS object contains correct data", function () {

        expect(localMemory.T1ZippedFS.contents()).to.include("hello/says-hello") &&
        expect(localMemory.T1ZippedFS.read("hello/says-hello", 'text')).to.equal("Hello") &&
        expect(localMemory.T1ZippedFS.contents()).to.include("hello/world/says-world") &&
        expect(localMemory.T1ZippedFS.read("hello/world/says-world", 'text')).to.equal("World");
    });

    it("should unzip a .zip file to disk without errors", function (done) {

        zipper.unzip("./tests/assets/hello.zip", function (error, unzipped) {

            expect(error).to.equal(null);

            fs.mkdir("./tests/assets/hello-async-unzip", function (err) {
                if (err)
                    throw err;

                unzipped.save("./tests/assets/hello-async-unzip/", function (error) {
                    expect(error).to.equal(null);
                    done();
                });
            });
        });
    });

    it("should check if unzipped files on disk contain correct data", function (done) {

        fs.readFile("./tests/assets/hello-async-unzip/hello/says-hello", 'utf8', function (err, data) {

            if (err)
                throw err;

            expect(data).to.equal("Hello");

            fs.readFile("./tests/assets/hello-async-unzip/hello/world/says-world", 'utf8', function (err, world_data) {

                if (err)
                    throw err;

                expect(world_data).to.equal("World");

                done();
            });
        });
    });

    it("unzips a file directly from the buffer containing it", function (done) {

        var buff = fs.readFileSync("./tests/assets/hello.zip");

        zipper.unzip(buff, function (error, unzipped) {

            expect(error).to.equal(null);

            localMemory.T5ZippedFS = unzipped.memory();

            done();
        });
    });

    it("checks if the ZippedFS object contains correct data", function () {

        expect(localMemory.T5ZippedFS.contents()).to.include("hello/says-hello") &&
        expect(localMemory.T5ZippedFS.read("hello/says-hello", 'text')).to.equal("Hello") &&
        expect(localMemory.T5ZippedFS.contents()).to.include("hello/world/says-world") &&
        expect(localMemory.T5ZippedFS.read("hello/world/says-world", 'text')).to.equal("World");
    });

    it("uses existing folders without throwing EEXIST error", function(done) {
        zipper.unzip("./tests/assets/hello.zip", function(error, unzipped) {
            expect(error).to.be.null;

            unzipped.save("./tests/assets/hello-unzip-exists", function(error) {
                expect(error).to.be.null;
                done();
            });
        });
    });

});
