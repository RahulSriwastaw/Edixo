"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useExamTheme } from "@/contexts/ExamThemeContext";
import { QuestionPalette } from "../shared/QuestionPalette";
import { ExamTimer } from "../shared/ExamTimer";
import { QuestionDisplay } from "../shared/QuestionDisplay";
import { OptionButton } from "../shared/OptionButton";
import { SubmitDialog } from "../shared/SubmitDialog";
import { ArrowLeft, ArrowRight, Flag, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DefaultLayoutProps {
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

export function DefaultLayout({
    testName,
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
    onSubmit,
    integerAnswers,
    onIntegerChange,
}: DefaultLayoutProps) {
    const { theme, cssVariables } = useExamTheme();
    const [showSubmit, setShowSubmit] = useState(false);

    const question = questions[currentIndex];
    const selected = answers[question?.id] || [];
    const isMarked = marked.has(question?.id);

    const paletteQuestions: Array<{
        id: string;
        number: number;
        section?: string;
        status: "not-visited" | "not-answered" | "answered" | "marked-for-review" | "marked-and-answered";
    }> = questions.map((q, idx) => {
        const status: "not-visited" | "not-answered" | "answered" | "marked-for-review" | "marked-and-answered" = answers[q.id]?.length
            ? marked.has(q.id)
                ? "marked-and-answered"
                : "answered"
            : marked.has(q.id)
                ? "marked-for-review"
                : idx === currentIndex
                    ? "not-answered"
                    : "not-visited";
        return {
            id: q.id,
            number: q.number || idx + 1,
            section: q.section,
            status,
        };
    });

    return (
        <div
            className="h-screen flex flex-col"
            style={{ ...cssVariables, background: "var(--exam-bg)" }}
        >
            {/* Header */}
            <header
                className="h-14 flex items-center justify-between px-4 border-b shrink-0"
                style={{ background: "var(--exam-header-bg)", borderColor: "var(--divider)" }}
            >
                <h1 className="text-[14px] font-bold text-[var(--text-primary)] truncate">{testName}</h1>
                <div className="flex items-center gap-3">
                    <ExamTimer
                        totalSeconds={durationMins * 60}
                        onTimeUp={onSubmit}
                    />
                    <Button
                        size="sm"
                        onClick={() => setShowSubmit(true)}
                        className="h-8 text-[12px] bg-[#FF6B2B] hover:bg-[#FF6B2B]/90 text-white"
                    >
                        Submit
                    </Button>
                </div>
            </header>

            {/* Main */}
            <div className="flex-1 flex overflow-hidden">
                {/* Question area */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {question && (
                        <div className="max-w-3xl mx-auto space-y-4">
                            <QuestionDisplay
                                question={{
                                    ...question,
                                    number: question.number || currentIndex + 1,
                                }}
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

                {/* Palette sidebar */}
                <aside
                    className="w-64 lg:w-72 border-l hidden md:flex flex-col p-4 overflow-hidden"
                    style={{ background: "var(--exam-sidebar-bg)", borderColor: "var(--divider)" }}
                >
                    <QuestionPalette
                        questions={paletteQuestions}
                        currentIndex={currentIndex}
                        onSelect={onSelectQuestion}
                    />
                </aside>
            </div>

            {/* Bottom action bar */}
            <div
                className="h-14 flex items-center justify-between px-4 border-t shrink-0"
                style={{ borderColor: "var(--divider)" }}
            >
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onMarkReview}
                        className={cn(
                            "h-8 text-[12px]",
                            isMarked && "border-amber-400 text-amber-600 bg-amber-50"
                        )}
                    >
                        <Flag className="w-3.5 h-3.5 mr-1" />
                        Mark for Review
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onClear}
                        className="h-8 text-[12px]"
                    >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" />
                        Clear
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentIndex === 0}
                        onClick={() => onSelectQuestion(currentIndex - 1)}
                        className="h-8 text-[12px]"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                        Prev
                    </Button>
                    <Button
                        size="sm"
                        onClick={onSaveNext}
                        className="h-8 text-[12px] bg-[#FF6B2B] hover:bg-[#FF6B2B]/90 text-white"
                    >
                        <Save className="w-3.5 h-3.5 mr-1" />
                        Save & Next
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                </div>
            </div>

            {/* Mobile palette drawer */}
            <div className="md:hidden fixed bottom-14 left-0 right-0 h-16 bg-white border-t flex items-center px-2 gap-1 overflow-x-auto">
                {paletteQuestions.map((q, idx) => (
                    <button
                        key={q.id}
                        onClick={() => onSelectQuestion(idx)}
                        className={cn(
                            "w-8 h-8 rounded text-[11px] font-bold shrink-0",
                            idx === currentIndex && "ring-2 ring-[var(--exam-primary)]"
                        )}
                        style={{
                            background: q.status === "answered" ? "#22C55E" : q.status === "marked-for-review" ? "#A855F7" : "#E5E7EB",
                            color: q.status === "not-visited" ? "#374151" : "#fff",
                        }}
                    >
                        {q.number}
                    </button>
                ))}
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
