'use client';

import React, { useState, useEffect } from 'react';
import { X, Building2, Users, BookOpen, Calendar, Shield, AlertTriangle, Key } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Organization {
    id: string;
    name: string;
    slug: string;
    status: string;
    plan_type: string;
    created_at: string;
    settings: {
        max_teachers?: number;
        max_courses?: number;
        whiteboard_enabled?: boolean;
    };
}

interface OrgDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    organization: Organization | null;
}

interface OrgStats {
    teachers_count: number;
    courses_count: number;
    students_count: number;
}

export default function OrgDetailsModal({ isOpen, onClose, organization }: OrgDetailsModalProps) {
    const [stats, setStats] = useState<OrgStats>({ teachers_count: 0, courses_count: 0, students_count: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (organization) {
            fetchOrgStats();
        }
    }, [organization]);

    const fetchOrgStats = async () => {
        if (!organization) return;

        setLoading(true);
        try {
            // Fetch teachers count
            const { count: teachersCount } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .eq('org_id', organization.id)
                .in('role', ['teacher', 'org_admin']);

            // Fetch courses count
            const { count: coursesCount } = await supabase
                .from('courses')
                .select('*', { count: 'exact', head: true })
                .eq('org_id', organization.id);

            // Fetch students count
            const { count: studentsCount } = await supabase
                .from('students')
                .select('*', { count: 'exact', head: true })
                .eq('org_id', organization.id);

            setStats({
                teachers_count: teachersCount || 0,
                courses_count: coursesCount || 0,
                students_count: studentsCount || 0,
            });
        } catch (error) {
            console.error('Error fetching org stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEmergencyLock = async () => {
        if (!organization) return;

        const confirmed = confirm(
            `⚠️ WARNING: This will immediately suspend "${organization.name}" and block all access.\n\nAre you sure?`
        );

        if (!confirmed) return;

        try {
            const { error } = await supabase
                .from('organizations')
                .update({ status: 'suspended', updated_at: new Date().toISOString() })
                .eq('id', organization.id);

            if (error) throw error;

            alert('Organization has been locked successfully.');
            onClose();
        } catch (error: any) {
            alert('Error locking organization: ' + error.message);
        }
    };

    if (!isOpen || !organization) return null;

    const maxTeachers = organization.settings?.max_teachers || 10;
    const maxCourses = organization.settings?.max_courses || 50;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-lg font-bold">
                            {organization.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">{organization.name}</h2>
                            <p className="text-sm text-slate-500">{organization.slug}.qbank.com</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    {/* Status & Plan */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-50 p-4 rounded-xl">
                            <div className="flex items-center gap-2 text-slate-600 mb-2">
                                <Shield size={16} />
                                <span className="text-xs font-medium uppercase">Status</span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${organization.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                    organization.status === 'suspended' ? 'bg-red-100 text-red-700' :
                                        'bg-amber-100 text-amber-700'
                                }`}>
                                {organization.status}
                            </span>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl">
                            <div className="flex items-center gap-2 text-slate-600 mb-2">
                                <Shield size={16} />
                                <span className="text-xs font-medium uppercase">Plan</span>
                            </div>
                            <p className="text-lg font-bold text-slate-900 capitalize">{organization.plan_type}</p>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl">
                            <div className="flex items-center gap-2 text-slate-600 mb-2">
                                <Calendar size={16} />
                                <span className="text-xs font-medium uppercase">Created</span>
                            </div>
                            <p className="text-sm font-bold text-slate-900">
                                {new Date(organization.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Statistics</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-blue-50 p-5 rounded-xl">
                                <Users className="text-blue-600 mb-3" size={24} />
                                <p className="text-2xl font-bold text-blue-900">
                                    {loading ? '...' : stats.teachers_count}
                                    <span className="text-sm text-blue-600 font-normal"> / {maxTeachers}</span>
                                </p>
                                <p className="text-xs text-blue-700 font-medium mt-1">Teachers</p>
                            </div>

                            <div className="bg-purple-50 p-5 rounded-xl">
                                <BookOpen className="text-purple-600 mb-3" size={24} />
                                <p className="text-2xl font-bold text-purple-900">
                                    {loading ? '...' : stats.courses_count}
                                    <span className="text-sm text-purple-600 font-normal"> / {maxCourses}</span>
                                </p>
                                <p className="text-xs text-purple-700 font-medium mt-1">Courses</p>
                            </div>

                            <div className="bg-green-50 p-5 rounded-xl">
                                <Users className="text-green-600 mb-3" size={24} />
                                <p className="text-2xl font-bold text-green-900">
                                    {loading ? '...' : stats.students_count}
                                </p>
                                <p className="text-xs text-green-700 font-medium mt-1">Students</p>
                            </div>
                        </div>
                    </div>

                    {/* Settings */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Configuration</h3>
                        <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-700">Max Teachers</span>
                                <span className="text-sm font-bold text-slate-900">{maxTeachers}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-700">Max Courses</span>
                                <span className="text-sm font-bold text-slate-900">{maxCourses}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-700">Whiteboard Access</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${organization.settings?.whiteboard_enabled !== false
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                    }`}>
                                    {organization.settings?.whiteboard_enabled !== false ? 'Enabled' : 'Disabled'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Emergency Actions */}
                    {organization.status === 'active' && (
                        <div className="border-t border-slate-200 pt-6">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <AlertTriangle size={16} className="text-red-600" />
                                Emergency Actions
                            </h3>
                            <button
                                onClick={handleEmergencyLock}
                                className="w-full px-4 py-3 bg-red-50 text-red-700 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                            >
                                <AlertTriangle size={18} />
                                Emergency Lock Organization
                            </button>
                            <p className="text-xs text-slate-500 mt-2">
                                This will immediately suspend the organization and block all access
                            </p>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
