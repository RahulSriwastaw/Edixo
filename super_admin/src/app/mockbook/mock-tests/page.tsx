"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Search, Plus, MoreHorizontal, Edit, Trash2, Play, Eye,
    Clock, Users, FileText, BarChart3, ChevronRight,
    Radio, CheckCircle, XCircle, Loader2, Filter,
    ArrowUpRight, AlertCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { mockbookService, MockTest, ExamSeries, ExamSubCategory } from "@/services/mockbookService";
import { toast } from "sonner";
import { useOrg } from "@/providers/OrgProvider";

function StatusBadge({ status }: { status: string }) {
    const cfg: Record<string, { label: string; cls: string; icon: any }> = {
        LIVE: { label: "Live", cls: "bg-green-50 text-green-700 border-green-200", icon: Radio },
        DRAFT: { label: "Draft", cls: "bg-gray-50 text-gray-600 border-gray-200", icon: Edit },
        ENDED: { label: "Ended", cls: "bg-red-50 text-red-600 border-red-200", icon: XCircle },
    };
    const { label, cls, icon: Icon } = cfg[status] || cfg.DRAFT;
    return (
        <Badge variant="outline" className={cn("text-[10px] flex items-center gap-1", cls)}>
            <Icon className="w-2.5 h-2.5" /> {label}
        </Badge>
    );
}

