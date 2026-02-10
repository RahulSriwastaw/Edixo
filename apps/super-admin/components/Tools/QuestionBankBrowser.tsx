import React, { useState, useEffect } from 'react';
import { Search, Filter, Check, X, Database } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Question } from '../../types';

interface QuestionBankBrowserProps {
    onClose: () => void;
    onSelectQuestions: (questions: Question[]) => void;
}

export const QuestionBankBrowser: React.FC<QuestionBankBrowserProps> = ({ onClose, onSelectQuestions }) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');

    useEffect(() => {
        loadQuestions();
    }, []);

    useEffect(() => {
        filterQuestions();
    }, [questions, searchTerm, subjectFilter, typeFilter]);

    const loadQuestions = async () => {
        setIsLoading(true);
        try {
            const data = await storageService.getQuestions();
            setQuestions(data);
        } catch (error) {
            console.error("Failed to load questions", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterQuestions = () => {
        let result = questions;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(q =>
                q.question_eng.toLowerCase().includes(term) ||
                (q.question_hin && q.question_hin.toLowerCase().includes(term)) ||
                q.topic?.toLowerCase().includes(term)
            );
        }

        if (subjectFilter !== 'All') {
            result = result.filter(q => q.subject === subjectFilter);
        }

        if (typeFilter !== 'All') {
            result = result.filter(q => q.type === typeFilter);
        }

        setFilteredQuestions(result);
    };

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleConfirmSelection = () => {
        const selected = questions.filter(q => selectedIds.has(q.id));
        onSelectQuestions(selected);
    };

    const subjects = ['All', ...Array.from(new Set(questions.map(q => q.subject))).filter(Boolean)];
    const types = ['All', 'MCQ', 'TrueFalse', 'ShortAnswer'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <Database size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Question Bank</h2>
                            <p className="text-xs text-slate-500 font-medium">Select questions to add to your paper</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Filters */}
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex gap-4 items-center">
                    <div className="flex-1 relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search questions by text or topic..."
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:border-indigo-500 outline-none transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none cursor-pointer hover:border-indigo-300 transition-all"
                        value={subjectFilter}
                        onChange={e => setSubjectFilter(e.target.value)}
                    >
                        {subjects.map(s => <option key={s} value={s}>{s === 'All' ? 'All Subjects' : s}</option>)}
                    </select>
                    <select
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none cursor-pointer hover:border-indigo-300 transition-all"
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value)}
                    >
                        {types.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
                    </select>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                            <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin"></div>
                            <p className="text-xs font-bold uppercase tracking-wider">Loading Bank...</p>
                        </div>
                    ) : filteredQuestions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <Database size={48} className="mb-4 opacity-20" />
                            <p className="font-medium">No questions found matching your filters.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredQuestions.map(q => (
                                <div
                                    key={q.id}
                                    onClick={() => toggleSelection(q.id)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${selectedIds.has(q.id) ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 hover:border-indigo-100'}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${selectedIds.has(q.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'}`}>
                                            {selectedIds.has(q.id) && <Check size={12} strokeWidth={3} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex gap-2 mb-1">
                                                <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">{q.subject}</span>
                                                <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">{q.type}</span>
                                                <span className="text-[10px] font-bold text-slate-400 ml-auto">{new Date(q.createdDate).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm font-medium text-slate-800 line-clamp-2" dangerouslySetInnerHTML={{ __html: q.question_eng }}></p>
                                            {q.question_hin && (
                                                <p className="text-xs text-slate-500 italic mt-1 line-clamp-1">{q.question_hin}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
                    <div className="text-sm font-medium text-slate-500">
                        {selectedIds.size} questions selected
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmSelection}
                            disabled={selectedIds.size === 0}
                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:shadow-none translate-y-0 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            Add Selected to Paper
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
