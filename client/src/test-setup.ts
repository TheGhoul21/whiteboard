import { vi } from 'vitest';
import '@testing-library/jest-dom';

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
})) as any;

HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,mock');

// Mock window.Image
global.Image = class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src = '';

  constructor() {
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 0);
  }
} as any;

// Mock Blob and URL.createObjectURL for blob URL tests
global.Blob = class MockBlob {
  constructor(public parts: any[], public options?: any) {}
} as any;

const blobUrls = new Set<string>();
let urlCounter = 0;

global.URL.createObjectURL = vi.fn((blob: any) => {
  const url = `blob:mock-${urlCounter++}`;
  blobUrls.add(url);
  return url;
});

global.URL.revokeObjectURL = vi.fn((url: string) => {
  blobUrls.delete(url);
});

// Mock XMLSerializer
global.XMLSerializer = class MockXMLSerializer {
  serializeToString(node: any) {
    return '<svg></svg>';
  }
} as any;

// Mock DOMParser
global.DOMParser = class MockDOMParser {
  parseFromString(str: string, type: string) {
    return {
      documentElement: {
        hasAttribute: () => false,
        setAttribute: vi.fn(),
        getAttribute: () => null
      }
    };
  }
} as any;
