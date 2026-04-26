"use client";

import { useExamTheme } from "@/contexts/ExamThemeContext";
import { Badge } from "@/components/ui/badge";

interface QuestionDisplayProps {
    question: {
        id: string;
        number: number;
        text: string;
        textHi?: string;
        marks?: number;
        negative?: number;
        type?: string;
        section?: string;
    };
    showMarks?: boolean;
    showType?: boolean;
}

export function QuestionDisplay({ question, showMarks, showType }: QuestionDisplayProps) {
    const { theme } = useExamTheme();
    const shouldShowMarks = showMarks ?? theme?.config?.showQuestionMarks ?? true;
    const shouldShowType = showType ?? theme?.config?.showQuestionTypeBadge ?? false;

    const typeLabels: Record<string, string> = {
        mcq_single: "Single Correct",
        mcq_multiple: "Multiple Correct",
        integer: "Integer Type",
    };

    return (
        <div className="space-y-3">
            {/* Header row */}
            <div className="flex items-center gap-2 flex-wrap">
                <Badge
                    variant="outline"
                    className="text-[11px] font-bold"
                    style={{ borderColor: "var(--exam-primary)", color: "var(--exam-primary)" }}
                >
                    Q{question.number}
                </Badge>
                {shouldShowType && question.type && (
                    <Badge variant="secondary" className="text-[10px]">
                        {typeLabels[question.type] || question.type}
                    </Badge>
                )}
                {shouldShowMarks && (
                    <span className="text-[11px] text-[var(--text-muted)] ml-auto">
                        Marks: <span className="font-semibold text-[var(--text-primary)]">{question.marks || 1}</span>
                        {question.negative ? (
                            <span className="text-red-500"> / -{Math.abs(question.negative)}</span>
                        ) : null}
                    </span>
                )}
            </div>

            {/* Question text */}
            <div
                className="text-[var(--text-primary)] leading-relaxed"
                style={{ fontSize: "var(--exam-font-size)" }}
                dangerouslySetInnerHTML={{ __html: question.text }}
            />
            {question.textHi && (
                <div
                    className="text-[var(--text-secondary)] leading-relaxed border-t border-dashed border-[var(--divider)] pt-2 mt-2"
                    style={{ fontSize: "calc(var(--exam-font-size) - 1px)" }}
                    dangerouslySetInnerHTML={{ __html: question.textHi }}
                />
            )}
        </div>
    );
}
