# Architecture Overview

This document provides a high-level overview of the whiteboard's technical architecture.

## Stack

### Frontend
- **React 18** - UI framework with concurrent rendering
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **React-Konva** - Canvas rendering engine (wrapper for Konva.js)
- **Tailwind CSS** - Utility-first styling

### Canvas & Rendering
- **Konva.js** - High-performance 2D canvas library
- **Perfect Freehand** - Pressure-sensitive ink simulation
- **D3.js** - Data visualization in code blocks
- **KaTeX** - Math equation rendering
- **React Syntax Highlighter** - Code syntax highlighting

### Desktop
- **Tauri v2** - Rust-based desktop framework
- **Window Management** - Dual-window sync via localStorage

### Backend
- **Node.js + Express** - Minimal REST API for board persistence
- **File System** - JSON-based board storage

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser/Tauri                        │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                    React App                          │ │
│  │                                                       │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐│ │
│  │  │   Toolbar    │  │   Minimap    │  │    Frames   ││ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘│ │
│  │                                                       │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │         Whiteboard Component                    │ │ │
│  │  │  (React-Konva Stage)                            │ │ │
│  │  │                                                  │ │ │
│  │  │  ┌─────────────────────────────────────────┐   │ │ │
│  │  │  │   Objects Layer                         │   │ │ │
│  │  │  │   - Strokes (fountain pen, laser)       │   │ │ │
│  │  │  │   - Shapes (rect, circle, arrow)        │   │ │ │
│  │  │  │   - Text Objects                        │   │ │ │
│  │  │  │   - LaTeX Objects (KaTeX)               │   │ │ │
│  │  │  │   - Code Blocks (executable JS)         │   │ │ │
│  │  │  │   - D3 Visualizations (SVG→Canvas)      │   │ │ │
│  │  │  │   - Images (paste/upload)               │   │ │ │
│  │  │  └─────────────────────────────────────────┘   │ │ │
│  │  │                                                  │ │ │
│  │  │  ┌─────────────────────────────────────────┐   │ │ │
│  │  │  │   Spotlight Overlay (HTML)              │   │ │ │
│  │  │  └─────────────────────────────────────────┘   │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  │                                                       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Auto-save (localStorage)
                              │ Manual save (POST /api/boards)
                              ▼
                    ┌──────────────────┐
                    │   Node.js API    │
                    │   (Express)      │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   File System    │
                    │  (JSON boards)   │
                    └──────────────────┘
```

---

## Core Components

### 1. Whiteboard Component (`App.tsx`)

**Purpose**: Main canvas container and state management

**Responsibilities**:
- Canvas state (objects, viewport, history)
- Tool state (current tool, color, stroke width)
- Event handling (mouse/touch, keyboard)
- Object lifecycle (create, update, delete)
- Undo/redo history

**Key State**:
```typescript
const [objects, setObjects] = useState<WhiteboardObject[]>([]);
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
const [tool, setTool] = useState<Tool>('pen');
const [viewPos, setViewPos] = useState({ x: 0, y: 0 });
const [zoom, setZoom] = useState(1);
const [history, setHistory] = useState<HistoryEntry[]>([]);
```

### 2. Object Renderers

Each object type has its own React component:

#### StrokeObject (`StrokeObject.tsx`)
- Renders ink strokes using `perfect-freehand`
- Variable pressure simulation
- Fountain pen, highlighter, laser pointer variants
- Laser fading animation (3 second decay)

#### CodeBlockObject (`CodeBlockObject.tsx`)
- **Most complex component** (~1500 lines)
- CodeMirror editor with syntax highlighting
- JavaScript sandbox execution (`new Function`)
- Control widgets (sliders, buttons, etc.)
- D3.js visualization output
- Animation system (keyframe recording/playback)
- **Critical fixes applied** (timeout, execution lock, etc.)

#### D3VisualizationObject (`D3VisualizationObject.tsx`)
- Renders D3.js SVG output as Konva image
- SVG → Blob URL → Image → Konva.Image pipeline
- **Blob URL lifecycle management** (Fix 3)
- Animation player for programmatic animations
- Control panel for user interaction

#### LaTeXObject, TextObject, ShapeObject, etc.
- Simpler renderers for static content
- KaTeX rendering for math
- React-Konva primitives for shapes

### 3. Code Execution System

**Architecture**:

```
User Code (JavaScript)
       ↓
