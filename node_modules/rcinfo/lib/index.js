(function() {
  var path, execFile;
  
  path = require('path');
  execFile = require('child_process').execFile;

  module.exports = function(winfile, callback) {
    var args, child, executable, options;

    executable = path.resolve(__dirname, '..', 'bin', 'ShowVer.exe');
    options = { cwd: path.resolve(__dirname, '..') };
    args = [winfile];
    
    if (process.platform !== "win32") {
      // replace executable with wine      
      args.unshift(executable); 
      executable = "wine";
    }

    child = execFile(executable, args, options, function(error, stdout, stderr){
      // on success error value is non null      
      if (error !== null) {        
        var map, key, value, 
            lines = stdout.split(/\r?\n/),
            info = {};
        
        lines.forEach(function(line, index) {          
          // skip first line          
          if (index > 0 && line) {
            map = line.split(/:(.+)/); // split on : first occurence only
            key = map[0].trim();
            value = map[1].trim();              
            
            // only add new key/value pair (no overwrite)
            if(!info[key]){            
              info[key] = value;
            }
          }                   
        });

        return callback(null, info);   
                             
      } else {        
        return callback(stdout);
      }     
    });
    
  };

}).call(this);
