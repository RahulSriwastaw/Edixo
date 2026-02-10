import React, { useState, useEffect, useRef } from 'react';
import {
    ArrowLeft, Save, Sparkles, AlertCircle, Check, Wand2, Type,
    ChevronRight, ChevronLeft, MoreHorizontal, History, ChevronDown
} from 'lucide-react';
import { RichEditor } from './RichEditor';
import { Button } from './Button';
import { Question, Difficulty, QuestionType } from '../types';
import { storageService } from '../services/storageService';
import { aiOrchestrator, availableModels } from '../services/aiOrchestrator';

interface RefinementStudioProps {
    questionId?: string;
    onExit: () => void;
}

const SAMPLE_QUESTION: Question = {
    id: 'sample_q1',
    question_unique_id: 'sample_q1',
    question_eng: '<p>Sample Question Text</p>',
    question_hin: '<p>Sample Question Hindi</p>',
    subject: 'General Knowledge',
    chapter: 'Topic 1',
    option1_eng: 'Option A', option1_hin: 'Option A Hindi',
    option2_eng: 'Option B', option2_hin: 'Option B Hindi',
    option3_eng: 'Option C', option3_hin: 'Option C Hindi',
    option4_eng: 'Option D', option4_hin: 'Option D Hindi',
    answer: '1',
    solution_eng: 'Solution explanation',
    solution_hin: 'Solution explanation hindi',
    type: 'MCQ',
    difficulty: 'Medium',
    language: 'Bilingual',
    tags: [],
    createdDate: new Date().toISOString()
};

