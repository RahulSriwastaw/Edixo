"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    Layout,
    Upload,
    X,
    Loader2,
    Check,
    Palette,
    Clock,
    Type,
    Eye,
    Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ThemeFormModalProps {
    theme: {
        id: string;
        name: string;
        description: string | null;
        layoutVariant: string;
        config: Record<string, any>;
        screenshotUrl: string | null;
        isDefault: boolean;
        isActive: boolean;
    } | null;
    onSave: () => void;
    onCancel: () => void;
}

const layoutPresets: Record<string, Partial<any>> = {
    ssc: {
        paletteColorScheme: {
            notAnswered: "#EF4444",
            answered: "#22C55E",
            markedForReview: "#A855F7",
            markedAndAnswered: "#F97316",
            notVisited: "#E5E7EB",
        },
        showSectionTabs: false,
        showQuestionTypeBadge: false,
        optionStyle: "radio-cards",
        showLegend: true,
        timerPosition: "header-right",
        showQuestionMarks: true,
        showNegativeMarks: true,
    },
    railway: {
        paletteColorScheme: {
            notAnswered: "#EF4444",
            answered: "#22C55E",
            markedForReview: "#A855F7",
            markedAndAnswered: "#F97316",
            notVisited: "#E5E7EB",
        },
        showSectionTabs: true,
        showQuestionTypeBadge: false,
        optionStyle: "radio-cards",
        showLegend: true,
        timerPosition: "header-center",
        showQuestionMarks: true,
        showNegativeMarks: true,
    },
    upsc: {
        paletteColorScheme: {
            notAnswered: "#6B7280",
            answered: "#22C55E",
            markedForReview: "#A855F7",
            markedAndAnswered: "#F97316",
            notVisited: "#E5E7EB",
        },
        showSectionTabs: false,
        showQuestionTypeBadge: false,
        optionStyle: "minimal",
        showLegend: false,
        timerPosition: "header-right",
        showQuestionMarks: false,
        showNegativeMarks: false,
    },
    jee: {
        paletteColorScheme: {
            notAnswered: "#6B7280",
            answered: "#EC4899",
            markedForReview: "#F97316",
            markedAndAnswered: "#EC4899",
            notVisited: "#E5E7EB",
            singleCorrect: "#3B82F6",
            multiCorrect: "#8B5CF6",
            integer: "#10B981",
        },
        showSectionTabs: true,
        showQuestionTypeBadge: true,
        optionStyle: "boxed",
        showLegend: true,
        timerPosition: "header-right",
        showQuestionMarks: true,
        showNegativeMarks: true,
    },
    default: {
        paletteColorScheme: {
            notAnswered: "#6B7280",
            answered: "#22C55E",
            markedForReview: "#F59E0B",
            markedAndAnswered: "#EF4444",
            notVisited: "#E5E7EB",
        },
        showSectionTabs: false,
        showQuestionTypeBadge: false,
        optionStyle: "radio-cards",
        showLegend: true,
        timerPosition: "header-right",
        showQuestionMarks: true,
        showNegativeMarks: false,
    },
};

