"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Save,
  Send,
  Clock,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  Code,
  Quote,
  Heading1,
  Heading2,
  Globe,
  Smartphone,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import {
  fetchBlogPost,
  createBlogPost,
  updateBlogPost,
  fetchBlogAuthors,
  fetchBlogCategories,
  BlogAuthor,
  BlogCategory,
} from "@/services/blogService";

export default function NewBlogPostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const { isOpen } = useSidebarStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    featuredImageUrl: "",
    platform: "both",
    status: "draft",
    authorId: "",
    categoryId: "",
    seoTitle: "",
    seoDescription: "",
    focusKeyword: "",
    scheduledDate: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [authorsData, categoriesData] = await Promise.all([
          fetchBlogAuthors(),
          fetchBlogCategories(),
        ]);
        setAuthors(authorsData.authors);
        setCategories(categoriesData.categories);

        if (editId) {
          const { post } = await fetchBlogPost(editId);
          setFormData({
            title: post.title,
            slug: post.slug,
            content: post.content || "",
            excerpt: post.excerpt || "",
            featuredImageUrl: post.featuredImageUrl || "",
            platform: post.platform || "both",
            status: post.status,
            authorId: post.authorId,
            categoryId: post.categories?.[0]?.category?.id || "",
            seoTitle: post.seoTitle || "",
            seoDescription: post.seoDescription || "",
            focusKeyword: post.focusKeyword || "",
            scheduledDate: post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : "",
          });
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [editId]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleSave = async (publish: boolean = false, schedule: boolean = false) => {
    if (!formData.title || !formData.slug || !formData.authorId) {
      toast.error("Title, slug, and author are required");
      return;
    }

    try {
      setSaving(true);
      const status = schedule ? "scheduled" : publish ? "published" : "draft";
      const payload: any = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        excerpt: formData.excerpt,
        featuredImageUrl: formData.featuredImageUrl || undefined,
        platform: formData.platform,
        status,
        authorId: formData.authorId,
        categoryIds: formData.categoryId ? [formData.categoryId] : [],
        seoTitle: formData.seoTitle || undefined,
        seoDescription: formData.seoDescription || undefined,
        focusKeyword: formData.focusKeyword || undefined,
        publishedAt: publish ? new Date().toISOString() : undefined,
        scheduledAt: schedule && formData.scheduledDate ? new Date(formData.scheduledDate).toISOString() : undefined,
      };

      if (editId) {
        await updateBlogPost(editId, payload);
        toast.success("Post updated successfully");
      } else {
        await createBlogPost(payload as any);
        toast.success("Post created successfully");
      }
      router.push("/blog");
    } catch (err: any) {
      toast.error(err.message || "Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const platformOptions = [
    { value: "both", label: "Both Platforms", icon: <Layers className="w-4 h-4" />, desc: "Show on Public Website & Mokebook App" },
    { value: "public_website", label: "Public Website", icon: <Globe className="w-4 h-4" />, desc: "Show only on the public website" },
    { value: "mokebook", label: "Mokebook App", icon: <Smartphone className="w-4 h-4" />, desc: "Show only in the Mokebook app" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-bg flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "md:ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-4 lg:p-5">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Link href="/blog" className="p-2 hover:bg-[var(--bg-main)] rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
              </Link>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                  {editId ? "Edit Blog Post" : "Create New Blog Post"}
                </h1>
                <p className="text-[var(--text-secondary)] text-sm mt-1">
                  Write and configure your blog post - choose which platform(s) to publish to
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-4">
                {/* Title */}
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-2">
                      <Label>Title *</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => {
                          const title = e.target.value;
                          if (!editId) {
                            setFormData({ ...formData, title, slug: generateSlug(title) });
                          } else {
                            setFormData({ ...formData, title });
                          }
                        }}
                        placeholder="Enter blog post title"
                        className="input-field text-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Slug *</Label>
                      <Input
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="post-url-slug"
                        className="input-field mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Excerpt</Label>
                      <Textarea
                        value={formData.excerpt}
                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                        placeholder="Brief summary of the post"
                        className="input-field min-h-[80px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Content</Label>
                      {/* Rich Text Toolbar */}
                      <div className="flex items-center gap-1 p-2 border border-b-0 rounded-t-lg bg-[var(--bg-main)]">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Bold className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Italic className="w-4 h-4" /></Button>
                        <div className="w-px h-6 bg-[var(--bg-sidebar)] mx-1" />
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Heading1 className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Heading2 className="w-4 h-4" /></Button>
                        <div className="w-px h-6 bg-[var(--bg-sidebar)] mx-1" />
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><List className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><ListOrdered className="w-4 h-4" /></Button>
                        <div className="w-px h-6 bg-[var(--bg-sidebar)] mx-1" />
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Quote className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Code className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Link2 className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><ImageIcon className="w-4 h-4" /></Button>
                      </div>
                      <Textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Write your blog content here... (HTML supported)"
                        className="input-field min-h-[300px] rounded-t-none font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Featured Image URL</Label>
                      <Input
                        value={formData.featuredImageUrl}
                        onChange={(e) => setFormData({ ...formData, featuredImageUrl: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        className="input-field"
                      />
                      {formData.featuredImageUrl && (
                        <div className="mt-2 rounded-lg overflow-hidden border max-h-[200px]">
                          <img
                            src={formData.featuredImageUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => (e.currentTarget.style.display = "none")}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Settings */}
              <div className="space-y-4">
                {/* Platform Selection */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Platform</CardTitle>
                    <CardDescription className="text-xs">
                      Choose where to publish this post
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {platformOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, platform: option.value })}
                        className={`w-full flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                          formData.platform === option.value
                            ? "border-[#FF6B2B] bg-orange-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className={`mt-0.5 ${formData.platform === option.value ? "text-[#FF6B2B]" : "text-gray-400"}`}>
                          {option.icon}
                        </div>
                        <div>
                          <div className={`text-sm font-medium ${formData.platform === option.value ? "text-[#FF6B2B]" : "text-gray-700"}`}>
                            {option.label}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">{option.desc}</div>
                        </div>
                      </button>
                    ))}
                  </CardContent>
                </Card>

                {/* Post Settings */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Post Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Author *</Label>
                      <Select
                        value={formData.authorId}
                        onValueChange={(v) => setFormData({ ...formData, authorId: v })}
                      >
                        <SelectTrigger className="input-field">
                          <SelectValue placeholder="Select author" />
                        </SelectTrigger>
                        <SelectContent>
                          {authors.map((author) => (
                            <SelectItem key={author.id} value={author.id}>
                              {author.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={formData.categoryId}
                        onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
                      >
                        <SelectTrigger className="input-field">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(v) => setFormData({ ...formData, status: v })}
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

                    {(formData.status === "scheduled") && (
                      <div className="space-y-2">
                        <Label>Schedule Date</Label>
                        <Input
                          type="datetime-local"
                          value={formData.scheduledDate}
                          onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                          className="input-field"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* SEO Settings */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">SEO Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Meta Title</Label>
                        <span className={`text-xs ${formData.seoTitle.length > 60 ? "text-red-500" : "text-[var(--text-muted)]"}`}>
                          {formData.seoTitle.length}/60
                        </span>
                      </div>
                      <Input
                        value={formData.seoTitle}
                        onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                        placeholder="SEO optimized title"
                        className="input-field"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Meta Description</Label>
                        <span className={`text-xs ${formData.seoDescription.length > 160 ? "text-red-500" : "text-[var(--text-muted)]"}`}>
                          {formData.seoDescription.length}/160
                        </span>
                      </div>
                      <Textarea
                        value={formData.seoDescription}
                        onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                        placeholder="Brief description for search engines"
                        className="input-field min-h-[80px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Focus Keyword</Label>
                      <Input
                        value={formData.focusKeyword}
                        onChange={(e) => setFormData({ ...formData, focusKeyword: e.target.value })}
                        placeholder="Main keyword for this post"
                        className="input-field"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <Button
                    className="w-full bg-[#FF6B2B] hover:bg-[#e55a1f] text-white"
                    disabled={saving}
                    onClick={() => {
                      if (formData.status === "scheduled") {
                        handleSave(false, true);
                      } else {
                        handleSave(true, false);
                      }
                    }}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {formData.status === "scheduled" ? "Schedule" : "Publish"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={saving}
                    onClick={() => handleSave(false, false)}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save as Draft
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}