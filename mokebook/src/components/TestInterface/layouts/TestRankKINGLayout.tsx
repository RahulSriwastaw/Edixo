"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useExamTheme } from "@/contexts/ExamThemeContext";
import { QuestionDisplay } from "../shared/QuestionDisplay";
import { OptionButton } from "../shared/OptionButton";
import { SubmitDialog } from "../shared/SubmitDialog";
import { Pause, Settings, Maximize2, ArrowLeft, ArrowRight, Languages, AlertCircle } from "lucide-react";

interface TestRankKINGLayoutProps {
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

export function TestRankKINGLayout(props: TestRankKINGLayoutProps) {
    const { cssVariables } = useExamTheme();
    const [showSubmit, setShowSubmit] = useState(false);
    const [lang, setLang] = useState<"en" | "hi">("hi");
    const {
        testName, durationMins, questions, currentIndex,
        answers, marked, onSelectQuestion, onAnswer,
        onMarkReview, onClear, onSaveNext, onSubmit,
        integerAnswers, onIntegerChange,
    } = props;

    const question = questions[currentIndex];
    const selected = answers[question?.id] || [];
    const isMarked = marked.has(question?.id);

    // Derive sections from questions
    const sections = useMemo(() => {
        const map = new Map<string, { start: number; end: number }>();
        questions.forEach((q, idx) => {
            const sec = q.section || "General";
            if (!map.has(sec)) map.set(sec, { start: idx, end: idx });
            else {
                const curr = map.get(sec)!;
                curr.end = idx;
            }
        });
        return Array.from(map.entries()).map(([name, range]) => ({ name, ...range }));
    }, [questions]);

    const currentSection = sections.find(s => currentIndex >= s.start && currentIndex <= s.end)?.name || "General";

    const paletteQuestions = questions.map((q, idx) => {
        const status: any = answers[q.id]?.length
            ? marked.has(q.id) ? "marked-and-answered" : "answered"
            : marked.has(q.id) ? "marked-for-review" : idx === currentIndex ? "not-answered" : "not-visited";
        return { id: q.id, number: q.number || idx + 1, section: q.section, status };
    });

    const totalAnswered = questions.filter(q => answers[q.id]?.length).length;
    const totalMarked = questions.filter(q => marked.has(q.id)).length;
    const notVisited = questions.length - totalAnswered - (questions.filter(q => !answers[q.id]?.length && !marked.has(q.id)).length);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };

    const [timeLeft, setTimeLeft] = useState(durationMins * 60);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(t => Math.max(0, t - 1));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Section names for tabs
    const sectionNames = sections.length > 1
        ? sections.map(s => s.name)
        : ["Quantitative Aptitude", "Logical Reasoning", "English Language", "General Awareness"];

