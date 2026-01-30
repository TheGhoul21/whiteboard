export interface Point {
  x: number;
  y: number;
}

export type ToolType = 'select' | 'hand' | 'pen' | 'smooth-pen' | 'highlighter' | 'eraser' | 'laser' | 'pointer' | 'text' | 'rect' | 'circle' | 'arrow';

export type BackgroundType = 'white' | 'black' | 'grid' | 'lines' | 'dots';

export interface Stroke {
  id: string;
  points: number[];
  color: string;
  tool: 'pen' | 'smooth-pen' | 'highlighter' | 'eraser' | 'laser';
  size: number;
  opacity?: number;
  createdAt?: number;
}

export interface ImageObj {
  id: string;
  type: 'image';
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

export interface TextObj {
  id: string;
  type: 'text';
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

export interface ShapeObj {
  id: string;
  type: 'rect' | 'circle' | 'arrow';
  x: number;
  y: number;
  width?: number; 
  height?: number; 
  points?: number[]; 
  color: string;
  strokeWidth: number;
}

export interface LatexObj {
  id: string;
  type: 'latex';
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

export interface CodeObj {
  id: string;
  type: 'code';
  text: string;
  language: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
}

export interface NoteObj {
  id: string;
  type: 'note';
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string; 
}

// Bookmarks / Frames
export interface FrameObj {
   id: string;
   label: string;
   x: number;
   y: number;
   scale: number; // Zoom level to restore
}
