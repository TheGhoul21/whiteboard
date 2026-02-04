# Interactive Code Blocks Guide

Interactive Code Blocks let you write JavaScript code that generates D3.js visualizations directly on your whiteboard. Perfect for data visualization, teaching, and interactive presentations.

## Quick Start

1. Click the **{} Code** button in the toolbar
2. A code block appears with an interactive linear regression example
3. Click **Run** (or `Cmd+Enter`) to execute and generate the visualization
4. Adjust the sliders to change parameters
5. Click **Run** again to update the visualization

## What You Get

Each code block provides:
- **CodeMirror editor**: Syntax highlighting, autocomplete, keyboard shortcuts
- **Interactive controls**: Sliders, text inputs, and checkboxes defined in your code
- **D3 visualizations**: Rendered as images on the canvas, positioned to the right of the code block
- **Two output modes**: Replace (update existing visualization) or Append (stack multiple outputs)

## The Sandbox Environment

Your code executes in a controlled sandbox with these injected globals:

### `output` (HTMLDivElement)
An empty div element where you build your D3 visualization.

```javascript
// Append SVG to the output div
const svg = d3.select(output)
  .append('svg')
  .attr('width', 400)
  .attr('height', 300);
```

### `d3` (D3.js v7)
The full D3 library is available for creating visualizations.

```javascript
// Use any D3 functions
const scale = d3.scaleLinear().domain([0, 100]).range([0, 400]);
```

### Control Functions

These functions define interactive controls AND return their current values:

#### `slider(label, min, max, initial, step)`
Creates a slider control.

```javascript
const radius = slider('Circle Radius', 10, 100, 50, 5);
// Returns 50 on first run, then the adjusted value on subsequent runs
```

**Parameters:**
- `label` (string): Display label for the slider
- `min` (number): Minimum value
- `max` (number): Maximum value
- `initial` (number): Starting value (used only on first run)
- `step` (number, optional): Increment step (default: 1)

**Returns:** Current slider value (number)

#### `input(label, initial)`
Creates a text input control.

```javascript
const title = input('Chart Title', 'My Chart');
// Returns 'My Chart' on first run, then user's typed value
```

**Parameters:**
- `label` (string): Display label
- `initial` (string): Starting text value

**Returns:** Current input text (string)

#### `checkbox(label, initial)`
Creates a checkbox control.

```javascript
const showGrid = checkbox('Show Grid Lines', true);
// Returns true on first run, then checked state
```

**Parameters:**
- `label` (string): Display label
- `initial` (boolean): Starting checked state

**Returns:** Current checkbox state (boolean)

#### `radio(label, options, initial)`
Creates radio button controls for selecting one option from multiple choices.

```javascript
const theme = radio('Theme', ['light', 'dark', 'auto'], 'light');
// Returns 'light' on first run, then selected option
```

**Parameters:**
- `label` (string): Display label
- `options` (string[]): Array of option values
- `initial` (string): Starting selected option

**Returns:** Currently selected option (string)

#### `color(label, initial)`
Creates a color picker control.

```javascript
const lineColor = color('Line Color', '#3b82f6');
// Returns '#3b82f6' on first run, then selected color
```

**Parameters:**
- `label` (string): Display label
- `initial` (string): Starting color (hex format)

**Returns:** Currently selected color (string, hex format)

#### `select(label, options, initial)`
Creates a dropdown select menu.

```javascript
const dataset = select('Dataset', ['iris', 'mnist', 'cifar'], 'iris');
// Returns 'iris' on first run, then selected value
```

**Parameters:**
- `label` (string): Display label
- `options` (string[]): Array of option values
- `initial` (string): Starting selected option

**Returns:** Currently selected option (string)

#### `range(label, min, max, initialMin, initialMax, step)`
Creates a range slider with two thumbs for selecting a range.

```javascript
const xRange = range('X Range', 0, 100, 20, 80, 5);
// Returns {min: 20, max: 80} on first run, then adjusted range
// Access with: xRange.min and xRange.max
```

**Parameters:**
- `label` (string): Display label
- `min` (number): Minimum possible value
- `max` (number): Maximum possible value
- `initialMin` (number): Starting lower bound
- `initialMax` (number): Starting upper bound
- `step` (number, optional): Increment step (default: 1)

**Returns:** Current range object with `min` and `max` properties

#### `button(label)`
Creates a clickable button that tracks click count.

```javascript
const clicks = button('Add Point');
// Returns {clickCount: 0, lastClicked: null} on first run
// Then {clickCount: N, lastClicked: timestamp} after clicks
// Access with: clicks.clickCount
```

**Parameters:**
- `label` (string): Button text

**Returns:** Object with `clickCount` (number) and `lastClicked` (timestamp) properties

#### `toggle(label, initial)`
Creates a modern toggle switch control.

```javascript
const animate = toggle('Animate', false);
// Returns false on first run, then toggled state
```

**Parameters:**
- `label` (string): Display label
- `initial` (boolean): Starting toggle state

**Returns:** Current toggle state (boolean)

#### `animate(keyframes, options)`
Programmatically creates animations by defining keyframes in code. Perfect for gradient descent, parameter sweeps, simulations, and mathematical animations.

```javascript
// Create animation with keyframes
animate([
  { time: 0, values: { 'Slope': 2, 'Intercept': 5 } },
  { time: 1, values: { 'Slope': 1.5, 'Intercept': 3 } },
  { time: 2, values: { 'Slope': 1.2, 'Intercept': 1 } },
  { time: 3, values: { 'Slope': 1.0, 'Intercept': 0 } }
], {
  duration: 5,  // Total duration in seconds
  fps: 30,      // Frames per second
  loop: true    // Loop continuously
});
```

**Parameters:**
- `keyframes` (Array): Array of keyframe objects, each with:
  - `time` (number): Time in seconds
  - `values` (object): Control values at this keyframe (keys must match control labels)
  - `label` (string, optional): Display label for this keyframe
