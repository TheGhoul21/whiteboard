import React, { useState, useEffect, useRef } from 'react';
import type { Animation, Keyframe } from '../types';
import { valuesEqual } from '../utils/animationUtils';

interface AnimationPlayerProps {
  animation: Animation;
  baseControlValues?: Record<string, any>; // Current viz control values (user may have edited)
  onUpdateControls: (values: Record<string, any>) => void;
  onExecute: (values?: Record<string, any>, time?: number) => void;
  onDeleteKeyframe?: (keyframeId: string) => void;
}

export const AnimationPlayer: React.FC<AnimationPlayerProps> = ({
  animation,
  baseControlValues = {},
  onUpdateControls,
  onExecute,
  onDeleteKeyframe
}) => {
  console.log('[AnimationPlayer] Render. ID:', animation.id, 'Duration:', animation.duration);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const currentTimeRef = useRef(0); // Authoritative time for animation loop
  const animationFrameRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);
  const lastExecutedFrameRef = useRef<number>(-1);

  // Sync ref when state changes externally (e.g. scrubbing) and not playing
  useEffect(() => {
    if (!isPlaying) {
      currentTimeRef.current = currentTime;
    }
  }, [currentTime, isPlaying]);

  // Reset state when animation object changes (ID change)
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    currentTimeRef.current = 0;
    lastExecutedFrameRef.current = -1;
    lastDispatchedValuesRef.current = {};
  }, [animation.id]);

  // Interpolate between two values
  const interpolate = (val1: any, val2: any, t: number): any => {
    // Handle numbers
    if (typeof val1 === 'number' && typeof val2 === 'number') {
      return val1 + (val2 - val1) * t;
    }

    // Handle colors (hex format)
    if (typeof val1 === 'string' && typeof val2 === 'string' && val1.startsWith('#') && val2.startsWith('#')) {
      const r1 = parseInt(val1.slice(1, 3), 16);
      const g1 = parseInt(val1.slice(3, 5), 16);
      const b1 = parseInt(val1.slice(5, 7), 16);
      const r2 = parseInt(val2.slice(1, 3), 16);
      const g2 = parseInt(val2.slice(3, 5), 16);
      const b2 = parseInt(val2.slice(5, 7), 16);

      const r = Math.round(r1 + (r2 - r1) * t);
      const g = Math.round(g1 + (g2 - g1) * t);
      const b = Math.round(b1 + (b2 - b1) * t);

      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    // Handle range objects {min, max}
    if (typeof val1 === 'object' && val1 !== null && 'min' in val1 && 'max' in val1) {
      return {
        min: interpolate(val1.min, val2.min, t),
        max: interpolate(val1.max, val2.max, t)
      };
    }

    // Handle button objects {clickCount, lastClicked}
    if (typeof val1 === 'object' && val1 !== null && 'clickCount' in val1) {
      return val2; // No interpolation for buttons, just use target value
    }

    // Handle booleans and strings (no interpolation, switch at 0.5)
    return t < 0.5 ? val1 : val2;
  };

  // Get interpolated control values for a given time
  const getInterpolatedValues = (time: number): Record<string, any> => {
    const sortedKeyframes = [...animation.keyframes].sort((a, b) => a.time - b.time);

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

    // Calculate interpolation factor
    const t = (time - beforeKf.time) / (afterKf.time - beforeKf.time);

    // Interpolate all control values
    const result: Record<string, any> = {};
    for (const key in beforeKf.controlValues) {
      const val1 = beforeKf.controlValues[key];
      const val2 = afterKf.controlValues[key];
      result[key] = interpolate(val1, val2, t);
    }

    return result;
  };

  // Dirty-flag: stores the last set of values actually dispatched to onExecute.
  // When interpolated values are identical (e.g. time is past the last keyframe
  // and the output is frozen) we skip the expensive onExecute call entirely.
  const lastDispatchedValuesRef = useRef<Record<string, any>>({});

  const lastUIUpdateRef = useRef<number>(0);

  // Keep refs for values read inside the RAF loop so the closure is never stale.
  const animationRef = useRef(animation);
  animationRef.current = animation;

  const onExecuteRef = useRef(onExecute);
  onExecuteRef.current = onExecute;

  const onUpdateControlsRef = useRef(onUpdateControls);
  onUpdateControlsRef.current = onUpdateControls;

  // Fix 4: Use ref for baseControlValues to avoid stale closures
  const baseControlValuesRef = useRef(baseControlValues);
  baseControlValuesRef.current = baseControlValues;

  // Animation loop
  const animate = (timestamp: number) => {
    if (!isPlaying) return;

    // Use current animation object from Ref to avoid stale closures
    const currentAnim = animationRef.current;

    // Initialize lastUpdateRef if it's 0 (first frame safety)
    if (!lastUpdateRef.current) {
      lastUpdateRef.current = timestamp;
    }

    const deltaTime = (timestamp - lastUpdateRef.current) / 1000;
    lastUpdateRef.current = timestamp;

    // Prevent huge jumps if tab was inactive
    if (deltaTime > 0.5) {
      animationFrameRef.current = requestAnimationFrame(animate);
      return;
    }

    let newTime = currentTimeRef.current + deltaTime;

    // Handle looping
    if (newTime >= currentAnim.duration) {
      if (currentAnim.loop) {
        newTime = newTime % currentAnim.duration;
      } else {
        newTime = currentAnim.duration;
        setIsPlaying(false);
      }
    }

    currentTimeRef.current = newTime;
    setCurrentTime(newTime);

    // Update controls with interpolated values
    const interpolatedValues = getInterpolatedValues(newTime);

    // Merge keyframe values on top of base control values so that controls
    // the user manually edited (but that aren't animated) keep their value
    const mergedValues = { ...baseControlValuesRef.current, ...interpolatedValues };

    // Throttle UI updates to avoid overloading React with re-renders
    // Only update UI controls every ~50ms (20fps) or if stopped
    if (timestamp - lastUIUpdateRef.current > 50 || !isPlaying) {
      lastUIUpdateRef.current = timestamp;
      onUpdateControlsRef.current(mergedValues);
    }

    // Trigger execution only when the discrete frame index advances AND the
    // interpolated values actually changed (dirty flag).  After the last
    // keyframe the values are frozen — skipping onExecute here avoids
    // redundant re-renders for the remainder of the timeline.
    const currentFrame = Math.floor(newTime * currentAnim.fps);
    if (currentFrame !== lastExecutedFrameRef.current) {
      lastExecutedFrameRef.current = currentFrame;
      if (!valuesEqual(mergedValues, lastDispatchedValuesRef.current)) {
        lastDispatchedValuesRef.current = mergedValues;
        onExecuteRef.current(mergedValues, newTime);
      }
    }

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  };

  // Start/stop animation
  useEffect(() => {
    if (isPlaying) {
      lastUpdateRef.current = performance.now();
      // Ensure ref is synced with state before starting
      currentTimeRef.current = currentTime;
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    currentTimeRef.current = 0;
    lastDispatchedValuesRef.current = {};
    if (animation.keyframes.length > 0) {
      const firstKf = [...animation.keyframes].sort((a, b) => a.time - b.time)[0];
      const mergedValues = { ...baseControlValuesRef.current, ...firstKf.controlValues };
      onUpdateControls(mergedValues);
      onExecute(mergedValues, 0);
      lastExecutedFrameRef.current = 0;
      lastDispatchedValuesRef.current = mergedValues;
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    currentTimeRef.current = newTime;
    lastExecutedFrameRef.current = Math.floor(newTime * animation.fps);
    const interpolatedValues = getInterpolatedValues(newTime);
    const mergedValues = { ...baseControlValuesRef.current, ...interpolatedValues };
    onUpdateControls(mergedValues);
    // Scrubbing always dispatches — user explicitly moved the playhead
    lastDispatchedValuesRef.current = mergedValues;
    onExecute(mergedValues, newTime);
  };

  const sortedKeyframes = [...animation.keyframes].sort((a, b) => a.time - b.time);

  return (
    <div
      style={{
        padding: '12px',
        backgroundColor: '#f9fafb',
        borderTop: '1px solid #d1d5db',
        fontSize: '12px'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
        Animation
      </div>

      {/* Playback Controls */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
        <button
          onClick={handlePlayPause}
          title={isPlaying ? 'Pause' : 'Play'}
          style={{
            padding: '4px 10px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <button
          onClick={handleStop}
          title="Stop"
          style={{
            padding: '4px 10px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Stop
        </button>

        <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '8px' }}>
          {/* Debug: {animation.id} */}
          {currentTime.toFixed(2)}s / {animation.duration.toFixed(2)}s
        </span>

        <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: 'auto' }}>
          {sortedKeyframes.length} keyframes
        </span>
      </div>

      {/* Timeline Scrubber */}
      <div style={{ marginBottom: '8px' }}>
        <input
          type="range"
          min={0}
          max={animation.duration}
          step={1 / animation.fps}
          value={currentTime}
          onChange={handleScrub}
          disabled={isPlaying}
          style={{ width: '100%' }}
        />
      </div>

      {/* Keyframe Markers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '120px', overflowY: 'auto' }}>
        {sortedKeyframes.map((kf, index) => (
          <div
            key={kf.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 8px',
              backgroundColor: Math.abs(currentTime - kf.time) < 0.1 ? '#dbeafe' : '#fff',
              borderRadius: '4px',
              fontSize: '11px'
            }}
          >
            <span style={{ color: '#6b7280', minWidth: '60px' }}>
              {kf.time.toFixed(2)}s
            </span>
            <span style={{ flex: 1, color: '#374151' }}>
              {kf.label || `Keyframe ${index + 1}`}
            </span>
            {onDeleteKeyframe && (
              <button
                onClick={() => onDeleteKeyframe(kf.id)}
                title="Delete keyframe"
                style={{
                  padding: '2px 6px',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '10px'
                }}
              >
                X
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
