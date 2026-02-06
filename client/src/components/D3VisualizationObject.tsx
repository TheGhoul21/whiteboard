import React, { useState, useEffect } from 'react';
import { Group, Image as KonvaImage, Rect } from 'react-konva';
import { Html } from 'react-konva-utils';
import Konva from 'konva';
import type { D3VisualizationObj, ToolType, CodeBlockObj } from '../types';
import { ControlWidget } from './ControlWidget';
import { AnimationPlayer } from './AnimationPlayer';

interface D3VisualizationObjectProps {
  obj: D3VisualizationObj;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  isSelected?: boolean;
  sourceCodeBlockSelected?: boolean;
  draggable?: boolean;
  tool?: ToolType;
  sourceCodeBlock?: CodeBlockObj;
  onUpdateControl?: (controlId: string, value: any) => void;
  onRefresh?: () => void;
  onToggleControls?: () => void;
  onResetToDefaults?: () => void;
  // Animation / per-viz execution
  onAnimationFrame?: (values: Record<string, any>, time: number) => void;
  onUpdateControls?: (values: Record<string, any>) => void;
  onSaveKeyframe?: () => void;
  onDeleteKeyframe?: (keyframeId: string) => void;
  isSourceRecording?: boolean;
}

export const D3VisualizationObject: React.FC<D3VisualizationObjectProps> = ({
  obj,
  onSelect,
  isSelected = false,
  sourceCodeBlockSelected = false,
  draggable = true,
  tool = 'select',
  sourceCodeBlock,
  onUpdateControl,
  onRefresh,
  onToggleControls,
  onResetToDefaults,
  onAnimationFrame,
  onUpdateControls,
  onSaveKeyframe,
  onDeleteKeyframe,
  isSourceRecording
}) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const isSelectMode = tool === 'select';

  // Check if visualization params differ from code block defaults
  const hasCustomParams = React.useMemo(() => {
    if (!sourceCodeBlock?.controls || !obj.controlValues) return false;
    
    return sourceCodeBlock.controls.some(control => {
      const vizValue = obj.controlValues?.[control.label];
      const defaultValue = control.value;
      
      // Handle different value types
      if (typeof vizValue === 'object' && typeof defaultValue === 'object') {
        return JSON.stringify(vizValue) !== JSON.stringify(defaultValue);
      }
      return vizValue !== defaultValue;
    });
  }, [sourceCodeBlock?.controls, obj.controlValues]);

  // Convert HTML content to image
  useEffect(() => {
    if (!obj.content) return;

    const svgToDataUrl = async () => {
      // Create a temporary div to render the content
      const tempDiv = document.createElement('div');
      tempDiv.style.width = `${obj.width}px`;
      tempDiv.style.height = `${obj.height}px`;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.innerHTML = obj.content;
      document.body.appendChild(tempDiv);

      // Wait for SVG to render
      await new Promise(resolve => setTimeout(resolve, 100));

      // Create a high-DPI canvas to render the content
      // Use 2x scale factor for crisp rendering on all displays
      const scale = 2;
      const canvas = document.createElement('canvas');
      canvas.width = obj.width * scale;
      canvas.height = obj.height * scale;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        document.body.removeChild(tempDiv);
        return;
      }

      // Scale context for high-DPI rendering
      ctx.scale(scale, scale);

      // Fill white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, obj.width, obj.height);

      // Get the SVG element
      const svg = tempDiv.querySelector('svg');
      
      if (svg) {
        // Ensure the SVG has explicit dimensions so it renders correctly
        // when loaded as a standalone blob-URL image.
        if (!svg.getAttribute('width')) {
          svg.setAttribute('width', obj.width.toString());
        }
        if (!svg.getAttribute('height')) {
          svg.setAttribute('height', obj.height.toString());
        }
        if (!svg.getAttribute('xmlns')) {
          svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        }

        // Serialize SVG
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        const img = new window.Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);

          const konvaImg = new window.Image();
          konvaImg.src = canvas.toDataURL('image/png');
          konvaImg.onload = () => {
            setImage(konvaImg);
          };
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          // SVG blob failed to load — fall back to HTML-in-foreignObject
          renderHtmlToCanvas(obj.content, obj.width, obj.height).then(dataUrl => {
            if (dataUrl) {
              const konvaImg = new window.Image();
              konvaImg.src = dataUrl;
              konvaImg.onload = () => { setImage(konvaImg); };
            }
          });
        };
        img.src = url;
      } else {
        // No SVG, render as HTML using foreignObject in SVG
        const dataUrl = await renderHtmlToCanvas(obj.content, obj.width, obj.height);
        if (dataUrl) {
          const konvaImg = new window.Image();
          konvaImg.src = dataUrl;
          konvaImg.onload = () => {
            setImage(konvaImg);
          };
        }
      }

      document.body.removeChild(tempDiv);
    };

    svgToDataUrl();
  }, [obj.content, obj.width, obj.height]);

  // Helper function to render HTML to canvas
  const renderHtmlToCanvas = (html: string, width: number, height: number): Promise<string | null> => {
    return new Promise((resolve) => {
      // Use 2x scale for high-DPI rendering
      const scale = 2;
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width * scale}" height="${height * scale}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml" style="transform: scale(${scale}); transform-origin: 0 0;">
              ${html}
            </div>
          </foreignObject>
        </svg>
      `;

      const img = new window.Image();
      const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, width * scale, height * scale);
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          resolve(null);
        }
        URL.revokeObjectURL(url);
      };
      
      img.onerror = () => {
        resolve(null);
        URL.revokeObjectURL(url);
      };
      
      img.src = url;
    });
  };

  return (
    <Group
      id={obj.id}
      x={obj.x}
      y={obj.y}
      onClick={isSelectMode ? onSelect : undefined}
      onTap={isSelectMode ? onSelect : undefined}
      draggable={isSelectMode && draggable}
      listening={isSelectMode}
    >
      {image ? (
        <KonvaImage
          image={image}
          width={obj.width}
          height={obj.height}
          listening={isSelectMode}
        />
      ) : (
        <Rect
          width={obj.width}
          height={obj.height}
          fill="#f9fafb"
          stroke="#d1d5db"
          strokeWidth={1}
        />
      )}
      
      {/* Selection border */}
      {isSelected && (
        <Rect
          width={obj.width}
          height={obj.height}
          stroke="#3b82f6"
          strokeWidth={2}
          listening={false}
        />
      )}

      {/* Source code block selected - highlight this visualization */}
      {sourceCodeBlockSelected && !isSelected && (
        <Rect
          width={obj.width}
          height={obj.height}
          stroke="#10b981"
          strokeWidth={3}
          dash={[8, 4]}
          listening={false}
          opacity={0.8}
        />
      )}

      {/* Bottom panel: controls toggle/panel, + KF, animation player */}
      {isSelectMode && (isSelected || obj.showControls) && (
        <Html>
          <div
            style={{
              position: 'absolute',
              top: obj.height + 10,
              left: 0,
              width: obj.width,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              pointerEvents: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Controls: open panel or "Show Controls" toggle */}
            {sourceCodeBlock?.controls && (
              obj.showControls ? (
                <div style={{
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Controls</span>
                      {hasCustomParams && (
                        <span style={{
                          fontSize: '10px', padding: '2px 6px', backgroundColor: '#dbeafe',
                          color: '#1d4ed8', borderRadius: '10px', fontWeight: '500'
                        }} title="Parameters differ from code block defaults">
                          Custom
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {hasCustomParams && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onResetToDefaults?.(); }}
                          title="Reset parameters to code block defaults"
                          style={{ padding: '4px 10px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >Reset</button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); onRefresh?.(); }}
                        title="Update visualization"
                        style={{ padding: '4px 10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
                      >Refresh</button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleControls?.(); }}
                        title="Hide controls"
                        style={{ padding: '4px 8px', backgroundColor: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
                      >Close</button>
                    </div>
                  </div>
                  {/* Widgets */}
                  {sourceCodeBlock.controls.map((control) => {
                    const vizControl = {
                      ...control,
                      value: obj.controlValues?.[control.label] !== undefined
                        ? obj.controlValues[control.label]
                        : control.value
                    };
                    return (
                      <ControlWidget
                        key={control.id}
                        control={vizControl}
                        onChange={(value) => onUpdateControl?.(control.label, value)}
                      />
                    );
                  })}
                </div>
              ) : isSelected ? (
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleControls?.(); }}
                  title="Show controls"
                  style={{
                    padding: '6px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none',
                    borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >Show Controls</button>
              ) : null
            )}

            {/* + Keyframe button when source code block is recording */}
            {isSelected && isSourceRecording && (
              <button
                onClick={(e) => { e.stopPropagation(); onSaveKeyframe?.(); }}
                title="Add keyframe at current time"
                style={{
                  padding: '6px 12px', backgroundColor: '#dbeafe', color: '#1d4ed8',
                  border: '1px solid #93c5fd', borderRadius: '6px', cursor: 'pointer',
                  fontSize: '13px', fontWeight: '600', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >+ Keyframe</button>
            )}

            {/* Animation player */}
            {isSelected && obj.animation && obj.animation.keyframes.length > 0 && (
              <div style={{
                backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden'
              }}>
                <AnimationPlayer
                  key={obj.animation.id}
                  animation={obj.animation}
                  baseControlValues={obj.controlValues}
                  onUpdateControls={(values) => onUpdateControls?.(values)}
                  onExecute={(values, time) => onAnimationFrame?.(values ?? {}, time ?? 0)}
                  onDeleteKeyframe={onDeleteKeyframe}
                />
              </div>
            )}
          </div>
        </Html>
      )}
    </Group>
  );
};
