/**
 * Timeout protection for code execution sandbox
 * Prevents infinite loops from freezing the browser
 */

export class TimeoutError extends Error {
  constructor(duration: number) {
    super(`Code execution exceeded ${duration}ms timeout`);
    this.name = 'TimeoutError';
  }
}

/**
 * Wraps user code with cooperative timeout guards in loops
 * @param code User code string
 * @param guardVar Name of the guard variable to inject
 * @returns Modified code with timeout checks
 */
export function wrapCodeWithTimeoutGuards(code: string, guardVar: string): string {
  const checkStatement = `if (${guardVar}.shouldAbort()) throw new Error('TIMEOUT');`;

  // Inject timeout check as first statement in loop body
  // Match while loops with their bodies
  let result = code.replace(
    /while\s*\(([^)]+)\)\s*\{/g,
    (_match, condition) => `while (${condition}) { ${checkStatement}`
  );

  // Match for loops with their bodies
  result = result.replace(
    /for\s*\(([^)]+)\)\s*\{/g,
    (_match, forClause) => `for (${forClause}) { ${checkStatement}`
  );

  // Handle loops without curly braces by adding them
  result = result.replace(
    /while\s*\(([^)]+)\)\s+(?!{)([^\n;]+;?)/g,
    (_match, condition, statement) => `while (${condition}) { ${checkStatement} ${statement} }`
  );

  result = result.replace(
    /for\s*\(([^)]+)\)\s+(?!{)([^\n;]+;?)/g,
    (_match, forClause, statement) => `for (${forClause}) { ${checkStatement} ${statement} }`
  );

  return result;
}

/**
 * Creates an execution guard that tracks elapsed time
 * @param maxDuration Maximum execution time in milliseconds
 * @returns Guard object with shouldAbort method
 */
export function createExecutionGuard(maxDuration: number) {
  return {
    startTime: Date.now(),
    checkCount: 0,
    shouldAbort() {
      // Only check every 100th iteration to minimize overhead
      if (++this.checkCount % 100 !== 0) return false;
      return Date.now() - this.startTime > maxDuration;
    }
  };
}
