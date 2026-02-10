import React, { useState } from 'react';
import { X, Lock, Clock, Tag, Globe, CheckCircle } from 'lucide-react';

interface PublishModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPublish: (settings: ExamSettings) => void;
    currentTitle: string;
}

export interface ExamSettings {
    category: string;
    duration: number; // in minutes
    password?: string;
    isPublic: boolean;
}

export const PublishModal: React.FC<PublishModalProps> = ({ isOpen, onClose, onPublish, currentTitle }) => {
    const [settings, setSettings] = useState<ExamSettings>({
        category: 'Daily',
        duration: 60,
        password: '',
        isPublic: true
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative">

                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Publish Exam</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Configure & Launch</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-200 text-slate-500 hover:bg-slate-300 transition-all">
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 space-y-6">

                    {/* Title Preview */}
                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                        <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block mb-1">Exam Title</span>
                        <div className="font-bold text-indigo-900">{currentTitle || 'Untitled Exam'}</div>
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                            <Tag size={12} /> Category
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {['Daily', 'Weekly', 'Monthly', 'Yearly', 'Special'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSettings(s => ({ ...s, category: cat }))}
                                    className={`py-2 rounded-xl text-[10px] font-bold uppercase transition-all border ${settings.category === cat
                                            ? 'bg-slate-800 text-white border-slate-800 shadow-lg'
                                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Duration & Visibility */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                                <Clock size={12} /> Duration (Mins)
                            </label>
                            <input
                                type="number"
                                value={settings.duration}
                                onChange={e => setSettings(s => ({ ...s, duration: Number(e.target.value) }))}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                                <Globe size={12} /> Visibility
                            </label>
                            <button
                                onClick={() => setSettings(s => ({ ...s, isPublic: !s.isPublic }))}
                                className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-xs transition-all border ${settings.isPublic
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                        : 'bg-amber-50 text-amber-600 border-amber-200'
                                    }`}
                            >
                                {settings.isPublic ? 'Public Access' : 'Private'}
                            </button>
                        </div>
                    </div>

                    {/* Password Protection */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                            <Lock size={12} /> Access Password (Optional)
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Leave empty for open access"
                                value={settings.password}
                                onChange={e => setSettings(s => ({ ...s, password: e.target.value }))}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <Lock size={16} />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-slate-500 font-bold text-xs uppercase hover:bg-slate-100 transition-all">
                        Cancel
                    </button>
                    <button
                        onClick={() => onPublish(settings)}
                        className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                    >
                        <CheckCircle size={16} /> Confirm & Publish
                    </button>
                </div>

            </div>
        </div>
    );
};
