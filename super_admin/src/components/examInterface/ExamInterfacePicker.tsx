"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
    Layout,
    Check,
    ChevronDown,
    Monitor,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ExamInterfaceTheme {
    id: string;
    name: string;
    layoutVariant: string;
    screenshotUrl: string | null;
    isDefault: boolean;
    isActive: boolean;
}

interface ExamInterfacePickerProps {
    value: string | null;
    onChange: (themeId: string | null) => void;
    label?: string;
}

const layoutLabels: Record<string, string> = {
    ssc: "SSC",
    railway: "Railway",
    upsc: "UPSC",
    jee: "JEE",
    testbook: "Testbook",
    testrankking: "TestRankKING",
    default: "Default",
};

export function ExamInterfacePicker({
    value,
    onChange,
    label = "Interface Theme",
}: ExamInterfacePickerProps) {
    const [themes, setThemes] = useState<ExamInterfaceTheme[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchThemes = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get("/exam-interface-themes");
            setThemes(res.data || []);
        } catch {
            setThemes([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchThemes();
    }, [fetchThemes]);

    const selectedTheme = themes.find((t) => t.id === value);

    return (
        <div className="space-y-2">
            <label className="text-[12px] font-semibold text-[var(--text-primary)]">
                {label}
            </label>
            <Select
                value={value || "default"}
                onValueChange={(v) => onChange(v === "default" ? null : v)}
            >
                <SelectTrigger className="h-10 text-[13px] bg-white">
                    <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="default">
                        <div className="flex items-center gap-2">
                            <span className="text-[var(--text-muted)]">Use default theme</span>
                        </div>
                    </SelectItem>
                    {themes.map((theme) => (
                        <SelectItem key={theme.id} value={theme.id}>
                            <div className="flex items-center gap-2">
                                <span
                                    className={cn(
                                        "text-[10px] px-1.5 py-0.5 rounded font-semibold",
                                        theme.layoutVariant === "ssc" && "bg-blue-100 text-blue-700",
                                        theme.layoutVariant === "railway" && "bg-emerald-100 text-emerald-700",
                                        theme.layoutVariant === "upsc" && "bg-amber-100 text-amber-700",
                                        theme.layoutVariant === "jee" && "bg-purple-100 text-purple-700",
                                        theme.layoutVariant === "testbook" && "bg-cyan-100 text-cyan-700",
                                        theme.layoutVariant === "testrankking" && "bg-indigo-100 text-indigo-700",
                                        theme.layoutVariant === "default" && "bg-gray-100 text-gray-700"
                                    )}
                                >
                                    {layoutLabels[theme.layoutVariant] || theme.layoutVariant}
                                </span>
                                <span className="text-[13px]">{theme.name}</span>
                                {theme.isDefault && (
                                    <span className="text-[10px] text-[#FF6B2B] font-medium">
                                        (default)
                                    </span>
                                )}
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Preview card */}
            {selectedTheme && (
                <div className="mt-2 p-3 rounded-lg border border-[var(--border-input)] bg-[var(--bg-main)] flex items-center gap-3">
                    {selectedTheme.screenshotUrl ? (
                        <img
                            src={selectedTheme.screenshotUrl}
                            alt={selectedTheme.name}
                            className="w-16 h-12 object-cover rounded"
                        />
                    ) : (
                        <div className="w-16 h-12 bg-[var(--bg-card)] rounded flex items-center justify-center">
                            <Monitor className="w-5 h-5 text-[var(--text-muted)]" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-[var(--text-primary)] truncate">
                            {selectedTheme.name}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)]">
                            {layoutLabels[selectedTheme.layoutVariant] || selectedTheme.layoutVariant}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
