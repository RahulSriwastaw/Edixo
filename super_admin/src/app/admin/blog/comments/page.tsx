import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2,
  Reply,
  Clock,
  User,
  MoreHorizontal,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface Comment {
  id: string;
  postId: string;
  parentId?: string;
  authorName: string;
  authorEmail: string;
  authorUrl?: string;
  content: string;
  status: string;
  likeCount: number;
  createdAt: string;
  post?: {
    id: string;
    title: string;
    slug: string;
  };
  replies?: Comment[];
}

// Mock comments data
const mockComments: Comment[] = [
  {
    id: "1",
    postId: "p1",
    authorName: "Rahul Sharma",
    authorEmail: "rahul@example.com",
    content: "Great article! Very helpful for my JEE preparation. Can you write more about the physics section?",
    status: "approved",
    likeCount: 5,
    createdAt: "2026-03-01T10:00:00Z",
    post: { id: "p1", title: "How to Crack JEE 2026: Complete Study Plan", slug: "how-to-crack-jee-2026" }
  },
  {
    id: "2",
    postId: "p2",
    authorName: "Priya Verma",
    authorEmail: "priya@example.com",
    content: "This is exactly what I was looking for! The biology weightage analysis is spot on.",
    status: "approved",
    likeCount: 3,
    createdAt: "2026-03-01T08:30:00Z",
    post: { id: "p2", title: "NEET Biology: Important Topics and Weightage", slug: "neet-biology-important-topics" }
  },
  {
    id: "3",
    postId: "p1",
    authorName: "Amit Kumar",
    authorEmail: "amit@example.com",
    content: "Check out my coaching institute website for more tips: www.spam-link.com",
    status: "spam",
    likeCount: 0,
    createdAt: "2026-03-01T07:15:00Z",
    post: { id: "p1", title: "How to Crack JEE 2026: Complete Study Plan", slug: "how-to-crack-jee-2026" }
  },
  {
    id: "4",
    postId: "p3",
    authorName: "Sneha Gupta",
    authorEmail: "sneha@example.com",
    content: "When will you publish the next part of this series? Eagerly waiting!",
    status: "pending",
    likeCount: 0,
    createdAt: "2026-03-01T06:45:00Z",
    post: { id: "p3", title: "AI-Powered Learning Platforms Benefits", slug: "ai-powered-learning-benefits" }
  },
  {
    id: "5",
    postId: "p2",
    authorName: "Vikram Singh",
    authorEmail: "vikram@example.com",
    content: "I disagree with the weightage for Human Physiology. Based on my analysis of last 5 years...",
    status: "pending",
    likeCount: 0,
    createdAt: "2026-03-01T05:30:00Z",
    post: { id: "p2", title: "NEET Biology: Important Topics and Weightage", slug: "neet-biology-important-topics" }
  },
  {
    id: "6",
    postId: "p1",
    authorName: "Neha Patel",
    authorEmail: "neha@example.com",
    authorUrl: "https://linkedin.com/in/nehapatel",
    content: "As a teacher, I can confirm this study plan works. I've recommended it to my students and seen great results!",
    status: "approved",
    likeCount: 12,
    createdAt: "2026-02-28T18:20:00Z",
    post: { id: "p1", title: "How to Crack JEE 2026: Complete Study Plan", slug: "how-to-crack-jee-2026" }
  },
  {
    id: "7",
    postId: "p4",
    authorName: "Spam User",
    authorEmail: "spam@spam.com",
    content: "Buy cheap essays online! Best prices! Click here for discounts!!!",
    status: "spam",
    likeCount: 0,
    createdAt: "2026-02-28T15:00:00Z",
    post: { id: "p4", title: "Top 10 Coaching Institutes in Maharashtra", slug: "top-coaching-institutes-maharashtra" }
  },
  {
    id: "8",
    postId: "p3",
    authorName: "Deepak Joshi",
    authorEmail: "deepak@example.com",
    content: "Could you add more details about the AI question generation feature? How accurate is it?",
    status: "pending",
    likeCount: 0,
    createdAt: "2026-02-28T12:00:00Z",
    post: { id: "p3", title: "AI-Powered Learning Platforms Benefits", slug: "ai-powered-learning-benefits" }
  },
];