Timeout Guard Injection (sandboxTimeout.ts)
       ↓
Sandbox Creation (20+ APIs: d3, slider, button, etc.)
       ↓
new Function() Execution
       ↓
┌──────────────────┬──────────────────┐
│   Fast Path      │   Slow Path      │
│   (Animation)    │   (User Action)  │
├──────────────────┼──────────────────┤
│ Precompute       │ Full Execution   │
│ executeRender()  │ Regenerate       │
│ (< 5ms)          │ (100-500ms)      │
└──────────────────┴──────────────────┘
       ↓
Output (HTML/SVG/Controls/Animations)
       ↓
Create/Update D3VisualizationObject
```

**Sandbox APIs**:
- `d3` - Full D3.js library
- `slider`, `button`, `checkbox`, etc. - UI controls
- `animate()` - Programmatic animation creation
- `precompute()` - Expensive computation separation
- `render()` - Per-frame rendering callback
- `output` - DOM node for visualization
- `board` - Access to other board objects (read-only)

### 4. Animation System

**Architecture**:

```
Animation Recording (User):
  1. Click "Record" button
  2. Adjust control sliders
  3. Click "+ KF" to save keyframe
  4. Repeat steps 2-3
  5. Click "Stop" button

Keyframe Storage:
  {
    id: 'anim-123',
    duration: 5,
    fps: 30,
    loop: true,
    keyframes: [
      { frame: 0, controlValues: { Steps: 0 } },
      { frame: 60, controlValues: { Steps: 50 } },
      { frame: 150, controlValues: { Steps: 100 } }
    ]
  }

Animation Playback:
  1. AnimationPlayer starts RAF loop
  2. Interpolate between keyframes
  3. Call onExecute(controlValues, time)
  4. CodeBlock fast-path: executeRender(frameIndex)
  5. D3Visualization updates
```

**Components**:
- **AnimationPlayer** (`AnimationPlayer.tsx`) - RAF loop, interpolation
- **PrecomputeRenderEngine** (`PrecomputeRenderEngine.ts`) - Frame cache
- **FrameCache** (`FrameCache.ts`) - Interpolated data storage

### 5. Precompute/Render Engine

**Purpose**: Separate expensive computation from per-frame rendering

**Problem**:
```javascript
// Slow - runs 30 times per second
for (let step = 0; step < 100; step++) {
  const data = expensiveComputation(step); // 100ms!
  d3.select(output).append('circle').attr('r', data);
}
```

**Solution**:
```javascript
// Fast - runs ONCE
precompute(() => {
  const allData = [];
  for (let step = 0; step < 100; step++) {
    allData.push(expensiveComputation(step));
  }
  return allData;
});

// Fast - runs 30 times per second
render((frame, allData) => {
  const data = allData[frame];
  d3.select(output).selectAll('circle').attr('r', data);
});
```

**Implementation**:
- `precompute(fn)` - Executes once, caches result
- `render(fn)` - Called per frame with cached data
- `FrameCache` - Stores precomputed data with interpolation
- Execution lock prevents race conditions (Fix 2)

---

## Data Flow

### 1. Drawing Flow

```
User Mouse Event
       ↓
Whiteboard.tsx (event handler)
       ↓
Create StrokeObject (perfect-freehand)
       ↓
Add to objects[] state
       ↓
Re-render (React)
       ↓
StrokeObject.tsx renders Konva.Line
       ↓
Konva draws to canvas
```

### 2. Code Execution Flow

```
User Clicks "Run" Button
       ↓
CodeBlockObject.tsx (executeCode)
       ↓
Execution Queue (serialize slow-path)
       ↓
Timeout Guard Injection
       ↓
Create Sandbox (d3, controls, etc.)
       ↓
new Function() execution
       ↓
Extract output (HTML/SVG)
       ↓
Call onCreateVisualization()
       ↓
App.tsx creates D3VisualizationObject
       ↓
