/**
 * Type definitions for Tauri window configuration
 */

export interface PresentationWindowConfig {
  always_on_top: boolean;
  background_color: string;
  fullscreen: boolean;
}

export interface PresentationSettings {
  alwaysOnTop: boolean;
  backgroundColor: string;
  fullscreen: boolean;
}

export const DEFAULT_PRESENTATION_SETTINGS: PresentationSettings = {
  alwaysOnTop: false,
  backgroundColor: '#ffffff',
  fullscreen: false,
};
