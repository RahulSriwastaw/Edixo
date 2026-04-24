"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    ChevronRight, FileText, Edit, Trash2, Play, XCircle,
    Clock, Users, AlertCircle, Loader2, Save, BarChart3,
    Medal, Hash, Star, Plus, Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { mockbookService } from "@/services/mockbookService";
import { toast } from "sonner";
import { api } from "@/lib/api";

function StatusBadge({ status }: { status: string }) {
    const cfg: Record<string, string> = {
        LIVE: "bg-green-50 text-green-700 border-green-200",
        DRAFT: "bg-[var(--bg-main)] text-[var(--text-secondary)] border-[var(--border-input)]",
        ENDED: "bg-red-50 text-red-600 border-red-200",
    };
    return <Badge variant="outline" className={cn("text-[10px]", cfg[status] || cfg.DRAFT)}>{status}</Badge>;
}

function RankMedal({ rank }: { rank: number }) {
    if (rank === 1) return <span className="text-yellow-500 font-bold">🥇</span>;
    if (rank === 2) return <span className="text-[var(--text-muted)] font-bold">🥈</span>;
    if (rank === 3) return <span className="text-amber-600 font-bold">🥉</span>;
    return <span className="text-[var(--text-secondary)] text-xs font-mono">#{rank}</span>;
}

