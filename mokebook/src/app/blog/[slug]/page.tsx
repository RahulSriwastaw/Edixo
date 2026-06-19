"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";
import {
  ArrowLeft,
  Clock,
  Calendar,
  User,
  Loader2,
  Share2,
} from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  contentHtml: string | null;
  excerpt: string | null;
  featuredImageUrl: string | null;
  featuredImageAlt: string | null;
  author: { name: string; photoUrl: string | null; bio: string | null } | null;
  categories: Array<{ category: { name: string; slug: string } }>;
  tags: Array<{ tag: { name: string; slug: string } }>;
  publishedAt: string | null;
  readingTimeMin: number;
}

export default function MokebookBlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/blog/posts/${slug}`);
        const data = await res.json();
        if (data.success) {
          setPost(data.post);
        } else {
          setError("Post not found");
        }
      } catch (err) {
        setError("Failed to load post");
      } finally {
        setLoading(false);
      }
    };
    if (slug) loadPost();
  }, [slug]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="px-4 py-4">
          <Link href="/blog" className="inline-flex items-center text-blue-600 text-sm font-medium mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Blog
          </Link>
          <div className="text-center py-20">
            <p className="text-gray-500">{error || "Post not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 sticky top-0 z-10">
        <Link
          href="/blog"
          className="inline-flex items-center text-sm text-gray-600 dark:text-gray-300 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Link>
      </div>

      {/* Featured Image */}
      {post.featuredImageUrl && (
        <div className="h-56 overflow-hidden">
          <img
            src={post.featuredImageUrl}
            alt={post.featuredImageAlt || post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Category */}
        {post.categories?.[0] && (
          <span className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full mb-3">
            {post.categories[0].category.name}
          </span>
        )}

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2 mb-4 leading-tight">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
          {post.author && (
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {post.author.name}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {formatDate(post.publishedAt)}
          </span>
          {post.readingTimeMin > 0 && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {post.readingTimeMin} min read
            </span>
          )}
        </div>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-6 font-medium border-l-4 border-blue-500 pl-4">
            {post.excerpt}
          </p>
        )}

        {/* Article Content */}
        <article
          className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 prose-img:rounded-xl"
        >
          <div
            dangerouslySetInnerHTML={{
              __html: post.contentHtml || post.content || "",
            }}
          />
        </article>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <span
                  key={t.tag.slug}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full"
                >
                  #{t.tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Share Button */}
        <div className="mt-6">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: post.title,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}