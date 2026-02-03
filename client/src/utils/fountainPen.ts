import { getStroke } from 'perfect-freehand';

export interface Point {
  x: number;
  y: number;
  pressure?: number;
  timestamp?: number;
  velocity?: number;
}

export interface StrokeOptions {
  size: number;
  thinning: number;
  smoothing: number;
  streamline: number;
}

export interface FountainPenConfig {
  // Base stroke size
  size: number;
  // Ink flow characteristics
  inkFlow: 'wet' | 'normal' | 'dry';
  // Pen nib angle (radians, 0 = horizontal)
  nibAngle: number;
  // Nib aspect ratio (width / height)
  nibRatio: number;
  // Pressure sensitivity (0-1)
  pressureSensitivity: number;
  // Velocity smoothing (0-1)
  velocitySmoothing: number;
  // Enable ink pooling at start/stop
  inkPooling: boolean;
}

/**
 * Catmull-Rom Spline interpolation for ultra-smooth curves
 * Creates a smooth curve that passes through all control points
 */
export function catmullRomSpline(
  points: Point[],
  tension: number = 0.5,
  segments: number = 20
): Point[] {
  if (points.length < 2) return points;
  if (points.length === 2) {
    // Linear interpolation for just 2 points
    const result: Point[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      result.push({
        x: points[0].x + (points[1].x - points[0].x) * t,
        y: points[0].y + (points[1].y - points[0].y) * t,
      });
    }
    return result;
  }

  const result: Point[] = [];
  
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    for (let j = 0; j < segments; j++) {
      const t = j / segments;
      const t2 = t * t;
      const t3 = t2 * t;

      // Catmull-Rom basis functions
      const b0 = -tension * t3 + 2 * tension * t2 - tension * t;
      const b1 = (2 - tension) * t3 + (tension - 3) * t2 + 1;
      const b2 = (tension - 2) * t3 + (3 - 2 * tension) * t2 + tension * t;
      const b3 = tension * t3 - tension * t2;

      result.push({
        x: 0.5 * (p0.x * b0 + p1.x * b1 + p2.x * b2 + p3.x * b3),
        y: 0.5 * (p0.y * b0 + p1.y * b1 + p2.y * b2 + p3.y * b3),
      });
    }
  }

  // Add last point
  result.push(points[points.length - 1]);
  return result;
}

/**
 * Kalman Filter for hand stabilization and noise reduction
 * Reduces wobble while maintaining responsiveness
 */
export class KalmanFilter {
  private x: number;
  private y: number;
  private vx: number;
  private vy: number;
  private ax: number;
  private ay: number;
  
  // Process noise (how much we trust the model vs measurements)
  private q: number;
  // Measurement noise (how noisy the input is)
  private r: number;
  // Estimation error
  private p: number[][];

  constructor(
    initialX: number = 0,
    initialY: number = 0,
    processNoise: number = 0.01,
    measurementNoise: number = 0.1
  ) {
    this.x = initialX;
    this.y = initialY;
    this.vx = 0;
    this.vy = 0;
    this.ax = 0;
    this.ay = 0;
    this.q = processNoise;
    this.r = measurementNoise;
    
    // Initial covariance matrix
    this.p = [
      [1, 0, 0, 0, 0, 0],
      [0, 1, 0, 0, 0, 0],
      [0, 0, 1, 0, 0, 0],
      [0, 0, 0, 1, 0, 0],
      [0, 0, 0, 0, 1, 0],
      [0, 0, 0, 0, 0, 1],
    ];
  }

