# cross-zip [![travis][travis-image]][travis-url] [![npm][npm-image]][npm-url] [![downloads][downloads-image]][downloads-url] [![javascript style guide][standard-image]][standard-url]

[travis-image]: https://img.shields.io/travis/feross/cross-zip/master.svg
[travis-url]: https://travis-ci.org/feross/cross-zip
[npm-image]: https://img.shields.io/npm/v/cross-zip.svg
[npm-url]: https://npmjs.org/package/cross-zip
[downloads-image]: https://img.shields.io/npm/dm/cross-zip.svg
[downloads-url]: https://npmjs.org/package/cross-zip
[standard-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[standard-url]: https://standardjs.com

### Cross-platform .zip file creation

## install

```
npm install cross-zip
```

## usage

```js
var zip = require('cross-zip')

var inPath = path.join(__dirname, 'myFolder') // folder to zip
var outPath = path.join(__dirname, 'myFile.zip') // name of output zip file

zip.zipSync(inPath, outPath)
```

## api

### `zip.zip(inPath, outPath, [callback])`

Zip the folder at `inPath` and save it to a .zip file at `outPath`. If a `callback`
is passed, then it is called with an `Error` or `null`.

### `zip.zipSync(inPath, outPath)`

Sync version of `zip.zip`.

### `zip.unzip(inPath, outPath, [callback])`

Unzip the .zip file at `inPath` into the folder at `outPath`. If a `callback` is
passed, then it is called with an `Error` or `null`.

### `zip.unzipSync(inPath, outPath)`

Sync version of `zip.unzip`.

## Windows users

This package requires [.NET Framework 4.5 or later](https://www.microsoft.com/net)
and [Powershell 3](https://www.microsoft.com/en-us/download/details.aspx?id=34595).
These come **pre-installed** on Windows 8 or later.

On Windows 7 or earlier, you will need to install these manually in order for
`cross-zip` to function correctly.

## reference

- [Stack Overflow - zipping from command line in Windows](https://stackoverflow.com/questions/17546016/how-can-you-zip-or-unzip-from-the-command-prompt-using-only-windows-built-in-ca)

## related

- [cross-zip-cli](https://github.com/jprichardson/cross-zip-cli): CLI version of cross-zip.

## license

MIT. Copyright (c) [Feross Aboukhadijeh](http://feross.org).
