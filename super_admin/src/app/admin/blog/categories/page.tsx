"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  FolderOpen,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Search,
  MoreHorizontal,
  FileText,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  imageUrl?: string;
  seoTitle?: string;
  seoDesc?: string;
  sortOrder: number;
  postCount: number;
  parent?: { id: string; name: string };
  children?: Category[];
}

export default function CategoriesPage() {
    const { isOpen } = useSidebarStore();
const [categories, setCategories] = useState<Category[]>([]);
  const [flatCategories, setFlatCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: '',
    imageUrl: '',
    seoTitle: '',
    seoDesc: '',
  });

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/blog/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
        setFlatCategories(data.flatCategories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
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

  // Handle form change
  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
      seoTitle: name.length > 60 ? name.substring(0, 57) + '...' : name,
    });
  };

  // Open dialog for new/edit
  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        parentId: category.parentId || '',
        imageUrl: category.imageUrl || '',
        seoTitle: category.seoTitle || '',
        seoDesc: category.seoDesc || '',
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        parentId: '',
        imageUrl: '',
        seoTitle: '',
        seoDesc: '',
      });
    }
    setShowDialog(true);
  };

  // Save category
  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast.error('Name is required');
      return;
    }

    try {
      const url = editingCategory
        ? `/api/blog/categories/${editingCategory.id}`
        : '/api/blog/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          parentId: formData.parentId || null,
        }),
      });

      if (res.ok) {
        toast.success(editingCategory ? 'Category updated' : 'Category created');
        setShowDialog(false);
        fetchCategories();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to save category');
      }
    } catch (error) {
      toast.error('Failed to save category');
    }
  };

  // Delete category
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? Posts in this category will need to be reassigned.')) return;

    try {
      const res = await fetch(`/api/blog/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Category deleted');
        fetchCategories();
      } else {
        toast.error('Cannot delete category with posts');
      }
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  // Toggle expand
  const toggleExpand = (id: string) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Render category tree
  const renderCategory = (category: Category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedIds.includes(category.id);

    return (
      <div key={category.id}>
        <div 
          className={`flex items-center gap-2 p-3 hover:bg-[var(--bg-main)] border-b ${level > 0 ? 'ml-6' : ''}`}
          style={{ marginLeft: level * 24 }}
        >
          <button onClick={() => toggleExpand(category.id)} className="p-1">
            {hasChildren ? (
              isExpanded ? <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
            ) : (
              <span className="w-5" />
            )}
          </button>
          
          <FolderOpen className="w-5 h-5 text-orange-500" />
          
          <div className="flex-1">
            <div className="font-medium text-[var(--text-primary)]">{category.name}</div>
            <div className="text-xs text-[var(--text-secondary)] mono">/{category.slug}</div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--text-secondary)]">{category.postCount} posts</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenDialog(category)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => handleDelete(category.id)}
              disabled={category.postCount > 0}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {hasChildren && isExpanded && category.children!.map(child => renderCategory(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "md:ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-4 lg:p-5">
          <div className="max-w-[1200px] mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/admin/blog" className="p-2 hover:bg-[var(--bg-main)] rounded-lg">
                  <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-[var(--text-primary)]">Categories</h1>
                  <p className="text-[var(--text-secondary)] text-sm">Manage hierarchical blog categories</p>
                </div>
              </div>
              <Button className="btn-primary" onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="text-sm text-[var(--text-secondary)]">Total Categories</div>
                  <div className="text-2xl font-bold text-[var(--text-primary)]">{flatCategories.length}</div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="text-sm text-[var(--text-secondary)]">Top Level</div>
                  <div className="text-2xl font-bold text-[var(--text-primary)]">{categories.length}</div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="text-sm text-[var(--text-secondary)]">With Posts</div>
                  <div className="text-2xl font-bold text-[var(--text-primary)]">
                    {flatCategories.filter(c => c.postCount > 0).length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Categories List */}
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center text-[var(--text-secondary)]">Loading...</div>
                ) : categories.length === 0 ? (
                  <div className="p-8 text-center">
                    <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-medium text-[var(--text-primary)] mb-1">No categories yet</h3>
                    <p className="text-[var(--text-secondary)] text-sm mb-4">Create your first category</p>
                    <Button onClick={() => handleOpenDialog()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Category
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {categories.map(category => renderCategory(category))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Update category details' : 'Create a new category for blog posts'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Category name"
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
              <Label>Parent Category</Label>
              <Select value={formData.parentId} onValueChange={(v) => setFormData({ ...formData, parentId: v })}>
                <SelectTrigger className="input-field mt-1">
                  <SelectValue placeholder="None (Top Level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (Top Level)</SelectItem>
                  {flatCategories
                    .filter(c => c.id !== editingCategory?.id)
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
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

            <div>
              <Label>Image URL</Label>
              <Input
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
                className="input-field mt-1"
              />
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">SEO Settings</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <Label className="text-sm">SEO Title</Label>
                    <span className={`text-xs ${formData.seoTitle.length > 60 ? 'text-red-500' : 'text-[var(--text-muted)]'}`}>
                      {formData.seoTitle.length}/60
                    </span>
                  </div>
                  <Input
                    value={formData.seoTitle}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <Label className="text-sm">SEO Description</Label>
                  <Textarea
                    value={formData.seoDesc}
                    onChange={(e) => setFormData({ ...formData, seoDesc: e.target.value })}
                    className="input-field mt-1"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button className="btn-primary" onClick={handleSave}>
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
