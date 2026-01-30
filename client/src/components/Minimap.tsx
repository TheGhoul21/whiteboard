import React from 'react';
import { Stage, Layer, Line, Rect } from 'react-konva';
import type { Stroke, ImageObj, TextObj, ShapeObj, LatexObj, CodeObj, NoteObj, CodeBlockObj, D3VisualizationObj } from '../types';

interface MinimapProps {
  strokes: Stroke[];
  images: ImageObj[];
  texts: TextObj[];
  shapes: ShapeObj[];
  latex?: LatexObj[];
  codes?: CodeObj[];
  notes?: NoteObj[];
  codeblocks?: CodeBlockObj[];
  d3visualizations?: D3VisualizationObj[];
  // Viewport state
  stageX: number;
  stageY: number;
  stageScale: number;
  // Canvas dimensions
  stageWidth: number;
  stageHeight: number;
  // Navigation callback
  onNavigate: (x: number, y: number) => void;
}

export const Minimap: React.FC<MinimapProps> = ({
  strokes,
  images,
  texts,
  shapes,
  latex = [],
  codes = [],
  notes = [],
  codeblocks = [],
  d3visualizations = [],
  stageX,
  stageY,
  stageScale,
  stageWidth,
  stageHeight,
  onNavigate
}) => {
  // Minimap dimensions
  const WIDTH = 240;
  const HEIGHT = 180;
  const PADDING = 50; // Padding in world units

  // 1. Calculate Bounding Box of all content
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const allItemsCount = strokes.length + images.length + texts.length + shapes.length + latex.length + codes.length + notes.length + codeblocks.length + d3visualizations.length;

  if (allItemsCount === 0) {
     // Default bounds if empty
     minX = -window.innerWidth/2; 
     maxX = window.innerWidth/2; 
     minY = -window.innerHeight/2; 
     maxY = window.innerHeight/2;
  } else {
     strokes.forEach(s => {
        for(let i=0; i<s.points.length; i+=2) {
           minX = Math.min(minX, s.points[i]);
           maxX = Math.max(maxX, s.points[i]);
           minY = Math.min(minY, s.points[i+1]);
           maxY = Math.max(maxY, s.points[i+1]);
        }
     });
     images.forEach(i => { minX = Math.min(minX, i.x); minY = Math.min(minY, i.y); maxX = Math.max(maxX, i.x + i.width); maxY = Math.max(maxY, i.y + i.height); });
     shapes.forEach(s => { 
        minX = Math.min(minX, s.x); minY = Math.min(minY, s.y); 
        const w = s.width || 50; 
        const h = s.height || 50;
        maxX = Math.max(maxX, s.x + w); maxY = Math.max(maxY, s.y + h); 
     });
     texts.forEach(t => { 
        minX = Math.min(minX, t.x); minY = Math.min(minY, t.y); 
        // Estimate text size
        maxX = Math.max(maxX, t.x + 100); maxY = Math.max(maxY, t.y + 20); 
     });
     [...latex, ...codes, ...notes, ...codeblocks, ...d3visualizations].forEach(obj => {
        const w = 'width' in obj ? obj.width : 100;
        const h = 'height' in obj ? obj.height : 50;
        minX = Math.min(minX, obj.x); minY = Math.min(minY, obj.y);
        maxX = Math.max(maxX, obj.x + w); maxY = Math.max(maxY, obj.y + h);
     });
  }

  // Ensure bbox has some size to avoid division by zero
  if (maxX - minX < 100) { minX -= 50; maxX += 50; }
  if (maxY - minY < 100) { minY -= 50; maxY += 50; }

  // Include current viewport in bounds (so we don't lose context of where we are)
  const currentViewX = -stageX / stageScale;
  const currentViewY = -stageY / stageScale;
  const currentViewW = stageWidth / stageScale;
  const currentViewH = stageHeight / stageScale;

  minX = Math.min(minX, currentViewX);
  minY = Math.min(minY, currentViewY);
  maxX = Math.max(maxX, currentViewX + currentViewW);
  maxY = Math.max(maxY, currentViewY + currentViewH);

  // Add padding
  minX -= PADDING; maxX += PADDING;
  minY -= PADDING; maxY += PADDING;

  const contentW = maxX - minX;
  const contentH = maxY - minY;

  // 2. Calculate Scale to fit content into Minimap
  const scaleW = WIDTH / contentW;
  const scaleH = HEIGHT / contentH;
  const scale = Math.min(scaleW, scaleH);

  // Center offset
  const offsetX = (WIDTH - contentW * scale) / 2;
  const offsetY = (HEIGHT - contentH * scale) / 2;

  // 3. Viewport Rectangle (The visible area on main canvas)
  const mapRectX = (currentViewX - minX) * scale;
  const mapRectY = (currentViewY - minY) * scale;
  const mapRectW = currentViewW * scale;
  const mapRectH = currentViewH * scale;

  const handleMapClick = (e: any) => {
     const rect = e.target.getStage().getPointerPosition();
     if (!rect) return;
     
     // Inverse transform
     const worldX = (rect.x - offsetX) / scale + minX;
     const worldY = (rect.y - offsetY) / scale + minY;
     
     // Center view
     const newStageX = -(worldX - currentViewW/2) * stageScale;
     const newStageY = -(worldY - currentViewH/2) * stageScale;
     
     onNavigate(newStageX, newStageY);
  };

  // Helper to ensure minimum visibility
  const minStroke = Math.max(1, 2 / scale); 

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 shadow-xl rounded-lg overflow-hidden z-50 transition-opacity duration-300 ease-in-out">
       <Stage width={WIDTH} height={HEIGHT} onClick={handleMapClick} onTap={handleMapClick}>
          <Layer>
             <Rect width={WIDTH} height={HEIGHT} fill="#ffffff" />
          </Layer>
          
          <Layer x={offsetX} y={offsetY} scaleX={scale} scaleY={scale}>
             {/* Images (Gray Blocks) */}
             {images.map(img => (
                <Rect key={img.id} x={img.x} y={img.y} width={img.width} height={img.height} fill="#e5e7eb" stroke="#d1d5db" strokeWidth={minStroke/2} />
             ))}
             
             {/* Notes/Codes/Latex (Yellow/Dark Blocks) */}
             {notes?.map(n => <Rect key={n.id} x={n.x} y={n.y} width={n.width} height={n.height} fill="#fef3c7" />)}
             {codes?.map(c => <Rect key={c.id} x={c.x} y={c.y} width={c.width} height={c.height} fill="#1e1e1e" />)}
             {latex?.map(l => <Rect key={l.id} x={l.x} y={l.y} width={100} height={40} fill="#f3e8ff" />)}

             {/* Shapes */}
             {shapes.map(s => (
                <Rect 
                   key={s.id} 
                   x={s.x} 
                   y={s.y} 
                   width={s.width||50} 
                   height={s.height||50} 
                   stroke={s.color} 
                   strokeWidth={Math.max(s.strokeWidth, minStroke)} 
                />
             ))}

             {/* Strokes - Thicker */}
             {strokes.map(s => {
                if (s.tool === 'laser') return null; // Skip laser in minimap
                return (
                   <Line 
                      key={s.id}
                      points={s.points}
                      stroke={s.color}
                      // Ensure stroke is visible even when zoomed out far
                      strokeWidth={Math.max(s.size, minStroke * 2)} 
                      tension={0}
                      closed={false}
                   />
                );
             })}
             
             {/* Text placeholders */}
             {texts.map(t => (
                <Rect key={t.id} x={t.x} y={t.y} width={Math.max(50/scale, 20)} height={Math.max(10/scale, 5)} fill={t.color} opacity={0.5} />
             ))}
          </Layer>

          {/* Viewport Indicator */}
          <Layer>
             <Rect
                x={offsetX + mapRectX}
                y={offsetY + mapRectY}
                width={mapRectW}
                height={mapRectH}
                stroke="#ef4444"
                strokeWidth={2}
                fill="rgba(239, 68, 68, 0.1)"
             />
          </Layer>
       </Stage>
    </div>
  );
};