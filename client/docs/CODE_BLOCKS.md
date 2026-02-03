# Interactive Code Blocks Documentation

Interactive code blocks allow you to write and execute JavaScript code that generates D3 visualizations with live controls. They're perfect for data exploration, teaching, and presentations.

## Overview

A code block consists of:
- **Code Editor**: Write JavaScript with CodeMirror (syntax highlighting, autocomplete)
- **Controls**: Interactive widgets (sliders, inputs, checkboxes) generated from your code
- **Visualization Output**: D3-generated charts rendered as an image on the canvas

## Creating a Code Block

### Method 1: From the UI
1. Click the **{} Code** button in the toolbar
2. A new code block appears centered on screen with default example code

### Method 2: Programmatically
```typescript
const newCodeBlock = {
  id: Date.now().toString(),
  type: 'codeblock',
  code: '// Your JavaScript code here',
  x: 100,
  y: 100,
  width: 500,
  height: 400,
  fontSize: 14,
  controls: []
};
```

## The Sandbox API

Your code runs in a controlled sandbox with these injected variables:

### `output` (HTMLDivElement)
A div element where you append your D3 visualization.

### `d3` (D3 library)
Full D3 v7 library available for data visualization.

### Control Functions

#### `slider(label, min, max, initial, step?)`
Creates an interactive slider control.
```javascript
const radius = slider('Circle Radius', 10, 100, 50, 5);
// Returns the current value (starts at 50)
```

#### `input(label, initial)`
Creates a text input control.
```javascript
const title = input('Chart Title', 'My Chart');
// Returns the current text value
```

#### `checkbox(label, initial)`
Creates a checkbox control.
```javascript
const showGrid = checkbox('Show Grid', true);
// Returns boolean
```

#### `log(message)`
Logs to browser console for debugging.
```javascript
log('Current radius: ' + radius);
```

## Example: Basic D3 Chart

```javascript
// Get slider value
const radius = slider('Radius', 10, 100, 50, 5);
const color = input('Color', '#ff6b6b');

// Create SVG using D3
const svg = d3.select(output)
  .append('svg')
  .attr('width', 400)
  .attr('height', 300);

// Draw circle
svg.append('circle')
  .attr('cx', 200)
  .attr('cy', 150)
  .attr('r', radius)
  .attr('fill', color);
```

## Example: Interactive Data Visualization

```javascript
// Parameters
const dataPoints = slider('Data Points', 10, 200, 50, 10);
const jitter = slider('Jitter', 0, 5, 1, 0.1);
const showTrend = checkbox('Show Trend Line', true);

// Generate data
const data = Array.from({length: dataPoints}, (_, i) => ({
  x: i,
  y: Math.sin(i / 10) * 50 + 150 + (Math.random() - 0.5) * jitter * 10
}));

// Setup D3
const margin = {top: 20, right: 20, bottom: 30, left: 40};
const width = 400 - margin.left - margin.right;
const height = 300 - margin.top - margin.bottom;

const svg = d3.select(output)
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

// Scales
const xScale = d3.scaleLinear()
  .domain([0, dataPoints])
  .range([0, width]);

const yScale = d3.scaleLinear()
  .domain([0, 300])
  .range([height, 0]);

// Axes
svg.append('g')
  .attr('transform', `translate(0,${height})`)
  .call(d3.axisBottom(xScale));

svg.append('g')
  .call(d3.axisLeft(yScale));

// Data points
svg.selectAll('circle')
  .data(data)
  .join('circle')
  .attr('cx', d => xScale(d.x))
  .attr('cy', d => yScale(d.y))
  .attr('r', 3)
  .attr('fill', '#4ecdc4');

// Trend line
if (showTrend) {
  const line = d3.line()
    .x(d => xScale(d.x))
    .y(d => yScale(d.y))
    .curve(d3.curveMonotoneX);
  
  svg.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', '#ff6b6b')
    .attr('stroke-width', 2)
    .attr('d', line);
}
```

## UI Controls

### Code Block Toolbar
- **Run**: Execute the code and generate/update visualization
- **Fold/Unfold**: Collapse to just the toolbar (saves space)
- **Replace/Append**: Toggle between replacing existing viz or adding new one

### Editor Shortcuts
- `Cmd/Ctrl + Enter`: Run code
- `Esc`: Exit editor mode

