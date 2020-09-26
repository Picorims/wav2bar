
const assert = require('assert');
const AssertionError = require('assert').AssertionError;

try 
{	
	const { extractIcon } = require('./bindings');
	// Correct test:
	const buffer = extractIcon("C:\\Windows\\System32\\cmd.exe", "large");
	//const t = assert.strictEqual(4286, buffer.length); // Large size

	const fs = require('fs');
	fs.writeFileSync('test.ico', buffer);
} 
catch (e) 
{
	console.log("Error Catch:");
    if (e instanceof AssertionError) {
      // Output expected AssertionErrors.
      console.log(e);
    } else {
      // Output unexpected Errors.
      console.log(e);
    } 
}