  update(measurementX: number, measurementY: number, dt: number = 1): Point {
    const dt2 = 0.5 * dt * dt;

    // Predict step (constant acceleration model)
    const predictedX = this.x + this.vx * dt + this.ax * dt2;
    const predictedY = this.y + this.vy * dt + this.ay * dt2;
    const predictedVx = this.vx + this.ax * dt;
    const predictedVy = this.vy + this.ay * dt;

    // Update covariance - simplified: just add process noise
    for (let i = 0; i < 6; i++) {
      this.p[i][i] += this.q;
    }

    // Innovation (measurement residual)
    const y = [measurementX - predictedX, measurementY - predictedY];

    // Innovation covariance
    const s = [
      [this.p[0][0] + this.r, this.p[0][1]],
      [this.p[1][0], this.p[1][1] + this.r],
    ];

    // Kalman gain (simplified calculation)
    const det = s[0][0] * s[1][1] - s[0][1] * s[1][0];
    const k00 = (this.p[0][0] * s[1][1] - this.p[0][1] * s[1][0]) / det;
    const k01 = (this.p[0][1] * s[0][0] - this.p[0][0] * s[0][1]) / det;
    const k10 = (this.p[1][0] * s[1][1] - this.p[1][1] * s[1][0]) / det;
    const k11 = (this.p[1][1] * s[0][0] - this.p[1][0] * s[0][1]) / det;

    // Update state
    this.x = predictedX + k00 * y[0] + k01 * y[1];
    this.y = predictedY + k10 * y[0] + k11 * y[1];
    this.vx = predictedVx;
    this.vy = predictedVy;

    // Update covariance (simplified)
    this.p[0][0] = (1 - k00) * this.p[0][0];
    this.p[1][1] = (1 - k11) * this.p[1][1];

    return { x: this.x, y: this.y };
  }
}

/**
 * Calculate velocity between consecutive points
 */
export function calculateVelocity(p1: Point, p2: Point, dt: number = 1): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy) / dt;
}

/**
 * Exponential moving average for smoothing velocity
 */
export class ExponentialMovingAverage {
  private value: number;
  private alpha: number;

  constructor(initialValue: number = 0, alpha: number = 0.3) {
    this.value = initialValue;
    this.alpha = alpha;
  }

  update(newValue: number): number {
    this.value = this.alpha * newValue + (1 - this.alpha) * this.value;
    return this.value;
  }

  getValue(): number {
    return this.value;
  }
}

/**
 * Dynamic width modulation for fountain pen effect
 * Width varies based on velocity (inverse relationship)
 */
export function calculateDynamicWidth(
  velocity: number,
  minWidth: number,
  maxWidth: number,
  velocityThreshold: number = 10
): number {
  // Normalize velocity (0 to 1)
  const normalizedVelocity = Math.min(velocity / velocityThreshold, 1);
  
  // Inverse relationship: faster = thinner
  // Use sigmoid for smooth transition
  const sigmoid = 1 / (1 + Math.exp((normalizedVelocity - 0.5) * 8));
  
  // Calculate width
  const width = minWidth + (maxWidth - minWidth) * sigmoid;
  
  return Math.max(minWidth, Math.min(maxWidth, width));
}

/**
 * Generate a polygon mesh along a path with varying widths
 * This creates the "ribbon" effect of a fountain pen
 */
export function generateFountainPenMesh(
  points: Point[],
  widths: number[]
): number[][] {
  if (points.length < 2 || widths.length !== points.length) {
    return [];
  }

  const mesh: number[][] = [];

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const w = widths[i] / 2;

    // Calculate tangent for perpendicular direction
    let tangentX: number, tangentY: number;
    
    if (i === 0) {
      tangentX = points[1].x - points[0].x;
      tangentY = points[1].y - points[0].y;
    } else if (i === points.length - 1) {
      tangentX = points[i].x - points[i - 1].x;
      tangentY = points[i].y - points[i - 1].y;
    } else {
      tangentX = points[i + 1].x - points[i - 1].x;
      tangentY = points[i + 1].y - points[i - 1].y;
    }

    // Normalize tangent
    const tangentLength = Math.sqrt(tangentX * tangentX + tangentY * tangentY);
    if (tangentLength > 0) {
      tangentX /= tangentLength;
      tangentY /= tangentLength;
    }

    // Perpendicular direction
    const perpX = -tangentY;
    const perpY = tangentX;

    // Add left and right points of the ribbon
    mesh.push([
      p.x + perpX * w,
      p.y + perpY * w,
      p.x - perpX * w,
      p.y - perpY * w,
    ]);
  }

  return mesh;
}

/**
 * Convert mesh to SVG path
 */
export function meshToSvgPath(mesh: number[][]): string {
  if (mesh.length < 2) return '';

  // Create path: left side forward, right side backward
  let d = `M ${mesh[0][0]} ${mesh[0][1]}`;

  // Left side (indices 0, 1)
  for (let i = 1; i < mesh.length; i++) {
    d += ` L ${mesh[i][0]} ${mesh[i][1]}`;
  }

  // Right side (indices 2, 3) - go backward
  for (let i = mesh.length - 1; i >= 0; i--) {
    d += ` L ${mesh[i][2]} ${mesh[i][3]}`;
  }

  d += ' Z';
  return d;
}

