var fs = require('fs')
var path = require('path')
var rimraf = require('rimraf')
var test = require('tape')
var zip = require('../')

var filePath = path.join(__dirname, 'content', 'file.txt')
var tmpPath = path.join(__dirname, 'tmp')

fs.mkdirSync(tmpPath, { recursive: true })

test('zipSync', function (t) {
  var tmpFileZipPath = path.join(tmpPath, 'file.zip')
  zip.zipSync(filePath, tmpFileZipPath)

  var tmpFilePath = path.join(tmpPath, 'file.txt')
  rimraf.sync(tmpFilePath)
  zip.unzipSync(tmpFileZipPath, tmpPath)

  var tmpFile = fs.readFileSync(tmpFilePath)
  var file = fs.readFileSync(filePath)

  t.deepEqual(tmpFile, file)
  t.end()
})

test('zip', function (t) {
  t.plan(4)

  var tmpFileZipPath = path.join(tmpPath, 'file.zip')
  zip.zip(filePath, tmpFileZipPath, function (err) {
    t.error(err)

    var tmpFilePath = path.join(tmpPath, 'file.txt')
    rimraf(tmpFilePath, function (err) {
      t.error(err)

      zip.unzip(tmpFileZipPath, tmpPath, function (err) {
        t.error(err)

        var tmpFile = fs.readFileSync(tmpFilePath)
        var file = fs.readFileSync(filePath)

        t.deepEqual(tmpFile, file)
      })
    })
  })
})