export default function MockTestsPage() {
    const { isOpen } = useSidebarStore();
    const router = useRouter();
    const { selectedOrgId } = useOrg();
    const [tests, setTests] = useState<MockTest[]>([]);
    const [series, setSeries] = useState<ExamSeries[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [seriesFilter, setSeriesFilter] = useState("all");

    // Create Modal
    const [showCreate, setShowCreate] = useState(false);
    const [saving, setSaving] = useState(false);
    const [subCategories, setSubCategories] = useState<ExamSubCategory[]>([]);
    const [form, setForm] = useState({
        name: "", description: "", durationMins: 60, totalMarks: 100,
        subCategoryId: "", isPublic: false, shuffleQuestions: false,
        scheduledAt: "", endsAt: "", maxAttempts: 1,
    });

    // Status change
    const [statusChanging, setStatusChanging] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<MockTest | null>(null);

    const loadData = async () => {
        if (!selectedOrgId) return;
        try {
            setIsLoading(true);
            const [testsData, seriesData] = await Promise.all([
                mockbookService.getAdminTests({ orgId: selectedOrgId || undefined }),
                mockbookService.getSeries(undefined, selectedOrgId || undefined),
            ]);
            console.log('MockTestsPage: Loaded tests:', testsData.length, 'for org:', selectedOrgId);
            setTests(testsData);
            setSeries(seriesData);

        } catch (err) {
            toast.error("Failed to load tests");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [selectedOrgId]);

    // When series filter changes, load subcategories
    useEffect(() => {
        if (seriesFilter !== "all") {
            mockbookService.getSubCategories(seriesFilter).then(setSubCategories).catch(() => {});
        } else {
            setSubCategories([]);
        }
    }, [seriesFilter]);

    const filtered = tests.filter(t => {
        const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.testId.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "all" || t.status === statusFilter;
        
        let matchSeries = false;
        if (seriesFilter === "all") {
            matchSeries = true;
        } else if (seriesFilter === "none") {
            matchSeries = !t.subCategoryId;
        } else {
            matchSeries = t.subCategory?.category?.id === seriesFilter;
        }
        
        return matchSearch && matchStatus && matchSeries;
    });


    const handleCreateSubCats = async (categoryId: string) => {
        try {
            const subs = await mockbookService.getSubCategories(categoryId);
            setSubCategories(subs);
        } catch {}
    };

    const handleCreate = async () => {
        if (!form.name || !form.durationMins) return toast.error("Name and duration are required");
        setSaving(true);
        try {
            await mockbookService.createMockTest({
                orgId: selectedOrgId || "demo-org",
                name: form.name,
                description: form.description || undefined,
                durationMins: Number(form.durationMins),
                totalMarks: Number(form.totalMarks),
                subCategoryId: form.subCategoryId || null,
                isPublic: form.isPublic,
                shuffleQuestions: form.shuffleQuestions,
                scheduledAt: form.scheduledAt || null,
                endsAt: form.endsAt || null,
                maxAttempts: Number(form.maxAttempts),
            });
            toast.success("Mock test created successfully");
            setShowCreate(false);
            setForm({ name: "", description: "", durationMins: 60, totalMarks: 100,
                subCategoryId: "", isPublic: false, shuffleQuestions: false, scheduledAt: "", endsAt: "", maxAttempts: 1 });
            loadData();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to create test");
        } finally {
            setSaving(false);
        }
    };

    const handleChangeStatus = async (test: MockTest, status: "DRAFT" | "LIVE" | "ENDED") => {
        setStatusChanging(test.id);
        try {
            await mockbookService.changeMockTestStatus(test.id, status);
            toast.success(`Test status changed to ${status}`);
            loadData();
        } catch {
            toast.error("Failed to change status");
        } finally {
            setStatusChanging(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        try {
            await mockbookService.deleteMockTest(deleteConfirm.id);
            toast.success("Test deleted");
            setDeleteConfirm(null);
            loadData();
        } catch {
            toast.error("Failed to delete test");
        }
    };

    const stats = [
        { label: "Total Tests", value: tests.length },
        { label: "Live Now", value: tests.filter(t => t.status === "LIVE").length },
        { label: "Draft", value: tests.filter(t => t.status === "DRAFT").length },
        { label: "Ended", value: tests.filter(t => t.status === "ENDED").length },
    ];

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
                            <span className="text-gray-900 font-medium">Mock Tests</span>
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Mock Tests</h1>
                                <p className="text-gray-500 text-sm mt-1">
                                    Manage all mock tests — create, publish, schedule, and monitor
                                </p>
                            </div>
                            <Button className="btn-primary" onClick={() => setShowCreate(true)}>
                                <Plus className="w-4 h-4 mr-2" /> Create Test
                            </Button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {stats.map(stat => (
                                <Card key={stat.label} className="kpi-card">
                                    <CardContent className="p-4">
                                        <div className="text-xs text-gray-500 uppercase">{stat.label}</div>
                                        <div className="text-xl font-bold text-gray-900 mt-0.5">{stat.value}</div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Filters */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="relative flex-1 min-w-[200px] max-w-[320px]">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input placeholder="Search tests..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 input-field" />
                                    </div>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[140px] input-field">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="DRAFT">Draft</SelectItem>
                                            <SelectItem value="LIVE">Live</SelectItem>
                                            <SelectItem value="ENDED">Ended</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={seriesFilter} onValueChange={setSeriesFilter}>
                                        <SelectTrigger className="w-[180px] input-field">
                                            <SelectValue placeholder="Series" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Series</SelectItem>
                                            <SelectItem value="none">No Series / Independent</SelectItem>
                                            {series.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>

                                    {(search || statusFilter !== "all" || seriesFilter !== "all") && (
                                        <Button variant="ghost" onClick={() => { setSearch(""); setStatusFilter("all"); setSeriesFilter("all"); }}>
                                            Clear
                                        </Button>
                                    )}
                                    <span className="ml-auto text-sm text-gray-500">{filtered.length} results</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Table */}
                        <Card>
                            <CardContent className="p-0">
                                {isLoading ? (
                                    <div className="p-16 text-center flex flex-col items-center gap-3 text-gray-400">
                                        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                                        <p className="text-sm">Loading tests...</p>
                                    </div>
                                ) : filtered.length === 0 ? (
                                    <div className="p-16 text-center space-y-3">
                                        <FileText className="w-14 h-14 text-gray-200 mx-auto" />
                                        <p className="text-gray-500 font-medium">No tests found</p>
                                        <Button className="btn-primary" onClick={() => setShowCreate(true)}>
                                            <Plus className="w-4 h-4 mr-2" /> Create First Test
                                        </Button>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50">
                                                <TableHead className="text-xs font-semibold text-gray-500 uppercase">Test Name</TableHead>
                                                <TableHead className="text-xs font-semibold text-gray-500 uppercase">Series/Folder</TableHead>
                                                <TableHead className="text-xs font-semibold text-gray-500 uppercase">Duration</TableHead>
                                                <TableHead className="text-xs font-semibold text-gray-500 uppercase">Marks</TableHead>
                                                <TableHead className="text-xs font-semibold text-gray-500 uppercase">Attempts</TableHead>
                                                <TableHead className="text-xs font-semibold text-gray-500 uppercase">Status</TableHead>
                                                <TableHead className="text-xs font-semibold text-gray-500 uppercase">Scheduled</TableHead>
                                                <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filtered.map(test => (
                                                <TableRow key={test.id} className="hover:bg-orange-50/30">
                                                    <TableCell>
                                                        <div className="font-medium text-sm text-gray-900 max-w-[260px] truncate">{test.name}</div>
                                                        <div className="text-[10px] text-gray-400 font-mono">{test.testId}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-xs text-gray-700">{test.subCategory?.category?.name || "—"}</div>
                                                        <div className="text-[10px] text-gray-400">{test.subCategory?.name || ""}</div>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-gray-600">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> {test.durationMins}m
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-gray-600">{test.totalMarks}</TableCell>
                                                    <TableCell className="text-sm text-gray-700 font-medium">
                                                        {test._count?.attempts || 0}
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge status={test.status} />
                                                    </TableCell>
                                                    <TableCell className="text-xs text-gray-500">
                                                        {test.scheduledAt
                                                            ? new Date(test.scheduledAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                                                            : "—"}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            {statusChanging === test.id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                                                            ) : (
                                                                <>
                                                                    {test.status === "DRAFT" && (
                                                                        <Button variant="outline" size="sm" className="h-7 text-xs text-green-600 border-green-200 hover:bg-green-50"
                                                                            onClick={() => handleChangeStatus(test, "LIVE")}>
                                                                            <Play className="w-3 h-3 mr-1" /> Go Live
                                                                        </Button>
                                                                    )}
                                                                    {test.status === "LIVE" && (
                                                                        <Button variant="outline" size="sm" className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                                                                            onClick={() => handleChangeStatus(test, "ENDED")}>
                                                                            <XCircle className="w-3 h-3 mr-1" /> End Test
                                                                        </Button>
                                                                    )}
                                                                    {test.status === "ENDED" && (
                                                                        <Button variant="outline" size="sm" className="h-7 text-xs text-gray-500"
                                                                            onClick={() => handleChangeStatus(test, "DRAFT")}>
                                                                            Reopen
                                                                        </Button>
                                                                    )}
                                                                </>
                                                            )}
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                                                        <MoreHorizontal className="w-4 h-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem asChild>
                                                                        <Link href={`/mockbook/mock-tests/${test.id}`}>
                                                                            <Eye className="w-4 h-4 mr-2" /> View / Manage
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem asChild>
                                                                        <Link href={`/mockbook/mock-tests/${test.id}/leaderboard`}>
                                                                            <BarChart3 className="w-4 h-4 mr-2" /> Leaderboard
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem className="text-red-600" onClick={() => setDeleteConfirm(test)}>
                                                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>

            {/* Create Test Dialog */}
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Create New Mock Test</DialogTitle>
                        <DialogDescription>Fill in the details to create a new mock test. You can publish it once created.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label>Test Name *</Label>
                            <Input placeholder="e.g. SSC CGL Full Mock #1" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Description</Label>
                            <Textarea placeholder="Optional description..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Duration (minutes) *</Label>
                                <Input type="number" min={1} value={form.durationMins} onChange={e => setForm(f => ({ ...f, durationMins: Number(e.target.value) }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Total Marks</Label>
                                <Input type="number" min={0} value={form.totalMarks} onChange={e => setForm(f => ({ ...f, totalMarks: Number(e.target.value) }))} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Series (optional)</Label>
                            <Select value={form.subCategoryId ? "selected" : "none"} onValueChange={val => {
                                if (val !== "none") handleCreateSubCats(val);
                                setForm(f => ({ ...f, subCategoryId: "" }));
                            }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a series..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No series</SelectItem>
                                    {series.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        {subCategories.length > 0 && (
                            <div className="space-y-1.5">
                                <Label>Sub-Category / Folder</Label>
                                <Select value={form.subCategoryId} onValueChange={v => setForm(f => ({ ...f, subCategoryId: v }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select folder..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subCategories.map(sc => <SelectItem key={sc.id} value={sc.id}>{sc.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Scheduled At</Label>
                                <Input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Ends At</Label>
                                <Input type="datetime-local" value={form.endsAt} onChange={e => setForm(f => ({ ...f, endsAt: e.target.value }))} />
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <Switch checked={form.isPublic} onCheckedChange={v => setForm(f => ({ ...f, isPublic: v }))} />
                                Public Test
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <Switch checked={form.shuffleQuestions} onCheckedChange={v => setForm(f => ({ ...f, shuffleQuestions: v }))} />
                                Shuffle Questions
                            </label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                        <Button className="btn-primary" onClick={handleCreate} disabled={saving}>
                            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Create Test
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm Dialog */}
            <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="w-5 h-5" /> Delete Test
                        </DialogTitle>
                        <DialogDescription>Are you sure you want to delete this test? This action is permanent.</DialogDescription>
                    </DialogHeader>
                    <p className="text-sm text-gray-600">
                        Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? All attempts and answers will also be permanently deleted.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete Permanently</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
