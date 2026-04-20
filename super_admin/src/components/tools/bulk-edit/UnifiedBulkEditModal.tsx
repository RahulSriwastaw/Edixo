"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { API_URL, getAuthHeaders } from "@/lib/api-config";
import { toast } from "sonner";
import { Loader2, Pencil, Sparkles, AlertCircle, Calendar as CalendarIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  EDIT_TYPES,
  LANGUAGE_VARIATION_ACTIONS,
  SOLUTION_ACTIONS,
  LANGUAGES
} from "@/lib/ai-providers-config";

interface UnifiedBulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  questionIds: string[];
  onSuccess: () => void;
  allFolders?: any[];
  defaultTab?: "metadata" | "ai";
  onNextAI: (config: any) => void;
}

interface FieldState {
  enabled: boolean;
  value: string;
}

export function UnifiedBulkEditModal({
  isOpen,
  onClose,
  selectedCount,
  questionIds,
  onSuccess,
  allFolders = [],
  defaultTab = "metadata",
  onNextAI,
}: UnifiedBulkEditModalProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [loading, setLoading] = useState(false);

  // Metadata States
  const [subject, setSubject] = useState<FieldState>({ enabled: false, value: "" });
  const [chapter, setChapter] = useState<FieldState>({ enabled: false, value: "" });
  const [type, setType] = useState<FieldState>({ enabled: false, value: "" });
  const [difficulty, setDifficulty] = useState<FieldState>({ enabled: false, value: "" });
  const [status, setStatus] = useState<FieldState>({ enabled: false, value: "" });
  const [exam, setExam] = useState<FieldState>({ enabled: false, value: "" });
  const [date, setDate] = useState<FieldState>({ enabled: false, value: "" });
  const [shift, setShift] = useState<FieldState>({ enabled: false, value: "" });

  // AI States
  const [editType, setEditType] = useState("");
  const [action, setAction] = useState("");
  const [language, setLanguage] = useState("Hindi");
  const [customPrompt, setCustomPrompt] = useState("");

  const resetMetadata = () => {
    setSubject({ enabled: false, value: "" });
    setChapter({ enabled: false, value: "" });
    setType({ enabled: false, value: "" });
    setDifficulty({ enabled: false, value: "" });
    setStatus({ enabled: false, value: "" });
    setExam({ enabled: false, value: "" });
    setDate({ enabled: false, value: "" });
    setShift({ enabled: false, value: "" });
  };

  const resetAI = () => {
    setEditType("");
    setAction("");
    setLanguage("Hindi");
    setCustomPrompt("");
  };

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      resetMetadata();
      resetAI();
    }
  }, [isOpen, defaultTab]);

  const subjects = allFolders.filter((f) => f.depth === 0).map((f) => f.name);

  // Metadata Update Handler
  const handleMetadataUpdate = async () => {

    const updates: any = {};
    if (subject.enabled) updates.subject = subject.value;
    if (chapter.enabled) updates.chapter = chapter.value;
    if (type.enabled) updates.question_type = type.value;
    if (difficulty.enabled) updates.difficulty = difficulty.value;
    if (status.enabled) updates.status = status.value;
    if (exam.enabled) updates.exam = exam.value;
    if (date.enabled) updates.date = date.value;
    if (shift.enabled) updates.shift = shift.value;

    if (Object.keys(updates).length === 0) {
      toast.error("Please select at least one field to update");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/qbank/questions/bulk-update`, {
        method: "PATCH",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          question_ids: questionIds,
          updates,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`✓ ${data.updated_count} questions updated successfully`);
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Failed to update questions");
      }
    } catch (error) {
      toast.error("An error occurred during bulk update");
    } finally {
      setLoading(false);
    }
  };

  // AI Next Handler
  const handleAINext = () => {
    if (!editType) {
      toast.error("Please select an AI edit type");
      return;
    }
    onNextAI({
      editType,
      action: action || undefined,
      language: language || undefined,
      customPrompt: customPrompt || undefined
    });
  };

  const isAnyMetadataEnabled =
    subject.enabled || chapter.enabled || type.enabled || difficulty.enabled ||
    status.enabled || exam.enabled || date.enabled || shift.enabled;

  const handleCheckboxChange = (field: string, checked: boolean) => {
    const setterMap: any = {
      subject: setSubject, chapter: setChapter, type: setType, difficulty: setDifficulty,
      status: setStatus, exam: setExam, date: setDate, shift: setShift,
    };
    const setter = setterMap[field];
    if (setter) setter((prev: FieldState) => ({ ...prev, enabled: checked }));
  };

  // AI Helpers
  const getActionOptions = () => {
    if (editType === "language_variation") return LANGUAGE_VARIATION_ACTIONS;
    if (editType === "solution_add") return SOLUTION_ACTIONS;
    return [];
  };
  const showActionDropdown = editType === "language_variation" || editType === "solution_add";
  const showLanguageDropdown = editType === "language_variation" && action === "translate_fully";
  const showCustomPrompt = editType === "custom";

  const getPreviewPrompt = () => {
    if (editType === "question_variation") return "Generate a variation of this question keeping the same concept and difficulty.";
    if (editType === "language_variation" && action === "make_bilingual") return "Make this question bilingual by adding a Hindi translation alongside the existing content.";
    if (editType === "solution_add") {
      if (action === "add_solution_missing") return "Create a clear, step-by-step solution for this MCQ.";
      if (action === "make_detailed") return "Expand the solution with more detailed explanation.";
      if (action === "make_crisp") return "Convert solution to bullet points format.";
    }
    return "";
  };

  const renderMetadataField = (id: string, label: string, state: FieldState, children: React.ReactNode) => (
    <div className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 px-1 rounded transition-colors">
      <div className="flex items-center gap-2 w-32 shrink-0">
        <Checkbox
          id={`unified-check-${id}`}
          checked={state.enabled}
          onCheckedChange={(checked) => handleCheckboxChange(id, !!checked)}
        />
        <Label
          htmlFor={`unified-check-${id}`}
          className="text-[10px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer"
        >
          {label}
        </Label>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between mt-1">
             <div className="space-y-1">
                <DialogTitle className="text-xl flex items-center gap-2">
                   Bulk Edit Operations
                   <span className="text-xs bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full font-normal">
                      {selectedCount} Questions
                   </span>
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Choose between standard metadata updates or AI-powered content generation.
                </DialogDescription>
             </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden mt-4">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1">
              <TabsTrigger value="metadata" className="flex items-center gap-2 py-2">
                <Pencil className="w-3.5 h-3.5" />
                Standard Edit
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2 py-2">
                <Sparkles className="w-3.5 h-3.5" />
                AI Power Edit
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <TabsContent value="metadata" className="m-0 space-y-1">
              {renderMetadataField("subject", "Subject", subject,
                <Select disabled={!subject.enabled} value={subject.value} onValueChange={(val) => setSubject((p) => ({ ...p, value: val }))}>
                  <SelectTrigger className={subject.enabled ? "border-brand-primary ring-1 ring-brand-primary/20 h-9" : "h-9"}>
                    <SelectValue placeholder="Select Subject..." />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((sub) => <SelectItem key={sub} value={sub}>{sub}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              {renderMetadataField("chapter", "Chapter", chapter,
                <Input
                  disabled={!chapter.enabled}
                  placeholder="Enter chapter name"
                  value={chapter.value}
                  onChange={(e) => setChapter((p) => ({ ...p, value: e.target.value }))}
                  className={chapter.enabled ? "border-brand-primary ring-1 ring-brand-primary/20 h-9" : "h-9"}
                />
              )}
              {renderMetadataField("type", "Question Type", type,
                <Input
                  disabled={!type.enabled}
                  placeholder="e.g. MCQ, Subjective"
                  value={type.value}
                  onChange={(e) => setType((p) => ({ ...p, value: e.target.value }))}
                  className={type.enabled ? "border-brand-primary ring-1 ring-brand-primary/20 h-9" : "h-9"}
                />
              )}
              {renderMetadataField("difficulty", "Difficulty", difficulty,
                <Select disabled={!difficulty.enabled} value={difficulty.value} onValueChange={(val) => setDifficulty((p) => ({ ...p, value: val }))}>
                  <SelectTrigger className={difficulty.enabled ? "border-brand-primary ring-1 ring-brand-primary/20 h-9" : "h-9"}>
                    <SelectValue placeholder="Select Difficulty..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {renderMetadataField("status", "Status", status,
                <Select disabled={!status.enabled} value={status.value} onValueChange={(val) => setStatus((p) => ({ ...p, value: val }))}>
                  <SelectTrigger className={status.enabled ? "border-brand-primary ring-1 ring-brand-primary/20 h-9" : "h-9"}>
                    <SelectValue placeholder="Select Status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {renderMetadataField("exam", "Exam", exam,
                <Input
                  disabled={!exam.enabled}
                  placeholder="e.g. SSC CGL"
                  value={exam.value}
                  onChange={(e) => setExam((p) => ({ ...p, value: e.target.value }))}
                  className={exam.enabled ? "border-brand-primary ring-1 ring-brand-primary/20 h-9" : "h-9"}
                />
              )}

              {renderMetadataField("date", "Date", date,
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      disabled={!date.enabled}
                      className={cn(
                        "w-full justify-start text-left font-normal h-9",
                        !date.value && "text-muted-foreground",
                        date.enabled && "border-brand-primary ring-1 ring-brand-primary/20"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date.value ? format(new Date(date.value), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date.value ? new Date(date.value) : undefined}
                      onSelect={(val) => setDate((p) => ({ ...p, value: val ? val.toISOString() : "" }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}

              {renderMetadataField("shift", "Shift", shift,
                <Select 
                  disabled={!shift.enabled} 
                  value={shift.value} 
                  onValueChange={(val) => setShift((p) => ({ ...p, value: val }))}
                >
                  <SelectTrigger className={shift.enabled ? "border-brand-primary ring-1 ring-brand-primary/20 h-9" : "h-9"}>
                    <SelectValue placeholder="Select Shift..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Shift 1</SelectItem>
                    <SelectItem value="2">Shift 2</SelectItem>
                    <SelectItem value="3">Shift 3</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </TabsContent>

            <TabsContent value="ai" className="m-0 space-y-5 py-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-1 text-sm font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" /> AI Operation Type
                </Label>
                <Select value={editType} onValueChange={setEditType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select what AI should do..." />
                  </SelectTrigger>
                  <SelectContent>
                    {EDIT_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex flex-col text-left">
                          <span className="font-medium">{type.name}</span>
                          <span className="text-[10px] text-gray-500">{type.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {showActionDropdown && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <Label className="text-sm font-semibold">Specific Action</Label>
                  <Select value={action} onValueChange={setAction}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select precise action..." />
                    </SelectTrigger>
                    <SelectContent>
                      {getActionOptions().map((opt) => <SelectItem key={opt.id} value={opt.id}>{opt.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {showLanguageDropdown && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <Label className="text-sm font-semibold">Target Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select language..." />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {getPreviewPrompt() && !showCustomPrompt && (
                <div className="space-y-1.5 animate-in zoom-in-95 duration-200">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">AI Instruction Preview</Label>
                  <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg font-mono text-xs text-indigo-700 italic">
                    "{getPreviewPrompt()}"
                  </div>
                </div>
              )}

              {showCustomPrompt && (
                <div className="space-y-2 animate-in fade-in duration-300">
                  <Label className="text-sm font-semibold">Custom AI Instruction</Label>
                  <Textarea
                    placeholder="Describe exactly what you want AI to do... (e.g. 'Rephrase all questions to be more conversational')"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="min-h-[100px] text-sm"
                  />
                </div>
              )}

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="text-[11px] text-amber-900 leading-relaxed">
                  <p className="font-bold">Important Notice</p>
                  <p>AI operations use platform credits and will modify question content. This process runs in the background. Once started, you can continue working.</p>
                </div>
              </div>
            </TabsContent>
          </div>

          <DialogFooter className="p-6 pt-3 bg-gray-50 border-t border-gray-100 m-0">
            {activeTab === "metadata" ? (
              <div className="flex w-full gap-3">
                <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1">Cancel</Button>
                <Button onClick={handleMetadataUpdate} disabled={!isAnyMetadataEnabled || loading} className="flex-1 bg-brand-primary hover:bg-brand-primary/90">
                  {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Apply Metadata Updates
                </Button>
              </div>
            ) : (
              <div className="flex w-full gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
                <Button 
                  onClick={handleAINext} 
                  disabled={!editType} 
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white shadow-lg shadow-purple-200"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Continue to AI Execution
                </Button>
              </div>
            )}
          </DialogFooter>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
