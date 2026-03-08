import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Send,
  Clock,
  Eye,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Link2,
  Image as ImageIcon,
  Table,
  Minus,
  Sparkles,
  CheckCircle,
  XCircle,
  Trash2,
  History,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { toast } from "sonner";

// Content Types
const contentTypes = [
  { value: 'blog', label: 'Blog Post', schema: 'BlogPosting' },
  { value: 'article', label: 'Article', schema: 'Article' },
  { value: 'tutorial', label: 'Tutorial', schema: 'HowTo' },
  { value: 'news', label: 'News', schema: 'NewsArticle' },
  { value: 'case-study', label: 'Case Study', schema: 'Article' },
  { value: 'press-release', label: 'Press Release', schema: 'NewsArticle' },
];

// Simple Rich Text Editor
function RichTextEditor({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (value: string) => void;
}) {
  const insertFormat = (tag: string, wrapper = false) => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let newText: string;
    if (wrapper) {
      newText = `<${tag}>${selectedText || 'Text here'}</${tag}>`;
    } else {
      newText = `${selectedText || 'Text here'}`;
    }

    const updatedValue = value.substring(0, start) + newText + value.substring(end);
    onChange(updatedValue);
  };

  const toolbarButtons = [
    { icon: Bold, label: 'Bold', action: () => insertFormat('strong', true) },
    { icon: Italic, label: 'Italic', action: () => insertFormat('em', true) },
    { icon: Underline, label: 'Underline', action: () => insertFormat('u', true) },
    { icon: Strikethrough, label: 'Strikethrough', action: () => insertFormat('s', true) },
    { divider: true },
    { icon: Heading1, label: 'H1', action: () => insertFormat('h1', true) },
    { icon: Heading2, label: 'H2', action: () => insertFormat('h2', true) },
    { icon: Heading3, label: 'H3', action: () => insertFormat('h3', true) },
    { divider: true },
    { icon: List, label: 'Bullet List', action: () => insertFormat('ul', true) },
    { icon: ListOrdered, label: 'Numbered List', action: () => insertFormat('ol', true) },
    { icon: CheckSquare, label: 'Checklist', action: () => insertFormat('div class="checklist"', true) },
    { divider: true },
    { icon: Quote, label: 'Quote', action: () => insertFormat('blockquote', true) },
    { icon: Code, label: 'Code', action: () => insertFormat('pre', true) },
    { icon: Link2, label: 'Link', action: () => insertFormat('a href="#"', true) },
    { icon: ImageIcon, label: 'Image', action: () => insertFormat('img src="" alt=""', true) },
    { icon: Table, label: 'Table', action: () => insertFormat('table', true) },
    { icon: Minus, label: 'Divider', action: () => insertFormat('hr', true) },
  ];

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center gap-1 p-2 bg-gray-50 border-b flex-wrap">
        {toolbarButtons.map((btn, idx) => 
          btn.divider ? (
            <div key={idx} className="w-px h-6 bg-gray-200 mx-1" />
          ) : (
            <Button
              key={idx}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={btn.action}
              title={btn.label}
            >
              <btn.icon className="w-4 h-4" />
            </Button>
          )
        )}
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          className="text-orange-600 hover:text-orange-700"
          title="AI Assistant"
        >
          <Sparkles className="w-4 h-4 mr-1" />
          AI
        </Button>
      </div>
      <Textarea
        id="content-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your content here..."
        className="min-h-[400px] border-0 rounded-none focus-visible:ring-0 font-mono text-sm"
      />
    </div>
  );
}

