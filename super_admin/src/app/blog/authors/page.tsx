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
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  fetchBlogAuthors,
  createBlogAuthor,
  updateBlogAuthor,
  deleteBlogAuthor,
  BlogAuthor,
} from "@/services/blogService";

export default function BlogAuthorsPage() {
  const { isOpen } = useSidebarStore();
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<BlogAuthor | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "", bio: "", email: "", photoUrl: "" });

  const loadAuthors = async () => {
    try {
      setLoading(true);
      const { authors } = await fetchBlogAuthors();
      setAuthors(authors);
    } catch (err: any) {
      toast.error(err.message || "Failed to load authors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAuthors(); }, []);

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const openCreateDialog = () => {
    setEditingAuthor(null);
    setFormData({ name: "", slug: "", bio: "", email: "", photoUrl: "" });
    setDialogOpen(true);
  };

  const openEditDialog = (author: BlogAuthor) => {
    setEditingAuthor(author);
    setFormData({
      name: author.name,
      slug: author.slug,
      bio: author.bio || "",
      email: author.email || "",
      photoUrl: author.photoUrl || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast.error("Name and slug are required");
      return;
    }
    try {
      if (editingAuthor) {
        await updateBlogAuthor(editingAuthor.id, formData);
        toast.success("Author updated");
      } else {
        await createBlogAuthor(formData);
        toast.success("Author created");
      }
      setDialogOpen(false);
      loadAuthors();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deactivate this author?")) return;
    try {
      await deleteBlogAuthor(id);
      toast.success("Author deactivated");
      loadAuthors();
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
                  <h1 className="text-2xl font-bold text-[var(--text-primary)]">Blog Authors</h1>
                  <p className="text-[var(--text-secondary)] text-sm mt-1">Manage blog post authors</p>
                </div>
              </div>
              <Button className="bg-[#FF6B2B] hover:bg-[#e55a1f] text-white" onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add Author
              </Button>
            </div>

            {/* Authors Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[var(--bg-main)]">
                      <TableHead className="text-xs font-semibold uppercase">Name</TableHead>
                      <TableHead className="text-xs font-semibold uppercase">Slug</TableHead>
                      <TableHead className="text-xs font-semibold uppercase">Email</TableHead>
                      <TableHead className="text-xs font-semibold uppercase">Posts</TableHead>
                      <TableHead className="text-xs font-semibold uppercase">Status</TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-[var(--text-secondary)]">Loading...</TableCell></TableRow>
                    ) : authors.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-[var(--text-secondary)]">No authors yet</TableCell></TableRow>
                    ) : (
                      authors.map((author) => (
                        <TableRow key={author.id} className="hover:bg-brand-primary-tint">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#FF6B2B]/10 flex items-center justify-center text-[#FF6B2B] text-sm font-semibold">
                                {author.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-[var(--text-primary)]">{author.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-[var(--text-secondary)] mono">/{author.slug}</TableCell>
                          <TableCell className="text-sm text-[var(--text-secondary)]">{author.email || "—"}</TableCell>
                          <TableCell className="text-sm text-[var(--text-primary)] font-medium">{author.postCount}</TableCell>
                          <TableCell>
                            <Badge className={author.isActive ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-600"}>
                              {author.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEditDialog(author)}>
                                <Edit className="w-3 h-3 mr-1" /> Edit
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(author.id)}>
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
            <DialogTitle>{editingAuthor ? "Edit Author" : "Create Author"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: editingAuthor ? formData.slug : generateSlug(e.target.value) })}
                placeholder="Author name"
                className="input-field"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug *</Label>
              <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="input-field mono" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="author@example.com" className="input-field" />
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className="input-field" />
            </div>
            <div className="space-y-2">
              <Label>Photo URL</Label>
              <Input value={formData.photoUrl} onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })} placeholder="https://example.com/photo.jpg" className="input-field" />
              {formData.photoUrl && (
                <div className="mt-2 w-16 h-16 rounded-full overflow-hidden border">
                  <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="bg-[#FF6B2B] hover:bg-[#e55a1f] text-white" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              {editingAuthor ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}