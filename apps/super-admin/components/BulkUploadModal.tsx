import React, { useState, useRef, useMemo } from 'react';
import { Upload, FileUp, AlertTriangle, CheckCircle, Save, X, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { bulkUploadService } from '../services/bulkUploadService';
import { PreviewRow } from '../types';
import { Button } from './Button';

interface BulkUploadModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ onClose, onSuccess }) => {
    const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'summary'>('upload');
    const [files, setFiles] = useState<File[]>([]);
    const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
    const [importStats, setImportStats] = useState({ saved: 0, failed: 0 });
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        try {
            setError(null);
            const rawData = await bulkUploadService.parseFile(file);
            const normalized = bulkUploadService.normalizeData(rawData);
            const validated = bulkUploadService.validateRows(normalized);
            setPreviewData(validated);
            setFiles([file]);
            setStep('preview');
        } catch (e: any) {
            setError(e.message || "Failed to parse file");
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
    };

    const handleConfirmImport = async () => {
        setStep('importing');
        try {
            const { savedCount, failedCount } = await bulkUploadService.saveBatch(previewData, files[0].name);
            setImportStats({ saved: savedCount, failed: failedCount });
            setStep('summary');
        } catch (e: any) {
            setError(e.message);
            setStep('preview'); // Go back on error
        }
    };

    const renderUploadStep = () => (
        <div className="h-full flex flex-col">
            <div
                className="flex-1 group relative border-2 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center text-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer overflow-hidden animate-in fade-in zoom-in-95 duration-500"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.xlsx,.xls,.json" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

                <div className="relative z-10 p-10">
                    <div className="w-24 h-24 bg-primary/10 text-primary rounded-[28px] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 border border-primary/20 shadow-xl shadow-primary/5">
                        <FileUp size={40} />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight font-heading uppercase">Ingestion Protocol</h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Drag & Drop Orchestration • CSV, Excel, JSON</p>
                </div>
            </div>

            <div className="mt-6 flex justify-center">
                <button
                    onClick={() => {
                        const csvContent = "question_hin,question_eng,subject,chapter,option1_hin,option1_eng,option2_hin,option2_eng,option3_hin,option3_eng,option4_hin,option4_eng,answer,solution_hin,solution_eng,level\nभारत की राजधानी क्या है?,What is the capital of India?,General Knowledge,Geography,मुंबई,Mumbai,नई दिल्ली,New Delhi,कोलकाता,Kolkata,चेन्नई,Chennai,B,नई दिल्ली भारत की राजधानी है।,New Delhi is the capital of India.,Easy";
                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                        const link = document.createElement('a');
                        if (link.download !== undefined) {
                            const url = URL.createObjectURL(blob);
                            link.setAttribute('href', url);
                            link.setAttribute('download', 'question_upload_template.csv');
                            link.style.visibility = 'hidden';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }
                    }}
                    className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-50 text-slate-600 hover:bg-primary hover:text-white text-[11px] font-black uppercase tracking-widest transition-all border border-slate-200 hover:border-primary shadow-sm hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1"
                >
                    <FileSpreadsheet size={16} />
                    Download Example Template
                </button>
            </div>
        </div>
    );

