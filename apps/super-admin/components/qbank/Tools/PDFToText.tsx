import React from 'react';
import { ArrowLeft, FileText, ScanText, Upload } from 'lucide-react';

interface PDFToTextProps {
    onBack: () => void;
}

export const PDFToText: React.FC<PDFToTextProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col p-6 animate-in fade-in slide-in-from-bottom-4">
            <header className="flex items-center gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-all"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                        <FileText className="text-blue-600" />
                        PDF to Text with AI
                    </h1>
                    <p className="text-slate-500 font-medium">Extract and structure text from scanned PDFs using OCR and AI.</p>
                </div>
            </header>

            <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-lg p-10 border-2 border-dashed border-slate-200 rounded-3xl bg-white/50">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
                        <ScanText size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Coming Soon</h3>
                    <p className="text-slate-500 leading-relaxed">
                        This tool is currently under development. It will allow you to convert complex PDF documents into editable text using state-of-the-art AI extraction.
                    </p>
                    <button className="mt-8 px-6 py-3 bg-slate-200 text-slate-400 font-bold rounded-xl cursor-not-allowed">
                        <Upload size={18} className="inline mr-2" />
                        Upload PDF (Disabled)
                    </button>
                </div>
            </div>
        </div>
    );
};
