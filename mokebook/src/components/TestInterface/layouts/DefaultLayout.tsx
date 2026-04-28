"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useExamTheme } from "@/contexts/ExamThemeContext";
import { QuestionDisplay } from "../shared/QuestionDisplay";
import { OptionButton } from "../shared/OptionButton";
import { SubmitDialog } from "../shared/SubmitDialog";
import { ZoomIn, ZoomOut, Maximize2, Pause, Settings, ArrowLeft, ArrowRight, Triangle, Filter, AlertTriangle, Bookmark, ChevronRight, Menu, Share2 } from "lucide-react";

interface DefaultLayoutProps {
    isReviewMode?: boolean;
    testName: string;
    durationMins: number;
    questions: any[];
    currentIndex: number;
    answers: Record<string, string[]>;
    marked: Set<string>;
    onSelectQuestion: (index: number) => void;
    onAnswer: (questionId: string, selected: string[]) => void;
    onMarkReview: () => void;
    onClear: () => void;
    onSaveNext: () => void;
    onSubmit: () => void;
    integerAnswers: Record<string, string>;
    onIntegerChange: (questionId: string, value: string) => void;
    isReattemptMode?: boolean;
    onToggleReattempt?: () => void;
    language?: 'en' | 'hi';
    onLanguageChange?: (lang: 'en' | 'hi') => void;
}

