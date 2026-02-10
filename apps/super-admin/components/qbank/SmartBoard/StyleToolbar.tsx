import React, { useRef, useEffect } from 'react';
import { useBoardStore } from './store';
import { Move, Upload, Image as ImageIcon, X, ChevronDown, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, RotateCcw } from 'lucide-react';

interface StyleToolbarProps {
  onClose: () => void;
}

export const StyleToolbar: React.FC<StyleToolbarProps> = ({ onClose }) => {
  const {
    questionStyle, setQuestionStyle,
    boardBackgroundColor, setBoardBackgroundColor,
    boardBackgroundImage, setBoardBackgroundImage,
    boardOpacity, setBoardOpacity
  } = useBoardStore();

  const toolbarRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | PointerEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside, true);
      document.addEventListener('pointerdown', handleClickOutside, true);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('pointerdown', handleClickOutside, true);
    };
  }, [onClose]);

  const colors = ['#ffffff', '#000000', '#1e293b', '#334155', '#475569', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#0A0C10', '#151921'];

  const fonts = [
    { name: 'Mukta', value: 'Mukta' },
    { name: 'Poppins', value: 'Poppins' },
    { name: 'Noto Sans', value: 'Noto Sans Devanagari' },
    { name: 'Tiro Hindi', value: 'Tiro Devanagari Hindi' },
    { name: 'Hind', value: 'Hind' },
    { name: 'Inter', value: 'Inter' },
    { name: 'Sans', value: 'sans-serif' },
    { name: 'Serif', value: 'serif' },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBoardBackgroundImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      ref={toolbarRef}
      className="bg-[#1e1e1e] border border-white/10 p-4 rounded-xl shadow-2xl mb-2 w-80 max-w-[90vw] animate-in slide-in-from-bottom-2 fade-in duration-200 pointer-events-auto max-h-[60vh] overflow-y-auto custom-scrollbar"
    >
      <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Style Settings</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-6">

        {/* Typography Section */}
        <div className="space-y-3">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-1">Typography</div>

          {/* Font Size */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Size</span>
              <span className="font-mono text-blue-400">{questionStyle.fontSize}px</span>
            </div>
            <input
              type="range"
              min="12"
              max="72"
              value={questionStyle.fontSize}
              onChange={(e) => setQuestionStyle({ fontSize: Number(e.target.value) })}
              className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Font Family */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">Font Family</div>
            <div className="relative">
              <select
                value={questionStyle.fontFamily}
                onChange={(e) => setQuestionStyle({ fontFamily: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer transition-colors hover:bg-white/10"
                style={{ fontFamily: questionStyle.fontFamily }}
              >
                {fonts.map(f => (
                  <option key={f.value} value={f.value} className="bg-slate-900 text-slate-200 py-2" style={{ fontFamily: f.value }}>
                    {f.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          {/* Text Color */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">Color</div>
            <div className="grid grid-cols-7 gap-1.5">
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => setQuestionStyle({ color: c })}
                  className={`w-5 h-5 rounded-full border transition-transform ${questionStyle.color === c ? 'border-white scale-110 shadow-lg' : 'border-white/10 hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* Formatting (Bold/Italic/Underline) */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">Formatting</div>
            <div className="flex gap-2">
              <button
                onClick={() => setQuestionStyle({ fontWeight: questionStyle.fontWeight === 'bold' ? 'normal' : 'bold' })}
                className={`flex-1 p-2 rounded-lg border flex items-center justify-center transition-all ${questionStyle.fontWeight === 'bold' ? 'bg-blue-600 border-blue-600 text-white' : 'border-white/10 text-slate-400 hover:bg-white/5'}`}
              >
                <Bold size={16} />
              </button>
              <button
                onClick={() => setQuestionStyle({ fontStyle: questionStyle.fontStyle === 'italic' ? 'normal' : 'italic' })}
                className={`flex-1 p-2 rounded-lg border flex items-center justify-center transition-all ${questionStyle.fontStyle === 'italic' ? 'bg-blue-600 border-blue-600 text-white' : 'border-white/10 text-slate-400 hover:bg-white/5'}`}
              >
                <Italic size={16} />
              </button>
              <button
                onClick={() => setQuestionStyle({ textDecoration: questionStyle.textDecoration === 'underline' ? 'none' : 'underline' })}
                className={`flex-1 p-2 rounded-lg border flex items-center justify-center transition-all ${questionStyle.textDecoration === 'underline' ? 'bg-blue-600 border-blue-600 text-white' : 'border-white/10 text-slate-400 hover:bg-white/5'}`}
              >
                <Underline size={16} />
              </button>
            </div>
          </div>

          {/* Text Opacity */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Opacity</span>
              <span className="font-mono text-blue-400">{Math.round((questionStyle.textOpacity || 1) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={questionStyle.textOpacity ?? 1}
              onChange={(e) => setQuestionStyle({ textOpacity: Number(e.target.value) })}
              className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Alignment & Line Height */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="text-xs text-slate-400 mb-1">Align</div>
              <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10">
                {(['left', 'center', 'right'] as const).map(align => (
                  <button
                    key={align}
                    onClick={() => setQuestionStyle({ textAlign: align })}
                    className={`flex-1 p-1.5 flex items-center justify-center rounded-md transition-all ${questionStyle.textAlign === align ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    {align === 'left' ? <AlignLeft size={14} /> : align === 'center' ? <AlignCenter size={14} /> : <AlignRight size={14} />}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Height</span>
                <span className="font-mono text-blue-400">{questionStyle.lineHeight}</span>
              </div>
              <input
                type="range"
                min="1"
                max="2.5"
                step="0.1"
                value={questionStyle.lineHeight || 1.5}
                onChange={(e) => setQuestionStyle({ lineHeight: Number(e.target.value) })}
                className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-blue-500 mt-2"
              />
            </div>
          </div>
        </div>

        {/* Card Styling */}
        <div className="space-y-3">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-1">Card Styling (Question & Explanation)</div>

          {/* Card Background */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">Background</div>
            <div className="grid grid-cols-7 gap-1.5">
              <button
                onClick={() => setQuestionStyle({ backgroundColor: 'transparent' })}
                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-transform ${questionStyle.backgroundColor === 'transparent' ? 'border-white scale-110 shadow-lg' : 'border-white/10 hover:scale-110'}`}
                title="Transparent"
              >
                <div className="w-full h-0.5 bg-red-500 rotate-45" />
              </button>
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => setQuestionStyle({ backgroundColor: c })}
                  className={`w-5 h-5 rounded-full border transition-transform ${questionStyle.backgroundColor === c ? 'border-white scale-110 shadow-lg' : 'border-white/10 hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* Card Opacity */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Opacity</span>
              <span className="font-mono text-blue-400">{Math.round((questionStyle.cardOpacity || 1) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={questionStyle.cardOpacity ?? 1}
              onChange={(e) => setQuestionStyle({ cardOpacity: Number(e.target.value) })}
              className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>

        {/* Board Background */}
        <div className="space-y-3">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-1">Board Background</div>

          {/* Color Picker */}
          <div className="grid grid-cols-7 gap-1.5">
            {colors.map(c => (
              <button
                key={c}
                onClick={() => { setBoardBackgroundColor(c); setBoardBackgroundImage(null); }}
                className={`w-5 h-5 rounded-full border transition-transform ${boardBackgroundColor === c && !boardBackgroundImage ? 'border-white scale-110 shadow-lg' : 'border-white/10 hover:scale-110'}`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>

          {/* Image Upload */}
          <div className="flex gap-2">
            <label className="flex-1 cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-2 flex items-center justify-center gap-2 text-xs text-slate-300 transition-all">
              <Upload size={14} />
              <span>Upload Image</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            {boardBackgroundImage && (
              <button
                onClick={() => setBoardBackgroundImage(null)}
                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition-all"
                title="Remove Image"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Board Opacity */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Background Opacity</span>
              <span className="font-mono text-blue-400">{Math.round((boardOpacity || 1) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={boardOpacity ?? 1}
              onChange={(e) => setBoardOpacity(Number(e.target.value))}
              className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>

        {/* Actions (Reset) */}
        <div className="pt-2 border-t border-white/10 flex gap-2">
          <button
            onClick={() => setQuestionStyle({
              position: { x: 0, y: 0 },
              explanationPosition: { x: 50, y: 50 },
              explanationSize: { width: 800, height: 600 }
            })}
            className="flex-1 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg flex items-center justify-center gap-2 transition-colors border border-white/5"
          >
            <Move size={14} /> Reset Pos
          </button>
          <button
            onClick={() => setQuestionStyle({
              fontSize: 16,
              color: '#ffffff',
              fontFamily: 'sans-serif',
              backgroundColor: 'rgba(21, 25, 33, 0.8)',
              textOpacity: 1,
              cardOpacity: 0.9,
              textAlign: 'left',
              lineHeight: 1.5,
              fontWeight: 'normal',
              fontStyle: 'normal',
              textDecoration: 'none'
            })}
            className="flex-1 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg flex items-center justify-center gap-2 transition-colors border border-white/5"
            title="Reset to Default Styles"
          >
            <RotateCcw size={14} /> Reset Format
          </button>
        </div>

      </div>
    </div>
  );
};
