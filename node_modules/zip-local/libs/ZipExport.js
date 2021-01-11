var fs = require('graceful-fs');
var path = require('path');
var async = require('async');
var ZippedFS = require('./ZippedFS.js');

/*****************************************************************************************
******************************** PRIVATE HELPER FUNCTIONS ********************************
*****************************************************************************************/

/*
 * extracts an unzipped file to the disk asynchrnously
 * @param _path {String}: extraction path
 * @param jszip {JSZip}: the jszip object containg the unzipped file
 * @param callback {Function}: the function to be called when extracting is done
 */
function extract_to(_path, jszip, callback) {

    var extraction_path = _path === null ? "./" : path.normalize(_path);
    if(extraction_path[extraction_path.length - 1] !== path.sep) {
        extraction_path += path.sep;
    }

    // make sure that the extraction path points to a existing directory
    fs.stat(extraction_path, function (err, stats) {

        if (err) {
            callback(err);
            return;
        }

        if (!stats.isDirectory()) {
            callback(new Error(extraction_path + " is not a directory"));
            return;
        }

        // sort out the unzipped file to directories and files
        var dirs = [];
        var files = [];
        for (var name in jszip.files) {

            var entry = jszip.files[name];

            if (entry.dir)
                dirs.push(name);
            else
                files.push(name);
        }

        // sort the directories ascendingy by level
        dirs.sort(function (a, b) {
            function dir_sep_count(dir) { return (dir.match(/\//g) || []).length; }

            return dir_sep_count(a) - dir_sep_count(b);
        });


        // create the directories
        async.eachSeries(dirs, function (dir, end_iteration) {

            //check first if the directory exists
            fs.stat(extraction_path + dir, function(err, stats) {
                if((err && err.code === "ENOENT") || !stats.isDirectory()) {
                    // create the directory if it doesn't exist
                    fs.mkdir(extraction_path + dir, function (err) {
                        // end of this iteration
                        if(err) {
                            end_iteration(err);
                            return;
                        }
                        end_iteration();
                    });
                }
                else if(err && err.code !== "ENOENT") {
                    end_iteration(err);
                    return;
                }
                else {
                    end_iteration();
                }
            });

        }, function (err) {

            if (err) {
                callback(err);
                return;
            }

            // write the files
            async.each(files, function (file, end_iteration) {

                var data = jszip.file(file).asNodeBuffer();

                fs.writeFile(extraction_path + file, data, function (err) {

                    if (err) {
                        end_iteration(err);
                        return;
                    }

                    // end of this iteration
                    end_iteration();

                });
            }, function (err) {

                if(err) {
                    callback(err);
                    return;
                }

                // invoke the callback
                callback(null);
            });
        });
    });
}

/*
 * extracts an unzipped file to the disk synchrnously
 * @param _path {String}: extraction path
 * @param jszip {JSZip}: the jszip object containg the unzipped file
 */
function extract_to_sync(_path, jszip) {

    var extraction_path = _path === null ? "./" : path.normalize(_path);
    if(extraction_path[extraction_path.length - 1] !== path.sep) {
        extraction_path += path.sep;
    }

    // make sure that the extraction path points to a existing directory
    var stats;
    try { stats = fs.statSync(extraction_path); }
    catch (err) { throw new Error(extraction_path + " doesn't exist"); }
    if (!stats.isDirectory())
        throw new Error(extraction_path + " is not a directory");

    // sort out the unzipped file to directories and files
    var dirs = [];
    var files = [];
    for (var name in jszip.files) {

        var entry = jszip.files[name];

        if (entry.dir)
            dirs.push(name);
        else
            files.push(name);
    }

    // sort the directories ascendingy by level
    dirs.sort(function (a, b) {
        function dir_sep_count(dir) { return (dir.match(/\//g) || []).length; }

        return dir_sep_count(a) - dir_sep_count(b);
    });


    // create the directories
    dirs.forEach(function (dir) {
        try {
            var stats = fs.statSync(extraction_path + dir);
            if(!stats.isDirectory()) {
                throw new Error("!dir");
            }
        }
        catch(err) {
            if(err.code === "ENOENT" || err.message === "!dir") {
                fs.mkdirSync(extraction_path + dir);
            }
            else {
                throw err;
            }
        }
    });

    // write the files
    files.forEach(function (file) {

        var data = jszip.file(file).asNodeBuffer();

        fs.writeFileSync(extraction_path + file, data);
    });

}


/*****************************************************************************************
********************************** MODULE PUBLIC APIS ************************************
***** THE MODULE CONTAINS THE APIS THAT DEAL WITH EXPORTING AFTER ZIPPING IS COMPLETE ****
*****************************************************************************************/

/*
 * constructs a ZipExport object out of a JSZip object
 * @param jszip {JSZip}: the JSZip object
 * @param unzipped {Boolean}: a flag to indicate if the source jszip was from an unzipped file
 * @param async {Boolean}: a flag to indicate whether the zipping was asynchrnously
 */
function ZipExport(jszip, unzipped, async) {

    // hold the JSZip for exporting
    this.content = jszip;

    // determines if the exported will be compressed
    this.compressed = false;

    // determines if the source is an unzipped file
    this.src_unzipped = unzipped ? true : false;

    // determines if the exported file will be written asynchronously
    this.save_async = async ? true : false;
}

/*
 * returns the associated JSZip object for low level operations
 * @returns {JSZip}: the associated JSZip object
 */
ZipExport.prototype.lowLevel = function () {

    return this.content;
}

/*
 * sets the object so that the exported format will be compressed
 */
ZipExport.prototype.compress = function () {

    if(!this.src_unzipped)
        this.compressed = true;

    return this;
}

/*
 * returns the zipped/unzipped file representation in memory
 * @return {Buffer|ZippedFS}: Buffer for a zipped file, a ZippedFS object for unzipped
 */
ZipExport.prototype.memory = function() {

    if (!this.src_unzipped) {

        // generate the zipped buffer
        var buff = this.content.generate({
            type: "nodebuffer",
            compression: this.compressed ? "DEFLATE" : undefined
        });

        return new Buffer(buff);
    }
    else {

        // return a ZippedFS object of the unzipped file
        return new ZippedFS(this.content);
    }
}

/*
 * writes the zipped/unzipped file to disk
 * @param _path {String}: path to the output file
 * @param _callback {Function}: the function to be called when the save is done (only in async zipping)
 */
ZipExport.prototype.save = function (_path, _callback) {

    var callback = _callback || function () { };

    if (!this.src_unzipped) {
        // generate the zipped buffer
        var buff = this.content.generate({
            type: "nodebuffer",
            compression: this.compressed ? "DEFLATE" : undefined
        });

        var normalized_path = path.normalize(_path);

        // write the new file
        if (!this.save_async) {

            fs.writeFileSync(normalized_path, buff);

        }
        else
            fs.writeFile(normalized_path, buff, function (err) {

                if (err) {
                    callback(err);
                    return;
                }

                //invoke the callback
                callback(null);

            });
    }
    else {

        // extract the unzipped file to given directory
        if (!this.save_async)
            extract_to_sync(_path ? _path : null, this.content);
        else
            extract_to(_path ? _path : null, this.content, callback);
    }
}


module.exports = ZipExport;
