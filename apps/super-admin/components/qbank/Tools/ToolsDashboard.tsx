import React, { useState } from 'react';
import { Sparkles, FileText, ArrowLeft, Wrench, ChevronRight, Layers, Presentation } from 'lucide-react';
import { AIProofreader } from './AIProofreader';
import { PDFToText } from './PDFToText';
import { QuestionFormatter } from './QuestionFormatter';
import { PPTGenerator } from './PPTGenerator/PPTGenerator';

interface ToolsDashboardProps {
    onExit: () => void;
    initialTool?: 'dashboard' | 'proofreader' | 'pdf2text' | 'formatter' | 'ppt-generator';
}

export const ToolsDashboard: React.FC<ToolsDashboardProps> = ({ onExit, initialTool = 'dashboard' }) => {
    const [currentTool, setCurrentTool] = useState<'dashboard' | 'proofreader' | 'pdf2text' | 'formatter' | 'ppt-generator'>(initialTool);

    if (currentTool === 'proofreader') {
        return <AIProofreader onBack={() => setCurrentTool('dashboard')} />;
    }

    if (currentTool === 'pdf2text') {
        return <PDFToText onBack={() => setCurrentTool('dashboard')} />;
    }

    if (currentTool === 'formatter') {
        return <QuestionFormatter onBack={() => setCurrentTool('dashboard')} />;
    }

    if (currentTool === 'ppt-generator') {
        return <PPTGenerator onBack={() => setCurrentTool('dashboard')} />;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 page-fade-in font-sans">
            {/* Dynamic Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -right-[5%] w-[50%] h-[50%] bg-blue-100/50 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[10%] -left-[5%] w-[40%] h-[40%] bg-purple-100/50 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10 max-w-5xl w-full">
                {/* Header */}
                <header className="flex flex-col items-center mb-16 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[28px] flex items-center justify-center mb-6 text-white shadow-xl shadow-indigo-500/20">
                        <Wrench size={40} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                        Creator Tools
                    </h1>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
                        Powerful AI-assisted utilities designed to streamline your curriculum creation and content management workflow.
                    </p>
                </header>

                {/* Tools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                    {/* Tool 1: AI Proofreader */}
                    <button
                        onClick={() => setCurrentTool('proofreader')}
                        className="group bg-white p-8 rounded-[32px] border border-slate-200 hover:border-purple-200 transition-all text-left flex flex-col hover-lift shadow-sm hover:shadow-xl hover:shadow-purple-500/10"
                    >
                        <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 text-purple-500 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                            <Sparkles size={28} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-purple-700 transition-colors">AI Proofreader</h3>
                        <p className="text-slate-500 leading-relaxed mb-8 flex-1">
                            Automatically detect grammar errors, improve style, and ensure academic tone consistency across your materials.
                        </p>
                        <div className="flex items-center text-purple-600 text-xs font-black uppercase tracking-[0.2em]">
                            Launch Tool <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>

                    {/* Tool 2: PDF to Text */}
                    <button
                        onClick={() => setCurrentTool('pdf2text')}
                        className="group bg-white p-8 rounded-[32px] border border-slate-200 hover:border-blue-200 transition-all text-left flex flex-col hover-lift shadow-sm hover:shadow-xl hover:shadow-blue-500/10"
                    >
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                            <FileText size={28} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-blue-700 transition-colors">PDF to Text AI</h3>
                        <p className="text-slate-500 leading-relaxed mb-8 flex-1">
                            Extract editable text from scanned PDFs and images with high-accuracy OCR and layout preservation.
                        </p>
                        <div className="flex items-center text-blue-600 text-xs font-black uppercase tracking-[0.2em]">
                            Launch Tool <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>

                    {/* Tool 3: Question Formatter */}
                    <button
                        onClick={() => setCurrentTool('formatter')}
                        className="group bg-white p-8 rounded-[32px] border border-slate-200 hover:border-indigo-200 transition-all text-left flex flex-col hover-lift shadow-sm hover:shadow-xl hover:shadow-indigo-500/10"
                    >
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                            <Layers size={28} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-indigo-700 transition-colors">Question Formatter</h3>
                        <p className="text-slate-500 leading-relaxed mb-8 flex-1">
                            Extract questions from any file, retain Math/Science formatting, and export to perfectly styled PDF papers.
                        </p>
                        <div className="flex items-center text-indigo-600 text-xs font-black uppercase tracking-[0.2em]">
                            Launch Tool <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>

                    {/* Tool 4: PPT Generator */}
                    <button
                        onClick={() => setCurrentTool('ppt-generator')}
                        className="group bg-white p-8 rounded-[32px] border border-slate-200 hover:border-orange-200 transition-all text-left flex flex-col hover-lift shadow-sm hover:shadow-xl hover:shadow-orange-500/10"
                    >
                        <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 text-orange-500 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                            <Presentation size={28} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-orange-700 transition-colors">AI PPT Generator</h3>
                        <p className="text-slate-500 leading-relaxed mb-8 flex-1">
                            Turn topics or notes into professionally designed PowerPoint presentations in seconds with AI.
                        </p>
                        <div className="flex items-center text-orange-600 text-xs font-black uppercase tracking-[0.2em]">
                            Launch Tool <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>
                </div>

                <div className="mt-16 text-center">
                    <button
                        onClick={onExit}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-slate-500 hover:text-slate-800 hover:bg-white font-bold transition-all"
                    >
                        <ArrowLeft size={18} />
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};