/**
 * Default fountain pen configuration
 */
export const DEFAULT_FOUNTAIN_PEN_CONFIG: FountainPenConfig = {
  size: 8,
  inkFlow: 'normal',
  nibAngle: Math.PI / 6, // 30 degrees
  nibRatio: 2.5,
  pressureSensitivity: 0.7,
  velocitySmoothing: 0.25,
  inkPooling: true,
};

/**
 * Cubic Hermite spline interpolation for ultra-smooth curves
 * Better continuity than Catmull-Rom at endpoints
 */
export function hermiteSpline(
  points: Point[],
  tension: number = 0.5,
  segments: number = 16
): Point[] {
  if (points.length < 2) return points;
  if (points.length === 2) {
    const result: Point[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      result.push({
        x: points[0].x + (points[1].x - points[0].x) * t,
        y: points[0].y + (points[1].y - points[0].y) * t,
        pressure: (points[0].pressure || 0.5) + ((points[1].pressure || 0.5) - (points[0].pressure || 0.5)) * t,
      });
    }
    return result;
  }

  const result: Point[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    // Calculate tangents
    const t1x = tension * (p2.x - p0.x);
    const t1y = tension * (p2.y - p0.y);
    const t2x = tension * (p3.x - p1.x);
    const t2y = tension * (p3.y - p1.y);

    for (let j = 0; j < segments; j++) {
      const t = j / segments;
      const t2 = t * t;
      const t3 = t2 * t;

      // Hermite basis functions
      const h1 = 2 * t3 - 3 * t2 + 1;
      const h2 = -2 * t3 + 3 * t2;
      const h3 = t3 - 2 * t2 + t;
      const h4 = t3 - t2;

      const x = h1 * p1.x + h2 * p2.x + h3 * t1x + h4 * t2x;
      const y = h1 * p1.y + h2 * p2.y + h3 * t1y + h4 * t2y;
      const pressure = h1 * (p1.pressure || 0.5) + h2 * (p2.pressure || 0.5);

      result.push({ x, y, pressure });
    }
  }

  result.push(points[points.length - 1]);
  return result;
}

/**
 * Adaptive point resampling - more points in curves, fewer in straight sections
 */
export function adaptiveResample(points: Point[], minDist: number = 2, maxDist: number = 8): Point[] {
  if (points.length < 3) return points;

  const result: Point[] = [points[0]];
  let accumDist = 0;

  for (let i = 1; i < points.length; i++) {
    const prev = result[result.length - 1];
    const curr = points[i];
    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Calculate local curvature
    let curvature = 0;
    if (i > 0 && i < points.length - 1) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      
      const v1x = p1.x - p0.x;
      const v1y = p1.y - p0.y;
      const v2x = p2.x - p1.x;
      const v2y = p2.y - p1.y;
      
      const cross = v1x * v2y - v1y * v2x;
      const dot = v1x * v2x + v1y * v2y;
      curvature = Math.abs(Math.atan2(cross, dot));
    }

    // Adaptive threshold based on curvature
    const threshold = minDist + (maxDist - minDist) * (1 - Math.min(curvature / Math.PI, 1));
    
    accumDist += dist;
    if (accumDist >= threshold) {
      result.push(curr);
      accumDist = 0;
    }
  }

  // Always include last point
  if (result[result.length - 1] !== points[points.length - 1]) {
    result.push(points[points.length - 1]);
  }

  return result;
}

/**
 * Simulates ink pooling at slow/stationary points
 */
export function calculateInkPooling(
  _point: Point,
  velocity: number,
  baseSize: number,
  config: FountainPenConfig
): number {
  if (!config.inkPooling) return 0;
  
  // Ink pools when velocity is low
  const poolThreshold = 2;
  if (velocity > poolThreshold) return 0;
  
  // Ink accumulation factor (more pooling at slower speeds)
  const poolFactor = 1 - velocity / poolThreshold;
  
  // Apply ink flow characteristic
  let flowMultiplier = 1;
  switch (config.inkFlow) {
    case 'wet': flowMultiplier = 1.5; break;
    case 'dry': flowMultiplier = 0.5; break;
    default: flowMultiplier = 1;
  }
  
  return baseSize * 0.3 * poolFactor * flowMultiplier;
}

