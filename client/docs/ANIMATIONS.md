# 🎬 Creating Animations in the Whiteboard

This guide shows you how to create educational animations for your YouTube videos using the whiteboard's animation system.

## Quick Start: Your First Animation

### 1. Create a Code Block with D3 Visualization

Click the **"Create CodeBlock"** button in the toolbar, then add code like this:

```javascript
// Example: Animated Linear Regression
const slope = slider('Slope', -2, 2, 1, 0.1);
const intercept = slider('Intercept', -10, 10, 0, 0.5);

// Generate data points
const data = Array.from({length: 50}, (_, i) => {
  const x = i / 5;
  const y = slope * x + intercept + (Math.random() - 0.5) * 2;
  return {x, y};
});

// Create SVG
const svg = d3.select(output)
  .append('svg')
  .attr('width', 400)
  .attr('height', 300);

// Plot points
svg.selectAll('circle')
  .data(data)
  .enter()
  .append('circle')
  .attr('cx', d => d.x * 30 + 50)
  .attr('cy', d => 300 - (d.y * 10 + 150))
  .attr('r', 3)
  .attr('fill', '#3b82f6');

// Draw regression line
svg.append('line')
  .attr('x1', 50)
  .attr('y1', 300 - (intercept * 10 + 150))
  .attr('x2', 350)
  .attr('y2', 300 - ((slope * 10 + intercept) * 10 + 150))
  .attr('stroke', '#ef4444')
  .attr('stroke-width', 2);
```

Click **▶ Run** to create the visualization.

### 2. Start Recording

1. Click the red **⏺ Record** button in the code block toolbar
2. The button will turn red and show "Stop recording"
3. You'll see a **"+ KF"** button appear

### 3. Create Keyframes

A **keyframe** captures the current state of all controls at a specific moment in time.

1. Adjust the **Slope** slider to a different value (e.g., 0.5)
2. Click **"+ KF"** to save this as keyframe 1
3. Adjust **Intercept** slider (e.g., to 5)
4. Click **"+ KF"** to save keyframe 2
5. Continue adjusting and adding keyframes as needed

**Tip**: Plan your animation like a story - what do you want to show changing over time?

### 4. Stop Recording & Preview

1. Click the red **⏺** button again to stop recording
2. The animation player will appear at the bottom
3. Click **▶ Play** to preview your animation

---

## Animation Controls Reference

Once you've recorded keyframes, you'll see the **Animation Player**:

### Transport Controls

| Button | Function |
|--------|----------|
| ⏮ | **Rewind** - Jump to start (time 0) |
| ⏪ | **Step Backward** - Jump to previous keyframe |
| ▶ / ⏸ | **Play / Pause** - Animate between keyframes |
| ⏩ | **Step Forward** - Jump to next keyframe |
| ⏹ | **Stop** - Stop and reset to start |

### Playback Speed

Use the dropdown to control animation speed:
- **0.25x** - Very slow (good for complex explanations)
- **0.5x** - Half speed
- **1x** - Normal speed
- **1.5x** - Faster
- **2x** - Double speed

### Timeline

The **visual timeline** shows:
- **Green dots** = Keyframes you've recorded
- **Blue dot** = Currently active keyframe
- **Slider** = Current playback position

**Click any dot** to jump directly to that keyframe!

---

## Live Control Updates (Auto-Update)

For fine-tuning visualizations **without re-running code**:

1. **Select** the visualization on the canvas (click it)
2. Click the **🎮** button below the visualization
3. A control panel appears with **"Auto" checkbox**
4. **Check "Auto"** to enable live updates
5. Move any slider - the visualization updates automatically!

**Use this for**:
- Fine-tuning parameters before recording
- Experimenting with different values quickly
- Creating multiple variations with different control snapshots

---

## Available Control Types

Add these to your code to create interactive parameters:

### `slider(label, min, max, initial, step)`
```javascript
const radius = slider('Radius', 10, 100, 30, 5);
```

### `color(label, initial)`
```javascript
const fillColor = color('Fill Color', '#3b82f6');
```

### `checkbox(label, initial)`
```javascript
const showGrid = checkbox('Show Grid', true);
```

### `input(label, initial)`
```javascript
const title = input('Chart Title', 'My Chart');
```

### `select(label, options, initial)`
```javascript
const chartType = select('Type', ['bar', 'line', 'scatter'], 'line');
```

### `range(label, min, max, initialMin, initialMax, step)`
```javascript
const dataRange = range('Data Range', 0, 100, 20, 80, 1);
// Returns: {min: 20, max: 80}
```

---

## Tips for Great Educational Animations

### 1. **Tell a Story**
- Start simple, gradually increase complexity
- Example: Show single data point → add more points → fit line → adjust parameters

### 2. **Use Keyframes Strategically**
- Don't create too many keyframes (5-10 is usually enough)
- Each keyframe should represent a meaningful state change
- Space keyframes out in time for smoother transitions