export function DefaultLayout(props: DefaultLayoutProps) {
    const { cssVariables } = useExamTheme();
    const [showSubmit, setShowSubmit] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(100);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showSolution, setShowSolution] = useState(false);

    const {
        testName, durationMins, questions, currentIndex,
        answers, marked, onSelectQuestion, onAnswer,
        onMarkReview, onClear, onSaveNext, onSubmit,
        integerAnswers, onIntegerChange,
        isReviewMode, isReattemptMode, onToggleReattempt,
        language = 'en', onLanguageChange,
    } = props;

    // Reset solution visibility when question changes
    useEffect(() => {
        setShowSolution(false);
    }, [currentIndex]);

    const question = questions[currentIndex];
    const selected = answers[question?.id] || [];
    const isMarked = marked.has(question?.id);

    const totalAnswered = questions.filter(q => answers[q.id]?.length).length;
    const totalMarked = questions.filter(q => marked.has(q.id)).length;

    const paletteQuestions = questions.map((q, idx) => {
        let status: any = "not-visited";
        if (isReviewMode) {
            status = q.status === "CORRECT" ? "answered" : q.status === "INCORRECT" ? "not-answered" : "not-visited";
            if (idx === currentIndex && status === "not-visited") status = "not-answered";
        } else {
            status = answers[q.id]?.length
                ? marked.has(q.id) ? "marked-and-answered" : "answered"
                : marked.has(q.id) ? "marked-for-review" : idx === currentIndex ? "not-answered" : "not-visited";
        }
        return { id: q.id, number: q.number || idx + 1, section: q.section, status };
    });

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };

    const [timeLeft, setTimeLeft] = useState(durationMins * 60);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(t => Math.max(0, t - 1));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleZoomIn = () => setZoomLevel(z => Math.min(z + 10, 150));
    const handleZoomOut = () => setZoomLevel(z => Math.max(z - 10, 70));

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    return (
        <div className="h-screen flex flex-col bg-white overflow-hidden" style={{ ...cssVariables }}>
            
            {/* Desktop Header */}
            <header className="hidden md:block bg-[#1976D2] text-white shrink-0">
                <div className="flex items-center justify-between px-4 h-10">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                             <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
                                <Triangle className="w-3 h-3 text-[#1976D2] fill-[#1976D2]" />
                            </div>
                            <div className="font-bold text-[14px]">MockVeda</div>
                        </div>
                        <div className="text-[11px] opacity-80 truncate max-w-[300px]">{testName}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleZoomIn} className="text-[11px] bg-blue-600 hover:bg-blue-700 px-2 py-0.5 rounded flex items-center gap-1 transition-all">
                            <ZoomIn className="w-3 h-3" /> Zoom (+)
                        </button>
                        <button onClick={handleZoomOut} className="text-[11px] bg-blue-600 hover:bg-blue-700 px-2 py-0.5 rounded flex items-center gap-1 transition-all">
                            <ZoomOut className="w-3 h-3" /> Zoom (-)
                        </button>
                        <button onClick={toggleFullscreen} className="text-[11px] bg-blue-600 hover:bg-blue-700 px-2 py-0.5 rounded flex items-center gap-1 transition-all">
                            <Maximize2 className="w-3 h-3" /> {isFullscreen ? "Exit Fullscreen" : "Show Fullscreen"}
                        </button>
                        
                        {/* Language Selector Desktop */}
                        <div className="flex items-center gap-2 ml-4 border-l border-white/20 pl-4">
                            <span className="text-[10px] opacity-80 uppercase font-bold tracking-wider">View In:</span>
                            <select 
                                value={language} 
                                onChange={(e) => onLanguageChange?.(e.target.value as 'en' | 'hi')}
                                className="bg-white text-gray-800 text-[11px] font-bold px-2 py-0.5 rounded border-none outline-none cursor-pointer"
                            >
                                <option value="en">English</option>
                                <option value="hi">Hindi</option>
                            </select>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Header (from Screenshot) */}
            <header className="md:hidden bg-[#1A1A1A] text-white shrink-0">
                <div className="flex items-center justify-between px-4 h-12">
                    <div className="flex items-center gap-3">
                        <ArrowLeft className="w-5 h-5" onClick={() => window.history.back()} />
                        <div className="text-[13px] font-bold truncate max-w-[200px] uppercase">{testName}</div>
                    </div>
                    <div className="flex items-center gap-3">
                         <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
                            <Triangle className="w-3 h-3 text-white fill-white" />
                        </div>
                        <Menu className="w-6 h-6" />
                    </div>
                </div>
                {/* Mobile Language & Filter Strip */}
                <div className="bg-white border-b flex items-center h-10 px-2 overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-2 mr-3 shrink-0">
                        <button 
                            onClick={() => onLanguageChange?.('en')}
                            className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-bold border",
                                language === 'en' ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-300 text-gray-600"
                            )}
                        >
                            EN
                        </button>
                        <button 
                            onClick={() => onLanguageChange?.('hi')}
                            className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-bold border",
                                language === 'hi' ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-300 text-gray-600"
                            )}
                        >
                            HI
                        </button>
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                        {paletteQuestions.map((q, idx) => (
                            <button
                                key={q.id}
                                onClick={() => onSelectQuestion(idx)}
                                className={cn(
                                    "min-w-[28px] h-7 rounded-full text-[12px] font-bold flex items-center justify-center transition-all",
                                    idx === currentIndex ? "bg-green-600 text-white ring-2 ring-green-200" : "bg-gray-100 text-gray-600"
                                )}
                                style={{
                                    background: idx === currentIndex ? "#16A34A" : (q.status === "answered" ? "#16A34A" : (q.status === "not-answered" ? "#EF4444" : "#F3F4F6")),
                                    color: (idx === currentIndex || q.status !== "not-visited") ? "#FFF" : "#4B5563"
                                }}
                            >
                                {q.number}
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center gap-1 text-[11px] font-bold text-gray-800 ml-2 shrink-0 pr-2">
                        <Filter className="w-3 h-3" /> Filters
                    </button>
                </div>
            </header>

            {/* Sub-header (Desktop) */}
            <div className="hidden md:flex items-center justify-between px-4 py-1 border-b bg-white shrink-0">
                <div className="text-[11px] text-gray-600">Roll No: 8863999*** [Rahul]</div>
                <div className="flex items-center gap-3">
                    <button className="text-[11px] flex items-center gap-1 text-gray-600 hover:text-gray-800"><Settings className="w-3 h-3" /> Settings</button>
                    <button className="text-[11px] flex items-center gap-1 text-gray-600 hover:text-gray-800"><Pause className="w-3 h-3" /> Pause</button>
                    <div className="bg-[#FF6B2B] text-white text-[11px] font-bold px-2 py-0.5 rounded">Time Left: {formatTime(timeLeft)}</div>
                </div>
            </div>

            {/* Mobile Question Info Strip */}
            <div className="md:hidden flex items-center justify-between px-4 py-2 border-b bg-white shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-600 text-white text-[11px] font-bold flex items-center justify-center">{currentIndex + 1}</div>
                    <div className="flex items-center gap-1 text-[11px] text-gray-500">
                        <Pause className="w-3 h-3 text-red-500" /> 4min 0sec
                    </div>
                    <div className="text-[11px] font-bold">
                        <span className="text-green-600">+2.0</span> <span className="text-red-500">-0.5</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-gray-400" />
                    <Bookmark className="w-4 h-4 text-gray-400" />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Question Area */}
                <div className="flex-1 overflow-y-auto" style={{ fontSize: `${zoomLevel}%` }}>
                    {question && (
                        <div className="p-4 md:p-6">
                            {/* Desktop Question Header */}
                            <div className="hidden md:block">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[13px] font-bold text-gray-800">Question : {question.number || currentIndex + 1}</span>
                                    {isReviewMode && !showSolution && (
                                        <button 
                                            onClick={() => setShowSolution(true)}
                                            className="px-4 py-1.5 rounded-lg border border-blue-500 text-blue-600 font-bold text-[12px] hover:bg-blue-50 transition-all"
                                        >
                                            View Solution
                                        </button>
                                    )}
                                </div>
                                <hr className="border-gray-300 mb-3" />
                            </div>

                            <QuestionDisplay
                                question={{ ...question, number: question.number || currentIndex + 1 }}
                                showMarks={false}
                                showType={false}
                                language={language}
                            />

                            {/* Re-attempt mode Indicator (Matches Screenshot) */}
                            {isReviewMode && isReattemptMode && (
                                <div className="mt-4 p-4 rounded-lg bg-orange-50 border border-orange-100 max-w-md">
                                    <h4 className="text-[14px] font-bold text-orange-800">Re-attempt mode: ON</h4>
                                    <p className="text-[12px] text-orange-600 mt-1">Now You can re-attempt the question</p>
                                </div>
                            )}
                            
                            <div className="my-6">
                                <OptionButton
                                    options={question.options || []}
                                    type={question.type || "mcq_single"}
                                    selected={selected}
                                    onChange={(sel) => onAnswer(question.id, sel)}
                                    integerValue={integerAnswers[question.id]}
                                    onIntegerChange={(val) => onIntegerChange(question.id, val)}
                                    isReviewMode={isReviewMode}
                                    correctOptionIds={question.correctOptionIds}
                                    explanation={question.explanation}
                                    explanationEn={question.explanationEn}
                                    explanationHi={question.explanationHi}
                                    forceShowSolution={showSolution}
                                    isReattemptMode={isReattemptMode}
                                    language={language}
                                />
                            </div>

                            {/* Mobile View Solution Button */}
                            {isReviewMode && !showSolution && (
                                <button 
                                    onClick={() => setShowSolution(true)}
                                    className="w-full mt-4 py-3 rounded border border-blue-500 text-blue-500 font-bold text-[14px] bg-white active:bg-blue-50 transition-all"
                                >
                                    View Solution
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Desktop Right Sidebar */}
                <aside className="w-[260px] border-l bg-white hidden md:flex flex-col overflow-hidden shrink-0">
                    <div className="p-2 border-b flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-[11px] font-bold">👤</div>
                        <div className="text-[11px] font-semibold">Rahul</div>
                    </div>

                    <div className="p-2 border-b">
                        <div className="text-[11px] font-bold mb-1.5">Quantitative Aptitude</div>
                        <div className="grid grid-cols-5 gap-1">
                            {paletteQuestions.map((q, idx) => (
                                <button
                                    key={q.id}
                                    onClick={() => onSelectQuestion(idx)}
                                    className={cn(
                                        "w-full h-7 rounded-full text-[10px] font-bold transition-all",
                                        idx === currentIndex && "ring-2 ring-offset-1 ring-blue-500"
                                    )}
                                    style={{
                                        background: q.status === "answered" ? "#3B82F6"
                                            : q.status === "marked-for-review" ? "#F59E0B"
                                                : q.status === "marked-and-answered" ? "#8B5CF6"
                                                    : q.status === "not-answered" ? "#EF4444"
                                                        : "#E5E7EB",
                                        color: q.status === "not-visited" ? "#374151" : "#fff",
                                    }}
                                >
                                    {q.number}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-2 border-b">
                        <div className="text-[11px] font-bold mb-1">Total Questions answered: {totalAnswered}</div>
                        <div className="space-y-1 text-[10px]">
                            <div className="flex items-center justify-between"><span>Answered</span><span className="text-blue-600 font-bold">{totalAnswered}</span></div>
                            <div className="flex items-center justify-between"><span>Marked</span><span className="text-amber-600 font-bold">{totalMarked}</span></div>
                            <div className="flex items-center justify-between"><span>Not Visited</span><span className="text-red-500 font-bold">{questions.length - totalAnswered - totalMarked}</span></div>
                        </div>
                    </div>

                    <div className="p-2 bg-gray-100">
                        <div className="text-[11px] font-bold bg-gray-300 px-2 py-0.5 mb-1 text-center uppercase">PART-A Analysis</div>
                        <div className="space-y-0.5 text-[10px]">
                            <div className="flex items-center justify-between"><span>Answered</span><span className="text-amber-600 font-bold">{totalAnswered}</span></div>
                            <div className="flex items-center justify-between"><span>Not Answered</span><span className="text-amber-600 font-bold">{questions.length - totalAnswered}</span></div>
                        </div>
                        <button className="w-full mt-2 bg-[#3B82F6] text-white text-[10px] font-bold py-1 rounded">Show Camera</button>
                    </div>
                </aside>
            </div>

            {/* Bottom Bar - Desktop */}
            <footer className="hidden md:flex h-12 items-center justify-between px-4 border-t bg-white shrink-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <button onClick={onMarkReview} className="px-3 py-1 rounded border border-purple-400 text-purple-600 text-[11px] font-bold hover:bg-purple-50">Mark & Save</button>
                        <button onClick={onClear} className="px-3 py-1 rounded border border-red-400 text-red-600 text-[11px] font-bold hover:bg-red-50">Clear Response</button>
                    </div>

                    {/* Re-attempt Toggle for Desktop */}
                    {isReviewMode && (
                        <div className="flex items-center gap-2 border-l pl-6">
                            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Re-attempt Questions</span>
                            <button 
                                onClick={onToggleReattempt}
                                className={cn(
                                    "w-10 h-5 rounded-full transition-all relative",
                                    isReattemptMode ? "bg-blue-600" : "bg-gray-300"
                                )}
                            >
                                <div className={cn(
                                    "w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all",
                                    isReattemptMode ? "left-[22px]" : "left-0.5"
                                )} />
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button disabled={currentIndex === 0} onClick={() => onSelectQuestion(currentIndex - 1)} className="px-3 py-1 rounded border border-gray-300 text-gray-600 text-[11px] font-bold hover:bg-gray-50 disabled:opacity-40"><ArrowLeft className="w-3 h-3 inline mr-1" />Prev</button>
                    <button onClick={onSaveNext} className="px-3 py-1 rounded bg-[#3B82F6] text-white text-[11px] font-bold hover:bg-blue-700">Save & Next<ArrowRight className="w-3 h-3 inline ml-1" /></button>
                    <button onClick={() => setShowSubmit(true)} className="px-3 py-1 rounded bg-[#22C55E] text-white text-[11px] font-bold hover:bg-green-600">{isReviewMode ? "Exit Review" : "Submit Test"}</button>
                </div>
            </footer>

            {/* Bottom Bar - Mobile */}
            <footer className="md:hidden border-t bg-[#F9FAFB] p-3 shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-[11px] text-gray-500 leading-tight">
                        {isReattemptMode 
                            ? "Re-attempt mode is ON. Now You can re-attempt the question."
                            : "Re-attempt mode is OFF. Turn ON the Re-attempt mode or re-attempt the question to see the solutions."}
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-gray-600">Re-attempt Mode</span>
                        <button 
                            onClick={onToggleReattempt}
                            className={cn(
                                "w-10 h-5 rounded-full transition-all relative mt-1",
                                isReattemptMode ? "bg-blue-600" : "bg-gray-200"
                            )}
                        >
                            <div className={cn(
                                "w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all",
                                isReattemptMode ? "left-[22px]" : "left-0.5"
                            )} />
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                         <button className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={onSaveNext}
                            className="w-10 h-10 rounded-full bg-[#3B82F6] flex items-center justify-center text-white"
                        >
                            <ArrowRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </footer>

            <SubmitDialog
                open={showSubmit}
                onOpenChange={setShowSubmit}
                questions={paletteQuestions}
                onConfirm={onSubmit}
                onCancel={() => setShowSubmit(false)}
            />
        </div>
    );
}
