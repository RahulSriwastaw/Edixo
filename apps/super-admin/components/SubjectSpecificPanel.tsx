import React, { useState } from 'react';
import { Calendar, BookOpen, Sparkles, ChevronRight, ChevronDown } from 'lucide-react';
import { DateTimePicker } from './DateTimePicker';
import { getSubjectConfig } from '../config/subjectConfig';

interface SubjectSpecificPanelProps {
    subject: string;
    onParamsChange: (params: any) => void;
}

export const SubjectSpecificPanel: React.FC<SubjectSpecificPanelProps> = ({
    subject,
    onParamsChange
}) => {
    const config = getSubjectConfig(subject);

    // State for Current Affairs
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedTimeRange, setSelectedTimeRange] = useState<'Morning' | 'Afternoon' | 'Evening' | 'All Day'>('All Day');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [eventType, setEventType] = useState('');

    // State for topic trees
    const [expandedBranch, setExpandedBranch] = useState<string | null>(null);
    const [selectedTopic, setSelectedTopic] = useState('');

    // State for custom fields
    const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});

    // Update parent whenever values change
    React.useEffect(() => {
        onParamsChange({
            date: selectedDate,
            timeRange: selectedTimeRange,
            category: selectedCategory,
            topic: selectedTopic,
            eventType,
            ...customFieldValues
        });
    }, [selectedDate, selectedTimeRange, selectedCategory, selectedTopic, eventType, customFieldValues]);

    // If no special config, return null
    if (Object.keys(config).length === 0) {
        return null;
    }

    return (
        <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-3 shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-6 h-6 bg-primary/10 rounded-md flex items-center justify-center text-primary">
                    <Sparkles size={12} />
                </div>
                <div className="flex-1">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">{subject} Config</h3>
                </div>
            </div>

            {/* Current Affairs: Date/Time Picker */}
            {config.hasDatePicker && (
                <DateTimePicker
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                    selectedTimeRange={selectedTimeRange}
                    onTimeRangeChange={config.hasTimePicker ? setSelectedTimeRange : undefined}
                    showQuickPresets={true}
                />
            )}

            {/* Topic Categories (Compact) */}
            {config.topicCategories && config.topicCategories.length > 0 && (
                <div className="flex items-center gap-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider shrink-0 w-16">Category</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="flex-1 h-7 px-2 bg-slate-50 border border-slate-200 rounded-md text-[11px] font-bold text-slate-700 outline-none focus:border-primary transition-all"
                    >
                        <option value="">Select Category</option>
                        {config.topicCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Topic Tree (Compact) */}
            {config.topicTree && (
                <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <BookOpen size={10} className="text-indigo-500" />
                        Topic
                    </label>

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-1 max-h-40 overflow-y-auto custom-scrollbar">
                        {Object.entries(config.topicTree).map(([branch, topics]) => (
                            <div key={branch} className="border-b border-slate-100 last:border-0">
                                <button
                                    onClick={() => setExpandedBranch(expandedBranch === branch ? null : branch)}
                                    className="w-full flex items-center justify-between p-1.5 hover:bg-white rounded-md transition-all group"
                                >
                                    <span className="text-[10px] font-bold text-slate-700 group-hover:text-primary">{branch}</span>
                                    {expandedBranch === branch ? <ChevronDown size={12} className="text-slate-400" /> : <ChevronRight size={12} className="text-slate-400" />}
                                </button>

                                {expandedBranch === branch && (
                                    <div className="pl-2 pr-1 pb-1 flex flex-wrap gap-1">
                                        {topics.map(topic => (
                                            <button
                                                key={topic}
                                                onClick={() => setSelectedTopic(topic)}
                                                className={`px-2 py-1 rounded text-[9px] font-bold transition-all border ${selectedTopic === topic
                                                    ? 'bg-primary text-white border-primary'
                                                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                                    }`}
                                            >
                                                {topic}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Custom Fields (Compact Grid) */}
            {config.customFields && (
                <div className="grid grid-cols-1 gap-2">
                    {config.customFields.map(field => (
                        <div key={field.name} className="flex items-center gap-2">
                            {field.type !== 'checkbox' && (
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider shrink-0 w-16 truncate">{field.name}</label>
                            )}

                            {field.type === 'select' && field.options && (
                                <select
                                    value={customFieldValues[field.name] || ''}
                                    onChange={(e) => setCustomFieldValues({ ...customFieldValues, [field.name]: e.target.value })}
                                    className="flex-1 h-7 px-2 bg-slate-50 border border-slate-200 rounded-md text-[11px] font-medium text-slate-700 outline-none focus:border-primary"
                                >
                                    <option value="">Select {field.name}</option>
                                    {field.options.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            )}

                            {field.type === 'text' && (
                                <input
                                    type="text"
                                    value={customFieldValues[field.name] || ''}
                                    onChange={(e) => setCustomFieldValues({ ...customFieldValues, [field.name]: e.target.value })}
                                    className="flex-1 h-7 px-2 bg-slate-50 border border-slate-200 rounded-md text-[11px] font-medium text-slate-700 outline-none focus:border-primary"
                                    placeholder={`Enter ${field.name}`}
                                />
                            )}

                            {field.type === 'checkbox' && (
                                <label className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 cursor-pointer hover:border-primary transition-all h-7">
                                    <input
                                        type="checkbox"
                                        checked={customFieldValues[field.name] || false}
                                        onChange={(e) => setCustomFieldValues({ ...customFieldValues, [field.name]: e.target.checked })}
                                        className="w-3 h-3 text-primary rounded focus:ring-1 focus:ring-primary/20"
                                    />
                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">{field.name}</span>
                                </label>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Formula Selector (Compact) */}
            {config.hasFormulaSelector && (
                <label className="flex items-center gap-2 bg-amber-50 border border-amber-200/50 rounded-md px-2 py-1.5 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={customFieldValues['includeFormulas'] || false}
                        onChange={(e) => setCustomFieldValues({ ...customFieldValues, includeFormulas: e.target.checked })}
                        className="w-3 h-3 text-amber-600 rounded focus:ring-1 focus:ring-amber-200"
                    />
                    <span className="text-[9px] font-bold text-amber-700 uppercase tracking-wide">Include Formulas</span>
                </label>
            )}

            {/* Diagram Option (Compact) */}
            {config.hasDiagramOption && (
                <label className="flex items-center gap-2 bg-indigo-50 border border-indigo-200/50 rounded-md px-2 py-1.5 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={customFieldValues['requiresDiagram'] || false}
                        onChange={(e) => setCustomFieldValues({ ...customFieldValues, requiresDiagram: e.target.checked })}
                        className="w-3 h-3 text-indigo-600 rounded focus:ring-1 focus:ring-indigo-200"
                    />
                    <span className="text-[9px] font-bold text-indigo-700 uppercase tracking-wide">Diagram Questions</span>
                </label>
            )}
        </div>
    );
};
