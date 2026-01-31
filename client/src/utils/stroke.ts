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

// Direct fountain pen - responsive feel for fast, small writing
export function getCalligraphyPath(stroke: number[][], size: number = 8): string {
  if (stroke.length === 0) return '';

  // Calculate average velocity for adaptive parameters
  let totalDistance = 0;
  for (let i = 1; i < stroke.length; i++) {
    const dx = stroke[i][0] - stroke[i-1][0];
    const dy = stroke[i][1] - stroke[i-1][1];
    totalDistance += Math.sqrt(dx*dx + dy*dy);
  }
  
  const avgDistance = stroke.length > 1 ? totalDistance / (stroke.length - 1) : 0;
  const isFast = avgDistance > 3;

  // Fast writing = more responsive, less smoothing
  // Small size = less thinning for consistent width
  const points = getStroke(stroke, {
    size: size * 1.1,
    thinning: isFast ? 0.4 : 0.6,
    smoothing: isFast ? 0.35 : 0.5,
    streamline: isFast ? 0.45 : 0.6,
    easing: (t) => t,
    start: {
      taper: 8,
      easing: (t) => t,
      cap: true,
    },
    end: {
      taper: 12,
      easing: (t) => t,
      cap: true,
    },
    simulatePressure: true,
    last: true,
  });

  const len = points.length;
  if (len < 2) return '';

  // Direct drawing - straight lines for precise following
  let d = `M ${points[0][0]} ${points[0][1]}`;
  
  for (let i = 1; i < len; i++) {
    d += ` L ${points[i][0]} ${points[i][1]}`;
  }

  d += ' Z';
  return d;
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