### 3. **Slow Down for Complex Concepts**
- Use **0.5x** or **0.25x** speed for intricate explanations
- Use **Step Forward/Backward** during recording to review each keyframe

### 4. **Combine Multiple Visualizations**
- Create several code blocks for different concepts
- Each can have its own animation timeline
- Stack them vertically or horizontally on the canvas

### 5. **Use Bookmarks for Scenes**
- Press **`Cmd/Ctrl + B`** to save frame (bookmark)
- Jump between bookmarks to organize your video sections
- Example: Intro → Concept 1 → Concept 2 → Conclusion

### 6. **Preview Before Recording Video**
- Use the animation player to review timing
- Adjust keyframe timing if needed
- Use Step navigation to check each transition

---

## Example: Explaining Gradient Descent

```javascript
// Visualization of gradient descent
const learningRate = slider('Learning Rate', 0.01, 0.5, 0.1, 0.01);
const iterations = slider('Iterations', 0, 50, 0, 1);

// Simple quadratic function: f(x) = x^2
const f = x => x * x;
const gradient = x => 2 * x;

// Starting point
let x = 3;
const history = [{x, y: f(x)}];

// Perform gradient descent steps
for (let i = 0; i < iterations; i++) {
  x = x - learningRate * gradient(x);
  history.push({x, y: f(x)});
}

// Create visualization
const svg = d3.select(output)
  .append('svg')
  .attr('width', 400)
  .attr('height', 300);

// Draw function curve
const xValues = d3.range(-3, 3, 0.1);
const line = d3.line()
  .x(d => d * 60 + 200)
  .y(d => 250 - f(d) * 20);

svg.append('path')
  .datum(xValues)
  .attr('d', line)
  .attr('fill', 'none')
  .attr('stroke', '#94a3b8')
  .attr('stroke-width', 2);

// Draw descent path
history.forEach((point, i) => {
  svg.append('circle')
    .attr('cx', point.x * 60 + 200)
    .attr('cy', 250 - point.y * 20)
    .attr('r', 4)
    .attr('fill', i === history.length - 1 ? '#ef4444' : '#3b82f6');
});
```

**Animation Plan**:
1. **Keyframe 0**: Iterations = 0 (starting point)
2. **Keyframe 1**: Iterations = 5 (first few steps)
3. **Keyframe 2**: Iterations = 15 (halfway)
4. **Keyframe 3**: Iterations = 30 (approaching minimum)
5. **Keyframe 4**: Iterations = 50 (converged)

**Then vary learning rate** to show different convergence speeds!

---

## Programmatic Animations (Advanced)

You can also create animations directly in code using the `animate()` function:

```javascript
const radius = slider('Radius', 10, 100, 30);

// Define animation programmatically
animate([
  { time: 0, values: { Radius: 20 } },
  { time: 2, values: { Radius: 80 } },
  { time: 4, values: { Radius: 40 } },
  { time: 6, values: { Radius: 60 } }
], { duration: 7, fps: 30, loop: true });

// Visualization code...
```


This creates keyframes automatically when you run the code!


### Using `createAnimation()` (Recommended for Loops)

For more complex animations like gradient descent loops, use the builder pattern:

```javascript
const iter = slider('Iterations', 0, 100, 0);

// Use the builder to add keyframes in a loop
const anim = createAnimation();

// Simulate gradient descent
for (let i = 0; i <= 100; i += 5) {
  // Add keyframe for this step
  // Note: We use 'i' for the 'Iterations' control value
  anim.addKeyframe(i / 10, { Iterations: i }); 
}

// Save the animation
anim.save({ duration: 10, fps: 30, loop: true });

// Visualization code uses 'iter' value...
```

This is **high performance** because you generate the animation data once, and the player handles the interpolation smoothly.

### Complete Example: Gradient Descent

Here is a full example of visualizing gradient descent:

