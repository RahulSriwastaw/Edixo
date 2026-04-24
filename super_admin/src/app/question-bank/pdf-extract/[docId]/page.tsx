"use client";
import { useSidebarStore } from "@/store/sidebarStore";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Search,
  Filter,
  Grid,
  List,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Copy,
  Tag,
  Sparkles,
  Check,
  FileText,
  Image as ImageIcon,
  Calendar,
  Building2,
  Loader2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { BulkAIEditManager } from "@/components/tools/bulk-ai-edit/BulkAIEditManager";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Mock document data
const mockDocument = {
  id: "GogKqllq2ZR3pQXf0ayW",
  name: "SSC GD Tier 1 - 2024 Question Paper",
  status: "completed",
  totalQuestions: 18,
  totalImages: 3,
  uploadedAt: "March 4, 2026 at 07:36 AM",
  organization: "Global Q-Bank",
  pdfUrl: "https://example.com/pdf/ssc-gd-2024.pdf",
  creditsUsed: 2.173,
  tokensUsed: 17848,
};

// Mock questions data
const mockQuestions = [
  {
    id: "q1",
    questionNo: 1,
    sourcePage: 1,
    questionHin: "<p>यदि A + B का मान 15 है और A - B का मान 5 है, तो A × B का मान क्या होगा?</p>",
    questionEng: "<p>If A + B = 15 and A - B = 5, what is the value of A × B?</p>",
    option1Hin: "25",
    option1Eng: "25",
    option2Hin: "50",
    option2Eng: "50",
    option3Hin: "75",
    option3Eng: "75",
    option4Hin: "100",
    option4Eng: "100",
    answer: "B",
    solutionHin: "<p>A + B = 15 और A - B = 5<br/>दोनों को जोड़ने पर: 2A = 20, इसलिए A = 10<br/>A - B = 5 में A रखने पर: 10 - B = 5, इसलिए B = 5<br/>A × B = 10 × 5 = 50</p>",
    solutionEng: "<p>A + B = 15 and A - B = 5<br/>Adding both: 2A = 20, so A = 10<br/>Substituting in A - B = 5: 10 - B = 5, so B = 5<br/>A × B = 10 × 5 = 50</p>",
    questionType: "mcq",
    difficulty: "easy",
    subject: "Mathematics",
    topic: "Algebra",
    status: "draft",
    hasImage: false,
  },
  {
    id: "q2",
    questionNo: 2,
    sourcePage: 1,
    questionHin: "<p>निम्नलिखित में से कौन सा राज्य भारत का सबसे बड़ा राज्य (क्षेत्रफल के अनुसार) है?</p>",
    questionEng: "<p>Which of the following is the largest state in India by area?</p>",
    option1Hin: "मध्य प्रदेश",
    option1Eng: "Madhya Pradesh",
    option2Hin: "महाराष्ट्र",
    option2Eng: "Maharashtra",
    option3Hin: "राजस्थान",
    option3Eng: "Rajasthan",
    option4Hin: "उत्तर प्रदेश",
    option4Eng: "Uttar Pradesh",
    answer: "C",
    solutionHin: "<p>राजस्थान भारत का सबसे बड़ा राज्य है क्षेत्रफल के अनुसार, जो लगभग 342,239 वर्ग किलोमीटर है।</p>",
    solutionEng: "<p>Rajasthan is the largest state in India by area, covering approximately 342,239 square kilometers.</p>",
    questionType: "mcq",
    difficulty: "easy",
    subject: "General Knowledge",
    topic: "Geography",
    status: "published",
    hasImage: false,
  },
  {
    id: "q3",
    questionNo: 3,
    sourcePage: 1,
    questionHin: "<p>निम्नलिखित आकृति में कौन सी संख्या दी गई श्रृंखला को पूरा करेगी?</p>",
    questionEng: "<p>Which number will complete the given series in the figure?</p>",
    option1Hin: "16",
    option1Eng: "16",
    option2Hin: "18",
    option2Eng: "18",
    option3Hin: "20",
    option3Eng: "20",
    option4Hin: "22",
    option4Eng: "22",
    answer: "B",
    solutionHin: "<p>यह एक संख्या पैटर्न प्रश्न है।</p>",
    solutionEng: "<p>This is a number pattern question.</p>",
    questionType: "mcq",
    difficulty: "medium",
    subject: "Reasoning",
    topic: "Number Series",
    status: "draft",
    hasImage: true,
    imageUrl: "/placeholder-image.png",
  },
];

