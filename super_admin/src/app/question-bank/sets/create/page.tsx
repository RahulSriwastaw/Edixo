"use client";
import { useSidebarStore } from "@/store/sidebarStore";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Plus,
  Trash2,
  GripVertical,
  Check,
  Copy,
  MessageCircle,
  Mail,
  Layers,
  BookOpen,
  Eye,
  FolderOpen,
  Sparkles,
  Search,
  Filter,
  X,
  ListFilter,
  ChevronLeft
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IDDisplay } from "@/components/set-system/PINEntry";
import { VisibilitySelector } from "@/components/set-system/VisibilitySelector";
import {
  useSetCreationStore,
  useMockTestCreationStore
} from "@/components/set-system/stores/setStore";
import { QuestionSetExportModal } from "@/components/set-system/QuestionSetExportModal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function stripHtml(html?: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, '').replace(/\\[()\\[\]]/g, '').trim();
}

function getToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? match[1] : '';
}

const mapDifficulty = (d: string) => d?.toLowerCase() || 'medium';
const mapType = (t: string) => {
  if (t === 'MCQ_SINGLE') return 'mcq';
  if (t === 'MCQ_MULTIPLE') return 'multi_select';
  if (t === 'DESCRIPTIVE') return 'integer';
  return 'mcq';
};

const FILTER_FIELDS = [
  { value: "subjectName", label: "Subject" },
  { value: "chapterName", label: "Chapter" },
  { value: "exam", label: "Exam" },
  { value: "year", label: "Year" },
  { value: "collection", label: "Collection" },
  { value: "type", label: "Question Type" },
  { value: "difficulty", label: "Difficulty" },
];

const FILTER_OPERATORS = [
  { value: "equals", label: "Equals" },
  { value: "contains", label: "Contains" },
];

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
    mcq: "MCQ",
    integer: "Integer",
    multi_select: "Multi",
  };
  return <Badge className={styles[type] || ""}>{labels[type] || type}</Badge>;
}

