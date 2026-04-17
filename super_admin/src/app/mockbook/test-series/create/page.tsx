"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ChevronRight, ChevronLeft, Check, BookOpen, Target, Tag,
    IndianRupee, Lock, Eye, Upload, Plus, Minus, AlertCircle,
    CheckCircle2, Globe, Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { toast } from "sonner";
import { mockbookService, ExamFolder } from "@/services/mockbookService";
import { useEffect } from "react";

const STEPS = [
    { id: 1, label: "Series Identity", icon: BookOpen },
    { id: 2, label: "Structure Planning", icon: Target },
    { id: 3, label: "Add Tests", icon: Tag },
    { id: 4, label: "Pricing & Access", icon: IndianRupee },
    { id: 5, label: "Unlock Rules", icon: Lock },
    { id: 6, label: "Review & Publish", icon: Eye },
];

// Removed static examCategories as we will fetch them from backend

const testTypes = [
    { key: "fullMock", label: "Full Length Mock Tests", description: "Complete exam pattern — all sections" },
    { key: "sectional", label: "Sectional Tests", description: "Single subject/section focused" },
    { key: "chapter", label: "Chapter Tests", description: "Specific chapter mastery check" },
    { key: "pyq", label: "Previous Year Papers", description: "Actual past exam replicas" },
    { key: "miniLive", label: "Mini Live Tests", description: "Short scheduled live tests" },
    { key: "caBooster", label: "Current Affairs Booster", description: "Updated weekly, last 30 days" },
    { key: "speed", label: "Speed Tests", description: "Time-pressure rapid fire format" },
];

