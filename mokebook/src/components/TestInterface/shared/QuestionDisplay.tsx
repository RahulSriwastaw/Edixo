"use client";

import { useExamTheme } from "@/contexts/ExamThemeContext";
import { Badge } from "@/components/ui/badge";

interface QuestionDisplayProps {
    question: {
        id: string;
        number: number;
        text: string; // fallback
        textEn?: string;
        textHi?: string;
        imageUrl?: string;
        marks?: number;
        negative?: number;
        type?: string;
        section?: string;
    };
    showMarks?: boolean;
    showType?: boolean;
    language?: 'en' | 'hi';
}

/** Detect if a string contains Devanagari (Hindi) script */
const containsHindi = (text: string) => /[\u0900-\u097F]/.test(text);

/** Check if a language-specific translation actually exists and differs */
function getTranslationStatus(textEn?: string, textHi?: string) {
    const enText = (textEn || "").trim();
    const hiText = (textHi || "").trim();
    const hasSeparateEn = enText !== "" && enText !== hiText && !containsHindi(enText);
    const hasSeparateHi = hiText !== "" && hiText !== enText && containsHindi(hiText);
    return { hasSeparateEn, hasSeparateHi };
}

export function QuestionDisplay({ question, showMarks, showType, language = 'en' }: QuestionDisplayProps) {
    const { theme } = useExamTheme();
    const shouldShowMarks = showMarks ?? theme?.config?.showQuestionMarks ?? true;
    const shouldShowType = showType ?? theme?.config?.showQuestionTypeBadge ?? false;

    const typeLabels: Record<string, string> = {
        mcq_single: "Single Correct",
        mcq_multiple: "Multiple Correct",
        integer: "Integer Type",
    };

    const renderMarkdown = (text: string) => {
        if (!text) return "";
        let html = text
            .replace(/^### (.*$)/gim, '<h3 class="text-[15px] font-bold mt-4 mb-2 text-blue-700">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-[17px] font-bold mt-5 mb-3 text-blue-800">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-[19px] font-black mt-6 mb-4 text-blue-900">$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
            .replace(/\n/g, '<br/>');
        return html;
    };

    const { hasSeparateEn, hasSeparateHi } = getTranslationStatus(question.textEn, question.textHi);

    const getDisplayText = () => {
        if (language === 'hi') {
            // Prefer real Hindi text; fall back to whatever exists
            const raw = question.textHi || question.textEn || question.text || "";
            return renderMarkdown(raw);
        }
        // English: prefer genuine English text; fall back to textEn as-is, then general text
        const raw = question.textEn || question.text || question.textHi || "";
        return renderMarkdown(raw);
    };

    // Show a banner when the requested language translation is unavailable
    const showEnUnavailable = language === 'en' && !hasSeparateEn && (question.textEn || question.textHi);
    const showHiUnavailable = language === 'hi' && !hasSeparateHi && (question.textEn || question.textHi);

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

            {/* Language unavailability notice */}
            {showEnUnavailable && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-50 border border-amber-200 w-fit">
                    <span className="text-amber-600 text-[11px]">⚠️</span>
                    <span className="text-amber-700 text-[11px] font-medium">
                        English translation not available — showing original text
                    </span>
                </div>
            )}
            {showHiUnavailable && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-50 border border-amber-200 w-fit">
                    <span className="text-amber-600 text-[11px]">⚠️</span>
                    <span className="text-amber-700 text-[11px] font-medium">
                        हिंदी अनुवाद उपलब्ध नहीं — मूल पाठ दिखाया जा रहा है
                    </span>
                </div>
            )}

            {/* Question Image (independent of language) */}
            {question.imageUrl && (
                <div className="mb-4">
                    <img
                        src={question.imageUrl}
                        alt="Question"
                        className="max-h-64 object-contain rounded border"
                    />
                </div>
            )}

            {/* Question text based on language */}
            <div
                className="text-[var(--text-primary)] leading-relaxed"
                style={{ fontSize: "var(--exam-font-size)" }}
                dangerouslySetInnerHTML={{ __html: getDisplayText() }}
            />
        </div>
    );
}
