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

// Helper to convert our [x1, y1, x2, y2...] flat format to [[x,y], [x,y]...]
export function flatToPoints(flat: number[]): number[][] {
  const points: number[][] = [];
  for (let i = 0; i < flat.length; i += 2) {
    points.push([flat[i], flat[i + 1]]);
  }
  return points;
}

// Simplify points using Ramer-Douglas-Peucker algorithm to reduce angles
function simplifyPoints(points: number[][], epsilon: number = 1.0): number[][] {
  if (points.length <= 2) return points;

  // Find the point with the maximum distance
  let maxDist = 0;
  let index = 0;
  const end = points.length - 1;

  for (let i = 1; i < end; i++) {
    const dist = perpendicularDistance(points[i], points[0], points[end]);
    if (dist > maxDist) {
      maxDist = dist;
      index = i;
    }
  }

  // If max distance is greater than epsilon, recursively simplify
  if (maxDist > epsilon) {
    const left = simplifyPoints(points.slice(0, index + 1), epsilon);
    const right = simplifyPoints(points.slice(index), epsilon);
    return [...left.slice(0, -1), ...right];
  } else {
    return [points[0], points[end]];
  }
}

function perpendicularDistance(point: number[], lineStart: number[], lineEnd: number[]): number {
  const [x, y] = point;
  const [x1, y1] = lineStart;
  const [x2, y2] = lineEnd;

  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx === 0 && dy === 0) {
    return Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);
  }

  const num = Math.abs(dy * x - dx * y + x2 * y1 - y2 * x1);
  const den = Math.sqrt(dx ** 2 + dy ** 2);
  return num / den;
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
