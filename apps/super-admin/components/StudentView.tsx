
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { QuestionSet, Question } from '../types';
import { Button } from './Button';
import {
    ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertCircle,
    Trophy, Home, RotateCcw, BookOpen, Clock, Zap, Lock, Key, Languages, Search, Printer, Download, FileText, Presentation, Image as ImageIcon, LayoutGrid, Timer
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ReadOnlyCanvas } from './SmartBoard/ReadOnlyCanvas';
import { Stroke as DrawingPath } from './SmartBoard/types';

interface StudentViewProps {
    onExit: () => void;
    initialSetId?: string;
}

export const StudentView: React.FC<StudentViewProps> = ({ onExit, initialSetId }) => {
    const [mode, setMode] = useState<'entry' | 'practice' | 'results' | 'auth'>('entry');
    const [passwordInput, setPasswordInput] = useState('');
    const [studentName, setStudentName] = useState('');
    const [setId, setSetId] = useState('');
    const [lang, setLang] = useState<'eng' | 'hin'>('eng');
    const [activeSet, setActiveSet] = useState<QuestionSet | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [feedback, setFeedback] = useState<Record<number, boolean>>({}); // true if checked
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(0);
    const [resultSaved, setResultSaved] = useState(false);

    // Notes / Download State
    const [annotations, setAnnotations] = useState<Record<number, DrawingPath[]>>({});
    const [allowDownload, setAllowDownload] = useState(false);
    const [viewMode, setViewMode] = useState<'quiz' | 'notes'>('quiz'); // Toggle between Quiz and Notes logic

    // Browsing State
    const [activeTab, setActiveTab] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly' | 'All'>('All');
    const [publicSets, setPublicSets] = useState<QuestionSet[]>([]);

    const [timeLeft, setTimeLeft] = useState<number | null>(null); // Seconds
    const [showPalette, setShowPalette] = useState(false);

    useEffect(() => {
        if (initialSetId) {
            setSetId(initialSetId);
            loadSetDirectly(initialSetId);
        } else if (mode === 'entry') {
            loadPublicSets();
        }
    }, [mode, initialSetId]);

    // Timer Logic
    useEffect(() => {
        if (mode !== 'practice' || timeLeft === null) return;

        if (timeLeft <= 0) {
            finishQuiz();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [mode, timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const loadPublicSets = async () => {
        const sets = await storageService.getSets();
        setPublicSets(sets.filter(s => s.status === 'public'));
    };

    const loadSetDirectly = async (idToLoad: string) => {
        loadSetLogic(idToLoad);
    };

    const loadSet = () => loadSetLogic(setId);

    const loadSetLogic = async (id: string) => {
        if (!id.trim()) return;
        setLoading(true);
        try {
            const set = await storageService.getSetById(id);
            if (!set) {
                alert("Set not found. Please check the ID.");
                setLoading(false);
                return;
            }
            const allQuestions = await storageService.getQuestions();
            const qs = set.questionIds
                .map(id => allQuestions.find(q => q.id === id))
                .filter((q): q is Question => !!q);

            if (qs.length === 0) {
                alert("This set has no questions.");
                setLoading(false);
                return;
            }

            setActiveSet(set);
            setQuestions(qs);

            if (set.password && set.password.trim() !== '') {
                setMode('auth');
            } else {
                setMode('practice');
                setStartTime(Date.now());
            }

            if (set.settings?.annotations) {
                setAnnotations(set.settings.annotations);
            }
            if (set.settings?.allowDownload) {
                setAllowDownload(set.settings.allowDownload);
            }
            if (set.settings?.timerEnabled && set.settings.durationSeconds) {
                setTimeLeft(set.settings.durationSeconds);
            } else {
                setTimeLeft(null);
            }

        } catch (e) {
            console.error(e);
            alert("Error loading set");
        } finally {
            setLoading(false);
        }
    };

    const handleAuth = () => {
        if (activeSet?.password === passwordInput) {
            setMode('practice');
            setStartTime(Date.now());
        } else {
            setError("Incorrect Password");
            setPasswordInput('');
        }
    };

    const handleAnswerSelect = (optionIdx: number) => {
        if (feedback[currentIdx]) return;
        const char = String.fromCharCode(65 + optionIdx);
        setAnswers(prev => ({ ...prev, [currentIdx]: char }));
    };

    const checkAnswer = () => {
        if (!answers[currentIdx]) return;
        setFeedback(prev => ({ ...prev, [currentIdx]: true }));
        const q = questions[currentIdx];
        if (answers[currentIdx] === q.answer) {
            setScore(s => s + 1);
        }
    };

    const handleExamNext = () => {
        // Just save (already done via handleAnswerSelect) and move next
        if (answers[currentIdx]) {
            // Check strictly for score calculation at end, even if feedback hidden
            const q = questions[currentIdx];
            if (answers[currentIdx] === q.answer) {
                // We need to track score but maybe not visually update it if hidden
                // Actually score state is fine, user just won't see it until results
                if (!feedback[currentIdx]) { // Only add points once
                    setScore(s => s + 1);
                    setFeedback(prev => ({ ...prev, [currentIdx]: true })); // Mark as attempted
                }
            }
        }
        nextQuestion();
    };

    const nextQuestion = () => {
        if (currentIdx < questions.length - 1) {
            setCurrentIdx(p => p + 1);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = async () => {
        const end = Date.now();
        setEndTime(end);

        // Save Result
        if (activeSet) {
            const timeTakenSeconds = Math.floor((end - (startTime || end)) / 1000);
            const resultId = `res_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

            try {
                await storageService.saveResult({
                    id: resultId,
                    setId: activeSet.setId,
                    studentName: studentName || 'Anonymous',
                    score: score,
                    totalQuestions: questions.length,
                    answers: answers,
                    timeTaken: timeTakenSeconds,
                    completedDate: new Date().toISOString()
                });
                setResultSaved(true);
            } catch (err) {
                console.error('Failed to save result:', err);
                // Don't block results screen if save fails
            }
        }

        setMode('results');
    };

    const downloadCurrentNote = async () => {
        const element = document.getElementById('student-notes-view');
        if (!element) {
            alert("Could not capture slide.");
            return;
        }

        // Hide UI controls temporarily for clean capture
        const controls = element.querySelectorAll('.no-capture');
        controls.forEach(el => (el as HTMLElement).style.opacity = '0');

        try {
            const canvas = await html2canvas(element, {
                scale: 2, // Higher quality
                useCORS: true, // Handle cross-origin images
                allowTaint: true,
                backgroundColor: '#0A0C10',
                logging: false,
                ignoreElements: (el) => el.classList.contains('no-capture') // Double safety
            });

            // Restore UI
            controls.forEach(el => (el as HTMLElement).style.opacity = '1');

            // Generate proper PDF
            const imgData = canvas.toDataURL('image/jpeg', 0.9);
            const pdfWidth = canvas.width / 2; // account for scale 2
            const pdfHeight = canvas.height / 2;

            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [pdfWidth, pdfHeight]
            });

            doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            doc.save(`${activeSet?.name?.replace(/[^a-z0-9]/gi, '_') || 'ClassNote'}_Slide${currentIdx + 1}.pdf`);
        } catch (err) {
            console.error("Download failed:", err);
            controls.forEach(el => (el as HTMLElement).style.opacity = '1');
            alert("Download failed. Please try again.");
        }
    };

    const downloadClassroomSheet = () => {
        // Generate PDF of Question + Solution text
        // For now, simpler implementation: Just download generic sheet
        // Ideally we iterate ALL questions and add them to PDF.
        const doc = new jsPDF();
        let y = 20;
        questions.forEach((q, i) => {
            if (y > 250) { doc.addPage(); y = 20; }
            doc.setFontSize(12);
            doc.text(`Q${i + 1}. ${q.question_eng.replace(/<[^>]+>/g, '')}`, 10, y);
            y += 10;
        });
        doc.save(`${activeSet?.name || 'Sheet'}_Questions.pdf`);
    };


    const filteredSets = publicSets.filter(s => activeTab === 'All' ? true : s.category === activeTab);

    if (mode === 'entry') {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center p-12 text-white selection:bg-primary/20 relative overflow-x-hidden">
                {/* 1. CINEMATIC BACKGROUND */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-success/10 rounded-full blur-[140px] animate-pulse"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[140px]"></div>
                </div>

                <div className="max-w-7xl w-full space-y-16 relative z-10">
                    {/* Institutional Header */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-b border-white/5 pb-10">
                        <div className="text-left space-y-2">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-success/10 rounded-2xl flex items-center justify-center text-success border border-success/20">
                                    <BookOpen size={24} />
                                </div>
                                <h1 className="text-4xl font-black tracking-tight font-heading uppercase">Student Portal</h1>
                            </div>
                            <p className="text-slate-500 text-lg font-medium max-w-xl leading-relaxed">Access high-fidelity practice sets and professional examination material curated for elite learning outcomes.</p>
                        </div>
                        <Button variant="ghost" onClick={onExit} className="rounded-2xl px-8 hover:bg-white/5 border border-white/5 text-slate-400">Exit Environment</Button>
                    </div>

                    {/* Advanced Filter Interface */}
                    <div className="flex flex-col lg:flex-row items-center gap-10">
                        <div className="flex flex-wrap items-center justify-center gap-2 glass p-2 rounded-[32px] border border-white/10">
                            {['All', 'Daily', 'Weekly', 'Monthly', 'Yearly'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === tab ? 'bg-success text-white shadow-xl shadow-success/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="hidden lg:block h-12 w-px bg-white/10"></div>
                        <div className="relative flex-1 w-full max-w-md group">
                            <input
                                type="text"
                                placeholder="Enter Direct Access Code..."
                                value={setId}
                                onKeyDown={(e) => e.key === 'Enter' && loadSet()}
                                onChange={e => setSetId(e.target.value)}
                                className="w-full bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-[28px] pl-6 pr-16 py-5 text-sm text-white focus:border-success outline-none transition-all placeholder:text-slate-600 focus:shadow-[0_0_30px_rgba(34,197,94,0.1)] group-hover:border-white/20"
                            />
                            <button onClick={loadSet} className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-success text-white rounded-2xl hover:bg-success-dark transition-all shadow-lg shadow-success/20">
                                <Search size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Practice Set Architecture */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredSets.map((set, idx) => (
                            <div
                                key={set.setId}
                                className="glass rounded-[40px] p-8 text-left hover:border-success/40 transition-all group/card hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] flex flex-col border border-white/5 animate-in fade-in zoom-in-95 duration-500"
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="px-4 py-1.5 bg-success/10 border border-success/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-success">{set.category || 'Standard'}</div>
                                    {set.password && (
                                        <div className="w-8 h-8 rounded-xl bg-warning/10 flex items-center justify-center text-warning border border-warning/20">
                                            <Lock size={14} />
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 leading-tight font-heading">{set.name}</h3>
                                <p className="text-sm text-slate-500 line-clamp-2 mb-8 flex-1 font-medium leading-relaxed">{set.description || "Synthesized examination set optimized for academic mastery."}</p>

                                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-600 mb-8 border-t border-white/5 pt-6">
                                    <span className="flex items-center gap-2"><Clock size={14} /> {new Date(set.createdDate).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-2"><Zap size={14} /> {set.questionIds?.length || 0} ITEMS</span>
                                </div>

                                <button
                                    onClick={() => { setSetId(set.setId); setTimeout(loadSet, 0); }}
                                    className="w-full py-4 rounded-2xl bg-success text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-success/10 hover:shadow-success/20 transition-all transform group-hover/card:scale-[1.02]"
                                >
                                    Initialize Practice
                                </button>
                            </div>
                        ))}
                        {filteredSets.length === 0 && (
                            <div className="col-span-full py-32 text-center bg-white/5 rounded-[48px] border border-dashed border-white/10">
                                <BookOpen size={64} className="mx-auto mb-6 text-slate-700" />
                                <p className="font-black uppercase tracking-[0.3em] text-sm text-slate-600">Archive Empty - Check Alternate Categories</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (mode === 'auth') return (
        <div className="h-screen flex items-center justify-center bg-slate-950 p-6 animate-in zoom-in-95 duration-500 selection:bg-primary/20">
            <div className="max-w-md w-full glass rounded-[40px] p-10 space-y-8 text-center border border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-warning to-transparent opacity-50"></div>
                <div className="w-20 h-20 bg-warning/10 rounded-[28px] flex items-center justify-center mx-auto mb-6 text-warning border border-warning/20">
                    <Lock size={32} />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white tracking-tight uppercase font-heading">Secured Session</h2>
                    <p className="text-slate-500 font-medium leading-relaxed">This examination environment requires professional authorization.</p>
                </div>

                <div className="space-y-4">
                    <div className="relative group text-left">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 block">Your Name (Optional)</label>
                        <input
                            type="text"
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            placeholder="Enter your name..."
                            className="w-full bg-black/20 border border-white/5 rounded-2xl px-6 py-4 text-white placeholder:text-slate-700 focus:outline-none focus:border-primary/50 transition-all focus:bg-black/40"
                        />
                    </div>

                    <div className="relative group">
                        <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-hover:text-warning" size={20} />
                        <input
                            type="password"
                            value={passwordInput}
                            onChange={(e) => { setPasswordInput(e.target.value); setError(null); }}
                            onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                            placeholder="Enter Authorization Token"
                            className="w-full bg-black/20 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-white placeholder:text-slate-700 focus:outline-none focus:border-warning/50 transition-all focus:bg-black/40"
                        />
                    </div>

                    {error && (
                        <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm font-medium animate-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}
                </div>

                <div className="flex gap-4">
                    <button onClick={() => setMode('entry')} className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-white/5 transition-all">Cancel</button>
                    <button onClick={handleAuth} className="flex-1 py-4 rounded-2xl bg-warning text-slate-950 font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-warning/10 hover:shadow-warning/20 transition-all">Authorize</button>
                </div>
            </div>
        </div>
    );

    if (mode === 'results') {
        const duration = Math.floor((endTime - startTime) / 1000);
        const percentage = Math.round((score / questions.length) * 100);

        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-12 text-white selection:bg-primary/20">
                <div className="max-w-2xl w-full glass rounded-[56px] p-16 text-center space-y-12 border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-700 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-success to-accent-purple opacity-50"></div>

                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-success/20 blur-[60px] rounded-full animate-pulse"></div>
                        <Trophy size={100} className="text-success relative drop-shadow-[0_0_30px_rgba(34,197,94,0.4)]" />
                        <div className="absolute -top-4 -right-4 w-12 h-12 bg-white text-slate-950 rounded-2xl flex items-center justify-center font-black text-lg shadow-2xl ring-4 ring-slate-950">
                            {score}
                        </div>
                    </div>

                    {resultSaved && (
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-success/10 border border-success/20 rounded-xl text-success text-sm font-bold animate-in slide-in-from-top-2">
                            <CheckCircle size={16} />
                            Result Saved Successfully
                        </div>
                    )}

                    <div className="space-y-4">
                        <h2 className="text-5xl font-black tracking-tight uppercase font-heading">Session Complete</h2>
                        {studentName && (
                            <p className="text-primary text-lg font-bold">Candidate: {studentName}</p>
                        )}
                        <p className="text-slate-500 text-xl font-medium">You achieved <span className="text-success font-black border-b-2 border-success/30 pb-1">{percentage}%</span> proficiency on {activeSet?.name}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="bg-white/[0.03] rounded-[32px] p-10 border border-white/5 group hover:bg-white/[0.05] transition-all">
                            <Clock size={28} className="mx-auto mb-4 text-primary" />
                            <div className="text-4xl font-black text-white font-mono">{Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}</div>
                            <div className="text-[10px] uppercase font-black text-slate-600 tracking-[0.3em] mt-2">Duration</div>
                        </div>
                        <div className="bg-white/[0.03] rounded-[32px] p-10 border border-white/5 group hover:bg-white/[0.05] transition-all">
                            <Zap size={28} className="mx-auto mb-4 text-warning" />
                            <div className="text-4xl font-black text-white font-mono">{questions.length}</div>
                            <div className="text-[10px] uppercase font-black text-slate-600 tracking-[0.3em] mt-2">Items Evaluated</div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 pt-6">
                        <button onClick={() => window.print()} className="w-full py-5 rounded-2xl bg-white text-slate-950 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-200 transition-all flex items-center justify-center gap-3">
                            <Printer size={16} /> Export Academic Transcript
                        </button>
                        <div className="flex gap-4">
                            <button onClick={() => { setMode('entry'); setAnswers({}); setFeedback({}); setScore(0); }} className="flex-1 py-5 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all">
                                New Environment
                            </button>
                            <button onClick={onExit} className="flex-1 py-5 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                                Termination Session
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const q = questions[currentIdx];
    const isChecked = feedback[currentIdx];
    const isCorrect = answers[currentIdx] === q.answer;

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col text-white selection:bg-primary/20 font-sans">
            {/* 7. PRACTICE HEADER */}
            <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <button onClick={onExit} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl text-slate-500 hover:text-white hover:bg-primary transition-all group">
                        <Home size={18} />
                    </button>
                    <div className="h-6 w-px bg-white/10"></div>
                    <div>
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-0.5">Active Session</span>
                        <h1 className="font-bold text-sm text-slate-100 tracking-wide">{activeSet?.name}</h1>
                    </div>
                </div>



                <div className="flex items-center gap-6">
                    {timeLeft !== null && (
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-lg ${timeLeft < 60 ? 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse' : 'bg-white/5 border-white/10 text-white'}`}>
                            <Timer size={18} />
                            {formatTime(timeLeft)}
                        </div>
                    )}

                    <button
                        onClick={() => setShowPalette(!showPalette)}
                        className={`p-2.5 rounded-xl border transition-all ${showPalette ? 'bg-white text-slate-950 border-white' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
                    >
                        <LayoutGrid size={18} />
                    </button>

                    {allowDownload && (
                        <div className="flex bg-white/5 rounded-2xl p-1.5 border border-white/10">
                            {[
                                { id: 'quiz', label: 'Evaluation', icon: Zap },
                                { id: 'notes', label: 'Syllabus', icon: BookOpen }
                            ].map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => setViewMode(m.id as any)}
                                    className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === m.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-white'}`}
                                >
                                    <m.icon size={12} />
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={() => setLang(l => l === 'eng' ? 'hin' : 'eng')}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest text-slate-300"
                    >
                        <Languages size={14} className="text-primary" />
                        {lang === 'eng' ? 'English' : 'Hindi'}
                    </button>

                    <div className="h-10 w-px bg-white/10 mx-2"></div>

                    <div className="text-right">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-0.5">Item Progress</span>
                        <div className="font-mono text-primary font-black text-lg leading-none">
                            {currentIdx + 1}<span className="text-slate-700 mx-1">/</span>{questions.length}
                        </div>
                    </div>
                </div>
            </header >

            {/* Question Palette Overlay */}
            {
                showPalette && (
                    <div className="absolute top-24 right-10 z-40 w-80 glass border border-white/10 rounded-[32px] p-6 shadow-2xl animate-in slide-in-from-top-4">
                        <div className="grid grid-cols-5 gap-2">
                            {questions.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => { setCurrentIdx(idx); setShowPalette(false); }}
                                    className={`aspect-square rounded-xl text-sm font-bold flex items-center justify-center border transition-all ${currentIdx === idx ? 'bg-white text-slate-950 border-white' :
                                        answers[idx] ? 'bg-success/20 text-success border-success/30' :
                                            'bg-white/5 text-slate-500 border-white/5 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                )
            }

            {/* 8. PRACTICE MAIN CANVAS */}
            <main className="flex-1 flex flex-col items-center p-12 max-w-5xl mx-auto w-full relative">

                {/* Visual Progress Vector */}
                <div className="w-full h-1 bg-white/5 rounded-full mb-16 overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-700 ease-out shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                        style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                    />
                </div>

                {viewMode === 'notes' ? (
                    <div id="student-notes-view" className="fixed inset-0 z-[60] bg-slate-950 flex flex-col animate-in fade-in duration-500">
                        {/* Notes Institutional Header */}
                        <div className="absolute top-0 left-0 right-0 h-24 bg-slate-950/80 backdrop-blur-xl z-[70] flex items-center justify-between px-12 border-b border-white/5 no-capture">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setViewMode('quiz')} className="flex items-center gap-4 px-6 py-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-all border border-white/5">
                                    <ChevronLeft size={20} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Return to Evaluation</span>
                                </button>
                            </div>
                            <div className="flex gap-4">
                                {activeSet?.settings?.class_notes_url && (
                                    <a
                                        href={activeSet.settings.class_notes_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 px-6 py-3 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all group"
                                        title="Download Full Class Notes"
                                    >
                                        <Download size={20} />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden sm:inline-block">Full Class PDF</span>
                                    </a>
                                )}
                                <button onClick={downloadCurrentNote} className="w-12 h-12 flex items-center justify-center bg-success/10 text-success rounded-2xl border border-success/20 hover:bg-success hover:text-white transition-all" title="Download Slide"><ImageIcon size={20} /></button>
                                <button onClick={downloadClassroomSheet} className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary rounded-2xl border border-primary/20 hover:bg-primary hover:text-white transition-all" title="Download Sheet"><FileText size={20} /></button>
                            </div>
                        </div>

                        {/* High-Fidelity Capture Layer */}
                        <div className="flex-1 flex items-center justify-center relative z-10 p-20 mt-20">
                            {/* Annotation Canvas Overlay */}
                            <ReadOnlyCanvas
                                width={window.innerWidth}
                                height={window.innerHeight}
                                strokes={annotations[currentIdx] || []}
                                opacity={1}
                            />

                            <div className="glass rounded-[56px] p-20 w-full max-w-5xl border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col justify-center text-center">
                                <div className="space-y-12">
                                    <div className="flex justify-center">
                                        <div className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{q.subject}</div>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black text-white leading-[1.15] tracking-tight font-heading" dangerouslySetInnerHTML={{ __html: lang === 'eng' ? q.question_eng : q.question_hin }} />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16 text-left">
                                        {[q.option1_eng, q.option2_eng, q.option3_eng, q.option4_eng].map((opt, i) => (
                                            <div key={i} className={`p-8 rounded-[32px] border-2 transition-all flex items-center gap-6 ${answers[currentIdx] === String.fromCharCode(65 + i) ? 'bg-success/10 border-success/50 text-white' : 'bg-white/[0.03] border-transparent text-slate-400'}`}>
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 ${answers[currentIdx] === String.fromCharCode(65 + i) ? 'bg-success text-white' : 'bg-white/10 text-slate-500'}`}>
                                                    {String.fromCharCode(65 + i)}
                                                </div>
                                                <div className="text-xl font-bold leading-snug" dangerouslySetInnerHTML={{ __html: opt }} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Dock */}
                        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-10 p-4 glass rounded-[32px] border border-white/10 no-capture shadow-2xl">
                            <button
                                onClick={() => setCurrentIdx(p => Math.max(0, p - 1))}
                                disabled={currentIdx === 0}
                                className="w-14 h-14 flex items-center justify-center rounded-2xl text-slate-500 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-all border border-transparent hover:border-white/10"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <div className="text-center px-4">
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-0.5">Note Slide</span>
                                <span className="text-xl font-black text-white font-mono">{currentIdx + 1} <span className="text-slate-700">/</span> {questions.length}</span>
                            </div>
                            <button
                                onClick={() => setCurrentIdx(p => Math.min(questions.length - 1, p + 1))}
                                disabled={currentIdx === questions.length - 1}
                                className="w-14 h-14 flex items-center justify-center rounded-2xl text-slate-500 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-all border border-transparent hover:border-white/10"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="w-full space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Question Architecture */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-primary">{q.subject}</div>
                                <div className="px-4 py-1.5 bg-accent-purple/10 border border-accent-purple/20 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-accent-purple">{q.difficulty}</div>
                            </div>
                            <div className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-white font-heading" dangerouslySetInnerHTML={{ __html: lang === 'eng' ? q.question_eng : q.question_hin }} />
                        </div>

                        {/* Interaction Matrix */}
                        <div className="space-y-4">
                            {[
                                lang === 'eng' ? q.option1_eng : q.option1_hin,
                                lang === 'eng' ? q.option2_eng : q.option2_hin,
                                lang === 'eng' ? q.option3_eng : q.option3_hin,
                                lang === 'eng' ? q.option4_eng : q.option4_hin
                            ].map((opt, idx) => {
                                const char = String.fromCharCode(65 + idx);
                                const isSelected = answers[currentIdx] === char;
                                let containerClass = "relative p-8 rounded-[32px] border-2 flex items-center transition-all cursor-pointer group/opt ";

                                if (isChecked) {
                                    if (char === q.answer) containerClass += "bg-success/20 border-success shadow-[0_0_40px_rgba(34,197,94,0.15)]";
                                    else if (isSelected) containerClass += "bg-error/10 border-error/50 opacity-60";
                                    else containerClass += "bg-white/[0.02] border-transparent opacity-40";
                                } else {
                                    if (isSelected) containerClass += "bg-primary border-primary shadow-xl shadow-primary/20 scale-[1.02]";
                                    else containerClass += "bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10";
                                }

                                return (
                                    <div key={idx} onClick={() => handleAnswerSelect(idx)} className={containerClass}>
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg mr-6 transition-all ${isSelected ? 'bg-white text-slate-950 shadow-inner' : 'bg-white/10 text-slate-400 group-hover/opt:bg-white/20'
                                            }`}>
                                            {char}
                                        </div>
                                        <div className={`text-xl font-bold leading-snug transition-all ${isSelected ? 'text-white' : 'text-slate-300'}`} dangerouslySetInnerHTML={{ __html: opt }} />

                                        {isChecked && char === q.answer && (
                                            <div className="absolute right-8 flex items-center gap-2 text-success uppercase text-[10px] font-black tracking-widest animate-in zoom-in">
                                                <CheckCircle size={20} /> VALID REFERENCE
                                            </div>
                                        )}
                                        {isChecked && isSelected && char !== q.answer && (
                                            <div className="absolute right-8 flex items-center gap-2 text-error uppercase text-[10px] font-black tracking-widest animate-in zoom-in">
                                                <XCircle size={20} /> DISCREPANCY DETECTED
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Feedback & Logic Layer - Only show if checked AND showResults is NOT disabled */}
                        {isChecked && activeSet?.settings?.showResults !== false && (
                            <div className={`p-10 rounded-[40px] border glass animate-in slide-in-from-top-4 duration-500 shadow-2xl ${isCorrect ? 'border-success/30' : 'border-error/30'}`}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isCorrect ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
                                        {isCorrect ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                    </div>
                                    <h4 className={`text-sm font-black uppercase tracking-[0.2em] ${isCorrect ? 'text-success' : 'text-error'}`}>
                                        {isCorrect ? 'Mastery Confirmed' : 'Concept Misalignment'}
                                    </h4>
                                </div>
                                <div className="prose prose-invert prose-lg max-w-none">
                                    <div className="text-slate-300 font-medium leading-relaxed italic" dangerouslySetInnerHTML={{ __html: lang === 'eng' ? q.solution_eng : q.solution_hin }} />
                                </div>
                            </div>
                        )}

                        {/* Navigation Interface */}
                        <div className="pt-10 flex justify-between items-center border-t border-white/5">
                            <button onClick={() => setCurrentIdx(p => Math.max(0, p - 1))} disabled={currentIdx === 0} className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all disabled:opacity-0">
                                Previous Item
                            </button>

                            {!isChecked ? (
                                activeSet?.settings?.showResults === false ? (
                                    <button
                                        onClick={handleExamNext}
                                        disabled={!answers[currentIdx]}
                                        className="bg-white text-slate-950 hover:bg-slate-200 px-14 py-5 rounded-[24px] font-black text-[12px] uppercase tracking-[0.3em] shadow-2xl shadow-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all transform active:scale-95 flex items-center gap-3"
                                    >
                                        {currentIdx === questions.length - 1 ? 'Finish Exam' : 'Next Question'} <ChevronRight size={16} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={checkAnswer}
                                        disabled={!answers[currentIdx]}
                                        className="bg-white text-slate-950 hover:bg-slate-200 px-14 py-5 rounded-[24px] font-black text-[12px] uppercase tracking-[0.3em] shadow-2xl shadow-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all transform active:scale-95"
                                    >
                                        Validate Choice
                                    </button>
                                )
                            ) : (
                                <button
                                    onClick={nextQuestion}
                                    className="bg-primary text-white hover:bg-primary-dark px-14 py-5 rounded-[24px] font-black text-[12px] uppercase tracking-[0.3em] shadow-xl shadow-primary/20 transition-all flex items-center gap-3 group"
                                >
                                    {currentIdx === questions.length - 1 ? 'Finalize Synthesis' : 'Advance Objective'}
                                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div >
    );
};
