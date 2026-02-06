/**
 * Platform detection utilities for Tauri app
 */

/**
 * Check if running in Tauri environment
 */
export const isTauri = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI__' in window;
};

/**
 * Check if current window is the presentation window
 */
export const isPresentationWindow = (): boolean => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('mode') === 'presentation';
};

/**
 * Check if current window is the control window
 */
export const isControlWindow = (): boolean => {
  return isTauri() && !isPresentationWindow();
};

/**
 * Get window mode as string
 */
export const getWindowMode = (): 'control' | 'presentation' | 'web' => {
  if (!isTauri()) return 'web';
  return isPresentationWindow() ? 'presentation' : 'control';
};
