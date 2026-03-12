"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Search, Plus, MoreHorizontal, Edit, Trash2, Eye, Copy,
    BookOpen, Users, FileText, Star, Globe, BarChart3,
    IndianRupee, ChevronRight, AlertCircle, Loader2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { mockbookService, ExamSeries, ExamFolder } from "@/services/mockbookService";
import { toast } from "sonner";

function StatusBadge({ status }: { status: string }) {
    const cfg: Record<string, { label: string; cls: string }> = {
        active: { label: "Active", cls: "bg-green-50 text-green-700 border-green-200" },
        draft: { label: "Draft", cls: "bg-gray-50 text-gray-600 border-gray-200" },
        archived: { label: "Archived", cls: "bg-red-50 text-red-600 border-red-200" },
    };
    const { label, cls } = cfg[status] || cfg.draft;
    return <Badge variant="outline" className={cn("text-[10px]", cls)}>{label}</Badge>;
}

type EditForm = {
    name: string; description: string; price: string; isFree: boolean; isFeatured: boolean; isActive: boolean;
};

export default function TestSeriesPage() {
    const { isOpen } = useSidebarStore();
    const [isLoading, setIsLoading] = useState(true);
    const [allSeries, setAllSeries] = useState<ExamSeries[]>([]);
    const [categories, setCategories] = useState<ExamFolder[]>([]);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    // Create dialog
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createForm, setCreateForm] = useState<EditForm & { folderId: string }>({
        name: "", description: "", price: "0", isFree: true, isFeatured: false, isActive: true, folderId: "",
    });

    // Edit dialog
    const [editTarget, setEditTarget] = useState<ExamSeries | null>(null);
    const [editForm, setEditForm] = useState<EditForm>({ name: "", description: "", price: "0", isFree: true, isFeatured: false, isActive: true });
    const [saving, setSaving] = useState(false);

    // Delete dialog
    const [deleteConfirm, setDeleteConfirm] = useState<ExamSeries | null>(null);
    const [deleting, setDeleting] = useState(false);

    const loadData = async () => {
        try {
            const [seriesData, foldersData] = await Promise.all([
                mockbookService.getSeries(),
                mockbookService.getFolders()
            ]);
            setAllSeries(seriesData);
            setCategories(foldersData);
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const filtered = allSeries.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
        const matchCat = categoryFilter === "all" || s.folderId === categoryFilter;
        const status = s.isActive ? "active" : "draft";
        const matchStatus = statusFilter === "all" || status === statusFilter;
        return matchSearch && matchCat && matchStatus;
    });

    // Open edit dialog pre-filled
    const openEdit = (s: ExamSeries) => {
        setEditTarget(s);
        setEditForm({
            name: s.name,
            description: s.description || "",
            price: String(s.price || 0),
            isFree: s.isFree,
            isFeatured: s.isFeatured,
            isActive: s.isActive,
        });
    };

    const handleUpdate = async () => {
        if (!editTarget) return;
        setSaving(true);
        try {
            await mockbookService.updateSeries(editTarget.id, {
                name: editForm.name,
                description: editForm.description,
                price: Number(editForm.price),
                isFree: editForm.isFree,
                isFeatured: editForm.isFeatured,
                isActive: editForm.isActive,
            });
            toast.success("Series updated");
            setEditTarget(null);
            loadData();
        } catch {
            toast.error("Failed to update series");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleFeatured = async (s: ExamSeries) => {
        try {
            await mockbookService.updateSeries(s.id, { isFeatured: !s.isFeatured });
            toast.success(s.isFeatured ? "Removed from featured" : "Added to featured");
            loadData();
        } catch {
            toast.error("Failed to update featured status");
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        setDeleting(true);
        try {
            await mockbookService.deleteSeries(deleteConfirm.id);
            toast.success("Series deleted");
            setDeleteConfirm(null);
            loadData();
        } catch {
            toast.error("Failed to delete series");
        } finally {
            setDeleting(false);
        }
    };

    const handleCreate = async () => {
        if (!createForm.name) return toast.error("Name is required");
        setCreating(true);
        try {
            await mockbookService.createSeries({
                name: createForm.name,
                description: createForm.description,
                folderId: createForm.folderId,
                price: Number(createForm.price),
                isFree: createForm.isFree,
                isFeatured: createForm.isFeatured,
                isActive: createForm.isActive,
            });
            toast.success("Series created");
            setShowCreate(false);
            setCreateForm({ name: "", description: "", price: "0", isFree: true, isFeatured: false, isActive: true, folderId: "" });
            loadData();
        } catch {
            toast.error("Failed to create series");
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-bg">
            <Sidebar />
            <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
                <TopBar />
                <main className="flex-1 p-6">
                    <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Link href="/mockbook" className="hover:text-orange-600">MockBook</Link>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-gray-900 font-medium">Test Series</span>
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Test Series</h1>
                                <p className="text-gray-500 text-sm mt-1">{allSeries.length} series on platform</p>
                            </div>
                            <Button className="btn-primary" onClick={() => setShowCreate(true)}>
                                <Plus className="w-4 h-4 mr-2" /> Create New Series
                            </Button>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: "Total Series", value: allSeries.length },
                                { label: "Active", value: allSeries.filter(s => s.isActive).length },
                                { label: "Featured", value: allSeries.filter(s => s.isFeatured).length },
                                { label: "Free", value: allSeries.filter(s => s.isFree).length },
                            ].map(stat => (
                                <Card key={stat.label} className="kpi-card">
                                    <CardContent className="p-4">
                                        <div className="text-xs text-gray-500 uppercase">{stat.label}</div>
                                        <div className="text-xl font-bold text-gray-900 mt-0.5">{stat.value}</div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Filter Bar */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="relative flex-1 min-w-[200px] max-w-[320px]">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input placeholder="Search series..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 input-field" />
                                    </div>
                                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                        <SelectTrigger className="w-[150px] input-field">
                                            <SelectValue placeholder="Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[130px] input-field">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="draft">Draft</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {(search || categoryFilter !== "all" || statusFilter !== "all") && (
                                        <Button variant="ghost" onClick={() => { setSearch(""); setCategoryFilter("all"); setStatusFilter("all"); }}>
                                            Clear
                                        </Button>
                                    )}
                                    <span className="ml-auto text-sm text-gray-500">{filtered.length} results</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Series List */}
                        <div className="space-y-3">
                            {isLoading ? (
                                <div className="p-16 text-center flex flex-col items-center gap-3">
                                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                                    <p className="text-sm text-gray-400">Loading series...</p>
                                </div>
                            ) : filtered.map((series) => (
                                <Card key={series.id} className="hover:shadow-md transition-all">
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-4 flex-1 min-w-0">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center shrink-0">
                                                    <BookOpen className="w-6 h-6 text-orange-600" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                        <span className="font-semibold text-gray-900">{series.name}</span>
                                                        <StatusBadge status={series.isActive ? "active" : "draft"} />
                                                        {series.isFeatured && (
                                                            <Badge className="bg-yellow-50 text-yellow-700 border border-yellow-200 text-[10px]">
                                                                <Star className="w-2.5 h-2.5 mr-1" />Featured
                                                            </Badge>
                                                        )}
                                                        <Badge variant="outline" className="text-[10px]">
                                                            {categories.find(c => c.id === series.folderId)?.name || 'Misc'}
                                                        </Badge>
                                                    </div>
                                                    {series.description && (
                                                        <p className="text-xs text-gray-500 mb-1 truncate max-w-lg">{series.description}</p>
                                                    )}
                                                    <div className="flex items-center gap-5 text-sm text-gray-500 flex-wrap">
                                                        <span className="text-green-600">
                                                            {series.isFree ? "Free" : `₹${series.discountPrice || series.price}`}
                                                        </span>
                                                        <span className="text-gray-400 text-xs">
                                                            Created {series.createdAt ? new Date(series.createdAt).toLocaleDateString() : 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/mockbook/test-series/${series.id}`}>
                                                        <Eye className="w-3.5 h-3.5 mr-1" /> Manage
                                                    </Link>
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/mockbook/test-series/${series.id}`}>
                                                                <Eye className="w-4 h-4 mr-2" /> View & Manage
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => openEdit(series)}>
                                                            <Edit className="w-4 h-4 mr-2" /> Edit Series
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleToggleFeatured(series)}>
                                                            <Star className="w-4 h-4 mr-2" />
                                                            {series.isFeatured ? "Remove from Featured" : "Set as Featured"}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600" onClick={() => setDeleteConfirm(series)}>
                                                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {filtered.length === 0 && !isLoading && (
                                <Card>
                                    <CardContent className="p-16 text-center">
                                        <BookOpen className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                                        <div className="text-lg font-medium text-gray-500">No series found</div>
                                        <Button className="btn-primary mt-4" onClick={() => setShowCreate(true)}>
                                            <Plus className="w-4 h-4 mr-2" /> Create Series
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Create Series Dialog */}
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Create New Test Series</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label>Series Name *</Label>
                            <Input placeholder="e.g. SSC CGL Mock Test Series 2026" value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Description</Label>
                            <Textarea placeholder="Description..." value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} rows={2} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Exam Folder *</Label>
                            <Select value={createForm.folderId} onValueChange={v => setCreateForm(f => ({ ...f, folderId: v }))}>
                                <SelectTrigger><SelectValue placeholder="Select folder..." /></SelectTrigger>
                                <SelectContent>
                                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Price (₹)</Label>
                                <Input type="number" min={0} value={createForm.price} onChange={e => setCreateForm(f => ({ ...f, price: e.target.value }))} disabled={createForm.isFree} />
                            </div>
                            <div className="flex flex-col justify-end gap-3">
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <Switch checked={createForm.isFree} onCheckedChange={v => setCreateForm(f => ({ ...f, isFree: v }))} />
                                    Free Series
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <Switch checked={createForm.isFeatured} onCheckedChange={v => setCreateForm(f => ({ ...f, isFeatured: v }))} />
                                    Featured
                                </label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                        <Button className="btn-primary" onClick={handleCreate} disabled={creating}>
                            {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Create Series
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Series Dialog */}
            <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Edit Series — {editTarget?.name}</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label>Series Name</Label>
                            <Input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Description</Label>
                            <Textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={2} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Price (₹)</Label>
                                <Input type="number" min={0} value={editForm.price} onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))} disabled={editForm.isFree} />
                            </div>
                            <div className="flex flex-col justify-end gap-3">
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <Switch checked={editForm.isFree} onCheckedChange={v => setEditForm(f => ({ ...f, isFree: v }))} />
                                    Free Series
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <Switch checked={editForm.isFeatured} onCheckedChange={v => setEditForm(f => ({ ...f, isFeatured: v }))} />
                                    Featured
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <Switch checked={editForm.isActive} onCheckedChange={v => setEditForm(f => ({ ...f, isActive: v }))} />
                                    Active
                                </label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
                        <Button className="btn-primary" onClick={handleUpdate} disabled={saving}>
                            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm Dialog */}
            <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="w-5 h-5" /> Delete Series
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-600">
                        Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? This will remove the series and all its subcategories from the platform.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                            {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
