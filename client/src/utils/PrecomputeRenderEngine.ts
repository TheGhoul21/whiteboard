/**
 * PrecomputeRenderEngine - Compute/Render Separation for High-Performance Animations
 * 
 * This engine enables expensive computations to be done once during precompute,
 * and fast declarative rendering to use cached data per frame.
 * 
 * Usage in code blocks:
 * 
 * precompute((registerFrame) => {
 *   // Expensive computation here
 *   for (let i = 0; i < 100; i++) {
 *     const result = expensiveCalculation(i);
 *     registerFrame(i, result);
 *   }
 * });
 * 
 * render((frameIndex, frameData, controlValues) => {
 *   // Fast rendering using cached frameData
 *   d3.select(output).append('svg')
 *     .attr('width', 400)
 *     .attr('height', 300);
 *   
 *   // Use frameData which contains precomputed results
 *   drawVisualization(frameData);
 * });
 */

import { FrameCache } from './FrameCache';

export type PrecomputeFunction = (registerFrame: (index: number, data: any) => void) => void;
export type RenderFunction = (frameIndex: number, frameData: any, controlValues: Record<string, any>) => void;

export interface PrecomputeRenderConfig {
  totalFrames: number;
  fps: number;
  onProgress?: (frameIndex: number, totalFrames: number) => void;
  onComplete?: () => void;
}

export class PrecomputeRenderEngine {
  private frameCache: FrameCache = new FrameCache();
  private precomputeFn: PrecomputeFunction | null = null;
  private renderFn: RenderFunction | null = null;
  private config: PrecomputeRenderConfig;
  private isPrecomputing = false;
  private currentControlValues: Record<string, any> = {};

  constructor(config: PrecomputeRenderConfig) {
    this.config = config;
  }

  /**
   * Register the precompute function
   * This will be called once to generate all frame data
   */
  precompute(fn: PrecomputeFunction): void {
    this.precomputeFn = fn;
  }

  /**
   * Register the render function
   * This will be called for each frame during animation
   */
  render(fn: RenderFunction): void {
    this.renderFn = fn;
  }

  /**
   * Execute the precompute phase
   * Returns true if successful, false if no precompute function registered
   */
  executePrecompute(controlValues: Record<string, any> = {}): boolean {
    if (!this.precomputeFn) return false;
    
    this.currentControlValues = controlValues;
    this.isPrecomputing = true;
    this.frameCache.clear();

    try {
      // Create the registerFrame function
      const registerFrame = (index: number, data: any) => {
        this.frameCache.register(index, data);
        this.config.onProgress?.(index, this.config.totalFrames);
      };

      // Execute precompute
      this.precomputeFn(registerFrame);
      
      this.isPrecomputing = false;
      this.config.onComplete?.();
      return true;
    } catch (error) {
      this.isPrecomputing = false;
      throw error;
    }
  }

  /**
   * Execute render for a specific frame
   * Returns true if successful, false if no render function registered
   */
  executeRender(frameIndex: number): boolean {
    if (!this.renderFn) return false;

    // Support fractional frame indices for smooth animation
    const frameData = this.frameCache.getInterpolated(frameIndex);
    
    if (frameData === undefined) {
      console.warn(`[PrecomputeRenderEngine] No frame data available for frame ${frameIndex}`);
      // Still call render function with null so it can handle empty state
      try {
        this.renderFn(frameIndex, null, this.currentControlValues);
        return true;
      } catch (error) {
        console.error(`[PrecomputeRenderEngine] Render error at frame ${frameIndex}:`, error);
        return false;
      }
    }

    try {
      this.renderFn(frameIndex, frameData, this.currentControlValues);
      return true;
    } catch (error) {
      console.error(`[PrecomputeRenderEngine] Render error at frame ${frameIndex}:`, error);
      return false;
    }
  }

  /**
   * Get the frame cache for direct access
   */
  getFrameCache(): FrameCache {
    return this.frameCache;
  }

  /**
   * Check if precompute has been completed
   */
  get isReady(): boolean {
    return this.frameCache.size > 0 && !this.isPrecomputing;
  }

  /**
   * Get total number of frames
   */
  get totalFrames(): number {
    return this.config.totalFrames;
  }

  /**
   * Get frames per second
   */
  get fps(): number {
    return this.config.fps;
  }

  /**
   * Get duration in seconds
   */
  get duration(): number {
    return this.config.totalFrames / this.config.fps;
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.frameCache.clear();
  }

  /**
   * Get current control values
   */
  getControlValues(): Record<string, any> {
    return { ...this.currentControlValues };
  }

  /**
   * Update control values (triggers re-precompute if needed)
   */
  updateControlValues(values: Record<string, any>): void {
    this.currentControlValues = { ...values };
    // Optionally re-precompute here if values changed
  }

  /**
   * Serialize the engine state
   */
  serialize(): string {
    return JSON.stringify({
      frameCache: this.frameCache.serialize(),
      config: this.config,
      controlValues: this.currentControlValues
    });
  }

  /**
   * Load engine state from serialized data
   */
  deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.frameCache.deserialize(parsed.frameCache);
    this.config = parsed.config;
    this.currentControlValues = parsed.controlValues || {};
  }
}
