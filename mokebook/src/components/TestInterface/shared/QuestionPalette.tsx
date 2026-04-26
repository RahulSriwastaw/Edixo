"use client";

import { cn } from "@/lib/utils";
import { useExamTheme } from "@/contexts/ExamThemeContext";

interface QuestionPaletteProps {
    questions: Array<{
        id: string;
        number: number;
        section?: string;
        type?: string;
        status: "not-visited" | "not-answered" | "answered" | "marked-for-review" | "marked-and-answered";
    }>;
    currentIndex: number;
    onSelect: (index: number) => void;
    paletteStyle?: "grid" | "list";
}

export function QuestionPalette({ questions, currentIndex, onSelect, paletteStyle }: QuestionPaletteProps) {
    const { theme, getPaletteColor } = useExamTheme();
    const style = paletteStyle || theme?.config?.paletteStyle || "grid";

    const statusColors: Record<string, string> = {
        "not-visited": getPaletteColor("notVisited") || "#E5E7EB",
        "not-answered": getPaletteColor("notAnswered") || "#EF4444",
        answered: getPaletteColor("answered") || "#22C55E",
        "marked-for-review": getPaletteColor("markedForReview") || "#A855F7",
        "marked-and-answered": getPaletteColor("markedAndAnswered") || "#F97316",
    };

    return (
        <div className="h-full flex flex-col">
            <h3 className="text-[13px] font-bold mb-3 text-[var(--text-primary)]">
                Question Palette
            </h3>
            <div
                className={cn(
                    "flex-1 overflow-y-auto gap-1.5",
                    style === "grid" ? "grid grid-cols-5" : "flex flex-col"
                )}
            >
                {questions.map((q, idx) => (
                    <button
                        key={q.id}
                        onClick={() => onSelect(idx)}
                        className={cn(
                            "relative rounded-md text-[12px] font-semibold transition-all hover:scale-105",
                            style === "grid"
                                ? "h-9 w-full flex items-center justify-center"
                                : "h-8 px-3 flex items-center justify-between w-full",
                            idx === currentIndex && "ring-2 ring-offset-1 ring-[var(--exam-primary)]"
                        )}
                        style={{
                            backgroundColor: statusColors[q.status] || statusColors["not-visited"],
                            color: q.status === "not-visited" ? "#374151" : "#FFFFFF",
                        }}
                    >
                        <span>{q.number}</span>
                        {style === "list" && q.section && (
                            <span className="text-[10px] opacity-70">{q.section}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Legend */}
            {theme?.config?.showLegend !== false && (
                <div className="mt-3 pt-3 border-t border-[var(--divider)] space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        Legend
                    </p>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                        {Object.entries(statusColors).map(([status, color]) => (
                            <div key={status} className="flex items-center gap-1.5">
                                <div
                                    className="w-2.5 h-2.5 rounded-sm"
                                    style={{ backgroundColor: color }}
                                />
                                <span className="text-[10px] text-[var(--text-secondary)] capitalize">
                                    {status.replace(/-/g, " ")}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
