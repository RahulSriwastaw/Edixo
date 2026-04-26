"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useExamTheme } from "@/contexts/ExamThemeContext";

interface Option {
    id: string;
    text: string;
    textHi?: string;
}

interface OptionButtonProps {
    options: Option[];
    type: "mcq_single" | "mcq_multiple" | "integer";
    selected: string[];
    onChange: (selected: string[]) => void;
    integerValue?: string;
    onIntegerChange?: (value: string) => void;
}

export function OptionButton({
    options,
    type,
    selected,
    onChange,
    integerValue,
    onIntegerChange,
}: OptionButtonProps) {
    const { theme } = useExamTheme();
    const optionStyle = theme?.config?.optionStyle || "radio-cards";

    const toggleOption = (id: string) => {
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
                    onChange={(e) => onIntegerChange?.(e.target.value)}
                    className="w-full h-12 px-4 rounded-lg border border-[var(--border-input)] text-[16px] font-mono"
                    style={{ background: "var(--exam-bg)" }}
                    placeholder="Type integer value..."
                />
            </div>
        );
    }

    const labelMap = ["A", "B", "C", "D", "E", "F"];

    return (
        <div className="space-y-2">
            {options.map((opt, idx) => {
                const isSelected = selected.includes(opt.id);
                const label = labelMap[idx] || String(idx + 1);

                return (
                    <button
                        key={opt.id}
                        onClick={() => toggleOption(opt.id)}
                        className={cn(
                            "w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3",
                            optionStyle === "radio-cards" && [
                                "border-2",
                                isSelected
                                    ? "border-[var(--exam-primary)] bg-[var(--exam-primary)]/5"
                                    : "border-[var(--border-input)] hover:border-[var(--exam-primary)]/50",
                            ],
                            optionStyle === "boxed" && [
                                "border",
                                isSelected
                                    ? "border-[var(--exam-primary)] bg-[var(--exam-primary)]/10"
                                    : "border-[var(--border-input)] hover:bg-[var(--bg-main)]",
                            ],
                            optionStyle === "minimal" && [
                                "border-b border-[var(--divider)] rounded-none",
                                isSelected && "bg-[var(--exam-primary)]/5",
                            ]
                        )}
                    >
                        {/* Radio / Checkbox indicator */}
                        <div
                            className={cn(
                                "shrink-0 flex items-center justify-center transition-all",
                                type === "mcq_multiple"
                                    ? "w-5 h-5 rounded border-2"
                                    : "w-6 h-6 rounded-full border-2"
                            )}
                            style={{
                                borderColor: isSelected ? "var(--exam-primary)" : "var(--border-input)",
                                backgroundColor: isSelected ? "var(--exam-primary)" : "transparent",
                            }}
                        >
                            {isSelected && (
                                <span className="text-white text-[10px] font-bold">
                                    {type === "mcq_multiple" ? "✓" : "●"}
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
                            className="text-[14px] leading-snug"
                            style={{ color: "var(--text-primary)" }}
                            dangerouslySetInnerHTML={{ __html: opt.text }}
                        />
                    </button>
                );
            })}
        </div>
    );
}
