import React, { useState, useEffect } from 'react';
import { Monitor, MonitorOff, Settings } from 'lucide-react';
import { isTauri } from '../utils/platform';
import type { PresentationSettings } from '../types/window';

// Tauri imports (will be undefined in web mode)
let invoke: any;
if (isTauri()) {
  import('@tauri-apps/api/core').then((module) => {
    invoke = module.invoke;
  });
}

const SETTINGS_KEY = 'presentation-settings';

export const PresentationControls: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [settings, setSettings] = useState<PresentationSettings>({
    alwaysOnTop: false,
    backgroundColor: '#ffffff',
    fullscreen: false,
  });

  // Load settings from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load presentation settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (newSettings: PresentationSettings) => {
    setSettings(newSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  };

  // Check if presentation window is open
  const checkWindowStatus = async () => {
    if (!isTauri() || !invoke) return;

    try {
      const isWindowOpen = await invoke('is_presentation_window_open');
      setIsOpen(isWindowOpen);
    } catch (error) {
      console.error('Failed to check presentation window status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkWindowStatus();
    const interval = setInterval(checkWindowStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const openPresentationWindow = async () => {
    if (!isTauri() || !invoke) {
      alert('Presentation mode is only available in the Tauri desktop app');
      return;
    }

    try {
      await invoke('open_presentation_window', {
        config: {
          always_on_top: settings.alwaysOnTop,
          background_color: settings.backgroundColor,
          fullscreen: settings.fullscreen,
        },
      });
      setIsOpen(true);
    } catch (error) {
      console.error('Failed to open presentation window:', error);
      alert(`Failed to open presentation window: ${error}`);
    }
  };

  const closePresentationWindow = async () => {
    if (!isTauri() || !invoke) return;

    try {
      await invoke('close_presentation_window');
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to close presentation window:', error);
      alert(`Failed to close presentation window: ${error}`);
    }
  };

  const updatePresentationWindow = async (newSettings: PresentationSettings) => {
    if (!isTauri() || !invoke || !isOpen) return;

    try {
      await invoke('update_presentation_window', {
        config: {
          always_on_top: newSettings.alwaysOnTop,
          background_color: newSettings.backgroundColor,
          fullscreen: newSettings.fullscreen,
        },
      });
    } catch (error) {
      console.error('Failed to update presentation window:', error);
    }
  };

  const handleSettingChange = (key: keyof PresentationSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
    if (isOpen) {
      updatePresentationWindow(newSettings);
    }
  };

  if (!isTauri()) {
    return null; // Don't show in web mode
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
        {/* Status and Main Button */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isOpen ? 'bg-green-500' : 'bg-gray-400'
            }`}
            title={isOpen ? 'Presentation window open' : 'Presentation window closed'}
          />
          <span className="text-sm font-medium text-gray-700">
            {isChecking ? 'Checking...' : isOpen ? 'Presentation Active' : 'Presentation Inactive'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={isOpen ? closePresentationWindow : openPresentationWindow}
            disabled={isChecking}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-white font-medium transition-colors ${
              isOpen
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-500 hover:bg-blue-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isOpen ? <MonitorOff size={18} /> : <Monitor size={18} />}
            {isOpen ? 'Close' : 'Open'} Presentation
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            title="Presentation settings"
          >
            <Settings size={18} className="text-gray-700" />
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
            <div className="text-sm font-semibold text-gray-700 mb-2">
              Presentation Settings
            </div>

            {/* Always on Top */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.alwaysOnTop}
                onChange={(e) => handleSettingChange('alwaysOnTop', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Always on top</span>
            </label>

            {/* Background Color */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Background color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.backgroundColor}
                  onChange={(e) => handleSettingChange('backgroundColor', e.target.value)}
                  className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.backgroundColor}
                  onChange={(e) => handleSettingChange('backgroundColor', e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            {/* Fullscreen */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.fullscreen}
                onChange={(e) => handleSettingChange('fullscreen', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Start in fullscreen</span>
            </label>

            <div className="text-xs text-gray-500 mt-2">
              <p>Keyboard shortcuts (in presentation window):</p>
              <p>• F11 - Toggle fullscreen</p>
              <p>• ESC - Exit fullscreen</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
