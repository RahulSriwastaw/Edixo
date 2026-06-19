"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { toast } from "sonner";
import {
  fetchBlogCategories,
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
  BlogCategory,
} from "@/services/blogService";

export default function BlogCategoriesPage() {
  const { isOpen } = useSidebarStore();
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "", description: "", color: "#FF6B2B" });

  const loadCategories = async () => {
    try {
      setLoading(true);
      const { categories } = await fetchBlogCategories();
      setCategories(categories);
    } catch (err: any) {
      toast.error(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCategories(); }, []);

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const openCreateDialog = () => {
    setEditingCategory(null);
    setFormData({ name: "", slug: "", description: "", color: "#FF6B2B" });
    setDialogOpen(true);
  };

  const openEditDialog = (cat: BlogCategory) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      color: cat.color || "#FF6B2B",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast.error("Name and slug are required");
      return;
    }
    try {
      if (editingCategory) {
        await updateBlogCategory(editingCategory.id, formData);
        toast.success("Category updated");
      } else {
        await createBlogCategory(formData);
        toast.success("Category created");
      }
      setDialogOpen(false);
      loadCategories();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      await deleteBlogCategory(id);
      toast.success("Category deleted");
      loadCategories();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "md:ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-4 lg:p-5">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/blog" className="p-2 hover:bg-[var(--bg-main)] rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-[var(--text-primary)]">Blog Categories</h1>
                  <p className="text-[var(--text-secondary)] text-sm mt-1">Manage blog post categories</p>
                </div>
              </div>
              <Button className="bg-[#FF6B2B] hover:bg-[#e55a1f] text-white" onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>

            {/* Categories Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[var(--bg-main)]">
                      <TableHead className="text-xs font-semibold uppercase">Color</TableHead>
                      <TableHead className="text-xs font-semibold uppercase">Name</TableHead>
                      <TableHead className="text-xs font-semibold uppercase">Slug</TableHead>
                      <TableHead className="text-xs font-semibold uppercase">Description</TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-[var(--text-secondary)]">Loading...</TableCell></TableRow>
                    ) : categories.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-[var(--text-secondary)]">No categories yet</TableCell></TableRow>
                    ) : (
                      categories.map((cat) => (
                        <TableRow key={cat.id} className="hover:bg-brand-primary-tint">
                          <TableCell>
                            <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: cat.color || "#ccc" }} />
                          </TableCell>
                          <TableCell className="font-medium text-[var(--text-primary)]">{cat.name}</TableCell>
                          <TableCell className="text-sm text-[var(--text-secondary)] mono">/{cat.slug}</TableCell>
                          <TableCell className="text-sm text-[var(--text-secondary)]">{cat.description || "—"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEditDialog(cat)}>
                                <Edit className="w-3 h-3 mr-1" /> Edit
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(cat.id)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Create Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: editingCategory ? formData.slug : generateSlug(e.target.value) })}
                placeholder="Category name"
                className="input-field"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug *</Label>
              <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="input-field mono" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field" />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex items-center gap-2">
                <Input type="color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="w-12 h-10 p-1" />
                <Input value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="input-field flex-1 mono" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="bg-[#FF6B2B] hover:bg-[#e55a1f] text-white" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              {editingCategory ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}