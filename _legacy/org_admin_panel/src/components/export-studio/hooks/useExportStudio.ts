import { create } from "zustand";

// Types
export type PageSize = 
  | "a4_portrait" 
  | "a4_landscape" 
  | "a3_portrait" 
  | "us_letter" 
  | "presentation_16_9" 
  | "certificate" 
  | "social_1_1"
  | "custom";

export type ElementType = "text" | "image" | "shape" | "chart" | "table" | "line" | "qr_code";

export type LeftTabType = "templates" | "elements" | "media" | "text" | "charts" | "data" | "tables";

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface CanvasElement {
  id: string;
  type: ElementType;
  position: Position;
  size: Size;
  rotation: number;
  opacity: number;
  locked: boolean;
  content: ElementContent;
  style: ElementStyle;
  dataBinding?: string; // Variable key like {{student_name}}
}

export interface ElementContent {
  // Text
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: "left" | "center" | "right" | "justify";
  
  // Image
  src?: string;
  alt?: string;
  filter?: string;
  
  // Shape
  shapeType?: "rectangle" | "circle" | "triangle" | "star" | "hexagon";
  
  // Chart
  chartType?: "bar" | "line" | "pie" | "donut" | "area";
  chartData?: Record<string, unknown>[];
}

export interface ElementStyle {
  // Colors
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  color?: string;
  
  // Typography
  lineHeight?: number;
  letterSpacing?: number;
  
  // Effects
  shadow?: {
    x: number;
    y: number;
    blur: number;
    color: string;
  };
  
  // Border & Corner
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
}

export interface Page {
  id: string;
  elements: CanvasElement[];
  background: string;
}

export interface HistoryEntry {
  timestamp: number;
  action: string;
  pages: Page[];
}

export interface DataBinding {
  key: string;
  label: string;
  value: string | number;
  category: string;
}

interface ExportStudioState {
  // Document
  sessionId: string;
  title: string;
  pageSize: PageSize;
  pages: Page[];
  currentPageIndex: number;

  // Selection
  selectedIds: string[];
  
  // History (undo/redo)
  history: HistoryEntry[];
  historyIndex: number;
  
  // UI state
  activeLeftTab: LeftTabType;
  zoom: number;
  showAIPanel: boolean;
  showGrid: boolean;
  showRulers: boolean;
  showPreview: boolean;
  showExportModal: boolean;
  exportFormat: string | null;
  
  // Export
  exportProgress: number | null;
  lastSavedAt: Date | null;
  isDirty: boolean;

  // Data bindings
  sourceData: Record<string, unknown>;
  sourceModule: string;
  dataBindings: DataBinding[];
  orgBranding: {
    name: string;
    logo: string;
    color: string;
  };
  
  // Actions
  setTitle: (title: string) => void;
  setPageSize: (size: PageSize) => void;
  setActiveLeftTab: (tab: LeftTabType) => void;
  setZoom: (zoom: number) => void;
  toggleAIPanel: () => void;
  togglePreview: () => void;
  toggleExportModal: (format?: string) => void;
  
  // Element actions
  addElement: (element: CanvasElement, pageIndex?: number) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  removeElement: (id: string) => void;
  selectElement: (id: string, multi?: boolean) => void;
  deselectAll: () => void;
  
  // Page actions
  addPage: () => void;
  deletePage: (index: number) => void;
  setCurrentPage: (index: number) => void;
  
  // History
  undo: () => void;
  redo: () => void;
  saveToHistory: (action: string) => void;
  
  // Data
  setDataBindings: (bindings: DataBinding[]) => void;
  setSourceData: (module: string, data: Record<string, unknown>) => void;
  setOrgBranding: (branding: { name: string; logo: string; color: string }) => void;
}

