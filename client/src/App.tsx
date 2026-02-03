import { useState, useRef, useEffect, useCallback } from 'react';
import { Whiteboard } from './components/Whiteboard';
import { Toolbar } from './components/Toolbar';
import { FrameManager } from './components/FrameManager';
import { Minimap } from './components/Minimap';
import { ShortcutsOverlay } from './components/ShortcutsOverlay';
import { ExportDialog, type ExportMode } from './components/ExportDialog';
import type { Stroke, ImageObj, TextObj, ShapeObj, ToolType, BackgroundType, LatexObj, CodeObj, NoteObj, FrameObj, CodeBlockObj, D3VisualizationObj } from './types';
import Konva from 'konva';
import jsPDF from 'jspdf';
import useHistory from './hooks/useHistory';

interface AppState {
   strokes: Stroke[];
   images: ImageObj[];
   texts: TextObj[];
   shapes: ShapeObj[];
   latex: LatexObj[];
   codes: CodeObj[];
   notes: NoteObj[];
   frames: FrameObj[];
   codeblocks: CodeBlockObj[];
   d3visualizations: D3VisualizationObj[];
}

const initialState: AppState = {
   strokes: [],
   images: [],
   texts: [],
   shapes: [],
   latex: [],
   codes: [],
   notes: [],
   frames: [],
   codeblocks: [],
   d3visualizations: []
};

const DEFAULT_SIZES: Record<ToolType, number> = {
   'pen': 1,
   'smooth-pen': 3,
   'highlighter': 20,
   'eraser': 20,
   'laser': 10,
   'pointer': 100,
   'text': 20,
   'rect': 5,
   'circle': 5,
   'arrow': 5,
   'select': 0,
   'hand': 0
};

