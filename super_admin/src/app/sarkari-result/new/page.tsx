"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import { ArrowLeft, Save, Send, Loader2, Briefcase, FileText, Ticket, ClipboardList, GraduationCap, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export default function CreateEditPostPage() {
  const { isOpen } = useSidebarStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: "", slug: "", content: "", excerpt: "", postType: "job", status: "draft",
    categoryId: "", organization: "", stateName: "", qualification: "",
    featuredImageUrl: "", applicationFee: "", ageLimit: "", vacancyDetails: "",
    eligibility: "", selectionProcess: "", howToApply: "", importantLinks: "", faqData: "",
    importantDates: "", applicationStartDate: "", applicationEndDate: "", examDate: "", resultDate: "",
    seoTitle: "", seoDescription: "", focusKeyword: "",
  });

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/sarkari/categories`).then(r => r.json()).then(d => setCategories(d.categories || []));
    if (editId) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/sarkari/posts/${editId}`).then(r => r.json()).then(d => {
        if (d.success) {
          const p = d.post;
          setForm({
            title: p.title || "", slug: p.slug || "", content: p.content || "", excerpt: p.excerpt || "", postType: p.postType || "job", status: p.status || "draft",
            categoryId: p.categoryId || "", organization: p.organization || "", stateName: p.stateName || "", qualification: p.qualification || "",
            featuredImageUrl: p.featuredImageUrl || "", applicationFee: p.applicationFee ? JSON.stringify(p.applicationFee) : "",
            ageLimit: p.ageLimit ? JSON.stringify(p.ageLimit) : "", vacancyDetails: p.vacancyDetails ? JSON.stringify(p.vacancyDetails) : "",
            eligibility: p.eligibility ? JSON.stringify(p.eligibility) : "", selectionProcess: p.selectionProcess ? JSON.stringify(p.selectionProcess) : "",
            howToApply: p.howToApply || "", importantLinks: p.importantLinks ? JSON.stringify(p.importantLinks) : "",
            faqData: p.faqData ? JSON.stringify(p.faqData) : "", importantDates: p.importantDates ? JSON.stringify(p.importantDates) : "",
            applicationStartDate: p.applicationStartDate ? p.applicationStartDate.slice(0, 16) : "", applicationEndDate: p.applicationEndDate ? p.applicationEndDate.slice(0, 16) : "",
            examDate: p.examDate ? p.examDate.slice(0, 16) : "", resultDate: p.resultDate ? p.resultDate.slice(0, 16) : "",
            seoTitle: p.seoTitle || "", seoDescription: p.seoDescription || "", focusKeyword: p.focusKeyword || "",
          });
        }
      });
    }
  }, [editId]);

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (field === "title" && !editId) {
      setForm(prev => ({ ...prev, slug: value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }));
    }
  };

  const handleSubmit = async (publish: boolean) => {
    if (!form.title || !form.slug) { toast.error("Title and slug are required"); return; }
    try {
      setLoading(true);
      const payload: any = { ...form, status: publish ? "published" : "draft", publishedAt: publish ? new Date().toISOString() : undefined };
      const method = editId ? "PATCH" : "POST";
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/sarkari/posts${editId ? `/${editId}` : ""}`;
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast.success(editId ? "Post updated" : "Post created");
      router.push("/sarkari-result/posts");
    } catch { toast.error("Failed to save"); } finally { setLoading(false); }
  };

  const InputField = ({ label, ...props }: any) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-[var(--text-secondary)]">{label}</Label>
      <Input {...props} className="input-field" />
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "md:ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-4 lg:p-5">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
              <Link href="/sarkari-result/posts"><ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" /></Link>
              <div className="flex-1"><h1 className="text-2xl font-bold text-[var(--text-primary)]">{editId ? "Edit Post" : "Create New Post"}</h1></div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleSubmit(false)} disabled={loading}><Save className="w-4 h-4 mr-2" />Save Draft</Button>
                <Button className="bg-[#2563EB] text-white" onClick={() => handleSubmit(true)} disabled={loading}><Send className="w-4 h-4 mr-2" />{editId ? "Update" : "Publish"}</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card><CardContent className="p-4 space-y-4">
                  <InputField label="Title *" value={form.title} onChange={e => update("title", e.target.value)} placeholder="Enter post title" />
                  <InputField label="Slug *" value={form.slug} onChange={e => update("slug", e.target.value)} placeholder="post-url-slug" className="mono" />
                  <div className="space-y-1.5"><Label className="text-xs font-medium text-[var(--text-secondary)]">Excerpt</Label><Textarea value={form.excerpt} onChange={e => update("excerpt", e.target.value)} className="input-field min-h-[80px]" /></div>
                  <div className="space-y-1.5"><Label className="text-xs font-medium text-[var(--text-secondary)]">Content (HTML supported)</Label><Textarea value={form.content} onChange={e => update("content", e.target.value)} className="input-field min-h-[200px] font-mono text-sm" /></div>
                  <InputField label="Featured Image URL" value={form.featuredImageUrl} onChange={e => update("featuredImageUrl", e.target.value)} placeholder="https://..." />
                </CardContent></Card>

                <Card><CardHeader className="pb-3"><CardTitle className="text-sm">Important Details</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5"><Label className="text-xs font-medium text-[var(--text-secondary)]">Application Fee (JSON)</Label><Textarea value={form.applicationFee} onChange={e => update("applicationFee", e.target.value)} className="input-field font-mono text-xs" placeholder='[{"category":"General","amount":100}]' /></div>
                    <div className="space-y-1.5"><Label className="text-xs font-medium text-[var(--text-secondary)]">Age Limit (JSON)</Label><Textarea value={form.ageLimit} onChange={e => update("ageLimit", e.target.value)} className="input-field font-mono text-xs" placeholder='[{"category":"General","min":18,"max":25}]' /></div>
                    <div className="space-y-1.5"><Label className="text-xs font-medium text-[var(--text-secondary)]">Vacancy Details (JSON)</Label><Textarea value={form.vacancyDetails} onChange={e => update("vacancyDetails", e.target.value)} className="input-field font-mono text-xs" placeholder='[{"post":" Clerk","total":100,"category":"UR":50}]' /></div>
                    <div className="space-y-1.5"><Label className="text-xs font-medium text-[var(--text-secondary)]">Eligibility (JSON)</Label><Textarea value={form.eligibility} onChange={e => update("eligibility", e.target.value)} className="input-field font-mono text-xs" /></div>
                    <div className="space-y-1.5"><Label className="text-xs font-medium text-[var(--text-secondary)]">Selection Process (JSON)</Label><Textarea value={form.selectionProcess} onChange={e => update("selectionProcess", e.target.value)} className="input-field font-mono text-xs" /></div>
                    <div className="space-y-1.5"><Label className="text-xs font-medium text-[var(--text-secondary)]">How To Apply</Label><Textarea value={form.howToApply} onChange={e => update("howToApply", e.target.value)} className="input-field min-h-[100px]" /></div>
                    <div className="space-y-1.5"><Label className="text-xs font-medium text-[var(--text-secondary)]">Important Links (JSON)</Label><Textarea value={form.importantLinks} onChange={e => update("importantLinks", e.target.value)} className="input-field font-mono text-xs" placeholder='[{"title":"Official Website","url":"https://..."}]' /></div>
                    <div className="space-y-1.5"><Label className="text-xs font-medium text-[var(--text-secondary)]">FAQ (JSON)</Label><Textarea value={form.faqData} onChange={e => update("faqData", e.target.value)} className="input-field font-mono text-xs" placeholder='[{"question":"...","answer":"..."}]' /></div>
                    <div className="space-y-1.5"><Label className="text-xs font-medium text-[var(--text-secondary)]">Important Dates (JSON)</Label><Textarea value={form.importantDates} onChange={e => update("importantDates", e.target.value)} className="input-field font-mono text-xs" placeholder='[{"event":"Last Date","date":"2026-07-01"}]' /></div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm">Post Settings</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5"><Label className="text-xs font-medium text-[var(--text-secondary)]">Post Type *</Label>
                      <Select value={form.postType} onValueChange={v => update("postType", v)}>
                        <SelectTrigger className="input-field"><SelectValue /></SelectTrigger>
                        <SelectContent>{postTypes.map(pt => <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5"><Label className="text-xs font-medium text-[var(--text-secondary)]">Category</Label>
                      <Select value={form.categoryId} onValueChange={v => update("categoryId", v)}>
                        <SelectTrigger className="input-field"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5"><Label className="text-xs font-medium text-[var(--text-secondary)]">Status</Label>
                      <Select value={form.status} onValueChange={v => update("status", v)}>
                        <SelectTrigger className="input-field"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem><SelectItem value="scheduled">Scheduled</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <InputField label="Organization" value={form.organization} onChange={e => update("organization", e.target.value)} />
                    <InputField label="State Name" value={form.stateName} onChange={e => update("stateName", e.target.value)} />
                    <InputField label="Qualification" value={form.qualification} onChange={e => update("qualification", e.target.value)} placeholder="10th/12th/Graduate/Diploma/ITI/Engineering" />
                    <div className="grid grid-cols-2 gap-3">
                      <InputField label="Start Date" type="datetime-local" value={form.applicationStartDate} onChange={e => update("applicationStartDate", e.target.value)} />
                      <InputField label="End Date" type="datetime-local" value={form.applicationEndDate} onChange={e => update("applicationEndDate", e.target.value)} />
                    </div>
                    <InputField label="Exam Date" type="datetime-local" value={form.examDate} onChange={e => update("examDate", e.target.value)} />
                    <InputField label="Result Date" type="datetime-local" value={form.resultDate} onChange={e => update("resultDate", e.target.value)} />
                  </CardContent>
                </Card>

                <Card><CardHeader className="pb-3"><CardTitle className="text-sm">SEO Settings</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <InputField label="SEO Title" value={form.seoTitle} onChange={e => update("seoTitle", e.target.value)} placeholder="SEO optimized title" />
                    <div className="space-y-1.5"><Label className="text-xs font-medium text-[var(--text-secondary)]">Meta Description</Label><Textarea value={form.seoDescription} onChange={e => update("seoDescription", e.target.value)} className="input-field min-h-[80px]" /></div>
                    <InputField label="Focus Keyword" value={form.focusKeyword} onChange={e => update("focusKeyword", e.target.value)} />
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