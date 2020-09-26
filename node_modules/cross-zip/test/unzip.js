var fs = require('fs')
var path = require('path')
var rimraf = require('rimraf')
var test = require('tape')
var zip = require('../')

var filePath = path.join(__dirname, 'content', 'file.txt')
var fileZipPath = path.join(__dirname, 'content', 'file.txt.zip')
var tmpPath = path.join(__dirname, 'tmp')

fs.mkdirSync(tmpPath, { recursive: true })

test('unzipSync', function (t) {
  var tmpFilePath = path.join(tmpPath, 'file.txt')
  rimraf.sync(tmpFilePath)
  zip.unzipSync(fileZipPath, tmpPath)

  var tmpFile = fs.readFileSync(tmpFilePath)
  var file = fs.readFileSync(filePath)

  t.deepEqual(tmpFile, file)
  t.end()
})

test('unzip', function (t) {
  t.plan(3)

  var tmpFilePath = path.join(tmpPath, 'file.txt')
  rimraf(tmpFilePath, function (err) {
    t.error(err)

    zip.unzip(fileZipPath, tmpPath, function (err) {
      t.error(err)

      var tmpFile = fs.readFileSync(tmpFilePath)
      var file = fs.readFileSync(filePath)

      t.deepEqual(tmpFile, file)
    })
  })
})

test('unzip from a folder with a space in it', function (t) {
  t.plan(4)

  var zipSpacePath = path.join(tmpPath, 'folder space', path.basename(fileZipPath))
  fs.mkdirSync(path.dirname(zipSpacePath), { recursive: true })
  fs.copyFileSync(fileZipPath, zipSpacePath)

  var tmpFilePath = path.join(tmpPath, 'file.txt')
  rimraf(tmpFilePath, function (err) {
    t.error(err)

    zip.unzip(zipSpacePath, tmpPath, function (err) {
      t.error(err)

      t.ok(fs.existsSync(tmpFilePath), 'extracted file should exist')
      var tmpFile = fs.readFileSync(tmpFilePath)
      var file = fs.readFileSync(filePath)

      t.deepEqual(tmpFile, file)
    })
  })
})
