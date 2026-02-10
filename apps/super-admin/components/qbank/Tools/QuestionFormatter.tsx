import React, { useState } from 'react';
import { ArrowLeft, Upload, FileText, Image as ImageIcon, Layers, Download, Printer, Edit3, Check, Save, Database, Plus } from 'lucide-react';
import { InputPanel, InputMode, InputData } from '../QuestionGeneration/InputPanel';
import { geminiService } from '../../services/geminiService';
import { Question } from '../../types';
import { storageService } from '../../services/storageService';
import { QuestionBankBrowser } from './QuestionBankBrowser';
import { TableEditor } from './TableEditor';
import { usePaperStore } from '../../services/paperStore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import mammoth from 'mammoth';

interface QuestionFormatterProps {
    onBack: () => void;
}

export const QuestionFormatter: React.FC<QuestionFormatterProps> = ({ onBack }) => {
    const { initializePaper } = usePaperStore();
    const [step, setStep] = useState<'input' | 'editor' | 'preview'>('input');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    // Bank State
    const [showBank, setShowBank] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Filter/Preview State
    const [template, setTemplate] = useState<'classic' | 'modern' | 'compact'>('classic');

    const handleProcess = async (mode: InputMode, data: InputData) => {
        setIsProcessing(true);
        try {
            let extractedText = mode === 'text' ? data.text || '' : '';
            const filesToProcess = data.files || [];

            // Extract text from DOCX files if any
            if (mode === 'pdf') { // We grouped PDF and DOCX in 'pdf' mode in InputPanel
                for (const file of filesToProcess) {
                    if (file.name.endsWith('.docx') || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                        const arrayBuffer = await file.arrayBuffer();
                        const result = await mammoth.extractRawText({ arrayBuffer });
                        extractedText += `\n\n--- Content from ${file.name} ---\n${result.value}`;
                    }
                }
            }

            const result = await geminiService.parseQuestionContent(
                extractedText,
                filesToProcess.filter(f => !f.name.endsWith('.docx')) // Pass only non-docx (e.g. PDF/Images) to gemini direct
            );

            if (result && result.length > 0) {
                const distinctQuestions = result.map(q => ({
                    ...q,
                    id: `new_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
                }));
                setQuestions(prev => [...prev, ...distinctQuestions]);
                setStep('editor');
            } else {
                alert("Could not extract any questions. Please try again with clearer content.");
            }
        } catch (error: any) {
            console.error("Processing failed:", error);
            alert("Failed to process content: " + error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSaveToBank = async () => {
        if (questions.length === 0) return;
        setIsSaving(true);
        try {
            await storageService.saveQuestionsBulk(questions);
            alert(`Successfully saved ${questions.length} questions to the bank!`);
        } catch (error: any) {
            console.error("Save failed:", error);
            alert("Failed to save questions: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddFromBank = (selected: Question[]) => {
        setQuestions(prev => [...prev, ...selected]);
        setShowBank(false);
        setStep('editor');
    };

    const handleUpdateQuestion = (id: string, field: keyof Question, value: string) => {
        setQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
    };

    const handleExportToBuilder = () => {
        initializePaper(questions);
        const url = new URL(window.location.href);
        url.searchParams.set('view', 'paper-builder');
        window.history.pushState({}, '', url);
        window.location.href = url.toString();
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Question Paper", 105, 15, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Subject: ${questions[0]?.subject || 'General'}`, 14, 25);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 180, 25, { align: 'right' });
        doc.line(14, 28, 196, 28);

        let y = 35;
        const pageHeight = doc.internal.pageSize.height;

        questions.forEach((q, index) => {
            if (y > pageHeight - 40) {
                doc.addPage();
                y = 20;
            }
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            const qText = `Q${index + 1}. ${q.question_eng}`;
            const splitTitle = doc.splitTextToSize(qText, 180);
            doc.text(splitTitle, 14, y);
            y += splitTitle.length * 5;

            if (q.question_hin) {
                doc.setFont('helvetica', 'italic');
                const hText = q.question_hin;
                const splitH = doc.splitTextToSize(hText, 180);
                doc.text(splitH, 14, y);
                y += splitH.length * 5;
            }

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            y += 2;

            const opts = [
                `(a) ${q.option1_eng}`, `(b) ${q.option2_eng}`,
                `(c) ${q.option3_eng}`, `(d) ${q.option4_eng}`
            ];

            if (template === 'compact') {
                doc.text(opts[0], 14, y);
                doc.text(opts[1], 100, y);
                y += 5;
                doc.text(opts[2], 14, y);
                doc.text(opts[3], 100, y);
                y += 10;
            } else {
                opts.forEach(opt => {
                    doc.text(opt, 20, y);
                    y += 5;
                });
                y += 5;
            }
        });
        doc.save("question-paper.pdf");
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Question Formatter</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Extraction & Layout Engine</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button onClick={() => setStep('input')} className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${step === 'input' ? 'bg-white shadow text-primary' : 'text-slate-500'}`}>1. Input</button>
                        <button onClick={() => questions.length > 0 && setStep('editor')} disabled={questions.length === 0} className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${step === 'editor' ? 'bg-white shadow text-primary' : 'text-slate-500'} disabled:opacity-50`}>2. Edit</button>
                        <button onClick={() => questions.length > 0 && setStep('preview')} disabled={questions.length === 0} className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${step === 'preview' ? 'bg-white shadow text-primary' : 'text-slate-500'} disabled:opacity-50`}>3. Export</button>
                    </div>
                </div>
            </div>

            <div className="p-6 max-w-7xl mx-auto w-full flex-1 flex flex-col">
                {step === 'input' && (
                    <div className="flex flex-col items-center justify-center flex-1 max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-sm">
                                <Upload size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 mb-2">Upload Source Material</h2>
                            <p className="text-slate-500 max-w-md mx-auto mb-6">Paste text or upload images/PDFs. Our AI will extract questions, preserve Math/Science formulas, and format them for you.</p>
                            <button onClick={() => setShowBank(true)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm flex items-center gap-2 mx-auto">
                                <Database size={18} /> Load from Question Bank
                            </button>
                        </div>
                        <div className="w-full bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                            <InputPanelWrapper onProcess={handleProcess} isProcessing={isProcessing} />
                        </div>
                    </div>
                )}

                {step === 'editor' && (
                    <div className="grid grid-cols-1 gap-6 animate-in fade-in duration-500">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800">Extracted Questions ({questions.length})</h3>
                            <div className="flex gap-2">
                                <button onClick={() => setShowBank(true)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-2"><Plus size={16} /> Add More</button>
                                <button onClick={handleSaveToBank} disabled={isSaving} className="px-4 py-2 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg font-bold text-xs hover:bg-emerald-100 transition-all flex items-center gap-2">{isSaving ? <span className="animate-spin">⌛</span> : <Save size={16} />} Save All to Bank</button>
                                <button onClick={handleExportToBuilder} className="px-5 py-2 bg-primary text-white rounded-lg font-bold uppercase tracking-wider text-xs shadow-lg shadow-primary/20 hover:bg-indigo-700 transition-all flex items-center gap-2">Paper Builder <Check size={16} /></button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {questions.map((q, idx) => (
                                <div key={q.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm group">
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-black text-slate-500 shrink-0">{idx + 1}</div>
                                        <div className="flex-1 space-y-3">
                                            <div className="space-y-4 border-b border-slate-100 pb-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase flex justify-between">
                                                            <span>Question (English)</span>
                                                            <button onClick={() => handleUpdateQuestion(q.id, 'has_table', (!q.has_table).toString())} className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1"><Database size={10} /> {q.has_table ? 'Remove Table' : 'Add Table'}</button>
                                                        </label>
                                                        <textarea className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:border-primary outline-none" value={q.question_eng} onChange={e => handleUpdateQuestion(q.id, 'question_eng', e.target.value)} rows={3} placeholder="Enter question in English..." />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Question (Hindi)</label>
                                                        <textarea className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:border-primary outline-none" value={q.question_hin || ''} onChange={e => handleUpdateQuestion(q.id, 'question_hin', e.target.value)} rows={3} placeholder="हिंदी में प्रश्न दर्ज करें..." dir="auto" />
                                                    </div>
                                                </div>
                                            </div>

                                            {q.has_table && (
                                                <div className="my-2">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Data Table</label>
                                                    <TableEditor initialData={q.table_data} onChange={(data) => handleUpdateQuestion(q.id, 'table_data', JSON.stringify(data))} />
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-4">
                                                {[1, 2, 3, 4].map((num) => (
                                                    <div key={num} className="space-y-1">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Option {String.fromCharCode(64 + num)} (Eng / Hindi)</label>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <input className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs" value={(q as any)[`option${num}_eng`]} onChange={e => handleUpdateQuestion(q.id, `option${num}_eng` as keyof Question, e.target.value)} placeholder="English" />
                                                            <input className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs" value={(q as any)[`option${num}_hin`] || ''} onChange={e => handleUpdateQuestion(q.id, `option${num}_hin` as keyof Question, e.target.value)} placeholder="हिंदी" dir="auto" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-3 gap-4">
                                                <div><label className="text-[10px] font-bold text-slate-400 uppercase">Marks</label><input type="number" className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs" value={q.marks || 1} onChange={e => handleUpdateQuestion(q.id, 'marks', e.target.value)} /></div>
                                                <div><label className="text-[10px] font-bold text-slate-400 uppercase">Cognitive Level</label><select className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs" value={q.cognitive_level || 'Knowledge'} onChange={e => handleUpdateQuestion(q.id, 'cognitive_level', e.target.value)}><option>Knowledge</option><option>Understanding</option><option>Application</option><option>Analysis</option><option>Evaluation</option><option>Creation</option></select></div>
                                                <div><label className="text-[10px] font-bold text-slate-400 uppercase">Context (Optional)</label><input className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs" value={q.context || ''} onChange={e => handleUpdateQuestion(q.id, 'context', e.target.value)} placeholder="e.g. Passage 1" /></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {step === 'preview' && (
                    <div className="flex h-full gap-6 animate-in fade-in duration-500">
                        <div className="w-72 shrink-0 space-y-6">
                            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Layout Options</h4>
                                <div className="space-y-2">
                                    {['classic', 'modern', 'compact'].map(t => (
                                        <button key={t} onClick={() => setTemplate(t as any)} className={`w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center justify-between group ${template === t ? 'bg-primary/5 border-primary text-primary' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                                            <span className="text-xs font-bold uppercase">{t}</span>
                                            {template === t && <Check size={14} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button onClick={generatePDF} className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest hover:bg-primary transition-all shadow-lg flex items-center justify-center gap-3"><Printer size={18} /> Print / Save PDF</button>
                        </div>

                        <div className="flex-1 bg-slate-200/50 rounded-xl border border-slate-300 p-8 overflow-y-auto max-h-[calc(100vh-140px)] shadow-inner flex justify-center">
                            <div className="w-[210mm] min-h-[297mm] bg-white shadow-2xl p-[10mm] text-slate-900">
                                <div className="text-center mb-8 border-b-2 border-slate-900 pb-4">
                                    <h1 className="text-2xl font-black uppercase tracking-widest mb-2">Question Paper</h1>
                                    <div className="flex justify-between text-sm font-bold opacity-60"><span>Subject: {questions[0]?.subject || 'General'}</span><span>Date: {new Date().toLocaleDateString()}</span></div>
                                </div>
                                <div className={`space-y-6 ${template === 'compact' ? 'space-y-4' : ''}`}>
                                    {questions.map((q, i) => (
                                        <div key={q.id} className="text-sm">
                                            <div className="font-bold mb-2 flex gap-2"><span>Q{i + 1}.</span><span dangerouslySetInnerHTML={{ __html: q.question_eng }}></span></div>
                                            {q.question_hin && <div className="font-medium italic opacity-70 mb-2 ml-6 text-xs">{q.question_hin}</div>}
                                            <div className={`grid ${template === 'compact' ? 'grid-cols-2 gap-x-8 gap-y-1 ml-6' : 'grid-cols-1 gap-2 ml-6'}`}>
                                                <div>(a) {q.option1_eng}</div><div>(b) {q.option2_eng}</div><div>(c) {q.option3_eng}</div><div>(d) {q.option4_eng}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showBank && <QuestionBankBrowser onClose={() => setShowBank(false)} onSelectQuestions={handleAddFromBank} />}
            </div>
        </div>
    );
};

const InputPanelWrapper = ({ onProcess, isProcessing }: { onProcess: (m: InputMode, d: InputData) => void, isProcessing: boolean }) => {
    const [mode, setMode] = useState<InputMode>('text');
    const [data, setData] = useState<InputData>({});

    const handleInputChange = React.useCallback((m: InputMode, d: InputData) => {
        setMode(m);
        setData(d);
    }, []);

    return (
        <div>
            <InputPanel onInputChange={handleInputChange} />
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button onClick={() => onProcess(mode, data)} disabled={isProcessing || (!data.text && (!data.files || data.files.length === 0))} className="px-8 py-3 bg-primary text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2">
                    {isProcessing ? 'Processing AI...' : 'Analyze & Format'} <Layers size={18} />
                </button>
            </div>
        </div>
    )
};
