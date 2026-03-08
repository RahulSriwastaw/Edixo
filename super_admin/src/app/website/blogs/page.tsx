"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  FileText,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  X,
  ArrowLeft,
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
  Save,
  Send,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { toast } from "sonner";

// Mock blog posts data
const blogPosts = [
  {
    id: 1,
    title: "How to Crack JEE 2026: Complete Study Plan",
    slug: "how-to-crack-jee-2026",
    status: "Published",
    category: "Exam Tips",
    author: "Dr. Sharma",
    publishedDate: "Mar 01, 2026",
    views: 4521,
    seoTitle: "JEE 2026 Study Plan | Complete Guide",
    seoDescription: "Master JEE 2026 with our comprehensive study plan covering all subjects, time management tips, and revision strategies.",
    focusKeyword: "JEE 2026 study plan",
  },
  {
    id: 2,
    title: "NEET Biology: Important Topics and Weightage",
    slug: "neet-biology-important-topics",
    status: "Published",
    category: "Exam Tips",
    author: "Dr. Priya",
    publishedDate: "Feb 28, 2026",
    views: 3842,
    seoTitle: "NEET Biology Important Topics | High Weightage Chapters",
    seoDescription: "Discover the most important Biology topics for NEET with chapter-wise weightage analysis and preparation tips.",
    focusKeyword: "NEET biology important topics",
  },
  {
    id: 3,
    title: "Benefits of AI-Powered Learning Platforms",
    slug: "ai-powered-learning-benefits",
    status: "Draft",
    category: "Technology",
    author: "Admin",
    publishedDate: null,
    views: 0,
    seoTitle: "AI Learning Platforms Benefits | EdTech Revolution",
    seoDescription: "Explore how AI-powered learning platforms are transforming education with personalized learning paths and smart analytics.",
    focusKeyword: "AI learning platform benefits",
  },
  {
    id: 4,
    title: "Top 10 Coaching Institutes in Maharashtra",
    slug: "top-coaching-institutes-maharashtra",
    status: "Published",
    category: "Rankings",
    author: "Team EduHub",
    publishedDate: "Feb 25, 2026",
    views: 8921,
    seoTitle: "Best Coaching Institutes in Maharashtra 2026",
    seoDescription: "Comprehensive ranking of top coaching institutes in Maharashtra for JEE and NEET preparation with reviews and ratings.",
    focusKeyword: "coaching institutes maharashtra",
  },
  {
    id: 5,
    title: "Understanding the New JEE Pattern Changes",
    slug: "jee-pattern-changes-2026",
    status: "Scheduled",
    category: "News",
    author: "Dr. Sharma",
    publishedDate: "Mar 05, 2026",
    views: 0,
    seoTitle: "JEE Pattern Changes 2026 | What You Need to Know",
    seoDescription: "Everything you need to know about the new JEE examination pattern changes effective from 2026.",
    focusKeyword: "JEE pattern changes",
  },
];

const categories = ["Exam Tips", "Technology", "Rankings", "News", "Study Material", "Success Stories"];

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Published: "badge-active",
    Draft: "bg-gray-100 text-gray-600",
    Scheduled: "bg-blue-50 text-blue-700",
  };
  return <span className={`badge ${styles[status] || ""}`}>{status}</span>;
}

// Category Badge
function CategoryBadge({ category }: { category: string }) {
  const styles: Record<string, string> = {
    "Exam Tips": "bg-orange-50 text-orange-700",
    Technology: "bg-purple-50 text-purple-700",
    Rankings: "bg-green-50 text-green-700",
    News: "bg-blue-50 text-blue-700",
    "Study Material": "bg-yellow-50 text-yellow-700",
    "Success Stories": "bg-pink-50 text-pink-700",
  };
  return <span className={`badge ${styles[category] || "bg-gray-100 text-gray-600"}`}>{category}</span>;
}