D3VisualizationObject renders SVG as Konva.Image
```

### 3. Animation Playback Flow

```
User Clicks "Play" Button
       ↓
AnimationPlayer starts RAF loop
       ↓
Interpolate keyframes at currentTime
       ↓
Call onExecute(interpolatedValues, time)
       ↓
CodeBlock.executeCode() with executionContext
       ↓
Fast-path: precomputeEngine.executeRender()
       ↓
Call renderCallback(frame, cachedData, values)
       ↓
Update D3 visualization DOM
       ↓
D3VisualizationObject detects change
       ↓
Re-render Konva.Image
       ↓
RAF loop continues
```

---

## State Management

### App-Level State (`App.tsx`)

```typescript
// Persisted state (auto-saved to localStorage)
const [fullState, setFullState] = useState({
  objects: [],           // All board objects
  frames: [],           // Bookmarked viewports
  animations: [],       // Global animations (deprecated)
  background: 'grid',   // Background style
  customColors: []      // User's color palette
});

// UI state (not persisted)
const [tool, setTool] = useState('pen');
const [color, setColor] = useState('#000000');
const [selectedIds, setSelectedIds] = useState(new Set());
const [isSpotlightActive, setIsSpotlightActive] = useState(false);

// Viewport state (persisted in frames, but not in fullState)
const [viewPos, setViewPos] = useState({ x: 0, y: 0 });
const [zoom, setZoom] = useState(1);

// History (undo/redo)
const [history, setHistory] = useState([]);
const [historyIndex, setHistoryIndex] = useState(0);
```

### Object-Level State

Each object type has its own state structure:

```typescript
type CodeBlockObj = {
  id: string;
  type: 'codeblock';
  x: number;
  y: number;
  width: number;
  height: number;
  code: string;
  language: string;
  controls: ControlWidget[];
  isFolded: boolean;
  appendMode: boolean;
  isRecording: boolean;
  outputId?: string;
  animationId?: string;
  executionContext?: {
    vizId: string;
    controlValues: Record<string, number>;
    animationTime?: number;
  };
  lastExecuted?: number;
  error?: string;
};
```

### Immutability Pattern

All state updates use immutable patterns:

```typescript
// ADD object
setObjects(prev => [...prev, newObject]);

// UPDATE object
setObjects(prev => prev.map(obj =>
  obj.id === id ? { ...obj, ...updates } : obj
));

// DELETE object
setObjects(prev => prev.filter(obj => obj.id !== id));

// UPDATE with batching
setObjects(prev => {
  const updated = [...prev];
  // Multiple modifications
  return updated;
});
```

---

## Performance Optimizations

### 1. React Optimizations

- **Memoization**: `React.memo` for expensive renderers
- **useMemo/useCallback**: Prevent unnecessary re-renders
- **Key props**: Stable keys for object lists
- **Lazy loading**: Code-split heavy components

### 2. Canvas Optimizations

- **Layer caching**: Konva layer caching for static objects
- **Hit detection**: Custom hit regions for complex objects
- **Viewport culling**: Only render visible objects (future)

### 3. Execution Optimizations

- **Precompute/Render separation**: Run expensive work once
- **Frame caching**: Cache interpolated data
- **Execution queue**: Serialize slow-path to prevent race conditions
- **Fast-path**: Direct render for animation frames (<5ms)

### 4. Memory Optimizations

- **Blob URL revocation**: Prevent memory leaks (Fix 3)
- **Lazy stroke simplification**: Reduce point count for old strokes
- **History pruning**: Limit undo stack size

---

## Desktop Architecture (Tauri)

### Dual-Window System

```
┌──────────────────────┐       ┌──────────────────────┐
│  Control Window      │       │ Presentation Window  │
│  (Full UI)           │       │ (Canvas Only)        │
│                      │       │                      │
│  ┌────────────────┐  │       │  ┌────────────────┐  │
│  │ Toolbar        │  │       │  │                │  │
│  ├────────────────┤  │       │  │                │  │
│  │                │  │  Sync │  │    Canvas      │  │
│  │    Canvas      │◄─┼───────┼─►│                │  │
│  │                │  │       │  │                │  │
│  ├────────────────┤  │       │  │                │  │
│  │ Minimap        │  │       │  └────────────────┘  │
│  └────────────────┘  │       │                      │
└──────────────────────┘       └──────────────────────┘
         │                                │
         │                                │
         └────────────┬───────────────────┘
                      │
                      ▼
              localStorage['whiteboard-sync']
              (50ms debounced writes)
