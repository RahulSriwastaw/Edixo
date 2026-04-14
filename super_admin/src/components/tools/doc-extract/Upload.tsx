"use client";

import React, { useState, forwardRef, useEffect } from 'react';
import { Button } from '@/components/ui/card'; // Button is often in ui/button, checking original imports...
// Actually super_admin usually has button in @/components/ui/button
import { Button as UIButton } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Question } from '../../../lib/tools/doc-extract/types';
import { extractTextFromDocx, extractTextFromPdf, extractMcqsFromText } from '../../../lib/tools/doc-extract/docExtractService';
import { FileUploader } from '../shared/FileUploader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAISettings, AISettings } from '../../../services/aiSettingsService';
import { Sparkles, Brain, Clock, ChevronRight, FileText, CheckCircle2, AlertCircle, Cpu, Zap, Beaker, ShieldCheck } from 'lucide-react';

const ALL_MODELS = [
  { id: 'GEMINI_1_5_FLASH', name: 'Gemini 1.5 Flash', desc: 'Fastest & Reliable', icon: Zap, color: 'text-amber-500' },
  { id: 'GEMINI_1_5_PRO', name: 'Gemini 1.5 Pro', desc: 'Complex Task Master', icon: Sparkles, color: 'text-indigo-500' },
  { id: 'GEMINI_2_0_FLASH', name: 'Gemini 2.0 Flash', desc: 'Next-Gen Speed', icon: Brain, color: 'text-rose-500' },
  { id: 'OPENROUTER_GEMMA_4_26B', name: 'Google Gemma 2', desc: 'High Performance / Free', icon: Cpu, color: 'text-emerald-500' },
  { id: 'MODAL_GLM_5_1', name: 'GLM 5.1 Elite', desc: 'Research Grade Accuracy', icon: Beaker, color: 'text-primary' },
  { id: 'CLAUDE_3_5_SONNET', name: 'Claude 3.5 Sonnet', desc: 'Elite Code & Vision', icon: ShieldCheck, color: 'text-orange-500' },
];

interface UploadProps {
  onExtractionComplete: (questions: Question[], fileName: string) => void;
}

const STAGES = [
  "Initializing AI brain...",
  "Scanning document structure...",
  "Analyzing question patterns...",
  "Extracting high-fidelity data...",
  "Finalizing premium formatting..."
];

