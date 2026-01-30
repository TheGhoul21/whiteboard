import React, { useState, useEffect, useRef } from 'react';
import { Group, Image as KonvaImage, Rect } from 'react-konva';
import Konva from 'konva';
import type { D3VisualizationObj, ToolType } from '../types';

interface D3VisualizationObjectProps {
  obj: D3VisualizationObj;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  isSelected?: boolean;
  draggable?: boolean;
  tool?: ToolType;
}

export const D3VisualizationObject: React.FC<D3VisualizationObjectProps> = ({
  obj,
  onSelect,
  isSelected = false,
  draggable = true,
  tool = 'select'
}) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const isSelectMode = tool === 'select';
  const isDrawingMode = ['pen', 'smooth-pen', 'highlighter', 'eraser', 'laser', 'rect', 'circle', 'arrow', 'text'].includes(tool);

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
    </Group>
  );
};
