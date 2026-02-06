import React from 'react';
import type { ToolType, BackgroundType, ImageObj } from '../types';
import {
  MousePointer2, Hand, Pen, PenTool, Eraser, Type,
  Square, Circle, ArrowRight, Undo2, Redo2, Trash2,
  Save, Download, Grid, LayoutTemplate, FileText,
  Zap, Highlighter, Focus, Code
} from 'lucide-react';
import { PDFImporter } from './PDFImporter';

interface ToolbarProps {
  tool: ToolType;
  setTool: (tool: ToolType) => void;
  color: string;
  setColor: (color: string) => void;
  size: number;
  setSize: (size: number) => void;
  background: BackgroundType;
  setBackground: (bg: BackgroundType) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  viewPos: { x: number; y: number };
  setViewPos: (pos: { x: number; y: number }) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onSave: () => void;
  onExport: () => void;
  onImportImages: (images: ImageObj[]) => void;
  onCreateCodeBlock?: () => void;
}

// Soft, muted palettes for relaxed teaching (inspired by Nord/Gruvbox)
const LIGHT_COLORS = [
  '#2E3440',  // Slate Gray (soft, not harsh black)
  '#BF616A',  // Muted Rose (terracotta red)
  '#D08770',  // Soft Orange (peachy)
  '#A3BE8C',  // Sage Green (calming)
  '#5E81AC',  // Denim Blue (soft blue)
  '#B48EAD',  // Dusty Purple (mauve)
  '#88C0D0',  // Soft Cyan (sky blue)
  '#4C566A',  // Cool Gray (neutral)
];

const DARK_COLORS = [
  '#ECEFF4',  // Snow White (warm off-white)
  '#D08770',  // Warm Coral (cozy red)
  '#EBCB8B',  // Honey Yellow (soft gold)
  '#A3BE8C',  // Moss Green (natural)
  '#81A1C1',  // Periwinkle Blue (calm)
  '#B48EAD',  // Lavender Mist (gentle purple)
  '#88C0D0',  // Powder Blue (soft cyan)
  '#D8DEE9',  // Pearl Gray (subtle)
];

