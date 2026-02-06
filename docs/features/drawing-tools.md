# Drawing Tools

Complete guide to Whiteboard's professional drawing tools.

## Pen Tool

The fundamental drawing tool for precise, solid strokes.

### Overview

**Activation:** Click pen icon or press `P`

**Properties:**
- Solid, consistent color
- Variable size (1-50px)
- Pressure sensitivity (tablet support)
- Clean, precise lines

### Best For

- Technical diagrams
- Geometric shapes
- Writing text by hand
- Precise line work
- Connecting elements

### Settings

**Stroke Size:**
- Slider: 1-50px
- Default: 2px
- Per-tool memory: Pen remembers its last size

**Color:**
- Any color from picker
- Solid, opaque strokes
- No transparency adjustment

**Pressure Sensitivity:**
- Automatic with compatible tablets
- Variable width based on pressure
- No configuration needed

### Techniques

**Straight Lines:**
1. Click starting point
2. Hold `Shift`
3. Click ending point
4. Perfect straight line created

**Quick Sketching:**
- Draw at consistent speed
- Lift pen between strokes
- Use undo liberally

**Detail Work:**
- Zoom in (Cmd/Ctrl + Scroll)
- Use smaller stroke size (1-3px)
- Draw slowly for control

## Smooth Pen Tool

Advanced pen with calligraphy-style variable-width strokes.

### Overview

**Activation:** Click smooth pen icon or press `S`

**Properties:**
- Variable width based on speed
- Natural handwriting feel
- Pressure-sensitive tapering
- Uses perfect-freehand algorithm

**How it works:**
- Fast strokes → Thinner width
- Slow strokes → Thicker width
- Natural pen simulation

### Best For

- Handwritten text
- Natural annotations
- Artistic drawings
- Expressive content
- Smooth, flowing lines

### Settings

**Base Size:**
- Slider: 1-50px
- Default: 4px
- Multiplier for width variation

**Simulation Quality:**
- High quality by default
- 60fps smooth rendering
- Optimized performance

### Techniques

**Natural Writing:**
1. Write at normal speed
2. Varying width appears automatically
3. Lift pen between letters
4. Result: Beautiful handwriting

**Emphasis:**
- Draw slow for thick emphasis
- Quick strokes for subtle lines
- Vary speed for dynamic effect

**Artistic Strokes:**
- Experiment with speed
- Create organic shapes
- Natural brush feel

## Highlighter Tool

Semi-transparent tool for emphasizing existing content.

### Overview

**Activation:** Click highlighter icon or press `L`

**Properties:**
- 40% opacity (semi-transparent)
- Wide strokes (default 20px)
- Overlays without obscuring
- Bright colors recommended

### Best For

- Highlighting important text
- Marking diagram sections
- Color coding content
- Creating emphasis
- Temporary annotations (or use laser)

### Settings

**Opacity:**
- Fixed at 40%
- Cannot be adjusted (by design)
- Ensures readability

**Size:**
- Default: 20px (wide)
- Adjustable 5-50px
- Wider = more visible

**Colors:**
- Bright colors work best (yellow, orange, pink)
- Avoid dark colors (less visible)
- Multiple colors for coding

### Techniques

**Underlining:**
- Draw under text to emphasize
- Single pass for subtle
- Multiple passes for darker

**Blocking:**
- Fill area with overlapping strokes
- Highlight entire section
- Color-code different topics

**Layering:**
- Overlap colors for mix
- Orange + yellow = darker orange
- Build up opacity gradually

## Eraser Tool

Remove individual strokes from the canvas.

### Overview

**Activation:** Click eraser icon or press `E`

**Behavior:**
- Click stroke → removes entire stroke
- Hover shows which stroke will erase
- No partial erasing (complete strokes only)

### Best For

- Removing mistakes
- Cleaning up overlaps
- Deleting unwanted strokes
- Quick corrections

### Limitations

**Cannot erase:**
- Smart objects (text, code, LaTeX)
- Images
- Shapes (use delete instead)

**Erases:**
- Pen strokes
- Smooth pen strokes
- Highlighter strokes
- Laser strokes (but they fade anyway)

### Techniques

**Selective Removal:**
1. Hover over stroke
2. Preview highlight shows target
3. Click to remove
4. Undo if wrong stroke

**Batch Erasing:**
- Click multiple strokes quickly
- Each click removes one stroke
- Use undo for oops moments

**Alternative: Undo:**
- `Cmd/Ctrl + Z` often better
- Removes last action
- Can undo multiple times
- Preserves other work

## Shape Tools

Create perfect geometric shapes.

### Rectangle Tool

**Usage:**
1. Select rectangle tool
2. Click and drag
3. Release for completed rectangle
4. Perfect right angles and parallel sides

**Modifiers:**
- `Shift + Drag`: Constrain to square
- Regular drag: Any rectangle

**Properties:**
- Border color matches current color
- Border width matches current size
- No fill (transparent inside)

### Circle Tool

**Usage:**
1. Select circle tool
2. Click and drag
3. Release for completed circle
4. Perfect circular shape

**Modifiers:**
- `Shift + Drag`: Constrain to perfect circle
- Regular drag: Can be oval