    const renderPreviewStep = () => (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8 px-2">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase font-heading">Data Verification</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                        Detected <span className="text-primary">{previewData.length}</span> Records •
                        <span className={previewData.filter(r => !r.isValid).length > 0 ? 'text-error' : 'text-success'}> {previewData.filter(r => !r.isValid).length} Discrepancies</span>
                    </p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => setStep('upload')} className="px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">Cancel Vector</button>
                    <button
                        onClick={handleConfirmImport}
                        disabled={previewData.filter(r => r.isValid).length === 0}
                        className="px-10 py-3.5 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
                    >
                        Execute Synchronize ({previewData.filter(r => r.isValid).length})
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden border border-slate-100 rounded-[32px] bg-white shadow-inner relative flex flex-col">
                <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full text-left text-[13px] border-collapse relative">
                        <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-20">
                            <tr>
                                <th className="p-5 font-black text-slate-400 uppercase tracking-widest text-[9px]">Status</th>
                                <th className="p-5 font-black text-slate-400 uppercase tracking-widest text-[9px]">Instructional Content</th>
                                <th className="p-5 font-black text-slate-400 uppercase tracking-widest text-[9px]">Solution A</th>
                                <th className="p-5 font-black text-slate-400 uppercase tracking-widest text-[9px]">Solution B</th>
                                <th className="p-5 font-black text-slate-400 uppercase tracking-widest text-[9px]">Key</th>
                                <th className="p-5 font-black text-slate-400 uppercase tracking-widest text-[9px]">Classification</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {previewData.map((row) => (
                                <tr key={row.id} className={`hover:bg-primary/[0.02] transition-colors group ${!row.isValid ? 'bg-error/[0.02]' : ''}`}>
                                    <td className="p-5">
                                        {row.isValid
                                            ? <div className="w-8 h-8 rounded-xl bg-success/10 text-success flex items-center justify-center border border-success/20"><CheckCircle size={16} /></div>
                                            : <div className="group relative">
                                                <div className="w-8 h-8 rounded-xl bg-error/10 text-error flex items-center justify-center border border-error/20 cursor-help"><AlertTriangle size={16} /></div>
                                                <div className="absolute left-10 top-0 bg-slate-900 text-white p-4 rounded-2xl w-64 z-50 hidden group-hover:block pointer-events-none shadow-2xl text-[10px] leading-relaxed border border-white/10 animate-in fade-in slide-in-from-left-2">
                                                    <span className="font-black uppercase tracking-widest text-error block mb-2">Protocol Violation:</span>
                                                    {row.errors.join(', ')}
                                                </div>
                                            </div>
                                        }
                                    </td>
                                    <td className="p-5 max-w-[300px] font-bold text-slate-700 truncate" title={row.question_text}>{row.question_text}</td>
                                    <td className="p-5 max-w-[120px] font-medium text-slate-500 truncate italic">{row.option_a}</td>
                                    <td className="p-5 max-w-[120px] font-medium text-slate-500 truncate italic">{row.option_b}</td>
                                    <td className="p-5">
                                        <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center font-black text-[10px]">{row.correct_answer}</span>
                                    </td>
                                    <td className="p-5">
                                        <span className="px-3 py-1 bg-primary/5 text-primary text-[9px] font-black uppercase rounded-lg border border-primary/10">{row.subject_name}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 backdrop-blur-xl p-8 selection:bg-primary/20 selection:text-primary">
            <div className="bg-white w-full max-w-7xl h-[85vh] rounded-[56px] shadow-[0_40px_100px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-500 border border-white/20">
                <div className="px-12 py-8 border-b flex justify-between items-center bg-white">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 group-hover:rotate-6 transition-transform">
                            <FileSpreadsheet size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight font-heading uppercase">Content Ingestion Hub</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Automated Academic Intelligence Capture</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"><X size={20} /></button>
                </div>

                <div className="flex-1 p-12 overflow-hidden flex flex-col">
                    {error && (
                        <div className="mb-8 bg-error/5 border-2 border-error/10 text-error p-6 rounded-[28px] flex items-center gap-4 animate-in slide-in-from-top-4 duration-300 shadow-lg shadow-error/5">
                            <div className="w-10 h-10 bg-error/10 rounded-xl flex items-center justify-center shrink-0">
                                <AlertCircle size={20} />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest mb-0.5">Vector Collision Detected</h4>
                                <p className="text-sm font-bold opacity-80 leading-snug">{error}</p>
                            </div>
                        </div>
                    )}

                    {step === 'upload' && renderUploadStep()}
                    {step === 'preview' && renderPreviewStep()}

                    {step === 'importing' && (
                        <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in fade-in duration-500">
                            <div className="relative">
                                <div className="w-24 h-24 border-4 border-primary/10 rounded-full"></div>
                                <div className="absolute inset-0 w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center text-primary">
                                    <Save size={32} className="animate-pulse" />
                                </div>
                            </div>
                            <div className="text-center">
                                <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase font-heading">Synchronizing Data</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Writing to Permanent Storage Matrix...</p>
                            </div>
                        </div>
                    )}

                    {step === 'summary' && (
                        <div className="flex flex-col items-center justify-center h-full space-y-12 animate-in zoom-in-95 duration-500 max-w-2xl mx-auto text-center">
                            <div className="w-32 h-32 bg-success/10 text-success rounded-[40px] flex items-center justify-center border-2 border-success/20 shadow-2xl shadow-success/10 scale-110">
                                <CheckCircle size={64} />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-4xl font-black text-slate-900 tracking-tight uppercase font-heading">Protocol Completed</h3>
                                <p className="text-slate-400 font-bold leading-relaxed">The content ingestion sequence has been finalized. New academic assets have been integrated into the central repository.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-10 w-full px-10">
                                <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100 group hover:border-primary transition-all">
                                    <div className="text-5xl font-black text-primary mb-2 font-mono tracking-tighter">{importStats.saved}</div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assets Secured</div>
                                </div>
                                <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100 group hover:border-error transition-all">
                                    <div className="text-5xl font-black text-error mb-2 font-mono tracking-tighter">{importStats.failed}</div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Items Deflected</div>
                                </div>
                            </div>

                            <div className="pt-8">
                                <button
                                    onClick={() => { onSuccess(); onClose(); }}
                                    className="px-16 py-6 bg-slate-950 text-white rounded-[24px] text-[12px] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-primary transition-all active:scale-95"
                                >
                                    Return to Inventory Matrix
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