- `options` (object, optional):
  - `duration` (number): Total animation duration (auto-calculated from max time if not specified)
  - `fps` (number): Frames per second (default: 30)
  - `loop` (boolean): Whether to loop animation (default: false)

**Returns:** Nothing (creates animation state)

**See:** [Animation System](#animation-system) section for detailed examples

#### `log(message)`
Logs to the browser console for debugging.

```javascript
log('Current value: ' + radius);
// Output appears in browser DevTools console
```

## How Execution Works

### First Run
1. You click **Run** or press `Cmd+Enter`
2. Code executes and control functions collect their definitions
3. Controls are created with `initial` values
4. D3 code runs using those initial values
5. Visualization appears to the right of the code block
6. Controls appear below the code editor

### Subsequent Runs
1. Adjust control values in the UI (does NOT auto-execute)
2. Click **Run** again
3. Control functions return the adjusted values (NOT the initial values)
4. D3 code runs with new values
5. Visualization updates (Replace mode) or new one appears (Append mode)

**Important:** Changing controls does NOT automatically re-execute. You must click **Run** to see changes.

## Default Example Code

When you create a new code block, you get this interactive linear regression example:

```javascript
// Example: Interactive Linear Regression

const slope = slider('Slope', -2, 2, 1, 0.1);
const intercept = slider('Intercept', -10, 10, 0, 0.5);

// Generate data points
const data = Array.from({length: 50}, (_, i) => {
  const x = i / 5;
  const y = slope * x + intercept + (Math.random() - 0.5) * 2;
  return {x, y};
});

// Setup
const margin = {top: 20, right: 20, bottom: 40, left: 50};
const width = 400 - margin.left - margin.right;
const height = 300 - margin.top - margin.bottom;

const svg = d3.select(output)
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

// Scales
const xScale = d3.scaleLinear().domain([0, 10]).range([0, width]);
const yScale = d3.scaleLinear().domain([-20, 20]).range([height, 0]);

// Axes
svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(xScale));
svg.append('g').call(d3.axisLeft(yScale));

// Plot points
svg.selectAll('circle')
  .data(data)
  .join('circle')
  .attr('cx', d => xScale(d.x))
  .attr('cy', d => yScale(d.y))
  .attr('r', 3)
  .attr('fill', 'steelblue');

// Regression line
const line = d3.line().x(d => xScale(d[0])).y(d => yScale(d[1]));
svg.append('path')
  .datum([[0, intercept], [10, slope * 10 + intercept]])
  .attr('fill', 'none')
  .attr('stroke', 'red')
  .attr('stroke-width', 2)
  .attr('d', line);
```

## UI Features

### Code Block Toolbar

- **Run**: Execute the code and generate/update visualization
- **▼ Fold**: Collapse to toolbar-only view (saves space)
- **▶ Fold**: Expand to show code and controls
- **↻ Replace**: Update existing visualization when running (default)
- **⊕ Append**: Create new visualization each run, stacked vertically
- **✓ Executed**: Shows when last run was successful
- **Error: ...**: Displays execution errors

### Keyboard Shortcuts

**In edit mode:**
- `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows): Execute code
- `Escape`: Exit edit mode

**In select mode:**
- Double-click: Enter edit mode
- `Delete` / `Backspace`: Delete selected code block

### Output Modes

**Replace Mode (default ↻)**
- Updates the existing visualization
- Maintains position on canvas
- Best for iterating on a single chart

**Append Mode (⊕)**
- Creates a new visualization each run
- Positions new visualizations vertically below previous ones
- Useful for comparing different parameter combinations
- All visualizations remain linked to the source code block

### Linked Visualization Highlighting

When you select a code block, its linked visualization(s) are automatically highlighted with a **green dashed border**. This helps you:
- Identify which visualization belongs to which code block
- Find "invisible" visualizations (e.g., when you accidentally used white colors)
- Understand the relationship between code and output

**How it works:**
1. Click to select a code block
2. Any visualizations created by that code block show a green dashed border
3. Works with both Replace and Append modes
4. The highlight disappears when you deselect the code block

## Visualization Controls

Visualizations can have their own independent set of controls, allowing you to adjust parameters directly on the visualization without going back to the code block.

### Attaching Controls to Visualizations

1. Create a code block with controls and generate a visualization
2. Move the visualization away from the code block (optional)
3. Select the visualization
4. Click the **🎮** "Show Controls" button that appears
5. A controls panel appears below the visualization
6. Adjust controls and click **↻ Update** to refresh just that visualization

### Independent Control Values

Each visualization maintains its own independent snapshot of control values:

- **Code block controls**: The "master" controls in the code block
- **Visualization controls**: Each visualization has its own copy of values
- Changing a visualization's controls ONLY affects that visualization
- The code block's controls remain unchanged
- Multiple visualizations can have different parameter values

**Example workflow:**
```javascript
// Code block
const slope = slider('Slope', -2, 2, 1, 0.1);
const intercept = slider('Intercept', -10, 10, 0, 0.5);
// ... create linear regression visualization ...
```

1. Run with slope=1, intercept=0 → Visualization A created
2. Enable **Append mode**
3. Change to slope=2, intercept=5
4. Run again → Visualization B created
5. Select Visualization A → Show Controls → Change to slope=1.5
6. Click Update → Visualization A updates independently
7. Visualization B and code block remain unchanged

### Control Panel Features

- **🎮 Icon**: Indicates controls panel
- **↻ Update button**: Re-executes code with this visualization's control values
- **✕ Close button**: Hides the controls panel
- **All control types**: Radio, color picker, sliders, toggles, etc.
- **Real-time values**: Shows current values for this specific visualization

## Animation System

Create smooth, keyframe-based animations for educational videos, parameter sweeps, gradient descent visualizations, and more.

### Manual Recording

Record keyframes by adjusting controls over time:

1. **Start Recording**: Click **⏺** button in code block toolbar (turns red)
2. **Set initial values**: Adjust controls to first position
3. **Add keyframe**: Click **+ KF** button
4. **Adjust and repeat**: Change controls, wait, click **+ KF** again
5. **Stop Recording**: Click **⏺** again
6. **Playback**: Use animation player controls that appear

The animation player provides:
- **▶ Play button**: Start animation playback
- **⏸ Pause button**: Pause during playback
- **⏹ Stop button**: Reset to beginning
- **Timeline scrubber**: Drag to manually navigate time
- **Keyframe list**: Shows all keyframes with timestamps
- **Delete buttons**: Remove individual keyframes

### Programmatic Animations

Generate animations directly from code - perfect for mathematical concepts:

#### Gradient Descent Example

```javascript
const learningRate = slider('Learning Rate', 0, 1, 0.1, 0.01);
const momentum = slider('Momentum', 0, 1, 0.5, 0.01);

// Simulate gradient descent optimization
const steps = [];
let lr = 0.5, m = 0.9;
for (let i = 0; i < 20; i++) {
  steps.push({
    time: i * 0.2,
    values: {
      'Learning Rate': lr * Math.exp(-i * 0.1),
      'Momentum': m
    }
  });
  lr *= 0.95;
  m *= 0.98;
}

animate(steps, {
  duration: 5,
  fps: 30,
  loop: true
});

// Visualize the optimization path
// ... d3 code to show convergence ...
```

#### Parameter Sweep Example

```javascript
const frequency = slider('Frequency', 0, 10, 1, 0.1);
const amplitude = slider('Amplitude', 0, 5, 1, 0.1);

// Create smooth parameter sweep over 4 seconds
const frames = [];
for (let t = 0; t <= 4; t += 0.1) {
  frames.push({
    time: t,
    values: {
      'Frequency': 1 + Math.sin(t * Math.PI) * 4,
      'Amplitude': 2 + Math.cos(t * Math.PI / 2) * 2
    }
  });
}

animate(frames, { loop: true });

// Draw sine wave with animated parameters
const svg = d3.create('svg').attr('width', 400).attr('height', 300);
// ... use frequency and amplitude ...
output.appendChild(svg.node());
```

#### Discrete Steps Example

```javascript
const step = slider('Algorithm Step', 0, 5, 0, 1);

// Define discrete algorithm states
animate([
  { time: 0, values: { 'Algorithm Step': 0 }, label: 'Initialize' },
  { time: 1, values: { 'Algorithm Step': 1 }, label: 'First iteration' },
  { time: 2, values: { 'Algorithm Step': 2 }, label: 'Second iteration' },
  { time: 3, values: { 'Algorithm Step': 3 }, label: 'Converge' },
  { time: 4, values: { 'Algorithm Step': 4 }, label: 'Done' }
], { fps: 2 });  // Low FPS for discrete steps
```

### Animation Features

**Smooth Interpolation:**
- **Numbers**: Linear interpolation
- **Colors**: RGB interpolation for smooth color transitions
- **Range objects**: Both min and max interpolate independently
- **Booleans/Strings**: Switch at midpoint between keyframes

**Playback Controls:**
- Play/pause/stop buttons
- Timeline scrubber for manual time navigation
- Current time and total duration display
- Loop mode for continuous playback

**Keyframe Management:**
- Add keyframes manually (recording mode) or programmatically
- Delete individual keyframes
- Keyframes automatically sorted by time
- Display keyframe labels and timestamps

### Animation Use Cases

- **Machine Learning**: Visualize gradient descent, learning rate schedules, convergence
- **Physics**: Show motion, oscillations, phase transitions
- **Mathematics**: Demonstrate function transformations, parameter effects
- **Algorithms**: Step through algorithm states with discrete keyframes
- **Data Science**: Animate data transformations, filtering, aggregations
- **Signal Processing**: Show frequency/amplitude modulation over time

### Combining Manual and Programmatic

You can combine both approaches:

```javascript
const x = slider('X', 0, 10, 5, 0.1);

// Create initial animation programmatically
const initialFrames = [];
for (let t = 0; t <= 2; t += 0.1) {
  initialFrames.push({
    time: t,
    values: { 'X': Math.sin(t * Math.PI) * 5 + 5 }
  });
}
animate(initialFrames);

// Then manually record additional keyframes by:
// 1. Click ⏺ to start recording
// 2. Adjust controls
// 3. Click + KF to add more keyframes
```

## Technical Architecture

### Type Definitions

**CodeBlockObj:**
```typescript
{
  id: string;
  type: 'codeblock';
  code: string;              // JavaScript source
  x, y: number;             // Canvas position
  width, height: number;    // Dimensions (default: 500x400)
  fontSize: number;         // Editor font size (default: 14)

  // Execution state
  lastExecuted?: number;    // Timestamp of last execution
  error?: string;          // Error message if execution failed

  // Interactive controls
  controls?: CodeBlockControl[];

  // Visualization linking
  outputId?: string;       // ID of linked D3VisualizationObj

  // UI state
  isFolded?: boolean;
  unfoldedHeight?: number;
  appendMode?: boolean;    // Toggle between Replace/Append
}
```

**D3VisualizationObj:**
```typescript
{
  id: string;
  type: 'd3viz';
  x, y: number;             // Position (automatically placed right of code block)
  width, height: number;    // Dimensions (default: 450x350)
  content: string;          // HTML/SVG content from D3
  sourceCodeBlockId: string; // Backreference to code block
}
```

**CodeBlockControl:**
```typescript
{
  id: string;
  type: 'slider' | 'number' | 'text' | 'checkbox' |
        'radio' | 'color' | 'select' | 'range' | 'button' | 'toggle';
  label: string;
  value: any;  // Type depends on control type
  min?: number;            // For sliders, number, range
  max?: number;            // For sliders, number, range
  step?: number;           // For sliders, number, range
  options?: string[];      // For radio, select
}
```

**Animation:**
```typescript
{
  id: string;
  codeBlockId: string;
  keyframes: Keyframe[];
  duration: number;        // Total duration in seconds
  fps: number;            // Frames per second for playback
  loop?: boolean;         // Whether to loop animation
}
```

**Keyframe:**
```typescript
{
  id: string;
  time: number;           // Time in seconds from animation start
  controlValues: Record<string, any>;  // Snapshot of all control values
  label?: string;         // Optional label for this keyframe
}
```

### Execution Pipeline

When you click **Run**:

1. **Setup**: Create empty `output` div and control value map from existing controls
2. **Sandbox Creation**: Inject `output`, `d3`, and control functions
3. **Code Execution**:
   - User code runs via `new Function()` (safer than `eval`)
   - Control functions capture definitions and return current values
   - D3 code generates SVG/HTML in the `output` div
4. **Extract Output**: Serialize `output.innerHTML` to string
5. **Update State**:
   - **Replace mode**: Update existing visualization's content
   - **Append mode**: Create new D3VisualizationObj positioned 20px right and below
6. **Store Controls**: Save control definitions with current values
7. **Render Visualization**: Convert HTML/SVG to PNG and display on canvas

### Visualization Rendering Process

D3VisualizationObject converts HTML/SVG to images:

1. Create temporary DOM element with the HTML content
2. Wait 100ms for rendering to complete
3. If SVG found:
   - Serialize SVG to string
   - Convert to Blob and create object URL
   - Draw to canvas with white background
   - Convert canvas to PNG data URL
4. If no SVG (HTML content):
   - Wrap in SVG foreignObject
   - Follow same rendering process
5. Load PNG into Konva Image for canvas display

**Note:** Visualizations are rendered as static PNG images. They are NOT live DOM elements.

### Position Calculation

**New visualizations are positioned:**
- **X**: `codeblock.x + codeblock.width + 20` (20px right of code block)
- **Y**: `codeblock.y` (aligned with top of code block)
- **Append mode**: Subsequent visualizations stack vertically with spacing

### Control Value Persistence

Controls maintain state between runs:

1. First execution: Controls created with `initial` values from code
2. User adjusts controls in UI
3. Next execution: Control functions return adjusted values, NOT initial values
4. Controls persist until code block is deleted

**To reset controls:** Delete and recreate the code block.

## Examples

### Simple Bar Chart

```javascript
const barCount = slider('Bars', 5, 20, 10, 1);
const maxHeight = slider('Max Height', 50, 200, 150, 10);

const data = Array.from({length: barCount}, () =>
  Math.random() * maxHeight
);

const svg = d3.select(output)
  .append('svg')
  .attr('width', 400)
  .attr('height', 300);

const barWidth = 380 / barCount;

svg.selectAll('rect')
  .data(data)
  .join('rect')
  .attr('x', (d, i) => i * barWidth + 10)
  .attr('y', d => 280 - d)
  .attr('width', barWidth - 2)
  .attr('height', d => d)
  .attr('fill', 'steelblue');
```

### Animated Circle

```javascript
const frame = slider('Frame', 0, 100, 0, 1);
const radius = slider('Radius', 5, 50, 20, 1);

const angle = (frame / 100) * Math.PI * 2;
const cx = 200 + Math.cos(angle) * 100;
const cy = 150 + Math.sin(angle) * 100;

const svg = d3.select(output)
  .append('svg')
  .attr('width', 400)
  .attr('height', 300);

svg.append('circle')
  .attr('cx', cx)
  .attr('cy', cy)
  .attr('r', radius)
  .attr('fill', '#e74c3c');

// Trace path
svg.append('circle')
  .attr('cx', 200)
  .attr('cy', 150)
  .attr('r', 100)
  .attr('fill', 'none')
  .attr('stroke', '#ddd')
  .attr('stroke-width', 2);
```

### Conditional Rendering

```javascript
const showAxes = checkbox('Show Axes', true);
const showGrid = checkbox('Show Grid', false);
const dataPoints = slider('Points', 10, 100, 50, 5);

const data = Array.from({length: dataPoints}, (_, i) => ({
  x: i,
  y: Math.sin(i / 5) * 50 + 150
}));

const svg = d3.select(output)
  .append('svg')
  .attr('width', 400)
  .attr('height', 300);

if (showGrid) {
  // Draw grid lines
  for (let i = 0; i < 400; i += 40) {
    svg.append('line')
      .attr('x1', i).attr('x2', i)
      .attr('y1', 0).attr('y2', 300)
      .attr('stroke', '#eee');
  }
}

// Plot data
svg.selectAll('circle')
  .data(data)
  .join('circle')
  .attr('cx', d => d.x * 4)
  .attr('cy', d => d.y)
  .attr('r', 2)
  .attr('fill', 'steelblue');

if (showAxes) {
  svg.append('line')
    .attr('x1', 0).attr('x2', 400)
    .attr('y1', 150).attr('y2', 150)
    .attr('stroke', 'black');
}
```

## Tips & Best Practices

### Performance
- Keep datasets under ~1000 points for smooth interaction
- Complex visualizations take longer to render as images
- Folding unused code blocks improves canvas performance

### Debugging
- Use `log(value)` to inspect variables in browser console
- Check toolbar for execution error messages
- Test simple code first before building complex visualizations
- Browser DevTools show full error stack traces

### Code Organization
- Define controls at the top for visibility
- Group related controls together
- Comment complex D3 chains for clarity

### Visualization Best Practices
- Always set explicit SVG width and height
- **Never use white colors** - visualizations render on white backgrounds, making white strokes/fills invisible
- Use visible colors like black, gray, or any other color instead of white
- Fill backgrounds explicitly if needed (white background is automatic)
- Use D3 margins convention for proper axis spacing
- Test with different control values to ensure robustness

### Common Patterns

**Responsive sizing:**
```javascript
const width = slider('Width', 200, 600, 400, 50);
const height = slider('Height', 150, 500, 300, 50);
```

**Color selection:**
```javascript
const colorIndex = slider('Color', 0, 5, 0, 1);
const colors = ['red', 'blue', 'green', 'orange', 'purple', 'pink'];
const color = colors[Math.floor(colorIndex)];
```

**Data transformations:**
```javascript
const transform = slider('Transform', 0, 2, 0, 1);
const transforms = [
  d => d,                    // Identity
  d => Math.log(d + 1),     // Log scale
  d => Math.sqrt(d)         // Square root
];
const transformFn = transforms[Math.floor(transform)];
```

## Troubleshooting

### "Undefined is not a function"
- Check D3 API version (this uses D3 v7)
- Verify method names: `d3.scaleLinear()` not `d3.scale.linear()`
- Some D3 modules may not be included

### Visualization not appearing
- Ensure you append to `output`: `d3.select(output).append('svg')`
- Set explicit SVG dimensions: `.attr('width', 400).attr('height', 300)`
- Check toolbar for error messages
- Verify SVG is actually generated: `log(output.innerHTML)`

### Controls not updating visualization
- You must click **Run** after changing controls
- Control changes do NOT auto-execute (performance/stability reasons)
- Check that your code uses the control variables

### Blank or partial output
- SVG might be rendering outside viewBox
- Check coordinate calculations
- Ensure proper margins and scales
- **White elements are invisible!** - Visualizations have white backgrounds, so any `stroke: 'white'` or `fill: 'white'` will not be visible. Use black, gray, or any other color instead.

### Visualization appears empty but code runs without errors
- **Most common cause:** You used white colors (stroke, fill, text) which are invisible on the white background
- **Solution:** Change all white colors to visible colors like black, gray, blue, etc.
- Use the linked visualization highlight feature: when you select the code block, the visualization shows a green dashed border

### "Cannot read property of undefined"
- Check variable names match control labels exactly
- Verify D3 selections return elements
- Data array might be empty

### Append mode stacking incorrectly
- This is a known limitation with complex stacking logic
- Visualizations stack at fixed Y offset (370px)
- Consider using Replace mode for iteration

## Board-Aware Code API

Code blocks can now read and write other whiteboard elements using the `board` object. This enables powerful interactions like:
- Creating multiple shapes programmatically
- Animating existing elements
- Building complex diagrams from code
- Processing or transforming existing elements

> **🎮 Test the examples!** Open `board-api-playground.html` in your browser to interactively test all Board API examples with live controls and instant visual feedback.

### Reading Elements

Get all elements of a specific type:

```javascript
const images = board.getImages();      // Array of all images
const texts = board.getTexts();        // Array of all text objects
const shapes = board.getShapes();      // Array of all shapes
const latex = board.getLatex();        // Array of all LaTeX objects
const strokes = board.getStrokes();    // Array of all freehand strokes
const vizs = board.getVisualizations(); // Array of all D3 visualizations

// Get all elements at once
const all = board.getAll();
// Returns: { images, texts, shapes, latex, strokes, visualizations }
```

Each element includes all its properties (position, size, color, etc.) except the `type` field.

**Example: List all text positions**
```javascript
const texts = board.getTexts();
const info = texts.map(t => `"${t.text}" at (${t.x}, ${t.y})`).join('<br>');
output.innerHTML = `<div>Found ${texts.length} text objects:<br>${info}</div>`;
```

### Creating Elements

Add new elements to the whiteboard programmatically. All `add*` methods return the element ID.

**addImage(props)**
```javascript
const id = board.addImage({
  src: 'https://example.com/image.png',
  x: 100,
  y: 100,
  width: 200,
  height: 200,
  rotation: 0,        // Optional, in degrees
  zIndex: 1000        // Optional, for layering
});
```

**addText(props)**
```javascript
const id = board.addText({
  text: 'Hello World',
  x: 50,
  y: 50,
  fontSize: 24,
  color: '#ff0000',   // Hex color
  zIndex: 2000        // Optional
});
```

**addShape(props)**
```javascript
// Rectangle
const rectId = board.addShape({
  type: 'rect',       // Required: 'rect', 'circle', or 'arrow'
  x: 0,
  y: 0,
  width: 100,
  height: 50,
  color: '#0000ff',
  strokeWidth: 2,
  zIndex: 3000        // Optional
});

// Circle
const circleId = board.addShape({
  type: 'circle',
  x: 200,
  y: 200,
  width: 80,          // Diameter
  height: 80,         // Diameter
  color: '#00ff00',
  strokeWidth: 3
});

// Arrow
const arrowId = board.addShape({
  type: 'arrow',
  points: [0, 0, 100, 100],  // [x1, y1, x2, y2]
  color: '#ff00ff',
  strokeWidth: 4
});
```

**addLatex(props)**
```javascript
const id = board.addLatex({
  text: 'E = mc^2',   // LaTeX formula
  x: 150,
  y: 150,
  fontSize: 20,
  color: '#000000',
  zIndex: 4000        // Optional
});
```

### Updating Elements

Modify existing elements by ID:

```javascript
board.updateElement(elementId, {
  x: 300,             // Move to new position
  y: 200,
  color: '#ff0000',   // Change color
  fontSize: 32        // For text/latex
});
```

**Example: Move all texts down by 50px**
```javascript
const texts = board.getTexts();
texts.forEach(text => {
  board.updateElement(text.id, { y: text.y + 50 });
});
```

### Deleting Elements

Remove elements by ID:

```javascript
board.deleteElement(elementId);
```

**Example: Delete all small shapes**
```javascript
const shapes = board.getShapes();
shapes.forEach(shape => {
  if (shape.width < 50) {
    board.deleteElement(shape.id);
  }
});
```

### Positioning Elements

**IMPORTANT**: Board API elements are created on the main whiteboard canvas at **absolute coordinates**, NOT in the visualization box. To make elements appear in the visible area, use viewport-relative positioning.

**Position elements in the current viewport (recommended):**
```javascript
const viewport = board.getViewport();
// Calculate top-left of visible area in whiteboard coordinates
const viewLeft = -viewport.x / viewport.zoom;
const viewTop = -viewport.y / viewport.zoom;
const viewWidth = window.innerWidth / viewport.zoom;
const viewHeight = window.innerHeight / viewport.zoom;

// Position element in center of viewport
board.addShape({
  type: 'circle',
  x: viewLeft + viewWidth / 2,
  y: viewTop + viewHeight / 2,
  width: 50,
  height: 50,
  color: '#3b82f6',
  strokeWidth: 2
});
```

**Position elements next to code block:**
```javascript
const pos = board.getCodeBlockPosition();
// Position to the right of code block (where visualizations appear)
const startX = pos.x + pos.width + 20;
const startY = pos.y;

board.addShape({
  type: 'circle',
  x: startX,
  y: startY,
  width: 50,
  height: 50,
  color: '#3b82f6',
  strokeWidth: 2
});
```

### Complete Examples

**Create a grid of circles**
```javascript
const rows = slider('Rows', 2, 10, 5, 1);
const cols = slider('Columns', 2, 10, 5, 1);
const spacing = slider('Spacing', 20, 100, 50, 5);
const circleSize = slider('Size', 10, 50, 30, 2);
const gridColor = color('Color', '#3b82f6');

// Clear old shapes (optional)
const oldShapes = board.getShapes();
oldShapes.forEach(s => board.deleteElement(s.id));

// Create grid
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    board.addShape({
      type: 'circle',
      x: col * spacing,
      y: row * spacing,
      width: circleSize,
      height: circleSize,
      color: gridColor,
      strokeWidth: 2
    });
  }
}

