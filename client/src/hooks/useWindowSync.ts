import { useEffect, useCallback, useRef } from 'react';
import { isPresentationWindow, isTauri } from '../utils/platform';
import { emit, listen } from '@tauri-apps/api/event';

const SYNC_KEY = 'whiteboard-sync';
const AUTOSAVE_KEY = 'whiteboard-autosave';
const THROTTLE_MS = 50; // Sync every 50ms (20fps) for non-critical state

/**
 * Hook for synchronizing state between control and presentation windows via localStorage
 */
export function useWindowSync<T>(
  _state: T,
  setState: (state: T) => void,
  enabled: boolean = true
) {
  const lastSyncTime = useRef<number>(0);
  const pendingData = useRef<T | null>(null);
  const throttleTimeout = useRef<ReturnType<typeof setTimeout>>();
  const isPresentation = isPresentationWindow();

  // Control window: Write state to localStorage with throttling
  const syncToStorage = useCallback((data: T, immediate = false) => {
    if (!enabled || isPresentation) return;

    const performSync = (syncData: T) => {
      try {
        const serialized = JSON.stringify(syncData);
        localStorage.setItem(SYNC_KEY, serialized);

        // Manually trigger storage event for same-origin windows
        window.dispatchEvent(new StorageEvent('storage', {
          key: SYNC_KEY,
          newValue: serialized,
          oldValue: localStorage.getItem(SYNC_KEY),
          storageArea: localStorage,
          url: window.location.href
        }));
        
        lastSyncTime.current = Date.now();
        pendingData.current = null;
      } catch (error) {
        console.error('Failed to sync state to localStorage:', error);
      }
    };

    if (immediate) {
      if (throttleTimeout.current) clearTimeout(throttleTimeout.current);
      performSync(data);
      return;
    }

    pendingData.current = data;
    const now = Date.now();
    const timeSinceLastSync = now - lastSyncTime.current;

    if (timeSinceLastSync >= THROTTLE_MS) {
      if (throttleTimeout.current) clearTimeout(throttleTimeout.current);
      performSync(data);
    } else if (!throttleTimeout.current) {
      throttleTimeout.current = setTimeout(() => {
        throttleTimeout.current = undefined;
        if (pendingData.current) {
          performSync(pendingData.current);
        }
      }, THROTTLE_MS - timeSinceLastSync);
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
    try {
      let stored = localStorage.getItem(SYNC_KEY);
      if (!stored) {
        const autosaved = localStorage.getItem(AUTOSAVE_KEY);
        if (autosaved) {
          setState(JSON.parse(autosaved) as T);
        }
      } else {
        setState(JSON.parse(stored) as T);
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
      if (throttleTimeout.current) {
        clearTimeout(throttleTimeout.current);
      }
    };
  }, []);

  return { syncToStorage };
}

/**
 * High-frequency event emitter for Tauri (Cursor, Spotlight)
 */
export async function emitSyncEvent(name: string, data: any) {
  if (isTauri()) {
    await emit(name, data);
  }
}

/**
 * High-frequency event listener for Tauri
 */
export async function listenSyncEvent(name: string, callback: (data: any) => void) {
  if (isTauri()) {
    return await listen(name, (event) => {
      callback(event.payload);
    });
  }
  return () => {};
}
