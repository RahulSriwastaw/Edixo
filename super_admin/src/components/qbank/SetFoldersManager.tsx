"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import {
    FolderPlus, Search, ChevronRight, ChevronDown, Edit2, Trash2,
    MoreHorizontal, Folder, FolderOpen, Save, Plus, Globe, Lock,
    MoveRight, BookOpen, Filter, LayoutList, CheckSquare, AlignLeft,
    ChevronLeft, RefreshCw, Info, AlertTriangle, Home, Sparkles, Upload, Copy,
    CheckCircle, Download, Layers, Eye
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    setCount?: number;
    totalSetCount?: number;
    sortOrder: number;
    isActive: boolean;
    children?: QBankFolder[];
}

interface QuestionSet {
    id: string;
    setId: string;
    name: string;
    pin: string;
    subject?: string;
    totalQuestions: number;
    durationMins?: number;
    createdAt: string;
    isGlobal?: boolean;
    folder?: { id: string; name: string } | null;
    _count?: { items: number };
}

const ICON_OPTIONS = ["📁", "📚", "🧮", "🔬", "⚙️", "🏛️", "🚂", "🏢", "🏦", "📖", "🎯", "📝", "💡", "🔭", "⚗️"];
const COLOR_OPTIONS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#6366f1", "#14b8a6", "#f97316", "#ec4899", "#64748b"];

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
                    {folder.totalSetCount && folder.totalSetCount > 0 ? folder.totalSetCount : ""}
                </span>

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
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Folder Name *</label>
                        <Input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. SSC CGL 2025, General Studies..."
                            className="h-10"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Description</label>
                        <Input
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Brief description..."
                            className="h-10"
                        />
                    </div>

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

// ─── Folder Picker ─────────────────────────────────────────────
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

