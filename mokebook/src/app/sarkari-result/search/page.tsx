"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";
import {
  ArrowLeft,
  Search,
  Loader2,
  Calendar,
  ChevronRight,
} from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  postType: string;
  featuredImageUrl?: string;
  publishedAt?: string;
  category?: { name: string };
  organization?: string;
  applicationEndDate?: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) {
      setPosts([]);
      return;
    }
    setLoading(true);
    fetch(
      `${API_BASE_URL}/sarkari/posts?search=${encodeURIComponent(q)}&page=1&limit=20`,
    )
      .then((r) => r.json())
      .then((d) => setPosts(d.posts || []))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <Link
          href="/sarkari-result"
          className="inline-flex items-center text-sm text-blue-600 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Link>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Search Results for "{q}"
        </h1>
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((p) => (
              <Link
                key={p.id}
                href={`/sarkari-result/posts/${p.slug}`}
                className="block bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 hover:border-blue-500 hover:shadow-md transition-all"
              >
                <div className="flex flex-wrap gap-2 mb-2">
                  {p.category && (
                    <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                      {p.category.name}
                    </span>
                  )}
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                    {p.postType}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {p.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                  {p.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {p.publishedAt
                      ? new Date(p.publishedAt).toLocaleDateString("en-IN")
                      : "N/A"}
                  </span>
                  <span className="text-blue-600 font-medium flex items-center gap-0.5">
                    View <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
            {posts.length === 0 && !loading && (
              <p className="text-center text-gray-500 py-20">
                No results found. Try a different search term.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
