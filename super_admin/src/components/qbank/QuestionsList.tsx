"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Papa from "papaparse";
import {
  Search,
  Plus,
  Sparkles,
  Upload,
  Download,
  Filter,
  X,
  MoreHorizontal,
  Eye,
  Pencil,
  Copy,
  Trash2,
  Lock,
  Globe,
  Coins,
  ChevronLeft,
  ChevronRight,
  Languages,
  CheckCircle,
  Layers,
  Check,
  ListFilter,
  Network,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";

import { API_URL, getAuthHeaders } from "@/lib/api-config";

const FILTER_FIELDS = [
  { value: "subjectName", label: "Subject" },
  { value: "chapterName", label: "Chapter" },
  { value: "exam", label: "Exam" },
  { value: "year", label: "Year" },
  { value: "collection", label: "Collection" },
  { value: "type", label: "Question Type" },
  { value: "difficulty", label: "Difficulty" },
  { value: "pointCost", label: "Points" },
  { value: "usageCount", label: "Usage Count" },
  { value: "questionUniqueId", label: "Unique ID" },
  { value: "isApproved", label: "Is Approved" },
];

const FILTER_OPERATORS = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Does not equal" },
  { value: "contains", label: "Contains" },
  { value: "doesNotContain", label: "Does not contain" },
  { value: "startsWith", label: "Starts with" },
  { value: "endsWith", label: "Ends with" },
  { value: "isEmpty", label: "Is empty" },
  { value: "isNotEmpty", label: "Is not empty" },
];

// getToken removed



// Type Badge Component
function TypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    mcq: "bg-blue-50 text-blue-700",
    integer: "bg-green-50 text-green-700",
    multi_select: "bg-purple-50 text-purple-700",
    true_false: "bg-amber-50 text-amber-700",
  };
  const labels: Record<string, string> = {
    mcq: "MCQ",
    integer: "Integer",
    multi_select: "Multi-select",
    true_false: "True/False",
  };
  return <Badge className={styles[type] || ""}>{labels[type] || type}</Badge>;
}

// Difficulty Badge Component
function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const styles: Record<string, string> = {
    easy: "bg-green-50 text-green-700",
    medium: "bg-amber-50 text-amber-700",
    hard: "bg-red-50 text-red-700",
  };
  return <Badge className={styles[difficulty] || ""}>{difficulty}</Badge>;
}

