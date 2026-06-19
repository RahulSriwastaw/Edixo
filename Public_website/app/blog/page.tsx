"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { User, Calendar, ArrowRight, Clock, Loader2 } from "lucide-react";
import { fetchPublicBlogPosts, BlogPost } from "@/lib/blog-service";

const categoryIcons: Record<string, string> = {
  "Exam Strategy": "📚",
  "Mathematics": "🔢",
  "Education Technology": "💻",
  "Exam Tips": "🎯",
  "Technology": "⚡",
  "Rankings": "🏆",
  "News": "📰",
  "Study Material": "📖",
  "Success Stories": "⭐",
};

export default function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All Posts");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const { posts: data, pagination } = await fetchPublicBlogPosts({
          platform: "public_website",
          page: String(page),
          limit: "12",
        });
        setPosts(data);
        setTotalPages(pagination.totalPages);
      } catch (err) {
        console.error("Failed to load blog posts:", err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, [page]);

  // Get unique categories from posts
  const categories = ["All Posts", ...new Set(posts.flatMap(p => p.categories.map(c => c.category.name)))];

  const filteredPosts = selectedCategory === "All Posts"
    ? posts
    : posts.filter(p => p.categories.some(c => c.category.name === selectedCategory));

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1">
        {/* Hero Header */}
        <div className="bg-gradient-to-br from-primary-light to-white py-20 pt-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                EduHub Blog
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Insights, tips, and best practices for modern education
              </p>
            </div>
          </div>
        </div>

        {/* Blog Posts */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Category Filter */}
          <div className="flex gap-4 mb-12 overflow-x-auto pb-2">
            {["All Posts", "Exam Tips", "Technology", "Education Technology", "Study Material", "Success Stories"].map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setPage(1); }}
                className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-white"
                    : "bg-white text-gray-600 hover:bg-primary-light hover:text-primary border border-gray-200"
                }`}
              >
                {cat === "All Posts" ? "All Posts" : `${categoryIcons[cat] || "📄"} ${cat}`}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-gray-600">Loading posts...</span>
            </div>
          ) : (
            <>
              {/* Posts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-primary hover:shadow-xl transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="h-48 overflow-hidden bg-gray-100">
                      {post.featuredImageUrl ? (
                        <img
                          src={post.featuredImageUrl}
                          alt={post.featuredImageAlt || post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Category */}
                      {post.categories?.[0] && (
                        <span className="inline-block px-3 py-1 bg-primary-light text-primary text-sm font-semibold rounded-full mb-3">
                          {post.categories[0].category.name}
                        </span>
                      )}

                      {/* Title */}
                      <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {post.excerpt || post.content?.replace(/<[^>]*>/g, "").substring(0, 150) || ""}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {post.author?.name || "Admin"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(post.publishedAt)}
                          </span>
                        </div>
                      </div>

                      {/* Read More */}
                      <div className="mt-4 flex items-center text-primary font-semibold group-hover:gap-2 transition-all">
                        Read more
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Empty State */}
              {filteredPosts.length === 0 && !loading && (
                <div className="text-center py-20">
                  <p className="text-gray-500 text-lg">No posts found for this category.</p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-12">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-6 py-3 rounded-xl border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-6 py-3 rounded-xl border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}