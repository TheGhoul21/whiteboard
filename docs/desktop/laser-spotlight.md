# Laser & Spotlight Tools

Master the laser pointer and spotlight tools for professional presentations and educational videos.

## Overview

Two powerful pointer tools designed specifically for video recording:

**Laser Pointer:**
- Temporary strokes that fade after drawing
- Perfect for pointing, circling, underlining
- Non-permanent annotations

**Spotlight:**
- Highlights specific areas with circular light
- Dims surrounding content
- Real-time mouse following

Both tools sync perfectly to the presentation window for OBS capture.

## Laser Pointer

### How It Works

The laser pointer creates temporary red strokes that automatically fade and disappear:

1. Draw a stroke (arrow, circle, underline, etc.)
2. Stroke appears at 60% opacity
3. After releasing mouse, fade begins
4. Smooth fade over 3 seconds
5. Complete removal after 15 seconds

### Using Laser Pointer

**Activate:**
- Click laser pointer icon in toolbar
- Or select from tool menu

**Draw:**
- Click and drag to create stroke
- Use mouse or stylus/tablet
- Draw arrows, circles, underlines, etc.

**Automatic fade:**
- Release mouse button → fade starts immediately
- No manual cleanup needed
- Multiple strokes can fade simultaneously

### Visual Properties

- **Color**: Red (to stand out)
- **Initial opacity**: 60% (semi-transparent)
- **Fade duration**: 3 seconds
- **Removal time**: 15 seconds total
- **Animation**: 60fps smooth fade

### Use Cases

**Pointing to elements:**
```
Draw an arrow → points to specific item
Fades after 3 seconds → keeps canvas clean
```

**Circling important parts:**
```
Circle a formula → draws attention
Fades while you explain → doesn't clutter
```

**Underlining text:**
```
Underline key term → emphasizes temporarily
Disappears after discussion → maintains clarity
```

**Tracing paths:**
```
Follow a diagram flow → guides viewer
Fades as you move on → reduces visual noise
```

### Best Practices

**Do:**
- ✅ Use for temporary emphasis
- ✅ Draw deliberate, clear strokes
- ✅ Give strokes time to be seen before next one
- ✅ Combine with verbal explanation

**Don't:**
- ❌ Draw too quickly (viewers need to follow)
- ❌ Overlap many strokes (gets messy)
- ❌ Use for permanent annotations (use pen instead)
- ❌ Forget it fades (time your narration)

### Recording Tips

**Timing:**
- Draw stroke at 0:00
- Start explaining immediately
- Finish explanation by 3:00 (before fade completes)
- Move to next point

**Pacing:**
- Allow 1-2 seconds for stroke to be visible
- Don't rush to next annotation
- Let previous stroke fade before drawing many new ones

**Editing:**
- Laser strokes are perfect for live recording
- No need to edit them out in post
- Natural pacing for explanations

## Spotlight Tool

### How It Works

The spotlight creates a circular highlight that follows your mouse:

1. Activate spotlight tool
2. Move mouse over canvas
3. Dark overlay dims everything (70% opacity)
4. Bright circle highlights area under cursor
5. Moves in real-time with mouse

### Using Spotlight

**Activate:**
- Click spotlight/pointer icon in toolbar
- Or press `Shift+P`

**Move:**
- Simply move your mouse
- Spotlight follows cursor position
- Works in both control and presentation windows

**Deactivate:**
- Select any other tool
- Spotlight disappears immediately

### Visual Properties

- **Spotlight size**: Configurable (default ~200px diameter)
- **Border**: Golden glow (3px)
- **Glow effect**: Soft shadow for emphasis
- **Overlay**: 70% dark dimming
- **Z-index**: Appears above ALL content (including code blocks)
- **Sync**: < 5ms latency to presentation window

### Technical Details

The spotlight uses an HTML overlay (not canvas) to ensure it appears above all DOM elements:

```
HTML Overlay (z-index: 999999)
├── Dark overlay (dims everything)
└── Spotlight circle (highlights area)
```

This ensures spotlight appears above:
- ✅ Canvas strokes
- ✅ Text objects
- ✅ Code blocks (which are HTML divs)
- ✅ LaTeX equations
- ✅ Images

### Use Cases

**Highlighting diagram parts:**
```
Move spotlight over each component
Explain while hovering
Viewers' eyes follow the light
```

**Reading through code:**
```
Spotlight each line as you explain
Natural reading flow
Focus attention precisely
```

**Complex visualizations:**
```
Guide through intricate diagrams
Prevent viewers from getting lost
Progressive disclosure of information
```

**Q&A sessions:**
```
Point to specific elements
Respond to questions visually
Direct attention dynamically
```

### Best Practices

**Do:**
- ✅ Move slowly and deliberately
- ✅ Pause spotlight on important areas
- ✅ Use for complex diagrams
- ✅ Combine with verbal explanation

**Don't:**
- ❌ Move too fast (distracting)
- ❌ Use for simple content (overkill)
- ❌ Leave on when not needed
- ❌ Shake or jitter (unprofessional)

### Recording Tips

**Movement:**
- Slow, smooth mouse movement
- Pause on each item you discuss
- Predictable paths (left to right, top to bottom)

