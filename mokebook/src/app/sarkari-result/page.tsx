"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";
import { Search, Briefcase, FileText, Ticket, ClipboardList, GraduationCap, BookOpen, Loader2, ChevronRight, Calendar, Bell } from "lucide-react";

interface Post { id: string; title: string; slug: string; excerpt: string; postType: string; featuredImageUrl?: string; publishedAt?: string; category?: { name: string; color?: string }; organization?: string; stateName?: string; qualification?: string; applicationEndDate?: string; }

export default function SarkariResultHome() {
  const [stats, setStats] = useState<any>(null);
  const [jobs, setJobs] = useState<Post[]>([]);
  const [results, setResults] = useState<Post[]>([]);
  const [admitCards, setAdmitCards] = useState<Post[]>([]);
  const [answerKeys, setAnswerKeys] = useState<Post[]>([]);
  const [admissions, setAdmissions] = useState<Post[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/sarkari/stats`).then(r => r.json()).then(d => d.stats),
      fetch(`${API_BASE_URL}/sarkari/posts?postType=job&page=1&limit=6`).then(r => r.json()).then(d => d.posts),
      fetch(`${API_BASE_URL}/sarkari/posts?postType=result&page=1&limit=6`).then(r => r.json()).then(d => d.posts),
      fetch(`${API_BASE_URL}/sarkari/posts?postType=admit_card&page=1&limit=6`).then(r => r.json()).then(d => d.posts),
      fetch(`${API_BASE_URL}/sarkari/posts?postType=answer_key&page=1&limit=6`).then(r => r.json()).then(d => d.posts),
      fetch(`${API_BASE_URL}/sarkari/posts?postType=admission&page=1&limit=6`).then(r => r.json()).then(d => d.posts),
      fetch(`${API_BASE_URL}/sarkari/categories`).then(r => r.json()).then(d => d.categories),
    ]).then(([s, j, r, ac, ak, adm, cats]) => {
      setStats(s);
      setJobs(j);
      setResults(r);
      setAdmitCards(ac);
      setAnswerKeys(ak);
      setAdmissions(adm);
      setCategories(cats);
    }).finally(() => setLoading(false));
  }, []);

  const QuickCard = ({ icon: Icon, title, count, href, color }: { icon: any, title: string, count: number, href: string, color: string }) => (
    <Link href={href} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">{title}</h3>
      <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{count ?? 0}</p>
    </Link>
  );

  const JobCard = ({ post }: { post: Post }) => (
    <Link href={`/sarkari-result/jobs/${post.slug}`} className="block bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 hover:border-blue-500 hover:shadow-md transition-all">
      {post.featuredImageUrl && <img src={post.featuredImageUrl} alt={post.title} className="w-full h-36 object-cover rounded-xl mb-3" />}
      <div className="flex flex-wrap gap-2 mb-2">
        {post.category && <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">{post.category.name}</span>}
        {post.stateName && <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">{post.stateName}</span>}
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2">{post.title}</h3>
      {post.organization && <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{post.organization}</p>}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{post.applicationEndDate ? new Date(post.applicationEndDate).toLocaleDateString("en-IN") : "N/A"}</span>
        <span className="text-xs text-blue-600 font-medium flex items-center gap-0.5">View <ChevronRight className="w-3 h-3" /></span>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Search Bar */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm">
        <div className="max-w-2xl mx-auto flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search Jobs, Results, Admit Cards..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700">Search</button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white px-4 py-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">MokeBook Sarkari Result</h1>
          <p className="text-blue-100 text-lg mb-5">Latest Government Jobs, Results, Admit Cards & Exam Updates</p>
          {stats && <div className="grid grid-cols-5 gap-3 text-center">
            <div><p className="text-xl font-bold">{stats.jobs ?? 0}</p><p className="text-xs text-blue-200">Jobs</p></div>
            <div><p className="text-xl font-bold">{stats.results ?? 0}</p><p className="text-xs text-blue-200">Results</p></div>
            <div><p className="text-xl font-bold">{stats.admitCards ?? 0}</p><p className="text-xs text-blue-200">Admit Cards</p></div>
            <div><p className="text-xl font-bold">{stats.answerKeys ?? 0}</p><p className="text-xs text-blue-200">Answer Keys</p></div>
            <div><p className="text-xl font-bold">{stats.admissions ?? 0}</p><p className="text-xs text-blue-200">Admissions</p></div>
          </div>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        {/* Quick Access Cards */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-blue-600" /> Quick Access</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            <QuickCard icon={Briefcase} title="Latest Jobs" count={stats?.jobs} href="/sarkari-result/category/latest-jobs" color="bg-blue-600" />
            <QuickCard icon={FileText} title="Results" count={stats?.results} href="/sarkari-result/category/results" color="bg-indigo-600" />
            <QuickCard icon={Ticket} title="Admit Card" count={stats?.admitCards} href="/sarkari-result/category/admit-card" color="bg-purple-600" />
            <QuickCard icon={ClipboardList} title="Answer Key" count={stats?.answerKeys} href="/sarkari-result/category/answer-key" color="bg-pink-600" />
            <QuickCard icon={GraduationCap} title="Admission" count={stats?.admissions} href="/sarkari-result/category/admission" color="bg-teal-600" />
            <QuickCard icon={BookOpen} title="Syllabus" count={0} href="/sarkari-result/category/syllabus" color="bg-orange-600" />
          </div>
        </section>

        {/* Latest Government Jobs */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Briefcase className="w-5 h-5 text-blue-600" /> Latest Government Jobs</h2>
            <Link href="/sarkari-result/category/latest-jobs" className="text-sm text-blue-600 font-medium">View All →</Link>
          </div>
          {loading ? <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map(j => <JobCard key={j.id} post={j} />)}
            </div>
          )}
        </section>

        {/* Latest Results */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-600" /> Latest Results</h2>
            <Link href="/sarkari-result/category/results" className="text-sm text-blue-600 font-medium">View All →</Link>
          </div>
          {loading ? <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map(r => <JobCard key={r.id} post={r} />)}
            </div>
          )}
        </section>

        {/* Latest Admit Cards */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Ticket className="w-5 h-5 text-purple-600" /> Latest Admit Cards</h2>
            <Link href="/sarkari-result/category/admit-card" className="text-sm text-blue-600 font-medium">View All →</Link>
          </div>
          {loading ? <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-purple-600" /></div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{admitCards.map(a => <JobCard key={a.id} post={a} />)}</div>
          )}
        </section>

        {/* Answer Keys */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><ClipboardList className="w-5 h-5 text-pink-600" /> Answer Keys</h2>
            <Link href="/sarkari-result/category/answer-key" className="text-sm text-blue-600 font-medium">View All →</Link>
          </div>
          {loading ? <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-pink-600" /></div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{answerKeys.map(a => <JobCard key={a.id} post={a} />)}</div>
          )}
        </section>

        {/* Admissions */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><GraduationCap className="w-5 h-5 text-teal-600" /> Admissions</h2>
            <Link href="/sarkari-result/category/admission" className="text-sm text-blue-600 font-medium">View All →</Link>
          </div>
          {loading ? <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-teal-600" /></div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{admissions.map(a => <JobCard key={a.id} post={a} />)}</div>
          )}
        </section>

        {/* Categories */}
        {categories.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-orange-600" /> Browse Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {categories.map(cat => (
                <Link key={cat.id} href={`/sarkari-result/category/${cat.slug}`} className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:shadow-md transition-all">
                  <div className="text-2xl mb-1">{cat.icon || "📄"}</div>
                  <p className="text-xs font-medium text-gray-900 dark:text-white line-clamp-2">{cat.name}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-center py-6 text-sm">
        <p>© 2026 MokeBook Sarkari Result. All rights reserved.</p>
        <p className="mt-1">Latest Government Jobs, Results, Admit Cards & Exam Updates</p>
      </footer>
    </div>
  );
}