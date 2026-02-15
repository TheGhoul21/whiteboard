# Animations & Visual Effects

Whiteboard isn't just a static canvas. It's a tool for **dynamic storytelling**. There are three ways to bring your canvas to life: Magic Shapes, the Animation Player, and Live Effects.

---

## 🪄 Magic Shapes (The Magic Wand)

Turn rough sketches into perfect geometry instantly.

### How to use:
1. Draw a rough square, circle, or arrow using the **Pen** tool.
2. Select the **Magic Wand** (or press `W`).
3. Click on your rough drawing.
4. **Watch the morph:** Your wobbly lines will smoothly transform into a perfect geometric shape.

> **Pro Tip:** For squares, make sure you lift the pen between sides. The algorithm detects 4 distinct strokes to create a perfect rectangle.

---

## 🎬 The Animation Player (Timeline)

This is the most powerful feature for creating tutorials. You can record "parameter changes" and play them back like a movie.

### 1. The Timeline
At the bottom of the screen, you'll see the **Animation Timeline**. It shows markers for every "state" you've saved.

### 2. Creating an Animation:
1. **Set the Stage:** Draw your initial diagram.
2. **Add a Keyframe:** Click the **"+"** icon on the timeline. This saves the current state of all objects.
3. **Change Something:** Move an object, change a color, or adjust a slider in a Smart Object.
4. **Add another Keyframe:** Click **"+"** again.
5. **Play:** Press **Space** or the **Play** button. Whiteboard will smoothly interpolate (animate) the transition between your keyframes.

### 3. Playback Controls:
- **Speed:** Adjust from 0.5x to 2x.
- **Loop:** Keep the animation running while you explain.
- **Step:** Use the arrow buttons to move exactly one keyframe at a time—perfect for step-by-step explanations.

---

## ✨ Live Presentation Effects

These effects help guide your students' eyes during a live recording or stream.

### 🔦 The Spotlight (`Shift + P`)
Dims the entire canvas except for a circular area around your cursor.
- **Usage:** Move the spotlight line-by-line through code or across a complex diagram.
- **Note:** The spotlight appears *above* everything, including code blocks.

### 🔴 The Laser Pointer (`L`)
Allows you to "draw" temporary red lines that automatically fade away after 3 seconds.
- **Usage:** Circle a specific variable or point to a part of a formula.
- **Benefit:** Keeps the canvas clean without you having to manually erase.

### ✈️ Frame Transitions
When you navigate between **Frames** (bookmarks) using the sidebar:
- The canvas doesn't just "jump".
- It performs a smooth **Pan & Zoom** animation to the target area, helping viewers maintain spatial context.

---

## Performance Tip
If your animation feels "choppy", try to limit the number of objects moving at once. The engine is optimized for 60fps, but extremely complex vector drawings with thousands of points can slow down the morphing effects.
