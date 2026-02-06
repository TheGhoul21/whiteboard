import React from 'react';
import { X } from 'lucide-react';

interface ShortcutsOverlayProps {
  onClose: () => void;
}

export const ShortcutsOverlay: React.FC<ShortcutsOverlayProps> = ({ onClose }) => {
  const shortcuts = [
    { category: 'General', items: [
      { key: '?', desc: 'Show/Hide this help' },
      { key: 'P', desc: 'Toggle Presentation Mode (hide UI)' },
      { key: 'G', desc: 'Toggle A4 Grid overlay' },
    ]},
    { category: 'Tools', items: [
      { key: '1', desc: 'Select tool' },
      { key: '2', desc: 'Fountain pen (smooth-pen)' },
      { key: '3', desc: 'Highlighter tool' },
      { key: '4', desc: 'Laser pointer (15s, Esc to clear)' },
      { key: '5', desc: 'Spotlight pointer' },
      { key: 'E', desc: 'Eraser tool' },
      { key: 'H', desc: 'Hand/Pan tool' },
      { key: 'T', desc: 'Text tool' },
    ]},
    { category: 'Colors', items: [
      { key: 'Shift+1', desc: 'Color 1 (from palette)' },
      { key: 'Shift+2', desc: 'Color 2 (from palette)' },
      { key: 'Shift+3', desc: 'Color 3 (from palette)' },
      { key: 'Shift+4', desc: 'Color 4 (from palette)' },
      { key: 'Shift+5', desc: 'Color 5 (from palette)' },
      { key: 'Shift+6', desc: 'Color 6 (from palette)' },
      { key: 'Shift+7', desc: 'Color 7 (from palette)' },
      { key: 'Shift+8', desc: 'Color 8 (from palette)' },
    ]},
    { category: 'Navigation', items: [
      { key: 'Space', desc: 'Temporary pan (hold)' },
      { key: 'Right-click', desc: 'Pan (drag)' },
      { key: 'Middle-click', desc: 'Pan (drag)' },
      { key: 'Ctrl+Scroll', desc: 'Zoom in/out (Windows)' },
      { key: 'Cmd+Scroll', desc: 'Zoom in/out (Mac)' },
      { key: 'Scroll', desc: 'Pan canvas' },
    ]},
    { category: 'Editing', items: [
      { key: 'Ctrl+Z', desc: 'Undo' },
      { key: 'Ctrl+Shift+Z', desc: 'Redo' },
      { key: 'Ctrl+Y', desc: 'Redo' },
      { key: 'Ctrl+C', desc: 'Copy selection' },
      { key: 'Ctrl+X', desc: 'Cut selection' },
      { key: 'Ctrl+V', desc: 'Paste' },
      { key: 'Ctrl+A', desc: 'Select all' },
      { key: 'Delete', desc: 'Delete selection' },
      { key: 'Backspace', desc: 'Delete selection' },
      { key: 'Esc', desc: 'Clear laser strokes' },
    ]},
    { category: 'Layers', items: [
      { key: 'Ctrl+Shift+]', desc: 'Bring to front' },
      { key: 'Ctrl+Shift+[', desc: 'Send to back' },
      { key: 'Ctrl+]', desc: 'Bring forward' },
      { key: 'Ctrl+[', desc: 'Send backward' },
    ]},
  ];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl p-6 max-w-3xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Close (Esc or ?)"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">{item.desc}</span>
                    <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono text-gray-800">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t text-center text-sm text-gray-500">
          Press <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">?</kbd> or <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Esc</kbd> to close
        </div>
      </div>
    </div>
  );
};
