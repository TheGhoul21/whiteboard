import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AnimationRuntime } from './AnimationRuntime';
import type { Animation } from '../types';

describe('AnimationRuntime', () => {
  let animation: Animation;
  let onFrame: (values: Record<string, any>, frameIndex: number) => void;
  let onComplete: () => void;
  let onPause: () => void;

  beforeEach(() => {
    animation = {
      id: 'test-anim',
      codeBlockId: 'test-block',
      keyframes: [
        { id: 'kf1', time: 0, controlValues: { x: 0, y: 0 }, label: 'Start' },
        { id: 'kf2', time: 1, controlValues: { x: 100, y: 50 }, label: 'End' }
      ],
      duration: 1,
      fps: 30,
      loop: false
    };

    onFrame = vi.fn();
    onComplete = vi.fn();
    onPause = vi.fn();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('initialization', () => {
    it('should precompute all frames on initialization', () => {
      const runtime = new AnimationRuntime(animation, { fps: 30, onFrame });
      
      // Should have frames for 0 to 30 (1 second * 30 fps)
      expect(runtime.getFrame(0)).toEqual({ x: 0, y: 0 });
      expect(runtime.getFrame(30)).toEqual({ x: 100, y: 50 });
    });

    it('should interpolate values between keyframes', () => {
      const runtime = new AnimationRuntime(animation, { fps: 30, onFrame });
      
      // At frame 15 (halfway), values should be interpolated
      const halfway = runtime.getFrame(15);
      expect(halfway.x).toBeCloseTo(50, 0);
      expect(halfway.y).toBeCloseTo(25, 0);
    });
  });

  describe('frame retrieval', () => {
    it('should clamp frame index to valid range', () => {
      const runtime = new AnimationRuntime(animation, { fps: 30, onFrame });
      
      expect(runtime.getFrame(-1)).toEqual({ x: 0, y: 0 });
      expect(runtime.getFrame(1000)).toEqual({ x: 100, y: 50 });
    });

    it('should get frame at specific time', () => {
      const runtime = new AnimationRuntime(animation, { fps: 30, onFrame });
      
      expect(runtime.getFrameAtTime(0)).toEqual({ x: 0, y: 0 });
      expect(runtime.getFrameAtTime(0.5)).toEqual(runtime.getFrame(15));
      expect(runtime.getFrameAtTime(1)).toEqual({ x: 100, y: 50 });
    });
  });

  describe('interpolation', () => {
    it('should interpolate numbers linearly', () => {
      const runtime = new AnimationRuntime(animation, { fps: 30, onFrame });
      
      // Frame 7.5 out of 30 = 25% through
      const frame25 = runtime.getFrame(7);
      // 7/30 = 23.33% through, so x should be ~23.33
      expect(frame25.x).toBeCloseTo(23.33, 0);
      expect(frame25.y).toBeCloseTo(11.67, 0);
    });

    it('should interpolate colors', () => {
      const colorAnim: Animation = {
        id: 'color-test',
        codeBlockId: 'test',
        keyframes: [
          { id: 'kf1', time: 0, controlValues: { color: '#000000' } },
          { id: 'kf2', time: 1, controlValues: { color: '#ffffff' } }
        ],
        duration: 1,
        fps: 30,
        loop: false
      };

      const runtime = new AnimationRuntime(colorAnim, { fps: 30, onFrame });
      const halfway = runtime.getFrame(15);
      
      expect(halfway.color).toBe('#808080');
    });

    it('should interpolate range objects', () => {
      const rangeAnim: Animation = {
        id: 'range-test',
        codeBlockId: 'test',
        keyframes: [
          { id: 'kf1', time: 0, controlValues: { range: { min: 0, max: 100 } } },
          { id: 'kf2', time: 1, controlValues: { range: { min: 50, max: 150 } } }
        ],
        duration: 1,
        fps: 30,
        loop: false
      };

      const runtime = new AnimationRuntime(rangeAnim, { fps: 30, onFrame });
      const halfway = runtime.getFrame(15);
      
      expect(halfway.range.min).toBe(25);
      expect(halfway.range.max).toBe(125);
    });

    it('should switch booleans at midpoint', () => {
      const boolAnim: Animation = {
        id: 'bool-test',
        codeBlockId: 'test',
        keyframes: [
          { id: 'kf1', time: 0, controlValues: { visible: false } },
          { id: 'kf2', time: 1, controlValues: { visible: true } }
        ],
        duration: 1,
        fps: 30,
        loop: false
      };

      const runtime = new AnimationRuntime(boolAnim, { fps: 30, onFrame });
      
      // Before midpoint should be false
      expect(runtime.getFrame(14).visible).toBe(false);
      // At or after midpoint should be true
      expect(runtime.getFrame(15).visible).toBe(true);
    });
  });

  describe('playback control', () => {
    it('should not be playing initially', () => {
      const runtime = new AnimationRuntime(animation, { fps: 30, onFrame });
      expect(runtime.playing).toBe(false);
    });

    it('should start playing when play() is called', () => {
      const runtime = new AnimationRuntime(animation, { fps: 30, onFrame });
      runtime.play();
      expect(runtime.playing).toBe(true);
      runtime.pause();
    });

    it('should pause when pause() is called', () => {
      const runtime = new AnimationRuntime(animation, { fps: 30, onFrame, onPause });
      runtime.play();
      expect(runtime.playing).toBe(true);
      
      runtime.pause();
      expect(runtime.playing).toBe(false);
      expect(onPause).toHaveBeenCalled();
    });

    it('should stop and reset to beginning', () => {
      const runtime = new AnimationRuntime(animation, { fps: 30, onFrame });
      runtime.play();
      
      // Simulate some time passing
      runtime.seek(0.5);
      expect(runtime.time).toBe(0.5);
      
      runtime.stop();
      expect(runtime.playing).toBe(false);
      expect(runtime.time).toBe(0);
    });

    it('should seek to specific time', () => {
      const runtime = new AnimationRuntime(animation, { fps: 30, onFrame });
      
      runtime.seek(0.5);
      expect(runtime.time).toBe(0.5);
      expect(onFrame).toHaveBeenCalledWith(expect.any(Object), 15);
    });
  });

  describe('animation loop', () => {
    it('should call onFrame with correct values during playback', async () => {
      vi.useFakeTimers();
      
      const runtime = new AnimationRuntime(animation, { fps: 30, onFrame });
      runtime.play();
      
      // Fast-forward 100ms
      vi.advanceTimersByTime(100);
      
      expect(onFrame).toHaveBeenCalled();
      
      runtime.pause();
      vi.useRealTimers();
    });

    it('should loop when loop is enabled', () => {
      const loopAnim: Animation = { ...animation, loop: true };
      const runtime = new AnimationRuntime(loopAnim, { fps: 30, onFrame });
      
      runtime.seek(1.5); // Past duration
      expect(runtime.time).toBe(0.5); // Should wrap around
    });

    it('should clamp time to duration when not looping', () => {
      const runtime = new AnimationRuntime(animation, { fps: 30, onFrame, onComplete });
      
      runtime.seek(2); // Past duration
      expect(runtime.time).toBe(1); // Should clamp to duration
    });
  });

  describe('cleanup', () => {
    it('should clean up resources on destroy', () => {
      const runtime = new AnimationRuntime(animation, { fps: 30, onFrame });
      runtime.play();
      
      runtime.destroy();
      
      expect(runtime.playing).toBe(false);
    });
  });

  describe('performance', () => {
    it('should handle large animation efficiently', () => {
      const largeKeyframes = [];
      for (let i = 0; i <= 1000; i++) {
        largeKeyframes.push({
          id: `kf${i}`,
          time: i / 10,
          controlValues: { value: i }
        });
      }

      const largeAnim: Animation = {
        id: 'large-test',
        codeBlockId: 'test',
        keyframes: largeKeyframes,
        duration: 100,
        fps: 60,
        loop: false
      };

      const start = performance.now();
      const runtime = new AnimationRuntime(largeAnim, { fps: 60, onFrame });
      const end = performance.now();

      // Should initialize in under 1000ms even for 1000 frames at 60fps
      expect(end - start).toBeLessThan(1000);
      
      // Frame access should be instant
      const frameStart = performance.now();
      runtime.getFrame(3000);
      const frameEnd = performance.now();
      expect(frameEnd - frameStart).toBeLessThan(1);
    });
  });
});
