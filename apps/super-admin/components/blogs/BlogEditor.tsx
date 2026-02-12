'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Eye, FileText, Tag, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Blog } from '../types';

interface BlogEditorProps {
    isOpen: boolean;
    onClose: () => void;
    blog: Blog | null;
    onSuccess: () => void;
}

export default function BlogEditor({ isOpen, onClose, blog, onSuccess }: BlogEditorProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category: '',
        tags: '',
        meta_title: '',
        meta_description: '',
        status: 'draft',
    });

    useEffect(() => {
        if (blog) {
            setFormData({
                title: blog.title,
                slug: blog.slug,
                excerpt: blog.excerpt || '',
                content: blog.content || '',
                category: blog.category || '',
                tags: blog.tags?.join(', ') || '',
                meta_title: blog.seo_meta?.meta_title || '',
                meta_description: blog.seo_meta?.meta_description || '',
                status: blog.status,
            });
        } else {
            setFormData({
                title: '',
                slug: '',
                excerpt: '',
                content: '',
                category: '',
                tags: '',
                meta_title: '',
                meta_description: '',
                status: 'draft',
            });
        }
    }, [blog]);

    if (!isOpen) return null;

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const handleTitleChange = (title: string) => {
        setFormData({
            ...formData,
            title,
            slug: generateSlug(title),
            meta_title: title,
        });
    };

    const handleSubmit = async (e: React.FormEvent, publishNow = false) => {
        e.preventDefault();
        setLoading(true);

        try {
            const tagsArray = formData.tags
                .split(',')
                .map(t => t.trim())
                .filter(t => t.length > 0);

            const blogData = {
                title: formData.title,
                slug: formData.slug,
                excerpt: formData.excerpt,
                content: formData.content,
                category: formData.category,
                tags: tagsArray,
                status: publishNow ? 'published' : formData.status,
                seo_meta: {
                    meta_title: formData.meta_title || formData.title,
                    meta_description: formData.meta_description || formData.excerpt,
                },
                published_at: publishNow ? new Date().toISOString() : null,
                updated_at: new Date().toISOString(),
            };

            if (blog) {
                // Update existing blog
                const { error } = await supabase
                    .from('blogs')
                    .update(blogData)
                    .eq('id', blog.id);

                if (error) throw error;
                alert('Blog updated successfully!');
            } else {
                // Create new blog
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) throw new Error('Not authenticated');

                const { data: user } = await supabase
                    .from('users')
                    .select('id')
                    .eq('auth_user_id', session.user.id)
                    .single();

                const { error } = await supabase
                    .from('blogs')
                    .insert([{
                        ...blogData,
                        author_id: user?.id,
                        view_count: 0,
                        created_at: new Date().toISOString(),
                    }]);

                if (error) throw error;
                alert('Blog created successfully!');
            }

            onSuccess();
        } catch (error: any) {
            alert('Error saving blog: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[95vh] overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                            <FileText className="text-white" size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">
                            {blog ? 'Edit Blog Post' : 'New Blog Post'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={(e) => handleSubmit(e, false)} className="overflow-y-auto max-h-[calc(95vh-140px)]">
                    <div className="p-6 space-y-6">
                        {/* Title & Slug */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => handleTitleChange(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-lg font-semibold"
                                    placeholder="Enter blog title..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                                    <LinkIcon size={14} /> Slug (URL)
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all font-mono text-sm"
                                    placeholder="blog-post-slug"
                                />
                                <p className="text-xs text-slate-500 mt-1">URL: yoursite.com/blog/{formData.slug}</p>
                            </div>
                        </div>

                        {/* Excerpt */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Excerpt</label>
                            <textarea
                                value={formData.excerpt}
                                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none"
                                placeholder="Brief summary for preview cards..."
                            />
                        </div>

                        {/* Content */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Content</label>
                            <textarea
                                required
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                rows={12}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none font-mono text-sm"
                                placeholder="Write your blog content here... (Markdown supported)"
                            />
                            <p className="text-xs text-slate-500 mt-1">Supports Markdown formatting</p>
                        </div>

                        {/* Category & Tags */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                                    placeholder="e.g. Tutorial, News"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                                    <Tag size={14} /> Tags
                                </label>
                                <input
                                    type="text"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                                    placeholder="tag1, tag2, tag3"
                                />
                                <p className="text-xs text-slate-500 mt-1">Comma-separated</p>
                            </div>
                        </div>

                        {/* SEO Section */}
                        <div className="border-t border-slate-200 pt-6">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">SEO Optimization</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Meta Title</label>
                                    <input
                                        type="text"
                                        value={formData.meta_title}
                                        onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                                        placeholder="SEO title for search engines"
                                        maxLength={60}
                                    />
                                    <p className="text-xs text-slate-500 mt-1">{formData.meta_title.length}/60 characters</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Meta Description</label>
                                    <textarea
                                        value={formData.meta_description}
                                        onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none"
                                        placeholder="SEO description for search results"
                                        maxLength={160}
                                    />
                                    <p className="text-xs text-slate-500 mt-1">{formData.meta_description.length}/160 characters</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium"
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                        </select>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded-xl font-medium flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                Save {formData.status === 'draft' ? 'Draft' : ''}
                            </button>
                            {formData.status !== 'published' && (
                                <button
                                    type="button"
                                    onClick={(e) => handleSubmit(e, true)}
                                    disabled={loading}
                                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-purple-200"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Eye size={18} />}
                                    Publish Now
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
