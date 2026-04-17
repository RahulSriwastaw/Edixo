"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    ChevronRight, BookOpen, FileText, Star, Folder,
    Edit, Trash2, Plus, MoreHorizontal, Play,
    IndianRupee, BarChart3, CheckCircle2, Lock, Eye, AlertCircle,
    Loader2, Save, Users
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { mockbookService, MockTest } from "@/services/mockbookService";
import { toast } from "sonner";

function StatusBadge({ status }: { status: string }) {
    const cfg: Record<string, string> = {
        LIVE: "bg-green-50 text-green-700 border-green-200",
        DRAFT: "bg-gray-50 text-gray-600 border-gray-200",
        ENDED: "bg-red-50 text-red-600 border-red-200",
    };
    return <Badge variant="outline" className={cn("text-[10px]", cfg[status] || cfg.DRAFT)}>{status}</Badge>;
}

export default function SeriesDetailPage() {
    const { isOpen } = useSidebarStore();
    const params = useParams();
    const router = useRouter();
    const seriesId = params.seriesId as string;

    const [series, setSeries] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [subCategories, setSubCategories] = useState<any[]>([]);
    const [tests, setTests] = useState<MockTest[]>([]);

    // Edit Series
    const [showEditSeries, setShowEditSeries] = useState(false);
    const [editSaving, setEditSaving] = useState(false);
    const [editForm, setEditForm] = useState({ name: "", description: "", isFeatured: false, isActive: true });

    // Pricing
    const [pricingSaving, setPricingSaving] = useState(false);
    const [pricingForm, setPricingForm] = useState({ price: "0", discountPrice: "0", isFree: true });

    // Sub-category management
    const [showSubCatModal, setShowSubCatModal] = useState(false);
    const [editSubCat, setEditSubCat] = useState<any | null>(null);
    const [deleteSubCat, setDeleteSubCat] = useState<any | null>(null);
    const [subCatSaving, setSubCatSaving] = useState(false);
    const [subCatForm, setSubCatForm] = useState({ name: "", description: "", sortOrder: 0 });

    // Test actions
    const [deleteTest, setDeleteTest] = useState<MockTest | null>(null);

    const loadAll = async () => {
        try {
            setIsLoading(true);
            const data = await mockbookService.getSeriesDetail(seriesId);
            const s = data.data || data;
            setSeries(s);
            setSubCategories(s.subCategories || []);
            const flatTests = (s.subCategories || []).flatMap((sc: any) =>
                (sc.mockTests || []).map((t: any) => ({ ...t, subCategoryName: sc.name }))
            );
            setTests(flatTests);
            setPricingForm({ price: String(s.price || 0), discountPrice: String(s.discountPrice || 0), isFree: !!s.isFree });
            setEditForm({ name: s.name, description: s.description || "", isFeatured: s.isFeatured, isActive: s.isActive });
        } catch { toast.error("Failed to load series"); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { loadAll(); }, [seriesId]);

    const handleUpdateSeries = async () => {
        setEditSaving(true);
        try {
            await mockbookService.updateSeries(seriesId, editForm);
            toast.success("Series updated"); setShowEditSeries(false); loadAll();
        } catch { toast.error("Failed to update"); }
        finally { setEditSaving(false); }
    };

    const handleSavePricing = async () => {
        setPricingSaving(true);
        try {
            await mockbookService.updateSeries(seriesId, {
                price: Number(pricingForm.price),
                discountPrice: Number(pricingForm.discountPrice) || null,
                isFree: pricingForm.isFree,
            } as any);
            toast.success("Pricing updated"); loadAll();
        } catch { toast.error("Failed to save pricing"); }
        finally { setPricingSaving(false); }
    };

    const openAddSubCat = () => { setSubCatForm({ name: "", description: "", sortOrder: subCategories.length }); setEditSubCat(null); setShowSubCatModal(true); };
    const openEditSubCat = (sc: any) => { setEditSubCat(sc); setSubCatForm({ name: sc.name, description: sc.description || "", sortOrder: sc.sortOrder || 0 }); setShowSubCatModal(true); };

    const handleSubCatSave = async () => {
        if (!subCatForm.name) return toast.error("Name required");
        setSubCatSaving(true);
        try {
            if (editSubCat) { await mockbookService.updateSubCategory(editSubCat.id, subCatForm); toast.success("Folder updated"); }
            else { await mockbookService.createSubCategory({ categoryId: seriesId, ...subCatForm } as any); toast.success("Folder created"); }
            setShowSubCatModal(false); setEditSubCat(null); loadAll();
        } catch { toast.error("Failed to save folder"); }
        finally { setSubCatSaving(false); }
    };

    const handleDeleteSubCat = async () => {
        if (!deleteSubCat) return;
        try { await mockbookService.deleteSubCategory(deleteSubCat.id); toast.success("Folder deleted"); setDeleteSubCat(null); loadAll(); }
        catch { toast.error("Failed to delete"); }
    };

    const handleTestStatus = async (test: MockTest, status: "DRAFT" | "LIVE" | "ENDED") => {
        try { await mockbookService.changeMockTestStatus(test.id, status); toast.success(`Status → ${status}`); loadAll(); }
        catch { toast.error("Failed"); }
    };

    const handleDeleteTest = async () => {
        if (!deleteTest) return;
        try { await mockbookService.deleteMockTest(deleteTest.id); toast.success("Test deleted"); setDeleteTest(null); loadAll(); }
        catch { toast.error("Failed to delete"); }
    };

    if (isLoading) return (
        <div className="min-h-screen bg-neutral-bg flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        </div>
    );
    if (!series) return <div className="p-10 text-center text-red-500">Series not found</div>;

    const totalAttempts = tests.reduce((a, t) => a + ((t as any).attemptsCount || t._count?.attempts || 0), 0);

    return (
        <div className="min-h-screen bg-neutral-bg">
            <Sidebar />
            <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
                <TopBar />
                <main className="flex-1 p-6">
                    <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
                        <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
                            <Link href="/mockbook" className="hover:text-orange-600">MockBook</Link>
                            <ChevronRight className="w-4 h-4" />
                            <Link href="/mockbook/test-series" className="hover:text-orange-600">Test Series</Link>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-gray-900 font-medium truncate max-w-[300px]">{series.name}</span>
                        </div>

                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shrink-0">
                                    <BookOpen className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <h1 className="text-xl font-bold text-gray-900">{series.name}</h1>
                                        <Badge variant="outline" className={cn("text-[10px]", series.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-600")}>
                                            {series.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                        {series.isFeatured && <Badge className="bg-yellow-50 text-yellow-700 border border-yellow-200 text-[10px]"><Star className="w-2.5 h-2.5 mr-1" />Featured</Badge>}
                                    </div>
                                    {series.description && <p className="text-sm text-gray-500 max-w-[600px]">{series.description}</p>}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Button variant="outline" size="sm" onClick={() => setShowEditSeries(true)}>
                                    <Edit className="w-3.5 h-3.5 mr-1" /> Edit Series
                                </Button>
                                <Button className="btn-primary" size="sm" onClick={() => router.push(`/mockbook/mock-tests?seriesId=${seriesId}`)}>
                                    <Plus className="w-3.5 h-3.5 mr-1" /> Create Test
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: "Total Tests", value: tests.length },
                                { label: "Live Tests", value: tests.filter(t => t.status === "LIVE").length },
                                { label: "Folders", value: subCategories.length },
                                { label: "Total Attempts", value: totalAttempts.toLocaleString() },
                            ].map(stat => (
                                <Card key={stat.label} className="kpi-card">
                                    <CardContent className="p-4">
                                        <div className="text-[10px] text-gray-500 uppercase">{stat.label}</div>
                                        <div className="text-lg font-bold text-gray-900 mt-0.5">{stat.value}</div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <Tabs defaultValue="tests">
                            <TabsList className="bg-white border border-gray-200 rounded-lg p-1 h-auto flex-wrap">
                                {["tests", "folders", "pricing", "analytics", "students"].map(v => (
                                    <TabsTrigger key={v} value={v} className="capitalize data-[state=active]:bg-brand-primary data-[state=active]:text-white text-sm">
                                        {v === "folders" ? "Folders" : v.charAt(0).toUpperCase() + v.slice(1)}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {/* TESTS */}
                            <TabsContent value="tests" className="mt-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">{tests.length} tests</span>
                                    <Button size="sm" className="btn-primary" onClick={() => router.push(`/mockbook/mock-tests?seriesId=${seriesId}`)}>
                                        <Plus className="w-3.5 h-3.5 mr-1" /> Create New Test
                                    </Button>
                                </div>
                                <Card>
                                    <CardContent className="p-0">
                                        {tests.length === 0 ? (
                                            <div className="p-12 text-center space-y-2">
                                                <FileText className="w-12 h-12 text-gray-200 mx-auto" />
                                                <p className="text-gray-400 text-sm">No tests yet</p>
                                            </div>
                                        ) : (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-gray-50">
                                                        <TableHead className="text-xs uppercase">Test Name</TableHead>
                                                        <TableHead className="text-xs uppercase">Folder</TableHead>
                                                        <TableHead className="text-xs uppercase">Duration</TableHead>
                                                        <TableHead className="text-xs uppercase">Marks</TableHead>
                                                        <TableHead className="text-xs uppercase">Status</TableHead>
                                                        <TableHead className="text-xs uppercase">Attempts</TableHead>
                                                        <TableHead className="text-xs uppercase text-right">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {tests.map((test: any) => (
                                                        <TableRow key={test.id} className="hover:bg-orange-50/30">
                                                            <TableCell>
                                                                <div className="font-medium text-sm text-gray-900 max-w-[220px] truncate">{test.name}</div>
                                                                <div className="text-[10px] text-gray-400 font-mono">{test.testId}</div>
                                                            </TableCell>
                                                            <TableCell className="text-xs text-gray-500">{test.subCategoryName || "—"}</TableCell>
                                                            <TableCell className="text-xs text-gray-600">{test.durationMins}m</TableCell>
                                                            <TableCell className="text-xs text-gray-600">{test.totalMarks}</TableCell>
                                                            <TableCell><StatusBadge status={test.status} /></TableCell>
                                                            <TableCell className="text-sm font-semibold">{test.attemptsCount || test._count?.attempts || 0}</TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    {test.status === "DRAFT" && (
                                                                        <Button variant="outline" size="sm" className="h-6 text-[10px] text-green-600 border-green-200"
                                                                            onClick={() => handleTestStatus(test, "LIVE")}>
                                                                            <Play className="w-2.5 h-2.5 mr-1" />Live
                                                                        </Button>
                                                                    )}
                                                                    {test.status === "LIVE" && (
                                                                        <Button variant="outline" size="sm" className="h-6 text-[10px] text-red-500 border-red-200"
                                                                            onClick={() => handleTestStatus(test, "ENDED")}>End</Button>
                                                                    )}
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="w-3.5 h-3.5" /></Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            <DropdownMenuItem asChild>
                                                                                <Link href={`/mockbook/mock-tests/${test.id}`}><Eye className="w-3.5 h-3.5 mr-2" />View Details</Link>
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem asChild>
                                                                                <Link href={`/mockbook/mock-tests/${test.id}`}><BarChart3 className="w-3.5 h-3.5 mr-2" />Leaderboard</Link>
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuSeparator />
                                                                            <DropdownMenuItem className="text-red-600" onClick={() => setDeleteTest(test)}>
                                                                                <Trash2 className="w-3.5 h-3.5 mr-2" />Delete
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
                            </TabsContent>

                            {/* FOLDERS / SUB-CATEGORIES */}
                            <TabsContent value="folders" className="mt-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">{subCategories.length} folders — group tests like "Tier 1", "PYQ", "Sectional"</span>
                                    <Button size="sm" className="btn-primary" onClick={openAddSubCat}>
                                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Folder
                                    </Button>
                                </div>
                                {subCategories.length === 0 ? (
                                    <Card>
                                        <CardContent className="p-12 text-center space-y-3">
                                            <Folder className="w-12 h-12 text-gray-200 mx-auto" />
                                            <p className="text-gray-400 text-sm">No folders yet. Add folders to organize tests.</p>
                                            <Button size="sm" className="btn-primary" onClick={openAddSubCat}>
                                                <Plus className="w-3.5 h-3.5 mr-1" /> Create First Folder
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="space-y-3">
                                        {subCategories.map((sc: any, idx: number) => (
                                            <Card key={sc.id}>
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
                                                                <Folder className="w-4 h-4 text-orange-500" />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-sm text-gray-900">{sc.name}</div>
                                                                {sc.description && <div className="text-xs text-gray-400">{sc.description}</div>}
                                                                <div className="text-[10px] text-gray-300 mt-0.5">{(sc.mockTests || []).length} tests</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button variant="ghost" size="sm" className="h-7 text-[10px] text-orange-600 hover:bg-orange-50"
                                                                onClick={() => router.push(`/mockbook/mock-tests?seriesId=${seriesId}&folderId=${sc.id}`)}>
                                                                <Plus className="w-2.5 h-2.5 mr-1" /> Create Test
                                                            </Button>
                                                            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => openEditSubCat(sc)}>
                                                                <Edit className="w-3 h-3 mr-1" /> Edit
                                                            </Button>
                                                            <Button variant="outline" size="sm" className="h-7 text-[10px] text-red-500 border-red-200 hover:bg-red-50" onClick={() => setDeleteSubCat(sc)}>
                                                                <Trash2 className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            {/* PRICING */}
                            <TabsContent value="pricing" className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Pricing Configuration</CardTitle>
                                        <CardDescription>Set price and free/paid status for this series</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-5 max-w-lg">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <Switch checked={pricingForm.isFree} onCheckedChange={v => setPricingForm(f => ({ ...f, isFree: v }))} />
                                            <div>
                                                <div className="text-sm font-medium">Free Series</div>
                                                <div className="text-xs text-gray-400">Students access without purchasing</div>
                                            </div>
                                        </label>
                                        {!pricingForm.isFree && (
                                            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
                                                <div className="space-y-1.5">
                                                    <Label>Original Price (₹)</Label>
                                                    <Input type="number" min={0} value={pricingForm.price} onChange={e => setPricingForm(f => ({ ...f, price: e.target.value }))} />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label>Discounted Price (₹)</Label>
                                                    <Input type="number" min={0} value={pricingForm.discountPrice} onChange={e => setPricingForm(f => ({ ...f, discountPrice: e.target.value }))} placeholder="0 = no discount" />
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
                                            <IndianRupee className="w-4 h-4 shrink-0" />
                                            <span>
                                                {pricingForm.isFree ? "Series will be FREE" :
                                                    Number(pricingForm.discountPrice) > 0
                                                        ? `Students pay ₹${pricingForm.discountPrice} (was ₹${pricingForm.price})`
                                                        : `Students pay ₹${pricingForm.price}`}
                                            </span>
                                        </div>
                                        <Button className="btn-primary" onClick={handleSavePricing} disabled={pricingSaving}>
                                            {pricingSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                            Save Pricing
                                        </Button>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* ANALYTICS */}
                            <TabsContent value="analytics" className="mt-4">
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    {[
                                        { label: "Total Tests", value: tests.length },
                                        { label: "Live Tests", value: tests.filter(t => t.status === "LIVE").length },
                                        { label: "Total Attempts", value: totalAttempts.toLocaleString() },
                                    ].map(kpi => (
                                        <Card key={kpi.label} className="kpi-card">
                                            <CardContent className="p-5">
                                                <div className="text-xs text-gray-500 uppercase">{kpi.label}</div>
                                                <div className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                                <Card>
                                    <CardContent className="p-8 text-center text-gray-400 text-sm">
                                        View <Link href="/mockbook/analytics" className="text-orange-500 hover:underline">Analytics page</Link> for platform-wide data.
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* STUDENTS */}
                            <TabsContent value="students" className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base">Students</CardTitle>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href="/mockbook/students"><Users className="w-3.5 h-3.5 mr-1" />View All Students</Link>
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-sm text-gray-400 text-center py-8">
                                            Student enrollment data is available on the <Link href="/mockbook/students" className="text-orange-500 hover:underline">Students page</Link>.
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </div>

            {/* Edit Series Dialog */}
            <Dialog open={showEditSeries} onOpenChange={setShowEditSeries}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Series</DialogTitle>
                        <DialogDescription className="hidden">Edit the details of this test series.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5"><Label>Name</Label><Input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} /></div>
                        <div className="space-y-1.5"><Label>Description</Label><Textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 text-sm cursor-pointer"><Switch checked={editForm.isFeatured} onCheckedChange={v => setEditForm(f => ({ ...f, isFeatured: v }))} />Featured</label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer"><Switch checked={editForm.isActive} onCheckedChange={v => setEditForm(f => ({ ...f, isActive: v }))} />Active</label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditSeries(false)}>Cancel</Button>
                        <Button className="btn-primary" onClick={handleUpdateSeries} disabled={editSaving}>
                            {editSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add/Edit SubCategory Dialog */}
            <Dialog open={showSubCatModal} onOpenChange={() => { setShowSubCatModal(false); setEditSubCat(null); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editSubCat ? "Edit Folder" : "Add Folder"}</DialogTitle>
                        <DialogDescription className="hidden">Create or edit a folder for categorizing tests.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5"><Label>Folder Name *</Label><Input placeholder="e.g. Tier 1, PYQ, Sectional..." value={subCatForm.name} onChange={e => setSubCatForm(f => ({ ...f, name: e.target.value }))} /></div>
                        <div className="space-y-1.5"><Label>Description</Label><Input placeholder="Optional" value={subCatForm.description} onChange={e => setSubCatForm(f => ({ ...f, description: e.target.value }))} /></div>
                        <div className="space-y-1.5"><Label>Sort Order</Label><Input type="number" min={0} value={subCatForm.sortOrder} onChange={e => setSubCatForm(f => ({ ...f, sortOrder: Number(e.target.value) }))} /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setShowSubCatModal(false); setEditSubCat(null); }}>Cancel</Button>
                        <Button className="btn-primary" onClick={handleSubCatSave} disabled={subCatSaving}>
                            {subCatSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {editSubCat ? "Save" : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete SubCat Confirm */}
            <Dialog open={!!deleteSubCat} onOpenChange={() => setDeleteSubCat(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600"><AlertCircle className="w-5 h-5" />Delete Folder</DialogTitle>
                        <DialogDescription className="hidden">Confirm deletion of this folder.</DialogDescription>
                    </DialogHeader>
                    <p className="text-sm text-gray-600">Delete <strong>{deleteSubCat?.name}</strong>? Tests inside will be unlinked.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteSubCat(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteSubCat}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Test Confirm */}
            <Dialog open={!!deleteTest} onOpenChange={() => setDeleteTest(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600"><AlertCircle className="w-5 h-5" />Delete Test</DialogTitle>
                        <DialogDescription className="hidden">Confirm deletion of this test.</DialogDescription>
                    </DialogHeader>
                    <p className="text-sm text-gray-600">Permanently delete <strong>{deleteTest?.name}</strong>? All attempts will also be deleted.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTest(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteTest}>Delete Permanently</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
