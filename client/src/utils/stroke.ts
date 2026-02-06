import { getStroke } from 'perfect-freehand';

export function getSvgPathFromStroke(stroke: number[][], size: number = 8, thinning: number = 0.2): string {
  if (stroke.length === 0) return '';

  const points = getStroke(stroke, {
    size: size,
    thinning: thinning,
    smoothing: 0.75,
    streamline: 0.4,
    easing: (t) => t,
    start: {
      taper: 0,
      easing: (t) => t,
      cap: true,
    },
    end: {
      taper: 0,
      easing: (t) => t,
      cap: true,
    },
    simulatePressure: true,
  });

  const len = points.length;
  if (len < 2) return '';

  let d = `M ${points[0][0]} ${points[0][1]}`;

  for (let i = 1; i < len; i++) {
    d += ` L ${points[i][0]} ${points[i][1]}`;
  }

  // To close the loop properly for filled paths (which perfect-freehand generates)
  d += ' Z';

  return d;
}

// Seeded PRNG — spray dots must be identical across re-renders for the same stroke
function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 17)) >>> 0) / 4294967296;
  };
}

// Small ink-splatter dots scattered around the stroke path.
// Dots appear progressively as the stroke grows and never move once placed.
function sprayDots(stroke: number[][], size: number): string {
  if (stroke.length < 6) return '';

  // Seed from the first 4 points only — these never change during drawing
  let seed = 0xDEAD;
  for (let i = 0; i < Math.min(stroke.length, 4); i++) {
    seed = (seed * 31 + (stroke[i][0] * 997 | 0)) | 0;
    seed = (seed * 31 + (stroke[i][1] * 991 | 0)) | 0;
  }
  const rand = mulberry32(seed);

  const parts: string[] = [];
  // Fixed stride: each candidate index is absolute, so dots don't shift as stroke grows.
  // Leave one stride's worth of headroom at the end (keeps the taper region clean).
  const stride = 8; // Reduced from 12 for more density

  for (let i = stride; i < stroke.length - stride; i += stride) {
    // Always consume exactly 4 values per position — keeps the PRNG sequence
    // locked regardless of which positions are skipped.
    const roll  = rand();
    const angle = rand() * Math.PI * 2;
    const distR = rand();
    const sizeR = rand();

    if (roll < 0.25) continue; // Reduced from 0.5 - now ~75% of candidates are drawn

    const dist = size * 0.5 + distR * size * 1.0; // Slightly closer to the stroke
    const x    = stroke[i][0] + Math.cos(angle) * dist;
    const y    = stroke[i][1] + Math.sin(angle) * dist;
    const r    = size * 0.15 + sizeR * sizeR * size * 0.65; // Significantly larger dots

    parts.push(
      `M ${(x - r).toFixed(2)} ${y.toFixed(2)} ` +
      `A ${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(x + r).toFixed(2)} ${y.toFixed(2)} ` +
      `A ${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(x - r).toFixed(2)} ${y.toFixed(2)} Z`
    );
  }
  return parts.join(' ');
}

