# v0.3.4
Released 6/1/2016
* Fixed bug reported in issue [#5](https://github.com/Mostafa-Samir/zip-local/issues/5)

# v0.3.3
Released 4/22/2016
* Defaulted the `createFolders` options in JSZip to `true` everywhere to ensure the conversion of logical directories in zip files to real ones, thus avoiding errors in extracting.

# v0.3.2
Released 4/15/2016
* Used `graceful-fs` instead of native `fs` to avoid having **EMFILE** errors.

# v0.3.1
Released 4/12/2016
* Fixed bug reported in issue [#4](https://github.com/Mostafa-Samir/zip-local/issues/4)

# v0.3.0
Released 4/2/2016
* Improved asynchronous error handeling by passing any error that occurs as the first argument of any callback function.

# v0.2.1
Released 10/1/2015

* Added the ability to zip/unzip files directly from the buffers containing them in memory and zipping form <code>ZippedFS</code> objects. [[Description & Exmaple]](https://github.com/Mostafa-Samir/zip-local#zippingunzipping-directly-from-memory)
* Added the ability to access low level operations on zipped/unzipped data. [[Description & Exmaple]](https://github.com/Mostafa-Samir/zip-local#low-level-operations)
