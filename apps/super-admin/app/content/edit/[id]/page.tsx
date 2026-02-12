'use client';

import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, Save, Loader2, Video,
    FileDown, ExternalLink, FileText,
    Upload, Image as ImageIcon, Plus, X
} from 'lucide-react';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import { supabase } from '../../../../lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function EditContentPage() {
    const router = useRouter();
    const params = useParams();
    const contentId = params.id as string;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'video' as 'video' | 'pdf' | 'document' | 'link' | string,
        category: '',
        file_url: '',
        thumbnail_url: '',
        is_active: true
    });

    useEffect(() => {
        if (contentId) {
            fetchItem();
        }
    }, [contentId]);

    const fetchItem = async () => {
        try {
            const { data, error } = await supabase
                .from('content')
                .select('*')
                .eq('id', contentId)
                .single();

            if (error) throw error;
            if (data) {
                setFormData({
                    title: data.title || '',
                    description: data.description || '',
                    type: data.type || 'video',
                    category: data.category || '',
                    file_url: data.file_url || '',
                    thumbnail_url: data.thumbnail_url || '',
                    is_active: data.is_active ?? true
                });
            }
        } catch (error) {
            console.error('Error fetching content:', error);
            alert('Error fetching content details');
            router.push('/content');
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('content')
                .update({
                    ...formData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', contentId);

            if (error) throw error;

            router.push('/content');
        } catch (error) {
            console.error('Error updating content:', error);
            alert('Error updating content.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    if (fetching) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
                    <p className="text-slate-500 animate-pulse">Loading content details...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-6 max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/content"
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
                    >
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Edit Content</h1>
                        <p className="text-slate-500 text-sm">Update educational materials.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Main Details */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                                    <FileText size={20} className="text-indigo-600" />
                                    Basic Information
                                </h2>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Content Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        placeholder="e.g. Introduction to Physics - Part 1"
                                        value={formData.title}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Description</label>
                                    <textarea
                                        name="description"
                                        rows={4}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                                        placeholder="Provide a brief overview of what this content covers..."
                                        value={formData.description}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Content Type</label>
                                        <select
                                            name="type"
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
                                            value={formData.type}
                                            onChange={handleChange}
                                        >
                                            <option value="video">Video</option>
                                            <option value="pdf">PDF Document</option>
                                            <option value="link">External Link</option>
                                            <option value="document">Other Document</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Category</label>
                                        <input
                                            type="text"
                                            name="category"
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                            placeholder="e.g. Science, Math"
                                            value={formData.category}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                                    <Upload size={20} className="text-indigo-600" />
                                    Media & Files
                                </h2>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">
                                        {formData.type === 'video' ? 'Video URL (YouTube/Vimeo)' : 'File/Link URL'}
                                    </label>
                                    <div className="relative">
                                        {formData.type === 'video' ? (
                                            <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        ) : (
                                            <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        )}
                                        <input
                                            type="url"
                                            name="file_url"
                                            required
                                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                            placeholder="https://..."
                                            value={formData.file_url}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Thumbnail URL (Optional)</label>
                                    <div className="relative">
                                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="url"
                                            name="thumbnail_url"
                                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                            placeholder="https://image-url.com/..."
                                            value={formData.thumbnail_url}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Details */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="font-semibold text-slate-900 mb-4">Publishing</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">Active Status</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="is_active"
                                                className="sr-only peer"
                                                checked={formData.is_active}
                                                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                        Update Content
                                    </button>
                                    <Link
                                        href="/content"
                                        className="w-full block text-center text-slate-500 hover:text-slate-700 py-2 text-sm font-medium transition-colors"
                                    >
                                        Cancel
                                    </Link>
                                </div>
                            </div>

                            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                                <h4 className="text-indigo-900 font-semibold mb-2 flex items-center gap-2 text-sm">
                                    <Plus size={16} />
                                    Quick Tip
                                </h4>
                                <p className="text-indigo-700 text-xs leading-relaxed">
                                    Make sure your video URLs are from supported platforms like YouTube or Vimeo for best compatibility.
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