output.innerHTML = `<div>Created ${rows * cols} circles</div>`;
```

**Annotate existing images**
```javascript
const images = board.getImages();
const labelColor = color('Label Color', '#ff0000');

images.forEach((img, i) => {
  // Add text label above each image
  board.addText({
    text: `Image ${i + 1}`,
    x: img.x,
    y: img.y - 25,
    fontSize: 16,
    color: labelColor
  });

  // Add bounding box
  board.addShape({
    type: 'rect',
    x: img.x - 5,
    y: img.y - 5,
    width: img.width + 10,
    height: img.height + 10,
    color: labelColor,
    strokeWidth: 2
  });
});

output.innerHTML = `<div>Annotated ${images.length} images</div>`;
```

**Create a force-directed layout**
```javascript
const numNodes = slider('Nodes', 3, 20, 10, 1);
const iterations = slider('Iterations', 10, 200, 100, 10);

// Simple force simulation (not using D3 force)
const nodes = Array.from({ length: numNodes }, (_, i) => ({
  x: Math.random() * 400,
  y: Math.random() * 300,
  vx: 0,
  vy: 0
}));

// Run simulation
for (let iter = 0; iter < iterations; iter++) {
  // Apply forces
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[j].x - nodes[i].x;
      const dy = nodes[j].y - nodes[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      // Repulsion
      const force = 500 / (dist * dist);
      nodes[i].vx -= (dx / dist) * force;
      nodes[i].vy -= (dy / dist) * force;
      nodes[j].vx += (dx / dist) * force;
      nodes[j].vy += (dy / dist) * force;
    }
  }

  // Update positions
  nodes.forEach(n => {
    n.x += n.vx * 0.1;
    n.y += n.vy * 0.1;
    n.vx *= 0.9;  // Damping
    n.vy *= 0.9;
  });
}

