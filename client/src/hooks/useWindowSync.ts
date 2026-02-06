import { useEffect, useCallback, useRef } from 'react';
import { isPresentationWindow } from '../utils/platform';

const SYNC_KEY = 'whiteboard-sync';
const AUTOSAVE_KEY = 'whiteboard-autosave';

/**
 * Hook for synchronizing state between control and presentation windows via localStorage
 */
export function useWindowSync<T>(
  _state: T,
  setState: (state: T) => void,
  enabled: boolean = true
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const isPresentation = isPresentationWindow();

  // Control window: Write state to localStorage (immediate for real-time sync)
  const syncToStorage = useCallback((data: T) => {
    if (!enabled || isPresentation) return;

    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(SYNC_KEY, serialized);

      // Manually trigger storage event for same-origin windows
      window.dispatchEvent(new StorageEvent('storage', {
        key: SYNC_KEY,
        newValue: serialized,
        oldValue: localStorage.getItem(SYNC_KEY),
        storageArea: localStorage,
        url: window.location.href
      }));
    } catch (error) {
      console.error('Failed to sync state to localStorage:', error);
    }
  }, [enabled, isPresentation]);

  // Presentation window: Listen to storage events and update state
  useEffect(() => {
    if (!enabled || !isPresentation) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== SYNC_KEY || !event.newValue) return;

      try {
        const newState = JSON.parse(event.newValue) as T;
        setState(newState);
      } catch (error) {
        console.error('Failed to parse synced state:', error);
      }
    };

    // Initial load from localStorage
    // Try sync key first, fall back to autosave key
    try {
      let stored = localStorage.getItem(SYNC_KEY);

      // If sync key is empty, try loading from autosave
      if (!stored) {
        console.log('[Presentation] No sync data, loading from autosave');
        const autosaved = localStorage.getItem(AUTOSAVE_KEY);
        if (autosaved) {
          const autosaveData = JSON.parse(autosaved);
          // Autosave has partial state, need to merge with defaults
          setState(autosaveData as T);
          console.log('[Presentation] Loaded initial state from autosave');
        }
      } else {
        const initialState = JSON.parse(stored) as T;
        setState(initialState);
        console.log('[Presentation] Loaded initial state from sync');
      }
    } catch (error) {
      console.error('Failed to load initial state:', error);
    }

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [enabled, isPresentation, setState]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { syncToStorage };
}