function StepIndicator({ current, total }: { current: number; total: number }) {
    return (
        <div className="flex items-center gap-0">
            {STEPS.map((step, i) => {
                const Icon = step.icon;
                const isDone = step.id < current;
                const isActive = step.id === current;
                return (
                    <div key={step.id} className="flex items-center">
                        <div className={cn(
                            "flex flex-col items-center gap-1.5",
                        )}>
                            <div className={cn(
                                "w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all",
                                isDone ? "bg-green-500 border-green-500 text-white" :
                                    isActive ? "bg-orange-500 border-orange-500 text-white" :
                                        "bg-white border-gray-200 text-gray-400"
                            )}>
                                {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                            </div>
                            <span className={cn(
                                "text-[10px] font-medium text-center max-w-[72px] leading-tight",
                                isActive ? "text-orange-600" : isDone ? "text-green-600" : "text-gray-400"
                            )}>
                                {step.label}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={cn(
                                "h-0.5 w-10 mb-5 mx-1",
                                step.id < current ? "bg-green-400" : "bg-gray-200"
                            )} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default function CreateTestSeriesPage() {
    const { isOpen } = useSidebarStore();
    const router = useRouter();
    const [step, setStep] = useState(1);

    const [allFolders, setAllFolders] = useState<ExamFolder[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFolders = async () => {
            try {
                const folders = await mockbookService.getFolders();
                setAllFolders(folders);
            } catch (error) {
                toast.error("Failed to load categories");
            } finally {
                setIsLoading(false);
            }
        };
        fetchFolders();
    }, []);

    // Form state matching backend
    const [form, setForm] = useState({
        name: "",
        folderId: "",
        description: "",
        isFeatured: false,
        isActive: true,
        isFree: false,
        price: "",
        discountPrice: "",
        // Extended UI state
        shortName: "",
        seriesType: "mock",
        target: "platform",
        colorTag: "orange",
    });

    const [testCounts, setTestCounts] = useState<Record<string, number>>({
        fullMock: 10, sectional: 30, chapter: 50, pyq: 20, miniLive: 12, caBooster: 24, speed: 0,
    });

    const [pricing, setPricing] = useState({
        type: "paid", // free | partlyFree | paid
        price: "499",
        validity: "12",
        offerPrice: "",
        offerUntil: "",
        freeTestIds: [] as string[],
    });

    const [unlockRule, setUnlockRule] = useState("all");

    const setField = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

    const stepValid = () => {
        if (step === 1) return form.name.trim().length > 0 && form.folderId.length > 0;
        return true;
    };

    const next = () => { if (step < 6) setStep(s => s + 1); };
    const prev = () => { if (step > 1) setStep(s => s - 1); };

    const publish = async () => {
        try {
            const data = {
                name: form.name,
                folderId: form.folderId,
                description: form.description,
                isFeatured: form.isFeatured,
                isActive: form.isActive,
                isFree: pricing.type === "free",
                price: pricing.type === "free" ? 0 : Number(pricing.price),
                discountPrice: pricing.offerPrice ? Number(pricing.offerPrice) : (pricing.type === "free" ? 0 : Number(pricing.price)),
            };
            
            await mockbookService.createSeries(data as any);
            toast.success("Test series published successfully!");
            router.push("/mockbook/test-series");
        } catch (error) {
            console.error("Publish failed:", error);
            toast.error("Failed to publish test series");
        }
    };

    const checklist = [
        { label: "Series name set", ok: form.name.trim().length > 0 },
        { label: "Exam category selected", ok: form.folderId.length > 0 },
        { label: "At least 1 test type planned", ok: Object.values(testCounts).some(v => v > 0) },
        { label: "Pricing configured", ok: true },
        { label: "Thumbnail uploaded", ok: false, warn: true },
        { label: "Description provided", ok: form.description.trim().length > 20 },
    ];

    return (
        <div className="min-h-screen bg-neutral-bg">
            <Sidebar />
            <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
                <TopBar />
                <main className="flex-1 p-6">
                    <div className="max-w-[900px] mx-auto space-y-6 animate-fade-in">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Link href="/mockbook" className="hover:text-orange-600">MockBook</Link>
                            <ChevronRight className="w-4 h-4" />
                            <Link href="/mockbook/test-series" className="hover:text-orange-600">Test Series</Link>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-gray-900 font-medium">Create New Series</span>
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Create New Test Series</h1>
                            <p className="text-gray-500 text-sm mt-1">Fill in the details step by step to publish your series</p>
                        </div>

                        {/* Step Indicator */}
                        <div className="flex justify-center py-2 overflow-x-auto">
                            <StepIndicator current={step} total={6} />
                        </div>

                        {/* Step Content */}
                        <Card>
                            <CardHeader className="border-b">
                                <CardTitle className="text-lg">
                                    Step {step} — {STEPS[step - 1].label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-5">

                                {/* ─── STEP 1: Identity ─── */}
                                {step === 1 && (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                                                    Series Name <span className="text-red-500">*</span>
                                                </label>
                                                <Input
                                                    placeholder="e.g. SSC CGL 2026 — Complete Mock Series"
                                                    value={form.name}
                                                    onChange={e => setField("name", e.target.value)}
                                                    className="input-field"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                                                    Short Name (for badges)
                                                </label>
                                                <Input
                                                    placeholder="e.g. SSC CGL 2026"
                                                    value={form.shortName}
                                                    onChange={e => setField("shortName", e.target.value)}
                                                    className="input-field"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                                                    Exam Category <span className="text-red-500">*</span>
                                                </label>
                                                <Select value={form.folderId} onValueChange={v => setField("folderId", v)}>
                                                    <SelectTrigger className="input-field">
                                                        <SelectValue placeholder={isLoading ? "Loading..." : "Select category..."} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {allFolders.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                                                    Series Type
                                                </label>
                                                <Select value={form.seriesType} onValueChange={v => setField("seriesType", v)}>
                                                    <SelectTrigger className="input-field">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="mock">Mock Series</SelectItem>
                                                        <SelectItem value="pyq">PYQ Series</SelectItem>
                                                        <SelectItem value="chapter">Chapter Series</SelectItem>
                                                        <SelectItem value="speed">Speed Series</SelectItem>
                                                        <SelectItem value="mixed">Mixed Series</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-2 block">Target</label>
                                            <div className="flex items-center gap-4">
                                                {[
                                                    { val: "platform", label: "Public Platform (MockVeda)", icon: Globe, desc: "Visible to all students" },
                                                    { val: "org", label: "My Institute Only", icon: Building2, desc: "Private to org students" },
                                                ].map(opt => {
                                                    const Icon = opt.icon;
                                                    return (
                                                        <button
                                                            key={opt.val}
                                                            onClick={() => setField("target", opt.val)}
                                                            className={cn(
                                                                "flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                                                                form.target === opt.val
                                                                    ? "border-orange-400 bg-orange-50"
                                                                    : "border-gray-200 hover:border-gray-300"
                                                            )}
                                                        >
                                                            <Icon className={cn("w-5 h-5", form.target === opt.val ? "text-orange-500" : "text-gray-400")} />
                                                            <div>
                                                                <div className="font-medium text-sm text-gray-900">{opt.label}</div>
                                                                <div className="text-xs text-gray-500">{opt.desc}</div>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Short Description</label>
                                            <Input
                                                placeholder="Brief description shown on series cards..."
                                                value={form.description}
                                                onChange={e => setField("description", e.target.value)}
                                                className="input-field"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Series Color Tag</label>
                                            <div className="flex gap-2">
                                                {[
                                                    { name: "orange", cls: "bg-orange-500" },
                                                    { name: "blue", cls: "bg-blue-500" },
                                                    { name: "green", cls: "bg-green-500" },
                                                    { name: "red", cls: "bg-red-500" },
                                                    { name: "purple", cls: "bg-purple-500" },
                                                    { name: "yellow", cls: "bg-yellow-500" },
                                                ].map(c => (
                                                    <button
                                                        key={c.name}
                                                        onClick={() => setField("colorTag", c.name)}
                                                        className={cn(
                                                            "w-8 h-8 rounded-full transition-all",
                                                            c.cls,
                                                            form.colorTag === c.name && "ring-2 ring-offset-2 ring-gray-400"
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-orange-300 transition-colors cursor-pointer">
                                            <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                            <div className="text-sm text-gray-500">Click or drag to upload thumbnail / banner</div>
                                            <div className="text-xs text-gray-400 mt-1">PNG, JPG up to 2MB · Recommended: 800×450px</div>
                                        </div>
                                    </>
                                )}

                                {/* ─── STEP 2: Structure Planning ─── */}
                                {step === 2 && (
                                    <>
                                        <div className="text-sm text-gray-500 mb-2">Select which test types to include and specify counts:</div>
                                        <div className="space-y-3">
                                            {testTypes.map(type => {
                                                const count = testCounts[type.key] || 0;
                                                return (
                                                    <div key={type.key} className={cn(
                                                        "flex items-center gap-4 p-4 rounded-xl border-2 transition-all",
                                                        count > 0 ? "border-orange-200 bg-orange-50/40" : "border-gray-100 bg-gray-50"
                                                    )}>
                                                        <div className="flex-1">
                                                            <div className="font-medium text-gray-900 text-sm">{type.label}</div>
                                                            <div className="text-xs text-gray-500 mt-0.5">{type.description}</div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => setTestCounts(t => ({ ...t, [type.key]: Math.max(0, (t[type.key] || 0) - 1) }))}
                                                                className="w-7 h-7 rounded-md bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                                                            >
                                                                <Minus className="w-3.5 h-3.5" />
                                                            </button>
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                value={testCounts[type.key] || 0}
                                                                onChange={e => setTestCounts(t => ({ ...t, [type.key]: parseInt(e.target.value) || 0 }))}
                                                                className="w-16 h-7 text-center input-field text-sm p-0"
                                                            />
                                                            <button
                                                                onClick={() => setTestCounts(t => ({ ...t, [type.key]: (t[type.key] || 0) + 1 }))}
                                                                className="w-7 h-7 rounded-md bg-orange-100 hover:bg-orange-200 flex items-center justify-center"
                                                            >
                                                                <Plus className="w-3.5 h-3.5 text-orange-600" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                                            <div className="font-medium text-gray-900">
                                                Total planned: {Object.values(testCounts).reduce((a, b) => a + b, 0)} tests
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {testTypes.filter(t => (testCounts[t.key] || 0) > 0).map(t => (
                                                    <Badge key={t.key} variant="outline" className="text-xs">
                                                        {t.label.split(" ")[0]} ({testCounts[t.key]})
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* ─── STEP 3: Add Tests ─── */}
                                {step === 3 && (
                                    <div className="space-y-4">
                                        <div className="flex gap-3">
                                            <Button variant="outline" className="btn-secondary flex-1">
                                                <Plus className="w-4 h-4 mr-2" /> Add Existing Test
                                            </Button>
                                            <Button variant="outline" className="btn-secondary flex-1">
                                                <Plus className="w-4 h-4 mr-2" /> Create New Test
                                            </Button>
                                            <Button variant="outline" className="btn-secondary flex-1">
                                                Import from PYQ Bank
                                            </Button>
                                        </div>
                                        <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center">
                                            <BookOpen className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                            <div className="text-gray-500 font-medium text-sm">No tests added yet</div>
                                            <div className="text-gray-400 text-xs mt-1">Add or create tests to include them in this series</div>
                                        </div>
                                        <div className="text-xs text-gray-400 text-center">
                                            💡 Tip: You can also add tests after publishing — series can be updated anytime.
                                        </div>
                                    </div>
                                )}

                                {/* ─── STEP 4: Pricing ─── */}
                                {step === 4 && (
                                    <div className="space-y-5">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-2 block">Access Type</label>
                                            <div className="flex gap-3">
                                                {[
                                                    { val: "free", label: "All Free" },
                                                    { val: "partlyFree", label: "Partly Free" },
                                                    { val: "paid", label: "Paid" },
                                                ].map(opt => (
                                                    <button
                                                        key={opt.val}
                                                        onClick={() => setPricing(p => ({ ...p, type: opt.val }))}
                                                        className={cn(
                                                            "flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all",
                                                            pricing.type === opt.val
                                                                ? "border-orange-400 bg-orange-50 text-orange-700"
                                                                : "border-gray-200 text-gray-600 hover:border-gray-300"
                                                        )}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {pricing.type !== "free" && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Price (₹)</label>
                                                    <Input
                                                        type="number"
                                                        value={pricing.price}
                                                        onChange={e => setPricing(p => ({ ...p, price: e.target.value }))}
                                                        className="input-field"
                                                        placeholder="e.g. 499"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Offer Price (₹) — optional</label>
                                                    <Input
                                                        type="number"
                                                        value={pricing.offerPrice}
                                                        onChange={e => setPricing(p => ({ ...p, offerPrice: e.target.value }))}
                                                        className="input-field"
                                                        placeholder="e.g. 399"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Validity</label>
                                                    <Select value={pricing.validity} onValueChange={v => setPricing(p => ({ ...p, validity: v }))}>
                                                        <SelectTrigger className="input-field">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="3">3 months</SelectItem>
                                                            <SelectItem value="6">6 months</SelectItem>
                                                            <SelectItem value="12">12 months</SelectItem>
                                                            <SelectItem value="24">2 years / Lifetime</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Offer Valid Until</label>
                                                    <Input
                                                        type="date"
                                                        value={pricing.offerUntil}
                                                        onChange={e => setPricing(p => ({ ...p, offerUntil: e.target.value }))}
                                                        className="input-field"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {pricing.type !== "free" && (
                                            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
                                                <div className="font-medium mb-1">Free Tests Selection</div>
                                                <div className="text-xs text-green-600">Add tests first (Step 3), then select which 2–3 will be available for free.</div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ─── STEP 5: Unlock Rules ─── */}
                                {step === 5 && (
                                    <div className="space-y-4">
                                        <div className="text-sm text-gray-600 mb-1">How will tests unlock for enrolled students?</div>
                                        {[
                                            { val: "all", label: "All Available Immediately", desc: "Students can attempt any test right after enrolling" },
                                            { val: "weekly", label: "One Test Per Week", desc: "A new test auto-unlocks every 7 days" },
                                            { val: "sequential", label: "Complete Previous to Unlock Next", desc: "Students must finish one test to access the next" },
                                            { val: "custom", label: "Custom Schedule", desc: "Set specific unlock dates for each test" },
                                        ].map(opt => (
                                            <button
                                                key={opt.val}
                                                onClick={() => setUnlockRule(opt.val)}
                                                className={cn(
                                                    "w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left",
                                                    unlockRule === opt.val
                                                        ? "border-orange-400 bg-orange-50"
                                                        : "border-gray-200 hover:border-gray-300"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center",
                                                    unlockRule === opt.val ? "border-orange-500" : "border-gray-300"
                                                )}>
                                                    {unlockRule === opt.val && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 text-sm">{opt.label}</div>
                                                    <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                                                </div>
                                            </button>
                                        ))}

                                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                            <div className="text-sm font-medium text-blue-800 mb-1">Show locked upcoming tests to students?</div>
                                            <div className="flex gap-3 mt-2">
                                                <button className="flex-1 py-2 rounded-lg border-2 border-blue-400 bg-blue-100 text-blue-700 text-sm font-medium">
                                                    Yes — show "Unlocks on [date]"
                                                </button>
                                                <button className="flex-1 py-2 rounded-lg border-2 border-gray-200 text-gray-500 text-sm">
                                                    No — hide until unlock date
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ─── STEP 6: Review & Publish ─── */}
                                {step === 6 && (
                                    <div className="space-y-5">
                                        {/* Summary */}
                                        <div className="p-5 bg-gray-50 rounded-xl space-y-2 text-sm">
                                            <div className="flex justify-between"><span className="text-gray-500">Series Name</span><span className="font-medium">{form.name || "Not set"}</span></div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Category</span>
                                                <span className="font-medium">
                                                    {allFolders.find(f => f.id === form.folderId)?.name || "Not set"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between"><span className="text-gray-500">Target</span><span className="font-medium">{form.target === "platform" ? "Public (MockVeda)" : "My Institute"}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500">Planned Tests</span><span className="font-medium">{Object.values(testCounts).reduce((a, b) => a + b, 0)}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500">Price</span><span className="font-medium">{pricing.type === "free" ? "Free" : `₹${pricing.price}`}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500">Unlock Rule</span><span className="font-medium capitalize">{unlockRule.replace("all", "All available immediately")}</span></div>
                                        </div>

                                        {/* Checklist */}
                                        <div>
                                            <div className="font-medium text-gray-900 mb-3">Pre-publish Checklist</div>
                                            <div className="space-y-2">
                                                {checklist.map((item, i) => (
                                                    <div key={i} className="flex items-center gap-3">
                                                        {item.ok ? (
                                                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                                        ) : item.warn ? (
                                                            <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0" />
                                                        ) : (
                                                            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                                                        )}
                                                        <span className={cn(
                                                            "text-sm",
                                                            item.ok ? "text-gray-700" :
                                                                item.warn ? "text-yellow-700" : "text-red-600"
                                                        )}>
                                                            {item.label}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <Button variant="outline" className="flex-1">Save Draft</Button>
                                            <Button
                                                className="btn-primary flex-1"
                                                onClick={publish}
                                                disabled={!checklist.filter(c => !c.warn).every(c => c.ok)}
                                            >
                                                Publish Series
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Navigation */}
                        {step < 6 && (
                            <div className="flex justify-between">
                                <Button variant="outline" onClick={prev} disabled={step === 1}>
                                    <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                                </Button>
                                <Button className="btn-primary" onClick={next} disabled={!stepValid()}>
                                    Next <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        )}
                        {step === 6 && (
                            <div className="flex justify-start">
                                <Button variant="outline" onClick={prev}>
                                    <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                                </Button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
