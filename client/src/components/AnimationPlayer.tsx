import React, { useState, useEffect, useRef } from 'react';
import type { Animation, Keyframe } from '../types';

interface AnimationPlayerProps {
  animation: Animation;
  onUpdateControls: (values: Record<string, any>) => void;
  onExecute: () => void;
  onDeleteKeyframe?: (keyframeId: string) => void;
}

export const AnimationPlayer: React.FC<AnimationPlayerProps> = ({
  animation,
  onUpdateControls,
  onExecute,
  onDeleteKeyframe
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const animationFrameRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);

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

  // Animation loop
  const animate = (timestamp: number) => {
    if (!isPlaying) return;

    const deltaTime = lastUpdateRef.current ? (timestamp - lastUpdateRef.current) / 1000 : 0;
    lastUpdateRef.current = timestamp;

    let newTime = currentTime + deltaTime;

    // Handle looping
    if (newTime >= animation.duration) {
      if (animation.loop) {
        newTime = 0;
      } else {
        newTime = animation.duration;
        setIsPlaying(false);
      }
    }

    setCurrentTime(newTime);

    // Update controls with interpolated values
    const interpolatedValues = getInterpolatedValues(newTime);
    onUpdateControls(interpolatedValues);

    // Trigger execution every frame (or at a lower rate for performance)
    if (Math.floor(newTime * animation.fps) !== Math.floor(currentTime * animation.fps)) {
      onExecute();
    }

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  };

  // Start/stop animation
  useEffect(() => {
    if (isPlaying) {
      lastUpdateRef.current = performance.now();
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
    if (animation.keyframes.length > 0) {
      const firstKf = [...animation.keyframes].sort((a, b) => a.time - b.time)[0];
      onUpdateControls(firstKf.controlValues);
      onExecute();
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    const interpolatedValues = getInterpolatedValues(newTime);
    onUpdateControls(interpolatedValues);
    onExecute();
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
        🎬 Animation
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
          {isPlaying ? '⏸' : '▶'}
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
          ⏹
        </button>

        <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '8px' }}>
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
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
