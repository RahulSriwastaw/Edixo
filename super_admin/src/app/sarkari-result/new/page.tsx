"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Save,
  Send,
  Loader2,
  Briefcase,
  FileText,
  Ticket,
  ClipboardList,
  GraduationCap,
  BookOpen,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { toast } from "sonner";

const postTypes = [
  { value: "job", label: "Government Job", icon: Briefcase },
  { value: "result", label: "Result", icon: FileText },
  { value: "admit_card", label: "Admit Card", icon: Ticket },
  { value: "answer_key", label: "Answer Key", icon: ClipboardList },
  { value: "admission", label: "Admission", icon: GraduationCap },
  { value: "syllabus", label: "Syllabus", icon: BookOpen },
];

type Category = {
  id: string;
  name: string;
  slug: string;
  type?: string;
};

type AiDraftResponse = {
  success?: boolean;
  data?: {
    title?: string;
    slug?: string;
    excerpt?: string;
    contentHtml?: string;
    contentText?: string;
    seoTitle?: string;
    seoDescription?: string;
    focusKeyword?: string;
    featuredImageUrl?: string;
    featuredImageAlt?: string;
    suggestedCategorySlugs?: string[];
    sourceUrl?: string;
    extractedTitle?: string;
    extractedDescription?: string;
    extractedFeaturedImageUrl?: string;
  };
  error?: string;
  message?: string;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const inferPostType = (text: string) => {
  const value = text.toLowerCase();
  if (value.includes("admit card")) return "admit_card";
  if (value.includes("answer key")) return "answer_key";
  if (value.includes("syllabus")) return "syllabus";
  if (value.includes("admission")) return "admission";
  if (value.includes("result")) return "result";
  return "job";
};

const extractLineValue = (text: string, labels: string[]) => {
  const lines = text.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    const lower = line.toLowerCase();
    for (const label of labels) {
      const normalized = label.toLowerCase();
      if (
        lower.startsWith(`${normalized}:`) ||
        lower.startsWith(`${normalized} -`)
      ) {
        return line
          .slice(label.length + 1)
          .replace(/^[-:\s]+/, "")
          .trim();
      }
    }
  }
  return "";
};

const extractSectionText = (text: string, labels: string[]) => {
  const lines = text.split(/\r?\n/);
  let startIndex = -1;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim().toLowerCase();
    if (labels.some((label) => line.startsWith(label.toLowerCase()))) {
      startIndex = i;
      break;
    }
  }

  if (startIndex === -1) return "";

  const section: string[] = [];
  for (let i = startIndex; i < lines.length; i += 1) {
    const current = lines[i].trim();
    if (!current && section.length > 0) break;
    if (
      i > startIndex &&
      /^(important dates|important links|application fee|age limit|selection process|how to apply|eligibility|faq|vacancy details)\b/i.test(
        current,
      )
    ) {
      break;
    }
    section.push(lines[i]);
  }

  return section.join("\n").trim();
};

const parseListSection = (text: string, labels: string[]) => {
  const section = extractSectionText(text, labels);
  if (!section) return [] as string[];

  return section
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*•\d.()\s]+/, "").trim())
    .filter(
      (line) =>
        line &&
        !labels.some((label) => line.toLowerCase() === label.toLowerCase()),
    );
};