export default function BlogsManagementPage() {
    const { isOpen } = useSidebarStore();
const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<typeof blogPosts[0] | null>(null);

  // Editor state
  const [editorData, setEditorData] = useState({
    title: "",
    slug: "",
    category: "Exam Tips",
    content: "",
    seoTitle: "",
    seoDescription: "",
    focusKeyword: "",
    featuredImage: "",
    status: "Draft",
    scheduledDate: "",
  });

  const filteredBlogs = blogPosts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || post.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleOpenEditor = (post: typeof blogPosts[0] | null) => {
    if (post) {
      setEditingPost(post);
      setEditorData({
        title: post.title,
        slug: post.slug,
        category: post.category,
        content: "",
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
        focusKeyword: post.focusKeyword,
        featuredImage: "",
        status: post.status,
        scheduledDate: post.publishedDate || "",
      });
    } else {
      setEditingPost(null);
      setEditorData({
        title: "",
        slug: "",
        category: "Exam Tips",
        content: "",
        seoTitle: "",
        seoDescription: "",
        focusKeyword: "",
        featuredImage: "",
        status: "Draft",
        scheduledDate: "",
      });
    }
    setShowEditor(true);
  };

  const handleSaveDraft = () => {
    toast.success("Draft saved successfully");
    setShowEditor(false);
  };

  const handlePublish = () => {
    toast.success("Post published successfully");
    setShowEditor(false);
  };

  const handleSchedule = () => {
    toast.success("Post scheduled successfully");
    setShowEditor(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center gap-4">
              <Link
                href="/website"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </Link>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Create, edit, and manage blog posts for the public website
                </p>
              </div>
              <Button className="btn-primary" onClick={() => handleOpenEditor(null)}>
                <Plus className="w-4 h-4 mr-2" />
                New Blog Post
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Total Posts</div>
                      <div className="text-xl font-bold text-gray-900">{blogPosts.length}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <Send className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Published</div>
                      <div className="text-xl font-bold text-gray-900">{blogPosts.filter(p => p.status === "Published").length}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Edit className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Drafts</div>
                      <div className="text-xl font-bold text-gray-900">{blogPosts.filter(p => p.status === "Draft").length}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                      <Eye className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Total Views</div>
                      <div className="text-xl font-bold text-gray-900">{blogPosts.reduce((sum, p) => sum + p.views, 0).toLocaleString()}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px] max-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search blogs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 input-field"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px] input-field">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Published">Published</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[150px] input-field">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(searchQuery || statusFilter !== "all" || categoryFilter !== "all") && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                        setCategoryFilter("all");
                      }}
                      className="btn-ghost"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Blogs Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Title</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Status</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Category</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Author</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Published</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Views</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBlogs.map((post) => (
                      <TableRow key={post.id} className="hover:bg-brand-primary-tint">
                        <TableCell>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{post.title}</div>
                            <div className="text-xs text-gray-500 mono">/{post.slug}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={post.status} />
                        </TableCell>
                        <TableCell>
                          <CategoryBadge category={post.category} />
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{post.author}</TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {post.status === "Scheduled" && (
                            <div className="flex items-center gap-1 text-blue-600">
                              <Clock className="w-3 h-3" />
                              {post.publishedDate}
                            </div>
                          )}
                          {post.status !== "Scheduled" && (post.publishedDate || "—")}
                        </TableCell>
                        <TableCell className="text-sm text-gray-900 font-medium">{post.views.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => handleOpenEditor(post)}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="w-4 h-4 mr-2" /> Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Link2 className="w-4 h-4 mr-2" /> Copy Link
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Blog Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? "Edit Blog Post" : "Create New Blog Post"}</DialogTitle>
            <DialogDescription>
              Write and configure your blog post with SEO optimization
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={editorData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setEditorData({
                      ...editorData,
                      title,
                      slug: generateSlug(title),
                      seoTitle: title.length > 60 ? title.substring(0, 60) : title,
                    });
                  }}
                  placeholder="Enter blog post title"
                  className="input-field text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label>Slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">eduhub.in/blog/</span>
                  <Input
                    value={editorData.slug}
                    onChange={(e) => setEditorData({ ...editorData, slug: e.target.value })}
                    className="input-field mono flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Content *</Label>
                {/* Rich Text Toolbar */}
                <div className="flex items-center gap-1 p-2 border border-b-0 rounded-t-lg bg-gray-50">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Italic className="w-4 h-4" />
                  </Button>
                  <div className="w-px h-6 bg-gray-200 mx-1" />
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Heading1 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Heading2 className="w-4 h-4" />
                  </Button>
                  <div className="w-px h-6 bg-gray-200 mx-1" />
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <List className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ListOrdered className="w-4 h-4" />
                  </Button>
                  <div className="w-px h-6 bg-gray-200 mx-1" />
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Quote className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Code className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Link2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                </div>
                <Textarea
                  value={editorData.content}
                  onChange={(e) => setEditorData({ ...editorData, content: e.target.value })}
                  placeholder="Write your blog content here..."
                  className="input-field min-h-[300px] rounded-t-none"
                />
              </div>

              <div className="space-y-2">
                <Label>Featured Image URL</Label>
                <Input
                  value={editorData.featuredImage}
                  onChange={(e) => setEditorData({ ...editorData, featuredImage: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="input-field"
                />
              </div>
            </div>

            {/* Sidebar Settings */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Post Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={editorData.category}
                      onValueChange={(v) => setEditorData({ ...editorData, category: v })}
                    >
                      <SelectTrigger className="input-field">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={editorData.status}
                      onValueChange={(v) => setEditorData({ ...editorData, status: v })}
                    >
                      <SelectTrigger className="input-field">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Published">Published</SelectItem>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {editorData.status === "Scheduled" && (
                    <div className="space-y-2">
                      <Label>Schedule Date</Label>
                      <Input
                        type="datetime-local"
                        value={editorData.scheduledDate}
                        onChange={(e) => setEditorData({ ...editorData, scheduledDate: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">SEO Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Meta Title</Label>
                      <span className={`text-xs ${editorData.seoTitle.length > 60 ? "text-red-500" : "text-gray-400"}`}>
                        {editorData.seoTitle.length}/60
                      </span>
                    </div>
                    <Input
                      value={editorData.seoTitle}
                      onChange={(e) => setEditorData({ ...editorData, seoTitle: e.target.value })}
                      placeholder="SEO optimized title"
                      className="input-field"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Meta Description</Label>
                      <span className={`text-xs ${editorData.seoDescription.length > 160 ? "text-red-500" : "text-gray-400"}`}>
                        {editorData.seoDescription.length}/160
                      </span>
                    </div>
                    <Textarea
                      value={editorData.seoDescription}
                      onChange={(e) => setEditorData({ ...editorData, seoDescription: e.target.value })}
                      placeholder="Brief description for search engines"
                      className="input-field min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Focus Keyword</Label>
                    <Input
                      value={editorData.focusKeyword}
                      onChange={(e) => setEditorData({ ...editorData, focusKeyword: e.target.value })}
                      placeholder="Main keyword for this post"
                      className="input-field"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between border-t pt-4">
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setShowEditor(false)}>
                Cancel
              </Button>
              {editorData.status === "Scheduled" ? (
                <Button className="btn-primary" onClick={handleSchedule}>
                  <Clock className="w-4 h-4 mr-2" />
                  Schedule
                </Button>
              ) : (
                <Button className="btn-primary" onClick={handlePublish}>
                  <Send className="w-4 h-4 mr-2" />
                  Publish
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
