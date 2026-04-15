"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  Trash2,
  Eye,
  Edit,
  Save,
  RefreshCw,
  Upload,
  Clock,
  Loader2,
  AlertCircle,
  Check,
  ChevronDown,
  Copy,
  FileText,
  CheckCircle2,
  FileQuestion,
  MoreHorizontal,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { toast } from "sonner";

// Types
interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface GeneratedQuestion {
  id: string;
  questionText: string;
  type: "MCQ" | "Integer" | "Multi-select" | "True-False";
  options?: QuestionOption[];
  correctAnswer?: string | number;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
  subject: string;
  chapter: string;
  topic?: string;
  selected?: boolean;
}

interface PreviousPrompt {
  id: string;
  title: string;
  type: string;
  questionCount: number;
  totalQuestions: number;
  createdAt: string;
  questions?: GeneratedQuestion[];
}

// Mock data
const mockPreviousPrompts: PreviousPrompt[] = [
  { id: "1", title: "Current Affairs MCQ", type: "MCQ", questionCount: 10, totalQuestions: 10, createdAt: "Mar 2" },
  { id: "2", title: "Physics Newton Laws", type: "MCQ", questionCount: 8, totalQuestions: 10, createdAt: "Mar 1" },
  { id: "3", title: "Chemistry Basics", type: "Integer", questionCount: 5, totalQuestions: 5, createdAt: "Feb 28" },
];

// Difficulty colors
const diffColors = {
  Easy: { light: "bg-teal-50", text: "text-teal-700" },
  Medium: { light: "bg-orange-50", text: "text-orange-700" },
  Hard: { light: "bg-rose-50", text: "text-rose-700" },
};

// Type colors
const typeColors = {
  MCQ: { light: "bg-violet-50", text: "text-violet-700" },
  Integer: { light: "bg-cyan-50", text: "text-cyan-700" },
  "Multi-select": { light: "bg-pink-50", text: "text-pink-700" },
  "True-False": { light: "bg-lime-50", text: "text-lime-700" },
};

