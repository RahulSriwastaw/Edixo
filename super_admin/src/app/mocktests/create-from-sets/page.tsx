import { useSidebarStore } from "@/store/sidebarStore";
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Plus,
  Trash2,
  Check,
  Copy,
  MessageCircle,
  Mail,
  Layers,
  Monitor,
  Download,
  Users,
  Eye,
  Sparkles,
  Zap,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { PINEntry, IDDisplay } from "@/components/set-system/PINEntry";
import { useMockTestCreationStore } from "@/components/set-system/stores/setStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CreateMockTestFromSetsPage() {
    const { isOpen } = useSidebarStore();
const router = useRouter();
  const {
    name,
    category,
    duration,
    marksCorrect,
    marksWrong,
    instructions,
    visibility,
    sections,
    questionOrder,
    createdMock,
    isLoading,
    setName,
    setCategory,
    setDuration,
    setMarksCorrect,
    setMarksWrong,
    setInstructions,
    setVisibility,
    setQuestionOrder,
    addSection,
    removeSection,
    updateSection,
    verifySection,
    submit,
    getTotalQuestions,
    getTotalCreators,
    reset,
  } = useMockTestCreationStore();

  const [successView, setSuccessView] = useState(false);

  // Categories
  const categories = ["SSC", "Railway", "JEE", "NEET", "UPSC", "GATE", "Banking", "Other"];

  // Mark options
  const correctMarkOptions = [1, 2, 4];
  const wrongMarkOptions = [0, -0.25, -0.5, -1];

  // Check if can submit
  const allVerified = sections.length > 0 && sections.every(s => s.verified);
  const canSubmit = name.trim().length > 0 && allVerified;

  // Handle submit
  const handleSubmit = async () => {
    await submit();
    if (useMockTestCreationStore.getState().createdMock) {
      setSuccessView(true);
    }
  };

  // Copy handlers
  const copyBoth = () => {
    if (createdMock) {
      navigator.clipboard.writeText(`MockTest ID: ${createdMock.contentId}\nPassword: ${createdMock.password}`);
      toast.success("ID and Password copied!");
    }
  };

  const shareWhatsApp = () => {
    if (createdMock) {
      const text = encodeURIComponent(`📋 ${createdMock.name}\n\nMockTest ID: ${createdMock.contentId}\nPassword: ${createdMock.password}\n\nAccess at: eduhub.in/access`);
      window.open(`https://wa.me/?text=${text}`, "_blank");
    }
  };

  const shareEmail = () => {
    if (createdMock) {
      const emailSubject = encodeURIComponent(createdMock.name);
      const body = encodeURIComponent(`Hi,\n\nHere's your access to "${createdMock.name}":\n\nMockTest ID: ${createdMock.contentId}\nPassword: ${createdMock.password}\n\nAccess at: eduhub.in/access\n\nBest regards`);
      window.open(`mailto:?subject=${emailSubject}&body=${body}`, "_blank");
    }
  };

  // Go back
  const handleBack = () => {
    reset();
    router.push("/question-bank/sets");
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/question-bank/sets" className="hover:text-[#F4511E]">Question Sets</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium">Create MockTest from Sets</span>
            </div>

            {!successView ? (
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Left Column - Exam Details */}
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Layers className="w-5 h-5 text-[#F4511E]" />
                        Exam Details
                      </h2>

                      {/* Test Name */}
                      <div>
                        <label className="text-sm font-medium text-gray-700">Test Name *</label>
                        <Input
                          placeholder="e.g., SSC CGL Full Mock — March 2026"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="text-sm font-medium text-gray-700">Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="mt-1 w-full h-10 px-3 border rounded-lg bg-white"
                        >
                          <option value="">Select category</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      {/* Duration */}
                      <div>
                        <label className="text-sm font-medium text-gray-700">Duration (minutes)</label>
                        <Input
                          type="number"
                          value={duration}
                          onChange={(e) => setDuration(Number(e.target.value))}
                          className="mt-1"
                          min={1}
                        />
                      </div>

                      {/* Marks */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Marks per Correct</label>
                          <div className="flex gap-2 mt-1">
                            {correctMarkOptions.map((m) => (
                              <Button
                                key={m}
                                type="button"
                                variant={marksCorrect === m ? "default" : "outline"}
                                size="sm"
                                onClick={() => setMarksCorrect(m)}
                                className={marksCorrect === m ? "bg-[#F4511E] hover:bg-[#E64A19]" : ""}
                              >
                                +{m}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Negative Marks</label>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            {wrongMarkOptions.map((m) => (
                              <Button
                                key={m}
                                type="button"
                                variant={marksWrong === m ? "default" : "outline"}
                                size="sm"
                                onClick={() => setMarksWrong(m)}
                                className={marksWrong === m ? "bg-[#F4511E] hover:bg-[#E64A19]" : ""}
                              >
                                {m === 0 ? "None" : m}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Instructions */}
                      <div>
                        <label className="text-sm font-medium text-gray-700">Instructions</label>
                        <Textarea
                          placeholder="Instructions shown to students before exam..."
                          value={instructions}
                          onChange={(e) => setInstructions(e.target.value)}
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Add Sets */}
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <h2 className="text-lg font-semibold text-xs uppercase tracking-wide text-gray-500">
                        Add Question Sets
                      </h2>

                      {/* Sections */}
                      <div className="space-y-4">
                        {sections.map((section, index) => (
                          <div
                            key={section.id}
                            className={cn(
                              "border-2 rounded-xl p-4 space-y-3 transition-all",
                              section.verified && "border-green-500 bg-green-50/30",
                              section.error && "border-red-300 bg-red-50/30"
                            )}
                          >
                            {/* Section Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">SECTION {index + 1}</Badge>
                                {section.verified && (
                                  <Badge className="bg-green-100 text-green-700 text-xs">
                                    <Check className="w-3 h-3 mr-1" /> Verified
                                  </Badge>
                                )}
                              </div>
                              {sections.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-400 hover:text-red-500"
                                  onClick={() => removeSection(section.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>

                            {/* Section Name */}
                            <div>
                              <label className="text-xs text-gray-500">Section Name</label>
                              <Input
                                placeholder="e.g., Mathematics"
                                value={section.name}
                                onChange={(e) => updateSection(section.id, { name: e.target.value })}
                                className="mt-1 h-9"
                              />
                            </div>

                            {/* Set ID */}
                            <div>
                              <label className="text-xs text-gray-500">Set ID (6 digits)</label>
                              <PINEntry
                                length={6}
                                value={section.setId}
                                onChange={(val) => updateSection(section.id, { setId: val, verified: false, error: undefined })}
                                disabled={isLoading}
                                className="mt-1"
                              />
                            </div>

                            {/* Password */}
                            <div>
                              <label className="text-xs text-gray-500">Password (6 digits)</label>
                              <PINEntry
                                length={6}
                                value={section.password}
                                onChange={(val) => updateSection(section.id, { password: val, verified: false, error: undefined })}
                                disabled={isLoading}
                                className="mt-1"
                              />
                            </div>

                            {/* Verify Button */}
                            {!section.verified && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => verifySection(section.id)}
                                disabled={!section.setId || !section.password || section.setId.length < 6 || section.password.length < 6}
                              >
                                Verify Set →
                              </Button>
                            )}

                            {/* Error */}
                            {section.error && (
                              <p className="text-sm text-red-600 flex items-center gap-1">
                                <span>❌</span> {section.error}
                              </p>
                            )}

                            {/* Verified Info with Creator */}
                            {section.verified && section.setData && (
                              <div className="p-3 bg-green-50 rounded-lg border border-green-200 space-y-2">
                                <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                                  <Zap className="w-4 h-4" />
                                  {section.setData.name}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-green-700">
                                  <span>{section.setData.questionCount} Questions</span>
                                  <span>Easy: {section.setData.difficulty.easy}</span>
                                  <span>Med: {section.setData.difficulty.medium}</span>
                                  <span>Hard: {section.setData.difficulty.hard}</span>
                                </div>
                                {/* Creator Info */}
                                <div className="flex items-center gap-2 pt-2 border-t border-green-200">
                                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                                    <User className="w-3 h-3 text-orange-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-gray-800">{section.setData.creator.name}</p>
                                    <p className="text-[10px] text-gray-500">{section.setData.creator.role} • {section.setData.creator.org}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Add Section Button */}
                      <Button
                        variant="outline"
                        className="w-full border-dashed"
                        onClick={addSection}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Another Section
                      </Button>

                      {/* Summary */}
                      {allVerified && (
                        <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">Summary</span>
                            <div className="flex gap-2">
                              <Badge className="bg-[#F4511E]">{sections.length} Sets</Badge>
                              <Badge variant="outline">{getTotalCreators().length} Teachers</Badge>
                            </div>
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{getTotalQuestions()} Questions</p>

                          {/* Question Order */}
                          <div className="mt-3 space-y-1">
                            <label className="text-xs text-gray-500">Question Order</label>
                            <div className="flex gap-2">
                              {[
                                { value: "section_wise", label: "Section-wise" },
                                { value: "shuffle_all", label: "Shuffle All" },
                              ].map((opt) => (
                                <Button
                                  key={opt.value}
                                  type="button"
                                  variant={questionOrder === opt.value ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setQuestionOrder(opt.value as typeof questionOrder)}
                                  className={questionOrder === opt.value ? "bg-[#F4511E] hover:bg-[#E64A19]" : ""}
                                >
                                  {opt.label}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Footer */}
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => router.push("/question-bank/sets")}>
                      Cancel
                    </Button>
                    <Button
                      className="bg-[#F4511E] hover:bg-[#E64A19] text-white"
                      disabled={!canSubmit || isLoading}
                      onClick={handleSubmit}
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
                        "Create MockTest"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* Success View */
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
                    <h2 className="text-2xl font-bold text-green-600">✅ MOCKTEST CREATED!</h2>
                    <p className="text-gray-600 mt-1">{createdMock?.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {getTotalQuestions()} Questions | {duration} Minutes | {getTotalQuestions() * marksCorrect} Marks
                    </p>
                  </div>

                  {/* ID and Password Cards */}
                  <div className="grid sm:grid-cols-2 gap-4 max-w-md mx-auto">
                    <IDDisplay label="MockTest ID" value={createdMock?.contentId || ""} />
                    <IDDisplay label="Password" value={createdMock?.password || ""} variant="pin" />
                  </div>

                  {/* Sets Summary with Creators */}
                  {createdMock?.sections && createdMock.sections.length > 0 && (
                    <div className="max-w-lg mx-auto">
                      <p className="text-sm text-gray-500 mb-2">Created from {createdMock.sections.length} Sets:</p>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        {createdMock.sections.filter(s => s.verified && s.setData).map((section) => (
                          <div key={section.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">📦 {section.setData?.contentId}</Badge>
                              <span className="font-medium">{section.setData?.name.split(" — ")[0]}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500">
                              <User className="w-3 h-3" />
                              <span className="text-xs">{section.setData?.creator.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
                  <div className="grid sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-4 border-t">
                    <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                      <Monitor className="w-5 h-5" />
                      <span className="text-xs">Digital Board</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                      <Download className="w-5 h-5" />
                      <span className="text-xs">Export PDF</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                      <Users className="w-5 h-5" />
                      <span className="text-xs">Assign</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={handleBack}>
                      <Eye className="w-5 h-5" />
                      <span className="text-xs">Preview</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
