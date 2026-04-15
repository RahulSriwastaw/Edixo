"use client";

import React, { useState, forwardRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button as UIButton } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Question } from '../../../lib/tools/doc-extract/types';
import { extractTextFromDocx, extractTextFromPdf, extractMcqsFromText } from '../../../lib/tools/doc-extract/docExtractService';
import { FileUploader } from '../shared/FileUploader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAISettings, AISettings } from '../../../services/aiSettingsService';
import { Sparkles, Brain, Clock, ChevronRight, FileText, CheckCircle2, AlertCircle, Cpu, Zap, Beaker, ShieldCheck } from 'lucide-react';

const ALL_MODELS = [
  { id: 'GEMINI_3_1_PRO_PREVIEW', name: 'Gemini 3.1 Pro (Preview)', desc: 'Next-Gen Flagship Reasoning', icon: Sparkles, color: 'text-indigo-600' },
  { id: 'GEMINI_3_FLASH_PREVIEW', name: 'Gemini 2.0 Flash', desc: 'Supercharged Speed & Logic', icon: Zap, color: 'text-amber-500' },
  { id: 'GEMINI_3_1_FLASH_LITE_PREVIEW', name: 'Gemini 3.1 Flash Lite', desc: 'Maximum Efficiency', icon: Brain, color: 'text-rose-500' },
  { id: 'GEMINI_PRO_LATEST', name: 'Gemini Pro (Latest)', desc: 'Stable High-Perf Reasoning', icon: ShieldCheck, color: 'text-primary' },
  { id: 'GEMINI_FLASH_LATEST', name: 'Gemini Flash (Latest)', desc: 'Stable Multi-modal Fast', icon: Cpu, color: 'text-emerald-500' },
  { id: 'GEMINI_FLASH_LITE_LATEST', name: 'Gemini Flash Lite (Latest)', desc: 'Optimized Speed & Cost', icon: Zap, color: 'text-slate-500' },
  { id: 'GEMINI_2_0_FLASH', name: 'Gemini 2.0 Flash (Stable)', desc: 'Proven Speed', icon: Brain, color: 'text-rose-500' },
  { id: 'GEMINI_1_5_PRO', name: 'Gemini 1.5 Pro', desc: 'Reliable Complex Task Master', icon: Sparkles, color: 'text-indigo-400' },
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
    <div className="space-y-5" ref={ref}>
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <div className="flex bg-white border border-slate-200 p-0.5 rounded-lg shadow-sm">
            <button
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                uploadMode === 'file' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
              onClick={() => setUploadMode('file')}
            >
              FILE
            </button>
            <button
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                uploadMode === 'text' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
              onClick={() => setUploadMode('text')}
            >
              TEXT
            </button>
          </div>
        </div>

        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger className="w-full md:w-[220px] h-9 rounded-lg bg-white border-slate-200 font-bold text-slate-700 text-xs shadow-sm focus:ring-primary/10">
            <div className="flex items-center gap-2">
              {selectedModel === 'smart' ? (
                <div className="text-primary flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5" />
                  <span>Auto-Detect AI</span>
                </div>
              ) : (
                <>
                  {availableModels.find(m => m.id === selectedModel)?.icon && (
                    <div className={availableModels.find(m => m.id === selectedModel)?.color}>
                      {React.createElement(availableModels.find(m => m.id === selectedModel)!.icon, { className: "w-3.5 h-3.5" })}
                    </div>
                  )}
                  <SelectValue />
                </>
              )}
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-xl border-none shadow-2xl p-1.5">
            <SelectItem value="smart" className="rounded-lg py-2.5 focus:bg-primary/5 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-primary bg-slate-50 border border-slate-100">
                    <Brain className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 text-xs">Auto-Detect AI</span>
                    <span className="text-[10px] text-slate-400 font-medium">Global Settings Default</span>
                  </div>
                </div>
            </SelectItem>
            {availableModels.map((model) => (
              <SelectItem key={model.id} value={model.id} className="rounded-lg py-2.5 focus:bg-primary/5 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${model.color} bg-slate-50 border border-slate-100`}>
                    <model.icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 text-xs">{model.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{model.desc}</span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
        <div className="space-y-4 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Brain className="w-4 h-4 text-primary animate-pulse" />
              </div>
              <span className="font-bold text-sm text-slate-800 truncate max-w-[220px]">{stage}</span>
            </div>
            <span className="text-xl font-black text-primary">{progress}%</span>
          </div>
          
          <Progress value={progress} className="h-2 rounded-full bg-slate-100" />
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Est. Time</span>
              </div>
              <p className="text-sm font-black text-slate-900">
                {timeLeft ? `${timeLeft}s` : 'Calculating...'}
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Engine</span>
              </div>
              <p className="text-sm font-black text-slate-900">AI Active</p>
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

      <div className="flex justify-end pt-2">
        <UIButton 
          size="lg"
          onClick={handleExtraction}
          disabled={loading || (uploadMode === 'file' && !file) || (uploadMode === 'text' && !inputText)}
          className="px-8 h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all disabled:bg-slate-200 disabled:shadow-none"
        >
          {loading ? 'Processing...' : 'Start Smart Extraction'}
          <ChevronRight className="ml-2 w-4 h-4" />
        </UIButton>
      </div>
    </div>
  );
});

Upload.displayName = 'Upload';
export default Upload;
