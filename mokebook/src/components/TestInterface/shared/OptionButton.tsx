"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useExamTheme } from "@/contexts/ExamThemeContext";

interface Option {
    id: string;
    text: string;
    textEn?: string;
    textHi?: string;
}

interface OptionButtonProps {
    options: Option[];
    type: "mcq_single" | "mcq_multiple" | "integer";
    selected: string[];
    onChange: (selected: string[]) => void;
    integerValue?: string;
    onIntegerChange?: (value: string) => void;
    isReviewMode?: boolean;
    correctOptionIds?: string[];
    explanation?: string;
    explanationEn?: string;
    explanationHi?: string;
    forceShowSolution?: boolean;
    isReattemptMode?: boolean;
    language?: 'en' | 'hi';
}

export function OptionButton({
    options,
    type,
    selected,
    onChange,
    integerValue,
    onIntegerChange,
    isReviewMode,
    correctOptionIds = [],
    explanation,
    explanationEn,
    explanationHi,
    forceShowSolution = false,
    isReattemptMode = false,
    language = 'en',
}: OptionButtonProps) {
    const { theme } = useExamTheme();
    const optionStyle = theme?.config?.optionStyle || "radio-cards";

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

    const getOptionText = (opt: Option) => {
        const raw = language === 'hi' 
            ? (opt.textHi && opt.textHi.trim() !== "" ? opt.textHi : (opt.textEn || opt.text)) 
            : (opt.textEn && opt.textEn.trim() !== "" ? opt.textEn : (opt.text || opt.textHi || ""));
        return renderMarkdown(raw);
    };

    const toggleOption = (id: string) => {
        if (isReviewMode && !isReattemptMode) return;
        if (type === "mcq_multiple") {
            onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
        } else {
            onChange([id]);
        }
    };

    if (type === "integer") {
        return (
            <div className="space-y-2">
                <label className="text-[12px] font-semibold text-[var(--text-primary)]">
                    Enter your answer:
                </label>
                <input
                    type="number"
                    value={integerValue || ""}
                    onChange={(e) => {
                        if (!isReviewMode) onIntegerChange?.(e.target.value);
                    }}
                    readOnly={isReviewMode}
                    className="w-full h-12 px-4 rounded-lg border border-[var(--border-input)] text-[16px] font-mono"
                    style={{ background: "var(--exam-bg)" }}
                    placeholder={isReviewMode ? "" : "Type integer value..."}
                />
                {isReviewMode && forceShowSolution && (explanationEn || explanationHi || explanation) && (
                    <div className="mt-4 p-4 rounded-lg bg-[var(--bg-main)] border border-[var(--border-input)]">
                        <h4 className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Solution</h4>
                        <div 
                            className="text-[14px] text-[var(--text-primary)]" 
                            dangerouslySetInnerHTML={{ 
                                __html: renderMarkdown(
                                    language === 'hi' 
                                        ? (explanationHi || explanationEn || explanation || "") 
                                        : (explanationEn || explanation || explanationHi || "")
                                ) 
                            }} 
                        />
                    </div>
                )}
            </div>
        );
    }

    const labelMap = ["A", "B", "C", "D", "E", "F"];

    return (
        <div className="space-y-2">
            {options.map((opt, idx) => {
                const isSelected = selected.includes(opt.id);
                const isCorrect = correctOptionIds.includes(opt.id);
                const isWrong = isSelected && !isCorrect;
                
                const label = labelMap[idx] || String(idx + 1);

                return (
                    <button
                        key={opt.id}
                        onClick={() => toggleOption(opt.id)}
                        className={cn(
                            "w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3",
                             optionStyle === "radio-cards" && [
                                "border-2",
                                isReviewMode
                                    ? (forceShowSolution ? (isCorrect ? "border-green-500 bg-green-50" : isWrong ? "border-red-500 bg-red-50" : "border-[var(--border-input)] opacity-60") : (isSelected ? "border-[var(--exam-primary)] bg-[var(--exam-primary)]/5" : "border-[var(--border-input)]"))
                                    : isSelected
                                        ? "border-[var(--exam-primary)] bg-[var(--exam-primary)]/5"
                                        : "border-[var(--border-input)] hover:border-[var(--exam-primary)]/50",
                            ],
                            optionStyle === "boxed" && [
                                "border",
                                isReviewMode
                                    ? (forceShowSolution ? (isCorrect ? "border-green-500 bg-green-50" : isWrong ? "border-red-500 bg-red-50" : "border-[var(--border-input)] opacity-60") : (isSelected ? "border-[var(--exam-primary)] bg-[var(--exam-primary)]/10" : "border-[var(--border-input)]"))
                                    : isSelected
                                        ? "border-[var(--exam-primary)] bg-[var(--exam-primary)]/10"
                                        : "border-[var(--border-input)] hover:bg-[var(--bg-main)]",
                            ],
                            optionStyle === "minimal" && [
                                "border-b border-[var(--divider)] rounded-none",
                                isReviewMode
                                    ? (forceShowSolution ? (isCorrect ? "bg-green-50" : isWrong ? "bg-red-50" : "opacity-60") : (isSelected && "bg-[var(--exam-primary)]/5"))
                                    : isSelected && "bg-[var(--exam-primary)]/5",
                            ]
                        )}
                        disabled={isReviewMode && !isReattemptMode && forceShowSolution}
                    >
                        {/* Radio / Checkbox indicator */}
                        <div
                            className={cn(
                                "shrink-0 flex items-center justify-center transition-all",
                                type === "mcq_multiple"
                                    ? "w-5 h-5 rounded border-2"
                                    : "w-6 h-6 rounded-full border-2"
                            )}
                            style={isReviewMode ? {
                                borderColor: forceShowSolution ? (isCorrect ? "#22C55E" : isWrong ? "#EF4444" : "var(--border-input)") : (isSelected ? "var(--exam-primary)" : "var(--border-input)"),
                                backgroundColor: forceShowSolution ? (isCorrect ? "#22C55E" : isWrong ? "#EF4444" : "transparent") : (isSelected ? "var(--exam-primary)" : "transparent"),
                            } : {
                                borderColor: isSelected ? "var(--exam-primary)" : "var(--border-input)",
                                backgroundColor: isSelected ? "var(--exam-primary)" : "transparent",
                            }}
                        >
                            {(isSelected || (isReviewMode && forceShowSolution && isCorrect)) && (
                                <span className="text-white text-[10px] font-bold">
                                    {isReviewMode ? (forceShowSolution ? (isCorrect ? "✓" : "✗") : "●") : (type === "mcq_multiple" ? "✓" : "●")}
                                </span>
                            )}
                        </div>

                        {/* Label */}
                        <span
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                            style={{
                                background: isSelected ? "var(--exam-primary)" : "var(--bg-main)",
                                color: isSelected ? "#fff" : "var(--text-secondary)",
                            }}
                        >
                            {label}
                        </span>

                        {/* Text */}
                        <span
                            className="text-[14px] leading-snug flex-1"
                            style={{ color: "var(--text-primary)" }}
                            dangerouslySetInnerHTML={{ __html: getOptionText(opt) }}
                        />
                    </button>
                );
            })}
            
            {isReviewMode && forceShowSolution && (explanationEn || explanationHi || explanation) && (
                <div className="mt-6 p-4 rounded-lg bg-[var(--bg-main)] border border-[var(--border-input)]">
                    <h4 className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Solution</h4>
                    <div 
                        className="text-[14px] text-[var(--text-primary)]" 
                        dangerouslySetInnerHTML={{ 
                            __html: renderMarkdown(
                                language === 'hi' 
                                    ? (explanationHi || explanationEn || explanation || "") 
                                    : (explanationEn || explanation || explanationHi || "")
                            ) 
                        }} 
                    />
                </div>
            )}
        </div>
    );
}
