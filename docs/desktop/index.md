# Desktop App Overview

The Whiteboard desktop app is a native application built with Tauri, designed specifically for educators recording video content.

## Why Use the Desktop App?

### Key Advantages

**Dual-Window Presentation Mode**
- Separate control and presentation windows
- Real-time synchronization (< 5ms latency)
- Perfect for OBS screen capture
- [Learn more →](/desktop/presentation-mode)

**Professional Recording Features**
- Frameless presentation window
- Custom background colors (chroma key support)
- Always-on-top window option
- Fullscreen toggle

**Better Performance**
- Native application (not browser-based)
- Lower memory usage
- 60fps smooth rendering
- Offline access

**Cross-Platform**
- macOS (Intel & Apple Silicon)
- Windows 10/11
- Linux (Ubuntu, Fedora, etc.)

## System Requirements

### Minimum Requirements

**macOS:**
- macOS 10.15 (Catalina) or later
- 4GB RAM
- 100MB disk space

**Windows:**
- Windows 10 or later
- 4GB RAM
- 100MB disk space

**Linux:**
- Recent distribution with GTK 3.24+
- 4GB RAM
- 100MB disk space

### Recommended for Recording

- 8GB+ RAM
- Dual monitors
- Dedicated graphics card (optional)
- OBS Studio installed

## What's Included

### Core Features

All web version features:
- ✅ Infinite canvas with pan/zoom
- ✅ Professional drawing tools
- ✅ Smart object detection
- ✅ LaTeX math rendering
- ✅ Code syntax highlighting
- ✅ Frame-based navigation
- ✅ Magic animations

### Desktop-Exclusive Features

Only in desktop app:
- ⭐ Dual-window presentation mode
- ⭐ Laser pointer with fade
- ⭐ Spotlight pointer
- ⭐ Frameless window capture
- ⭐ Custom background colors
- ⭐ Always-on-top mode
- ⭐ Fullscreen toggle
- ⭐ OBS integration optimizations

## Getting Started

1. [Install the desktop app →](/desktop/installation)
2. [Set up presentation mode →](/desktop/presentation-mode)
3. [Configure OBS integration →](/desktop/obs-integration)
4. [Master laser & spotlight →](/desktop/laser-spotlight)

## Architecture

### Dual-Window Design

```
Control Window (You)          Presentation Window (Audience)
┌──────────────────┐          ┌──────────────────┐
│ Toolbar          │          │                  │
│ ┌──────────────┐ │          │                  │
│ │              │ │   sync   │   Canvas Only    │
│ │   Canvas     │─┼─────────▶│                  │
│ │              │ │  < 5ms   │   (Frameless)    │
│ └──────────────┘ │          │                  │
│ Controls         │          └──────────────────┘
└──────────────────┘                 ▼
                                OBS Capture
```

### Technology Stack

- **Framework**: Tauri 2.0
- **Backend**: Rust
- **Frontend**: React 18 + TypeScript
- **Canvas**: Konva (HTML5 Canvas)
- **Sync**: localStorage bridge with manual events
- **Build**: Vite

### Bundle Size

- **macOS**: ~12-15MB (universal binary)
- **Windows**: ~10-12MB
- **Linux**: ~8-10MB (AppImage)

10x smaller than Electron alternatives!

## Updates

### Auto-Updates

Future releases will support automatic updates. Currently, manually download new versions from GitHub Releases.

### Version History

Check the [CHANGELOG](https://github.com/TheGhoul21/whiteboard/blob/main/CHANGELOG.md) for release notes and version history.

## Support

### Documentation

- [Installation Guide](/desktop/installation)
- [Presentation Mode](/desktop/presentation-mode)
- [OBS Integration](/desktop/obs-integration)
- [Laser & Spotlight](/desktop/laser-spotlight)

### Community

- [GitHub Discussions](https://github.com/TheGhoul21/whiteboard/discussions)
- [Issue Tracker](https://github.com/TheGhoul21/whiteboard/issues)
- [Feature Requests](https://github.com/TheGhoul21/whiteboard/issues/new)

### Troubleshooting

Common issues and solutions:

**App won't launch:**
- macOS: Right-click → Open (bypass Gatekeeper first time)
- Windows: Allow through Windows Defender

**Presentation window not syncing:**
- Close and reopen presentation window
- Check console for errors (right-click → Inspect)

**Performance issues:**
- Reduce canvas complexity
- Close other applications
- Check for available updates

## Next Steps

Ready to get started? Install the desktop app and unlock professional recording features.

[Install Desktop App →](/desktop/installation)