// Helper to generate unique IDs
const generateId = () => `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Initial state
const initialState = {
  sessionId: `session_${Date.now()}`,
  title: "Untitled Document",
  pageSize: "a4_portrait" as PageSize,
  pages: [
    {
      id: "page_1",
      elements: [],
      background: "#ffffff",
    },
  ],
  currentPageIndex: 0,
  selectedIds: [],
  history: [],
  historyIndex: -1,
  activeLeftTab: "templates" as LeftTabType,
  zoom: 90,
  showAIPanel: false,
  showGrid: true,
  showRulers: false,
  showPreview: false,
  showExportModal: false,
  exportFormat: null,
  exportProgress: null,
  lastSavedAt: null,
  isDirty: false,
  sourceData: {},
  sourceModule: "",
  dataBindings: [],
  orgBranding: {
    name: "EduHub",
    logo: "/logo.png",
    color: "#F4511E",
  },
};

export const useExportStudio = create<ExportStudioState>((set, get) => ({
  ...initialState,

  // Setters
  setTitle: (title) => set({ title, isDirty: true }),
  setPageSize: (pageSize) => set({ pageSize, isDirty: true }),
  setActiveLeftTab: (activeLeftTab) => set({ activeLeftTab }),
  setZoom: (zoom) => set({ zoom }),
  toggleAIPanel: () => set((state) => ({ showAIPanel: !state.showAIPanel })),
  togglePreview: () => set((state) => ({ showPreview: !state.showPreview })),
  toggleExportModal: (format) => set((state) => ({ 
    showExportModal: !state.showExportModal,
    exportFormat: format || null 
  })),

  // Element actions
  addElement: (element, pageIndex) => {
    const { pages, currentPageIndex } = get();
    const targetIndex = pageIndex ?? currentPageIndex;
    const newElement = { ...element, id: element.id || generateId() };
    
    set({
      pages: pages.map((page, i) =>
        i === targetIndex
          ? { ...page, elements: [...page.elements, newElement] }
          : page
      ),
      selectedIds: [newElement.id],
      isDirty: true,
    });
    
    get().saveToHistory("Add element");
  },

  updateElement: (id, updates) => {
    const { pages, currentPageIndex } = get();
    
    set({
      pages: pages.map((page, i) =>
        i === currentPageIndex
          ? {
              ...page,
              elements: page.elements.map((el) =>
                el.id === id ? { ...el, ...updates } : el
              ),
            }
          : page
      ),
      isDirty: true,
    });
  },

  removeElement: (id) => {
    const { pages, currentPageIndex, selectedIds } = get();
    
    set({
      pages: pages.map((page, i) =>
        i === currentPageIndex
          ? { ...page, elements: page.elements.filter((el) => el.id !== id) }
          : page
      ),
      selectedIds: selectedIds.filter((sid) => sid !== id),
      isDirty: true,
    });
    
    get().saveToHistory("Delete element");
  },

  selectElement: (id, multi = false) => {
    const { selectedIds } = get();
    
    if (multi) {
      if (selectedIds.includes(id)) {
        set({ selectedIds: selectedIds.filter((sid) => sid !== id) });
      } else {
        set({ selectedIds: [...selectedIds, id] });
      }
    } else {
      set({ selectedIds: [id] });
    }
  },

  deselectAll: () => set({ selectedIds: [] }),

  // Page actions
  addPage: () => {
    const { pages } = get();
    const newPage: Page = {
      id: `page_${Date.now()}`,
      elements: [],
      background: "#ffffff",
    };
    
    set({
      pages: [...pages, newPage],
      currentPageIndex: pages.length,
      isDirty: true,
    });
    
    get().saveToHistory("Add page");
  },

  deletePage: (index) => {
    const { pages, currentPageIndex } = get();
    if (pages.length <= 1) return;
    
    const newPages = pages.filter((_, i) => i !== index);
    const newCurrentIndex = currentPageIndex >= newPages.length 
      ? newPages.length - 1 
      : currentPageIndex;
    
    set({
      pages: newPages,
      currentPageIndex: newCurrentIndex,
      isDirty: true,
    });
    
    get().saveToHistory("Delete page");
  },

  setCurrentPage: (index) => set({ currentPageIndex: index }),

  // History
  saveToHistory: (action) => {
    const { pages, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    
    newHistory.push({
      timestamp: Date.now(),
      action,
      pages: JSON.parse(JSON.stringify(pages)),
    });
    
    // Keep only last 50 entries
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const { history, historyIndex, pages } = get();
    if (historyIndex <= 0) return;
    
    const newIndex = historyIndex - 1;
    const entry = history[newIndex];
    
    set({
      pages: JSON.parse(JSON.stringify(entry.pages)),
      historyIndex: newIndex,
      isDirty: true,
    });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    
    const newIndex = historyIndex + 1;
    const entry = history[newIndex];
    
    set({
      pages: JSON.parse(JSON.stringify(entry.pages)),
      historyIndex: newIndex,
      isDirty: true,
    });
  },

  // Data
  setDataBindings: (bindings) => set({ dataBindings: bindings }),
  
  setSourceData: (module, data) => set({ 
    sourceModule: module, 
    sourceData: data 
  }),
  
  setOrgBranding: (branding) => set({ orgBranding: branding }),
}));
