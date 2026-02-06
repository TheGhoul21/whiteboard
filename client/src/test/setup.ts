import '@testing-library/jest-dom';

// Mock requestAnimationFrame for tests
global.requestAnimationFrame = (callback: FrameRequestCallback) => {
  return setTimeout(() => callback(performance.now()), 16) as unknown as number;
};

global.cancelAnimationFrame = (id: number) => {
  clearTimeout(id);
};

// Mock performance.now
if (!global.performance) {
  (global as any).performance = {};
}
if (!global.performance.now) {
  global.performance.now = () => Date.now();
}
