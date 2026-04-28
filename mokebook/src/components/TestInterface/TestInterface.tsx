"use client";

import { useState, useCallback, useEffect } from "react";
import { useExamTheme } from "@/contexts/ExamThemeContext";
import { DefaultLayout } from "./layouts/DefaultLayout";
import { EduquityLayout } from "./layouts/EduquityLayout";

interface TestInterfaceProps {
    test: {
        id: string;
        name: string;
        durationMins: number;
        questions: any[];
    };
    onSubmit?: (answers: Record<string, string[]>, integerAnswers: Record<string, string>) => void;
    isReviewMode?: boolean;
    language?: 'en' | 'hi';
}

export function TestInterface({ test, onSubmit, isReviewMode, language: initialLanguage }: TestInterfaceProps) {
    const { theme } = useExamTheme();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string[]>>(() => {
        if (!isReviewMode) return {};
        const initAns: Record<string, string[]> = {};
        test.questions.forEach(q => {
            if (q.selectedOptionIds && q.selectedOptionIds.length > 0) {
                initAns[q.id] = q.selectedOptionIds;
            }
        });
        return initAns;
    });
    const [marked, setMarked] = useState<Set<string>>(new Set());
    const [integerAnswers, setIntegerAnswers] = useState<Record<string, string>>(() => {
        if (!isReviewMode) return {};
        const initAns: Record<string, string> = {};
        test.questions.forEach(q => {
            if (q.type === 'integer' && q.selectedOptionIds && q.selectedOptionIds.length > 0) {
                initAns[q.id] = q.selectedOptionIds[0];
            }
        });
        return initAns;
    });

    const [isMobile, setIsMobile] = useState(false);
    const [isReattemptMode, setIsReattemptMode] = useState(false);
    const [language, setLanguage] = useState<'en' | 'hi'>(initialLanguage || 'en');

    useEffect(() => {
        if (initialLanguage) {
            setLanguage(initialLanguage);
        }
    }, [initialLanguage]);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const toggleReattemptMode = useCallback(() => {
        setIsReattemptMode(prev => !prev);
    }, []);

    const handleLanguageChange = useCallback((lang: 'en' | 'hi') => {
        setLanguage(lang);
    }, []);

    const layoutVariant = theme?.config?.layoutVariant || "default";

    const handleSelectQuestion = useCallback((index: number) => {
        setCurrentIndex(Math.max(0, Math.min(index, test.questions.length - 1)));
    }, [test.questions.length]);

    const handleAnswer = useCallback((questionId: string, selected: string[]) => {
        setAnswers((prev) => ({ ...prev, [questionId]: selected }));
    }, []);

    const handleMarkReview = useCallback(() => {
        const qid = test.questions[currentIndex]?.id;
        if (!qid) return;
        setMarked((prev) => {
            const next = new Set(prev);
            if (next.has(qid)) next.delete(qid);
            else next.add(qid);
            return next;
        });
        // Move to next
        setCurrentIndex((i) => Math.min(i + 1, test.questions.length - 1));
    }, [currentIndex, test.questions]);

    const handleClear = useCallback(() => {
        const qid = test.questions[currentIndex]?.id;
        if (!qid) return;
        setAnswers((prev) => {
            const next = { ...prev };
            delete next[qid];
            return next;
        });
        setIntegerAnswers((prev) => {
            const next = { ...prev };
            delete next[qid];
            return next;
        });
    }, [currentIndex, test.questions]);

    const handleSaveNext = useCallback(() => {
        setCurrentIndex((i) => Math.min(i + 1, test.questions.length - 1));
    }, [test.questions.length]);

    const handleSubmit = useCallback(() => {
        onSubmit?.(answers, integerAnswers);
    }, [answers, integerAnswers, onSubmit]);

    const handleIntegerChange = useCallback((questionId: string, value: string) => {
        setIntegerAnswers((prev) => ({ ...prev, [questionId]: value }));
        // Also treat as answer for palette coloring
        setAnswers((prev) => ({ ...prev, [questionId]: [value] }));
    }, []);

    const commonProps = {
        testName: test.name,
        durationMins: test.durationMins,
        questions: test.questions,
        currentIndex,
        answers,
        marked,
        onSelectQuestion: handleSelectQuestion,
        onAnswer: handleAnswer,
        onMarkReview: handleMarkReview,
        onClear: handleClear,
        onSaveNext: handleSaveNext,
        onSubmit: handleSubmit,
        integerAnswers,
        onIntegerChange: handleIntegerChange,
        isReviewMode,
        isReattemptMode,
        onToggleReattempt: toggleReattemptMode,
        language,
        onLanguageChange: handleLanguageChange,
    };

    // Use DefaultLayout (MockVeda) for review mode or mobile view
    if (isReviewMode || isMobile) {
        return <DefaultLayout {...commonProps} />;
    }

    switch (layoutVariant) {
        case "eduquity":
            return <EduquityLayout {...commonProps} />;
        default:
            return <DefaultLayout {...commonProps} />;
    }
}
