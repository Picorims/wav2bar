# Changelogs
This document is based on Keep a Changelog 1.0.0

## 0.3.0-beta (?)



## 0.2.2-beta (2021-07-28)

### Fixed
- Videos can last more than 10 seconds again.

## 0.2.1-beta (2021-07-28)

### Added
- Added a Command Line Interface (CLI)
    - Added subcommand `load` to load a save file.
    - Added subcommand `export` to export a save file into a video.
    - Use `--help` flag to receive help.

## 0.2.0-beta (2021-07-21)

### Added
- Added SVG filters support to all objects.
- Added shortcuts for easy positioning of objects based on the screen.
- Added shortcuts for easy sizing of objects to screen size.
- Added a color picker.
- Added experimental JPEG export (quality 100) instead of PNG, the quality should not be impacted and the export faster.

### Changed
- Made a lot of internal refactoring:
    - Object parameters user interface and object openable containers have been internally refactored for more flexibility.
- Some invalid values are shown visually instead of being silently ignored in object parameters.
- Made control panel display more compact.

### Removed
- Image preview is no longer available in background picking user interface.

### Fixed
- Changing the points count of a visualizer no longer breaks its display.
- Text overline was not showing properly.
- Background size didn't have a default value shown.
- Fixed a syntax error in FFmpeg not present warning.
- Updated the font size help bubble, that was outdated.
- Removed "audio not saved" from the saving option title, this was only accurate in pre 0.1.0-beta releases.

## 0.1.2-beta (2021-06-22)

### Added
- Added support for Windows .msi installer.

### Changed
- When Wa2Bar installation's root directory is not writable, use app data folder provided by the OS.

### Security
- Updated Electron from v9 to v12.
- Updated some dependencies.

## 0.1.1-beta (2021-04-18)

### Added
- A user with no configured paths for FFmpeg and/or FFprobe are now prompted with an additional tutorial
on how to install FFmpeg and FFprobe with Wav2Bar.

### Changed
- Replaced "open recommended folder" button for FFmpeg in the settings by a "open help" button
that gives instructions on how to install FFmpeg and FFprobe for Wav2Bar.

### Removed
- Removed the menu bar at the top of framed windows, that has absolutely no use in the application.

### Fixed
- Particle speed smoothing is now applied at export as well.

## 0.1.0-beta (2021-04-13)
- Initial public release.