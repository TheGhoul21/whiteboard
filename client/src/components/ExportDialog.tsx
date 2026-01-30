import React, { useState } from 'react';
import { X, FileDown } from 'lucide-react';

export type ExportMode = 'full-canvas' | 'a4-pages' | 'frames-slides';

interface ExportDialogProps {
  onClose: () => void;
  onExport: (mode: ExportMode) => void;
  hasFrames: boolean;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({ onClose, onExport, hasFrames }) => {
  const [selectedMode, setSelectedMode] = useState<ExportMode>('full-canvas');

  const handleExport = () => {
    onExport(selectedMode);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Export to PDF</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Close (Esc)"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-3 mb-6">
          {/* Full Canvas */}
          <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            style={{ borderColor: selectedMode === 'full-canvas' ? '#3b82f6' : '#e5e7eb' }}>
            <input
              type="radio"
              name="export-mode"
              value="full-canvas"
              checked={selectedMode === 'full-canvas'}
              onChange={() => setSelectedMode('full-canvas')}
              className="mt-1 mr-3"
            />
            <div>
              <div className="font-semibold text-gray-800">Full Canvas</div>
              <div className="text-sm text-gray-600">
                Export everything as a single auto-sized PDF page
              </div>
            </div>
          </label>

          {/* A4 Pages */}
          <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            style={{ borderColor: selectedMode === 'a4-pages' ? '#3b82f6' : '#e5e7eb' }}>
            <input
              type="radio"
              name="export-mode"
              value="a4-pages"
              checked={selectedMode === 'a4-pages'}
              onChange={() => setSelectedMode('a4-pages')}
              className="mt-1 mr-3"
            />
            <div>
              <div className="font-semibold text-gray-800">A4 Pages</div>
              <div className="text-sm text-gray-600">
                Split content into multiple A4 pages (great for mobile reading)
              </div>
            </div>
          </label>

          {/* Frames as Slides */}
          <label
            className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              hasFrames ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'
            }`}
            style={{ borderColor: selectedMode === 'frames-slides' ? '#3b82f6' : '#e5e7eb' }}
          >
            <input
              type="radio"
              name="export-mode"
              value="frames-slides"
              checked={selectedMode === 'frames-slides'}
              onChange={() => setSelectedMode('frames-slides')}
              disabled={!hasFrames}
              className="mt-1 mr-3"
            />
            <div>
              <div className="font-semibold text-gray-800">
                Frames as Slides {!hasFrames && '(No frames created)'}
              </div>
              <div className="text-sm text-gray-600">
                Export each frame as a separate A4 slide (perfect for lessons)
              </div>
            </div>
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <FileDown size={18} />
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
};
