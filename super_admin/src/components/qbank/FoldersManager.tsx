"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback, useRef } from "react";
import {
    FolderPlus, Search, ChevronRight, ChevronDown, Edit2, Trash2,
    MoreHorizontal, Folder, FolderOpen, Save, X, Plus, Globe, Lock,
    MoveRight, BookOpen, Filter, LayoutList, CheckSquare, AlignLeft,
    ChevronLeft, RefreshCw, Info, AlertTriangle, Home, Sparkles, Upload, Copy,
    CheckCircle, Download
} from "lucide-react";
import Link from "next/link";
import Papa from "papaparse";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function getToken() {
    if (typeof document === "undefined") return "";
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
    return match ? match[1] : "";
}

async function apiFetch(path: string, opts?: RequestInit) {
    const res = await fetch(`${API_BASE}${path}`, {
        ...opts,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
            ...(opts?.headers || {}),
        },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "API Error");
    return data;
}

interface QBankFolder {
    id: string;
    name: string;
    slug?: string;
    description?: string;
    icon?: string;
    color?: string;
    parentId: string | null;
    path: string;
    depth: number;
    scope: "GLOBAL" | "ORG";
    questionCount: number;
    totalQuestionCount: number;
    sortOrder: number;
    isActive: boolean;
    children?: QBankFolder[];
}

interface Question {
    id: string;
    questionId: string;
    textEn?: string;
    textHi?: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    type: string;
    isGlobal: boolean;
    isApproved: boolean;
    folder?: { id: string; name: string } | null;
    options?: Array<{ id: string; textEn?: string; isCorrect: boolean }>;
}

const ICON_OPTIONS = ["📁", "📚", "🧮", "🔬", "⚙️", "🏛️", "🚂", "🏢", "🏦", "📖", "🎯", "📝", "💡", "🔭", "⚗️"];
const COLOR_OPTIONS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#6366f1", "#14b8a6", "#f97316", "#ec4899", "#64748b"];

const DIFFICULTY_COLORS: Record<string, string> = {
    EASY: "bg-green-100 text-green-700",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    HARD: "bg-red-100 text-red-700",
};

function stripHtml(html?: string): string {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, '').replace(/\\[()\\[\]]/g, '').trim().slice(0, 100) + '...';
}

