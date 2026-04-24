"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Users,
  Edit,
  Trash2,
  Search,
  Linkedin,
  Twitter,
  Mail,
  Globe,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface Author {
  id: string;
  name: string;
  slug: string;
  title?: string;
  bio?: string;
  photoUrl?: string;
  email?: string;
  linkedinUrl?: string;
  twitterHandle?: string;
  expertise?: string;
  credentials?: string;
  yearsExperience?: number;
  role: string;
  isActive: boolean;
  postCount: number;
}

const roleOptions = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'author', label: 'Author' },
  { value: 'contributor', label: 'Contributor' },
  { value: 'reviewer', label: 'Reviewer' },
];

export default function AuthorsPage() {
    const { isOpen } = useSidebarStore();
const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    title: '',
    bio: '',
    photoUrl: '',
    email: '',
    linkedinUrl: '',
    twitterHandle: '',
    expertise: '',
    credentials: '',
    yearsExperience: '',
    role: 'author',
    isActive: true,
  });

  // Fetch authors
  const fetchAuthors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/blog/authors');
      if (res.ok) {
        const data = await res.json();
        setAuthors(data.authors || []);
      }
    } catch (error) {
      console.error('Error fetching authors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
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
  const handleOpenDialog = (author?: Author) => {
    if (author) {
      setEditingAuthor(author);
      setFormData({
        name: author.name,
        slug: author.slug,
        title: author.title || '',
        bio: author.bio || '',
        photoUrl: author.photoUrl || '',
        email: author.email || '',
        linkedinUrl: author.linkedinUrl || '',
        twitterHandle: author.twitterHandle || '',
        expertise: author.expertise || '',
        credentials: author.credentials || '',
        yearsExperience: author.yearsExperience?.toString() || '',
        role: author.role,
        isActive: author.isActive,
      });
    } else {
      setEditingAuthor(null);
      setFormData({
        name: '',
        slug: '',
        title: '',
        bio: '',
        photoUrl: '',
        email: '',
        linkedinUrl: '',
        twitterHandle: '',
        expertise: '',
        credentials: '',
        yearsExperience: '',
        role: 'author',
        isActive: true,
      });
    }
    setShowDialog(true);
  };

  // Save author
  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast.error('Name is required');
      return;
    }

    try {
      const url = editingAuthor
        ? `/api/blog/authors/${editingAuthor.id}`
        : '/api/blog/authors';
      
      const method = editingAuthor ? 'PUT' : 'POST';

      // Parse expertise and credentials as arrays
      const expertise = formData.expertise.split(',').map(e => e.trim()).filter(Boolean);
      const credentials = formData.credentials.split(',').map(c => c.trim()).filter(Boolean);

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          yearsExperience: formData.yearsExperience ? parseInt(formData.yearsExperience) : null,
          expertise,
          credentials,
        }),
      });

      if (res.ok) {
        toast.success(editingAuthor ? 'Author updated' : 'Author created');
        setShowDialog(false);
        fetchAuthors();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to save author');
      }
    } catch (error) {
      toast.error('Failed to save author');
    }
  };

  // Delete author
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This author\'s posts will need to be reassigned.')) return;

    try {
      const res = await fetch(`/api/blog/authors/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Author deleted');
        fetchAuthors();
      } else {
        toast.error('Cannot delete author with posts');
      }
    } catch (error) {
      toast.error('Failed to delete author');
    }
  };

  // Filter authors
  const filteredAuthors = authors.filter(author => {
    const matchesSearch = author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      author.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || author.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Role badge
  const RoleBadge = ({ role }: { role: string }) => {
    const styles: Record<string, string> = {
      super_admin: 'bg-red-50 text-red-700',
      editor: 'bg-purple-50 text-purple-700',
      author: 'bg-blue-50 text-blue-700',
      contributor: 'bg-green-50 text-green-700',
      reviewer: 'bg-yellow-50 text-yellow-700',
    };
    const labels: Record<string, string> = {
      super_admin: 'Super Admin',
      editor: 'Editor',
      author: 'Author',
      contributor: 'Contributor',
      reviewer: 'Reviewer',
    };
    return (
      <span className={`badge text-xs ${styles[role] || styles.author}`}>
        {labels[role] || role}
      </span>
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
                  <h1 className="text-2xl font-bold text-[var(--text-primary)]">Authors</h1>
                  <p className="text-[var(--text-secondary)] text-sm">Manage blog authors and contributors</p>
                </div>
              </div>
              <Button className="btn-primary" onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Author
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="text-sm text-[var(--text-secondary)]">Total Authors</div>
                  <div className="text-2xl font-bold text-[var(--text-primary)]">{authors.length}</div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="text-sm text-[var(--text-secondary)]">Active</div>
                  <div className="text-2xl font-bold text-green-600">
                    {authors.filter(a => a.isActive).length}
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="text-sm text-[var(--text-secondary)]">Total Posts</div>
                  <div className="text-2xl font-bold text-[var(--text-primary)]">
                    {authors.reduce((sum, a) => sum + a.postCount, 0)}
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="text-sm text-[var(--text-secondary)]">With Posts</div>
                  <div className="text-2xl font-bold text-[var(--text-primary)]">
                    {authors.filter(a => a.postCount > 0).length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="relative flex-1 max-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <Input
                      placeholder="Search authors..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 input-field"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[150px] input-field">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {roleOptions.map((role) => (
                        <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Authors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                <div className="col-span-full p-8 text-center text-[var(--text-secondary)]">Loading...</div>
              ) : filteredAuthors.length === 0 ? (
                <div className="col-span-full p-8 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-medium text-[var(--text-primary)] mb-1">No authors found</h3>
                  <p className="text-[var(--text-secondary)] text-sm mb-4">
                    {searchQuery ? 'Try a different search' : 'Add your first author'}
                  </p>
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Author
                  </Button>
                </div>
              ) : (
                filteredAuthors.map((author) => (
                  <Card key={author.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-[var(--bg-main)] flex items-center justify-center overflow-hidden flex-shrink-0">
                          {author.photoUrl ? (
                            <img src={author.photoUrl} alt={author.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl font-bold text-[var(--text-muted)]">
                              {author.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-[var(--text-primary)] truncate">{author.name}</h3>
                            {!author.isActive && (
                              <Badge variant="secondary" className="text-xs">Inactive</Badge>
                            )}
                          </div>
                          {author.title && (
                            <p className="text-sm text-[var(--text-secondary)] truncate">{author.title}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <RoleBadge role={author.role} />
                            <span className="text-xs text-[var(--text-muted)]">
                              {author.postCount} posts
                            </span>
                          </div>
                        </div>
                      </div>

                      {author.bio && (
                        <p className="text-sm text-[var(--text-secondary)] mt-3 line-clamp-2">{author.bio}</p>
                      )}

                      <div className="flex items-center gap-3 mt-3 pt-3 border-t">
                        {author.linkedinUrl && (
                          <a href={author.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--text-muted)] hover:text-blue-600">
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                        {author.twitterHandle && (
                          <a href={`https://twitter.com/${author.twitterHandle}`} target="_blank" rel="noopener noreferrer" className="text-[var(--text-muted)] hover:text-blue-400">
                            <Twitter className="w-4 h-4" />
                          </a>
                        )}
                        {author.email && (
                          <a href={`mailto:${author.email}`} className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
                            <Mail className="w-4 h-4" />
                          </a>
                        )}
                        <div className="flex-1" />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(author)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(author.id)}
                          disabled={author.postCount > 0}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAuthor ? 'Edit Author' : 'Add Author'}</DialogTitle>
            <DialogDescription>
              {editingAuthor ? 'Update author profile' : 'Create a new author profile'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Full name"
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Job Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Senior Education Writer"
                  className="input-field mt-1"
                />
              </div>
              <div>
                <Label>Role</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                  <SelectTrigger className="input-field mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Bio</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Brief author biography..."
                className="input-field mt-1"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Photo URL</Label>
                <Input
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  placeholder="https://..."
                  className="input-field mt-1"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="author@example.com"
                  className="input-field mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>LinkedIn URL</Label>
                <Input
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  className="input-field mt-1"
                />
              </div>
              <div>
                <Label>Twitter Handle</Label>
                <Input
                  value={formData.twitterHandle}
                  onChange={(e) => setFormData({ ...formData, twitterHandle: e.target.value })}
                  placeholder="@username"
                  className="input-field mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Years of Experience</Label>
                <Input
                  type="number"
                  value={formData.yearsExperience}
                  onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
                  placeholder="e.g., 5"
                  className="input-field mt-1"
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-[var(--border-input)]"
                  />
                  <span className="text-sm">Active</span>
                </label>
              </div>
            </div>

            <div>
              <Label>Expertise (comma separated)</Label>
              <Input
                value={formData.expertise}
                onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                placeholder="e.g., JEE Preparation, NEET, Board Exams"
                className="input-field mt-1"
              />
            </div>

            <div>
              <Label>Credentials (comma separated)</Label>
              <Input
                value={formData.credentials}
                onChange={(e) => setFormData({ ...formData, credentials: e.target.value })}
                placeholder="e.g., M.Tech IIT Delhi, B.Ed"
                className="input-field mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button className="btn-primary" onClick={handleSave}>
              {editingAuthor ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
