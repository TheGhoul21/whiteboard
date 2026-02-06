# Installation Guide

Download and install the Whiteboard desktop app for your platform.

## Download

### Latest Release

Visit the [GitHub Releases page](https://github.com/TheGhoul21/whiteboard/releases) to download the latest version.

### Choose Your Platform

**macOS:**
- `whiteboard-macos-universal.dmg` (recommended)
- Supports both Intel and Apple Silicon

**Windows:**
- `whiteboard-windows-x64.msi` (installer)
- Or `whiteboard-windows-x64.exe` (portable)

**Linux:**
- `whiteboard-linux-x64.AppImage` (recommended)
- Or `whiteboard-linux-x64.deb` (Debian/Ubuntu)

## Installation Steps

### macOS

1. Download `whiteboard-macos-universal.dmg`
2. Open the DMG file
3. Drag "Whiteboard" to Applications folder
4. First launch:
   - Right-click the app → "Open"
   - Click "Open" in security dialog
   - (Required for unsigned apps)
5. App launches with control window

**Troubleshooting macOS:**

If you see "App is damaged" error:
```bash
xattr -cr /Applications/Whiteboard.app
```

### Windows

**Using MSI Installer:**
1. Download `whiteboard-windows-x64.msi`
2. Double-click to run installer
3. Follow installation wizard
4. Click "Finish"
5. Launch from Start Menu → Whiteboard

**Using Portable EXE:**
1. Download `whiteboard-windows-x64.exe`
2. Move to desired folder
3. Double-click to launch
4. No installation required

**Troubleshooting Windows:**

If Windows Defender blocks the app:
1. Click "More info"
2. Click "Run anyway"
3. (First-time only)

### Linux

**Using AppImage:**
1. Download `whiteboard-linux-x64.AppImage`
2. Make executable:
   ```bash
   chmod +x whiteboard-linux-x64.AppImage
   ```
3. Double-click to launch
4. Or run from terminal:
   ```bash
   ./whiteboard-linux-x64.AppImage
   ```

**Using DEB Package:**
1. Download `whiteboard-linux-x64.deb`
2. Install:
   ```bash
   sudo dpkg -i whiteboard-linux-x64.deb
   ```
3. Fix dependencies if needed:
   ```bash
   sudo apt-get install -f
   ```
4. Launch from applications menu

**Troubleshooting Linux:**

If you see missing library errors:
```bash
# Ubuntu/Debian
sudo apt-get install libwebkit2gtk-4.1-0 libayatana-appindicator3-1

# Fedora
sudo dnf install webkit2gtk4.1 libappindicator-gtk3
```

## First Launch

### Control Window

On first launch, you'll see the control window:
- Toolbar at top with all drawing tools
- Canvas in center
- Frame manager on right
- Status bar at bottom

### Open Presentation Window

Click the **"Open Presentation"** button (bottom-right) to launch the presentation window.

A second frameless window appears showing only the canvas.

[Learn more about Presentation Mode →](/desktop/presentation-mode)

## Verify Installation

### Check Version

1. Open the app
2. Look for version number in window title or about dialog
3. Current version: v1.0.0

### Test Features

Quick verification checklist:
- [ ] App launches successfully
- [ ] Can draw on canvas
- [ ] Toolbar tools work
- [ ] Can open presentation window
- [ ] Presentation syncs with control window

## Update

### Check for Updates

Currently, updates are manual:
1. Visit [GitHub Releases](https://github.com/TheGhoul21/whiteboard/releases)
2. Download latest version
3. Install over existing installation

Future versions will include auto-update functionality.

## Uninstall

### macOS
1. Drag app from Applications to Trash
2. Empty Trash

Optional: Remove saved data
```bash
rm -rf ~/Library/Application\ Support/com.whiteboard.app
```

### Windows
1. Settings → Apps → Whiteboard → Uninstall
2. Or use MSI uninstaller

Optional: Remove saved data
```
%APPDATA%\com.whiteboard.app
```

### Linux

**AppImage:**
Simply delete the AppImage file

**DEB:**
```bash
sudo apt-get remove whiteboard
```

Optional: Remove saved data
```bash
rm -rf ~/.config/com.whiteboard.app
```

## Build from Source

Advanced users can build from source:

### Prerequisites
- Node.js 20+
- Rust (latest stable)
- Platform-specific dependencies

### Build Steps

```bash
# Clone repository
git clone https://github.com/TheGhoul21/whiteboard.git
cd whiteboard

# Install dependencies
cd client
npm install

# Build desktop app
npm run tauri build
```

Artifacts in: `client/src-tauri/target/release/bundle/`

[View build configuration →](https://github.com/TheGhoul21/whiteboard/blob/main/.github/workflows/tauri-build.yml)

## Next Steps

Now that you've installed the app:

1. [Learn the basics →](/guide/getting-started)
2. [Set up presentation mode →](/desktop/presentation-mode)
3. [Configure OBS →](/desktop/obs-integration)

## Support

Having installation issues?

- [Check troubleshooting guide](/desktop/#troubleshooting)
- [Search existing issues](https://github.com/TheGhoul21/whiteboard/issues)
- [Report a bug](https://github.com/TheGhoul21/whiteboard/issues/new)
