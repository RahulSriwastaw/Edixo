import React, { useState } from 'react';
import { geminiService } from './services/geminiService';
import { aiOrchestrator, availableModels, AIModelConfig } from './services/aiOrchestrator';
import { Book, Layers, Sparkles, Download, ChevronRight, CheckCircle, RefreshCw, ChevronDown } from 'lucide-react';
import { jsPDF } from "jspdf";

export const BookGenerator: React.FC = () => {
    const [step, setStep] = useState<'config' | 'preview' | 'generating'>('config');
    const [config, setConfig] = useState({
        title: '',
        subject: 'Mathematics',
        audience: 'Class 9-10',
        topics: ''
    });
    const [structure, setStructure] = useState<any>(null);
    const [generatedContent, setGeneratedContent] = useState<string>('');
    const [progress, setProgress] = useState(0);
    const [selectedAIModel, setSelectedAIModel] = useState<AIModelConfig>(availableModels[0]);

    const handleGenerateStructure = async () => {
        if (!config.title || !config.topics) return;
        setStep('generating');
        try {
            const struct = await aiOrchestrator.generateBookStructure(
                config.title,
                config.subject,
                config.audience,
                config.topics.split(',').map(t => t.trim()),
                selectedAIModel
            );
            setStructure(struct);
            setStep('preview');
        } catch (error) {
            alert(`Failed to generate structure (${selectedAIModel.displayName}).`);
            setStep('config');
        }
    };

    const handleGenerateFullBook = async () => {
        if (!structure) return;
        setStep('generating');
        let fullContent = `# ${structure.title}\n\n`;

        for (let i = 0; i < structure.chapters.length; i++) {
            const chapter = structure.chapters[i];
            setProgress(((i) / structure.chapters.length) * 100);

            try {
                const content = await aiOrchestrator.generateBookChapter(chapter.title, chapter.sections, config.audience, selectedAIModel);
                fullContent += `\n\n${content}\n\n---\n\n`;
            } catch (e) {
                console.error(`Failed to generate chapter ${i + 1}`);
            }
        }

        setGeneratedContent(fullContent);
        setProgress(100);
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        const splitText = doc.splitTextToSize(generatedContent, 180);
        let y = 10;

        // Very basic PDF dump - in production use a proper Markdown -> PDF renderer
        splitText.forEach((line: string) => {
            if (y > 280) {
                doc.addPage();
                y = 10;
            }
            doc.text(line, 10, y);
            y += 7;
        });

        doc.save(`${config.title.replace(/\s+/g, '_')}.pdf`);
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-6 animate-in fade-in duration-500">
            <div className="text-center space-y-4 mb-12">
                <div className="inline-flex items-center justify-center p-3 bg-indigo-50 text-indigo-600 rounded-2xl mb-2 ring-1 ring-indigo-100 shadow-sm">
                    <Book size={24} />
                </div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">AI Book Architect</h2>
                <p className="text-slate-500 font-medium max-w-lg mx-auto">
                    Design, structure, and synthesize complete educational books tailored to your curriculum.
                </p>
            </div>

            {step === 'config' && (
                <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/40 max-w-2xl mx-auto space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Book Title</label>
                        <input
                            value={config.title}
                            onChange={e => setConfig({ ...config, title: e.target.value })}
                            placeholder="e.g. Complete Guide to Algebra"
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Target Audience</label>
                            <select
                                value={config.audience}
                                onChange={e => setConfig({ ...config, audience: e.target.value })}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                                <option>Class 6-8 (Beginner)</option>
                                <option>Class 9-10 (Intermediate)</option>
                                <option>Class 11-12 (Advanced)</option>
                                <option>Competitive Exams</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Subject</label>
                            <select
                                value={config.subject}
                                onChange={e => setConfig({ ...config, subject: e.target.value })}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                                <option>Mathematics</option>
                                <option>Science</option>
                                <option>History</option>
                                <option>English</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Topics to Cover</label>
                        <textarea
                            value={config.topics}
                            onChange={e => setConfig({ ...config, topics: e.target.value })}
                            placeholder="Linear Equations, Quadratic Equations, Polynomials..."
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl min-h-[100px] font-medium text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                        />
                    </div>

                    {/* AI Model Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1.5">
                            <Sparkles size={12} className="text-indigo-500" />
                            AI Model
                        </label>
                        <div className="relative">
                            <select
                                value={availableModels.findIndex(m => m.modelId === selectedAIModel.modelId)}
                                onChange={(e) => setSelectedAIModel(availableModels[parseInt(e.target.value)])}
                                className="w-full p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl font-bold text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 appearance-none cursor-pointer"
                            >
                                {availableModels.map((model, idx) => (
                                    <option key={model.modelId} value={idx}>
                                        {model.displayName}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-600 pointer-events-none" size={14} />
                        </div>
                        <div className="flex items-center gap-1.5 px-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${selectedAIModel.provider === 'gemini' ? 'bg-blue-500' : 'bg-purple-500'} animate-pulse`} />
                            <span className="text-[9px] font-bold text-slate-500">{selectedAIModel.provider === 'gemini' ? 'Google AI' : 'Replicate (xAI Grok)'}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerateStructure}
                        className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-wider hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
                    >
                        <Sparkles size={18} /> Design Structure
                    </button>
                </div>
            )}

            {step === 'preview' && structure && (
                <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/40 max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800">{structure.title}</h3>
                            <p className="text-slate-500 font-medium">{structure.chapters.length} Chapters • {config.audience}</p>
                        </div>
                        <button
                            onClick={() => setStep('config')}
                            className="text-slate-400 hover:text-slate-600 font-bold text-sm"
                        >
                            Edit Config
                        </button>
                    </div>

                    <div className="space-y-4 mb-8">
                        {structure.chapters.map((chapter: any, i: number) => (
                            <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <h4 className="font-bold text-slate-800 mb-2">{chapter.title}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {chapter.sections.map((sec: string, j: number) => (
                                        <span key={j} className="text-xs bg-white px-2 py-1 rounded-md border border-slate-200 text-slate-500 font-medium">{sec}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleGenerateFullBook}
                        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                    >
                        <Book size={18} /> Generate Full Content
                    </button>
                </div>
            )}

            {step === 'generating' && !generatedContent && (
                <div className="max-w-md mx-auto text-center py-20">
                    <RefreshCw size={48} className="text-indigo-500 animate-spin mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Synthesizing Book Content...</h3>
                    <p className="text-slate-500 mb-8">Writing chapters, generating examples, and formatting structure.</p>

                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-indigo-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-xs font-bold text-indigo-500 mt-2">{Math.round(progress)}% Complete</p>
                </div>
            )}

            {generatedContent && (
                <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/40 max-w-4xl mx-auto">
                    <div className="flex items-center justify-center flex-col text-center py-12">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Book Generated Successfully!</h3>
                        <p className="text-slate-500 max-w-md mb-8">
                            Your book "{config.title}" is ready. You can now download it as a PDF or copy the markdown content.
                        </p>

                        <button
                            onClick={downloadPDF}
                            className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-wide hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                        >
                            <Download size={18} /> Download PDF
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