```javascript
// 1. Controls
const learningRate = slider('Learning Rate', 0.01, 1.0, 0.1);
const step = slider('Current Step', 0, 50, 0); // Driven by animation

// 2. Build Animation Loop
const anim = createAnimation();

// Function: f(x) = x^2
// Derivative: f'(x) = 2x
let currentX = -4; // Start position

for (let i = 0; i <= 50; i++) {
  // Add keyframe state
  anim.addKeyframe(i * 0.1, { 
    'Current Step': i, // Update slider
    'currentX': currentX // Store custom value for visualization
  });

  // Calculate next step
  currentX = currentX - learningRate * (2 * currentX);
}

// 3. Save Animation
anim.save({ duration: 5, fps: 30, loop: true });

// 4. Visualization
const svg = d3.select(output).append('svg')
  .attr('width', 400).attr('height', 300);

// Helper scales
const xScale = d3.scaleLinear().domain([-5, 5]).range([0, 400]);
const yScale = d3.scaleLinear().domain([-5, 30]).range([300, 0]);

// Draw Curve f(x) = x^2
const line = d3.line()
  .x(d => xScale(d))
  .y(d => yScale(d*d));
const points = d3.range(-5, 5.1, 0.1);

svg.append('path')
  .datum(points)
  .attr('fill', 'none')
  .attr('stroke', '#cbd5e1')
  .attr('stroke-width', 2)
  .attr('d', line);

// Get current X position from animation (or default)
// Note: 'currentX' is passed as a string variable from our loop above!
// But wait! 'currentX' isn't a slider.
// The genius part: You can animate HIDDEN variables too!
// However, for simplicity here, we'll re-calculate x based on step
// OR simpler: just animate "step" and re-run logic up to that step (less efficient)
// BETTER WAY: Use the slider value 'step' to pick from a pre-calculated scale?
// ACTUALLY: Let's just animate the visual ball directly.

// Re-run simulation up to 'step' to find position
// (This is fast enough for 50 steps)
let visX = -4;
const targetStep = Math.floor(step);
for(let k=0; k<targetStep; k++) {
   visX = visX - learningRate * (2 * visX);
}

// Draw the Ball
svg.append('circle')
  .attr('cx', xScale(visX))
  .attr('cy', yScale(visX*visX)) // y = x^2
  .attr('r', 8)
  .attr('fill', '#ef4444');

// Draw Tangent Line
const slope = 2 * visX;
const y1 = (visX*visX) - slope * 1.5; // little bit to left
const y2 = (visX*visX) + slope * 1.5; // little bit to right
svg.append('line')
  .attr('x1', xScale(visX - 1.5))
  .attr('y1', yScale(y1))
  .attr('x2', xScale(visX + 1.5))
  .attr('y2', yScale(y2))
  .attr('stroke', '#ef4444')
  .attr('stroke-width', 1)
  .attr('stroke-dasharray', '4,4');

svg.append('text')
  .attr('x', 10).attr('y', 20)
  .text(`Step: ${targetStep}, x: ${visX.toFixed(2)}`)
  .attr('font-family', 'sans-serif').attr('font-size', 12);
```

### Complete Example: Bouncing Ball

Here is a full, easy example of a bouncing ball animation that you can copy and paste directly into a code block:

```javascript
// 1. Define interactive controls
// 'Time' will be our main variable driven by the animation
const t = slider('Time', 0, 10, 0);

// 2. Build the animation programmatically
const anim = createAnimation();

// Create 10 seconds of animation
for (let i = 0; i <= 100; i++) {
  const timePoint = i / 10; // 0.0, 0.1, ... 10.0
  
  // Add a keyframe at this time
  // This tells the slider 'Time' what value to have
  anim.addKeyframe(timePoint, { Time: timePoint });
}

// Save the animation configuration
anim.save({ 
  duration: 10, 
  fps: 60, 
  loop: true 
});

// 3. Create D3 Visualization using the current 't' value
const svg = d3.select(output)
  .append('svg')
  .attr('width', 400)
  .attr('height', 300);

// Physics math: bouncing ball height
// |sin(t * 2)| * height
// We use 250 as the floor y-coordinate
const bounceHeight = 200;
const y = 250 - Math.abs(Math.sin(t * 2)) * bounceHeight;

// Draw the ball
svg.append('circle')
  .attr('cx', 200)
  .attr('cy', y)
  .attr('r', 20)
  .attr('fill', '#ef4444');

// Draw the floor shadow (dynamic size!)
const shadowRadius = 20 - (250 - y) / 20;
svg.append('ellipse')
  .attr('cx', 200)
  .attr('cy', 270)
  .attr('rx', Math.max(0, shadowRadius))
  .attr('ry', Math.max(0, shadowRadius / 4))
  .attr('fill', 'rgba(0,0,0,0.2)');

// Draw the floor line
svg.append('line')
  .attr('x1', 50).attr('y1', 270)
  .attr('x2', 350).attr('y2', 270)
  .attr('stroke', '#333').attr('stroke-width', 2);
```

---

## Troubleshooting

**Q: My animation doesn't play smoothly**
- **A**: Reduce `fps` in programmatic animations, or space keyframes further apart

**Q: Auto-update isn't working**
- **A**: Make sure you've **selected the visualization** (not the code block) and checked the "Auto" checkbox in the control panel

**Q: Can't see keyframe markers on timeline**
- **A**: Make sure you've stopped recording - markers only appear after recording ends

**Q: How do I delete a keyframe?**
- **A**: Click the **✕** button next to the keyframe in the list below the timeline

**Q: Step Forward/Backward buttons are disabled**
- **A**: You need at least 1 keyframe for step navigation to work

---

## Next: Exporting Your Animation

Once your animation is ready:
1. Use screen recording software (QuickTime, OBS) to capture the animation playback
2. *Coming soon: Built-in video export!*

---

**Pro Tip**: Keep animations under 30 seconds for YouTube clips - break longer explanations into multiple animations across different code blocks!
