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

  // Radio buttons
  if (control.type === 'radio') {
    return (
      <div className="mb-2">
        <label className="text-sm text-gray-700 block mb-1">{control.label}</label>
        <div className="flex flex-col gap-1">
          {control.options?.map((option) => (
            <label key={option} className="flex items-center gap-2">
              <input
                type="radio"
                name={control.id}
                value={option}
                checked={control.value === option}
                onChange={(e) => onChange(e.target.value)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  // Color picker
  if (control.type === 'color') {
    return (
      <div className="flex items-center gap-2 mb-2">
        <label className="text-sm w-24 text-gray-700">{control.label}</label>
        <input
          type="color"
          value={control.value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
        />
        <span className="text-sm text-gray-600">{control.value}</span>
      </div>
    );
  }

  // Dropdown select
  if (control.type === 'select') {
    return (
      <div className="flex items-center gap-2 mb-2">
        <label className="text-sm w-24 text-gray-700">{control.label}</label>
        <select
          value={control.value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-2 py-1 border border-gray-300 rounded bg-white"
        >
          {control.options?.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
    );
  }

  // Range slider (two-thumb, simplified with two inputs initially)
  if (control.type === 'range') {
    return (
      <div className="mb-2">
        <label className="text-sm text-gray-700 block mb-1">{control.label}</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={control.min}
            max={control.max}
            step={control.step || 1}
            value={control.value?.min || control.min}
            onChange={(e) => onChange({ ...control.value, min: parseFloat(e.target.value) })}
            className="w-20 px-2 py-1 border border-gray-300 rounded"
          />
          <span className="text-sm text-gray-600">to</span>
          <input
            type="number"
            min={control.min}
            max={control.max}
            step={control.step || 1}
            value={control.value?.max || control.max}
            onChange={(e) => onChange({ ...control.value, max: parseFloat(e.target.value) })}
            className="w-20 px-2 py-1 border border-gray-300 rounded"
          />
        </div>
      </div>
    );
  }

  // Button
  if (control.type === 'button') {
    return (
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => {
            const newValue = {
              clickCount: (control.value?.clickCount || 0) + 1,
              lastClicked: Date.now()
            };
            onChange(newValue);
          }}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {control.label}
        </button>
        <span className="text-xs text-gray-500">
          {control.value?.clickCount || 0}×
        </span>
      </div>
    );
  }

  // Toggle switch
  if (control.type === 'toggle') {
    return (
      <div className="flex items-center gap-2 mb-2">
        <label className="text-sm text-gray-700">{control.label}</label>
        <button
          onClick={() => onChange(!control.value)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            control.value ? 'bg-blue-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              control.value ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    );
  }

  return null;
};
