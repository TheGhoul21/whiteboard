import React from 'react';
import { Layer, Line, Text } from 'react-konva';

interface A4GridProps {
  stageWidth: number;
  stageHeight: number;
  stageScale: number;
  stageX: number;
  stageY: number;
}

export const A4Grid: React.FC<A4GridProps> = ({
  stageWidth,
  stageHeight,
  stageScale,
  stageX,
  stageY,
}) => {
  // A4 dimensions in pixels at 96 DPI (standard screen resolution)
  // A4 = 210mm x 297mm = 793.7px x 1122.5px at 96 DPI
  const A4_WIDTH = 794;
  const A4_HEIGHT = 1123;
  const MARGIN = 50; // Margin from edges

  // Calculate visible area in world coordinates
  const viewX = -stageX / stageScale;
  const viewY = -stageY / stageScale;
  const viewW = stageWidth / stageScale;
  const viewH = stageHeight / stageScale;

  // Calculate which A4 pages are visible
  const startCol = Math.floor((viewX - MARGIN) / A4_WIDTH);
  const endCol = Math.ceil((viewX + viewW + MARGIN) / A4_WIDTH);
  const startRow = Math.floor((viewY - MARGIN) / A4_HEIGHT);
  const endRow = Math.ceil((viewY + viewH + MARGIN) / A4_HEIGHT);

  const lines: JSX.Element[] = [];
  const labels: JSX.Element[] = [];

  // Draw vertical lines (columns)
  for (let col = startCol; col <= endCol; col++) {
    const x = col * A4_WIDTH;
    lines.push(
      <Line
        key={`v-${col}`}
        points={[x, viewY - 100, x, viewY + viewH + 100]}
        stroke="#3b82f6"
        strokeWidth={2 / stageScale}
        dash={[10 / stageScale, 10 / stageScale]}
        opacity={0.4}
        listening={false}
      />
    );
  }

  // Draw horizontal lines (rows)
  for (let row = startRow; row <= endRow; row++) {
    const y = row * A4_HEIGHT;
    lines.push(
      <Line
        key={`h-${row}`}
        points={[viewX - 100, y, viewX + viewW + 100, y]}
        stroke="#3b82f6"
        strokeWidth={2 / stageScale}
        dash={[10 / stageScale, 10 / stageScale]}
        opacity={0.4}
        listening={false}
      />
    );
  }

  // Add page labels
  for (let row = startRow; row < endRow; row++) {
    for (let col = startCol; col < endCol; col++) {
      const x = col * A4_WIDTH + 20;
      const y = row * A4_HEIGHT + 20;
      const pageNum = row * (endCol - startCol + 1) + (col - startCol + 1);

      labels.push(
        <Text
          key={`label-${row}-${col}`}
          x={x}
          y={y}
          text={`A4 Page ${col + 1},${row + 1}`}
          fontSize={14 / stageScale}
          fill="#3b82f6"
          opacity={0.6}
          listening={false}
        />
      );
    }
  }

  return (
    <Layer listening={false}>
      {lines}
      {labels}
    </Layer>
  );
};
