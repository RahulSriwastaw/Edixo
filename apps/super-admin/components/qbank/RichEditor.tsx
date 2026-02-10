import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link2, Image as ImageIcon, Code, Quote,
  Subscript, Superscript, Table, Type, Palette,
  RotateCcw, RotateCw, Eraser, Maximize2, Minimize2,
  ChevronDown, Sigma, GripHorizontal
} from 'lucide-react';

export interface RichEditorProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  minHeight?: string;
  accessory?: React.ReactNode;
  className?: string;
  placeholder?: string;
}

const MATH_SYMBOLS = ['Ω', 'π', '∆', '∑', '∞', '≈', '≠', '≤', '≥', '±', '×', '÷', '√', '°', 'α', 'β', 'θ', 'λ', 'μ'];
const FONT_SIZES = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];
const COLORS = ['#000000', '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#34495e', '#7f8c8d'];

export const RichEditor: React.FC<RichEditorProps> = React.memo(({
  label, value, onChange, minHeight = "200px", accessory, className = "", placeholder = "Type something..."
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const expandedEditorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const historySaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [expanded, setExpanded] = useState(false);
  const [expandedContent, setExpandedContent] = useState('');

  // Code View State
  const [isCodeView, setIsCodeView] = useState(false);
  const [htmlCode, setHtmlCode] = useState('');

  // Undo/Redo History State
  const [history, setHistory] = useState<string[]>([value || '']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const maxHistorySize = 50;
  const isUndoDisabled = historyIndex <= 0;
  const isRedoDisabled = historyIndex >= history.length - 1;

  // Toolbar State
  const [showColorPicker, setShowColorPicker] = useState<'text' | 'bg' | null>(null);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [showMathPicker, setShowMathPicker] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const [activeStyles, setActiveStyles] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    ul: false,
    ol: false,
    sub: false,
    sup: false,
    blockquote: false,
    code: false,
    alignLeft: false,
    alignCenter: false,
    alignRight: false,
    alignJustify: false
  });

  // Debounced Change Handler
  const debouncedOnChange = useCallback((content: string) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      onChange(content);
    }, 150);
  }, [onChange]);

  // Save to history
  const saveHistory = useCallback((content: string) => {
    setHistory(prev => {
      // If we're not at the end of history, remove everything after current index
      const newHistory = prev.slice(0, historyIndex + 1);
      // Add new content
      newHistory.push(content);
      // Limit history size
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
        setHistoryIndex(maxHistorySize - 1);
        return newHistory;
      }
      setHistoryIndex(newHistory.length - 1);
      return newHistory;
    });
  }, [historyIndex, maxHistorySize]);

  // Handle Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const content = history[newIndex];
      setHistoryIndex(newIndex);

      const activeEditor = expanded ? expandedEditorRef.current : editorRef.current;
      if (activeEditor) {
        activeEditor.innerHTML = content;
        onChange(content);
      }
    }
  }, [historyIndex, history, expanded, onChange]);

  // Handle Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const content = history[newIndex];
      setHistoryIndex(newIndex);

      const activeEditor = expanded ? expandedEditorRef.current : editorRef.current;
      if (activeEditor) {
        activeEditor.innerHTML = content;
        onChange(content);
      }
    }
  }, [historyIndex, history, expanded, onChange]);

  // Core formatting executor
  const exec = useCallback((cmd: string, val: string = '', forExpanded = false) => {
    document.execCommand(cmd, false, val);
    const target = forExpanded ? expandedEditorRef.current : editorRef.current;
    target?.focus();
    checkStyles();
  }, []);

  const insertHTML = useCallback((html: string) => {
    exec('insertHTML', html);
  }, [exec]);

  const handleLink = () => {
    const url = prompt('Enter URL:');
    if (url) exec('createLink', url);
  };

  const handleImageUpload = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) exec('insertImage', ev.target.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const insertTable = () => {
    const rows = prompt('Rows:', '3');
    const cols = prompt('Columns:', '3');
    if (rows && cols) {
      let html = '<table style="border-collapse: collapse; width: 100%; margin: 10px 0;"><tbody>';
      for (let i = 0; i < parseInt(rows); i++) {
        html += '<tr>';
        for (let j = 0; j < parseInt(cols); j++) {
          html += '<td style="border: 1px solid #cbd5e1; padding: 8px;">&nbsp;</td>';
        }
        html += '</tr>';
      }
      html += '</tbody></table>';
      insertHTML(html);
    }
  };

  const checkStyles = useCallback(() => {
    setActiveStyles({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikethrough: document.queryCommandState('strikethrough'),
      ul: document.queryCommandState('insertUnorderedList'),
      ol: document.queryCommandState('insertOrderedList'),
      sub: document.queryCommandState('subscript'),
      sup: document.queryCommandState('superscript'),
      alignLeft: document.queryCommandState('justifyLeft'),
      alignCenter: document.queryCommandState('justifyCenter'),
      alignRight: document.queryCommandState('justifyRight'),
      alignJustify: document.queryCommandState('justifyFull'),
      blockquote: document.queryCommandValue('formatBlock') === 'blockquote',
      code: false // difficult to track accurately with execCommand
    });

    // Update word count
    const text = (editorRef.current?.innerText || '') + (expandedEditorRef.current?.innerText || '');
    setWordCount(text.trim().split(/\s+/).filter(w => w.length > 0).length);
  }, []);

  // Sync Content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value && !expanded) {
      editorRef.current.innerHTML = value || '';
      checkStyles();
    }
  }, [value, expanded, checkStyles]);

  // Sync Expanded Content on Open
  useEffect(() => {
    if (expanded && expandedEditorRef.current) {
      // Must wait for ref to be available in next tick or effect
      expandedEditorRef.current.innerHTML = expandedContent || value || '';
    }
  }, [expanded, expandedContent, value]);

  // Handle Fullscreen
  const toggleFullscreen = () => {
    if (!expanded) {
      const current = editorRef.current?.innerHTML || value;
      setExpandedContent(current);
      setExpanded(true);
    } else {
      const content = expandedEditorRef.current?.innerHTML || '';
      onChange(content);
      setExpanded(false);
    }
  };

  // Improved Code Block Toggle
  const toggleCodeBlock = useCallback(() => {
    const activeEditor = expanded ? expandedEditorRef.current : editorRef.current;
    if (!activeEditor) return;

    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    // Check if we are inside a PRE tag
    let node = selection.anchorNode;
    // Normalize text nodes to parent
    if (node?.nodeType === 3) node = node.parentElement;

    const preNode = (node as HTMLElement)?.closest('pre');

    if (preNode) {
      // Unwrap logic
      exec('formatBlock', 'DIV');
      // execCommand formatBlock DIV often works to break out of PRE in some browsers, 
      // but robust unwrap might need manual DOM manipulation if exec fails. 
      // For now, attempting the standard exec approach.
    } else {
      exec('formatBlock', 'PRE');
    }
    checkStyles();
  }, [expanded, exec, checkStyles]);

  // Format HTML with proper indentation
  const formatHTML = useCallback((html: string): string => {
    let formatted = html
      .replace(/></g, '>\n<')
      .replace(/\n\s*\n/g, '\n');

    const lines = formatted.split('\n');
    let indentLevel = 0;

    return lines.map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';

      // Decrease indent for closing tags
      if (trimmed.startsWith('</')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      const indented = '  '.repeat(indentLevel) + trimmed;

      // Increase indent for opening tags (but not self-closing)
      if (trimmed.startsWith('<') &&
        !trimmed.startsWith('</') &&
        !trimmed.endsWith('/>') &&
        !trimmed.includes('</')) {
        indentLevel++;
      }

      return indented;
    }).join('\n');
  }, []);

  // Toggle Code View (HTML source view)
  const toggleCodeView = useCallback(() => {
    if (!isCodeView) {
      // Entering code view - save current HTML
      const activeEditor = expanded ? expandedEditorRef.current : editorRef.current;
      if (!activeEditor) {
        console.warn('Editor ref not available');
        return;
      }
      const currentHTML = activeEditor.innerHTML;
      setHtmlCode(formatHTML(currentHTML));
      setIsCodeView(true);
    } else {
      // Exiting code view - toggle state first, then update content via useEffect
      setIsCodeView(false);
      // Content will be synced after re-render when the contentEditable div is available
    }
  }, [isCodeView, expanded, formatHTML]);

  // Sync HTML code back to editor when exiting code view
  useEffect(() => {
    if (!isCodeView && htmlCode) {
      const activeEditor = expanded ? expandedEditorRef.current : editorRef.current;
      if (activeEditor && activeEditor.innerHTML !== htmlCode) {
        try {
          activeEditor.innerHTML = htmlCode;
          if (!expanded) {
            onChange(htmlCode);
          } else {
            setExpandedContent(htmlCode);
          }
          checkStyles();
        } catch (error) {
          console.error('Failed to apply HTML:', error);
        }
      }
    }
  }, [isCodeView, htmlCode, expanded, onChange, checkStyles]);

  // Keyboard Shortcurts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && expanded) toggleFullscreen();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [expanded]);

  // Render Toolbar Button Helper
  const ToolbarBtn = ({
    icon: Icon,
    active = false,
    onClick,
    title,
    disabled = false
  }: { icon: any, active?: boolean, onClick: (e: any) => void, title: string, disabled?: boolean }) => (
    <button
      onMouseDown={(e) => { e.preventDefault(); if (!disabled) onClick(e); }}
      className={`p-1.5 rounded-md transition-all flex items-center justify-center ${active
        ? 'bg-indigo-100 text-indigo-700 shadow-sm'
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={title}
      disabled={disabled}
      type="button"
    >
      <Icon size={16} strokeWidth={2.5} />
    </button>
  );

  const renderToolbar = (isFull: boolean) => (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-20 select-none">

      {!isCodeView && (
        <>
          {/* Group 1: History */}
          <div className="flex items-center gap-0.5 pr-2 border-r border-slate-300/50">
            <ToolbarBtn icon={RotateCcw} onClick={handleUndo} title="Undo (Ctrl+Z)" disabled={isUndoDisabled} />
            <ToolbarBtn icon={RotateCw} onClick={handleRedo} title="Redo (Ctrl+Y)" disabled={isRedoDisabled} />
          </div>

          {/* Group 2: Text Style */}
          <div className="flex items-center gap-0.5 px-2 border-r border-slate-300/50">
            <div className="relative group">
              <button
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-200 text-xs font-semibold text-slate-700"
                onMouseDown={(e) => { e.preventDefault(); setShowSizePicker(!showSizePicker); }}
              >
                <Type size={14} />
                <ChevronDown size={10} />
              </button>

              {showSizePicker && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 shadow-xl rounded-lg py-1 z-50 min-w-[80px] animate-in fade-in zoom-in-95">
                  {FONT_SIZES.map(s => (
                    <button
                      key={s}
                      className="w-full text-left px-3 py-1.5 hover:bg-indigo-50 text-xs font-medium text-slate-700"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        exec('fontSize', '7', isFull);
                        const sel = window.getSelection();
                        if (sel && sel.rangeCount) {
                          try {
                            const span = document.createElement('span');
                            span.style.fontSize = s;
                            const range = sel.getRangeAt(0);
                            range.surroundContents(span);
                          } catch (err) {
                            console.error('Selection err', err);
                          }
                        }
                        setShowSizePicker(false);
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <ToolbarBtn icon={Bold} active={activeStyles.bold} onClick={() => exec('bold', '', isFull)} title="Bold (Ctrl+B)" />
            <ToolbarBtn icon={Italic} active={activeStyles.italic} onClick={() => exec('italic', '', isFull)} title="Italic (Ctrl+I)" />
            <ToolbarBtn icon={Underline} active={activeStyles.underline} onClick={() => exec('underline', '', isFull)} title="Underline (Ctrl+U)" />
            <ToolbarBtn icon={Strikethrough} active={activeStyles.strikethrough} onClick={() => exec('strikethrough', '', isFull)} title="Strikethrough" />

            <div className="relative">
              <ToolbarBtn
                icon={Palette}
                onClick={() => setShowColorPicker(showColorPicker ? null : 'text')}
                title="Text Color"
                active={!!showColorPicker}
              />
              {showColorPicker && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 shadow-xl rounded-lg p-2 z-50 grid grid-cols-5 gap-1 min-w-[140px]">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      className={`w-5 h-5 rounded-full border border-slate-100 hover:scale-110 transition-transform`}
                      style={{ backgroundColor: c }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        exec(showColorPicker === 'text' ? 'foreColor' : 'backColor', c, isFull);
                        setShowColorPicker(null);
                      }}
                    />
                  ))}
                  <button
                    className="w-full text-[10px] col-span-5 font-bold text-slate-400 hover:text-slate-600 mt-1 uppercase tracking-wide text-center"
                    onMouseDown={() => { setShowColorPicker(showColorPicker === 'text' ? 'bg' : 'text'); }}
                  >
                    Switch to {showColorPicker === 'text' ? 'Highlight' : 'Text'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Group 3: Paragraph */}
          <div className="flex items-center gap-0.5 px-2 border-r border-slate-300/50">
            <ToolbarBtn icon={AlignLeft} active={activeStyles.alignLeft} onClick={() => exec('justifyLeft', '', isFull)} title="Align Left" />
            <ToolbarBtn icon={AlignCenter} active={activeStyles.alignCenter} onClick={() => exec('justifyCenter', '', isFull)} title="Align Center" />
            <ToolbarBtn icon={List} active={activeStyles.ul} onClick={() => exec('insertUnorderedList', '', isFull)} title="Bullet List" />
            <ToolbarBtn icon={ListOrdered} active={activeStyles.ol} onClick={() => exec('insertOrderedList', '', isFull)} title="Numbered List" />
          </div>

          {/* Group 4: Insert */}
          <div className="flex items-center gap-0.5 px-2 border-r border-slate-300/50">
            <ToolbarBtn icon={Link2} onClick={handleLink} title="Insert Link" />
            <ToolbarBtn icon={ImageIcon} onClick={handleImageUpload} title="Insert Image" />
            <ToolbarBtn icon={Table} onClick={insertTable} title="Insert Table" />
            <ToolbarBtn icon={Code} onClick={toggleCodeBlock} title="Code Block" />
            <div className="relative">
              <ToolbarBtn icon={Sigma} onClick={() => setShowMathPicker(!showMathPicker)} title="Insert Math Symbol" active={showMathPicker} />
              {showMathPicker && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 shadow-xl rounded-lg p-2 z-50 grid grid-cols-5 gap-1 min-w-[160px]">
                  {MATH_SYMBOLS.map(sym => (
                    <button
                      key={sym}
                      className="w-7 h-7 flex items-center justify-center rounded hover:bg-indigo-50 text-slate-700 font-serif"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        insertHTML(sym);
                        setShowMathPicker(false);
                      }}
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Group 5: View & Misc */}
      <div className="flex items-center gap-0.5 px-2 ml-auto">
        {!isCodeView && (
          <>
            <ToolbarBtn icon={Eraser} onClick={() => exec('removeFormat', '', isFull)} title="Clear Formatting" />
            <div className="w-px h-4 bg-slate-300/50 mx-1" />
          </>
        )}
        <button
          onMouseDown={(e) => { e.preventDefault(); toggleCodeView(); }}
          className={`px-2 py-1.5 rounded-md transition-all text-xs font-bold ${isCodeView
            ? 'bg-amber-100 text-amber-700 shadow-sm'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
          title={isCodeView ? "Visual Editor" : "Code View"}
          type="button"
        >
          {'</>'}
        </button>
        <div className="w-px h-4 bg-slate-300/50 mx-1" />
        <ToolbarBtn
          icon={isFull ? Minimize2 : Maximize2}
          onClick={toggleFullscreen}
          title={isFull ? "Exit Fullscreen" : "Enter Fullscreen"}
        />
      </div>
    </div>
  );

  const renderContentArea = (ref: React.RefObject<HTMLDivElement>, isFull: boolean) => (
    <div className="relative flex-1 flex flex-col">
      {isCodeView ? (
        // Code View
        <textarea
          value={htmlCode}
          onChange={(e) => setHtmlCode(e.target.value)}
          className={`
            flex-1 w-full outline-none px-6 py-4
            font-mono text-sm leading-relaxed
            bg-slate-900 text-slate-100
            resize-none
          `}
          style={isFull ? {} : { minHeight }}
          spellCheck={false}
          placeholder="<p>Enter HTML code...</p>"
        />
      ) : (
        // Visual Editor
        <div
          ref={ref}
          contentEditable
          className={`
            flex-1 w-full outline-none prose prose-sm max-w-none 
            prose-headings:font-bold prose-headings:text-slate-800 
            prose-p:text-slate-600 prose-p:leading-relaxed
            prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-xl prose-img:shadow-md prose-img:border prose-img:border-slate-100
            px-6 py-4
            ${isFull ? 'bg-white' : 'bg-white rounded-b-xl'}
          `}
          style={isFull ? {} : { minHeight }}
          onInput={(e) => {
            const html = e.currentTarget.innerHTML;
            if (isFull) setExpandedContent(html);
            else {
              onChange(html);
              checkStyles();
            }

            // Save to history after user stops typing for 500ms
            if (historySaveTimerRef.current) clearTimeout(historySaveTimerRef.current);
            historySaveTimerRef.current = setTimeout(() => {
              saveHistory(html);
            }, 500);
          }}
          onBlur={checkStyles}
          onMouseUp={checkStyles}
          onKeyUp={checkStyles}
        />
      )}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      {/* Footer Status Bar */}
      <div className="bg-slate-50 border-t border-slate-100 px-4 py-1.5 flex justify-between items-center text-[10px] font-medium text-slate-400 select-none">
        <div className="flex items-center gap-3">
          <span>{isCodeView ? `${htmlCode.length} chars` : `${wordCount} words`}</span>
          {label && <span className="uppercase tracking-widest font-bold text-indigo-400">{label}</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Ready"></span>
          <span>{isCodeView ? 'HTML Code' : 'Rich Text'}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Fullscreen Modal */}
      {expanded && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full max-w-6xl h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white/20">
            {renderToolbar(true)}
            {renderContentArea(expandedEditorRef, true)}
          </div>
        </div>
      )}

      {/* Inline Editor */}
      <div className={`flex flex-col border border-slate-300 rounded-xl bg-white shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition-all overflow-hidden ${className}`}>
        {renderToolbar(false)}
        {renderContentArea(editorRef, false)}
      </div>
    </>
  );
});

