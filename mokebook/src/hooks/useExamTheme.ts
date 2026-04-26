import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { ExamTheme } from "@/contexts/ExamThemeContext";

export function useExamThemeByExamId(examId: string) {
    const [theme, setTheme] = useState<ExamTheme | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTheme = useCallback(async () => {
        if (!examId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const res = await apiFetch(`/exam-interface-themes/for-exam/${examId}`);
            setTheme(res.data || null);
        } catch (err: any) {
            setError(err.message || "Failed to load theme");
        } finally {
            setLoading(false);
        }
    }, [examId]);

    useEffect(() => {
        fetchTheme();
    }, [fetchTheme]);

    return { theme, loading, error, refetch: fetchTheme };
}

export function useAllExamThemes() {
    const [themes, setThemes] = useState<ExamTheme[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchThemes = useCallback(async () => {
        try {
            setLoading(true);
            const res = await apiFetch("/exam-interface-themes");
            setThemes(res.data || []);
        } catch (err: any) {
            setError(err.message || "Failed to load themes");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchThemes();
    }, [fetchThemes]);

    return { themes, loading, error, refetch: fetchThemes };
}
