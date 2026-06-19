"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";
import { ArrowLeft, Loader2, Calendar, ChevronRight } from "lucide-react";

interface Post { id: string; title: string; slug: string; excerpt: string; postType: string; featuredImageUrl?: string; publishedAt?: string; category?: { name: string }; organization?: string; applicationEndDate?: string; }

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [posts, setPosts] = useState<Post[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/sarkari/posts?page=1&limit=20`).then(r => r.json()),
      fetch(`${API_BASE_URL}/sarkari/categories`).then(r => r.json()).then(d => d.categories.find((c: any) => c.slug === slug)),
    ]).then(([data, cat]) => {
      setPosts(data.posts || []);
      setCategory(cat);
    }).finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <Link href="/sarkari-result" className="inline-flex items-center text-sm text-blue-600 font-medium"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Link>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6">{category?.name || slug.replace(/-/g, " ").toUpperCase()}</h1>
        {loading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map(p => (
              <Link key={p.id} href={`/sarkari-result/jobs/${p.slug}`} className="block bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 hover:border-blue-500 hover:shadow-md transition-all">
                {p.featuredImageUrl && <img src={p.featuredImageUrl} alt={p.title} className="w-full h-36 object-cover rounded-xl mb-3" />}
                <div className="flex flex-wrap gap-2 mb-2">
                  {p.category && <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">{p.category.name}</span>}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2">{p.title}</h3>
                {p.organization && <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{p.organization}</p>}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{p.applicationEndDate ? new Date(p.applicationEndDate).toLocaleDateString("en-IN") : "N/A"}</span>
                  <span className="text-xs text-blue-600 font-medium flex items-center gap-0.5">View <ChevronRight className="w-3 h-3" /></span>
                </div>
              </Link>
            ))}
          </div>
        )}
        {!loading && posts.length === 0 && <p className="text-center text-gray-500 py-20">No posts found.</p>}
      </div>
    </div>
  );
}