function App() {
  const [tool, setTool] = useState<ToolType>('pen');
  const previousToolRef = useRef<ToolType>('pen');
  
  const [color, setColor] = useState('#000000');
  const [toolSizes, setToolSizes] = useState<Record<ToolType, number>>(DEFAULT_SIZES);
  
  const size = toolSizes[tool] || 5;
  const setSize = (newSize: number) => {
     setToolSizes(prev => ({ ...prev, [tool]: newSize }));
  };

  const [background, setBackground] = useState<BackgroundType>('white');
  const [zoom, setZoom] = useState(1);
  const [viewPos, setViewPos] = useState({ x: 0, y: 0 });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [presentationMode, setPresentationMode] = useState(false);
  const [isSpacebarPressed, setIsSpacebarPressed] = useState(false);
  const [showAutoSaveNotification, setShowAutoSaveNotification] = useState(false);
  const [a4GridVisible, setA4GridVisible] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Internal Clipboard
  const clipboard = useRef<Partial<AppState> | null>(null);
  const hasUnsavedChanges = useRef(false);
  
  const { state, setState, undo, redo, canUndo, canRedo } = useHistory<AppState>(initialState);
  
  const stageRef = useRef<Konva.Stage | null>(null);

  const handleUpdate = useCallback((newState: Partial<AppState>, overwrite = false) => {
     console.log('[App] handleUpdate called with:', {
       keys: Object.keys(newState),
       codeblocks: newState.codeblocks?.length,
       d3visualizations: newState.d3visualizations?.length,
       overwrite,
       caller: new Error().stack?.split('\n')[2]?.trim() // Track who called this
     });

     // GUARD: Ignore empty updates that would corrupt state
     if (Object.keys(newState).length === 0) {
       console.warn('[App] BLOCKED empty update - ignoring');
       return;
     }

     setState(prev => {
       const next = { ...prev, ...newState };
       console.log('[App] State after update:', {
         codeblocks: next.codeblocks?.length,
         d3visualizations: next.d3visualizations?.length
       });
       return next;
     }, overwrite);
     hasUnsavedChanges.current = true;
  }, [setState]);

  // Auto-save to localStorage
  const autoSave = useCallback(() => {
    if (!state) return;
    try {
      const dataToSave = {
        ...state,
        background,
        zoom,
        viewPos,
        timestamp: Date.now()
      };
      localStorage.setItem('whiteboard-autosave', JSON.stringify(dataToSave));
      hasUnsavedChanges.current = false;
      setShowAutoSaveNotification(true);
      setTimeout(() => setShowAutoSaveNotification(false), 2000);
    } catch (e) {
      console.error('Auto-save failed:', e);
    }
  }, [state, background, zoom, viewPos]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('whiteboard-autosave');
      if (saved) {
        const data = JSON.parse(saved);
        const { strokes, images, texts, shapes, latex, codes, notes, frames, codeblocks, d3visualizations, background: savedBg, zoom: savedZoom, viewPos: savedViewPos } = data;
        setState({
          strokes: strokes || [],
          images: images || [],
          texts: texts || [],
          shapes: shapes || [],
          latex: latex || [],
          codes: codes || [],
          notes: notes || [],
          frames: frames || [],
          codeblocks: codeblocks || [],
          d3visualizations: d3visualizations || []
        }, true);
        if (savedBg) setBackground(savedBg);
        if (savedZoom) setZoom(savedZoom);
        if (savedViewPos) setViewPos(savedViewPos);
        hasUnsavedChanges.current = false;
      }
    } catch (e) {
      console.error('Failed to load auto-save:', e);
    }
  }, []);

  // Auto-save interval (every 10 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasUnsavedChanges.current) {
        autoSave();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [autoSave]);

  // Warn on close if unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleColorChange = (newColor: string) => {
     setColor(newColor);
     if (selectedIds.length > 0 && state) {
        handleUpdate({
           strokes: state.strokes.map(s => selectedIds.includes(s.id) ? { ...s, color: newColor } : s),
           texts: state.texts.map(t => selectedIds.includes(t.id) ? { ...t, color: newColor } : t),
           latex: state.latex.map(l => selectedIds.includes(l.id) ? { ...l, color: newColor } : l),
           shapes: state.shapes.map(s => selectedIds.includes(s.id) ? { ...s, color: newColor } : s),
           notes: state.notes.map(n => selectedIds.includes(n.id) ? { ...n, color: newColor } : n),
        });
     }
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear the whiteboard?')) {
      setState(initialState);
    }
  };

  const handleCreateCodeBlock = () => {
    if (!state) return;

    const newCodeBlock: CodeBlockObj = {
      id: Date.now().toString(),
      type: 'codeblock',
      code: `// Example: Interactive Linear Regression

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
  .attr('transform', \`translate(\${margin.left},\${margin.top})\`);

// Scales
const xScale = d3.scaleLinear().domain([0, 10]).range([0, width]);
const yScale = d3.scaleLinear().domain([-20, 20]).range([height, 0]);

// Axes
svg.append('g').attr('transform', \`translate(0,\${height})\`).call(d3.axisBottom(xScale));
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
  .attr('d', line);`,
      x: (-viewPos.x + window.innerWidth / 2) / zoom - 250,
      y: (-viewPos.y + window.innerHeight / 2) / zoom - 200,
      width: 500,
      height: 400,
      fontSize: 14,
      controls: []
    };

    handleUpdate({ codeblocks: [...state.codeblocks, newCodeBlock] });
    setSelectedIds([newCodeBlock.id]);
    setTool('select');
  };

  const copySelection = () => {
     if (!state || selectedIds.length === 0) return;

     const selection: Partial<AppState> = {
        strokes: state.strokes.filter(s => selectedIds.includes(s.id)),
        images: state.images.filter(i => selectedIds.includes(i.id)),
        texts: state.texts.filter(t => selectedIds.includes(t.id)),
        shapes: state.shapes.filter(s => selectedIds.includes(s.id)),
        latex: state.latex.filter(l => selectedIds.includes(l.id)),
        codes: state.codes.filter(c => selectedIds.includes(c.id)),
        notes: state.notes.filter(n => selectedIds.includes(n.id)),
        codeblocks: state.codeblocks.filter(cb => selectedIds.includes(cb.id)),
        d3visualizations: state.d3visualizations.filter(v => selectedIds.includes(v.id)),
     };
     clipboard.current = selection;
  };

  const deleteSelection = () => {
     if (!state || selectedIds.length === 0) return;

     // When deleting a CodeBlock, also delete its linked visualization
     const codeBlocksToDelete = state.codeblocks.filter(cb => selectedIds.includes(cb.id));
     const linkedVizIds = codeBlocksToDelete.map(cb => cb.outputId).filter(Boolean) as string[];

     // When deleting a Visualization, clear outputId from source CodeBlock
     const vizsToDelete = state.d3visualizations.filter(v => selectedIds.includes(v.id));
     const sourceCodeBlockIds = vizsToDelete.map(v => v.sourceCodeBlockId);

     handleUpdate({
        strokes: state.strokes.filter(s => !selectedIds.includes(s.id)),
        images: state.images.filter(i => !selectedIds.includes(i.id)),
        texts: state.texts.filter(t => !selectedIds.includes(t.id)),
        shapes: state.shapes.filter(s => !selectedIds.includes(s.id)),
        latex: state.latex.filter(l => !selectedIds.includes(l.id)),
        codes: state.codes.filter(c => !selectedIds.includes(c.id)),
        notes: state.notes.filter(n => !selectedIds.includes(n.id)),
        codeblocks: state.codeblocks
           .filter(cb => !selectedIds.includes(cb.id))
           .map(cb => sourceCodeBlockIds.includes(cb.id) ? { ...cb, outputId: undefined } : cb),
        d3visualizations: state.d3visualizations.filter(v => !selectedIds.includes(v.id) && !linkedVizIds.includes(v.id)),
     });
     setSelectedIds([]);
  };

  const pasteSelection = () => {
     if (!state || !clipboard.current) return;
     
     const data = clipboard.current;
     const offset = 20; // Pixel offset for pasted items
     
     const newIds: string[] = [];

     const newStrokes = (data.strokes || []).map(s => {
        const id = Date.now() + Math.random().toString();
        newIds.push(id);
        const newPoints = s.points.map((p, i) => p + (i % 2 === 0 ? offset : offset)); // Add offset to x and y
        return { ...s, id, points: newPoints };
     });

     const newImages = (data.images || []).map(img => {
        const id = Date.now() + Math.random().toString();
        newIds.push(id);
        return { ...img, id, x: img.x + offset, y: img.y + offset };
     });

     const newTexts = (data.texts || []).map(t => {
        const id = Date.now() + Math.random().toString();
        newIds.push(id);
        return { ...t, id, x: t.x + offset, y: t.y + offset };
     });

     const newShapes = (data.shapes || []).map(s => {
        const id = Date.now() + Math.random().toString();
        newIds.push(id);
        return { ...s, id, x: s.x + offset, y: s.y + offset };
     });

     const newLatex = (data.latex || []).map(l => {
        const id = Date.now() + Math.random().toString();
        newIds.push(id);
        return { ...l, id, x: l.x + offset, y: l.y + offset };
     });

     const newCodes = (data.codes || []).map(c => {
        const id = Date.now() + Math.random().toString();
        newIds.push(id);
        return { ...c, id, x: c.x + offset, y: c.y + offset };
     });

     const newNotes = (data.notes || []).map(n => {
        const id = Date.now() + Math.random().toString();
        newIds.push(id);
        return { ...n, id, x: n.x + offset, y: n.y + offset };
     });

     // Map old IDs to new IDs for codeblocks and visualizations
     const idMap = new Map<string, string>();

     const newCodeBlocks = (data.codeblocks || []).map(cb => {
        const id = Date.now() + Math.random().toString();
        newIds.push(id);
        idMap.set(cb.id, id);
        return { ...cb, id, x: cb.x + offset, y: cb.y + offset, outputId: undefined };
     });

     const newD3Visualizations = (data.d3visualizations || []).map(v => {
        const id = Date.now() + Math.random().toString();
        newIds.push(id);
        const newSourceId = idMap.get(v.sourceCodeBlockId);
        return { ...v, id, x: v.x + offset, y: v.y + offset, sourceCodeBlockId: newSourceId || v.sourceCodeBlockId };
     });

     // Update outputId references in codeblocks
     const vizIdMap = new Map<string, string>();
     (data.d3visualizations || []).forEach((v, i) => {
        vizIdMap.set(v.id, newD3Visualizations[i].id);
     });

     const finalCodeBlocks = newCodeBlocks.map(cb => {
        const originalCb = (data.codeblocks || []).find(original => idMap.get(original.id) === cb.id);
        if (originalCb?.outputId && vizIdMap.has(originalCb.outputId)) {
           return { ...cb, outputId: vizIdMap.get(originalCb.outputId) };
        }
        return cb;
     });

     handleUpdate({
        strokes: [...state.strokes, ...newStrokes],
        images: [...state.images, ...newImages],
        texts: [...state.texts, ...newTexts],
        shapes: [...state.shapes, ...newShapes],
        latex: [...state.latex, ...newLatex],
        codes: [...state.codes, ...newCodes],
        notes: [...state.notes, ...newNotes],
        codeblocks: [...state.codeblocks, ...finalCodeBlocks],
        d3visualizations: [...state.d3visualizations, ...newD3Visualizations],
     });
     
     setSelectedIds(newIds);
     setTool('select');
  };

  useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
         const tagName = document.activeElement?.tagName.toLowerCase();
         const isContentEditable = document.activeElement?.getAttribute('contenteditable') === 'true';
         if (tagName === 'input' || tagName === 'textarea' || isContentEditable) return;

        // Close overlays with Escape
        if (e.key === 'Escape') {
          if (showShortcuts) {
            setShowShortcuts(false);
            return;
          }
          if (showExportDialog) {
            setShowExportDialog(false);
            return;
          }
        }

        // Undo/Redo
        if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
           if (e.shiftKey) redo();
           else undo();
           e.preventDefault();
           return;
        } 
        if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
           redo();
           e.preventDefault();
           return;
        }

        // Copy
        if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
           e.preventDefault();
           copySelection();
           return;
        }

        // Cut
        if ((e.metaKey || e.ctrlKey) && e.key === 'x') {
           e.preventDefault();
           copySelection();
           deleteSelection();
           return;
        }

        // Paste (Intercept standard paste)
        // Note: Standard paste event is also handled by Whiteboard for external text/images.
        // We need to coordinate.
        // If we have internal clipboard data, we prefer that?
        // Or we let the 'paste' event handler in Whiteboard decide?
        // The 'paste' event in Whiteboard handles e.clipboardData.
        // If we press Cmd+V here, it might trigger twice if we don't preventDefault.
        // But Whiteboard uses window 'paste' event listener, which this keydown doesn't block unless we stop propagation?
        // Actually, keydown 'v' is NOT the 'paste' event. 'paste' event fires separately.
        // So implementing Cmd+V here works for internal, but we should clear system clipboard?
        // Better: Hook into the 'paste' event in Whiteboard to handle internal clipboard too?
        // No, let's keep internal separate for now via shortcut.
        // BUT 'paste' event fires on Cmd+V.
        // If I implement Cmd+V here, I should use it.
        // However, user expects standard paste.
        // Let's implement Cmd+V here for internal items.
        // To avoid conflicts, we can check if clipboard.current is populated.
        if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
           // We let the 'paste' event handle external data.
           // But for internal objects, we want to paste them.
           // If we have internal items, we can paste them.
           if (clipboard.current) {
              e.preventDefault(); // Stop 'paste' event from firing for external
              pasteSelection();
           }
           return;
        }

        // Delete
        if (e.key === 'Delete' || e.key === 'Backspace') {
           deleteSelection();
           return;
        } 
        
        // Select All
        if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
           e.preventDefault();
           if (!state) return;
           setTool('select');
           const allIds = [
              ...state.strokes.map(s => s.id),
              ...state.images.map(i => i.id),
              ...state.texts.map(t => t.id),
              ...state.shapes.map(s => s.id),
              ...state.latex.map(l => l.id),
              ...state.codes.map(c => c.id),
              ...state.notes.map(n => n.id),
              ...state.codeblocks.map(cb => cb.id),
              ...state.d3visualizations.map(v => v.id)
           ];
           setSelectedIds(allIds);
           return;
        }

        // Presentation Mode Toggle
        if (e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          setPresentationMode(prev => !prev);
          return;
        }

        // A4 Grid Toggle
        if (e.key === 'g' || e.key === 'G') {
          e.preventDefault();
          setA4GridVisible(prev => !prev);
          return;
        }

         // Shortcuts Overlay Toggle
         if (e.key === '?') {
           e.preventDefault();
           setShowShortcuts(prev => !prev);
           return;
         }

         // Clear laser strokes immediately
         if (e.key === 'Escape') {
            const hasLaser = state.strokes.some(s => s.tool === 'laser');
            if (hasLaser) {
               e.preventDefault();
               const nonLaserStrokes = state.strokes.filter(s => s.tool !== 'laser');
               handleUpdate({ strokes: nonLaserStrokes }, true);
            }
            return;
         }

         // Tool Hotkeys - prevent tool switching during spacebar pan
        if (isSpacebarPressed) return;

        // Number keys for primary tools
        if (e.key === '1') { e.preventDefault(); setTool('select'); return; }
        if (e.key === '2') { e.preventDefault(); setTool('pen'); return; }
        if (e.key === '3') { e.preventDefault(); setTool('highlighter'); return; }
        if (e.key === '4') { e.preventDefault(); setTool('laser'); return; }
        if (e.key === '5') { e.preventDefault(); setTool('pointer'); return; }

        // Letter keys for secondary tools
        if (e.key === 'e' || e.key === 'E') { e.preventDefault(); setTool('eraser'); return; }
        if (e.key === 'h' || e.key === 'H') { e.preventDefault(); setTool('hand'); return; }
        if (e.key === 't' || e.key === 'T') { e.preventDefault(); setTool('text'); return; }

        // Spacebar Pan
        if (e.code === 'Space' && !e.repeat) {
           e.preventDefault();
           setIsSpacebarPressed(true); // Track spacebar state
           setTool(current => {
              if (current !== 'hand') {
                 previousToolRef.current = current;
                 return 'hand';
              }
              return current;
           });
        }
     };

     const handleKeyUp = (e: KeyboardEvent) => {
        if (e.code === 'Space') {
           setIsSpacebarPressed(false); // Clear spacebar state
           setTool(current => {
              if (current === 'hand') {
                 return previousToolRef.current;
              }
              return current;
           });
        }
     };
     
     window.addEventListener('keydown', handleKeyDown);
     window.addEventListener('keyup', handleKeyUp);
     return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
     };
  }, [state, selectedIds, undo, redo, handleUpdate]); // Dependencies updated

  const handleSave = async () => {
    if (!state) return;
    const data = {
      ...state,
      background,
      name: `whiteboard-${Date.now()}`
    };

    try {
      const response = await fetch('http://localhost:3000/api/whiteboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        alert('Saved successfully!');
      } else {
        alert('Failed to save.');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving. Is the server running?');
    }
  };

  const exportFullCanvas = async () => {
    if (!stageRef.current || !state) return;
    const stage = stageRef.current;
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const hasItems = state.strokes.length + state.images.length + state.texts.length + state.shapes.length + state.latex.length + state.codes.length + state.notes.length + state.codeblocks.length + state.d3visualizations.length > 0;

    if (!hasItems) {
       alert("Nothing to export");
       return;
    }

    state.strokes.forEach(s => {
       if (s.tool === 'laser') return;
       for(let i=0; i<s.points.length; i+=2) {
          const x = s.points[i];
          const y = s.points[i+1];
          minX = Math.min(minX, x - s.size/2);
          maxX = Math.max(maxX, x + s.size/2);
          minY = Math.min(minY, y - s.size/2);
          maxY = Math.max(maxY, y + s.size/2);
       }
    });

    state.images.forEach(img => {
       minX = Math.min(minX, img.x);
       minY = Math.min(minY, img.y);
       maxX = Math.max(maxX, img.x + img.width);
       maxY = Math.max(maxY, img.y + img.height);
    });
    
    state.texts.forEach(t => {
       minX = Math.min(minX, t.x);
       minY = Math.min(minY, t.y);
       const estimatedW = t.text.length * (t.fontSize * 0.6); 
       const estimatedH = t.fontSize * 1.2;
       maxX = Math.max(maxX, t.x + estimatedW); 
       maxY = Math.max(maxY, t.y + estimatedH);
    });
    
    [...state.latex, ...state.codes, ...state.notes, ...state.codeblocks, ...state.d3visualizations].forEach(obj => {
       const w = 'width' in obj ? obj.width : 200;
       const h = 'height' in obj ? obj.height : 100;
       minX = Math.min(minX, obj.x);
       minY = Math.min(minY, obj.y);
       maxX = Math.max(maxX, obj.x + w);
       maxY = Math.max(maxY, obj.y + h);
    });
    
    state.shapes.forEach(s => {
       if (s.type === 'circle') {
          const r = Math.abs((s.width || 10) / 2);
          minX = Math.min(minX, s.x - r - s.strokeWidth/2);
          maxX = Math.max(maxX, s.x + r + s.strokeWidth/2);
          minY = Math.min(minY, s.y - r - s.strokeWidth/2);
          maxY = Math.max(maxY, s.y + r + s.strokeWidth/2);
       } else if (s.type === 'arrow' && s.points) {
          for(let i=0; i<s.points.length; i+=2) {
             minX = Math.min(minX, s.x + s.points[i] - s.strokeWidth);
             maxX = Math.max(maxX, s.x + s.points[i] + s.strokeWidth);
             minY = Math.min(minY, s.y + s.points[i+1] - s.strokeWidth);
             maxY = Math.max(maxY, s.y + s.points[i+1] + s.strokeWidth);
          }
       } else {
          minX = Math.min(minX, s.x - s.strokeWidth/2);
          minY = Math.min(minY, s.y - s.strokeWidth/2);
          if (s.width) maxX = Math.max(maxX, s.x + s.width + s.strokeWidth/2);
          if (s.height) maxY = Math.max(maxY, s.y + s.height + s.strokeWidth/2);
       }
    });
    
    const padding = 50;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;
    
    const width = maxX - minX;
    const height = maxY - minY;

    const oldScale = stage.scale();
    const oldPos = stage.position();
    
    stage.scale({x: 1, y: 1});
    stage.position({x: -minX, y: -minY});
    stage.batchDraw();
    
    await new Promise(r => setTimeout(r, 10));

    const dataUrl = stage.toDataURL({
      x: 0,
      y: 0,
      width: width,
      height: height,
      pixelRatio: 2,
      mimeType: 'image/jpeg',
      quality: 0.9
    });

    stage.scale(oldScale);
    stage.position(oldPos);
    stage.batchDraw();

    const pdf = new jsPDF({
      orientation: width > height ? 'l' : 'p',
      unit: 'px',
      format: [width, height]
    });

    pdf.addImage(dataUrl, 'JPEG', 0, 0, width, height);
    pdf.save('whiteboard.pdf');
  };

  const exportA4Pages = async () => {
    if (!stageRef.current || !state) return;
    const stage = stageRef.current;

    const A4_WIDTH = 794;
    const A4_HEIGHT = 1123;

    // Calculate content bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const hasItems = state.strokes.length + state.images.length + state.texts.length + state.shapes.length + state.latex.length + state.codes.length + state.notes.length + state.codeblocks.length + state.d3visualizations.length > 0;

    if (!hasItems) {
       alert("Nothing to export");
       return;
    }

    // Calculate bounds (same logic as exportFullCanvas)
    state.strokes.forEach(s => {
       if (s.tool === 'laser') return;
       for(let i=0; i<s.points.length; i+=2) {
          const x = s.points[i];
          const y = s.points[i+1];
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
       }
    });
    state.images.forEach(img => {
       minX = Math.min(minX, img.x);
       minY = Math.min(minY, img.y);
       maxX = Math.max(maxX, img.x + img.width);
       maxY = Math.max(maxY, img.y + img.height);
    });
    state.texts.forEach(t => {
       minX = Math.min(minX, t.x);
       minY = Math.min(minY, t.y);
       maxX = Math.max(maxX, t.x + t.text.length * (t.fontSize * 0.6));
       maxY = Math.max(maxY, t.y + t.fontSize * 1.2);
    });
    [...state.latex, ...state.codes, ...state.notes, ...state.codeblocks, ...state.d3visualizations].forEach(obj => {
       const w = 'width' in obj ? obj.width : 200;
       const h = 'height' in obj ? obj.height : 100;
       minX = Math.min(minX, obj.x);
       minY = Math.min(minY, obj.y);
       maxX = Math.max(maxX, obj.x + w);
       maxY = Math.max(maxY, obj.y + h);
    });
    state.shapes.forEach(s => {
       minX = Math.min(minX, s.x);
       minY = Math.min(minY, s.y);
       maxX = Math.max(maxX, s.x + (s.width || 50));
       maxY = Math.max(maxY, s.y + (s.height || 50));
    });

    // Snap to A4 grid
    const startCol = Math.floor(minX / A4_WIDTH);
    const endCol = Math.ceil(maxX / A4_WIDTH);
    const startRow = Math.floor(minY / A4_HEIGHT);
    const endRow = Math.ceil(maxY / A4_HEIGHT);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [A4_WIDTH, A4_HEIGHT]
    });

    const oldScale = stage.scale();
    const oldPos = stage.position();
    let firstPage = true;

    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        const pageX = col * A4_WIDTH;
        const pageY = row * A4_HEIGHT;

        stage.scale({x: 1, y: 1});
        stage.position({x: -pageX, y: -pageY});
        stage.batchDraw();
        await new Promise(r => setTimeout(r, 10));

        const dataUrl = stage.toDataURL({
          x: 0,
          y: 0,
          width: A4_WIDTH,
          height: A4_HEIGHT,
          pixelRatio: 2,
          mimeType: 'image/jpeg',
          quality: 0.9
        });

        if (!firstPage) pdf.addPage();
        pdf.addImage(dataUrl, 'JPEG', 0, 0, A4_WIDTH, A4_HEIGHT);
        firstPage = false;
      }
    }

    stage.scale(oldScale);
    stage.position(oldPos);
    stage.batchDraw();

    pdf.save('whiteboard-a4.pdf');
  };

  const exportFramesAsSlides = async () => {
    if (!stageRef.current || !state) return;
    if (state.frames.length === 0) {
      alert("No frames to export");
      return;
    }

    const stage = stageRef.current;
    const A4_WIDTH = 794;
    const A4_HEIGHT = 1123;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [A4_WIDTH, A4_HEIGHT]
    });

    const oldScale = stage.scale();
    const oldPos = stage.position();

    for (let i = 0; i < state.frames.length; i++) {
      const frame = state.frames[i];

      stage.scale({x: frame.scale, y: frame.scale});
      stage.position({x: frame.x, y: frame.y});
      stage.batchDraw();
      await new Promise(r => setTimeout(r, 10));

      // Calculate visible area at this frame
      const viewW = A4_WIDTH / frame.scale;
      const viewH = A4_HEIGHT / frame.scale;
      const viewX = -frame.x / frame.scale;
      const viewY = -frame.y / frame.scale;

      // Reset to 1:1 for export
      stage.scale({x: 1, y: 1});
      stage.position({x: -viewX, y: -viewY});
      stage.batchDraw();
      await new Promise(r => setTimeout(r, 10));

      const dataUrl = stage.toDataURL({
        x: 0,
        y: 0,
        width: viewW,
        height: viewH,
        pixelRatio: 2,
        mimeType: 'image/jpeg',
        quality: 0.9
      });

      if (i > 0) pdf.addPage();

      // Scale to fit A4
      const scale = Math.min(A4_WIDTH / viewW, A4_HEIGHT / viewH);
      const scaledW = viewW * scale;
      const scaledH = viewH * scale;
      const offsetX = (A4_WIDTH - scaledW) / 2;
      const offsetY = (A4_HEIGHT - scaledH) / 2;

      pdf.addImage(dataUrl, 'JPEG', offsetX, offsetY, scaledW, scaledH);
    }

    stage.scale(oldScale);
    stage.position(oldPos);
    stage.batchDraw();

    pdf.save('whiteboard-slides.pdf');
  };

  const handleExport = async (mode: ExportMode) => {
    switch (mode) {
      case 'full-canvas':
        await exportFullCanvas();
        break;
      case 'a4-pages':
        await exportA4Pages();
        break;
      case 'frames-slides':
        await exportFramesAsSlides();
        break;
    }
  };

  const handleAddFrame = (label: string) => {
     if (!stageRef.current || !state) return;
     const stage = stageRef.current;
     const newFrame: FrameObj = {
        id: Date.now().toString(),
        label,
        x: stage.x(),
        y: stage.y(),
        scale: stage.scaleX()
     };
     handleUpdate({ frames: [...state.frames, newFrame] });
  };

  const handleGoToFrame = (frame: FrameObj) => {
     if (!stageRef.current) return;
     const stage = stageRef.current;
     
     stage.to({
        x: frame.x,
        y: frame.y,
        scaleX: frame.scale,
        scaleY: frame.scale,
        duration: 0.5,
        easing: Konva.Easings.EaseInOut
     });
     setZoom(frame.scale);
     setViewPos({ x: frame.x, y: frame.y });
  };

  const handleDeleteFrame = (id: string) => {
     if (!state) return;
     handleUpdate({ frames: state.frames.filter(f => f.id !== id) });
  };

  const currentState = state || initialState;

  // Determine minimap visibility: show when panning, hide in presentation mode
  const showMinimap = !presentationMode && (tool === 'hand' || isSpacebarPressed);

  return (
    <div className="w-full h-screen bg-gray-50 overflow-hidden">
      {!presentationMode && (
      <Toolbar 
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={handleColorChange}
        size={size}
        setSize={setSize}
        background={background}
        setBackground={setBackground}
        zoom={zoom}
        setZoom={setZoom}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onClear={handleClear}
        onSave={handleSave}
        onExport={() => setShowExportDialog(true)}
        onImportImages={(newImages) => handleUpdate({ images: [...currentState.images, ...newImages] })}
        onCreateCodeBlock={handleCreateCodeBlock}
      />
      )}

      {!presentationMode && (
      <FrameManager 
         frames={currentState.frames}
         onAddFrame={handleAddFrame}
         onDeleteFrame={handleDeleteFrame}
         onGoToFrame={handleGoToFrame}
      />
      )}

      <Whiteboard
        tool={tool}
        setTool={setTool}
        color={color}
        size={size}
        strokes={currentState.strokes}
        images={currentState.images}
        texts={currentState.texts}
        shapes={currentState.shapes}
        latex={currentState.latex}
        codes={currentState.codes}
        notes={currentState.notes}
        codeblocks={currentState.codeblocks}
        d3visualizations={currentState.d3visualizations}
        background={background}
        onUpdate={handleUpdate}
        stageRef={stageRef}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        zoom={zoom}
        setZoom={setZoom}
        viewPos={viewPos}
        setViewPos={setViewPos}
        a4GridVisible={a4GridVisible}
      />

      {showMinimap && (
      <Minimap
         strokes={currentState.strokes}
         images={currentState.images}
         texts={currentState.texts}
         shapes={currentState.shapes}
         latex={currentState.latex}
         codes={currentState.codes}
         notes={currentState.notes}
         codeblocks={currentState.codeblocks}
         d3visualizations={currentState.d3visualizations}
         stageX={viewPos.x}
         stageY={viewPos.y}
         stageScale={zoom}
         stageWidth={window.innerWidth}
         stageHeight={window.innerHeight}
         onNavigate={(x, y) => {
            setViewPos({ x, y });
         }}
      />
      )}

      {/* Auto-save notification */}
      {showAutoSaveNotification && (
        <div className="fixed bottom-4 left-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-fade-in">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Auto-saved
        </div>
      )}

      {/* Keyboard shortcuts overlay */}
      {showShortcuts && <ShortcutsOverlay onClose={() => setShowShortcuts(false)} />}

      {/* Export dialog */}
      {showExportDialog && (
        <ExportDialog
          onClose={() => setShowExportDialog(false)}
          onExport={handleExport}
          hasFrames={currentState.frames.length > 0}
        />
      )}
    </div>
  );
}

export default App;