import { describe, it, expect, beforeEach } from 'vitest';
import { FrameCache } from './FrameCache';

describe('FrameCache', () => {
  let cache: FrameCache;

  beforeEach(() => {
    cache = new FrameCache();
  });

  describe('basic operations', () => {
    it('should register and retrieve frames', () => {
      cache.register(0, { x: 0, y: 0 });
      cache.register(1, { x: 100, y: 50 });

      expect(cache.get(0)).toEqual({ x: 0, y: 0 });
      expect(cache.get(1)).toEqual({ x: 100, y: 50 });
    });

    it('should return undefined for non-existent frames', () => {
      expect(cache.get(999)).toBeUndefined();
    });

    it('should track size correctly', () => {
      expect(cache.size).toBe(0);
      
      cache.register(0, { x: 0 });
      expect(cache.size).toBe(1);
      
      cache.register(1, { x: 100 });
      expect(cache.size).toBe(2);
    });

    it('should check if frame exists', () => {
      cache.register(0, { x: 0 });
      
      expect(cache.has(0)).toBe(true);
      expect(cache.has(1)).toBe(false);
    });

    it('should get all frame indices sorted', () => {
      cache.register(5, { x: 5 });
      cache.register(1, { x: 1 });
      cache.register(3, { x: 3 });

      expect(cache.getFrameIndices()).toEqual([1, 3, 5]);
    });
  });

  describe('interpolation', () => {
    beforeEach(() => {
      cache.register(0, { x: 0, y: 0 });
      cache.register(10, { x: 100, y: 50 });
    });

    it('should return exact frame when available', () => {
      const frame = cache.getInterpolated(0);
      expect(frame).toEqual({ x: 0, y: 0 });
    });

    it('should interpolate between frames', () => {
      const frame = cache.getInterpolated(5); // Halfway
      expect(frame?.x).toBe(50);
      expect(frame?.y).toBe(25);
    });

    it('should interpolate at fractional positions', () => {
      const frame = cache.getInterpolated(2.5); // 25% through
      expect(frame?.x).toBe(25);
      expect(frame?.y).toBe(12.5);
    });

    it('should return nearest frame when interpolating outside range', () => {
      // When requesting frame 100 but only have up to frame 10, should return last frame
      expect(cache.getInterpolated(100)).toEqual({ x: 100, y: 50 });
      // When requesting frame -10 but only have from frame 0, should return first frame
      expect(cache.getInterpolated(-10)).toEqual({ x: 0, y: 0 });
    });

    it('should interpolate nested objects', () => {
      cache.register(0, { point: { x: 0, y: 0 } });
      cache.register(10, { point: { x: 100, y: 50 } });

      const frame = cache.getInterpolated(5);
      expect(frame?.point.x).toBe(50);
      expect(frame?.point.y).toBe(25);
    });

    it('should interpolate arrays', () => {
      cache.register(0, { values: [0, 10, 20] });
      cache.register(10, { values: [100, 50, 0] });

      const frame = cache.getInterpolated(5);
      expect(frame?.values).toEqual([50, 30, 10]);
    });

    it('should switch non-interpolatable values at midpoint', () => {
      cache.register(0, { visible: false, name: 'start' });
      cache.register(10, { visible: true, name: 'end' });

      const before = cache.getInterpolated(4);
      expect(before?.visible).toBe(false);
      expect(before?.name).toBe('start');

      const after = cache.getInterpolated(6);
      expect(after?.visible).toBe(true);
      expect(after?.name).toBe('end');
    });
  });

  describe('metadata', () => {
    it('should store and retrieve metadata', () => {
      cache.setMetadata('fps', 60);
      cache.setMetadata('duration', 10);

      expect(cache.getMetadata('fps')).toBe(60);
      expect(cache.getMetadata('duration')).toBe(10);
    });

    it('should return undefined for missing metadata', () => {
      expect(cache.getMetadata('missing')).toBeUndefined();
    });
  });

  describe('serialization', () => {
    it('should serialize and deserialize', () => {
      cache.register(0, { x: 0 });
      cache.register(1, { x: 100 });
      cache.setMetadata('fps', 60);

      const serialized = cache.serialize();
      
      const newCache = new FrameCache();
      newCache.deserialize(serialized);

      expect(newCache.get(0)).toEqual({ x: 0 });
      expect(newCache.get(1)).toEqual({ x: 100 });
      expect(newCache.getMetadata('fps')).toBe(60);
    });
  });

  describe('memory management', () => {
    it('should clear all data', () => {
      cache.register(0, { x: 0 });
      cache.setMetadata('key', 'value');

      cache.clear();

      expect(cache.size).toBe(0);
      expect(cache.getMetadata('key')).toBeUndefined();
    });

    it('should provide memory usage estimate', () => {
      cache.register(0, { x: 0, y: 0, z: 0 });
      cache.register(1, { x: 100, y: 100, z: 100 });

      const usage = cache.getMemoryUsage();
      expect(usage).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty cache', () => {
      expect(cache.getInterpolated(0)).toBeUndefined();
      expect(cache.getFrameIndices()).toEqual([]);
      expect(cache.size).toBe(0);
    });

    it('should handle single frame', () => {
      cache.register(0, { x: 50 });
      
      expect(cache.getInterpolated(0)).toEqual({ x: 50 });
      expect(cache.getInterpolated(5)).toEqual({ x: 50 }); // No upper frame, returns lower
    });

    it('should preserve data immutability on register', () => {
      const data = { x: 0, nested: { y: 0 } };
      cache.register(0, data);
      
      // Modify original
      data.x = 100;
      data.nested.y = 50;

      // Cached data should be unchanged
      expect(cache.get(0)).toEqual({ x: 0, nested: { y: 0 } });
    });
  });
});
