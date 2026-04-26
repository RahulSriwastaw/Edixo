"use client";

import { useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface QuestionStatus {
    status: "not-visited" | "not-answered" | "answered" | "marked-for-review" | "marked-and-answered";
    section?: string;
}

interface SubmitDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    questions: QuestionStatus[];
    onConfirm: () => void;
    onCancel: () => void;
}

export function SubmitDialog({ open, onOpenChange, questions, onConfirm, onCancel }: SubmitDialogProps) {
    const stats = useMemo(() => {
        const total = questions.length;
        const answered = questions.filter((q) => q.status === "answered" || q.status === "marked-and-answered").length;
        const notAnswered = questions.filter((q) => q.status === "not-answered").length;
        const marked = questions.filter((q) => q.status === "marked-for-review" || q.status === "marked-and-answered").length;
        const notVisited = questions.filter((q) => q.status === "not-visited").length;
        return { total, answered, notAnswered, marked, notVisited };
    }, [questions]);

    // Section breakdown
    const sections = useMemo(() => {
        const map: Record<string, { total: number; answered: number }> = {};
        questions.forEach((q) => {
            const sec = q.section || "General";
            if (!map[sec]) map[sec] = { total: 0, answered: 0 };
            map[sec].total++;
            if (q.status === "answered" || q.status === "marked-and-answered") map[sec].answered++;
        });
        return map;
    }, [questions]);

    const allAnswered = stats.answered + stats.notAnswered + stats.marked === stats.total;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-[16px]">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Submit Test?
                    </DialogTitle>
                    <DialogDescription className="text-[13px]">
                        Review your attempt summary before final submission
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Summary cards */}
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { label: "Total", value: stats.total, color: "bg-gray-100 text-gray-700" },
                            { label: "Answered", value: stats.answered, color: "bg-green-50 text-green-700" },
                            { label: "Not Answered", value: stats.notAnswered, color: "bg-red-50 text-red-600" },
                            { label: "Marked", value: stats.marked, color: "bg-purple-50 text-purple-700" },
                            { label: "Not Visited", value: stats.notVisited, color: "bg-gray-50 text-gray-500" },
                        ].map((s) => (
                            <div key={s.label} className={`rounded-lg p-2 text-center ${s.color}`}>
                                <div className="text-[16px] font-bold">{s.value}</div>
                                <div className="text-[10px] font-semibold uppercase">{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Section breakdown */}
                    {Object.keys(sections).length > 1 && (
                        <div className="space-y-1.5">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                Section-wise
                            </p>
                            {Object.entries(sections).map(([name, data]) => (
                                <div key={name} className="flex items-center justify-between text-[12px]">
                                    <span className="text-[var(--text-secondary)]">{name}</span>
                                    <span className="font-semibold text-[var(--text-primary)]">
                                        {data.answered}/{data.total}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {!allAnswered && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 text-amber-700 text-[12px]">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>
                                You have {stats.notAnswered + stats.notVisited} unanswered questions. Are you sure you want to submit?
                            </span>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className="bg-[#FF6B2B] hover:bg-[#FF6B2B]/90 text-white"
                    >
                        Confirm Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
