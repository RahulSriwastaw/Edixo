"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useExamTheme } from "@/contexts/ExamThemeContext";
import { QuestionDisplay } from "../shared/QuestionDisplay";
import { OptionButton } from "../shared/OptionButton";
import { SubmitDialog } from "../shared/SubmitDialog";
import { ZoomIn, ZoomOut, Maximize2, Pause, Settings, ArrowLeft, ArrowRight } from "lucide-react";

interface TestbookLayoutProps {
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

export function TestbookLayout(props: TestbookLayoutProps) {
    const { cssVariables } = useExamTheme();
    const [showSubmit, setShowSubmit] = useState(false);
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

    const paletteQuestions = questions.map((q, idx) => {
        const status: any = answers[q.id]?.length
            ? marked.has(q.id) ? "marked-and-answered" : "answered"
            : marked.has(q.id) ? "marked-for-review" : idx === currentIndex ? "not-answered" : "not-visited";
        return { id: q.id, number: q.number || idx + 1, section: q.section, status };
    });

    const parts = ["PART-A", "PART-B", "PART-C", "PART-D"];
    const partColors = ["#22C55E", "#3B82F6", "#EF4444", "#F59E0B"];

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

    return (
        <div className="h-screen flex flex-col bg-white" style={{ ...cssVariables }}>
            {/* Top Blue Header */}
            <header className="bg-[#1976D2] text-white shrink-0">
                <div className="flex items-center justify-between px-4 h-10">
                    <div className="flex items-center gap-3">
                        <div className="font-bold text-[13px]">Testbook</div>
                        <div className="text-[11px] opacity-80">SSC CGL – 12 Sep 2025 – Shift 2</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="text-[11px] bg-blue-600 hover:bg-blue-700 px-2 py-0.5 rounded flex items-center gap-1">
                            <ZoomIn className="w-3 h-3" /> Zoom (+)
                        </button>
                        <button className="text-[11px] bg-blue-600 hover:bg-blue-700 px-2 py-0.5 rounded flex items-center gap-1">
                            <ZoomOut className="w-3 h-3" /> Zoom (-)
                        </button>
                        <button className="text-[11px] bg-blue-600 hover:bg-blue-700 px-2 py-0.5 rounded flex items-center gap-1">
                            <Maximize2 className="w-3 h-3" /> Show Fullscreen
                        </button>
                    </div>
                </div>
            </header>

            {/* Sub-header: Roll No, Timer */}
            <div className="flex items-center justify-between px-4 py-1 border-b bg-white shrink-0">
                <div className="text-[11px] text-gray-600">
                    Roll No: 8863999*** [Rahul]
                </div>
                <div className="flex items-center gap-3">
                    <button className="text-[11px] flex items-center gap-1 text-gray-600 hover:text-gray-800">
                        <Settings className="w-3 h-3" /> Settings
                    </button>
                    <button className="text-[11px] flex items-center gap-1 text-gray-600 hover:text-gray-800">
                        <Pause className="w-3 h-3" /> Pause
                    </button>
                    <div className="bg-[#FF6B2B] text-white text-[11px] font-bold px-2 py-0.5 rounded">
                        Time Left: {formatTime(timeLeft)}
                    </div>
                </div>
            </div>

            {/* Orange Links Row */}
            <div className="flex items-center gap-4 px-4 py-1 border-b bg-white shrink-0">
                <button className="text-[11px] font-bold text-orange-600 hover:underline uppercase">SYMBOLS</button>
                <button className="text-[11px] font-bold text-orange-600 hover:underline uppercase">INSTRUCTIONS</button>
            </div>

            {/* Part Tabs */}
            <div className="flex items-center gap-2 px-4 py-1.5 border-b bg-white shrink-0">
                {parts.map((part, i) => (
                    <button
                        key={part}
                        className="px-3 py-0.5 rounded text-[11px] font-bold text-white"
                        style={{ backgroundColor: partColors[i] }}
                    >
                        {part}
                    </button>
                ))}
            </div>

            {/* Center Action Buttons */}
            <div className="flex items-center justify-center gap-2 py-1.5 border-b bg-white shrink-0">
                <button
                    onClick={onMarkReview}
                    className={cn(
                        "px-3 py-1 rounded text-[11px] font-bold text-white",
                        isMarked ? "bg-purple-600" : "bg-[#3B82F6]"
                    )}
                >
                    Mark for Review
                </button>
                <button
                    onClick={onSaveNext}
                    className="px-3 py-1 rounded text-[11px] font-bold text-white bg-[#3B82F6] hover:bg-blue-700"
                >
                    Save & Next
                </button>
                <button
                    onClick={() => setShowSubmit(true)}
                    className="px-3 py-1 rounded text-[11px] font-bold text-white bg-[#3B82F6] hover:bg-blue-700"
                >
                    Submit Test
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Question Area */}
                <div className="flex-1 overflow-y-auto p-4">
                    {question && (
                        <div className="max-w-3xl mx-auto">
                            {/* Question Number */}
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[13px] font-bold text-gray-800">
                                    Question : {question.number || currentIndex + 1}
                                </span>
                            </div>
                            <hr className="border-gray-300 mb-3" />

                            <QuestionDisplay
                                question={{ ...question, number: question.number || currentIndex + 1 }}
                                showMarks={false}
                                showType={false}
                            />
                            <hr className="border-gray-300 my-3" />

                            <OptionButton
                                options={question.options || []}
                                type={question.type || "mcq_single"}
                                selected={selected}
                                onChange={(sel) => onAnswer(question.id, sel)}
                                integerValue={integerAnswers[question.id]}
                                onIntegerChange={(val) => onIntegerChange(question.id, val)}
                            />
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                <aside className="w-[260px] border-l bg-white hidden md:flex flex-col overflow-hidden shrink-0">
                    {/* User Info */}
                    <div className="p-2 border-b flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-[11px] font-bold">👤</div>
                        <div className="text-[11px]">
                            <div className="font-semibold">Rahul</div>
                        </div>
                    </div>

                    {/* Question Palette - Blue Oval Style */}
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

                    {/* Stats */}
                    <div className="p-2 border-b">
                        <div className="text-[11px] font-bold mb-1">Total Questions answered: {totalAnswered}</div>
                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                                <span>Answered</span>
                                <span className="text-blue-600 font-bold">{totalAnswered}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                                <span>Marked</span>
                                <span className="text-amber-600 font-bold">{totalMarked}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                                <span>Not Visited</span>
                                <span className="text-red-500 font-bold">{questions.length - totalAnswered - totalMarked}</span>
                            </div>
                        </div>
                    </div>

                    {/* PART-A Analysis */}
                    <div className="p-2 bg-gray-100">
                        <div className="text-[11px] font-bold bg-gray-300 px-2 py-0.5 mb-1 text-center">PART-A Analysis</div>
                        <div className="space-y-0.5">
                            <div className="flex items-center justify-between text-[10px]">
                                <span>Answered</span>
                                <span className="text-amber-600 font-bold">{totalAnswered}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                                <span>Not Answered</span>
                                <span className="text-amber-600 font-bold">{questions.length - totalAnswered}</span>
                            </div>
                        </div>
                        <button className="w-full mt-1 bg-[#3B82F6] text-white text-[10px] font-bold py-0.5 rounded">
                            Show Camera
                        </button>
                    </div>
                </aside>
            </div>

            {/* Bottom Action Bar */}
            <div className="h-12 flex items-center justify-between px-4 border-t bg-white shrink-0">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onMarkReview}
                        className="px-3 py-1 rounded border border-purple-400 text-purple-600 text-[11px] font-bold hover:bg-purple-50"
                    >
                        Mark & Save
                    </button>
                    <button
                        onClick={onClear}
                        className="px-3 py-1 rounded border border-red-400 text-red-600 text-[11px] font-bold hover:bg-red-50"
                    >
                        Clear Response
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        disabled={currentIndex === 0}
                        onClick={() => onSelectQuestion(currentIndex - 1)}
                        className="px-3 py-1 rounded border border-gray-300 text-gray-600 text-[11px] font-bold hover:bg-gray-50 disabled:opacity-40"
                    >
                        <ArrowLeft className="w-3 h-3 inline mr-1" />Prev
                    </button>
                    <button
                        onClick={onSaveNext}
                        className="px-3 py-1 rounded bg-[#3B82F6] text-white text-[11px] font-bold hover:bg-blue-700"
                    >
                        Save & Next<ArrowRight className="w-3 h-3 inline ml-1" />
                    </button>
                    <button
                        onClick={() => setShowSubmit(true)}
                        className="px-3 py-1 rounded bg-[#22C55E] text-white text-[11px] font-bold hover:bg-green-600"
                    >
                        Submit Test
                    </button>
                </div>
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
