# Wav2Bar
A tool to make custom audio visualization and export production videos for the audio/music industry.

## Important Notes
- **This tool is usable at this point, but is still in early development! Your work is subject to bugs, backup your saves!**

## Hacking
- NodeJS must be installed (It will install npm too).
- Clone the git repository (you can also use GitHub's download button *if you only need to perform tests*). Note that Git LFS is used too. Git LFS files should be packaged together with the archive download.
- Mac/linux:
    - Reinstall the same version of Electron, the repository contains a Windows 64bit version of it.
- download FFmpeg for your operating system and configure it in the app settings (otherwise export won't work!).
- Open the repository folder in a prompt and run `npm start`.

## Compiling
Compilation is done through electron-forge v6's `make` command. No matter the platform, you can compile by running `npm run make` which is an alias to electron-forge make. It will automatically package the app before, but you can also do it using `npm run package`. More info at https://www.electronforge.io/.

Compilation settings are detailed in package.JSON at the "config" node. You can add additional configurations to export in other formats, but you need to have access to the targetted platform/OS and install required dependencies. The list of available makers is available at https://www.electronforge.io/config/makers.

FFMpeg should be installed independently and not compiled in the application.

#### ZIP
Zip maker is available for all platforms, without any dependencies required. On Windows, it will produce an executable (.exe) to run the app from anywhere on a Windows machine, without any installation process.

### Windows specific

#### WiX MSI
This maker create a Windows .msi installer. To make a .msi installer, Wix must be installed on the machine (not necessarily Windows), as well as `light` and `candle` installed from the WiX Toolkit. More info at https://www.electronforge.io/config/makers/wix-msi and https://github.com/felixrieseberg/electron-wix-msi.
**The paths for the installer assets are absolute, don't forget to change them in package.json or the make command will fail!**

### Linux specific
There are existing configurations for .deb and .rpm packages **although they have not been tested** as I have no viable Linux development environment at the moment.

#### .deb packages
.deb packages can be made on MacOS and Linux machines with `fakeroot` and `dpkg` packages installed.
See https://www.electronforge.io/config/makers/deb

#### .rpm packages
.rpm packages can be made on Linux machines with `rpm` or `rpm-build` packages installed.
See https://www.electronforge.io/config/makers/rpm.

### Mac Specific

#### .pkg packages
Although there is no support for MacOS, the application may run just fine as Electron supports MacOS. If you would like to make a .pkg package for MacOS instead or running from source, you may look at https://www.electronforge.io/config/makers/pkg.


## Website (WIP)
- https://picorims.github.io/wav2bar-website

## License
This tool is MIT licensed.

> Copyright (c) 2020-2021 Picorims, France.

> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.