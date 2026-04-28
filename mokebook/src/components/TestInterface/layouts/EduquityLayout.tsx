"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useExamTheme } from "@/contexts/ExamThemeContext";
import { QuestionDisplay } from "../shared/QuestionDisplay";
import { OptionButton } from "../shared/OptionButton";
import { SubmitDialog } from "../shared/SubmitDialog";
import {
    ZoomIn,
    ZoomOut,
    Pause,
    Play,
    Maximize2,
    Minimize2,
    AlertTriangle,
    LayoutGrid,
    X,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Question {
    id: string;
    number?: number;
    text?: string;
    textHi?: string;
    section?: string;
    type?: string;
    marks?: number;
    negative?: number;
    options?: { id: string; text: string }[];
    [key: string]: any;
}

interface EduquityLayoutProps {
    testName: string;
    rollNo?: string;
    studentName?: string;
    durationMins: number;
    questions: Question[];
    currentIndex: number;
    answers: Record<string, string[]>;
    marked: Set<string>;
    onSelectQuestion: (index: number) => void;
    onAnswer: (questionId: string, selected: string[]) => void;
    onMarkReview: () => void;
    onClear: () => void;
    onSaveNext: () => void;
    onPrev?: () => void;
    onSubmit: () => void;
    integerAnswers: Record<string, string>;
    onIntegerChange: (questionId: string, value: string) => void;
    isReviewMode?: boolean;
    isReattemptMode?: boolean;
    onToggleReattempt?: () => void;
    language?: 'en' | 'hi';
    onLanguageChange?: (lang: 'en' | 'hi') => void;
}

// ─── Palette colour helper ─────────────────────────────────────────────────────

type PaletteStatus =
    | "answered"
    | "not-answered"
    | "marked"
    | "marked-answered"
    | "not-visited";

function getPaletteBg(status: PaletteStatus, isCurrent: boolean): React.CSSProperties {
    if (isCurrent)
        return { background: "#dc2626", color: "#fff", border: "2px solid #991b1b", boxShadow: "0 0 0 2px #fca5a5" };
    switch (status) {
        case "answered":
            return { background: "#16a34a", color: "#fff", border: "1px solid #15803d" };
        case "marked":
            return { background: "#9333ea", color: "#fff", border: "1px solid #7e22ce" };
        case "marked-answered":
            return { background: "#f59e0b", color: "#fff", border: "1px solid #d97706" };
        case "not-answered":
            return { background: "#dc2626", color: "#fff", border: "1px solid #b91c1c" };
        default:
            return { background: "#fff", color: "#374151", border: "1px solid #d1d5db" };
    }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EduquityLayout(props: EduquityLayoutProps) {
    const { cssVariables } = useExamTheme();

    const {
        testName,
        rollNo = "918969481446",
        studentName = "Student",
        durationMins,
        questions,
        currentIndex,
        answers,
        marked,
        onSelectQuestion,
        onAnswer,
        onMarkReview,
        onClear,
        onSaveNext,
        onPrev,
        onSubmit,
        integerAnswers,
        onIntegerChange,
        isReviewMode = false,
        isReattemptMode = false,
        language = 'en',
        onLanguageChange,
    } = props;

    const [showSubmit, setShowSubmit] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(100);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [paused, setPaused] = useState(false);
    const [mobilePaletteOpen, setMobilePaletteOpen] = useState(false);
    const [timeLeft, setTimeLeft] = useState(durationMins * 60);
    const [showSolution, setShowSolution] = useState(false);

    useEffect(() => {
        setShowSolution(false);
    }, [currentIndex]);

    useEffect(() => {
        if (paused) return;
        const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
        return () => clearInterval(id);
    }, [paused]);

    const formatTime = (secs: number) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        if (h > 0) return `${String(h).padStart(2, "0")} : ${String(m).padStart(2, "0")} : ${String(s).padStart(2, "0")}`;
        return `${String(m).padStart(2, "0")} : ${String(s).padStart(2, "0")}`;
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen?.();
            setIsFullscreen(false);
        }
    };

    const question = questions[currentIndex];
    const selected = answers[question?.id] || [];
    const isMarked = marked.has(question?.id);

    const palette = questions.map((q, idx) => {
        const hasAns = !!answers[q.id]?.length;
        const isMkd = marked.has(q.id);
        const status: PaletteStatus =
            hasAns && isMkd ? "marked-answered"
                : hasAns ? "answered"
                    : isMkd ? "marked"
                        : idx === currentIndex ? "not-answered"
                            : "not-visited";
        return { id: q.id, num: q.number ?? idx + 1, status };
    });

    const totalAnswered = palette.filter((q) => q.status === "answered" || q.status === "marked-answered").length;
    const totalNotAnswered = palette.filter((q) => q.status === "not-answered").length;
    const totalMarked = palette.filter((q) => q.status === "marked" || q.status === "marked-answered").length;
    const totalNotVisited = palette.filter((q) => q.status === "not-visited").length;

    // ─────────────────────────────────────────────────────────────────────────────
    return (
        <div
            className="h-screen flex flex-col bg-white overflow-hidden"
            style={{ fontFamily: "'Noto Sans', sans-serif", ...cssVariables }}
        >

            {/* ══════════════════════════════════════════
          DESKTOP HEADER
          ══════════════════════════════════════════ */}
            <header className="hidden md:block border-b border-gray-300 bg-white shrink-0">

                {/* Row 1: Logo | Test name | Controls */}
                <div className="flex items-center h-[54px] px-4 gap-3">

                    {/* MockVeda logo */}
                    <div className="flex items-center gap-2 shrink-0 min-w-[130px]">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <rect width="24" height="24" rx="4" fill="#1a56db" />
                            <path d="M7 4h10v16l-5-3.5L7 20V4z" fill="white" />
                        </svg>
                        <span style={{ fontWeight: 800, fontSize: 18, color: "#1a56db", letterSpacing: "-0.5px" }}>
                            MockVeda
                        </span>
                    </div>

                    {/* Test name + roll no centred */}
                    <div className="flex-1 flex flex-col items-center leading-tight min-w-0">
                        <span className="font-bold text-[13px] text-gray-800 truncate max-w-[500px]">{testName}</span>
                        <span className="text-[11px] text-gray-500 mt-0.5">Roll No : {rollNo}</span>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => setZoomLevel((z) => Math.min(z + 10, 160))}
                            className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 border border-blue-400 hover:bg-blue-50 px-2.5 py-1 rounded transition-colors"
                        >
                            <ZoomIn className="w-3 h-3" /> Zoom (+)
                        </button>
                        <button
                            onClick={() => setZoomLevel((z) => Math.max(z - 10, 70))}
                            className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 border border-blue-400 hover:bg-blue-50 px-2.5 py-1 rounded transition-colors"
                        >
                            <ZoomOut className="w-3 h-3" /> Zoom (-)
                        </button>

                        <button
                            onClick={toggleFullscreen}
                            className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100 transition-colors"
                            title="Fullscreen"
                        >
                            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-gray-600" /> : <Maximize2 className="w-3.5 h-3.5 text-gray-600" />}
                        </button>

                        <button
                            onClick={() => setPaused((p) => !p)}
                            className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100 transition-colors"
                            title={paused ? "Resume" : "Pause"}
                        >
                            {paused ? <Play className="w-3.5 h-3.5 text-gray-600" /> : <Pause className="w-3.5 h-3.5 text-gray-600" />}
                        </button>

                        {/* Timer */}
                        <div className="flex items-center gap-1.5 border border-gray-200 rounded px-2.5 py-1 ml-1">
                            <span className="text-[11px] text-gray-600 font-medium">Time Left</span>
                            <span
                                className={cn(
                                    "text-[15px] font-black tabular-nums",
                                    timeLeft < 300 ? "text-red-600 animate-pulse" : "text-red-600"
                                )}
                            >
                                {formatTime(timeLeft)}
                            </span>
                        </div>

                        {/* Profile photos */}
                        <div className="flex items-end gap-2 ml-1">
                            {(["Registration\nPhoto", "Captured\nPhoto"] as const).map((label) => (
                                <div key={label} className="flex flex-col items-center gap-0.5">
                                    <div className="w-10 h-10 border-2 border-gray-300 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                                        <span className="text-[7px] text-gray-400 text-center leading-tight whitespace-pre-line">{label}</span>
                                    </div>
                                    <span className="text-[7px] text-gray-400 text-center leading-tight whitespace-pre-line">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Row 2: Nav links */}
                <div className="flex items-center gap-6 px-4 pb-[6px]">
                    {["SYMBOLS", "INSTRUCTIONS", "OVERALL TEST SUMMARY"].map((link) => (
                        <button key={link} className="text-[12px] font-bold uppercase tracking-wide hover:underline" style={{ color: "#ea580c" }}>
                            {link}
                        </button>
                    ))}
                </div>
            </header>

            {/* ══════════════════════════════════════════
          MOBILE HEADER
          ══════════════════════════════════════════ */}
            <header className="md:hidden border-b border-gray-300 bg-white shrink-0">
                <div className="flex items-center justify-between px-3 h-[44px]">
                    <div className="flex items-center gap-1.5">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <rect width="24" height="24" rx="4" fill="#1a56db" />
                            <path d="M7 4h10v16l-5-3.5L7 20V4z" fill="white" />
                        </svg>
                        <span style={{ fontWeight: 800, fontSize: 15, color: "#1a56db" }}>MockVeda</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-600">Time Left</span>
                        <span className={cn("text-[14px] font-black tabular-nums", timeLeft < 300 ? "text-red-600 animate-pulse" : "text-red-600")}>
                            {formatTime(timeLeft)}
                        </span>
                        <button onClick={() => setPaused((p) => !p)} className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center ml-1">
                            {paused ? <Play className="w-3.5 h-3.5 text-gray-600" /> : <Pause className="w-3.5 h-3.5 text-gray-600" />}
                        </button>
                    </div>
                </div>
                <div className="px-3 pb-1 text-[11px] text-gray-600 truncate">{testName}</div>
                <div className="flex items-center gap-4 px-3 pb-2">
                    {["SYMBOLS", "INSTRUCTIONS", "OVERALL TEST SUMMARY"].map((link) => (
                        <button key={link} className="text-[10px] font-bold uppercase" style={{ color: "#ea580c" }}>{link}</button>
                    ))}
                </div>
            </header>

            {/* ══════════════════════════════════════════
          PART BADGE + ACTION BUTTONS ROW
          ══════════════════════════════════════════ */}
            <div className="flex items-center px-3 md:px-4 py-2 border-b border-gray-200 bg-white shrink-0 gap-3">
                <span className="text-white text-[11px] font-black px-2.5 py-[3px] rounded uppercase tracking-wide shrink-0" style={{ background: "#16a34a" }}>
                    PART-A
                </span>

                {/* Desktop: centred action buttons */}
                <div className="hidden md:flex flex-1 items-center justify-center gap-2">
                    <button
                        onClick={onMarkReview}
                        className={cn(
                            "px-5 py-[5px] rounded text-[12px] font-bold text-white transition-all",
                            isMarked ? "bg-purple-600 hover:bg-purple-700" : "bg-[#2563eb] hover:bg-blue-700"
                        )}
                    >
                        Mark for Review
                    </button>
                    <button onClick={onSaveNext} className="px-5 py-[5px] rounded text-[12px] font-bold text-white bg-[#2563eb] hover:bg-blue-700 transition-all">
                        Save &amp; Next
                    </button>
                    <button onClick={() => setShowSubmit(true)} className="px-5 py-[5px] rounded text-[12px] font-bold text-white bg-[#2563eb] hover:bg-blue-700 transition-all">
                        Submit Test
                    </button>
                </div>
            </div>

            {/* ══════════════════════════════════════════
          MAIN CONTENT AREA
          ══════════════════════════════════════════ */}
            <div className="flex-1 flex overflow-hidden">

                {/* ── Question Panel ─────────────────────── */}
                <div className="flex-1 overflow-y-auto pb-24 md:pb-4" style={{ fontSize: `${zoomLevel}%` }}>
                    {question && (
                        <div className="px-4 md:px-8 py-4 max-w-3xl">

                            {/* Question number */}
                            <p className="text-[14px] font-bold text-gray-800 mb-2">
                                Question No.&nbsp;{question.number ?? currentIndex + 1}
                            </p>

                            {/* Marks badge */}
                            {question.marks !== undefined && (
                                <p className="text-[11px] text-gray-500 mb-2">
                                    Marks:&nbsp;
                                    <strong className="text-green-700">+{question.marks}</strong>
                                    {question.negative !== undefined && (
                                        <span className="text-red-500"> / -{question.negative}</span>
                                    )}
                                </p>
                            )}

                            {/* Dashed divider — exactly like reference */}
                            <div className="border-t border-dashed border-gray-300 mb-3" />

                            {/* Language + Report — right aligned */}
                            <div className="flex items-center justify-end gap-2 mb-4">
                                <span className="text-[11px] text-gray-500">Select Language</span>
                                <select 
                                    value={language}
                                    onChange={(e) => onLanguageChange?.(e.target.value as 'en' | 'hi')}
                                    className="text-[12px] border border-gray-300 rounded px-2 py-[3px] bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                >
                                    <option value="hi">Hindi</option>
                                    <option value="en">English</option>
                                </select>
                                <button className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    <span className="text-[11px]">Report</span>
                                </button>
                            </div>

                            {isReviewMode && !showSolution && (
                                <div className="mb-4 flex justify-end">
                                    <button 
                                        onClick={() => setShowSolution(true)}
                                        className="px-4 py-1.5 rounded border border-blue-500 text-blue-500 font-bold text-[12px] hover:bg-blue-50"
                                    >
                                        View Solution
                                    </button>
                                </div>
                            )}

                            {/* Question content */}
                            <div className="mb-6 text-gray-800">
                                <QuestionDisplay
                                    question={{ ...question, text: question.text ?? "", number: question.number ?? currentIndex + 1 }}
                                    showMarks={false}
                                    showType={false}
                                    language={language}
                                />
                            </div>

                            {/* Re-attempt mode Indicator */}
                            {isReviewMode && isReattemptMode && (
                                <div className="mt-4 p-4 rounded-lg bg-orange-50 border border-orange-100 max-w-md">
                                    <h4 className="text-[14px] font-bold text-orange-800">Re-attempt mode: ON</h4>
                                    <p className="text-[12px] text-orange-600 mt-1">Now You can re-attempt the question</p>
                                </div>
                            )}

                            {/* Options */}
                            <OptionButton
                                options={question.options || []}
                                type={(question.type || "mcq_single") as "mcq_single" | "mcq_multiple" | "integer"}
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
                    )}
                </div>

                {/* ── Right Sidebar (Desktop only) ─────────── */}
                <aside className="hidden md:flex w-[200px] xl:w-[220px] border-l border-gray-200 flex-col bg-white shrink-0 overflow-hidden">

                    {/* Header */}
                    <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
                        <span className="text-[12px] font-bold text-gray-700">Question Palette</span>
                    </div>

                    {/* Scrollable palette */}
                    <div className="flex-1 overflow-y-auto p-3">
                        <div className="grid grid-cols-5 gap-[5px]">
                            {palette.map((q, idx) => (
                                <button
                                    key={q.id}
                                    onClick={() => onSelectQuestion(idx)}
                                    className="w-full aspect-square rounded text-[11px] font-bold hover:opacity-80 focus:outline-none transition-all"
                                    style={getPaletteBg(q.status, idx === currentIndex)}
                                >
                                    {q.num}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* PART-A Analysis */}
                    <div className="border-t border-gray-200 p-3 shrink-0">
                        <div className="text-center text-[10px] font-black uppercase tracking-wide py-1 mb-2 rounded" style={{ background: "#e5e7eb", color: "#374151" }}>
                            PART-A Analysis
                        </div>
                        <table className="w-full text-[11px]" style={{ borderCollapse: "collapse" }}>
                            <tbody>
                                {[
                                    { label: "Answered", val: totalAnswered },
                                    { label: "Not Answered", val: totalNotAnswered },
                                    { label: "Mark for Review", val: totalMarked },
                                ].map(({ label, val }) => (
                                    <tr key={label} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                        <td className="py-1.5 px-2 text-gray-600">{label}</td>
                                        <td className="py-1.5 px-2 text-right font-black w-8" style={{ background: "#fef9c3", color: "#92400e" }}>
                                            {val}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Legend */}
                        <div className="mt-3">
                            <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400 mb-1.5">LEGEND</p>
                            <div className="space-y-1">
                                {[
                                    { bg: "#fff", border: "#d1d5db", label: "Not Visited" },
                                    { bg: "#dc2626", label: "Not Answered" },
                                    { bg: "#16a34a", label: "Answered" },
                                    { bg: "#f59e0b", label: "Marked And Answered" },
                                    { bg: "#9333ea", label: "Marked For Review" },
                                ].map(({ bg, border, label }) => (
                                    <div key={label} className="flex items-center gap-1.5">
                                        <div className="w-3.5 h-3.5 rounded-sm shrink-0" style={{ background: bg, border: `1px solid ${border ?? bg}` }} />
                                        <span className="text-[9px] text-gray-500">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* ══════════════════════════════════════════
          MOBILE FIXED BOTTOM BAR
          ══════════════════════════════════════════ */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 flex items-center gap-2 px-3 py-2 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
                <button
                    onClick={onMarkReview}
                    className={cn(
                        "flex-1 py-2.5 rounded text-[12px] font-bold text-white transition-all",
                        isMarked ? "bg-purple-600" : "bg-[#2563eb]"
                    )}
                >
                    Mark for Review
                </button>
                <button onClick={onClear} className="px-4 py-2.5 rounded text-[12px] font-bold text-gray-600 border border-gray-300 bg-white">
                    Clear
                </button>
                <button onClick={onSaveNext} className="flex-1 py-2.5 rounded text-[12px] font-bold text-white bg-[#2563eb]">
                    Save &amp; Next
                </button>
            </div>

            {/* Mobile palette toggle button */}
            <button
                onClick={() => setMobilePaletteOpen(true)}
                className="md:hidden fixed bottom-[68px] right-3 w-10 h-10 bg-[#2563eb] text-white rounded-full shadow-lg z-20 flex items-center justify-center"
            >
                <LayoutGrid className="w-5 h-5" />
            </button>

            {/* ══════════════════════════════════════════
          MOBILE PALETTE BOTTOM SHEET
          ══════════════════════════════════════════ */}
            {mobilePaletteOpen && (
                <div className="md:hidden fixed inset-0 z-40 flex flex-col justify-end">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setMobilePaletteOpen(false)} />
                    <div className="relative bg-white rounded-t-2xl max-h-[80vh] flex flex-col shadow-2xl">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                            <span className="text-[13px] font-bold text-gray-800">Question Palette</span>
                            <button onClick={() => setMobilePaletteOpen(false)} className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-4">
                            {/* Stats */}
                            <div className="grid grid-cols-4 gap-2 mb-4">
                                {[
                                    { val: totalAnswered, label: "Answered", bg: "#dcfce7", color: "#15803d" },
                                    { val: totalNotAnswered, label: "Not Ans.", bg: "#fee2e2", color: "#dc2626" },
                                    { val: totalMarked, label: "Marked", bg: "#f3e8ff", color: "#9333ea" },
                                    { val: totalNotVisited, label: "Not Visited", bg: "#f9fafb", color: "#6b7280" },
                                ].map(({ val, label, bg, color }) => (
                                    <div key={label} className="rounded-lg p-2 text-center" style={{ background: bg }}>
                                        <div className="text-[18px] font-black" style={{ color }}>{val}</div>
                                        <div className="text-[9px] font-semibold" style={{ color }}>{label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Grid */}
                            <div className="grid grid-cols-6 gap-2 mb-4">
                                {palette.map((q, idx) => (
                                    <button
                                        key={q.id}
                                        onClick={() => { onSelectQuestion(idx); setMobilePaletteOpen(false); }}
                                        className="w-full aspect-square rounded text-[11px] font-bold flex items-center justify-center hover:opacity-80 focus:outline-none"
                                        style={getPaletteBg(q.status, idx === currentIndex)}
                                    >
                                        {q.num}
                                    </button>
                                ))}
                            </div>

                            {/* Legend */}
                            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-5">
                                {[
                                    { bg: "#fff", border: "#d1d5db", label: "Not Visited" },
                                    { bg: "#dc2626", label: "Not Answered" },
                                    { bg: "#16a34a", label: "Answered" },
                                    { bg: "#f59e0b", label: "Marked And Answered" },
                                    { bg: "#9333ea", label: "Marked For Review" },
                                ].map(({ bg, border, label }) => (
                                    <div key={label} className="flex items-center gap-1.5">
                                        <div className="w-3.5 h-3.5 rounded-sm shrink-0" style={{ background: bg, border: `1px solid ${border ?? bg}` }} />
                                        <span className="text-[10px] text-gray-500">{label}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => { setMobilePaletteOpen(false); setShowSubmit(true); }}
                                className="w-full bg-[#2563eb] text-white text-[13px] font-bold py-3 rounded-xl"
                            >
                                Submit Test
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════
          SUBMIT DIALOG
          ══════════════════════════════════════════ */}
            <SubmitDialog
                open={showSubmit}
                onOpenChange={setShowSubmit}
                questions={palette.map((q) => ({ id: q.id, number: q.num, status: (q.status === "marked" ? "marked-for-review" : q.status === "marked-answered" ? "marked-and-answered" : q.status) as "answered" | "not-answered" | "not-visited" | "marked-for-review" | "marked-and-answered" }))}
                onConfirm={onSubmit}
                onCancel={() => setShowSubmit(false)}
            />
        </div>
    );
}