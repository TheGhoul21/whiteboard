import type { Animation, Keyframe } from '../types';

export interface AnimationRuntimeConfig {
  fps: number;
  onFrame: (values: Record<string, any>, frameIndex: number) => void;
  onComplete?: () => void;
  onPause?: () => void;
}

export class AnimationRuntime {
  private rafId: number | null = null;
  private lastFrameTime = 0;
  private currentTime = 0;
  private isPlaying = false;
  private config: AnimationRuntimeConfig;
  private animation: Animation;
  private frameCache: Map<number, Record<string, any>> = new Map();

  constructor(animation: Animation, config: AnimationRuntimeConfig) {
    this.animation = animation;
    this.config = config;
    this.precomputeFrames();
  }

  /**
   * Precompute all frame values for the entire animation
   * This allows smooth scrubbing and eliminates per-frame computation
   */
  private precomputeFrames(): void {
    const totalFrames = Math.ceil(this.animation.duration * this.animation.fps);
    
    for (let i = 0; i <= totalFrames; i++) {
      const time = i / this.animation.fps;
      const values = this.interpolateValues(time);
      this.frameCache.set(i, values);
    }
  }

  /**
   * Interpolate values between keyframes for a given time
   */
  private interpolateValues(time: number): Record<string, any> {
    const sortedKeyframes = [...this.animation.keyframes].sort((a, b) => a.time - b.time);
    
    if (sortedKeyframes.length === 0) return {};
    if (time <= sortedKeyframes[0].time) return sortedKeyframes[0].controlValues;
    if (time >= sortedKeyframes[sortedKeyframes.length - 1].time) {
      return sortedKeyframes[sortedKeyframes.length - 1].controlValues;
    }

    // Find surrounding keyframes
    let beforeKf: Keyframe | null = null;
    let afterKf: Keyframe | null = null;

    for (let i = 0; i < sortedKeyframes.length - 1; i++) {
      if (time >= sortedKeyframes[i].time && time <= sortedKeyframes[i + 1].time) {
        beforeKf = sortedKeyframes[i];
        afterKf = sortedKeyframes[i + 1];
        break;
      }
    }

    if (!beforeKf || !afterKf) return sortedKeyframes[0].controlValues;

    const t = (time - beforeKf.time) / (afterKf.time - beforeKf.time);
    return this.interpolate(beforeKf.controlValues, afterKf.controlValues, t);
  }

  /**
   * Interpolate between two value sets
   */
  private interpolate(
    values1: Record<string, any>,
    values2: Record<string, any>,
    t: number
  ): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const key in values1) {
      const val1 = values1[key];
      const val2 = values2[key];
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

    // Colors (hex)
    if (typeof val1 === 'string' && typeof val2 === 'string' && 
        val1.startsWith('#') && val2.startsWith('#')) {
      return this.interpolateColor(val1, val2, t);
    }

    // Range objects {min, max}
    if (typeof val1 === 'object' && val1 !== null && 'min' in val1 && 'max' in val1) {
      return {
        min: this.interpolateValue(val1.min, val2.min, t),
        max: this.interpolateValue(val1.max, val2.max, t)
      };
    }

    // Booleans and strings (switch at midpoint)
    return t < 0.5 ? val1 : val2;
  }

  /**
   * Interpolate between two hex colors
   */
  private interpolateColor(color1: string, color2: string, t: number): string {
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);
    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);

    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /**
   * Get frame values at a specific frame index
   */
  getFrame(frameIndex: number): Record<string, any> {
    const totalFrames = Math.ceil(this.animation.duration * this.animation.fps);
    const clampedIndex = Math.max(0, Math.min(frameIndex, totalFrames));
    return this.frameCache.get(clampedIndex) || {};
  }

  /**
   * Get frame values at a specific time (supports fractional frames)
   */
  getFrameAtTime(time: number): Record<string, any> {
    const frameIndex = Math.floor(time * this.animation.fps);
    return this.getFrame(frameIndex);
  }

  /**
   * Start playing the animation
   */
  play(): void {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.lastFrameTime = performance.now();
    this.tick();
  }

  /**
   * Pause the animation
   */
  pause(): void {
    this.isPlaying = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.config.onPause?.();
  }

  /**
   * Stop and reset to beginning
   */
  stop(): void {
    this.pause();
    this.currentTime = 0;
  }

  /**
   * Seek to a specific time
   */
  seek(time: number): void {
    if (this.animation.loop) {
      // Wrap around for looping animations
      this.currentTime = time % this.animation.duration;
    } else {
      // Clamp for non-looping animations
      this.currentTime = Math.max(0, Math.min(time, this.animation.duration));
    }
    const frameIndex = Math.floor(this.currentTime * this.animation.fps);
    const values = this.getFrame(frameIndex);
    this.config.onFrame(values, frameIndex);
  }

  /**
   * Animation loop
   */
  private tick = (): void => {
    if (!this.isPlaying) return;

    const now = performance.now();
    const deltaTime = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;

    // Prevent huge jumps if tab was inactive
    if (deltaTime > 0.5) {
      this.rafId = requestAnimationFrame(this.tick);
      return;
    }

    this.currentTime += deltaTime;

    // Handle looping
    if (this.currentTime >= this.animation.duration) {
      if (this.animation.loop) {
        this.currentTime = this.currentTime % this.animation.duration;
      } else {
        this.currentTime = this.animation.duration;
        this.pause();
        this.config.onComplete?.();
        return;
      }
    }

    // Get precomputed frame values
    const frameIndex = Math.floor(this.currentTime * this.animation.fps);
    const values = this.getFrame(frameIndex);
    
    // Call the render callback
    this.config.onFrame(values, frameIndex);

    // Schedule next frame
    this.rafId = requestAnimationFrame(this.tick);
  };

  /**
   * Check if animation is currently playing
   */
  get playing(): boolean {
    return this.isPlaying;
  }

  /**
   * Get current time
   */
  get time(): number {
    return this.currentTime;
  }

  /**
   * Get total duration
   */
  get duration(): number {
    return this.animation.duration;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.pause();
    this.frameCache.clear();
  }
}