// Clear old elements
const oldShapes = board.getShapes();
oldShapes.forEach(s => board.deleteElement(s.id));

// Draw nodes
nodes.forEach((node, i) => {
  board.addShape({
    type: 'circle',
    x: node.x,
    y: node.y,
    width: 20,
    height: 20,
    color: '#3b82f6',
    strokeWidth: 2
  });

  board.addText({
    text: String(i),
    x: node.x - 4,
    y: node.y - 8,
    fontSize: 12,
    color: '#000000'
  });
});

output.innerHTML = `<div>Laid out ${numNodes} nodes in ${iterations} iterations</div>`;
```

**Animate elements with the board API**
```javascript
const speed = slider('Speed', 1, 10, 5, 1);

// Get all shapes
const shapes = board.getShapes();

// Animate by moving them in a circle
const frame = Date.now() / 1000 * speed;
shapes.forEach((shape, i) => {
  const angle = (frame + i * 0.5) % (Math.PI * 2);
  const radius = 100;
  const newX = 200 + Math.cos(angle) * radius;
  const newY = 150 + Math.sin(angle) * radius;

  board.updateElement(shape.id, { x: newX, y: newY });
});

output.innerHTML = `<div>Animating ${shapes.length} shapes</div>`;
```

### Complete Working Examples

All examples below have been tested in the Board API playground and work correctly in the whiteboard.

#### 1. Interactive Grid Generator

Create a customizable grid of labeled circles in the current viewport:

```javascript
const rows = slider('Rows', 1, 10, 4, 1);
const cols = slider('Columns', 1, 10, 5, 1);
const size = slider('Size', 10, 80, 40, 5);
const spacing = slider('Spacing', 50, 150, 100, 10);
const gridColor = color('Color', '#3b82f6');

