import { useState, useCallback } from 'react';

export default function useHistory<T>(initialState: T) {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [step, setStep] = useState(0);

  const state = history[step];

  const setState = useCallback((newState: T | ((prev: T) => T), overwrite = false) => {
    // Use functional updates to avoid stale closure issues with 'step'
    setStep(currentStep => {
      setHistory(prevHistory => {
        const current = prevHistory[currentStep];
        const nextValue = typeof newState === 'function' ? (newState as Function)(current) : newState;
        
        if (overwrite) {
          // Replace current step
          const newHistory = [...prevHistory];
          newHistory[currentStep] = nextValue;
          return newHistory;
        } else {
          // Add new step, truncate future if any
          const newHistory = prevHistory.slice(0, currentStep + 1);
          newHistory.push(nextValue);
          return newHistory;
        }
      });
      
      return overwrite ? currentStep : currentStep + 1;
    });
  }, []); // No dependencies needed - uses functional updates

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
