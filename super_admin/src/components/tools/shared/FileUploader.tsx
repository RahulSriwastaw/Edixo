"use client";

import React, { useCallback, useState } from 'react';
import { Upload, FileText, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  onFilesSelected: (files: FileList | File[]) => void;
  isLoading: boolean;
  acceptedTypes?: string[];
  maxSizeMB?: number;
  className?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ 
  onFilesSelected, 
  isLoading, 
  acceptedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
  maxSizeMB = 50,
  className
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFiles = (files: FileList | File[]): boolean => {
    const filesArray = Array.from(files);
    for (const file of filesArray) {
      if (!acceptedTypes.includes(file.type)) {
        setError(`Invalid file type: ${file.name}. Only PDF and images (JPG, PNG) are allowed.`);
        return false;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File too large: ${file.name}. Max size is ${maxSizeMB}MB.`);
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
      if (file) files.push(file);
    }
    if (files.length > 0) {
      if (validateFiles(files)) onFilesSelected(files);
    }
  }, [isLoading, onFilesSelected]);

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)} onPaste={handlePaste}>
      <motion.div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative group border-2 border-dashed rounded-3xl p-8 md:p-12 text-center transition-all duration-300",
          isDragActive 
            ? 'border-primary bg-primary/5 scale-[1.01] shadow-2xl shadow-primary/10' 
            : 'border-slate-200 bg-white hover:border-primary/50 hover:bg-slate-50/50',
          isLoading && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          type="file"
          id="fileInput"
          className="hidden"
          accept={acceptedTypes.join(',')}
          multiple
          onChange={handleChange}
          disabled={isLoading}
        />
        <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-6">
          <div className={cn(
            "w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center transition-all duration-300",
            isDragActive ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30' : 'bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'
          )}>
            <Upload className="w-8 h-8 md:w-10 md:h-10" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl md:text-2xl font-bold text-slate-900">
              {isDragActive ? "Release to upload" : "Upload your documents"}
            </h3>
            <p className="text-slate-500 text-base md:text-lg">
              Drag and drop or <span className="text-primary font-semibold hover:underline">browse files</span>
            </p>
            <p className="text-slate-400 text-sm mt-3">
              Press <kbd className="px-2 py-1 bg-slate-100 border rounded text-xs font-mono">Ctrl+V</kbd> to paste images
            </p>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-sm font-medium text-slate-600">
              <FileText className="w-4 h-4" /> PDF
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-sm font-medium text-slate-600">
              <ImageIcon className="w-4 h-4" /> Images
            </div>
          </div>
        </label>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl text-sm font-medium"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