export default function CommentsPage() {
    const { isOpen } = useSidebarStore();
const [comments, setComments] = useState<Comment[]>(mockComments);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [replyDialog, setReplyDialog] = useState<Comment | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [selectedComments, setSelectedComments] = useState<string[]>([]);

  // Filter comments
  const filteredComments = comments.filter(comment => {
    const matchesStatus = statusFilter === "all" || comment.status === statusFilter;
    const matchesSearch = 
      comment.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.authorEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Stats
  const stats = {
    total: comments.length,
    pending: comments.filter(c => c.status === 'pending').length,
    approved: comments.filter(c => c.status === 'approved').length,
    spam: comments.filter(c => c.status === 'spam').length,
  };

  // Update comment status
  const updateStatus = (id: string, status: string) => {
    setComments(comments.map(c => c.id === id ? { ...c, status } : c));
    toast.success(`Comment ${status}`);
  };

  // Delete comment
  const deleteComment = (id: string) => {
    setComments(comments.filter(c => c.id !== id));
    toast.success('Comment deleted');
  };

  // Bulk action
  const handleBulkAction = (action: string) => {
    if (selectedComments.length === 0) return;

    if (action === 'approve') {
      setComments(comments.map(c => 
        selectedComments.includes(c.id) ? { ...c, status: 'approved' } : c
      ));
      toast.success(`${selectedComments.length} comments approved`);
    } else if (action === 'spam') {
      setComments(comments.map(c => 
        selectedComments.includes(c.id) ? { ...c, status: 'spam' } : c
      ));
      toast.success(`${selectedComments.length} comments marked as spam`);
    } else if (action === 'delete') {
      setComments(comments.filter(c => !selectedComments.includes(c.id)));
      toast.success(`${selectedComments.length} comments deleted`);
    }
    setSelectedComments([]);
  };

  // Toggle select
  const toggleSelect = (id: string) => {
    setSelectedComments(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Select all
  const toggleSelectAll = () => {
    if (selectedComments.length === filteredComments.length) {
      setSelectedComments([]);
    } else {
      setSelectedComments(filteredComments.map(c => c.id));
    }
  };

  // Send reply
  const handleSendReply = () => {
    if (!replyContent.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }
    toast.success('Reply sent');
    setReplyDialog(null);
    setReplyContent("");
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Status badge
  const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
      approved: "bg-green-50 text-green-700",
      pending: "bg-yellow-50 text-yellow-700",
      spam: "bg-red-50 text-red-700",
      trash: "bg-gray-100 text-gray-600",
    };
    const icons: Record<string, any> = {
      approved: CheckCircle,
      pending: Clock,
      spam: AlertTriangle,
      trash: Trash2,
    };
    const Icon = icons[status];
    return (
      <span className={`badge text-xs flex items-center gap-1 ${styles[status]}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-[1200px] mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/admin/blog" className="p-2 hover:bg-gray-100 rounded-lg">
                  <ArrowLeft className="w-5 h-5 text-gray-500" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Comments</h1>
                  <p className="text-gray-500 text-sm">Moderate blog post comments</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <Card 
                className={`kpi-card cursor-pointer transition-all ${statusFilter === 'all' ? 'ring-2 ring-brand-primary' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Total</div>
                      <div className="text-xl font-bold text-gray-900">{stats.total}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card 
                className={`kpi-card cursor-pointer transition-all ${statusFilter === 'pending' ? 'ring-2 ring-brand-primary' : ''}`}
                onClick={() => setStatusFilter('pending')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Pending</div>
                      <div className="text-xl font-bold text-yellow-600">{stats.pending}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card 
                className={`kpi-card cursor-pointer transition-all ${statusFilter === 'approved' ? 'ring-2 ring-brand-primary' : ''}`}
                onClick={() => setStatusFilter('approved')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Approved</div>
                      <div className="text-xl font-bold text-green-600">{stats.approved}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card 
                className={`kpi-card cursor-pointer transition-all ${statusFilter === 'spam' ? 'ring-2 ring-brand-primary' : ''}`}
                onClick={() => setStatusFilter('spam')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Spam</div>
                      <div className="text-xl font-bold text-red-600">{stats.spam}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bulk Actions & Search */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {selectedComments.length > 0 && (
                      <>
                        <span className="text-sm text-gray-500">{selectedComments.length} selected</span>
                        <Button variant="outline" size="sm" onClick={() => handleBulkAction('approve')}>
                          <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                          Approve
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleBulkAction('spam')}>
                          <AlertTriangle className="w-4 h-4 mr-1 text-red-600" />
                          Mark Spam
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleBulkAction('delete')}>
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="relative w-[250px]">
                    <Input
                      placeholder="Search comments..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments List */}
            <Card>
              <CardContent className="p-0">
                {filteredComments.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-1">No comments found</h3>
                    <p className="text-gray-500 text-sm">
                      {statusFilter !== 'all' ? `No ${statusFilter} comments` : 'No comments yet'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {/* Select All */}
                    <div className="p-3 bg-gray-50 flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedComments.length === filteredComments.length && filteredComments.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-500">Select all</span>
                    </div>

                    {filteredComments.map((comment) => (
                      <div key={comment.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedComments.includes(comment.id)}
                            onChange={() => toggleSelect(comment.id)}
                            className="rounded border-gray-300 mt-1"
                          />
                          
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-gray-500">
                              {comment.authorName.charAt(0).toUpperCase()}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-gray-900">{comment.authorName}</span>
                              <span className="text-xs text-gray-400">{comment.authorEmail}</span>
                              <StatusBadge status={comment.status} />
                              {comment.likeCount > 0 && (
                                <span className="text-xs text-gray-400">👍 {comment.likeCount}</span>
                              )}
                            </div>

                            <p className="text-sm text-gray-600 mt-1">{comment.content}</p>

                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                              {comment.post && (
                                <a 
                                  href={`/blog/${comment.post.slug}`}
                                  className="text-xs text-brand-primary hover:underline flex items-center gap-1"
                                  target="_blank"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  {comment.post.title}
                                </a>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {comment.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => updateStatus(comment.id, 'approved')}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => updateStatus(comment.id, 'spam')}
                                >
                                  <AlertTriangle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setReplyDialog(comment)}
                            >
                              <Reply className="w-4 h-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {comment.status !== 'approved' && (
                                  <DropdownMenuItem onClick={() => updateStatus(comment.id, 'approved')}>
                                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                    Approve
                                  </DropdownMenuItem>
                                )}
                                {comment.status !== 'spam' && (
                                  <DropdownMenuItem onClick={() => updateStatus(comment.id, 'spam')}>
                                    <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
                                    Mark as Spam
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => deleteComment(comment.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Reply Dialog */}
      <Dialog open={!!replyDialog} onOpenChange={() => setReplyDialog(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reply to Comment</DialogTitle>
            <DialogDescription>
              Your reply will be posted as the site administrator
            </DialogDescription>
          </DialogHeader>

          {replyDialog && (
            <div className="py-4">
              <div className="p-3 bg-gray-50 rounded-lg mb-4">
                <div className="text-sm font-medium text-gray-900">{replyDialog.authorName}</div>
                <div className="text-sm text-gray-600 mt-1">{replyDialog.content}</div>
              </div>

              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                className="input-field min-h-[100px]"
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyDialog(null)}>Cancel</Button>
            <Button className="btn-primary" onClick={handleSendReply}>
              <Reply className="w-4 h-4 mr-2" />
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
