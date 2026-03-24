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

export interface PageMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface LayoutSettings {
  numColumns: number;
  columnGap: number;
  showQuestionBox: boolean;
  showOptionBox: boolean;
  questionPadding: number;
  optionPadding: number;
  optionGap: number;
  itemGap: number;
  questionToOptionsGap: number;
  pageMargins: PageMargins;
  snapToGrid: boolean;
  showMargins: boolean;
  gridSize: number;
  watermarkText: string;
  showWatermark: boolean;
  includeAnswerKey: boolean;
  showGridInExport: boolean;
  showEn: boolean;
  showHi: boolean;
  showSolutions: boolean;
  fontSize: number;
  questionBoldness: string;
  optionBoldness: string;
  solutionBoldness: string;
  answerBold: boolean;
  showQR: boolean;
  showPreviousYearTag: boolean;
  showExplanation: boolean;
  hideQuestion: boolean;
  hideOption: boolean;
  showAnswerWidget: boolean;
  firstLogo: string;
  secondLogo: string;
  showHeader: boolean;
  showBook: boolean;
  showAnswerWithDesc: boolean;
  questionOpacity: boolean;
  optionOpacity: boolean;
  pyTagOffsetX: number;
  pyTagOffsetY: number;
  pyTagFontSize: number;
  pyTagColor: string;
  primaryLanguage: 'en' | 'hi';
  explanationFontSize: number;
  explanationColor: string;
  explanationLanguage: 'en' | 'hi' | 'both';
  solutionFontSize: number;
}

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
  role?: string; // e.g. 'question_text', 'option_text', 'header'
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
  bulkEditMode: boolean;

  // Data bindings
  sourceData: Record<string, unknown>;
  sourceModule: string;
  dataBindings: DataBinding[];
  orgBranding: {
    name: string;
    logo: string;
    color: string;
  };
  availableSubjects: string[];
  selectedSubject: string;
  setAvailableSubjects: (subjects: string[]) => void;
  setSelectedSubject: (subject: string) => void;
  layoutSettings: LayoutSettings;
  
  // Actions
  setTitle: (title: string) => void;
  setPageSize: (size: PageSize) => void;
  setActiveLeftTab: (tab: LeftTabType) => void;
  setZoom: (zoom: number) => void;
  toggleAIPanel: () => void;
  togglePreview: () => void;
  toggleExportModal: (format?: string) => void;
  toggleBulkEditMode: () => void;
  setLayoutSettings: (settings: Partial<LayoutSettings>) => void;
  resetLayoutSettings: () => void;
  
  // Element actions
  addElement: (element: CanvasElement, pageIndex?: number) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  updateElementsByRole: (role: string, updates: Partial<CanvasElement>) => void;
  removeElement: (id: string) => void;
  selectElement: (id: string, multi?: boolean) => void;
  selectMultipleElements: (ids: string[]) => void;
  deselectAll: () => void;
  
  // Page actions
  addPage: () => void;
  deletePage: (index: number) => void;
  setCurrentPage: (index: number) => void;
  clearPages: () => void;
  setPages: (pages: Page[]) => void;
  
  // Bulk actions
  alignElements: (ids: string[], type: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'middle') => void;
  distributeElements: (ids: string[], type: 'horizontal' | 'vertical') => void;
  reorderElements: (ids: string[], action: 'forward' | 'backward' | 'front' | 'back') => void;
  matchSize: (ids: string[], dimension: 'width' | 'height' | 'both') => void;
  deleteMultipleElements: (ids: string[]) => void;
  
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
  bulkEditMode: false,
  sourceData: {},
  sourceModule: "",
  dataBindings: [],
  orgBranding: {
    name: "EduHub Organization",
    logo: "",
    color: "#F4511E",
  },
  availableSubjects: [],
  selectedSubject: "All Subjects",
  layoutSettings: {
    numColumns: 1,
    columnGap: 20,
    showQuestionBox: false,
    showOptionBox: true,
    questionPadding: 10,
    optionPadding: 5,
    optionGap: 4,
    itemGap: 15,
    questionToOptionsGap: 8,
    pageMargins: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
    },
    snapToGrid: false,
    showMargins: true,
    gridSize: 10,
    watermarkText: "EDUCATIONAL HUB",
    showWatermark: false,
    includeAnswerKey: true,
    showGridInExport: false,
    showEn: true,
    showHi: true,
    showSolutions: true,
    fontSize: 12,
    questionBoldness: "500",
    optionBoldness: "400",
    solutionBoldness: "400",
    answerBold: false,
    showQR: false,
    showPreviousYearTag: false,
    showExplanation: false,
    hideQuestion: false,
    hideOption: false,
    showAnswerWidget: false,
    firstLogo: "",
    secondLogo: "",
    showHeader: true,
    showBook: false,
    showAnswerWithDesc: false,
    questionOpacity: false,
    optionOpacity: false,
    pyTagOffsetX: 0,
    pyTagOffsetY: 0,
    pyTagFontSize: 9,
    pyTagColor: "#F4511E",
    primaryLanguage: 'en' as 'en' | 'hi',
    explanationFontSize: 10,
    explanationColor: "#6B7280",
    explanationLanguage: 'both' as 'en' | 'hi' | 'both',
    solutionFontSize: 10,
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
  toggleBulkEditMode: () => set((state) => ({ bulkEditMode: !state.bulkEditMode })),
  setLayoutSettings: (updates) => set((state) => ({
    layoutSettings: { ...state.layoutSettings, ...updates },
    isDirty: true
  })),
  resetLayoutSettings: () => set({
    layoutSettings: { ...initialState.layoutSettings },
    isDirty: true
  }),

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
    const { pages } = get();
    
    set({
      pages: pages.map((page) => ({
        ...page,
        elements: page.elements.map((el) => {
          if (el.id === id) {
            // Deep merge essential parts
            return {
              ...el,
              ...updates,
              position: updates.position ? { ...el.position, ...updates.position } : el.position,
              size: updates.size ? { ...el.size, ...updates.size } : el.size,
              content: updates.content ? { ...el.content, ...updates.content } : el.content,
              style: updates.style ? { ...el.style, ...updates.style } : el.style,
            };
          }
          return el;
        }),
      })),
      isDirty: true,
    });
  },

  updateElementsByRole: (role, updates) => {
    const { pages } = get();
    set({
      pages: pages.map((page) => ({
        ...page,
        elements: page.elements.map((el) => {
          if (el.role === role) {
            // Deep merge essential parts
            return {
              ...el,
              ...updates,
              position: updates.position ? { ...el.position, ...updates.position } : el.position,
              size: updates.size ? { ...el.size, ...updates.size } : el.size,
              content: updates.content ? { ...el.content, ...updates.content } : el.content,
              style: updates.style ? { ...el.style, ...updates.style } : el.style,
            };
          }
          return el;
        }),
      })),
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

  selectMultipleElements: (ids) => set({ selectedIds: ids }),

  deselectAll: () => set({ selectedIds: [] }),

  // Subjects
  setAvailableSubjects: (subjects) => set({ availableSubjects: subjects }),
  setSelectedSubject: (subject) => set({ selectedSubject: subject }),

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

  clearPages: () => set({
    pages: [
      {
        id: `page_${Date.now()}`,
        elements: [],
        background: "#ffffff",
      },
    ],
    currentPageIndex: 0,
    selectedIds: [],
    isDirty: true
  }),

  setPages: (pages) => set({ 
    pages, 
    currentPageIndex: 0,
    selectedIds: [],
    isDirty: true 
  }),

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
  
  // Bulk actions
  alignElements: (ids, type) => {
    const { pages, currentPageIndex } = get();
    const currentPage = pages[currentPageIndex];
    if (!currentPage) return;
    
    const selectedElements = currentPage.elements.filter(el => ids.includes(el.id));
    if (selectedElements.length < 2) return;

    let targetValue = 0;
    
    // Bounds calculation
    const xs = selectedElements.map(el => el.position.x);
    const ys = selectedElements.map(el => el.position.y);
    const rights = selectedElements.map(el => el.position.x + el.size.width);
    const bottoms = selectedElements.map(el => el.position.y + el.size.height);

    const minX = Math.min(...xs);
    const maxX = Math.max(...rights);
    const minY = Math.min(...ys);
    const maxY = Math.max(...bottoms);

    set({
      pages: pages.map((page, i) => {
        if (i !== currentPageIndex) return page;
        return {
          ...page,
          elements: page.elements.map(el => {
            if (!ids.includes(el.id)) return el;
            
            const newPos = { ...el.position };
            switch (type) {
              case 'left': newPos.x = minX; break;
              case 'right': newPos.x = maxX - el.size.width; break;
              case 'top': newPos.y = minY; break;
              case 'bottom': newPos.y = maxY - el.size.height; break;
              case 'center': newPos.x = minX + (maxX - minX) / 2 - el.size.width / 2; break;
              case 'middle': newPos.y = minY + (maxY - minY) / 2 - el.size.height / 2; break;
            }
            return { ...el, position: newPos };
          })
        };
      }),
      isDirty: true
    });
    get().saveToHistory(`Align ${type}`);
  },

  distributeElements: (ids, type) => {
    const { pages, currentPageIndex } = get();
    const currentPage = pages[currentPageIndex];
    if (!currentPage) return;
    
    const selectedSorted = [...currentPage.elements]
      .filter(el => ids.includes(el.id))
      .sort((a, b) => type === 'horizontal' 
        ? a.position.x - b.position.x 
        : a.position.y - b.position.y);
    
    if (selectedSorted.length < 3) return;

    const first = selectedSorted[0];
    const last = selectedSorted[selectedSorted.length - 1];
    
    if (type === 'horizontal') {
      const totalWidth = last.position.x - first.position.x;
      const step = totalWidth / (selectedSorted.length - 1);
      
      set({
        pages: pages.map((page, i) => {
          if (i !== currentPageIndex) return page;
          return {
            ...page,
            elements: page.elements.map(el => {
              const idx = selectedSorted.findIndex(s => s.id === el.id);
              if (idx === -1) return el;
              return { ...el, position: { ...el.position, x: first.position.x + idx * step } };
            })
          };
        }),
        isDirty: true
      });
    } else {
      const totalHeight = last.position.y - first.position.y;
      const step = totalHeight / (selectedSorted.length - 1);
      
      set({
        pages: pages.map((page, i) => {
          if (i !== currentPageIndex) return page;
          return {
            ...page,
            elements: page.elements.map(el => {
              const idx = selectedSorted.findIndex(s => s.id === el.id);
              if (idx === -1) return el;
              return { ...el, position: { ...el.position, y: first.position.y + idx * step } };
            })
          };
        }),
        isDirty: true
      });
    }
    get().saveToHistory(`Distribute ${type}`);
  },

  reorderElements: (ids, action) => {
    const { pages, currentPageIndex } = get();
    const currentPage = pages[currentPageIndex];
    if (!currentPage) return;

    const newElements = [...currentPage.elements];
    
    ids.forEach(id => {
      const idx = newElements.findIndex(el => el.id === id);
      if (idx === -1) return;

      if (action === 'forward' && idx < newElements.length - 1) {
        [newElements[idx], newElements[idx + 1]] = [newElements[idx + 1], newElements[idx]];
      } else if (action === 'backward' && idx > 0) {
        [newElements[idx], newElements[idx - 1]] = [newElements[idx - 1], newElements[idx]];
      } else if (action === 'front') {
        const el = newElements.splice(idx, 1)[0];
        newElements.push(el);
      } else if (action === 'back') {
        const el = newElements.splice(idx, 1)[0];
        newElements.unshift(el);
      }
    });

    set({
      pages: pages.map((p, i) => i === currentPageIndex ? { ...p, elements: newElements } : p),
      isDirty: true
    });
    get().saveToHistory(`Reorder elements`);
  },

  matchSize: (ids, dimension) => {
    const { pages, currentPageIndex } = get();
    const currentPage = pages[currentPageIndex];
    if (!currentPage) return;
    
    const selectedElements = currentPage.elements.filter(el => ids.includes(el.id));
    if (selectedElements.length < 2) return;
    
    const firstSize = selectedElements[0].size;
    
    set({
      pages: pages.map((page, i) => {
        if (i !== currentPageIndex) return page;
        return {
          ...page,
          elements: page.elements.map(el => {
            if (!ids.includes(el.id)) return el;
            return {
              ...el,
              size: {
                width: dimension === 'height' ? el.size.width : firstSize.width,
                height: dimension === 'width' ? el.size.height : firstSize.height,
              }
            };
          })
        };
      }),
      isDirty: true
    });
    get().saveToHistory(`Match ${dimension}`);
  },

  deleteMultipleElements: (ids) => {
    const { pages, currentPageIndex, selectedIds } = get();
    set({
      pages: pages.map((page, i) => 
        i === currentPageIndex 
          ? { ...page, elements: page.elements.filter(el => !ids.includes(el.id)) } 
          : page
      ),
      selectedIds: selectedIds.filter(sid => !ids.includes(sid)),
      isDirty: true
    });
    get().saveToHistory(`Delete multiple elements`);
  },

  setSourceData: (module, data) => set({ 
    sourceModule: module, 
    sourceData: data 
  }),
  
  setOrgBranding: (branding) => set({ orgBranding: branding }),
}));
