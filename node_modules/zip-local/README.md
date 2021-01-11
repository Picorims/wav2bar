# zip-local

## Why another one?!

I was working on a project and I needed something to zip and unzip local directories, so I went and searched on npm. I got quite a lot of results and all of them worked perfectly with files, but it when it came to directories each of them suffered from at least one of these three problems:
* not being asynchronous
* not being developer-friendly
* having odd behaviors (like zipping the whole path to root along with the directory)

So I wrote this to provide something free of the three problems!

## Installation

using npm:
```
npm install zip-local
```

## Usage

The API comes in two versions: an asynchrnous version and a synchronous one. This gives you the choice to use whichever suitable for your application.

### Zipping

Zipping is done through <code>ZipLocal.zip</code> or its synchronous version <code> ZipLocal.sync.zip</code> by passing the path to the file or directory that needs to be zipped. In the asynchrnous version, the callback is passed an instance of <code> ZipExport</code> object that contains the APIs to export the
zipped file. In the synchronous version, the <code>ZipExport</code> object is returned.

Here's an example of asynchronous zipping,

```javascript
var zipper = require("zip-local");

// zipping a file
zipper.zip("./hello-world.cpp", function(error, zipped) {

    if(!error) {
        zipped.compress(); // compress before exporting

        var buff = zipped.memory(); // get the zipped file as a Buffer

        // or save the zipped file to disk
        zipped.save("../package.zip", function(error) {
            if(!error) {
                console.log("saved successfully !");
            }
        });
    }
});
```

and here's synchronous zipping,

```javascript
var zipper = require('zip-local');

// zipping a file to memory without compression
var buff = zipper.sync.zip("./hello-world.java").memory();

// zipping a directory to disk with compression
// the directory has the following structure
// |-- hello-world.txt
// |-- cpp
//     |-- hello-world.cpp
// |-- java
//     |--hello-world.java
zipper.sync.zip("./hello/world/").compress().save("pack.zip");
```

### Unzipping

Similiarly, unzipping is done through <code>ZipLocal.unzip</code> or the synchronous <code>ZipLocal.sync.unzip</code> by passing the path to the zip file. Like the zipping functions, these functions also use the <code>ZipExport</code> object for exporting your unzipped file, but in case of exporting in memory the <code>memory</code> function returns a <code>ZippedFS</code> object instead of a buffer. This objects servers as a mini-filesystem for the unzipped file.

An example for asynchronous unzipping,

```javascript
var zipper = require('zip-local');

zipper.unzip("../package.zip", function(error, unzipped) {

    if(!error) {
        // extract to the current working directory
        unzipped.save(null, function() { });

        var unzippedfs = unzipped.memory();

        // print an array of file paths in the unzipped file
        console.log(unzippedfs.contents()); // prints [ 'hello-world.cpp' ]

        // read the file as text
        var txt = unzippedfs.read("hello-world.cpp", 'text');

        // or read it as Buffer
        var buff = unzippedfs.read("hello-world.cpp", 'buffer');
    }
});
```

and the synchronous unzipping,

```javascript
var zipper = require('zip-local');

// extract to an existing directory
zipper.sync.unzip("pack.zip").save("../../hello");

// export in memory
var unzippedfs = zipper.sync.unzip("pack.zip").memory();

// logs ['hello-world.txt', 'cpp/hello-world.cpp', 'java/hello-world.java']
console.log(unzippedfs.contents());

// read file in buffer
var buff = unzippedfs.read("cpp/hello-world.cpp", "buffer");
```

### Zipping/Unzipping directly from memory

Imagine a serevr that needs to zip files it receives through its clients and send the zipped file to the client. When the file is received it resides in a buffer in memory, and to be able to zip it with the library (using the methods described so far) we must first save the file to local storage then zip it using its path so that the library would read it back to memory and zip it. This is definitely ineffcient and wasteful of the serevr's time and resources.

To solve this issue, starting from v0.2.0 you can zip/unzip a file directly from the buffer containing it in memory or zip an entire <code>ZippedFS</code> object from a previously unzipped file. This could be done simply by passing the bufferto the zip/unzip methods or the <code>ZippedFS</code> object to zip method instead of the path, and it works for both asynchronous and synchronous versions. Notice that in the case of zipping a buffer you'll need to pass an extra argument after the buffer which is the name of the file that will be included in the zip.

Here's an example implementing the above scenario that utilizes the ability to zip buffers :

```javascript
var zipper = require('zip-local');
var net = require('net');

var server = net.createServer(function (socket) {

    socket.on('data', function(data) {

        zipper.zip(data, "remote_file", function(error, zipped) {

            if(error) {
                console.log("ERROR: %s", error.message);
                return;
            }

            // cache a copy of the zipped file on the server
            zipped.save("zipped_from" + socket.remoteAddress + ".zip", function(error) {
                if(error) {
                    console.log("ERROR: %s", error.message);
                    return;
                }
            });

            // send the zipped file back to the client
            socket.write(zipped.memory());
        });
    });
});

server.listen(3000);
```

### Low Level Operations

While the library was designed to provide a simple high-level APIs to zip/unzip local directories and files, it's sometimes needed to perform some low level operations on the data before exporting it like adding new files to the zip or removing some files form an unzipped file before writing to disk. And since this library is based on JSZip which provides these low level operations, starting from v0.2.0 you can access the underlying <code>JSZip</code> object and all its low level features through the method <code>ZipExport#lowLevel()</code>. After you zip/unzip your data and acquire the <code>ZipExport</code> object, you can call this method from it and retrieve the underlying <code>JSZip</code> object and play around with it.

Here's an example that utilizes the low level operations to remove files and also utilizes the ability to zip <code>ZippedFS</code> object. This code cleans zipped files from executables (namely .exe, .bat, and .sh):

```javascript
var zipper = require('zip-local');

zipper.unzip('package.zip', function(error, unzipped) {

    if(error) {
        console.log("ERROR: %s", error.message);
        return;
    }

    var unzippedFS = unzipped.memory();
    var files = unzippedFS.contents();
    var notExecRegExp = new RegExp(/^[^.]+$|\.(?!(sh|exe|bat)$)([^.]+$)/);

    files.forEach(function (file) {
        if(!notExecRegExp.test(file))
            unzipped.lowLevel().remove(file);
    });

    var cleanUnzippedFS = unzipped.memory();

    // re-zip the clean ZippedFS
    zipper.zip(cleanUnzippedFS, function(zipped) {

        zipped.save("package.zip", function(error) {
            if(error) {
                console.log("ERROR: %s", error.message);
            }
            else {
                console.log("The file is scanned and cleaned of executables");
            }
        });
    });
});
```
read the [API documentations](https://github.com/Mostafa-Samir/zip-local/wiki/API-Documentation) for furthur details.

## License

### MIT
