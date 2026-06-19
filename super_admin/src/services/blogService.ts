"use client";

import { API_URL, getAuthHeaders } from "@/lib/api-config";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  contentHtml: string | null;
  contentText: string | null;
  excerpt: string | null;
  featuredImageUrl: string | null;
  contentType: string;
  status: string;
  platform: string;
  authorId: string;
  author: { id: string; name: string; slug: string; photoUrl: string | null };
  categories: Array<{ category: { id: string; name: string; slug: string } }>;
  tags: Array<{ tag: { id: string; name: string; slug: string } }>;
  seoTitle: string | null;
  seoDescription: string | null;
  focusKeyword: string | null;
  viewCount: number;
  publishedAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogAuthor {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  photoUrl: string | null;
  email: string | null;
  isActive: boolean;
  postCount: number;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const BASE_URL = `${API_URL}/blog`;

export async function fetchBlogPosts(params?: {
  status?: string;
  platform?: string;
  search?: string;
  page?: string;
  limit?: string;
}): Promise<{ posts: BlogPost[]; pagination: Pagination }> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.platform) query.set("platform", params.platform);
  if (params?.search) query.set("search", params.search);
  if (params?.page) query.set("page", params.page);
  if (params?.limit) query.set("limit", params.limit);

  const res = await fetch(`${BASE_URL}/posts?${query}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch blog posts");
  return res.json();
}

export async function fetchBlogPost(id: string): Promise<{ post: BlogPost }> {
  const res = await fetch(`${BASE_URL}/posts/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch blog post");
  return res.json();
}

export async function createBlogPost(data: Partial<BlogPost> & { title: string; slug: string; authorId: string }): Promise<{ post: BlogPost }> {
  const res = await fetch(`${BASE_URL}/posts`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create blog post");
  }
  return res.json();
}

export async function updateBlogPost(id: string, data: Partial<BlogPost>): Promise<{ post: BlogPost }> {
  const res = await fetch(`${BASE_URL}/posts/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update blog post");
  return res.json();
}

export async function deleteBlogPost(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/posts/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete blog post");
}

export async function fetchBlogAuthors(): Promise<{ authors: BlogAuthor[] }> {
  const res = await fetch(`${BASE_URL}/authors`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch authors");
  return res.json();
}

export async function createBlogAuthor(data: Partial<BlogAuthor> & { name: string; slug: string }): Promise<{ author: BlogAuthor }> {
  const res = await fetch(`${BASE_URL}/authors`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create author");
  return res.json();
}

export async function updateBlogAuthor(id: string, data: Partial<BlogAuthor>): Promise<{ author: BlogAuthor }> {
  const res = await fetch(`${BASE_URL}/authors/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update author");
  return res.json();
}

export async function deleteBlogAuthor(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/authors/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete author");
}

export async function fetchBlogCategories(): Promise<{ categories: BlogCategory[] }> {
  const res = await fetch(`${BASE_URL}/categories`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function createBlogCategory(data: Partial<BlogCategory> & { name: string; slug: string }): Promise<{ category: BlogCategory }> {
  const res = await fetch(`${BASE_URL}/categories`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create category");
  return res.json();
}

export async function updateBlogCategory(id: string, data: Partial<BlogCategory>): Promise<{ category: BlogCategory }> {
  const res = await fetch(`${BASE_URL}/categories/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update category");
  return res.json();
}

export async function deleteBlogCategory(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/categories/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete category");
}

export async function fetchBlogStats(): Promise<{ stats: { totalPosts: number; publishedPosts: number; draftPosts: number; totalAuthors: number; totalCategories: number; totalTags: number } }> {
  const res = await fetch(`${BASE_URL}/stats`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}