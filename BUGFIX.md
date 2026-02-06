# Bug Fix: "Cannot destructure property" Error

## Problem
When using the gradient descent example:
1. Add code block, paste example code
2. Hit run → white box appears
3. Press controls, hit refresh → Error: "Cannot destructure property 's..."

## Root Cause
The error occurred because the `render` function tried to destructure `frameData` before checking if it exists:
```javascript
const { step, weight, loss, gradient, trajectory } = frameData;
```

When `frameData` was undefined/null, JavaScript threw a destructuring error.

## Fixes Applied

### 1. PrecomputeRenderEngine.ts
**Change**: Always call render function, even when frame data is missing
```typescript
// Before: Returned false without calling render
if (frameData === undefined) {
  return false;
}

// After: Calls render with null so user can handle it
if (frameData === undefined) {
  this.renderFn(frameIndex, null, this.currentControlValues);
  return true;
}
```

### 2. CodeBlockObject.tsx
**Change**: Reset precompute/render engine on full re-execution
```typescript
// Reset precompute/render engine for full re-execution
if (precomputeRenderEngineRef.current) {
  precomputeRenderEngineRef.current.clear();
  precomputeRenderEngineRef.current = null;
}
```

This prevents stale state issues when refreshing visualizations.

### 3. Example Code
**Added**: Safety check for missing frame data
```javascript
render((frameIndex, frameData, controlValues) => {
  // Safety check: ensure frameData exists
  if (!frameData) {
    d3.select(output).append('div')
      .style('padding', '20px')
      .style('color', '#666')
      .text('Initializing... (Run the code block first)');
    return;
  }
  
  const { step, weight, loss, gradient, trajectory } = frameData;
  // ... rest of render code
});
```

## Why White Box Appeared
The white box appeared because:
1. First run: Precompute ran successfully but render couldn't find frame 0 (race condition)
2. Output div was empty (white background shows through)
3. After fix: Render is always called, shows "Initializing..." message if no data

## Test Results
All 67 tests passing after fixes:
- Updated test for new behavior (render called with null)
- Fixed flaky performance test threshold

## Usage After Fix
The example should now work as follows:
1. Add code block, paste example code
2. Hit run → Shows "Initializing..." briefly, then renders frame 0
3. Animation controls appear (if you add keyframes)
4. Can tweak controls in visualization and refresh without errors

## Debugging
Added console logging to help debug:
```javascript
console.log('[CodeBlock] Controls captured:', capturedControlValues);
console.log('[CodeBlock] Precompute success:', success);
console.log('[CodeBlock] Frame cache size:', precomputeRenderEngineRef.current.getFrameCache().size);
```

Check browser console to see execution flow.
