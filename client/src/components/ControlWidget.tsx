import React from 'react';
import type { CodeBlockControl } from '../types';

interface ControlWidgetProps {
  control: CodeBlockControl;
  onChange: (value: any) => void;
}

export const ControlWidget: React.FC<ControlWidgetProps> = ({ control, onChange }) => {
  if (control.type === 'slider') {
    return (
      <div className="flex items-center gap-2 mb-2">
        <label className="text-sm w-24 text-gray-700">{control.label}</label>
        <input
          type="range"
          min={control.min}
          max={control.max}
          step={control.step || 1}
          value={control.value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="flex-1"
        />
        <span className="text-sm w-16 text-gray-600">
          {typeof control.value === 'number' ? control.value.toFixed(2) : control.value}
        </span>
      </div>
    );
  }

  if (control.type === 'number') {
    return (
      <div className="flex items-center gap-2 mb-2">
        <label className="text-sm w-24 text-gray-700">{control.label}</label>
        <input
          type="number"
          min={control.min}
          max={control.max}
          step={control.step || 1}
          value={control.value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="flex-1 px-2 py-1 border border-gray-300 rounded"
        />
      </div>
    );
  }

  if (control.type === 'text') {
    return (
      <div className="flex items-center gap-2 mb-2">
        <label className="text-sm w-24 text-gray-700">{control.label}</label>
        <input
          type="text"
          value={control.value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-2 py-1 border border-gray-300 rounded"
        />
      </div>
    );
  }

  if (control.type === 'checkbox') {
    return (
      <div className="flex items-center gap-2 mb-2">
        <input
          type="checkbox"
          checked={control.value}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4"
          id={control.id}
        />
        <label htmlFor={control.id} className="text-sm text-gray-700">
          {control.label}
        </label>
      </div>
    );
  }

  return null;
};
