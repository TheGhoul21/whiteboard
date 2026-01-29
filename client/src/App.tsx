import { useState, useRef, useEffect, useCallback } from 'react';
import { Whiteboard } from './components/Whiteboard';
import { Toolbar } from './components/Toolbar';
import { FrameManager } from './components/FrameManager';
import { Minimap } from './components/Minimap';
import type { Stroke, ImageObj, TextObj, ShapeObj, ToolType, BackgroundType, LatexObj, CodeObj, NoteObj, FrameObj } from './types';
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
}

const initialState: AppState = {
   strokes: [],
   images: [],
   texts: [],
   shapes: [],
   latex: [],
   codes: [],
   notes: [],
   frames: []
};

const DEFAULT_SIZES: Record<ToolType, number> = {
   'pen': 5,
   'smooth-pen': 5,
   'eraser': 20,
   'laser': 10,
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
  
  const { state, setState, undo, redo, canUndo, canRedo } = useHistory<AppState>(initialState);
  
  const stageRef = useRef<Konva.Stage | null>(null);

  const handleUpdate = useCallback((newState: Partial<AppState>, overwrite = false) => {
     setState(prev => ({ ...prev, ...newState }), overwrite);
  }, [setState]);

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
  
  useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
        // Prevent shortcuts if typing in an input
        const tagName = document.activeElement?.tagName.toLowerCase();
        if (tagName === 'input' || tagName === 'textarea') return;

        if (e.code === 'Space' && !e.repeat) {
           e.preventDefault();
           setTool(current => {
              if (current !== 'hand') {
                 previousToolRef.current = current;
                 return 'hand';
              }
              return current;
           });
        }

        if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
           if (e.shiftKey) redo();
           else undo();
           e.preventDefault();
        } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
           redo();
           e.preventDefault();
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
           if (!state) return;
           if (selectedIds.length > 0) {
              handleUpdate({
                 strokes: state.strokes.filter(s => !selectedIds.includes(s.id)),
                 images: state.images.filter(i => !selectedIds.includes(i.id)),
                 texts: state.texts.filter(t => !selectedIds.includes(t.id)),
                 shapes: state.shapes.filter(s => !selectedIds.includes(s.id)),
                 latex: state.latex.filter(l => !selectedIds.includes(l.id)),
                 codes: state.codes.filter(c => !selectedIds.includes(c.id)),
                 notes: state.notes.filter(n => !selectedIds.includes(n.id)),
              });
              setSelectedIds([]);
           }
        } 
        // Ctrl/Cmd + A: Select All
        else if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
           e.preventDefault();
           if (!state) return;
           setTool('select'); // Switch to select tool
           
           const allIds = [
              ...state.strokes.map(s => s.id),
              ...state.images.map(i => i.id),
              ...state.texts.map(t => t.id),
              ...state.shapes.map(s => s.id),
              ...state.latex.map(l => l.id),
              ...state.codes.map(c => c.id),
              ...state.notes.map(n => n.id)
           ];
           setSelectedIds(allIds);
        }
     };

     const handleKeyUp = (e: KeyboardEvent) => {
        if (e.code === 'Space') {
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
  }, [state, selectedIds, undo, redo, handleUpdate]);

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

  const handleExport = async () => {
    if (!stageRef.current || !state) return;
    const stage = stageRef.current;
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const hasItems = state.strokes.length + state.images.length + state.texts.length + state.shapes.length + state.latex.length + state.codes.length + state.notes.length > 0;
    
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
    
    [...state.latex, ...state.codes, ...state.notes].forEach(obj => {
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

  return (
    <div className="w-full h-screen bg-gray-50 overflow-hidden">
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
        onExport={handleExport}
        onImportImages={(newImages) => handleUpdate({ images: [...currentState.images, ...newImages] })}
      />
      
      <FrameManager 
         frames={currentState.frames}
         onAddFrame={handleAddFrame}
         onDeleteFrame={handleDeleteFrame}
         onGoToFrame={handleGoToFrame}
      />

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
        background={background}
        onUpdate={handleUpdate}
        stageRef={stageRef}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        zoom={zoom}
        setZoom={setZoom}
        viewPos={viewPos}
        setViewPos={setViewPos}
      />
      
      <Minimap
         strokes={currentState.strokes}
         images={currentState.images}
         texts={currentState.texts}
         shapes={currentState.shapes}
         latex={currentState.latex}
         codes={currentState.codes}
         notes={currentState.notes}
         stageX={viewPos.x}
         stageY={viewPos.y}
         stageScale={zoom}
         stageWidth={window.innerWidth}
         stageHeight={window.innerHeight}
         onNavigate={(x, y) => {
            setViewPos({ x, y });
         }}
      />
    </div>
  );
}

export default App;
