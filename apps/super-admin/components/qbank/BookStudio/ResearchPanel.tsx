import React, { useState } from 'react';
import { Search, Sparkles, BookOpen, Globe, FileText, ChevronRight, Loader2 } from 'lucide-react';
import { aiOrchestrator, availableModels } from '../../services/aiOrchestrator';

interface ResearchPanelProps {
    onAddToOutline: (content: string) => void;
    subject: string;
}

export const ResearchPanel: React.FC<ResearchPanelProps> = ({ onAddToOutline, subject }) => {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'web' | 'ai'>('ai');

    const handleSearch = async () => {
        if (!query.trim()) return;
        setIsSearching(true);

        // Simulate AI search for now (replace with actual AI call)
        setTimeout(() => {
            setResults([
                `Key concepts in ${query}`,
                `Historical context of ${query}`,
                `Modern applications of ${query}`,
                `Case studies related to ${query}`
            ]);
            setIsSearching(false);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm flex items-center gap-2">
                    <BookOpen size={16} className="text-indigo-600" />
                    Research Assistant
                </h3>
            </div>

            {/* Search Input */}
            <div className="p-4 space-y-3">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder={`Research ${subject} topics...`}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    />
                </div>

                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('ai')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${activeTab === 'ai' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Sparkles size={12} /> AI Insights
                    </button>
                    <button
                        onClick={() => setActiveTab('web')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${activeTab === 'web' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Globe size={12} /> Web Sources
                    </button>
                </div>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isSearching ? (
                    <div className="flex flex-col items-center justify-center h-32 text-slate-400 gap-3">
                        <Loader2 size={24} className="animate-spin text-indigo-600" />
                        <span className="text-xs font-bold">Analyzing {subject}...</span>
                    </div>
                ) : results.length > 0 ? (
                    results.map((result, idx) => (
                        <div key={idx} className="group p-3 border border-slate-100 rounded-xl hover:border-indigo-100 hover:bg-indigo-50/30 transition-all">
                            <p className="text-sm text-slate-700 font-medium mb-2">{result}</p>
                            <button
                                onClick={() => onAddToOutline(result)}
                                className="text-xs font-bold text-indigo-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <ChevronRight size={12} /> Add to Outline
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-slate-400 py-8">
                        <Search size={32} className="mx-auto mb-2 opacity-20" />
                        <p className="text-xs font-medium">Search for topics to gather insights</p>
                    </div>
                )}
            </div>
        </div>
    );
};
