import React, { useState } from 'react';
import { Book, PenTool, Search, Layout, Save, Download, ChevronRight, Settings, Sparkles, BookOpen, Loader2 } from 'lucide-react';
import { getSubjectConfig } from '../../config/subjectConfig';
import { ResearchPanel } from './ResearchPanel';
import { aiOrchestrator, availableModels } from '../../services/aiOrchestrator';
import { MarkdownEditor } from './MarkdownEditor';

interface BookConfig {
    title: string;
    subject: string;
    audience: string;
    language: string;
    style: string;
}

interface Chapter {
    id: string;
    title: string;
    sections: string[];
    content: string;
    status: 'draft' | 'generating' | 'review' | 'completed';
}

export const BookStudio: React.FC = () => {
    const [activeView, setActiveView] = useState<'config' | 'outline' | 'write' | 'review'>('config');
    const [config, setConfig] = useState<BookConfig>({
        title: '',
        subject: 'Mathematics',
        audience: 'Class 9-10',
        language: 'English',
        style: 'Textbook'
    });

    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeChapterId, setActiveChapterId] = useState<string | null>(null);

    const updateChapterContent = (id: string, newContent: string) => {
        setChapters(chapters.map(c => c.id === id ? { ...c, content: newContent } : c));
    };

    const handleGenerateChapterContent = async (chapterId: string) => {
        const chapter = chapters.find(c => c.id === chapterId);
        if (!chapter) return;

        setIsGenerating(true);
        try {
            // Mock content generation for now as aiOrchestrator might not have this specific method ready
            setTimeout(() => {
                const mockContent = `# ${chapter.title}\n\n## Introduction\nThis is an AI-generated draft for ${chapter.title}.\n\n## Key Concepts\n- Concept 1\n- Concept 2\n\n## Summary\nConclusion of the chapter.`;
                updateChapterContent(chapterId, mockContent);
                setIsGenerating(false);
            }, 2000);
        } catch (error) {
            setIsGenerating(false);
        }
    };

    const handleGenerateOutline = async () => {
        if (!config.title) return;
        setIsGenerating(true);
        try {
            // Use Gemini 2.0 Flash by default for speed
            const model = availableModels[0];
            const structure = await aiOrchestrator.generateBookStructure(
                config.title,
                config.subject,
                config.audience,
                [config.style], // topics
                model
            );

            if (structure && structure.chapters) {
                const newChapters = structure.chapters.map((c: any, i: number) => ({
                    id: Date.now().toString() + i,
                    title: c.title,
                    sections: c.sections || [],
                    status: 'draft'
                }));
                setChapters(newChapters);
            }
        } catch (error) {
            console.error("Failed to generate outline:", error);
            alert("Failed to generate outline. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    // Components for each view
    const renderConfigView = () => (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-xl shadow-indigo-200">
                    <Book size={32} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Book Studio</h2>
                <p className="text-slate-500 font-medium text-lg">AI-Powered Educational Book Authoring</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100 space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Book Title</label>
                    <input
                        value={config.title}
                        onChange={e => setConfig({ ...config, title: e.target.value })}
                        placeholder="e.g. Comprehensive Guide to Physics"
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-lg font-bold text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:font-medium placeholder:text-slate-300"
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Subject</label>
                        <select
                            value={config.subject}
                            onChange={e => setConfig({ ...config, subject: e.target.value })}
                            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700 outline-none focus:border-indigo-500"
                        >
                            <option>Mathematics</option>
                            <option>Science</option>
                            <option>History</option>
                            <option>Geography</option>
                            <option>Computer Science</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Target Audience</label>
                        <select
                            value={config.audience}
                            onChange={e => setConfig({ ...config, audience: e.target.value })}
                            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700 outline-none focus:border-indigo-500"
                        >
                            <option>Primary (Class 1-5)</option>
                            <option>Middle (Class 6-8)</option>
                            <option>Secondary (Class 9-10)</option>
                            <option>Senior Secondary (11-12)</option>
                            <option>Competitive Exams</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={() => setActiveView('outline')}
                    disabled={!config.title}
                    className="w-full py-5 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                    Initialize Studio <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );

    const renderOutlineView = () => (
        <div className="grid grid-cols-12 gap-6 h-full">
            {/* Sidebar: AI Research Panel */}
            <div className="col-span-3 h-full">
                <ResearchPanel
                    subject={config.subject}
                    onAddToOutline={(topic) => {
                        const newChapter: Chapter = {
                            id: Date.now().toString(),
                            title: topic,
                            sections: [],
                            content: '',
                            status: 'draft'
                        };
                        setChapters([...chapters, newChapter]);
                    }}
                />
            </div>

            {/* Main: Outline Editor */}
            <div className="col-span-9 bg-white rounded-2xl border border-slate-200 p-8 h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Book Structure</h2>
                        <p className="text-slate-500 font-medium">Design your table of contents</p>
                    </div>
                    <button
                        onClick={() => setActiveView('write')}
                        className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-indigo-600 transition-all"
                    >
                        Start Writing
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {chapters.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                            <Layout size={48} className="mb-4 opacity-50" />
                            <p className="font-bold">No chapters yet</p>
                            <button
                                onClick={handleGenerateOutline}
                                disabled={isGenerating}
                                className="mt-4 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-indigo-600 shadow-sm hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                {isGenerating ? 'Designing Structure...' : 'Generate with AI'}
                            </button>
                        </div>
                    ) : (
                        chapters.map((chapter, idx) => (
                            <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center font-black text-slate-400 text-sm">
                                        {idx + 1}
                                    </div>
                                    <h3 className="font-bold text-slate-800">{chapter.title}</h3>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-full p-6 bg-slate-50 overflow-hidden flex flex-col">
            {/* Navigation Bar */}
            {activeView !== 'config' && (
                <div className="flex items-center gap-6 mb-6 px-2">
                    <button onClick={() => setActiveView('config')} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-sm transition-all">
                        <BookOpen size={16} /> Config
                    </button>
                    <ChevronRight size={14} className="text-slate-300" />
                    <button onClick={() => setActiveView('outline')} className={`flex items-center gap-2 font-bold text-sm transition-all ${activeView === 'outline' ? 'text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg' : 'text-slate-400'}`}>
                        <Layout size={16} /> Outline
                    </button>
                    <ChevronRight size={14} className="text-slate-300" />
                    <button onClick={() => setActiveView('write')} className={`flex items-center gap-2 font-bold text-sm transition-all ${activeView === 'write' ? 'text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg' : 'text-slate-400'}`}>
                        <PenTool size={16} /> Write
                    </button>
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 min-h-0">
                {activeView === 'config' && renderConfigView()}
                {activeView === 'outline' && renderOutlineView()}
                {activeView === 'write' && (
                    <div className="h-full flex flex-col gap-4">
                        {chapters.length > 0 ? (
                            <div className="grid grid-cols-12 gap-6 h-full">
                                {/* Chapter List */}
                                <div className="col-span-3 bg-white rounded-2xl border border-slate-200 p-4 overflow-y-auto">
                                    <h3 className="font-bold text-slate-800 mb-4 px-2">Table of Contents</h3>
                                    <div className="space-y-2">
                                        {chapters.map((chapter, idx) => (
                                            <button
                                                key={chapter.id}
                                                onClick={() => setActiveChapterId(chapter.id)}
                                                className={`w-full text-left p-3 rounded-xl text-sm font-medium transition-all ${activeChapterId === chapter.id
                                                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm'
                                                    : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                                                    }`}
                                            >
                                                <span className="opacity-50 mr-2">{idx + 1}.</span> {chapter.title}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Editor */}
                                <div className="col-span-9 h-full flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-black text-slate-800">
                                            {chapters.find(c => c.id === activeChapterId)?.title}
                                        </h2>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => activeChapterId && handleGenerateChapterContent(activeChapterId)}
                                                disabled={isGenerating}
                                                className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-all flex items-center gap-2"
                                            >
                                                <Sparkles size={14} />
                                                {isGenerating ? 'Generating...' : 'Auto-Write Chapter'}
                                            </button>
                                            <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2">
                                                <Save size={14} /> Save Draft
                                            </button>
                                        </div>
                                    </div>

                                    {activeChapterId && (
                                        <MarkdownEditor
                                            value={chapters.find(c => c.id === activeChapterId)?.content || ''}
                                            onChange={(val) => updateChapterContent(activeChapterId, val)}
                                            className="flex-1 shadow-sm"
                                        />
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">
                                <p>No chapters to write. Go to Outline view first.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
