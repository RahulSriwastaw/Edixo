import React, { useRef, useEffect } from 'react';
import { useBoardStore } from './store';
import { X, Lock, MoreHorizontal, Sun, Zap, Clock, Sparkles, Highlighter } from 'lucide-react';

interface LaserToolbarProps {
    onClose: () => void;
}

export const LaserToolbar: React.FC<LaserToolbarProps> = ({ onClose }) => {
    const { laserConfig, setLaserConfig } = useBoardStore();
    const toolbarRef = useRef<HTMLDivElement>(null);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | PointerEvent) => {
            if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        // Add event listeners with a slight delay to avoid immediate closure
        const timeoutId = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside, true);
            document.addEventListener('pointerdown', handleClickOutside, true);
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('mousedown', handleClickOutside, true);
            document.removeEventListener('pointerdown', handleClickOutside, true);
        };
    }, [onClose]);

    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#000000'];

    return (
        <div
            ref={toolbarRef}
            className="bg-[#1e1e1e] border border-white/10 p-4 rounded-xl shadow-2xl mb-2 w-80 max-w-[90vw] animate-in slide-in-from-bottom-2 fade-in duration-200 pointer-events-auto"
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Laser Pointer</h3>
                    <div className="bg-white/5 rounded px-2 py-0.5 text-[10px] text-slate-400">Beta</div>
                </div>
                <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <Lock size={14} />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={16} />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            </div>

            <div className="space-y-6">

                {/* Preview Area */}
                <div className="h-16 bg-white/5 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
                    {/* Simple CSS preview */}
                    <div
                        className="w-32 h-1 rounded-full absolute"
                        style={{
                            backgroundColor: laserConfig.effect === 'white-burn' ? '#ffffff' : laserConfig.color,
                            boxShadow: `0 0 ${laserConfig.glow ? '10px' : '0px'} ${laserConfig.color}, 0 0 ${laserConfig.glow ? '20px' : '0px'} ${laserConfig.color}`,
                            height: laserConfig.size,
                            opacity: laserConfig.opacity
                        }}
                    />
                </div>

                {/* Mode Switcher */}
                <div className="bg-white/5 p-1 rounded-lg flex text-xs">
                    <button
                        onClick={() => setLaserConfig({ mode: 'trail' })}
                        className={`flex-1 py-1.5 rounded-md transition-all ${laserConfig.mode === 'trail' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                        Trail
                    </button>
                    <button
                        onClick={() => setLaserConfig({ mode: 'point' })}
                        className={`flex-1 py-1.5 rounded-md transition-all ${laserConfig.mode === 'point' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                        Point
                    </button>
                </div>

                {/* Size Slider */}
                <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Size</span>
                        <span className="bg-black/40 px-2 py-0.5 rounded text-[10px] text-slate-300">{laserConfig.size}pt</span>
                    </div>
                    <input
                        type="range"
                        min="2"
                        max="20"
                        value={laserConfig.size}
                        onChange={(e) => setLaserConfig({ size: Number(e.target.value) })}
                        className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-600 mt-1 font-mono">
                        <span>2</span><span>10</span><span>20</span>
                    </div>
                </div>

                {/* Appearance Section */}
                <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Appearance</div>

                    {/* Colors */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {colors.map(c => (
                            <button
                                key={c}
                                onClick={() => setLaserConfig({ color: c })}
                                className={`w-6 h-6 rounded-full border-2 transition-transform ${laserConfig.color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-110'}`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>

                    {/* Effects */}
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setLaserConfig({ effect: 'standard' })}
                            className={`flex-1 p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${laserConfig.effect === 'standard' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:bg-white/5'}`}
                        >
                            <div className="w-8 h-1 rounded-full bg-red-500" />
                            <span className="text-xs text-slate-300">Standard</span>
                        </button>
                        <button
                            onClick={() => setLaserConfig({ effect: 'white-burn' })}
                            className={`flex-1 p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${laserConfig.effect === 'white-burn' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:bg-white/5'}`}
                        >
                            <div className="w-8 h-1 rounded-full bg-white shadow-[0_0_8px_rgba(239,68,68,1)]" />
                            <span className="text-xs text-slate-300">White burn</span>
                        </button>
                    </div>

                    {/* Opacity */}
                    <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Opacity</span>
                            <span className="font-mono text-blue-400">{Math.round(laserConfig.opacity * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.1"
                            value={laserConfig.opacity}
                            onChange={(e) => setLaserConfig({ opacity: Number(e.target.value) })}
                            className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>
                </div>

                {/* Advanced Section */}
                <div className="border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400">Advanced</span>
                    </div>

                    {/* Timing */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                            <Clock size={14} />
                            <span>Timing</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">Delay</span>
                            <select
                                value={laserConfig.duration}
                                onChange={(e) => setLaserConfig({ duration: Number(e.target.value) })}
                                className="bg-black/20 border border-white/10 rounded px-2 py-1 text-xs text-slate-300 outline-none"
                            >
                                <option value={500}>0.5s</option>
                                <option value={1000}>1.0s</option>
                                <option value={2000}>2.0s</option>
                                <option value={5000}>5.0s</option>
                            </select>
                        </div>
                    </div>

                    {/* Glow Toggle */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                            <Sun size={14} />
                            <div>
                                <div className="font-medium">Glow</div>
                                <div className="text-[10px] text-slate-500">Blur effect around line</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setLaserConfig({ glow: !laserConfig.glow })}
                            className={`w-10 h-5 rounded-full relative transition-colors ${laserConfig.glow ? 'bg-blue-600' : 'bg-white/10'}`}
                        >
                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${laserConfig.glow ? 'left-6' : 'left-1'}`} />
                        </button>
                    </div>

                    {/* Highlight Mode Toggle */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                            <Highlighter size={14} />
                            <div>
                                <div className="font-medium">Highlight mode</div>
                                <div className="text-[10px] text-slate-500">Effect applies to Border/Fill</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setLaserConfig({ highlight: !laserConfig.highlight })}
                            className={`w-10 h-5 rounded-full relative transition-colors ${laserConfig.highlight ? 'bg-blue-600' : 'bg-white/10'}`}
                        >
                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${laserConfig.highlight ? 'left-6' : 'left-1'}`} />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
