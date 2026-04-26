"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export interface ExamThemeConfig {
    layoutVariant: "ssc" | "railway" | "upsc" | "jee" | "testbook" | "testrankking" | "eduquity" | "default";
    paletteColorScheme: Record<string, string>;
    paletteStyle: "grid" | "list";
    timerPosition: "header-right" | "header-center" | "floating";
    timerFormat: "countdown" | "countup";
    showQuestionMarks: boolean;
    showNegativeMarks: boolean;
    showSectionTabs: boolean;
    showQuestionTypeBadge: boolean;
    fontSize: "small" | "medium" | "large";
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    sidebarBackground: string;
    headerBackground: string;
    optionStyle: "radio-cards" | "boxed" | "minimal";
    showLegend: boolean;
    enableAutoSubmit: boolean;
    submitWarningMinutes: number;
    customCss?: string;
}

export interface ExamTheme {
    id: string;
    name: string;
    description: string | null;
    layoutVariant: string;
    config: ExamThemeConfig;
    screenshotUrl: string | null;
    isDefault: boolean;
    isActive: boolean;
}

interface ExamThemeContextValue {
    theme: ExamTheme | null;
    setTheme: (theme: ExamTheme | null) => void;
    cssVariables: Record<string, string>;
    getPaletteColor: (state: string) => string;
}

const ExamThemeContext = createContext<ExamThemeContextValue | null>(null);

function generateCssVariables(theme: ExamTheme | null): Record<string, string> {
    if (!theme) return {};
    const cfg = theme.config;
    return {
        "--exam-primary": cfg.primaryColor || "#F4511E",
        "--exam-secondary": cfg.secondaryColor || "#1976D2",
        "--exam-bg": cfg.backgroundColor || "#FFFFFF",
        "--exam-sidebar-bg": cfg.sidebarBackground || "#F8F9FA",
        "--exam-header-bg": cfg.headerBackground || "#FFFFFF",
        "--exam-font-size": cfg.fontSize === "small" ? "14px" : cfg.fontSize === "large" ? "18px" : "16px",
        "--exam-option-style": cfg.optionStyle || "radio-cards",
    };
}

export function ExamThemeProvider({
    children,
    theme,
}: {
    children: React.ReactNode;
    theme: ExamTheme | null;
}) {
    const [currentTheme, setCurrentTheme] = useState<ExamTheme | null>(theme);

    const cssVariables = generateCssVariables(currentTheme);

    const getPaletteColor = useCallback(
        (state: string) => {
            return currentTheme?.config?.paletteColorScheme?.[state] || "#6B7280";
        },
        [currentTheme]
    );

    return (
        <ExamThemeContext.Provider
            value={{
                theme: currentTheme,
                setTheme: setCurrentTheme,
                cssVariables,
                getPaletteColor,
            }}
        >
            {children}
        </ExamThemeContext.Provider>
    );
}

export function useExamTheme() {
    const ctx = useContext(ExamThemeContext);
    if (!ctx) {
        throw new Error("useExamTheme must be used within ExamThemeProvider");
    }
    return ctx;
}
