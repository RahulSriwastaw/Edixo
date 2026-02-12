import React, { useState, useRef } from 'react';
import { X, Download, FileText, Settings2, Palette, Eye, Bold, Check, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { PDFConfig, pdfGeneratorService } from './services/pdfGeneratorService';
import { QuestionSet, Question } from '../types';

interface PDFConfigModalProps {
    set: QuestionSet;
    questions: Question[];
    onClose: () => void;
}

export const PDFConfigModal: React.FC<PDFConfigModalProps> = ({ set, questions, onClose }) => {
    const [config, setConfig] = useState<PDFConfig>(pdfGeneratorService.getConfig());
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState<'layout' | 'display' | 'colors'>('layout');
    const previewRef = useRef<HTMLDivElement>(null);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            pdfGeneratorService.setConfig(config);
            await pdfGeneratorService.downloadPDF(set, questions);
        } catch (error) {
            console.error('PDF Generation Error:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const stripHTML = (html: string) => {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    // Live Preview Panel Component
    const PreviewPanel = () => {
        const sampleQuestions = questions.slice(0, 2); // Show first 2 questions for preview

        return (
            <div className="h-full flex flex-col bg-slate-50 border-l border-slate-200">
                <div className="p-4 border-b bg-white flex items-center justify-between z-10">
                    <div className="flex items-center gap-2">
                        <Eye size={16} className="text-indigo-600" />
                        <span className="text-sm font-black text-slate-700 uppercase tracking-widest">Live Preview</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">A4 Sheet Style</span>
                </div>

                <div
                    className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-200/50 flex justify-center"
                    style={{ scrollBehavior: 'smooth' }}
                >
                    {/* Virtual Paper Container */}
                    <div
                        className="bg-white shadow-2xl origin-top transition-all duration-300 mb-8"
                        style={{
                            width: '210mm',
                            minHeight: '297mm',
                            transform: 'scale(0.55)', // Scaled down for desktop view
                            padding: '20mm',
                            boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)'
                        }}
                    >
                        {/* Header Rendering */}
                        <div
                            className="p-8 rounded-xl mb-10 text-white"
                            style={{ backgroundColor: config.headerBgColor }}
                        >
                            <h1 className="text-4xl font-black mb-3">{set.name}</h1>
                            {set.description && (
                                <p className="text-white/80 text-lg leading-relaxed">{set.description}</p>
                            )}
                            <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/20 text-white/70 text-sm font-bold uppercase tracking-wider">
                                <span>Created: {new Date(set.createdDate).toLocaleDateString()}</span>
                                <span>Total Questions: {questions.length}</span>
                            </div>
                        </div>

                        {/* Questions List Rendering */}
                        <div className="space-y-12">
                            {sampleQuestions.length > 0 ? sampleQuestions.map((q, idx) => (
                                <div key={q.id} className="relative">
                                    {/* Question Content */}
                                    {!config.hideQuestion && (
                                        <div className="flex gap-4">
                                            {/* Question Number */}
                                            <div
                                                className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-black"
                                                style={{
                                                    fontSize: `${config.fontSize}px`,
                                                    color: config.questionNumberColor,
                                                    opacity: config.questionOpacity,
                                                    border: `2px solid ${config.questionNumberColor}20`
                                                }}
                                            >
                                                {idx + 1}
                                            </div>

                                            <div className="flex-1 space-y-4">
                                                {/* English Question */}
                                                <div
                                                    style={{
                                                        fontSize: `${config.fontSize}px`,
                                                        color: config.questionColor,
                                                        opacity: config.questionOpacity,
                                                        fontWeight: config.questionBoldness,
                                                        lineHeight: '1.4'
                                                    }}
                                                >
                                                    {stripHTML(q.question_eng)}
                                                </div>

                                                {/* Hindi Question */}
                                                {config.billingualPDF && q.question_hin && (
                                                    <div className="text-slate-400 italic" style={{ fontSize: `${config.fontSize - 2}px` }}>
                                                        {stripHTML(q.question_hin)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Options List */}
                                    {!config.hideOption && (
                                        <div
                                            className="ml-14 grid grid-cols-1 gap-4"
                                            style={{ marginTop: `${config.spacing * 1.5}px` }}
                                        >
                                            {[
                                                { label: 'A', text: q.option1_eng, textHi: q.option1_hin },
                                                { label: 'B', text: q.option2_eng, textHi: q.option2_hin },
                                                { label: 'C', text: q.option3_eng, textHi: q.option3_hin },
                                                { label: 'D', text: q.option4_eng, textHi: q.option4_hin }
                                            ].map((opt, i) => {
                                                const isCorrect = q.answer === opt.label.toLowerCase() ||
                                                    q.answer === (i + 1).toString();
                                                return (
                                                    <div
                                                        key={opt.label}
                                                        className="space-y-1"
                                                        style={{
                                                            marginBottom: `${config.optionSpacing / 2}px`,
                                                            opacity: config.optionOpacity
                                                        }}
                                                    >
                                                        <div
                                                            className="font-bold flex items-center gap-3"
                                                            style={{
                                                                fontSize: `${config.fontSize - 1}px`,
                                                                color: isCorrect && config.answerBold ? '#16A34A' : config.optionColor,
                                                                fontWeight: isCorrect && config.answerBold ? config.optionBoldness : '600'
                                                            }}
                                                        >
                                                            <span className="opacity-40">({opt.label})</span>
                                                            {stripHTML(opt.text)}
                                                        </div>
                                                        {config.billingualPDF && opt.textHi && (
                                                            <div className="ml-8 text-slate-400 italic text-sm">
                                                                {stripHTML(opt.textHi)}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Solution Box */}
                                    {config.showSolution && q.solution_eng && (
                                        <div className="ml-14 mt-8 p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                            <div className="flex items-center gap-2 text-indigo-600 font-black uppercase tracking-widest text-[10px] mb-3">
                                                <Check size={14} strokeWidth={3} /> Solution & Explanation
                                            </div>
                                            <div
                                                className="text-slate-600 leading-relaxed"
                                                style={{
                                                    fontSize: `${config.fontSize - 2}px`,
                                                    fontWeight: config.solutionBoldness
                                                }}
                                            >
                                                {stripHTML(q.solution_eng)}
                                            </div>
                                        </div>
                                    )}

                                    {/* Separator Line */}
                                    <div className="h-px bg-slate-100 my-10" />
                                </div>
                            )) : (
                                <div className="text-center py-20 text-slate-300 font-black uppercase tracking-[0.2em]">
                                    No Questions Selected
                                </div>
                            )}
                        </div>

                        {/* Footer Rendering */}
                        <div
                            className="mt-20 p-6 rounded-xl flex justify-between items-center text-white/70 text-sm font-bold"
                            style={{ backgroundColor: config.footerBgColor }}
                        >
                            <div className="flex gap-4">
                                <span>Set ID: {set.setId}</span>
                                {config.showQR && <span>[QR Code Placeholder]</span>}
                            </div>
                            <div className="flex items-center gap-4">
                                {config.showWatermark && <span className="text-xs uppercase tracking-widest opacity-50">Q-Bank Pro</span>}
                                <span className="bg-white/10 px-3 py-1 rounded-lg">Page 1 of {Math.ceil(questions.length / 5) || 1}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const RangeSlider = ({
        label,
        value,
        onChange,
        min = 0,
        max = 100,
        step = 1
    }: {
        label: string;
        value: number;
        onChange: (val: number) => void;
        min?: number;
        max?: number;
        step?: number;
    }) => (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</label>
                <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{value}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={e => onChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700 transition-all"
            />
        </div>
    );

    const Toggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (val: boolean) => void }) => (
        <label className="flex items-center justify-between cursor-pointer group p-3 bg-white border border-slate-100 rounded-xl hover:border-indigo-100 hover:bg-indigo-50/20 transition-all">
            <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors uppercase tracking-tight">{label}</span>
            <div
                onClick={() => onChange(!value)}
                className={`relative w-10 h-5 rounded-full transition-all duration-300 ${value ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
        </label>
    );

    const ColorPicker = ({ label, value, onChange }: { label: string; value: string; onChange: (val: string) => void }) => (
        <div className="space-y-2 group">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none px-1 block group-hover:text-indigo-500 transition-colors">{label}</label>
            <div className="flex gap-2 items-center bg-white p-2 border border-slate-200 rounded-xl transition-all group-hover:border-indigo-300 shadow-sm">
                <div
                    className="w-10 h-10 rounded-lg border border-slate-200 relative overflow-hidden"
                    style={{ backgroundColor: value }}
                >
                    <input
                        type="color"
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
                    />
                </div>
                <input
                    type="text"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="flex-1 min-w-0 bg-transparent text-xs font-mono font-black text-slate-700 outline-none uppercase tracking-widest"
                    placeholder="#000000"
                />
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-2 md:p-6 lg:p-10">
            <div className="bg-white w-full h-full max-w-[1600px] rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">

                {/* Main Split Layout Container */}
                <div className="flex-1 flex overflow-hidden">

                    {/* Left Panel: Configuration (400px - 500px depending on screen) */}
                    <div className="w-full md:w-[450px] lg:w-[500px] flex flex-col bg-white border-r border-slate-200 shadow-xl z-20">
                        {/* Modal Header */}
                        <div className="p-8 border-b bg-white">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-200">
                                        <FileText size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">PDF Export Studio</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Professional Print Ready Customization</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-red-500 transition-all active:scale-95"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Enhanced Tab Navigation */}
                            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                                {[
                                    { id: 'layout', label: 'Layout', icon: Settings2 },
                                    { id: 'display', label: 'Display', icon: Eye },
                                    { id: 'colors', label: 'Visuals', icon: Palette }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                            ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-200 scale-[1.02]'
                                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'
                                            }`}
                                    >
                                        <tab.icon size={16} strokeWidth={2.5} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Scrollable Configuration Body */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar bg-slate-50/50">
                            {activeTab === 'layout' && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-left-4 duration-300">
                                    <div className="space-y-6">
                                        <h4 className="flex items-center gap-3 text-xs font-black text-indigo-500 uppercase tracking-[0.2em] border-b border-indigo-100 pb-3 mb-6">
                                            <TypeIcon size={14} /> Typography & Grid
                                        </h4>
                                        <div className="grid grid-cols-1 gap-8 px-2">
                                            <RangeSlider
                                                label="Primary Font Size"
                                                value={config.fontSize}
                                                onChange={val => setConfig({ ...config, fontSize: val })}
                                                min={10}
                                                max={32}
                                            />
                                            <RangeSlider
                                                label="Question Vertical Spacing"
                                                value={config.spacing}
                                                onChange={val => setConfig({ ...config, spacing: val })}
                                                min={5}
                                                max={40}
                                            />
                                            <RangeSlider
                                                label="Options Inner Spacing"
                                                value={config.optionSpacing}
                                                onChange={val => setConfig({ ...config, optionSpacing: val })}
                                                min={5}
                                                max={40}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="flex items-center gap-3 text-xs font-black text-indigo-500 uppercase tracking-[0.2em] border-b border-indigo-100 pb-3 mb-6">
                                            <Bold size={14} /> Text Weights
                                        </h4>
                                        <div className="grid grid-cols-1 gap-8 px-2">
                                            <RangeSlider
                                                label="Question Boldness"
                                                value={config.questionBoldness}
                                                onChange={val => setConfig({ ...config, questionBoldness: val })}
                                                min={400}
                                                max={900}
                                                step={100}
                                            />
                                            <RangeSlider
                                                label="Options Boldness"
                                                value={config.optionBoldness}
                                                onChange={val => setConfig({ ...config, optionBoldness: val })}
                                                min={400}
                                                max={900}
                                                step={100}
                                            />
                                            <RangeSlider
                                                label="Solution Text Weight"
                                                value={config.solutionBoldness}
                                                onChange={val => setConfig({ ...config, solutionBoldness: val })}
                                                min={400}
                                                max={900}
                                                step={100}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'display' && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-300">
                                    <div className="grid grid-cols-1 gap-3">
                                        <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-3 px-1">Toggles & Visibility</h4>
                                        <Toggle label="Bilingual support (Hindi)" value={config.billingualPDF} onChange={v => setConfig({ ...config, billingualPDF: v })} />
                                        <Toggle label="Show Detailed Solutions" value={config.showSolution} onChange={v => setConfig({ ...config, showSolution: v })} />
                                        <Toggle label="Mark Correct Answer Bold" value={config.answerBold} onChange={v => setConfig({ ...config, answerBold: v })} />
                                        <Toggle label="Security Watermark" value={config.showWatermark} onChange={v => setConfig({ ...config, showWatermark: v })} />
                                        <Toggle label="Show Unique QR Codes" value={config.showQR} onChange={v => setConfig({ ...config, showQR: v })} />
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-3 px-1">Component Hiding</h4>
                                        <Toggle label="Hide Question Text" value={config.hideQuestion} onChange={v => setConfig({ ...config, hideQuestion: v })} />
                                        <Toggle label="Hide All Options" value={config.hideOption} onChange={v => setConfig({ ...config, hideOption: v })} />
                                        <Toggle label="Hide Explanation Boxes" value={config.hideBoxExplanation} onChange={v => setConfig({ ...config, hideBoxExplanation: v })} />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'colors' && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-300 px-1">
                                    <div className="grid grid-cols-1 gap-6">
                                        <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-2 px-1">Branding Colors</h4>
                                        <ColorPicker label="Header Background" value={config.headerBgColor} onChange={v => setConfig({ ...config, headerBgColor: v })} />
                                        <ColorPicker label="Footer Strip Color" value={config.footerBgColor} onChange={v => setConfig({ ...config, footerBgColor: v })} />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6">
                                        <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-2 px-1">Content Colors</h4>
                                        <ColorPicker label="Question Text Color" value={config.questionColor} onChange={v => setConfig({ ...config, questionColor: v })} />
                                        <ColorPicker label="Options Text Color" value={config.optionColor} onChange={v => setConfig({ ...config, optionColor: v })} />
                                        <ColorPicker label="Q-Number Accent" value={config.questionNumberColor} onChange={v => setConfig({ ...config, questionNumberColor: v })} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Bar Footer */}
                        <div className="p-8 border-t bg-white bg-opacity-80 backdrop-blur-md">
                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="w-full h-16 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white shadow-2xl shadow-indigo-200 text-sm font-black uppercase tracking-[0.2em] rounded-2xl group relative overflow-hidden active:scale-95 transition-all"
                            >
                                {isGenerating ? (
                                    <div className="flex items-center gap-3">
                                        <RefreshCw className="animate-spin" size={20} /> Generating Document...
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-3">
                                        <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
                                        <span>Export to PDF</span>
                                    </div>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Right Panel: Live Preview Rendering */}
                    <div className="flex-1 bg-slate-100 overflow-hidden relative">
                        <PreviewPanel />
                    </div>

                </div>
            </div>
        </div>
    );
};

const TypeIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4h16v3" /><path d="M9 20h6" /><path d="M12 4v16" /></svg>
);