// ─── Folder Tree Node ─────────────────────────────────────────
function FolderNode({
    folder, selectedId, onSelect, onAddChild, onEdit, onDeleteFolder, depth = 0,
}: {
    folder: QBankFolder;
    selectedId: string | null;
    onSelect: (f: QBankFolder) => void;
    onAddChild: (f: QBankFolder) => void;
    onEdit: (f: QBankFolder) => void;
    onDeleteFolder: (f: QBankFolder) => void;
    depth?: number;
}) {
    const [expanded, setExpanded] = useState(depth < 2);
    const hasChildren = folder.children && folder.children.length > 0;
    const isSelected = selectedId === folder.id;

    return (
        <div>
            <div
                className={cn(
                    "group flex items-center gap-1 py-1.5 px-2 rounded-lg cursor-pointer transition-all select-none",
                    isSelected
                        ? "bg-orange-50 border border-orange-200 text-orange-900"
                        : "hover:bg-gray-50 text-gray-700"
                )}
                style={{ paddingLeft: `${8 + depth * 16}px` }}
                onClick={() => onSelect(folder)}
            >
                {/* Expand toggle */}
                <button
                    onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                    className="p-0.5 rounded hover:bg-gray-200 text-gray-400 shrink-0"
                >
                    {hasChildren
                        ? (expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />)
                        : <span className="w-3.5 h-3.5 block" />
                    }
                </button>

                {/* Icon */}
                <span className="text-base shrink-0">
                    {folder.icon || (isSelected ? "📂" : "📁")}
                </span>

                {/* Name + count */}
                <span className="flex-1 text-sm font-medium truncate">{folder.name}</span>
                <span className="text-xs text-gray-400 shrink-0 ml-1">
                    {folder.totalQuestionCount > 0 ? folder.totalQuestionCount : ""}
                </span>

                {/* Scope badge */}
                {folder.scope === "GLOBAL"
                    ? <Globe className="w-3 h-3 text-blue-400 shrink-0" />
                    : <Lock className="w-3 h-3 text-orange-400 shrink-0" />
                }

                {/* Actions */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <button className="p-0.5 opacity-0 group-hover:opacity-100 rounded hover:bg-gray-200 transition-opacity">
                            <MoreHorizontal className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAddChild(folder); }}>
                            <Plus className="w-4 h-4 mr-2" /> Add Sub-folder
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(folder); }}>
                            <Edit2 className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder); }}
                            className="text-red-600 focus:text-red-600"
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Children */}
            {expanded && hasChildren && (
                <div>
                    {folder.children!.map(child => (
                        <FolderNode
                            key={child.id}
                            folder={child}
                            selectedId={selectedId}
                            onSelect={onSelect}
                            onAddChild={onAddChild}
                            onEdit={onEdit}
                            onDeleteFolder={onDeleteFolder}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Create/Edit Modal ────────────────────────────────────────
function FolderModal({
    mode,
    initial,
    parentFolder,
    onSave,
    onClose,
}: {
    mode: "create" | "edit";
    initial?: Partial<QBankFolder>;
    parentFolder?: QBankFolder | null;
    onSave: (data: any) => Promise<void>;
    onClose: () => void;
}) {
    const [name, setName] = useState(initial?.name || "");
    const [description, setDescription] = useState(initial?.description || "");
    const [icon, setIcon] = useState(initial?.icon || "📁");
    const [color, setColor] = useState(initial?.color || "#3b82f6");
    const [isGlobal, setIsGlobal] = useState(initial?.scope === "GLOBAL" || (mode === "create" && !parentFolder?.scope));
    const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) { toast.error("Folder name is required"); return; }
        setSaving(true);
        try {
            await onSave({ name: name.trim(), description, icon, color, sortOrder, isGlobal });
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setSaving(false);
        }
    };

    const parentDepth = parentFolder ? parentFolder.depth + 1 : 0;

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[480px]" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FolderPlus className="w-5 h-5 text-orange-500" />
                        {mode === "create" ? (parentFolder ? `Add Sub-folder to "${parentFolder.name}"` : "Create Root Folder") : `Edit "${initial?.name}"`}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-3">
                    {parentFolder && mode === "create" && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-lg border border-orange-100 text-sm text-gray-600">
                            <Folder className="w-4 h-4 text-orange-400" />
                            <span>Parent: <strong>{parentFolder.name}</strong></span>
                            <Badge variant="outline" className="text-xs ml-1">Depth: {parentDepth}</Badge>
                        </div>
                    )}

                    {/* Name */}
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Folder Name *</label>
                        <Input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Quantitative Aptitude, 2024..."
                            className="h-10"
                            autoFocus
                            onKeyDown={e => e.key === "Enter" && handleSave()}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Description <span className="text-gray-400 font-normal">(optional)</span></label>
                        <Input
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Brief description..."
                            className="h-10"
                        />
                    </div>

                    {/* Icon + Color */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Icon</label>
                            <div className="flex flex-wrap gap-1.5 p-2 border rounded-lg bg-gray-50">
                                {ICON_OPTIONS.map(i => (
                                    <button key={i} onClick={() => setIcon(i)}
                                        className={cn("text-lg w-8 h-8 rounded flex items-center justify-center transition-all",
                                            icon === i ? "bg-orange-100 ring-2 ring-orange-400" : "hover:bg-gray-200")}
                                    >{i}</button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Color</label>
                            <div className="flex flex-wrap gap-1.5 p-2 border rounded-lg bg-gray-50">
                                {COLOR_OPTIONS.map(c => (
                                    <button key={c} onClick={() => setColor(c)}
                                        style={{ backgroundColor: c }}
                                        className={cn("w-7 h-7 rounded-full transition-all",
                                            color === c ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : "hover:scale-105")}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sort Order */}
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Sort Order <span className="text-gray-400 font-normal">(lower = first)</span></label>
                        <Input
                            type="number"
                            value={sortOrder}
                            onChange={e => setSortOrder(Number(e.target.value))}
                            className="h-10 w-32"
                        />
                    </div>

                    {/* Scope */}
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Visibility</label>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { v: true, icon: <Globe className="w-5 h-5" />, label: "Global", desc: "Visible to all orgs" },
                                { v: false, icon: <Lock className="w-5 h-5" />, label: "Org-only", desc: "Internal only" },
                            ].map(({ v, icon: ic, label, desc }) => (
                                <button key={String(v)} onClick={() => setIsGlobal(v)}
                                    className={cn("flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all text-left",
                                        isGlobal === v ? "border-orange-400 bg-orange-50" : "border-gray-100 hover:border-gray-200")}
                                >
                                    <span className={isGlobal === v ? "text-orange-500" : "text-gray-400"}>{ic}</span>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{label}</p>
                                        <p className="text-xs text-gray-500">{desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Preview */}
                <div className="px-3 py-2 bg-gray-50 rounded-lg border text-sm text-gray-500">
                    <span className="text-base mr-1">{icon}</span>
                    <span className="font-medium text-gray-800">{name || "Folder Name"}</span>
                    {parentFolder && <span className="ml-2 text-gray-400">under {parentFolder.name}</span>}
                    <span className="ml-2" style={{ color }}>{isGlobal ? "🌐 Global" : "🔒 Org"}</span>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? "Saving..." : mode === "create" ? "Create Folder" : "Update Folder"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Delete Modal ─────────────────────────────────────────────
function DeleteModal({
    folder,
    onConfirm,
    onClose,
}: {
    folder: QBankFolder;
    onConfirm: (force: boolean) => Promise<void>;
    onClose: () => void;
}) {
    const [mode, setMode] = useState<"safe" | "force">("safe");
    const [confirmed, setConfirmed] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm(mode === "force");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-5 h-5" /> Delete Folder
                    </DialogTitle>
                    <DialogDescription>
                        Delete <strong>{folder.name}</strong> and choose what happens to its contents.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                    {[
                        {
                            v: "safe" as const,
                            label: "Safe Delete (Recommended)",
                            desc: "Move questions and sub-folders to the parent folder. Nothing is permanently lost.",
                            icon: <MoveRight className="w-4 h-4 text-blue-500" />,
                        },
                        {
                            v: "force" as const,
                            label: "Force Delete",
                            desc: "Permanently delete this folder AND all its questions and sub-folders. This cannot be undone.",
                            icon: <Trash2 className="w-4 h-4 text-red-500" />,
                        },
                    ].map(({ v, label, desc, icon }) => (
                        <button key={v} onClick={() => setMode(v)}
                            className={cn("w-full text-left flex items-start gap-3 p-3 rounded-xl border-2 transition-all",
                                mode === v ? (v === "force" ? "border-red-400 bg-red-50" : "border-blue-400 bg-blue-50") : "border-gray-100 hover:border-gray-200")}
                        >
                            <span className="mt-0.5">{icon}</span>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">{label}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                            </div>
                        </button>
                    ))}

                    {mode === "force" && (
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-red-600">
                            <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="rounded" />
                            I understand this will permanently delete all contents.
                        </label>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={loading || (mode === "force" && !confirmed)}
                        className={mode === "force" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"}
                    >
                        {loading ? "Deleting..." : mode === "force" ? "Delete Everything" : "Safe Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Folder Picker (nested search) ───────────────────────────
function FolderPicker({ tree, onSelect, currentFolderId }: {
    tree: QBankFolder[];
    onSelect: (folder: QBankFolder) => void;
    currentFolderId?: string | null;
}) {
    const [search, setSearch] = useState("");

    function flattenTree(folders: QBankFolder[], depth = 0): Array<QBankFolder & { flatDepth: number }> {
        return folders.flatMap(f => [
            { ...f, flatDepth: depth },
            ...flattenTree(f.children || [], depth + 1),
        ]);
    }

    const flat = flattenTree(tree).filter(f =>
        !search || f.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="border rounded-xl overflow-hidden bg-white shadow-md">
            <div className="p-2 border-b">
                <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search folders..."
                        className="w-full pl-8 pr-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400"
                        autoFocus
                    />
                </div>
            </div>
            <div className="max-h-64 overflow-y-auto">
                {flat.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-400">No folders found</div>
                ) : flat.map(f => (
                    <button
                        key={f.id}
                        onClick={() => onSelect(f)}
                        disabled={f.id === currentFolderId}
                        className={cn(
                            "w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-orange-50 transition-colors text-left",
                            f.id === currentFolderId && "opacity-40 cursor-not-allowed"
                        )}
                        style={{ paddingLeft: `${12 + f.flatDepth * 14}px` }}
                    >
                        <span>{f.icon || "📁"}</span>
                        <span className="flex-1 truncate text-gray-800">{f.name}</span>
                        {f.scope === "GLOBAL" ? <Globe className="w-3 h-3 text-blue-400" /> : <Lock className="w-3 h-3 text-orange-400" />}
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────
export function FoldersManager() {

    // State
    const [tree, setTree] = useState<QBankFolder[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<QBankFolder | null>(null);
    const [breadcrumb, setBreadcrumb] = useState<Array<{ id: string; name: string }>>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [questionTotal, setQuestionTotal] = useState(0);
    const [questionPage, setQuestionPage] = useState(1);
    const [questionSearch, setQuestionSearch] = useState("");
    const [diffFilter, setDiffFilter] = useState("all");
    const [includeSubfolders, setIncludeSubfolders] = useState(true);
    const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());

    const [loadingFolders, setLoadingFolders] = useState(true);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [folderSearch, setFolderSearch] = useState("");

    // Modals
    const [createModal, setCreateModal] = useState<{ parentFolder?: QBankFolder | null } | null>(null);
    const [editModal, setEditModal] = useState<QBankFolder | null>(null);
    const [deleteModal, setDeleteModal] = useState<QBankFolder | null>(null);
    const [bulkMoveOpen, setBulkMoveOpen] = useState(false);
    const [bulkCopyOpen, setBulkCopyOpen] = useState(false);

    // Import CSV State
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [importRows, setImportRows] = useState<any[]>([]);
    const [importPreview, setImportPreview] = useState<any[] | null>(null);
    const [importLoading, setImportLoading] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);

    const QUESTIONS_PER_PAGE = 15;

    // Fetch folders tree
    const fetchFolders = useCallback(async () => {
        setLoadingFolders(true);
        try {
            const data = await apiFetch("/qbank/folders?includeGlobal=true&tree=true");
            setTree(data.data || []);
        } catch (e: any) {
            toast.error("Failed to load folders");
        } finally {
            setLoadingFolders(false);
        }
    }, []);

    // Fetch questions for selected folder
    const fetchQuestions = useCallback(async () => {
        if (!selectedFolder) { setQuestions([]); setQuestionTotal(0); return; }
        setLoadingQuestions(true);
        setSelectedQuestions(new Set());
        try {
            const params = new URLSearchParams({
                folderId: selectedFolder.id,
                includeSubfolders: String(includeSubfolders),
                page: String(questionPage),
                limit: String(QUESTIONS_PER_PAGE),
            });
            if (questionSearch) params.set("search", questionSearch);
            if (diffFilter !== "all") params.set("difficulty", diffFilter);
            const data = await apiFetch(`/qbank/questions?${params}`);
            setQuestions(data.data.questions || []);
            setQuestionTotal(data.data.total || 0);
        } catch (e: any) {
            toast.error("Failed to load questions");
        } finally {
            setLoadingQuestions(false);
        }
    }, [selectedFolder, includeSubfolders, questionPage, questionSearch, diffFilter]);

    // Fetch breadcrumb
    const fetchBreadcrumb = useCallback(async (folderId: string) => {
        try {
            const data = await apiFetch(`/qbank/folders/${folderId}/breadcrumb`);
            setBreadcrumb(data.data || []);
        } catch { setBreadcrumb([]); }
    }, []);

    useEffect(() => { fetchFolders(); }, [fetchFolders]);
    useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

    const handleSelectFolder = (folder: QBankFolder) => {
        setSelectedFolder(folder);
        setQuestionPage(1);
        setQuestionSearch("");
        setDiffFilter("all");
        fetchBreadcrumb(folder.id);
    };

    // Create folder
    const handleCreate = async (data: any) => {
        await apiFetch("/qbank/folders", {
            method: "POST",
            body: JSON.stringify({
                name: data.name,
                description: data.description,
                icon: data.icon,
                color: data.color,
                sortOrder: data.sortOrder,
                parentId: createModal?.parentFolder?.id,
                scope: data.isGlobal ? "GLOBAL" : "ORG",
            }),
        });
        toast.success("Folder created!");
        setCreateModal(null);
        fetchFolders();
    };

    // Edit folder
    const handleEdit = async (data: any) => {
        await apiFetch(`/qbank/folders/${editModal!.id}`, {
            method: "PATCH",
            body: JSON.stringify({
                name: data.name,
                description: data.description,
                icon: data.icon,
                color: data.color,
                sortOrder: data.sortOrder,
                scope: data.isGlobal ? "GLOBAL" : "ORG",
            }),
        });
        toast.success("Folder updated!");
        setEditModal(null);
        fetchFolders();
    };

    // Delete folder
    const handleDelete = async (force: boolean) => {
        const params = force ? "?deleteQuestions=true&confirm=true" : "?deleteQuestions=false";
        await apiFetch(`/qbank/folders/${deleteModal!.id}${params}`, { method: "DELETE" });
        toast.success("Folder deleted!");
        if (selectedFolder?.id === deleteModal!.id) {
            setSelectedFolder(null);
            setBreadcrumb([]);
        }
        setDeleteModal(null);
        fetchFolders();
    };

    // Bulk move questions
    const handleBulkMove = async (targetFolder: QBankFolder) => {
        const ids = Array.from(selectedQuestions);
        if (ids.length === 0) return;
        await apiFetch("/qbank/questions/bulk-move-to-folder", {
            method: "POST",
            body: JSON.stringify({ questionIds: ids, targetFolderId: targetFolder.id }),
        });
        toast.success(`${ids.length} question(s) moved to ${targetFolder.name}`);
        setBulkMoveOpen(false);
        setSelectedQuestions(new Set());
        fetchQuestions();
        fetchFolders();
    };

    // Bulk copy questions
    const handleBulkCopy = async (targetFolder: QBankFolder) => {
        const ids = Array.from(selectedQuestions);
        if (ids.length === 0) return;
        await apiFetch("/qbank/questions/bulk-copy-to-folder", {
            method: "POST",
            body: JSON.stringify({ questionIds: ids, targetFolderId: targetFolder.id }),
        });
        toast.success(`${ids.length} question(s) copied to ${targetFolder.name}`);
        setBulkCopyOpen(false);
        setSelectedQuestions(new Set());
        fetchQuestions();
        fetchFolders();
    };

    // Bulk delete questions
    const handleBulkDelete = async () => {
        const ids = Array.from(selectedQuestions);
        if (ids.length === 0) return;
        if (!confirm(`Are you sure you want to delete ${ids.length} questions? This action cannot be undone.`)) return;

        try {
            await apiFetch("/qbank/questions", {
                method: "DELETE",
                body: JSON.stringify({ ids }),
            });
            toast.success(`${ids.length} question(s) deleted successfully.`);
            setSelectedQuestions(new Set());
            fetchQuestions();
            fetchFolders();
        } catch (e) {
            toast.error("Failed to delete questions.");
        }
    };

    // CSV Import Handlers
    const downloadTemplate = () => {
        const template = `question_eng,question_hin,type,subject,chapter,difficulty,option1_eng,option1_hin,option2_eng,option2_hin,option3_eng,option3_hin,option4_eng,option4_hin,answer,solution_eng,solution_hin
"Which law states F = ma?","न्यूटन का कौन सा नियम F = ma बताता है?",mcq,Physics,Laws of Motion,easy,"First Law","प्रथम नियम","Second Law","द्वितीय नियम","Third Law","तृतीय नियम","Law of Gravitation","गुरुत्वाकर्षण नियम",B,"Newton's second law states F = ma","न्यूटन का द्वितीय नियम F = ma है"`;

        const blob = new Blob([template], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'questions_template.csv';
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Template downloaded');
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            toast.error("Please upload a CSV file");
            return;
        }

        setImportFile(file);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const rows = results.data;
                if (rows.length === 0) {
                    toast.error("CSV file is empty");
                    setImportFile(null);
                    return;
                }
                setImportRows(rows);
                setImportPreview(rows.slice(0, 5));
            },
            error: (error: any) => {
                toast.error("Failed to parse CSV: " + error.message);
                setImportFile(null);
            }
        });
    };

    const handleImport = async () => {
        if (!importFile || importRows.length === 0) return;

        setImportLoading(true);
        try {
            await apiFetch(`/qbank/bulk-upload`, {
                method: 'POST',
                body: JSON.stringify({
                    fileName: importFile.name,
                    rows: importRows,
                    folderId: selectedFolder?.id
                })
            });

            toast.success(`Upload started for ${importRows.length} questions`);
            setShowImportDialog(false);
            setImportFile(null);
            setImportPreview(null);
            setImportRows([]);
            fetchQuestions();
            fetchFolders();
        } catch (error) {
            toast.error("An error occurred during import");
        } finally {
            setImportLoading(false);
        }
    };
    // Stats from tree
    function countFolders(folders: QBankFolder[]): number {
        return folders.reduce((acc, f) => acc + 1 + countFolders(f.children || []), 0);
    }
    const totalFolders = countFolders(tree);
    const globalFolders = tree.filter(f => f.scope === "GLOBAL").length;

    // Filter tree by search
    function filterTree(folders: QBankFolder[], q: string): QBankFolder[] {
        if (!q) return folders;
        return folders.flatMap(f => {
            const match = f.name.toLowerCase().includes(q.toLowerCase());
            const filteredChildren = filterTree(f.children || [], q);
            if (match) return [{ ...f, children: f.children }];
            if (filteredChildren.length > 0) return [{ ...f, children: filteredChildren }];
            return [];
        });
    }
    const displayTree = filterTree(tree, folderSearch);

    const totalPages = Math.ceil(questionTotal / QUESTIONS_PER_PAGE);

    return (
        <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Q-Bank</h1>
                    <p className="text-gray-500 text-sm">Organize questions into folders</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={fetchFolders} className="gap-1">
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh
                    </Button>
                    <Button
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-600 text-white gap-1"
                        onClick={() => setCreateModal({ parentFolder: null })}
                    >
                        <FolderPlus className="w-4 h-4" /> New Folder
                    </Button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                    { label: "Total Folders", value: totalFolders, icon: <Folder className="w-5 h-5 text-orange-500" />, bg: "bg-orange-50" },
                    { label: "Global Folders", value: globalFolders, icon: <Globe className="w-5 h-5 text-blue-500" />, bg: "bg-blue-50" },
                    { label: "Selected Folder Questions", value: selectedFolder ? selectedFolder.totalQuestionCount : "—", icon: <BookOpen className="w-5 h-5 text-purple-500" />, bg: "bg-purple-50" },
                ].map((s, i) => (
                    <Card key={i} className="border-none shadow-sm">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", s.bg)}>{s.icon}</div>
                            <div>
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.label}</div>
                                <div className="text-xl font-bold text-gray-900">{typeof s.value === "number" ? s.value.toLocaleString() : s.value}</div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Split Panel */}
            <div className="flex gap-4 h-[calc(100vh-260px)] min-h-[500px]">
                {/* LEFT: Folder Tree */}
                <div className="w-72 shrink-0 flex flex-col bg-white rounded-xl border shadow-sm overflow-hidden">
                    {/* Search */}
                    <div className="p-3 border-b">
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Search folders..."
                                value={folderSearch}
                                onChange={e => setFolderSearch(e.target.value)}
                                className="pl-8 h-8 text-sm"
                            />
                        </div>
                    </div>

                    {/* Tree */}
                    <div className="flex-1 overflow-y-auto p-2">
                        {loadingFolders ? (
                            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">Loading folders...</div>
                        ) : displayTree.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm gap-2">
                                <Folder className="w-8 h-8 text-gray-200" />
                                {folderSearch ? "No folders match search" : "No folders yet"}
                            </div>
                        ) : (
                            displayTree.map(f => (
                                <FolderNode
                                    key={f.id}
                                    folder={f}
                                    selectedId={selectedFolder?.id || null}
                                    onSelect={handleSelectFolder}
                                    onAddChild={pf => setCreateModal({ parentFolder: pf })}
                                    onEdit={setEditModal}
                                    onDeleteFolder={setDeleteModal}
                                />
                            ))
                        )}
                    </div>

                    {/* Bottom action */}
                    <div className="p-3 border-t">
                        <button
                            onClick={() => setCreateModal({ parentFolder: null })}
                            className="w-full flex items-center gap-2 text-sm text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg px-3 py-2 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Add Root Folder
                        </button>
                    </div>
                </div>

                {/* RIGHT: Questions Panel */}
                <div className="flex-1 flex flex-col bg-white rounded-xl border shadow-sm overflow-hidden">
                    {selectedFolder ? (
                        <>
                            {/* Breadcrumb */}
                            <div className="px-4 py-3 border-b bg-gray-50/50 flex items-center gap-1 text-sm overflow-x-auto min-w-0">
                                <button
                                    onClick={() => { setSelectedFolder(null); setBreadcrumb([]); }}
                                    className="text-gray-400 hover:text-gray-600 shrink-0"
                                >
                                    <Home className="w-3.5 h-3.5" />
                                </button>
                                {breadcrumb.map((b, i) => (
                                    <span key={b.id} className="flex items-center gap-1 shrink-0">
                                        <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                                        <span className={cn(
                                            "font-medium",
                                            i === breadcrumb.length - 1 ? "text-orange-600" : "text-gray-600"
                                        )}>{b.name}</span>
                                    </span>
                                ))}
                            </div>

                            {/* Toolbar */}
                            <div className="px-4 py-3 border-b flex items-center gap-2 flex-wrap">
                                <div className="relative flex-1 min-w-[160px]">
                                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        placeholder="Search questions..."
                                        value={questionSearch}
                                        onChange={e => { setQuestionSearch(e.target.value); setQuestionPage(1); }}
                                        className="pl-8 h-8 text-sm"
                                    />
                                </div>

                                {/* Difficulty filter */}
                                <select
                                    value={diffFilter}
                                    onChange={e => { setDiffFilter(e.target.value); setQuestionPage(1); }}
                                    className="h-8 text-sm border rounded-lg px-2 bg-white focus:outline-none"
                                >
                                    <option value="all">All Levels</option>
                                    <option value="EASY">Easy</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HARD">Hard</option>
                                </select>

                                {/* Subfolders toggle */}
                                <button
                                    onClick={() => { setIncludeSubfolders(!includeSubfolders); setQuestionPage(1); }}
                                    className={cn(
                                        "flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm border transition-all",
                                        includeSubfolders ? "bg-orange-50 border-orange-200 text-orange-700" : "bg-white text-gray-600"
                                    )}
                                >
                                    <LayoutList className="w-3.5 h-3.5" />
                                    {includeSubfolders ? "Incl. sub-folders" : "Direct only"}
                                </button>

                                {/* Bulk actions */}
                                {selectedQuestions.size > 0 && (
                                    <>
                                        <Button
                                            size="sm"
                                            className="h-8 bg-blue-500 hover:bg-blue-600 text-white gap-1"
                                            onClick={() => setBulkMoveOpen(true)}
                                        >
                                            <MoveRight className="w-3.5 h-3.5" />
                                            Move {selectedQuestions.size}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 gap-1"
                                            onClick={() => setBulkCopyOpen(true)}
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                            Copy {selectedQuestions.size}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 gap-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                            onClick={handleBulkDelete}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Delete {selectedQuestions.size}
                                        </Button>
                                    </>
                                )}

                                <div className="flex items-center gap-2 ml-auto">
                                    <span className="text-xs text-gray-400 mr-2">
                                        {questionTotal} question{questionTotal !== 1 ? "s" : ""}
                                    </span>
                                    {selectedFolder && (
                                        <>
                                            <Link href={`/question-bank/ai-generate?folderId=${selectedFolder.id}`}>
                                                <Button size="sm" variant="outline" className="h-8 gap-1">
                                                    <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                                                    AI Generate
                                                </Button>
                                            </Link>
                                            <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => setShowImportDialog(true)}>
                                                <Upload className="w-3.5 h-3.5" />
                                                Import CSV
                                            </Button>
                                            <Link href={`/question-bank/create?folderId=${selectedFolder.id}`}>
                                                <Button size="sm" className="h-8 bg-orange-500 hover:bg-orange-600 text-white gap-1">
                                                    <Plus className="w-3.5 h-3.5" />
                                                    Create
                                                </Button>
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Question List */}
                            <div className="flex-1 overflow-y-auto">
                                {loadingQuestions ? (
                                    <div className="flex items-center justify-center h-32 text-gray-400 text-sm">Loading questions...</div>
                                ) : questions.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm gap-2">
                                        <BookOpen className="w-8 h-8 text-gray-200" />
                                        No questions in this folder
                                    </div>
                                ) : (
                                    <>
                                        {/* Select all */}
                                        <div className="px-4 py-2 border-b bg-gray-50/50 flex items-center gap-2 text-xs text-gray-500">
                                            <input
                                                type="checkbox"
                                                className="rounded"
                                                checked={selectedQuestions.size === questions.length && questions.length > 0}
                                                onChange={e => {
                                                    if (e.target.checked) setSelectedQuestions(new Set(questions.map(q => q.id)));
                                                    else setSelectedQuestions(new Set());
                                                }}
                                            />
                                            <span>Select all on page</span>
                                        </div>

                                        {questions.map(q => (
                                            <div
                                                key={q.id}
                                                className={cn(
                                                    "flex items-start gap-3 px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors",
                                                    selectedQuestions.has(q.id) && "bg-blue-50/50"
                                                )}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="rounded mt-1 shrink-0"
                                                    checked={selectedQuestions.has(q.id)}
                                                    onChange={e => {
                                                        const next = new Set(selectedQuestions);
                                                        if (e.target.checked) next.add(q.id);
                                                        else next.delete(q.id);
                                                        setSelectedQuestions(next);
                                                    }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-gray-800 line-clamp-2">
                                                        {stripHtml(q.textEn) || stripHtml(q.textHi) || <span className="italic text-gray-400">No text</span>}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-gray-400">{q.questionId}</span>
                                                        <Badge className={cn("text-xs px-1.5 py-0", DIFFICULTY_COLORS[q.difficulty])}>
                                                            {q.difficulty}
                                                        </Badge>
                                                        <span className="text-xs text-gray-400">{q.type.replace("_", " ")}</span>
                                                        {q.isGlobal && <Globe className="w-3 h-3 text-blue-400" />}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="px-4 py-2 border-t flex items-center justify-between text-sm">
                                    <Button
                                        variant="ghost" size="sm"
                                        disabled={questionPage === 1}
                                        onClick={() => setQuestionPage(p => p - 1)}
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                                    </Button>
                                    <span className="text-gray-500">Page {questionPage} of {totalPages}</span>
                                    <Button
                                        variant="ghost" size="sm"
                                        disabled={questionPage === totalPages}
                                        onClick={() => setQuestionPage(p => p + 1)}
                                    >
                                        Next <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        // Empty state
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
                            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center">
                                <FolderOpen className="w-10 h-10 text-orange-300" />
                            </div>
                            <div className="text-center">
                                <p className="font-semibold text-gray-600">Select a folder</p>
                                <p className="text-sm">Click any folder in the left panel to view its questions</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Modals ─── */}
            {createModal && (
                <FolderModal
                    mode="create"
                    parentFolder={createModal!.parentFolder}
                    onSave={handleCreate}
                    onClose={() => setCreateModal(null)}
                />
            )}

            {editModal && (
                <FolderModal
                    mode="edit"
                    initial={editModal!}
                    onSave={handleEdit}
                    onClose={() => setEditModal(null)}
                />
            )}

            {deleteModal && (
                <DeleteModal
                    folder={deleteModal!}
                    onConfirm={handleDelete}
                    onClose={() => setDeleteModal(null)}
                />
            )}

            {/* Bulk Move Modal */}
            {bulkMoveOpen && (
                <Dialog open onOpenChange={() => setBulkMoveOpen(false)}>
                    <DialogContent className="sm:max-w-[400px]" aria-describedby={undefined}>
                        <DialogHeader>
                            <DialogTitle>Move {selectedQuestions.size} Question{selectedQuestions.size > 1 ? "s" : ""} to Folder</DialogTitle>
                        </DialogHeader>
                        <FolderPicker
                            tree={tree}
                            onSelect={handleBulkMove}
                            currentFolderId={selectedFolder?.id}
                        />
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setBulkMoveOpen(false)}>Cancel</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Bulk Copy Modal */}
            {bulkCopyOpen && (
                <Dialog open onOpenChange={() => setBulkCopyOpen(false)}>
                    <DialogContent className="sm:max-w-[400px]" aria-describedby={undefined}>
                        <DialogHeader>
                            <DialogTitle>Copy {selectedQuestions.size} Question{selectedQuestions.size > 1 ? "s" : ""} to Folder</DialogTitle>
                        </DialogHeader>
                        <FolderPicker
                            tree={tree}
                            onSelect={handleBulkCopy}
                            currentFolderId={selectedFolder?.id}
                        />
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setBulkCopyOpen(false)}>Cancel</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Import CSV Modal */}
            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                            <Upload className="w-5 h-5 text-[#F4511E]" />
                            Import Questions from CSV in "{selectedFolder?.name}"
                        </DialogTitle>
                        <DialogDescription className="text-sm">
                            Upload a CSV file with bilingual questions (Hindi & English) to the current folder.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2 sm:py-4">
                        {/* Download Template */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div>
                                <p className="font-medium text-blue-900 text-sm sm:text-base">Need a template?</p>
                                <p className="text-xs sm:text-sm text-blue-700">Download the sample CSV format to get started</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={downloadTemplate} className="w-full sm:w-auto">
                                <Download className="w-4 h-4 mr-2" />
                                Download Template
                            </Button>
                        </div>

                        {/* File Upload Area */}
                        {!importFile ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 text-center hover:border-[#F4511E] transition-colors relative">
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileSelect}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <Upload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-3 sm:mb-4" />
                                <p className="font-medium text-gray-900 mb-1 text-sm sm:text-base">Click to upload CSV file</p>
                                <p className="text-xs sm:text-sm text-gray-500">or drag and drop</p>
                                <p className="text-xs text-gray-400 mt-2">.CSV files only</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-start sm:items-center justify-between gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-green-900 text-sm truncate">{importFile.name}</p>
                                            <p className="text-xs text-green-700">{(importFile.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setImportFile(null);
                                            setImportPreview(null);
                                        }}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Preview Table */}
                                {/* Preview Table */}
                                {importPreview && importPreview.length > 0 && (
                                    <div>
                                        <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                            Preview (first {importPreview.length} rows)
                                        </p>
                                        <div className="overflow-x-auto border rounded-lg">
                                            <table className="w-full text-xs sm:text-sm">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        {Object.keys(importPreview[0]).slice(0, 6).map((key) => (
                                                            <th key={key} className="p-2 text-left font-medium text-gray-500 border-b whitespace-nowrap">
                                                                {key.replace(/_/g, ' ')}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 bg-white">
                                                    {importPreview.map((row, i) => (
                                                        <tr key={i}>
                                                            {Object.keys(row).slice(0, 6).map((key) => (
                                                                <td key={key} className="p-2 text-gray-600 truncate max-w-[150px]">
                                                                    {row[key]}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={() => setShowImportDialog(false)}>Cancel</Button>
                        <Button
                            onClick={handleImport}
                            disabled={!importFile || importLoading}
                            className="bg-[#F4511E] hover:bg-[#E64A19] text-white"
                        >
                            {importLoading ? "Uploading..." : "Import Questions"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
