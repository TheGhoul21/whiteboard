import React, { useState, useEffect } from 'react';
import { Group, Image as KonvaImage, Rect } from 'react-konva';
import { Html } from 'react-konva-utils';
import Konva from 'konva';
import type { D3VisualizationObj, ToolType, CodeBlockObj } from '../types';
import { ControlWidget } from './ControlWidget';

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
  onToggleControls
}) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const isSelectMode = tool === 'select';

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

      // Create a canvas to render the content
      const canvas = document.createElement('canvas');
      canvas.width = obj.width;
      canvas.height = obj.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        document.body.removeChild(tempDiv);
        return;
      }

      // Fill white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, obj.width, obj.height);

      // Get the SVG element
      const svg = tempDiv.querySelector('svg');
      
      if (svg) {
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
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml">
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
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, width, height);
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

      {/* Controls panel when enabled */}
      {obj.showControls && sourceCodeBlock?.controls && isSelectMode && (() => {
        // Create controls with this visualization's own values
        const visualizationControls = sourceCodeBlock.controls.map(control => ({
          ...control,
          value: obj.controlValues?.[control.label] !== undefined
            ? obj.controlValues[control.label]
            : control.value
        }));

        return (
          <Html>
            <div
              style={{
                position: 'absolute',
                top: obj.height + 10,
                left: 0,
                width: obj.width,
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                padding: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                pointerEvents: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>
                  🎮
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRefresh?.();
                    }}
                    title="Update visualization"
                    style={{
                      padding: '4px 10px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    ↻
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleControls?.();
                    }}
                    title="Hide controls"
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#e5e7eb',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {visualizationControls.map((control) => (
                <ControlWidget
                  key={control.id}
                  control={control}
                  onChange={(value) => onUpdateControl?.(control.label, value)}
                />
              ))}
            </div>
          </Html>
        );
      })()}

      {/* Show Controls toggle button when selected */}
      {isSelected && !obj.showControls && sourceCodeBlock?.controls && isSelectMode && (
        <Html>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleControls?.();
            }}
            title="Show controls"
            style={{
              position: 'absolute',
              top: obj.height + 10,
              left: 0,
              padding: '6px 12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: '500',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              pointerEvents: 'auto'
            }}
          >
            🎮
          </button>
        </Html>
      )}
    </Group>
  );
};
