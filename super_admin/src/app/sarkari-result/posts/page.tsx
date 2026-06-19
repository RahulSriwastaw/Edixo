"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import { ArrowLeft, Plus, Search, Loader2, Edit, Trash2, Eye, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { toast } from "sonner";

interface Post { id: string; title: string; slug: string; postType: string; status: string; publishedAt?: string; category?: { name: string }; viewCount: number; }

export default function PostsListPage() {
  const { isOpen } = useSidebarStore();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [postType, setPostType] = useState("");

  useEffect(() => {
    const url = new URL(window.location.href);
    const pt = url.searchParams.get("postType") || "";
    setPostType(pt);
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/sarkari/posts?postType=${pt}&page=1&limit=50`)
      .then(r => r.json()).then(d => setPosts(d.posts || [])).catch(() => toast.error("Failed to load")).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/sarkari/posts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Deleted");
      setPosts(posts.filter(p => p.id !== id));
    } catch { toast.error("Delete failed"); }
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "md:ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-4 lg:p-5">
          <div className="max-w-[1400px] mx-auto space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/sarkari-result"><ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" /></Link>
                <div><h1 className="text-2xl font-bold text-[var(--text-primary)]">Sarkari Posts</h1><p className="text-[var(--text-secondary)] text-sm mt-1">Manage jobs, results, admit cards, and more</p></div>
              </div>
              <Link href="/sarkari-result/new"><Button className="bg-[#2563EB] text-white"><Plus className="w-4 h-4 mr-2" />New Post</Button></Link>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts..." className="pl-9 input-field" />
                  </div>
                  <select value={postType} onChange={e => setPostType(e.target.value)} className="input-field h-10 rounded-lg border px-3 text-sm bg-white">
                    <option value="">All Types</option>
                    <option value="job">Job</option>
                    <option value="result">Result</option>
                    <option value="admit_card">Admit Card</option>
                    <option value="answer_key">Answer Key</option>
                    <option value="admission">Admission</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                {loading ? <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[var(--bg-main)] text-[var(--text-muted)]">
                        <tr>
                          <th className="p-3 font-medium">Title</th>
                          <th className="p-3 font-medium">Type</th>
                          <th className="p-3 font-medium">Category</th>
                          <th className="p-3 font-medium">Status</th>
                          <th className="p-3 font-medium">Views</th>
                          <th className="p-3 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {posts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.slug.includes(search.toLowerCase())).map(p => (
                          <tr key={p.id} className="hover:bg-brand-primary-tint">
                            <td className="p-3">
                              <Link href={`/sarkari-result/posts/${p.id}`} className="font-medium text-[var(--text-primary)] hover:text-[#2563EB]">{p.title}</Link>
                              <p className="text-xs text-[var(--text-muted)]">/{p.slug}</p>
                            </td>
                            <td className="p-3"><Badge className="bg-blue-50 text-blue-700">{p.postType}</Badge></td>
                            <td className="p-3 text-[var(--text-secondary)]">{p.category?.name || "—"}</td>
                            <td className="p-3">
                              <span className={`text-xs px-2 py-1 rounded-full ${p.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{p.status}</span>
                            </td>
                            <td className="p-3 text-[var(--text-secondary)]">{p.viewCount}</td>
                            <td className="p-3">
                              <div className="flex items-center justify-end gap-2">
                                <Link href={`/sarkari-result/posts/${p.id}`}><Button variant="outline" size="sm"><Eye className="w-3 h-3" /></Button></Link>
                                <Link href={`/sarkari-result/new?id=${p.id}`}><Button variant="outline" size="sm"><Edit className="w-3 h-3" /></Button></Link>
                                <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(p.id)}><Trash2 className="w-3 h-3" /></Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {posts.length === 0 && <p className="text-center py-10 text-[var(--text-muted)]">No posts yet.</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}