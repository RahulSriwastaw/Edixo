"use client";

import { useState, useCallback, useEffect } from "react";
import { useExamTheme } from "@/contexts/ExamThemeContext";
import { SSCLayout } from "./layouts/SSCLayout";
import { RailwayLayout } from "./layouts/RailwayLayout";
import { UPSCLayout } from "./layouts/UPSCLayout";
import { JEELayout } from "./layouts/JEELayout";
import { DefaultLayout } from "./layouts/DefaultLayout";
import { TestbookLayout } from "./layouts/TestbookLayout";
import { TestRankKINGLayout } from "./layouts/TestRankKINGLayout";

interface TestInterfaceProps {
    test: {
        id: string;
        name: string;
        durationMins: number;
        questions: any[];
    };
    onSubmit: (answers: Record<string, string[]>, integerAnswers: Record<string, string>) => void;
}

export function TestInterface({ test, onSubmit }: TestInterfaceProps) {
    const { theme } = useExamTheme();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string[]>>({});
    const [marked, setMarked] = useState<Set<string>>(new Set());
    const [integerAnswers, setIntegerAnswers] = useState<Record<string, string>>({});

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
        onSubmit(answers, integerAnswers);
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
    };

    switch (layoutVariant) {
        case "ssc":
            return <SSCLayout {...commonProps} />;
        case "railway":
            return <RailwayLayout {...commonProps} />;
        case "upsc":
            return <UPSCLayout {...commonProps} />;
        case "jee":
            return <JEELayout {...commonProps} />;
        case "testbook":
            return <TestbookLayout {...commonProps} />;
        case "testrankking":
            return <TestRankKINGLayout {...commonProps} />;
        default:
            return <DefaultLayout {...commonProps} />;
    }
}
