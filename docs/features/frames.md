# Frames & Navigation

Organize your whiteboard content into frames for structured, multi-page presentations.

## What Are Frames?

Frames are like slides or pages in your whiteboard:

- **Separate views** of the infinite canvas
- **Different content** per frame
- **Custom backgrounds** per frame
- **Smooth transitions** between frames
- **Perfect for** step-by-step lessons

Think of frames as pages in a notebook, but with smooth pan/zoom transitions instead of flips.

## Frame Manager

### Access Frame Manager

Look for the frame panel on the right side of the screen:

**Shows:**
- Thumbnail of each frame
- Frame numbers
- Current frame highlighted
- Quick navigation

### Frame Operations

**Create new frame:**
1. Click "+" button in frame manager
2. New blank frame created
3. Automatic naming (Frame 1, Frame 2, etc.)

**Navigate to frame:**
1. Click frame thumbnail
2. Canvas smoothly pans to that frame
3. Zoom adjusts if needed

**Delete frame:**
1. Click trash icon on frame
2. Confirm deletion
3. Content removed (can't be undone)

**Rename frame:**
Coming soon - currently auto-numbered

## Creating Frames

### When to Create New Frame

**Good use cases:**
- New topic or section
- Different part of diagram
- Step in multi-step explanation
- Before/after comparison
- Different zoom level needed

**Example structure:**
```
Frame 1: Problem statement
Frame 2: Approach diagram
Frame 3: Detailed solution
Frame 4: Example application
Frame 5: Summary
```

### Frame Layout Strategies

**Linear progression:**
```
Frame 1 → Frame 2 → Frame 3 → Frame 4
```
Present topics in sequence

**Hub and spoke:**
```
    Frame 2
       ↑
Frame 1 → Frame 3
       ↓
    Frame 4
```
Central concept with detailed branches

**Before/After:**
```
Frame 1: Before (problem)
Frame 2: After (solution)
```

## Frame Properties

### Per-Frame Settings

Each frame can have:

**Background:**
- None (white)
- Grid (dot grid)
- Lines (ruled lines)
- Dark mode
- (Set independently per frame)

**Zoom level:**
- Frames remember their zoom
- Navigate between different zoom levels smoothly

**Position:**
- Each frame has its own view position
- Can show different parts of canvas

### Content Organization

**What's in a frame:**
- Strokes (pen, highlighter, etc.)
- Shapes (rectangles, circles, arrows)
- Smart objects (text, LaTeX, code, images)
- All visible content at that position

**Global vs. Per-frame:**
- Content is global across canvas
- Frames are "views" into the canvas
- Move content → visible in all frames that show that area

## Frame Transitions

### Smooth Navigation

When switching frames:

**Animation:**
- Smooth pan to new position
- Zoom transition if levels differ
- 500ms duration
- Easing: acceleration/deceleration

**What syncs:**
- Canvas position
- Zoom level
- Background (if changed)

**In presentation mode:**
- Transitions appear in both windows
- Control window drives navigation
- Presentation window follows smoothly

### Transition Speed

Current: Fixed 500ms

Future: Adjustable speed
- Fast (250ms): Quick cuts
- Normal (500ms): Default
- Slow (1000ms): Gentle pacing

## Navigation

### Click Navigation

**From frame manager:**
1. Click any frame thumbnail
2. Canvas animates to that frame
3. You're now "in" that frame

### Keyboard Navigation

**Shortcuts:**
- `Cmd/Ctrl + ]` → Next frame
- `Cmd/Ctrl + [` → Previous frame

**In sequence:**
Press repeatedly to move through frames linearly.

### Direct Jump

Click thumbnail to jump directly:
- No need to navigate through intermediate frames
- Transition goes straight to target

## Recording Workflows

### Multi-Frame Lesson

**Structure:**
1. **Frame 1**: Introduction (title, agenda)
2. **Frame 2**: Concept diagram (overview)
3. **Frame 3**: Detailed explanation (zoomed in)
4. **Frame 4**: Example (worked problem)
5. **Frame 5**: Summary (key points)

**Recording:**
- Present Frame 1, explain intro
- Navigate to Frame 2, discuss concept
- Transition to Frame 3, go deep
- Show Frame 4, walk through example
- End with Frame 5, summarize

### Progressive Reveal

**Build complexity:**
```
Frame 1: Basic shape
Frame 2: Add first element
Frame 3: Add second element
Frame 4: Add connections
Frame 5: Complete diagram
```

**Record continuously:**
- Navigate frame-by-frame
- Add content at each step
- Build understanding progressively

### Before/After Demo

**Problem-solving:**
```
Frame 1: Problem statement + buggy code
Frame 2: Zoom in on issue (use spotlight)
Frame 3: Show fix (corrected code)
Frame 4: Zoom out, working result
```

### Comparison Views

**Multiple approaches:**
```
Frame 1: Overview of problem
Frame 2: Solution A (approach 1)
Frame 3: Solution B (approach 2)
Frame 4: Comparison chart
```

## Best Practices

### Frame Organization

**Do:**
- ✅ Plan frame structure before recording
- ✅ Keep frames focused (one idea per frame)
- ✅ Use consistent backgrounds within topics
- ✅ Number frames logically
- ✅ Limit total frames (< 20 for one session)

**Don't:**
- ❌ Create too many frames (gets hard to navigate)
- ❌ Put unrelated content in one frame
- ❌ Make frames too cluttered
- ❌ Navigate randomly (confuses viewers)

### Content Planning

**Sketch first:**
1. Plan your lesson structure
2. Decide how many frames needed
3. Rough out content per frame
4. Practice transitions

**During recording:**
1. Stay in frame while explaining
2. Transition deliberately
3. Give viewers time to absorb
4. Don't jump frames too quickly

### Performance

**Keep frames reasonable:**
- ✅ < 100 strokes per frame: Smooth
- ⚠️ 100-500 strokes: Acceptable
- ❌ 500+ strokes: May slow down

**If frame gets too complex:**
- Split into multiple frames
- Use separate frames for details
- Keep main frame as overview

## Advanced Techniques

### Nested Zoom Levels

**Overview-to-detail:**
```
Frame 1: Full diagram (zoom 100%)
Frame 2: Top section (zoom 200%)
Frame 3: Specific detail (zoom 400%)
Frame 4: Back to overview (zoom 100%)
```

**Zoom transitions:**
- Smooth zoom animation
- Maintains spatial context
- Great for showing relationships

### Frame as Slides

Use frames like PowerPoint slides:

```
Frame 1: Title slide
Frame 2: Agenda
Frame 3: Topic 1
Frame 4: Topic 2
Frame 5: Topic 3
Frame 6: Summary
Frame 7: Q&A
```

### Circular Narrative

**Return to start:**
```
Frame 1: Introduction (problem)
Frame 2-4: Development (solution)
Frame 5: Conclusion (back to Frame 1 position)
```

Creates narrative closure by returning to start.

### Parallel Tracks

**Two concepts side-by-side:**
```
Frame 1: Overview
Frame 2: Concept A start
Frame 3: Concept A detail
Frame 4: Back to overview
Frame 5: Concept B start
Frame 6: Concept B detail
Frame 7: Comparison
```

## Troubleshooting

### Frame not showing content

**Check:**
- Is content actually in that frame's view?
- Try zooming out
- Check if content was deleted

**Solutions:**
- Zoom out to find content
- Check other frames
- Undo recent deletions

### Transition too fast/slow

Current: Fixed speed (500ms)

Workaround:
- Pause on each frame
- Give viewers time before navigating
- Future: Adjustable transition speed

### Lost in frames

**Solutions:**
- Use frame manager to see all frames
- Click thumbnails to jump directly
- Create fewer frames next time
- Add visual landmarks in each frame

### Frame deleted by mistake

**Problem:** Frame deletion is permanent

**Prevention:**
- Double-check before deleting
- Duplicate important frames first (coming soon)
- Use undo for other operations

## Future Features

### Coming Soon

**Frame duplication:**
- Duplicate frame with all content
- Create variations easily

**Frame reordering:**
- Drag frames to reorder
- Change sequence without recreating

**Frame groups:**
- Organize frames into sections
- Collapsible groups in frame manager

**Frame notes:**
- Add speaker notes to frames
- View during presentation

**Frame templates:**
- Save frame layouts as templates
- Reuse common structures

**Frame export:**
- Export individual frames as images
- Export sequence as slideshow

## Integration with Other Features

### With Spotlight

**Frame-by-frame walkthrough:**
1. Navigate to frame
2. Use spotlight to highlight parts
3. Explain current frame content
4. Navigate to next frame
5. Repeat

### With Laser Pointer

**Temporary annotations:**
- Point to elements in current frame
- Navigate to next frame
- Laser strokes from previous frame don't carry over
- Clean presentation

### With Smart Objects

**Persistent objects:**
- Text, code, LaTeX stay in position
- Visible in frames that show that canvas area
- Move objects to different frame positions

## Examples

### Math Lesson: Quadratic Formula

```
Frame 1: Problem - Solve ax² + bx + c = 0
Frame 2: Completing the square steps
Frame 3: Derivation of quadratic formula
Frame 4: Example problem
Frame 5: Graph visualization
```

### Programming Tutorial: Binary Search

```
Frame 1: Linear search (inefficient)
Frame 2: Binary search concept
Frame 3: Code implementation
Frame 4: Step-by-step execution
Frame 5: Time complexity comparison
```

### Design Process

```
Frame 1: Requirements
Frame 2: Initial sketch
Frame 3: Refined design
Frame 4: Technical specs
Frame 5: Final mockup
```

## Next Steps

- [Explore Drawing Tools →](/features/drawing-tools)
- [Learn About Animations →](/features/animations)
- [Master Presentation Mode →](/desktop/presentation-mode)

## Frame Philosophy

Frames in Whiteboard are designed for:

1. **Structure:** Organize content clearly
2. **Flow:** Smooth transitions, not abrupt cuts
3. **Flexibility:** Zoom and pan freely within frames
4. **Simplicity:** Easy to create and navigate
5. **Teaching:** Perfect for step-by-step lessons

Use frames to guide your audience through complex topics with clarity and polish!
