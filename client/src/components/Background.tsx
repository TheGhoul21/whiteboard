import React from 'react';
import { Group, Rect, Line, Circle } from 'react-konva';
import type { BackgroundType } from '../types';

interface BackgroundProps {
  type: BackgroundType;
  width: number;
  height: number;
  x: number;
  y: number;
  scale: number;
}

export const Background: React.FC<BackgroundProps> = ({ type, width, height, x, y, scale }) => {
  // We need to render a grid/pattern that covers the visible area.
  // We calculate the visible bounds in "scene" coordinates.

  const startX = -x / scale;
  const startY = -y / scale;
  const viewW = width / scale;
  const viewH = height / scale;

  // Padding to avoid flickering edges
  const pad = 100;
  const visibleX = startX - pad;
  const visibleY = startY - pad;
  const visibleW = viewW + pad * 2;
  const visibleH = viewH + pad * 2;

  const isDark = type === 'black' || type === 'black-grid' || type === 'black-lines';
  const bgFill = isDark ? '#1a1a1a' : '#ffffff';
  const gridColor = isDark ? '#333' : '#e5e7eb';
  const lineColor = isDark ? '#333' : '#e0e0e0';
  
  // Grid settings
  const gridSize = 50;
  
  // Helper for Grid lines
  const renderGrid = () => {
    const lines = [];
    const startGridX = Math.floor(visibleX / gridSize) * gridSize;
    const startGridY = Math.floor(visibleY / gridSize) * gridSize;
    
    // Vertical lines
    for (let i = startGridX; i < visibleX + visibleW; i += gridSize) {
      lines.push(
        <Line 
          key={`v${i}`} 
          points={[i, visibleY, i, visibleY + visibleH]} 
          stroke={gridColor} 
          strokeWidth={1 / scale} 
        />
      );
    }
    // Horizontal lines
    for (let j = startGridY; j < visibleY + visibleH; j += gridSize) {
      lines.push(
        <Line 
          key={`h${j}`} 
          points={[visibleX, j, visibleX + visibleW, j]} 
          stroke={gridColor} 
          strokeWidth={1 / scale} 
        />
      );
    }
    return lines;
  };

  // Helper for Notebook Lines (College)
  const renderLines = () => {
    const lines = [];
    const lineSize = 40;
    const startLineY = Math.floor(visibleY / lineSize) * lineSize;
    
    for (let j = startLineY; j < visibleY + visibleH; j += lineSize) {
      lines.push(
        <Line 
          key={`l${j}`} 
          points={[visibleX, j, visibleX + visibleW, j]} 
          stroke={lineColor} 
          strokeWidth={1 / scale} 
        />
      );
    }
    
    // Vertical red margin line
    // marginX was unused, but we want a fixed line at x=100
    lines.push(
       <Line
          key="margin"
          points={[100, visibleY, 100, visibleY + visibleH]}
          stroke="#ef4444"
          strokeWidth={2 / scale}
          opacity={0.5}
       />
    );

    return lines;
  };

  const renderDots = () => {
     const dots = [];
     const dotGap = 40;
     const startDotX = Math.floor(visibleX / dotGap) * dotGap;
     const startDotY = Math.floor(visibleY / dotGap) * dotGap;

     for (let i = startDotX; i < visibleX + visibleW; i += dotGap) {
        for (let j = startDotY; j < visibleY + visibleH; j += dotGap) {
           dots.push(
              <Circle
                 key={`d${i}-${j}`}
                 x={i}
                 y={j}
                 radius={2 / scale}
                 fill={gridColor}
              />
           );
        }
     }
     return dots;
  };

  return (
    <Group>
      {/* Base Background Fill */}
      <Rect
        x={visibleX}
        y={visibleY}
        width={visibleW}
        height={visibleH}
        fill={bgFill}
      />
      {(type === 'grid' || type === 'black-grid') && renderGrid()}
      {(type === 'lines' || type === 'black-lines') && renderLines()}
      {type === 'dots' && renderDots()}
    </Group>
  );
};
