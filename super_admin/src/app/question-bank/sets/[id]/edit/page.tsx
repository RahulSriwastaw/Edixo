"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ChevronRight, Plus, Trash2, GripVertical, Layers, Search,
    X, ListFilter, ChevronLeft, Save, Eye, Check
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VisibilitySelector } from "@/components/set-system/VisibilitySelector";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function getToken(): string {
    if (typeof document === "undefined") return "";
    const match = document.cookie.match(/(?:^|;\s*)sb_token=([^;]*)/);
    return match ? match[1] : "";
}

function stripHtml(html?: string): string {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, "").replace(/\\[()\\[\]]/g, "").trim();
}

const mapType = (t: string) => {
    if (t === "MCQ_SINGLE") return "mcq";
    if (t === "MCQ_MULTIPLE") return "multi_select";
    if (t === "DESCRIPTIVE") return "integer";
    return "mcq";
};
const mapDifficulty = (d: string) => d?.toLowerCase() || "medium";

function DifficultyBadge({ difficulty }: { difficulty: string }) {
    const styles: Record<string, string> = {
        easy: "bg-green-50 text-green-700",
        medium: "bg-amber-50 text-amber-700",
        hard: "bg-red-50 text-red-700",
    };
    return <Badge className={styles[difficulty] || ""}>{difficulty}</Badge>;
}

function TypeBadge({ type }: { type: string }) {
    const styles: Record<string, string> = {
        mcq: "bg-blue-50 text-blue-700",
        integer: "bg-purple-50 text-purple-700",
        multi_select: "bg-pink-50 text-pink-700",
    };
    const labels: Record<string, string> = {
        mcq: "MCQ", integer: "Integer", multi_select: "Multi",
    };
    return <Badge className={styles[type] || ""}>{labels[type] || type}</Badge>;
}

