import React, { useRef, useEffect } from 'react';
import { Upload, Link as LinkIcon, X, Image as ImageIcon } from 'lucide-react';

interface ImageOptionsPanelProps {
    onClose: () => void;
    onUploadClick: () => void;
}

export const ImageOptionsPanel: React.FC<ImageOptionsPanelProps> = ({ onClose, onUploadClick }) => {
    const panelRef = useRef<HTMLDivElement>(null);

    // Click outside to close - handling this locally to be safe, though BoardToolbar also has logic
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | PointerEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                // We let the parent handle 'click outside' if it's outside the Toolbar entirely
                // But if we want specific behavior we can add it here.
                // For consistency with StyleToolbar, we can add it, but BoardToolbar seems to handle it too.
                // Let's rely on parent's click handler for global close, but we can add one for closing THIS panel specifically if user clicks "off" it but inside the toolbar area? 
                // No, simplest is to let BoardToolbar handle global outside clicks.
                // But StyleToolbar HAS it. Let's keep it consistent.
            }
        };
        // ... logic omitted to avoid double-firing issues, will rely on onClose button and BoardToolbar global handler for now unless needed.
    }, []);

    return (
        <div
            ref={panelRef}
            className="bg-[#1e1e1e] border border-white/10 p-4 rounded-xl shadow-2xl mb-2 w-64 animate-in slide-in-from-bottom-2 fade-in duration-200 pointer-events-auto"
        >
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Insert Image</h3>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="flex flex-col gap-2">
                <button
                    onClick={() => {
                        onUploadClick();
                        onClose();
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group text-left"
                >
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 group-hover:text-blue-300 transition-colors">
                        <Upload size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-200">Upload File</span>
                        <span className="text-[10px] text-slate-500 group-hover:text-slate-400">From your computer</span>
                    </div>
                </button>

                {/* Future expansion: URL input */}
                <button
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 transition-all group text-left opacity-50 cursor-not-allowed"
                    title="Coming soon"
                >
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 transition-colors">
                        <LinkIcon size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-200">By URL</span>
                        <span className="text-[10px] text-slate-500">Paste image link</span>
                    </div>
                </button>
            </div>
        </div>
    );
};