// Get viewport to position in visible area
const viewport = board.getViewport();
const viewLeft = -viewport.x / viewport.zoom;
const viewTop = -viewport.y / viewport.zoom;
const viewWidth = window.innerWidth / viewport.zoom;

// Position grid in center-right of viewport
const startX = viewLeft + viewWidth * 0.4;
const startY = viewTop + 50;

// Clear old elements
board.getShapes().forEach(s => board.deleteElement(s.id));
board.getTexts().forEach(t => board.deleteElement(t.id));

// Create grid
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    const x = startX + col * spacing;
    const y = startY + row * spacing;

    board.addShape({
      type: 'circle',
      x: x,
      y: y,
      width: size,
      height: size,
      color: gridColor,
      strokeWidth: 2
    });

    board.addText({
      text: `${row},${col}`,
      x: x + size / 3,
      y: y + size / 3,
      fontSize: 11,
      color: '#000000'
    });
  }
}

output.innerHTML = `<div>Created ${rows * cols} circles in ${rows}×${cols} grid</div>`;
```

**Use case:** Teaching coordinate systems, matrix visualization, game boards.

#### 2. Spiral Pattern

Generate mathematical spirals in the current viewport:

```javascript
const points = slider('Points', 10, 100, 50, 5);
const turns = slider('Turns', 1, 10, 3, 0.5);
const spiralColor = color('Color', '#8b5cf6');
const dotSize = slider('Dot Size', 5, 30, 15, 1);