export const Upload = forwardRef<HTMLDivElement, UploadProps>(({ onExtractionComplete }, ref) => {
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file');
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(STAGES[0]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState('smart');
  const [availableModels, setAvailableModels] = useState(ALL_MODELS.slice(0, 3));

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const settings = await getAISettings();
        if (settings && settings.top5Models && settings.top5Models.length > 0) {
          const filtered = ALL_MODELS.filter(m => settings.top5Models.includes(m.id));
          setAvailableModels(filtered);
          // Set intelligent default
          setSelectedModel(uploadMode === 'file' ? settings.defaultImageModel : settings.defaultTextModel);
        }
      } catch (e) {
        console.warn("Failed to fetch dynamic models, using defaults");
      }
    };
    fetchModels();
  }, [uploadMode]);

  const handleExtraction = async () => {
    if (uploadMode === 'file' && !file) return;
    if (uploadMode === 'text' && !inputText.trim()) return;
    
    setLoading(true);
    setStatus(null);
    setProgress(5);
    setStage(STAGES[0]);

    try {
      let text = '';
      
      if (uploadMode === 'file' && file) {
        setStage("Reading document content...");
        setProgress(15);
        if (file.name.toLowerCase().endsWith('.docx')) {
            text = await extractTextFromDocx(file);
        } else if (file.name.toLowerCase().endsWith('.pdf')) {
            text = await extractTextFromPdf(file);
        } else {
            throw new Error("Unsupported file format. Please upload .docx or .pdf");
        }
      } else {
        text = inputText;
      }

      setStage(STAGES[1]);
      setProgress(35);
      
      setStage(STAGES[2]);
      setProgress(50);

      setStage(STAGES[3]);
      // The core AI call with selected model
      const questions = await extractMcqsFromText(text, selectedModel);
      
      setProgress(85);

      if (questions.length === 0) {
          throw new Error("No MCQs could be identified in the text. Ensure the content contains questions and options.");
      }

      onExtractionComplete(questions, uploadMode === 'file' && file ? file.name : 'Pasted Text');
      setStage(STAGES[4]);
      setProgress(100);
    } catch (error: any) {
      console.error('Extraction failed:', error);
      setStatus(`Extraction failed: ${error.message || 'Please try again.'}`);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  return (
    <div className="space-y-8" ref={ref}>
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white/50 p-6 rounded-[2rem] border border-slate-200/50 backdrop-blur-sm shadow-xl shadow-slate-200/20">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
             <Brain className="w-6 h-6 text-white" />
           </div>
           <div className="space-y-0.5">
             <h3 className="font-black text-slate-900 leading-tight">AI Settings</h3>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Configure Extraction Engine</p>
           </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
            <button 
              className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${uploadMode === 'file' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              onClick={() => setUploadMode('file')}
            >
              FILE
            </button>
            <button 
              className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${uploadMode === 'text' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              onClick={() => setUploadMode('text')}
            >
              TEXT
            </button>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden md:block" />

          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-full md:w-[240px] h-11 rounded-xl bg-white border-slate-200 font-bold text-slate-700 shadow-sm focus:ring-primary/10">
              <div className="flex items-center gap-2">
                {selectedModel === 'smart' ? (
                   <div className="text-primary flex items-center gap-2">
                     <Brain className="w-4 h-4" />
                     <span>Auto-Detect AI</span>
                   </div>
                ) : (
                  <>
                    {availableModels.find(m => m.id === selectedModel)?.icon && (
                      <div className={availableModels.find(m => m.id === selectedModel)?.color}>
                        {React.createElement(availableModels.find(m => m.id === selectedModel)!.icon, { className: "w-4 h-4" })}
                      </div>
                    )}
                    <SelectValue />
                  </>
                )}
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
              <SelectItem value="smart" className="rounded-xl py-3 focus:bg-primary/5 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-primary bg-slate-50 border border-slate-100">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-sm">Auto-Detect AI</span>
                      <span className="text-[10px] text-slate-400 font-medium">Global Settings Default</span>
                    </div>
                  </div>
              </SelectItem>
              {availableModels.map((model) => (
                <SelectItem key={model.id} value={model.id} className="rounded-xl py-3 focus:bg-primary/5 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${model.color} bg-slate-50 border border-slate-100`}>
                      <model.icon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-sm">{model.name}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{model.desc}</span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {uploadMode === 'file' ? (
        <FileUploader 
          onFilesSelected={(files) => setFile(files instanceof FileList ? files[0] : files[0])}
          isLoading={loading}
          className={file ? "border-primary/20 bg-primary/5" : ""}
        />
      ) : (
        <div className="relative group">
          <textarea
            className="w-full h-64 p-6 bg-white border-2 border-slate-100 rounded-3xl outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all text-slate-700 leading-relaxed shadow-sm"
            placeholder="Paste your exam text here... (e.g. Q1. Question text? A) Opt 1 B) Opt 2...)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <div className="absolute top-4 right-4 animate-pulse opacity-50 group-hover:opacity-100 transition-opacity">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
        </div>
      )}

      {loading && (
        <div className="space-y-6 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-2xl shadow-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary animate-pulse" />
              </div>
              <span className="font-bold text-slate-900 truncate max-w-[200px]">{stage}</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-primary">{progress}%</span>
            </div>
          </div>
          
          <Progress value={progress} className="h-4 rounded-full bg-slate-100" />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Est. Time</span>
              </div>
              <p className="text-lg font-black text-slate-900">
                {timeLeft ? `${timeLeft}s` : 'Calculating...'}
              </p>
            </div>
            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Processing</span>
              </div>
              <p className="text-lg font-black text-slate-900">
                AI Engine Active
              </p>
            </div>
          </div>
        </div>
      )}

      {status && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 font-bold text-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          {status}
        </div>
      )}

      <div className="flex justify-center pt-4">
        <UIButton 
          size="lg"
          onClick={handleExtraction}
          disabled={loading || (uploadMode === 'file' && !file) || (uploadMode === 'text' && !inputText)}
          className="px-10 py-7 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1 active:translate-y-0 disabled:bg-slate-200 disabled:shadow-none"
        >
          {loading ? 'Processing...' : 'Start Smart Extraction'}
          <ChevronRight className="ml-2 w-5 h-5" />
        </UIButton>
      </div>
    </div>
  );
});

Upload.displayName = 'Upload';
export default Upload;
