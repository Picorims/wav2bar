var fs = require('graceful-fs');
var path = require('path');
var JSZip = require('jszip');
var Q = require('q');
var async = require('async')
var ZipExport = require('./libs/ZipExport.js');
var ZippedFS = require('./libs/ZippedFS.js');

/*
 * factory method to create jszip objects where 'createFolders'
 * option is the default behavior everywhere
 */
 JSZip.make = function(data, options) {

     // augments the options object with a 'createFolders' option
     function augment(_opts) {
         var opts = _opts || {};
         opts.createFolders = opts.createFolders || true;
         return opts;
     }

     var instance = new JSZip(data, augment(options));

     var originals = {};
     originals.load = instance.load;
     originals.file = instance.file;

     instance.load = function(data, options) {
         return originals.load.call(instance, data, augment(options));
     };

     instance.file = function(name, data, options) {
         if(!data) {
             return originals.file.call(instance, name);
         }

         return originals.file.call(instance, name, data, augment(options));
     };

     return instance;
 };

/*****************************************************************************************
******************************** PRIVATE HELPER FUNCTIONS ********************************
*****************************************************************************************/

/*
 * recursively and asynchronously vistis the directory and all subdirectories and zips all files it finds
 * @param dir {String}: the path to the subdirectory
 * @param zipped_dir {JSZip}: the JSZip object with the new directory as root
 */
function zip_dir(dir, zipped_dir) {

    var deferred = Q.defer();

    fs.readdir(dir, function (err, entries) {

        if (err) {
            deferred.reject(err);
            return;
        }

        var entries_paths = entries.map(function (entry) {
            return path.normalize(dir + path.sep + entry);
        });

        async.map(entries_paths, fs.stat, function (err, stats) {

            if(err) {
                deferred.reject(err);
                return;
            }

            var entries_count = entries_paths.length;

            // construct a an array of objects each contain an with-parent entry and its type
            var typed_entries = Array(entries_count);
            for (var i = 0; i < entries_count; i++) {

                typed_entries[i] = {
                    path: entries_paths[i],
                    type: stats[i].isDirectory() ? 'dir' : 'file'
                }
            }

            async.each(typed_entries, function (entry, callback) {

                var parsed_entry_path = path.parse(entry.path);

                if (entry.type === 'dir') {

                    var new_zipped_dir = zipped_dir.folder(parsed_entry_path.base);

                    // recursively zip the newly found dir
                    Q.fcall(zip_dir, entry.path, new_zipped_dir).then(function () {
                        //the end of this iteration
                        callback();
                    })
                    .catch(function(error) {
                        callback(error);
                    }).done();
                }
                else {

                    fs.readFile(entry.path, function (err, data) {

                        if (err) {
                            callback(err);
                            return;
                        }

                        //zip the file within the current subdir
                        zipped_dir.file(parsed_entry_path.base, data);

                        // the end of this iteration
                        callback();
                    });
                }

            }, function (err) {

                // here all iterations are over
                if (err)
                    deferred.reject(err);
                else
                    // resolve the deferred and fullfil the promise
                    deferred.resolve();
            });
        });
    });

    return deferred.promise;
}

/*
 * recursively and synchronously visits the directory and all subdirectories and zips all files it finds
 * @param dir {String}: the path to the subdirectory
 * @param zipped_dir {JSZip}: the JSZip object with the new directory as root
 */
function zip_dir_sync(dir, zipped_dir) {

    var entries = fs.readdirSync(dir);
    var entries_count = entries.length;

    for(var i = 0; i < entries_count; i++) {
        var entry = entries[i];
        var entry_normalized_path = path.normalize(dir + path.sep + entry);
        var entry_stats = fs.statSync(entry_normalized_path);

        if(entry_stats.isDirectory()) {

            var new_zipped_dir = zipped_dir.folder(entry);

            // recursively zip the newly found dir
            zip_dir_sync(entry_normalized_path, new_zipped_dir);
        }
        else {

            var file = fs.readFileSync(entry_normalized_path);

            // zip the file within current subdir
            zipped_dir.file(entry, file);
        }
    }
}


/*****************************************************************************************
********************************** MODULE PUBLIC APIS ************************************
*****************************************************************************************/


var ZipLocal = {};  //the module container

ZipLocal.sync = {} // container for the synchronous version of the the api

/*
 * zips a given file/directory asynchronously
 * @param entity {String || Buffer || ZippedFS}: the path to file/directory to zip, the buffer containing the file or a ZippedFS object of an unzipped file
 * @param _callback {Function}: the function to be called when the zipping is done
 * @param _shiftedCallback {Function}: the callback shifted to last argument if entity is a Buffer (optional)
 */
