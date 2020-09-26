# `electron-installer-common` - Changes by Version

## [Unreleased]

[Unreleased]: https://github.com/electron-userland/electron-installer-common/compare/v0.10.3...master

## [0.10.3] - 2020-08-25

[0.10.3]: https://github.com/electron-userland/electron-installer-common/compare/v0.10.2...v0.10.3

### Added

* Support for Electron 10 Linux dependencies (#80)

## [0.10.2] - 2020-06-25

[0.10.2]: https://github.com/electron-userland/electron-installer-common/compare/v0.10.1...v0.10.2

### Added

* Support for Electron 9 Linux dependencies (#66)
* macOS support for `readMetadata` (#67)
* Install symbolic icons on Linux when provided (#70)
* TypeScript definition (#71)

### Fixed

* Export all dependencies-related functions (#72)

## [0.10.1] - 2020-02-13

[0.10.1]: https://github.com/electron-userland/electron-installer-common/compare/v0.10.0...v0.10.1

### Deprecated

* `spawn` export, use `@malept/cross-spawn-promise` directly (#63)

## [0.10.0] - 2020-01-21

[0.10.0]: https://github.com/electron-userland/electron-installer-common/compare/v0.9.0...v0.10.0

### Changed

* The function signature for `spawn` is compatible with the one in `child_process`, with the
  addition of `logger` and `updateErrorCallback` (#62)

## [0.9.0] - 2020-01-16

[0.9.0]: https://github.com/electron-userland/electron-installer-common/compare/v0.8.0...v0.9.0

### Changed

* Require Node >= 10.0.0 (#52)

## [0.8.0] - 2019-12-14

[0.8.0]: https://github.com/electron-userland/electron-installer-common/compare/v0.7.3...v0.8.0

### Added

* `hasSandboxHelper` (#47)

### Fixed

* dependencies: remove UUID dependency for Electron >=8.0.0-beta.1 (#45)
* installer: allow sourceDir to be used before options is set (#46)

### Changed

* Require Node >= 8.3.0 (#47)

## [0.7.3] - 2019-06-19

[0.7.3]: https://github.com/electron-userland/electron-installer-common/compare/v0.7.2...v0.7.3

### Fixed

* Allow multiple package names for trash dependencies (#37)

## [0.7.2] - 2019-06-12

[0.7.2]: https://github.com/electron-userland/electron-installer-common/compare/v0.7.1...v0.7.2

### Added

* Add `packagePaths` to `options` when calling `ElectronInstaller.movePackage()` (#36)

## [0.7.1] - 2019-06-09

[0.7.1]: https://github.com/electron-userland/electron-installer-common/compare/v0.7.0...v0.7.1

### Added

* ATSPI dependency for Electron >= 5 (#31)

## [0.7.0] - 2019-05-24

[0.7.0]: https://github.com/electron-userland/electron-installer-common/compare/v0.6.3...v0.7.0

### Fixed

* Let implementing modules specify revision fallbacks (#29)

### Changed

* `wrapError` is more `async`/`await`-friendly (#27)

### Removed

* Support for Node &lt; 8 (#27)

## [0.6.3] - 2019-05-02

[0.6.3]: https://github.com/electron-userland/electron-installer-common/compare/v0.6.2...v0.6.3

### Added

* `updateSandboxHelperPermissions` function outside of `ElectronInstaller` (#23)

## [0.6.2] - 2019-03-07

[0.6.2]: https://github.com/electron-userland/electron-installer-common/compare/v0.6.1...v0.6.2

### Added

* Sandbox helper permission updater (#16)

## [0.6.1] - 2019-02-19

[0.6.1]: https://github.com/electron-userland/electron-installer-common/compare/v0.6.0...v0.6.1

### Fixed

* Upgrade `asar` to `^1.0.0`, which removes a vulnerable transitive dependency (#15)

## [0.6.0] - 2019-01-22

[0.6.0]: https://github.com/electron-userland/electron-installer-common/compare/v0.5.0...v0.6.0

### Fixed

* Retain original backtrace when using wrapError (#11)

### Changed

* Replace many exported functions with an installer class (#13)
* Rename `readMeta` to `readMetadata` (#14)

## [0.5.0] - 2019-01-04

[0.5.0]: https://github.com/electron-userland/electron-installer-common/compare/v0.4.2...v0.5.0

### Added

* `sanitizeName` function (#10)

### Changed

* The default value for `replaceScopeName`'s `divider` parameter changed from `_` to `-` (#10)

## [0.4.2] - 2019-01-03

[0.4.2]: https://github.com/electron-userland/electron-installer-common/compare/v0.4.1...v0.4.2

### Added

* Re-export public functions not already in `src/index.js` (#7)

## [0.4.1] - 2019-01-02

[0.4.1]: https://github.com/electron-userland/electron-installer-common/compare/v0.4.0...v0.4.1

### Fixed

* Check that `createBinary` symlinks to an existing Electron app binary (#6)

## [0.4.0] - 2018-12-26

[0.4.0]: https://github.com/electron-userland/electron-installer-common/compare/v0.3.0...v0.4.0

### Changed

* `getDepends` no longer uses `getTrashDepends` (#4)
* `getTrashDepends` returns a list of dependencies instead of a Debian-style dependency string (#4)

## [0.3.0] - 2018-12-26

[0.3.0]: https://github.com/electron-userland/electron-installer-common/compare/v0.2.0...v0.3.0

### Changed

* Don't require an `options` object to use `readElectronVersion` (#3)

## [0.2.0] - 2018-12-26

[0.2.0]: https://github.com/electron-userland/electron-installer-common/compare/v0.1.0...v0.2.0

### Added

* scoped package name replacer (#1)
* utility functions for dealing with dependencies (#2)

## [0.1.0] - 2018-12-13

[0.1.0]: https://github.com/electron-userland/electron-installer-common/releases/tag/v0.1.0

Initial release.