**Properties:**
- Border color matches current color
- Border width matches current size
- No fill (transparent inside)

### Arrow Tool

**Usage:**
1. Select arrow tool
2. Click and drag for direction
3. Release when positioned
4. Arrow head automatically added

**Properties:**
- Straight line with arrow head
- Directional indicator
- Configurable size and color

### Best For

**Rectangles:**
- Boxes and containers
- Diagrams and flowcharts
- Highlighting regions
- Creating structure

**Circles:**
- Circling important items
- Venn diagrams
- State diagrams
- Bubbles and nodes

**Arrows:**
- Showing flow/direction
- Connecting elements
- Indicating movement
- Process flows

## Hand Tool (Pan)

Navigate the canvas without drawing.

### Overview

**Activation:**
- Click hand icon or press `H`
- Or hold `Space` bar (temporary)

**Usage:**
- Click and drag to move canvas
- Doesn't create any marks
- Navigation only

### Techniques

**Quick Pan:**
1. Hold `Space` while using any tool
2. Drag to reposition
3. Release `Space` to resume drawing
4. No tool switching needed

**Scroll Alternative:**
- Two-finger drag on trackpad
- Mouse wheel scroll (without Cmd/Ctrl)

## Tool Comparison

| Tool | Opacity | Variable Width | Use Case |
|------|---------|----------------|----------|
| Pen | 100% | No | Precise lines |
| Smooth Pen | 100% | Yes (speed) | Natural writing |
| Highlighter | 40% | No | Emphasis |
| Eraser | N/A | N/A | Removal |
| Shapes | 100% | No | Perfect geometry |

## Advanced Techniques

### Layering Tools

Combine tools for rich content:

**Example: Annotated diagram**
1. Shapes: Draw boxes and circles
2. Pen: Add connecting lines
3. Smooth pen: Write labels
4. Highlighter: Emphasize key parts

### Speed Workflow

Minimize tool switching:

**Left hand:** `P`, `S`, `E`, `H` (tool shortcuts)
**Right hand:** Draw with mouse/tablet
**Result:** Never touch toolbar, 5x faster

### Tablet Optimization

Using a drawing tablet?

**Settings:**
- Enable pressure sensitivity
- Use smooth pen for natural feel
- Configure pen buttons for undo/tool switch
- Adjust tablet mapping to screen area

### Precision Techniques

**For perfect results:**
1. Zoom in (200%+)
2. Use smaller stroke size
3. Draw slowly and deliberately
4. Use shapes for geometry
5. Undo and redraw if needed

## Common Patterns

### Diagram Creation

```
1. Shapes: Create boxes/circles (main elements)
2. Pen: Connect with arrows/lines
3. Smooth pen: Add labels
4. Highlighter: Emphasize relationships
```

### Handwritten Notes

```
1. Smooth pen: Natural handwriting
2. Highlighter: Mark important points
3. Pen: Underline titles (straight lines)
4. Eraser: Fix mistakes
```

### Technical Drawing

```
1. Pen: Precise lines
2. Shapes: Perfect geometry
3. Pen + Shift: Straight connections
4. Small size: Fine details
```

## Tips & Tricks

### Drawing Smooth Curves

**With pen:**
- Draw quickly in one motion
- Don't pause mid-stroke
- Undo and retry if jagged

**With smooth pen:**
- Natural speed works best
- Algorithm smooths automatically
- More forgiving than pen

### Perfect Circles by Hand

1. Draw rough circle with pen
2. Switch to magic wand (`M`)
3. Click on rough circle
4. Transforms to perfect circle!

[Learn more about Magic Animations →](/features/animations)

### Color Coding

Use consistent colors for different types:

**Example system:**
- Blue: Main concepts
- Green: Examples
- Orange: Key terms
- Red: Important warnings
- Yellow highlighter: Emphasis

### Size Management

**General guidelines:**
- Titles: 10-20px
- Body: 3-5px
- Details: 1-2px
- Highlighter: 15-25px
- Shapes: 2-4px borders

## Troubleshooting

### Strokes look jagged

**Solutions:**
- Use smooth pen instead
- Draw more slowly
- Zoom in while drawing
- Use tablet instead of mouse

### Can't draw on canvas

**Check:**
- Not using hand/eraser tool
- Canvas is focused (click first)
- Not in presentation window (read-only)

### Colors not changing

**Solutions:**
- Actually select different color
- Check color picker is open
- Verify tool supports color
- Refresh if stuck

### Tool won't switch

**Solutions:**
- Click canvas to focus
- Try keyboard shortcut
- Refresh page
- Check browser console for errors

## Next Steps

- [Learn Smart Objects →](/guide/smart-objects)
- [Master Keyboard Shortcuts →](/guide/shortcuts)
- [Explore Animations →](/features/animations)

## Tool Philosophy

Whiteboard's tools are designed around these principles:

1. **Simple by default:** Basic tools are straightforward
2. **Powerful when needed:** Advanced features available
3. **Familiar:** Similar to other drawing apps
4. **Optimized for teaching:** Focus on clarity over artistry
5. **Fast workflow:** Keyboard shortcuts for efficiency

Start simple, master the basics, then explore advanced techniques!
