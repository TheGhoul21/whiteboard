# Testing Guide - Whiteboard Desktop App

This guide helps you verify all features of the Tauri desktop app are working correctly.

## Prerequisites

- Tauri app installed (from `.dmg` on macOS, `.msi` on Windows, or `.AppImage` on Linux)
- OBS Studio installed (optional, for recording tests)
- Two displays/spaces recommended (for dual-window testing)

## Quick Test (5 minutes)

### 1. Launch & Basic UI
- [ ] App launches successfully
- [ ] Control window appears with toolbar
- [ ] Toolbar shows all tools (pen, smooth-pen, highlighter, eraser, laser, pointer, etc.)
- [ ] Can draw basic strokes on canvas

### 2. Presentation Window
- [ ] Click "Open Presentation" button (bottom-right)
- [ ] Presentation window appears (frameless, no toolbar)
- [ ] Draw in control window → appears in presentation window
- [ ] Change color in control → syncs to presentation
- [ ] Change tool in control → syncs to presentation

### 3. Spotlight & Laser
- [ ] Select spotlight tool → spotlight appears in both windows
- [ ] Move mouse in control → spotlight follows in presentation
- [ ] Select laser pointer → draw → stroke fades over 3 seconds
- [ ] Laser strokes appear in presentation window

### 4. Close & Cleanup
- [ ] Click "Close Presentation" → only presentation closes
- [ ] Close control window → app closes completely

## Full Test Suite (15-20 minutes)

### State Synchronization Tests

#### Drawing Sync
- [ ] **Pen tool**: Draw stroke in control → appears in presentation < 100ms
- [ ] **Smooth pen**: Draw calligraphy stroke → syncs to presentation
- [ ] **Highlighter**: Draw semi-transparent stroke → syncs correctly
- [ ] **Eraser**: Erase strokes in control → updates in presentation
- [ ] **Shapes**: Draw rectangle/circle/arrow → syncs to presentation

#### Smart Objects Sync
- [ ] **Text**: Add text object → appears in presentation
- [ ] **LaTeX**: Paste math formula → renders in presentation
- [ ] **Code block**: Paste code snippet → appears in presentation
- [ ] **Note**: Create sticky note → syncs to presentation
- [ ] **Images**: Paste/import image → appears in presentation

#### UI State Sync
- [ ] **Color change**: Select different color → syncs to presentation
- [ ] **Tool change**: Switch tools → presentation reflects current tool
- [ ] **Background**: Change background (grid/lines/dark) → syncs to presentation
- [ ] **Zoom**: Zoom in/out (Cmd/Ctrl + mousewheel) → syncs to presentation
- [ ] **Pan**: Pan canvas (spacebar + drag) → syncs to presentation

### Presentation Window Features

#### Frameless Design
- [ ] No title bar visible in presentation window
- [ ] No OS window controls (minimize/maximize/close buttons)
- [ ] Clean edge-to-edge canvas
- [ ] Canvas fills entire window

#### Always On Top
- [ ] Open presentation settings (⚙️ icon)
- [ ] Enable "Always on top" checkbox
- [ ] Open another app → presentation stays on top
- [ ] Disable "Always on top" → presentation goes behind other windows

