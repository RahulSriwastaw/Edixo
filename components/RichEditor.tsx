import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link2, Unlink, Image as ImageIcon, Code, Quote,
  Subscript, Superscript, Table, Type, Palette,
  Undo, Redo, Eraser, Eye, Code2, ChevronDown, Maximize2, Minimize2
} from 'lucide-react';

export interface RichEditorProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  minHeight?: string;
  accessory?: React.ReactNode;
  className?: string;
}

export const RichEditor: React.FC<RichEditorProps> = React.memo(({ label, value, onChange, minHeight = "120px", accessory, className = "" }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const expandedEditorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [showSourceCode, setShowSourceCode] = useState(false);
  const [sourceCodeValue, setSourceCodeValue] = useState('');
  const [showColorPicker, setShowColorPicker] = useState<'text' | 'bg' | null>(null);
  const [showFontSize, setShowFontSize] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedContent, setExpandedContent] = useState('');
  const [localContent, setLocalContent] = useState(value);

  const [activeStyles, setActiveStyles] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    ul: false,
    ol: false,
    subscript: false,
    superscript: false
  });


  // Debounced onChange to reduce parent re-renders
  const debouncedOnChange = useCallback((content: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      onChange(content);
    }, 150);
  }, [onChange]);

  const exec = useCallback((cmd: string, val: string = '', forExpanded: boolean = false) => {
    document.execCommand(cmd, false, val);
    const targetRef = forExpanded ? expandedEditorRef : editorRef;
    targetRef.current?.focus();
    checkStyles();
  }, []);


  const handleLink = useCallback(() => {
    const url = prompt('Enter URL:');
    if (url) exec('createLink', url);
  }, [exec]);

  const handleImageUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          exec('insertImage', event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const handleColorChange = useCallback((color: string, type: 'text' | 'bg') => {
    if (type === 'text') {
      exec('foreColor', color);
    } else {
      exec('backColor', color);
    }
    setShowColorPicker(null);
  }, [exec]);

  const insertTable = useCallback(() => {
    const rows = prompt('Number of rows:', '3');
    const cols = prompt('Number of columns:', '3');
    if (rows && cols) {
      let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%;"><tbody>';
      for (let i = 0; i < parseInt(rows); i++) {
        tableHTML += '<tr>';
        for (let j = 0; j < parseInt(cols); j++) {
          tableHTML += '<td style="padding: 8px; border: 1px solid #ddd;"> </td>';
        }
        tableHTML += '</tr>';
      }
      tableHTML += '</tbody></table>';
      exec('insertHTML', tableHTML);
    }
  }, [exec]);

  const toggleSourceCode = useCallback(() => {
    if (!showSourceCode) {
      setSourceCodeValue(editorRef.current?.innerHTML || '');
    } else {
      if (editorRef.current) {
        editorRef.current.innerHTML = sourceCodeValue;
        onChange(sourceCodeValue);
      }
    }
    setShowSourceCode(!showSourceCode);
  }, [showSourceCode, sourceCodeValue, onChange]);

  const checkStyles = useCallback(() => {
    setActiveStyles({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikethrough: document.queryCommandState('strikethrough'),
      ul: document.queryCommandState('insertUnorderedList'),
      ol: document.queryCommandState('insertOrderedList'),
      subscript: document.queryCommandState('subscript'),
      superscript: document.queryCommandState('superscript')
    });
  }, []);

  // Sync value from parent
  useEffect(() => {
    setLocalContent(value);
  }, [value]);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value && !showSourceCode && !isExpanded) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value, showSourceCode, isExpanded]);

  useEffect(() => {
    if (expandedEditorRef.current && isExpanded && !showSourceCode) {
      expandedEditorRef.current.innerHTML = expandedContent || '';
    }
  }, [isExpanded, expandedContent, showSourceCode]);

  const handleExpand = () => {
    // Capture current content before expanding
    const currentContent = editorRef.current?.innerHTML || value;
    setExpandedContent(currentContent);
    setIsExpanded(true);
  };

  const handleCollapse = () => {
    // Save expanded content back to normal view
    const currentExpandedContent = expandedEditorRef.current?.innerHTML || '';
    onChange(currentExpandedContent);
    setIsExpanded(false);
  };

  // ESC key to close fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        handleCollapse();
      }
    };

    if (isExpanded) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isExpanded, handleCollapse]);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const colorPresets = useMemo(() => ['#000000', '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#34495e'], []);
  const fontSizes = useMemo(() => ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'], []);

  return (
    <>
      {isExpanded && (
        <div className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <Maximize2 size={18} className="text-primary" />
                {label}
              </h3>
              <button
                onClick={handleCollapse}
                className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all flex items-center gap-2 text-sm font-semibold"
                title="Exit Fullscreen (ESC)"
              >
                <Minimize2 size={16} />
                Close
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-6">
              <div className="h-full">
                {renderEditor(true)}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`space-y-0.5 group/editor ${className}`}>
        {label && (
          <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider px-1 block">{label}</label>
        )}

        {renderEditor(false)}
      </div>
    </>
  );

  function renderEditor(isFullscreen: boolean) {
    return (
      <div className={`bg-white rounded-xl border border-slate-200 shadow-sm focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/5 transition-all overflow-hidden relative ${isFullscreen ? 'h-full flex flex-col' : ''} `}>
        {!showSourceCode && (
          <div className="px-1.5 py-1 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center gap-0.5 relative z-10">
            {/* Text Styling */}
            <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded p-0.5">
              <button onMouseDown={(e) => { e.preventDefault(); exec('bold'); }} className={`p-0.5 rounded transition-all ${activeStyles.bold ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`} title="Bold"><Bold size={14} /></button>
              <button onMouseDown={(e) => { e.preventDefault(); exec('italic'); }} className={`p-0.5 rounded transition-all ${activeStyles.italic ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`} title="Italic"><Italic size={14} /></button>
              <button onMouseDown={(e) => { e.preventDefault(); exec('underline'); }} className={`p-0.5 rounded transition-all ${activeStyles.underline ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`} title="Underline"><Underline size={14} /></button>
              <button onMouseDown={(e) => { e.preventDefault(); exec('strikethrough'); }} className={`p-0.5 rounded transition-all ${activeStyles.strikethrough ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`} title="Strike"><Strikethrough size={14} /></button>
            </div>

            {/* Font Size */}
            <div className="relative">
              <button
                onMouseDown={(e) => { e.preventDefault(); setShowFontSize(!showFontSize); }}
                className="p-0.5 rounded bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                title="Font Size"
              >
                <Type size={14} />
              </button>
              {showFontSize && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-1 z-50 min-w-[80px]">
                  {fontSizes.map(size => (
                    <button
                      key={size}
                      onMouseDown={(e) => { e.preventDefault(); exec('fontSize', '7'); exec('foreColor', 'inherit'); const sel = window.getSelection(); if (sel?.rangeCount) { const range = sel.getRangeAt(0); const span = document.createElement('span'); span.style.fontSize = size; range.surroundContents(span); } setShowFontSize(false); }}
                      className="w-full text-left px-2 py-1 text-[11px] hover:bg-slate-100 rounded"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Colors */}
            <div className="relative">
              <button
                onMouseDown={(e) => { e.preventDefault(); setShowColorPicker(showColorPicker === 'text' ? null : 'text'); }}
                className="p-0.5 rounded bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                title="Color"
              >
                <Palette size={14} />
              </button>
              {showColorPicker === 'text' && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-2 z-50">
                  <div className="grid grid-cols-4 gap-1">
                    {colorPresets.map(color => (
                      <button
                        key={color}
                        onMouseDown={(e) => { e.preventDefault(); handleColorChange(color, 'text'); }}
                        className="w-6 h-6 rounded border border-slate-200 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Alignment */}
            <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded p-0.5">
              <button onMouseDown={(e) => { e.preventDefault(); exec('justifyLeft'); }} className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all" title="Left"><AlignLeft size={14} /></button>
              <button onMouseDown={(e) => { e.preventDefault(); exec('justifyCenter'); }} className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all" title="Center"><AlignCenter size={14} /></button>
              <button onMouseDown={(e) => { e.preventDefault(); exec('justifyRight'); }} className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all" title="Align Right"><AlignRight size={12} /></button>
              <button onMouseDown={(e) => { e.preventDefault(); exec('justifyFull'); }} className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all" title="Justify"><AlignJustify size={12} /></button>
            </div>

            <div className="w-px h-4 bg-slate-200 mx-0.5" />

            {/* Lists */}
            <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
              <button onMouseDown={(e) => { e.preventDefault(); exec('insertUnorderedList'); }} className={`p - 1 rounded transition - all ${activeStyles.ul ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'} `} title="Bullet List"><List size={12} /></button>
              <button onMouseDown={(e) => { e.preventDefault(); exec('insertOrderedList'); }} className={`p - 1 rounded transition - all ${activeStyles.ol ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'} `} title="Numbered List"><ListOrdered size={12} /></button>
            </div>

            <div className="w-px h-4 bg-slate-200 mx-0.5" />

            {/* Script */}
            <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
              <button onMouseDown={(e) => { e.preventDefault(); exec('subscript'); }} className={`p - 1 rounded transition - all ${activeStyles.subscript ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'} `} title="Subscript"><Subscript size={12} /></button>
              <button onMouseDown={(e) => { e.preventDefault(); exec('superscript'); }} className={`p - 1 rounded transition - all ${activeStyles.superscript ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'} `} title="Superscript"><Superscript size={12} /></button>
            </div>

            <div className="w-px h-4 bg-slate-200 mx-0.5" />

            {/* Advanced */}
            <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded p-0.5">
              <button onMouseDown={(e) => { e.preventDefault(); handleLink(); }} className="p-0.5 rounded text-slate-400 hover:text-primary hover:bg-primary/10 transition-all" title="Link"><Link2 size={14} /></button>
              <button onMouseDown={(e) => { e.preventDefault(); handleImageUpload(); }} className="p-0.5 rounded text-slate-400 hover:text-primary hover:bg-primary/10 transition-all" title="Image"><ImageIcon size={14} /></button>
              <button onMouseDown={(e) => { e.preventDefault(); insertTable(); }} className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all" title="Table"><Table size={14} /></button>
            </div>

            {/* Blocks */}
            <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded p-0.5">
              <button onMouseDown={(e) => { e.preventDefault(); exec('formatBlock', '<blockquote>'); }} className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all" title="Quote"><Quote size={14} /></button>
              <button onMouseDown={(e) => { e.preventDefault(); exec('formatBlock', '<pre>'); }} className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all" title="Code"><Code size={14} /></button>
            </div>

            <div className="ml-auto flex items-center gap-0.5">
              {!isFullscreen && (
                <button onClick={handleExpand} className="p-0.5 rounded text-slate-400 hover:text-primary hover:bg-primary/10 transition-all" title="Expand"><Maximize2 size={14} /></button>
              )}
              <button onClick={toggleSourceCode} className={`p-0.5 rounded transition-all ${showSourceCode ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`} title="Source Code"><Code2 size={14} /></button>
            </div>
          </div>
        )}

        <div className={`relative ${isFullscreen ? 'flex-1 overflow-hidden' : ''}`}>
          {showSourceCode ? (
            <textarea
              className={`w-full px-3 py-2 outline-none font-mono text-[11px] text-slate-700 bg-slate-50 resize-none ${isFullscreen ? 'h-full' : ''}`}
              style={isFullscreen ? {} : { minHeight }}
              value={sourceCodeValue}
              onChange={(e) => setSourceCodeValue(e.target.value)}
              spellCheck={false}
            />
          ) : (
            <div
              ref={isFullscreen ? expandedEditorRef : editorRef}
              contentEditable
              className={`w-full px-3 py-2 outline-none overflow-y-auto prose prose-slate prose-sm max-w-none prose-p:my-1 prose-headings:my-2 font-medium text-slate-600 focus:text-slate-800 leading-snug [&_img]:max-w-full [&_img]:rounded-lg [&_img]:border [&_img]:border-slate-200 [&_img]:my-2 [&_table]:border-collapse [&_table]:w-full [&_td]:border [&_td]:border-slate-200 [&_td]:p-2 [&_th]:border [&_th]:border-slate-200 [&_th]:p-2 [&_th]:bg-slate-50 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-600 [&_pre]:bg-slate-800 [&_pre]:text-slate-100 [&_pre]:p-3 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:font-mono [&_code]:bg-slate-800 [&_code]:text-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[13px] [&_code]:font-mono ${isFullscreen ? 'h-full min-h-full' : 'min-h-[80px] max-h-[600px]'}`}
              style={isFullscreen ? {} : { minHeight }}
              onInput={(e) => isFullscreen ? setExpandedContent(e.currentTarget.innerHTML) : onChange(e.currentTarget.innerHTML)}
              onBlur={() => checkStyles()}
              onKeyUp={() => checkStyles()}
              onMouseUp={() => checkStyles()}
            />
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>
    );
  }
});

