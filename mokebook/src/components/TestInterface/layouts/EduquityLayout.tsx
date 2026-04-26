"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useExamTheme } from "@/contexts/ExamThemeContext";
import { QuestionDisplay } from "../shared/QuestionDisplay";
import { OptionButton } from "../shared/OptionButton";
import { SubmitDialog } from "../shared/SubmitDialog";
import { ZoomIn, ZoomOut, Pause, Calculator, Triangle, ChevronDown, Settings } from "lucide-react";

interface EduquityLayoutProps {
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
}

export function EduquityLayout(props: EduquityLayoutProps) {
    const { cssVariables } = useExamTheme();
    const [showSubmit, setShowSubmit] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(100);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const {
        testName, durationMins, questions, currentIndex,
        answers, marked, onSelectQuestion, onAnswer,
        onMarkReview, onClear, onSaveNext, onSubmit,
        integerAnswers, onIntegerChange,
    } = props;

    const question = questions[currentIndex];
    const selected = answers[question?.id] || [];
    const isMarked = marked.has(question?.id);

    const totalAnswered = questions.filter(q => answers[q.id]?.length).length;
    const totalMarked = questions.filter(q => marked.has(q.id)).length;
    const totalNotAnswered = questions.length - totalAnswered;

    const paletteQuestions = questions.map((q, idx) => {
        const status: any = answers[q.id]?.length
            ? marked.has(q.id) ? "marked-and-answered" : "answered"
            : marked.has(q.id) ? "marked-for-review" : idx === currentIndex ? "not-answered" : "not-visited";
        return { id: q.id, number: q.number || idx + 1, section: q.section, status };
    });

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return {
            h: String(h).padStart(2, "0"),
            m: String(m).padStart(2, "0"),
            s: String(s).padStart(2, "0")
        };
    };

    const [timeLeft, setTimeLeft] = useState(durationMins * 60);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(t => Math.max(0, t - 1));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const time = formatTime(timeLeft);

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
            {/* ===== TOP HEADER BAR ===== */}
            <header className="bg-[#1e40af] text-white shrink-0 shadow-md">
                <div className="flex items-center justify-between px-4 h-[45px]">
                    {/* Left: Logo */}
                    <div className="flex items-center gap-2 min-w-[200px]">
                        <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
                            <Triangle className="w-3 h-3 text-[#1e40af] fill-[#1e40af]" />
                        </div>
                        <span className="font-extrabold text-[16px] text-white tracking-tight">MockVeda</span>
                        <div className="h-4 w-[1px] bg-white/20 mx-1" />
                        <span className="text-[10px] text-white/80 font-medium truncate max-w-[150px]">{testName}</span>
                    </div>

                    {/* Right: Actions & Fullscreen */}
                    <div className="flex items-center gap-3">
                        <button onClick={handleZoomIn} className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded flex items-center gap-1 transition-colors">
                            <ZoomIn className="w-3 h-3" /> Zoom (+)
                        </button>
                        <button onClick={handleZoomOut} className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded flex items-center gap-1 transition-colors">
                            <ZoomOut className="w-3 h-3" /> Zoom (-)
                        </button>
                        <button onClick={toggleFullscreen} className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded flex items-center gap-1 transition-colors">
                            {isFullscreen ? "Exit Fullscreen" : "Show Fullscreen"}
                        </button>
                    </div>
                </div>
            </header>

            {/* Sub-header: Roll No, Time Left */}
            <div className="flex items-center justify-between px-4 py-1 border-b border-gray-200 bg-white shrink-0">
                <div className="text-[11px] text-gray-600 font-medium italic">Roll No: 8863999*** [Rahul]</div>
                <div className="flex items-center gap-4">
                    <button className="text-[11px] flex items-center gap-1 text-gray-500 hover:text-gray-800">
                        <Settings className="w-3.5 h-3.5" /> Settings
                    </button>
                    <button className="text-[11px] flex items-center gap-1 text-gray-500 hover:text-gray-800">
                        <Pause className="w-3.5 h-3.5" /> Pause
                    </button>
                    <div className="bg-[#ef4444] text-white text-[11px] font-bold px-2.5 py-0.5 rounded shadow-sm flex items-center gap-2">
                        <span>Time Left:</span>
                        <span className="font-black tabular-nums">{time.m}:{time.s}</span>
                    </div>
                </div>
            </div>

            {/* ===== SECOND ROW: Links ===== */}
            <div className="flex items-center gap-6 px-4 py-1 bg-white border-b border-gray-200 shrink-0">
                <button className="text-[11px] font-bold text-orange-600 hover:underline uppercase tracking-wide">SYMBOLS</button>
                <button className="text-[11px] font-bold text-orange-600 hover:underline uppercase tracking-wide">INSTRUCTIONS</button>
            </div>

            {/* ===== PART BADGES ROW ===== */}
            <div className="flex items-center gap-2 px-4 py-1.5 border-b border-gray-200 bg-[#F8FAFC] shrink-0">
                <span className="bg-[#16A34A] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">PART-A</span>
                <span className="bg-[#2563EB] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase opacity-50">PART-B</span>
                <span className="bg-[#EF4444] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase opacity-50">PART-C</span>
                <span className="bg-[#F59E0B] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase opacity-50">PART-D</span>
            </div>

            {/* ===== ACTION BUTTONS ROW ===== */}
            <div className="flex items-center justify-center gap-3 py-2 border-b border-gray-200 bg-white shrink-0">
                <button
                    onClick={onMarkReview}
                    className={cn(
                        "px-6 py-1.5 rounded text-[11px] font-bold text-white transition-all shadow-sm",
                        isMarked ? "bg-purple-600" : "bg-[#2563EB] hover:bg-blue-700"
                    )}
                >
                    Mark for Review
                </button>
                <button
                    onClick={onSaveNext}
                    className="px-6 py-1.5 rounded text-[11px] font-bold text-white bg-[#2563EB] hover:bg-blue-700 transition-all shadow-sm"
                >
                    Save & Next
                </button>
                <button
                    onClick={() => setShowSubmit(true)}
                    className="px-6 py-1.5 rounded text-[11px] font-bold text-white bg-[#2563EB] hover:bg-blue-700 transition-all shadow-sm"
                >
                    Submit Test
                </button>
            </div>

            {/* ===== MAIN CONTENT ===== */}
            <div className="flex-1 flex overflow-hidden">
                {/* Question Area - Left Aligned */}
                <div className="flex-1 overflow-y-auto p-6 bg-white border-r border-gray-100" style={{ fontSize: `${zoomLevel}%` }}>
                    {question && (
                        <div className="w-full">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[14px] font-black text-gray-800">
                                    Question : {question.number || currentIndex + 1}
                                </span>
                            </div>
                            <hr className="border-gray-200 mb-6" />

                            <div className="question-content">
                                <QuestionDisplay
                                    question={{ ...question, number: question.number || currentIndex + 1 }}
                                    showMarks={false}
                                    showType={false}
                                />
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <OptionButton
                                    options={question.options || []}
                                    type={question.type || "mcq_single"}
                                    selected={selected}
                                    onChange={(sel) => onAnswer(question.id, sel)}
                                    integerValue={integerAnswers[question.id]}
                                    onIntegerChange={(val) => onIntegerChange(question.id, val)}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* ===== RIGHT SIDEBAR ===== */}
                <aside className="w-[280px] border-l border-gray-200 bg-white hidden lg:flex flex-col overflow-hidden shrink-0">
                    <div className="p-3 border-b flex items-center gap-2 bg-gray-50">
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[10px]">👤</div>
                        <span className="text-[12px] font-bold text-gray-700">Rahul</span>
                    </div>

                    <div className="p-3 border-b">
                        <div className="text-[11px] font-black text-gray-800 mb-2">Quantitative Aptitude</div>
                        <div className="grid grid-cols-5 gap-1.5">
                            {paletteQuestions.map((q, idx) => (
                                <button
                                    key={q.id}
                                    onClick={() => onSelectQuestion(idx)}
                                    className={cn(
                                        "w-full aspect-square rounded-full text-[10px] font-bold transition-all border",
                                        idx === currentIndex ? "ring-2 ring-blue-500 ring-offset-1 scale-105" : ""
                                    )}
                                    style={{
                                        background: q.status === "answered" ? "#2563EB"
                                            : q.status === "marked-for-review" ? "#F59E0B"
                                                : q.status === "marked-and-answered" ? "#8B5CF6"
                                                    : q.status === "not-answered" ? "#EF4444"
                                                        : "#F8FAFC",
                                        borderColor: q.status === "not-visited" ? "#E2E8F0" : "transparent",
                                        color: q.status === "not-visited" ? "#64748B" : "#fff",
                                    }}
                                >
                                    {q.number}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-3 border-b bg-[#F8FAFC]">
                        <div className="text-[10px] font-bold text-gray-600 mb-2 uppercase tracking-tighter">Total Questions answered: {totalAnswered}</div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            <div className="flex items-center justify-between text-[10px]"><span className="text-gray-500">Answered</span><span className="text-blue-600 font-bold">{totalAnswered}</span></div>
                            <div className="flex items-center justify-between text-[10px]"><span className="text-gray-500">Marked</span><span className="text-orange-500 font-bold">{totalMarked}</span></div>
                            <div className="flex items-center justify-between text-[10px]"><span className="text-gray-500">Not Visited</span><span className="text-red-500 font-bold">{questions.length - totalAnswered}</span></div>
                        </div>
                    </div>

                    <div className="p-3 flex-1 overflow-y-auto">
                        <div className="text-[11px] font-black bg-gray-200 text-gray-700 px-2 py-1 mb-2 text-center rounded">PART-A Analysis</div>
                        <table className="w-full text-[10px] border border-gray-200 bg-white">
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="p-1.5">Answered</td>
                                    <td className="p-1.5 text-right font-black bg-yellow-100 text-yellow-800">{totalAnswered}</td>
                                </tr>
                                <tr>
                                    <td className="p-1.5">Not Answered</td>
                                    <td className="p-1.5 text-right font-black bg-yellow-100 text-yellow-800">{totalNotAnswered}</td>
                                </tr>
                            </tbody>
                        </table>
                        <button className="w-full mt-4 bg-blue-600 text-white text-[11px] font-bold py-2 rounded shadow-sm hover:bg-blue-700 transition-colors">
                            Show Camera
                        </button>
                    </div>
                </aside>
            </div>

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
