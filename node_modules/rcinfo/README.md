# rcinfo
A node module to show resources informations of exe and dll files.

## Usage

var rcinfo = require('rcinfo');

rcinfo(*path to an exe or dll file*, function (error, info) { ... })

### Example 
```
rcinfo('./bin/ShowVer.exe', function (error, info) {
  if (!error) {  
    console.log(info);
  }
});
```
This output ```info``` to the console with the following json string:
```
{ Signature: 'feef04bd',
  StrucVersion: '1.0',
  FileVersion: '1.0.0.1',
  ProductVersion: '1.0.0.1',
  FileFlagsMask: '0x3f',
  FileFlags: '0',
  FileOS: 'VOS__WINDOWS32',
  FileType: 'VFT_APP',
  FileDate: '0.0',
  LangID: '040904b0',
  AuthorName: 'Ted Peck',
  Comments: '',
  CompanyName: '',
  FileDescription: 'ShowVer console app for VersionInfo display',
  InternalName: 'ShowVer',
  LegalCopyright: 'Copyright © 2002',
  LegalTrademarks: '',
  OriginalFilename: 'ShowVer.exe',
  PrivateBuild: '',
  ProductName: 'ShowVer',
  SpecialBuild: '',
  Translation: '040904b0' }
  
```
### Acknowledgements
This module uses the *ShowVer.exe command-line VERSIONINFO display program by Ted Peck (c) 2002* available on [CodeProject](http://www.codeproject.com/Articles/2457/ShowVer-exe-command-line-VERSIONINFO-display-progr).