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

// Advanced fountain pen with physics-based ink flow simulation
// Uses perfect-freehand with optimized parameters for natural calligraphy effect
export function getCalligraphyPath(stroke: number[][], size: number = 8): string {
  if (stroke.length === 0) return '';

  // Handle single point (dot) - create a circular dot
  if (stroke.length === 1) {
    const x = stroke[0][0];
    const y = stroke[0][1];
    const r = size * 0.5;
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
      const r = size * 0.5;
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
  const isQuick = avgSpeed > 3.5;
  const isVeryFast = avgSpeed > 6;
  const isLong = stroke.length > 40;

  // Adaptive fountain pen settings based on stroke characteristics
  const points = getStroke(stroke, {
    // Size adapts: slightly smaller for fast strokes, larger for slow deliberate ones
    size: size * (isVeryFast ? 0.82 : isQuick ? 0.92 : 1.12),
    
    // Thinning: more for slow strokes (calligraphic), less for fast (natural)
    thinning: isVeryFast ? 0.4 : isQuick ? 0.55 : 0.72,
    
    // Smoothing: less for fast strokes to maintain responsiveness
    smoothing: isVeryFast ? 0.32 : isQuick ? 0.45 : 0.58,
    
    // Streamline: more for long strokes to maintain flow
    streamline: isLong ? 0.68 : isQuick ? 0.52 : 0.62,
    
    // Custom easing for elegant ink flow simulation
    easing: (t) => {
      // Smooth step with slight asymmetry for natural feel
      const t2 = t * t;
      const t3 = t2 * t;
      return 3 * t2 - 2 * t3 + 0.1 * Math.sin(t * Math.PI);
    },
    
    start: {
      taper: isVeryFast ? 5 : isQuick ? 10 : 16,
      easing: (t) => t * t * (3 - 2 * t),  // Smoothstep for natural ink loading
      cap: true,
    },
    
    end: {
      taper: isVeryFast ? 10 : isQuick ? 18 : 28,
      easing: (t) => {
        // Elegant flick-off effect
        const ease = 1 - Math.pow(1 - t, 3);
        return ease * (1 + 0.1 * (1 - t));
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
