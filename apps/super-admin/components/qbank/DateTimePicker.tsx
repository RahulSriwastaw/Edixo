import React, { useState } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateTimePickerProps {
    selectedDate: string;
    onDateChange: (date: string) => void;
    selectedTimeRange?: 'Morning' | 'Afternoon' | 'Evening' | 'All Day';
    onTimeRangeChange?: (range: 'Morning' | 'Afternoon' | 'Evening' | 'All Day') => void;
    showQuickPresets?: boolean;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
    selectedDate,
    onDateChange,
    selectedTimeRange = 'All Day',
    onTimeRangeChange,
    showQuickPresets = true
}) => {
    const [showCalendar, setShowCalendar] = useState(false);

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

    const quickPresets = [
        { label: 'Today', value: today },
        { label: 'Yesterday', value: yesterday },
        { label: 'Last 7 Days', value: weekAgo },
        { label: 'Last 30 Days', value: monthAgo }
    ];

    const timeRanges: Array<'Morning' | 'Afternoon' | 'Evening' | 'All Day'> = ['Morning', 'Afternoon', 'Evening', 'All Day'];

    return (
        <div className="space-y-3">
            {/* Date Selector */}
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar size={10} className="text-primary" />
                    Event Date
                </label>

                <div className="relative">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => onDateChange(e.target.value)}
                        max={today}
                        className="w-full h-10 px-3 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-primary/20 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                </div>

                {/* Quick Date Presets */}
                {showQuickPresets && (
                    <div className="flex flex-wrap gap-2">
                        {quickPresets.map(preset => (
                            <button
                                key={preset.label}
                                onClick={() => onDateChange(preset.value)}
                                className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${selectedDate === preset.value
                                        ? 'bg-primary text-white shadow-md shadow-primary/30'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Time Range Selector */}
            {onTimeRangeChange && (
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock size={10} className="text-indigo-500" />
                        Time Range
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                        {timeRanges.map(range => (
                            <button
                                key={range}
                                onClick={() => onTimeRangeChange(range)}
                                className={`h-9 px-4 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-2 ${selectedTimeRange === range
                                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                                        : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-indigo-300'
                                    }`}
                            >
                                {range === 'Morning' && '🌅'}
                                {range === 'Afternoon' && '☀️'}
                                {range === 'Evening' && '🌆'}
                                {range === 'All Day' && '🌍'}
                                <span>{range}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Selected Date Display */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Selected</div>
                <div className="text-sm font-bold text-slate-800">
                    {new Date(selectedDate).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                    {selectedTimeRange !== 'All Day' && (
                        <span className="text-indigo-600 ml-2">({selectedTimeRange})</span>
                    )}
                </div>
            </div>
        </div>
    );
};
