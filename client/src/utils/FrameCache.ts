/**
 * FrameCache stores precomputed frame data for efficient animation playback
 * 
 * This enables the compute/render separation pattern where expensive calculations
 * are done once during precompute, and fast rendering uses cached data.
 */

export interface FrameData {
  [key: string]: any;
}

export class FrameCache {
  private frames: Map<number, FrameData> = new Map();
  private metadata: Map<string, any> = new Map();

  /**
   * Register a frame with its computed data
   */
  register(frameIndex: number, data: FrameData): void {
    this.frames.set(frameIndex, this.deepClone(data));
  }

  /**
   * Deep clone an object to ensure immutability
   */
  private deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.deepClone(item)) as unknown as T;
    }
    const cloned: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = this.deepClone((obj as any)[key]);
      }
    }
    return cloned;
  }

  /**
   * Get frame data at a specific index
   */
  get(frameIndex: number): FrameData | undefined {
    return this.frames.get(frameIndex);
  }

  /**
   * Get frame data with interpolation between frames
   * Supports fractional frame indices for smooth animation
   */
  getInterpolated(frameIndex: number): FrameData | undefined {
    // Get all frame indices sorted
    const indices = this.getFrameIndices();
    if (indices.length === 0) return undefined;

    // Find surrounding frames
    let lowerIndex = -1;
    let upperIndex = -1;

    for (let i = 0; i < indices.length; i++) {
      if (indices[i] <= frameIndex) {
        lowerIndex = indices[i];
      }
      if (indices[i] >= frameIndex && upperIndex === -1) {
        upperIndex = indices[i];
        break;
      }
    }

    // Handle edge cases
    if (lowerIndex === -1) {
      // frameIndex is before all frames
      return this.frames.get(indices[0]);
    }
    if (upperIndex === -1) {
      // frameIndex is after all frames
      return this.frames.get(lowerIndex);
    }
    if (lowerIndex === upperIndex) {
      // Exact frame hit
      return this.frames.get(lowerIndex);
    }

    // Calculate interpolation factor
    const t = (frameIndex - lowerIndex) / (upperIndex - lowerIndex);
    const lower = this.frames.get(lowerIndex)!;
    const upper = this.frames.get(upperIndex)!;

    // Interpolate between frames
    return this.interpolateData(lower, upper, t);
  }

  /**
   * Interpolate between two frame data objects
   */
  private interpolateData(data1: FrameData, data2: FrameData, t: number): FrameData {
    const result: FrameData = {};

    for (const key in data1) {
      const val1 = data1[key];
      const val2 = data2[key];
      result[key] = this.interpolateValue(val1, val2, t);
    }

    return result;
  }

  /**
   * Interpolate a single value
   */
  private interpolateValue(val1: any, val2: any, t: number): any {
    // Numbers
    if (typeof val1 === 'number' && typeof val2 === 'number') {
      return val1 + (val2 - val1) * t;
    }

    // Nested objects (recursive interpolation)
    if (typeof val1 === 'object' && typeof val2 === 'object' && 
        val1 !== null && val2 !== null &&
        !Array.isArray(val1) && !Array.isArray(val2)) {
      return this.interpolateData(val1, val2, t);
    }

    // Arrays (interpolate each element)
    if (Array.isArray(val1) && Array.isArray(val2)) {
      return val1.map((v, i) => 
        i < val2.length ? this.interpolateValue(v, val2[i], t) : v
      );
    }

    // Everything else: switch at midpoint
    return t < 0.5 ? val1 : val2;
  }

  /**
   * Get total number of cached frames
   */
  get size(): number {
    return this.frames.size;
  }

  /**
   * Check if a frame exists
   */
  has(frameIndex: number): boolean {
    return this.frames.has(frameIndex);
  }

  /**
   * Get all frame indices
   */
  getFrameIndices(): number[] {
    return Array.from(this.frames.keys()).sort((a, b) => a - b);
  }

  /**
   * Set metadata for the cache
   */
  setMetadata(key: string, value: any): void {
    this.metadata.set(key, value);
  }

  /**
   * Get metadata
   */
  getMetadata(key: string): any {
    return this.metadata.get(key);
  }

  /**
   * Clear all cached frames
   */
  clear(): void {
    this.frames.clear();
    this.metadata.clear();
  }

  /**
   * Serialize cache to JSON
   */
  serialize(): string {
    const data = {
      frames: Array.from(this.frames.entries()),
      metadata: Array.from(this.metadata.entries())
    };
    return JSON.stringify(data);
  }

  /**
   * Load cache from serialized data
   */
  deserialize(json: string): void {
    const data = JSON.parse(json);
    this.frames = new Map(data.frames);
    this.metadata = new Map(data.metadata);
  }

  /**
   * Get memory usage estimate in bytes
   */
  getMemoryUsage(): number {
    let size = 0;
    for (const [_key, value] of this.frames) {
      size += 8; // key (number)
      size += JSON.stringify(value).length * 2; // rough estimate
    }
    return size;
  }
}