/**
 * Calculate nib-based width (elliptical nib simulation)
 */
export function calculateNibWidth(
  tangentAngle: number,
  baseSize: number,
  config: FountainPenConfig
): { widthX: number; widthY: number } {
  const nibAngle = config.nibAngle;
  const ratio = config.nibRatio;
  
  // Angle between pen direction and nib orientation
  const relativeAngle = tangentAngle - nibAngle;
  
  // Elliptical width calculation
  const cos = Math.cos(relativeAngle);
  const sin = Math.sin(relativeAngle);
  
  // Major and minor axes of the nib
  const major = baseSize;
  const minor = baseSize / ratio;
  
  // Width varies based on nib orientation relative to stroke direction
  const widthX = Math.sqrt(major * major * cos * cos + minor * minor * sin * sin);
  const widthY = Math.sqrt(major * major * sin * sin + minor * minor * cos * cos);
  
  return { widthX, widthY };
}

/**
 * Main function to generate fountain pen stroke path
 * Combines all techniques: Catmull-Rom, Kalman filter, velocity-based width
 */
export function getFountainPenPath(
  flatPoints: number[],
  size: number = 8
): string {
  if (flatPoints.length < 4) return '';

  // Convert flat array to points
  const rawPoints: Point[] = [];
  for (let i = 0; i < flatPoints.length; i += 2) {
    rawPoints.push({ x: flatPoints[i], y: flatPoints[i + 1] });
  }

  // Apply Kalman filter for stabilization
  const kalman = new KalmanFilter(rawPoints[0].x, rawPoints[0].y, 0.01, 0.15);
  const stabilizedPoints: Point[] = [];
  
  for (const p of rawPoints) {
    const filtered = kalman.update(p.x, p.y);
    stabilizedPoints.push(filtered);
  }

  // Apply Catmull-Rom spline for smooth curves
  const smoothPoints = catmullRomSpline(stabilizedPoints, 0.5, 10);

  // Calculate velocities and dynamic widths
  const velocityEMA = new ExponentialMovingAverage(0, 0.2);
  const widths: number[] = [];
  
  for (let i = 0; i < smoothPoints.length; i++) {
    let velocity = 0;
    if (i > 0) {
      velocity = calculateVelocity(smoothPoints[i - 1], smoothPoints[i]);
    }
    const smoothedVelocity = velocityEMA.update(velocity);
    
    // Calculate width based on velocity
    // Base size at low velocity, thinner at high velocity
    const minWidth = size * 0.3;
    const maxWidth = size * 1.2;
    const width = calculateDynamicWidth(
      smoothedVelocity,
      minWidth,
      maxWidth,
      size * 2 // velocity threshold scales with size
    );
    
    widths.push(width);
  }

  // Generate mesh with varying widths
  const mesh = generateFountainPenMesh(smoothPoints, widths);
  
  // Convert to SVG path
  return meshToSvgPath(mesh);
}

/**
 * Enhanced version using perfect-freehand with custom options
 * for more organic feel
 */
export function getFountainPenPathV2(
  flatPoints: number[],
  size: number = 8
): string {
  if (flatPoints.length < 4) return '';

  // Convert to perfect-freehand format [[x,y], [x,y], ...]
  const points: number[][] = [];
  for (let i = 0; i < flatPoints.length; i += 2) {
    points.push([flatPoints[i], flatPoints[i + 1]]);
  }

  // Calculate average velocity for adaptive parameters
  let totalVelocity = 0;
  const velocities: number[] = [];
  
  for (let i = 1; i < points.length; i++) {
    const dx = points[i][0] - points[i-1][0];
    const dy = points[i][1] - points[i-1][1];
    const velocity = Math.sqrt(dx*dx + dy*dy);
    velocities.push(velocity);
    totalVelocity += velocity;
  }
  
  const avgVelocity = points.length > 1 ? totalVelocity / (points.length - 1) : 0;
  const isFast = avgVelocity > 5;

  // Use perfect-freehand with fountain pen optimized settings
  const stroke = getStroke(points, {
    size: size * (isFast ? 0.9 : 1.1),
    thinning: isFast ? 0.5 : 0.7,        // More thinning for calligraphy effect
    smoothing: isFast ? 0.45 : 0.6,       // Less smoothing for fast writing
    streamline: isFast ? 0.5 : 0.65,      // More streamline for smooth curves
    easing: (t) => {
      // Custom easing for fountain pen feel
      // Sigmoid-like curve for elegant width transitions
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    },
    start: {
      taper: isFast ? 5 : 10,
      easing: (t) => t * t,  // Quadratic ease-in for natural start
      cap: true,
    },
    end: {
      taper: isFast ? 8 : 15,
      easing: (t) => t * (2 - t),  // Ease-out for elegant finish
      cap: true,
    },
    simulatePressure: true,
    last: true,
  });

  if (stroke.length < 2) return '';

  // Convert to SVG path with bezier curves for smoother edges
  let d = `M ${stroke[0][0]} ${stroke[0][1]}`;
  
  for (let i = 1; i < stroke.length; i++) {
    // Use quadratic bezier for smoother path
    if (i < stroke.length - 1) {
      const xc = (stroke[i][0] + stroke[i + 1][0]) / 2;
      const yc = (stroke[i][1] + stroke[i + 1][1]) / 2;
      d += ` Q ${stroke[i][0]} ${stroke[i][1]}, ${xc} ${yc}`;
    } else {
      d += ` L ${stroke[i][0]} ${stroke[i][1]}`;
    }
  }

  d += ' Z';
  return d;
}

