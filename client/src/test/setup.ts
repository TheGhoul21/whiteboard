import '@testing-library/jest-dom';

// Declare global types for test environment
declare global {
  var requestAnimationFrame: (callback: FrameRequestCallback) => number;
  var cancelAnimationFrame: (id: number) => void;
  var performance: {
    now: () => number;
  };
}

// Mock requestAnimationFrame for tests
globalThis.requestAnimationFrame = (callback: FrameRequestCallback) => {
  return setTimeout(() => callback(performance.now()), 16) as unknown as number;
};

globalThis.cancelAnimationFrame = (id: number) => {
  clearTimeout(id);
};

// Mock performance.now
if (!globalThis.performance) {
  (globalThis as any).performance = {};
}
if (!globalThis.performance.now) {
  globalThis.performance.now = () => Date.now();
}
