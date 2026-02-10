import React, { useState, useRef, useEffect } from 'react';
import {
  MousePointer2, Pen, Eraser, Undo2, Redo2,
  Trash2, ChevronLeft, ChevronRight, Highlighter,
  Minus, Square, Circle, Type, Zap, Image as ImageIcon,
  Triangle, Star, ArrowRight, Hexagon, MessageSquare, Diamond, Download, Palette, MoreHorizontal,
  GripHorizontal, ChevronDown, ChevronUp, Calculator, BookOpen
} from 'lucide-react';
import { useBoardStore } from './store';
import { Tool } from './types';
import { ShapePropertiesPanel } from './ShapePropertiesPanel';
import { StyleToolbar } from './StyleToolbar';
import { LaserToolbar } from './LaserToolbar';
import { ImageOptionsPanel } from './ImageOptionsPanel';

interface BoardToolbarProps {
  currentSlide: number;
  totalSlides: number;
  onPrev: () => void;
  onNext: () => void;
  dragHandlers: any; // Passed from parent useDraggable
  onToggleExplanation: () => void;
  hasExplanationSlide: boolean;
  onClear?: () => void;
}

export const BoardToolbar: React.FC<BoardToolbarProps> = ({
  currentSlide,
  totalSlides,
  onPrev,
  onNext,
  dragHandlers,
  onToggleExplanation,
  hasExplanationSlide,
  onClear
}) => {
  const { tool, setTool, eraserMode, setEraserMode, color, setColor, size, setSize, eraserSize, setEraserSize, undo, redo, clear, history, redoStack, activePanel, setActivePanel } = useBoardStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const penSettingsRef = useRef<HTMLDivElement>(null);
  const eraserOptionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      const { activePanel, setActivePanel } = useBoardStore.getState();
      if (activePanel === 'none') return;

      const target = event.target as Node;

      // Check all refs
      const refs = [
        panelRef.current,
        barRef.current,
        penSettingsRef.current,
        eraserOptionsRef.current
      ].filter(Boolean);

      // Check if click is inside any of the refs
      const isClickInside = refs.some(ref => ref?.contains(target));

      if (!isClickInside) {
        setActivePanel('none');
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('pointerdown', handleClickOutside, true);
      document.addEventListener('mousedown', handleClickOutside, true);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('pointerdown', handleClickOutside, true);
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, []);

  const colors = [
    '#ffffff', '#ef4444', '#f97316', '#f59e0b',
    '#84cc16', '#10b981', '#06b6d4', '#3b82f6',
    '#6366f1', '#8b5cf6', '#ec4899', '#000000'
  ];

  const mainTools = [
    { id: 'cursor', icon: MousePointer2, label: 'Select' },
    { id: 'pen', icon: Pen, label: 'Pen' },
    { id: 'highlighter', icon: Highlighter, label: 'Highlight' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
    { id: 'text', icon: Type, label: 'Text Box' },
    { id: 'image', icon: ImageIcon, label: 'Insert Image' },
  ];

  const isShapeTool = ['line', 'rectangle', 'circle', 'triangle', 'star', 'arrow', 'hexagon', 'pentagon', 'speech_bubble'].includes(tool);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const maxSize = 500;
        if (width > maxSize || height > maxSize) {
          const ratio = width / height;
          if (width > height) {
            width = maxSize;
            height = maxSize / ratio;
          } else {
            height = maxSize;
            width = maxSize * ratio;
          }
        }

        useBoardStore.getState().addStroke({
          id: crypto.randomUUID(),
          tool: 'image',
          points: [{ x: 100, y: 100 }],
          x: 100,
          y: 100,
          width: width,
          height: height,
          imageUrl: imageUrl,
          color: '#000000',
          size: 0,
          isComplete: true
        });
        useBoardStore.getState().setTool('cursor');
      };
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  if (isCollapsed) {
    return (
      <div
        className="flex flex-col items-center gap-1 p-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl pointer-events-auto"
      >
        <div
          className="w-full flex justify-center cursor-move text-slate-500 py-1"
          onPointerDown={dragHandlers.onPointerDown}
          onPointerMove={dragHandlers.onPointerMove}
          onPointerUp={dragHandlers.onPointerUp}
        >
          <GripHorizontal size={16} />
        </div>

        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 rounded-xl bg-blue-600/20 text-blue-400 hover:text-white"
          title="Expand Toolbar"
        >
          <ChevronUp size={20} />
        </button>

        <div className="w-8 h-px bg-white/10 my-1" />

        <button
          onClick={() => setTool('cursor')}
          className={`p-2 rounded-xl ${tool === 'cursor' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
        >
          <MousePointer2 size={18} />
        </button>

        <button
          onClick={() => setTool('pen')}
          className={`p-2 rounded-xl ${tool === 'pen' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
        >
          <Pen size={18} />
        </button>
        <button
          onClick={() => setTool('eraser')}
          className={`p-2 rounded-xl ${tool === 'eraser' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
        >
          <Eraser size={18} />
        </button>
        <button
          onClick={onNext}
          className="p-2 rounded-xl text-slate-400 hover:text-white"
        >
          <ChevronRight size={18} />
        </button>

      </div>
    );
  }

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        className="hidden"
        accept="image/*"
      />
      <div className="relative flex flex-col items-center pointer-events-auto">

        {/* Options Panels Container - Positioned Absolute Above Toolbar */}
        <div ref={panelRef} className="absolute bottom-full mb-3 flex flex-col items-center w-max max-w-[90vw] max-h-[75vh] overflow-y-auto no-scrollbar pointer-events-none z-50">
          <div className="pointer-events-auto">
            {/* Laser Toolbar */}
            {tool === 'laser' && activePanel === 'laser' && (
              <div className="mb-2">
                <LaserToolbar onClose={() => setActivePanel('none')} />
              </div>
            )}

            {/* Style Panel */}
            {activePanel === 'style' && (
              <StyleToolbar onClose={() => setActivePanel('none')} />
            )}

            {/* Pen/Highlighter/Text Settings Popover */}
            {(tool === 'pen' || tool === 'highlighter' || tool === 'text') && activePanel === 'pen_settings' && (
              <div ref={penSettingsRef} className="bg-black/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl mb-2 w-72 animate-in slide-in-from-bottom-2 fade-in duration-200">
                <div className="flex flex-col gap-5">
                  {/* Presets for Pen */}
                  {tool === 'pen' && (
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Presets</div>
                      <div className="flex gap-2">
                        <button onClick={() => { setColor('#ffffff'); setSize(2); }} className="flex-1 bg-white/5 hover:bg-white/10 rounded-lg p-2 flex flex-col items-center gap-1 border border-white/5">
                          <div className="w-2 h-2 rounded-full bg-white" />
                          <span className="text-[10px] text-slate-400">Thin</span>
                        </button>
                        <button onClick={() => { setColor('#3b82f6'); setSize(4); }} className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg p-2 flex flex-col items-center gap-1 border border-blue-500/20">
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                          <span className="text-[10px] text-blue-400">Normal</span>
                        </button>
                        <button onClick={() => { setColor('#ef4444'); setSize(8); }} className="flex-1 bg-red-500/10 hover:bg-red-500/20 rounded-lg p-2 flex flex-col items-center gap-1 border border-red-500/20">
                          <div className="w-4 h-4 rounded-full bg-red-500" />
                          <span className="text-[10px] text-red-400">Thick</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Color</div>
                    <div className="grid grid-cols-6 gap-2">
                      {colors.map(c => (
                        <button
                          key={c}
                          onClick={() => setColor(c)}
                          className={`w-8 h-8 rounded-full border border-white/10 transition-transform ${color === c ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-black' : 'hover:scale-110'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{tool === 'text' ? 'Font Size' : 'Stroke Thickness'}</div>
                      <div className="text-xs font-mono text-slate-400 bg-white/10 px-2 py-0.5 rounded">{size}px</div>
                    </div>
                    <input
                      type="range"
                      min={tool === 'text' ? "12" : "1"}
                      max={tool === 'text' ? "72" : (tool === 'highlighter' ? "50" : "20")}
                      value={size}
                      onChange={(e) => setSize(Number(e.target.value))}
                      className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
                    />
                  </div>

                  {tool === 'highlighter' && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Opacity</div>
                        <div className="text-xs font-mono text-slate-400">{Math.round((useBoardStore.getState().opacity || 0.5) * 100)}%</div>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={(useBoardStore.getState().opacity || 0.5) * 100}
                        onChange={(e) => useBoardStore.getState().setOpacity(Number(e.target.value) / 100)}
                        className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Shape Properties Panel */}
            {isShapeTool && activePanel === 'shape' && (
              <div className="mb-2">
                <ShapePropertiesPanel />
              </div>
            )}

            {/* Eraser Options Popover */}
            {tool === 'eraser' && activePanel === 'eraser_options' && (
              <div ref={eraserOptionsRef} className="bg-[#1e1e1e] border border-white/10 p-2 rounded-xl shadow-2xl mb-2 flex flex-col gap-1 w-56 animate-in slide-in-from-bottom-2 fade-in duration-200">
                <button
                  onClick={() => setEraserMode('partial')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-left ${eraserMode === 'partial' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  Partial Eraser
                </button>

                {eraserMode === 'partial' && (
                  <div className="px-2 py-2 border-t border-white/10 mt-1">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Eraser Size</div>
                      <div className="text-xs font-mono text-slate-400">{eraserSize}px</div>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={eraserSize}
                      onChange={(e) => setEraserSize(Number(e.target.value))}
                      className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                )}

                <button
                  onClick={() => setEraserMode('lasso')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-left ${eraserMode === 'lasso' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  Lasso Eraser
                </button>
                <button
                  onClick={() => { clear(); onClear?.(); setActivePanel('none'); }}
                  className="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-left text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  Clear All
                </button>
              </div>
            )}
            {/* Image Options Panel */}
            {tool === 'image' && activePanel === 'image_options' && (
              <ImageOptionsPanel
                onClose={() => setActivePanel('none')}
                onUploadClick={() => fileInputRef.current?.click()}
              />
            )}
          </div>
        </div>

        {/* Main Bar */}
        <div ref={barRef} className="flex flex-col bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl">

          {/* Header Grip */}
          <div
            className="flex items-center justify-between px-4 py-1.5 border-b border-white/5 cursor-move"
            onPointerDown={dragHandlers.onPointerDown}
            onPointerMove={dragHandlers.onPointerMove}
            onPointerUp={dragHandlers.onPointerUp}
          >
            <div className="flex items-center gap-2 text-slate-500">
              <GripHorizontal size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Tools</span>
            </div>
            <button
              onClick={() => setIsCollapsed(true)}
              className="text-slate-500 hover:text-white"
              title="Minimize"
            >
              <ChevronDown size={14} />
            </button>
          </div>

          <div className="flex items-center gap-1.5 p-2 overflow-x-auto max-w-[95vw] custom-scrollbar">
            {/* Navigation */}
            <div className="flex items-center gap-1 bg-black/20 rounded-xl px-1 mr-2 shrink-0">
              <button onClick={onPrev} disabled={currentSlide === 0} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white disabled:opacity-30">
                <ChevronLeft size={18} />
              </button>
              <span className="font-mono text-xs font-bold text-slate-400 min-w-[3rem] text-center hidden sm:block">
                {currentSlide + 1} / {totalSlides}
              </span>
              <button onClick={onNext} disabled={currentSlide === totalSlides - 1} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white disabled:opacity-30">
                <ChevronRight size={18} />
              </button>

              <div className="w-px h-4 bg-white/10 mx-1" />

              {/* Explanation Slide Toggle */}
              <button
                onClick={onToggleExplanation}
                className={`p-2 rounded-lg transition-all ${hasExplanationSlide ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                title="Toggle Explanation Slide (Insert/Remove)"
              >
                <BookOpen size={16} fill={hasExplanationSlide ? "currentColor" : "none"} />
              </button>
            </div>

            <div className="w-px h-6 bg-white/10 mx-1 shrink-0" />

            {/* Core Tools */}
            {mainTools.map(t => (
              <button
                key={t.id}
                onClick={() => {
                  if (t.id === 'image') {
                    if (tool === 'image') {
                      setActivePanel(activePanel === 'image_options' ? 'none' : 'image_options');
                    } else {
                      setTool('image');
                      setActivePanel('image_options');
                    }
                    return;
                  }

                  setTool(t.id as Tool);
                  setActivePanel('none'); // Reset active panel on tool switch

                  if (t.id === 'pen') {
                    if (tool !== 'pen') setSize(4);
                    setActivePanel(tool === t.id && activePanel === 'pen_settings' ? 'none' : 'pen_settings');
                  } else if (t.id === 'highlighter') {
                    if (tool !== 'highlighter') setSize(30);
                    setActivePanel(tool === t.id && activePanel === 'pen_settings' ? 'none' : 'pen_settings');
                  } else if (t.id === 'eraser') {
                    setActivePanel(tool === t.id && activePanel === 'eraser_options' ? 'none' : 'eraser_options');
                  } else if (t.id === 'text') {
                    setActivePanel(tool === t.id && activePanel === 'pen_settings' ? 'none' : 'pen_settings');
                  }
                }}
                className={`p-2.5 rounded-xl transition-all relative shrink-0 ${tool === t.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                title={t.label}
              >
                <t.icon size={20} />
                {(t.id === 'pen' || t.id === 'highlighter' || t.id === 'text') && tool === t.id && (
                  <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full border border-black/20" style={{ backgroundColor: color }} />
                )}
              </button>
            ))}

            {/* Shapes Menu */}
            <button
              className={`p-2.5 rounded-xl transition-all shrink-0 ${isShapeTool ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              onClick={() => {
                if (!isShapeTool) setTool('rectangle');
                setActivePanel(isShapeTool && activePanel === 'shape' ? 'none' : 'shape');
              }}
              title="Shapes"
            >
              {tool === 'rectangle' ? <Square size={20} /> :
                tool === 'circle' ? <Circle size={20} /> :
                  tool === 'triangle' ? <Triangle size={20} /> :
                    tool === 'star' ? <Star size={20} /> :
                      tool === 'hexagon' ? <Hexagon size={20} /> :
                        tool === 'pentagon' ? <Diamond size={20} /> :
                          tool === 'speech_bubble' ? <MessageSquare size={20} /> :
                            tool === 'arrow' ? <ArrowRight size={20} /> :
                              tool === 'line' ? <Minus size={20} /> :
                                <Square size={20} />}
            </button>

            {/* Laser */}
            <button
              onClick={() => {
                if (tool === 'laser') {
                  setActivePanel(activePanel === 'laser' ? 'none' : 'laser');
                } else {
                  setTool('laser');
                  setActivePanel('laser');
                }
              }}
              className={`p-2.5 rounded-xl transition-all shrink-0 ${tool === 'laser' ? 'bg-red-500/20 text-red-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              title="Laser Pointer"
            >
              <Zap size={20} />
            </button>

            <div className="w-px h-6 bg-white/10 mx-1 shrink-0" />

            {/* Calculator */}
            <button
              onClick={() => setActivePanel(activePanel === 'calculator' ? 'none' : 'calculator')}
              className={`p-2.5 rounded-xl transition-all shrink-0 ${activePanel === 'calculator' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              title="Calculator"
            >
              <Calculator size={20} />
            </button>

            {/* Style Settings */}
            <button
              onClick={() => {
                setActivePanel(activePanel === 'style' ? 'none' : 'style');
              }}
              className={`p-2.5 rounded-xl transition-all shrink-0 ${activePanel === 'style' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              title="Board & Card Settings"
            >
              <Palette size={20} />
            </button>

            {/* Actions */}
            <button onClick={undo} disabled={history.length === 0} className="p-2.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white disabled:opacity-30 shrink-0">
              <Undo2 size={20} />
            </button>
            <button onClick={redo} disabled={redoStack.length === 0} className="p-2.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white disabled:opacity-30 shrink-0">
              <Redo2 size={20} />
            </button>


            <button onClick={() => { clear(); onClear?.(); }} className="p-2.5 hover:bg-red-500/20 rounded-xl text-slate-400 hover:text-red-400 shrink-0">
              <Trash2 size={20} />
            </button>

          </div>
        </div>
      </div>
    </>
  );
};