    return (
        <div className="h-screen flex flex-col bg-white" style={{ ...cssVariables }}>
            {/* Header with logo and timer */}
            <header className="flex items-center justify-between px-4 h-10 border-b bg-white shrink-0">
                <div className="flex items-center gap-3">
                    {/* Logo area */}
                    <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 bg-[#1E3A5F] rounded-sm flex items-center justify-center">
                            <span className="text-white text-[8px] font-bold">TR</span>
                        </div>
                        <span className="text-[12px] font-bold text-[#1E3A5F]">Test RankKING</span>
                    </div>
                    <span className="text-[11px] text-gray-500">{testName}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="text-gray-500 hover:text-gray-700">
                        <Settings className="w-4 h-4" />
                    </button>
                    <button className="text-gray-500 hover:text-gray-700">
                        <Pause className="w-4 h-4" />
                    </button>
                    <button className="text-gray-500 hover:text-gray-700">
                        <Maximize2 className="w-4 h-4" />
                    </button>
                    <div className="bg-[#1E3A5F] text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                        <span>Time Left</span>
                        <span>{formatTime(timeLeft)}</span>
                    </div>
                </div>
            </header>

            {/* Section Tabs */}
            <div className="flex items-center gap-0 border-b bg-white shrink-0 overflow-x-auto">
                {sectionNames.map((sec, i) => (
                    <button
                        key={sec}
                        className={cn(
                            "px-4 py-1.5 text-[11px] font-bold whitespace-nowrap border-b-2 transition-colors",
                            sec === currentSection
                                ? "text-[#3B82F6] border-[#3B82F6]"
                                : "text-gray-500 border-transparent hover:text-gray-700"
                        )}
                    >
                        {sec}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Question Area */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {question && (
                        <div className="max-w-3xl mx-auto space-y-4">
                            {/* Top row: Question No, Lang toggle, Save, Report */}
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] font-bold text-gray-800">
                                    No. {question.number || currentIndex + 1}
                                </span>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 border rounded px-1.5 py-0.5">
                                        <Languages className="w-3 h-3 text-gray-500" />
                                        <select
                                            value={lang}
                                            onChange={(e) => setLang(e.target.value as "en" | "hi")}
                                            className="text-[11px] bg-transparent outline-none"
                                        >
                                            <option value="hi">Hindi</option>
                                            <option value="en">English</option>
                                        </select>
                                    </div>
                                    <button className="px-3 py-0.5 rounded bg-[#3B82F6] text-white text-[11px] font-bold hover:bg-blue-700">
                                        Save
                                    </button>
                                    <button className="px-3 py-0.5 rounded bg-[#EF4444] text-white text-[11px] font-bold hover:bg-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> Report
                                    </button>
                                </div>
                            </div>
                            <hr className="border-gray-200" />

                            <QuestionDisplay
                                question={{ ...question, number: question.number || currentIndex + 1 }}
                                showMarks={false}
                                showType={false}
                            />

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
                <aside className="w-[240px] border-l bg-[#E8F0FE] hidden md:flex flex-col overflow-hidden shrink-0">
                    {/* User Profile */}
                    <div className="p-3 bg-[#B8D4F0] flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#3B82F6] flex items-center justify-center text-white text-[11px] font-bold">
                            R
                        </div>
                        <span className="text-[12px] font-semibold text-[#1E3A5F]">Rahul</span>
                    </div>

                    {/* Legend */}
                    <div className="p-2 border-b bg-white">
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded bg-green-500" />
                                <span>Answered</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-purple-500" />
                                <span>Marked</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded bg-gray-300" />
                                <span>Not Visited</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded bg-orange-500" />
                                <span>Not Answered</span>
                            </div>
                        </div>
                    </div>

                    {/* Section Grid */}
                    <div className="p-2 border-b bg-white">
                        <div className="text-[11px] font-bold mb-1.5 text-[#1E3A5F]">
                            Section: {currentSection}
                        </div>
                        <div className="grid grid-cols-5 gap-1">
                            {paletteQuestions.map((q, idx) => (
                                <button
                                    key={q.id}
                                    onClick={() => onSelectQuestion(idx)}
                                    className={cn(
                                        "w-full h-7 rounded text-[10px] font-bold transition-all border",
                                        idx === currentIndex && "ring-2 ring-offset-1 ring-blue-400"
                                    )}
                                    style={{
                                        background: q.status === "answered" ? "#22C55E"
                                            : q.status === "marked-for-review" ? "#F59E0B"
                                                : q.status === "marked-and-answered" ? "#A855F7"
                                                    : q.status === "not-answered" ? "#EF4444"
                                                        : "#F3F4F6",
                                        borderColor: q.status === "not-visited" ? "#D1D5DB" : "transparent",
                                        color: q.status === "not-visited" ? "#374151" : "#fff",
                                    }}
                                >
                                    {q.number}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Question Paper / Instructions */}
                    <div className="p-2 flex gap-2">
                        <button className="flex-1 py-1 rounded border border-gray-400 text-[10px] font-bold text-gray-700 hover:bg-gray-100">
                            Question Paper
                        </button>
                        <button className="flex-1 py-1 rounded border border-gray-400 text-[10px] font-bold text-gray-700 hover:bg-gray-100">
                            Instructions
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
                        className="px-4 py-1 rounded bg-[#0EA5E9] text-white text-[11px] font-bold hover:bg-sky-600"
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
