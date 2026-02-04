# Board API Test

Use this minimal code in a code block to test if Board API works:

```javascript
// MINIMAL TEST - Add a single shape in viewport
const viewport = board.getViewport();
console.log('Viewport:', viewport);

const viewLeft = -viewport.x / viewport.zoom;
const viewTop = -viewport.y / viewport.zoom;
const viewWidth = window.innerWidth / viewport.zoom;
const viewHeight = window.innerHeight / viewport.zoom;

console.log('View bounds:', { viewLeft, viewTop, viewWidth, viewHeight });

// Clear old shapes
const shapes = board.getShapes();
console.log('Existing shapes:', shapes.length);
shapes.forEach(s => board.deleteElement(s.id));

// Add ONE shape in center of viewport
const x = viewLeft + viewWidth / 2;
const y = viewTop + viewHeight / 2;

console.log('Adding shape at:', { x, y });

const id = board.addShape({
  type: 'circle',
  x: x,
  y: y,
  width: 100,
  height: 100,
  color: '#ff0000',
  strokeWidth: 4
});

console.log('Created shape ID:', id);

output.innerHTML = `<div>
  <div>Added red circle at (${Math.round(x)}, ${Math.round(y)})</div>
  <div>Shape ID: ${id}</div>
  <div>Check the main canvas (not this box)!</div>
</div>`;
```

## What should happen:
1. A large red circle should appear in the CENTER of your current viewport
2. It will be ON THE MAIN CANVAS, not in the visualization box
3. Console should show viewport info and shape details

## If it doesn't work:
1. Open browser console (F12)
2. Look for errors
3. Check if console.log messages appear
4. Report what you see
