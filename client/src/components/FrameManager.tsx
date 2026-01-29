import React, { useState } from 'react';
import { Bookmark, Plus, Trash2, MapPin } from 'lucide-react';
import type { FrameObj } from '../types';

interface FrameManagerProps {
  frames: FrameObj[];
  onAddFrame: (label: string) => void;
  onDeleteFrame: (id: string) => void;
  onGoToFrame: (frame: FrameObj) => void;
}

export const FrameManager: React.FC<FrameManagerProps> = ({ frames, onAddFrame, onDeleteFrame, onGoToFrame }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed top-24 left-4 z-50 flex flex-col items-start gap-2">
       <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 bg-white shadow-md rounded-full hover:bg-gray-50 border border-gray-200"
          title="Bookmarks / Frames"
       >
          <Bookmark size={20} className={isOpen ? "text-blue-600" : "text-gray-700"} />
       </button>

       {isOpen && (
          <div className="bg-white p-3 rounded-lg shadow-xl border border-gray-200 w-64 max-h-[70vh] flex flex-col overflow-hidden">
             <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                <span className="font-semibold text-sm text-gray-700">Bookmarks</span>
                <button 
                   onClick={() => {
                      const label = prompt("Frame Name (e.g. 'Chapter 1'):");
                      if (label) onAddFrame(label);
                   }}
                   className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                   title="Add Current View"
                >
                   <Plus size={18} />
                </button>
             </div>
             
             <div className="flex flex-col gap-2 overflow-y-auto">
                {frames.length === 0 && <span className="text-xs text-gray-400 italic p-2">No bookmarks yet.</span>}
                {frames.map(f => (
                   <div key={f.id} className="flex items-center justify-between group p-2 hover:bg-gray-50 rounded transition-colors">
                      <button 
                         onClick={() => onGoToFrame(f)}
                         className="flex items-center gap-2 text-sm text-gray-700 truncate flex-1 text-left"
                      >
                         <MapPin size={14} className="text-gray-400" />
                         {f.label}
                      </button>
                      <button 
                         onClick={() => onDeleteFrame(f.id)}
                         className="opacity-0 group-hover:opacity-100 text-red-500 p-1 hover:bg-red-50 rounded"
                      >
                         <Trash2 size={14} />
                      </button>
                   </div>
                ))}
             </div>
          </div>
       )}
    </div>
  );
};