export default function CreateSetPage() {
  const { isOpen } = useSidebarStore();
  const router = useRouter();
  const {
    step,
    questions,
    name,
    description,
    subjectId,
    chapterId,
    visibility,
    selectedOrgIds,
    expiresAt,
    createdSet,
    isLoading,
    setStep,
    addQuestions,
    removeQuestion,
    reorderQuestions,
    setName,
    setDescription,
    setSubjectId,
    setChapterId,
    setVisibility,
    toggleOrg,
    setExpiresAt,
    setFolderId,
    submit,
    reset,
  } = useSetCreationStore();

  const { isOpen: isGlobalSidebarOpen, toggle: globalToggle } = useSidebarStore();

  const searchParams = useSearchParams();
  const folderIdParam = searchParams.get("folderId");

  useEffect(() => {
    if (folderIdParam) {
      setFolderId(folderIdParam);
    }
  }, [folderIdParam]);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showExpiry, setShowExpiry] = useState(false);
  const [apiQuestions, setApiQuestions] = useState<any[]>([]);
  const [loadedOrgs, setLoadedOrgs] = useState<any[]>([]);

  // Right side filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [filters, setFilters] = useState<Array<{ id: string, field: string, operator: string, value: string }>>([]);
  const [page, setPage] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isFetchingQuestions, setIsFetchingQuestions] = useState(false);

  // Multi-select state
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());

  // View mode state
  const [viewMode, setViewMode] = useState<"list" | "single">("list");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [prefLang, setPrefLang] = useState<"eng" | "hin">("eng");
  const [showExportModal, setShowExportModal] = useState(false);
  const mockTestStore = useMockTestCreationStore();

  const handleCreateMockTest = () => {
    if (!createdSet) return;
    mockTestStore.reset();
    mockTestStore.initFromSet({
      id: createdSet.id,
      contentId: createdSet.contentId,
      name: createdSet.name,
      questionCount: questions.length,
      password: createdSet.password
    });
    router.push("/mocktests/create-from-sets");
  };

  const handlePreviewSet = () => {
    if (createdSet) {
      router.push(`/question-bank/sets/${createdSet.id}`);
    }
  };

  const addFilter = () => {
    setFilters([...filters, { id: Math.random().toString(36).substr(2, 9), field: "subjectName", operator: "equals", value: "" }]);
  };

  const updateFilter = (id: string, key: string, value: string) => {
    setFilters(filters.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter(f => f.id !== id));
  };

  // Fetch Orgs once
  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const token = getToken();
        const orgRes = await fetch(`${API_URL}/super-admin/organizations?limit=100`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (orgRes.ok) {
          const resData = await orgRes.json();
          setLoadedOrgs(resData.data?.organizations || []);
        }
      } catch (error) {
        console.error("Error fetching orgs:", error);
      }
    };
    fetchOrgs();
  }, []);

  // Fetch Questions when filters change
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsFetchingQuestions(true);
        const token = getToken();
        const url = new URL(`${API_URL}/qbank/questions`);

        if (searchQuery) url.searchParams.append("search", searchQuery);
        if (difficultyFilter !== "all") url.searchParams.append("difficulty", difficultyFilter);
        if (typeFilter !== "all") url.searchParams.append("type", typeFilter);
        if (subjectFilter !== "all") {
          // Basic subject mapping, alternatively use advanced filter
          url.searchParams.append("filters", JSON.stringify([{ field: "subjectName", operator: "equals", value: subjectFilter }]));
        } else if (filters.length > 0) {
          url.searchParams.append("filters", JSON.stringify(filters));
        }

        url.searchParams.append("page", page.toString());
        url.searchParams.append("limit", "20"); // Show 20 at a time for split screen

        const qRes = await fetch(url.toString(), {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (qRes.ok) {
          const resData = await qRes.json();
          const mappedQuestions = (resData.data?.questions || []).map((q: any) => ({
            id: q.id,
            question_eng: q.textEn || q.textHi || 'Untitled',
            question_hin: q.textHi || '',
            type: mapType(q.type),
            subject: q.folder?.name || 'General',
            difficulty: mapDifficulty(q.difficulty),
            visibility: q.isGlobal ? 'public' : 'private',
            pointCost: q.pointCost || 5,
            usageCount: q.usageCount || 0,
            options: q.options || [],
            answer: 'A',
          }));
          setApiQuestions(mappedQuestions);
          setTotalQuestions(resData.data?.total || 0);
          setCurrentQuestionIndex(0);
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setIsFetchingQuestions(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchQuestions();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, difficultyFilter, typeFilter, subjectFilter, filters, page]);

  const handleDragStart = (index: number) => setDraggedIndex(index);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newQuestions = [...questions];
    const draggedQuestion = newQuestions[draggedIndex];
    newQuestions.splice(draggedIndex, 1);
    newQuestions.splice(index, 0, draggedQuestion);
    reorderQuestions(newQuestions);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => setDraggedIndex(null);

  // Handle selection
  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedQuestionIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedQuestionIds(newSet);
  };

  const toggleSelectAll = () => {
    // Only select questions that are not already in the set
    const availableApiQ = apiQuestions.filter(q => !questions.some(sel => sel.id === q.id));
    if (selectedQuestionIds.size === availableApiQ.length && availableApiQ.length > 0) {
      setSelectedQuestionIds(new Set());
    } else {
      setSelectedQuestionIds(new Set(availableApiQ.map(q => q.id)));
    }
  };

  const handleBulkAdd = () => {
    const questionsToAdd = apiQuestions.filter(q => selectedQuestionIds.has(q.id));
    if (questionsToAdd.length > 0) {
      addQuestions(questionsToAdd);
      setSelectedQuestionIds(new Set()); // clear selection after adding
      toast.success(`${questionsToAdd.length} questions added to the set.`);
    }
  };

  const canSubmit = name.trim().length > 0 && questions.length > 0;

  const copyBoth = () => {
    if (createdSet) {
      navigator.clipboard.writeText(`Set ID: ${createdSet.contentId}\nPassword: ${createdSet.password}`);
      toast.success("ID and Password copied!");
    }
  };

  const shareWhatsApp = () => {
    if (createdSet) {
      const text = encodeURIComponent(`📚 ${createdSet.name}\n\nSet ID: ${createdSet.contentId}\nPassword: ${createdSet.password}\n\nAccess at: eduhub.in/access`);
      window.open(`https://wa.me/?text=${text}`, "_blank");
    }
  };

  const shareEmail = () => {
    if (createdSet) {
      const emailSubject = encodeURIComponent(createdSet.name);
      const body = encodeURIComponent(`Hi,\n\nHere's your access to "${createdSet.name}":\n\nSet ID: ${createdSet.contentId}\nPassword: ${createdSet.password}\n\nAccess at: eduhub.in/access\n\nBest regards`);
      window.open(`mailto:?subject=${emailSubject}&body=${body}`, "_blank");
    }
  };

  const handleBackToSets = () => {
    reset();
    router.push("/question-bank/sets");
  };

  if (step === 3 && createdSet) {
    return (
      <div className="min-h-screen bg-neutral-bg">
        <Sidebar />
        <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
          <TopBar />
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto mt-10">
              <Card>
                <CardContent className="p-8 text-center space-y-6">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-10 h-10 text-green-600" />
                    </div>
                    <Sparkles className="w-6 h-6 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
                    <Sparkles className="w-4 h-4 text-amber-400 absolute top-0 -left-2 animate-pulse" />
                    <Sparkles className="w-5 h-5 text-amber-400 absolute -bottom-1 right-0 animate-pulse" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-green-600">✅ SET CREATED SUCCESSFULLY!</h2>
                    <p className="text-gray-600 mt-1">{createdSet.name}</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 max-w-md mx-auto">
                    <IDDisplay label="Set ID" value={createdSet.contentId} />
                    <IDDisplay label="Password" value={createdSet.password} variant="pin" />
                  </div>

                  <div className="flex justify-center gap-3">
                    <Button variant="outline" onClick={copyBoth}>
                      <Copy className="w-4 h-4 mr-2" /> Copy Both
                    </Button>
                    <Button variant="outline" onClick={shareWhatsApp}>
                      <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                    </Button>
                    <Button variant="outline" onClick={shareEmail}>
                      <Mail className="w-4 h-4 mr-2" /> Email
                    </Button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 max-w-md mx-auto pt-4 border-t">
                    <Button variant="outline" className="h-auto py-4 flex-col gap-2 hover:border-[#F4511E] hover:text-[#F4511E] transition-all" onClick={handleCreateMockTest}>
                      <Layers className="w-5 h-5" />
                      <span>Create MockTest</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col gap-2 hover:border-[#F4511E] hover:text-[#F4511E] transition-all" onClick={() => setShowExportModal(true)}>
                      <BookOpen className="w-5 h-5" />
                      <span>Create eBook</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col gap-2 hover:border-[#F4511E] hover:text-[#F4511E] transition-all" onClick={handlePreviewSet}>
                      <Eye className="w-5 h-5" />
                      <span>Preview Set</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col gap-2 hover:border-[#F4511E] hover:text-[#F4511E] transition-all" onClick={handleBackToSets}>
                      <FolderOpen className="w-5 h-5" />
                      <span>My Sets</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Export Modal for "Create eBook" feature */}
              <QuestionSetExportModal
                open={showExportModal}
                onOpenChange={setShowExportModal}
                questionSet={{
                  id: createdSet.id,
                  set_code: createdSet.contentId,
                  name: createdSet.name,
                  description: description || "",
                  subject: "General",
                  chapter: "General",
                  questions: questions.map((q, index) => ({
                    id: q.id,
                    text: stripHtml(q.question_eng || q.question_hin || ''),
                    difficulty: q.difficulty,
                    type: q.type,
                    options: [q.option1_eng, q.option2_eng, q.option3_eng, q.option4_eng].filter(Boolean) as string[],
                    answer: q.answer,
                    explanation: stripHtml(q.solution_eng || q.solution_hin || ''),
                    marks: 2,
                  })),
                }}
              />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isGlobalSidebarOpen ? "ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-white flex justify-between items-center z-10">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Button
                variant="ghost"
                size="icon"
                onClick={globalToggle}
                className="h-8 w-8 text-gray-500 hover:text-gray-900 focus:outline-none"
                title={isGlobalSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
              >
                <Layers className="h-5 w-5" />
              </Button>
              <Link href="/question-bank/sets" className="hover:text-[#F4511E]">Question Sets</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium">Create New Set (Split View)</span>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push("/question-bank/sets")}>
                Cancel
              </Button>
              <Button
                className="bg-[#F4511E] hover:bg-[#E64A19] text-white"
                disabled={!canSubmit || isLoading}
                onClick={submit}
              >
                {isLoading ? "Creating..." : "Create Set"}
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row h-[calc(100vh-130px)]">
            {/* Left Column: Set Builder & Overview */}
            <div className="w-full lg:w-[400px] xl:w-[450px] bg-gray-50 border-r flex flex-col">
              <Tabs defaultValue="questions" className="w-full h-full flex flex-col">
                <div className="px-4 pt-4 border-b bg-white">
                  <TabsList className="w-full grid-cols-2 grid bg-gray-100">
                    <TabsTrigger value="questions">Questions ({questions.length})</TabsTrigger>
                    <TabsTrigger value="details">Set Details</TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <TabsContent value="questions" className="m-0 p-4 space-y-4">
                    {questions.length === 0 ? (
                      <div className="text-center py-12 text-gray-500 bg-white border border-dashed rounded-lg">
                        <Layers className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">No questions selected.</p>
                        <p className="text-xs mt-1">Select from the right panel to add.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {questions.map((question, index) => (
                          <div
                            key={question.id}
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
                                <span className="text-xs font-semibold text-gray-500 mt-0.5">Q{index + 1}.</span>
                                <div className="text-sm text-gray-800 line-clamp-2">
                                  {stripHtml(question.question_eng || question.question_hin || '')}
                                </div>
                              </div>
                              <button
                                onClick={() => removeQuestion(question.id)}
                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex items-center gap-2 pl-6">
                              <TypeBadge type={question.type} />
                              <DifficultyBadge difficulty={question.difficulty} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="details" className="m-0 p-4 space-y-4">
                    <Card className="border-0 shadow-none bg-transparent">
                      <CardContent className="p-0 space-y-4">
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
                          <label className="text-xs font-medium text-gray-700">Subject</label>
                          <Select value={subjectId} onValueChange={setSubjectId}>
                            <SelectTrigger className="mt-1 bg-white">
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="physics">Physics</SelectItem>
                              <SelectItem value="chemistry">Chemistry</SelectItem>
                              <SelectItem value="mathematics">Mathematics</SelectItem>
                              <SelectItem value="biology">Biology</SelectItem>
                              <SelectItem value="general">General</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <VisibilitySelector value={visibility} onChange={setVisibility} />

                        {visibility === "org_only" && (
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-700">Select Organizations</label>
                            <div className="space-y-2 max-h-40 overflow-y-auto bg-white p-2 rounded-lg border">
                              {loadedOrgs.map((org) => (
                                <label key={org.id} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={selectedOrgIds.includes(org.id)}
                                    onChange={() => toggleOrg(org.id)}
                                    className="w-4 h-4 text-[#F4511E] rounded accent-[#F4511E]"
                                  />
                                  <div className="flex flex-col">
                                    <span className="text-sm">{org.name}</span>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="text-xs font-medium text-gray-700">Description</label>
                          <Textarea
                            placeholder="Brief description..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-1 bg-white"
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2 bg-white p-3 rounded-lg border">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">Set Expiry</label>
                            <Switch checked={showExpiry} onCheckedChange={setShowExpiry} />
                          </div>
                          {showExpiry && (
                            <Input
                              type="datetime-local"
                              value={expiresAt?.toISOString().slice(0, 16) || ""}
                              onChange={(e) => setExpiresAt(new Date(e.target.value))}
                            />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            {/* Right Column: Question Bank Browser */}
            <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
              {/* Search & Filters Header */}
              <div className="p-4 border-b space-y-3 bg-gray-50/50">
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search questions by text or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-white"
                    />
                  </div>
                  <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                    <SelectTrigger className="w-[140px] bg-white">
                      <SelectValue placeholder="Subject" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">All Subjects</SelectItem>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Chemistry">Chemistry</SelectItem>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                    </SelectContent>
                  </Select>
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

                {/* Advanced Filters */}
                <div className="bg-white rounded border flex flex-col gap-2 p-2 shadow-sm">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                      <ListFilter className="w-3 h-3" /> Advanced Filters
                    </h4>
                    <Button variant="ghost" size="sm" onClick={addFilter} className="h-6 text-xs text-[#F4511E] hover:text-[#E64A19] hover:bg-orange-50 px-2">
                      <Plus className="w-3 h-3 mr-1" /> Add Rule
                    </Button>
                  </div>
                  {filters.length > 0 && (
                    <div className="space-y-2 bg-gray-50 p-2 rounded border border-gray-100">
                      {filters.map((filter) => (
                        <div key={filter.id} className="flex flex-wrap items-center gap-2">
                          <Select value={filter.field} onValueChange={(val) => updateFilter(filter.id, "field", val)}>
                            <SelectTrigger className="w-[140px] h-8 text-xs bg-white"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-white">
                              {FILTER_FIELDS.map(f => (<SelectItem key={f.value} value={f.value} className="text-xs">{f.label}</SelectItem>))}
                            </SelectContent>
                          </Select>
                          <Select value={filter.operator} onValueChange={(val) => updateFilter(filter.id, "operator", val)}>
                            <SelectTrigger className="w-[120px] h-8 text-xs bg-white"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-white">
                              {FILTER_OPERATORS.map(f => (<SelectItem key={f.value} value={f.value} className="text-xs">{f.label}</SelectItem>))}
                            </SelectContent>
                          </Select>
                          <Input
                            className="flex-1 min-w-[150px] h-8 text-xs bg-white"
                            placeholder="Value..."
                            value={filter.value}
                            onChange={(e) => updateFilter(filter.id, "value", e.target.value)}
                          />
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50" onClick={() => removeFilter(filter.id)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Selection Action Bar */}
              <div className="px-4 py-2 border-b bg-gray-50 flex items-center justify-between shadow-sm z-10 sticky top-0">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="select-all"
                    checked={
                      apiQuestions.length > 0 &&
                      apiQuestions.filter(q => !questions.some(sel => sel.id === q.id)).length > 0 &&
                      selectedQuestionIds.size === apiQuestions.filter(q => !questions.some(sel => sel.id === q.id)).length
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                  <div className="flex items-center gap-2">
                    <label htmlFor="select-all" className="text-xs font-semibold text-gray-700 cursor-pointer uppercase tracking-wider">
                      Select All Visible
                    </label>
                    {selectedQuestionIds.size > 0 && (
                      <Badge variant="secondary" className="px-1.5 py-0 h-5 text-[10px] bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">
                        {selectedQuestionIds.size}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex bg-white rounded-md border shadow-sm p-0.5">
                    <button
                      onClick={() => setViewMode("list")}
                      className={cn("px-2 py-1 text-xs font-medium rounded-sm flex items-center gap-1 transition-colors", viewMode === "list" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-700")}
                    >
                      <ListFilter className="w-3 h-3" /> List
                    </button>
                    <button
                      onClick={() => setViewMode("single")}
                      className={cn("px-2 py-1 text-xs font-medium rounded-sm flex items-center gap-1 transition-colors", viewMode === "single" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-700")}
                    >
                      <Eye className="w-3 h-3" /> Single
                    </button>
                  </div>
                  <Button
                    size="sm"
                    disabled={selectedQuestionIds.size === 0}
                    onClick={handleBulkAdd}
                    className="h-8 bg-[#F4511E] hover:bg-[#E64A19] text-white shadow-sm"
                  >
                    <Plus className="w-3 h-3 mr-1.5" /> Add Selected
                  </Button>
                </div>
              </div>

              {/* Question List */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
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
                ) : viewMode === "single" ? (
                  <div className="flex flex-col h-full max-h-[100%]">
                    {apiQuestions[currentQuestionIndex] && (() => {
                      const q = apiQuestions[currentQuestionIndex];
                      const isAlreadyAdded = questions.some(sel => sel.id === q.id);
                      return (
                        <Card className={cn("transition-colors flex flex-col h-full", isAlreadyAdded ? "border-[#F4511E] bg-orange-50/10" : "border-gray-200")}>
                          <CardContent className="p-4 sm:p-6 flex-1 flex flex-col items-stretch overflow-hidden">
                            <div className="flex justify-between items-start mb-4 pb-4 border-b shrink-0">
                              <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">ID: {q.id.substring(0, 8)}</span>
                                <span className="font-semibold text-[#F4511E] uppercase tracking-wider text-xs bg-orange-50 px-2 py-1 rounded border border-orange-100">{q.subject}</span>
                              </div>
                              <div className="flex gap-2 items-center">
                                <TypeBadge type={q.type} />
                                <DifficultyBadge difficulty={q.difficulty} />
                              </div>
                            </div>

                            <div className="flex-1 overflow-y-auto mb-4 pr-2">
                              <div className="flex justify-between items-center mb-3">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Question {currentQuestionIndex + 1} of {apiQuestions.length}</h3>
                                {(q.question_hin || q.options?.some((opt: any) => opt.textHi)) && (
                                  <div className="flex bg-gray-100 rounded-md p-0.5">
                                    <button
                                      onClick={() => setPrefLang("eng")}
                                      className={cn("px-2 py-1 text-[10px] font-bold rounded-sm uppercase tracking-wider transition-colors", prefLang === "eng" ? "bg-white text-[#F4511E] shadow-sm" : "text-gray-500 hover:text-gray-700")}
                                    >
                                      English
                                    </button>
                                    <button
                                      onClick={() => setPrefLang("hin")}
                                      className={cn("px-2 py-1 text-[10px] font-bold rounded-sm uppercase tracking-wider transition-colors", prefLang === "hin" ? "bg-white text-[#F4511E] shadow-sm" : "text-gray-500 hover:text-gray-700")}
                                    >
                                      Hindi
                                    </button>
                                  </div>
                                )}
                              </div>
                              <div className="text-base text-gray-800 leading-relaxed mb-6">
                                {stripHtml((prefLang === "hin" && q.question_hin) ? q.question_hin : q.question_eng)}
                              </div>

                              {q.options && q.options.length > 0 && (
                                <div className="space-y-3 mt-4">
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Options</h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {q.options.map((opt: any, i: number) => {
                                      const isCorrect = opt.isCorrect;
                                      const optionText = (prefLang === "hin" && opt.textHi) ? opt.textHi : opt.textEn;
                                      return (
                                        <div
                                          key={opt.id || i}
                                          className={cn(
                                            "flex items-start gap-3 p-3 rounded-lg border",
                                            isCorrect ? "bg-green-50/50 border-green-200" : "bg-gray-50 border-gray-100"
                                          )}
                                        >
                                          <div className={cn(
                                            "w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold mt-0.5",
                                            isCorrect ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                                          )}>
                                            {String.fromCharCode(65 + i)}
                                          </div>
                                          <div className="text-sm flex-1">
                                            {stripHtml(optionText || '')}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="pt-4 border-t flex flex-wrap gap-3 items-center justify-between shrink-0">
                              <Button
                                variant="outline"
                                disabled={currentQuestionIndex === 0}
                                onClick={() => setCurrentQuestionIndex(i => i - 1)}
                              >
                                <ChevronLeft className="w-4 h-4 mr-2" /> Prev
                              </Button>

                              <div className="flex gap-3 flex-1 justify-center">
                                {isAlreadyAdded ? (
                                  <Button
                                    variant="outline"
                                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                    onClick={() => removeQuestion(q.id)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" /> Remove from Set
                                  </Button>
                                ) : (
                                  <Button
                                    className="bg-[#F4511E] hover:bg-[#E64A19] text-white"
                                    onClick={() => addQuestions([q])}
                                  >
                                    <Plus className="w-4 h-4 mr-2" /> Add to Set
                                  </Button>
                                )}
                              </div>

                              <Button
                                variant="outline"
                                disabled={currentQuestionIndex === apiQuestions.length - 1}
                                onClick={() => setCurrentQuestionIndex(i => i + 1)}
                              >
                                Next <ChevronRight className="w-4 h-4 ml-2" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {apiQuestions.map((q) => {
                      const isAlreadyAdded = questions.some(sel => sel.id === q.id);
                      const isSelected = selectedQuestionIds.has(q.id);
                      return (
                        <Card key={q.id} className={cn("transition-colors", isAlreadyAdded ? "border-[#F4511E] bg-orange-50/50" : isSelected ? "border-blue-400 bg-blue-50/50 shadow-md ring-1 ring-blue-400" : "hover:border-gray-300 shadow-sm")}>
                          <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-start">
                            <div className="pt-1 w-5 shrink-0">
                              {!isAlreadyAdded ? (
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => toggleSelection(q.id)}
                                  className={isSelected ? "border-blue-500 data-[state=checked]:bg-blue-500" : ""}
                                />
                              ) : (
                                <div className="w-4 h-4 rounded mt-0.5 bg-[#F4511E] flex items-center justify-center">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 space-y-3 min-w-0 pr-2">
                              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-gray-600">ID: {q.id.substring(0, 8)}</span>
                                <span className="text-gray-300">•</span>
                                <span className="font-semibold text-[#F4511E] uppercase tracking-wider text-[10px] bg-orange-50 px-2 py-0.5 rounded border border-orange-100">{q.subject}</span>
                              </div>
                              <div className="text-sm text-gray-800 leading-relaxed font-medium">
                                {stripHtml(q.question_eng || q.question_hin || '')}
                              </div>
                              <div className="flex gap-2 items-center">
                                <TypeBadge type={q.type} />
                                <DifficultyBadge difficulty={q.difficulty} />
                              </div>
                            </div>
                            <div className="flex-shrink-0 w-full md:w-auto flex justify-end">
                              {isAlreadyAdded ? (
                                <Button
                                  variant="outline"
                                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 w-full md:w-auto"
                                  onClick={() => removeQuestion(q.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" /> Remove
                                </Button>
                              ) : (
                                <Button
                                  className="bg-white border-[#F4511E] text-[#F4511E] hover:bg-[#F4511E] hover:text-white border w-full md:w-auto"
                                  onClick={() => addQuestions([q])}
                                >
                                  <Plus className="w-4 h-4 mr-2" /> Add to Set
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pagination */}
              <div className="p-4 border-t bg-white flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {apiQuestions.length} of {totalQuestions} questions
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={apiQuestions.length < 20}
                    onClick={() => setPage(page + 1)}
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
