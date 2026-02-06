# Basic Drawing

Learn the fundamental drawing tools and techniques in Whiteboard.

## Drawing Tools

### Pen Tool

The standard drawing tool for creating precise strokes.

**Activate:** Click pen icon or press `P`

**Properties:**
- Solid color strokes
- Configurable size (1-50px)
- Pressure sensitivity (if using tablet)
- Perfect for writing and line work

**Use cases:**
- Writing text by hand
- Drawing diagrams
- Creating precise lines
- Technical illustrations

### Smooth Pen Tool

Advanced pen with calligraphy-style strokes.

**Activate:** Click smooth pen icon or press `S`

**Properties:**
- Variable width based on speed
- Smooth, flowing strokes
- Pressure-sensitive tapering
- Uses perfect-freehand algorithm

**Use cases:**
- Natural handwriting
- Artistic drawings
- Emphasis strokes
- Smooth curves

**How it works:**
- Draw fast → thinner stroke
- Draw slow → thicker stroke
- Natural pen feel

### Highlighter Tool

Semi-transparent highlighting tool.

**Activate:** Click highlighter icon or press `L`

**Properties:**
- 40% opacity
- Wide stroke (default)
- Bright colors recommended
- Overlays existing content

**Use cases:**
- Highlighting important text
- Marking sections
- Creating emphasis
- Color coding

**Tips:**
- Use bright colors (yellow, orange, pink)
- Overlap for darker highlighting
- Great for emphasizing diagrams

### Eraser Tool

Remove individual strokes from the canvas.

**Activate:** Click eraser icon or press `E`

**How it works:**
- Click on stroke → removes entire stroke
- Hover to preview which stroke will be erased
- No partial erasing (removes complete strokes)

**Tips:**
- Undo (Cmd/Ctrl+Z) for more precise removal
- Use frames to organize instead of erasing
- Can't erase smart objects (use delete instead)

## Canvas Navigation

### Pan (Move Canvas)

**Hand Tool:** Press `H` or hold `Space`

**Usage:**
- Click and drag to move canvas
- Navigate large diagrams
- Position content in view

**Multi-finger:** Two-finger drag on trackpad

### Zoom

**Shortcuts:**
- `Cmd/Ctrl + Scroll`: Zoom in/out
- `Cmd/Ctrl + +`: Zoom in
- `Cmd/Ctrl + -`: Zoom out
- `Cmd/Ctrl + 0`: Reset zoom to 100%

**Pinch:** Pinch gesture on trackpad

**Current zoom level:** Shown in bottom-right corner

## Color Selection

### Color Picker

Click current color to open picker:

**Recent colors:** Quick access to recently used colors

**Preset palette:** Common colors for quick selection

**Custom colors:**
- Click custom area
- Drag to select hue and saturation
- Or enter hex code (e.g., `#FF5733`)

### Color Shortcuts

Quick color access:
- Recent colors shown in toolbar
- Click to switch instantly
- No need to open picker

## Stroke Size

Adjust stroke thickness for current tool:

**Size slider:** Drag to adjust (1-50px)

**Preview:** Live preview shows exact size

**Per-tool:** Each tool remembers its size
- Pen: 2px default
- Smooth pen: 4px default
- Highlighter: 20px default

## Drawing Techniques

### Straight Lines

**Without tool:**
1. Click starting point
2. Hold Shift
3. Click ending point
4. Straight line drawn

**With pen:**
Draw quickly in one motion for straighter lines

### Shapes

Use shape tools for perfect geometry:

**Rectangle:**
1. Select rectangle tool
2. Click and drag
3. Release for completed rectangle

**Circle:**
1. Select circle tool
2. Click and drag
3. Release for completed circle

**Arrow:**
1. Select arrow tool
2. Click and drag for direction
3. Arrow head automatically added

[Learn more about shapes →](/features/drawing-tools)

### Free Drawing

**Tips for smooth drawing:**
1. Draw at consistent speed
2. Use smooth pen for natural feel
3. Zoom in for detailed work
4. Use stylus/tablet for best control

## Backgrounds

Change canvas background:

**Options:**
- **None**: White/transparent
- **Grid**: Dot grid pattern
- **Lines**: Ruled lines (notebook style)
- **Dark**: Dark mode background

**Change background:**
Click background icon in toolbar

**Per-frame:** Each frame can have different background

## Undo & Redo

**Undo:** `Cmd/Ctrl + Z`
**Redo:** `Cmd/Ctrl + Shift + Z`

**What can be undone:**
- Drawing strokes
- Adding shapes
- Adding text/objects
- Deletions

**History depth:** Last 100 actions

## Selection

Currently, there's no select tool. To modify content:

**Move objects:** Click and drag smart objects (text, code, images)

**Modify strokes:** Use magic wand to perfect shapes

**Remove content:** Use eraser or undo

## Layers

Canvas uses implicit layering:

**Order:**
- Newer strokes appear above older ones
- Smart objects layer based on creation order
- No manual layer reordering (yet)

**Spotlight always on top:** Spotlight appears above all content

## Best Practices

### For Clean Diagrams

1. ✅ Use shapes for geometric forms
2. ✅ Use pen for connecting lines
3. ✅ Use text objects for labels
4. ✅ Plan layout before drawing
5. ✅ Use frames for organization

### For Natural Handwriting

1. ✅ Use smooth pen tool
2. ✅ Adjust size to preference (3-5px)
3. ✅ Write at natural speed
4. ✅ Use pressure-sensitive tablet
5. ✅ Zoom in for small text

### For Highlighting

1. ✅ Draw content first
2. ✅ Add highlights after
3. ✅ Use bright, contrasting colors
4. ✅ Don't over-highlight
5. ✅ Consider laser pointer for temporary emphasis

## Common Issues

### Strokes look jagged

**Solutions:**
- Use smooth pen tool instead
- Zoom in while drawing
- Draw more slowly
- Check if using mouse vs. tablet

### Can't draw on canvas

**Check:**
- Not using hand tool (switch to pen)
- Canvas is focused (click on canvas first)
- Not in presentation window (use control window)

### Colors not changing

**Check:**
- Color picker is actually selecting different color
- Current tool supports color (eraser doesn't)
- Refresh if colors seem stuck

### Drawing feels laggy

**Solutions:**
- Reduce zoom level
- Clear canvas or use new frame
- Close other applications
- Check CPU usage

## Next Steps

- [Learn about Smart Objects →](/guide/smart-objects)
- [Master Keyboard Shortcuts →](/guide/shortcuts)
- [Explore Advanced Features →](/features/)
