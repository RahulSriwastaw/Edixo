import React, { useState, useEffect } from 'react';
import { FileText, Image as ImageIcon, File as FileIcon, Link as LinkIcon, Upload, AlertCircle, X, CheckCircle, Trash2 } from 'lucide-react';

export type InputMode = 'text' | 'image' | 'pdf' | 'url';

export interface InputData {
  text?: string;
  files?: File[];
  url?: string;
}

interface InputPanelProps {
  onInputChange: (mode: InputMode, data: InputData) => void;
  className?: string;
  onGenerate?: () => void;
  isGenerating?: boolean;
}

export const InputPanel: React.FC<InputPanelProps> = ({ onInputChange, className = '', onGenerate, isGenerating }) => {
  const [activeMode, setActiveMode] = useState<InputMode>('text');
  const [textData, setTextData] = useState('');
  const [urlData, setUrlData] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  useEffect(() => {
    // Notify parent of changes
    onInputChange(activeMode, {
      text: textData,
      url: urlData,
      files: uploadedFiles
    });
  }, [activeMode, textData, urlData, uploadedFiles, onInputChange]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    // Filter based on mode
    const validFiles = files.filter(file => {
      if (activeMode === 'image') return file.type.startsWith('image/');
      if (activeMode === 'pdf') return file.type === 'application/pdf' || file.name.endsWith('.docx');
      return false;
    });

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const renderTab = (mode: InputMode, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => {
        setActiveMode(mode);
        setUploadedFiles([]); // Clear files when switching modes for now
      }}
      className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${activeMode === mode
        ? 'border-primary text-primary bg-primary/5'
        : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
        }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}>
      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {renderTab('text', 'Text', <FileText size={16} />)}
        {renderTab('image', 'Image', <ImageIcon size={16} />)}
        {renderTab('pdf', 'Document', <FileIcon size={16} />)}
        {renderTab('url', 'URL', <LinkIcon size={16} />)}
      </div>

      {/* Content Area */}
      <div className="p-6">
        {activeMode === 'text' && (
          <div className="animate-in fade-in duration-300">
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Source Text / Topic</label>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                  {textData.length} chars
                </span>
              </div>

              <div className="relative group">
                <textarea
                  value={textData}
                  onChange={(e) => setTextData(e.target.value)}
                  className="w-full min-h-[200px] p-5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all resize-y text-sm leading-relaxed text-slate-700 placeholder:text-slate-400 outline-none shadow-sm hover:bg-white hover:border-slate-300"
                  placeholder="Type a topic (e.g., 'Solar System') or paste your study material here..."
                  spellCheck={false}
                />
                <div className="absolute bottom-4 right-4 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity">
                  <div className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-md">
                    Typing...
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 font-medium px-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
                The AI will analyze this text to generate relevant questions.
              </p>

              {textData.length > 50 && onGenerate && (
                <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                  <button
                    onClick={onGenerate}
                    disabled={isGenerating}
                    className="w-full py-3 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-primary hover:to-indigo-600 text-white rounded-xl font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Generating Questions...</span>
                      </>
                    ) : (
                      <>
                        <span className="group-hover:scale-110 transition-transform">✨</span>
                        <span>Generate Questions Now</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {(activeMode === 'image' || activeMode === 'pdf') && (
          <div className="animate-in fade-in duration-300">
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 transition-all text-center ${dragActive
                ? 'border-primary bg-primary/5 scale-[0.99]'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileInput}
                accept={activeMode === 'image' ? "image/*" : "application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
              />

              <div className="pointer-events-none">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Upload size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-1">
                  {activeMode === 'image' ? 'Drop images here' : 'Drop PDF/Word here'}
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  or click to browse
                </p>
                <p className="text-xs text-slate-400 mt-4">
                  {activeMode === 'image' ? 'Supports JPG, PNG, WEBP' : 'Supports PDF, DOCX up to 50MB'}
                </p>
              </div>
            </div>

            {/* File List */}
            {uploadedFiles.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Uploaded Files ({uploadedFiles.length})
                </h4>
                <div className="space-y-2">
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100 group">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-100 text-slate-500 shadow-sm">
                        {activeMode === 'image' ? <ImageIcon size={20} /> : <FileIcon size={20} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-700 truncate">{file.name}</p>
                        <p className="text-[10px] font-medium text-slate-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={() => removeFile(idx)}
                        className="p-2 text-slate-400 hover:text-error hover:bg-error/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="text-emerald-500">
                        <CheckCircle size={16} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeMode === 'url' && (
          <div className="animate-in fade-in duration-300">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">
                  Target URL
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <LinkIcon size={16} />
                    </div>
                    <input
                      type="url"
                      value={urlData}
                      onChange={(e) => setUrlData(e.target.value)}
                      placeholder="https://example.com/article"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <button className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">
                    Fetch
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle size={18} className="text-blue-600 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed font-medium">
                  <strong>Note:</strong> Content behind login walls or paywalls cannot be accessed. Ensure the URL is publicly accessible.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
