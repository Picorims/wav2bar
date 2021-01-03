# Wav2Bar
A tool to make custom audio visualization and export production videos for the audio/music industry.

### Important Notes
- **This tool is usable at this point, but is still in early development! Your work is subject to bugs, backup your saves!**

### Hacking
- NodeJS must be installed (It will install npm too).
- Clone the git repository. Since git lfs is used, using the download feature of GitHub won't work, and so you might need to fork. Otherwise, __if you only want to get it for personal use and not for contributing__, use the source code download provided in a release.
- Mac/linux:
    - Reinstall the same version of Electron, the repository contains a Windows 64bit version of it.
    - download FFmpeg for your operating system. (in the create-video event in main.js, you need to change the paths accordingly for fluent-ffmpeg to work properly!)
- Open the repository folder in a prompt and run `npm start`.

### Website (WIP)
- https://picorims.github.io/wav2bar-website

### License
This tool is MIT licensed.

> Copyright (c) 2020-2021 Picorims, France.

> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.