```

### Synchronization

**File**: `client/src/hooks/useWindowSync.ts`

```typescript
// Control window (writes)
useEffect(() => {
  if (!isControlWindow) return;

  const timer = setTimeout(() => {
    localStorage.setItem('whiteboard-sync', JSON.stringify(fullState));
  }, 50); // 50ms debounce

  return () => clearTimeout(timer);
}, [fullState]);

// Presentation window (reads)
useEffect(() => {
  if (!isPresentationWindow) return;

  const handleStorage = (e: StorageEvent) => {
    if (e.key === 'whiteboard-sync' && e.newValue) {
      setFullState(JSON.parse(e.newValue));
    }
  };

  window.addEventListener('storage', handleStorage);
  return () => window.removeEventListener('storage', handleStorage);
}, []);
```

**Latency**: <100ms (target), typically <50ms

---

## Security Considerations

### Code Execution Sandbox

**Threats**:
- Infinite loops (Fix 1: timeout protection)
- Browser API access (window, document, fetch, etc.)
- localStorage manipulation
- XSS attacks

**Mitigations**:
- Timeout guards in loops (5 second max)
- Limited sandbox APIs (no window, document, fetch)
- Content Security Policy (future)
- User code runs in same origin (can't be fully sandboxed)

**Known Limitations**:
- Cannot use Web Workers (sandbox needs DOM access)
- User code can still access `window` via closure
- No true isolation without iframe (degrades UX)

### XSS Protection

- **D3 output**: Sanitized via DOMPurify before rendering
- **LaTeX**: KaTeX has built-in XSS protection
- **User text**: React auto-escapes by default

---

## Testing Strategy

See [Testing Guide](./testing.md) for comprehensive test documentation.

**Test Pyramid**:

```
                /\
               /  \
              /E2E \            (Future)
             /      \
            /────────\
           / Integr.  \         (44 tests - CodeBlockObject)
          /            \
         /──────────────\
        /   Unit Tests   \      (107 tests - utils, engine)
       /                  \
      /────────────────────\
```

**Current Coverage**: 148 tests passing, 3 skipped

---

## Deployment

### Web Deployment

```bash
cd client
npm run build
# Output: dist/ folder

# Deploy to GitHub Pages
# Vite base: '/whiteboard/'
# Deployed to: https://theghoul21.github.io/whiteboard/
```

### Desktop Deployment

```bash
cd client
npm run tauri:build

# Output:
# - macOS: client/src-tauri/target/release/bundle/dmg/
# - Windows: client/src-tauri/target/release/bundle/msi/
# - Linux: client/src-tauri/target/release/bundle/deb/
```

### CI/CD

GitHub Actions workflow (`.github/workflows/release.yml`):
- Triggers on version tags (`v*.*.*`)
- Builds for macOS, Windows, Linux
- Creates GitHub Release with installers

---

## Future Architecture Improvements

### Priority 1: Performance
- [ ] Viewport culling (only render visible objects)
- [ ] Web Worker execution (requires DOM polyfill)
- [ ] Canvas layer optimization
- [ ] Lazy loading for large boards

### Priority 2: Scalability
- [ ] Backend persistence (PostgreSQL, S3)
- [ ] Real-time collaboration (WebSockets)
- [ ] Version control (Git-like diffing)
- [ ] Cloud sync

### Priority 3: Security
- [ ] Content Security Policy
- [ ] Iframe sandbox isolation
- [ ] Rate limiting for code execution
- [ ] User authentication

---

## References

- [Critical Fixes](./critical-fixes.md) - Details on the 4 critical stability fixes
- [Testing Guide](./testing.md) - Comprehensive test documentation
- [Code Blocks](../features/code-blocks.md) - User guide for code execution
- [Animations](../features/animations.md) - User guide for animation system
