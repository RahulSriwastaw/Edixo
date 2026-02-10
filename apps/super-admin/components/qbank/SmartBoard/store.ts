import { create } from 'zustand';
import { BoardState, Stroke } from './types';

export const useBoardStore = create<BoardState>((set, get) => ({
  tool: 'pen',
  laserConfig: {
    mode: 'trail',
    color: '#ef4444', // Red default
    size: 5,
    effect: 'standard',
    opacity: 1,
    duration: 1000, // 1 second delay default
    glow: true,
    highlight: false,
  },
  eraserMode: 'partial',
  color: '#3b82f6', // Default blue
  size: 4,
  eraserSize: 20,
  strokes: [],
  history: [],
  redoStack: [],
  selectedId: null,

  // Shape defaults
  fillColor: '#3b82f6',
  isFillEnabled: false,
  isBorderEnabled: true,
  borderStyle: 'solid',
  opacity: 1,

  // New Styling Defaults
  questionStyle: {
    fontSize: 16,
    color: '#ffffff',
    fontFamily: 'sans-serif',
    backgroundColor: 'rgba(21, 25, 33, 0.8)', // Dark semi-transparent
    position: { x: 0, y: 0 },
    dimensions: { width: 900, height: 500 },
    scale: 1,
    textOpacity: 1,
    cardOpacity: 0.9,
    textAlign: 'left',
    lineHeight: 1.5,
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
  },
  boardBackgroundColor: '#0A0C10',
  boardBackgroundImage: null,
  boardOpacity: 1,

  // Global Slide Strokes & Images
  slideStrokes: {},
  slideImages: {},
  saveSlideStrokes: (slideIndex, strokes) => set((state) => ({
    slideStrokes: { ...state.slideStrokes, [slideIndex]: strokes }
  })),
  saveSlideImage: (slideIndex, imageUrl) => set((state) => ({
    slideImages: { ...state.slideImages, [slideIndex]: imageUrl }
  })),
  loadSlideStrokes: (slideIndex) => {
    const { slideStrokes } = get();
    // Load strokes for the slide, or empty if none exist
    set({
      strokes: slideStrokes[slideIndex] || [],
      history: [],
      redoStack: []
    });
  },

  setQuestionStyle: (style) => set((state) => ({
    questionStyle: { ...state.questionStyle, ...style }
  })),
  setBoardBackgroundColor: (boardBackgroundColor) => set({ boardBackgroundColor }),
  setBoardBackgroundImage: (boardBackgroundImage) => set({ boardBackgroundImage }),
  setBoardOpacity: (boardOpacity) => set({ boardOpacity }),

  setTool: (tool) => set({ tool }),
  setEraserMode: (eraserMode) => set({ eraserMode }),
  setColor: (color) => set({ color }),
  setSize: (size) => set({ size }),
  setEraserSize: (eraserSize) => set({ eraserSize }),

  setFillColor: (fillColor) => set({ fillColor }),
  setIsFillEnabled: (isFillEnabled) => set({ isFillEnabled }),
  setIsBorderEnabled: (isBorderEnabled) => set({ isBorderEnabled }),
  setBorderStyle: (borderStyle) => set({ borderStyle }),
  setOpacity: (opacity) => set({ opacity }),
  setSelectedId: (selectedId) => set({ selectedId }),
  setLaserConfig: (config) => set((state) => ({ laserConfig: { ...state.laserConfig, ...config } })),

  bringToFront: (id) => {
    const { strokes } = get();
    const index = strokes.findIndex(s => s.id === id);
    if (index === -1 || index === strokes.length - 1) return;
    const newStrokes = [...strokes];
    const [removed] = newStrokes.splice(index, 1);
    newStrokes.push(removed);
    set({ strokes: newStrokes });
  },

  sendToBack: (id) => {
    const { strokes } = get();
    const index = strokes.findIndex(s => s.id === id);
    if (index === -1 || index === 0) return;
    const newStrokes = [...strokes];
    const [removed] = newStrokes.splice(index, 1);
    newStrokes.unshift(removed);
    set({ strokes: newStrokes });
  },

  deleteStroke: (id) => {
    const { strokes } = get();
    set({ strokes: strokes.filter(s => s.id !== id), selectedId: null });
  },

  duplicateStroke: (id) => {
    const { strokes } = get();
    const selectedStroke = strokes.find(s => s.id === id);
    if (selectedStroke) {
      const newId = crypto.randomUUID();
      const newStroke = {
        ...selectedStroke,
        id: newId,
        x: (selectedStroke.x || 0) + 20,
        y: (selectedStroke.y || 0) + 20,
        points: selectedStroke.points.map(p => ({ ...p, x: p.x + 20, y: p.y + 20 }))
      };
      set({ strokes: [...strokes, newStroke], selectedId: newId });
    }
  },

  addStroke: (stroke) => {
    const { strokes, history } = get();
    // Save current state to history before adding new stroke (for undo)
    // Actually, usually we save to history when stroke is COMPLETED.
    // But for "live" undo, we might need snapshots. 
    // Let's adopt a simple model: History is an array of snapshots of `strokes`.
    set({ strokes: [...strokes, stroke] });
  },

  updateStroke: (id, updates) => {
    const { strokes } = get();
    const index = strokes.findIndex(s => s.id === id);
    if (index !== -1) {
      const newStrokes = [...strokes];
      newStrokes[index] = { ...newStrokes[index], ...updates };
      set({ strokes: newStrokes });
    }
  },

  completeStroke: (id) => {
    const { strokes, history } = get();
    // Snapshot state for undo
    // We only save the state BEFORE the stroke was added? 
    // No, standard undo is: Stack contains previous states.
    // So before we finish this stroke, the "previous state" was (strokes - 1).
    // Let's refine: When a stroke starts, we don't push history. When it ENDS, we assume the action is done.
    // BUT to undo "adding the stroke", we need the state *before* it was added.

    // Better approach: 
    // 1. `addStroke` pushes the *current* strokes (before add) to history.
    // 2. But `addStroke` is called on MouseDown. `updateStroke` on MouseMove. `completeStroke` on MouseUp.
    // So:
    // MouseDown -> save current strokes to history -> add new empty/start stroke.

    // Let's refactor logic slightly in the component or here.
    // For now, let's just make the store simple and let the component handle history triggers? 
    // Or handle it here.

    // Let's keep it simple: `history` stores the full array of strokes.
    // We push to history ONLY when `completeStroke` is called? 
    // No, we push the *previous* state.

    // Let's do this manually in the component for fine control, or:
    // We'll just provide the primitives here.
  },

  undo: () => {
    const { strokes, history, redoStack } = get();
    if (history.length === 0) return;

    const previous = history[history.length - 1];
    const newHistory = history.slice(0, -1);

    set({
      strokes: previous,
      history: newHistory,
      redoStack: [...redoStack, strokes]
    });
  },

  redo: () => {
    const { strokes, history, redoStack } = get();
    if (redoStack.length === 0) return;

    const next = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);

    set({
      strokes: next,
      history: [...history, strokes],
      redoStack: newRedoStack
    });
  },

  clear: () => {
    const { strokes, history } = get();
    set({
      history: [...history, strokes],
      strokes: [],
      redoStack: []
    });
  },

  setStrokes: (strokes) => set({ strokes, history: [], redoStack: [] }),

  activePanel: 'none',
  setActivePanel: (activePanel) => set({ activePanel })
}));
