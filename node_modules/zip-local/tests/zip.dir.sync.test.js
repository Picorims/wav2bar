var fs = require('fs');
var expect = require('chai').expect;
var zipper = require('../main.js');
var JSZip = require('jszip');

var localMemory = {}; // used for passing variables between tests

describe("Zipping directories synchronously", function () {
    
    /* Test 1: zips a directory in memory without errors */
    it("should zip a directory in memory without errors", function () {
        
        localMemory.T1ZippedBuffer = zipper.sync.zip("./tests/assets/hello").memory();
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
    it("should zip a directory to disk without errors", function () {
        
        zipper.sync.zip("./tests/assets/hello").save("./tests/assets/dirs.sync.T3Pack.zip");
        
        // make sure the file exists
        var entries = fs.readdirSync("./tests/assets/");
        
        expect(entries).to.include("dirs.sync.T3Pack.zip");
    });
    
    /* Test 4: making sure that the zipped file from Test 3 contains correct data */
    it("checks if the zipped file contains correct data (using JSZip)", function (done) {
        
        fs.readFile("./tests/assets/dirs.sync.T3Pack.zip", function (err, data) {
            
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