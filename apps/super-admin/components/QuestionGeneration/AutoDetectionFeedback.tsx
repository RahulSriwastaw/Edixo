import React from 'react';
import { Sparkles, FileText, Link, Image, File, Loader2 } from 'lucide-react';
import { InputMode, InputData } from './InputPanel';

interface AutoDetectionFeedbackProps {
  mode: InputMode;
  data: InputData;
  detectedTopic: string;
  isAnalysing?: boolean;
}

export const AutoDetectionFeedback: React.FC<AutoDetectionFeedbackProps> = ({ mode, data, detectedTopic, isAnalysing = false }) => {
  if (!mode) return null;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={14} className="text-primary" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          AI Context Detection
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm">
          {mode === 'text' && <FileText size={20} />}
          {mode === 'url' && <Link size={20} />}
          {mode === 'image' && <Image size={20} />}
          {mode === 'pdf' && <File size={20} />}
        </div>

        <div className="flex-1">
          <h4 className="text-sm font-bold text-slate-700">
            {mode === 'text' && data.text && data.text.length < 100 && 'Topic Focus'}
            {mode === 'text' && data.text && data.text.length >= 100 && 'Context Analysis'}
            {mode === 'url' && 'Web Content Analysis'}
            {mode === 'image' && 'Visual Analysis'}
            {mode === 'pdf' && 'Document Analysis'}
          </h4>

          <p className="text-xs text-slate-500 font-medium truncate max-w-[300px]">
            {mode === 'text' && data.text && data.text.length < 100 && (
              <span className="text-primary">{data.text}</span>
            )}
            {mode === 'text' && data.text && data.text.length >= 100 && (
              <span>Processing {data.text.length} characters of source text</span>
            )}
            {mode === 'url' && (
              <a href={data.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                {data.url}
              </a>
            )}
            {(mode === 'image' || mode === 'pdf') && data.files && (
              <span>Analyzing {data.files.length} file(s)</span>
            )}
          </p>
        </div>

        {/* Status Indicator */}
        {/* Status Indicator */}
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${isAnalysing ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
          {isAnalysing ? (
            <>
              <Loader2 size={10} className="animate-spin" />
              Analyzing...
            </>
          ) : (
            'Ready to Generate'
          )}
        </div>
      </div>
    </div>
  );
};
