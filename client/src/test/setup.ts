import '@testing-library/jest-dom';
import { vi } from 'vitest';

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

// Mock Konva to avoid canvas dependency
vi.mock('konva', () => ({
  default: {
    Stage: class MockStage {},
    Layer: class MockLayer {},
    Group: class MockGroup {},
    Rect: class MockRect {},
    Circle: class MockCircle {},
    Image: class MockImage {},
    Text: class MockText {}
  }
}));

// Mock canvas for D3
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({ data: [] })),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => ({ data: [] })),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    fillText: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    transform: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1
  })) as any;

  HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,mock');
}

// Mock window.Image
(global as any).Image = class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src = '';

  constructor() {
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 0);
  }
};

// Mock XMLSerializer
(global as any).XMLSerializer = class MockXMLSerializer {
  serializeToString(node: any) {
    return '<svg width="400" height="300"></svg>';
  }
};

// Mock DOMParser
(global as any).DOMParser = class MockDOMParser {
  parseFromString(str: string, type: string) {
    return {
      documentElement: {
        hasAttribute: (attr: string) => false,
        setAttribute: vi.fn(),
        getAttribute: (attr: string) => null
      }
    };
  }
};
