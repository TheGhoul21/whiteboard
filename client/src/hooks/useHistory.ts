import { useState, useCallback } from 'react';

export default function useHistory<T>(initialState: T) {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [step, setStep] = useState(0);

  const state = history[step];

  const setState = useCallback((newState: T | ((prev: T) => T), overwrite = false) => {
    setHistory(prev => {
      const current = prev[step];
      const nextValue = typeof newState === 'function' ? (newState as Function)(current) : newState;
      
      if (overwrite) {
        // Replace current step
        const newHistory = [...prev];
        newHistory[step] = nextValue;
        return newHistory;
      } else {
        // Add new step, truncate future if any
        const newHistory = prev.slice(0, step + 1);
        newHistory.push(nextValue);
        return newHistory;
      }
    });
    
    if (!overwrite) {
      setStep(prev => prev + 1);
    }
  }, [step]);

  const undo = useCallback(() => {
    setStep(prev => Math.max(0, prev - 1));
  }, []);

  const redo = useCallback(() => {
    setStep(prev => Math.min(history.length - 1, prev + 1));
  }, [history.length]);

  return {
    state,
    setState,
    undo,
    redo,
    canUndo: step > 0,
    canRedo: step < history.length - 1
  };
}
