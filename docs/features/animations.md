# Animations

Whiteboard's animation system turns rough sketches into perfect shapes and creates smooth visual effects for educational content.

## Magic Shape Detection

The magic wand tool uses geometric algorithms to detect and perfect hand-drawn shapes in real-time.

### How It Works

When you click a rough drawing with the magic wand, Whiteboard analyzes the stroke geometry to identify patterns. For squares, it looks for four distinct strokes forming approximate right angles with similar side lengths. For circles, it detects closed loops with roughly uniform radius from a center point.

Once detected, the algorithm calculates the ideal shape parameters (perfect square dimensions or circle radius) and morphs your rough strokes into the geometric ideal over about one second. The transformation maintains your original position and approximate size while correcting imperfections.

### Magic Square

Draw four strokes forming a rough rectangle. They don't need to be perfect - the angles can be off by 20-30 degrees and the sides can vary by up to 40%. Just make sure you have four distinct strokes (lift the pen between each side).

Select the magic wand tool and click anywhere on your rough rectangle. Watch as the four rough lines smoothly transform into a perfect rectangle with exactly 90-degree corners and equal opposite sides. The animation runs at 60 frames per second, creating a satisfying morphing effect.

This is perfect for diagrams where you want the organic feel of hand-drawing but need geometric precision for the final result. Draw freely, then perfect it with one click.

### Magic Circle

Sketch a circular shape in one continuous stroke. It can be wobbly, egg-shaped, or uneven - as long as it's roughly circular and forms a closed loop, the detector will recognize it.

Click the magic wand on your rough circle. The algorithm finds the center point and average radius, then morphs your uneven circle into a perfect one. The transformation preserves the center position and approximate size while eliminating irregularities.

Use this for Venn diagrams, flowchart bubbles, or any time you need perfect circles without switching to a circle tool mid-drawing.

## Laser Pointer Effects

The laser pointer creates temporary annotations that automatically fade away, perfect for pointing out details during live recording without cluttering your canvas.

### How the Fade Works

When you draw with the laser pointer, the stroke appears in red at 60% opacity (semi-transparent, so it doesn't completely obscure underlying content). As soon as you release the mouse, a timer starts. Over the next three seconds, the opacity decreases linearly from 60% to 0% at 60 frames per second, creating a smooth fade effect.

The animation runs on requestAnimationFrame, checking every frame whether any laser strokes need opacity updates. After three seconds, the stroke is invisible but remains in memory for another 12 seconds (15 seconds total) before being permanently removed. This prevents memory leaks while keeping recent strokes available for undo.

You can draw multiple laser strokes while previous ones are fading - each has its own independent timer. Draw a circle to highlight something, then quickly arrow to point at a detail, and both will fade at their own pace.

### Recording with Laser Pointer

The three-second fade is intentionally timed for natural speech pacing. Point to an element, say "notice this here" (about 2-3 seconds), and by the time you're done talking, the annotation has faded. This creates a natural rhythm where your verbal explanation and visual pointer stay synchronized.

For recorded videos, this means you don't need to edit out pointer strokes in post-production. They remove themselves, keeping your final canvas clean while the recording shows your pointing gestures clearly.

## Spotlight Animation

The spotlight effect creates a real-time highlight that follows your cursor, dimming everything except the area under focus.

### Rendering Technique

Unlike the laser pointer (which is a canvas stroke), the spotlight is an HTML overlay positioned with z-index 999999 to appear above all content, including DOM elements like code blocks. It consists of two layers: a dark semi-transparent overlay covering the entire viewport (70% opacity black), and a circular cutout positioned at your cursor with a golden glow border.

The spotlight position updates on every mousemove event, recalculating the circle's CSS transform to track your cursor. Since it's pure CSS positioning rather than canvas rendering, it maintains 60fps even on complex canvases. The sync between control and presentation windows happens through localStorage state updates, with the presentation window's spotlight mirroring the control window's cursor position in real-time.

This technique ensures the spotlight appears above code blocks (which are HTML divs), something that would be impossible with canvas-only rendering.

### Using Spotlight for Walkthroughs

The spotlight is designed for step-by-step explanations of complex diagrams or code. Move slowly and deliberately - pause the spotlight on each element you're discussing for 2-3 seconds, then move to the next. The dimmed overlay naturally guides viewer attention to wherever you're pointing.

For code walkthroughs, move the spotlight down line by line as you explain. The dark overlay makes it easy to focus on one line at a time even in long code blocks. The spotlight size is calibrated to highlight about 2-3 lines of code simultaneously, creating a comfortable reading window.

## Frame Transitions

Navigating between frames creates smooth pan and zoom animations rather than instant cuts.

### Transition Animation

When you click a frame thumbnail, Whiteboard calculates the difference in position and zoom between the current view and the target frame. It then animates both properties simultaneously over 500 milliseconds using an easing curve (fast at the start, slowing at the end).

The animation runs at 60fps through requestAnimationFrame, updating both the canvas transform and viewport position each frame. If the zoom level changes, the canvas scales smoothly while panning, creating a cinematic "zoom and fly" effect rather than a jarring cut.

This works in presentation mode too - both windows animate simultaneously when you navigate frames in the control window, maintaining perfect sync.

### Using Transitions for Teaching

Frame transitions create narrative flow. Start with an overview frame (zoomed out), then transition to a detail frame (zoomed in on one section). The smooth zoom creates a visual connection between the whole and the part, helping viewers maintain spatial context.

For multi-step explanations, each frame can represent one step. Transitioning between frames creates a sense of progression - the smooth pan suggests moving forward through a process rather than jumping between disconnected ideas.

## Performance Characteristics

All animations target 60fps on modern hardware. The magic shape transformations recalculate stroke geometry each frame, which can become expensive with very complex shapes (hundreds of points). Keep detected shapes reasonably simple - under 200 points per stroke - for smooth morphing.

Laser pointer fades are cheap since they only update opacity, not geometry. You can have dozens of laser strokes fading simultaneously without performance impact.

Spotlight rendering is pure CSS, so it has near-zero performance cost regardless of canvas complexity. The bottleneck is localStorage sync between windows, but manual event dispatch keeps latency under 5ms even on complex canvases.

Frame transitions stress the canvas transform system. Very large canvases (tens of thousands of strokes) may see dropped frames during transitions. If you notice stutter, split your content across more frames to reduce the number of visible strokes during animation.

## Implementation Notes

The magic detection algorithms use geometric heuristics rather than machine learning. They're deterministic and fast but require clear input - very rough or ambiguous shapes may not be detected. The thresholds (angle tolerance, size variation) are tuned for typical hand-drawn input with a mouse or basic stylus.

Laser pointer fade uses Date.now() for timing rather than animation frame deltas, ensuring consistent fade duration regardless of frame rate variations. This means laser strokes fade in exactly 3 seconds wall-clock time even if the frame rate drops.

Spotlight sync latency depends on localStorage event dispatch speed. The manual dispatchEvent call eliminates the browser's internal debouncing, achieving <5ms sync on same-machine windows. Network sync (if implemented) would require a different mechanism like WebSockets.
