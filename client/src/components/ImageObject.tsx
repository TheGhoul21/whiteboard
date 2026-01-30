import React, { useState, useEffect } from 'react';
import { Image as KonvaImage } from 'react-konva';
import type { ImageObj } from '../types';
import Konva from 'konva';

interface ImageObjectProps {
  obj: ImageObj;
  draggable: boolean;
  onDragStart: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void;
}

export const ImageObject: React.FC<ImageObjectProps> = ({
  obj,
  draggable,
  onDragStart,
  onDragMove,
  onDragEnd,
  onTransformEnd
}) => {
  const [img, setImg] = useState<HTMLImageElement | undefined>(undefined);

  useEffect(() => {
    const image = new window.Image();
    image.src = obj.src;
    image.onload = () => {
      setImg(image);
    };
  }, [obj.src]);

  if (!img) return null;

  return (
    <KonvaImage
      id={obj.id}
      name="image"
      image={img}
      x={obj.x}
      y={obj.y}
      width={obj.width}
      height={obj.height}
      rotation={obj.rotation}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
    />
  );
};
