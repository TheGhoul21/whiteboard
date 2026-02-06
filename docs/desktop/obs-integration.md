# OBS Integration

Learn how to capture Whiteboard's presentation window in OBS Studio for professional educational videos.

## Why OBS + Whiteboard?

The Whiteboard desktop app was designed specifically for OBS recording:

- **Clean Capture**: Frameless presentation window with no UI elements
- **Chroma Key**: Custom background colors for green screen effects
- **60fps Recording**: Smooth animations and drawing
- **Always on Top**: Keep whiteboard visible while switching apps
- **Dual Monitor**: Control on one screen, capture on another

## Prerequisites

### Install OBS Studio

Download from [obsproject.com](https://obsproject.com/):
- OBS Studio 28+ recommended
- Free and open source
- Available for macOS, Windows, Linux

### Set Up Whiteboard

1. Install Whiteboard desktop app
2. Launch the app
3. Open presentation window (bottom-right button)
4. Move presentation to second monitor (optional)

## Basic Setup

### Add Window Capture Source

1. Open OBS Studio
2. In **Sources** panel, click **+** (Add)
3. Select **Window Capture**
4. Name it "Whiteboard" → OK
5. In properties:
   - **Window**: Select "Whiteboard - Presentation"
   - **Capture Method**: Automatic (or specific to platform)
   - **Window Match Priority**: Window title must match
6. Click **OK**

The presentation window content now appears in OBS preview.

### Position and Resize

1. Click and drag the capture in preview to position
2. Use red handles to resize
3. Or right-click → Transform → Fit to screen

**Recommended:**
- Full-screen capture for main content
- Or resize to desired portion of frame

## Chroma Key Setup

Remove the background and make it transparent.

### Set Custom Background in Whiteboard

1. In control window, click settings (⚙️)
2. Change **Background Color** to green: `#00FF00`
3. Presentation window background turns green

### Add Chroma Key Filter in OBS

1. In OBS, right-click "Whiteboard" source
2. Select **Filters**
3. Click **+** under Effect Filters
4. Choose **Chroma Key**
5. Configure:
   - **Key Color Type**: Green
   - **Similarity**: 400 (adjust if needed)
   - **Smoothness**: 80
   - **Key Color Spill Reduction**: 100

The green background becomes transparent!

### Alternative Colors

Try different background colors if green doesn't work:

- **Blue**: `#0000FF` (classic alternative)
- **Magenta**: `#FF00FF` (less common in diagrams)
- **Custom**: Any solid color

Adjust chroma key settings to match your chosen color.

## Recording Settings

### Recommended OBS Settings

**Video:**
- **Base Canvas**: 1920x1080 (Full HD)
- **Output**: 1920x1080
- **FPS**: 60 (for smooth animations)

**Output:**
- **Recording Format**: MP4
- **Encoder**: Hardware (if available) or x264
- **Rate Control**: CBR
- **Bitrate**: 8000-10000 Kbps

**Audio:**
- Add microphone for narration
- Disable desktop audio (unless needed)

### Whiteboard Settings

In presentation window settings:
- ✅ Fullscreen (if using full capture)
- ✅ Always on top (optional)
- ✅ Custom background (if using chroma key)

## Advanced Techniques

### Multi-Layer Composition

Combine whiteboard with other sources:

**Example setup:**
1. **Layer 1 (bottom)**: Webcam feed
2. **Layer 2**: Whiteboard with chroma key
3. **Layer 3 (top)**: Overlays, logos, text

**Use case:** Picture-in-picture with transparent whiteboard overlay

### Screen Recording + Whiteboard

Combine screen capture with whiteboard:

1. Add **Display Capture** source (your screen)
2. Add **Window Capture** source (Whiteboard presentation)
3. Position whiteboard in corner or as overlay
4. Use chroma key for transparent whiteboard

**Use case:** Code tutorials with live annotations

### Hotkey Workflows

Set up OBS hotkeys for smooth recording:

- **Start Recording**: F9
- **Stop Recording**: F10
- **Toggle Whiteboard Source**: F11

In Whiteboard:
- **Toggle Fullscreen**: F11 (in presentation window)
- **Open/Close Presentation**: Cmd+Shift+P

## Layouts

### Full-Screen Whiteboard

**Setup:**
- Whiteboard presentation: Full canvas
- No other sources visible
- Best for: Pure whiteboard lessons

### Split Screen

**Setup:**
- Left half: Webcam or IDE
- Right half: Whiteboard presentation
- Resize and position both sources

**Best for:** Code walkthroughs with live annotations

### Picture-in-Picture

**Setup:**
- Background: Whiteboard presentation (full screen)
- Overlay: Small webcam in corner

**Best for:** Explainer videos with presenter

### Green Screen Overlay

**Setup:**
- Background: Stock footage or slides
- Overlay: Whiteboard with chroma key
- Presenter (optional): Webcam with chroma key

**Best for:** Professional production quality

## Troubleshooting

### Whiteboard window not showing in OBS

**Solutions:**
1. Ensure presentation window is open
2. Restart OBS
3. Try different capture method
4. Check window title matches exactly

### Choppy or laggy capture

**Solutions:**
1. Lower OBS canvas resolution
2. Use hardware encoder
3. Reduce whiteboard canvas complexity
4. Close other applications

### Chroma key edges look rough

**Adjust in Chroma Key filter:**
- Increase **Smoothness** (80-100)
- Adjust **Similarity** (300-500)
- Enable **Key Color Spill Reduction**

### Recording shows black screen

**Solutions:**
1. Check whiteboard is on correct monitor
2. Try "Capture specific window" mode
3. Restart both Whiteboard and OBS
4. Update graphics drivers

### Audio out of sync

**Solutions:**
1. Set OBS to CBR (constant bitrate)
2. Disable "Browser Hardware Acceleration" in Whiteboard
3. Record audio separately and sync in post

## Recording Workflow

### Pre-Recording Checklist

- [ ] Whiteboard app open with content ready
- [ ] Presentation window open and positioned
- [ ] OBS scene configured correctly
- [ ] Test recording 10 seconds
- [ ] Check video and audio quality
- [ ] Prepare script or outline

### During Recording

1. Start OBS recording (F9)
2. Work in Whiteboard control window
3. Use spotlight to guide attention
4. Use laser for temporary emphasis
5. Navigate frames smoothly
6. Stop recording when done (F10)

### Post-Recording

1. Review footage
2. Check sync quality
3. Trim/edit as needed
4. Export final video

## Performance Tips

### For Smooth 60fps Capture

1. ✅ Use hardware encoder (H.264 NVENC/QuickSync)
2. ✅ Record to SSD, not HDD
3. ✅ Close unnecessary applications
4. ✅ Disable browser extensions
5. ✅ Use dedicated GPU if available

### Optimize Whiteboard

1. ✅ Limit total strokes per frame (< 1000)
2. ✅ Use shapes instead of many small strokes
3. ✅ Split complex diagrams into frames
4. ✅ Restart app before long recordings

## Example Use Cases

### Math Lesson

**Setup:**
- Full-screen whiteboard
- White background
- LaTeX equations
- Spotlight for emphasis

**Tools:**
- Pen for writing
- Laser for pointing
- Highlighter for key formulas

### Coding Tutorial

**Setup:**
- Split screen: IDE + Whiteboard
- Dark whiteboard background
- Code blocks in whiteboard
- Syntax highlighting

**Tools:**
- Text for labels
- Arrows for flow
- Spotlight for code walkthrough

### Design Walkthrough

**Setup:**
- Green screen whiteboard overlay
- Import design images
- Draw annotations live
- Pan and zoom for details

**Tools:**
- Highlighter for markup
- Shapes for callouts
- Laser for pointing

## Next Steps

- [Master Laser & Spotlight →](/desktop/laser-spotlight)
- [Explore Animation Features →](/features/animations)
- [Learn Drawing Tools →](/features/drawing-tools)

## Resources

- [OBS Documentation](https://obsproject.com/wiki/)
- [Whiteboard Testing Guide](https://github.com/TheGhoul21/whiteboard/blob/main/TESTING_GUIDE.md)
- [Community Examples](https://github.com/TheGhoul21/whiteboard/discussions)
