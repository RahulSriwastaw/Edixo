"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  ChevronLeft,
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
import { Switch } from "@/components/ui/switch";
import { IDDisplay } from "@/components/set-system/PINEntry";
import { VisibilitySelector } from "@/components/set-system/VisibilitySelector";
import { useSetCreationStore } from "@/components/set-system/stores/setStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Global API utility
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)sb_token=([^;]*)/);
  return match ? match[1] : '';
}

// Map backend types/difficulties if needed
const mapDifficulty = (d: string) => d?.toLowerCase() || 'medium';
const mapType = (t: string) => {
  if (t === 'MCQ_SINGLE') return 'mcq';
  if (t === 'MCQ_MULTIPLE') return 'multi_select';
  if (t === 'DESCRIPTIVE') return 'integer';
  return 'mcq';
};

// Difficulty badge component
function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const styles: Record<string, string> = {
    easy: "bg-green-50 text-green-700",
    medium: "bg-amber-50 text-amber-700",
    hard: "bg-red-50 text-red-700",
  };
  return <Badge className={styles[difficulty] || ""}>{difficulty}</Badge>;
}

// Type badge component
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
    submit,
    reset,
  } = useSetCreationStore();

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showExpiry, setShowExpiry] = useState(false);
  const [showAddQuestions, setShowAddQuestions] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState<string[]>([]);

  const [apiQuestions, setApiQuestions] = useState<any[]>([]);
  const [loadedOrgs, setLoadedOrgs] = useState<any[]>([]);

  // Load questions and organizations from API
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const token = getToken();
        // Fetch Questions
        const qRes = await fetch(`${API_URL}/qbank/questions?limit=100`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (qRes.ok) {
          const resData = await qRes.json();
          // Map to local format
          const mappedQuestions = (resData.data?.questions || []).map((q: any) => ({
            id: q.id,
            question_eng: q.textEn || q.textHi || 'Untitled',
            type: mapType(q.type),
            subject: q.folder?.name || 'General',
            difficulty: mapDifficulty(q.difficulty),
            question_hin: q.textHi || '',
            visibility: q.isGlobal ? 'public' : 'private',
            pointCost: q.pointCost || 5,
            usageCount: q.usageCount || 0,
            answer: 'A', // Placeholder for set building UI compatibility
          }));
          setApiQuestions(mappedQuestions);
        }

        // Fetch Organizations
        const orgRes = await fetch(`${API_URL}/super-admin/organizations?limit=100`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (orgRes.ok) {
          const resData = await orgRes.json();
          setLoadedOrgs(resData.data?.organizations || []);
        }
      } catch (error) {
        console.error("Error fetching resources:", error);
      }
    };
    fetchResources();
  }, []);

  // Calculate difficulty breakdown
  const difficultyBreakdown = {
    easy: questions.filter(q => q.difficulty === "easy").length,
    medium: questions.filter(q => q.difficulty === "medium").length,
    hard: questions.filter(q => q.difficulty === "hard").length,
  };

  // Calculate type breakdown
  const typeBreakdown = {
    mcq: questions.filter(q => q.type === "mcq").length,
    integer: questions.filter(q => q.type === "integer").length,
    multi_select: questions.filter(q => q.type === "multi_select").length,
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

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

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Add selected questions
  const handleAddSelected = () => {
    const newQuestions = apiQuestions.filter(q => selectedToAdd.includes(q.id));
    addQuestions(newQuestions);
    setSelectedToAdd([]);
    setShowAddQuestions(false);
    toast.success(`Added ${newQuestions.length} questions`);
  };

  // Handle step navigation
  const canProceedToStep2 = questions.length > 0;
  const canSubmit = name.trim().length > 0;

  // Copy handlers
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

  // Reset and go back
  const handleBackToSets = () => {
    reset();
    router.push("/question-bank/sets");
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className="md:ml-60 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/question-bank/sets" className="hover:text-[#F4511E]">Question Sets</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium">Create New Set</span>
            </div>

            {/* Step Progress */}
            {step < 3 && (
              <div className="flex items-center gap-4">
                {[1, 2].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                        step >= s
                          ? "bg-[#F4511E] text-white"
                          : "bg-gray-100 text-gray-400"
                      )}
                    >
                      {step > s ? <Check className="w-4 h-4" /> : s}
                    </div>
                    <span className={cn(
                      "text-sm",
                      step >= s ? "text-gray-900 font-medium" : "text-gray-400"
                    )}>
                      {s === 1 ? "Questions" : "Details"}
                    </span>
                    {s < 2 && <ChevronRight className="w-4 h-4 text-gray-300" />}
                  </div>
                ))}
              </div>
            )}

            {/* Step 1: Questions Review */}
            {step === 1 && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Review Questions</h2>
                    <Badge className="bg-[#F4511E]">{questions.length} questions</Badge>
                  </div>

                  {/* Question List with Drag & Drop */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {questions.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Layers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No questions selected yet</p>
                        <p className="text-sm">Add questions from Question Bank</p>
                      </div>
                    ) : (
                      questions.map((question, index) => (
                        <div
                          key={question.id}
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragEnd={handleDragEnd}
                          className={cn(
                            "flex items-center gap-3 p-3 bg-white border rounded-lg cursor-move transition-all",
                            draggedIndex === index && "opacity-50 scale-[1.02] shadow-lg"
                          )}
                        >
                          <GripVertical className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500 w-12">Q{index + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 truncate">{question.question_eng}</p>
                            <p className="text-xs text-gray-500">{question.subject}</p>
                          </div>
                          <TypeBadge type={question.type} />
                          <DifficultyBadge difficulty={question.difficulty} />
                          <button
                            onClick={() => removeQuestion(question.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add More Button */}
                  <Button
                    variant="outline"
                    className="w-full border-dashed"
                    onClick={() => setShowAddQuestions(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add More Questions
                  </Button>

                  {/* Footer */}
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={() => router.push("/question-bank/sets")}>
                      Cancel
                    </Button>
                    <Button
                      className="bg-[#F4511E] hover:bg-[#E64A19] text-white"
                      disabled={!canProceedToStep2}
                      onClick={() => setStep(2)}
                    >
                      Continue <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Set Details */}
            {step === 2 && (
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Left: Form */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <h2 className="text-lg font-semibold">Set Details</h2>

                      {/* Name */}
                      <div>
                        <label className="text-sm font-medium text-gray-700">Set Name *</label>
                        <Input
                          placeholder="e.g., Mathematics — Algebra & Calculus"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="text-sm font-medium text-gray-700">Description</label>
                        <Textarea
                          placeholder="Brief description of this question set..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="mt-1"
                          rows={3}
                        />
                      </div>

                      {/* Subject & Chapter */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Subject</label>
                          <Select value={subjectId} onValueChange={setSubjectId}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="physics">Physics</SelectItem>
                              <SelectItem value="chemistry">Chemistry</SelectItem>
                              <SelectItem value="mathematics">Mathematics</SelectItem>
                              <SelectItem value="biology">Biology</SelectItem>
                              <SelectItem value="general">General</SelectItem>
                              <SelectItem value="reasoning">Reasoning</SelectItem>
                              <SelectItem value="gk">General Knowledge</SelectItem>
                              <SelectItem value="english">English</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Chapter</label>
                          <Select value={chapterId} onValueChange={setChapterId}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select chapter" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="algebra">Algebra</SelectItem>
                              <SelectItem value="calculus">Calculus</SelectItem>
                              <SelectItem value="kinematics">Kinematics</SelectItem>
                              <SelectItem value="organic">Organic Chemistry</SelectItem>
                              <SelectItem value="mixed">Mixed Topics</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Visibility */}
                      <VisibilitySelector value={visibility} onChange={setVisibility} />

                      {/* Org Selection (when org_only) */}
                      {visibility === "org_only" && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Select Organizations</label>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {loadedOrgs.map((org) => (
                              <label
                                key={org.id}
                                className="flex items-center gap-3 p-3 bg-white border rounded-lg cursor-pointer hover:border-gray-300"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedOrgIds.includes(org.id)}
                                  onChange={() => toggleOrg(org.id)}
                                  className="w-4 h-4 text-[#F4511E] rounded"
                                />
                                <div>
                                  <p className="text-sm font-medium">{org.name}</p>
                                  <p className="text-xs text-gray-500">Org ID: {org.orgId}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Expiry */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700">Set Expiry Date</label>
                          <Switch
                            checked={showExpiry}
                            onCheckedChange={setShowExpiry}
                          />
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

                  {/* Footer */}
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      <ChevronLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                    <Button
                      className="bg-[#F4511E] hover:bg-[#E64A19] text-white"
                      disabled={!canSubmit || isLoading}
                      onClick={submit}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Creating...
                        </>
                      ) : (
                        "Create Set"
                      )}
                    </Button>
                  </div>
                </div>

                {/* Right: Preview */}
                <div className="lg:col-span-1">
                  <Card className="sticky top-6">
                    <CardContent className="p-4 space-y-4">
                      <h3 className="font-medium text-gray-900">Difficulty Breakdown</h3>
                      <div className="space-y-2">
                        {["easy", "medium", "hard"].map((diff) => {
                          const count = difficultyBreakdown[diff as keyof typeof difficultyBreakdown];
                          const percentage = questions.length > 0 ? Math.round((count / questions.length) * 100) : 0;
                          return (
                            <div key={diff} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="capitalize text-gray-600">{diff}</span>
                                <span className="text-gray-900">{count} ({percentage}%)</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all",
                                    diff === "easy" && "bg-green-500",
                                    diff === "medium" && "bg-amber-500",
                                    diff === "hard" && "bg-red-500"
                                  )}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="border-t pt-4">
                        <h3 className="font-medium text-gray-900">Question Types</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {typeBreakdown.mcq > 0 && <Badge>MCQ: {typeBreakdown.mcq}</Badge>}
                          {typeBreakdown.integer > 0 && <Badge>Integer: {typeBreakdown.integer}</Badge>}
                          {typeBreakdown.multi_select > 0 && <Badge>Multi: {typeBreakdown.multi_select}</Badge>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Step 3: Success */}
            {step === 3 && createdSet && (
              <Card>
                <CardContent className="p-8 text-center space-y-6">
                  {/* Success icon */}
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

                  {/* ID and Password Cards */}
                  <div className="grid sm:grid-cols-2 gap-4 max-w-md mx-auto">
                    <IDDisplay label="Set ID" value={createdSet.contentId} />
                    <IDDisplay label="Password" value={createdSet.password} variant="pin" />
                  </div>

                  {/* Share Buttons */}
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

                  {/* Action Grid */}
                  <div className="grid sm:grid-cols-2 gap-3 max-w-md mx-auto pt-4 border-t">
                    <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                      <Layers className="w-5 h-5" />
                      <span>Create MockTest</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                      <BookOpen className="w-5 h-5" />
                      <span>Create eBook</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                      <Eye className="w-5 h-5" />
                      <span>Preview Set</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={handleBackToSets}>
                      <FolderOpen className="w-5 h-5" />
                      <span>My Sets</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>

      {/* Add Questions Modal */}
      {showAddQuestions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Add Questions</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowAddQuestions(false)}>✕</Button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {apiQuestions.map((q) => {
                  const isSelected = selectedToAdd.includes(q.id);
                  return (
                    <label
                      key={q.id}
                      className={cn(
                        "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all",
                        isSelected ? "border-[#F4511E] bg-orange-50" : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          setSelectedToAdd(prev =>
                            isSelected ? prev.filter(id => id !== q.id) : [...prev, q.id]
                          );
                        }}
                        className="w-4 h-4 text-[#F4511E] rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">{q.question_eng}</p>
                        <p className="text-xs text-gray-500">{q.subject}</p>
                      </div>
                      <TypeBadge type={q.type} />
                      <DifficultyBadge difficulty={q.difficulty} />
                    </label>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-sm text-gray-500">
                  {selectedToAdd.length} questions selected
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowAddQuestions(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-[#F4511E] hover:bg-[#E64A19] text-white"
                    disabled={selectedToAdd.length === 0}
                    onClick={handleAddSelected}
                  >
                    Add {selectedToAdd.length} Questions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
