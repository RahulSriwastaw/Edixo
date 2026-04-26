"use client";

import { useState, useEffect, useCallback } from "react";
import { useExamTheme } from "@/contexts/ExamThemeContext";
import { AlertTriangle } from "lucide-react";

interface ExamTimerProps {
    totalSeconds: number;
    format?: "countdown" | "countup";
    onWarning?: () => void;
    onTimeUp?: () => void;
}

function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function ExamTimer({ totalSeconds, format = "countdown", onWarning, onTimeUp }: ExamTimerProps) {
    const { theme } = useExamTheme();
    const timerFormat = theme?.config?.timerFormat || format;
    const warningMinutes = theme?.config?.submitWarningMinutes || 5;

    const [elapsed, setElapsed] = useState(0);
    const [warningShown, setWarningShown] = useState(false);

    const remaining = Math.max(0, totalSeconds - elapsed);
    const displaySeconds = timerFormat === "countdown" ? remaining : elapsed;
    const isWarning = remaining <= warningMinutes * 60 && remaining > 0;

    useEffect(() => {
        const interval = setInterval(() => {
            setElapsed((prev) => {
                const next = prev + 1;
                if (next >= totalSeconds) {
                    clearInterval(interval);
                    onTimeUp?.();
                }
                return next;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [totalSeconds, onTimeUp]);

    useEffect(() => {
        if (isWarning && !warningShown) {
            setWarningShown(true);
            onWarning?.();
        }
    }, [isWarning, warningShown, onWarning]);

    return (
        <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-[14px] font-bold"
            style={{
                background: isWarning ? "rgba(239,68,68,0.1)" : "rgba(0,0,0,0.05)",
                color: isWarning ? "#EF4444" : "var(--text-primary)",
                border: isWarning ? "1px solid rgba(239,68,68,0.3)" : "1px solid transparent",
            }}
        >
            {isWarning && <AlertTriangle className="w-4 h-4 animate-pulse" />}
            <span>{formatTime(displaySeconds)}</span>
        </div>
    );
}