// Get viewport center
const viewport = board.getViewport();
const viewLeft = -viewport.x / viewport.zoom;
const viewTop = -viewport.y / viewport.zoom;
const viewWidth = window.innerWidth / viewport.zoom;
const viewHeight = window.innerHeight / viewport.zoom;
const centerX = viewLeft + viewWidth * 0.6;
const centerY = viewTop + viewHeight / 2;

// Clear old elements
board.getShapes().forEach(s => board.deleteElement(s.id));

// Create spiral
const maxRadius = Math.min(viewWidth, viewHeight) * 0.3;
for (let i = 0; i < points; i++) {
  const t = (i / points) * turns * Math.PI * 2;
  const r = (i / points) * maxRadius;
  const x = centerX + Math.cos(t) * r;
  const y = centerY + Math.sin(t) * r;

  board.addShape({
    type: 'circle',
    x: x,
    y: y,
    width: dotSize,
    height: dotSize,
    color: spiralColor,
    strokeWidth: 2
  });
}

output.innerHTML = `<div>Created spiral with ${points} points and ${turns} turns</div>`;
```

**Use case:** Demonstrating polar coordinates, golden ratio, Fibonacci spirals.

#### 3. Binary Tree Visualization

Generate hierarchical tree structures:

```javascript
const depth = slider('Depth', 1, 5, 3, 1);
const hSpacing = slider('H-Spacing', 20, 100, 50, 5);
const vSpacing = slider('V-Spacing', 40, 100, 60, 5);
const nodeSize = slider('Node Size', 15, 40, 25, 5);
const treeColor = color('Color', '#10b981');

