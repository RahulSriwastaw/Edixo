import React, { useCallback, useState } from 'react';
import { Upload, FileText, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploaderProps {
  onFilesSelected: (files: FileList | null) => void;
  isLoading: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelected, isLoading }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFiles = (files: FileList | File[]): boolean => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const filesArray = Array.from(files);
    for (const file of filesArray) {
      if (!allowedTypes.includes(file.type)) {
        setError(`Invalid file type: ${file.name}. Only PDF and images (JPG, PNG) are allowed.`);
        return false;
      }
    }
    setError(null);
    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (isLoading) return;
    const files = e.dataTransfer.files;
    if (files && validateFiles(files)) {
      onFilesSelected(files);
    }
  }, [isLoading, onFilesSelected]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLoading) return;
    const files = e.target.files;
    if (files && validateFiles(files)) {
      onFilesSelected(files);
    }
  };

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    if (isLoading) return;
    const items = e.clipboardData.items;
    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const file = items[i].getAsFile();
      if (file) {
        files.push(file);
      }
    }
    if (files.length > 0) {
      if (validateFiles(files)) {
        const dataTransfer = new DataTransfer();
        files.forEach(file => dataTransfer.items.add(file));
        onFilesSelected(dataTransfer.files);
      }
    }
  }, [isLoading, onFilesSelected]);

  return (
    <div className="w-full" onPaste={handlePaste}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative group border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 ease-in-out ${
          isDragActive
            ? 'border-brand-primary bg-orange-50/40 scale-[1.01]'
            : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-white'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <input
          type="file"
          id="fileInput"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          multiple
          onChange={handleChange}
          disabled={isLoading}
        />
        <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-sm ${
            isDragActive
              ? 'bg-brand-primary text-white scale-110 shadow-orange-200'
              : 'bg-white text-slate-400 border border-slate-200 group-hover:border-slate-300 group-hover:text-slate-600'
          }`}>
            <Upload className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-semibold text-slate-800 tracking-tight">
              {isDragActive ? 'Release to upload' : 'Drop your documents here'}
            </h3>
            <p className="text-slate-500 text-sm">
              or <span className="text-brand-primary font-semibold hover:underline">browse your files</span>
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Paste with{' '}
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-600 font-mono text-[10px] shadow-sm">Ctrl+V</kbd>
              {' '}or{' '}
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-600 font-mono text-[10px] shadow-sm">⌘V</kbd>
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 shadow-sm">
              <FileText className="w-3.5 h-3.5 text-red-400" />
              PDF
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 shadow-sm">
              <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
              JPG / PNG
            </div>
            <span className="text-xs text-slate-400 font-medium">· Max 50 MB</span>
          </div>
        </label>

        <AnimatePresence>
          {isDragActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-orange-500/5 rounded-2xl pointer-events-none border-2 border-brand-primary/30"
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Feature pills */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          { title: 'Hindi & English', desc: 'Full bilingual support', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
          { title: 'Math Formulas', desc: 'Accurate LaTeX conversion', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
          { title: 'Editable Word', desc: 'Professional DOCX output', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' }
        ].map((feature, i) => (
          <div key={i} className={`p-3 rounded-xl border ${feature.bg} flex flex-col gap-0.5`}>
            <h4 className={`font-semibold text-xs ${feature.color}`}>{feature.title}</h4>
            <p className="text-slate-500 text-[11px]">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileUploader;