export function ThemeFormModal({ theme, onSave, onCancel }: ThemeFormModalProps) {
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [screenshot, setScreenshot] = useState<string | null>(theme?.screenshotUrl || null);

    const [form, setForm] = useState({
        name: theme?.name || "",
        description: theme?.description || "",
        layoutVariant: theme?.layoutVariant || "default",
        isDefault: theme?.isDefault || false,
        isActive: theme?.isActive ?? true,
        config: {
            layoutVariant: theme?.config?.layoutVariant || "default",
            paletteColorScheme: theme?.config?.paletteColorScheme || {},
            paletteStyle: theme?.config?.paletteStyle || "grid",
            timerPosition: theme?.config?.timerPosition || "header-right",
            timerFormat: theme?.config?.timerFormat || "countdown",
            showQuestionMarks: theme?.config?.showQuestionMarks ?? true,
            showNegativeMarks: theme?.config?.showNegativeMarks ?? true,
            showSectionTabs: theme?.config?.showSectionTabs ?? false,
            showQuestionTypeBadge: theme?.config?.showQuestionTypeBadge ?? false,
            fontSize: theme?.config?.fontSize || "medium",
            primaryColor: theme?.config?.primaryColor || "#F4511E",
            secondaryColor: theme?.config?.secondaryColor || "#1976D2",
            backgroundColor: theme?.config?.backgroundColor || "#FFFFFF",
            sidebarBackground: theme?.config?.sidebarBackground || "#F8F9FA",
            headerBackground: theme?.config?.headerBackground || "#FFFFFF",
            optionStyle: theme?.config?.optionStyle || "radio-cards",
            showLegend: theme?.config?.showLegend ?? true,
            enableAutoSubmit: theme?.config?.enableAutoSubmit ?? true,
            submitWarningMinutes: theme?.config?.submitWarningMinutes || 5,
            customCss: theme?.config?.customCss || "",
        },
    });

    const applyPreset = (variant: string) => {
        const preset = layoutPresets[variant] || layoutPresets.default;
        setForm((prev) => ({
            ...prev,
            layoutVariant: variant,
            config: {
                ...prev.config,
                layoutVariant: variant,
                ...preset,
            },
        }));
    };

    const updateConfig = (key: string, value: any) => {
        setForm((prev) => ({
            ...prev,
            config: { ...prev.config, [key]: value },
        }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/upload/image`, {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                setScreenshot(data.data.url);
                toast.success("Screenshot uploaded");
            } else {
                throw new Error(data.message || "Upload failed");
            }
        } catch (err: any) {
            toast.error(err.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!form.name.trim()) {
            toast.error("Theme name is required");
            return;
        }
        try {
            setSaving(true);
            const payload = {
                ...form,
                screenshotUrl: screenshot,
                config: form.config,
            };
            if (theme?.id) {
                await api.patch(`/exam-interface-themes/${theme.id}`, payload);
                toast.success("Theme updated");
            } else {
                await api.post("/exam-interface-themes", payload);
                toast.success("Theme created");
            }
            onSave();
        } catch (err: any) {
            toast.error(err.message || "Failed to save theme");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
                    <Layout className="w-4 h-4" />
                    Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-[12px] font-semibold text-[var(--text-primary)]">
                            Theme Name *
                        </Label>
                        <Input
                            value={form.name}
                            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                            placeholder="e.g., SSC CGL 2025 Interface"
                            className="h-9 text-[13px]"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-[12px] font-semibold text-[var(--text-primary)]">
                            Layout Preset
                        </Label>
                        <Select value={form.layoutVariant} onValueChange={applyPreset}>
                            <SelectTrigger className="h-9 text-[13px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ssc">SSC / Banking</SelectItem>
                                <SelectItem value="railway">Railway RRB</SelectItem>
                                <SelectItem value="upsc">UPSC / State PCS</SelectItem>
                                <SelectItem value="jee">JEE / NEET</SelectItem>
                                <SelectItem value="default">Default (MockBook)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label className="text-[12px] font-semibold text-[var(--text-primary)]">
                        Description
                    </Label>
                    <Textarea
                        value={form.description}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, description: e.target.value }))
                        }
                        placeholder="Brief description of this theme..."
                        className="text-[13px] min-h-[60px]"
                    />
                </div>
                <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={form.isDefault}
                            onCheckedChange={(v) =>
                                setForm((p) => ({ ...p, isDefault: v }))
                            }
                        />
                        <Label className="text-[12px] font-medium cursor-pointer">
                            Set as Default
                        </Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={form.isActive}
                            onCheckedChange={(v) =>
                                setForm((p) => ({ ...p, isActive: v }))
                            }
                        />
                        <Label className="text-[12px] font-medium cursor-pointer">
                            Active
                        </Label>
                    </div>
                </div>
            </div>

            {/* Screenshot Upload */}
            <div className="space-y-3">
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Screenshot Preview
                </h3>
                <div className="border border-dashed border-[var(--border-input)] rounded-lg p-4 bg-[var(--bg-main)]">
                    {screenshot ? (
                        <div className="relative">
                            <img
                                src={screenshot}
                                alt="Screenshot"
                                className="w-full h-40 object-cover rounded-md"
                            />
                            <button
                                onClick={() => setScreenshot(null)}
                                className="absolute top-2 right-2 p-1 bg-black/50 rounded text-white hover:bg-black/70"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center h-40 cursor-pointer">
                            {uploading ? (
                                <Loader2 className="w-8 h-8 animate-spin text-[var(--text-muted)]" />
                            ) : (
                                <>
                                    <Upload className="w-8 h-8 text-[var(--text-muted)] mb-2" />
                                    <span className="text-[13px] text-[var(--text-muted)]">
                                        Click to upload screenshot
                                    </span>
                                </>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileUpload}
                                disabled={uploading}
                            />
                        </label>
                    )}
                </div>
            </div>

            {/* Colors */}
            <div className="space-y-4">
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Color Scheme
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { key: "primaryColor", label: "Primary" },
                        { key: "secondaryColor", label: "Secondary" },
                        { key: "backgroundColor", label: "Background" },
                        { key: "sidebarBackground", label: "Sidebar BG" },
                        { key: "headerBackground", label: "Header BG" },
                    ].map((color) => (
                        <div key={color.key} className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-[var(--text-secondary)]">
                                {color.label}
                            </Label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={form.config[color.key] || "#FFFFFF"}
                                    onChange={(e) => updateConfig(color.key, e.target.value)}
                                    className="w-8 h-8 rounded border border-[var(--border-input)] cursor-pointer"
                                />
                                <Input
                                    value={form.config[color.key] || ""}
                                    onChange={(e) => updateConfig(color.key, e.target.value)}
                                    className="h-8 text-[12px] flex-1"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Timer & Behavior */}
            <div className="space-y-4">
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Timer & Behavior
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold">Timer Position</Label>
                        <Select
                            value={form.config.timerPosition}
                            onValueChange={(v) => updateConfig("timerPosition", v)}
                        >
                            <SelectTrigger className="h-9 text-[13px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="header-right">Header Right</SelectItem>
                                <SelectItem value="header-center">Header Center</SelectItem>
                                <SelectItem value="floating">Floating</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold">Timer Format</Label>
                        <Select
                            value={form.config.timerFormat}
                            onValueChange={(v) => updateConfig("timerFormat", v)}
                        >
                            <SelectTrigger className="h-9 text-[13px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="countdown">Countdown</SelectItem>
                                <SelectItem value="countup">Count Up</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold">Warning (mins)</Label>
                        <Input
                            type="number"
                            value={form.config.submitWarningMinutes}
                            onChange={(e) =>
                                updateConfig("submitWarningMinutes", parseInt(e.target.value) || 5)
                            }
                            className="h-9 text-[13px]"
                        />
                    </div>
                </div>
            </div>

            {/* Display Options */}
            <div className="space-y-4">
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Display Options
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                        { key: "showQuestionMarks", label: "Show Marks" },
                        { key: "showNegativeMarks", label: "Show Negative Marks" },
                        { key: "showSectionTabs", label: "Section Tabs" },
                        { key: "showQuestionTypeBadge", label: "Question Type Badge" },
                        { key: "showLegend", label: "Palette Legend" },
                        { key: "enableAutoSubmit", label: "Auto Submit Warning" },
                    ].map((opt) => (
                        <div key={opt.key} className="flex items-center gap-2">
                            <Switch
                                checked={form.config[opt.key]}
                                onCheckedChange={(v) => updateConfig(opt.key, v)}
                            />
                            <Label className="text-[12px] font-medium cursor-pointer">
                                {opt.label}
                            </Label>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold">Font Size</Label>
                        <Select
                            value={form.config.fontSize}
                            onValueChange={(v) => updateConfig("fontSize", v)}
                        >
                            <SelectTrigger className="h-9 text-[13px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="small">Small</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="large">Large</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold">Option Style</Label>
                        <Select
                            value={form.config.optionStyle}
                            onValueChange={(v) => updateConfig("optionStyle", v)}
                        >
                            <SelectTrigger className="h-9 text-[13px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="radio-cards">Radio Cards</SelectItem>
                                <SelectItem value="boxed">Boxed</SelectItem>
                                <SelectItem value="minimal">Minimal</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Palette Colors */}
            <div className="space-y-4">
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Palette Color Scheme
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(form.config.paletteColorScheme || {}).map(
                        ([key, value]: [string, any]) => (
                            <div key={key} className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={value}
                                    onChange={(e) =>
                                        updateConfig("paletteColorScheme", {
                                            ...form.config.paletteColorScheme,
                                            [key]: e.target.value,
                                        })
                                    }
                                    className="w-7 h-7 rounded cursor-pointer border border-[var(--border-input)]"
                                />
                                <span className="text-[11px] font-medium capitalize text-[var(--text-secondary)]">
                                    {key.replace(/([A-Z])/g, " $1").trim()}
                                </span>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Custom CSS */}
            <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Custom CSS (optional)</Label>
                <Textarea
                    value={form.config.customCss || ""}
                    onChange={(e) => updateConfig("customCss", e.target.value)}
                    placeholder="/* Add custom CSS variables or overrides */"
                    className="text-[12px] font-mono min-h-[80px]"
                />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--divider)]">
                <Button
                    variant="outline"
                    onClick={onCancel}
                    className="h-9 text-[13px] border-[var(--border-input)]"
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="h-9 text-[13px] bg-[#FF6B2B] hover:bg-[#FF6B2B]/90 text-white"
                >
                    {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    ) : (
                        <Save className="w-4 h-4 mr-1.5" />
                    )}
                    {theme?.id ? "Update Theme" : "Create Theme"}
                </Button>
            </div>
        </div>
    );
}