// Clear old elements
board.getShapes().forEach(s => board.deleteElement(s.id));
board.getTexts().forEach(t => board.deleteElement(t.id));

let nodeCount = 0;

function drawNode(x, y, level, maxLevel) {
  if (level > maxLevel) return;

  nodeCount++;

  // Draw node
  board.addShape({
    type: 'circle',
    x: x,
    y: y,
    width: nodeSize,
    height: nodeSize,
    color: treeColor,
    strokeWidth: 2
  });

  board.addText({
    text: String(nodeCount),
    x: x + nodeSize / 3,
    y: y + nodeSize / 3,
    fontSize: 11,
    color: '#000000'
  });

  // Draw children
  if (level < maxLevel) {
    const childY = y + vSpacing;
    const offset = hSpacing * Math.pow(2, maxLevel - level - 1);

    drawNode(x - offset, childY, level + 1, maxLevel);
    drawNode(x + offset, childY, level + 1, maxLevel);
  }
}

drawNode(250, 30, 0, depth - 1);

output.innerHTML = `<div>Created binary tree with depth ${depth} (${nodeCount} nodes)</div>`;
```

**Use case:** Teaching data structures, algorithm visualization, decision trees.

#### 4. Sine Wave Visualization

Create parametric wave patterns in the current viewport:

```javascript
const amplitude = slider('Amplitude', 10, 100, 50, 5);
const frequency = slider('Frequency', 0.5, 5, 2, 0.5);
const points = slider('Points', 20, 100, 50, 5);
const waveColor = color('Color', '#f59e0b');

// Get viewport to position in visible area
const viewport = board.getViewport();
const viewLeft = -viewport.x / viewport.zoom;
const viewTop = -viewport.y / viewport.zoom;
const viewWidth = window.innerWidth / viewport.zoom;
const viewHeight = window.innerHeight / viewport.zoom;

// Position wave in center-right of viewport
const startX = viewLeft + viewWidth * 0.3;
const centerY = viewTop + viewHeight / 2;

// Clear old shapes
board.getShapes().forEach(s => board.deleteElement(s.id));

// Draw sine wave
const waveWidth = viewWidth * 0.6;
for (let i = 0; i < points; i++) {
  const x = startX + (i / points) * waveWidth;
  const y = centerY + Math.sin((i / points) * frequency * Math.PI * 2) * amplitude;

  board.addShape({
    type: 'circle',
    x: x,
    y: y,
    width: 8,
    height: 8,
    color: waveColor,
    strokeWidth: 2
  });
}

output.innerHTML = `<div>Drew sine wave with ${points} points in viewport</div>`;
```

**Use case:** Signal processing, physics, trigonometry teaching.

#### 5. Automatic Annotation

Annotate existing shapes with labels and bounding boxes:

```javascript
const labelSize = slider('Label Size', 10, 24, 14, 1);
const labelColor = color('Label Color', '#ef4444');
const showBounds = checkbox('Show Bounds', true);

