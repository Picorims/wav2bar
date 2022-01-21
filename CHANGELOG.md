# Changelogs
This document is based on Keep a Changelog 1.0.0

## 0.3.0-beta (2022-01-21)

### Added
- Particle flow's containers can now be rotated.
- Added logs folder shortcut to settings tab.
- The user interface is now locked behind a loading screen while big operations are performed and the user interface shouldn't be touched.

### Changed
- Changed license from MIT to GPL-3.0-or-later
- Changed how saves and objects are handled internally.
- Improved particle flows performances when using a big amount of particles.
- Optimized bar visualizers when changing their parameters.
- Improved visual updates of particle flows and visualizers while audio is paused or stopped.
- Changing an object's name is now done using a dedicated field in the rack (less clicks!).
- Changed rules for timers positioning. (The converter should reajust timers when opening a project from an older version.)
- Changed some default values (it only affects newly created objects and new object parameters).
- The default color is now randomized.
- Irrelevant options (i.e that have no effect) in some objects are no longer available (timers, visualizers). In consequence they are no longer stored as well with these objects (as they are useless).
- Made top user interface for audio and zoom control more compact.
- Split audio control block in half in the top user interface for better display in a smaller window.
- Improved help on object creation.
- Improved responsiveness on window resize.

### Removed
- Removed background visual object that duplicates image/shape visual object. Existing background visual objects in older saves will be converted to image visual objects.

### Fixed
- Video export via CLI works again.
- Particle flow's flow type parameter provides help again.
- When opening a new save, existing user interface from old visual objects are now effectively removed.
- Interacting with control panel's top tabs no longer moves the rest of the user interface.
- The top of the screen was hard to see, and hidden no matter what behind the top user interface (in some zoom and window size scenarios). There is now a minimum of padding above the screen.
- The window no longer flashes to white when being first opened.
- Changing the color of a waves visualizer while audio is paused now updates the color visually. Same for particle flows.
- About section no longer have the text centered.

### Security
- Updated Electron from v12 to v16.
- Updated dependencies in general

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