/**
 * Convert flat point array [[x,y], [x,y]...] format to [[x,y], [x,y]...]
 * (Identity function for compatibility)
 */
export function flatArrayToPoints(flat: number[]): number[][] {
  const points: number[][] = [];
  for (let i = 0; i < flat.length; i += 2) {
    points.push([flat[i], flat[i + 1]]);
  }
  return points;
}

/**
 * Advanced fountain pen with full physics simulation
 */
export function getAdvancedFountainPenPath(
  flatPoints: number[],
  size: number = 8
): string {
  if (flatPoints.length < 4) return '';

  // Step 1: Convert and preprocess points
  const rawPoints: Point[] = [];
  for (let i = 0; i < flatPoints.length; i += 2) {
    rawPoints.push({ 
      x: flatPoints[i], 
      y: flatPoints[i + 1],
      timestamp: Date.now() + i * 16 // Approximate 60fps timing
    });
  }

  // Step 2: Apply Kalman filter for hand stabilization
  const kalman = new KalmanFilter(
    rawPoints[0].x, 
    rawPoints[0].y, 
    0.005,  // Low process noise = trust model more
    0.2     // Higher measurement noise = filter more
  );
  
  const stabilizedPoints: Point[] = [];
  for (const p of rawPoints) {
    stabilizedPoints.push(kalman.update(p.x, p.y));
  }

  // Step 3: Apply Catmull-Rom for smooth curves (higher resolution)
  const smoothPoints = catmullRomSpline(stabilizedPoints, 0.5, 15);

  // Step 4: Calculate physics-based widths
  const widths: number[] = [];
  const velocityFilter = new ExponentialMovingAverage(0, 0.15);
  const accelerationFilter = new ExponentialMovingAverage(0, 0.1);
  
  let prevVelocity = 0;
  
  for (let i = 0; i < smoothPoints.length; i++) {
    // Calculate instantaneous velocity
    let velocity = 0;
    let acceleration = 0;
    
    if (i > 0) {
      const dt = 1; // Normalized time step
      const dx = smoothPoints[i].x - smoothPoints[i-1].x;
      const dy = smoothPoints[i].y - smoothPoints[i-1].y;
      velocity = Math.sqrt(dx*dx + dy*dy) / dt;
      
      if (i > 1) {
        acceleration = (velocity - prevVelocity) / dt;
      }
      prevVelocity = velocity;
    }
    
    // Smooth velocity and acceleration
    const smoothedVelocity = velocityFilter.update(velocity);
    const smoothedAcceleration = accelerationFilter.update(Math.abs(acceleration));
    
    // Fountain pen physics model:
    // Width = base - velocity_factor + acceleration_factor
    // Faster = thinner (less ink flow)
    // Acceleration = slightly thicker (pressure increase)
    
    const velocityFactor = Math.min(smoothedVelocity / (size * 1.5), 1) * 0.6;
    const accelerationFactor = Math.min(smoothedAcceleration / 5, 0.3) * 0.2;
    
    let width = size * (1.2 - velocityFactor + accelerationFactor);
    
    // Clamp to reasonable bounds
    width = Math.max(size * 0.25, Math.min(size * 1.4, width));
    
    widths.push(width);
  }

  // Step 5: Generate custom mesh with varying widths
  const mesh = generateFountainPenMesh(smoothPoints, widths);
  
  // Step 6: Convert to SVG with enhanced curves
  if (mesh.length < 2) return '';

  // Create smooth path using bezier curves
  let d = `M ${mesh[0][0]} ${mesh[0][1]}`;

  // Left edge
  for (let i = 1; i < mesh.length; i++) {
    if (i < mesh.length - 1) {
      const xc = (mesh[i][0] + mesh[i + 1][0]) / 2;
      const yc = (mesh[i][1] + mesh[i + 1][1]) / 2;
      d += ` Q ${mesh[i][0]} ${mesh[i][1]}, ${xc} ${yc}`;
    } else {
      d += ` L ${mesh[i][0]} ${mesh[i][1]}`;
    }
  }

  // Right edge (reverse)
  for (let i = mesh.length - 1; i >= 0; i--) {
    if (i > 0) {
      const xc = (mesh[i][2] + mesh[i - 1][2]) / 2;
      const yc = (mesh[i][3] + mesh[i - 1][3]) / 2;
      d += ` Q ${mesh[i][2]} ${mesh[i][3]}, ${xc} ${yc}`;
    } else {
      d += ` L ${mesh[i][2]} ${mesh[i][3]}`;
    }
  }

  d += ' Z';
  return d;
}

