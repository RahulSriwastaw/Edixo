'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Building2, Shield, Users, BookOpen } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Organization {
    id: string;
    name: string;
    slug: string;
    status: string;
    plan_type: string;
    settings: {
        max_teachers?: number;
        max_courses?: number;
        whiteboard_enabled?: boolean;
    };
}

interface EditOrgModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    organization: Organization | null;
}

export default function EditOrgModal({ isOpen, onClose, onSuccess, organization }: EditOrgModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        plan_type: 'free',
        status: 'active',
        max_teachers: 10,
        max_courses: 50,
        whiteboard_enabled: true,
    });

    useEffect(() => {
        if (organization) {
            setFormData({
                name: organization.name,
                slug: organization.slug,
                plan_type: organization.plan_type,
                status: organization.status,
                max_teachers: organization.settings?.max_teachers || 10,
                max_courses: organization.settings?.max_courses || 50,
                whiteboard_enabled: organization.settings?.whiteboard_enabled !== false,
            });
        }
    }, [organization]);

    if (!isOpen || !organization) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('organizations')
                .update({
                    name: formData.name,
                    slug: formData.slug,
                    plan_type: formData.plan_type,
                    status: formData.status,
                    settings: {
                        max_teachers: formData.max_teachers,
                        max_courses: formData.max_courses,
                        whiteboard_enabled: formData.whiteboard_enabled,
                    },
                    updated_at: new Date().toISOString(),
                })
                .eq('id', organization.id);

            if (error) throw error;

            onSuccess();
            onClose();
        } catch (error: any) {
            alert('Error updating organization: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <Building2 className="text-white" size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">Edit Organization</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Basic Information</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Organization Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                    placeholder="e.g. Delhi Public School"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Slug (URL)</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                    placeholder="e.g. dps-delhi"
                                />
                            </div>
                        </div>
                    </div>

                    {/* License & Status */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <Shield size={16} /> License & Status
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Plan Type</label>
                                <select
                                    value={formData.plan_type}
                                    onChange={(e) => setFormData({ ...formData, plan_type: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                >
                                    <option value="free">Free</option>
                                    <option value="pro">Pro</option>
                                    <option value="enterprise">Enterprise</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                >
                                    <option value="active">Active</option>
                                    <option value="suspended">Suspended</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Organization Limits */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <Users size={16} /> Organization Limits
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Max Teachers</label>
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    value={formData.max_teachers}
                                    onChange={(e) => setFormData({ ...formData, max_teachers: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Max Courses</label>
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    value={formData.max_courses}
                                    onChange={(e) => setFormData({ ...formData, max_courses: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Feature Access */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <BookOpen size={16} /> Feature Access
                        </h3>

                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                            <input
                                type="checkbox"
                                id="whiteboard_enabled"
                                checked={formData.whiteboard_enabled}
                                onChange={(e) => setFormData({ ...formData, whiteboard_enabled: e.target.checked })}
                                className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-200"
                            />
                            <label htmlFor="whiteboard_enabled" className="text-sm font-medium text-slate-700 cursor-pointer">
                                Enable Whiteboard Access
                            </label>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
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
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
