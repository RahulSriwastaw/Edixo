"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

import { useState, useEffect } from "react";
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
  Send,
  Clock,
  TrendingUp,
  Users,
  Tag,
  FolderOpen,
  MessageSquare,
  Image as ImageIcon,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { toast } from "sonner";

// Types
interface Author {
  id: string;
  name: string;
  slug: string;
  photoUrl?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  status: string;
  contentType: string;
  viewCount: number;
  wordCount: number | null;
  readingTimeMin: number | null;
  publishedAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
  author: Author;
  categories: { category: Category }[];
  tags: { tag: Tag }[];
}

interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  scheduledPosts: number;
  totalAuthors: number;
  totalCategories: number;
  totalTags: number;
  totalComments: number;
  pendingComments: number;
  totalViews: number;
  totalMedia: number;
}

// Content Type Options
const contentTypes = [
  { value: 'blog', label: 'Blog Post' },
  { value: 'article', label: 'Article' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'news', label: 'News' },
  { value: 'case-study', label: 'Case Study' },
  { value: 'press-release', label: 'Press Release' },
];

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: "bg-green-50 text-green-700 border-green-200",
    draft: "bg-gray-100 text-gray-600 border-gray-200",
    scheduled: "bg-blue-50 text-blue-700 border-blue-200",
    review: "bg-yellow-50 text-yellow-700 border-yellow-200",
    unpublished: "bg-red-50 text-red-600 border-red-200",
    archived: "bg-gray-50 text-gray-500 border-gray-200",
  };
  const labels: Record<string, string> = {
    published: "Published",
    draft: "Draft",
    scheduled: "Scheduled",
    review: "In Review",
    unpublished: "Unpublished",
    archived: "Archived",
  };
  return (
    <span className={`badge border ${styles[status] || styles.draft}`}>
      {labels[status] || status}
    </span>
  );
}

// Content Type Badge Component
function ContentTypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    blog: "bg-orange-50 text-orange-700 border-orange-200",
    article: "bg-purple-50 text-purple-700 border-purple-200",
    tutorial: "bg-cyan-50 text-cyan-700 border-cyan-200",
    news: "bg-blue-50 text-blue-700 border-blue-200",
    'case-study': "bg-green-50 text-green-700 border-green-200",
    'press-release': "bg-pink-50 text-pink-700 border-pink-200",
  };
  const labels: Record<string, string> = {
    blog: "Blog",
    article: "Article",
    tutorial: "Tutorial",
    news: "News",
    'case-study': "Case Study",
    'press-release': "Press Release",
  };
  return (
    <span className={`badge border text-xs ${styles[type] || styles.blog}`}>
      {labels[type] || type}
    </span>
  );
}

