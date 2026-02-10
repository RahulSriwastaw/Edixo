import React from 'react';
import { useBoardStore } from './store';
import { Copy, Trash2, ArrowUp, ArrowDown, X, Maximize, RotateCw } from 'lucide-react';

export const SelectionToolbar = () => {
    const { 
        selectedId, strokes, 
        duplicateStroke, deleteStroke, bringToFront, sendToBack,
        setSelectedId, updateStroke
    } = useBoardStore();

    if (!selectedId) return null;

    const selectedStroke = strokes.find(s => s.id === selectedId);
    if (!selectedStroke) return null;

    const isImage = selectedStroke.tool === 'image';

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#1e1e1e] border border-white/10 p-2 rounded-xl shadow-2xl flex items-center gap-1 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200 pointer-events-auto">
            {/* Header / Label */}
            <div className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-r border-white/10 mr-1 flex items-center h-full">
                {isImage ? 'Image' : 'Selection'}
            </div>

            {/* Z-Index Controls */}
            <button 
                onClick={() => bringToFront(selectedId)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                title="Bring to Front"
            >
                <ArrowUp size={16} />
            </button>
            <button 
                onClick={() => sendToBack(selectedId)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                title="Send to Back"
            >
                <ArrowDown size={16} />
            </button>

            <div className="w-px h-6 bg-white/10 mx-1" />

            {/* Actions */}
            <button 
                onClick={() => duplicateStroke(selectedId)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                title="Duplicate (Ctrl+D)"
            >
                <Copy size={16} />
            </button>

            {isImage && (
                <button 
                    onClick={() => {
                         updateStroke(selectedId, { rotation: 0 });
                    }}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                    title="Reset Rotation"
                >
                    <RotateCw size={16} />
                </button>
            )}

            <div className="w-px h-6 bg-white/10 mx-1" />

            <button 
                onClick={() => deleteStroke(selectedId)}
                className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300"
                title="Delete (Del)"
            >
                <Trash2 size={16} />
            </button>

            <button 
                onClick={() => setSelectedId(null)}
                className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 ml-1"
                title="Deselect"
            >
                <X size={16} />
            </button>
        </div>
    );
};
