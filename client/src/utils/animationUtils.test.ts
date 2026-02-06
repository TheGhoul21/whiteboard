import { describe, it, expect } from 'vitest';
import { valuesEqual, simulateFrameDispatch } from './animationUtils';

// ---------------------------------------------------------------------------
// valuesEqual
// ---------------------------------------------------------------------------
describe('valuesEqual', () => {
  it('returns true for identical primitive values', () => {
    expect(valuesEqual({ a: 1, b: 'hi' }, { a: 1, b: 'hi' })).toBe(true);
  });

  it('returns false when a value differs', () => {
    expect(valuesEqual({ a: 1 }, { a: 2 })).toBe(false);
  });

  it('returns false when key counts differ', () => {
    expect(valuesEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });

  it('returns false when a key is missing in b', () => {
    expect(valuesEqual({ a: 1 }, { b: 1 })).toBe(false);
  });

  it('handles boolean values', () => {
    expect(valuesEqual({ x: true }, { x: true })).toBe(true);
    expect(valuesEqual({ x: true }, { x: false })).toBe(false);
  });

  it('handles color strings', () => {
    expect(valuesEqual({ c: '#ff0000' }, { c: '#ff0000' })).toBe(true);
    expect(valuesEqual({ c: '#ff0000' }, { c: '#00ff00' })).toBe(false);
  });

  it('handles nested range objects {min, max}', () => {
    expect(valuesEqual(
      { r: { min: 0, max: 10 } },
      { r: { min: 0, max: 10 } }
    )).toBe(true);
    expect(valuesEqual(
      { r: { min: 0, max: 10 } },
      { r: { min: 0, max: 11 } }
    )).toBe(false);
  });

  it('returns false when one value is object and other is primitive', () => {
    expect(valuesEqual({ a: { min: 0 } }, { a: 0 } as any)).toBe(false);
  });

  it('returns false when one value is null and other is object', () => {
    expect(valuesEqual({ a: null }, { a: { min: 0 } })).toBe(false);
  });

  it('compares empty records as equal', () => {
    expect(valuesEqual({}, {})).toBe(true);
  });

  it('handles button objects {clickCount, lastClicked}', () => {
    expect(valuesEqual(
      { btn: { clickCount: 3, lastClicked: 100 } },
      { btn: { clickCount: 3, lastClicked: 100 } }
    )).toBe(true);
    expect(valuesEqual(
      { btn: { clickCount: 3, lastClicked: 100 } },
      { btn: { clickCount: 4, lastClicked: 200 } }
    )).toBe(false);
  });

  it('handles mixed control types', () => {
    const a = { Step: 10, 'Learning Rate': 0.1, color: '#abc', show: true };
    const b = { Step: 10, 'Learning Rate': 0.1, color: '#abc', show: true };
    expect(valuesEqual(a, b)).toBe(true);

    const c = { ...b, Step: 11 };
    expect(valuesEqual(a, c)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// simulateFrameDispatch  (dirty-flag + frame-index gate)
// ---------------------------------------------------------------------------
describe('simulateFrameDispatch', () => {
  it('dispatches every frame when values change', () => {
    const frames = [
      { time: 0.0, values: { Step: 0 } },
      { time: 0.1, values: { Step: 1 } },
      { time: 0.2, values: { Step: 2 } },
      { time: 0.3, values: { Step: 3 } },
    ];

    const result = simulateFrameDispatch(frames, 10);
    expect(result.map(r => r.dispatched)).toEqual([true, true, true, true]);
  });

  it('skips dispatch when values are frozen (converged animation)', () => {
    // Simulate gradient descent that converges at step 3 but timeline goes to step 5
    const frames = [
      { time: 0.0, values: { Step: 0 } },
      { time: 0.1, values: { Step: 1 } },
      { time: 0.2, values: { Step: 2 } },
      { time: 0.3, values: { Step: 3 } },  // last keyframe
      { time: 0.4, values: { Step: 3 } },  // frozen — should skip
      { time: 0.5, values: { Step: 3 } },  // frozen — should skip
    ];

    const result = simulateFrameDispatch(frames, 10);
    expect(result.map(r => r.dispatched)).toEqual([
      true, true, true, true, false, false
    ]);
  });

  it('does not re-dispatch within the same frame index', () => {
    // Two RAF ticks that map to the same frame index
    const frames = [
      { time: 0.00, values: { x: 0 } },
      { time: 0.01, values: { x: 0.1 } },  // same frame at 10fps
      { time: 0.10, values: { x: 1 } },
    ];

    const result = simulateFrameDispatch(frames, 10);
    // frame 0 dispatched, frame 0 again skipped (same index), frame 1 dispatched
    expect(result.map(r => r.dispatched)).toEqual([true, false, true]);
  });

  it('re-dispatches if values change after a frozen section', () => {
    const frames = [
      { time: 0.0, values: { x: 1 } },
      { time: 0.1, values: { x: 1 } },  // frozen
      { time: 0.2, values: { x: 1 } },  // frozen
      { time: 0.3, values: { x: 2 } },  // changed! dispatch again
      { time: 0.4, values: { x: 3 } },
    ];

    const result = simulateFrameDispatch(frames, 10);
    expect(result.map(r => r.dispatched)).toEqual([
      true, false, false, true, true
    ]);
  });

  it('handles looping animation (values wrap back to start)', () => {
    const frames = [
      { time: 0.0, values: { Step: 0 } },
      { time: 0.1, values: { Step: 1 } },
      { time: 0.2, values: { Step: 2 } },
      // Loop wraps back
      { time: 0.3, values: { Step: 0 } },
      { time: 0.4, values: { Step: 1 } },
    ];

    const result = simulateFrameDispatch(frames, 10);
    expect(result.map(r => r.dispatched)).toEqual([
      true, true, true, true, true
    ]);
  });

  it('handles range objects in values', () => {
    const frames = [
      { time: 0.0, values: { r: { min: 0, max: 10 } } },
      { time: 0.1, values: { r: { min: 1, max: 9 } } },
      { time: 0.2, values: { r: { min: 1, max: 9 } } },  // frozen
    ];

    const result = simulateFrameDispatch(frames, 10);
    expect(result.map(r => r.dispatched)).toEqual([true, true, false]);
  });

  it('dispatches first frame even with empty initial state', () => {
    const frames = [
      { time: 0.0, values: { a: 42 } },
    ];
    const result = simulateFrameDispatch(frames, 30);
    expect(result[0].dispatched).toBe(true);
  });

  it('handles high fps with many frames per keyframe', () => {
    // At 60fps, frames 0.000-0.016 all map to frame 0
    const frames = [
      { time: 0.000, values: { x: 0 } },
      { time: 0.005, values: { x: 0.3 } },
      { time: 0.010, values: { x: 0.6 } },
      { time: 0.016, values: { x: 0.96 } },
      { time: 0.017, values: { x: 1.0 } },  // frame 1 at 60fps
    ];

    const result = simulateFrameDispatch(frames, 60);
    // Only frame 0 (first) and frame 1 (time >= 1/60) dispatch
    expect(result[0].dispatched).toBe(true);
    expect(result[1].dispatched).toBe(false);  // same frame index
    expect(result[2].dispatched).toBe(false);  // same frame index
    expect(result[3].dispatched).toBe(false);  // same frame index
    expect(result[4].dispatched).toBe(true);   // new frame index
  });
});
