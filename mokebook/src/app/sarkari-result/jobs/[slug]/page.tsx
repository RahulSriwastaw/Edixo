"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";
import { ArrowLeft, Calendar, Clock, Share2, Printer, Loader2, ChevronRight } from "lucide-react";

interface Post { id: string; title: string; slug: string; content: string; excerpt: string; postType: string; featuredImageUrl?: string; publishedAt?: string; category?: { name: string }; organization?: string; stateName?: string; qualification?: string; applicationStartDate?: string; applicationEndDate?: string; examDate?: string; applicationFee?: any; ageLimit?: any; vacancyDetails?: any; eligibility?: any; selectionProcess?: any; howToApply?: string; importantLinks?: any; faqData?: any; importantDates?: any; viewCount?: number; }

export default function JobDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/sarkari/posts/${slug}`)
      .then(r => r.json())
      .then(d => { if (d.success) setPost(d.post); else setError("Post not found"); })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [slug]);

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "N/A";

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  if (error || !post) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><div className="text-center"><p className="text-red-500 mb-4">{error || "Post not found"}</p><Link href="/sarkari-result" className="text-blue-600">← Back to Home</Link></div></div>;

  const renderSection = (title: string, data: any, render: (item: any) => React.ReactNode): React.ReactNode => {
    if (!data) return null;
    const items = Array.isArray(data) ? data : [data];
    if (items.length === 0) return null;
    return (
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {items.map((item, i) => (
            <div key={i} className={`p-4 ${i > 0 ? 'border-t border-gray-200 dark:border-gray-700' : ''}`}>
              {render(item)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <Link href="/sarkari-result" className="inline-flex items-center text-sm text-blue-600 font-medium">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Link>
      </div>

      {/* Featured Image */}
      {post.featuredImageUrl && (
        <div className="h-56 md:h-72 overflow-hidden">
          <img src={post.featuredImageUrl} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Title & Meta */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-3">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            {post.category && <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">{post.category.name}</span>}
            {post.organization && <span className="text-sm">{post.organization}</span>}
            {post.stateName && <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">{post.stateName}</span>}
          </div>
        </div>

        {/* Share Buttons */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => navigator.share ? navigator.share({ title: post.title, url: window.location.href }) : navigator.clipboard.writeText(window.location.href)} className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg flex items-center gap-1">
            <Share2 className="w-3 h-3" /> Share
          </button>
          <button onClick={() => window.print()} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-lg flex items-center gap-1">
            <Printer className="w-3 h-3" /> Print
          </button>
        </div>

        {/* Important Dates */}
        {renderSection("Important Dates", post.importantDates, (item) => (
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900 dark:text-white">{item.event || item.title || "Event"}</span>
            <span className="text-blue-600 dark:text-blue-400 text-sm">{item.date ? formatDate(item.date) : "N/A"}</span>
          </div>
        ))}

        {/* Application Fee */}
        {renderSection("Application Fee", post.applicationFee, (item) => (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {typeof item === "string" ? item : JSON.stringify(item)}
          </div>
        ))}

        {/* Age Limit */}
        {renderSection("Age Limit", post.ageLimit, (item) => (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {typeof item === "string" ? item : JSON.stringify(item)}
          </div>
        ))}

        {/* Vacancy Details */}
        {renderSection("Vacancy Details", post.vacancyDetails, (item) => (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {typeof item === "string" ? item : JSON.stringify(item, null, 2)}
          </div>
        ))}

        {/* Eligibility */}
        {renderSection("Eligibility Criteria", post.eligibility, (item) => (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {typeof item === "string" ? item : JSON.stringify(item)}
          </div>
        ))}

        {/* Selection Process */}
        {renderSection("Selection Process", post.selectionProcess, (item) => (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {typeof item === "string" ? item : JSON.stringify(item)}
          </div>
        ))}

        {/* How To Apply */}
        {post.howToApply && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">How To Apply</h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {post.howToApply}
            </div>
          </div>
        )}

        {/* Important Links */}
        {post.importantLinks && post.importantLinks.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Important Links</h2>
            <div className="space-y-2">
              {post.importantLinks.map((link: any, i: number) => (
                <a key={i} href={link.url} target="_blank" className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-blue-600 dark:text-blue-400">{link.title || `Link ${i + 1}`}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* FAQ */}
        {post.faqData && post.faqData.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">FAQ</h2>
            <div className="space-y-3">
              {post.faqData.map((faq: any, i: number) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">{faq.question}</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full Content */}
        {post.content && (
          <div className="prose prose-sm dark:prose-invert max-w-none mb-8">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-center py-6 text-sm">
        <p>© 2026 MokeBook Sarkari Result. All rights reserved.</p>
      </footer>
    </div>
  );
}