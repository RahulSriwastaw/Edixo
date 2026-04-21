"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Pencil,
  X,
  Save,
  CheckCircle,
  Coins,
  Globe,
  Lock,
  BookOpen,
  Tag,
  Layers,
  Calendar,
  Hash,
  BarChart2,
  FileText,
  Lightbulb,
  ArrowRight,
  ExternalLink,
  AlertCircle,
  Bold,
  Italic,
  Subscript,
  Superscript,
  Type,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { API_URL, getAuthHeaders } from "@/lib/api-config";

// ─── Auto-resize Textarea ─────────────────────────────────────────────────────
// Grows with content so no text is ever hidden

interface AutoResizeTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number;
  className?: string;
}

function AutoResizeTextarea({
  value,
  onChange,
  minRows = 3,
  className = "",
  placeholder,
  ...rest
}: AutoResizeTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Recalculate height whenever value changes
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto"; // shrink first so scrollHeight is accurate
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={minRows}
      style={{ resize: "vertical", overflow: "hidden" }}
      className={`w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-[14px] leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${className}`}
      {...rest}
    />
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Option {
  id: string;
  textEn: string;
  textHi: string;
  isCorrect: boolean;
  sortOrder: number;
}

interface QuestionDetail {
  id: string;
  textEn: string;
  textHi: string;
  explanationEn: string;
  explanationHi: string;
  type: string;
  difficulty: string;
  pointCost: number;
  usageCount: number;
  isApproved: boolean;
  isGlobal: boolean;
  visibility: string;
  language: string;
  tags: string[];
  answer?: string;
  answerRangeMin?: string;
  answerRangeMax?: string;
  video?: string;
  relatedExam?: string;
  previousOf?: string;
  collection?: string;
  sourceType?: string;
  questionNo?: string;
  externalId?: string;
  syncCode?: string;
  subjectName?: string;
  chapterName?: string;
  topic?: string;
  exam?: string;
  shift?: string;
  date?: string;
  questionUniqueId?: string;
  folder?: { id: string; name: string };
  image?: string;
  options: Option[];
}

interface EditFormData {
  subject: string;
  chapter: string;
  topic: string;
  difficulty: string;
  questionType: string;
  relatedExam: string;
  collection: string;
  sourceType: string;
  question_hin: string;
  question_eng: string;
  solution_hin: string;
  solution_eng: string;
  video: string;
  answer: string;
  visibility: string;
  pointCost: number;
  tags: string[];
  questionNo: string;
  date: string;
  shift: string;
  image: string;
}

interface BilingualOption {
  id: string;
  label: string;
  text_hin: string;
  text_eng: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  MCQ_SINGLE: "MCQ",
  MCQ_MULTIPLE: "Multi-select",
  DESCRIPTIVE: "Integer",
  TRUE_FALSE: "True/False",
  mcq: "MCQ",
  multi_select: "Multi-select",
  integer: "Integer",
  true_false: "True/False",
};

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  hard: "bg-red-50 text-red-700 border-red-200",
};

const TYPE_STYLES: Record<string, string> = {
  MCQ_SINGLE: "bg-blue-50 text-blue-700 border-blue-200",
  MCQ_MULTIPLE: "bg-purple-50 text-purple-700 border-purple-200",
  DESCRIPTIVE: "bg-green-50 text-green-700 border-green-200",
  TRUE_FALSE: "bg-amber-50 text-amber-700 border-amber-200",
};

function isMCQ(type: string): boolean {
  return type === "MCQ_SINGLE" || type === "mcq";
}

function isMultiSelect(type: string): boolean {
  return type === "MCQ_MULTIPLE" || type === "multi_select";
}

function isInteger(type: string): boolean {
  return type === "DESCRIPTIVE" || type === "integer";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetaItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-slate-500" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <div className="text-sm font-medium text-slate-800 mt-0.5 break-words">
          {value}
        </div>
      </div>
    </div>
  );
}

