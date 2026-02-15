import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TimeoutError, wrapCodeWithTimeoutGuards, createExecutionGuard } from './sandboxTimeout';

describe('sandboxTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('TimeoutError', () => {
    it('should create error with correct message', () => {
      const error = new TimeoutError(5000);
      expect(error.message).toBe('Code execution exceeded 5000ms timeout');
      expect(error.name).toBe('TimeoutError');
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('wrapCodeWithTimeoutGuards', () => {
    it('should inject timeout checks into while loops with braces', () => {
      const code = 'while (true) { doSomething(); }';
      const wrapped = wrapCodeWithTimeoutGuards(code, '__guard');

      expect(wrapped).toContain('if (__guard.shouldAbort()) throw new Error(\'TIMEOUT\');');
      expect(wrapped).toContain('while (true) { if (__guard.shouldAbort()) throw new Error(\'TIMEOUT\');');
    });

    it('should inject timeout checks into for loops with braces', () => {
      const code = 'for (let i = 0; i < 100; i++) { doSomething(); }';
      const wrapped = wrapCodeWithTimeoutGuards(code, '__guard');

      expect(wrapped).toContain('if (__guard.shouldAbort()) throw new Error(\'TIMEOUT\');');
      expect(wrapped).toContain('for (let i = 0; i < 100; i++) { if (__guard.shouldAbort()) throw new Error(\'TIMEOUT\');');
    });

    it('should inject timeout checks into while loops without braces', () => {
      const code = 'while (true) doSomething();';
      const wrapped = wrapCodeWithTimeoutGuards(code, '__guard');

      expect(wrapped).toContain('if (__guard.shouldAbort()) throw new Error(\'TIMEOUT\');');
      expect(wrapped).toContain('{ if (__guard.shouldAbort()) throw new Error(\'TIMEOUT\');');
    });

    it('should inject timeout checks into for loops without braces', () => {
      const code = 'for (let i = 0; i < 100; i++) doSomething();';
      const wrapped = wrapCodeWithTimeoutGuards(code, '__guard');

      expect(wrapped).toContain('if (__guard.shouldAbort()) throw new Error(\'TIMEOUT\');');
      expect(wrapped).toContain('{ if (__guard.shouldAbort()) throw new Error(\'TIMEOUT\');');
    });

    it('should handle multiple loops in the same code', () => {
      const code = `
        while (condition1) { doA(); }
        for (let i = 0; i < 10; i++) { doB(); }
        while (condition2) { doC(); }
      `;
      const wrapped = wrapCodeWithTimeoutGuards(code, '__guard');

      // Should have 3 timeout checks (one per loop)
      const checkCount = (wrapped.match(/if \(__guard\.shouldAbort\(\)\) throw new Error\('TIMEOUT'\);/g) || []).length;
      expect(checkCount).toBe(3);
    });

    it('should not modify code without loops', () => {
      const code = 'const x = 10; console.log(x);';
      const wrapped = wrapCodeWithTimeoutGuards(code, '__guard');

      expect(wrapped).not.toContain('__guard.shouldAbort()');
    });
  });

  describe('createExecutionGuard', () => {
    it('should create guard with correct properties', () => {
      const guard = createExecutionGuard(5000);

      expect(guard).toHaveProperty('startTime');
      expect(guard).toHaveProperty('checkCount');
      expect(guard).toHaveProperty('shouldAbort');
      expect(typeof guard.shouldAbort).toBe('function');
    });

    it('should not abort before timeout', () => {
      const guard = createExecutionGuard(5000);

      // Call shouldAbort 200 times (should check on 100th and 200th)
      for (let i = 0; i < 200; i++) {
        expect(guard.shouldAbort()).toBe(false);
      }
    });

    it('should abort after timeout', () => {
      const guard = createExecutionGuard(1000);
      const startTime = Date.now();
      guard.startTime = startTime;

      // Advance time by 1500ms
      vi.setSystemTime(startTime + 1500);

      // Force check by calling 100 times
      for (let i = 0; i < 99; i++) {
        guard.shouldAbort();
      }

      // 100th call should check time
      expect(guard.shouldAbort()).toBe(true);
    });

    it('should only check time every 100 calls for performance', () => {
      const guard = createExecutionGuard(5000);
      const dateSpy = vi.spyOn(Date, 'now');

      // Call 99 times - should not check time
      for (let i = 0; i < 99; i++) {
        guard.shouldAbort();
      }

      const callsBefore = dateSpy.mock.calls.length;

      // 100th call should check time
      guard.shouldAbort();

      const callsAfter = dateSpy.mock.calls.length;
      expect(callsAfter).toBeGreaterThan(callsBefore);
    });

    it('should handle rapid consecutive checks correctly', () => {
      const guard = createExecutionGuard(100);
      const startTime = Date.now();
      guard.startTime = startTime;

      // Advance time past timeout
      vi.setSystemTime(startTime + 200);

      // First 99 calls return false (not checking)
      for (let i = 0; i < 99; i++) {
        expect(guard.shouldAbort()).toBe(false);
      }

      // 100th call checks and returns true
      expect(guard.shouldAbort()).toBe(true);

      // Next 99 calls return false again
      for (let i = 0; i < 99; i++) {
        expect(guard.shouldAbort()).toBe(false);
      }

      // 200th call checks and returns true
      expect(guard.shouldAbort()).toBe(true);
    });
  });

  describe('Integration: Guard in wrapped code', () => {
    it('should throw TIMEOUT error when guard triggers in while loop', () => {
      const code = 'let i = 0; while (i < 1000000) { i++; }';
      const wrapped = wrapCodeWithTimeoutGuards(code, '__guard');
      const guard = createExecutionGuard(100);
      const startTime = Date.now();
      guard.startTime = startTime;

      // Advance time past timeout
      vi.setSystemTime(startTime + 200);

      expect(() => {
        const fn = new Function('__guard', wrapped);
        fn(guard);
      }).toThrow('TIMEOUT');
    });

    it('should throw TIMEOUT error when guard triggers in for loop', () => {
      const code = 'for (let i = 0; i < 1000000; i++) { const x = i * 2; }';
      const wrapped = wrapCodeWithTimeoutGuards(code, '__guard');
      const guard = createExecutionGuard(100);
      const startTime = Date.now();
      guard.startTime = startTime;

      // Advance time past timeout
      vi.setSystemTime(startTime + 200);

      expect(() => {
        const fn = new Function('__guard', wrapped);
        fn(guard);
      }).toThrow('TIMEOUT');
    });

    it('should complete successfully if execution finishes before timeout', () => {
      const code = 'let sum = 0; for (let i = 0; i < 10; i++) { sum += i; } return sum;';
      const wrapped = wrapCodeWithTimeoutGuards(code, '__guard');
      const guard = createExecutionGuard(5000);

      expect(() => {
        const fn = new Function('__guard', wrapped);
        const result = fn(guard);
        expect(result).toBe(45);
      }).not.toThrow();
    });
  });
});
