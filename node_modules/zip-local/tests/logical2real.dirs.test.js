/*
* Theses tests check the library coverage of logical directories in zip files
* The library should always convert such directories to real ones to ensure
* an error free experince when unzipping these files to disk
*/

var zipper = require('./../main')
var expect = require('chai').expect;

describe("Logical to Real Directories Conversion", function() {

    it('converts logical directories in an existing zip file (async)', function(done) {
        zipper.unzip('./tests/assets/folders.zip', function(error, unzipped) {
            expect(error).to.be.null;
            expect(unzipped.lowLevel().files).to.include.keys('folder1/');
            expect(unzipped.lowLevel().files['folder1/'].dir).to.be.true;
            done();
        });
    });

    it('converts logical directories in an existing zip file (sync)', function() {
        var unzipped = zipper.sync.unzip('./tests/assets/folders.zip')
        expect(unzipped.lowLevel().files).to.include.keys('folder1/');
        expect(unzipped.lowLevel().files['folder1/'].dir).to.be.true;
    });

    it('converts logical directories in low-level added files', function() {
        var unzipped = zipper.sync.unzip('./tests/assets/hello.zip');
        unzipped.lowLevel().file('logical/test.txt', 'logical');

        expect(unzipped.lowLevel().files).to.include.keys('logical/');
        expect(unzipped.lowLevel().files['logical/'].dir).to.be.true;
    });

});
