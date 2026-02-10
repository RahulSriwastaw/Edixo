import React, { useState } from 'react';
import { ArrowLeft, Presentation, Download, LayoutTemplate, Layers, Play } from 'lucide-react';
import { InputPanel, InputMode, InputData } from '../../QuestionGeneration/InputPanel';
import { pptService, PPTTemplate, GeneratedSlide } from '../../../services/pptService';
import mammoth from 'mammoth';

interface PPTGeneratorProps {
    onBack: () => void;
}

export const PPTGenerator: React.FC<PPTGeneratorProps> = ({ onBack }) => {
    const [step, setStep] = useState<'input' | 'preview'>('input');
    const [isProcessing, setIsProcessing] = useState(false);
    const [slides, setSlides] = useState<GeneratedSlide[]>([]);
    const [template, setTemplate] = useState<PPTTemplate>('classic');

    const handleProcess = async (mode: InputMode, data: InputData) => {
        setIsProcessing(true);
        try {
            let content = mode === 'text' ? data.text || '' : '';

            // Handle File Inputs (Word/PDF)
            if (mode === 'pdf' && data.files && data.files.length > 0) {
                for (const file of data.files) {
                    if (file.name.endsWith('.docx')) {
                        const arrayBuffer = await file.arrayBuffer();
                        const result = await mammoth.extractRawText({ arrayBuffer });
                        content += `\n\n--- Content from ${file.name} ---\n${result.value}`;
                    } else {
                        // For PDF, we'd ideally use pdf.js (out of scope for quick MVP, trusting generic text for now)
                        content += `\n\n[Attached File: ${file.name}]`;
                    }
                }
            }

            // 1. Generate Outline & Content via AI
            const generatedSlides = await pptService.generateSlides(content);
            setSlides(generatedSlides);
            setStep('preview');

        } catch (error: any) {
            console.error("PPT Generation failed:", error);
            alert("Failed to generate presentation: " + error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleExport = async () => {
        try {
            await pptService.createPPTX(slides, template);
        } catch (error) {
            console.error(error);
            alert("Export failed");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">AI PPT Generator</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Topic to Slides in Seconds</p>
                    </div>
                </div>
            </div>

            <div className="p-6 max-w-7xl mx-auto w-full flex-1 flex flex-col">
                {step === 'input' && (
                    <div className="flex flex-col items-center justify-center flex-1 max-w-3xl mx-auto w-full animate-in fade-in">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-orange-100 shadow-sm">
                                <Presentation size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 mb-2">Create Your Presentation</h2>
                            <p className="text-slate-500 max-w-md mx-auto mb-6">Enter a topic or upload notes. We'll design the slides for you.</p>
                        </div>
                        <div className="w-full bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                            <InputPanelWrapper onProcess={handleProcess} isProcessing={isProcessing} />
                        </div>
                    </div>
                )}

                {step === 'preview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in">
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <label className="text-xs font-bold text-slate-400 uppercase block mb-3">Template</label>
                                <div className="space-y-2">
                                    {['classic', 'modern', 'creative'].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setTemplate(t as any)}
                                            className={`w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center justify-between
                                                ${template === t ? 'bg-orange-50 border-orange-500 text-orange-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}
                                            `}
                                        >
                                            <span className="text-sm font-bold capitalize">{t}</span>
                                            {template === t && <LayoutTemplate size={14} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button onClick={handleExport} className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg flex items-center justify-center gap-3">
                                <Download size={18} /> Download PPTX
                            </button>
                        </div>

                        <div className="lg:col-span-3 space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Layers size={18} /> Generated Slides ({slides.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {slides.map((slide, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-xs font-black text-slate-300">#{idx + 1}</span>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">{slide.layout}</span>
                                        </div>
                                        <h4 className="font-bold text-slate-900 mb-2">{slide.title}</h4>
                                        <div className="space-y-1">
                                            {slide.content.map((point, i) => (
                                                <p key={i} className="text-xs text-slate-600 leading-relaxed">• {point}</p>
                                            ))}
                                            {slide.visualSuggestion && (
                                                <div className="mt-4 p-2 bg-blue-50 text-blue-600 text-[10px] font-bold rounded border border-blue-100 flex items-center gap-2">
                                                    <span>🖼️ AI Suggestion:</span> {slide.visualSuggestion}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const InputPanelWrapper = ({ onProcess, isProcessing }: { onProcess: (m: InputMode, d: InputData) => void, isProcessing: boolean }) => {
    const [mode, setMode] = useState<InputMode>('text');
    const [data, setData] = useState<InputData>({});

    const handleInputChange = React.useCallback((m: InputMode, d: InputData) => {
        setMode(m);
        setData(d);
    }, []);

    return (
        <div>
            <InputPanel onInputChange={handleInputChange} />
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                    onClick={() => onProcess(mode, data)}
                    disabled={isProcessing || (!data.text && (!data.files || data.files.length === 0))}
                    className="px-8 py-3 bg-orange-600 text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                    {isProcessing ? 'Designing Slides...' : 'Generate Presentation'} <Play size={18} fill="currentColor" />
                </button>
            </div>
        </div>
    )
};
