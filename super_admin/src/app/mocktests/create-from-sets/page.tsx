"use client";
import { useSidebarStore } from "@/store/sidebarStore";

import { useState, useEffect } from "react";
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
  Building2,
  FolderOpen,
  BookOpen,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { useMockTestCreationStore } from "@/components/set-system/stores/setStore";
import { mockbookService } from "@/services/mockbookService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

export default function CreateMockTestFromSetsPage() {
  const { isOpen } = useSidebarStore();
  const router = useRouter();
  const {
    name, category, orgId, folderId, categoryId, subCategoryId,
    duration, marksCorrect, marksWrong, instructions, isPublic,
    sections, questionOrder, createdMock, isLoading,
    setName, setCategory, setOrgId, setFolderId, setCategoryId, setSubCategoryId,
    setDuration, setMarksCorrect, setMarksWrong, setInstructions, setIsPublic,
    setQuestionOrder, addSection, removeSection, updateSection, verifySection, submit, reset,
    getTotalQuestions, getTotalCreators,
  } = useMockTestCreationStore();

  const [successView, setSuccessView] = useState(false);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);

  const correctMarkOptions = [1, 2, 4];
  const wrongMarkOptions = [0, -0.25, -0.33, -0.5, -1];

  // Load organizations on mount
  useEffect(() => {
    const loadOrgs = async () => {
      setLoadingOrgs(true);
      try {
        const res = await api.get('/organizations?limit=100');
        setOrganizations(res.data?.organizations || res.data || []);
      } catch (e) {
        console.error("failed to load orgs", e);
      } finally {
        setLoadingOrgs(false);
      }
    };
    loadOrgs();
  }, []);

  // Load folders when orgId changes
  useEffect(() => {
    if (!orgId) { setFolders([]); return; }
    mockbookService.getFolders(orgId).then(setFolders).catch(() => setFolders([]));
  }, [orgId]);

  // Load series when folderId changes
  useEffect(() => {
    if (!folderId) { setSeries([]); return; }
    mockbookService.getSeries(folderId, orgId).then(setSeries).catch(() => setSeries([]));
  }, [folderId, orgId]);

  // Load subcategories when categoryId changes
  useEffect(() => {
    if (!categoryId) { setSubCategories([]); return; }
    mockbookService.getSubCategories(categoryId).then(setSubCategories).catch(() => setSubCategories([]));
  }, [categoryId]);

  const allVerified = sections.length > 0 && sections.every(s => s.verified);
  const canSubmit = name.trim().length > 0 && allVerified && orgId.trim().length > 0;

  const handleSubmit = async () => {
    try {
      await submit();
      if (useMockTestCreationStore.getState().createdMock) {
        setSuccessView(true);
        toast.success("Mock test created and published!");
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to create mock test");
    }
  };

  const copyTestId = () => {
    if (createdMock) {
      navigator.clipboard.writeText(createdMock.testId);
      toast.success("Test ID copied!");
    }
  };

  const shareWhatsApp = () => {
    if (createdMock) {
      const text = encodeURIComponent(`📋 ${createdMock.name}\n\nMockTest ID: ${createdMock.testId}\n\nAccess at: Mockbook App → Tests`);
      window.open(`https://wa.me/?text=${text}`, "_blank");
    }
  };

  const shareEmail = () => {
    if (createdMock) {
      const emailSubject = encodeURIComponent(createdMock.name);
      const body = encodeURIComponent(`Hi,\n\nHere's your access to "${createdMock.name}":\n\nMockTest ID: ${createdMock.testId}\n\nAccess at: Mockbook App → Tests\n\nBest regards`);
      window.open(`mailto:?subject=${emailSubject}&body=${body}`, "_blank");
    }
  };

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
            {/* Breadcrumb */}
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

                      {/* Organization */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          <Building2 className="w-4 h-4" /> Organization *
                        </label>
                        <select
                          value={orgId}
                          onChange={(e) => { setOrgId(e.target.value); setFolderId(""); setCategoryId(""); setSubCategoryId(""); }}
                          className="mt-1 w-full h-10 px-3 border rounded-lg bg-white text-sm"
                        >
                          <option value="">Select organization</option>
                          {organizations.map((org) => (
                            <option key={org.orgId} value={org.orgId}>{org.name} ({org.orgId})</option>
                          ))}
                        </select>
                      </div>

                      {/* Folder (Category) */}
                      {orgId && (
                        <div>
                          <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            <FolderOpen className="w-4 h-4" /> Exam Category (Folder)
                          </label>
                          <select
                            value={folderId}
                            onChange={(e) => { setFolderId(e.target.value); setCategoryId(""); setSubCategoryId(""); }}
                            className="mt-1 w-full h-10 px-3 border rounded-lg bg-white text-sm"
                          >
                            <option value="">No folder (show in Live & Free)</option>
                            {folders.map((f) => (
                              <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Series (Category inside Folder) */}
                      {folderId && series.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            <BookOpen className="w-4 h-4" /> Test Series
                          </label>
                          <select
                            value={categoryId}
                            onChange={(e) => { setCategoryId(e.target.value); setSubCategoryId(""); }}
                            className="mt-1 w-full h-10 px-3 border rounded-lg bg-white text-sm"
                          >
                            <option value="">No series</option>
                            {series.map((s) => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* SubCategory */}
                      {categoryId && subCategories.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Sub-Category (Folder)</label>
                          <select
                            value={subCategoryId}
                            onChange={(e) => setSubCategoryId(e.target.value)}
                            className="mt-1 w-full h-10 px-3 border rounded-lg bg-white text-sm"
                          >
                            <option value="">No sub-category</option>
                            {subCategories.map((s) => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                      )}

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

                      {/* Visibility */}
                      <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-gray-700">Public (visible to all students)</label>
                        <button
                          type="button"
                          onClick={() => setIsPublic(!isPublic)}
                          className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                            isPublic ? "bg-[#F4511E]" : "bg-gray-200"
                          )}
                        >
                          <span className={cn(
                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                            isPublic ? "translate-x-6" : "translate-x-1"
                          )} />
                        </button>
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
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Zap className="w-5 h-5 text-[#F4511E]" />
                        Add Question Sets
                      </h2>
                      <p className="text-xs text-gray-500">Paste the Set DB-ID from <Link href="/question-bank/sets" className="text-[#F4511E] hover:underline">Q-Bank → Sets</Link> page</p>

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

                            {/* Set DB ID */}
                            <div>
                              <label className="text-xs text-gray-500">Set ID (paste DB-id from Q-Bank Sets)</label>
                              <Input
                                placeholder="e.g., clx1234abcd..."
                                value={section.setId}
                                onChange={(e) => updateSection(section.id, { setId: e.target.value, verified: false, error: undefined })}
                                disabled={isLoading || section.verified}
                                className="mt-1 h-9 font-mono text-xs"
                              />
                            </div>

                            {/* Verify Button */}
                            {!section.verified && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => verifySection(section.id)}
                                disabled={!section.setId || section.setId.length < 4}
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

                            {/* Verified Info */}
                            {section.verified && section.setData && (
                              <div className="p-3 bg-green-50 rounded-lg border border-green-200 space-y-2">
                                <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                                  <Zap className="w-4 h-4" />
                                  {section.setData.name}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-green-700">
                                  <span>{section.setData.questionCount} Questions</span>
                                  <span>ID: {section.setData.contentId}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs text-red-500 h-auto p-0 hover:bg-transparent"
                                  onClick={() => updateSection(section.id, { verified: false, setId: "", setDbId: undefined, setData: undefined, error: undefined })}
                                >
                                  ✕ Remove
                                </Button>
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
                            <Badge className="bg-[#F4511E]">{sections.length} Sets</Badge>
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{getTotalQuestions()} Questions</p>
                          <p className="text-sm text-gray-500 mt-1">Total Marks: {getTotalQuestions() * marksCorrect} | Duration: {duration} mins</p>

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
                          Creating & Publishing...
                        </>
                      ) : (
                        "Create & Publish MockTest"
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
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-green-600">✅ MOCKTEST LIVE!</h2>
                    <p className="text-gray-600 mt-1">{createdMock?.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {getTotalQuestions()} Questions | {duration} Minutes | {getTotalQuestions() * marksCorrect} Marks
                    </p>
                  </div>

                  {/* Test ID */}
                  <div className="max-w-sm mx-auto bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Test ID (share with students)</p>
                    <p className="text-lg font-bold font-mono text-gray-900">{createdMock?.testId}</p>
                    <Button size="sm" variant="outline" onClick={copyTestId} className="mt-2">
                      <Copy className="w-3 h-3 mr-1" /> Copy Test ID
                    </Button>
                  </div>

                  <p className="text-sm text-green-700 font-medium">
                    ✅ Students can now see this test in Mockbook → Tests page
                  </p>

                  {/* Share Buttons */}
                  <div className="flex justify-center gap-3">
                    <Button variant="outline" onClick={shareWhatsApp}>
                      <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                    </Button>
                    <Button variant="outline" onClick={shareEmail}>
                      <Mail className="w-4 h-4 mr-2" /> Email
                    </Button>
                  </div>

                  {/* Action Grid */}
                  <div className="grid sm:grid-cols-3 gap-3 max-w-lg mx-auto pt-4 border-t">
                    <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                      <Link href="/mockbook">
                        <Eye className="w-5 h-5" />
                        <span className="text-xs">View in Mockbook</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => { reset(); setSuccessView(false); }}>
                      <Plus className="w-5 h-5" />
                      <span className="text-xs">Create Another</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={handleBack}>
                      <Monitor className="w-5 h-5" />
                      <span className="text-xs">Back to Sets</span>
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
