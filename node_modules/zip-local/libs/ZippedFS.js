/*****************************************************************************************
***** THE MODULE CONTAINS THE APIS THAT DEAL WITH READING FILES FROM AN UNZIPPED FILE ****
*****************************************************************************************/

/*
 * constructs a ZippedFS object out of a unzipped JSZip object
 * @param jszip {JSZip}: the JSZip object
 */
function ZippedFS(jszip) {

    // holds the content of the unzipped file
    this.unzipped_file = jszip;
    
    // holds a list of the files in the unzipped file
    this.files_list = [];

    // populate the files list
    for (var name in this.unzipped_file.files) {
        
        var entry = this.unzipped_file.files[name];
        if (!entry.dir)
            this.files_list.push(name);
    }
}

/*
 * returns the list of the files in the unzipped file
 * @return {Array}: a list of file paths in the unzipped file
 */
ZippedFS.prototype.contents = function () {
    return this.files_list;
}

/*
 * reads a file in the unzipped file by its path
 * @param _path {String}: the path of the file inside the unzipped file
 * @param type {String}: the return type of the file, either buffer or text
 * @return {Buffer|String}: a buffer that contains the file or the file as text
 */
ZippedFS.prototype.read = function (_path, type) {

    if (this.files_list.indexOf(_path) !== -1) {
        
        if (type === 'buffer')
            return this.unzipped_file.file(_path).asNodeBuffer();
        else if (type === 'text')
            return this.unzipped_file.file(_path).asText();
        else
            throw new Error("Unrecognized type");
    }
    else
        throw new Error(_path + " doesn't exist within the unzipped file");
}


module.exports = ZippedFS; 

 