// Advanced fountain pen with physics-based ink flow simulation
// Uses perfect-freehand with optimized parameters for natural calligraphy effect
export function getCalligraphyPath(stroke: number[][], size: number = 8, spray: boolean = true): string {
  if (stroke.length === 0) return '';

  // Handle single point (dot) - create a circular dot
  if (stroke.length === 1) {
    const x = stroke[0][0];
    const y = stroke[0][1];
    const r = size * 0.55;
    return `M ${x - r} ${y} A ${r} ${r} 0 1 0 ${x + r} ${y} A ${r} ${r} 0 1 0 ${x - r} ${y} Z`;
  }

  // Handle very short strokes (2-3 points close together) as dots
  // This handles quick taps/clicks that create minimal movement
  if (stroke.length <= 3) {
    const first = stroke[0];
    const last = stroke[stroke.length - 1];
    const dx = last[0] - first[0];
    const dy = last[1] - first[1];
    const totalDist = Math.sqrt(dx * dx + dy * dy);

    // If total distance is very small relative to size, render as a dot
    if (totalDist < size * 0.5) {
      // Center of the dot
      const cx = (first[0] + last[0]) / 2;
      const cy = (first[1] + last[1]) / 2;
      const r = size * 0.55;
      return `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;
    }
  }

  // Calculate stroke metrics for adaptive behavior
  let totalDistance = 0;
  let maxSpeed = 0;
  const speeds: number[] = [0];

  for (let i = 1; i < stroke.length; i++) {
    const dx = stroke[i][0] - stroke[i-1][0];
    const dy = stroke[i][1] - stroke[i-1][1];
    const dist = Math.sqrt(dx * dx + dy * dy);
    totalDistance += dist;
    speeds.push(dist);
    maxSpeed = Math.max(maxSpeed, dist);
  }

  const avgSpeed = stroke.length > 1 ? totalDistance / (stroke.length - 1) : 0;

  // Enhanced speed detection: look at speed distribution, not just average
  // Count how many points are "fast" vs "slow"
  const fastThreshold = 4;
  const veryFastThreshold = 8;
  let fastPointCount = 0;
  let veryFastPointCount = 0;

  speeds.forEach(s => {
    if (s > fastThreshold) fastPointCount++;
    if (s > veryFastThreshold) veryFastPointCount++;
  });

  const fastRatio = speeds.length > 0 ? fastPointCount / speeds.length : 0;
  const veryFastRatio = speeds.length > 0 ? veryFastPointCount / speeds.length : 0;

  // A stroke is "quick" if more than 30% of points are fast OR average is high
  const isQuick = fastRatio > 0.3 || avgSpeed > 3;
  // A stroke is "very fast" if more than 20% of points are very fast OR average is very high
  const isVeryFast = veryFastRatio > 0.2 || avgSpeed > 6 || maxSpeed > 12;
  // Detect choppy/deliberate strokes (many small segments)
  const isChoppy = stroke.length > 20 && avgSpeed < 2.5;
  const isLong = stroke.length > 40;

  // Slow start: ink pools at the nib when pen hesitates before moving
  const slowStart = speeds.length > 1 && speeds[1] < 2;

  // Adaptive fountain pen settings based on stroke characteristics
  const points = getStroke(stroke, {
    // Size adapts: much more dramatic variation
    // Very fast = thin and light, choppy/slow = thick and bold
    size: size * (isVeryFast ? 0.75 : isQuick ? 0.88 : isChoppy ? 1.25 : 1.15),

    // Thinning: controls thick-to-thin contrast; higher = more calligraphic character
    // Fast strokes get more variation, slow strokes stay more consistent
    thinning: isVeryFast ? 0.55 : isQuick ? 0.68 : isChoppy ? 0.35 : 0.75,

    // Smoothing: much less for fast strokes to show gesture, more for deliberate strokes
    smoothing: isVeryFast ? 0.25 : isQuick ? 0.4 : isChoppy ? 0.7 : 0.58,

    // Streamline: more for long/fast strokes to maintain flow, less for choppy
    streamline: isLong ? 0.7 : isVeryFast ? 0.6 : isQuick ? 0.52 : isChoppy ? 0.45 : 0.62,

    // Custom easing for elegant ink flow simulation
    easing: (t) => {
      // Fast strokes: more linear for crisp response
      // Slow strokes: more easing for smooth flow
      if (isVeryFast) {
        return t * (2 - t); // Ease-out quadratic
      } else if (isChoppy) {
        // Very smooth for deliberate strokes
        return t * t * (3 - 2 * t); // Smoothstep
      } else {
        // Default: smooth step with slight asymmetry
        const t2 = t * t;
        const t3 = t2 * t;
        return 3 * t2 - 2 * t3 + 0.1 * Math.sin(t * Math.PI);
      }
    },

    start: {
      // Slow start: short taper so the stroke begins heavy (ink-loaded nib)
      // Fast start: longer taper for crisp entry
      taper: slowStart
        ? (isVeryFast ? 2 : isQuick ? 3 : 5)
        : (isVeryFast ? 8 : isQuick ? 12 : isChoppy ? 8 : 16),
      easing: (t) => isVeryFast ? t * t : t * t * (3 - 2 * t),
      cap: true,
    },

    end: {
      // Longer end taper for elegant trailing-off
      // Very fast strokes get shorter taper for quick release
      taper: isVeryFast ? 10 : isQuick ? 18 : isChoppy ? 12 : 30,
      easing: (t) => {
        if (isVeryFast) {
          // Quick release
          return t * t;
        } else {
          // Elegant flick-off effect
          const ease = 1 - Math.pow(1 - t, 3);
          return ease * (1 + 0.1 * (1 - t));
        }
      },
      cap: true,
    },

    simulatePressure: true,
    last: true,
  });

  if (points.length < 2) return '';

  // Generate ultra-smooth SVG path with cubic Bezier curves
  let d = `M ${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`;
  
  // Use smooth quadratic curves with midpoint control
  for (let i = 1; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    
    // Calculate midpoint for smooth curve transition
    const midX = (curr[0] + next[0]) / 2;
    const midY = (curr[1] + next[1]) / 2;
    
    d += ` Q ${curr[0].toFixed(2)} ${curr[1].toFixed(2)}, ${midX.toFixed(2)} ${midY.toFixed(2)}`;
  }
  
  // Connect to last point
  const last = points[points.length - 1];
  d += ` L ${last[0].toFixed(2)} ${last[1].toFixed(2)}`;

  d += ' Z';

  let result = d;

  // Ink blob: when the pen hesitates before moving, ink pools at the nib contact point.
  if (slowStart) {
    const blobR = size * 0.8;
    const sx = stroke[0][0];
    const sy = stroke[0][1];
    result = `M ${sx - blobR} ${sy} A ${blobR} ${blobR} 0 1 0 ${sx + blobR} ${sy} A ${blobR} ${blobR} 0 1 0 ${sx - blobR} ${sy} Z ` + result;
  }

  // Ink spray: small splatter dots for a characteristic textured feel
  if (spray) {
    const dots = sprayDots(stroke, size);
    if (dots) result += ' ' + dots;
  }

  return result;
}

// Helper to convert our [x1, y1, x2, y2...] flat format to [[x,y], [x,y]...]
export function flatToPoints(flat: number[]): number[][] {
  const points: number[][] = [];
  for (let i = 0; i < flat.length; i += 2) {
    points.push([flat[i], flat[i + 1]]);
  }
  return points;
}

// Smooth points using moving average for more natural curves
export function smoothPoints(flat: number[], windowSize: number = 3): number[] {
  if (flat.length < windowSize * 2) return flat;

  const result: number[] = [];
  const half = Math.floor(windowSize / 2);

  for (let i = 0; i < flat.length; i += 2) {
    let sumX = 0, sumY = 0, count = 0;

    for (let j = -half; j <= half; j++) {
      const idx = i + j * 2;
      if (idx >= 0 && idx < flat.length - 1) {
        sumX += flat[idx];
        sumY += flat[idx + 1];
        count++;
      }
    }

    result.push(sumX / count, sumY / count);
  }

  return result;
}

// Generates a smooth SVG path from points using Quadratic Bezier curves (midpoint interpolation)
// This creates a much smoother line than standard polylines or simple splines
export function getSmoothLinePath(flatPoints: number[]): string {
  const points = flatToPoints(flatPoints);
  if (points.length < 2) return '';

  let d = `M ${points[0][0]} ${points[0][1]}`;

  // Loop through points and create quadratic curves between midpoints
  // using the actual points as control points
  for (let i = 1; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const midX = (p1[0] + p2[0]) / 2;
    const midY = (p1[1] + p2[1]) / 2;
    
    // Curve from previous point (or midpoint) to this midpoint, controlled by p1
    d += ` Q ${p1[0]} ${p1[1]}, ${midX} ${midY}`;
  }

  // Draw line to the very last point
  const last = points[points.length - 1];
  d += ` L ${last[0]} ${last[1]}`;

  return d;
}