// Question Item Component
function QuestionItem({
  question,
  index,
  onToggleSelect,
  onEdit,
  onDelete,
  onPreview,
  onDuplicate,
}: {
  question: GeneratedQuestion;
  index: number;
  onToggleSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPreview: () => void;
  onDuplicate: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const diffColor = diffColors[question.difficulty];
  const typeColor = typeColors[question.type];

  return (
    <div className={`relative flex gap-4 ${question.selected ? "" : "opacity-60"}`}>
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-lg ${question.selected ? "bg-gradient-to-br from-[#F4511E] to-[#E64A19]" : "bg-gray-300"}`}>
          {index + 1}
        </div>
        <div className="flex-1 w-0.5 bg-gradient-to-b from-gray-200 to-transparent mt-2" />
      </div>

      {/* Content Card */}
      <div className={`flex-1 mb-4 rounded-2xl border-2 transition-all ${question.selected ? "border-[#F4511E]/30 bg-white shadow-lg" : "border-gray-200 bg-gray-50"
        }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <div className="flex items-center gap-3">
            <Checkbox checked={question.selected} onCheckedChange={(c) => onToggleSelect()} className="data-[state=checked]:bg-[#F4511E] data-[state=checked]:border-[#F4511E]" />
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${typeColor.light} ${typeColor.text}`}>{question.type}</div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${diffColor.light} ${diffColor.text}`}>{question.difficulty}</div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="w-4 h-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onPreview}><Eye className="w-4 h-4 mr-2" />Preview</DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}><Edit className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate}><Copy className="w-4 h-4 mr-2" />Duplicate</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-red-600"><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </div>
        </div>

        {/* Question Preview */}
        <div className="px-4 pb-4">
          <p className="text-gray-900 font-medium line-clamp-2">{question.questionText}</p>
          {!isOpen && question.options && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {question.options.map((opt) => (
                <span key={opt.id} className={`px-2 py-0.5 rounded text-xs ${opt.isCorrect ? "bg-emerald-100 text-emerald-700 font-medium" : "bg-gray-100 text-gray-600"}`}>{opt.id}</span>
              ))}
            </div>
          )}
        </div>

        {/* Expanded Content */}
        {isOpen && (
          <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
            {question.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {question.options.map((opt) => (
                  <div key={opt.id} className={`flex items-center gap-2 p-3 rounded-xl text-sm ${opt.isCorrect ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-50 text-gray-600 border border-gray-100"}`}>
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${opt.isCorrect ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"}`}>{opt.id}</span>
                    <span className="flex-1 truncate">{opt.text}</span>
                    {opt.isCorrect && <Check className="w-4 h-4 text-emerald-500" />}
                  </div>
                ))}
              </div>
            )}
            {question.type === "Integer" && question.correctAnswer !== undefined && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-sm text-emerald-600">Answer:</span>
                <span className="text-lg font-bold text-emerald-700">{question.correctAnswer}</span>
              </div>
            )}
            <div className="p-3 bg-blue-50 rounded-xl">
              <span className="text-xs font-semibold text-blue-600 uppercase">Explanation</span>
              <p className="text-sm text-gray-700 mt-1">{question.explanation}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <FileText className="w-3 h-3" /><span>{question.subject}</span><span>→</span><span>{question.chapter}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Edit Dialog Content
function EditDialogContent({ question, onClose, onSave }: { question: GeneratedQuestion; onClose: () => void; onSave: (q: GeneratedQuestion) => void }) {
  const [edited, setEdited] = useState<GeneratedQuestion>({ ...question });

  const updateOption = (id: string, field: string, value: string | boolean) => {
    if (!edited.options) return;
    if (field === "isCorrect" && value === true && edited.type === "MCQ") {
      setEdited({ ...edited, options: edited.options.map(o => ({ ...o, isCorrect: o.id === id })) });
    } else {
      setEdited({ ...edited, options: edited.options.map(o => o.id === id ? { ...o, [field]: value } : o) });
    }
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader><DialogTitle>Edit Question</DialogTitle></DialogHeader>
      <div className="space-y-4 mt-4">
        <div><Label>Question</Label><Textarea value={edited.questionText} onChange={(e) => setEdited({ ...edited, questionText: e.target.value })} className="mt-1" /></div>
        {edited.options && (
          <div>
            <Label>Options</Label>
            <div className="space-y-2 mt-1">
              {edited.options.map((opt) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-medium">{opt.id}</span>
                  <input className="flex-1 px-3 py-2 border rounded-lg" value={opt.text} onChange={(e) => updateOption(opt.id, "text", e.target.value)} />
                  <Checkbox checked={opt.isCorrect} onCheckedChange={(c) => updateOption(opt.id, "isCorrect", c)} />
                  <span className="text-xs text-gray-500">Correct</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div><Label>Explanation</Label><Textarea value={edited.explanation} onChange={(e) => setEdited({ ...edited, explanation: e.target.value })} className="mt-1" /></div>
        <div className="flex gap-4">
          <Label className="flex-1">
            Difficulty
            <Select value={edited.difficulty} onValueChange={(v) => setEdited({ ...edited, difficulty: v as "Easy" | "Medium" | "Hard" })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </Label>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button className="bg-[#F4511E] hover:bg-[#E64A19] text-white" onClick={() => { onSave(edited); onClose(); }}>Save</Button>
      </div>
    </DialogContent>
  );
}

function EditDialog({ question, open, onClose, onSave }: { question: GeneratedQuestion | null; open: boolean; onClose: () => void; onSave: (q: GeneratedQuestion) => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      {question && <EditDialogContent key={question.id} question={question} onClose={onClose} onSave={onSave} />}
    </Dialog>
  );
}

// Preview Dialog
function PreviewDialog({ question, open, onClose }: { question: GeneratedQuestion | null; open: boolean; onClose: () => void }) {
  const [showExp, setShowExp] = useState(false);
  if (!question) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Preview</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="flex gap-2"><Badge>{question.type}</Badge><Badge>{question.difficulty}</Badge></div>
          <p className="text-sm text-gray-500">{question.subject} → {question.chapter}</p>
          <div className="p-4 bg-gray-50 rounded-xl"><p className="font-medium">{question.questionText}</p></div>
          {question.options && (
            <div className="space-y-2">
              {question.options.map((opt) => (
                <div key={opt.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 ${opt.isCorrect ? "bg-emerald-50 border-emerald-400" : "bg-white border-gray-200"}`}>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${opt.isCorrect ? "bg-emerald-500 text-white" : "bg-gray-200"}`}>{opt.id}</span>
                  <span className={opt.isCorrect ? "font-medium text-emerald-700" : ""}>{opt.text}</span>
                  {opt.isCorrect && <Check className="w-5 h-5 text-emerald-500 ml-auto" />}
                </div>
              ))}
            </div>
          )}
          <Button variant="ghost" onClick={() => setShowExp(!showExp)} className="text-[#F4511E]">{showExp ? "Hide" : "Show"} Explanation</Button>
          {showExp && <div className="p-4 bg-blue-50 rounded-xl">{question.explanation}</div>}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function QuestionGenerationPage() {
  const { isOpen } = useSidebarStore();
  const [questionType, setQuestionType] = useState("MCQ");
  const [questionCount, setQuestionCount] = useState("10");
  const [language, setLanguage] = useState("English");
  const [bilingual, setBilingual] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [history, setHistory] = useState<PreviousPrompt[]>(mockPreviousPrompts);
  const [showHistory, setShowHistory] = useState(false);
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [editQ, setEditQ] = useState<GeneratedQuestion | null>(null);
  const [previewQ, setPreviewQ] = useState<GeneratedQuestion | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error("Enter a prompt"); return; }
    setIsGenerating(true);
    setError("");
    setQuestions([]);

    try {
      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, questionType, questionCount: parseInt(questionCount), language, bilingual }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType?.includes("application/json")) throw new Error("Invalid server response");

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Generation failed");
      if (!data.questions?.length) throw new Error("No questions generated");

      setQuestions(data.questions.map((q: GeneratedQuestion) => ({ ...q, selected: true })));
      toast.success(`${data.questions.length} questions generated!`);

      setHistory([
        { id: Date.now().toString(), title: prompt.slice(0, 30) + (prompt.length > 30 ? "..." : ""), type: questionType, questionCount: data.questions.length, totalQuestions: parseInt(questionCount), createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }), questions: data.questions },
        ...history,
      ]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Generation failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleAll = (select: boolean) => setQuestions(questions.map(q => ({ ...q, selected: select })));
  const toggleSelect = (id: string) => setQuestions(questions.map(q => q.id === id ? { ...q, selected: !q.selected } : q));
  const deleteQ = (id: string) => { setQuestions(questions.filter(q => q.id !== id)); toast.success("Deleted"); };
  const duplicateQ = (q: GeneratedQuestion) => {
    const idx = questions.findIndex(x => x.id === q.id);
    const newQ = { ...q, id: `Q-${Date.now()}`, selected: true };
    const newQs = [...questions];
    newQs.splice(idx + 1, 0, newQ);
    setQuestions(newQs);
    toast.success("Duplicated");
  };
  const saveEdit = (q: GeneratedQuestion) => { setQuestions(questions.map(x => x.id === q.id ? q : x)); toast.success("Saved"); };
  const loadHistory = (h: PreviousPrompt) => {
    if (h.questions) setQuestions(h.questions.map(q => ({ ...q, selected: true })));
    toast.success(`Loaded ${h.questionCount} questions`);
    setShowHistory(false);
  };
  const deleteHistory = (id: string) => { setHistory(history.filter(h => h.id !== id)); toast.success("Deleted"); };

  const selectedCount = questions.filter(q => q.selected).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href="/question-bank" className="p-2 hover:bg-gray-100 rounded-lg">
                  <ArrowLeft className="w-5 h-5 text-gray-500" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">AI Question Generation</h1>
                  <p className="text-gray-500 text-sm">Create questions using AI-powered generation</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setShowHistory(!showHistory)} className="gap-2">
                <Clock className="w-4 h-4" /> History ({history.length})
              </Button>
            </div>

            {/* History Panel */}
            {showHistory && (
              <Card className="border-amber-200 bg-amber-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900">Previous Generations</span>
                    <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)}><X className="w-4 h-4" /></Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {history.map(h => (
                      <div key={h.id} className="flex items-center justify-between p-3 bg-white rounded-xl border">
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => loadHistory(h)}>
                          <p className="font-medium text-sm truncate">{h.title}</p>
                          <p className="text-xs text-gray-500">{h.questionCount} questions • {h.createdAt}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => deleteHistory(h.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generator Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Create Questions</h2>
                    <p className="text-sm text-gray-500">Describe what you need</p>
                  </div>
                </div>

                {/* AI Smart Tools Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <Link href="/tools/ai-mcq-extractor">
                    <div className="group p-4 bg-primary/5 border border-primary/10 rounded-2xl hover:bg-primary/10 transition-all cursor-pointer flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <FileQuestion className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-slate-800">AI MCQ Extractor</h3>
                        <p className="text-[10px] text-slate-500">Extract questions from PDF & Images</p>
                      </div>
                    </div>
                  </Link>
                  <Link href="/tools/pdf-to-word">
                    <div className="group p-4 bg-blue-50/50 border border-blue-100 rounded-2xl hover:bg-blue-100/50 transition-all cursor-pointer flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-slate-800">PDF to Editable Word</h3>
                        <p className="text-[10px] text-slate-500">Reconstruct PDF into professional DOCX</p>
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div><Label className="text-xs text-gray-500">Type</Label><Select value={questionType} onValueChange={setQuestionType}><SelectTrigger className="mt-1 h-10"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="MCQ">MCQ</SelectItem><SelectItem value="Integer">Integer</SelectItem><SelectItem value="Multi-select">Multi-select</SelectItem><SelectItem value="True-False">True/False</SelectItem></SelectContent></Select></div>
                  <div><Label className="text-xs text-gray-500">Count</Label><Select value={questionCount} onValueChange={setQuestionCount}><SelectTrigger className="mt-1 h-10"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="5">5</SelectItem><SelectItem value="10">10</SelectItem><SelectItem value="15">15</SelectItem><SelectItem value="20">20</SelectItem></SelectContent></Select></div>
                  <div><Label className="text-xs text-gray-500">Language</Label><Select value={language} onValueChange={setLanguage}><SelectTrigger className="mt-1 h-10"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="English">English</SelectItem><SelectItem value="Hindi">Hindi</SelectItem><SelectItem value="Hinglish">Hinglish</SelectItem></SelectContent></Select></div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 h-10 px-3 bg-gray-50 rounded-lg border cursor-pointer">
                      <Checkbox checked={bilingual} onCheckedChange={(c) => setBilingual(c as boolean)} className="data-[state=checked]:bg-[#F4511E] data-[state=checked]:border-[#F4511E]" />
                      <span className="text-sm">Bilingual</span>
                    </label>
                  </div>
                </div>

                <Textarea placeholder="e.g., Create physics questions on Newton's laws for JEE..." value={prompt} onChange={(e) => setPrompt(e.target.value)} className="min-h-[120px] mb-4" />
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 mb-4 text-center hover:border-[#F4511E] cursor-pointer transition-colors">
                  <Upload className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                  <span className="text-sm text-gray-500">Upload reference (optional)</span>
                </div>
                <Button className="w-full h-12 bg-gradient-to-r from-[#F4511E] to-[#E64A19] hover:from-[#E64A19] hover:to-[#D84315] text-white font-semibold rounded-xl shadow-lg" onClick={handleGenerate} disabled={isGenerating || !prompt.trim()}>
                  {isGenerating ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="w-5 h-5 mr-2" /> Generate Questions</>}
                </Button>
              </CardContent>
            </Card>

            {error && <Card className="border-red-200 bg-red-50"><CardContent className="p-4 flex items-center gap-3"><AlertCircle className="w-5 h-5 text-red-500" /><span className="text-red-700">{error}</span></CardContent></Card>}

            {questions.length > 0 && (
              <Card>
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="font-semibold">{questions.length} questions created</span>
                    <Badge className="bg-[#F4511E] text-white">{selectedCount} selected</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => toggleAll(true)}>Select All</Button>
                    <Button variant="outline" size="sm" onClick={() => toggleAll(false)}>Deselect</Button>
                    <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating}><RefreshCw className={`w-4 h-4 mr-1 ${isGenerating ? "animate-spin" : ""}`} /> Regenerate</Button>
                  </div>
                </div>
                <div className="p-4">
                  {questions.map((q, i) => (
                    <QuestionItem key={q.id} question={q} index={i} onToggleSelect={() => toggleSelect(q.id)} onEdit={() => { setEditQ(q); setShowEdit(true); }} onDelete={() => deleteQ(q.id)} onPreview={() => { setPreviewQ(q); setShowPreview(true); }} onDuplicate={() => duplicateQ(q)} />
                  ))}
                </div>
                <div className="p-4 bg-gradient-to-r from-slate-50 to-white border-t flex items-center justify-between">
                  <span className="text-sm text-gray-600">{selectedCount} questions selected</span>
                  <Button className="bg-[#F4511E] hover:bg-[#E64A19] text-white" onClick={() => { toast.success(`${selectedCount} questions saved!`); }} disabled={selectedCount === 0}><Save className="w-4 h-4 mr-2" /> Save Selected</Button>
                </div>
              </Card>
            )}

            {questions.length === 0 && !isGenerating && !error && (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4"><FileQuestion className="w-8 h-8 text-purple-500" /></div>
                  <h3 className="text-lg font-medium mb-2">No questions yet</h3>
                  <p className="text-gray-500">Enter a prompt and generate questions</p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
      <EditDialog question={editQ} open={showEdit} onClose={() => setShowEdit(false)} onSave={saveEdit} />
      <PreviewDialog question={previewQ} open={showPreview} onClose={() => setShowPreview(false)} />
    </div>
  );
}
