"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useExamTheme } from "@/contexts/ExamThemeContext";
import { QuestionPalette } from "../shared/QuestionPalette";
import { ExamTimer } from "../shared/ExamTimer";
import { QuestionDisplay } from "../shared/QuestionDisplay";
import { OptionButton } from "../shared/OptionButton";
import { SubmitDialog } from "../shared/SubmitDialog";
import { ArrowLeft, ArrowRight, Flag, RotateCcw, Save, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SSCLayoutProps {
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

export function SSCLayout(props: SSCLayoutProps) {
    const { theme, cssVariables } = useExamTheme();
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

    const paletteQuestions: Array<{
        id: string;
        number: number;
        section?: string;
        status: "not-visited" | "not-answered" | "answered" | "marked-for-review" | "marked-and-answered";
    }> = questions.map((q, idx) => {
        const status: "not-visited" | "not-answered" | "answered" | "marked-for-review" | "marked-and-answered" = answers[q.id]?.length
            ? marked.has(q.id) ? "marked-and-answered" : "answered"
            : marked.has(q.id) ? "marked-for-review" : idx === currentIndex ? "not-answered" : "not-visited";
        return { id: q.id, number: q.number || idx + 1, section: q.section, status };
    });

    return (
        <div className="h-screen flex flex-col" style={{ ...cssVariables, background: "var(--exam-bg)" }}>
            {/* SSC Header */}
            <header className="h-14 flex items-center justify-between px-4 border-b shrink-0" style={{ background: "var(--exam-header-bg)", borderColor: "var(--divider)" }}>
                <div className="flex items-center gap-3">
                    <h1 className="text-[14px] font-bold text-[var(--text-primary)] truncate">{testName}</h1>
                </div>
                <div className="flex items-center gap-3">
                    <ExamTimer totalSeconds={durationMins * 60} onTimeUp={onSubmit} />
                    <Button size="sm" onClick={() => setShowSubmit(true)} className="h-8 text-[12px] bg-[#FF6B2B] hover:bg-[#FF6B2B]/90 text-white">
                        Submit Test
                    </Button>
                </div>
            </header>

            {/* Two-column main */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left ~72% */}
                <div className="flex-1 min-w-0 overflow-y-auto p-4 lg:p-6">
                    {question && (
                        <div className="max-w-4xl mx-auto space-y-4">
                            <QuestionDisplay question={{ ...question, number: question.number || currentIndex + 1 }} />
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

                {/* Right ~28% palette */}
                <aside className="w-[280px] lg:w-[320px] border-l hidden md:flex flex-col p-4 overflow-hidden" style={{ background: "var(--exam-sidebar-bg)", borderColor: "var(--divider)" }}>
                    <QuestionPalette questions={paletteQuestions} currentIndex={currentIndex} onSelect={onSelectQuestion} />
                </aside>
            </div>

            {/* Bottom action bar - SSC style */}
            <div className="h-14 flex items-center justify-between px-4 border-t shrink-0" style={{ borderColor: "var(--divider)" }}>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={onMarkReview} className={cn("h-8 text-[12px]", isMarked && "border-purple-400 text-purple-600 bg-purple-50")}>
                        <Bookmark className="w-3.5 h-3.5 mr-1" />
                        Mark for Review & Next
                    </Button>
                    <Button variant="outline" size="sm" onClick={onClear} className="h-8 text-[12px]">
                        <RotateCcw className="w-3.5 h-3.5 mr-1" />
                        Clear Response
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={currentIndex === 0} onClick={() => onSelectQuestion(currentIndex - 1)} className="h-8 text-[12px]">
                        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                        Prev
                    </Button>
                    <Button size="sm" onClick={onSaveNext} className="h-8 text-[12px] bg-[#FF6B2B] hover:bg-[#FF6B2B]/90 text-white">
                        <Save className="w-3.5 h-3.5 mr-1" />
                        Save & Next
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                </div>
            </div>

            <SubmitDialog open={showSubmit} onOpenChange={setShowSubmit} questions={paletteQuestions} onConfirm={onSubmit} onCancel={() => setShowSubmit(false)} />
        </div>
    );
}
