import React, { useState, useRef } from 'react';
import {
    ArrowLeft, Sparkles, Wand2, Upload, FileText, Image as ImageIcon,
    CheckCircle, AlertTriangle, AlertCircle, X, Loader2, RotateCcw,
    Copy, Download
} from 'lucide-react';
import { geminiService } from '../../services/geminiService';

interface AIProofreaderProps {
    onBack: () => void;
}

interface Segment {
    text: string;
    type: 'text' | 'error' | 'suggestion';
    severity?: 'info' | 'warning' | 'critical';
    message?: string;
    replacement?: string;
}

// Helper to reliably split text by segments without losing any characters
// But here we rely on the AI to return segments. 
// Ideally, we should reconstruct the full text from segments.

export const AIProofreader: React.FC<AIProofreaderProps> = ({ onBack }) => {
    const [file, setFile] = useState<File | null>(null);
    const [originalText, setOriginalText] = useState('');
    const [segments, setSegments] = useState<Segment[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [summary, setSummary] = useState('');
    const [score, setScore] = useState(0);
    const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const uploadedFile = e.target.files[0];
            setFile(uploadedFile);

            // If Text file, read content immediately
            if (uploadedFile.type === 'text/plain') {
                const reader = new FileReader();
                reader.onload = (e) => setOriginalText(e.target?.result as string || '');
                reader.readAsText(uploadedFile);
            }
            // If PDF or Image, we might need OCR (or just send to AI directly later if supported)
            // For this MVP, let's assume text paste or text file if we want reliable splitting
            // Or we treat image as "request OCR"
        }
    };

    const handleAnalyze = async () => {
        if (!originalText.trim() && !file) return;
        setIsAnalyzing(true);
        setActiveSegmentIndex(null);

        try {
            // If we have text, send text
            // If we have image file and no text, we ideally send image to gemini to extract text first or analyze directly
            // For now, let's assume user pasted text or uploaded text file for the "proofreading" core feature
            // If Image, we would use inputMode='image' in geminiService, but our new proofreadContent takes string
            // Let's stick to text analysis for this step as per plan. 
            // NOTE: To support Image, we'd need to extend proofreadContent to accept Part[] or file.
            // Let's assume text input for now or extracted text.

            const result = await geminiService.proofreadContent(originalText);
            setSegments(result.segments);
            setSummary(result.summary);
            setScore(result.score);
        } catch (e) {
            console.error(e);
            alert("Analysis failed. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleFix = (index: number) => {
        const seg = segments[index];
        if (!seg || !seg.replacement) return;

        const newSegments = [...segments];
        newSegments[index] = {
            ...seg,
            text: seg.replacement,
            type: 'text', // Mark as fixed (normal text)
            message: undefined,
            replacement: undefined
        };
        setSegments(newSegments);
        setActiveSegmentIndex(null);
    };

    const handleFixAll = () => {
        const newSegments = segments.map(seg => {
            if (seg.type !== 'text' && seg.replacement) {
                return {
                    ...seg,
                    text: seg.replacement,
                    type: 'text' as const
                };
            }
            return seg;
        });
        setSegments(newSegments);
    };

    const getCombinedText = () => segments.map(s => s.text).join('');

    return (
        <div className="h-screen bg-slate-50 flex flex-col overflow-hidden font-sans">
            {/* Header */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="h-6 w-px bg-slate-200"></div>
                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                        <Sparkles className="text-purple-600" size={20} />
                        AI Proofreader
                    </div>
                </div>

                {segments.length > 0 && (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600">
                            <span>Quality Score:</span>
                            <span className={`${score > 80 ? 'text-green-600' : score > 60 ? 'text-amber-600' : 'text-red-600'}`}>{score}/100</span>
                        </div>
                        <button onClick={handleFixAll} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 shadow-sm">
                            <Wand2 size={14} /> Fix All Issues
                        </button>
                        <button onClick={() => navigator.clipboard.writeText(getCombinedText())} className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all" title="Copy Text">
                            <Copy size={18} />
                        </button>
                    </div>
                )}
            </header>

            {/* Main Content - Split Screen */}
            <main className="flex-1 flex overflow-hidden">

                {/* Left Panel: Input / Source */}
                <div className="w-1/2 border-r border-slate-200 bg-white flex flex-col p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">Source Content</h3>
                        <button onClick={() => setOriginalText('')} className="text-xs font-bold text-slate-400 hover:text-red-500 flex items-center gap-1">
                            <RotateCcw size={12} /> Clear
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col relative group">
                        <textarea
                            className="flex-1 w-full h-full resize-none outline-none text-slate-800 leading-relaxed p-4 bg-slate-50 rounded-2xl border border-transparent focus:bg-white focus:border-purple-200 focus:shadow-inner transition-all placeholder:text-slate-400"
                            placeholder="Paste your text here or upload a file..."
                            value={originalText}
                            onChange={(e) => setOriginalText(e.target.value)}
                            disabled={isAnalyzing}
                        />

                        {!originalText && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 w-3/4 pointer-events-auto cursor-pointer hover:border-purple-400 hover:bg-purple-50/10 transition-all" onClick={() => fileInputRef.current?.click()}>
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4 text-purple-500">
                                        <Upload size={24} />
                                    </div>
                                    <h4 className="font-bold text-slate-700 mb-1">Upload File</h4>
                                    <p className="text-xs text-slate-500">Text, PDF, or Image</p>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept=".txt,.md,.pdf,image/*"
                                        onChange={handleFileUpload}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !originalText.trim()}
                            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                            {isAnalyzing ? 'Analyzing...' : 'Analyze Text'}
                        </button>
                    </div>
                </div>

                {/* Right Panel: AI Results */}
                <div className="w-1/2 bg-slate-50/50 flex flex-col p-6 overflow-hidden">
                    <div className="mb-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">AI Editor</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 leading-loose text-lg text-slate-800">
                        {segments.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-center opacity-40">
                                <div>
                                    <Wand2 size={48} className="mx-auto mb-4 text-slate-300" />
                                    <p className="font-bold text-slate-400">Waiting for analysis...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-x-1">
                                {segments.map((seg, idx) => {
                                    const isError = seg.type === 'error';
                                    const isSuggestion = seg.type === 'suggestion';
                                    const isActive = activeSegmentIndex === idx;

                                    let className = "inline px-1 rounded transition-colors cursor-text ";
                                    if (isError) className += "bg-red-100/50 border-b-2 border-red-400 cursor-pointer hover:bg-red-200 ";
                                    if (isSuggestion) className += "bg-amber-100/50 border-b-2 border-amber-400 cursor-pointer hover:bg-amber-200 ";
                                    if (isActive) className += "ring-2 ring-offset-2 ring-purple-500 z-10 relative ";

                                    return (
                                        <React.Fragment key={idx}>
                                            <span
                                                className={className}
                                                onClick={() => (isError || isSuggestion) && setActiveSegmentIndex(idx)}
                                            >
                                                {seg.text}
                                            </span>

                                            {/* Popover for Fix */}
                                            {isActive && (
                                                <div className="absolute z-50 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 w-72 animate-in zoom-in-95" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)', position: 'fixed' }}>
                                                    <div className="flex items-start gap-3 mb-3">
                                                        <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isError ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                                            {isError ? <AlertCircle size={14} /> : <AlertTriangle size={14} />}
                                                        </div>
                                                        <div>
                                                            <h5 className="font-bold text-sm text-slate-800">{isError ? 'Grammar Error' : 'Suggestion'}</h5>
                                                            <p className="text-xs text-slate-500 mt-1">{seg.message}</p>
                                                        </div>
                                                        <button onClick={() => setActiveSegmentIndex(null)} className="ml-auto text-slate-400 hover:text-slate-600"><X size={14} /></button>
                                                    </div>

                                                    {seg.replacement && (
                                                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Change to:</div>
                                                            <div className="font-medium text-emerald-600 break-words">{seg.replacement}</div>
                                                        </div>
                                                    )}

                                                    <div className="mt-4 flex gap-2">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleFix(idx); }}
                                                            className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all"
                                                        >
                                                            Accept Fix
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setActiveSegmentIndex(null); }}
                                                            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold transition-all"
                                                        >
                                                            Ignore
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {summary && (
                        <div className="mt-4 p-4 bg-white rounded-2xl border border-slate-200 text-sm text-slate-600">
                            <span className="font-bold text-purple-600 mr-2">Analysis Summary:</span>
                            {summary}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