### Canvas Shortcuts
- `Double-click`: Enter edit mode
- `Delete/Backspace`: Delete selected code block

## Visualization Modes

### Replace Mode (default)
- Updates the existing visualization when you run
- Maintains the same position on canvas
- Good for iterating on a single chart

### Append Mode
- Creates a new visualization each time you run
- Stacks vertically below existing visualizations
- Good for comparing different parameter sets

## Control Persistence

Controls remember their values between runs:
1. First run: Controls are created with initial values
2. Adjust controls in the UI
3. Re-run code: Controls keep adjusted values (not reset to initial)
4. To reset: Delete and recreate the code block

## Technical Details

### State Management
```typescript
interface CodeBlockObj {
  id: string;
  type: 'codeblock';
  code: string;              // JavaScript source
  x, y: number;             // Position
  width, height: number;    // Dimensions
  fontSize: number;
  
  // Execution state
  lastExecuted?: number;    // Timestamp
  error?: string;          // Error message if failed
  
  // Interactive controls
  controls?: CodeBlockControl[];
  
  // Linked visualization
  outputId?: string;       // ID of D3VisualizationObj
  
  // UI state
  isFolded?: boolean;
  unfoldedHeight?: number;
  appendMode?: boolean;
}
```

### Code Execution Flow
1. User clicks **Run** or presses `Cmd+Enter`
2. Create sandbox environment with `output`, `d3`, and control functions
3. Control functions collect widget definitions (not values yet)
4. Execute user code via `new Function()`
5. Code runs, control functions return current values
6. D3 generates visualization in `output` div
7. Extract HTML content from `output`
8. Create or update `D3VisualizationObj` with the content
9. Render controls UI below code editor

### Security
- Code runs in sandboxed `Function` constructor (not `eval`)
- No access to global scope or DOM except `output` div
- D3 library is pre-loaded and injected
- No network requests allowed from sandbox

### Rendering Pipeline
1. D3 generates SVG/HTML in virtual DOM (`output` div)
2. Serialize to string
3. Create canvas with white background
4. Render SVG to canvas using `drawImage`
5. Convert canvas to PNG data URL
6. Load PNG into Konva Image object
7. Display on whiteboard canvas

## Tips & Best Practices

### Performance
- Keep data sets reasonable (< 1000 points for smooth interaction)
- Use D3 efficiently (don't recreate scales/axes unnecessarily)
- Complex visualizations may take a moment to render

### Debugging
- Use `log()` function to see values in browser console
- Check browser dev tools for execution errors
- Error messages appear in the toolbar

### Styling
- SVG uses default D3 styling
- You can add inline styles to SVG elements
- Background is always white

### Sharing
- Code blocks are saved in the whiteboard JSON
- Visualizations are saved as rendered images
- When loading, code blocks show their last state

## Common Patterns

### Responsive Charts
```javascript
const width = slider('Width', 200, 600, 400, 50);
const height = slider('Height', 200, 500, 300, 50);

const svg = d3.select(output)
  .append('svg')
  .attr('width', width)
  .attr('height', height);
```

### Color Picking
```javascript
const colorScheme = input('Color', '#3498db');
// Or use a dropdown by combining with logic
const theme = slider('Theme', 0, 2, 0, 1);
const colors = ['#e74c3c', '#3498db', '#2ecc71'];
const fillColor = colors[theme];
```

### Animation (Single Frame)
```javascript
const frame = slider('Frame', 0, 100, 0, 1);
const angle = (frame / 100) * Math.PI * 2;

// Draw animated position
svg.append('circle')
  .attr('cx', 200 + Math.cos(angle) * 100)
  .attr('cy', 150 + Math.sin(angle) * 100)
  .attr('r', 10);
```

## Troubleshooting

**"undefined is not a function"**
- Check that you're using correct D3 v7 API
- Some D3 modules may not be available

**Visualization not appearing**
- Make sure you're appending to `output` div
- Check that SVG has proper width/height
- Look for errors in toolbar

**Controls not updating**
- You must click **Run** after changing control values
- Auto-execution is disabled to prevent performance issues

**Blank output**
- Ensure your code generates valid SVG/HTML
- Check browser console for errors
- Try simpler code first to verify setup