// Get existing shapes
const shapes = board.getShapes();

// Clear old texts
board.getTexts().forEach(t => board.deleteElement(t.id));

// Annotate each shape
shapes.forEach((shape, i) => {
  // Add label
  board.addText({
    text: `Shape ${i + 1}`,
    x: shape.x,
    y: shape.y - 20,
    fontSize: labelSize,
    color: labelColor
  });

  // Add bounding box if enabled
  if (showBounds) {
    board.addShape({
      type: 'rect',
      x: shape.x - 5,
      y: shape.y - 5,
      width: (shape.width || 50) + 10,
      height: (shape.height || 50) + 10,
      color: labelColor,
      strokeWidth: 1
    });
  }
});

output.innerHTML = `<div>Annotated ${shapes.length} existing shapes</div>`;
```

**Use case:** Batch labeling, diagram documentation, presentation preparation.

#### 6. Force-Directed Layout

Position nodes using a simple physics simulation:

```javascript
const numNodes = slider('Nodes', 3, 20, 10, 1);
const iterations = slider('Iterations', 10, 200, 80, 10);
const nodeSize = slider('Node Size', 15, 40, 25, 5);

// Initialize nodes randomly
const nodes = Array.from({ length: numNodes }, () => ({
  x: Math.random() * 400 + 50,
  y: Math.random() * 300 + 50,
  vx: 0,
  vy: 0
}));

// Run simulation
for (let iter = 0; iter < iterations; iter++) {
  // Repulsion between all nodes
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[j].x - nodes[i].x;
      const dy = nodes[j].y - nodes[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      const force = 800 / (dist * dist);
      nodes[i].vx -= (dx / dist) * force;
      nodes[i].vy -= (dy / dist) * force;
      nodes[j].vx += (dx / dist) * force;
      nodes[j].vy += (dy / dist) * force;
    }
  }

  // Update positions with damping
  nodes.forEach(n => {
    n.x += n.vx * 0.1;
    n.y += n.vy * 0.1;
    n.vx *= 0.85;
    n.vy *= 0.85;

    // Keep in bounds
    n.x = Math.max(50, Math.min(500, n.x));
    n.y = Math.max(50, Math.min(450, n.y));
  });
}

// Clear and draw
board.getShapes().forEach(s => board.deleteElement(s.id));
board.getTexts().forEach(t => board.deleteElement(t.id));

nodes.forEach((node, i) => {
  board.addShape({
    type: 'circle',
    x: node.x,
    y: node.y,
    width: nodeSize,
    height: nodeSize,
    color: '#8b5cf6',
    strokeWidth: 2
  });

  board.addText({
    text: String(i),
    x: node.x + nodeSize / 3,
    y: node.y + nodeSize / 3,
    fontSize: 11,
    color: '#000000'
  });
});

output.innerHTML = `<div>Laid out ${numNodes} nodes in ${iterations} iterations</div>`;
```

**Use case:** Graph visualization, network diagrams, molecular structure.

#### 7. Random Scatter Plot

Generate random distributions for data visualization:

```javascript
const count = slider('Point Count', 10, 100, 50, 5);
const minSize = slider('Min Size', 5, 30, 10, 1);
const maxSize = slider('Max Size', 10, 60, 40, 5);
const pointColor = color('Color', '#ec4899');

// Clear old elements
board.getShapes().forEach(s => board.deleteElement(s.id));

// Generate random points
for (let i = 0; i < count; i++) {
  const x = Math.random() * 450 + 25;
  const y = Math.random() * 400 + 25;
  const size = Math.random() * (maxSize - minSize) + minSize;

  board.addShape({
    type: 'circle',
    x: x,
    y: y,
    width: size,
    height: size,
    color: pointColor,
    strokeWidth: 2
  });
}

output.innerHTML = `<div>Created ${count} random points</div>`;
```

**Use case:** Statistical visualization, clustering demonstrations, data generation.

### Use Cases Summary

- **Diagram Generation**: Flowcharts, graphs, and technical diagrams
- **Data Annotation**: Automatic labeling and documentation
- **Batch Processing**: Transform or filter multiple elements
- **Algorithm Visualization**: Binary trees, sorting, pathfinding
- **Layout Algorithms**: Force-directed, hierarchical, circular
- **Math Teaching**: Spirals, waves, coordinates, transformations
- **Interactive Builders**: Generate complex structures from parameters
- **Presentation Tools**: Create and annotate diagrams programmatically

### Important Notes

- Elements created via `board.add*()` persist on the whiteboard
- Updates are immediate and trigger re-renders
- Be careful with loops that create many elements (can impact performance)
- Use `board.deleteElement()` to clean up old elements before creating new ones
- Element IDs are unique and auto-generated
- All positions are in whiteboard coordinates (not screen/viewport coordinates)

## Limitations

- **No animation**: Visualizations are static PNG images, not live SVG
- **No interactivity**: Rendered images don't respond to mouse events
- **Limited HTML**: Complex HTML layouts may not render correctly
- **No network requests**: Sandbox blocks fetch/AJAX calls
- **Manual execution**: Control changes require clicking Run
- **Fixed dimensions**: Visualization size set at creation time
- **Sandbox restrictions**: No access to DOM outside `output` div

## Advanced Use Cases

### Multi-chart dashboards
Use Append mode to create multiple related visualizations side-by-side.

### Teaching & presentations
Fold code blocks to show only results, unfold to explain implementation.

### Data exploration
Adjust parameters with sliders to quickly explore different views of data.

### Algorithm visualization
Use frame slider to step through algorithm states.

### Comparative analysis
Generate multiple visualizations with different parameters using Append mode.

## Saving & Loading

- Code blocks save to whiteboard JSON with all state
- Visualizations save as rendered content (HTML/SVG strings)
- On load, visualizations re-render from saved content
- Controls maintain last-used values
- Execution history persists across sessions