// Visibility Toggle Component
function VisibilityToggle({ visibility }: { visibility: string }) {
  const isPublic = visibility === "public";
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${isPublic ? 'bg-orange-50' : 'bg-gray-100'}`}>
      {isPublic ? (
        <Globe className="w-3.5 h-3.5 text-orange-600" />
      ) : (
        <Lock className="w-3.5 h-3.5 text-gray-500" />
      )}
      <span className={`text-xs font-medium ${isPublic ? 'text-orange-600' : 'text-gray-600'}`}>
        {isPublic ? 'Public' : 'Private'}
      </span>
    </div>
  );
}

// Strip HTML tags for preview
function stripHtml(html?: string, truncate = false): string {
  if (!html) return "";
  let text = html.replace(/<[^>]*>?/gm, '').replace(/\\[()\\[\]]/g, '').trim();
  if (truncate) {
    text = text.slice(0, 150) + (text.length > 150 ? '...' : '');
  }
  return text;
}



export function QuestionsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folderId");
  const isImportMode = searchParams.get("import") === "true";

  useEffect(() => {
    if (isImportMode) {
      setShowImportDialog(true);
    }
  }, [isImportMode]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionSets, setQuestionSets] = useState<any[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState("all");

  // Advanced Filters & Grouping state
  const [filters, setFilters] = useState<Array<{ id: string, field: string, operator: string, value: string }>>([]);
  const [groupBy, setGroupBy] = useState<string>("none");
  const [showFilterDialog, setShowFilterDialog] = useState(false);

  const addFilter = () => {
    setFilters([...filters, { id: Math.random().toString(36).substr(2, 9), field: "subjectName", operator: "equals", value: "" }]);
  };

  const updateFilter = (id: string, key: string, value: string) => {
    setFilters(filters.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter(f => f.id !== id));
  };

  const [previewQuestion, setPreviewQuestion] = useState<any | null>(null);
  const [previewLang, setPreviewLang] = useState<"hin" | "eng">("eng");
  const [showAddToSetDialog, setShowAddToSetDialog] = useState(false);
  const [selectedSetId, setSelectedSetId] = useState<string>("");
  const [questionSetSearchQuery, setQuestionSetSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = getAuthHeaders();
        setIsLoading(true);
        const url = new URL(`${API_URL}/qbank/questions`);
        if (scopeFilter !== "all") url.searchParams.append("scope", scopeFilter);
        if (searchQuery) url.searchParams.append("search", searchQuery);
        if (difficultyFilter !== "all") url.searchParams.append("difficulty", difficultyFilter);
        if (typeFilter !== "all") url.searchParams.append("type", typeFilter);

        // Add advanced filters and grouping
        if (filters.length > 0) {
          url.searchParams.append("filters", JSON.stringify(filters));
        }
        if (groupBy !== "none") url.searchParams.append("groupBy", groupBy);

        url.searchParams.append("page", page.toString());
        url.searchParams.append("limit", "10");

        const [qRes, sRes] = await Promise.all([
          fetch(url.toString(), { headers }),
          fetch(`${API_URL}/qbank/sets`, { headers })
        ]);

        if (qRes.ok) {
          const qData = await qRes.json();
          setQuestions(qData.data?.questions || []);
          setTotalQuestions(qData.data?.total || 0);
        }
        if (sRes.ok) {
          const sData = await sRes.json();
          setQuestionSets(sData.data?.sets || []);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [searchQuery, scopeFilter, difficultyFilter, typeFilter, page, filters, groupBy]);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importRows, setImportRows] = useState<any[]>([]);
  const [importPreview, setImportPreview] = useState<any[] | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [createSetFromImport, setCreateSetFromImport] = useState(true);

  const allSelected = selectedQuestions.length === questions.length;
  const someSelected = selectedQuestions.length > 0 && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(questions.map((q) => q.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedQuestions.includes(id)) {
      setSelectedQuestions(selectedQuestions.filter((qId) => qId !== id));
    } else {
      setSelectedQuestions([...selectedQuestions, id]);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSubjectFilter("all");
    setDifficultyFilter("all");
    setTypeFilter("all");
    setScopeFilter("all");
    setFilters([]);
    setGroupBy("none");
    setPage(1);
  };

  const hasActiveFilters = searchQuery || subjectFilter !== "all" || difficultyFilter !== "all" || typeFilter !== "all" || scopeFilter !== "all" || filters.length > 0 || groupBy !== "none";

  // Filter questions
  const filteredQuestions = questions; // Fetching is already filtered by backend

  // Map backend questions to subjects list
  const subjects = [...new Set(questions.map(q => q.folder?.name || "Uncategorized"))];

  // Grouping logic for Render
  let renderGroups: { group: string, items: any[] }[] = [];
  if (groupBy !== "none") {
    const grouped = filteredQuestions.reduce((acc, q) => {
      let val = q[groupBy];
      if (val === null || val === undefined) val = "Uncategorized";
      if (typeof val === 'boolean') val = val ? "True" : "False";
      val = String(val);

      if (!acc[val]) acc[val] = [];
      acc[val].push(q);
      return acc;
    }, {} as Record<string, any[]>);
    renderGroups = Object.keys(grouped).sort().map((k) => ({ group: k, items: grouped[k] }));
  } else {
    renderGroups = [{ group: "all", items: filteredQuestions }];
  }

  // Filter question sets
  const filteredSets = questionSets.filter(set =>
    set.name.toLowerCase().includes(questionSetSearchQuery.toLowerCase()) ||
    set.code.toLowerCase().includes(questionSetSearchQuery.toLowerCase())
  );

  // Handle add to set
  const handleAddToSet = () => {
    if (!selectedSetId) {
      toast.error("Please select a question set");
      return;
    }
    const selectedSet = questionSets.find(s => s.id === selectedSetId);
    toast.success(`Added ${selectedQuestions.length} questions to "${selectedSet?.name}"`);
    setShowAddToSetDialog(false);
    setSelectedSetId("");
    setQuestionSetSearchQuery("");
    setSelectedQuestions([]);
  };

  // Handle CSV file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setImportFile(file);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setImportRows(results.data);
        setImportPreview(results.data.slice(0, 5));
      },
      error: (error) => {
        toast.error(`Error parsing CSV: ${error.message}`);
      }
    });
  };

  // Handle CSV import
  const handleImport = async () => {
    if (!importFile || importRows.length === 0) return;

    setImportLoading(true);
    try {
      const response = await fetch(`${API_URL}/qbank/bulk-upload`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          fileName: importFile.name,
          rows: importRows,
          folderId: folderId,
          createSet: createSetFromImport
        })
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        toast.success(`Successfully imported ${resData.data.savedCount} questions`);
        if (resData.data.failedCount > 0) {
          toast.warning(`${resData.data.failedCount} rows failed to import`);
        }
        setShowImportDialog(false);
        setImportFile(null);
        setImportPreview(null);
        setImportRows([]);
        // Refresh
        window.location.reload();
      } else {
        toast.error(resData.message || "Failed to import questions");
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("An error occurred during import");
    } finally {
      setImportLoading(false);
    }
  };

  // Download CSV template
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

  return (
    <div className="flex-1 w-full relative">

      <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Questions</h1>
            <p className="text-gray-500 text-sm mt-1">
              {questions.length.toLocaleString()} questions — Bilingual content (Hindi & English)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/question-bank/ai-generate">
              <Button variant="outline" className="btn-secondary">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Generate
              </Button>
            </Link>
            <Button variant="outline" className="btn-secondary" onClick={() => setShowImportDialog(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
            <Link href="/question-bank/create">
              <Button className="bg-[#F4511E] hover:bg-[#E64A19] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Question
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 input-field"
                />
              </div>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-[130px] input-field">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map(s => (
                    <SelectItem key={String(s)} value={String(s)}>{String(s)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-[120px] input-field">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[130px] input-field">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="mcq">MCQ</SelectItem>
                  <SelectItem value="integer">Integer</SelectItem>
                  <SelectItem value="multi_select">Multi-select</SelectItem>
                  <SelectItem value="true_false">True/False</SelectItem>
                </SelectContent>
              </Select>
              <Select value={scopeFilter} onValueChange={setScopeFilter}>
                <SelectTrigger className="w-[140px] input-field">
                  <SelectValue placeholder="Scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Questions</SelectItem>
                  <SelectItem value="global">Global Bank</SelectItem>
                  <SelectItem value="mine">Super Admin</SelectItem>
                  <SelectItem value="public">Other Public</SelectItem>
                </SelectContent>
              </Select>

              {/* Group By Dropdown */}
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger className="w-[150px] input-field bg-brand-primary/5 border-brand-primary/20 text-brand-primary font-medium">
                  <Network className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Group By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Grouping</SelectItem>
                  <SelectItem value="subjectName">Subject</SelectItem>
                  <SelectItem value="chapterName">Chapter</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                  <SelectItem value="collection">Collection</SelectItem>
                  <SelectItem value="type">Question Type</SelectItem>
                  <SelectItem value="difficulty">Difficulty</SelectItem>
                </SelectContent>
              </Select>

              {/* Advanced Filter Button */}
              <Button
                variant="outline"
                onClick={() => setShowFilterDialog(true)}
                className={`gap-2 ${filters.length > 0 ? 'bg-orange-50 border-orange-200 text-orange-700' : ''}`}
              >
                <ListFilter className="w-4 h-4" />
                Filters {filters.length > 0 && <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center bg-orange-600 rounded-full text-[10px]">{filters.length}</Badge>}
              </Button>

              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters} className="btn-ghost">
                  <X className="w-4 h-4 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bulk Action Bar */}
        {selectedQuestions.length > 0 && (
          <div className="bg-brand-primary-tint border border-brand-primary/20 rounded-lg px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                {selectedQuestions.length} selected
              </span>
              <Button variant="outline" size="sm" className="bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100">
                <Globe className="w-4 h-4 mr-1" />
                Make Public
              </Button>
              <Button variant="outline" size="sm" className="bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100">
                <Lock className="w-4 h-4 mr-1" />
                Make Private
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowAddToSetDialog(true)}>
                <Layers className="w-4 h-4 mr-1" />
                Add to Set
              </Button>
              <Button variant="outline" size="sm">
                <Coins className="w-4 h-4 mr-1" />
                Set Point Cost
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedQuestions([])}>
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>
        )}

        {/* Questions Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase">Question</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase">Type</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase">Subject → Chapter</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase">Difficulty</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase">Visibility</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase text-center">Points</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase text-center">Usage</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderGroups.map((groupObj) => (
                  <React.Fragment key={groupObj.group}>
                    {groupBy !== "none" && (
                      <TableRow className="bg-gray-100/80 hover:bg-gray-100/80">
                        <TableCell colSpan={9} className="py-2.5">
                          <div className="flex items-center gap-2 font-semibold text-gray-800">
                            <span className="bg-white border rounded px-2 py-0.5 text-xs shadow-sm uppercase tracking-wide">
                              {groupBy}
                            </span>
                            {groupObj.group}
                            <span className="text-gray-400 text-xs font-normal">({groupObj.items.length})</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {groupObj.items.map((question) => (
                      <TableRow
                        key={question.id}
                        className={`hover:bg-brand-primary-tint cursor-pointer ${selectedQuestions.includes(question.id) ? 'bg-brand-primary-tint' : ''}`}
                        onClick={() => { setPreviewQuestion(question); setPreviewLang("eng"); }}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedQuestions.includes(question.id)}
                            onCheckedChange={() => toggleSelect(question.id)}
                            aria-label={`Select question ${question.id}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-purple-50 text-purple-600 text-[10px] shrink-0">
                              <Languages className="w-3 h-3 mr-1" /> अ/A
                            </Badge>
                            <span className="text-sm text-gray-700 line-clamp-2 max-w-[280px]">
                              {stripHtml(question.textEn || question.textHi || "", true)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <TypeBadge type={question.type.toLowerCase()} />
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="text-gray-900">{question.folder?.name || question.subjectName || "Uncategorized"}</span>
                            {(question.chapterName) && <span className="text-gray-500 block text-xs">↳ {question.chapterName}</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DifficultyBadge difficulty={question.difficulty.toLowerCase()} />
                        </TableCell>
                        <TableCell>
                          <VisibilityToggle visibility={question.isGlobal ? "global" : (question.isApproved ? "public" : "private")} />
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600">
                            <Coins className="w-3 h-3" />
                            {question.pointCost}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-sm text-gray-600">
                          {question.usageCount}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setPreviewQuestion(question); setPreviewLang("eng"); }}>
                                <Eye className="w-4 h-4 mr-2" /> Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/question-bank/questions/${question.id}/edit`)}>
                                <Pencil className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="w-4 h-4 mr-2" /> Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
                {filteredQuestions.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="w-8 h-8 text-gray-300 mb-2" />
                        <p>No questions found matching your filters.</p>
                        <Button variant="link" onClick={clearFilters}>Clear all filters</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {totalQuestions === 0 ? 0 : (page - 1) * 10 + 1}–{Math.min(page * 10, totalQuestions)} of {totalQuestions}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Prev
            </Button>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="w-8 h-8 p-0 bg-[#F4511E] text-white hover:bg-[#E64A19]">
                {page}
              </Button>
            </div>
            <Button variant="outline" size="sm" disabled={page * 10 >= totalQuestions} onClick={() => setPage(page + 1)}>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>


      {/* Question Preview Dialog */}
      <Dialog open={!!previewQuestion} onOpenChange={() => setPreviewQuestion(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Question Preview</DialogTitle>
                <DialogDescription>
                  Question ID: {previewQuestion?.id}
                </DialogDescription>
              </div>
              <Tabs value={previewLang} onValueChange={(v) => setPreviewLang(v as "hin" | "eng")}>
                <TabsList className="h-8">
                  <TabsTrigger value="hin" className="h-7 text-xs px-3">🇮🇳 Hindi</TabsTrigger>
                  <TabsTrigger value="eng" className="h-7 text-xs px-3">🇬🇧 English</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex flex-wrap gap-2">
              <TypeBadge type={previewQuestion?.type?.toLowerCase() || ""} />
              <DifficultyBadge difficulty={previewQuestion?.difficulty?.toLowerCase() || ""} />
              <VisibilityToggle visibility={previewQuestion?.isGlobal ? "global" : (previewQuestion?.isApproved ? "public" : "private")} />
            </div>
            <div className="text-sm text-gray-500">
              {previewQuestion?.folder?.name || "Uncategorized"}
            </div>

            {/* Question Text */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-gray-900 font-medium whitespace-pre-wrap">
                {stripHtml(previewLang === "hin" ? previewQuestion?.textHi : previewQuestion?.textEn)}
              </div>
            </div>

            {/* Options */}
            {previewQuestion?.type?.toLowerCase() === "mcq_single" && previewQuestion.options && (
              <div className="space-y-2">
                {previewQuestion.options.map((option: any, i: number) => {
                  const letter = String.fromCharCode(65 + i);
                  const optText = previewLang === "hin" ? (option.textHi || "") : (option.textEn || "");
                  const isCorrect = option.isCorrect;
                  return (
                    <div
                      key={option.id || i}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${isCorrect ? "border-green-500 bg-green-50" : "border-gray-200"}`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isCorrect ? "bg-green-500 text-white" : "border border-gray-300"}`}>
                        {isCorrect ? <CheckCircle className="w-4 h-4" /> : letter}
                      </div>
                      <span className={isCorrect ? "text-green-700 font-medium" : "text-gray-700"}>
                        {stripHtml(optText)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Integer Answer */}
            {previewQuestion?.type?.toLowerCase() === "integer" && (
              <div className="p-3 bg-green-50 border border-green-500 rounded-lg">
                <span className="text-green-700 font-medium">Answer: {previewQuestion.answer || "N/A"}</span>
              </div>
            )}

            {/* Solution */}
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700 font-medium mb-1">💡 Solution</p>
              <div
                className="text-sm prose prose-sm max-w-none"
              >
                {stripHtml(previewLang === "hin" ? previewQuestion?.solution_hin : previewQuestion?.solution_eng)}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Coins className="w-4 h-4 text-orange-500" />
                  {previewQuestion?.pointCost} points per use
                </span>
                <span>Used {previewQuestion?.usageCount} times</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => router.push(`/question-bank/questions/${previewQuestion?.id}/edit`)}>
                  <Pencil className="w-4 h-4 mr-1" /> Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-1" /> Duplicate
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add to Set Dialog */}
      <Dialog open={showAddToSetDialog} onOpenChange={setShowAddToSetDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add to Question Set</DialogTitle>
            <DialogDescription>
              Add {selectedQuestions.length} selected questions to an existing question set.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search question sets..."
                value={questionSetSearchQuery}
                onChange={(e) => setQuestionSetSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Set List */}
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredSets.map((set) => (
                <button
                  key={set.id}
                  onClick={() => setSelectedSetId(set.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${selectedSetId === set.id
                    ? "border-[#F4511E] bg-orange-50 ring-1 ring-[#F4511E]"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedSetId === set.id
                        ? "border-[#F4511E] bg-[#F4511E]"
                        : "border-gray-300"
                        }`}>
                        {selectedSetId === set.id && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{set.name}</p>
                        <p className="text-xs text-gray-500">{set.code} • {set.questions} questions</p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              {filteredSets.length === 0 && (
                <div className="text-center py-6 text-gray-500 text-sm">
                  No question sets found
                </div>
              )}
            </div>

            {/* Selected count */}
            <div className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-gray-600">Questions to add:</span>
              <Badge className="bg-[#F4511E]">{selectedQuestions.length}</Badge>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddToSetDialog(false);
              setSelectedSetId("");
              setQuestionSetSearchQuery("");
            }}>
              Cancel
            </Button>
            <Button
              className="bg-[#F4511E] hover:bg-[#E64A19] text-white"
              onClick={handleAddToSet}
              disabled={!selectedSetId}
            >
              <Layers className="w-4 h-4 mr-2" />
              Add to Set
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import CSV Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Upload className="w-5 h-5 text-[#F4511E]" />
              Import Questions from CSV
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Select or drop a CSV file following our bilingual template.
              {folderId && (
                <span className="block mt-1 font-semibold text-[#F4511E] bg-orange-50 px-2 py-1 rounded inline-block">
                  Target Folder: {folderId.substring(0, 8)}...
                </span>
              )}
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
                <Download className="w-4 h-4 mr-2 sm:hidden" />
                Download Template
              </Button>
            </div>

            {/* File Upload Area */}
            {!importFile ? (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 text-center hover:border-[#F4511E] transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <Upload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-3 sm:mb-4" />
                  <p className="font-medium text-gray-900 mb-1 text-sm sm:text-base">Click to upload CSV file</p>
                  <p className="text-xs sm:text-sm text-gray-500">or drag and drop</p>
                  <p className="text-xs text-gray-400 mt-2">.CSV files only</p>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Selected File */}
                <div className="flex items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-green-900 text-sm sm:text-base truncate">{importFile.name}</p>
                      <p className="text-xs sm:text-sm text-green-700">{(importFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                    onClick={() => {
                      setImportFile(null);
                      setImportPreview(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Preview Table */}
                {importPreview && importPreview.length > 0 && (
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Preview (first {importPreview.length} rows)
                    </p>
                    <div className="overflow-x-auto border rounded-lg -mx-4 sm:mx-0">
                      <div className="inline-block min-w-full align-middle">
                        <table className="w-full text-xs sm:text-sm min-w-[500px]">
                          <thead className="bg-gray-50">
                            <tr>
                              {Object.keys(importPreview[0]).slice(0, 6).map((key) => (
                                <th key={key} className="p-2 sm:p-3 text-left font-medium text-gray-500 border-b whitespace-nowrap">
                                  {key.replace(/_/g, ' ')}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {importPreview.map((row, i) => (
                              <tr key={i} className="border-b hover:bg-gray-50">
                                {Object.values(row).slice(0, 6).map((val, j) => (
                                  <td key={j} className="p-2 sm:p-3 text-gray-700">
                                    <span className="block max-w-[120px] sm:max-w-[180px] truncate">
                                      {String(val).slice(0, 25)}{String(val).length > 25 ? '...' : ''}
                                    </span>
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center sm:text-left">
                      ← Scroll horizontally to see more columns →
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Required Columns Info */}
            <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 sm:p-4">
              <p className="font-medium text-gray-700 mb-2">Required columns:</p>
              <div className="flex flex-wrap gap-1.5">
                {['question_eng', 'question_hin', 'type', 'subject', 'chapter', 'difficulty', 'answer'].map((col) => (
                  <Badge key={col} variant="outline" className="text-xs bg-white">
                    {col}
                  </Badge>
                ))}
              </div>
              <p className="mt-2 text-gray-400">
                MCQ ke liye: option1_eng, option1_hin, option2_eng, option2_hin, etc.
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowImportDialog(false);
                setImportFile(null);
                setImportPreview(null);
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              className="bg-[#F4511E] hover:bg-[#E64A19] text-white w-full sm:w-auto"
              onClick={handleImport}
              disabled={!importFile || importLoading}
            >
              {importLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Questions
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Advanced Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListFilter className="w-5 h-5 text-orange-600" />
              Advanced Filters
            </DialogTitle>
            <DialogDescription>
              Build complex queries to filter your questions across all available fields.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 min-h-[30vh]">
            {filters.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 border border-dashed rounded-lg">
                <p className="text-gray-500 mb-4">No filters applied. Add a rule to get started.</p>
                <Button variant="outline" onClick={addFilter} className="bg-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Filter Rule
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filters.map((filter, index) => (
                  <div key={filter.id} className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-gray-50 p-3 rounded-lg border">
                    <span className="text-xs font-semibold text-gray-500 w-12 text-center shrink-0">
                      {index === 0 ? "WHERE" : "AND"}
                    </span>
                    <Select value={filter.field} onValueChange={(val) => updateFilter(filter.id, "field", val)}>
                      <SelectTrigger className="w-[160px] bg-white">
                        <SelectValue placeholder="Field" />
                      </SelectTrigger>
                      <SelectContent>
                        {FILTER_FIELDS.map(f => (
                          <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={filter.operator} onValueChange={(val) => updateFilter(filter.id, "operator", val)}>
                      <SelectTrigger className="w-[160px] bg-white">
                        <SelectValue placeholder="Operator" />
                      </SelectTrigger>
                      <SelectContent>
                        {FILTER_OPERATORS.map(f => (
                          <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {!["isEmpty", "isNotEmpty"].includes(filter.operator) ? (
                      <Input
                        placeholder="Value..."
                        value={filter.value}
                        onChange={(e) => updateFilter(filter.id, "value", e.target.value)}
                        className="flex-1 bg-white min-w-[120px]"
                      />
                    ) : (
                      <div className="flex-1"></div>
                    )}

                    <Button variant="ghost" size="icon" onClick={() => removeFilter(filter.id)} className="shrink-0 text-gray-400 hover:text-red-500 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                <Button variant="ghost" size="sm" onClick={addFilter} className="mt-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                  <Plus className="w-4 h-4 mr-1" />
                  Add condition
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFilters([])}>Clear</Button>
            <Button className="bg-[#F4511E] hover:bg-[#E64A19] text-white" onClick={() => setShowFilterDialog(false)}>
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
