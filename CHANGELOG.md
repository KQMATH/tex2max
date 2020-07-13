# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org).

## [Unreleased]

## [1.3.1] - 2020-07-13
### Added
- Support for decimal commas.

### Fixed
- Operators after trigonometric functions are now correctly handled.
- Correctly support other types of matrix environments than just `matrix`. 

## [1.2.0] - 2019-06-25
### Changed
- Functions following trigonometric functions are not included as arguments to trigonometric function.

### Fixed
- Fractions are wrapped with brackets to ensure the correctness of subsequent expressions.

## [1.1.0] - 2019-04-22
### Added
- Piped expressions are now supported.

## [1.0.4] - 2019-01-27
### Added
- Added documentation for options and methods in README file.
- Badge for the current npm version in README file.

## [1.0.3] - 2019-01-22
### Changed
- Update listing of distributed files in README file.

## 1.0.2 - 2019-01-22

[Unreleased]: https://github.com/KQMATH/tex2max/compare/v1.3.1...HEAD
[1.3.1]: https://github.com/KQMATH/tex2max/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/KQMATH/tex2max/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/KQMATH/tex2max/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/KQMATH/tex2max/compare/v1.0.4...v1.1.0
[1.0.4]: https://github.com/KQMATH/tex2max/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/KQMATH/tex2max/compare/v1.0.2...v1.0.3