ZipLocal.zip = function (entity, _callback, _shiftedCallback) {

    var zipped_obj = JSZip.make();

    if (typeof entity === "string") {

        // the entity is a path pointing to a file or a directory

        // the callback is not shifted
        var callback = _callback || function () { };

        var normalized_path = path.normalize(entity);

        fs.stat(normalized_path, function (err, stats) {

            if (err) {
                callback(err);
                return;
            }

            if (stats.isDirectory()) {

                // start zipping the directory
                Q.fcall(zip_dir, normalized_path, zipped_obj).then(function () {

                    // invoke the callback
                    callback(null, new ZipExport(zipped_obj, false, true));
                })
                .catch(function(error) {
                    callback(error);
                }).done();
            }
            else {

                var parsed_path = path.parse(normalized_path);
                fs.readFile(normalized_path, function (err, file) {

                    if (err) {
                        callback(err);
                        return;
                    }

                    zipped_obj.file(parsed_path.base, file);

                    // invoke the callback
                    callback(null, new ZipExport(zipped_obj, false, true));

                });
            }
        });
    }
    else if (entity instanceof Buffer) {

        // the entity is a buffer containing a file

        // the _callback argument is now the name of the file in buffer
        // the callback is shifted to _shiftedCallback argument
        var name = _callback;
        var callback = _shiftedCallback || function () { };

        zipped_obj.file(name, entity);

        // invoke the callback
        callback(null, new ZipExport(zipped_obj, false, true));
    }

    else if (entity instanceof ZippedFS) {

        // the entity is a ZippedFS from an unzipped file
        var callback = _callback || function () { };

        //invoke the callback
        callback(null, new ZipExport(entity.unzipped_file, false, true));
    }
    else {
        callback(new Error("Unsupported type: data is neither a path or a Buffer"));
    }
}

/*
 * unzips a given zip file asynchronously
 * @param file {String || Buffer}: the path to the zip file or the buffer containing it
 * @param _callback {Function}: the function to be called when the unzipping is done
 */
ZipLocal.unzip = function (file, _callback) {

    var callback = _callback || function () { };
    var zipped_obj = JSZip.make();

    if (typeof file === "string") {

        // file is a path that points to a zip file

        var normalized_path = path.normalize(file);

        fs.readFile(normalized_path, function (err, data) {

            if(err) {
                callback(err);
                return;
            }

            zipped_obj.load(data);

            //invoke the callback
            callback(null, new ZipExport(zipped_obj, true, true))

        });
    }
    else if (file instanceof Buffer) {

        // file is a Buffer that contains the data

        zipped_obj.load(file);

        //invoke the callback
        callback(null, new ZipExport(zipped_obj, true, true))
    }
    else {
        callback(new Error("Unsupported type: data is neither a path or a Buffer"));
    }

}

/*
 * zips a given file/directory synchronously
 * @param entity {String || Buffer || ZippedFS}: the path to the file/directory to zip, a buffer containing a file or a ZippedFS object of an unzipped file
 * @param buffer_name {String}: the name of the file if entity is buffer (optional)
 * @return {ZipExport}: the ZipExport object that contains exporting interfaces
 */
ZipLocal.sync.zip = function(entity, buffer_name) {

    var zipped_obj = JSZip.make();

    if (typeof entity === "string") {

        // the entity is a path pointing to a file or a directory

        var normalized_path = path.normalize(entity);
        var stats = fs.statSync(normalized_path);

        if (stats.isDirectory()) {

            // start zipping the directory
            zip_dir_sync(normalized_path, zipped_obj);

            return new ZipExport(zipped_obj);
        }
        else {

            var parsed_path = path.parse(normalized_path);
            var file = fs.readFileSync(normalized_path);

            zipped_obj.file(parsed_path.base, file);

        }
    }
    else if (entity instanceof Buffer) {

        // the entity is a buffer containing a file

        zipped_obj.file(buffer_name, entity);
    }
    else if (entity instanceof ZippedFS) {

        // the entity is a ZippedFS from an unzipped file

        //change the zipped_obj
        zipped_obj = entity.unzipped_file;
    }
    else {
        throw new Error("Unsupported type: data is neither a path or a Buffer");
    }

    return new ZipExport(zipped_obj);
}

/*
 * unzips a given zip file synchrnously
 * @param file {String || Buffer}: the path to the zip file or the buffer containing it
 * @return {ZipExport}: the ZipExport object that contains exporting interfaces
 */
ZipLocal.sync.unzip = function (file) {

    var zipped_obj = JSZip.make();

    if (typeof file === "string") {

        // file is a path that points to a zip file

        var normalized_path = path.normalize(file);

        var data = fs.readFileSync(normalized_path);

        zipped_obj.load(data);
    }
    else if (file instanceof Buffer) {

        // file is a Buffer that contains the data

        zipped_obj.load(file);
    }
    else {
        throw new Error("Unsupported type: data is neither a path or a Buffer");
    }

    return new ZipExport(zipped_obj, true, false);
};


module.exports = ZipLocal;