export default function BlogDashboardPage() {
    const { isOpen } = useSidebarStore();
const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [authorFilter, setAuthorFilter] = useState("all");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats
        const statsRes = await fetch('/api/blog/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.stats);
        }

        // Fetch categories
        const catRes = await fetch('/api/blog/categories?format=flat');
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.flatCategories || []);
        }

        // Fetch authors
        const authRes = await fetch('/api/blog/authors');
        if (authRes.ok) {
          const authData = await authRes.json();
          setAuthors(authData.authors || []);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchData();
  }, []);

  // Fetch posts when filters change
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (statusFilter !== 'all') params.append('status', statusFilter);
        if (typeFilter !== 'all') params.append('contentType', typeFilter);
        if (categoryFilter !== 'all') params.append('categoryId', categoryFilter);
        if (authorFilter !== 'all') params.append('authorId', authorFilter);
        params.append('page', page.toString());
        params.append('limit', '20');

        const res = await fetch(`/api/blog/posts?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
          setTotalPages(data.pagination?.totalPages || 1);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [searchQuery, statusFilter, typeFilter, categoryFilter, authorFilter, page]);

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/blog/posts/${postId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Post deleted successfully');
        setPosts(posts.filter(p => p.id !== postId));
      } else {
        toast.error('Failed to delete post');
      }
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "md:ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Blog & Articles</h1>
                <p className="text-gray-500 text-sm mt-1">
                  WordPress-level CMS with Google SEO optimization
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/admin/blog/categories">
                  <Button variant="outline" className="btn-ghost">
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Categories
                  </Button>
                </Link>
                <Link href="/admin/blog/authors">
                  <Button variant="outline" className="btn-ghost">
                    <Users className="w-4 h-4 mr-2" />
                    Authors
                  </Button>
                </Link>
                <Link href="/admin/blog/new">
                  <Button className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    New Post
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <Card className="kpi-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Total Posts</div>
                        <div className="text-xl font-bold text-gray-900">{stats.totalPosts}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="kpi-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                        <Send className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Published</div>
                        <div className="text-xl font-bold text-gray-900">{stats.publishedPosts}</div>
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
                        <div className="text-xl font-bold text-gray-900">{stats.draftPosts}</div>
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
                        <div className="text-xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="kpi-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                        <Users className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Authors</div>
                        <div className="text-xl font-bold text-gray-900">{stats.totalAuthors}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="kpi-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Comments</div>
                        <div className="text-xl font-bold text-gray-900">{stats.totalComments}</div>
                        {stats.pendingComments > 0 && (
                          <div className="text-xs text-orange-600">{stats.pendingComments} pending</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/admin/blog/new" className="block">
                <Card className="hover:shadow-md transition-shadow cursor-pointer border border-dashed">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">AI-Assisted Writing</div>
                      <div className="text-xs text-gray-500">Create with AI help</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/admin/blog/media" className="block">
                <Card className="hover:shadow-md transition-shadow cursor-pointer border border-dashed">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Media Library</div>
                      <div className="text-xs text-gray-500">Manage images & files</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/admin/blog/comments" className="block">
                <Card className="hover:shadow-md transition-shadow cursor-pointer border border-dashed">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Comments</div>
                      <div className="text-xs text-gray-500">Moderate comments</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/admin/blog?status=draft" className="block">
                <Card className="hover:shadow-md transition-shadow cursor-pointer border border-dashed">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">SEO Overview</div>
                      <div className="text-xs text-gray-500">Check performance</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Filter Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px] max-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search posts..."
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
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="review">In Review</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[130px] input-field">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {contentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[150px] input-field">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={authorFilter} onValueChange={setAuthorFilter}>
                    <SelectTrigger className="w-[150px] input-field">
                      <SelectValue placeholder="Author" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Authors</SelectItem>
                      {authors.map((author) => (
                        <SelectItem key={author.id} value={author.id}>{author.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(searchQuery || statusFilter !== "all" || typeFilter !== "all" || categoryFilter !== "all" || authorFilter !== "all") && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                        setTypeFilter("all");
                        setCategoryFilter("all");
                        setAuthorFilter("all");
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

            {/* Posts Table */}
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center text-gray-500">
                    Loading posts...
                  </div>
                ) : posts.length === 0 ? (
                  <div className="p-8 text-center">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-1">No posts found</h3>
                    <p className="text-gray-500 text-sm mb-4">
                      {searchQuery || statusFilter !== "all" ? "Try adjusting your filters" : "Create your first blog post"}
                    </p>
                    <Link href="/admin/blog/new">
                      <Button className="btn-primary">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Post
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase">Title</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase">Status</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase">Type</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase">Author</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase">Category</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase">Date</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase">Views</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {posts.map((post) => (
                        <TableRow key={post.id} className="hover:bg-brand-primary-tint">
                          <TableCell>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{post.title}</div>
                              <div className="text-xs text-gray-500 mono">/{post.slug}</div>
                              {post.wordCount && (
                                <div className="text-xs text-gray-400 mt-0.5">
                                  {post.wordCount.toLocaleString()} words · {post.readingTimeMin} min read
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={post.status} />
                            {post.status === 'scheduled' && post.scheduledAt && (
                              <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(post.scheduledAt)}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <ContentTypeBadge type={post.contentType} />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {post.author.photoUrl ? (
                                <img src={post.author.photoUrl} alt={post.author.name} className="w-6 h-6 rounded-full" />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                                  {post.author.name.charAt(0)}
                                </div>
                              )}
                              <span className="text-sm text-gray-600">{post.author.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {post.categories.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {post.categories.slice(0, 2).map(({ category }) => (
                                  <span key={category.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                    {category.name}
                                  </span>
                                ))}
                                {post.categories.length > 2 && (
                                  <span className="text-xs text-gray-400">+{post.categories.length - 2}</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {post.status === 'published' ? formatDate(post.publishedAt) : formatDate(post.createdAt)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-900 font-medium">
                            {post.viewCount.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/admin/blog/${post.id}`}>
                                <Button variant="outline" size="sm" className="text-xs">
                                  <Edit className="w-3 h-3 mr-1" />
                                  Edit
                                </Button>
                              </Link>
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
                                    <BarChart3 className="w-4 h-4 mr-2" /> Analytics
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600" onClick={() => handleDeletePost(post.id)}>
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
                )}
              </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
