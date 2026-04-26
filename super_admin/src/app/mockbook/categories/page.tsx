"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight, Plus, Edit, Trash2, Star, BookOpen,
  Users, Package, X, Loader2, FolderOpen,
} from "lucide-react";
import { mockbookService, ExamFolder } from "@/services/mockbookService";
import { ExamInterfacePicker } from "@/components/examInterface/ExamInterfacePicker";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";

const ICON_OPTIONS = ["📚", "📝", "🎯", "🏦", "🚂", "⚕️", "🔬", "⚖️", "💻", "🛡️", "🌐", "📊"];
const COLOR_OPTIONS = [
  { label: "Blue", value: "bg-blue-100 border-blue-300 text-blue-700" },
  { label: "Orange", value: "bg-orange-100 border-orange-300 text-orange-700" },
  { label: "Green", value: "bg-green-100 border-green-300 text-green-700" },
  { label: "Purple", value: "bg-purple-100 border-purple-300 text-purple-700" },
  { label: "Red", value: "bg-red-100 border-red-300 text-red-700" },
  { label: "Yellow", value: "bg-yellow-100 border-yellow-300 text-yellow-700" },
];

const EMPTY_FORM = { name: "", description: "", icon: "📚", color: COLOR_OPTIONS[0].value, isFeatured: false, interfaceThemeId: null as string | null };

