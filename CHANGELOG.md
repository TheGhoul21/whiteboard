# Changelog

All notable changes to the Whiteboard desktop app will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Tauri desktop application with dual-window architecture
- Control window with full UI (toolbar, frame manager, all controls)
- Presentation window with canvas-only view (frameless, clean for OBS capture)
- Real-time state synchronization between control and presentation windows
- Presentation window features:
  - Frameless design (no title bar or OS controls)
  - Always-on-top toggle option
  - Custom background color picker (for chroma keying in OBS)
  - Fullscreen mode (F11 to toggle, ESC to exit)
- Presentation controls panel in control window
- Cross-platform build support (macOS, Windows, Linux)
- GitHub Actions CI/CD workflow for automated builds

### Changed
- Converted from web-only app to Tauri desktop app
- Split App.tsx rendering into control and presentation modes
- Added window mode detection utilities

### Technical
- Added `@tauri-apps/cli` and `@tauri-apps/api` dependencies
- Created Rust backend with window management commands
- Implemented localStorage-based state sync with < 100ms latency
- Created custom hooks for window synchronization
- Added platform detection utilities

## [1.0.0] - TBD

Initial release of the Tauri desktop app.