export const RefinementStudio: React.FC<RefinementStudioProps> = ({ questionId, onExit }) => {
    const [question, setQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [editTarget, setEditTarget] = useState<'question' | 'solution' | 'both'>('both');

    // State for metadata fields
    const [subject, setSubject] = useState('');
    const [editorLanguage, setEditorLanguage] = useState<'English' | 'Hindi' | 'Bilingual'>('Bilingual');
    const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
    const [type, setType] = useState<QuestionType>('MCQ');
    const [status, setStatus] = useState<'Draft' | 'Ready' | 'Review'>('Draft');
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveDropdown(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        if (questionId) {
            loadQuestion(questionId);
        } else {
            // Fallback or new question
            setQuestion(SAMPLE_QUESTION);
            setSubject(SAMPLE_QUESTION.subject);
            setDifficulty(SAMPLE_QUESTION.difficulty);
            setType(SAMPLE_QUESTION.type);
        }
    }, [questionId]);

    const loadQuestion = async (id: string) => {
        setLoading(true);
        try {
            // In a real generic implementation, we would fetch by ID
            // For now we might need to search in all questions if getQuestionById isn't available exposed directly
            // Assuming storageService has getQuestions, we can filter.
            const allQuestions = await storageService.getQuestions();
            const found = allQuestions.find(q => q.id === id);
            if (found) {
                setQuestion(found);
                setSubject(found.subject);
                setDifficulty(found.difficulty);
                setType(found.type);
            }
        } catch (err) {
            console.error("Failed to load question", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!question) return;
        setSaving(true);
        try {
            const updatedQuestion = {
                ...question,
                subject,
                difficulty,
                type
            };
            await storageService.saveQuestion(updatedQuestion);
            // Show success notification
        } catch (err) {
            console.error("Failed to save", err);
        } finally {
            setSaving(false);
        }
    };

    const applyAiEdit = async () => {
        if (!question || !aiPrompt.trim()) return;
        setLoading(true);
        try {
            let updatedQ = { ...question };
            const processEng = editorLanguage === 'English' || editorLanguage === 'Bilingual';
            const processHin = editorLanguage === 'Hindi' || editorLanguage === 'Bilingual';

            if (editTarget === 'question' || editTarget === 'both') {
                if (processEng && question.question_eng) {
                    updatedQ.question_eng = await aiOrchestrator.refineContent(question.question_eng, aiPrompt);
                }
                if (processHin && question.question_hin) {
                    updatedQ.question_hin = await aiOrchestrator.refineContent(question.question_hin, aiPrompt);
                }
            }

            if (editTarget === 'solution' || editTarget === 'both') {
                if (processEng && question.solution_eng) {
                    updatedQ.solution_eng = await aiOrchestrator.refineContent(question.solution_eng, aiPrompt);
                }
                if (processHin && question.solution_hin) {
                    updatedQ.solution_hin = await aiOrchestrator.refineContent(question.solution_hin, aiPrompt);
                }
            }

            setQuestion(updatedQ);
        } catch (err) {
            console.error("AI Edit failed", err);
        } finally {
            setLoading(false);
            setAiPrompt('');
        }
    };

    if (loading && !question) {
        return <div className="flex items-center justify-center h-screen">Loading Refinement Studio...</div>;
    }

    return (
        <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Header */}
            <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={onExit} className="text-slate-500">
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            Refinement Studio
                            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-wider">BETA</span>
                        </h1>
                        <p className="text-xs text-slate-500 font-medium">Asset Optimization & Quality Control</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg mr-4">
                        {['Draft', 'Ready', 'Review'].map(s => (
                            <button
                                key={s}
                                onClick={() => setStatus(s as any)}
                                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${status === s ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    <Button variant="secondary" onClick={() => { }}>
                        Preview
                    </Button>
                    <Button onClick={handleSave} disabled={saving} className="gap-2">
                        <Save size={16} />
                        {saving ? 'Syncing...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: AI Control */}
                <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 z-10">
                    <div className="p-4 border-b border-slate-100">
                        <div className="flex items-center gap-2 text-indigo-600 mb-1">
                            <Sparkles size={16} />
                            <span className="text-xs font-black uppercase tracking-wider">AI Copilot</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-800">Intelligence Layer</h3>
                    </div>

                    <div className="p-4 flex-1 overflow-y-auto space-y-6">
                        {/* Edit Target */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Edit Target</label>
                            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
                                {['question', 'solution', 'both'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setEditTarget(t as any)}
                                        className={`py-1.5 rounded-md text-xs font-bold capitalize transition-all ${editTarget === t ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Prompt Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Instruction</label>
                            <textarea
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                placeholder="e.g., Simplify language, fix formatting, add more details..."
                                className="w-full h-32 p-3 text-sm border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-0 resize-none transition-all placeholder:text-slate-300"
                            />
                            <Button onClick={applyAiEdit} disabled={loading || !aiPrompt.trim()} className="w-full justify-center">
                                <Wand2 size={16} className="mr-2" />
                                Apply AI Edit
                            </Button>
                        </div>

                        {/* Quick Prompts */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Quick Actions</label>
                            <div className="grid grid-cols-1 gap-2">
                                {[
                                    'Add a step-by-step solution to each question',
                                    'Simplify the language of each question for better clarity',
                                    'Add Hindi translation after each question and option',
                                    'Fix any grammatical errors in the questions and options',
                                    'Add context or hints to make each question clearer',
                                    'Convert all numerical values to SI units'
                                ].map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setAiPrompt(p)}
                                        className="text-left px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 transition-all active:scale-95 shadow-sm hover:shadow"
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center Panel: Editor */}
                <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
                    {question && (
                        <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-8">

                            {/* Question Section */}
                            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="h-10 bg-indigo-50/50 border-b border-indigo-100 flex items-center px-4 justify-between">
                                    <span className="text-xs font-black text-indigo-900 uppercase tracking-widest">Master Question Vector</span>
                                    <span className="text-[10px] font-bold text-indigo-400 bg-white px-2 py-0.5 rounded-full border border-indigo-100">ID: {question.id}</span>
                                </div>
                                <div className="p-0">
                                    {(editorLanguage === 'English' || editorLanguage === 'Bilingual') && (
                                        <RichEditor
                                            value={question.question_eng}
                                            onChange={(val) => setQuestion({ ...question, question_eng: val })}
                                            label="Question (English)"
                                            className="border-0 rounded-none focus-within:ring-0 border-b border-slate-100"
                                            minHeight="150px"
                                        />
                                    )}
                                    {(editorLanguage === 'Hindi' || editorLanguage === 'Bilingual') && (
                                        <RichEditor
                                            value={question.question_hin}
                                            onChange={(val) => setQuestion({ ...question, question_hin: val })}
                                            label="Question (Hindi)"
                                            className="border-0 rounded-none focus-within:ring-0"
                                            minHeight="150px"
                                        />
                                    )}
                                </div>
                            </section>

                            {/* Options Section */}
                            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="h-10 bg-slate-50 border-b border-slate-200 flex items-center px-4">
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Option Configuration</span>
                                </div>
                                <div className="p-4 space-y-4">
                                    {[1, 2, 3, 4].map((optIdx) => {
                                        const optKeyEng = `option${optIdx}_eng` as keyof Question;
                                        const isCorrect = question.answer === String(optIdx);
                                        return (
                                            <div key={optIdx} className="flex items-start gap-3">
                                                <div className="pt-2">
                                                    <button
                                                        onClick={() => setQuestion({ ...question, answer: String(optIdx) })}
                                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isCorrect ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 text-transparent hover:border-slate-400'}`}
                                                    >
                                                        <Check size={14} strokeWidth={3} />
                                                    </button>
                                                </div>
                                                <div className="flex-1">
                                                    {(editorLanguage === 'English' || editorLanguage === 'Bilingual') && (
                                                        <RichEditor
                                                            value={question[`option${optIdx}_eng` as keyof Question] as string}
                                                            onChange={(val) => setQuestion({ ...question, [`option${optIdx}_eng`]: val })}
                                                            className="mb-2"
                                                            minHeight="60px"
                                                            placeholder={`Option ${optIdx} (English)`}
                                                        />
                                                    )}
                                                    {(editorLanguage === 'Hindi' || editorLanguage === 'Bilingual') && (
                                                        <RichEditor
                                                            value={question[`option${optIdx}_hin` as keyof Question] as string}
                                                            onChange={(val) => setQuestion({ ...question, [`option${optIdx}_hin`]: val })}
                                                            className="mb-2"
                                                            minHeight="60px"
                                                            placeholder={`Option ${optIdx} (Hindi)`}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </section>

                            {/* Solution Section */}
                            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="h-10 bg-amber-50/50 border-b border-amber-100 flex items-center px-4 justify-between">
                                    <span className="text-xs font-black text-amber-900 uppercase tracking-widest">Analytical Logic Synthesis</span>
                                    <span className="text-[10px] font-bold text-amber-500 bg-white px-2 py-0.5 rounded-full border border-amber-100">Explanation</span>
                                </div>
                                <div className="p-0">
                                    {(editorLanguage === 'English' || editorLanguage === 'Bilingual') && (
                                        <RichEditor
                                            value={question.solution_eng}
                                            onChange={(val) => setQuestion({ ...question, solution_eng: val })}
                                            label="Detailed Solution (English)"
                                            className="border-0 rounded-none focus-within:ring-0 border-b border-slate-100"
                                            minHeight="200px"
                                        />
                                    )}
                                    {(editorLanguage === 'Hindi' || editorLanguage === 'Bilingual') && (
                                        <RichEditor
                                            value={question.solution_hin}
                                            onChange={(val) => setQuestion({ ...question, solution_hin: val })}
                                            label="Detailed Solution (Hindi)"
                                            className="border-0 rounded-none focus-within:ring-0"
                                            minHeight="200px"
                                        />
                                    )}
                                </div>
                            </section>

                        </div>
                    )}
                </div>

                {/* Right Panel: Metadata */}
                <div className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 z-10">
                    <div className="p-4 border-b border-slate-200">
                        <h3 className="text-sm font-bold text-slate-800">Metadata</h3>
                    </div>

                    <div className="p-4 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Editor Language</label>
                                <div className="relative">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === 'lang' ? null : 'lang'); }}
                                        className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium flex items-center justify-between hover:bg-slate-100 transition-all ${activeDropdown === 'lang' ? 'ring-2 ring-indigo-500/20 border-indigo-500' : ''}`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-black tracking-wider ${editorLanguage === 'English' ? 'bg-blue-100 text-blue-700' :
                                                editorLanguage === 'Hindi' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-purple-100 text-purple-700'
                                                }`}>
                                                {editorLanguage.substring(0, 3)}
                                            </span>
                                            {editorLanguage}
                                        </span>
                                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${activeDropdown === 'lang' ? 'rotate-180' : ''}`} />
                                    </button>
                                    {activeDropdown === 'lang' && (
                                        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                                            {[
                                                { label: 'English', value: 'English', color: 'bg-blue-100 text-blue-700' },
                                                { label: 'Hindi', value: 'Hindi', color: 'bg-amber-100 text-amber-700' },
                                                { label: 'Bilingual', value: 'Bilingual', color: 'bg-purple-100 text-purple-700' }
                                            ].map((opt) => (
                                                <button
                                                    key={opt.label}
                                                    onClick={(e) => { e.stopPropagation(); setEditorLanguage(opt.value as any); setActiveDropdown(null); }}
                                                    className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-slate-50 flex items-center gap-2"
                                                >
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-black tracking-wider ${opt.color}`}>
                                                        {opt.label.substring(0, 3)}
                                                    </span>
                                                    {opt.label}
                                                    {editorLanguage === opt.value && <Check size={12} className="ml-auto text-indigo-600" />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Subject</label>
                                <select
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                >
                                    {['General Knowledge', 'Mathematics', 'Science', 'Reasoning', 'English'].map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Difficulty</label>
                                <div className="relative">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === 'diff' ? null : 'diff'); }}
                                        className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium flex items-center justify-between hover:bg-slate-100 transition-all ${activeDropdown === 'diff' ? 'ring-2 ring-indigo-500/20 border-indigo-500' : ''}`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${difficulty === 'Easy' ? 'bg-emerald-500' : difficulty === 'Medium' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                                            {difficulty}
                                        </span>
                                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${activeDropdown === 'diff' ? 'rotate-180' : ''}`} />
                                    </button>
                                    {activeDropdown === 'diff' && (
                                        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                                            {['Easy', 'Medium', 'Hard'].map((d) => (
                                                <button
                                                    key={d}
                                                    onClick={(e) => { e.stopPropagation(); setDifficulty(d as Difficulty); setActiveDropdown(null); }}
                                                    className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-slate-50 flex items-center gap-2"
                                                >
                                                    <span className={`w-2 h-2 rounded-full ${d === 'Easy' ? 'bg-emerald-500' : d === 'Medium' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                                                    {d}
                                                    {difficulty === d && <Check size={12} className="ml-auto text-indigo-600" />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Type</label>
                                <div className="relative">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === 'type' ? null : 'type'); }}
                                        className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium flex items-center justify-between hover:bg-slate-100 transition-all ${activeDropdown === 'type' ? 'ring-2 ring-indigo-500/20 border-indigo-500' : ''}`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-black tracking-wider ${type === 'MCQ' ? 'bg-blue-100 text-blue-700' :
                                                type === 'ShortAnswer' ? 'bg-emerald-100 text-emerald-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                {type === 'MCQ' ? 'MCQ' : type === 'ShortAnswer' ? 'NUM' : 'DESC'}
                                            </span>
                                            {type === 'MCQ' ? 'MCQ Single' : type === 'ShortAnswer' ? 'Numerical' : type === 'LongAnswer' ? 'Descriptive' : type}
                                        </span>
                                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${activeDropdown === 'type' ? 'rotate-180' : ''}`} />
                                    </button>
                                    {activeDropdown === 'type' && (
                                        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                                            {[
                                                { label: 'MCQ Single', value: 'MCQ', color: 'bg-blue-100 text-blue-700' },
                                                { label: 'MCQ Multi', value: 'MCQ', color: 'bg-purple-100 text-purple-700' },
                                                { label: 'Numerical', value: 'ShortAnswer', color: 'bg-emerald-100 text-emerald-700' },
                                                { label: 'Descriptive', value: 'LongAnswer', color: 'bg-amber-100 text-amber-700' }
                                            ].map((opt) => (
                                                <button
                                                    key={opt.label}
                                                    onClick={(e) => { e.stopPropagation(); setType(opt.value as QuestionType); setActiveDropdown(null); }}
                                                    className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-slate-50 flex items-center gap-2"
                                                >
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-black tracking-wider ${opt.color}`}>
                                                        {opt.label.substring(0, 3)}
                                                    </span>
                                                    {opt.label}
                                                    {type === opt.value && <Check size={12} className="ml-auto text-indigo-600" />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100">
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                <h4 className="text-xs font-black text-blue-800 uppercase tracking-wide mb-2">Editor Stats</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-blue-700/80">
                                        <span>Words</span>
                                        <span className="font-bold">124</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-blue-700/80">
                                        <span>Last Edited</span>
                                        <span className="font-bold">Just now</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-blue-700/80">
                                        <span>Version</span>
                                        <span className="font-bold">v1.2</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};
