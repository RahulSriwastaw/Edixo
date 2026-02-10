import React from 'react';
import { Filter, FilterX, Sparkles, Flag, ChevronDown, ChevronRight } from 'lucide-react';

interface AdvancedFilterPanelProps {
    showPanel: boolean;
    setShowPanel: (show: boolean) => void;

    // Filters
    topicFilter: string;
    setTopicFilter: (val: string) => void;
    sectionFilter: string;
    setSectionFilter: (val: string) => void;
    collectionFilter: string;
    setCollectionFilter: (val: string) => void;
    aiGeneratedFilter: 'All' | 'AI' | 'Manual';
    setAiGeneratedFilter: (val: 'All' | 'AI' | 'Manual') => void;
    flaggedFilter: 'All' | 'Flagged' | 'Unflagged';
    setFlaggedFilter: (val: 'All' | 'Flagged' | 'Unflagged') => void;
    smartPreset: string;

    // Options
    uniqueTopics: string[];
    uniqueSections: string[];
    uniqueCollections: string[];

    // Results
    filteredCount: number;
    totalCount: number;

    // Actions
    clearAllFilters: () => void;
    applySmartPreset: (preset: string) => void;
}

export const AdvancedFilterPanel: React.FC<AdvancedFilterPanelProps> = ({
    showPanel,
    setShowPanel,
    topicFilter,
    setTopicFilter,
    sectionFilter,
    setSectionFilter,
    collectionFilter,
    setCollectionFilter,
    aiGeneratedFilter,
    setAiGeneratedFilter,
    flaggedFilter,
    setFlaggedFilter,
    smartPreset,
    uniqueTopics,
    uniqueSections,
    uniqueCollections,
    filteredCount,
    totalCount,
    clearAllFilters,
    applySmartPreset
}) => {
    const hasActiveFilters = filteredCount < totalCount;

    return (
        <div className="space-y-3">
            {/* Toggle Button */}
            <div className="flex items-center justify-between gap-2">
                <button
                    data-testid="advanced-filters-toggle"
                    onClick={() => setShowPanel(!showPanel)}
                    className="h-8 px-4 bg-white border border-slate-200 rounded-md text-[11px] font-bold text-slate-600 hover:border-primary/30 hover:text-primary transition-all flex items-center gap-2"
                >
                    <Filter size={14} />
                    Advanced Filters
                    {showPanel ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </button>

                {hasActiveFilters && (
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400">
                            Showing: {filteredCount} / {totalCount}
                        </span>
                        <button
                            data-testid="clear-all-filters"
                            onClick={clearAllFilters}
                            className="h-7 px-3 bg-error/10 text-error rounded-md text-[10px] font-bold hover:bg-error/20 transition-all flex items-center gap-1"
                        >
                            <FilterX size={12} />
                            Clear All
                        </button>
                    </div>
                )}
            </div>

            {/* Filter Panel */}
            {showPanel && (
                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">

                        {/* Topic */}
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Topic</label>
                            <select
                                data-testid="topic-filter"
                                value={topicFilter}
                                onChange={(e) => setTopicFilter(e.target.value)}
                                className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-md text-[11px] font-medium outline-none focus:border-primary transition-all"
                            >
                                <option value="All">All Topics</option>
                                {uniqueTopics.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        {/* Section */}
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Section</label>
                            <select
                                value={sectionFilter}
                                onChange={(e) => setSectionFilter(e.target.value)}
                                className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-md text-[11px] font-medium outline-none focus:border-primary transition-all"
                            >
                                <option value="All">All Sections</option>
                                {uniqueSections.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        {/* Collection */}
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Collection</label>
                            <select
                                value={collectionFilter}
                                onChange={(e) => setCollectionFilter(e.target.value)}
                                className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-md text-[11px] font-medium outline-none focus:border-primary transition-all"
                            >
                                <option value="All">All Collections</option>
                                {uniqueCollections.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        {/* AI Source */}
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <Sparkles size={9} className="text-primary" />
                                Source
                            </label>
                            <select
                                data-testid="ai-source-filter"
                                value={aiGeneratedFilter}
                                onChange={(e) => setAiGeneratedFilter(e.target.value as any)}
                                className="w-full h-8 px-2 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-primary/20 rounded-md text-[11px] font-bold outline-none focus:border-primary transition-all"
                            >
                                <option value="All">All Sources</option>
                                <option value="AI">AI Generated</option>
                                <option value="Manual">Manual Entry</option>
                            </select>
                        </div>

                        {/* Flagged */}
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <Flag size={9} className="text-warning" />
                                Status
                            </label>
                            <select
                                value={flaggedFilter}
                                onChange={(e) => setFlaggedFilter(e.target.value as any)}
                                className="w-full h-8 px-2 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-warning/20 rounded-md text-[11px] font-bold outline-none focus:border-warning transition-all"
                            >
                                <option value="All">All Status</option>
                                <option value="Flagged">Flagged for Review</option>
                                <option value="Unflagged">Not Flagged</option>
                            </select>
                        </div>
                    </div>

                    {/* Smart Presets */}
                    <div className="mt-4 pt-3 border-t border-slate-200">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Quick Filters</label>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { label: 'Recent AI Generated', icon: Sparkles },
                                { label: 'Flagged for Review', icon: Flag },
                                { label: 'High Difficulty Unattempted', icon: Filter }
                            ].map(({ label, icon: Icon }) => (
                                <button
                                    key={label}
                                    onClick={() => applySmartPreset(label)}
                                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all flex items-center gap-1.5 ${smartPreset === label
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    <Icon size={10} />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