export default function EditSetPage() {
    const { isOpen } = useSidebarStore();
    const params = useParams();
    const router = useRouter();
    const setId = params.id as string;

    // Set details state
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [visibility, setVisibility] = useState<"private" | "public" | "org_only">("private");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Questions in the set
    const [questions, setQuestions] = useState<any[]>([]);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    // Question bank browser state
    const [apiQuestions, setApiQuestions] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [difficultyFilter, setDifficultyFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [isFetchingQuestions, setIsFetchingQuestions] = useState(false);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());

    // Load set data
    useEffect(() => {
        const fetchSet = async () => {
            try {
                const token = getToken();
                const res = await fetch(`${API_URL}/qbank/sets/${setId}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (res.ok) {
                    const resData = await res.json();
                    const data = resData.data;
                    setName(data.name || "");
                    setDescription(data.description || "");
                    setVisibility(data.isGlobal ? "public" : "private");
                    const loadedQuestions = (data.items || []).map((item: any) => ({
                        id: item.question.id,
                        question_eng: item.question.textEn || item.question.textHi || "Untitled",
                        question_hin: item.question.textHi || "",
                        type: mapType(item.question.type),
                        difficulty: mapDifficulty(item.question.difficulty),
                        options: item.question.options || [],
                    }));
                    setQuestions(loadedQuestions);
                } else {
                    toast.error("Failed to load set data");
                    router.push("/question-bank/sets");
                }
            } catch (err) {
                toast.error("Error loading set");
                router.push("/question-bank/sets");
            } finally {
                setIsLoading(false);
            }
        };
        fetchSet();
    }, [setId]);

    // Fetch question bank
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setIsFetchingQuestions(true);
                const token = getToken();
                const url = new URL(`${API_URL}/qbank/questions`);
                if (searchQuery) url.searchParams.append("search", searchQuery);
                if (difficultyFilter !== "all") url.searchParams.append("difficulty", difficultyFilter);
                if (typeFilter !== "all") url.searchParams.append("type", typeFilter);
                url.searchParams.append("page", page.toString());
                url.searchParams.append("limit", "20");

                const qRes = await fetch(url.toString(), {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (qRes.ok) {
                    const resData = await qRes.json();
                    const mapped = (resData.data?.questions || []).map((q: any) => ({
                        id: q.id,
                        question_eng: q.textEn || q.textHi || "Untitled",
                        question_hin: q.textHi || "",
                        type: mapType(q.type),
                        difficulty: mapDifficulty(q.difficulty),
                        subject: q.folder?.name || "General",
                        options: q.options || [],
                    }));
                    setApiQuestions(mapped);
                    setTotalQuestions(resData.data?.total || 0);
                }
            } catch (err) {
                console.error("Error fetching questions:", err);
            } finally {
                setIsFetchingQuestions(false);
            }
        };

        const timeoutId = setTimeout(() => fetchQuestions(), 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery, difficultyFilter, typeFilter, page]);

    // Drag reorder
    const handleDragStart = (index: number) => setDraggedIndex(index);
    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        const newQ = [...questions];
        const dragged = newQ[draggedIndex];
        newQ.splice(draggedIndex, 1);
        newQ.splice(index, 0, dragged);
        setQuestions(newQ);
        setDraggedIndex(index);
    };
    const handleDragEnd = () => setDraggedIndex(null);

    const removeQuestion = (id: string) => {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
    };

    const addQuestion = (q: any) => {
        if (questions.some((r) => r.id === q.id)) {
            toast.info("Question already in set");
            return;
        }
        setQuestions((prev) => [...prev, q]);
        toast.success("Question added");
    };

    const toggleSelection = (id: string) => {
        const next = new Set(selectedQuestionIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedQuestionIds(next);
    };

    const availableForSelect = apiQuestions.filter(
        (q) => !questions.some((r) => r.id === q.id)
    );

    const toggleSelectAll = () => {
        if (selectedQuestionIds.size === availableForSelect.length && availableForSelect.length > 0) {
            setSelectedQuestionIds(new Set());
        } else {
            setSelectedQuestionIds(new Set(availableForSelect.map((q) => q.id)));
        }
    };

    const handleBulkAdd = () => {
        const toAdd = apiQuestions.filter(
            (q) => selectedQuestionIds.has(q.id) && !questions.some((r) => r.id === q.id)
        );
        if (toAdd.length > 0) {
            setQuestions((prev) => [...prev, ...toAdd]);
            setSelectedQuestionIds(new Set());
            toast.success(`${toAdd.length} questions added`);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error("Set name is required");
            return;
        }
        try {
            setIsSaving(true);
            const token = getToken();
            const res = await fetch(`${API_URL}/qbank/sets/${setId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim() || undefined,
                    questionIds: questions.map((q) => q.id),
                }),
            });
            if (res.ok) {
                toast.success("Set updated successfully!");
                router.push(`/question-bank/sets/${setId}`);
            } else {
                const errData = await res.json().catch(() => ({}));
                toast.error(errData.message || "Failed to update set");
            }
        } catch (err) {
            toast.error("Network error while saving");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Sidebar />
                <div className={cn("flex flex-col min-h-screen", isOpen ? "md:ml-60" : "ml-0")}>
                    <TopBar />
                    <main className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#F4511E]" />
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            <Sidebar />
            <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "md:ml-60" : "ml-0")}>
                <TopBar />
                <main className="flex-1 overflow-hidden flex flex-col">
                    {/* Top Bar */}
                    <div className="p-4 border-b bg-white flex justify-between items-center z-10 shadow-sm">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Link href="/question-bank/sets" className="hover:text-[#F4511E]">Question Sets</Link>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-gray-900 font-semibold">Edit Set</span>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => router.push(`/question-bank/sets/${setId}`)}>
                                <Eye className="w-4 h-4 mr-2" /> View
                            </Button>
                            <Button variant="outline" onClick={() => router.push("/question-bank/sets")}>
                                Cancel
                            </Button>
                            <Button
                                className="bg-[#F4511E] hover:bg-[#E64A19] text-white"
                                disabled={isSaving || !name.trim()}
                                onClick={handleSave}
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>

                    {/* Split View */}
                    <div className="flex-1 overflow-hidden flex flex-col lg:flex-row h-[calc(100vh-130px)]">

                        {/* ── Left: Set Builder ── */}
                        <div className="w-full lg:w-[420px] xl:w-[460px] bg-gray-50 border-r flex flex-col">
                            <Tabs defaultValue="questions" className="w-full h-full flex flex-col">
                                <div className="px-4 pt-4 border-b bg-white">
                                    <TabsList className="w-full grid-cols-2 grid bg-gray-100">
                                        <TabsTrigger value="questions">
                                            Questions ({questions.length})
                                        </TabsTrigger>
                                        <TabsTrigger value="details">Set Details</TabsTrigger>
                                    </TabsList>
                                </div>

                                <div className="flex-1 overflow-y-auto">
                                    {/* Questions Tab */}
                                    <TabsContent value="questions" className="m-0 p-4 space-y-3">
                                        {questions.length === 0 ? (
                                            <div className="text-center py-12 text-gray-500 bg-white border border-dashed rounded-lg">
                                                <Layers className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                                                <p className="text-sm">No questions in this set.</p>
                                                <p className="text-xs mt-1">Select from the right panel to add.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {questions.map((q, index) => (
                                                    <div
                                                        key={q.id}
                                                        draggable
                                                        onDragStart={() => handleDragStart(index)}
                                                        onDragOver={(e) => handleDragOver(e, index)}
                                                        onDragEnd={handleDragEnd}
                                                        className={cn(
                                                            "flex flex-col gap-2 p-3 bg-white border rounded-lg cursor-move shadow-sm",
                                                            draggedIndex === index && "opacity-50 scale-[1.02] shadow-lg border-[#F4511E]"
                                                        )}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-start gap-2 max-w-[85%]">
                                                                <GripVertical className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" />
                                                                <span className="text-xs font-semibold text-gray-400 mt-0.5">Q{index + 1}.</span>
                                                                <div className="text-sm text-gray-800 line-clamp-2">
                                                                    {stripHtml(q.question_eng || q.question_hin || "")}
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => removeQuestion(q.id)}
                                                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded shrink-0"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center gap-2 pl-12">
                                                            <TypeBadge type={q.type} />
                                                            <DifficultyBadge difficulty={q.difficulty} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </TabsContent>

                                    {/* Details Tab */}
                                    <TabsContent value="details" className="m-0 p-4 space-y-4">
                                        <div>
                                            <label className="text-xs font-medium text-gray-700">Set Name *</label>
                                            <Input
                                                placeholder="e.g., Target SSC CGL 2024"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="mt-1 bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-700">Description</label>
                                            <Textarea
                                                placeholder="Brief description..."
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                className="mt-1 bg-white"
                                                rows={3}
                                            />
                                        </div>
                                        <VisibilitySelector value={visibility} onChange={setVisibility} />
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </div>

                        {/* ── Right: Question Bank Browser ── */}
                        <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
                            {/* Search & Filters */}
                            <div className="p-4 border-b space-y-3 bg-gray-50/50">
                                <div className="flex flex-wrap gap-3 items-center">
                                    <div className="relative flex-1 min-w-[250px]">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            placeholder="Search questions..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9 bg-white"
                                        />
                                    </div>
                                    <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                                        <SelectTrigger className="w-[130px] bg-white">
                                            <SelectValue placeholder="Difficulty" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            <SelectItem value="all">All Levels</SelectItem>
                                            <SelectItem value="EASY">Easy</SelectItem>
                                            <SelectItem value="MEDIUM">Medium</SelectItem>
                                            <SelectItem value="HARD">Hard</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                                        <SelectTrigger className="w-[140px] bg-white">
                                            <SelectValue placeholder="Type" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            <SelectItem value="all">Every Type</SelectItem>
                                            <SelectItem value="MCQ_SINGLE">MCQ (Single)</SelectItem>
                                            <SelectItem value="MCQ_MULTIPLE">MCQ (Multi)</SelectItem>
                                            <SelectItem value="DESCRIPTIVE">Subjective</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Selection Action Bar */}
                            <div className="px-4 py-2 border-b bg-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        checked={
                                            availableForSelect.length > 0 &&
                                            selectedQuestionIds.size === availableForSelect.length
                                        }
                                        onCheckedChange={toggleSelectAll}
                                    />
                                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Select All Visible
                                    </span>
                                    {selectedQuestionIds.size > 0 && (
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-none px-1.5 h-5 text-[10px]">
                                            {selectedQuestionIds.size}
                                        </Badge>
                                    )}
                                </div>
                                <Button
                                    size="sm"
                                    disabled={selectedQuestionIds.size === 0}
                                    onClick={handleBulkAdd}
                                    className="h-8 bg-[#F4511E] hover:bg-[#E64A19] text-white"
                                >
                                    <Plus className="w-3 h-3 mr-1.5" /> Add Selected
                                </Button>
                            </div>

                            {/* Question List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50/30">
                                {isFetchingQuestions ? (
                                    <div className="flex justify-center items-center py-12">
                                        <svg className="animate-spin text-[#F4511E] w-8 h-8" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                    </div>
                                ) : apiQuestions.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <Layers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        <p>No questions found.</p>
                                        <p className="text-sm">Try adjusting your filters.</p>
                                    </div>
                                ) : (
                                    apiQuestions.map((q) => {
                                        const isInSet = questions.some((r) => r.id === q.id);
                                        const isSelected = selectedQuestionIds.has(q.id);
                                        return (
                                            <div
                                                key={q.id}
                                                className={cn(
                                                    "flex items-start gap-3 p-3 bg-white border rounded-lg transition-all",
                                                    isInSet
                                                        ? "border-[#F4511E] bg-orange-50/30 opacity-70"
                                                        : "hover:border-gray-300 hover:shadow-sm"
                                                )}
                                            >
                                                {!isInSet && (
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => toggleSelection(q.id)}
                                                        className="mt-0.5"
                                                    />
                                                )}
                                                {isInSet && (
                                                    <div className="mt-0.5 w-4 h-4 flex items-center justify-center">
                                                        <Check className="w-3 h-3 text-[#F4511E]" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-gray-800 line-clamp-2">
                                                        {stripHtml(q.question_eng || q.question_hin)}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                                                            {q.subject}
                                                        </span>
                                                        <TypeBadge type={q.type} />
                                                        <DifficultyBadge difficulty={q.difficulty} />
                                                    </div>
                                                </div>
                                                {!isInSet && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 shrink-0 text-gray-400 hover:text-[#F4511E] hover:bg-orange-50"
                                                        onClick={() => addQuestion(q)}
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        );
                                    })
                                )}

                                {/* Pagination */}
                                {totalQuestions > 20 && (
                                    <div className="flex justify-center gap-2 pt-4">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={page === 1}
                                            onClick={() => setPage((p) => p - 1)}
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>
                                        <span className="text-sm text-gray-500 flex items-center px-2">
                                            Page {page} of {Math.ceil(totalQuestions / 20)}
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={page >= Math.ceil(totalQuestions / 20)}
                                            onClick={() => setPage((p) => p + 1)}
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