export const Toolbar: React.FC<ToolbarProps> = ({
  tool,
  setTool,
  color,
  setColor,
  size,
  setSize,
  background,
  setBackground,
  zoom,
  setZoom,
  viewPos,
  setViewPos,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  onSave,
  onExport,
  onImportImages,
  onCreateCodeBlock
}) => {
  const btnClass = (t: ToolType) =>
    `p-2 rounded transition-colors ${tool === t ? 'bg-blue-100 text-blue-600 shadow-inner' : 'hover:bg-gray-100 text-gray-700'}`;

  const isDark = background === 'black' || background === 'black-grid' || background === 'black-lines';
  const currentColors = isDark ? DARK_COLORS : LIGHT_COLORS;

  const handleBackgroundChange = (newBg: BackgroundType) => {
    // When switching between light and dark backgrounds, swap color if needed
    const wasLight = background === 'white' || background === 'grid' || background === 'lines' || background === 'dots';
    const willBeDark = newBg === 'black' || newBg === 'black-grid' || newBg === 'black-lines';

    if (wasLight && willBeDark) {
      // Switching from light to dark - swap color index
      const lightIndex = LIGHT_COLORS.indexOf(color);
      if (lightIndex !== -1) {
        setColor(DARK_COLORS[lightIndex]);
      }
    } else if (!wasLight && !willBeDark) {
      // Switching from dark to light - swap color index
      const darkIndex = DARK_COLORS.indexOf(color);
      if (darkIndex !== -1) {
        setColor(LIGHT_COLORS[darkIndex]);
      }
    }

    setBackground(newBg);
  };

  const handleZoomReset = () => {
    // Calculate the center point of the current viewport in canvas coordinates
    const centerX = (window.innerWidth / 2 - viewPos.x) / zoom;
    const centerY = (window.innerHeight / 2 - viewPos.y) / zoom;

    // Calculate new position to keep the same center point at 100% zoom
    const newViewPos = {
      x: window.innerWidth / 2 - centerX * 1,
      y: window.innerHeight / 2 - centerY * 1
    };

    setZoom(1);
    setViewPos(newViewPos);
  };

  const handleGoToOrigin = () => {
    setViewPos({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white shadow-xl rounded-lg p-2 flex items-center gap-3 border border-gray-200 z-50">
      
      {/* History */}
      <div className="flex gap-1 border-r pr-3 border-gray-300">
        <button 
          disabled={!canUndo} 
          onClick={onUndo} 
          className="p-2 hover:bg-gray-100 rounded disabled:opacity-30"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={20} />
        </button>
        <button 
          disabled={!canRedo} 
          onClick={onRedo} 
          className="p-2 hover:bg-gray-100 rounded disabled:opacity-30"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={20} />
        </button>
      </div>

      {/* Tools */}
      <div className="flex gap-1 border-r pr-3 border-gray-300">
        <button className={btnClass('select')} onClick={() => setTool('select')} title="Select / Box Select (1)">
          <MousePointer2 size={20} />
        </button>
        <button className={btnClass('hand')} onClick={() => setTool('hand')} title="Pan Tool (H)">
          <Hand size={20} />
        </button>
        <button className={btnClass('pen')} onClick={() => setTool('pen')} title="Standard Pen (2)">
          <Pen size={20} />
        </button>
        <button className={btnClass('smooth-pen')} onClick={() => setTool('smooth-pen')} title="Smooth / Calligraphy Pen">
          <PenTool size={20} />
        </button>
        <button className={btnClass('highlighter')} onClick={() => setTool('highlighter')} title="Highlighter (3)">
          <Highlighter size={20} />
        </button>
        <button className={btnClass('laser')} onClick={() => setTool('laser')} title="Laser Pointer (4)">
          <Zap size={20} />
        </button>
        <button className={btnClass('pointer')} onClick={() => setTool('pointer')} title="Spotlight Pointer (5)">
          <Focus size={20} />
        </button>
        <button className={btnClass('eraser')} onClick={() => setTool('eraser')} title="Eraser (E)">
          <Eraser size={20} />
        </button>
        <button className={btnClass('text')} onClick={() => setTool('text')} title="Insert Text (T)">
          <Type size={20} />
        </button>
        <button className={btnClass('rect')} onClick={() => setTool('rect')} title="Rectangle Shape">
          <Square size={20} />
        </button>
        <button className={btnClass('circle')} onClick={() => setTool('circle')} title="Circle Shape">
          <Circle size={20} />
        </button>
        <button className={btnClass('arrow')} onClick={() => setTool('arrow')} title="Arrow Shape">
          <ArrowRight size={20} />
        </button>
      </div>

      {/* CodeBlock */}
      {onCreateCodeBlock && (
        <div className="flex gap-1 border-r pr-3 border-gray-300">
          <button
            onClick={onCreateCodeBlock}
            className="p-2 hover:bg-gray-100 rounded text-gray-700"
            title="Create CodeBlock (JavaScript + D3.js)"
          >
            <Code size={20} />
          </button>
        </div>
      )}

      {/* Styles */}
      <div className="flex items-center gap-2 border-r pr-3 border-gray-300">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-8 h-8 p-0 border-none cursor-pointer rounded overflow-hidden"
          disabled={tool === 'eraser' || tool === 'hand'}
          title="Custom Color Picker"
        />
        <div className="flex gap-1">
          {currentColors.map((c, i) => (
            <button
              key={c}
              className={`w-5 h-5 rounded-full border border-gray-300 ${color === c ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
              disabled={tool === 'eraser' || tool === 'hand'}
              title={`Color ${i + 1}`}
            />
          ))}
        </div>
        <div className="flex flex-col w-20 ml-2" title="Tool Size / Stroke Width">
           <input 
              type="range" 
              min="1" 
              max="50" 
              value={size} 
              onChange={(e) => setSize(Number(e.target.value))}
              className="h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
           />
        </div>
      </div>

      {/* Backgrounds */}
      <div className="flex gap-1 border-r pr-3 border-gray-300">
         <button className={`p-2 rounded ${background === 'white' ? 'bg-gray-200' : 'hover:bg-gray-100'}`} onClick={() => handleBackgroundChange('white')} title="White Background">
            <LayoutTemplate size={18} />
         </button>
         <button className={`p-2 rounded ${background === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`} onClick={() => handleBackgroundChange('grid')} title="Light Grid">
            <Grid size={18} />
         </button>
         <button className={`p-2 rounded ${background === 'lines' ? 'bg-gray-200' : 'hover:bg-gray-100'}`} onClick={() => handleBackgroundChange('lines')} title="Light Lines">
            <FileText size={18} />
         </button>
         <button className={`p-2 rounded ${background === 'black' ? 'bg-gray-200' : 'hover:bg-gray-100'}`} onClick={() => handleBackgroundChange('black')} title="Dark Background">
            <div className="w-4 h-4 bg-black rounded border border-gray-400"></div>
         </button>
         <button className={`p-2 rounded ${background === 'black-grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`} onClick={() => handleBackgroundChange('black-grid')} title="Dark Grid">
            <div className="w-4 h-4 bg-black rounded border border-gray-400 relative">
              <div className="absolute inset-0 grid grid-cols-2 gap-px">
                <div className="border-r border-b border-gray-600"></div>
                <div className="border-b border-gray-600"></div>
                <div className="border-r border-gray-600"></div>
                <div></div>
              </div>
            </div>
         </button>
         <button className={`p-2 rounded ${background === 'black-lines' ? 'bg-gray-200' : 'hover:bg-gray-100'}`} onClick={() => handleBackgroundChange('black-lines')} title="Dark Lines">
            <div className="w-4 h-4 bg-black rounded border border-gray-400 relative">
              <div className="absolute inset-0 flex flex-col justify-around py-px">
                <div className="h-px bg-gray-600"></div>
                <div className="h-px bg-gray-600"></div>
              </div>
            </div>
         </button>
      </div>

      {/* Zoom & Actions */}
      <div className="flex items-center gap-2">
        <button
           onClick={handleZoomReset}
           className="px-2 py-1 text-xs font-mono bg-gray-100 hover:bg-gray-200 rounded min-w-[60px] text-center"
           title="Current Zoom (Click to Reset to 100%)"
        >
           {Math.round(zoom * 100)}%
        </button>
        <button
           onClick={handleGoToOrigin}
           className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
           title="Go to Origin (0, 0)"
        >
           0,0
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <PDFImporter onImport={onImportImages} />

        <button onClick={onClear} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Clear Canvas (Delete All)">
          <Trash2 size={20} />
        </button>
        <button onClick={onSave} className="p-2 text-gray-700 hover:bg-gray-100 rounded" title="Save Whiteboard to Disk">
          <Save size={20} />
        </button>
        <button onClick={onExport} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Export as PDF">
          <Download size={20} />
        </button>
      </div>
    </div>
  );
};
