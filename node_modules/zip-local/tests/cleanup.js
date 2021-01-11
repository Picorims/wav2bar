var fs = require('fs');
var async = require('async');
var rm_rf = require('rimraf');

// delete files and directories created by tests
var file_list = [
    "./tests/assets/files.async.T3Pack.zip",
    "./tests/assets/files.sync.T3Pack.zip",
    "./tests/assets/dirs.async.T3Pack.zip",
    "./tests/assets/dirs.sync.T3Pack.zip"
];

var dir_list = [
    "./tests/assets/hello-async-unzip",
    "./tests/assets/hello-sync-unzip"
];

async.each(file_list, function (file, callback) {

    fs.unlink(file, function (err) {

        callback();
    });

}, function (err) {

    if (err)
        throw err;
});

async.each(dir_list, function (dir, callback) {

    rm_rf(dir, function (err) {

        callback();
    });

}, function (err) {
    if (err)
        throw err;
});
