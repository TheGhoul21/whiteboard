# Animations

Whiteboard's animation system helps you create engaging, dynamic content for educational videos. This guide covers all animation features.

## Magic Animations

Magic animations automatically detect shapes and objects, then animate them smoothly for professional-looking presentations.

### How Magic Animations Work

1. **Draw a shape or stroke** on the canvas
2. **Select the magic wand tool** (or press `M`)
3. **Click on the stroke/shape** you want to animate
4. The system detects the object type and applies the appropriate animation

### Supported Animations

#### Magic Square

Automatically detects when you've drawn a rough square/rectangle:

**Detection criteria:**
- 4 strokes forming approximate corners
- Roughly 90-degree angles
- Similar side lengths

**Animation:**
- Morphs rough strokes into perfect rectangle
- Smooth transformation over 1 second
- Maintains original position and size

**Use case:** Turn hand-drawn boxes into clean diagrams

#### Magic Circle

Detects rough circular shapes:

**Detection criteria:**
- Circular or oval stroke pattern
- Closed loop
- Roughly uniform radius

**Animation:**
- Transforms rough circle into perfect circle
- Smooth morphing animation
- Preserves center point and approximate radius

**Use case:** Create perfect circles for Venn diagrams, flowcharts, emphasis

### Using Magic Animations

**Step-by-step:**

1. Draw a rough shape (square or circle)
2. Select the magic wand tool from toolbar
3. Click on your rough drawing
4. Watch it transform into a perfect shape!

**Keyboard shortcut:**
- `M` - Select magic wand tool

**Tips:**
- Draw shapes deliberately but don't worry about perfection
- The detector is forgiving - rough approximations work well
- Animations happen in real-time, perfect for live recording
- Animated shapes sync to presentation window

## Frame Transitions

Navigate between frames with smooth transitions:

### Pan Transition

When moving between frames, the canvas smoothly pans to the new position.

**How to use:**
1. Create multiple frames with the frame manager
2. Click on a frame to navigate to it
3. Canvas smoothly pans to frame position

**Settings:**
- Transition duration: 500ms
- Easing: Smooth acceleration/deceleration
- Works with zoom changes too

### Zoom Transition

Frames can have different zoom levels. Transitioning between frames animates the zoom change.

**Example use case:**
- Frame 1: Overview diagram (zoomed out)
- Frame 2: Detail view (zoomed in)
- Transition: Smooth zoom animation

## Laser Pointer Animation

The laser pointer tool creates strokes that fade out smoothly:

### Fade Behavior

- **Initial opacity**: 60% (semi-transparent red)
- **Fade duration**: 3 seconds from release
- **Complete removal**: After 15 seconds
- **Frame rate**: 60fps smooth fade

### Use Cases

- **Pointing**: Draw arrow to specific element
- **Circling**: Highlight important part
- **Underlining**: Emphasize text temporarily
- **Gesturing**: Create animated explanations

[Learn more about Laser Pointer →](/desktop/laser-spotlight)

## Custom Animations

### Stroke-by-Stroke Reveal

Record your drawing process and replay it:

**Coming soon:** This feature is planned for a future release.

**Planned behavior:**
- Record drawing timeline
- Replay strokes in order
- Adjustable playback speed
- Export as video

### Object Entrance Effects

Animate objects entering the canvas:

**Coming soon:** Fade in, slide in, and other entrance effects for text, images, and code blocks.

## Animation Performance

### Frame Rate

All animations target 60fps for smooth playback:

- **Magic animations**: 60fps morphing
- **Laser fade**: 60fps opacity transition
- **Frame transitions**: 60fps pan/zoom
- **Spotlight**: 60fps position tracking

### Optimization Tips

For smooth animations:

1. ✅ Keep total stroke count reasonable (< 1000 strokes per frame)
2. ✅ Split complex diagrams into multiple frames
3. ✅ Use shapes instead of many small strokes where possible
4. ✅ Close unused applications when recording

### Performance Monitoring

Check your frame rate:
- Browser dev tools: Performance tab
- Watch for dropped frames in timeline
- Monitor CPU usage (should be < 30% while animating)

## Recording Animations

### Best Practices

**For live recording:**
1. Practice the animation sequence beforehand
2. Use magic animations for "wow" moments
3. Combine with spotlight for guided attention
4. Laser pointer for temporary emphasis

**For edited videos:**
1. Record multiple takes
2. Use frame transitions for scene changes
3. Combine animations with narration
4. Keep animation timing consistent

### OBS Capture

All animations appear in the presentation window and are captured by OBS:

- ✅ Magic square/circle transformations
- ✅ Laser pointer fades
- ✅ Frame transition pans
- ✅ Spotlight movement

Make sure OBS is set to 60fps capture for smooth animation playback.

[Learn more about OBS Integration →](/desktop/obs-integration)

## Advanced Techniques

### Combining Animations

Layer multiple animation types for rich content:

**Example: Animated diagram explanation**
1. Draw rough shapes with pen
2. Use magic wand to perfect them
3. Add text labels
4. Use spotlight to highlight each part
5. Use laser to point to connections
6. Navigate to next frame with pan transition

### Timing Animations

Control the pace of your presentation:

- **Quick transitions** (< 1s): For connected ideas
- **Medium pace** (2-3s): For explanations
- **Slow reveals** (4-5s): For complex concepts
- **Laser pointers** (3s fade): For brief emphasis

### Animation Sequences

Create multi-step animations:

1. Start with blank frame
2. Draw first element
3. Magic-animate it to perfection
4. Add second element
5. Use spotlight to show relationship
6. Laser point to key details
7. Transition to next frame

## Troubleshooting

### Magic animation not detecting shape

**Square detection:**
- Ensure 4 distinct strokes (not one continuous stroke)
- Make corners roughly 90 degrees
- Keep sides roughly equal length

**Circle detection:**
- Draw as single closed stroke
- Make shape roughly circular (not too oval)
- Don't draw too quickly

### Animation stuttering

- Check CPU usage
- Reduce canvas complexity
- Close other applications
- Lower screen recording quality temporarily

### Laser pointer not fading

- Ensure you've released the mouse button
- Check that stroke was actually drawn
- Verify you're using laser tool (not regular pen)

## What's Next

- [Explore Drawing Tools →](/features/drawing-tools)
- [Learn About Smart Objects →](/guide/smart-objects)
- [Master Presentation Mode →](/desktop/presentation-mode)