export default function CreateEditPostPage() {
  const { isOpen } = useSidebarStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [aiSourceUrl, setAiSourceUrl] = useState("");
  const [aiInstructions, setAiInstructions] = useState(
    "Rewrite this into a clean Sarkari Result style post with short sections, student-friendly language, and structured details for vacancy, eligibility, dates, and links.",
  );
  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    postType: "job",
    status: "draft",
    categoryId: "",
    organization: "",
    stateName: "",
    qualification: "",
    featuredImageUrl: "",
    applicationFee: "",
    ageLimit: "",
    vacancyDetails: "",
    eligibility: "",
    selectionProcess: "",
    howToApply: "",
    importantLinks: "",
    faqData: "",
    importantDates: "",
    applicationStartDate: "",
    applicationEndDate: "",
    examDate: "",
    resultDate: "",
    seoTitle: "",
    seoDescription: "",
    focusKeyword: "",
  });

  useEffect(() => {
    fetch("/api/sarkari/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));

    if (editId) {
      fetch(`/api/sarkari/posts/${editId}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) {
            const p = d.post;
            setForm({
              title: p.title || "",
              slug: p.slug || "",
              content: p.content || "",
              excerpt: p.excerpt || "",
              postType: p.postType || "job",
              status: p.status || "draft",
              categoryId: p.categoryId || "",
              organization: p.organization || "",
              stateName: p.stateName || "",
              qualification: p.qualification || "",
              featuredImageUrl: p.featuredImageUrl || "",
              applicationFee: p.applicationFee
                ? JSON.stringify(p.applicationFee, null, 2)
                : "",
              ageLimit: p.ageLimit ? JSON.stringify(p.ageLimit, null, 2) : "",
              vacancyDetails: p.vacancyDetails
                ? JSON.stringify(p.vacancyDetails, null, 2)
                : "",
              eligibility: p.eligibility
                ? JSON.stringify(p.eligibility, null, 2)
                : "",
              selectionProcess: p.selectionProcess
                ? JSON.stringify(p.selectionProcess, null, 2)
                : "",
              howToApply: p.howToApply || "",
              importantLinks: p.importantLinks
                ? JSON.stringify(p.importantLinks, null, 2)
                : "",
              faqData: p.faqData ? JSON.stringify(p.faqData, null, 2) : "",
              importantDates: p.importantDates
                ? JSON.stringify(p.importantDates, null, 2)
                : "",
              applicationStartDate: p.applicationStartDate
                ? p.applicationStartDate.slice(0, 16)
                : "",
              applicationEndDate: p.applicationEndDate
                ? p.applicationEndDate.slice(0, 16)
                : "",
              examDate: p.examDate ? p.examDate.slice(0, 16) : "",
              resultDate: p.resultDate ? p.resultDate.slice(0, 16) : "",
              seoTitle: p.seoTitle || "",
              seoDescription: p.seoDescription || "",
              focusKeyword: p.focusKeyword || "",
            });
          }
        });
    }
  }, [editId]);

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "title" && !editId) {
      setForm((prev) => ({ ...prev, slug: slugify(value) }));
    }
  };

  const safeJson = (value: string, fieldLabel: string) => {
    if (!value.trim()) return undefined;
    try {
      return JSON.parse(value);
    } catch {
      throw new Error(`${fieldLabel} must be valid JSON`);
    }
  };

  const applyAiDraft = (draft: NonNullable<AiDraftResponse["data"]>) => {
    const suggestedCategory = categories.find((category) =>
      draft.suggestedCategorySlugs?.includes(category.slug),
    );

    // Prefer AI-extracted structured fields; fall back to text parsing only when needed
    const plainText =
      draft.contentText?.trim() || stripHtml(draft.contentHtml || "");
    const combinedText = [draft.title, draft.excerpt, plainText]
      .filter(Boolean)
      .join(" ");

    // postType: use AI field first, then infer from content
    const aiPostType = (draft as Record<string, unknown>)["postType"] as
      | string
      | undefined;
    const finalPostType = aiPostType || inferPostType(combinedText);

    // Organization / stateName / qualification: use AI field directly
    const aiOrg = (draft as Record<string, unknown>)["organization"] as
      | string
      | undefined;
    const aiState = (draft as Record<string, unknown>)["stateName"] as
      | string
      | undefined;
    const aiQual = (draft as Record<string, unknown>)["qualification"] as
      | string
      | undefined;
    const aiHowToApply = (draft as Record<string, unknown>)["howToApply"] as
      | string
      | undefined;
    const aiEligibility = (draft as Record<string, unknown>)["eligibility"] as
      | string
      | undefined;
    const aiSelectionProcess = (draft as Record<string, unknown>)[
      "selectionProcess"
    ] as string | undefined;
    const aiImportantDates = (draft as Record<string, unknown>)[
      "importantDates"
    ] as string | undefined;
    const aiImportantLinks = (draft as Record<string, unknown>)[
      "importantLinks"
    ] as string | undefined;

    setForm((prev) => ({
      ...prev,
      title: draft.title || prev.title,
      slug: draft.slug || prev.slug || slugify(draft.title || prev.title),
      excerpt: draft.excerpt || prev.excerpt,
      content: draft.contentHtml || prev.content,
      postType: finalPostType || prev.postType,
      categoryId: suggestedCategory?.id || prev.categoryId,
      organization: aiOrg || prev.organization,
      stateName: aiState || prev.stateName,
      qualification: aiQual || prev.qualification,
      featuredImageUrl:
        draft.featuredImageUrl ||
        draft.extractedFeaturedImageUrl ||
        prev.featuredImageUrl,
      howToApply: aiHowToApply || prev.howToApply,
      eligibility: aiEligibility || prev.eligibility,
      selectionProcess: aiSelectionProcess || prev.selectionProcess,
      importantDates: aiImportantDates || prev.importantDates,
      importantLinks: aiImportantLinks || prev.importantLinks,
      seoTitle: draft.seoTitle || prev.seoTitle || draft.title || "",
      seoDescription:
        draft.seoDescription || prev.seoDescription || draft.excerpt || "",
      focusKeyword: draft.focusKeyword || prev.focusKeyword,
    }));
  };

  const handleGenerateFromUrl = async () => {
    if (!aiSourceUrl.trim()) {
      toast.error("Source URL is required");
      return;
    }

    try {
      setGenerating(true);
      const res = await fetch("/api/sarkari-ai-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceUrl: aiSourceUrl.trim(),
          tone: "clear, helpful, informative",
          extraInstructions: aiInstructions.trim(),
        }),
      });

      const data: AiDraftResponse = await res.json();

      if (!res.ok || !data.success || !data.data) {
        throw new Error(
          data.message || data.error || "Failed to generate AI draft",
        );
      }

      applyAiDraft(data.data);
      toast.success("AI draft imported into Sarkari Result form");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to generate AI draft";
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (publish: boolean) => {
    if (!form.title || !form.slug) {
      toast.error("Title and slug are required");
      return;
    }

    try {
      setLoading(true);

      // Strip empty strings for DateTime fields so Prisma doesn't receive invalid values
      const dateOrUndef = (v: string) => (v && v.trim() ? v : undefined);

      const payload: Record<string, unknown> = {
        title: form.title,
        slug: form.slug,
        content: form.content || undefined,
        excerpt: form.excerpt || undefined,
        postType: form.postType,
        status: publish ? "published" : form.status,
        categoryId: form.categoryId || undefined,
        organization: form.organization || undefined,
        stateName: form.stateName || undefined,
        qualification: form.qualification || undefined,
        featuredImageUrl: form.featuredImageUrl || undefined,
        seoTitle: form.seoTitle || undefined,
        seoDescription: form.seoDescription || undefined,
        focusKeyword: form.focusKeyword || undefined,
        howToApply: form.howToApply || undefined,
        applicationFee: safeJson(form.applicationFee, "Application Fee"),
        ageLimit: safeJson(form.ageLimit, "Age Limit"),
        vacancyDetails: safeJson(form.vacancyDetails, "Vacancy Details"),
        eligibility: safeJson(form.eligibility, "Eligibility"),
        selectionProcess: safeJson(form.selectionProcess, "Selection Process"),
        importantLinks: safeJson(form.importantLinks, "Important Links"),
        faqData: safeJson(form.faqData, "FAQ"),
        importantDates: safeJson(form.importantDates, "Important Dates"),
        applicationStartDate: dateOrUndef(form.applicationStartDate),
        applicationEndDate: dateOrUndef(form.applicationEndDate),
        examDate: dateOrUndef(form.examDate),
        resultDate: dateOrUndef(form.resultDate),
        publishedAt: publish ? new Date().toISOString() : undefined,
      };

      const method = editId ? "PATCH" : "POST";
      const url = `/api/sarkari/posts${editId ? `/${editId}` : ""}`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Failed to save");
      }

      toast.success(editId ? "Post updated" : "Post created");
      router.push("/sarkari-result/posts");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, ...props }: any) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-[var(--text-secondary)]">
        {label}
      </Label>
      <Input {...props} className="input-field" />
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div
        className={cn(
          "flex flex-col min-h-screen transition-all duration-300",
          isOpen ? "md:ml-60" : "ml-0",
        )}
      >
        <TopBar />
        <main className="flex-1 p-4 lg:p-5">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
              <Link href="/sarkari-result/posts">
                <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
              </Link>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                  {editId ? "Edit Post" : "Create New Post"}
                </h1>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleSubmit(false)}
                  disabled={loading || generating}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
                <Button
                  className="bg-[#2563EB] text-white"
                  onClick={() => handleSubmit(true)}
                  disabled={loading || generating}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {editId ? "Update" : "Publish"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {!editId && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        Generate Sarkari post from URL
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-[var(--text-secondary)]">
                          Source Job/Result URL
                        </Label>
                        <Input
                          value={aiSourceUrl}
                          onChange={(e) => setAiSourceUrl(e.target.value)}
                          placeholder="https://example.com/job-notification"
                          className="input-field"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-[var(--text-secondary)]">
                          AI Instructions
                        </Label>
                        <Textarea
                          value={aiInstructions}
                          onChange={(e) => setAiInstructions(e.target.value)}
                          className="input-field min-h-[90px]"
                        />
                      </div>
                      <Button
                        onClick={handleGenerateFromUrl}
                        disabled={generating}
                        className="bg-violet-600 hover:bg-violet-700 text-white"
                      >
                        {generating ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Wand2 className="w-4 h-4 mr-2" />
                        )}
                        {generating
                          ? "Generating Draft..."
                          : "Generate From URL"}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardContent className="p-4 space-y-4">
                    <InputField
                      label="Title *"
                      value={form.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        update("title", e.target.value)
                      }
                      placeholder="Enter post title"
                    />
                    <InputField
                      label="Slug *"
                      value={form.slug}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        update("slug", e.target.value)
                      }
                      placeholder="post-url-slug"
                      className="mono"
                    />
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-[var(--text-secondary)]">
                        Excerpt
                      </Label>
                      <Textarea
                        value={form.excerpt}
                        onChange={(e) => update("excerpt", e.target.value)}
                        className="input-field min-h-[80px]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-[var(--text-secondary)]">
                        Content (HTML supported)
                      </Label>
                      <Textarea
                        value={form.content}
                        onChange={(e) => update("content", e.target.value)}
                        className="input-field min-h-[200px] font-mono text-sm"
                      />
                    </div>
                    <InputField
                      label="Featured Image URL"
                      value={form.featuredImageUrl}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        update("featuredImageUrl", e.target.value)
                      }
                      placeholder="https://..."
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Important Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-[var(--text-secondary)]">
                        Application Fee (JSON)
                      </Label>
                      <Textarea
                        value={form.applicationFee}
                        onChange={(e) =>
                          update("applicationFee", e.target.value)
                        }
                        className="input-field font-mono text-xs"
                        placeholder='[{"category":"General","amount":100}]'
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-[var(--text-secondary)]">
                        Age Limit (JSON)
                      </Label>
                      <Textarea
                        value={form.ageLimit}
                        onChange={(e) => update("ageLimit", e.target.value)}
                        className="input-field font-mono text-xs"
                        placeholder='[{"category":"General","min":18,"max":25}]'
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-[var(--text-secondary)]">
                        Vacancy Details (JSON)
                      </Label>
                      <Textarea
                        value={form.vacancyDetails}
                        onChange={(e) =>
                          update("vacancyDetails", e.target.value)
                        }
                        className="input-field font-mono text-xs"
                        placeholder='[{"post":"Clerk","total":100}]'
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-[var(--text-secondary)]">
                        Eligibility (JSON)
                      </Label>
                      <Textarea
                        value={form.eligibility}
                        onChange={(e) => update("eligibility", e.target.value)}
                        className="input-field font-mono text-xs"
                        placeholder='["10th pass", "12th pass"]'
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-[var(--text-secondary)]">
                        Selection Process (JSON)
                      </Label>
                      <Textarea
                        value={form.selectionProcess}
                        onChange={(e) =>
                          update("selectionProcess", e.target.value)
                        }
                        className="input-field font-mono text-xs"
                        placeholder='["Written exam", "Document verification"]'
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-[var(--text-secondary)]">
                        How To Apply
                      </Label>
                      <Textarea
                        value={form.howToApply}
                        onChange={(e) => update("howToApply", e.target.value)}
                        className="input-field min-h-[100px]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-[var(--text-secondary)]">
                        Important Links (JSON)
                      </Label>
                      <Textarea
                        value={form.importantLinks}
                        onChange={(e) =>
                          update("importantLinks", e.target.value)
                        }
                        className="input-field font-mono text-xs"
                        placeholder='["Official Notification", "Apply Online"]'
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-[var(--text-secondary)]">
                        FAQ (JSON)
                      </Label>
                      <Textarea
                        value={form.faqData}
                        onChange={(e) => update("faqData", e.target.value)}
                        className="input-field font-mono text-xs"
                        placeholder='[{"question":"What is last date?","answer":"..."}]'
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-[var(--text-secondary)]">
                        Important Dates (JSON)
                      </Label>
                      <Textarea
                        value={form.importantDates}
                        onChange={(e) =>
                          update("importantDates", e.target.value)
                        }
                        className="input-field font-mono text-xs"
                        placeholder='["Application Start: 2026-07-01", "Last Date: 2026-07-15"]'
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Post Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-[var(--text-secondary)]">
                        Post Type *
                      </Label>
                      <Select
                        value={form.postType}
                        onValueChange={(v) => update("postType", v)}
                      >
                        <SelectTrigger className="input-field">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {postTypes.map((pt) => (
                            <SelectItem key={pt.value} value={pt.value}>
                              {pt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-[var(--text-secondary)]">
                        Category
                      </Label>
                      <Select
                        value={form.categoryId}
                        onValueChange={(v) => update("categoryId", v)}
                      >
                        <SelectTrigger className="input-field">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-[var(--text-secondary)]">
                        Status
                      </Label>
                      <Select
                        value={form.status}
                        onValueChange={(v) => update("status", v)}
                      >
                        <SelectTrigger className="input-field">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <InputField
                      label="Organization"
                      value={form.organization}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        update("organization", e.target.value)
                      }
                    />
                    <InputField
                      label="State Name"
                      value={form.stateName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        update("stateName", e.target.value)
                      }
                    />
                    <InputField
                      label="Qualification"
                      value={form.qualification}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        update("qualification", e.target.value)
                      }
                      placeholder="10th/12th/Graduate/Diploma/ITI/Engineering"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <InputField
                        label="Start Date"
                        type="datetime-local"
                        value={form.applicationStartDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          update("applicationStartDate", e.target.value)
                        }
                      />
                      <InputField
                        label="End Date"
                        type="datetime-local"
                        value={form.applicationEndDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          update("applicationEndDate", e.target.value)
                        }
                      />
                    </div>
                    <InputField
                      label="Exam Date"
                      type="datetime-local"
                      value={form.examDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        update("examDate", e.target.value)
                      }
                    />
                    <InputField
                      label="Result Date"
                      type="datetime-local"
                      value={form.resultDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        update("resultDate", e.target.value)
                      }
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">SEO Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <InputField
                      label="SEO Title"
                      value={form.seoTitle}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        update("seoTitle", e.target.value)
                      }
                      placeholder="SEO optimized title"
                    />
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-[var(--text-secondary)]">
                        Meta Description
                      </Label>
                      <Textarea
                        value={form.seoDescription}
                        onChange={(e) =>
                          update("seoDescription", e.target.value)
                        }
                        className="input-field min-h-[80px]"
                      />
                    </div>
                    <InputField
                      label="Focus Keyword"
                      value={form.focusKeyword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        update("focusKeyword", e.target.value)
                      }
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
