"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    Layout,
    Plus,
    Pencil,
    Trash2,
    Check,
    ImageIcon,
    Loader2,
    Monitor,
    Tablet,
    Smartphone,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeFormModal } from "./ThemeFormModal";

interface ExamInterfaceTheme {
    id: string;
    name: string;
    description: string | null;
    layoutVariant: string;
    config: Record<string, any>;
    screenshotUrl: string | null;
    isDefault: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

const layoutLabels: Record<string, string> = {
    ssc: "SSC / Banking",
    railway: "Railway RRB",
    upsc: "UPSC / State PCS",
    jee: "JEE / NEET",
    default: "Default (MockBook)",
};

const layoutColors: Record<string, string> = {
    ssc: "bg-blue-50 text-blue-700 border-blue-200",
    railway: "bg-emerald-50 text-emerald-700 border-emerald-200",
    upsc: "bg-amber-50 text-amber-700 border-amber-200",
    jee: "bg-purple-50 text-purple-700 border-purple-200",
    default: "bg-gray-50 text-gray-700 border-gray-200",
};

export default function ExamInterfaceThemesPage() {
    const { isOpen } = useSidebarStore();
    const [themes, setThemes] = useState<ExamInterfaceTheme[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTheme, setEditingTheme] = useState<ExamInterfaceTheme | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const fetchThemes = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get("/exam-interface-themes");
            setThemes(res.data || []);
        } catch (err: any) {
            toast.error(err.message || "Failed to fetch themes");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchThemes();
    }, [fetchThemes]);

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/exam-interface-themes/${deleteId}`);
            toast.success("Theme deleted successfully");
            setThemes((prev) => prev.filter((t) => t.id !== deleteId));
        } catch (err: any) {
            toast.error(err.message || "Failed to delete theme");
        } finally {
            setDeleteId(null);
        }
    };

    const handleSave = () => {
        setModalOpen(false);
        setEditingTheme(null);
        fetchThemes();
    };

    return (
        <div className={cn("min-h-screen", isOpen ? "ml-0" : "ml-0")}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-[22px] font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Layout className="w-6 h-6 text-[#FF6B2B]" />
                        Exam Interface Themes
                    </h1>
                    <p className="text-[13px] text-[var(--text-muted)] mt-1">
                        Manage test-taking interface themes for different exam patterns
                    </p>
                </div>
                <Button
                    onClick={() => {
                        setEditingTheme(null);
                        setModalOpen(true);
                    }}
                    className="bg-[#FF6B2B] hover:bg-[#FF6B2B]/90 text-white h-9 px-4 text-[13px] font-medium"
                >
                    <Plus className="w-4 h-4 mr-1.5" />
                    New Theme
                </Button>
            </div>

            {/* Themes Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="h-[280px] rounded-xl animate-pulse bg-[var(--bg-card)] border border-[var(--border-card)]"
                        />
                    ))}
                </div>
            ) : themes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-[var(--border-input)] rounded-xl bg-[var(--bg-card)]">
                    <Layout className="w-12 h-12 text-[var(--text-muted)] mb-4" />
                    <h3 className="text-[16px] font-semibold text-[var(--text-primary)] mb-1">
                        No themes yet
                    </h3>
                    <p className="text-[13px] text-[var(--text-muted)] mb-4">
                        Create your first exam interface theme to get started
                    </p>
                    <Button
                        onClick={() => {
                            setEditingTheme(null);
                            setModalOpen(true);
                        }}
                        variant="outline"
                        className="border-[var(--border-input)] text-[var(--text-secondary)]"
                    >
                        <Plus className="w-4 h-4 mr-1.5" />
                        Create Theme
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {themes.map((theme) => (
                        <div
                            key={theme.id}
                            className="group rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] overflow-hidden hover:shadow-lg transition-all duration-200"
                        >
                            {/* Screenshot / Preview */}
                            <div className="h-40 bg-[var(--bg-main)] relative overflow-hidden">
                                {theme.screenshotUrl ? (
                                    <img
                                        src={theme.screenshotUrl}
                                        alt={theme.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="flex gap-4 text-[var(--text-muted)]">
                                            <Monitor className="w-8 h-8" />
                                            <Tablet className="w-6 h-6" />
                                            <Smartphone className="w-5 h-5" />
                                        </div>
                                    </div>
                                )}
                                {/* Overlay actions */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="bg-white text-black hover:bg-white/90 h-8 text-[12px]"
                                        onClick={() => {
                                            setEditingTheme(theme);
                                            setModalOpen(true);
                                        }}
                                    >
                                        <Pencil className="w-3.5 h-3.5 mr-1" />
                                        Edit
                                    </Button>
                                    {!theme.isDefault && (
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            className="h-8 text-[12px]"
                                            onClick={() => setDeleteId(theme.id)}
                                        >
                                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                                            Delete
                                        </Button>
                                    )}
                                </div>
                                {/* Badges */}
                                <div className="absolute top-2 left-2 flex gap-1.5">
                                    <Badge
                                        className={cn(
                                            "text-[10px] font-semibold border",
                                            layoutColors[theme.layoutVariant] || layoutColors.default
                                        )}
                                    >
                                        {layoutLabels[theme.layoutVariant] || theme.layoutVariant}
                                    </Badge>
                                    {theme.isDefault && (
                                        <Badge className="bg-[#FF6B2B] text-white text-[10px] font-semibold border-none">
                                            <Check className="w-3 h-3 mr-0.5" />
                                            Default
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-1.5">
                                    <h3 className="text-[14px] font-semibold text-[var(--text-primary)]">
                                        {theme.name}
                                    </h3>
                                    {!theme.isActive && (
                                        <Badge
                                            variant="outline"
                                            className="text-[10px] text-[var(--text-muted)] border-[var(--border-input)]"
                                        >
                                            Inactive
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-[12px] text-[var(--text-muted)] line-clamp-2 mb-3">
                                    {theme.description || "No description"}
                                </p>
                                <div className="flex items-center gap-3 text-[11px] text-[var(--text-secondary)]">
                                    <span className="flex items-center gap-1">
                                        <ImageIcon className="w-3 h-3" />
                                        {theme.screenshotUrl ? "Screenshot" : "No screenshot"}
                                    </span>
                                    <span>•</span>
                                    <span>
                                        {new Date(theme.updatedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
                    <DialogHeader className="p-6 pb-4 border-b border-[var(--divider)]">
                        <DialogTitle className="text-[16px] font-bold text-[var(--text-primary)]">
                            {editingTheme ? "Edit Theme" : "Create New Theme"}
                        </DialogTitle>
                        <DialogDescription className="text-[13px] text-[var(--text-muted)]">
                            Configure the exam interface appearance and behavior
                        </DialogDescription>
                    </DialogHeader>
                    <ThemeFormModal
                        theme={editingTheme}
                        onSave={handleSave}
                        onCancel={() => {
                            setModalOpen(false);
                            setEditingTheme(null);
                        }}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Theme?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The theme will be permanently removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
