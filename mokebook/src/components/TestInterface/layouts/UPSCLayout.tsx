"use client";

import { useState } from "react";
import { useExamTheme } from "@/contexts/ExamThemeContext";
import { QuestionDisplay } from "../shared/QuestionDisplay";
import { OptionButton } from "../shared/OptionButton";
import { ExamTimer } from "../shared/ExamTimer";
import { SubmitDialog } from "../shared/SubmitDialog";
import { ArrowLeft, ArrowRight, Flag, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UPSCLayoutProps {
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

export function UPSCLayout(props: UPSCLayoutProps) {
    const { cssVariables } = useExamTheme();
    const [showSubmit, setShowSubmit] = useState(false);
    const { testName, durationMins, questions, currentIndex, answers, marked, onSelectQuestion, onAnswer, onMarkReview, onClear, onSaveNext, onSubmit, integerAnswers, onIntegerChange } = props;

    const question = questions[currentIndex];
    const selected = answers[question?.id] || [];
    const isMarked = marked.has(question?.id);

    const paletteQuestions = questions.map((q, idx) => {
        const status: any = answers[q.id]?.length ? (marked.has(q.id) ? "marked-and-answered" : "answered") : marked.has(q.id) ? "marked-for-review" : idx === currentIndex ? "not-answered" : "not-visited";
        return { id: q.id, number: q.number || idx + 1, section: q.section, status };
    });

    return (
        <div className="h-screen flex flex-col" style={{ ...cssVariables, background: "var(--exam-bg)" }}>
            <header className="h-14 flex items-center justify-between px-4 border-b shrink-0" style={{ background: "var(--exam-header-bg)", borderColor: "var(--divider)" }}>
                <h1 className="text-[14px] font-bold text-[var(--text-primary)]">{testName}</h1>
                <div className="flex items-center gap-3">
                    <ExamTimer totalSeconds={durationMins * 60} onTimeUp={onSubmit} />
                    <Button size="sm" onClick={() => setShowSubmit(true)} className="h-8 text-[12px] bg-[#FF6B2B] hover:bg-[#FF6B2B]/90 text-white">Submit</Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Wide question area for passages */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                    {question && (
                        <div className="max-w-5xl mx-auto space-y-6">
                            <QuestionDisplay question={{ ...question, number: question.number || currentIndex + 1 }} showMarks={false} />
                            <OptionButton options={question.options || []} type={question.type || "mcq_single"} selected={selected} onChange={(sel) => onAnswer(question.id, sel)} integerValue={integerAnswers[question.id]} onIntegerChange={(val) => onIntegerChange(question.id, val)} />
                        </div>
                    )}
                </div>

                {/* Minimal palette - numbered scroll */}
                <aside className="w-20 lg:w-24 border-l hidden md:flex flex-col p-2 overflow-hidden" style={{ background: "var(--exam-sidebar-bg)", borderColor: "var(--divider)" }}>
                    <div className="flex-1 overflow-y-auto space-y-1">
                        {questions.map((q, idx) => (
                            <button key={q.id} onClick={() => onSelectQuestion(idx)} className="w-full h-8 rounded text-[12px] font-semibold transition-all" style={{ background: answers[q.id]?.length ? "#22C55E" : idx === currentIndex ? "var(--exam-primary)" : "#E5E7EB", color: answers[q.id]?.length || idx === currentIndex ? "#fff" : "#374151" }}>
                                {q.number || idx + 1}
                            </button>
                        ))}
                    </div>
                </aside>
            </div>

            <div className="h-14 flex items-center justify-between px-4 border-t shrink-0" style={{ borderColor: "var(--divider)" }}>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={onMarkReview} className="h-8 text-[12px]"><Flag className="w-3.5 h-3.5 mr-1" />Mark</Button>
                    <Button variant="outline" size="sm" onClick={onClear} className="h-8 text-[12px]"><RotateCcw className="w-3.5 h-3.5 mr-1" />Clear</Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={currentIndex === 0} onClick={() => onSelectQuestion(currentIndex - 1)} className="h-8 text-[12px]"><ArrowLeft className="w-3.5 h-3.5 mr-1" />Prev</Button>
                    <Button size="sm" onClick={onSaveNext} className="h-8 text-[12px] bg-[#FF6B2B] hover:bg-[#FF6B2B]/90 text-white"><Save className="w-3.5 h-3.5 mr-1" />Save & Next<ArrowRight className="w-3.5 h-3.5 ml-1" /></Button>
                </div>
            </div>

            <SubmitDialog open={showSubmit} onOpenChange={setShowSubmit} questions={paletteQuestions} onConfirm={onSubmit} onCancel={() => setShowSubmit(false)} />
        </div>
    );
}