// SEO Score Calculator
function calculateSEOScore(post: any): { score: number; checks: { label: string; pass: boolean; points: number }[] } {
  const checks = [
    { label: 'Focus keyword in title', pass: post.title?.toLowerCase().includes(post.focusKeyword?.toLowerCase() || ''), points: 10 },
    { label: 'Focus keyword in meta description', pass: post.seoDescription?.toLowerCase().includes(post.focusKeyword?.toLowerCase() || ''), points: 8 },
    { label: 'Focus keyword in content', pass: post.content?.toLowerCase().includes(post.focusKeyword?.toLowerCase() || ''), points: 8 },
    { label: 'Focus keyword in URL slug', pass: post.slug?.toLowerCase().includes(post.focusKeyword?.toLowerCase()?.replace(/\s+/g, '-') || ''), points: 5 },
    { label: 'Title length 50-60 chars', pass: post.seoTitle?.length >= 50 && post.seoTitle?.length <= 60, points: 5 },
    { label: 'Meta description 150-160 chars', pass: post.seoDescription?.length >= 150 && post.seoDescription?.length <= 160, points: 7 },
    { label: 'Content length > 1000 words', pass: (post.content?.split(/\s+/).length || 0) > 1000, points: 7 },
    { label: 'Featured image set', pass: !!post.featuredImageUrl, points: 5 },
    { label: 'At least one category', pass: post.categoryIds?.length > 0, points: 5 },
    { label: 'Internal links present', pass: post.content?.includes('<a ') || false, points: 4 },
  ];

  const totalPoints = checks.reduce((sum, check) => sum + (check.pass ? check.points : 0), 0);
  const maxPoints = checks.reduce((sum, check) => sum + check.points, 0);
  const score = Math.round((totalPoints / maxPoints) * 100);

  return { score, checks };
}

