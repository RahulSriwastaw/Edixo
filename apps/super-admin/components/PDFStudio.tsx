import React, { useState, useEffect, useRef } from 'react';
import {
    X, Download, FileText, Settings2, Palette, Eye, Bold, Check, RefreshCw,
    ArrowLeft, Share2, Printer, FileJson, Layers, MapPin, Phone, Globe, ChevronDown,
    ShieldCheck, Sparkles, Calendar, Clock
} from 'lucide-react';
import { Button } from './Button';
import { pdfGeneratorService, PDFConfig } from './services/pdfGeneratorService';
import { storageService } from './services/storageService';
import { QuestionSet, Question } from '../types';
import { PPTStudio } from './PPTStudio';

interface PDFStudioProps {
    initialSetId: string | null;
    onExit: () => void;
}

const PrintStyles = () => (
    <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
            @page { margin: 0; size: auto; }
            body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .no-print { display: none !important; }
            .print-visible { overflow: visible !important; height: auto !important; }
        }
        /* High definition print fix */
        .print-exact {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
    `}} />
);

export const PDFStudio: React.FC<PDFStudioProps> = ({ initialSetId, onExit }) => {
    const [set, setSet] = useState<QuestionSet | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [config, setConfig] = useState<PDFConfig>({
        ...pdfGeneratorService.getConfig(),
        questionColor: '#EF4444',
        optionColor: '#2563EB',
        headerBgColor: '#FFFFFF',
        footerBgColor: '#12122E',
        customFooter: 'Exclusive Study Material',
        mainLogo: '',
        headerContact: 'Contact: 91+ XXXXX XXXXX',
        headerTeacher: 'By: Teacher Name',
        headerExam: 'Target Exam 2026',
        showPageBorder: true,
        show5thOption: true,
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isPPTStudioOpen, setIsPPTStudioOpen] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (!initialSetId) return;
            try {
                const foundSet = await storageService.getSetById(initialSetId);
                if (foundSet) {
                    setSet(foundSet);
                    const allQuestions = await storageService.getQuestions();
                    const filteredQuestions = allQuestions.filter(q => foundSet.questionIds.includes(q.id));
                    setQuestions(filteredQuestions);
                }
            } catch (error) {
                console.error('Error loading PDF studio data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [initialSetId]);

    const previewRef = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
        if (!set || questions.length === 0 || !previewRef.current) {
            console.error('Download aborted: Missing data or preview reference', { set, questions: questions.length, preview: !!previewRef.current });
            return;
        }
        setIsGenerating(true);
        console.log('Initiating PDF download sequence...');
        try {
            await pdfGeneratorService.downloadPDFFromElement(previewRef.current, set);
            console.log('PDF download sequence completed successfully.');
        } catch (error) {
            console.error('CRITICAL: Download error in PDFStudio:', error);
            alert('Failed to download PDF. Please try again. Detailed error: ' + (error instanceof Error ? error.message : String(error)));
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportPPT = () => {
        if (!set || questions.length === 0) {
            alert('No questions to export!');
            return;
        }
        setIsPPTStudioOpen(true);
    };

    const renderIntelligentTags = (q: Question) => {
        // Current Affairs - Show Date (Red)
        if ((q.subject === 'Current Affairs' || q.tags?.includes('Current Affairs')) && q.date) {
            const dateObj = new Date(q.date);
            const dateStr = `${dateObj.getDate()} ${dateObj.toLocaleString('en', { month: 'short' })}, ${dateObj.getFullYear()}`;
            return (
                <span className="inline-flex items-center gap-1.5 text-red-700 text-[9px] font-black uppercase tracking-wider leading-none print-exact">
                    <Calendar size={11} className="stroke-[2.5]" />
                    <span className="mt-[1px]">{dateStr}</span>
                </span>
            );
        }

        // AI Generated - Show Topic (Purple)
        if ((q.tags?.includes('AI-Generated') || q.id?.startsWith('q_')) && q.topic) {
            return (
                <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-200 text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider leading-none print-exact">
                    <Sparkles size={11} className="stroke-[2.5]" />
                    <span className="mt-[1px]">AI: {q.topic}</span>
                </span>
            );
        }

        // Previous Year - Show Exam + Year + Shift (Dark)
        if (q.exam && q.year) {
            return (
                <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 border border-slate-200 text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider leading-none print-exact">
                    <Clock size={11} className="stroke-[2.5]" />
                    <span className="mt-[1px]">
                        {q.exam} | {q.date ? new Date(q.date).toLocaleDateString() + ' | ' : ''} {q.year} {q.section ? `| ${q.section}` : ''}
                    </span>
                </span>
            );
        }

        return null;
    };

    const stripHTML = (html: string) => {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    if (isPPTStudioOpen) {
        return (
            <PPTStudio
                initialSetId={initialSetId}
                questions={questions}
                set={set}
                onExit={() => setIsPPTStudioOpen(false)}
            />
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="animate-spin text-indigo-600" size={48} />
                    <p className="font-black text-slate-400 uppercase tracking-widest text-sm text-center">Loading Studio...</p>
                </div>
            </div>
        );
    }

    if (!set) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="text-center">
                    <Layers size={64} className="mx-auto text-slate-300 mb-6" />
                    <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tighter">Set Not Found</h2>
                    <Button onClick={onExit} variant="secondary">Go Back</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <PrintStyles />
            {/* Top Configuration Area - 5 Column Compact Layout */}
            <div className="bg-white border-b shadow-sm p-2">
                <div className="max-w-[1900px] mx-auto">
                    <div className="grid grid-cols-5 gap-2">

                        {/* Column 1: Layout & Core Text */}
                        <div className="space-y-2">
                            <h3 className="text-[9px] font-black text-slate-700 uppercase border-b pb-1 mb-1">PDF Config</h3>
                            <div className="space-y-1">
                                <RangeSlider label="Font Size" value={config.fontSize} min={10} max={32} onChange={v => setConfig({ ...config, fontSize: v })} />
                                <RangeSlider label="Spacing" value={config.spacing} min={5} max={40} onChange={v => setConfig({ ...config, spacing: v })} />
                                <RangeSlider label="Question Gap" value={config.questionGap || 24} min={0} max={100} onChange={v => setConfig({ ...config, questionGap: v })} />
                                <RangeSlider label="Q-Option Gap" value={config.questionOptionGap || 8} min={0} max={40} onChange={v => setConfig({ ...config, questionOptionGap: v })} />
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div className="space-y-1.5 px-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Columns</label>
                                        <div className="flex bg-slate-100 rounded-lg p-1">
                                            <button
                                                onClick={() => setConfig({ ...config, columns: 1 })}
                                                className={`flex-1 py-1 text-[10px] font-black rounded ${config.columns === 1 ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
                                            >1 COL</button>
                                            <button
                                                onClick={() => setConfig({ ...config, columns: 2 })}
                                                className={`flex-1 py-1 text-[10px] font-black rounded ${config.columns === 2 ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
                                            >2 COL</button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Toggle label="Answer Bold" value={config.answerBold} onChange={v => setConfig({ ...config, answerBold: v })} />
                                        {/* Show Solution removed (duplicate) */}
                                    </div>
                                </div>
                                <RangeSlider label="Option Spacing" value={config.optionSpacing} min={0} max={40} onChange={v => setConfig({ ...config, optionSpacing: v })} />
                            </div>
                        </div>

                        {/* Column 2: Visibility & Metadata */}
                        <div className="space-y-2">
                            <h3 className="text-[9px] font-black text-slate-700 uppercase border-b pb-1 mb-1">Visibility</h3>
                            <div className="space-y-1">
                                <Toggle label="Show Answer Widget" value={config.showAnswerWidget} onChange={v => setConfig({ ...config, showAnswerWidget: v })} />
                                <Toggle label="Hide Question" value={config.hideQuestion} onChange={v => setConfig({ ...config, hideQuestion: v })} />
                                <Toggle label="Hide Option" value={config.hideOption} onChange={v => setConfig({ ...config, hideOption: v })} />
                                <Toggle label="Hide Box (Explanation)" value={config.hideBoxExplanation} onChange={v => setConfig({ ...config, hideBoxExplanation: v })} />
                                <Toggle label="Show Solution" value={config.showSolution} onChange={v => setConfig({ ...config, showSolution: v })} />
                                <Toggle label="Tags" value={config.previousYearTag} onChange={v => setConfig({ ...config, previousYearTag: v })} />
                                <Toggle label="Show QR" value={config.showQR} onChange={v => setConfig({ ...config, showQR: v })} />
                                <Toggle label="Page Border" value={config.showPageBorder} onChange={v => setConfig({ ...config, showPageBorder: v })} />
                                <Toggle label="Show Option E" value={config.show5thOption} onChange={v => setConfig({ ...config, show5thOption: v })} />
                                <div className="space-y-2 mt-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Language</label>
                                    <div className="flex bg-slate-100 rounded-lg p-1">
                                        {['hi', 'en', 'both'].map((mode) => (
                                            <button
                                                key={mode}
                                                onClick={() => setConfig({ ...config, language: mode as any })}
                                                className={`flex-1 py-1.5 text-[10px] font-black uppercase rounded transition-all ${config.language === mode
                                                    ? 'bg-white shadow-sm text-indigo-600'
                                                    : 'text-slate-400 hover:text-slate-600'
                                                    }`}
                                            >
                                                {mode === 'hi' ? 'Hindi' : mode === 'en' ? 'English' : 'Both'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Column 3: Specific Config & Advanced */}
                        <div className="space-y-2">
                            <h3 className="text-[9px] font-black text-slate-700 uppercase border-b pb-1 mb-1">Specific Config</h3>
                            <div className="space-y-1">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Filter Questions (e.g. 1, 3-5):</label>
                                    <input
                                        type="text"
                                        placeholder="Enter question numbers"
                                        value={config.logo1 || ''}
                                        onChange={e => setConfig({ ...config, logo1: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Section Header Text:</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Mathematics"
                                        value={config.logo2 || ''}
                                        onChange={e => setConfig({ ...config, logo2: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Header Title:</label>
                                        <input
                                            type="text"
                                            value={config.customTitle}
                                            onChange={e => setConfig({ ...config, customTitle: e.target.value })}
                                            className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold outline-none font-sans"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Footer Text:</label>
                                        <input
                                            type="text"
                                            value={config.customFooter}
                                            onChange={e => setConfig({ ...config, customFooter: e.target.value })}
                                            className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold outline-none font-sans"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase">Contact:</label>
                                        <input type="text" value={config.headerContact} onChange={e => setConfig({ ...config, headerContact: e.target.value })} className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[9px] outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase">Teacher:</label>
                                        <input type="text" value={config.headerTeacher} onChange={e => setConfig({ ...config, headerTeacher: e.target.value })} className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[9px] outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase">Exam:</label>
                                        <input type="text" value={config.headerExam} onChange={e => setConfig({ ...config, headerExam: e.target.value })} className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[9px] outline-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Column 4: Boldness & Set Data */}
                        <div className="space-y-2">
                            <h3 className="text-[9px] font-black text-slate-700 uppercase border-b pb-1 mb-1">Boldness & Data</h3>
                            <div className="space-y-1">
                                <RangeSlider label="Option Boldness" value={config.optionBoldness} min={400} max={900} step={100} onChange={v => setConfig({ ...config, optionBoldness: v })} />
                                <RangeSlider label="Solution Boldness" value={config.solutionBoldness} min={400} max={900} step={100} onChange={v => setConfig({ ...config, solutionBoldness: v })} />

                                {/* Logo Upload */}
                                <div className="space-y-1 pt-2 border-t border-slate-100">
                                    <label className="text-[9px] font-bold text-slate-500 uppercase block">Logo</label>
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded flex items-center justify-center overflow-hidden shrink-0">
                                            {config.mainLogo ? (
                                                <img src={config.mainLogo} alt="Logo" className="w-full h-full object-contain" />
                                            ) : (
                                                <Printer size={12} className="text-slate-300" />
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            id="logo-upload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setConfig({ ...config, mainLogo: reader.result as string });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                        <label htmlFor="logo-upload" className="cursor-pointer flex-1 py-1 text-center text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100">
                                            Upload
                                        </label>
                                    </div>
                                </div>

                                <span className="text-[9px] font-bold text-slate-500 uppercase block pt-2 border-t border-slate-100">Set ID:</span>
                                <code className="text-[9px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded block truncate">{set.setId}</code>
                            </div>
                        </div>

                        {/* Column 5: Colors */}
                        <div className="space-y-2">
                            <h3 className="text-[9px] font-black text-slate-700 uppercase border-b pb-1 mb-1">Colors</h3>
                            <div className="space-y-1">
                                <ColorPicker label="Header" value={config.headerBgColor} onChange={v => setConfig({ ...config, headerBgColor: v })} />
                                <ColorPicker label="Footer" value={config.footerBgColor} onChange={v => setConfig({ ...config, footerBgColor: v })} />
                                <ColorPicker label="Question" value={config.questionColor} onChange={v => setConfig({ ...config, questionColor: v })} />
                                <ColorPicker label="Option" value={config.optionColor} onChange={v => setConfig({ ...config, optionColor: v })} />
                                <ColorPicker label="Q-Number" value={config.questionNumberColor} onChange={v => setConfig({ ...config, questionNumberColor: v })} />

                                {/* Header Tagline */}
                                <div className="space-y-1 pt-2 border-t border-slate-100">
                                    <label className="text-[9px] font-bold text-slate-500 uppercase block">Header Tagline:</label>
                                    <input
                                        type="text"
                                        value={config.customTagline}
                                        onChange={e => setConfig({ ...config, customTagline: e.target.value })}
                                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[9px] font-bold outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Action Strip (Export as .doc, etc) */}
            <div className="bg-slate-50 border-b p-4">
                <div className="max-w-[1600px] mx-auto flex items-center gap-2">
                    <Button
                        onClick={handleExportPPT}
                        variant="secondary"
                        className="bg-orange-600 text-white hover:bg-orange-700 text-[10px] font-black py-1.5 h-auto px-4 uppercase tracking-wider rounded-md border-none"
                    >
                        EXPORT AS PPT
                    </Button>
                    <div className="ml-auto flex items-center gap-3">
                        <button onClick={onExit} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-all">
                            <ArrowLeft size={20} />
                        </button>
                        <button className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-all">
                            <Share2 size={20} />
                        </button>
                        <button
                            onClick={handleDownload}
                            disabled={isGenerating}
                            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-50"
                        >
                            {isGenerating ? <RefreshCw className="animate-spin" size={16} /> : <Download size={16} />}
                            {isGenerating ? 'Generating...' : 'Download PDF'}
                        </button>
                    </div>
                </div>
            </div>



            {/* Main Preview Container */}
            <div className="flex-1 bg-slate-200/50 p-6 md:p-8 overflow-y-auto print:p-0 print:bg-white print:overflow-visible">
                <div
                    ref={previewRef}
                    className={`max-w-[1200px] mx-auto bg-white shadow-2xl min-h-[1414px] p-[10mm] transition-all duration-300 transform origin-top print:shadow-none print:max-w-none print:w-full print:p-0 text-slate-900 relative overflow-hidden`}
                    style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                >
                    {/* Page Border Overlay (Inset for proper A4 margin) */}
                    {config.showPageBorder && (
                        <div className="absolute inset-[5mm] border-[2px] border-black pointer-events-none z-50 print-exact"></div>
                    )}

                    {/* Background Central Watermark (Reference Style) */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03]">
                        {config.mainLogo ? (
                            <img src={config.mainLogo} alt="Watermark" className="w-[400px] h-[400px] object-contain" />
                        ) : (
                            <div className="w-[500px] h-[500px] border-[40px] border-green-600 rounded-full flex items-center justify-center">
                                <span className="text-[300px] font-black text-green-600">B</span>
                            </div>
                        )}
                    </div>

                    {/* Vertical Divider for 2 Columns */}
                    {config.columns === 2 && (
                        <div className="absolute top-[45mm] bottom-[20mm] left-1/2 w-px bg-slate-200 pointer-events-none" />
                    )}

                    {/* Header: Reference Style (Logo - Info - QR) */}
                    <div className="flex justify-between items-center border-b-2 border-slate-900 pb-4 mb-6">
                        <div className="w-20 h-20 bg-slate-900 rounded-xl flex items-center justify-center text-white text-4xl font-black overflow-hidden">
                            {config.mainLogo ? (
                                <img src={config.mainLogo} alt="Logo" className="w-full h-full object-contain" />
                            ) : 'B'}
                        </div>
                        <div className="flex-1 text-center px-8">
                            <h1 className="text-3xl font-black tracking-tight mb-1 uppercase">{config.customTitle}</h1>
                            <p className="text-sm font-bold text-slate-600 uppercase tracking-widest leading-none">{config.customTagline}</p>
                            <div className="flex items-center justify-center gap-4 mt-2 text-[10px] font-black uppercase text-slate-400">
                                <span>{config.headerContact}</span>
                                <span className="opacity-30">•</span>
                                <span>{config.headerTeacher}</span>
                                <span className="opacity-30">•</span>
                                <span>{config.headerExam}</span>
                            </div>
                        </div>
                        <div className="w-20 h-20 border-2 border-slate-200 rounded-lg p-1 opacity-40">
                            <div className="w-full h-full bg-slate-100 grid grid-cols-4 gap-0.5 p-1">
                                {[...Array(16)].map((_, i) => <div key={i} className="bg-slate-400 rounded-sm"></div>)}
                            </div>
                        </div>
                    </div>

                    <div className={`grid ${config.columns === 2 ? 'grid-cols-2 gap-x-8' : 'grid-cols-1'}`} style={{ rowGap: `${config.questionGap || 24}px` }}>
                        {config.logo2 && (
                            <div className="col-span-full text-center border-y-2 border-slate-900 py-2 mb-4 bg-slate-50">
                                <h2 className="text-xl font-black uppercase tracking-[0.2em]">{config.logo2}</h2>
                            </div>
                        )}
                        {questions
                            .filter((_, qIdx) => {
                                if (!config.logo1) return true;
                                try {
                                    const allowed = config.logo1.split(',').flatMap(s => {
                                        s = s.trim();
                                        if (s.includes('-')) {
                                            const [start, end] = s.split('-').map(Number);
                                            return Array.from({ length: end - start + 1 }, (_, i) => start + i);
                                        }
                                        return [Number(s)];
                                    });
                                    return allowed.includes(qIdx + 1);
                                } catch (e) { return true; }
                            })
                            .map((q, idx) => (
                                <div key={q.id} className="relative group p-4 rounded-xl hover:bg-slate-50/50 transition-colors" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                                    {!config.hideQuestion && (
                                        <div className="flex flex-col relative pl-10">
                                            {/* Question Number */}
                                            <div className="absolute left-0 top-0 font-black"
                                                style={{
                                                    color: config.questionNumberColor || '#000000',
                                                    fontSize: `${config.fontSize + 2}px`,
                                                    lineHeight: `${config.fontSize + config.spacing}px`
                                                }}
                                            >
                                                {idx + 1}.
                                            </div>

                                            <div className="flex-1">
                                                <div className="relative">
                                                    {(config.language === 'en' || config.language === 'both') && (
                                                        <div className="leading-tight tracking-tight font-hindi"
                                                            style={{
                                                                color: config.questionColor,
                                                                fontWeight: config.questionBoldness,
                                                                fontSize: `${config.fontSize}px`,
                                                                lineHeight: `${config.fontSize + config.spacing}px`
                                                            }}
                                                        >
                                                            {stripHTML(q.question_eng)}
                                                        </div>
                                                    )}

                                                    {(config.language === 'hi' || config.language === 'both') && q.question_hin && (
                                                        <div className={`font-hindi ${config.language === 'both' ? 'text-slate-500 mt-2' : 'text-[#EF4444]'}`}
                                                            style={{
                                                                color: config.language === 'hi' ? config.questionColor : undefined,
                                                                fontWeight: config.language === 'hi' ? config.questionBoldness : undefined,
                                                                fontSize: `${config.language === 'both' ? config.fontSize - 2 : config.fontSize}px`,
                                                                lineHeight: `${config.fontSize + config.spacing}px`
                                                            }}
                                                        >
                                                            {stripHTML(q.question_hin)}
                                                        </div>
                                                    )}

                                                    {config.previousYearTag && (
                                                        <div className="mt-2 mb-2 flex justify-end gap-1 flex-wrap">
                                                            {renderIntelligentTags(q)}
                                                        </div>
                                                    )}
                                                </div>

                                                {!config.hideOption && (
                                                    <div className="mt-2" style={{ marginTop: `${config.questionOptionGap || 8}px` }}>
                                                        {(() => {
                                                            const optionsData = [
                                                                { label: '(a)', text: q.option1_eng, textHi: q.option1_hin, code: 'a' },
                                                                { label: '(b)', text: q.option2_eng, textHi: q.option2_hin, code: 'b' },
                                                                { label: '(c)', text: q.option3_eng, textHi: q.option3_hin, code: 'c' },
                                                                { label: '(d)', text: q.option4_eng, textHi: q.option4_hin, code: 'd' },
                                                                { label: '(e)', text: 'उपर्युक्त में se कोई नहीं', textHi: '', code: 'e' }
                                                            ].filter(opt => {
                                                                if (config.show5thOption) return true;
                                                                if (opt.code !== 'e') return true;
                                                                const correctAns = q.answer?.toString().toLowerCase().trim();
                                                                return correctAns === 'e' || correctAns === '5' || correctAns === 'option5';
                                                            });

                                                            const isShort = optionsData.every(opt => (opt.text?.length || 0) + (opt.textHi?.length || 0) < 35);

                                                            return (
                                                                <div className={isShort ? "grid grid-cols-2 gap-x-4 gap-y-1" : "space-y-1"}>
                                                                    {optionsData.map((opt, i) => {
                                                                        const getIsCorrect = (idx: number) => {
                                                                            if (!q.answer) return false;
                                                                            const ans = q.answer.toString().toLowerCase().trim();
                                                                            const labels = ['a', 'b', 'c', 'd', 'e'];
                                                                            const currentCode = opt.code;
                                                                            return ans === currentCode || ans === (labels.indexOf(currentCode) + 1).toString() || ans === `option${labels.indexOf(currentCode) + 1}`;
                                                                        };
                                                                        const isCorrect = getIsCorrect(i);
                                                                        return (
                                                                            <div key={i} className="flex gap-3" style={{ marginBottom: `${config.optionSpacing}px` }}>
                                                                                <span className="font-bold text-slate-400 shrink-0" style={{ fontSize: `${config.fontSize}px` }}>{opt.label}</span>
                                                                                <div className="space-y-1">
                                                                                    {(config.language === 'en' || config.language === 'both') && (
                                                                                        <span className={`font-hindi transition-all ${isCorrect && config.answerBold ? 'font-black text-green-700' : 'font-bold'}`}
                                                                                            style={{
                                                                                                color: isCorrect && config.answerBold ? '#15803d' : config.optionColor,
                                                                                                fontWeight: isCorrect && config.answerBold ? 900 : config.optionBoldness,
                                                                                                fontSize: `${config.fontSize}px`,
                                                                                                lineHeight: `${config.fontSize + config.spacing}px`
                                                                                            }}
                                                                                        >
                                                                                            {stripHTML(opt.text)}
                                                                                        </span>
                                                                                    )}
                                                                                    {(config.language === 'hi' || config.language === 'both') && opt.textHi && (
                                                                                        <div className={`font-hindi ${config.language === 'both' ? 'text-slate-400' : 'font-bold'}`}
                                                                                            style={{
                                                                                                color: config.language === 'hi' ? config.optionColor : undefined,
                                                                                                fontWeight: config.language === 'hi' ? config.optionBoldness : undefined,
                                                                                                fontSize: `${config.language === 'both' ? config.fontSize - 2 : config.fontSize}px`,
                                                                                                lineHeight: `${config.fontSize + config.spacing}px`
                                                                                            }}
                                                                                        >
                                                                                            {stripHTML(opt.textHi)}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                )}

                                                {config.showSolution && (q.solution_eng || q.solution_hin) && (
                                                    <div className={`mt-4 print-exact ${!config.hideBoxExplanation ? 'border border-red-500 rounded-lg overflow-hidden bg-white' : 'pt-2 border-t border-slate-200'}`}>
                                                        {!config.hideBoxExplanation && (
                                                            <div className="bg-red-500 text-white h-5 flex items-center justify-center text-[10px] font-black uppercase tracking-wider leading-none print-exact">
                                                                Explanation
                                                            </div>
                                                        )}
                                                        <div className={`${!config.hideBoxExplanation ? 'p-3' : 'pt-2'} space-y-2`}>
                                                            {(config.language === 'en' || config.language === 'both') && q.solution_eng && (
                                                                <div className="text-slate-700 text-sm leading-relaxed" style={{ fontWeight: config.solutionBoldness }}>
                                                                    <span className="font-black mr-2 text-xs uppercase tracking-wider opacity-70">Ans:</span>
                                                                    {stripHTML(q.solution_eng)}
                                                                </div>
                                                            )}
                                                            {(config.language === 'hi' || config.language === 'both') && q.solution_hin && (
                                                                <div className={`font-hindi ${config.language === 'both' ? 'border-t border-slate-100 pt-2 text-slate-500 text-xs' : 'text-slate-700 text-sm'}`}
                                                                    style={{ fontWeight: config.language === 'hi' ? config.solutionBoldness : undefined }}
                                                                >
                                                                    <span className="font-black mr-2 text-xs uppercase tracking-wider opacity-70">Ans:</span>
                                                                    {stripHTML(q.solution_hin)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {config.columns === 1 && <div className="h-px bg-slate-100 w-full mt-10" />}
                                </div>
                            ))}
                    </div>

                    {/* Answer Key Widget - Reference Style Row of Boxes */}
                    {
                        config.showAnswerWidget && (
                            <div className="mt-12 border-t-2 border-dashed border-slate-900 pt-8 relative z-10">
                                <h3 className="text-center text-2xl font-black uppercase mb-6">Answer Key</h3>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {questions.map((q, i) => (
                                        <div key={i} className="border border-slate-900 px-3 py-1 flex items-center gap-2 bg-white min-w-[70px] justify-center">
                                            <span className="text-xs font-black">{i + 1}</span>
                                            <span className="text-xs font-bold">({q.answer?.toString().toUpperCase() || '-'})</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    }

                    {/* Footer Preview rendering */}
                    < div className="mt-24 p-8 rounded-2xl flex justify-between items-center text-white"
                        style={{ backgroundColor: config.footerBgColor }}
                    >
                        <div className="flex items-center gap-8">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Set ID: {set.setId}</span>
                            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/10 px-4 py-2 rounded-full">
                                <Printer size={12} /> {config.customFooter}
                            </span>
                        </div>
                        <div className="flex items-center gap-6">
                            {config.showWatermark && <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Q-BANK PRO</span>}
                            <span className="font-black text-xs bg-white text-slate-900 px-5 py-2 rounded-xl shadow-lg">PAGE 01</span>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
};

// Internal Helper Components
const RangeSlider = ({ label, value, min, max, step = 1, onChange }: any) => (
    <div className="space-y-1.5">
        <div className="flex justify-between items-center">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{label}</label>
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{value}</span>
        </div>
        <input
            type="range" min={min} max={max} step={step} value={value}
            onChange={e => onChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
    </div>
);

const Toggle = ({ label, value, onChange }: any) => (
    <label className="flex items-center justify-between cursor-pointer group hover:bg-slate-50 px-1 rounded-md py-0.5 transition-all">
        <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-800 transition-colors uppercase tracking-tight">{label}</span>
        <div
            onClick={() => onChange(!value)}
            className={`relative w-8 h-4 rounded-full transition-all duration-300 ${value ? 'bg-indigo-600' : 'bg-slate-300'}`}
        >
            <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300 ${value ? 'translate-x-4' : 'translate-x-0'}`} />
        </div>
    </label>
);

const ColorPicker = ({ label, value, onChange }: any) => (
    <div className="flex items-center justify-between gap-4 group">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none group-hover:text-slate-800 transition-colors">{label}</label>
        <div className="flex gap-2 items-center">
            <input
                type="color" value={value} onChange={e => onChange(e.target.value)}
                className="w-5 h-5 rounded-md border border-slate-200 cursor-pointer overflow-hidden p-0 bg-transparent"
            />
            <input
                type="text" value={value} onChange={e => onChange(e.target.value)}
                className="w-16 bg-transparent text-[10px] font-mono font-black text-slate-700 outline-none uppercase tracking-tighter"
            />
        </div>
    </div>
);
