import React from 'react';
import type { ToolType, BackgroundType, ImageObj } from '../types';
import {
  MousePointer2, Hand, Pen, PenTool, Eraser, Type,
  Square, Circle, ArrowRight, Undo2, Redo2, Trash2,
  Save, Download, Grid, LayoutTemplate, FileText,
  Zap, Highlighter, Focus
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
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onSave: () => void;
  onExport: () => void;
  onImportImages: (images: ImageObj[]) => void;
}

const LIGHT_COLORS = ['#000000', '#df4b26', '#228B22', '#0000FF', '#FFD700', '#808080'];
const DARK_COLORS = ['#FFFFFF', '#FF6B6B', '#4ADE80', '#60A5FA', '#FACC15', '#9CA3AF'];

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
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  onSave,
  onExport,
  onImportImages
}) => {
  const btnClass = (t: ToolType) => 
    `p-2 rounded transition-colors ${tool === t ? 'bg-blue-100 text-blue-600 shadow-inner' : 'hover:bg-gray-100 text-gray-700'}`;

  const currentColors = background === 'black' ? DARK_COLORS : LIGHT_COLORS;

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
        <button className={btnClass('select')} onClick={() => setTool('select')} title="Select / Box Select (V)">
          <MousePointer2 size={20} />
        </button>
        <button className={btnClass('hand')} onClick={() => setTool('hand')} title="Pan Tool (Right-Click also pans)">
          <Hand size={20} />
        </button>
        <button className={btnClass('pen')} onClick={() => setTool('pen')} title="Standard Pen (P)">
          <Pen size={20} />
        </button>
        <button className={btnClass('smooth-pen')} onClick={() => setTool('smooth-pen')} title="Fountain Pen (Calligraphy)">
          <PenTool size={20} />
        </button>
        <button className={btnClass('highlighter')} onClick={() => setTool('highlighter')} title="Highlighter (Semi-transparent marker)">
          <Highlighter size={20} />
        </button>
        <button className={btnClass('laser')} onClick={() => setTool('laser')} title="Laser Pointer (Fades automatically)">
          <Zap size={20} />
        </button>
        <button className={btnClass('pointer')} onClick={() => setTool('pointer')} title="Spotlight Pointer (For presentations)">
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
         <button className={`p-2 rounded ${background === 'white' ? 'bg-gray-200' : 'hover:bg-gray-100'}`} onClick={() => setBackground('white')} title="White Background">
            <LayoutTemplate size={18} />
         </button>
         <button className={`p-2 rounded ${background === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`} onClick={() => setBackground('grid')} title="Grid Pattern">
            <Grid size={18} />
         </button>
         <button className={`p-2 rounded ${background === 'lines' ? 'bg-gray-200' : 'hover:bg-gray-100'}`} onClick={() => setBackground('lines')} title="Notebook Lines">
            <FileText size={18} />
         </button>
         <button className={`p-2 rounded ${background === 'black' ? 'bg-gray-200' : 'hover:bg-gray-100'}`} onClick={() => setBackground('black')} title="Dark Mode">
            <div className="w-4 h-4 bg-black rounded border border-gray-400"></div>
         </button>
      </div>

      {/* Zoom & Actions */}
      <div className="flex items-center gap-2">
        <button 
           onClick={() => setZoom(1)} 
           className="px-2 py-1 text-xs font-mono bg-gray-100 hover:bg-gray-200 rounded min-w-[60px] text-center"
           title="Current Zoom (Click to Reset)"
        >
           {Math.round(zoom * 100)}%
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
