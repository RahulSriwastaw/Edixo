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
  Layers,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: string;
  color?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
}

export default function CategoriesPage() {
  const { isOpen } = useSidebarStore();
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    type: "job",
    color: "#2563EB",
    icon: "",
    sortOrder: 0,
  });

  const loadCategories = () => {
    fetch("/api/sarkari/categories")
      .then((r) => r.json())
      .then((d) => setCats(d.categories || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      slug: "",
      description: "",
      type: "job",
      color: "#2563EB",
      icon: "",
      sortOrder: 0,
    });
    setOpen(true);
  };
  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description || "",
      type: c.type,
      color: c.color || "#2563EB",
      icon: c.icon || "",
      sortOrder: c.sortOrder,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name || !form.slug) return toast.error("Name and slug required");
    try {
      const url = `/api/sarkari/categories${editing ? `/${editing.id}` : ""}`;
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success(editing ? "Updated" : "Created");
      setOpen(false);
      loadCategories();
    } catch {
      toast.error("Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete category?")) return;
    try {
      const res = await fetch(`/api/sarkari/categories/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Deleted");
      setCats(cats.filter((c) => c.id !== id));
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div
        className={cn(
          "flex flex-col min-h-screen transition-all duration-300",
          isOpen ? "md:ml-60" : "ml-0",
        )}
      >
        <TopBar />
        <main className="flex-1 p-4 lg:p-5">
          <div className="max-w-[1400px] mx-auto space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/sarkari-result">
                  <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                    Categories
                  </h1>
                  <p className="text-[var(--text-secondary)] text-sm mt-1">
                    Manage post categories
                  </p>
                </div>
              </div>
              <Button className="bg-[#2563EB] text-white" onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[var(--bg-main)] text-[var(--text-muted)]">
                        <tr>
                          <th className="p-3 font-medium">Color</th>
                          <th className="p-3 font-medium">Name</th>
                          <th className="p-3 font-medium">Slug</th>
                          <th className="p-3 font-medium">Type</th>
                          <th className="p-3 font-medium text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {cats.map((c) => (
                          <tr
                            key={c.id}
                            className="hover:bg-brand-primary-tint"
                          >
                            <td className="p-3">
                              <div
                                className="w-6 h-6 rounded-full border"
                                style={{ backgroundColor: c.color || "#ccc" }}
                              />
                            </td>
                            <td className="p-3 font-medium text-[var(--text-primary)]">
                              {c.name}
                            </td>
                            <td className="p-3 mono text-xs text-[var(--text-muted)]">
                              /{c.slug}
                            </td>
                            <td className="p-3">
                              <Badge className="bg-gray-100 text-gray-700">
                                {c.type}
                              </Badge>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEdit(c)}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600"
                                  onClick={() => handleDelete(c.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {cats.length === 0 && (
                      <p className="text-center py-10 text-[var(--text-muted)]">
                        No categories yet
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Create"} Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                    slug: editing
                      ? form.slug
                      : e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/(^-|-$)/g, ""),
                  })
                }
                className="input-field"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="input-field mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="input-field"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="input-field h-10 rounded-lg border px-3 text-sm bg-white"
              >
                <option value="job">Job</option>
                <option value="result">Result</option>
                <option value="admit_card">Admit Card</option>
                <option value="answer_key">Answer Key</option>
                <option value="admission">Admission</option>
                <option value="syllabus">Syllabus</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="input-field flex-1 mono"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-[#2563EB] text-white" onClick={save}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
