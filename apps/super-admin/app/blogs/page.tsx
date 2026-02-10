'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Filter, Loader2, Eye, Edit, Trash2, Calendar, TrendingUp } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import BlogEditor from '../../components/blogs/BlogEditor';
import { supabase } from '../../lib/supabase';

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: string;
  category: string;
  tags: string[];
  view_count: number;
  published_at: string;
  created_at: string;
  author_id: string;
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'All Status') {
        query = query.eq('status', statusFilter.toLowerCase());
      }

      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBlogs(data || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [statusFilter, search]);

  const handleDeleteBlog = async (blogId: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', blogId);

      if (error) throw error;
      fetchBlogs();
      alert('Blog deleted successfully.');
    } catch (error: any) {
      alert('Error deleting blog: ' + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      published: 'bg-emerald-100 text-emerald-700',
      draft: 'bg-amber-100 text-amber-700',
      archived: 'bg-slate-100 text-slate-700',
    };
    return colors[status as keyof typeof colors] || 'bg-slate-100 text-slate-700';
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Blogs & SEO</h1>
            <p className="text-slate-500 mt-2">Manage public website content and SEO settings.</p>
          </div>
          <button
            onClick={() => {
              setSelectedBlog(null);
              setIsEditorOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-indigo-200"
          >
            <Plus size={20} />
            New Blog Post
          </button>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-slate-500 text-sm font-medium mb-1">Total Posts</p>
            <p className="text-3xl font-bold text-slate-900">{blogs.length}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-slate-500 text-sm font-medium mb-1">Published</p>
            <p className="text-3xl font-bold text-emerald-600">
              {blogs.filter(b => b.status === 'published').length}
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-slate-500 text-sm font-medium mb-1">Drafts</p>
            <p className="text-3xl font-bold text-amber-600">
              {blogs.filter(b => b.status === 'draft').length}
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-slate-500 text-sm font-medium mb-1">Total Views</p>
            <p className="text-3xl font-bold text-blue-600">
              {blogs.reduce((sum, b) => sum + (b.view_count || 0), 0)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search blog posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 rounded-xl bg-slate-50 border-none outline-none text-slate-600 font-medium"
            >
              <option>All Status</option>
              <option>Published</option>
              <option>Draft</option>
              <option>Archived</option>
            </select>
          </div>
        </div>

        {/* Blog List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
          </div>
        ) : (
          <div className="space-y-4">
            {blogs.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center">
                <FileText className="mx-auto text-slate-300 mb-4" size={48} />
                <h3 className="text-lg font-bold text-slate-900">No blog posts found</h3>
                <p className="text-slate-500 mb-6">Get started by creating your first blog post.</p>
                <button
                  onClick={() => setIsEditorOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium inline-flex items-center gap-2 transition-colors"
                >
                  <Plus size={18} />
                  Create Blog Post
                </button>
              </div>
            ) : (
              blogs.map((blog) => (
                <div
                  key={blog.id}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-slate-900">{blog.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusBadge(blog.status)}`}>
                          {blog.status}
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm mb-4 line-clamp-2">{blog.excerpt || 'No excerpt available'}</p>
                      <div className="flex items-center gap-6 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          {new Date(blog.created_at).toLocaleDateString()}
                        </span>
                        {blog.category && (
                          <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-medium">
                            {blog.category}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <TrendingUp size={14} />
                          {blog.view_count || 0} views
                        </span>
                      </div>
                      {blog.tags && blog.tags.length > 0 && (
                        <div className="flex gap-2 mt-3">
                          {blog.tags.map((tag, idx) => (
                            <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-6">
                      <button
                        onClick={() => {
                          setSelectedBlog(blog);
                          setIsEditorOpen(true);
                        }}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit Blog"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteBlog(blog.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Blog"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <BlogEditor
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setSelectedBlog(null);
          }}
          blog={selectedBlog}
          onSuccess={() => {
            fetchBlogs();
            setIsEditorOpen(false);
            setSelectedBlog(null);
          }}
        />
      </div>
    </DashboardLayout>
  );
}