function RichContent({
  html,
  className,
}: {
  html?: string;
  className?: string;
}) {
  if (!html)
    return (
      <p className="text-slate-400 italic text-sm">No content provided</p>
    );
  return (
    <div
      className={`prose prose-sm max-w-none text-slate-800 ${className || ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function RichTextToolbar({
  onInsertTag,
  onInsertLatex,
}: {
  onInsertTag: (tag: string) => void;
  onInsertLatex: (type: "inline" | "display" | "chem") => void;
}) {
  return (
    <div className="flex items-center gap-1 p-1.5 bg-slate-50 border-b rounded-t-md">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => onInsertTag("strong")}
        title="Bold"
      >
        <Bold className="w-3.5 h-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => onInsertTag("em")}
        title="Italic"
      >
        <Italic className="w-3.5 h-3.5" />
      </Button>
      <Separator orientation="vertical" className="h-5 mx-0.5" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => onInsertTag("sub")}
        title="Subscript"
      >
        <Subscript className="w-3.5 h-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => onInsertTag("sup")}
        title="Superscript"
      >
        <Superscript className="w-3.5 h-3.5" />
      </Button>
      <Separator orientation="vertical" className="h-5 mx-0.5" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 gap-1 text-xs"
          >
            <Type className="w-3.5 h-3.5" /> LaTeX{" "}
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onInsertLatex("inline")}>
            Inline: \( \)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onInsertLatex("display")}>
            Display: \[ \]
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onInsertLatex("chem")}>
            Chemical: \[\ce{"{ }"}\\]
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface QuestionFullDetailViewProps {
  questionId: string;
  questionIds?: string[];
  currentIndex?: number;
  onNavigate?: (id: string) => void;
  onClose: () => void;
  onUpdate?: () => void;
}

export function QuestionFullDetailView({
  questionId,
  questionIds = [],
  currentIndex = -1,
  onNavigate,
  onClose,
  onUpdate,
}: QuestionFullDetailViewProps) {
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < questionIds.length - 1;
  const router = useRouter();
  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lang, setLang] = useState<"eng" | "hin">("eng");
  const [aiEditType, setAiEditType] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState<EditFormData>({
    subject: "",
    chapter: "",
    topic: "",
    difficulty: "medium",
    questionType: "mcq",
    relatedExam: "",
    collection: "",
    sourceType: "original",
    question_hin: "",
    question_eng: "",
    solution_hin: "",
    solution_eng: "",
    video: "",
    answer: "",
    visibility: "private",
    pointCost: 5,
    tags: [],
    questionNo: "",
    date: "",
    shift: "",
    image: "",
  });
  const [options, setOptions] = useState<BilingualOption[]>([
    { id: "A", label: "A", text_hin: "", text_eng: "" },
    { id: "B", label: "B", text_hin: "", text_eng: "" },
    { id: "C", label: "C", text_hin: "", text_eng: "" },
    { id: "D", label: "D", text_hin: "", text_eng: "" },
  ]);
  const [tagInput, setTagInput] = useState("");

  // ─── Data loading ──────────────────────────────────────────────────────────

  const fetchQuestion = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/qbank/questions/${questionId}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const q: QuestionDetail = data.data;
      setQuestion(q);

      // Pre-populate edit form
      let correctAnswerStr = "";
      const loadedOptions: BilingualOption[] =
        q.options?.map((opt, index) => {
          const letterId = String.fromCharCode(65 + index);
          if (opt.isCorrect) {
            correctAnswerStr += (correctAnswerStr ? "," : "") + letterId;
          }
          return {
            id: letterId,
            label: letterId,
            text_hin: opt.textHi || "",
            text_eng: opt.textEn || "",
          };
        }) || [];

      if (loadedOptions.length > 0) setOptions(loadedOptions);

      setFormData({
        subject: q.folder?.name || q.subjectName || "",
        chapter: q.chapterName || "",
        topic: q.topic || "",
        difficulty: q.difficulty?.toLowerCase() || "medium",
        questionType:
          q.type?.toLowerCase() === "mcq_single"
            ? "mcq"
            : q.type?.toLowerCase() === "mcq_multiple"
              ? "multi_select"
              : q.type?.toLowerCase() === "descriptive"
                ? "integer"
                : q.type?.toLowerCase() || "mcq",
        relatedExam: q.relatedExam || q.exam || "",
        collection: q.collection || "",
        sourceType: q.sourceType || "original",
        question_hin: q.textHi || "",
        question_eng: q.textEn || "",
        solution_hin: q.explanationHi || "",
        solution_eng: q.explanationEn || "",
        video: q.video || "",
        answer: correctAnswerStr || q.answer || "",
        visibility: q.visibility || (q.isApproved ? "public" : "private"),
        pointCost: q.pointCost || 5,
        tags: q.tags || [],
        questionNo: q.questionNo || "",
        date: q.date || "",
        shift: q.shift || "",
        image: q.image || "",
      });
    } catch {
      toast.error("Failed to load question details");
    } finally {
      setIsLoading(false);
    }
  }, [questionId]);

  useEffect(() => {
    setIsEditing(false);
    fetchQuestion();
  }, [fetchQuestion]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditing) return;
      if (e.key === "ArrowLeft" && hasPrev) {
        onNavigate?.(questionIds[currentIndex - 1]);
      } else if (e.key === "ArrowRight" && hasNext) {
        onNavigate?.(questionIds[currentIndex + 1]);
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, hasPrev, hasNext, isEditing, onNavigate, questionIds, onClose]);

  // ─── Save handler ──────────────────────────────────────────────────────────

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const typeMap: Record<string, string> = {
        mcq: "MCQ_SINGLE",
        multi_select: "MCQ_MULTIPLE",
        integer: "DESCRIPTIVE",
        true_false: "TRUE_FALSE",
      };

      const payload: Record<string, unknown> = {
        textEn: formData.question_eng,
        textHi: formData.question_hin,
        explanationEn: formData.solution_eng,
        explanationHi: formData.solution_hin,
        type: typeMap[formData.questionType] || "MCQ_SINGLE",
        difficulty: formData.difficulty.toUpperCase(),
        visibility: formData.visibility,
        pointCost: formData.pointCost,
        tags: formData.tags,
        isApproved: formData.visibility === "public",
        subjectName: formData.subject,
        chapterName: formData.chapter,
        topic: formData.topic,
        relatedExam: formData.relatedExam,
        collection: formData.collection,
        sourceType: formData.sourceType,
        questionNo: formData.questionNo,
        date: formData.date || null,
        shift: formData.shift,
        video: formData.video,
        image: formData.image,
      };

      if (
        formData.questionType === "mcq" ||
        formData.questionType === "multi_select"
      ) {
        payload.options = options.map((opt, index) => ({
          textEn: opt.text_eng,
          textHi: opt.text_hin,
          sortOrder: index,
          isCorrect: formData.answer.includes(opt.id),
        }));
      } else if (formData.questionType === "integer") {
        payload.answer = formData.answer;
      }

      const res = await fetch(`${API_URL}/qbank/questions/${questionId}`, {
        method: "PATCH",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Update failed");

      toast.success("Question updated successfully!");
      setIsEditing(false);
      await fetchQuestion();
      onUpdate?.();
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyAIEdit = async () => {
    if (!aiEditType) {
      toast.error("Please select an edit type");
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch(`${API_URL}/ai/edit-question`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          editType: aiEditType,
          currentData: formData,
        }),
      });
      if (!res.ok) throw new Error("AI Edit failed");
      const data = await res.json();

      if (data.data) {
        setFormData((f) => ({ ...f, ...data.data }));
        if (data.data.options && Array.isArray(data.data.options)) {
          setOptions(data.data.options);
        }
        toast.success("AI Edit applied successfully!");
      }
    } catch {
      toast.error("Failed to apply AI edit");
    } finally {
      setAiLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading("Uploading image...");
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formDataUpload,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      if (data.url) {
        setFormData((f) => ({ ...f, image: data.url }));
        toast.success("Image uploaded!", { id: toastId });
      } else {
        throw new Error("No URL returned");
      }
    } catch (err) {
      toast.error("Failed to upload image", { id: toastId });
    }
  };

  const insertHtmlTag = (tag: string, field: keyof EditFormData) => {
    const current = (formData[field] as string) || "";
    setFormData((f) => ({ ...f, [field]: `${current}<${tag}></${tag}>` }));
  };

  const insertLatex = (
    type: "inline" | "display" | "chem",
    field: keyof EditFormData
  ) => {
    const templates = {
      inline: "\\(  \\)",
      display: "\\[  \\]",
      chem: "\\[\\ce{  }\\]",
    };
    const current = (formData[field] as string) || "";
    setFormData((f) => ({ ...f, [field]: current + templates[type] }));
  };

  // ─── Tags ──────────────────────────────────────────────────────────────────

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((f) => ({ ...f, tags: [...f.tags, tagInput.trim()] }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));
  };

  // ─── Loading / empty states ────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-[#F4511E]" />
        <p className="text-sm">Loading question...</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
        <AlertCircle className="w-8 h-8" />
        <p className="text-sm">Failed to load question.</p>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  const q = question;
  const diffLower = q.difficulty?.toLowerCase() || "medium";
  const typeLower = q.type?.toUpperCase() || "MCQ_SINGLE";

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-white shrink-0 gap-3">
        <div className="flex items-center gap-6 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-bold text-slate-900 whitespace-nowrap">
              Edit Q#{q.questionUniqueId || q.id.slice(0, 8)}
            </span>
          </div>

          <div className="flex items-center gap-4 border-l pl-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Status:
              </span>
              <div className="flex items-center gap-1.5">
                <Switch
                  checked={formData.visibility === "public"}
                  onCheckedChange={(checked) =>
                    setFormData((f) => ({
                      ...f,
                      visibility: checked ? "public" : "private",
                    }))
                  }
                />
                <span
                  className={`text-[11px] font-bold ${formData.visibility === "public"
                      ? "text-emerald-600"
                      : "text-amber-600"
                    }`}
                >
                  {formData.visibility === "public" ? "Published" : "Draft"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Subject:
              </span>
              <Select
                value={formData.subject}
                onValueChange={(v) =>
                  setFormData((f) => ({ ...f, subject: v }))
                }
              >
                <SelectTrigger className="h-7 min-w-[120px] text-[11px] bg-slate-50 border-slate-200">
                  <SelectValue placeholder="No subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="Maths">Maths</SelectItem>
                  <SelectItem value="Biology">Biology</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Difficulty:
              </span>
              <Select
                value={formData.difficulty}
                onValueChange={(v) =>
                  setFormData((f) => ({ ...f, difficulty: v }))
                }
              >
                <SelectTrigger className="h-7 min-w-[100px] text-[11px] bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Type:
              </span>
              <Select
                value={formData.questionType}
                onValueChange={(v) =>
                  setFormData((f) => ({ ...f, questionType: v }))
                }
              >
                <SelectTrigger className="h-7 min-w-[120px] text-[11px] bg-indigo-50 border-indigo-200 text-indigo-700 font-bold uppercase">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mcq">MCQ Single</SelectItem>
                  <SelectItem value="multi_select">MCQ Multiple</SelectItem>
                  <SelectItem value="integer">Integer</SelectItem>
                  <SelectItem value="true_false">True/False</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[10px] text-amber-600 font-medium animate-pulse">
            Make changes to enable save button
          </div>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-8 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300 font-bold px-4"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-1" />
            )}
            Save Changes
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-slate-800 hover:bg-slate-100"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden bg-[#F8F9FC]">
        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <div className="w-[260px] shrink-0 border-r bg-slate-50/50 flex flex-col p-4 gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              AI Assistant
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Edit Type
              </Label>
              <Select value={aiEditType} onValueChange={setAiEditType}>
                <SelectTrigger className="h-9 text-[12px] bg-white border-slate-200 shadow-sm">
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fix_grammar">Fix Grammar & Flow</SelectItem>
                  <SelectItem value="translate">
                    Translate to Hindi/English
                  </SelectItem>
                  <SelectItem value="simplify">Simplify Language</SelectItem>
                  <SelectItem value="generate_options">
                    Generate Better Options
                  </SelectItem>
                  <SelectItem value="generate_explanation">
                    Generate Detailed Solution
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleApplyAIEdit}
              disabled={aiLoading || !aiEditType}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold h-9 shadow-sm"
            >
              {aiLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Apply AI Edit
            </Button>
          </div>
        </div>

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        {/* KEY FIX: overflow-y-auto so all content scrolls, nothing clips */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 max-w-5xl mx-auto w-full">
          {/* Add Passage */}
          <div className="flex justify-center">
            <button className="flex items-center gap-2 text-indigo-500 hover:text-indigo-600 text-xs font-bold py-1 px-4 border border-dashed border-indigo-200 rounded-full bg-indigo-50/30 transition-colors">
              <BookOpen className="w-3.5 h-3.5" />
              Add Passage/Instruction
            </button>
          </div>

          {/* Question Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible">
            <div className="bg-slate-50/50 px-4 py-2 border-b flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Question
              </span>
            </div>
            <div className="p-4 flex flex-col gap-4">
              {/* English Question */}
              <div className="space-y-0 border border-slate-100 bg-slate-50/30 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-2 pt-2 pb-1">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                    English
                  </span>
                  <RichTextToolbar
                    onInsertTag={(tag) => insertHtmlTag(tag, "question_eng")}
                    onInsertLatex={(type) => insertLatex(type, "question_eng")}
                  />
                </div>
                <AutoResizeTextarea
                  value={formData.question_eng}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      question_eng: e.target.value,
                    }))
                  }
                  minRows={4}
                  className="rounded-none border-0 border-t border-slate-100 focus:ring-0 focus:ring-offset-0 focus:border-indigo-300 bg-white"
                  placeholder="Enter question in English..."
                />
              </div>

              {/* Hindi Question */}
              <div className="space-y-0 border border-slate-100 bg-slate-50/30 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-2 pt-2 pb-1">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                    Hindi
                  </span>
                  <RichTextToolbar
                    onInsertTag={(tag) => insertHtmlTag(tag, "question_hin")}
                    onInsertLatex={(type) => insertLatex(type, "question_hin")}
                  />
                </div>
                <AutoResizeTextarea
                  value={formData.question_hin}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      question_hin: e.target.value,
                    }))
                  }
                  minRows={4}
                  className="rounded-none border-0 border-t border-slate-100 focus:ring-0 focus:ring-offset-0 focus:border-indigo-300 bg-white"
                  placeholder="प्रश्न हिन्दी में लिखें..."
                />
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div className="bg-white rounded-xl border border-pink-200 shadow-sm overflow-visible ring-1 ring-pink-50">
            <div className="bg-pink-50/30 px-4 py-2 border-b border-pink-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-pink-500 uppercase tracking-widest">
                  Image
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="image-upload"
                  className="hidden"
                  onChange={handleImageUpload}
                  accept="image/*"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] font-bold text-slate-500 hover:text-slate-700 bg-slate-100 px-2"
                  onClick={() =>
                    document.getElementById("image-upload")?.click()
                  }
                >
                  <Pencil className="w-3 h-3 mr-1" /> Change
                </Button>
              </div>
            </div>
            <div className="p-6 flex justify-center items-center min-h-[150px] bg-slate-50/20">
              {formData.image ? (
                <img
                  src={formData.image}
                  alt="Question"
                  className="max-h-64 object-contain rounded-lg shadow-sm border bg-white"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border border-dashed border-slate-300">
                    <Plus className="w-5 h-5" />
                  </div>
                  <p className="text-[11px] font-medium uppercase tracking-wider">
                    No image attached
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Options Section */}
          {(formData.questionType === "mcq" ||
            formData.questionType === "multi_select") && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible">
                <div className="bg-slate-50/50 px-4 py-2 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Options
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Correct:
                    </span>
                    <Select
                      value={formData.answer}
                      onValueChange={(v) =>
                        setFormData((f) => ({ ...f, answer: v }))
                      }
                    >
                      <SelectTrigger className="h-7 min-w-[80px] text-[11px] bg-emerald-50 border-emerald-200 text-emerald-700 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map((opt) => (
                          <SelectItem key={opt.id} value={opt.id}>
                            {opt.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="p-3 space-y-3">
                  {options.map((opt) => (
                    <div
                      key={opt.id}
                      className={`flex flex-col gap-2 p-3 rounded-xl border transition-all ${formData.answer.includes(opt.id)
                          ? "bg-emerald-50/50 border-emerald-300 shadow-sm"
                          : "bg-white border-slate-200 shadow-sm hover:border-slate-300"
                        }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={`w-6 h-6 rounded-md shrink-0 flex items-center justify-center text-[11px] font-bold shadow-sm ${formData.answer.includes(opt.id)
                              ? "bg-emerald-500 text-white border-emerald-600"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                        >
                          {opt.id}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Option {opt.id}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2">
                        {/* English option — auto-resizes */}
                        <AutoResizeTextarea
                          value={opt.text_eng}
                          onChange={(e) =>
                            setOptions((prev) =>
                              prev.map((o) =>
                                o.id === opt.id
                                  ? { ...o, text_eng: e.target.value }
                                  : o
                              )
                            )
                          }
                          minRows={2}
                          placeholder={`English Option ${opt.id}...`}
                          className="border-slate-200 bg-white focus:border-indigo-300"
                        />
                        {/* Hindi option — auto-resizes */}
                        <AutoResizeTextarea
                          value={opt.text_hin}
                          onChange={(e) =>
                            setOptions((prev) =>
                              prev.map((o) =>
                                o.id === opt.id
                                  ? { ...o, text_hin: e.target.value }
                                  : o
                              )
                            )
                          }
                          minRows={2}
                          placeholder={`Hindi Option ${opt.id}...`}
                          className="border-slate-200 bg-white focus:border-indigo-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Solution Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible mb-12">
            <div className="bg-slate-50/50 px-4 py-2 border-b flex items-center gap-2">
              <Lightbulb className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Solution / Explanation
              </span>
            </div>
            <div className="p-4 flex flex-col gap-4">
              {/* English Solution */}
              <div className="space-y-0 border border-slate-100 bg-slate-50/30 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-2 pt-2 pb-1">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                    English
                  </span>
                  <RichTextToolbar
                    onInsertTag={(tag) => insertHtmlTag(tag, "solution_eng")}
                    onInsertLatex={(type) => insertLatex(type, "solution_eng")}
                  />
                </div>
                <AutoResizeTextarea
                  value={formData.solution_eng}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      solution_eng: e.target.value,
                    }))
                  }
                  minRows={4}
                  className="rounded-none border-0 border-t border-slate-100 focus:ring-0 focus:ring-offset-0 focus:border-indigo-300 bg-white"
                  placeholder="Explain the answer in English here..."
                />
              </div>

              {/* Hindi Solution */}
              <div className="space-y-0 border border-slate-100 bg-slate-50/30 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-2 pt-2 pb-1">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                    Hindi
                  </span>
                  <RichTextToolbar
                    onInsertTag={(tag) => insertHtmlTag(tag, "solution_hin")}
                    onInsertLatex={(type) => insertLatex(type, "solution_hin")}
                  />
                </div>
                <AutoResizeTextarea
                  value={formData.solution_hin}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      solution_hin: e.target.value,
                    }))
                  }
                  minRows={4}
                  className="rounded-none border-0 border-t border-slate-100 focus:ring-0 focus:ring-offset-0 focus:border-indigo-300 bg-white"
                  placeholder="उत्तर की व्याख्या हिन्दी में यहाँ लिखें..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div className="h-14 border-t bg-white shrink-0 px-6 flex items-center justify-between shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-4 text-xs font-bold text-slate-600 bg-white border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
          disabled={!hasPrev || isSaving}
          onClick={() => hasPrev && onNavigate?.(questionIds[currentIndex - 1])}
        >
          <ChevronLeft className="w-4 h-4 mr-2" /> Previous
        </Button>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] select-none">
            Question{" "}
            <span className="text-slate-900 mx-1">{currentIndex + 1}</span> of{" "}
            <span className="text-slate-900 mx-1">{questionIds.length}</span>
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-9 px-4 text-xs font-bold text-slate-600 bg-white border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
          disabled={!hasNext || isSaving}
          onClick={() =>
            hasNext && onNavigate?.(questionIds[currentIndex + 1])
          }
        >
          Next <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}