/**
 * Premium Fountain Pen - combines all improvements for the best result
 * Features:
 * - Hermite spline smoothing for continuous curves
 * - Velocity-based width modulation with smooth transitions
 * - Ink pooling effect at start/stop points
 * - Nib angle simulation for calligraphic effect
 * - Cubic Bezier path generation for silky smooth edges
 */
export function getPremiumFountainPenPath(
  flatPoints: number[],
  size: number = 8,
  config: Partial<FountainPenConfig> = {}
): string {
  const cfg = { ...DEFAULT_FOUNTAIN_PEN_CONFIG, ...config, size };
  
  if (flatPoints.length < 4) {
    // Handle single point as a dot
    if (flatPoints.length >= 2) {
      const x = flatPoints[0];
      const y = flatPoints[1];
      const r = size * 0.4;
      return `M ${x - r} ${y} A ${r} ${r} 0 1 0 ${x + r} ${y} A ${r} ${r} 0 1 0 ${x - r} ${y} Z`;
    }
    return '';
  }

  // Step 1: Convert to Point objects with velocity calculation
  const rawPoints: Point[] = [];
  for (let i = 0; i < flatPoints.length; i += 2) {
    rawPoints.push({ 
      x: flatPoints[i], 
      y: flatPoints[i + 1],
      pressure: 0.5,
      timestamp: i * 8, // ~120fps timing simulation
    });
  }

  // Step 2: Calculate velocities for each point
  for (let i = 1; i < rawPoints.length; i++) {
    const dx = rawPoints[i].x - rawPoints[i-1].x;
    const dy = rawPoints[i].y - rawPoints[i-1].y;
    rawPoints[i].velocity = Math.sqrt(dx * dx + dy * dy);
  }
  rawPoints[0].velocity = rawPoints.length > 1 ? rawPoints[1].velocity : 0;

  // Step 3: Apply Kalman filter for stabilization
  const kalman = new KalmanFilter(
    rawPoints[0].x, 
    rawPoints[0].y, 
    0.008,  // Process noise
    0.12    // Measurement noise - tuned for smooth but responsive
  );
  
  const stabilizedPoints: Point[] = [];
  for (const p of rawPoints) {
    const filtered = kalman.update(p.x, p.y);
    stabilizedPoints.push({
      ...filtered,
      pressure: p.pressure,
      velocity: p.velocity,
    });
  }

  // Step 4: Apply Hermite spline interpolation
  const smoothedPoints = hermiteSpline(stabilizedPoints, 0.4, 12);

  // Step 5: Adaptive resampling for efficient rendering
  const resampledPoints = adaptiveResample(smoothedPoints, 1.5, 6);

  // Step 6: Calculate widths with fountain pen physics
  const velocityEMA = new ExponentialMovingAverage(0, cfg.velocitySmoothing);
  const widthEMA = new ExponentialMovingAverage(cfg.size, 0.3);
  
  const widths: number[] = [];
  const tangents: number[] = [];
  
  for (let i = 0; i < resampledPoints.length; i++) {
    const p = resampledPoints[i];
    
    // Calculate tangent angle
    let tangentAngle = 0;
    if (i === 0 && resampledPoints.length > 1) {
      tangentAngle = Math.atan2(
        resampledPoints[1].y - p.y,
        resampledPoints[1].x - p.x
      );
    } else if (i === resampledPoints.length - 1 && resampledPoints.length > 1) {
      tangentAngle = Math.atan2(
        p.y - resampledPoints[i-1].y,
        p.x - resampledPoints[i-1].x
      );
    } else if (resampledPoints.length > 2) {
      tangentAngle = Math.atan2(
        resampledPoints[i+1].y - resampledPoints[i-1].y,
        resampledPoints[i+1].x - resampledPoints[i-1].x
      );
    }
    tangents.push(tangentAngle);
    
    // Calculate velocity-based width
    let velocity = 0;
    if (i > 0) {
      const dx = p.x - resampledPoints[i-1].x;
      const dy = p.y - resampledPoints[i-1].y;
      velocity = Math.sqrt(dx * dx + dy * dy);
    }
    const smoothedVelocity = velocityEMA.update(velocity);
    
    // Inverse velocity-width relationship with sigmoid smoothing
    const velocityNorm = Math.min(smoothedVelocity / (cfg.size * 2.5), 1);
    const velocityFactor = 1 / (1 + Math.exp((velocityNorm - 0.4) * 10));
    
    // Base width from velocity
    let baseWidth = cfg.size * (0.4 + 0.8 * velocityFactor);
    
    // Add nib effect
    const nibWidth = calculateNibWidth(tangentAngle, baseWidth, cfg);
    baseWidth = (nibWidth.widthX + nibWidth.widthY) / 2;
    
    // Add ink pooling at slow points
    const pooling = calculateInkPooling(p, smoothedVelocity, cfg.size, cfg);
    baseWidth += pooling;
    
    // Apply pressure sensitivity
    const pressure = p.pressure ?? 0.5;
    baseWidth *= 0.7 + 0.6 * pressure * cfg.pressureSensitivity;
    
    // Smooth width transitions
    const smoothedWidth = widthEMA.update(baseWidth);
    
    // Clamp to bounds
    const minWidth = cfg.size * 0.2;
    const maxWidth = cfg.size * 1.6;
    widths.push(Math.max(minWidth, Math.min(maxWidth, smoothedWidth)));
  }

  // Step 7: Apply taper at start and end
  const taperLength = Math.min(resampledPoints.length * 0.15, 8);
  for (let i = 0; i < taperLength; i++) {
    const t = i / taperLength;
    const easeIn = t * t * (3 - 2 * t); // Smoothstep
    widths[i] *= easeIn;
  }
  for (let i = 0; i < taperLength; i++) {
    const idx = resampledPoints.length - 1 - i;
    if (idx >= 0) {
      const t = i / taperLength;
      const easeOut = t * t * (3 - 2 * t);
      widths[idx] *= easeOut;
    }
  }

  // Step 8: Generate mesh with varying widths
  const mesh = generateFountainPenMesh(resampledPoints, widths);
  
  if (mesh.length < 2) return '';

  // Step 9: Generate smooth SVG path using cubic Bezier curves
  let d = `M ${mesh[0][0].toFixed(2)} ${mesh[0][1].toFixed(2)}`;

  // Left edge with cubic Bezier for smoother curves
  for (let i = 1; i < mesh.length; i++) {
    if (i < mesh.length - 2) {
      // Cubic Bezier with control points
      const p0 = { x: mesh[i-1][0], y: mesh[i-1][1] };
      const p1 = { x: mesh[i][0], y: mesh[i][1] };
      const p2 = { x: mesh[i+1][0], y: mesh[i+1][1] };
      
      const cp1x = p0.x + (p1.x - p0.x) * 0.5;
      const cp1y = p0.y + (p1.y - p0.y) * 0.5;
      const cp2x = p1.x + (p2.x - p1.x) * 0.5;
      const cp2y = p1.y + (p2.y - p1.y) * 0.5;
      
      d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}`;
    } else {
      d += ` L ${mesh[i][0].toFixed(2)} ${mesh[i][1].toFixed(2)}`;
    }
  }

  // Connect to right edge
  const lastIdx = mesh.length - 1;
  d += ` L ${mesh[lastIdx][2].toFixed(2)} ${mesh[lastIdx][3].toFixed(2)}`;

  // Right edge (reverse) with cubic Bezier
  for (let i = mesh.length - 2; i >= 0; i--) {
    if (i > 1) {
      const p0 = { x: mesh[i+1][2], y: mesh[i+1][3] };
      const p1 = { x: mesh[i][2], y: mesh[i][3] };
      const p2 = { x: mesh[i-1][2], y: mesh[i-1][3] };
      
      const cp1x = p0.x + (p1.x - p0.x) * 0.5;
      const cp1y = p0.y + (p1.y - p0.y) * 0.5;
      const cp2x = p1.x + (p2.x - p1.x) * 0.5;
      const cp2y = p1.y + (p2.y - p1.y) * 0.5;
      
      d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}`;
    } else {
      d += ` L ${mesh[i][2].toFixed(2)} ${mesh[i][3].toFixed(2)}`;
    }
  }

  d += ' Z';
  return d;
}

