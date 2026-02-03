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
  type: 'slider' | 'text' | 'checkbox';
  label: string;
  value: number | string | boolean;
  min?: number;            // For sliders
  max?: number;            // For sliders
  step?: number;           // For sliders
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
