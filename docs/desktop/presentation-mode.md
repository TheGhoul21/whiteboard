# Presentation Mode

The dual-window presentation mode is one of Whiteboard's most powerful features for recording educational videos. This guide explains how to use it effectively.

## Overview

Presentation mode splits your workspace into two synchronized windows:

1. **Control Window**: Full UI with toolbar and all controls (for you, the presenter)
2. **Presentation Window**: Clean canvas-only view (for your audience/OBS capture)

Both windows stay perfectly synchronized in real-time with < 5ms latency.

## Opening Presentation Mode

### From the Desktop App

1. Launch the Whiteboard desktop app
2. Look for the **"Open Presentation"** button in the bottom-right corner
3. Click to open the presentation window

A frameless window will appear showing only your canvas content.

### Keyboard Shortcut

Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux) to toggle presentation mode.

## Window Layout

### Control Window (Your View)

The control window shows everything:
- Complete toolbar with all tools
- Color picker and size controls
- Frame manager
- Background settings
- All UI controls

Use this window to:
- Draw and create content
- Switch tools and colors
- Navigate frames
- Adjust settings

### Presentation Window (Audience View)

The presentation window shows only:
- Canvas content (strokes, shapes, text, code, etc.)
- Spotlight effects
- Laser pointer strokes
- Custom background color

This window is:
- **Frameless**: No title bar or OS window controls
- **Clean**: No toolbar or UI elements
- **Synchronized**: Updates instantly as you work
- **OBS-ready**: Perfect for screen capture

## Presentation Settings

Click the settings icon (⚙️) in the control window to configure presentation mode:

### Always on Top

Enable this to keep the presentation window above all other applications.

**Use cases:**
- Keep canvas visible while switching to other apps
- Maintain presentation visibility during demonstrations
- Overlay on top of slides or other content

**How to enable:**
1. Open presentation settings
2. Check "Always on top"
3. Presentation window stays above other windows

### Custom Background Color

Change the presentation window background color.

**Use cases:**
- **Green screen** (#00FF00): Chroma key in OBS for transparent background
- **Blue screen** (#0000FF): Alternative chroma key color
- **Black** (#000000): High contrast for light-colored drawings
- **White** (#FFFFFF): Clean, professional look

**How to change:**
1. Open presentation settings
2. Click the background color picker
3. Select or enter a custom hex color
4. Color applies instantly to presentation window

### Fullscreen Mode

Toggle fullscreen for the presentation window.

**Keyboard shortcuts:**
- **F11**: Toggle fullscreen in presentation window
- **ESC**: Exit fullscreen

**Tips:**
- Use fullscreen when recording to eliminate distractions
- Fullscreen hides dock/taskbar for clean capture
- Check "Start in fullscreen" to always open fullscreen

## Real-Time Synchronization

Everything you do in the control window appears instantly in the presentation window:

### What Syncs

✅ **Drawing strokes**: Pen, highlighter, smooth pen, eraser
✅ **Shapes**: Rectangles, circles, arrows
✅ **Smart objects**: Text, LaTeX, code blocks, notes, images
✅ **Tool changes**: Current tool indicator
✅ **Color changes**: Active color
✅ **Background**: Grid, lines, dark mode
✅ **Zoom & pan**: Canvas position and scale
✅ **Spotlight position**: Real-time spotlight following
✅ **Laser pointer**: Temporary strokes with fade animation

### Sync Performance

- **Latency**: < 5ms typical (imperceptible to viewers)
- **Frame rate**: 60fps smooth animation
- **Mechanism**: localStorage bridge with manual event dispatch

## Using Spotlight & Laser

### Spotlight Pointer

The spotlight tool creates a highlighted circle that follows your mouse:

1. Select the **spotlight tool** from the toolbar (or press `Shift+P`)
2. Move your mouse in the control window
3. A spotlight circle appears, dimming everything except the highlighted area
4. The spotlight syncs in real-time to the presentation window

**Visual effect:**
- Dark overlay (70% opacity) over entire canvas
- Bright circle following your cursor
- Golden border and glow effect
- Appears **above all content** including code blocks

**Use cases:**
- Highlight specific parts of diagrams
- Draw attention to important text
- Guide viewers through complex visualizations

### Laser Pointer

The laser pointer creates temporary strokes that fade out:

1. Select the **laser pointer tool** from toolbar
2. Draw a stroke (typically arrows, circles, or underlines)
3. Release the mouse
4. Stroke starts fading immediately
5. Fade completes over 3 seconds
6. Stroke disappears after 15 seconds total

**Visual effect:**
- Red colored strokes
- Initial opacity: 60%
- Smooth fade over 3 seconds
- Complete removal after 15 seconds

**Use cases:**
- Point to specific elements
- Draw temporary annotations
- Circle important parts
- Create emphasis without permanent marks

## Multi-Monitor Setup

### Recommended Layout

**Single monitor:**
- Control window: Smaller, positioned at bottom
- Presentation window: Larger, positioned above

**Dual monitors:**
- Monitor 1: Control window (your workspace)
- Monitor 2: Presentation window fullscreen (for recording/streaming)

### Moving Windows

Simply drag the presentation window to your second monitor. All synchronization continues to work perfectly.

## Closing Presentation Mode

### Close Presentation Only

Click **"Close Presentation"** button in control window. The presentation window closes, but your control window and content remain open.

### Close Everything

Close the control window. Both windows close automatically.

## Tips for Recording

### Before Recording

1. ✅ Set up dual monitors (recommended)
2. ✅ Open presentation window
3. ✅ Move presentation to second monitor or resize appropriately
4. ✅ Set custom background if using chroma key
5. ✅ Enable "Always on top" if needed
6. ✅ Test spotlight and laser tools

### During Recording

1. ✅ Keep control window on your primary monitor
2. ✅ Only interact with control window (never click presentation)
3. ✅ Use spotlight to guide attention
4. ✅ Use laser for temporary emphasis
5. ✅ Pan/zoom in control - presentation follows

### Recording Settings

Recommended OBS settings:
- **Resolution**: 1920x1080
- **Frame rate**: 60fps
- **Source**: Window Capture → "Whiteboard - Presentation"
- **Crop**: None needed (frameless window)
- **Chroma key**: If using custom green/blue background

[Learn more about OBS Integration →](/desktop/obs-integration)

## Troubleshooting

### Presentation window not syncing

1. Check that presentation window is actually open
2. Verify console shows "Syncing state to presentation window" messages
3. Try closing and reopening presentation window
4. Restart the app if issue persists

### Spotlight not visible in presentation

Ensure you're using the spotlight/pointer tool (not regular pen). The spotlight should appear in both windows simultaneously.

### Sync lag or delay

- Expected latency: < 5ms
- If experiencing lag:
  - Check CPU usage (should be < 20% while drawing)
  - Close other heavy applications
  - Reduce canvas complexity (split into frames)

### Presentation window appears on wrong monitor

Simply drag it to the desired monitor. Settings will persist for future sessions.

## Next Steps

- [Set up OBS Integration →](/desktop/obs-integration)
- [Master Laser & Spotlight Tools →](/desktop/laser-spotlight)
- [Learn Advanced Features →](/features/)
