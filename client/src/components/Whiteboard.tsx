import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Image as KonvaImage, Transformer, Text, Rect, Circle, Arrow, Path } from 'react-konva';
import Konva from 'konva';
import type { Stroke, ImageObj, TextObj, ShapeObj, ToolType, BackgroundType, LatexObj, CodeObj, NoteObj, CodeBlockObj, D3VisualizationObj } from '../types';
import { getSvgPathFromStroke, getCalligraphyPath, flatToPoints, smoothPoints } from '../utils/stroke';
import { Background } from './Background';
import { LatexObject, CodeObject, NoteObject } from './SmartObjects';
import { CodeBlockObject } from './CodeBlockObject';
import { D3VisualizationObject } from './D3VisualizationObject';
import { A4Grid } from './A4Grid';

interface WhiteboardProps {
  tool: ToolType;
  setTool: (tool: ToolType) => void;
  color: string;
  size: number;
  strokes: Stroke[];
  images: ImageObj[];
  texts: TextObj[];
  shapes: ShapeObj[];
  latex: LatexObj[];
  codes: CodeObj[];
  notes: NoteObj[];
  codeblocks: CodeBlockObj[];
  d3visualizations: D3VisualizationObj[];
  background: BackgroundType;
  onUpdate: (data: Partial<{ strokes: Stroke[], images: ImageObj[], texts: TextObj[], shapes: ShapeObj[], latex: LatexObj[], codes: CodeObj[], notes: NoteObj[], codeblocks: CodeBlockObj[], d3visualizations: D3VisualizationObj[] }> , overwrite?: boolean) => void;
  stageRef: React.RefObject<Konva.Stage | null>;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  zoom: number;
  setZoom: (z: number) => void;
  viewPos: { x: number, y: number };
  setViewPos: (pos: { x: number, y: number }) => void;
  a4GridVisible?: boolean;
}

