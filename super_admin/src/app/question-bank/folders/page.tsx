import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
"use client";

import { useState, useEffect } from "react";
import {
    FolderPlus,
    Search,
    ChevronRight,
    ChevronDown,
    Edit2,
    Trash2,
    MoreHorizontal,
    Folder,
    Save,
    X,
    Plus,
    Globe,
    Lock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface QBankFolder {
    id: string;
    name: string;
    parentId: string | null;
    path: string;
    depth: number;
    scope: "GLOBAL" | "ORG";
    questionCount: number;
    expanded?: boolean;
}

export default function FoldersPage() {
      const { isOpen } = useSidebarStore();
const [folders, setFolders] = useState<QBankFolder[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [addDialog, setAddDialog] = useState<{ parentId?: string; parentName?: string } | null>(null);
    const [editDialog, setEditDialog] = useState<QBankFolder | null>(null);
    const [newItemName, setNewItemName] = useState("");
    const [isGlobal, setIsGlobal] = useState(true);

    useEffect(() => {
        fetchFolders();
    }, []);

    const fetchFolders = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/qbank/folders`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const data = await res.json();
            if (data.success) {
                setFolders(data.data.map((f: any) => ({ ...f, expanded: false })));
            }
        } catch (err) {
            toast.error("Failed to fetch folders");
        } finally {
            setLoading(false);
        }
    };

    const toggleFolder = (id: string) => {
        setFolders(folders.map(f => f.id === id ? { ...f, expanded: !f.expanded } : f));
    };

    const handleCreateFolder = async () => {
        if (!newItemName.trim()) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/qbank/folders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    name: newItemName,
                    parentId: addDialog?.parentId,
                    scope: isGlobal ? "GLOBAL" : "ORG",
                }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Folder created successfully");
                fetchFolders();
                setAddDialog(null);
                setNewItemName("");
            } else {
                toast.error(data.message || "Failed to create folder");
            }
        } catch (err) {
            toast.error("Something went wrong");
        }
    };

    const handleUpdateFolder = async () => {
        if (!editDialog || !newItemName.trim()) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/qbank/folders/${editDialog.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    name: newItemName,
                    scope: isGlobal ? "GLOBAL" : "ORG",
                }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Folder updated successfully");
                fetchFolders();
                setEditDialog(null);
                setNewItemName("");
            } else {
                toast.error(data.message || "Failed to update folder");
            }
        } catch (err) {
            toast.error("Something went wrong");
        }
    };

    const handleDeleteFolder = async (id: string) => {
        if (!confirm("Are you sure you want to delete this folder? It must be empty.")) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/qbank/folders/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Folder deleted successfully");
                fetchFolders();
            } else {
                toast.error(data.message || "Failed to delete folder");
            }
        } catch (err) {
            toast.error("Something went wrong");
        }
    };

    const renderFolderItems = (parentId: string | null = null, currentDepth = 0) => {
        return folders
            .filter(f => f.parentId === parentId)
            .map(folder => (
                <div key={folder.id} className="w-full">
                    <div
                        className="flex items-center gap-2 py-3 px-4 hover:bg-gray-50 border-b border-gray-100 transition-colors"
                        style={{ paddingLeft: `${(currentDepth + 1) * 20}px` }}
                    >
                        <button
                            onClick={() => toggleFolder(folder.id)}
                            className="p-1 hover:bg-gray-200 rounded text-gray-400"
                        >
                            {folder.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        <Folder className={`w-5 h-5 ${folder.scope === 'GLOBAL' ? 'text-blue-500' : 'text-orange-500'}`} />
                        <span className="font-medium text-gray-900 flex-1">{folder.name}</span>
                        <div className="flex items-center gap-3">
                            <Badge className={folder.scope === 'GLOBAL' ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"}>
                                {folder.scope === 'GLOBAL' ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                                {folder.scope}
                            </Badge>
                            <span className="text-xs text-gray-500">{folder.questionCount} questions</span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setAddDialog({ parentId: folder.id, parentName: folder.name })}>
                                        <Plus className="w-4 h-4 mr-2" /> Add Sub-folder
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                        setEditDialog(folder);
                                        setNewItemName(folder.name);
                                        setIsGlobal(folder.scope === "GLOBAL");
                                    }}>
                                        <Edit2 className="w-4 h-4 mr-2" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDeleteFolder(folder.id)} className="text-red-600">
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    {folder.expanded && renderFolderItems(folder.id, currentDepth + 1)}
                </div>
            ));
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />
            <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
                <TopBar />
                <main className="flex-1 p-6">
                    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Manage Folders</h1>
                                <p className="text-gray-500 text-sm">Organize questions into hierarchical folders</p>
                            </div>
                            <Button
                                className="bg-[#F4511E] hover:bg-[#E64A19] text-white gap-2 shadow-lg"
                                onClick={() => { setAddDialog({}); setIsGlobal(true); }}
                            >
                                <FolderPlus className="w-4 h-4" /> Create Root Folder
                            </Button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="shadow-sm border-none bg-white">
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                                        <Globe className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">{folders.filter(f => f.scope === 'GLOBAL').length}</div>
                                        <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">Global Folders</div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="shadow-sm border-none bg-white">
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
                                        <Folder className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">{folders.length}</div>
                                        <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">Total Folders</div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="shadow-sm border-none bg-white">
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
                                        <Search className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">{folders.reduce((acc, f) => acc + f.questionCount, 0)}</div>
                                        <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">Questions Organized</div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Search */}
                        <Card className="shadow-sm border-none bg-white">
                            <CardContent className="p-4">
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        placeholder="Search folders..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10 h-11 border-gray-200 focus:ring-orange-500 focus:border-orange-500 rounded-lg"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Folder Tree */}
                        <Card className="shadow-sm border-none bg-white overflow-hidden">
                            <CardHeader className="border-b bg-gray-50/50">
                                <div className="flex items-center gap-2">
                                    <FolderPlus className="w-5 h-5 text-[#F4511E]" />
                                    <CardTitle className="text-lg">Folder Hierarchy</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {loading ? (
                                    <div className="p-8 text-center text-gray-500">Loading Folders...</div>
                                ) : folders.length === 0 ? (
                                    <div className="p-12 text-center space-y-3">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                                            <Folder className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">No folders yet</h3>
                                            <p className="text-gray-500">Create your first folder to start organizing questions.</p>
                                        </div>
                                        <Button
                                            className="bg-[#F4511E] hover:bg-[#E64A19] text-white"
                                            onClick={() => setAddDialog({})}
                                        >
                                            Create Root Folder
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {renderFolderItems(null)}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>

            {/* Add Dialog */}
            <Dialog open={!!addDialog} onOpenChange={() => setAddDialog(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FolderPlus className="w-5 h-5 text-[#F4511E]" />
                            {addDialog?.parentId ? "Add Sub-folder" : "Create Root Folder"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        {addDialog?.parentName && (
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center gap-2">
                                <Folder className="w-4 h-4 text-orange-400" />
                                <span className="text-sm text-gray-600">Parent: <strong>{addDialog.parentName}</strong></span>
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Folder Name</label>
                            <Input
                                placeholder="e.g. Mathematics, Physics, Previous Year..."
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                className="h-11 border-gray-200 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Visibility Scope</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsGlobal(true)}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${isGlobal
                                        ? "border-[#F4511E] bg-orange-50 shadow-sm"
                                        : "border-gray-100 hover:border-gray-200 bg-white"
                                        }`}
                                >
                                    <Globe className={`w-6 h-6 ${isGlobal ? "text-[#F4511E]" : "text-gray-400"}`} />
                                    <div className="text-center">
                                        <p className={`text-sm font-bold ${isGlobal ? "text-gray-900" : "text-gray-600"}`}>Global</p>
                                        <p className="text-[10px] text-gray-500">Visible to all Orgs</p>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsGlobal(false)}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${!isGlobal
                                        ? "border-[#F4511E] bg-orange-50 shadow-sm"
                                        : "border-gray-100 hover:border-gray-200 bg-white"
                                        }`}
                                >
                                    <Lock className={`w-6 h-6 ${!isGlobal ? "text-[#F4511E]" : "text-gray-400"}`} />
                                    <div className="text-center">
                                        <p className={`text-sm font-bold ${!isGlobal ? "text-gray-900" : "text-gray-600"}`}>Org-only</p>
                                        <p className="text-[10px] text-gray-500">Internal only</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" className="h-11 rounded-lg" onClick={() => setAddDialog(null)}>Cancel</Button>
                        <Button
                            className="bg-[#F4511E] hover:bg-[#E64A19] text-white h-11 px-8 rounded-lg shadow-md transition-all active:scale-95"
                            onClick={handleCreateFolder}
                        >
                            <Save className="w-4 h-4 mr-2" /> Save Folder
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editDialog} onOpenChange={() => setEditDialog(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit2 className="w-5 h-5 text-blue-500" />
                            Edit Folder
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Folder Name</label>
                            <Input
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                className="h-11 border-gray-200 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Visibility Scope</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsGlobal(true)}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${isGlobal
                                        ? "border-[#F4511E] bg-orange-50 shadow-sm"
                                        : "border-gray-100 hover:border-gray-200 bg-white"
                                        }`}
                                >
                                    <Globe className={`w-6 h-6 ${isGlobal ? "text-[#F4511E]" : "text-gray-400"}`} />
                                    <div className="text-center">
                                        <p className={`text-sm font-bold ${isGlobal ? "text-gray-900" : "text-gray-600"}`}>Global</p>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsGlobal(false)}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${!isGlobal
                                        ? "border-[#F4511E] bg-orange-50 shadow-sm"
                                        : "border-gray-100 hover:border-gray-200 bg-white"
                                        }`}
                                >
                                    <Lock className={`w-6 h-6 ${!isGlobal ? "text-[#F4511E]" : "text-gray-400"}`} />
                                    <div className="text-center">
                                        <p className={`text-sm font-bold ${!isGlobal ? "text-gray-900" : "text-gray-600"}`}>Org-only</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" className="h-11 rounded-lg" onClick={() => setEditDialog(null)}>Cancel</Button>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-8 rounded-lg shadow-md transition-all active:scale-95"
                            onClick={handleUpdateFolder}
                        >
                            <Save className="w-4 h-4 mr-2" /> Update Folder
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
