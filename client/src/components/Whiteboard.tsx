import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Line, Image as KonvaImage, Transformer, Text, Rect, Circle, Arrow, Path } from 'react-konva';
import Konva from 'konva';
import type { Stroke, ImageObj, TextObj, ShapeObj, ToolType, BackgroundType, LatexObj, CodeObj, NoteObj, CodeBlockObj, D3VisualizationObj, Animation, Keyframe, BoardAPI } from '../types';
import { getSvgPathFromStroke, getCalligraphyPath, flatToPoints, getSmoothLinePath, getRoughRectPath, getRoughCirclePath, getRoughArrowPath } from '../utils/stroke';
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
  animations: Animation[];
  background: BackgroundType;
  onUpdate: (data: Partial<{ strokes: Stroke[], images: ImageObj[], texts: TextObj[], shapes: ShapeObj[], latex: LatexObj[], codes: CodeObj[], notes: NoteObj[], codeblocks: CodeBlockObj[], d3visualizations: D3VisualizationObj[], animations: Animation[] }>, overwrite?: boolean) => void;
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
  animations = [],
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
  const lastPointerPos = useRef<{ x: number, y: number } | null>(null);
  const selectionStart = useRef<{ x: number, y: number } | null>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [selectionBox, setSelectionBox] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
  const [pointerPos, setPointerPos] = useState<{ x: number, y: number } | null>(null);
  const [isDraggingOverlay, setIsDraggingOverlay] = useState(false);

  const overlayDragStart = useRef<{ x: number, y: number } | null>(null);

  const [selectionOverlay, setSelectionOverlay] = useState<{ x: number, y: number, width: number, height: number } | null>(null);

  // Helper function to detect if a stroke is a rough square/rectangle
  const detectSquareShape = (points: number[]): { isSquare: boolean, bounds?: { x: number, y: number, width: number, height: number } } => {
    if (points.length < 10) return { isSquare: false }; // Need at least 5 points (10 coordinates)

    // Check if stroke is closed (start and end points are close)
    const startX = points[0];
    const startY = points[1];
    const endX = points[points.length - 2];
    const endY = points[points.length - 1];
    const closingDistance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);

    // Get bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let i = 0; i < points.length; i += 2) {
      minX = Math.min(minX, points[i]);
      maxX = Math.max(maxX, points[i]);
      minY = Math.min(minY, points[i + 1]);
      maxY = Math.max(maxY, points[i + 1]);
    }

    const width = maxX - minX;
    const height = maxY - minY;
    const diagonal = Math.sqrt(width ** 2 + height ** 2);

    // Must be closed (end near start, within 15% of diagonal)
    if (closingDistance > diagonal * 0.15) return { isSquare: false };

    // Define corners
    const corners = [
      { x: minX, y: minY }, // top-left
      { x: maxX, y: minY }, // top-right
      { x: maxX, y: maxY }, // bottom-right
      { x: minX, y: maxY }  // bottom-left
    ];

    // Count points near each corner (within 20% of diagonal)
    const cornerThreshold = diagonal * 0.20;
    const cornerHits = corners.map(corner => {
      let count = 0;
      for (let i = 0; i < points.length; i += 2) {
        const dist = Math.sqrt((points[i] - corner.x) ** 2 + (points[i + 1] - corner.y) ** 2);
        if (dist < cornerThreshold) count++;
      }
      return count;
    });

    // All 4 corners should have at least 1 point nearby
    const hasAllCorners = cornerHits.every(count => count > 0);

    // Calculate how much of the stroke follows the perimeter
    let perimeterPoints = 0;
    const edgeThreshold = Math.min(width, height) * 0.15; // 15% of smaller dimension

    for (let i = 0; i < points.length; i += 2) {
      const x = points[i];
      const y = points[i + 1];

      // Check if point is near any edge
      const nearLeft = Math.abs(x - minX) < edgeThreshold;
      const nearRight = Math.abs(x - maxX) < edgeThreshold;
      const nearTop = Math.abs(y - minY) < edgeThreshold;
      const nearBottom = Math.abs(y - maxY) < edgeThreshold;

      if ((nearLeft || nearRight) || (nearTop || nearBottom)) {
        perimeterPoints++;
      }
    }

    const perimeterRatio = perimeterPoints / (points.length / 2);

    // It's a square if:
    // 1. Stroke is closed
    // 2. All 4 corners are touched
    // 3. At least 70% of points are near the perimeter
    // 4. Width and height are at least 20px (not too small)
    const isSquare = hasAllCorners && perimeterRatio > 0.7 && width > 20 && height > 20;

    return {
      isSquare,
      bounds: isSquare ? { x: minX, y: minY, width, height } : undefined
    };
  };

  const getCursorForTool = (tool: ToolType): string => {
    switch (tool) {
      case 'select':
        return 'default';
      case 'hand':
        return `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2"><path d="M18 11V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7m0 0h3m-3 0l3-3m0 0v3"/></svg>') 12 12, auto`;
      case 'pen':
      case 'smooth-pen':
        return `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="%23000" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z M9 11l-2 2"/></svg>') 2 2, crosshair`;
      case 'highlighter':
        return `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="%23ffeb3b" stroke="%23f57c00" stroke-width="1"><path d="M2 12l2-2 7 7-2 2L2 12z M21 3l-7 7-3-3 7-7 3 3z"/></svg>') 10 10, crosshair`;
      case 'eraser':
        return `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="%23ffffff" stroke="black" stroke-width="2" stroke-linejoin="round"><rect x="2" y="12" width="20" height="8" rx="1"/><path d="M20 12l-6-6-4 4 6 6 4-4z"/></svg>') 10 10, auto`;
      case 'laser':
        return `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><circle cx="12" cy="12" r="2" fill="red"/><path d="M12 2v6M12 16v6" stroke="red" stroke-width="2"/><path d="M2 12h6M16 12h6" stroke="red" stroke-width="2"/></svg>') 8 8, crosshair`;
      case 'pointer':
        return 'none';
      case 'text':
        return 'text';
      case 'rect':
        return `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>') 8 8, crosshair`;
      case 'circle':
        return `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg>') 8 8, crosshair`;
      case 'arrow':
        return `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2"><path d="M5 12h14m-7-7l7 7-7 7"/></svg>') 10 10, crosshair`;
      default:
        return 'default';
    }
  };

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
        const activeStrokes = strokes.filter(s => s.tool !== 'laser' || (s.createdAt && now - s.createdAt < 15000));
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
        stage.scale({ x: zoom, y: zoom });
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


  useEffect(() => {
    // Global mouseup handler to ensure selection finishes even if released outside or swallowed
    const handleGlobalMouseUp = (e: any) => {
      if (isSelecting.current && selectionBox) {
        // Only process box selection if user actually moved (box has size)
        if (selectionBox.width > 3 || selectionBox.height > 3) {
          try {
            const box = selectionBox;
            const allIds: string[] = [];

            const overlaps = (objBox: { x: number, y: number, width: number, height: number }) => {
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

              if (minX === Infinity) return;

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

            const isModifier = e.shiftKey || e.ctrlKey || e.metaKey;

            if (isModifier) {
              const uniqueIds = Array.from(new Set([...selectedIds, ...allIds]));
              setSelectedIds(uniqueIds);
            } else {
              setSelectedIds(allIds);
            }
          } catch (err) {
            console.error('Selection error:', err);
          }
        }

        setSelectionBox(null);
        isSelecting.current = false;
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, [selectionBox, strokes, images, texts, shapes, latex, codes, notes, codeblocks, d3visualizations, selectedIds]);

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
        // Calculate max z-index considering default z-indexes during rendering
        const getEffectiveZIndex = (obj: any, type: string, index: number): number => {
          if (obj.zIndex !== undefined) return obj.zIndex;
          const baseZIndexes: Record<string, number> = {
            'stroke': 0, 'image': 1000, 'text': 2000, 'shape': 3000,
            'latex': 4000, 'code': 5000, 'note': 6000, 'codeblock': 7000, 'd3viz': 8000
          };
          return (baseZIndexes[type] || 0) + index;
        };

        const maxZ = Math.max(
          ...strokes.map((s, i) => getEffectiveZIndex(s, 'stroke', i)),
          ...images.map((img, i) => getEffectiveZIndex(img, 'image', i)),
          ...texts.map((t, i) => getEffectiveZIndex(t, 'text', i)),
          ...shapes.map((s, i) => getEffectiveZIndex(s, 'shape', i)),
          ...latex.map((l, i) => getEffectiveZIndex(l, 'latex', i)),
          ...codes.map((c, i) => getEffectiveZIndex(c, 'code', i)),
          ...notes.map((n, i) => getEffectiveZIndex(n, 'note', i)),
          ...codeblocks.map((cb, i) => getEffectiveZIndex(cb, 'codeblock', i)),
          ...d3visualizations.map((v, i) => getEffectiveZIndex(v, 'd3viz', i)),
          0
        );

        const newText: TextObj = {
          id: Date.now().toString(),
          type: 'text',
          x: pos.x,
          y: pos.y,
          text: text,
          fontSize: size * 5,
          color: color,
          zIndex: maxZ + 1  // Place new text on top
        };
        onUpdate({ texts: [...texts, newText] });
        setTool('select');
      }
      isDrawing.current = false;
      return;
    }

    if (tool === 'pen' || tool === 'smooth-pen' || tool === 'highlighter' || tool === 'eraser' || tool === 'laser') {
      // Calculate max z-index considering default z-indexes during rendering
      const getEffectiveZIndex = (obj: any, type: string, index: number): number => {
        if (obj.zIndex !== undefined) return obj.zIndex;
        const baseZIndexes: Record<string, number> = {
          'stroke': 0, 'image': 1000, 'text': 2000, 'shape': 3000,
          'latex': 4000, 'code': 5000, 'note': 6000, 'codeblock': 7000, 'd3viz': 8000
        };
        return (baseZIndexes[type] || 0) + index;
      };

      const maxZ = Math.max(
        ...strokes.map((s, i) => getEffectiveZIndex(s, 'stroke', i)),
        ...images.map((img, i) => getEffectiveZIndex(img, 'image', i)),
        ...texts.map((t, i) => getEffectiveZIndex(t, 'text', i)),
        ...shapes.map((s, i) => getEffectiveZIndex(s, 'shape', i)),
        ...latex.map((l, i) => getEffectiveZIndex(l, 'latex', i)),
        ...codes.map((c, i) => getEffectiveZIndex(c, 'code', i)),
        ...notes.map((n, i) => getEffectiveZIndex(n, 'note', i)),
        ...codeblocks.map((cb, i) => getEffectiveZIndex(cb, 'codeblock', i)),
        ...d3visualizations.map((v, i) => getEffectiveZIndex(v, 'd3viz', i)),
        0
      );

      const newStroke: Stroke = {
        id: Date.now().toString(),
        tool: tool,
        color: tool === 'laser' ? 'red' : color,
        size: size,
        opacity: tool === 'highlighter' ? 0.3 : 1,
        points: [pos.x, pos.y],
        createdAt: tool === 'laser' ? Date.now() : undefined,
        zIndex: maxZ + 1  // Place new stroke on top
      };
      onUpdate({ strokes: [...strokes, newStroke] });
    }

    if (tool === 'rect' || tool === 'circle' || tool === 'arrow') {
      // Calculate max z-index considering default z-indexes during rendering
      const getEffectiveZIndex = (obj: any, type: string, index: number): number => {
        if (obj.zIndex !== undefined) return obj.zIndex;
        const baseZIndexes: Record<string, number> = {
          'stroke': 0, 'image': 1000, 'text': 2000, 'shape': 3000,
          'latex': 4000, 'code': 5000, 'note': 6000, 'codeblock': 7000, 'd3viz': 8000
        };
        return (baseZIndexes[type] || 0) + index;
      };

      const maxZ = Math.max(
        ...strokes.map((s, i) => getEffectiveZIndex(s, 'stroke', i)),
        ...images.map((img, i) => getEffectiveZIndex(img, 'image', i)),
        ...texts.map((t, i) => getEffectiveZIndex(t, 'text', i)),
        ...shapes.map((s, i) => getEffectiveZIndex(s, 'shape', i)),
        ...latex.map((l, i) => getEffectiveZIndex(l, 'latex', i)),
        ...codes.map((c, i) => getEffectiveZIndex(c, 'code', i)),
        ...notes.map((n, i) => getEffectiveZIndex(n, 'note', i)),
        ...codeblocks.map((cb, i) => getEffectiveZIndex(cb, 'codeblock', i)),
        ...d3visualizations.map((v, i) => getEffectiveZIndex(v, 'd3viz', i)),
        0
      );

      const newShape: ShapeObj = {
        id: Date.now().toString(),
        type: tool,
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        points: [0, 0, 0, 0],
        color: color,
        strokeWidth: size,
        zIndex: maxZ + 1  // Place new shape on top
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

      const points = lastStroke.points;
      let newPoints: number[];

      // If Shift is held, draw a straight line from start to current position
      if (e.evt.shiftKey && points.length >= 2) {
        const startX = points[0];
        const startY = points[1];
        newPoints = [startX, startY, pos.x, pos.y];
      } else {
        // Normal drawing - add points progressively
        // For small writing, we need MORE points, not fewer - only skip extremely close duplicates
        // Use 2 for pen to balance detail with the new bezier smoothing
        const minDistance = tool === 'pen' ? 2 : 0.5;
        if (points.length >= 2) {
          const lastX = points[points.length - 2];
          const lastY = points[points.length - 1];
          const dist = Math.sqrt((pos.x - lastX) ** 2 + (pos.y - lastY) ** 2);
          if (dist < minDistance) return;
        }
        newPoints = lastStroke.points.concat([pos.x, pos.y]);
      }

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

    if (isSelecting.current && selectionBox) {
      if (selectionBox.width > 3 || selectionBox.height > 3) {
        const box = selectionBox;
        const allIds: string[] = [];

        const overlaps = (objBox: { x: number, y: number, width: number, height: number }) => {
          return (
            box.x < objBox.x + objBox.width &&
            box.x + box.width > objBox.x &&
            box.y < objBox.y + objBox.height &&
            box.y + box.height > objBox.y
          );
        };

        strokes.forEach(stroke => {
          if (stroke.tool === 'laser') return;
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          for (let i = 0; i < stroke.points.length; i += 2) {
            minX = Math.min(minX, stroke.points[i]);
            maxX = Math.max(maxX, stroke.points[i]);
            minY = Math.min(minY, stroke.points[i + 1]);
            maxY = Math.max(maxY, stroke.points[i + 1]);
          }
          if (minX !== Infinity && overlaps({
            x: minX - stroke.size / 2,
            y: minY - stroke.size / 2,
            width: maxX - minX + stroke.size,
            height: maxY - minY + stroke.size
          })) allIds.push(stroke.id);
        });

        images.forEach(img => {
          if (overlaps({ x: img.x, y: img.y, width: img.width, height: img.height })) allIds.push(img.id);
        });

        texts.forEach(txt => {
          const w = txt.text.length * (txt.fontSize * 0.6);
          const h = txt.fontSize * 1.2;
          if (overlaps({ x: txt.x, y: txt.y, width: w, height: h })) allIds.push(txt.id);
        });

        shapes.forEach(shape => {
          if (overlaps({ x: shape.x, y: shape.y, width: shape.width || 50, height: shape.height || 50 })) allIds.push(shape.id);
        });

        [...latex, ...codes, ...notes, ...codeblocks, ...d3visualizations].forEach(obj => {
          const w = 'width' in obj ? obj.width : 100;
          const h = 'height' in obj ? obj.height : 40;
          if (overlaps({ x: obj.x, y: obj.y, width: w, height: h })) allIds.push(obj.id);
        });

        const isModifier = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
        if (isModifier) {
          setSelectedIds(Array.from(new Set([...selectedIds, ...allIds])));
        } else {
          setSelectedIds(allIds);
        }
      }
      setSelectionBox(null);
      isSelecting.current = false;
    }

    // Handle single-point strokes (dots)
    if (isDrawing.current && (tool === 'pen' || tool === 'smooth-pen' || tool === 'highlighter' || tool === 'eraser')) {
      const lastStroke = strokes[strokes.length - 1];
      if (lastStroke && lastStroke.points.length <= 4) {
        let isEssentiallyAPoint = lastStroke.points.length === 2;
        if (lastStroke.points.length === 4) {
          const dx = lastStroke.points[2] - lastStroke.points[0];
          const dy = lastStroke.points[3] - lastStroke.points[1];
          isEssentiallyAPoint = Math.sqrt(dx * dx + dy * dy) < lastStroke.size * 0.3;
        }
        if (isEssentiallyAPoint) {
          const x = lastStroke.points[0];
          const y = lastStroke.points[1];
          const updatedStroke = { ...lastStroke, points: [x, y, x + 0.1, y + 0.1] };
          onUpdate({ strokes: [...strokes.slice(0, -1), updatedStroke] }, true);
        }
      }
    }

    // Auto-detect and convert rough squares to perfect rectangles
    if (isDrawing.current && (tool === 'pen' || tool === 'smooth-pen')) {
      const lastStroke = strokes[strokes.length - 1];
      if (lastStroke && lastStroke.points.length > 10) {
        const detection = detectSquareShape(lastStroke.points);
        if (detection.isSquare && detection.bounds) {
          // Remove the stroke and create a perfect rectangle shape
          const newShape: ShapeObj = {
            id: Date.now().toString(),
            type: 'rect',
            x: detection.bounds.x,
            y: detection.bounds.y,
            width: detection.bounds.width,
            height: detection.bounds.height,
            points: [0, 0, 0, 0],
            color: lastStroke.color,
            strokeWidth: lastStroke.size
          };
          onUpdate({
            strokes: strokes.slice(0, -1), // Remove the rough stroke
            shapes: [...shapes, newShape]   // Add perfect rectangle
          }, true);
        }
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
    if (tool === 'hand') return;

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
    if (tool === 'hand') {
      if (e.target === e.target.getStage()) {
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
          for (let i = 0; i < s.points.length; i += 2) {
            newPoints.push(s.points[i] + dx);
            newPoints.push(s.points[i + 1] + dy);
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
        for (let i = 0; i < s.points.length; i += 2) {
          newPoints.push(s.points[i] + dx);
          newPoints.push(s.points[i + 1] + dy);
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
        node.scale({ x: 1, y: 1 });
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
        node.scale({ x: 1, y: 1 });
      }

      const txtIndex = newTexts.findIndex(t => t.id === id);
      if (txtIndex !== -1) {
        newTexts[txtIndex] = {
          ...newTexts[txtIndex],
          x, y,
          fontSize: newTexts[txtIndex].fontSize * scaleY
        };
        node.scale({ x: 1, y: 1 });
      }

      const ltIndex = newLatex.findIndex(l => l.id === id);
      if (ltIndex !== -1) {
        newLatex[ltIndex] = {
          ...newLatex[ltIndex],
          x, y,
          fontSize: newLatex[ltIndex].fontSize * scaleY
        };
        node.scale({ x: 1, y: 1 });
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
        node.scale({ x: 1, y: 1 });
      }

      const ntIndex = newNotes.findIndex(n => n.id === id);
      if (ntIndex !== -1) {
        newNotes[ntIndex] = {
          ...newNotes[ntIndex],
          x, y,
          width: newNotes[ntIndex].width * scaleX,
          height: newNotes[ntIndex].height * scaleY
        };
        node.scale({ x: 1, y: 1 });
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

  // Helper to get default z-index for object type
  const getDefaultZIndex = (type: string, index: number): number => {
    const baseZIndexes: Record<string, number> = {
      'stroke': 0,
      'image': 1000,
      'text': 2000,
      'shape': 3000,
      'latex': 4000,
      'code': 5000,
      'note': 6000,
      'codeblock': 7000,
      'd3viz': 8000
    };
    return (baseZIndexes[type] || 0) + index;
  };

  // Create sorted array of all renderable objects with z-index
  interface RenderableObject {
    id: string;
    zIndex: number;
    type: string;
    data: any;
  }

  const renderableObjects: RenderableObject[] = [
    ...strokes.map((s, i) => ({
      id: s.id,
      zIndex: s.zIndex ?? getDefaultZIndex('stroke', i),
      type: 'stroke',
      data: s
    })),
    ...images.map((img, i) => ({
      id: img.id,
      zIndex: img.zIndex ?? getDefaultZIndex('image', i),
      type: 'image',
      data: img
    })),
    ...texts.map((txt, i) => ({
      id: txt.id,
      zIndex: txt.zIndex ?? getDefaultZIndex('text', i),
      type: 'text',
      data: txt
    })),
    ...shapes.map((shp, i) => ({
      id: shp.id,
      zIndex: shp.zIndex ?? getDefaultZIndex('shape', i),
      type: 'shape',
      data: shp
    })),
    ...latex.map((l, i) => ({
      id: l.id,
      zIndex: l.zIndex ?? getDefaultZIndex('latex', i),
      type: 'latex',
      data: l
    })),
    ...codes.map((c, i) => ({
      id: c.id,
      zIndex: c.zIndex ?? getDefaultZIndex('code', i),
      type: 'code',
      data: c
    })),
    ...notes.map((n, i) => ({
      id: n.id,
      zIndex: n.zIndex ?? getDefaultZIndex('note', i),
      type: 'note',
      data: n
    })),
    ...codeblocks.map((cb, i) => ({
      id: cb.id,
      zIndex: cb.zIndex ?? getDefaultZIndex('codeblock', i),
      type: 'codeblock',
      data: cb
    })),
    ...d3visualizations.map((viz, i) => ({
      id: viz.id,
      zIndex: viz.zIndex ?? getDefaultZIndex('d3viz', i),
      type: 'd3viz',
      data: viz
    }))
  ];

  // Sort by z-index
  renderableObjects.sort((a, b) => a.zIndex - b.zIndex);

  // Helper to create Board API for a specific code block
  const createBoardAPI = useCallback((codeBlock: CodeBlockObj): BoardAPI => {
    console.log('[BoardAPI] Creating board API for code block:', codeBlock.id);
    return {
      // Reading elements
      getImages: () => images.map(({ type, ...rest }) => rest),
      getTexts: () => texts.map(({ type, ...rest }) => rest),
      getShapes: () => {
        console.log('[BoardAPI] getShapes called, count:', shapes.length);
        return shapes.map(({ type, ...rest }) => rest);
      },
      getLatex: () => latex.map(({ type, ...rest }) => rest),
      getStrokes: () => strokes,
      getVisualizations: () => d3visualizations.map(({ type, ...rest }) => rest),
      getAll: () => ({
        images: images.map(({ type, ...rest }) => rest),
        texts: texts.map(({ type, ...rest }) => rest),
        shapes: shapes.map(({ type, ...rest }) => rest),
        latex: latex.map(({ type, ...rest }) => rest),
        strokes: strokes,
        visualizations: d3visualizations.map(({ type, ...rest }) => rest)
      }),

      // Creating elements
      addImage: (props) => {
        const id = `img-${Date.now()}-${Math.random()}`;
        const newImage: ImageObj = {
          id,
          type: 'image',
          src: props.src || '',
          x: props.x ?? 0,
          y: props.y ?? 0,
          width: props.width ?? 200,
          height: props.height ?? 200,
          rotation: props.rotation ?? 0,
          zIndex: props.zIndex
        };
        onUpdate({ images: [...images, newImage] });
        return id;
      },

      addText: (props) => {
        const id = `txt-${Date.now()}-${Math.random()}`;
        const newText: TextObj = {
          id,
          type: 'text',
          text: props.text || '',
          x: props.x ?? 0,
          y: props.y ?? 0,
          fontSize: props.fontSize ?? 16,
          color: props.color || '#000000',
          zIndex: props.zIndex
        };
        onUpdate({ texts: [...texts, newText] });
        return id;
      },

      addShape: (props) => {
        console.log('[BoardAPI] addShape called with:', props);
        const id = `shp-${Date.now()}-${Math.random()}`;
        const shapeType = (props as any).type || 'rect';
        const newShape: ShapeObj = {
          id,
          type: shapeType,
          x: props.x ?? 0,
          y: props.y ?? 0,
          width: props.width ?? 100,
          height: props.height ?? 100,
          points: props.points,
          color: props.color || '#000000',
          strokeWidth: props.strokeWidth ?? 2,
          zIndex: props.zIndex
        };
        console.log('[BoardAPI] Creating shape:', newShape);
        console.log('[BoardAPI] Current shapes count:', shapes.length);
        onUpdate({ shapes: [...shapes, newShape] });
        console.log('[BoardAPI] Update called, returning ID:', id);
        return id;
      },

      addLatex: (props) => {
        const id = `ltx-${Date.now()}-${Math.random()}`;
        const newLatex: LatexObj = {
          id,
          type: 'latex',
          text: props.text || '',
          x: props.x ?? 0,
          y: props.y ?? 0,
          fontSize: props.fontSize ?? 16,
          color: props.color || '#000000',
          zIndex: props.zIndex
        };
        onUpdate({ latex: [...latex, newLatex] });
        return id;
      },

      // Updating elements
      updateElement: (id, updates) => {
        // Find and update the element across all arrays
        const newImages = images.map(img => img.id === id ? { ...img, ...updates } : img);
        const newTexts = texts.map(txt => txt.id === id ? { ...txt, ...updates } : txt);
        const newShapes = shapes.map(shp => shp.id === id ? { ...shp, ...updates } : shp);
        const newLatex = latex.map(ltx => ltx.id === id ? { ...ltx, ...updates } : ltx);
        const newStrokes = strokes.map(str => str.id === id ? { ...str, ...updates } : str);
        const newVizs = d3visualizations.map(viz => viz.id === id ? { ...viz, ...updates } : viz);

        onUpdate({
          images: newImages,
          texts: newTexts,
          shapes: newShapes,
          latex: newLatex,
          strokes: newStrokes,
          d3visualizations: newVizs
        });
      },

      // Deleting elements
      deleteElement: (id) => {
        onUpdate({
          images: images.filter(img => img.id !== id),
          texts: texts.filter(txt => txt.id !== id),
          shapes: shapes.filter(shp => shp.id !== id),
          latex: latex.filter(ltx => ltx.id !== id),
          strokes: strokes.filter(str => str.id !== id),
          d3visualizations: d3visualizations.filter(viz => viz.id !== id)
        });
      },

      // Utility
      getViewport: () => ({
        x: viewPos.x,
        y: viewPos.y,
        zoom: zoom
      }),

      getCodeBlockPosition: () => ({
        x: codeBlock.x,
        y: codeBlock.y,
        width: codeBlock.width,
        height: codeBlock.height
      })
    };
  }, [images, texts, shapes, latex, strokes, d3visualizations, onUpdate]);

  // Render helper function
  const renderObject = (obj: RenderableObject): JSX.Element | null => {
    const { type, data } = obj;

    if (type === 'stroke') {
      const stroke = data as Stroke;
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
      if (stroke.tool === 'pen') {
        return (
          <Path
            key={stroke.id}
            id={stroke.id}
            name="stroke"
            data={getSmoothLinePath(stroke.points)}
            stroke={stroke.color}
            strokeWidth={stroke.size}
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
    }

    if (type === 'image') {
      const img = data as ImageObj;
      return (
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
      );
    }

    if (type === 'text') {
      const txt = data as TextObj;
      return (
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
      );
    }

    if (type === 'shape') {
      const shp = data as ShapeObj;
      if (shp.type === 'rect') {
        const pathData = getRoughRectPath(
          shp.x,
          shp.y,
          shp.width || 100,
          shp.height || 100,
          shp.strokeWidth
        );
        return (
          <Path
            key={shp.id}
            id={shp.id}
            name="shape"
            data={pathData}
            fill={shp.color}
            draggable={tool === 'select' && !selectedIds.includes(shp.id)}
            onDragEnd={handleDragEnd}
            onTransformEnd={handleTransformEnd}
          />
        );
      } else if (shp.type === 'circle') {
        const radius = Math.abs((shp.width || 10) / 2);
        const pathData = getRoughCirclePath(
          shp.x + radius,
          shp.y + radius,
          radius,
          shp.strokeWidth
        );
        return (
          <Path
            key={shp.id}
            id={shp.id}
            name="shape"
            data={pathData}
            fill={shp.color}
            draggable={tool === 'select' && !selectedIds.includes(shp.id)}
            onDragEnd={handleDragEnd}
            onTransformEnd={handleTransformEnd}
          />
        );
      } else if (shp.type === 'arrow') {
        const pathData = getRoughArrowPath(
          shp.x,
          shp.y,
          shp.points || [0, 0, 100, 100],
          shp.strokeWidth
        );
        return (
          <Path
            key={shp.id}
            id={shp.id}
            name="shape"
            data={pathData}
            fill={shp.color}
            draggable={tool === 'select' && !selectedIds.includes(shp.id)}
            onDragEnd={handleDragEnd}
            onTransformEnd={handleTransformEnd}
          />
        );
      }
      return null;
    }

    if (type === 'latex') {
      const l = data as LatexObj;
      return (
        <LatexObject
          key={l.id}
          obj={l}
          isSelected={selectedIds.includes(l.id)}
          onSelect={(e) => handleSmartObjectSelect(e, l.id)}
        />
      );
    }

    if (type === 'code') {
      const c = data as CodeObj;
      return (
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
      );
    }

    if (type === 'note') {
      const n = data as NoteObj;
      return (
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
      );
    }

    if (type === 'codeblock') {
      const cb = data as CodeBlockObj;
      const boardAPI = createBoardAPI(cb);

      return (
        <CodeBlockObject
          key={cb.id}
          obj={cb}
          isSelected={selectedIds.includes(cb.id)}
          onSelect={(e) => handleSmartObjectSelect(e, cb.id)}
          draggable={tool === 'select' && !isPanning.current}
          tool={tool}
          onUpdate={(updates) => {
            console.log('[Whiteboard] CodeBlock onUpdate called with:', updates);

            let newVizs = d3visualizations;
            const cleanUpdates = { ...updates };

            // Handle visualization content update first so newVizs is up to date
            if ((updates as any).__visualizationUpdate) {
              const vizUpdate = (updates as any).__visualizationUpdate;
              newVizs = newVizs.map(v =>
                v.id === vizUpdate.id ? { ...v, ...vizUpdate } : v
              );
              delete (cleanUpdates as any).__visualizationUpdate;
            }

            // Handle programmatic animation — attach to the target viz
            if ((updates as any).__programmaticAnimation) {
              const newAnim = (updates as any).__programmaticAnimation;
              if ((updates as any).__visualizationUpdate) {
                const vizId = (updates as any).__visualizationUpdate.id;
                newVizs = newVizs.map(v => v.id === vizId ? { ...v, animation: newAnim } : v);
              }
              delete (cleanUpdates as any).__programmaticAnimation;
              delete (cleanUpdates as any).animationId;
            }

            const newCodeBlocks = codeblocks.map(block =>
              block.id === cb.id ? { ...block, ...cleanUpdates } : block
            );

            onUpdate({
              codeblocks: newCodeBlocks,
              d3visualizations: newVizs
            });
          }}
          onCreateVisualization={(viz, codeBlockUpdates) => {
            console.log('[Whiteboard] onCreateVisualization called with updates:', codeBlockUpdates);
            // Extract animation and attach to the new viz (not global array)
            let finalViz = viz;
            const cleanCBUpdates = { ...codeBlockUpdates };
            if ((cleanCBUpdates as any).__programmaticAnimation) {
              finalViz = { ...viz, animation: (cleanCBUpdates as any).__programmaticAnimation };
              delete (cleanCBUpdates as any).__programmaticAnimation;
              delete (cleanCBUpdates as any).animationId;
            }

            const newCodeBlocks = codeblocks.map(block =>
              block.id === cb.id
                ? { ...block, outputId: finalViz.id, ...cleanCBUpdates }
                : block
            );
            onUpdate({
              codeblocks: newCodeBlocks,
              d3visualizations: [...d3visualizations, finalViz]
            });
          }}
          boardAPI={boardAPI}
        />
      );
    }

    if (type === 'd3viz') {
      const viz = data as D3VisualizationObj;
      const sourceCodeBlock = codeblocks.find(cb => cb.id === viz.sourceCodeBlockId);
      const sourceCodeBlockSelected = viz.sourceCodeBlockId
        ? selectedIds.includes(viz.sourceCodeBlockId)
        : false;
      return (
        <D3VisualizationObject
          key={viz.id}
          obj={viz}
          isSelected={selectedIds.includes(viz.id)}
          sourceCodeBlockSelected={sourceCodeBlockSelected}
          onSelect={(e) => handleSmartObjectSelect(e, viz.id)}
          draggable={tool === 'select' && !isPanning.current}
          tool={tool}
          sourceCodeBlock={sourceCodeBlock}
          onUpdateControl={(controlLabel, value) => {
            if (!sourceCodeBlock) return;
            const newControlValues = { ...viz.controlValues, [controlLabel]: value };
            const newVizs = d3visualizations.map(v =>
              v.id === viz.id ? { ...v, controlValues: newControlValues } : v
            );
            // Trigger re-execution of the source code block targeting this viz
            const newCodeBlocks = codeblocks.map(block =>
              block.id === sourceCodeBlock.id
                ? {
                  ...block,
                  executionContext: { vizId: viz.id, controlValues: newControlValues },
                  executionTrigger: Date.now()
                }
                : block
            );
            onUpdate({ d3visualizations: newVizs, codeblocks: newCodeBlocks });
          }}
          onRefresh={() => {
            if (!sourceCodeBlock) return;

            // Execute with this visualization's control values WITHOUT modifying code block controls
            const vizControlValues = viz.controlValues || {};

            // Set execution context to update only this specific visualization
            const updatedCodeBlock = {
              ...sourceCodeBlock,
              executionContext: {
                vizId: viz.id,
                controlValues: vizControlValues
              },
              executionTrigger: Date.now()
            };

            const newCodeBlocks = codeblocks.map(block =>
              block.id === sourceCodeBlock.id ? updatedCodeBlock : block
            );

            onUpdate({ codeblocks: newCodeBlocks });
          }}
          onToggleControls={() => {
            const newVizs = d3visualizations.map(v =>
              v.id === viz.id ? { ...v, showControls: !v.showControls } : v
            );
            onUpdate({ d3visualizations: newVizs });
          }}
          onResetToDefaults={() => {
            // Reset visualization control values to match code block defaults
            if (!sourceCodeBlock?.controls) return;

            const defaultValues: Record<string, any> = {};
            sourceCodeBlock.controls.forEach(control => {
              defaultValues[control.label] = control.value;
            });

            const newVizs = d3visualizations.map(v =>
              v.id === viz.id
                ? { ...v, controlValues: defaultValues }
                : v
            );
            onUpdate({ d3visualizations: newVizs });
          }}
          onAnimationFrame={(values, time) => {
            if (!sourceCodeBlock) return;
            const newCodeBlocks = codeblocks.map(block =>
              block.id === sourceCodeBlock.id
                ? {
                  ...block,
                  executionContext: {
                    vizId: viz.id,
                    controlValues: values,
                    animationTime: time
                  },
                  executionTrigger: Date.now()
                }
                : block
            );
            onUpdate({ codeblocks: newCodeBlocks });
          }}
          onUpdateControls={(values) => {
            const newVizs = d3visualizations.map(v =>
              v.id === viz.id
                ? { ...v, controlValues: { ...v.controlValues, ...values } }
                : v
            );
            onUpdate({ d3visualizations: newVizs });
          }}
          onSaveKeyframe={() => {
            if (!sourceCodeBlock?.isRecording) return;
            const currentTime = sourceCodeBlock.recordingStartTime
              ? (Date.now() - sourceCodeBlock.recordingStartTime) / 1000
              : 0;

            const newKeyframe: Keyframe = {
              id: `kf-${Date.now()}`,
              time: currentTime,
              controlValues: viz.controlValues || {}
            };

            const vizAnimation = viz.animation || {
              id: `anim-${Date.now()}`,
              codeBlockId: viz.sourceCodeBlockId,
              keyframes: [],
              duration: 10,
              fps: 30,
              loop: false
            };

            const updatedAnimation = {
              ...vizAnimation,
              keyframes: [...vizAnimation.keyframes, newKeyframe].sort((a, b) => a.time - b.time),
              duration: Math.max(vizAnimation.duration, currentTime + 1)
            };

            const newVizs = d3visualizations.map(v =>
              v.id === viz.id ? { ...v, animation: updatedAnimation } : v
            );
            onUpdate({ d3visualizations: newVizs });
          }}
          onDeleteKeyframe={(keyframeId) => {
            if (!viz.animation) return;
            const updatedAnimation = {
              ...viz.animation,
              keyframes: viz.animation.keyframes.filter(kf => kf.id !== keyframeId)
            };
            const newVizs = d3visualizations.map(v =>
              v.id === viz.id ? { ...v, animation: updatedAnimation } : v
            );
            onUpdate({ d3visualizations: newVizs });
          }}
          isSourceRecording={sourceCodeBlock?.isRecording ?? false}
        />
      );
    }

    return null;
  };

  return (
    <Stage
      ref={stageRef}
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseDown={handleMouseDown}
      onMousemove={handleMouseMove}
      onMouseup={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchMove={(e) => {
        // Prevent browser navigation on touch devices
        if (tool === 'hand' || isPanning.current) {
          e.evt.preventDefault();
        }
        handleMouseMove(e);
      }}
      onTouchEnd={handleMouseUp}
      onContextMenu={(e) => e.evt.preventDefault()}
      style={{ cursor: getCursorForTool(tool) }}
      onWheel={(e) => {
        e.evt.preventDefault();
        const stage = stageRef.current;
        if (!stage) return;

        if (e.evt.ctrlKey || e.evt.metaKey) {
          const scaleBy = 1.1;
          const oldScale = stage.scaleX();
          const pointer = stage.getPointerPosition();
          if (!pointer) return;
          const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
          };
          const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
          const clampedScale = Math.max(0.1, Math.min(10, newScale)); // Clamp between 10% and 1000%

          const newPos = {
            x: pointer.x - mousePointTo.x * clampedScale,
            y: pointer.y - mousePointTo.y * clampedScale,
          };

          // Update state first, then stage will sync via useEffect
          setZoom(clampedScale);
          setViewPos(newPos);
        } else {
          const dx = -e.evt.deltaX;
          const dy = -e.evt.deltaY;
          const pos = stage.position();
          const newPos = { x: pos.x + dx, y: pos.y + dy };
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
        {/* Render all objects sorted by z-index */}
        {renderableObjects.map(renderObject)}

        {/* Selection UI elements back in main layer */}
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
            listening={false}
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