"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import { ArrowLeft, Plus, Loader2, Briefcase, FileText, Ticket, ClipboardList, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { toast } from "sonner";

interface Stat { label: string; value: number; href: string; icon: any; color: string; }
interface Post { id: string; title: string; slug: string; postType: string; status: string; publishedAt?: string; category?: { name: string }; }

export default function SarkariDashboard() {
  const { isOpen } = useSidebarStore();
  const [stats, setStats] = useState<Stat[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/sarkari/stats`).then(r => r.json()).then(d => d.stats),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/sarkari/posts?page=1&limit=10`).then(r => r.json()).then(d => d.posts),
    ]).then(([s, posts]) => {
      setStats([
        { label: "Total Jobs", value: s.jobs ?? 0, href: "/sarkari-result/posts?postType=job", icon: Briefcase, color: "bg-blue-600" },
        { label: "Results", value: s.results ?? 0, href: "/sarkari-result/posts?postType=result", icon: FileText, color: "bg-indigo-600" },
        { label: "Admit Cards", value: s.admitCards ?? 0, href: "/sarkari-result/posts?postType=admit_card", icon: Ticket, color: "bg-purple-600" },
        { label: "Answer Keys", value: s.answerKeys ?? 0, href: "/sarkari-result/posts?postType=answer_key", icon: ClipboardList, color: "bg-pink-600" },
        { label: "Admissions", value: s.admissions ?? 0, href: "/sarkari-result/posts?postType=admission", icon: GraduationCap, color: "bg-teal-600" },
      ]);
      setRecentPosts(posts || []);
    }).catch(() => toast.error("Failed to load data")).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "md:ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-4 lg:p-5">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">Sarkari Result Management</h1>
                <p className="text-[var(--text-secondary)] text-sm mt-1">Manage government jobs, results, admit cards, and admissions</p>
              </div>
              <Link href="/sarkari-result/new"><Button className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white"><Plus className="w-4 h-4 mr-2" />New Post</Button></Link>
            </div>

            {/* Stats */}
            {loading ? <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div> : (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {stats.map(s => (
                  <Link key={s.href} href={s.href}>
                    <Card className="hover:shadow-md transition-all cursor-pointer border-0">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                          <s.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
                          <p className="text-xl font-extrabold text-[var(--text-primary)]">{s.value}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {/* Recent Posts */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Recent Posts</CardTitle></CardHeader>
              <CardContent>
                {loading ? <p className="text-sm text-[var(--text-muted)]">Loading...</p> : recentPosts.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)] text-center py-6">No posts yet. Create your first post.</p>
                ) : (
                  <div className="space-y-3">
                    {recentPosts.map(p => (
                      <Link key={p.id} href={`/sarkari-result/posts/${p.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--bg-main)] transition-colors">
                        <div>
                          <p className="text-sm font-medium text-[var(--text-primary)] line-clamp-1">{p.title}</p>
                          <p className="text-xs text-[var(--text-muted)]">{p.category?.name} • {p.postType}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${p.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{p.status}</span>
                      </Link>
                    ))}
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