**Pacing:**
- 2-3 seconds per highlighted item
- Brief pause between movements
- Match narration speed

**Composition:**
- Use with detailed content
- Great for busy diagrams
- Helps viewers follow along

## Combining Tools

### Laser + Spotlight Workflow

Use both tools together for maximum effectiveness:

**Example: Explaining a diagram**

1. **Spotlight**: Highlight section to discuss
2. **Laser**: Draw arrow to specific element
3. **Spotlight**: Move to next section
4. **Laser**: Circle important part
5. **Repeat**: Progress through content

### Tool Selection Strategy

**Use Laser when:**
- Need to draw attention to small details
- Want temporary annotation
- Pointing to specific items
- Creating emphasis that fades

**Use Spotlight when:**
- Guiding through complex content
- Reading line by line
- Showing relationships between areas
- Maintaining focus during explanation

**Use Regular Pen when:**
- Creating permanent annotations
- Building diagrams
- Writing text/equations
- Content needs to stay visible

## Presentation Window Sync

### Real-Time Performance

Both tools sync instantly to presentation window:

- **Latency**: < 5ms
- **Frame rate**: 60fps
- **Accuracy**: Pixel-perfect positioning
- **Reliability**: No dropped frames

### Multi-Monitor Setup

Tools work perfectly across monitors:

**Control on Monitor 1:**
- You see spotlight as you move mouse
- Laser strokes appear as you draw

**Presentation on Monitor 2:**
- Spotlight appears in exact same position
- Laser strokes sync in real-time
- OBS captures everything smoothly

### Verification

Test sync before recording:

1. Open presentation window
2. Move to second monitor
3. Select spotlight tool
4. Move mouse in control window
5. Watch presentation window → spotlight follows
6. Try laser tool → strokes appear in both

## Troubleshooting

### Spotlight not visible

**Check:**
- Spotlight tool is selected (not another tool)
- Mouse is over canvas area
- Presentation window is open

**Solutions:**
- Reselect spotlight tool
- Move mouse over canvas
- Close and reopen presentation window

### Spotlight behind content

This should not happen anymore. Spotlight uses HTML overlay specifically to appear above all content.

**If issue persists:**
- Report bug with screenshot
- Check browser console for errors

### Laser not fading

**Check:**
- You released mouse button (fade starts on release)
- Stroke was actually drawn (not just a click)

**Solutions:**
- Draw complete stroke
- Wait 3 seconds for fade
- Check console for errors

### Sync lag between windows

Expected latency is < 5ms. If experiencing lag:

**Solutions:**
- Close other applications
- Reduce canvas complexity
- Check CPU usage (< 20% expected)
- Restart Whiteboard app

### Laser opacity wrong

Laser should start at 60% opacity, not 100%.

**If seeing 100% opacity:**
- Report bug (this was fixed)
- Check you're using latest version

## Advanced Techniques

### Spotlight Size Adjustment

Currently spotlight size is fixed. Future feature: adjustable size.

**Workaround:**
Zoom canvas to effectively change spotlight coverage area.

### Laser Color Customization

Currently laser is red only. Future feature: custom colors.

**Workaround:**
Use highlighter tool for different colored temporary emphasis.

### Recording Multiple Takes

Both tools work great for multiple recording takes:

- Laser strokes clear automatically (no cleanup)
- Spotlight disappears when switching tools
- No manual reset needed between takes

## Performance

### CPU Usage

Both tools are optimized:

- **Spotlight**: < 5% CPU (HTML overlay)
- **Laser fade**: < 10% CPU (60fps animation)
- **Combined**: < 15% CPU total

### Memory Usage

Minimal memory impact:

- Spotlight: No memory accumulation
- Laser: Automatic cleanup after 15 seconds
- No memory leaks

### Battery Impact (Laptops)

Moderate battery usage during active use:

- Spotlight movement: Continuous rendering
- Laser fading: Animation overhead

**Tip:** Plug in when recording long sessions.

## Next Steps

- [Set up OBS Integration →](/desktop/obs-integration)
- [Learn Presentation Mode →](/desktop/presentation-mode)
- [Explore Animations →](/features/animations)

## Examples

### Math Lesson Example

```
1. Draw equation with pen
2. Use laser to circle key term
3. Switch to spotlight
4. Highlight each step while explaining
5. Use laser to underline final answer
```

### Code Walkthrough Example

```
1. Paste code block
2. Use spotlight to read line-by-line
3. Use laser to point to variable names
4. Use spotlight for function explanations
5. Use laser to draw flow arrows (temporary)
```

### Diagram Explanation Example

```
1. Draw or import diagram
2. Use spotlight to introduce each section
3. Use laser to connect related parts
4. Use spotlight for detailed subsections
5. Use laser for final summary points
```

## Summary

**Laser Pointer:**
- ✅ Temporary red strokes
- ✅ 60% initial opacity
- ✅ 3-second smooth fade
- ✅ Auto-removal after 15 seconds
- ✅ Perfect for pointing and circling

**Spotlight:**
- ✅ Real-time mouse following
- ✅ Dims surrounding content
- ✅ Golden glow highlight
- ✅ Above all content (including code blocks)
- ✅ Perfect for guiding attention

Both sync to presentation window with < 5ms latency for professional OBS recording.