// Difficulty badge colors
const difficultyColors: Record<string, string> = {
  easy: "bg-green-50 text-green-700 border-green-200",
  medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
  hard: "bg-red-50 text-red-700 border-red-200",
};

// Type labels
const typeLabels: Record<string, string> = {
  mcq: "Single Choice",
  multi: "Multi Select",
  integer: "Integer",
  truefalse: "True/False",
};

export default function PDFExtractDetailPage() {
    const { isOpen } = useSidebarStore();
const params = useParams();
  const docId = params.docId as string;

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [editTab, setEditTab] = useState("ai");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isApplyingAI, setIsApplyingAI] = useState(false);

  // Bulk tag modal
  const [showBulkTagModal, setShowBulkTagModal] = useState(false);
  const [bulkTagTab, setBulkTagTab] = useState("manual");
  const [bulkTopic, setBulkTopic] = useState("");
  const [bulkDifficulty, setBulkDifficulty] = useState("");
  const [bulkOverwrite, setBulkOverwrite] = useState(false);
  const [bulkTestLevel, setBulkTestLevel] = useState("");
  const [isApplyingBulkTag, setIsApplyingBulkTag] = useState(false);

  // Bulk AI edit manager integration
  const handleCopyToTest = () => {
    toast.success(`Copied ${selectedQuestions.length} to Test`);
  };
  const handleAddToQBank = () => {
    toast.success(`Added ${selectedQuestions.length} to Q-Bank`);
  };

  // Filter questions
  const filteredQuestions = mockQuestions.filter((q) => {
    const matchesSearch =
      q.questionEng.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.questionHin.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Toggle question selection
  const toggleQuestionSelection = (id: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(id) ? prev.filter((qid) => qid !== id) : [...prev, id]
    );
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(filteredQuestions.map((q) => q.id));
    }
    setSelectAll(!selectAll);
  };

  // Handle edit
  const handleEdit = (index: number) => {
    setCurrentQuestion(index);
    setShowEditModal(true);
  };

  // Apply AI edit
  const handleApplyAIEdit = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    setIsApplyingAI(true);
    await new Promise((r) => setTimeout(r, 2000));
    toast.success("AI edit applied successfully!");
    setIsApplyingAI(false);
    setAiPrompt("");
  };

  // Apply bulk tag
  const handleApplyBulkTag = async () => {
    if (!bulkTopic && !bulkDifficulty) {
      toast.error("Please select at least topic or difficulty");
      return;
    }
    setIsApplyingBulkTag(true);
    await new Promise((r) => setTimeout(r, 1500));
    toast.success(`Applied tags to ${selectedQuestions.length || mockQuestions.length} questions`);
    setIsApplyingBulkTag(false);
    setShowBulkTagModal(false);
  };

  // Handle bulk action responses (BulkAIEditManager executes them internally, this is just for callback if needed)
  const handleBulkEditComplete = () => {
    toast.success("Bulk AI Edit completed successfully!");
    // Optional: refresh data or keep selection
  };

  // Quick prompts
  const quickPrompts = [
    "Fix LaTeX",
    "Simplify",
    "Add steps",
    "Format nicely",
    "Create variation",
    "Make harder",
    "Improve clarity",
    "Fix errors",
  ];

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "md:ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-4 lg:p-5">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <Link href="/question-bank" className="hover:text-orange-600">
                Q-Bank
              </Link>
              <span>/</span>
              <Link href="/question-bank/pdf-extract" className="hover:text-orange-600">
                PDF Extract
              </Link>
              <span>/</span>
              <span className="text-[var(--text-primary)] font-medium truncate max-w-[300px]">
                {mockDocument.name}
              </span>
            </div>

            {/* Document Info Card */}
            <Card className="kpi-card">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                      <FileText className="w-8 h-8 text-orange-600" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-[var(--text-primary)]">{mockDocument.name}</h1>
                      <div className="flex items-center gap-4 mt-2 text-sm text-[var(--text-secondary)]">
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {mockDocument.id}
                        </span>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-[var(--text-secondary)]">
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {mockDocument.totalQuestions} Questions
                        </span>
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-4 h-4" />
                          {mockDocument.totalImages} Images
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {mockDocument.uploadedAt}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {mockDocument.organization}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={mockDocument.pdfUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View PDF
                      </a>
                    </Button>
                  </div>
                </div>

                {/* Processing Stats */}
                <div className="mt-6 pt-4 border-t border-[var(--divider)]">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-[var(--text-secondary)]">Credits Used</span>
                      <div className="font-semibold text-[var(--text-primary)]">{mockDocument.creditsUsed}</div>
                    </div>
                    <div>
                      <span className="text-[var(--text-secondary)]">Tokens Used</span>
                      <div className="font-semibold text-[var(--text-primary)]">{mockDocument.tokensUsed.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-[var(--text-secondary)]">Questions Extracted</span>
                      <div className="font-semibold text-[var(--text-primary)]">{mockDocument.totalQuestions}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Toolbar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <Input
                      placeholder="Search questions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 input-field"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[130px] input-field">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="h-6 w-px bg-[var(--bg-sidebar)] mx-1" />

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBulkTagModal(true)}
                      disabled={selectedQuestions.length === 0 && filteredQuestions.length === 0}
                    >
                      <Tag className="w-4 h-4 mr-2" />
                      Bulk Tag
                    </Button>

                    <div className="h-6 w-px bg-[var(--bg-sidebar)] mx-1" />

                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className={viewMode === "grid" ? "bg-orange-500 hover:bg-orange-600" : ""}
                    >
                <div className="flex items-center gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px] input-field">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="h-6 w-px bg-[var(--bg-sidebar)] mx-1" />

                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={viewMode === "grid" ? "bg-orange-500 hover:bg-orange-600" : ""}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={viewMode === "list" ? "bg-orange-500 hover:bg-orange-600" : ""}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <BulkAIEditManager 
            selectedQuestions={selectedQuestions} 
            onSelectionChange={setSelectedQuestions}
            onEditComplete={handleBulkEditComplete}
            onBulkTag={() => setShowBulkTagModal(true)}
            onCopyToTest={handleCopyToTest}
            onAddToQBank={handleAddToQBank}
          />

          {/* Questions List */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-[var(--bg-main)] rounded-lg">
                <Checkbox checked={selectAll} onCheckedChange={toggleSelectAll} />
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  Document Questions ({filteredQuestions.length})
                </span>
              </div>

              {filteredQuestions.map((question, index) => (
                <Card
                  key={question.id}
                  className={cn(
                    "kpi-card hover:shadow-md transition-shadow",
                    selectedQuestions.includes(question.id) && "ring-2 ring-orange-500"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <Checkbox
                        checked={selectedQuestions.includes(question.id)}
                        onCheckedChange={() => toggleQuestionSelection(question.id)}
                        className="mt-1"
                      />

                      <div className="flex-1 min-w-0">
                        {/* Question Header */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700">
                            {question.questionNo}
                          </div>
                          <Switch
                            checked={question.status === "published"}
                            className="data-[state=checked]:bg-green-500"
                          />
                          <Badge variant="outline" className="text-[10px]">
                            {typeLabels[question.questionType]}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            Page {question.sourcePage}
                          </Badge>
                          {question.topic && (
                            <Badge variant="outline" className="text-[10px] bg-[var(--bg-main)]">
                              {question.topic}
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className={cn("text-[10px]", difficultyColors[question.difficulty])}
                          >
                            {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                          </Badge>
                          <Badge className="bg-blue-100 text-blue-700 text-[10px]">
                            Answer: {question.answer}
                          </Badge>
                          {question.hasImage && (
                            <Badge variant="outline" className="text-[10px] text-purple-600">
                              <ImageIcon className="w-3 h-3 mr-1" />
                              Image
                            </Badge>
                          )}
                        </div>

                        {/* Question Content */}
                        <div
                          className="text-sm text-[var(--text-primary)] prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: question.questionEng }}
                        />

                        {/* Options */}
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                          {["A", "B", "C", "D"].map((opt) => {
                            const optKey = `option${opt.charCodeAt(0) - 64}` as keyof typeof question;
                            const optValue = question[optKey + "Eng" as keyof typeof question] as string;
                            const isCorrect = question.answer === opt;
                            return (
                              <div
                                key={opt}
                                className={cn(
                                  "p-2 rounded text-xs border",
                                  isCorrect
                                    ? "bg-green-50 border-green-200 text-green-800"
                                    : "bg-[var(--bg-main)] border-[var(--border-input)] text-[var(--text-primary)]"
                                )}
                              >
                                <span className="font-semibold mr-1">{opt}.</span>
                                {optValue}
                                {isCorrect && <Check className="w-3 h-3 inline ml-1 text-green-600" />}
                              </div>
                            );
                          })}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[var(--divider)]">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(index)}
                          >
                            <Edit2 className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Copy className="w-3 h-3 mr-1" />
                            Duplicate
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="sticky bottom-0 bg-white border-t border-[var(--border-input)] p-4 flex items-center justify-between">
              <Link href="/question-bank/pdf-extract">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Documents
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  disabled={selectedQuestions.length === 0}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Add to Q-Bank ({selectedQuestions.length || "All"})
                </Button>
                <Button
                  className="btn-primary"
                  disabled={selectedQuestions.length === 0}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Copy to Test ({selectedQuestions.length || "All"})
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Edit Question Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Edit Q#{mockQuestions[currentQuestion]?.questionNo}</DialogTitle>
              <div className="flex items-center gap-2">
                <Select defaultValue={mockQuestions[currentQuestion]?.difficulty}>
                  <SelectTrigger className="w-[120px] input-field h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogHeader>

          <Tabs value={editTab} onValueChange={setEditTab} className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ai" className="gap-2">
                <Sparkles className="w-4 h-4" />
                AI Edit
              </TabsTrigger>
              <TabsTrigger value="manual">Manual Edit</TabsTrigger>
            </TabsList>

            <TabsContent value="ai" className="flex-1 overflow-y-auto py-4 space-y-4">
              <div className="space-y-2">
                <Label>Edit Target</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="bg-orange-100 text-orange-700">
                    Both
                  </Button>
                  <Button variant="outline" size="sm">
                    ❓ Question
                  </Button>
                  <Button variant="outline" size="sm">
                    💡 Solution
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Your Prompt</Label>
                <Textarea
                  placeholder="e.g., Fix LaTeX, simplify language, add steps..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="input-field min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Quick Prompts</Label>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((prompt) => (
                    <Button
                      key={prompt}
                      variant="outline"
                      size="sm"
                      onClick={() => setAiPrompt(prompt)}
                      className="text-xs"
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                onClick={handleApplyAIEdit}
                disabled={isApplyingAI || !aiPrompt.trim()}
              >
                {isApplyingAI ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Applying AI Edit...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Apply AI Edit
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="manual" className="flex-1 overflow-y-auto py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Question (English)</Label>
                  <Textarea
                    className="input-field min-h-[100px]"
                    defaultValue={mockQuestions[currentQuestion]?.questionEng.replace(/<[^>]*>/g, "")}
                  />
                </div>
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Question (Hindi)</Label>
                  <Textarea
                    className="input-field min-h-[100px]"
                    defaultValue={mockQuestions[currentQuestion]?.questionHin.replace(/<[^>]*>/g, "")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Options</Label>
                <div className="grid grid-cols-2 gap-4">
                  {["A", "B", "C", "D"].map((opt) => (
                    <div key={opt} className="flex items-center gap-2">
                      <span className="font-semibold w-6">{opt}.</span>
                      <Input className="input-field flex-1" defaultValue={`Option ${opt}`} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Correct Answer</Label>
                <Select defaultValue={mockQuestions[currentQuestion]?.answer}>
                  <SelectTrigger className="w-[100px] input-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="border-t pt-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentQuestion === 0}
                  onClick={() => setCurrentQuestion((p) => p - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-[var(--text-secondary)]">
                  Question {currentQuestion + 1} of {mockQuestions.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentQuestion === mockQuestions.length - 1}
                  onClick={() => setCurrentQuestion((p) => p + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button className="btn-primary">Save Changes</Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Tag Modal */}
      <Dialog open={showBulkTagModal} onOpenChange={setShowBulkTagModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Bulk Tag All Questions</DialogTitle>
            <DialogDescription>
              Apply tags to {selectedQuestions.length || mockQuestions.length} questions
            </DialogDescription>
          </DialogHeader>

          <Tabs value={bulkTagTab} onValueChange={setBulkTagTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Manual Tag</TabsTrigger>
              <TabsTrigger value="ai">AI Auto Tag</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="py-4 space-y-4">
              <div className="space-y-2">
                <Label>Topic</Label>
                <Select value={bulkTopic} onValueChange={setBulkTopic}>
                  <SelectTrigger className="input-field">
                    <SelectValue placeholder="Select topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="algebra">Algebra</SelectItem>
                    <SelectItem value="geometry">Geometry</SelectItem>
                    <SelectItem value="reasoning">Reasoning</SelectItem>
                    <SelectItem value="gk">General Knowledge</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Difficulty Level</Label>
                <Select value={bulkDifficulty} onValueChange={setBulkDifficulty}>
                  <SelectTrigger className="input-field">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="overwrite"
                  checked={bulkOverwrite}
                  onCheckedChange={(v) => setBulkOverwrite(!!v)}
                />
                <Label htmlFor="overwrite" className="text-sm font-normal">
                  Overwrite existing values
                </Label>
              </div>

              <p className="text-xs text-[var(--text-secondary)] bg-[var(--bg-main)] p-3 rounded-lg">
                This will update {selectedQuestions.length || mockQuestions.length} questions.
                Questions with existing values will be skipped unless overwrite is enabled.
              </p>
            </TabsContent>

            <TabsContent value="ai" className="py-4 space-y-4">
              <div className="space-y-2">
                <Label>Test Level *</Label>
                <Select value={bulkTestLevel} onValueChange={setBulkTestLevel}>
                  <SelectTrigger className="input-field">
                    <SelectValue placeholder="Select test level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="highschool">🎓 High School (Class 9-10)</SelectItem>
                    <SelectItem value="senior">📚 Senior Secondary (Class 11-12)</SelectItem>
                    <SelectItem value="jee-mains">🎯 JEE Mains Level</SelectItem>
                    <SelectItem value="jee-advanced">🚀 JEE Advanced Level</SelectItem>
                    <SelectItem value="neet">🏥 NEET Level</SelectItem>
                    <SelectItem value="competitive">🏆 Competitive Exams</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-[var(--bg-main)] p-4 rounded-lg text-sm text-[var(--text-secondary)]">
                <p className="font-medium mb-2">AI Auto Tag Process:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>AI analyzes each question content</li>
                  <li>Assigns best matching topic from your defined topics</li>
                  <li>Assigns difficulty based on test level</li>
                  <li>Estimated time: 6-10 seconds</li>
                </ol>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkTagModal(false)}>
              Cancel
            </Button>
            <Button
              className="btn-primary"
              onClick={handleApplyBulkTag}
              disabled={isApplyingBulkTag}
            >
              {isApplyingBulkTag ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Applying...
                </>
              ) : (
                "Apply to All Questions"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </Dialog>
    </div>
  );
}
