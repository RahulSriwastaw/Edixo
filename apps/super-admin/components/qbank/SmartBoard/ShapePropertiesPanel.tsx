import React, { useRef, useEffect, useState } from 'react';
import { useBoardStore } from './store';
import { Tool } from './types';
import {
    Minus, Square, Circle, Triangle, Star, ArrowRight,
    Hexagon, MessageSquare, Diamond,
    Check, Palette, Layers, Box, Maximize2
} from 'lucide-react';

const shapes = [
    { id: 'rectangle', label: 'Rectangle', icon: Square },
    { id: 'circle', label: 'Circle', icon: Circle },
    { id: 'triangle', label: 'Triangle', icon: Triangle },
    { id: 'star', label: 'Star', icon: Star },
    { id: 'hexagon', label: 'Hexagon', icon: Hexagon },
    { id: 'pentagon', label: 'Pentagon', icon: Diamond }, // Approx icon
    { id: 'speech_bubble', label: 'Speech', icon: MessageSquare },
    { id: 'arrow', label: 'Arrow', icon: ArrowRight },
    { id: 'line', label: 'Line', icon: Minus }
];

export const ShapePropertiesPanel: React.FC = () => {
    const {
        tool, setTool,
        color, setColor,
        size, setSize,
        fillColor, setFillColor,
        isFillEnabled, setIsFillEnabled,
        isBorderEnabled, setIsBorderEnabled,
        borderStyle, setBorderStyle,
        opacity, setOpacity,
        setActivePanel
    } = useBoardStore();

    const [activeTab, setActiveTab] = useState<'stroke' | 'fill'>('stroke');
    const panelRef = useRef<HTMLDivElement>(null);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | PointerEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setActivePanel('none');
            }
        };

        const timeoutId = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside, true);
            document.addEventListener('pointerdown', handleClickOutside, true);
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('mousedown', handleClickOutside, true);
            document.removeEventListener('pointerdown', handleClickOutside, true);
        };
    }, [setActivePanel]);

    const colors = [
        '#ffffff', '#ef4444', '#f97316', '#f59e0b',
        '#84cc16', '#10b981', '#06b6d4', '#3b82f6',
        '#6366f1', '#8b5cf6', '#ec4899', '#000000',
        '#1e293b', '#334155', '#475569'
    ];

    const borderStyles = [
        { id: 'solid', label: 'Solid', preview: 'border-solid' },
        { id: 'dashed', label: 'Dashed', preview: 'border-dashed' },
        { id: 'dotted', label: 'Dotted', preview: 'border-dotted' },
    ];

    const renderPreview = () => {
        const strokeWidth = isBorderEnabled ? Math.min(size, 4) : 0;
        const strokeColor = isBorderEnabled ? color : 'transparent';
        const fillColorVal = isFillEnabled ? fillColor : 'transparent';
        const strokeDasharray = borderStyle === 'dashed' ? '5,5' : borderStyle === 'dotted' ? '2,2' : undefined;

        const commonProps = {
            stroke: strokeColor,
            strokeWidth: strokeWidth,
            fill: fillColorVal,
            strokeDasharray: strokeDasharray,
            opacity: opacity,
            vectorEffect: "non-scaling-stroke"
        };

        switch (tool) {
            case 'circle':
                return <circle cx="50" cy="50" r="30" {...commonProps} />;
            case 'rectangle':
                return <rect x="20" y="25" width="60" height="50" rx="4" {...commonProps} />;
            case 'triangle':
                return <polygon points="50,20 20,80 80,80" {...commonProps} />;
            case 'star':
                return <polygon points="50,15 61,38 86,38 66,53 73,77 50,65 27,77 34,53 14,38 39,38" {...commonProps} />;
            case 'hexagon':
                return <polygon points="50,20 80,35 80,65 50,80 20,65 20,35" {...commonProps} />;
            case 'pentagon':
                return <polygon points="50,20 80,45 70,80 30,80 20,45" {...commonProps} />;
            case 'speech_bubble':
                return (
                    <g {...commonProps}>
                        <path d="M20,30 A10,10 0 0,1 30,20 H70 A10,10 0 0,1 80,30 V60 A10,10 0 0,1 70,70 H40 L20,85 V70 H20 A10,10 0 0,1 10,60 V30 Z" transform="translate(5, -5)" />
                    </g>
                );
            case 'arrow':
                return (
                    <g opacity={opacity}>
                        <line x1="20" y1="50" x2="70" y2="50" stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} />
                        <polygon points="70,40 90,50 70,60" fill={strokeColor} />
                    </g>
                );
            case 'line':
                return <line x1="20" y1="20" x2="80" y2="80" stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} opacity={opacity} />;
            default:
                return <rect x="20" y="25" width="60" height="50" rx="4" {...commonProps} />;
        }
    };

    return (
        <div
            ref={panelRef}
            className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-80 max-w-[90vw] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-2 text-slate-200">
                    <Box size={16} className="text-blue-400" />
                    <span className="text-sm font-bold uppercase tracking-wider">Shapes</span>
                </div>
            </div>

            {/* Shape Selector Grid */}
            <div className="p-3 grid grid-cols-4 gap-2 border-b border-white/10">
                {shapes.map(s => (
                    <button
                        key={s.id}
                        onClick={() => setTool(s.id as Tool)}
                        className={`aspect-square p-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all group ${tool === s.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                            }`}
                        title={s.label}
                    >
                        <s.icon size={20} className="transition-transform group-hover:scale-110" />
                    </button>
                ))}
            </div>

            <div className="p-4 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">

                {/* Preview Box */}
                <div className="flex justify-center py-6 bg-gradient-to-br from-white/5 to-transparent rounded-xl border border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="w-24 h-24 flex items-center justify-center relative z-10 filter drop-shadow-2xl">
                        <svg width="100" height="100" viewBox="0 0 100 100" className="drop-shadow-lg">
                            {renderPreview()}
                        </svg>
                    </div>
                </div>

                {/* Properties Tabs */}
                <div>
                    <div className="flex p-1 bg-black/40 rounded-xl mb-4">
                        <button
                            onClick={() => setActiveTab('stroke')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'stroke' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            <div className={`w-3 h-3 border-2 border-current rounded-sm`} />
                            Border
                        </button>
                        <button
                            onClick={() => setActiveTab('fill')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'fill' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            <div className={`w-3 h-3 bg-current rounded-sm`} />
                            Fill
                        </button>
                    </div>

                    {/* Dynamic Content based on Tab */}
                    {activeTab === 'stroke' ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-200">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-400">Enable Border</span>
                                <button
                                    onClick={() => setIsBorderEnabled(!isBorderEnabled)}
                                    className={`w-10 h-5 rounded-full transition-colors relative ${isBorderEnabled ? 'bg-blue-500' : 'bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform ${isBorderEnabled ? 'translate-x-5' : ''}`} />
                                </button>
                            </div>

                            {isBorderEnabled && (
                                <>
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Color</div>
                                        <div className="grid grid-cols-7 gap-2">
                                            {colors.map(c => (
                                                <button
                                                    key={c}
                                                    onClick={() => setColor(c)}
                                                    className={`w-6 h-6 rounded-full border border-white/10 transition-transform ${color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#1e1e1e]' : 'hover:scale-110'}`}
                                                    style={{ backgroundColor: c }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Thickness</div>
                                            <div className="text-xs font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">{size}px</div>
                                        </div>
                                        <input
                                            type="range"
                                            min="1"
                                            max="20"
                                            value={size}
                                            onChange={(e) => setSize(Number(e.target.value))}
                                            className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
                                        />
                                    </div>

                                    <div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Style</div>
                                        <div className="flex gap-2">
                                            {borderStyles.map(style => (
                                                <button
                                                    key={style.id}
                                                    onClick={() => setBorderStyle(style.id as any)}
                                                    className={`flex-1 h-8 rounded-lg border border-white/10 hover:bg-white/5 flex items-center justify-center transition-all ${borderStyle === style.id ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'text-slate-500'}`}
                                                >
                                                    <div className={`w-8 h-0 border-t-2 ${style.preview} border-current`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-400">Enable Fill</span>
                                <button
                                    onClick={() => setIsFillEnabled(!isFillEnabled)}
                                    className={`w-10 h-5 rounded-full transition-colors relative ${isFillEnabled ? 'bg-blue-500' : 'bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform ${isFillEnabled ? 'translate-x-5' : ''}`} />
                                </button>
                            </div>

                            {isFillEnabled && (
                                <div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Color</div>
                                    <div className="grid grid-cols-7 gap-2">
                                        {colors.map(c => (
                                            <button
                                                key={c}
                                                onClick={() => setFillColor(c)}
                                                className={`w-6 h-6 rounded-full border border-white/10 transition-transform ${fillColor === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#1e1e1e]' : 'hover:scale-110'}`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Opacity</div>
                                    <div className="text-xs font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">{Math.round(opacity * 100)}%</div>
                                </div>
                                <input
                                    type="range"
                                    min="10"
                                    max="100"
                                    value={opacity * 100}
                                    onChange={(e) => setOpacity(Number(e.target.value) / 100)}
                                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
