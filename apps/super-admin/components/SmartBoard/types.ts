import { create } from 'zustand';

export type Tool = 'cursor' | 'pen' | 'highlighter' | 'eraser' | 'rectangle' | 'circle' | 'triangle' | 'arrow' | 'line' | 'text' | 'laser' | 'star' | 'image' | 'pentagon' | 'hexagon' | 'speech_bubble';
export type EraserMode = 'partial' | 'lasso' | 'clear';
export type BorderStyle = 'solid' | 'dashed' | 'dotted' | 'dash-dot';

export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export interface Stroke {
  id: string;
  tool: Tool;
  points: Point[];
  color: string;
  size: number;
  isComplete: boolean;
  fill?: string; // For shapes
  text?: string; // For text tool
  borderStyle?: BorderStyle;
  opacity?: number;
  imageUrl?: string; // For image tool
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
}

export interface LaserConfig {
  mode: 'trail' | 'point';
  color: string;
  size: number;
  effect: 'standard' | 'white-burn';
  opacity: number;
  duration: number; // For trail duration in ms
  glow: boolean;
  highlight: boolean;
}

export interface BoardState {
  tool: Tool;
  laserConfig: LaserConfig; // New Laser Config
  eraserMode: EraserMode;
  color: string;
  size: number;
  eraserSize: number;
  strokes: Stroke[];
  history: Stroke[][];
  redoStack: Stroke[][];

  // Shape Properties
  fillColor: string;
  isFillEnabled: boolean;
  isBorderEnabled: boolean;
  borderStyle: BorderStyle;
  opacity: number;
  selectedId: string | null;

  // Question & Board Styling
  questionStyle: {
    fontSize: number;
    color: string;
    fontFamily: string;
    backgroundColor: string;
    position: { x: number; y: number };
    dimensions: { width: number; height: number };
    explanationPosition?: { x: number; y: number };
    explanationSize?: { width: number; height: number };
    scale: number;
    textOpacity: number;
    cardOpacity: number;
    textAlign: 'left' | 'center' | 'right';
    lineHeight: number;
    fontWeight?: 'normal' | 'bold';
    fontStyle?: 'normal' | 'italic';
    textDecoration?: 'none' | 'underline';
  };
  boardBackgroundColor: string;
  boardBackgroundImage: string | null;
  boardOpacity: number;

  slideStrokes: Record<number, Stroke[]>;
  slideImages: Record<number, string>;
  saveSlideStrokes: (slideIndex: number, strokes: Stroke[]) => void;
  saveSlideImage: (slideIndex: number, imageUrl: string) => void;
  loadSlideStrokes: (slideIndex: number) => void;

  setQuestionStyle: (style: Partial<BoardState['questionStyle']>) => void;
  setBoardBackgroundColor: (color: string) => void;
  setBoardBackgroundImage: (url: string | null) => void;
  setBoardOpacity: (opacity: number) => void;

  setTool: (tool: Tool) => void;
  setEraserMode: (mode: EraserMode) => void;
  setColor: (color: string) => void;
  setSize: (size: number) => void;
  setEraserSize: (size: number) => void;
  addStroke: (stroke: Stroke) => void;
  updateStroke: (id: string, updates: Partial<Stroke>) => void;
  completeStroke: (id: string) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
  setStrokes: (strokes: Stroke[]) => void; // For loading slides

  // Shape Actions
  setFillColor: (color: string) => void;
  setIsFillEnabled: (enabled: boolean) => void;
  setIsBorderEnabled: (enabled: boolean) => void;
  setBorderStyle: (style: BorderStyle) => void;
  setOpacity: (opacity: number) => void;
  setSelectedId: (id: string | null) => void;
  setLaserConfig: (config: Partial<LaserConfig>) => void;

  // Z-Index Control
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  deleteStroke: (id: string) => void;
  duplicateStroke: (id: string) => void;

  // UI State
  activePanel: 'none' | 'laser' | 'style' | 'pen_settings' | 'shape' | 'eraser_options' | 'image_options' | 'calculator';
  setActivePanel: (panel: 'none' | 'laser' | 'style' | 'pen_settings' | 'shape' | 'eraser_options' | 'image_options' | 'calculator') => void;
}
