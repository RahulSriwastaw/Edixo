import { API_URL } from "./api-config";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  contentHtml: string | null;
  excerpt: string | null;
  featuredImageUrl: string | null;
  featuredImageAlt: string | null;
  status: string;
  platform: string;
  author: {
    id: string;
    name: string;
    slug: string;
    photoUrl: string | null;
    bio: string | null;
  } | null;
  categories: Array<{
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
  tags: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
  seoTitle: string | null;
  seoDescription: string | null;
  focusKeyword: string | null;
  viewCount: number;
  readingTimeMin: number;
  publishedAt: string | null;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Public API - does not require authentication
export async function fetchPublicBlogPosts(params?: {
  platform?: string;
  page?: string;
  limit?: string;
}): Promise<{ posts: BlogPost[]; pagination: Pagination }> {
  const query = new URLSearchParams();
  query.set("status", "published");
  if (params?.platform) query.set("platform", params.platform);
  if (params?.page) query.set("page", params.page);
  if (params?.limit) query.set("limit", params.limit);

  const res = await fetch(`${API_URL}/blog/posts?${query}`);
  if (!res.ok) throw new Error("Failed to fetch blog posts");
  return res.json();
}

export async function fetchPublicBlogPost(slug: string): Promise<{ post: BlogPost }> {
  const res = await fetch(`${API_URL}/blog/posts/${slug}`);
  if (!res.ok) throw new Error("Failed to fetch blog post");
  return res.json();
}