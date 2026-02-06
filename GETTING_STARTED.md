# Getting Started with Whiteboard Desktop App

Welcome to the Whiteboard Tauri desktop app! This guide will help you get up and running quickly.

## Quick Start

### 1. Install Dependencies

```bash
cd client
npm install
```

This installs both the frontend dependencies and Tauri CLI.

### 2. Run in Development Mode

```bash
npm run tauri:dev
```

This will:
- Start the Vite dev server
- Launch the control window with full UI
- Enable hot-reload for instant feedback

**First launch may take 3-5 minutes** as Rust compiles the Tauri backend. Subsequent launches are much faster (~10 seconds).

### 3. Open Presentation Window

1. Look for the floating panel in the bottom-right corner
2. Click the **"Open Presentation"** button
3. A frameless window will appear showing only the canvas

### 4. Try Drawing

Draw in the control window and watch it appear instantly in the presentation window!

## Key Features to Try

### Presentation Settings
Click the ⚙️ (settings) icon in the presentation controls to access:
- **Always on top**: Keep presentation window above other apps
- **Background color**: Pick a color for chroma keying (try #00FF00 for green screen)
- **Start in fullscreen**: Launch presentation in fullscreen mode

### Keyboard Shortcuts

**Control Window:**
- `Cmd/Ctrl+Shift+P` - Toggle presentation window

**Presentation Window:**
- `F11` - Toggle fullscreen
- `ESC` - Exit fullscreen

## Using with OBS

1. Open OBS Studio
2. Add a new source: **Window Capture**
3. Select **"Whiteboard - Presentation"** from the dropdown
4. Adjust crop if needed
5. Optional: Add **Chroma Key** filter if using custom background color

**Tips:**
- Use a solid background color (#00FF00, #0000FF) for clean keying
- Enable "Always on top" to keep presentation above OBS
- Use fullscreen mode (F11) for clean capture without window borders

## Building for Production

### Local Build

```bash
npm run tauri:build
```

**Build artifacts:**
- macOS: `src-tauri/target/release/bundle/dmg/*.dmg`
- Windows: `src-tauri/target/release/bundle/msi/*.msi`
- Linux: `src-tauri/target/release/bundle/appimage/*.AppImage`

### Cross-Platform Builds (GitHub Actions)

Push a version tag to trigger automated builds:

```bash
git tag v1.0.0
git push --tags
```

GitHub Actions will build for macOS, Windows, and Linux. Download artifacts from the Actions tab.

## Project Structure

```
client/
├── src/               # React frontend
│   ├── components/    # React components
│   │   ├── PresentationControls.tsx  # Window management UI
│   │   └── PresentationWindow.tsx     # Presentation wrapper
│   ├── hooks/         # Custom React hooks
│   │   └── useWindowSync.ts           # State synchronization
│   └── utils/         # Utility functions
│       └── platform.ts                # Platform detection
├── src-tauri/         # Rust backend
│   ├── src/
│   │   └── main.rs    # Window management commands
│   └── tauri.conf.json # Tauri configuration
└── package.json       # Scripts: tauri:dev, tauri:build
```

## Common Issues

### Presentation window not opening?
- Check console for errors
- Verify `window.__TAURI__` is defined (desktop only feature)
- Restart the app

### State not syncing?
- Open dev tools in both windows (Cmd+Opt+I / Ctrl+Shift+I)
- Check browser console for errors
- Verify localStorage is accessible

### Build taking forever?
- First build takes 5-10 minutes (Rust compilation)
- Subsequent builds are much faster (~30 seconds)
- Use `tauri:dev` for development (hot-reload)

## Next Steps

- **Read the docs**: See [TAURI_README.md](./TAURI_README.md) for detailed documentation
- **Check implementation notes**: See [IMPLEMENTATION_NOTES.md](./IMPLEMENTATION_NOTES.md) for technical details
- **Try recording**: Set up OBS and record a test video
- **Customize**: Modify presentation settings to match your needs

## Need Help?

- **Technical details**: See [IMPLEMENTATION_NOTES.md](./IMPLEMENTATION_NOTES.md)
- **Full documentation**: See [TAURI_README.md](./TAURI_README.md)
- **Changelog**: See [CHANGELOG.md](./CHANGELOG.md)
- **Main README**: See [README.md](./README.md)

## Development Workflow

```bash
# Terminal 1: Run Tauri dev server
cd client
npm run tauri:dev

# Terminal 2: Watch for changes (optional, dev mode has hot-reload)
npm run dev

# Terminal 3: Run tests (if you add them)
npm test
```

## Contributing

When making changes:
1. Test in `tauri:dev` mode first
2. Verify state syncs between windows
3. Test with OBS if changing presentation window
4. Run `npm run build` to check TypeScript
5. Run `npm run tauri:build` to verify production build

## Performance Tips

- **Sync latency**: < 100ms (state syncs every 50ms, debounced)
- **Memory**: < 200MB per window
- **Bundle size**: ~12-15MB (much smaller than Electron)
- **Rendering**: 60fps canvas updates

Enjoy creating educational content with your new dual-window whiteboard! 🎨📹