export const Whiteboard: React.FC<WhiteboardProps> = ({
  tool,
  setTool,
  color,
  size,
  strokes,
  images,
  texts,
  shapes,
  latex = [],
  codes = [],
  notes = [],
  codeblocks = [],
  d3visualizations = [],
  background,
  onUpdate,
  stageRef,
  selectedIds,
  setSelectedIds,
  zoom,
  setZoom,
  viewPos,
  setViewPos,
  a4GridVisible = false
}) => {
  console.log('[Whiteboard] Render with:', {
    codeblocks: codeblocks.length,
    d3visualizations: d3visualizations.length,
    strokes: strokes.length,
    images: images.length
  });

  // Prevent browser back/forward navigation gestures
  useEffect(() => {
    const preventNavigation = (e: WheelEvent) => {
      // Prevent horizontal scroll that triggers navigation
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
      }
    };

    const preventTouchNav = (e: TouchEvent) => {
      // Prevent swipe navigation when panning
      if (isPanning.current || tool === 'hand') {
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', preventNavigation, { passive: false });
    window.addEventListener('touchmove', preventTouchNav, { passive: false });

    return () => {
      window.removeEventListener('wheel', preventNavigation);
      window.removeEventListener('touchmove', preventTouchNav);
    };
  }, [tool]);
  const isDrawing = useRef(false);
  const isSelecting = useRef(false);
  const isPanning = useRef(false);
  const lastPointerPos = useRef<{x: number, y: number} | null>(null);
  const selectionStart = useRef<{x: number, y: number} | null>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [selectionBox, setSelectionBox] = useState<{x:number, y:number, width:number, height:number} | null>(null);
  const [pointerPos, setPointerPos] = useState<{x: number, y: number} | null>(null);
  const [isDraggingOverlay, setIsDraggingOverlay] = useState(false);

  const overlayDragStart = useRef<{x: number, y: number} | null>(null);

  const [selectionOverlay, setSelectionOverlay] = useState<{x: number, y: number, width: number, height: number} | null>(null);

  const getSelectionBBox = () => {
     if (selectedIds.length < 1) return null;

     let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
     let found = false;

     // Calculate from data objects directly (world coordinates) instead of node.getClientRect()
     selectedIds.forEach(id => {
        // Check strokes
        const stroke = strokes.find(s => s.id === id);
        if (stroke) {
           found = true;
           for (let i = 0; i < stroke.points.length; i += 2) {
              minX = Math.min(minX, stroke.points[i] - stroke.size / 2);
              maxX = Math.max(maxX, stroke.points[i] + stroke.size / 2);
              minY = Math.min(minY, stroke.points[i + 1] - stroke.size / 2);
              maxY = Math.max(maxY, stroke.points[i + 1] + stroke.size / 2);
           }
        }

        // Check images
        const image = images.find(img => img.id === id);
        if (image) {
           found = true;
           minX = Math.min(minX, image.x);
           minY = Math.min(minY, image.y);
           maxX = Math.max(maxX, image.x + image.width);
           maxY = Math.max(maxY, image.y + image.height);
        }

        // Check texts
        const text = texts.find(t => t.id === id);
        if (text) {
           found = true;
           const w = text.text.length * (text.fontSize * 0.6);
           const h = text.fontSize * 1.2;
           minX = Math.min(minX, text.x);
           minY = Math.min(minY, text.y);
           maxX = Math.max(maxX, text.x + w);
           maxY = Math.max(maxY, text.y + h);
        }

        // Check shapes
        const shape = shapes.find(s => s.id === id);
        if (shape) {
           found = true;
           minX = Math.min(minX, shape.x);
           minY = Math.min(minY, shape.y);
           maxX = Math.max(maxX, shape.x + (shape.width || 50));
           maxY = Math.max(maxY, shape.y + (shape.height || 50));
        }

        // Check latex, codes, notes
        const latexObj = latex.find(l => l.id === id);
        if (latexObj) {
           found = true;
           minX = Math.min(minX, latexObj.x);
           minY = Math.min(minY, latexObj.y);
           maxX = Math.max(maxX, latexObj.x + 100);
           maxY = Math.max(maxY, latexObj.y + 40);
        }

        const codeObj = codes.find(c => c.id === id);
        if (codeObj) {
           found = true;
           minX = Math.min(minX, codeObj.x);
           minY = Math.min(minY, codeObj.y);
           maxX = Math.max(maxX, codeObj.x + codeObj.width);
           maxY = Math.max(maxY, codeObj.y + codeObj.height);
        }

        const noteObj = notes.find(n => n.id === id);
        if (noteObj) {
           found = true;
           minX = Math.min(minX, noteObj.x);
           minY = Math.min(minY, noteObj.y);
           maxX = Math.max(maxX, noteObj.x + noteObj.width);
           maxY = Math.max(maxY, noteObj.y + noteObj.height);
        }

        // Check codeblocks
        const codeBlock = codeblocks.find(cb => cb.id === id);
        if (codeBlock) {
           found = true;
           minX = Math.min(minX, codeBlock.x);
           minY = Math.min(minY, codeBlock.y);
           maxX = Math.max(maxX, codeBlock.x + codeBlock.width);
           maxY = Math.max(maxY, codeBlock.y + codeBlock.height);
        }

        // Check d3visualizations
        const viz = d3visualizations.find(v => v.id === id);
        if (viz) {
           found = true;
           minX = Math.min(minX, viz.x);
           minY = Math.min(minY, viz.y);
           maxX = Math.max(maxX, viz.x + viz.width);
           maxY = Math.max(maxY, viz.y + viz.height);
        }
     });

     if (!found) return null;
     return { x: minX - 5, y: minY - 5, width: maxX - minX + 10, height: maxY - minY + 10 };
  };

  // Update overlay when not dragging
  useEffect(() => {
     if (!isDraggingOverlay) {
        const bbox = getSelectionBBox();
        setSelectionOverlay(bbox);
     }
  }, [selectedIds, strokes, images, texts, shapes, latex, codes, notes, codeblocks, d3visualizations, isDraggingOverlay]);

  useEffect(() => {
     let anim: number;
     const animate = () => {
        const now = Date.now();
        const hasLaser = strokes.some(s => s.tool === 'laser');
        if (hasLaser) {
           const activeStrokes = strokes.filter(s => s.tool !== 'laser' || (s.createdAt && now - s.createdAt < 2000));
           if (activeStrokes.length !== strokes.length) {
              onUpdate({ strokes: activeStrokes }, true);
           }
        }
        anim = requestAnimationFrame(animate);
     };
     anim = requestAnimationFrame(animate);
     return () => cancelAnimationFrame(anim);
  }, [strokes, onUpdate]);

  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;
    const layer = transformerRef.current.getLayer();
    const nodes = selectedIds.map(id => stageRef.current?.findOne('#' + id)).filter(Boolean) as Konva.Node[];
    transformerRef.current.nodes(nodes);
    layer?.batchDraw();
  }, [selectedIds, strokes, images, texts, shapes, latex, codes, notes, codeblocks, d3visualizations]);

  useEffect(() => {
     if (stageRef.current) {
        const stage = stageRef.current;
        if (stage.scaleX() !== zoom) {
           stage.scale({x: zoom, y: zoom});
        }
        if (stage.x() !== viewPos.x || stage.y() !== viewPos.y) {
           stage.position(viewPos);
        }
        stage.batchDraw();
     }
  }, [zoom, viewPos]);

  useEffect(() => {
     // Reset pointer position when changing tool
     if (tool !== 'pointer') {
        setPointerPos(null);
     }
  }, [tool]);

  useEffect(() => {
     // Force recalculation of overlay when selection changes
     if (selectedIds.length > 0 && stageRef.current) {
        setTimeout(() => {
           stageRef.current?.batchDraw();
        }, 0);
     }
  }, [selectedIds]);

  // Paste Handler (Code omitted for brevity, same as before)
  useEffect(() => {
     const handlePaste = (e: ClipboardEvent) => {
        const text = e.clipboardData?.getData('text');
        const items = e.clipboardData?.items;

        if (items) {
           for (const item of items) {
              if (item.type.indexOf('image') !== -1) {
                 const blob = item.getAsFile();
                 if (!blob) continue;
                 const reader = new FileReader();
                 reader.onload = (event) => {
                    const base64 = event.target?.result as string;
                    const stage = stageRef.current;
                    const absPos = { 
                       x: -stage!.x() + stage!.width() / 2,
                       y: -stage!.y() + stage!.height() / 2
                    };
                    const scale = stage!.scaleX();
                    const x = absPos.x / scale;
                    const y = absPos.y / scale;

                    const newImage: ImageObj = {
                       id: Date.now().toString(),
                       type: 'image',
                       src: base64,
                       x: x - 100,
                       y: y - 100,
                       width: 200,
                       height: 200,
                    };
                    onUpdate({ images: [...images, newImage] });
                    setTool('select');
                 };
                 reader.readAsDataURL(blob);
                 return;
              }
           }
        }

        if (!text) return;
        
        const stage = stageRef.current;
        const pointer = stage?.getPointerPosition();
        let targetX = 100, targetY = 100;
        
        if (pointer) {
           const transform = stage?.getAbsoluteTransform().copy().invert();
           const pt = transform?.point(pointer);
           if (pt) { targetX = pt.x; targetY = pt.y; }
        } else {
           const absPos = { 
              x: -stage!.x() + stage!.width() / 2,
              y: -stage!.y() + stage!.height() / 2
           };
           const scale = stage!.scaleX();
           targetX = absPos.x / scale;
           targetY = absPos.y / scale;
        }
        
        const codeMatch = text.match(/```(\w+)?\n([\s\S]*?)```/);
        const latexMatch = text.match(/```latex\n([\s\S]*?)```/) || text.match(/\$\$([\s\S]*?)\$\$/);
        const noteMatch = text.match(/```note\n([\s\S]*?)```/);

        if (codeMatch && !latexMatch && !noteMatch) {
           e.preventDefault();
           const newCode: CodeObj = {
              id: Date.now().toString(),
              type: 'code',
              text: codeMatch[2],
              language: codeMatch[1] || '',
              x: targetX,
              y: targetY,
              width: 300,
              height: 200,
              fontSize: 14
           };
           onUpdate({ codes: [...codes, newCode] });
           setTool('select');
           return;
        }

        if (latexMatch) {
           e.preventDefault();
           const newLatex: LatexObj = {
              id: Date.now().toString(),
              type: 'latex',
              text: latexMatch[1],
              x: targetX,
              y: targetY,
              fontSize: 24,
              color: color
           };
           onUpdate({ latex: [...latex, newLatex] });
           setTool('select');
           return;
        }

        if (noteMatch) {
           e.preventDefault();
           const newNote: NoteObj = {
              id: Date.now().toString(),
              type: 'note',
              text: noteMatch[1],
              x: targetX,
              y: targetY,
              width: 200,
              height: 200,
              color: '#fef3c7' 
           };
           onUpdate({ notes: [...notes, newNote] });
           setTool('select');
           return;
        }
     };
     window.addEventListener('paste', handlePaste);
     return () => window.removeEventListener('paste', handlePaste);
  }, [codes, latex, notes, images, color, onUpdate]);


  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getRelativePointerPosition();
    const pointerPos = stage.getPointerPosition();
    if (!pos || !pointerPos) return;

    if (e.evt instanceof MouseEvent && e.evt.button === 2) {
       isPanning.current = true;
       lastPointerPos.current = pointerPos;
       return;
    }

    if (tool === 'hand') return;

    if (tool === 'select') {
      const target = e.target;
      if (target.getParent()?.className === 'Transformer') {
         return;
      }

      // Check if we hit the Selection Overlay
      if (target.name() === 'selection-overlay') {
         return; 
      }

      const targetId = target.id() || target.attrs.id;
      const parentId = target.getParent()?.id() || target.getParent()?.attrs.id;
      const idToSelect = targetId || parentId;

      const isBackground = target === stage || target.getParent()?.name() === 'background-group';

      if (idToSelect && !isBackground) {
         const isModifier = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
         if (isModifier) {
            if (selectedIds.includes(idToSelect)) {
               setSelectedIds(selectedIds.filter(id => id !== idToSelect));
            } else {
               setSelectedIds([...selectedIds, idToSelect]);
            }
            return;
         }
         if (selectedIds.includes(idToSelect)) {
            return;
         }
         setSelectedIds([idToSelect]);
         return;
      }

      // Clicking on background - clear selection and start box selection
      const isModifier = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
      if (!isModifier) {
         // Clear existing selection when clicking background
         setSelectedIds([]);
         // Start box selection
         isSelecting.current = true;
         selectionStart.current = pos;
         setSelectionBox({ x: pos.x, y: pos.y, width: 0, height: 0 });
      }
      return;
    }

    isDrawing.current = true;

    if (tool === 'text') {
       const text = prompt("Enter text:");
       if (text) {
          const newText: TextObj = {
             id: Date.now().toString(),
             type: 'text',
             x: pos.x,
             y: pos.y,
             text: text,
             fontSize: size * 5,
             color: color
          };
          onUpdate({ texts: [...texts, newText] });
          setTool('select');
       }
       isDrawing.current = false;
       return;
    }

    if (tool === 'pen' || tool === 'smooth-pen' || tool === 'highlighter' || tool === 'eraser' || tool === 'laser') {
      const newStroke: Stroke = {
        id: Date.now().toString(),
        tool: tool,
        color: tool === 'laser' ? 'red' : color,
        size: size,
        opacity: tool === 'highlighter' ? 0.3 : 1,
        points: [pos.x, pos.y],
        createdAt: tool === 'laser' ? Date.now() : undefined
      };
      onUpdate({ strokes: [...strokes, newStroke] });
    }
    
    if (tool === 'rect' || tool === 'circle' || tool === 'arrow') {
       const newShape: ShapeObj = {
          id: Date.now().toString(),
          type: tool,
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          points: [0, 0, 0, 0],
          color: color,
          strokeWidth: size
       };
       onUpdate({ shapes: [...shapes, newShape] });
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    if (isPanning.current && lastPointerPos.current) {
       const pointerPos = stage.getPointerPosition();
       if (!pointerPos) return;
       const dx = pointerPos.x - lastPointerPos.current.x;
       const dy = pointerPos.y - lastPointerPos.current.y;
       const newPos = { x: stage.x() + dx, y: stage.y() + dy };
       setViewPos(newPos);
       lastPointerPos.current = pointerPos;
       return;
    }

    const pos = stage.getRelativePointerPosition();
    if (!pos) return;

    // Update pointer position for spotlight effect
    if (tool === 'pointer') {
       setPointerPos(pos);
       return;
    }

    if (tool === 'hand') return;

    if (tool === 'select' && isSelecting.current && selectionStart.current) {
       const sx = selectionStart.current.x;
       const sy = selectionStart.current.y;
       const moved = Math.abs(pos.x - sx) > 3 || Math.abs(pos.y - sy) > 3;

       if (moved) {
          // User is actually dragging - clear selection and start box
          if (selectedIds.length > 0) {
             setSelectedIds([]);
          }
          setSelectionBox({
             x: Math.min(sx, pos.x),
             y: Math.min(sy, pos.y),
             width: Math.abs(pos.x - sx),
             height: Math.abs(pos.y - sy)
          });
       }
       return;
    }

    if (!isDrawing.current) return;

    if (tool === 'pen' || tool === 'smooth-pen' || tool === 'highlighter' || tool === 'eraser' || tool === 'laser') {
      const lastStroke = strokes[strokes.length - 1];
      if (!lastStroke) return;

      // For small writing, we need MORE points, not fewer - only skip extremely close duplicates
      const minDistance = 0.5;
      const points = lastStroke.points;
      if (points.length >= 2) {
        const lastX = points[points.length - 2];
        const lastY = points[points.length - 1];
        const dist = Math.sqrt((pos.x - lastX) ** 2 + (pos.y - lastY) ** 2);
        if (dist < minDistance) return;
      }

      const newPoints = lastStroke.points.concat([pos.x, pos.y]);

      const newStrokes = [...strokes];
      newStrokes[newStrokes.length - 1] = { ...lastStroke, points: newPoints };
      onUpdate({ strokes: newStrokes }, true);
    }

    if (tool === 'rect' || tool === 'circle') {
       const lastShape = shapes[shapes.length - 1];
       if (!lastShape) return;
       const w = pos.x - lastShape.x;
       const h = pos.y - lastShape.y;
       const newShapes = [...shapes];
       newShapes[newShapes.length - 1] = { ...lastShape, width: w, height: h };
       onUpdate({ shapes: newShapes }, true);
    }
    
    if (tool === 'arrow') {
       const lastShape = shapes[shapes.length - 1];
       if (!lastShape) return;
       const newPoints = [0, 0, pos.x - lastShape.x, pos.y - lastShape.y];
       const newShapes = [...shapes];
       newShapes[newShapes.length - 1] = { ...lastShape, points: newPoints };
       onUpdate({ shapes: newShapes }, true);
    }
  };

  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    isPanning.current = false;
    lastPointerPos.current = null;

    if (isSelecting.current && selectionBox && stageRef.current) {
       // Only process box selection if user actually moved (box has size)
       if (selectionBox.width > 3 || selectionBox.height > 3) {
          const box = selectionBox;
          const allIds: string[] = [];

          const overlaps = (objBox: {x:number, y:number, width:number, height:number}) => {
             return (
                box.x < objBox.x + objBox.width &&
                box.x + box.width > objBox.x &&
                box.y < objBox.y + objBox.height &&
                box.y + box.height > objBox.y
             );
          };

          // Check strokes using their actual points data (world coordinates)
          strokes.forEach(stroke => {
             if (stroke.tool === 'laser') return; // Skip laser
             let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
             for (let i = 0; i < stroke.points.length; i += 2) {
                minX = Math.min(minX, stroke.points[i]);
                maxX = Math.max(maxX, stroke.points[i]);
                minY = Math.min(minY, stroke.points[i + 1]);
                maxY = Math.max(maxY, stroke.points[i + 1]);
             }
             const strokeBox = {
                x: minX - stroke.size / 2,
                y: minY - stroke.size / 2,
                width: maxX - minX + stroke.size,
                height: maxY - minY + stroke.size
             };
             if (overlaps(strokeBox)) allIds.push(stroke.id);
          });

          // Check images
          images.forEach(img => {
             const imgBox = { x: img.x, y: img.y, width: img.width, height: img.height };
             if (overlaps(imgBox)) allIds.push(img.id);
          });

          // Check texts
          texts.forEach(txt => {
             const w = txt.text.length * (txt.fontSize * 0.6);
             const h = txt.fontSize * 1.2;
             const txtBox = { x: txt.x, y: txt.y, width: w, height: h };
             if (overlaps(txtBox)) allIds.push(txt.id);
          });

          // Check shapes
          shapes.forEach(shape => {
             const shapeBox = {
                x: shape.x,
                y: shape.y,
                width: shape.width || 50,
                height: shape.height || 50
             };
             if (overlaps(shapeBox)) allIds.push(shape.id);
          });

          // Check latex, codes, notes
          latex.forEach(l => {
             const lBox = { x: l.x, y: l.y, width: 100, height: 40 };
             if (overlaps(lBox)) allIds.push(l.id);
          });

          codes.forEach(c => {
             const cBox = { x: c.x, y: c.y, width: c.width, height: c.height };
             if (overlaps(cBox)) allIds.push(c.id);
          });

          notes.forEach(n => {
             const nBox = { x: n.x, y: n.y, width: n.width, height: n.height };
             if (overlaps(nBox)) allIds.push(n.id);
          });

          // Check codeblocks
          codeblocks.forEach(cb => {
             const cbBox = { x: cb.x, y: cb.y, width: cb.width, height: cb.height };
             if (overlaps(cbBox)) allIds.push(cb.id);
          });

          // Check d3visualizations
          d3visualizations.forEach(v => {
             const vBox = { x: v.x, y: v.y, width: v.width, height: v.height };
             if (overlaps(vBox)) allIds.push(v.id);
          });

          const isModifier = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;

          if (isModifier) {
             const uniqueIds = Array.from(new Set([...selectedIds, ...allIds]));
             setSelectedIds(uniqueIds);
          } else {
             setSelectedIds(allIds);
          }
       }
       // else: just a click, keep existing selection

       setSelectionBox(null);
    }

    // Handle single-point strokes (dots) - when user clicks without moving
    if (isDrawing.current && (tool === 'pen' || tool === 'smooth-pen' || tool === 'highlighter' || tool === 'eraser')) {
       const lastStroke = strokes[strokes.length - 1];
       if (lastStroke && lastStroke.points.length === 2) {
          // Single point - duplicate it slightly to create a visible dot
          const updatedStroke = {
             ...lastStroke,
             points: [lastStroke.points[0], lastStroke.points[1], lastStroke.points[0] + 0.1, lastStroke.points[1] + 0.1]
          };
          onUpdate({ strokes: [...strokes.slice(0, -1), updatedStroke] }, true);
       }
    }

    isDrawing.current = false;
    isSelecting.current = false;

    if (tool !== 'select' && tool !== 'hand') {
       onUpdate({}, false);
       if (tool === 'text') setTool('select');
    }
  };

  const handleDragStart = (e: Konva.KonvaEventObject<DragEvent>) => {
     if(tool === 'hand') return;

     if (e.target.name() === 'selection-overlay') {
        setIsDraggingOverlay(true);
        overlayDragStart.current = e.target.getPosition();
     }
  };

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
     if (tool === 'hand') return;

     if (e.target.name() === 'selection-overlay' && overlayDragStart.current) {
        const currentPos = e.target.getPosition();
        const dx = currentPos.x - overlayDragStart.current.x;
        const dy = currentPos.y - overlayDragStart.current.y;

        // Move all selected nodes visually
        selectedIds.forEach(selId => {
           const node = stageRef.current?.findOne('#' + selId);

           // Check in all types including strokes
           const original = [...images, ...texts, ...shapes, ...latex, ...codes, ...notes, ...codeblocks, ...d3visualizations].find(o => o.id === selId);
           const strokeOriginal = strokes.find(s => s.id === selId);

           if (node && original) {
              // Regular objects with x/y
              node.setPosition({ x: original.x + dx, y: original.y + dy });
           } else if (node && strokeOriginal) {
              // Strokes use position offset (points are relative to 0,0)
              node.setPosition({ x: dx, y: dy });
           }
        });

        stageRef.current?.batchDraw();
     }
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
     if(tool === 'hand') {
        if(e.target === e.target.getStage()) {
           setViewPos(e.target.position());
        }
        return;
     }

     // Handle overlay drag
     if (e.target.name() === 'selection-overlay' && overlayDragStart.current) {
        const currentPos = e.target.getPosition();
        const dx = currentPos.x - overlayDragStart.current.x;
        const dy = currentPos.y - overlayDragStart.current.y;

        overlayDragStart.current = null;

        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
           setIsDraggingOverlay(false);
           return;
        }

        // Apply delta to ALL selected items
        const newImages = images.map(img => selectedIds.includes(img.id) ? { ...img, x: img.x + dx, y: img.y + dy } : img);
        const newTexts = texts.map(txt => selectedIds.includes(txt.id) ? { ...txt, x: txt.x + dx, y: txt.y + dy } : txt);
        const newShapes = shapes.map(shp => selectedIds.includes(shp.id) ? { ...shp, x: shp.x + dx, y: shp.y + dy } : shp);
        const newLatex = latex.map(l => selectedIds.includes(l.id) ? { ...l, x: l.x + dx, y: l.y + dy } : l);
        const newCodes = codes.map(c => selectedIds.includes(c.id) ? { ...c, x: c.x + dx, y: c.y + dy } : c);
        const newNotes = notes.map(n => selectedIds.includes(n.id) ? { ...n, x: n.x + dx, y: n.y + dy } : n);
        const newCodeBlocks = codeblocks.map(cb => selectedIds.includes(cb.id) ? { ...cb, x: cb.x + dx, y: cb.y + dy } : cb);
        const newD3Visualizations = d3visualizations.map(v => selectedIds.includes(v.id) ? { ...v, x: v.x + dx, y: v.y + dy } : v);
        const newStrokes = strokes.map(s => {
           if (selectedIds.includes(s.id)) {
              const newPoints = [];
              for(let i=0; i<s.points.length; i+=2) {
                 newPoints.push(s.points[i] + dx);
                 newPoints.push(s.points[i+1] + dy);
              }
              return { ...s, points: newPoints };
           }
           return s;
        });

        onUpdate({
           strokes: newStrokes,
           images: newImages,
           texts: newTexts,
           shapes: newShapes,
           latex: newLatex,
           codes: newCodes,
           notes: newNotes,
           codeblocks: newCodeBlocks,
           d3visualizations: newD3Visualizations
        });

        // Reset manual positions after state update
        setTimeout(() => {
           selectedIds.forEach(selId => {
              const node = stageRef.current?.findOne('#' + selId);
              if (node && node.name() === 'stroke') {
                 node.setPosition({ x: 0, y: 0 });
              }
           });
           setIsDraggingOverlay(false);
           stageRef.current?.batchDraw();
        }, 0);

        return;
     }

     // Handle single object drag
     const id = e.target.id();
     if (!id) return;

     const isStroke = e.target.name() === 'stroke';
     let dx = 0, dy = 0;

     if (isStroke) {
        dx = e.target.x();
        dy = e.target.y();
        e.target.position({ x: 0, y: 0 });
     } else {
        const original = [...images, ...texts, ...shapes, ...latex, ...codes, ...notes, ...codeblocks, ...d3visualizations].find(o => o.id === id);
        if (original) {
           dx = e.target.x() - original.x;
           dy = e.target.y() - original.y;
        }
     }

     if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) return;

     const newImages = images.map(img => img.id === id ? { ...img, x: img.x + dx, y: img.y + dy } : img);
     const newTexts = texts.map(txt => txt.id === id ? { ...txt, x: txt.x + dx, y: txt.y + dy } : txt);
     const newShapes = shapes.map(shp => shp.id === id ? { ...shp, x: shp.x + dx, y: shp.y + dy } : shp);
     const newLatex = latex.map(l => l.id === id ? { ...l, x: l.x + dx, y: l.y + dy } : l);
     const newCodes = codes.map(c => c.id === id ? { ...c, x: c.x + dx, y: c.y + dy } : c);
     const newNotes = notes.map(n => n.id === id ? { ...n, x: n.x + dx, y: n.y + dy } : n);
     const newCodeBlocks = codeblocks.map(cb => cb.id === id ? { ...cb, x: cb.x + dx, y: cb.y + dy } : cb);
     const newD3Visualizations = d3visualizations.map(v => v.id === id ? { ...v, x: v.x + dx, y: v.y + dy } : v);
     const newStrokes = strokes.map(s => {
        if (s.id === id) {
           const newPoints = [];
           for(let i=0; i<s.points.length; i+=2) {
              newPoints.push(s.points[i] + dx);
              newPoints.push(s.points[i+1] + dy);
           }
           return { ...s, points: newPoints };
        }
        return s;
     });

     onUpdate({
        strokes: newStrokes,
        images: newImages,
        texts: newTexts,
        shapes: newShapes,
        latex: newLatex,
        codes: newCodes,
        notes: newNotes,
        codeblocks: newCodeBlocks,
        d3visualizations: newD3Visualizations
     });
  };
  
  const handleTransformEnd = () => {
     const newImages = [...images];
     const newShapes = [...shapes];
     const newTexts = [...texts];
     const newLatex = [...latex];
     const newCodes = [...codes];
     const newNotes = [...notes];

     selectedIds.forEach(id => {
        const node = stageRef.current?.findOne('#' + id);
        if (!node) return;

        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        const rotation = node.rotation();
        const x = node.x();
        const y = node.y();
        
        const imgIndex = newImages.findIndex(i => i.id === id);
        if (imgIndex !== -1) {
           newImages[imgIndex] = {
              ...newImages[imgIndex],
              x, y, rotation,
              width: newImages[imgIndex].width * scaleX,
              height: newImages[imgIndex].height * scaleY
           };
           node.scale({x:1, y:1});
        }
        
        const shpIndex = newShapes.findIndex(s => s.id === id);
        if (shpIndex !== -1) {
           const shp = newShapes[shpIndex];
           if (shp.type === 'rect' || shp.type === 'circle') {
             newShapes[shpIndex] = {
                ...shp,
                x, y, 
                width: (shp.width || 0) * scaleX,
                height: (shp.height || 0) * scaleY
             };
           }
           node.scale({x:1, y:1});
        }
        
        const txtIndex = newTexts.findIndex(t => t.id === id);
        if (txtIndex !== -1) {
           newTexts[txtIndex] = {
              ...newTexts[txtIndex],
              x, y,
              fontSize: newTexts[txtIndex].fontSize * scaleY
           };
           node.scale({x:1, y:1});
        }

        const ltIndex = newLatex.findIndex(l => l.id === id);
        if (ltIndex !== -1) {
           newLatex[ltIndex] = {
              ...newLatex[ltIndex],
              x, y,
              fontSize: newLatex[ltIndex].fontSize * scaleY
           };
           node.scale({x:1, y:1});
        }

        const cdIndex = newCodes.findIndex(c => c.id === id);
        if (cdIndex !== -1) {
           newCodes[cdIndex] = {
              ...newCodes[cdIndex],
              x, y,
              width: newCodes[cdIndex].width * scaleX,
              height: newCodes[cdIndex].height * scaleY,
              fontSize: newCodes[cdIndex].fontSize * scaleY
           };
           node.scale({x:1, y:1});
        }

        const ntIndex = newNotes.findIndex(n => n.id === id);
        if (ntIndex !== -1) {
           newNotes[ntIndex] = {
              ...newNotes[ntIndex],
              x, y,
              width: newNotes[ntIndex].width * scaleX,
              height: newNotes[ntIndex].height * scaleY
           };
           node.scale({x:1, y:1});
        }
     });
     
     onUpdate({
        images: newImages, 
        texts: newTexts, 
        shapes: newShapes, 
        latex: newLatex, 
        codes: newCodes, 
        notes: newNotes 
     });
  };

  const handleSmartObjectSelect = (e: Konva.KonvaEventObject<MouseEvent>, id: string) => {
     if (tool !== 'select') return;
     e.cancelBubble = true; 
     
     const isModifier = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
     if (isModifier) {
        if (selectedIds.includes(id)) {
           setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
           setSelectedIds([...selectedIds, id]);
        }
     } else {
        if (!selectedIds.includes(id)) {
           setSelectedIds([id]);
        }
     }
  };


  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseDown={handleMouseDown}
      onMousemove={handleMouseMove}
      onMouseup={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
      onContextMenu={(e) => e.evt.preventDefault()}
      onWheel={(e) => {
        // Prevent browser back/forward navigation on Mac
        if (e.evt.ctrlKey || Math.abs(e.evt.deltaX) > Math.abs(e.evt.deltaY)) {
          e.evt.preventDefault();
        }
      }}
      onTouchMove={(e) => {
        // Prevent browser navigation on touch devices
        if (tool === 'hand' || isPanning.current) {
          e.evt.preventDefault();
        }
      }}
      draggable={tool === 'hand'}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      ref={stageRef as any}
      onWheel={(e) => {
        e.evt.preventDefault();
        const stage = e.target.getStage();
        if (!stage) return;
        
        if (e.evt.ctrlKey || e.evt.metaKey) {
           const scaleBy = 1.1;
           const oldScale = stage.scaleX();
           const pointer = stage.getPointerPosition();
           if(!pointer) return;
           const mousePointTo = {
             x: (pointer.x - stage.x()) / oldScale,
             y: (pointer.y - stage.y()) / oldScale,
           };
           const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
           
           setZoom(newScale);
           
           stage.scale({ x: newScale, y: newScale });
           const newPos = {
             x: pointer.x - mousePointTo.x * newScale,
             y: pointer.y - mousePointTo.y * newScale,
           };
           stage.position(newPos);
           setViewPos(newPos);
        } else {
           const dx = -e.evt.deltaX;
           const dy = -e.evt.deltaY;
           const pos = stage.position();
           const newPos = { x: pos.x + dx, y: pos.y + dy };
           stage.position(newPos);
           setViewPos(newPos);
        }
      }}
    >
      <Layer>
         <Background 
            type={background} 
            width={window.innerWidth} 
            height={window.innerHeight} 
            x={viewPos.x} 
            y={viewPos.y} 
            scale={zoom}
         />
      </Layer>

      <Layer>
        {latex.map(l => (
           <LatexObject 
              key={l.id} 
              obj={l} 
              isSelected={selectedIds.includes(l.id)}
              onSelect={(e) => handleSmartObjectSelect(e, l.id)} 
           />
        ))}
        {codes.map(c => (
           <CodeObject 
              key={c.id} 
              obj={c} 
              isSelected={selectedIds.includes(c.id)}
              onSelect={(e) => handleSmartObjectSelect(e, c.id)} 
              onChangeLanguage={(lang) => {
                 const newCodes = codes.map(code => code.id === c.id ? { ...code, language: lang } : code);
                 onUpdate({ codes: newCodes });
              }}
              onChangeText={(text) => {
                 const newCodes = codes.map(code => code.id === c.id ? { ...code, text } : code);
                 onUpdate({ codes: newCodes });
              }}
           />
        ))}
        {notes.map(n => (
           <NoteObject
              key={n.id}
              obj={n}
              isSelected={selectedIds.includes(n.id)}
              onSelect={(e) => handleSmartObjectSelect(e, n.id)}
              onChangeText={(text) => {
                 const newNotes = notes.map(note => note.id === n.id ? { ...note, text } : note);
                 onUpdate({ notes: newNotes });
              }}
           />
        ))}

         {codeblocks.map(cb => (
            <CodeBlockObject
               key={cb.id}
               obj={cb}
               isSelected={selectedIds.includes(cb.id)}
               onSelect={(e) => handleSmartObjectSelect(e, cb.id)}
               draggable={tool === 'select' && !isPanning.current}
               tool={tool}
               onUpdate={(updates) => {
                  console.log('[Whiteboard] CodeBlock onUpdate called with:', updates);
                  // Use functional form to avoid stale closure issues
                  // Only update the specific codeblock, don't touch other arrays
                  const newCodeBlocks = codeblocks.map(block =>
                    block.id === cb.id ? { ...block, ...updates } : block
                  );
                  console.log('[Whiteboard] Updating with codeblocks count:', newCodeBlocks.length);
                  onUpdate({
                    codeblocks: newCodeBlocks
                  });
               }}
               onCreateVisualization={(viz, codeBlockUpdates) => {
                  console.log('[Whiteboard] onCreateVisualization called with updates:', codeBlockUpdates);
                  // Single atomic update: new viz + updated codeblock
                  const newCodeBlocks = codeblocks.map(block =>
                    block.id === cb.id
                      ? { ...block, outputId: viz.id, ...codeBlockUpdates }
                      : block
                  );
                  onUpdate({
                    codeblocks: newCodeBlocks,
                    d3visualizations: [...d3visualizations, viz]
                  });
               }}
               onUpdateVisualization={(updates) => {
                  console.log('[Whiteboard] onUpdateVisualization called for:', updates.id);
                  const newVizs = d3visualizations.map(v => v.id === updates.id ? { ...v, ...updates } : v);
                  console.log('[Whiteboard] Updating with d3visualizations count:', newVizs.length);
                  onUpdate({ d3visualizations: newVizs });
               }}
            />
         ))}

         {d3visualizations.map(viz => (
            <D3VisualizationObject
               key={viz.id}
               obj={viz}
               isSelected={selectedIds.includes(viz.id)}
               onSelect={(e) => handleSmartObjectSelect(e, viz.id)}
               draggable={tool === 'select' && !isPanning.current}
               tool={tool}
            />
         ))}

        {images.map((img) => (
          <KonvaImage
            key={img.id}
            id={img.id}
            name="image"
            image={(() => {
               const i = new window.Image();
               i.src = img.src;
               return i;
            })()}
            x={img.x}
            y={img.y}
            width={img.width}
            height={img.height}
            rotation={img.rotation}
            draggable={tool === 'select' && !selectedIds.includes(img.id)}
            onDragEnd={handleDragEnd}
            onTransformEnd={handleTransformEnd}
          />
        ))}

        {strokes.map((stroke) => {
           if (stroke.tool === 'laser') {
              const age = Date.now() - (stroke.createdAt || 0);
              const opacity = Math.max(0, 1 - age / 1000);
              if (opacity <= 0) return null;
              const pathData = getSvgPathFromStroke(flatToPoints(stroke.points), stroke.size * 2, 0.1);
              return (
                 <Path
                    key={stroke.id}
                    id={stroke.id}
                    data={pathData}
                    fill={stroke.color}
                    opacity={opacity}
                    listening={false}
                 />
              );
           }
           if (stroke.tool === 'smooth-pen') {
              const pathData = getCalligraphyPath(flatToPoints(stroke.points), stroke.size);
              return (
                 <Path
                    key={stroke.id}
                    id={stroke.id}
                    name="stroke"
                    data={pathData}
                    fill={stroke.color}
                    draggable={tool === 'select'}
                    onDragStart={handleDragStart}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                    globalCompositeOperation="source-over"
                    hitStrokeWidth={20}
                    listening={true}
                    shadowColor="rgba(0,0,0,0.15)"
                    shadowBlur={1}
                    shadowOffset={{ x: 0.5, y: 0.5 }}
                    shadowOpacity={0.3}
                 />
              );
           }
           if (stroke.tool === 'highlighter') {
              return (
                <Line
                  key={stroke.id}
                  id={stroke.id}
                  name="stroke"
                  points={stroke.points}
                  stroke={stroke.color}
                  strokeWidth={stroke.size}
                  opacity={stroke.opacity || 0.3}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                  draggable={tool === 'select'}
                  onDragStart={handleDragStart}
                  onDragMove={handleDragMove}
                  onDragEnd={handleDragEnd}
                  globalCompositeOperation="source-over"
                  hitStrokeWidth={20}
                />
              );
           }
           return (
             <Line
               key={stroke.id}
               id={stroke.id}
               name="stroke"
               points={stroke.points}
               stroke={stroke.color}
               strokeWidth={stroke.size}
               tension={0.5}
               lineCap="round"
               lineJoin="round"
               draggable={tool === 'select'}
               onDragStart={handleDragStart}
               onDragMove={handleDragMove}
               onDragEnd={handleDragEnd}
               globalCompositeOperation={
                 stroke.tool === 'eraser' ? 'destination-out' : 'source-over'
               }
               hitStrokeWidth={20}
             />
           );
        })}
        
        {texts.map((txt) => (
           <Text
              key={txt.id}
              id={txt.id}
              name="text"
              x={txt.x}
              y={txt.y}
              text={txt.text}
              fontSize={txt.fontSize}
              fill={txt.color}
              draggable={tool === 'select' && !selectedIds.includes(txt.id)}
              onDragEnd={handleDragEnd}
              onTransformEnd={handleTransformEnd}
           />
        ))}
        
        {shapes.map((shp) => {
           if (shp.type === 'rect') {
              return <Rect
                 key={shp.id}
                 id={shp.id}
                 name="shape"
                 x={shp.x}
                 y={shp.y}
                 width={shp.width}
                 height={shp.height}
                 stroke={shp.color}
                 strokeWidth={shp.strokeWidth}
                 draggable={tool === 'select' && !selectedIds.includes(shp.id)}
                 onDragEnd={handleDragEnd}
                 onTransformEnd={handleTransformEnd}
              />;
           } else if (shp.type === 'circle') {
              return <Circle
                 key={shp.id}
                 id={shp.id}
                 name="shape"
                 x={shp.x}
                 y={shp.y}
                 radius={Math.abs((shp.width || 10) / 2)}
                 stroke={shp.color}
                 strokeWidth={shp.strokeWidth}
                 draggable={tool === 'select' && !selectedIds.includes(shp.id)}
                 onDragEnd={handleDragEnd}
                 onTransformEnd={handleTransformEnd}
              />;
           } else if (shp.type === 'arrow') {
              return <Arrow
                 key={shp.id}
                 id={shp.id}
                 name="shape"
                 x={shp.x}
                 y={shp.y}
                 points={shp.points || []}
                 stroke={shp.color}
                 strokeWidth={shp.strokeWidth}
                 fill={shp.color}
                 draggable={tool === 'select' && !selectedIds.includes(shp.id)}
                 onDragEnd={handleDragEnd}
                 onTransformEnd={handleTransformEnd}
              />;
           }
           return null;
        })}


        {/* Overlay per drag multi-selezione - segue il mouse */}
        {selectedIds.length > 0 && selectionOverlay && (
           <Rect
              name="selection-overlay"
              x={selectionOverlay.x}
              y={selectionOverlay.y}
              width={selectionOverlay.width}
              height={selectionOverlay.height}
              fill="rgba(0, 123, 255, 0.05)"
              stroke="rgba(0, 123, 255, 0.4)"
              strokeWidth={1}
              dash={[4, 4]}
              draggable={tool === 'select'}
              onDragStart={handleDragStart}
              onDragMove={handleDragMove}
              onDragEnd={handleDragEnd}
           />
        )}

        {selectionBox && (
           <Rect
              x={selectionBox.x}
              y={selectionBox.y}
              width={selectionBox.width}
              height={selectionBox.height}
              fill="rgba(0,0,255,0.1)"
              stroke="blue"
              strokeWidth={1}
           />
        )}

        <Transformer
           ref={transformerRef}
           boundBoxFunc={(oldBox, newBox) => {
             if (newBox.width < 5 || newBox.height < 5) return oldBox;
             return newBox;
           }}
        />
      </Layer>

      {/* Pointer/Spotlight Layer */}
      {tool === 'pointer' && pointerPos && (
        <Layer>
          <Rect
            x={-viewPos.x / zoom}
            y={-viewPos.y / zoom}
            width={window.innerWidth / zoom}
            height={window.innerHeight / zoom}
            fill="rgba(0, 0, 0, 0.7)"
            listening={false}
          />
          <Circle
            x={pointerPos.x}
            y={pointerPos.y}
            radius={size}
            fill="rgba(255, 255, 255, 0.1)"
            stroke="#FFD700"
            strokeWidth={3}
            shadowColor="rgba(255, 215, 0, 0.8)"
            shadowBlur={20}
            shadowOpacity={1}
            globalCompositeOperation="destination-out"
            listening={false}
          />
          <Circle
            x={pointerPos.x}
            y={pointerPos.y}
            radius={size}
            stroke="#FFD700"
            strokeWidth={3}
            shadowColor="rgba(255, 215, 0, 0.8)"
            shadowBlur={20}
            shadowOpacity={1}
            listening={false}
          />
        </Layer>
      )}

      {/* A4 Grid Overlay */}
      {a4GridVisible && (
        <A4Grid
          stageWidth={window.innerWidth}
          stageHeight={window.innerHeight}
          stageScale={zoom}
          stageX={viewPos.x}
          stageY={viewPos.y}
        />
      )}
    </Stage>
  );
};