export default function CategoriesPage() {
  const { isOpen } = useSidebarStore();
  const [categories, setCategories] = useState<ExamFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await mockbookService.getFolders();
      setCategories(data);
    } catch (error) {
      toast.error("Failed to load exam categories");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  };

  const openEdit = (cat: ExamFolder) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      description: cat.description || "",
      icon: cat.icon || "📚",
      color: cat.color || COLOR_OPTIONS[0].value,
      isFeatured: cat.isFeatured,
      interfaceThemeId: cat.interfaceThemeId,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error("Category name is required");
    setIsSaving(true);
    try {
      if (editingId) {
        await mockbookService.updateFolder(editingId, form);
        setCategories(prev =>
          prev.map(c => c.id === editingId ? { ...c, ...form } : c)
        );
        toast.success("Category updated successfully");
      } else {
        const payload = { ...form };
        const res = await mockbookService.createFolder(payload);
        const newCat = (res as any).data?.data || (res as any).data;
        setCategories(prev => [...prev, newCat]);
        toast.success("Category created successfully");
      }
      setModalOpen(false);
    } catch (error) {
      toast.error(editingId ? "Failed to update category" : "Failed to create category");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await mockbookService.deleteFolder(deleteId);
      setCategories(prev => prev.filter(c => c.id !== deleteId));
      toast.success("Category deleted");
    } catch (error) {
      toast.error("Failed to delete category");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "md:ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-4 lg:p-5">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <Link href="/mockbook" className="hover:text-orange-600">MockBook</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-[var(--text-primary)] font-medium">Exam Categories</span>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">Exam Categories</h1>
                <p className="text-[var(--text-secondary)] text-sm mt-1">Manage and organize exam categories (SSC, Banking, NEET, etc.)</p>
              </div>
              <Button className="btn-primary" onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" /> Add Category
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Total Categories", value: categories.length },
                { label: "Featured", value: categories.filter(c => c.isFeatured).length },
                { label: "Active", value: categories.filter(c => c.isActive).length },
              ].map(stat => (
                <Card key={stat.label} className="kpi-card">
                  <div className="p-4">
                    <div className="text-xs text-[var(--text-secondary)] uppercase">{stat.label}</div>
                    <div className="text-xl font-bold text-[var(--text-primary)] mt-0.5">{stat.value}</div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Loading */}
            {isLoading ? (
              <div className="py-20 text-center text-[var(--text-muted)]">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-orange-500" />
                Loading categories...
              </div>
            ) : (
              /* Categories Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {categories.map((cat: any) => (
                  <Card
                    key={cat.id}
                    className="relative overflow-hidden border-2 transition-all hover:shadow-md hover:border-orange-200 group"
                  >
                    <CardContent className="p-5">
                      {/* Header row */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border-2",
                          cat.color || "bg-orange-100 border-orange-300"
                        )}>
                          {cat.icon || "📚"}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-[var(--text-muted)] hover:text-orange-600"
                            onClick={() => openEdit(cat)}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-[var(--text-muted)] hover:text-red-500"
                            onClick={() => setDeleteId(cat.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="font-bold text-[var(--text-primary)] text-base mb-0.5 flex items-center gap-2">
                        {cat.name}
                        {cat.isFeatured && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] mb-4 line-clamp-2">{cat.description || "No description"}</div>

                      {/* Stats row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                            <Package className="w-3.5 h-3.5" />
                          </div>
                          <span><strong>{(cat as any)._count?.categories || 0}</strong> series</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                          <div className="p-1.5 bg-green-50 text-green-600 rounded-lg">
                            <Users className="w-3.5 h-3.5" />
                          </div>
                          <span><strong>{(cat as any).studentCount || 0}</strong> students</span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-4 pt-3 border-t flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className={cat.isActive ? "border-green-200 text-green-700" : "border-red-200 text-red-600"}
                        >
                          {cat.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Link
                          href={`/mockbook/test-series?folderId=${cat.id}`}
                          className="text-xs text-orange-600 hover:underline flex items-center gap-1"
                        >
                          View Series <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Add New Category card */}
                <Card
                  className="border-2 border-dashed border-[var(--border-input)] hover:border-orange-300 transition-colors cursor-pointer group"
                  onClick={openCreate}
                >
                  <CardContent className="p-5 flex flex-col items-center justify-center h-full min-h-[200px]">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--bg-main)] group-hover:bg-orange-50 flex items-center justify-center mb-3 transition-colors">
                      <Plus className="w-6 h-6 text-[var(--text-muted)] group-hover:text-orange-500 transition-colors" />
                    </div>
                    <div className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-orange-600 transition-colors">Add New Category</div>
                    <div className="text-xs text-[var(--text-muted)] mt-1 text-center">Create a new exam category for the platform</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && categories.length === 0 && (
              <div className="py-16 text-center">
                <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-[var(--text-secondary)] font-medium">No categories yet</h3>
                <p className="text-[var(--text-muted)] text-sm mt-1">Create your first exam category to get started</p>
                <Button className="btn-primary mt-4" onClick={openCreate}>
                  <Plus className="w-4 h-4 mr-2" /> Create Category
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Create / Edit Modal ── */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Category" : "Create Exam Category"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update the details for this exam category." : "Add a new top-level exam category (e.g. SSC, Banking, NEET)."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Name */}
            <div className="space-y-1.5">
              <Label>Name <span className="text-red-500">*</span></Label>
              <Input
                placeholder="e.g. SSC, Banking, NEET..."
                className="input-field"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description of this exam category..."
                className="input-field resize-none"
                rows={2}
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              />
            </div>

            {/* Icon & Color */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Icon</Label>
                <div className="flex flex-wrap gap-2 p-2 border rounded-lg">
                  {ICON_OPTIONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, icon }))}
                      className={cn(
                        "w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all",
                        form.icon === icon ? "bg-orange-100 ring-2 ring-orange-400 scale-110" : "hover:bg-[var(--bg-main)]"
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Color Theme</Label>
                <div className="flex flex-wrap gap-2 p-2 border rounded-lg">
                  {COLOR_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, color: opt.value }))}
                      className={cn(
                        "w-7 h-7 rounded-full border-2 transition-all",
                        opt.value,
                        form.color === opt.value ? "ring-2 ring-offset-1 ring-gray-700 scale-110" : ""
                      )}
                      title={opt.label}
                    />
                  ))}
                </div>

                {/* Preview */}
                <div className={cn("mt-2 w-10 h-10 rounded-xl flex items-center justify-center text-xl border-2", form.color)}>
                  {form.icon}
                </div>
              </div>
            </div>

            {/* Exam Interface Theme */}
            <ExamInterfacePicker
              value={form.interfaceThemeId}
              onChange={(themeId) => setForm(p => ({ ...p, interfaceThemeId: themeId }))}
              label="Default Exam Interface"
            />

            {/* Featured toggle */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium text-sm">Featured Category</div>
                <div className="text-xs text-[var(--text-secondary)]">Shown prominently on the platform homepage</div>
              </div>
              <Switch
                checked={form.isFeatured}
                onCheckedChange={val => setForm(p => ({ ...p, isFeatured: val }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button className="btn-primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {editingId ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ── */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              This will permanently delete this exam category and all its associated test series. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Delete Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
