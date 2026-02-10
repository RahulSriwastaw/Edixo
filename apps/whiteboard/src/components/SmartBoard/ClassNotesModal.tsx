import React, { useState, useEffect } from 'react';
import { X, FileText, Download, Upload, Loader2, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useBoardStore } from './store';
import { storageService } from '../../services/storageService';

interface ClassNotesModalProps {
    onClose: () => void;
    setId?: string;
}

interface ManagedSlide {
    originalIndex: number;
    url: string;
}

export const ClassNotesModal: React.FC<ClassNotesModalProps> = ({ onClose, setId }) => {
    const { slideImages } = useBoardStore();
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [managedSlides, setManagedSlides] = useState<ManagedSlide[]>([]);

    useEffect(() => {
        // Initialize from store
        const indices = Object.keys(slideImages).map(Number).sort((a, b) => a - b);
        const initialSlides = indices.map(idx => ({
            originalIndex: idx,
            url: slideImages[idx]
        }));
        setManagedSlides(initialSlides);
    }, [slideImages]);

    const handleDelete = (indexToDelete: number) => {
        if (confirm("Are you sure you want to remove this slide from notes?")) {
            setManagedSlides(prev => prev.filter((_, idx) => idx !== indexToDelete));
        }
    };

    const handleMoveLeft = (index: number) => {
        if (index <= 0) return;
        setManagedSlides(prev => {
            const newSlides = [...prev];
            [newSlides[index - 1], newSlides[index]] = [newSlides[index], newSlides[index - 1]];
            return newSlides;
        });
    };

    const handleMoveRight = (index: number) => {
        if (index >= managedSlides.length - 1) return;
        setManagedSlides(prev => {
            const newSlides = [...prev];
            [newSlides[index], newSlides[index + 1]] = [newSlides[index + 1], newSlides[index]];
            return newSlides;
        });
    };

    const generatePDF = async () => {
        if (managedSlides.length === 0) return null;

        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [window.innerWidth, window.innerHeight]
        });

        for (let i = 0; i < managedSlides.length; i++) {
            const slide = managedSlides[i];
            if (i > 0) pdf.addPage();
            pdf.addImage(slide.url, 'JPEG', 0, 0, window.innerWidth, window.innerHeight);
        }

        return pdf;
    };

    const handleDownload = async () => {
        setIsGenerating(true);
        try {
            const pdf = await generatePDF();
            if (pdf) {
                pdf.save(`ClassNotes_${new Date().toISOString().split('T')[0]}.pdf`);
            }
        } catch (error) {
            console.error("PDF Generation failed", error);
            alert("Failed to generate PDF");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleUpload = async () => {
        if (!setId) {
            alert("Session ID not found. Cannot upload.");
            return;
        }
        setIsUploading(true);
        try {
            const pdf = await generatePDF();
            if (pdf) {
                const pdfBlob = pdf.output('blob');
                const fileName = `ClassNotes_${setId}_${Date.now()}.pdf`;
                const url = await storageService.uploadClassNotePDF(pdfBlob, fileName);

                if (url) {
                    const set = await storageService.getSetById(setId);
                    if (set) {
                        await storageService.saveSet({
                            ...set,
                            settings: {
                                ...((set.settings as any) || {}),
                                class_notes_url: url
                            }
                        });
                        alert("Class Notes Uploaded Successfully!");
                    }
                }
            }
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload notes.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-slate-900 border border-white/10 w-[90vw] h-[90vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Class Notes</h2>
                            <p className="text-sm text-slate-400">{managedSlides.length} Slides Ready</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content - Grid View */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#0A0C10]">
                    {managedSlides.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                            <FileText size={48} className="opacity-20" />
                            <p>No slides available. Navigate through questions to capture notes.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {managedSlides.map((slide, index) => (
                                <div key={slide.originalIndex} className="group relative aspect-video bg-slate-800 rounded-xl border border-white/5 overflow-hidden hover:border-indigo-500/50 transition-all shadow-lg flex flex-col">
                                    <div className="relative flex-1 bg-black/20 w-full overflow-hidden">
                                        <img
                                            src={slide.url}
                                            alt={`Slide ${slide.originalIndex + 1}`}
                                            className="absolute inset-0 w-full h-full object-contain"
                                        />

                                        {/* Overlay Controls */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                                            <div className="flex justify-between items-start">
                                                <div className="px-2 py-1 bg-black/60 backdrop-blur-md rounded text-xs font-bold text-white">
                                                    #{index + 1} (Slide {slide.originalIndex + 1})
                                                </div>
                                                <button
                                                    onClick={() => handleDelete(index)}
                                                    className="p-2 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-colors"
                                                    title="Delete Page"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-center gap-4">
                                                <button
                                                    onClick={() => handleMoveLeft(index)}
                                                    disabled={index === 0}
                                                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                    title="Move Left"
                                                >
                                                    <ArrowLeft size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleMoveRight(index)}
                                                    disabled={index === managedSlides.length - 1}
                                                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                    title="Move Right"
                                                >
                                                    <ArrowRight size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer - Actions */}
                <div className="p-4 border-t border-white/10 bg-slate-900/50 flex items-center justify-end gap-4">
                    <button
                        onClick={handleDownload}
                        disabled={isGenerating || managedSlides.length === 0}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                        Download PDF
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={isUploading || managedSlides.length === 0}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                        Upload to Server
                    </button>
                </div>
            </div>
        </div>
    );
};