export default function MockTestDetailPage() {
    const { isOpen } = useSidebarStore();
    const params = useParams();
    const testId = params.testId as string;

    const [test, setTest] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [lbLoading, setLbLoading] = useState(false);

    // Edit meta
    const [editSaving, setEditSaving] = useState(false);
    const [editForm, setEditForm] = useState({
        name: "", description: "", durationMins: 60, totalMarks: 100,
        isPublic: false, shuffleQuestions: false, showResult: true, maxAttempts: 1,
        scheduledAt: "", endsAt: "",
        seriesId: "", subCategoryId: ""
    });
    const [allSeries, setAllSeries] = useState<any[]>([]);
    const [subCategories, setSubCategories] = useState<any[]>([]);

    // Sections
    const [addSectionOpen, setAddSectionOpen] = useState(false);
    const [qbankSets, setQbankSets] = useState<any[]>([]);
    const [setsLoading, setSetsLoading] = useState(false);
    const [sectionForm, setSectionForm] = useState({ setId: "", name: "", durationMins: 0 });
    const [sectionSaving, setSectionSaving] = useState(false);
    
    // Status change
    const [statusChanging, setStatusChanging] = useState(false);
    const [confirmEnd, setConfirmEnd] = useState(false);

    const loadTest = async () => {
        try {
            setIsLoading(true);
            const data = await mockbookService.getAdminTestDetail(testId);
            setTest(data);
            setEditForm({
                name: data.name,
                description: data.description || "",
                durationMins: data.durationMins,
                totalMarks: data.totalMarks,
                isPublic: data.isPublic,
                shuffleQuestions: data.shuffleQuestions,
                showResult: data.showResult,
                maxAttempts: data.maxAttempts,
                scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).toISOString().slice(0, 16) : "",
                endsAt: data.endsAt ? new Date(data.endsAt).toISOString().slice(0, 16) : "",
                seriesId: data.subCategory?.category?.id || "",
                subCategoryId: data.subCategoryId || "",
            });
            if (data.subCategory?.category?.id) {
                loadSubCats(data.subCategory.category.id);
            }
        } catch { toast.error("Failed to load test"); }
        finally { setIsLoading(false); }
    };

    const loadLeaderboard = async () => {
        if (!test?.testId) return;
        try {
            setLbLoading(true);
            const data = await mockbookService.getLeaderboard(test.testId);
            setLeaderboard(data);
        } catch { } finally { setLbLoading(false); }
    };

    const loadQbankSets = async () => {
        try {
            setSetsLoading(true);
            const res = await api.get('/qbank/sets');
            setQbankSets(res.data?.sets || []);
        } catch { toast.error("Failed to load Question Bank Sets"); }
        finally { setSetsLoading(false); }
    };

    const loadSeries = async () => {
        try {
            const data = await mockbookService.getSeries();
            setAllSeries(data);
        } catch {}
    };

    const loadSubCats = async (sid: string) => {
        try {
            const data = await mockbookService.getSubCategories(sid);
            setSubCategories(data);
        } catch {}
    };

    useEffect(() => { loadTest(); loadSeries(); }, [testId]);
    useEffect(() => { if (test) loadLeaderboard(); }, [test?.testId]);
    useEffect(() => { if (addSectionOpen && qbankSets.length === 0) loadQbankSets(); }, [addSectionOpen]);

    const handleSaveMeta = async () => {
        setEditSaving(true);
        try {
            await mockbookService.updateMockTest(testId, {
                name: editForm.name,
                description: editForm.description,
                durationMins: Number(editForm.durationMins),
                totalMarks: Number(editForm.totalMarks),
                isPublic: editForm.isPublic,
                shuffleQuestions: editForm.shuffleQuestions,
                showResult: editForm.showResult,
                maxAttempts: Number(editForm.maxAttempts),
                scheduledAt: editForm.scheduledAt || null,
                endsAt: editForm.endsAt || null,
                subCategoryId: editForm.subCategoryId || null,
            } as any);
            toast.success("Test updated"); loadTest();
        } catch { toast.error("Failed to update"); }
        finally { setEditSaving(false); }
    };

    const handleStatus = async (status: "DRAFT" | "LIVE" | "ENDED") => {
        setStatusChanging(true);
        try {
            await mockbookService.changeMockTestStatus(testId, status);
            toast.success(`Status → ${status}`); setConfirmEnd(false); loadTest();
        } catch { toast.error("Failed"); }
        finally { setStatusChanging(false); }
    };

    const handleAddSection = async () => {
        if (!sectionForm.setId || !sectionForm.name) return toast.error("Select a set and provide a section name");
        setSectionSaving(true);
        try {
            await mockbookService.addMockTestSection(testId, {
                setId: sectionForm.setId,
                name: sectionForm.name,
                durationMins: sectionForm.durationMins > 0 ? sectionForm.durationMins : undefined
            });
            toast.success("Section added successfully");
            setAddSectionOpen(false);
            loadTest();
        } catch { toast.error("Failed to add section"); }
        finally { setSectionSaving(false); }
    };

    const handleRemoveSection = async (sectionId: string) => {
        if (!confirm("Are you sure you want to remove this section?")) return;
        try {
            await mockbookService.removeMockTestSection(testId, sectionId);
            toast.success("Section removed");
            loadTest();
        } catch { toast.error("Failed to remove section"); }
    };

    if (isLoading) return (
        <div className="min-h-screen bg-neutral-bg flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        </div>
    );
    if (!test) return <div className="p-10 text-center text-red-500">Test not found</div>;

    const seriesName = test.subCategory?.category?.name || test.subCategory?.name;

    return (
        <div className="min-h-screen bg-neutral-bg">
            <Sidebar />
            <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "md:ml-60" : "ml-0")}>
                <TopBar />
                <main className="flex-1 p-4 lg:p-5">
                    <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] flex-wrap">
                            <Link href="/mockbook" className="hover:text-orange-600">MockBook</Link>
                            <ChevronRight className="w-4 h-4" />
                            <Link href="/mockbook/mock-tests" className="hover:text-orange-600">Mock Tests</Link>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-[var(--text-primary)] font-medium truncate max-w-[300px]">{test.name}</span>
                        </div>

                        {/* Header */}
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <h1 className="text-xl font-bold text-[var(--text-primary)]">{test.name}</h1>
                                    <StatusBadge status={test.status} />
                                    {test.isPublic && <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px]">Public</Badge>}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)] flex-wrap">
                                    <span className="font-mono bg-[var(--bg-main)] px-2 py-0.5 rounded">{test.testId}</span>
                                    {seriesName && <span>Series: <strong>{seriesName}</strong></span>}
                                    <span><Clock className="w-3 h-3 inline mr-1" />{test.durationMins} min</span>
                                    <span>Marks: {test.totalMarks}</span>
                                    <span>Attempts: {test._count?.attempts || 0}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                {test.status === "DRAFT" && (
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleStatus("LIVE")} disabled={statusChanging}>
                                        {statusChanging ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Play className="w-3.5 h-3.5 mr-1" />}
                                        Publish Live
                                    </Button>
                                )}
                                {test.status === "LIVE" && (
                                    <Button size="sm" variant="destructive" onClick={() => setConfirmEnd(true)} disabled={statusChanging}>
                                        <XCircle className="w-3.5 h-3.5 mr-1" /> End Test
                                    </Button>
                                )}
                                {test.status === "ENDED" && (
                                    <Button size="sm" variant="outline" onClick={() => handleStatus("DRAFT")} disabled={statusChanging}>
                                        Reopen as Draft
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* KPI cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: "Total Attempts", value: test._count?.attempts || 0 },
                                { label: "Sections", value: test._count?.sections || test.sections?.length || 0 },
                                { label: "Marks", value: test.totalMarks },
                                { label: "Duration", value: `${test.durationMins}m` },
                            ].map(s => (
                                <Card key={s.label} className="kpi-card">
                                    <CardContent className="p-4">
                                        <div className="text-[10px] text-[var(--text-secondary)] uppercase">{s.label}</div>
                                        <div className="text-xl font-bold text-[var(--text-primary)] mt-0.5">{s.value}</div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <Tabs defaultValue="sections">
                            <TabsList className="bg-white border rounded-lg p-1">
                                <TabsTrigger value="sections" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">Sections</TabsTrigger>
                                <TabsTrigger value="settings" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">Settings</TabsTrigger>
                                <TabsTrigger value="leaderboard" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">Leaderboard</TabsTrigger>
                            </TabsList>

                            {/* SECTIONS */}
                            <TabsContent value="sections" className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-base">Test Sections</CardTitle>
                                                <CardDescription>Each section is a Question Bank set linked to this test</CardDescription>
                                            </div>
                                            <Button size="sm" className="btn-primary" onClick={() => {
                                                setSectionForm({ setId: "", name: "", durationMins: 0 });
                                                setAddSectionOpen(true);
                                            }}>
                                                <Plus className="w-4 h-4 mr-2" /> Add Section
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {!test.sections || test.sections.length === 0 ? (
                                            <div className="p-8 text-center space-y-2">
                                                <Hash className="w-10 h-10 text-gray-200 mx-auto" />
                                                <p className="text-[var(--text-muted)] text-sm">No sections added yet</p>
                                                <p className="text-xs text-gray-300">Add Question Bank sets via the Question Bank module to populate this test</p>
                                            </div>
                                        ) : (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-[var(--bg-main)]">
                                                        <TableHead className="text-xs uppercase">#</TableHead>
                                                        <TableHead className="text-xs uppercase">Section Name</TableHead>
                                                        <TableHead className="text-xs uppercase">Source QBank Set</TableHead>
                                                        <TableHead className="text-xs uppercase text-right">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {test.sections.map((sec: any, i: number) => (
                                                        <TableRow key={sec.id}>
                                                            <TableCell className="text-xs text-[var(--text-muted)] font-mono">#{i + 1}</TableCell>
                                                            <TableCell className="font-medium text-sm">{sec.name}</TableCell>
                                                            <TableCell className="text-sm text-[var(--text-secondary)] font-mono text-xs">{sec.set?.name || "Unknown Set"}</TableCell>
                                                            <TableCell className="text-right">
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--text-muted)] hover:text-red-600" onClick={() => handleRemoveSection(sec.id)}>
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* SETTINGS */}
                            <TabsContent value="settings" className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Test Configuration</CardTitle>
                                        <CardDescription>Edit name, duration, schedule and behaviour settings</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-5 max-w-xl">
                                        <div className="space-y-1.5">
                                            <Label>Test Name</Label>
                                            <Input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Description</Label>
                                            <Textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={2} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label>Duration (minutes)</Label>
                                                <Input type="number" min={1} value={editForm.durationMins} onChange={e => setEditForm(f => ({ ...f, durationMins: Number(e.target.value) }))} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Total Marks</Label>
                                                <Input type="number" min={0} value={editForm.totalMarks} onChange={e => setEditForm(f => ({ ...f, totalMarks: Number(e.target.value) }))} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label>Series (Exam Category)</Label>
                                                <Select value={editForm.seriesId || "none"} onValueChange={val => {
                                                    setEditForm(f => ({ ...f, seriesId: val === "none" ? "" : val, subCategoryId: "" }));
                                                    if (val !== "none") loadSubCats(val);
                                                    else setSubCategories([]);
                                                }}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select series..." />
                                                    </SelectTrigger>
                                                    <SelectContent portal={false}>
                                                        <SelectItem value="none">No series</SelectItem>
                                                        {allSeries.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Folder (Sub-Category)</Label>
                                                <Select value={editForm.subCategoryId || "none"} onValueChange={val => setEditForm(f => ({ ...f, subCategoryId: val === "none" ? "" : val }))}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select folder..." />
                                                    </SelectTrigger>
                                                    <SelectContent portal={false}>
                                                        <SelectItem value="none">No folder</SelectItem>
                                                        {subCategories.map(sc => <SelectItem key={sc.id} value={sc.id}>{sc.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label>Scheduled At</Label>
                                                <Input type="datetime-local" value={editForm.scheduledAt} onChange={e => setEditForm(f => ({ ...f, scheduledAt: e.target.value }))} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Ends At</Label>
                                                <Input type="datetime-local" value={editForm.endsAt} onChange={e => setEditForm(f => ({ ...f, endsAt: e.target.value }))} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3 p-4 border rounded-lg bg-[var(--bg-main)]">
                                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                                <Switch checked={editForm.isPublic} onCheckedChange={v => setEditForm(f => ({ ...f, isPublic: v }))} />
                                                <span>Public Test <span className="text-[var(--text-muted)]">(visible without login)</span></span>
                                            </label>
                                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                                <Switch checked={editForm.shuffleQuestions} onCheckedChange={v => setEditForm(f => ({ ...f, shuffleQuestions: v }))} />
                                                Shuffle Questions
                                            </label>
                                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                                <Switch checked={editForm.showResult} onCheckedChange={v => setEditForm(f => ({ ...f, showResult: v }))} />
                                                Show Result After Submit
                                            </label>
                                        </div>
                                        <Button className="btn-primary" onClick={handleSaveMeta} disabled={editSaving}>
                                            {editSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                            Save Settings
                                        </Button>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* LEADERBOARD */}
                            <TabsContent value="leaderboard" className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-base">Leaderboard</CardTitle>
                                                <CardDescription>Top scoring students for this test</CardDescription>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={loadLeaderboard} disabled={lbLoading}>
                                                {lbLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Refresh"}
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {lbLoading ? (
                                            <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" /></div>
                                        ) : leaderboard.length === 0 ? (
                                            <div className="p-8 text-center space-y-2">
                                                <Medal className="w-10 h-10 text-gray-200 mx-auto" />
                                                <p className="text-[var(--text-muted)] text-sm">No attempts yet on this test</p>
                                            </div>
                                        ) : (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-[var(--bg-main)]">
                                                        <TableHead className="text-xs uppercase w-16">Rank</TableHead>
                                                        <TableHead className="text-xs uppercase">Student</TableHead>
                                                        <TableHead className="text-xs uppercase">Score</TableHead>
                                                        <TableHead className="text-xs uppercase">Marks</TableHead>
                                                        <TableHead className="text-xs uppercase">Accuracy</TableHead>
                                                        <TableHead className="text-xs uppercase">Time Taken</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {leaderboard.map((entry: any) => (
                                                        <TableRow key={entry.rank} className={cn("hover:bg-orange-50/30", entry.rank <= 3 && "bg-yellow-50/30")}>
                                                            <TableCell><RankMedal rank={entry.rank} /></TableCell>
                                                            <TableCell>
                                                                <div className="font-medium text-sm text-[var(--text-primary)]">{entry.student?.name || entry.studentName || "Anonymous"}</div>
                                                                <div className="text-[10px] text-[var(--text-muted)]">{entry.student?.studentId || ""}</div>
                                                            </TableCell>
                                                            <TableCell className="font-bold text-orange-600">{entry.score?.toFixed(1) || 0}</TableCell>
                                                            <TableCell className="text-sm">{entry.totalMarks || "—"}</TableCell>
                                                            <TableCell className="text-sm text-emerald-600">{entry.accuracy ? `${entry.accuracy.toFixed(1)}%` : "—"}</TableCell>
                                                            <TableCell className="text-xs text-[var(--text-secondary)]">
                                                                {entry.timeTakenSecs ? `${Math.floor(entry.timeTakenSecs / 60)}m ${entry.timeTakenSecs % 60}s` : "—"}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </div>

            {/* End Test Confirm */}
            <Dialog open={confirmEnd} onOpenChange={setConfirmEnd}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="w-5 h-5" /> End Live Test
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-[var(--text-secondary)]">
                        End <strong>{test.name}</strong>? Students who haven't submitted will be unable to continue.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmEnd(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={() => handleStatus("ENDED")} disabled={statusChanging}>
                            {statusChanging && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            End Now
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Section Modal */}
            <Dialog open={addSectionOpen} onOpenChange={setAddSectionOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Test Section</DialogTitle>
                        <DialogDescription>Link a Question Bank Set to this Mock Test</DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="space-y-1.5">
                            <Label>Select Question Set (QBank)</Label>
                            {setsLoading ? (
                                <div className="p-4 text-center text-sm text-[var(--text-secondary)]"><Loader2 className="w-4 h-4 animate-spin mx-auto" /></div>
                            ) : (
                                <select 
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                                    value={sectionForm.setId}
                                    onChange={e => {
                                        const setId = e.target.value;
                                        const name = qbankSets.find(s => s.id === setId)?.name || "";
                                        setSectionForm(f => ({ ...f, setId, name }));
                                    }}
                                >
                                    <option value="" disabled>Select a set...</option>
                                    {qbankSets.map(set => (
                                        <option key={set.id} value={set.id}>{set.name} ({set.questions} Qs)</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label>Section Display Name</Label>
                            <Input 
                                placeholder="e.g. Reasoning, Math, English" 
                                value={sectionForm.name} 
                                onChange={e => setSectionForm(f => ({...f, name: e.target.value}))} 
                            />
                        </div>
                    </div>
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddSectionOpen(false)}>Cancel</Button>
                        <Button className="btn-primary" onClick={handleAddSection} disabled={sectionSaving || !sectionForm.setId}>
                            {sectionSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Add Section
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
