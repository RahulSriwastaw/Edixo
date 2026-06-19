"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
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
  Globe,
  Smartphone,
  Layers,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  fetchBlogPosts,
  deleteBlogPost,
  fetchBlogStats,
  BlogPost,
  Pagination,
} from "@/services/blogService";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: "bg-green-50 text-green-700 border-green-200",
    draft: "bg-gray-50 text-gray-600 border-gray-200",
    scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || ""}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function PlatformBadge({ platform }: { platform: string }) {
  const styles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    public_website: { bg: "bg-purple-50", text: "text-purple-700", icon: <Globe className="w-3 h-3" /> },
    mokebook: { bg: "bg-blue-50", text: "text-blue-700", icon: <Smartphone className="w-3 h-3" /> },
    both: { bg: "bg-green-50", text: "text-green-700", icon: <Layers className="w-3 h-3" /> },
  };
  const style = styles[platform] || styles.both;
  const labels: Record<string, string> = {
    public_website: "Website",
    mokebook: "Mokebook",
    both: "Both",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {style.icon}
      {labels[platform] || platform}
    </span>
  );
}

export default function BlogManagementPage() {
  const { isOpen } = useSidebarStore();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [stats, setStats] = useState({ totalPosts: 0, publishedPosts: 0, draftPosts: 0, totalAuthors: 0, totalCategories: 0, totalTags: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingPost, setDeletingPost] = useState<BlogPost | null>(null);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const [postsData, statsData] = await Promise.all([
        fetchBlogPosts({
          status: statusFilter !== "all" ? statusFilter : undefined,
          platform: platformFilter !== "all" ? platformFilter : undefined,
          search: searchQuery || undefined,
          page: String(pagination.page),
        }),
        fetchBlogStats(),
      ]);
      setPosts(postsData.posts);
      setPagination(postsData.pagination);
      setStats(statsData.stats);
    } catch (err: any) {
      toast.error(err.message || "Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [pagination.page, statusFilter, platformFilter]);

  const handleSearch = () => {
    setPagination((p) => ({ ...p, page: 1 }));
    loadPosts();
  };

  const handleDelete = async () => {
    if (!deletingPost) return;
    try {
      await deleteBlogPost(deletingPost.id);
      toast.success("Post deleted successfully");
      setDeleteDialogOpen(false);
      setDeletingPost(null);
      loadPosts();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete post");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "md:ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-4 lg:p-5">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">Blog Management</h1>
                <p className="text-[var(--text-secondary)] text-sm mt-1">
                  Create and manage blog posts for Public Website & Mokebook App
                </p>
              </div>
              <Link href="/blog/new">
                <Button className="bg-[#FF6B2B] hover:bg-[#e55a1f] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  New Blog Post
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-xs text-[var(--text-secondary)]">Total Posts</div>
                      <div className="text-xl font-bold text-[var(--text-primary)]">{stats.totalPosts}</div>
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
                      <div className="text-xs text-[var(--text-secondary)]">Published</div>
                      <div className="text-xl font-bold text-[var(--text-primary)]">{stats.publishedPosts}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                      <Edit className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-xs text-[var(--text-secondary)]">Drafts</div>
                      <div className="text-xl font-bold text-[var(--text-primary)]">{stats.draftPosts}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs text-[var(--text-secondary)]">Authors</div>
                      <div className="text-xl font-bold text-[var(--text-primary)]">{stats.totalAuthors}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                      <Layers className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-xs text-[var(--text-secondary)]">Categories</div>
                      <div className="text-xl font-bold text-[var(--text-primary)]">{stats.totalCategories}</div>
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
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <Input
                      placeholder="Search blogs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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
                    </SelectContent>
                  </Select>
                  <Select value={platformFilter} onValueChange={setPlatformFilter}>
                    <SelectTrigger className="w-[150px] input-field">
                      <SelectValue placeholder="Platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      <SelectItem value="public_website">Public Website</SelectItem>
                      <SelectItem value="mokebook">Mokebook App</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                  <Link href="/blog/categories">
                    <Button variant="outline" className="btn-secondary text-xs">
                      <Layers className="w-4 h-4 mr-1" />
                      Categories
                    </Button>
                  </Link>
                  <Link href="/blog/authors">
                    <Button variant="outline" className="btn-secondary text-xs">
                      <FileText className="w-4 h-4 mr-1" />
                      Authors
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Blog Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[var(--bg-main)]">
                      <TableHead className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Title</TableHead>
                      <TableHead className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Platform</TableHead>
                      <TableHead className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Status</TableHead>
                      <TableHead className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Author</TableHead>
                      <TableHead className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Published</TableHead>
                      <TableHead className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Views</TableHead>
                      <TableHead className="text-xs font-semibold text-[var(--text-secondary)] uppercase text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-[var(--text-secondary)]">
                          Loading posts...
                        </TableCell>
                      </TableRow>
                    ) : posts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-[var(--text-secondary)]">
                          No blog posts found. Create your first post!
                        </TableCell>
                      </TableRow>
                    ) : (
                      posts.map((post) => (
                        <TableRow key={post.id} className="hover:bg-brand-primary-tint">
                          <TableCell>
                            <div>
                              <div className="text-sm font-medium text-[var(--text-primary)]">{post.title}</div>
                              <div className="text-xs text-[var(--text-secondary)] mono">/{post.slug}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <PlatformBadge platform={post.platform} />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={post.status} />
                          </TableCell>
                          <TableCell className="text-sm text-[var(--text-secondary)]">{post.author?.name || "—"}</TableCell>
                          <TableCell className="text-sm text-[var(--text-secondary)]">
                            {post.status === "scheduled" && post.scheduledAt ? (
                              <div className="flex items-center gap-1 text-blue-600">
                                <Clock className="w-3 h-3" />
                                {new Date(post.scheduledAt).toLocaleDateString()}
                              </div>
                            ) : post.publishedAt ? (
                              new Date(post.publishedAt).toLocaleDateString()
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-[var(--text-primary)] font-medium">
                            {post.viewCount.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/blog/new?id=${post.id}`}>
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
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => {
                                      setDeletingPost(post);
                                      setDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-[var(--text-secondary)]">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} posts
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Blog Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingPost?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}