export default function EditBlogPostPage({   const { isOpen } = useSidebarStore();
params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authors, setAuthors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);

  // Form State
  const [post, setPost] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featuredImageUrl: '',
    featuredImageAlt: '',
    contentType: 'blog',
    status: 'draft',
    visibility: 'public',
    password: '',
    authorId: '',
    categoryIds: [] as string[],
    tagIds: [] as string[],
    seoTitle: '',
    seoDescription: '',
    focusKeyword: '',
    secondaryKeywords: [] as string[],
    ogTitle: '',
    ogDescription: '',
    ogImageUrl: '',
    allowComments: true,
    isFeatured: false,
    scheduledAt: '',
    viewCount: 0,
    wordCount: 0,
    readingTimeMin: 1,
    publishedAt: null as string | null,
    createdAt: '',
  });

  const [newTag, setNewTag] = useState('');

  // Fetch post data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch post
        const postRes = await fetch(`/api/blog/posts/${id}`);
        if (postRes.ok) {
          const data = await postRes.json();
          const p = data.post;
          setPost({
            title: p.title || '',
            slug: p.slug || '',
            content: p.content || '',
            excerpt: p.excerpt || '',
            featuredImageUrl: p.featuredImageUrl || '',
            featuredImageAlt: p.featuredImageAlt || '',
            contentType: p.contentType || 'blog',
            status: p.status || 'draft',
            visibility: p.visibility || 'public',
            password: p.password || '',
            authorId: p.authorId || '',
            categoryIds: p.categories?.map((c: any) => c.categoryId) || [],
            tagIds: p.tags?.map((t: any) => t.tagId) || [],
            seoTitle: p.seoTitle || '',
            seoDescription: p.seoDescription || '',
            focusKeyword: p.focusKeyword || '',
            secondaryKeywords: [],
            ogTitle: p.ogTitle || '',
            ogDescription: p.ogDescription || '',
            ogImageUrl: p.ogImageUrl || '',
            allowComments: p.allowComments ?? true,
            isFeatured: p.isFeatured ?? false,
            scheduledAt: p.scheduledAt || '',
            viewCount: p.viewCount || 0,
            wordCount: p.wordCount || 0,
            readingTimeMin: p.readingTimeMin || 1,
            publishedAt: p.publishedAt,
            createdAt: p.createdAt,
          });
        } else {
          toast.error('Post not found');
          router.push('/admin/blog');
        }

        // Fetch authors, categories, tags
        const [authorsRes, categoriesRes, tagsRes] = await Promise.all([
          fetch('/api/blog/authors'),
          fetch('/api/blog/categories?format=flat'),
          fetch('/api/blog/tags'),
        ]);

        if (authorsRes.ok) {
          const data = await authorsRes.json();
          setAuthors(data.authors || []);
        }
        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data.flatCategories || []);
        }
        if (tagsRes.ok) {
          const data = await tagsRes.json();
          setTags(data.tags || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  // Generate slug
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 100);
  };

  // Handle title change
  const handleTitleChange = (title: string) => {
    setPost(p => ({
      ...p,
      title,
      seoTitle: title.length > 60 ? title.substring(0, 57) + '...' : title,
    }));
  };

  // Toggle category
  const toggleCategory = (categoryId: string) => {
    setPost(p => ({
      ...p,
      categoryIds: p.categoryIds.includes(categoryId)
        ? p.categoryIds.filter(id => id !== categoryId)
        : [...p.categoryIds, categoryId]
    }));
  };

  // Toggle tag
  const toggleTag = (tagId: string) => {
    setPost(p => ({
      ...p,
      tagIds: p.tagIds.includes(tagId)
        ? p.tagIds.filter(id => id !== tagId)
        : [...p.tagIds, tagId]
    }));
  };

  // Add new tag
  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    try {
      const res = await fetch('/api/blog/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTag.trim(),
          slug: generateSlug(newTag.trim()),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTags([...tags, data.tag]);
        setPost(p => ({ ...p, tagIds: [...p.tagIds, data.tag.id] }));
        setNewTag('');
        toast.success('Tag created');
      }
    } catch (error) {
      toast.error('Failed to create tag');
    }
  };

  // Calculate stats
  const wordCount = post.content ? post.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const seoAnalysis = calculateSEOScore(post);

  // Save post
  const handleSave = async (publishStatus?: string) => {
    if (!post.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setSaving(true);
    try {
      const contentText = post.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      
      const res = await fetch(`/api/blog/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...post,
          status: publishStatus || post.status,
          contentText,
          contentHtml: post.content,
          wordCount,
          readingTimeMin: readingTime,
          publishedAt: publishStatus === 'published' && !post.publishedAt ? new Date().toISOString() : post.publishedAt,
        }),
      });

      if (res.ok) {
        toast.success(publishStatus === 'published' ? 'Post published!' : 'Post saved');
        router.push('/admin/blog');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to save post');
      }
    } catch (error) {
      toast.error('Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  // Delete post
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const res = await fetch(`/api/blog/posts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Post deleted');
        router.push('/admin/blog');
      }
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-bg">
        <Sidebar />
        <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
          <TopBar />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="text-gray-500">Loading post...</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className="ml-60 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-[1600px] mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/admin/blog" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5 text-gray-500" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
                  <p className="text-gray-500 text-sm">
                    {wordCount.toLocaleString()} words · {readingTime} min read · {post.viewCount.toLocaleString()} views
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button variant="outline" onClick={() => handleSave('draft')} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
                {post.status === 'published' ? (
                  <Button className="btn-primary" onClick={() => handleSave('published')} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    Update
                  </Button>
                ) : (
                  <Button className="btn-primary" onClick={() => handleSave('published')} disabled={saving}>
                    <Send className="w-4 h-4 mr-2" />
                    Publish
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Title */}
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-medium">Post Title *</Label>
                        <Input
                          value={post.title}
                          onChange={(e) => handleTitleChange(e.target.value)}
                          placeholder="Enter your post title..."
                          className="input-field text-xl font-semibold mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">URL Slug</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-400">eduhub.in/blog/</span>
                          <Input
                            value={post.slug}
                            onChange={(e) => setPost(p => ({ ...p, slug: e.target.value }))}
                            className="input-field mono flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Featured Image */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      <div className="flex-1 space-y-4">
                        <div>
                          <Label>Featured Image URL</Label>
                          <Input
                            value={post.featuredImageUrl}
                            onChange={(e) => setPost(p => ({ ...p, featuredImageUrl: e.target.value }))}
                            placeholder="https://example.com/image.jpg"
                            className="input-field mt-2"
                          />
                        </div>
                        <div>
                          <Label>Alt Text (for SEO)</Label>
                          <Input
                            value={post.featuredImageAlt}
                            onChange={(e) => setPost(p => ({ ...p, featuredImageAlt: e.target.value }))}
                            placeholder="Describe the image..."
                            className="input-field mt-2"
                          />
                        </div>
                      </div>
                      <div className="w-48 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {post.featuredImageUrl ? (
                          <img src={post.featuredImageUrl} alt={post.featuredImageAlt} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center text-gray-400">
                            <ImageIcon className="w-8 h-8 mx-auto mb-1" />
                            <div className="text-xs">No image</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Content Editor */}
                <Card>
                  <CardContent className="p-6">
                    <Label className="text-base font-medium">Content</Label>
                    <div className="mt-3">
                      <RichTextEditor
                        value={post.content}
                        onChange={(content) => setPost(p => ({ ...p, content }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Excerpt */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Label>Excerpt (Optional)</Label>
                      <span className={`text-xs ${post.excerpt.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>
                        {post.excerpt.length}/160
                      </span>
                    </div>
                    <Textarea
                      value={post.excerpt}
                      onChange={(e) => setPost(p => ({ ...p, excerpt: e.target.value }))}
                      placeholder="Brief summary for post listings..."
                      className="input-field"
                      rows={3}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Post Settings */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Post Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Status</Label>
                      <Select value={post.status} onValueChange={(v) => setPost(p => ({ ...p, status: v }))}>
                        <SelectTrigger className="input-field mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="review">Pending Review</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Content Type</Label>
                      <Select value={post.contentType} onValueChange={(v) => setPost(p => ({ ...p, contentType: v }))}>
                        <SelectTrigger className="input-field mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {contentTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Author *</Label>
                      <Select value={post.authorId} onValueChange={(v) => setPost(p => ({ ...p, authorId: v }))}>
                        <SelectTrigger className="input-field mt-1">
                          <SelectValue placeholder="Select author" />
                        </SelectTrigger>
                        <SelectContent>
                          {authors.map((author) => (
                            <SelectItem key={author.id} value={author.id}>{author.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {post.status === 'scheduled' && (
                      <div>
                        <Label>Schedule Date & Time</Label>
                        <Input
                          type="datetime-local"
                          value={post.scheduledAt}
                          onChange={(e) => setPost(p => ({ ...p, scheduledAt: e.target.value }))}
                          className="input-field mt-1"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <Label>Allow Comments</Label>
                      <Switch
                        checked={post.allowComments}
                        onCheckedChange={(v) => setPost(p => ({ ...p, allowComments: v }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Featured Post</Label>
                      <Switch
                        checked={post.isFeatured}
                        onCheckedChange={(v) => setPost(p => ({ ...p, isFeatured: v }))}
                      />
                    </div>

                    {post.publishedAt && (
                      <div className="pt-2 border-t">
                        <div className="text-xs text-gray-500">Published</div>
                        <div className="text-sm font-medium">
                          {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Categories */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Categories</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-48 overflow-y-auto">
                    {categories.map((cat) => (
                      <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={post.categoryIds.includes(cat.id)}
                          onChange={() => toggleCategory(cat.id)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{cat.name}</span>
                      </label>
                    ))}
                  </CardContent>
                </Card>

                {/* Tags */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Tags</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                      {post.tagIds.map((tagId) => {
                        const tag = tags.find(t => t.id === tagId);
                        return tag ? (
                          <Badge key={tagId} variant="secondary" className="cursor-pointer" onClick={() => toggleTag(tagId)}>
                            {tag.name} ×
                          </Badge>
                        ) : null;
                      })}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add tag..."
                        className="input-field flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      />
                      <Button size="sm" onClick={handleAddTag}>Add</Button>
                    </div>
                  </CardContent>
                </Card>

                {/* SEO Manager */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">SEO Manager</CardTitle>
                      <div className={`text-lg font-bold ${seoAnalysis.score >= 80 ? 'text-green-600' : seoAnalysis.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {seoAnalysis.score}/100
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full ${seoAnalysis.score >= 80 ? 'bg-green-500' : seoAnalysis.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${seoAnalysis.score}%` }}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Label>SEO Title</Label>
                        <span className={`text-xs ${post.seoTitle.length > 60 ? 'text-red-500' : 'text-gray-400'}`}>
                          {post.seoTitle.length}/60
                        </span>
                      </div>
                      <Input
                        value={post.seoTitle}
                        onChange={(e) => setPost(p => ({ ...p, seoTitle: e.target.value }))}
                        placeholder="SEO optimized title..."
                        className="input-field"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Label>Meta Description</Label>
                        <span className={`text-xs ${post.seoDescription.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>
                          {post.seoDescription.length}/160
                        </span>
                      </div>
                      <Textarea
                        value={post.seoDescription}
                        onChange={(e) => setPost(p => ({ ...p, seoDescription: e.target.value }))}
                        placeholder="Brief description for search engines..."
                        className="input-field"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Focus Keyword</Label>
                      <Input
                        value={post.focusKeyword}
                        onChange={(e) => setPost(p => ({ ...p, focusKeyword: e.target.value }))}
                        placeholder="Main keyword..."
                        className="input-field"
                      />
                    </div>

                    {/* SEO Checklist */}
                    <div className="space-y-1 pt-2 border-t">
                      {seoAnalysis.checks.slice(0, 5).map((check, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          {check.pass ? (
                            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-gray-300" />
                          )}
                          <span className={check.pass ? 'text-gray-600' : 'text-gray-400'}>
                            {check.label}
                          </span>
                        </div>
                      ))}
                    </div>
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