#### Custom Background Color
- [ ] Open presentation settings
- [ ] Change background color (try #00FF00 for green screen)
- [ ] Color appears in presentation window immediately
- [ ] Try multiple colors (red, blue, black, white)

#### Fullscreen Mode
- [ ] In presentation window, press **F11**
- [ ] Window goes fullscreen (no dock/menubar)
- [ ] Press **ESC** → exits fullscreen
- [ ] Fullscreen toggle works multiple times
- [ ] Try "Start in fullscreen" checkbox → reopen → starts fullscreen

### Laser Pointer Tests

#### Basic Behavior
- [ ] Select laser pointer tool (crosshair icon)
- [ ] Stroke appears in red color
- [ ] Draw complete stroke
- [ ] Release mouse → stroke starts fading immediately
- [ ] Stroke fades smoothly over 3 seconds
- [ ] Initial opacity is ~60% (semi-transparent)
- [ ] Final opacity is 0% (invisible)

#### Animation Quality
- [ ] Fade is smooth (no sudden jumps)
- [ ] Multiple laser strokes can fade simultaneously
- [ ] Drawing new stroke while old one fades works correctly
- [ ] Laser strokes sync to presentation window

#### Persistence
- [ ] After 15 seconds, laser strokes are completely removed
- [ ] Memory doesn't grow with many laser strokes

### Spotlight Pointer Tests

#### Basic Behavior
- [ ] Select spotlight/pointer tool
- [ ] Move mouse → spotlight effect appears
- [ ] Dark overlay dims everything except spotlight circle
- [ ] Spotlight has golden border and glow effect
- [ ] Spotlight follows mouse smoothly (60fps)

#### Cross-Window Sync
- [ ] Spotlight appears in control window ✓
- [ ] **Spotlight appears in presentation window** ✓
- [ ] Spotlight position syncs in real-time (< 5ms)
- [ ] Moving fast → no lag or stuttering
- [ ] Spotlight size matches between windows

#### Overlay Behavior
- [ ] **Spotlight appears ABOVE codeblocks** ✓
- [ ] Spotlight appears above images
- [ ] Spotlight appears above all DOM elements
- [ ] Can still interact with codeblocks (if in control mode)

### Window Management

#### Opening/Closing
- [ ] Open presentation → second window appears
- [ ] Try opening again → error message or no duplicate
- [ ] Close presentation (button) → only presentation closes
- [ ] Reopen presentation → works correctly
- [ ] Close control → both windows close

#### Window State
- [ ] Presentation window remembers settings (always on top, background)
- [ ] Settings persist across app restarts
- [ ] Window positions are reasonable (not off-screen)

#### Multi-Monitor
- [ ] Move presentation to second monitor
- [ ] Spotlight still syncs correctly
- [ ] Drawing still syncs correctly
- [ ] Fullscreen works on second monitor

### Performance Tests

#### Sync Latency
- [ ] Draw quick stroke → appears in presentation < 5ms
- [ ] Change color → updates in presentation < 5ms
- [ ] Change tool → updates in presentation < 5ms
- [ ] Spotlight moves → updates in presentation < 5ms
- [ ] No noticeable lag or delay

#### Memory & CPU
- [ ] Open Activity Monitor/Task Manager
- [ ] Control window: < 200MB memory
- [ ] Presentation window: < 150MB memory
- [ ] CPU idle: < 5%
- [ ] CPU drawing: < 20%
- [ ] No memory leaks after 10 minutes of use

#### Large Canvas
- [ ] Draw 100+ strokes
- [ ] Pan and zoom smoothly
- [ ] State still syncs quickly
- [ ] No slowdown or stuttering

### OBS Integration Tests

#### Window Capture
- [ ] Open OBS Studio
- [ ] Add source → Window Capture
- [ ] Select "Whiteboard - Presentation" from dropdown
- [ ] Presentation canvas visible in OBS preview
- [ ] Draw in control → appears in OBS preview
- [ ] Spotlight appears in OBS preview

#### Recording Quality
- [ ] Start recording in OBS (1920x1080, 60fps recommended)
- [ ] Draw some strokes with different colors
- [ ] Use laser pointer to point at things
- [ ] Use spotlight to highlight areas
- [ ] Stop recording and review video:
  - [ ] Canvas is clear and sharp
  - [ ] No toolbar or UI elements visible
  - [ ] Strokes appear smooth (no stuttering)
  - [ ] Laser pointer fades smoothly
  - [ ] Spotlight effect is clear
  - [ ] No flickering or tearing

#### Chroma Keying
- [ ] Set presentation background to #00FF00 (green)
- [ ] In OBS, add "Chroma Key" filter to window capture
- [ ] Select green color
- [ ] Background should be transparent
- [ ] Canvas content remains visible
- [ ] Draw strokes → appear correctly
- [ ] Try other colors (#0000FF blue, #FF00FF magenta)

### Cross-Platform Tests (if applicable)

#### macOS
- [ ] .dmg installer works
- [ ] App opens without security warnings (after approval)
- [ ] All features work as expected
- [ ] Cmd+Q closes app
- [ ] Native macOS menus visible

#### Windows
- [ ] .msi installer works
- [ ] App opens without Windows Defender warnings
- [ ] All features work as expected
- [ ] Alt+F4 closes app
- [ ] Native Windows title bar (control window only)

#### Linux
- [ ] .AppImage works (make executable, double-click)
- [ ] OR .deb installs correctly
- [ ] All features work as expected
- [ ] Ctrl+Q closes app
- [ ] Window manager integration works

## Known Issues & Workarounds

### Issue: Console Opens Automatically
**Status**: FIXED
**Workaround**: Close dev console if it appears. Right-click → Inspect if needed.

### Issue: Initial Sync Delay
**Status**: FIXED (now < 5ms)
**Workaround**: N/A

### Issue: Spotlight Behind Codeblocks
**Status**: FIXED (now uses HTML overlay)
**Workaround**: N/A

## Reporting Issues

If you find bugs during testing:

1. **Check console**: Open dev tools (right-click → Inspect) in both windows
2. **Note the steps**: Write down exact steps to reproduce
3. **Environment**: Note your OS, version, and hardware
4. **Screenshots**: Capture both windows if possible
5. **Logs**: Check terminal output from `npm run tauri:dev`

## Performance Benchmarks

### Expected Performance
- **Sync latency**: < 5ms (control → presentation)
- **Frame rate**: 60fps steady during drawing
- **Memory**: < 200MB per window
- **CPU idle**: < 5%
- **CPU drawing**: < 20%
- **Bundle size**: ~12-15MB

### How to Measure
- Use browser dev tools Performance tab
- Monitor `[Control] Syncing state to presentation window` console logs
- Check Activity Monitor/Task Manager for memory/CPU
- Use `fps-meter` browser extension for frame rate

## Success Criteria

✅ All core features work
✅ No critical bugs
✅ Performance meets benchmarks
✅ OBS integration works smoothly
✅ Cross-platform build succeeds
✅ Documentation is complete

## Next Steps After Testing

1. **Fix any critical bugs** found during testing
2. **Document workarounds** for minor issues
3. **Update CHANGELOG.md** with test results
4. **Tag release** (e.g., `v1.0.0`) if all tests pass
5. **Push to GitHub** to trigger CI/CD builds
6. **Create release notes** with installers

---

**Happy Testing! 🎨📹**

If you find the app works well, you're ready to start recording educational videos with your dual-window whiteboard setup!