// ─── Main Component ───────────────────────────────────────────
export function SetFoldersManager() {
    const router = useRouter();
    const [tree, setTree] = useState<QBankFolder[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<QBankFolder | null>(null);
    const [breadcrumb, setBreadcrumb] = useState<Array<{ id: string; name: string }>>([]);
    const [sets, setSets] = useState<QuestionSet[]>([]);
    const [setTotal, setSetTotal] = useState(0);
    const [setPage, setSetPage] = useState(1);
    const [setSearch, setSetSearch] = useState("");
    const [includeSubfolders, setIncludeSubfolders] = useState(true);
    const [selectedSets, setSelectedSets] = useState<Set<string>>(new Set());

    const [loadingFolders, setLoadingFolders] = useState(true);
    const [loadingSets, setLoadingSets] = useState(false);
    const [folderSearch, setFolderSearch] = useState("");

    const [createModal, setCreateModal] = useState<{ parentFolder?: QBankFolder | null } | null>(null);
    const [editModal, setEditModal] = useState<QBankFolder | null>(null);
    const [deleteModal, setDeleteModal] = useState<QBankFolder | null>(null);
    const [bulkMoveOpen, setBulkMoveOpen] = useState(false);

    const SETS_PER_PAGE = 15;

    const fetchFolders = useCallback(async () => {
        setLoadingFolders(true);
        try {
            const data = await apiFetch("/qbank/folders?includeGlobal=true&tree=true");
            setTree(data.data || []);
        } catch (e: any) { toast.error(e.message || "Failed to load folders"); }
        finally { setLoadingFolders(false); }
    }, []);

    const fetchSets = useCallback(async () => {
        if (!selectedFolder) { setSets([]); setSetTotal(0); return; }
        setLoadingSets(true);
        setSelectedSets(new Set());
        try {
            const params = new URLSearchParams({
                folderId: selectedFolder.id,
                includeSubfolders: String(includeSubfolders),
                page: String(setPage),
                limit: String(SETS_PER_PAGE),
            });
            if (setSearch) params.set("search", setSearch);
            const data = await apiFetch(`/qbank/sets?${params}`);
            setSets(data.data.sets || []);
            setSetTotal(data.data.total || 0);
        } catch (e: any) { toast.error(e.message || "Failed to load sets"); }
        finally { setLoadingSets(false); }
    }, [selectedFolder, includeSubfolders, setPage, setSearch]);

    const fetchBreadcrumb = useCallback(async (folderId: string) => {
        try {
            const data = await apiFetch(`/qbank/folders/${folderId}/breadcrumb`);
            setBreadcrumb(data.data || []);
        } catch { setBreadcrumb([]); }
    }, []);

    useEffect(() => { fetchFolders(); }, [fetchFolders]);
    useEffect(() => { fetchSets(); }, [fetchSets]);

    const handleSelectFolder = (folder: QBankFolder) => {
        setSelectedFolder(folder);
        setSetPage(1);
        setSetSearch("");
        fetchBreadcrumb(folder.id);
    };

    const handleCreateFolder = async (data: any) => {
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

    const handleEditFolder = async (data: any) => {
        await apiFetch(`/qbank/folders/${editModal!.id}`, {
            method: "PATCH",
            body: JSON.stringify({ ...data, scope: data.isGlobal ? "GLOBAL" : "ORG" }),
        });
        toast.success("Folder updated!");
        setEditModal(null);
        fetchFolders();
    };

    const handleDeleteFolder = async (force: boolean) => {
        const params = `?confirm=true&deleteContent=${force}`;
        await apiFetch(`/qbank/folders/${deleteModal!.id}${params}`, { method: "DELETE" });
        toast.success("Folder deleted!");
        if (selectedFolder?.id === deleteModal!.id) {
            setSelectedFolder(null);
            setBreadcrumb([]);
        }
        setDeleteModal(null);
        fetchFolders();
    };

    const handleBulkMove = async (targetFolder: QBankFolder) => {
        const ids = Array.from(selectedSets);
        if (ids.length === 0) return;
        await apiFetch("/qbank/sets/bulk-move", {
            method: "POST",
            body: JSON.stringify({ setIds: ids, targetFolderId: targetFolder.id }),
        });
        toast.success(`${ids.length} set(s) moved to ${targetFolder.name}`);
        setBulkMoveOpen(false);
        setSelectedSets(new Set());
        fetchSets();
        fetchFolders();
    };

    const totalFolders = tree.length; // Simplified
    const totalPages = Math.ceil(setTotal / SETS_PER_PAGE);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Folder Wise Sets</h1>
                    <p className="text-gray-500 text-xs">Organize your question sets into folders</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={fetchFolders} className="h-8 gap-1">
                        <RefreshCw className="w-3 h-3" /> Refresh
                    </Button>
                    <Button size="sm" className="h-8 bg-orange-500 hover:bg-orange-600 text-white gap-1" onClick={() => setCreateModal({ parentFolder: null })}>
                        <FolderPlus className="w-4 h-4" /> New Folder
                    </Button>
                </div>
            </div>

            <div className="flex gap-4 h-[calc(100vh-280px)]">
                {/* LEFT: Tree */}
                <div className="w-64 shrink-0 bg-white rounded-xl border flex flex-col overflow-hidden">
                    <div className="p-2 border-b">
                        <div className="relative">
                            <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Search..."
                                value={folderSearch}
                                onChange={e => setFolderSearch(e.target.value)}
                                className="h-7 pl-6 text-xs"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        {loadingFolders ? <div className="p-4 text-xs text-center text-gray-400">Loading...</div> : (
                            displayTree(tree, folderSearch).map(f => (
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
                </div>

                {/* RIGHT: List */}
                <div className="flex-1 bg-white rounded-xl border flex flex-col overflow-hidden">
                    {selectedFolder ? (
                        <>
                            <div className="px-4 py-2 border-b bg-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-1 text-xs">
                                    <Home className="w-3 h-3 text-gray-400 cursor-pointer" onClick={() => setSelectedFolder(null)} />
                                    {breadcrumb.map(b => (
                                        <div key={b.id} className="flex items-center gap-1">
                                            <ChevronRight className="w-3 h-3 text-gray-300" />
                                            <span className="font-medium text-gray-600">{b.name}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="text-xs text-gray-400">{setTotal} sets found</div>
                            </div>

                            <div className="p-3 border-b flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        placeholder="Search sets..."
                                        value={setSearch}
                                        onChange={e => { setSetSearch(e.target.value); setSetPage(1); }}
                                        className="h-8 pl-8 text-sm"
                                    />
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className={cn("h-8 gap-1 text-xs", includeSubfolders && "bg-orange-50 border-orange-200 text-orange-700")}
                                    onClick={() => setIncludeSubfolders(!includeSubfolders)}
                                >
                                    <LayoutList className="w-3 h-3" /> Subfolders
                                </Button>

                                {selectedSets.size > 0 && (
                                    <Button size="sm" className="h-8 bg-blue-500 hover:bg-blue-600 text-white gap-1 text-xs" onClick={() => setBulkMoveOpen(true)}>
                                        <MoveRight className="w-3 h-3" /> Move {selectedSets.size}
                                    </Button>
                                )}

                                <div className="flex items-center gap-1">
                                    <Link href={`/question-bank/ai-generate?folderId=${selectedFolder.id}`}>
                                        <Button size="sm" variant="outline" className="h-8 text-xs gap-1 border-purple-200 text-purple-700 hover:bg-purple-50">
                                            <Sparkles className="w-3.5 h-3.5" /> AI Generate
                                        </Button>
                                    </Link>
                                    <Link href={`/question-bank/questions?folderId=${selectedFolder.id}&import=true`}>
                                        <Button size="sm" variant="outline" className="h-8 text-xs gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                                            <Upload className="w-3.5 h-3.5" /> Import CSV
                                        </Button>
                                    </Link>
                                    <Link href={`/question-bank/sets/create?folderId=${selectedFolder.id}`}>
                                        <Button size="sm" className="h-8 bg-[#F4511E] hover:bg-[#E64A19] text-white gap-1 text-xs">
                                            <Plus className="w-3 h-3" /> Create Set
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                {loadingSets ? <div className="p-10 text-center text-gray-400">Loading sets...</div> : sets.length === 0 ? (
                                    <div className="p-10 text-center text-gray-400">No sets in this folder</div>
                                ) : (
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 border-b sticky top-0 z-10">
                                            <tr>
                                                <th className="w-10 p-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSets.size === sets.length && sets.length > 0}
                                                        onChange={e => {
                                                            if (e.target.checked) setSelectedSets(new Set(sets.map(s => s.id)));
                                                            else setSelectedSets(new Set());
                                                        }}
                                                    />
                                                </th>
                                                <th className="text-left p-3 font-medium text-gray-500">Set Name</th>
                                                <th className="text-left p-3 font-medium text-gray-500">Code</th>
                                                <th className="text-center p-3 font-medium text-gray-500">Questions</th>
                                                <th className="text-right p-3 font-medium text-gray-500">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sets.map(s => (
                                                <tr key={s.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/question-bank/sets/${s.id}`)}>
                                                    <td className="p-3 text-center" onClick={e => e.stopPropagation()}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedSets.has(s.id)}
                                                            onChange={e => {
                                                                const next = new Set(selectedSets);
                                                                if (e.target.checked) next.add(s.id);
                                                                else next.delete(s.id);
                                                                setSelectedSets(next);
                                                            }}
                                                        />
                                                    </td>
                                                    <td className="p-3 font-medium">{s.name}</td>
                                                    <td className="p-3"><code className="text-xs bg-gray-100 px-1 rounded">{s.setId}</code></td>
                                                    <td className="p-3 text-center">
                                                        <Badge variant="secondary">{s._count?.items || s.totalQuestions || 0}</Badge>
                                                    </td>
                                                    <td className="p-3 text-right" onClick={e => e.stopPropagation()}>
                                                        <div className="flex justify-end gap-1">
                                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => router.push(`/question-bank/sets/${s.id}`)}>
                                                                <Eye className="w-3.5 h-3.5" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => router.push(`/question-bank/sets/${s.id}/edit`)}>
                                                                <Edit2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            {totalPages > 1 && (
                                <div className="p-2 border-t flex justify-between items-center text-xs bg-gray-50">
                                    <Button variant="ghost" size="sm" className="h-7" disabled={setPage === 1} onClick={() => setSetPage(p => p - 1)}>
                                        <ChevronLeft className="w-3 h-3 mr-1" /> Prev
                                    </Button>
                                    <span>Page {setPage} of {totalPages}</span>
                                    <Button variant="ghost" size="sm" className="h-7" disabled={setPage === totalPages} onClick={() => setSetPage(p => p + 1)}>
                                        Next <ChevronRight className="w-3 h-3 ml-1" />
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
                            <FolderOpen className="w-12 h-12 text-gray-100" />
                            <p className="text-sm font-medium">Select a folder to view sets</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {createModal && (
                <FolderModal
                    mode="create"
                    parentFolder={createModal.parentFolder}
                    onSave={handleCreateFolder}
                    onClose={() => setCreateModal(null)}
                />
            )}
            {editModal && (
                <FolderModal
                    mode="edit"
                    initial={editModal}
                    onSave={handleEditFolder}
                    onClose={() => setEditModal(null)}
                />
            )}
            {deleteModal && (
                <DeleteModal
                    folder={deleteModal}
                    onConfirm={handleDeleteFolder}
                    onClose={() => setDeleteModal(null)}
                />
            )}
            {bulkMoveOpen && (
                <Dialog open onOpenChange={() => setBulkMoveOpen(false)}>
                    <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                            <DialogTitle>Move {selectedSets.size} Sets to Folder</DialogTitle>
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
        </div>
    );
}

// Helpers
function displayTree(folders: QBankFolder[], q: string): QBankFolder[] {
    if (!q) return folders;
    return folders.flatMap(f => {
        const match = f.name.toLowerCase().includes(q.toLowerCase());
        const filteredChildren = displayTree(f.children || [], q);
        if (match) return [{ ...f, children: f.children }];
        if (filteredChildren.length > 0) return [{ ...f, children: filteredChildren }];
        return [];
    });
}

function DeleteModal({ folder, onConfirm, onClose }: any) {
    const [loading, setLoading] = useState(false);
    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px]" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle className="text-red-600 flex items-center gap-2 text-xl">
                        <AlertTriangle className="w-6 h-6" /> Delete Folder
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 text-base">
                        Are you sure you want to delete folder <strong>{folder.name}</strong>?
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-sm text-amber-800 space-y-3 shadow-sm">
                        <div className="flex gap-2">
                            <Info className="w-5 h-5 shrink-0" />
                            <p className="font-medium">You need to choose what happens to the content (Sets & Questions) inside this folder:</p>
                        </div>

                        <div className="grid gap-2 pt-2">
                            <button
                                onClick={() => { setLoading(true); onConfirm(true).finally(() => setLoading(false)); }}
                                disabled={loading}
                                className="flex items-center gap-3 p-3 bg-white border border-red-200 text-red-700 rounded-lg hover:bg-red-50 hover:border-red-400 transition-all text-left group disabled:opacity-50"
                            >
                                <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <div>
                                    <p className="font-bold text-sm uppercase tracking-tight">Bulk Delete</p>
                                    <p className="text-[11px] opacity-80">Permanently delete folder and all nested sets & questions</p>
                                </div>
                            </button>

                            <button
                                onClick={() => { setLoading(true); onConfirm(false).finally(() => setLoading(false)); }}
                                disabled={loading}
                                className="flex items-center gap-3 p-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all text-left group disabled:opacity-50"
                            >
                                <MoveRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                <div>
                                    <p className="font-bold text-sm uppercase tracking-tight">Safe Delete</p>
                                    <p className="text-[11px] opacity-80">Delete folder but move contents to the parent folder</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} className="h-10 px-6">Cancel</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
