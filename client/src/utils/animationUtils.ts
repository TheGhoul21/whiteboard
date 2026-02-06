/**
 * Shallow-compare two control-value records.  Used as a dirty-flag in the
 * animation loop: if values haven't changed between frames (e.g. time is
 * past the last keyframe) we skip the expensive onExecute call entirely.
 *
 * Handles: primitives (===), nested shallow objects like range {min, max}.
 */
export function valuesEqual(
  a: Record<string, any>,
  b: Record<string, any>
): boolean {
  const keysA = Object.keys(a);
  if (keysA.length !== Object.keys(b).length) return false;
  for (const key of keysA) {
    if (!(key in b)) return false;
    const va = a[key], vb = b[key];
    if (typeof va === 'object' && va !== null) {
      if (typeof vb !== 'object' || vb === null) return false;
      for (const sub of Object.keys(va)) {
        if (va[sub] !== vb[sub]) return false;
      }
    } else if (va !== vb) {
      return false;
    }
  }
  return true;
}

/**
 * Simulate the AnimationPlayer frame-dispatch logic.
 * Given a sequence of (time, interpolatedValues) pairs, returns which
 * frames would actually fire onExecute (dirty-flag + frame-index gate).
 */
export function simulateFrameDispatch(
  frames: Array<{ time: number; values: Record<string, any> }>,
  fps: number
): Array<{ time: number; values: Record<string, any>; dispatched: boolean }> {
  let lastExecutedFrame = -1;
  let lastDispatchedValues: Record<string, any> = {};

  return frames.map(({ time, values }) => {
    const frameIndex = Math.floor(time * fps);
    let dispatched = false;

    if (frameIndex !== lastExecutedFrame) {
      lastExecutedFrame = frameIndex;
      if (!valuesEqual(values, lastDispatchedValues)) {
        lastDispatchedValues = values;
        dispatched = true;
      }
    }

    return { time, values, dispatched };
  });
}
