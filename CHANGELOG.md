# Changelogs
This document is based on Keep a Changelog 1.0.0

## 0.2.0-beta (?)

### Changed
- Made a lot of internal refactoring:
    - Object parameters user interface and object openable containers have been internally refactored for more flexibility.
- Invalid numbers and strings are shown visually instead of being silently ignored in object parameters.
- Made spacing between inputs more compact.

### Removed
- Image preview is no longer available in background picking user interface.

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