/**
 * Simplified premium fountain pen - uses perfect-freehand with optimized settings
 * Best balance between quality and performance
 */
export function getSimpleFountainPenPath(
  flatPoints: number[],
  size: number = 8
): string {
  if (flatPoints.length < 4) {
    if (flatPoints.length >= 2) {
      const x = flatPoints[0];
      const y = flatPoints[1];
      const r = size * 0.35;
      return `M ${x - r} ${y} A ${r} ${r} 0 1 0 ${x + r} ${y} A ${r} ${r} 0 1 0 ${x - r} ${y} Z`;
    }
    return '';
  }

  // Convert to point pairs
  const points: number[][] = [];
  for (let i = 0; i < flatPoints.length; i += 2) {
    points.push([flatPoints[i], flatPoints[i + 1]]);
  }

  // Calculate stroke metrics for adaptive settings
  let totalDist = 0;
  let maxSpeed = 0;
  const speeds: number[] = [0];
  
  for (let i = 1; i < points.length; i++) {
    const dx = points[i][0] - points[i-1][0];
    const dy = points[i][1] - points[i-1][1];
    const dist = Math.sqrt(dx * dx + dy * dy);
    totalDist += dist;
    speeds.push(dist);
    maxSpeed = Math.max(maxSpeed, dist);
  }
  
  const avgSpeed = totalDist / (points.length - 1);
  const isQuickStroke = avgSpeed > 4;
  const isLongStroke = points.length > 50;

  // Adaptive perfect-freehand settings
  const stroke = getStroke(points, {
    size: size * (isQuickStroke ? 0.85 : 1.05),
    thinning: isQuickStroke ? 0.45 : 0.65,
    smoothing: isQuickStroke ? 0.35 : 0.5,
    streamline: isLongStroke ? 0.6 : 0.5,
    easing: (t) => {
      // Custom easing: fast attack, smooth sustain, elegant release
      if (t < 0.2) return t * t * 2.5;
      if (t > 0.8) return 1 - Math.pow(1 - t, 2) * 2.5;
      return 0.1 + (t - 0.2) * 1.333;
    },
    start: {
      taper: isQuickStroke ? 4 : 12,
      easing: (t) => t * t * t,
      cap: true,
    },
    end: {
      taper: isQuickStroke ? 6 : 20,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      cap: true,
    },
    simulatePressure: true,
    last: true,
  });

  if (stroke.length < 2) return '';

  // Generate SVG path with smooth cubic Bezier curves
  let d = `M ${stroke[0][0].toFixed(2)} ${stroke[0][1].toFixed(2)}`;
  
  // Use quadratic Bezier curves with midpoint interpolation
  for (let i = 1; i < stroke.length - 2; i += 2) {
    const p2 = stroke[Math.min(i + 1, stroke.length - 1)];
    const p3 = stroke[Math.min(i + 2, stroke.length - 1)];
    
    const midX = (p2[0] + p3[0]) / 2;
    const midY = (p2[1] + p3[1]) / 2;
    
    d += ` Q ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}, ${midX.toFixed(2)} ${midY.toFixed(2)}`;
  }
  
  // Close to last point
  const last = stroke[stroke.length - 1];
  d += ` L ${last[0].toFixed(2)} ${last[1].toFixed(2)}`;
  d += ' Z';
  
  return d;
}
