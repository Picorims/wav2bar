var test = require('tape')
var path = require('path')
var waterfall = require('run-waterfall')
var rcinfo = require('..')

var fileInfo = {
  AuthorName: 'Ted Peck',
  FileVersion: '1.0.0.1',
  ProductVersion: '1.0.0.1',
  ProductName: 'ShowVer',
  InternalName: 'ShowVer',
}

function createFileInfo(winFile) {
  return function (t) {

    waterfall([
      function (callback) {
        rcinfo(winFile, callback)
      }, function(info, callback){
        t.ok(info, 'should return an initialised object')
        callback()
      }
    ], function (err) {
      t.end(err)
    })
	
  }
}

function fileInfoTest(winFile, key, expectedValue) {
  return function (t) {

    waterfall([
      function (callback) {
        rcinfo(winFile, callback)
      }, function (info, callback) {		
		    t.equal(info[key], expectedValue, key + ' should be equal to expected value: ' + expectedValue)
		    callback()
      }
    ], function (err) {
      t.end(err)
    })
	
  }
}

if (process.platform !== 'win32') {
  console.log('Platform is ' + process.platform + ' skipping win32 tests...')  
} else {
  console.log('Executing win32 tests...')
  
  var executable = path.resolve(__dirname, '..', 'bin', 'ShowVer.exe');
  
  test('file info creation', createFileInfo(executable))
  
  test('Author name test', fileInfoTest(executable, 'AuthorName', fileInfo.AuthorName))
  test('file version test', fileInfoTest(executable, 'FileVersion', fileInfo.FileVersion))
  test('product version test', fileInfoTest(executable, 'ProductVersion', fileInfo.ProductVersion))
  test('product name test', fileInfoTest(executable, 'ProductName', fileInfo.ProductName))
  test('internal name test', fileInfoTest(executable, 'InternalName', fileInfo.InternalName))  
}