import React, { useState } from 'react';
import { geminiService } from './services/geminiService';
import { aiOrchestrator, availableModels, AIModelConfig } from './services/aiOrchestrator';
import { Sparkles, Copy, Check, RefreshCw, BookOpen, AlertCircle, ChevronDown } from 'lucide-react';

export const AnswerGenerator: React.FC = () => {
    const [question, setQuestion] = useState('');
    const [detailLevel, setDetailLevel] = useState<'Brief' | 'Detailed' | 'Step-by-Step'>('Detailed');
    const [language, setLanguage] = useState('Bilingual');
    const [generatedAnswer, setGeneratedAnswer] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [selectedAIModel, setSelectedAIModel] = useState<AIModelConfig>(availableModels[0]);

    const handleGenerate = async () => {
        if (!question.trim()) return;
        setLoading(true);
        try {
            const result = await aiOrchestrator.generateAnswer(question, { detailLevel, language }, selectedAIModel);
            setGeneratedAnswer(result);
        } catch (error: any) {
            alert(`Failed to generate answer (${selectedAIModel.displayName}): ${error.message || 'Please try again'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!generatedAnswer) return;
        const text = `Q: ${question}\n\nA: ${generatedAnswer.answer}\n\nExplanation:\n${generatedAnswer.explanation}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-4 mb-8">
                <div className="inline-flex items-center justify-center p-3 bg-amber-50 text-amber-600 rounded-2xl mb-2 ring-1 ring-amber-100 shadow-sm">
                    <BookOpen size={24} />
                </div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">AI Answer Studio</h2>
                <p className="text-slate-500 font-medium max-w-lg mx-auto">
                    Generate comprehensive explanations, step-by-step solutions, and key insights for any academic query.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Input Section */}
                <div className="space-y-6 bg-white p-6 rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/40">
                    <div className="space-y-4">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Your Question</label>
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Paste your question here (e.g., 'Explain Quantum Entanglement' or 'Solve 2x + 5 = 15')..."
                            className="w-full min-h-[200px] p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all resize-none text-slate-700 font-medium leading-relaxed placeholder:text-slate-400 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Depth</label>
                            <select
                                value={detailLevel}
                                onChange={(e: any) => setDetailLevel(e.target.value)}
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                            >
                                <option value="Brief">Brief Summary</option>
                                <option value="Detailed">Detailed Analysis</option>
                                <option value="Step-by-Step">Step-by-Step Solution</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Language</label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                            >
                                <option value="English">English</option>
                                <option value="Hindi">Hindi</option>
                                <option value="Bilingual">Bilingual</option>
                            </select>
                        </div>
                    </div>

                    {/* AI Model Selector */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles size={12} className="text-amber-500" />
                            AI Model
                        </label>
                        <div className="relative">
                            <select
                                value={availableModels.findIndex(m => m.modelId === selectedAIModel.modelId)}
                                onChange={(e) => setSelectedAIModel(availableModels[parseInt(e.target.value)])}
                                className="w-full p-3 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 appearance-none cursor-pointer"
                            >
                                {availableModels.map((model, idx) => (
                                    <option key={model.modelId} value={idx}>
                                        {model.displayName}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-600 pointer-events-none" size={14} />
                        </div>
                        <div className="flex items-center gap-1.5 px-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${selectedAIModel.provider === 'gemini' ? 'bg-blue-500' : 'bg-purple-500'} animate-pulse`} />
                            <span className="text-[9px] font-bold text-slate-500">{selectedAIModel.provider === 'gemini' ? 'Google AI' : 'Replicate (xAI Grok)'}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={loading || !question.trim()}
                        className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-wider transition-all transform active:scale-95 ${loading || !question.trim()
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 hover:-translate-y-0.5'
                            }`}
                    >
                        {loading ? (
                            <>
                                <RefreshCw size={18} className="animate-spin" />
                                Synthesizing...
                            </>
                        ) : (
                            <>
                                <Sparkles size={18} />
                                Generate Answer
                            </>
                        )}
                    </button>
                </div>

                {/* Output Section */}
                <div className={`relative min-h-[400px] rounded-[32px] border-2 transition-all ${generatedAnswer ? 'bg-white border-amber-100 shadow-2xl shadow-amber-500/10' : 'bg-slate-50 border-slate-100 border-dashed flex items-center justify-center'}`}>
                    {generatedAnswer ? (
                        <div className="p-8 space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                        <Sparkles size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">AI Analysis</h3>
                                        <p className="text-xs text-slate-500 font-medium">{detailLevel} • {language}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCopy}
                                    className={`p-2 rounded-lg transition-all ${copied ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {copied ? <Check size={20} /> : <Copy size={20} />}
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Core Answer</span>
                                    <p className="text-lg text-slate-800 font-medium leading-relaxed">{generatedAnswer.answer}</p>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Explanation</span>
                                    <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-600 leading-relaxed border border-slate-100">
                                        {generatedAnswer.explanation}
                                    </div>
                                </div>

                                {generatedAnswer.key_points && (
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Key Points</span>
                                        <ul className="space-y-2">
                                            {generatedAnswer.key_points.map((point: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                                    <Check size={14} className="mt-1 text-emerald-500 shrink-0" />
                                                    <span>{point}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {generatedAnswer.examples && (
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Examples</span>
                                        <div className="bg-blue-50/50 p-4 rounded-xl text-sm text-blue-800 border border-blue-100">
                                            {generatedAnswer.examples.map((ex: string, i: number) => (
                                                <p key={i} className="mb-1 last:mb-0">• {ex}</p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center p-8">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <Sparkles size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-400">Ready to Synthesize</h3>
                            <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">
                                Enter a question and configure your preferences to generate high-quality AI answers.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
