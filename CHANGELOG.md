# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2022-02-07

### :ant: Fixed

- Refactored the code to use spawn instead of exec to avoid "maxBuffer length exceeded" error

## [1.1.0] - 2021-04-21

### :heavy_minus_sign: Removed

- Removed the progress bar as it was not working fine with Jenkins platform,
- Improved file search regex

## [1.0.0] - 2021-03-31

### :heavy_plus_sign: Added

- Built this custom Angular CLI builder, which can be used to check Angular projects with a different tsconfig file and can help in enabling some tsconfig rules incrementally.
