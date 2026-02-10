import React, { useState } from 'react';
import { X, Download, ArrowLeft, Palette, Eye, Layers, Edit3, Trash2, GripVertical, Check, RefreshCw, FileText } from 'lucide-react';
import { Question, QuestionSet } from '../types';
import { generateQuestionSetPPT } from '../utils/pptGenerator';
import { Button } from './Button';

interface PPTStudioProps {
    initialSetId: string | null;
    questions: Question[];
    set: QuestionSet | null;
    onExit: () => void;
}

export const PPTStudio: React.FC<PPTStudioProps> = ({ questions: initialQuestions, set, onExit }) => {
    const [questions, setQuestions] = useState<Question[]>(initialQuestions);
    const [selectedTheme, setSelectedTheme] = useState<'dark' | 'light' | 'colorful'>('dark');
    const [showAnswerAfterEach, setShowAnswerAfterEach] = useState(true);
    const [includeExplanations, setIncludeExplanations] = useState(true);
    const [title, setTitle] = useState(set?.name || 'Question Set');
    const [subtitle, setSubtitle] = useState(set?.description || `${initialQuestions.length} Questions`);
    const [isExporting, setIsExporting] = useState(false);
    const [previewSlideIndex, setPreviewSlideIndex] = useState(0);

    // Collapsible sidebars state
    const [showLeftPanel, setShowLeftPanel] = useState(true);
    const [showRightPanel, setShowRightPanel] = useState(true);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await generateQuestionSetPPT(questions, {
                title,
                subtitle,
                theme: selectedTheme,
                showAnswerAfterEach,
                includeExplanations,
                authorName: 'Q-Bank Pro'
            });
            alert(`✅ PPT exported successfully! (${questions.length} slides)`);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export PPT. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleRemoveQuestion = (id: string) => {
        if (confirm('Remove this question from the presentation?')) {
            setQuestions(questions.filter(q => q.id !== id));
        }
    };

    const themePreview = {
        dark: { bg: '#111827', text: '#F3F4F6', accent: '#6366F1' },
        light: { bg: '#FFFFFF', text: '#1F2937', accent: '#2563EB' },
        colorful: { bg: '#F0FDF4', text: '#166534', accent: '#D97706' }
    };

    const currentTheme = themePreview[selectedTheme];
    const currentQuestion = questions[previewSlideIndex];

    return (
        <div className="h-screen flex flex-col font-sans bg-slate-50 overflow-hidden">
            {/* Header - Compact */}
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between shadow-lg shrink-0 z-30">
                <div className="flex items-center gap-3">
                    <button onClick={onExit} className="p-1.5 hover:bg-slate-800 rounded-lg transition-all text-slate-300 hover:text-white">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-base font-black uppercase tracking-tight leading-none">PPT Studio</h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Design & Export</p>
                    </div>
                </div>
                <button
                    data-testid="ppt-export-button"
                    onClick={handleExport}
                    disabled={isExporting || questions.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-bold uppercase text-xs tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                    {isExporting ? <RefreshCw className="animate-spin" size={14} /> : <Download size={14} />}
                    {isExporting ? 'Exporting...' : 'Export PPT'}
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

                {/* Left Panel - Configuration (Collapsible on Desktop) */}
                <div className={`
                    bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out z-20
                    ${showLeftPanel ? 'lg:w-72' : 'lg:w-0 lg:opacity-0 lg:overflow-hidden'}
                    w-full order-2 lg:order-1 h-1/3 lg:h-auto overflow-y-auto lg:overflow-visible
                `}>
                    <div className="h-full overflow-y-auto p-4 space-y-5">
                        {/* Title & Subtitle */}
                        <div className="space-y-2">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Presentation Info</h3>
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-bold focus:ring-1 focus:ring-orange-500/20 outline-none"
                                    placeholder="Title"
                                />
                                <input
                                    type="text"
                                    value={subtitle}
                                    onChange={e => setSubtitle(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-bold focus:ring-1 focus:ring-orange-500/20 outline-none"
                                    placeholder="Subtitle"
                                />
                            </div>
                        </div>

                        {/* Theme Selection - Grid Layout */}
                        <div className="space-y-2">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Palette size={12} /> Theme
                            </h3>
                            <div className="grid grid-cols-1 gap-2">
                                {(['dark', 'light', 'colorful'] as const).map((theme) => (
                                    <button
                                        key={theme}
                                        onClick={() => setSelectedTheme(theme)}
                                        className={`w-full p-2.5 rounded-lg border flex items-center gap-3 transition-all ${selectedTheme === theme
                                                ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500/20'
                                                : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="w-8 h-8 rounded-md shadow-sm shrink-0" style={{ backgroundColor: themePreview[theme].bg }} />
                                        <div className="text-left flex-1 min-w-0">
                                            <div className="text-xs font-black capitalize truncate">{theme}</div>
                                            <div className="text-[10px] text-slate-500 font-medium truncate opacity-80">
                                                {theme === 'dark' ? 'Professional' : theme === 'light' ? 'Minimal' : 'Vibrant'}
                                            </div>
                                        </div>
                                        {selectedTheme === theme && <Check size={14} className="text-orange-600 shrink-0" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Options */}
                        <div className="space-y-2">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Options</h3>
                            <div className="space-y-1">
                                <label className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-md cursor-pointer transition-colors">
                                    <span className="text-xs font-bold text-slate-700">Answer Key</span>
                                    <input
                                        type="checkbox"
                                        checked={showAnswerAfterEach}
                                        onChange={e => setShowAnswerAfterEach(e.target.checked)}
                                        className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                                    />
                                </label>
                                <label className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-md cursor-pointer transition-colors">
                                    <span className="text-xs font-bold text-slate-700">Explanations</span>
                                    <input
                                        type="checkbox"
                                        checked={includeExplanations}
                                        onChange={e => setIncludeExplanations(e.target.checked)}
                                        className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Stats - Compact */}
                        <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-2">
                            <div className="bg-orange-50/50 p-2.5 rounded-lg border border-orange-100">
                                <div className="text-lg font-black text-orange-600 leading-none">{questions.length}</div>
                                <div className="text-[10px] font-bold text-orange-700/70 uppercase">Questions</div>
                            </div>
                            <div className="bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100">
                                <div className="text-lg font-black text-indigo-600 leading-none">
                                    {questions.length * (showAnswerAfterEach ? 2 : 1) + 2}
                                </div>
                                <div className="text-[10px] font-bold text-indigo-700/70 uppercase">Slides</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center - Preview */}
                <div className={`
                    flex-1 bg-slate-100 flex flex-col relative
                    order-1 lg:order-2 h-1/2 lg:h-auto
                `}>
                    {/* Desktop Collapse Togglers (Absolute positioned) */}
                    <div className="hidden lg:block absolute left-4 top-4 z-40">
                        <button
                            onClick={() => setShowLeftPanel(!showLeftPanel)}
                            className="p-1.5 bg-white shadow-md border border-slate-200 rounded-md text-slate-500 hover:text-slate-800 transition-all"
                            title="Toggle Settings Panel"
                        >
                            {showLeftPanel ? <ArrowLeft size={16} /> : <Edit3 size={16} />}
                        </button>
                    </div>
                    <div className="hidden lg:block absolute right-4 top-4 z-40">
                        <button
                            onClick={() => setShowRightPanel(!showRightPanel)}
                            className="p-1.5 bg-white shadow-md border border-slate-200 rounded-md text-slate-500 hover:text-slate-800 transition-all"
                            title="Toggle Questions Panel"
                        >
                            {showRightPanel ? <Layers size={16} /> : <Layers size={16} className="opacity-50" />}
                        </button>
                    </div>

                    {/* Preview Area */}
                    <div className="flex-1 overflow-hidden p-4 lg:p-8 flex items-center justify-center">
                        <div className="w-full max-w-4xl flex flex-col h-full max-h-full">
                            {/* Controls */}
                            <div className="mb-3 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-2">
                                    <Eye size={14} className="text-slate-400" />
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Preview</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-white rounded-lg border border-slate-200 p-0.5 shadow-sm">
                                    <button
                                        onClick={() => setPreviewSlideIndex(Math.max(0, previewSlideIndex - 1))}
                                        disabled={previewSlideIndex === 0}
                                        className="p-1 hover:bg-slate-50 rounded text-slate-600 disabled:opacity-30"
                                    >
                                        <ArrowLeft size={14} />
                                    </button>
                                    <span className="text-[10px] font-bold text-slate-600 px-2 min-w-[60px] text-center">
                                        {previewSlideIndex + 1} <span className="text-slate-300">/</span> {questions.length}
                                    </span>
                                    <button
                                        onClick={() => setPreviewSlideIndex(Math.min(questions.length - 1, previewSlideIndex + 1))}
                                        disabled={previewSlideIndex >= questions.length - 1}
                                        className="p-1 hover:bg-slate-50 rounded text-slate-600 disabled:opacity-30 transform rotate-180"
                                    >
                                        <ArrowLeft size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Slide */}
                            <div className="flex-1 w-full relative flex items-center justify-center min-h-0">
                                {currentQuestion ? (
                                    <div
                                        className="aspect-video w-full h-auto max-h-full rounded-xl shadow-2xl relative overflow-hidden text-[clamp(12px,2vw,16px)]"
                                        style={{ backgroundColor: currentTheme.bg, color: currentTheme.text }}
                                    >
                                        {/* Q# Badge */}
                                        <div
                                            className="absolute top-[5%] left-[5%] text-[0.8em] font-black uppercase tracking-wider px-[0.8em] py-[0.3em] rounded-md"
                                            style={{ backgroundColor: currentTheme.accent, color: '#FFFFFF' }}
                                        >
                                            Q{previewSlideIndex + 1}
                                        </div>

                                        {/* Difficulty */}
                                        <div className="absolute top-[5%] right-[5%] text-[0.7em] font-bold px-[0.8em] py-[0.3em] bg-white/10 rounded-md">
                                            {currentQuestion.difficulty || 'Medium'}
                                        </div>

                                        {/* Content Container */}
                                        <div className="absolute inset-x-[10%] top-[20%] bottom-[15%] flex flex-col justify-center">
                                            <div className="mb-[5%]">
                                                <p className="text-[1.3em] font-bold leading-tight mb-[2%]">{currentQuestion.question_eng}</p>
                                                {currentQuestion.question_hin && (
                                                    <p className="text-[1em] opacity-70 font-hindi leading-snug">{currentQuestion.question_hin}</p>
                                                )}
                                            </div>

                                            <div className="space-y-[2%]">
                                                {[
                                                    { l: 'A', t: currentQuestion.option1_eng },
                                                    { l: 'B', t: currentQuestion.option2_eng },
                                                    { l: 'C', t: currentQuestion.option3_eng },
                                                    { l: 'D', t: currentQuestion.option4_eng }
                                                ].map((opt, i) => (
                                                    <div key={i} className="flex items-center gap-[3%]">
                                                        <div
                                                            className="w-[1.8em] h-[1.8em] rounded-full flex items-center justify-center text-[0.8em] font-black shrink-0"
                                                            style={{ backgroundColor: currentTheme.accent, color: '#FFFFFF' }}
                                                        >
                                                            {opt.l}
                                                        </div>
                                                        <span className="text-[0.9em] font-medium leading-tight">{opt.t}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="absolute bottom-[5%] inset-x-[5%] flex justify-between items-center text-[0.6em] opacity-40 font-bold uppercase tracking-widest">
                                            <span>Q-Bank Pro</span>
                                            <span>{title}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-slate-400">
                                        <FileText size={48} className="mx-auto mb-2 opacity-20" />
                                        <p className="text-sm font-bold opacity-50">No questions selected</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Questions List (Collapsible on Desktop) */}
                <div className={`
                    bg-white border-l border-slate-200 flex flex-col transition-all duration-300 ease-in-out z-20
                    ${showRightPanel ? 'lg:w-80' : 'lg:w-0 lg:opacity-0 lg:overflow-hidden'}
                    w-full order-3 lg:order-3 h-1/3 lg:h-auto overflow-y-auto lg:overflow-visible
                `}>
                    <div className="h-full overflow-y-auto p-4 flex flex-col">
                        <div className="flex items-center justify-between mb-4 shrink-0">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Layers size={14} /> Questions ({questions.length})
                            </h3>
                            {questions.length > 0 && (
                                <button
                                    onClick={() => {
                                        if (confirm('Clear all questions?')) setQuestions([]);
                                    }}
                                    className="text-[10px] font-bold text-red-500 hover:text-red-700 hover:underline"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>

                        <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                            {questions.map((q, idx) => (
                                <div
                                    key={q.id}
                                    onClick={() => setPreviewSlideIndex(idx)}
                                    className={`
                                        group relative p-3 rounded-lg border transition-all cursor-pointer flex gap-3
                                        ${previewSlideIndex === idx
                                            ? 'border-orange-500 bg-orange-50/50 shadow-sm'
                                            : 'border-slate-100 hover:border-slate-300 bg-white hover:bg-slate-50'
                                        }
                                    `}
                                >
                                    <div className={`
                                        w-6 h-6 rounded flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5
                                        ${previewSlideIndex === idx ? 'bg-orange-200 text-orange-700' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}
                                    `}>
                                        {idx + 1}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs font-bold leading-relaxed line-clamp-2 ${previewSlideIndex === idx ? 'text-slate-800' : 'text-slate-600'}`}>
                                            {q.question_eng}
                                        </p>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveQuestion(q.id);
                                        }}
                                        className="absolute top-2 right-2 p-1.5 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}

                            {questions.length === 0 && (
                                <div className="h-32 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-xl">
                                    <FileText size={24} className="mb-2 opacity-50" />
                                    <p className="text-xs font-bold">List is empty</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
