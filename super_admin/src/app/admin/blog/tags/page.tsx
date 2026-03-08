import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Tag,
  Edit,
  Trash2,
  Search,
  X,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { toast } from "sonner";

interface TagItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  postCount: number;
  createdAt: string;
}

export default function TagsPage() {
    const { isOpen } = useSidebarStore();
const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingTag, setEditingTag] = useState<TagItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });

  // Fetch tags
  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/blog/tags');
      if (res.ok) {
        const data = await res.json();
        setTags(data.tags || []);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Handle name change
  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  // Open dialog
  const handleOpenDialog = (tag?: TagItem) => {
    if (tag) {
      setEditingTag(tag);
      setFormData({
        name: tag.name,
        slug: tag.slug,
        description: tag.description || '',
      });
    } else {
      setEditingTag(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
      });
    }
    setShowDialog(true);
  };

  // Save tag
  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast.error('Name is required');
      return;
    }

    try {
      const url = editingTag
        ? `/api/blog/tags/${editingTag.id}`
        : '/api/blog/tags';
      
      const method = editingTag ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(editingTag ? 'Tag updated' : 'Tag created');
        setShowDialog(false);
        fetchTags();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to save tag');
      }
    } catch (error) {
      toast.error('Failed to save tag');
    }
  };

  // Delete tag
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/blog/tags/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Tag deleted');
        setDeleteConfirm(null);
        fetchTags();
      } else {
        toast.error('Failed to delete tag');
      }
    } catch (error) {
      toast.error('Failed to delete tag');
    }
  };

  // Cleanup unused tags
  const handleCleanup = async () => {
    if (!confirm('This will delete all tags with 0 posts. Continue?')) return;

    try {
      const res = await fetch('/api/blog/tags?cleanup=true', { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        toast.success(data.message);
        fetchTags();
      }
    } catch (error) {
      toast.error('Failed to cleanup tags');
    }
  };

  // Filter tags
  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tag.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const totalTags = tags.length;
  const usedTags = tags.filter(t => t.postCount > 0).length;
  const unusedTags = tags.filter(t => t.postCount === 0).length;

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
                  <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
                  <p className="text-gray-500 text-sm">Manage blog post tags</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {unusedTags > 0 && (
                  <Button variant="outline" onClick={handleCleanup} className="text-orange-600">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Cleanup ({unusedTags} unused)
                  </Button>
                )}
                <Button className="btn-primary" onClick={() => handleOpenDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tag
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                      <Tag className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Total Tags</div>
                      <div className="text-xl font-bold text-gray-900">{totalTags}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">In Use</div>
                      <div className="text-xl font-bold text-gray-900">{usedTags}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Unused</div>
                      <div className="text-xl font-bold text-gray-900">{unusedTags}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <Card>
              <CardContent className="p-4">
                <div className="relative max-w-[300px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 input-field"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tags Table */}
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : filteredTags.length === 0 ? (
                  <div className="p-8 text-center">
                    <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-1">No tags found</h3>
                    <p className="text-gray-500 text-sm mb-4">
                      {searchQuery ? 'Try a different search' : 'Create your first tag'}
                    </p>
                    <Button onClick={() => handleOpenDialog()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Tag
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase">Tag</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase">Slug</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase">Description</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase">Posts</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTags.map((tag) => (
                        <TableRow key={tag.id} className="hover:bg-brand-primary-tint">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                                {tag.name}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500 mono">/{tag.slug}</TableCell>
                          <TableCell className="text-sm text-gray-500 max-w-xs truncate">
                            {tag.description || '—'}
                          </TableCell>
                          <TableCell>
                            <span className={`text-sm font-medium ${tag.postCount > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                              {tag.postCount}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenDialog(tag)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              {deleteConfirm === tag.id ? (
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() => handleDelete(tag.id)}
                                  >
                                    Confirm
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDeleteConfirm(null)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => setDeleteConfirm(tag.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Tag Cloud Preview */}
            {tags.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Tag Cloud Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className={`${
                          tag.postCount > 5
                            ? 'text-base px-3 py-1'
                            : tag.postCount > 2
                            ? 'text-sm px-2.5 py-0.5'
                            : 'text-xs px-2 py-0'
                        } cursor-pointer hover:bg-purple-100 transition-colors`}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{editingTag ? 'Edit Tag' : 'Add Tag'}</DialogTitle>
            <DialogDescription>
              {editingTag ? 'Update tag details' : 'Create a new tag for blog posts'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Tag name"
                className="input-field mt-1"
              />
            </div>

            <div>
              <Label>Slug</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="input-field mono mt-1"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description..."
                className="input-field mt-1"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button className="btn-primary" onClick={handleSave}>
              {editingTag ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
