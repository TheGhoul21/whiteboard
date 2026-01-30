import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Image as KonvaImage, Transformer, Text, Rect, Circle, Arrow, Path } from 'react-konva';
import Konva from 'konva';
import type { Stroke, ImageObj, TextObj, ShapeObj, ToolType, BackgroundType, LatexObj, CodeObj, NoteObj } from '../types';
import { getSvgPathFromStroke, flatToPoints, smoothPoints } from '../utils/stroke';
import { Background } from './Background';
import { LatexObject, CodeObject, NoteObject } from './SmartObjects';

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
  background: BackgroundType;
  onUpdate: (data: Partial<{ strokes: Stroke[], images: ImageObj[], texts: TextObj[], shapes: ShapeObj[], latex: LatexObj[], codes: CodeObj[], notes: NoteObj[] }> , overwrite?: boolean) => void;
  stageRef: React.RefObject<Konva.Stage | null>;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  zoom: number;
  setZoom: (z: number) => void;
  viewPos: { x: number, y: number };
  setViewPos: (pos: { x: number, y: number }) => void;
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
  background,
  onUpdate,
  stageRef,
  selectedIds,
  setSelectedIds,
  zoom,
  setZoom,
  viewPos,
  setViewPos
}) => {
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

     selectedIds.forEach(id => {
        const node = stageRef.current?.findOne('#' + id);
        if (node) {
           found = true;
           const box = node.getClientRect();
           minX = Math.min(minX, box.x);
           minY = Math.min(minY, box.y);
           maxX = Math.max(maxX, box.x + box.width);
           maxY = Math.max(maxY, box.y + box.height);
        }
     });

     if (!found) return null;
     return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  };

  // Update overlay when not dragging
  useEffect(() => {
     if (!isDraggingOverlay) {
        const bbox = getSelectionBBox();
        setSelectionOverlay(bbox);
     }
  }, [selectedIds, strokes, images, texts, shapes, latex, codes, notes, isDraggingOverlay]);

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
  }, [selectedIds, strokes, images, texts, shapes, latex, codes, notes]);

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

      // If clicking on background but we have selection, check if overlay exists
      // Don't clear selection immediately - wait for mouse move to confirm box selection
      const isModifier = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
      if (!isModifier && selectedIds.length === 0) {
         // No selection, start box selection
         isSelecting.current = true;
         selectionStart.current = pos;
         setSelectionBox({ x: pos.x, y: pos.y, width: 0, height: 0 });
      } else if (!isModifier) {
         // Has selection - start potential box selection but clear only on move
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
          const stage = stageRef.current;
          const allIds: string[] = [];
          const overlaps = (nodeBox: {x:number, y:number, width:number, height:number}) => {
             return (
                box.x < nodeBox.x + nodeBox.width &&
                box.x + box.width > nodeBox.x &&
                box.y < nodeBox.y + nodeBox.height &&
                box.y + box.height > nodeBox.y
             );
          };
          stage.find('.image').forEach(node => { if (overlaps(node.getClientRect())) allIds.push(node.id()); });
          stage.find('.stroke').forEach(node => { if (overlaps(node.getClientRect())) allIds.push(node.id()); });
          stage.find('.text').forEach(node => { if (overlaps(node.getClientRect())) allIds.push(node.id()); });
          stage.find('.shape').forEach(node => { if (overlaps(node.getClientRect())) allIds.push(node.id()); });
          stage.find('Group').forEach(node => {
             if (node.id() && overlaps(node.getClientRect())) allIds.push(node.id());
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
           const original = [...images, ...texts, ...shapes, ...latex, ...codes, ...notes].find(o => o.id === selId);
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
           notes: newNotes
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
        const original = [...images, ...texts, ...shapes, ...latex, ...codes, ...notes].find(o => o.id === id);
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
        notes: newNotes
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
              const pathData = getSvgPathFromStroke(flatToPoints(stroke.points), stroke.size, 0.25);
              return (
                 <Path
                    key={stroke.id}
                    id={stroke.id}
                    name="stroke"
                    data={pathData}
                    fill={stroke.color}
                    draggable={tool === 'select' && !selectedIds.includes(stroke.id)}
                    onDragEnd={handleDragEnd}
                    globalCompositeOperation="source-over"
                    hitStrokeWidth={20}
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
    </Stage>
  );
};