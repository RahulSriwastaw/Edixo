"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useExamTheme } from "@/contexts/ExamThemeContext";
import { QuestionPalette } from "../shared/QuestionPalette";
import { ExamTimer } from "../shared/ExamTimer";
import { QuestionDisplay } from "../shared/QuestionDisplay";
import { OptionButton } from "../shared/OptionButton";
import { SubmitDialog } from "../shared/SubmitDialog";
import { ArrowLeft, ArrowRight, Bookmark, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RailwayLayoutProps {
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

export function RailwayLayout(props: RailwayLayoutProps) {
    const { theme, cssVariables } = useExamTheme();
    const [showSubmit, setShowSubmit] = useState(false);
    const [activeSection, setActiveSection] = useState<string>("all");

    const { testName, durationMins, questions, currentIndex, answers, marked, onSelectQuestion, onAnswer, onMarkReview, onClear, onSaveNext, onSubmit, integerAnswers, onIntegerChange } = props;

    const sections = useMemo(() => {
        const map = new Map<string, number>();
        questions.forEach((q, idx) => {
            const sec = q.section || "General";
            if (!map.has(sec)) map.set(sec, 0);
            if (answers[q.id]?.length) map.set(sec, (map.get(sec) || 0) + 1);
        });
        return Array.from(map.entries()).map(([name, answered]) => ({ name, answered, total: questions.filter((q) => (q.section || "General") === name).length }));
    }, [questions, answers]);

    const filteredQuestions = activeSection === "all" ? questions : questions.filter((q) => (q.section || "General") === activeSection);
    const filteredIndex = activeSection === "all" ? currentIndex : filteredQuestions.findIndex((q) => q.id === questions[currentIndex]?.id);

    const question = filteredQuestions[Math.max(0, filteredIndex)];
    const selected = answers[question?.id] || [];
    const isMarked = marked.has(question?.id);

    const paletteQuestions: Array<{ id: string; number: number; section?: string; status: any }> = filteredQuestions.map((q, idx) => {
        const status: any = answers[q.id]?.length ? (marked.has(q.id) ? "marked-and-answered" : "answered") : marked.has(q.id) ? "marked-for-review" : idx === filteredIndex ? "not-answered" : "not-visited";
        return { id: q.id, number: q.number || idx + 1, section: q.section, status };
    });

    return (
        <div className="h-screen flex flex-col" style={{ ...cssVariables, background: "var(--exam-bg)" }}>
            {/* Section tabs */}
            <div className="h-10 flex items-center gap-1 px-2 border-b overflow-x-auto shrink-0" style={{ background: "var(--exam-header-bg)", borderColor: "var(--divider)" }}>
                <button onClick={() => setActiveSection("all")} className={cn("px-3 h-7 rounded text-[11px] font-semibold whitespace-nowrap transition-colors", activeSection === "all" ? "text-white" : "text-[var(--text-secondary)] hover:bg-[var(--bg-main)]")} style={{ background: activeSection === "all" ? "var(--exam-primary)" : undefined }}>All Sections</button>
                {sections.map((sec) => (
                    <button key={sec.name} onClick={() => setActiveSection(sec.name)} className={cn("px-3 h-7 rounded text-[11px] font-semibold whitespace-nowrap transition-colors", activeSection === sec.name ? "text-white" : "text-[var(--text-secondary)] hover:bg-[var(--bg-main)]")} style={{ background: activeSection === sec.name ? "var(--exam-primary)" : undefined }}>
                        {sec.name} ({sec.answered}/{sec.total})
                    </button>
                ))}
            </div>

            <header className="h-12 flex items-center justify-between px-4 border-b shrink-0" style={{ background: "var(--exam-header-bg)", borderColor: "var(--divider)" }}>
                <h1 className="text-[13px] font-bold text-[var(--text-primary)]">{testName}</h1>
                <div className="flex items-center gap-3">
                    <ExamTimer totalSeconds={durationMins * 60} onTimeUp={onSubmit} />
                    <Button size="sm" onClick={() => setShowSubmit(true)} className="h-7 text-[11px] bg-[#FF6B2B] hover:bg-[#FF6B2B]/90 text-white">Submit</Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 min-w-0 overflow-y-auto p-4 lg:p-6">
                    {question && (
                        <div className="max-w-4xl mx-auto space-y-4">
                            <QuestionDisplay question={{ ...question, number: question.number || currentIndex + 1 }} />
                            <OptionButton options={question.options || []} type={question.type || "mcq_single"} selected={selected} onChange={(sel) => onAnswer(question.id, sel)} integerValue={integerAnswers[question.id]} onIntegerChange={(val) => onIntegerChange(question.id, val)} />
                        </div>
                    )}
                </div>
                <aside className="w-[260px] lg:w-[300px] border-l hidden md:flex flex-col p-4 overflow-hidden" style={{ background: "var(--exam-sidebar-bg)", borderColor: "var(--divider)" }}>
                    <QuestionPalette questions={paletteQuestions} currentIndex={filteredIndex} onSelect={(i) => {
                        const q = filteredQuestions[i];
                        const globalIdx = questions.findIndex((qq) => qq.id === q.id);
                        onSelectQuestion(globalIdx);
                    }} />
                </aside>
            </div>

            <div className="h-14 flex items-center justify-between px-4 border-t shrink-0" style={{ borderColor: "var(--divider)" }}>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={onMarkReview} className={cn("h-8 text-[12px]", isMarked && "border-purple-400 text-purple-600 bg-purple-50")}>
                        <Bookmark className="w-3.5 h-3.5 mr-1" />
                        Mark & Next
                    </Button>
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
