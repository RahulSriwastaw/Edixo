"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
// @ts-expect-error - papaparse types might not be picked up by IDE
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
  AlertCircle,
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

// Global API utility
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? match[1] : '';
}

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
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\\[()\\[\]]/g, '').slice(0, 80) + '...';
}

// Redacted static questionSets


export default function QuestionsListPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionSets, setQuestionSets] = useState<any[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);
  const [previewQuestion, setPreviewQuestion] = useState<any | null>(null);
  const [reportQuestion, setReportQuestion] = useState<any | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDesc, setReportDesc] = useState("");
  const [previewLang, setPreviewLang] = useState<"hin" | "eng">("eng");
  const [showAddToSetDialog, setShowAddToSetDialog] = useState(false);
  const [selectedSetId, setSelectedSetId] = useState<string>("");
  const [questionSetSearchQuery, setQuestionSetSearchQuery] = useState("");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importRows, setImportRows] = useState<any[]>([]);
  const [importPreview, setImportPreview] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [importLoading, setImportLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        setIsLoading(true);
        const url = new URL(`${API_URL}/qbank/questions`);
        if (scopeFilter !== "all") url.searchParams.append("scope", scopeFilter);
        if (searchQuery) url.searchParams.append("search", searchQuery);
        if (difficultyFilter !== "all") url.searchParams.append("difficulty", difficultyFilter);
        if (typeFilter !== "all") url.searchParams.append("type", typeFilter);

        const [qRes, sRes, meRes] = await Promise.all([
          fetch(url.toString(), { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
          fetch(`${API_URL}/qbank/sets`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
        ]);

        if (qRes.ok) {
          const qData = await qRes.json();
          setQuestions(qData.data?.questions || []);
        }
        if (sRes.ok) {
          const sData = await sRes.json();
          setQuestionSets(sData.data?.sets || []);
        }
        if (meRes.ok) {
          const meData = await meRes.json();
          setCurrentOrgId(meData.data?.orgDbId || null);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    // Check for import query param
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('import') === 'true') {
      setShowImportDialog(true);
    }
  }, [searchQuery, subjectFilter, difficultyFilter, typeFilter, scopeFilter]);

  const allSelected = questions.length > 0 && selectedQuestions.length === questions.length;
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
  };

  const hasActiveFilters = searchQuery || subjectFilter !== "all" || difficultyFilter !== "all" || typeFilter !== "all" || scopeFilter !== "all";

  // Filter questions (client-side search & custom filters)
  const filteredQuestions = questions; // Fetching is already filtered by backend

  // Map backend questions to subjects list
  const subjects = [...new Set(questions.map(q => q.folder?.name || "Uncategorized"))];

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
      const token = getToken();
      const response = await fetch(`${API_URL}/qbank/bulk-upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          fileName: importFile.name,
          rows: importRows
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
        // Refresh questions
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

  const handleReport = async () => {
    if (!reportReason) {
      toast.error("Please select a reason");
      return;
    }
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/qbank/questions/${reportQuestion.id}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: reportReason, description: reportDesc }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Report submitted successfully");
        setReportQuestion(null);
        setReportReason("");
        setReportDesc("");
      }
    } catch (err) {
      toast.error("Failed to submit report");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className="ml-60 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 p-6">
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
                        <SelectItem key={s} value={s}>{s}</SelectItem>
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
                    <SelectTrigger className="w-[150px] bg-white">
                      <SelectValue placeholder="Question Source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      <SelectItem value="mine">My Questions</SelectItem>
                      <SelectItem value="global">Global Bank</SelectItem>
                      <SelectItem value="public">Other Orgs</SelectItem>
                    </SelectContent>
                  </Select>
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
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-20 text-gray-400 italic">
                          Loading questions...
                        </TableCell>
                      </TableRow>
                    ) : (filteredQuestions.length > 0) ? (
                      filteredQuestions.map((question) => (
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
                              <Badge className="bg-purple-50 text-purple-600 text-[10px]">
                                <Languages className="w-3 h-3 mr-1" /> अ/A
                              </Badge>
                              <span className="text-sm text-gray-700 line-clamp-2 max-w-[280px]"
                                dangerouslySetInnerHTML={{ __html: stripHtml(question.textEn || question.textHi || "") }}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <TypeBadge type={question.type.toLowerCase()} />
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <span className="text-gray-900">{question.folder?.name || "Uncategorized"}</span>
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

                                <DropdownMenuItem onClick={() => { setReportQuestion(question); }}>
                                  <AlertCircle className="w-4 h-4 mr-2 text-amber-600" /> Report Issue
                                </DropdownMenuItem>

                                {(question.orgId === currentOrgId && !question.isGlobal) && (
                                  <>
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
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-20 text-gray-400 italic">
                          No questions found. Click "Create Question" to add one.
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
                Showing 1–{filteredQuestions.length} of {questions.length}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Prev
                </Button>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" className="w-8 h-8 p-0 bg-[#F4511E] text-white hover:bg-[#E64A19]">
                    1
                  </Button>
                  <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                    2
                  </Button>
                  <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                    3
                  </Button>
                </div>
                <Button variant="outline" size="sm">
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </main>
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
              <div
                className="text-gray-900 font-medium prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: previewLang === "hin" ? (previewQuestion?.textHi || "") : (previewQuestion?.textEn || "") }}
              />
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
                      <span className={isCorrect ? "text-green-700 font-medium" : "text-gray-700"}
                        dangerouslySetInnerHTML={{ __html: optText }}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Integer Answer */}
            {previewQuestion?.type === "integer" && (
              <div className="p-3 bg-green-50 border border-green-500 rounded-lg">
                <span className="text-green-700 font-medium">Answer: {previewQuestion.answer}</span>
              </div>
            )}

            {/* Solution */}
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700 font-medium mb-1">💡 Solution</p>
              <div
                className="text-sm prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: String(previewLang === "hin" ? (previewQuestion?.solution_hin || '') : (previewQuestion?.solution_eng || '')) }}
              />
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
            <DialogDescription className="text-sm">
              Upload a CSV file with bilingual questions (Hindi & English)
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

      {/* Report Question Dialog */}
      <Dialog open={!!reportQuestion} onOpenChange={() => setReportQuestion(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Report Question Issue
            </DialogTitle>
            <DialogDescription>
              Help us improve! Tell us what's wrong with this question.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Reason</label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="typo">Typo/Grammar Error</SelectItem>
                  <SelectItem value="wrong_answer">Wrong Answer/Key</SelectItem>
                  <SelectItem value="missing_content">Missing Images/Text</SelectItem>
                  <SelectItem value="other">Other Issue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Description (Optional)</label>
              <Input
                placeholder="Provide more details..."
                value={reportDesc}
                onChange={(e) => setReportDesc(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReportQuestion(null)}>Cancel</Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={handleReport}
              disabled={!reportReason}
            >
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
