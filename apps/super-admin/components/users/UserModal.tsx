'use client';

import React, { useState, useEffect } from 'react';
import { X, Mail, Building2, Shield, Calendar, Activity, Ban, LogOut, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface User {
    id: string;
    auth_user_id: string;
    org_id: string;
    email: string;
    full_name: string;
    role: string;
    status: string;
    last_login_at: string;
    created_at: string;
    organizations?: {
        name: string;
        slug: string;
    };
}

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onRefresh: () => void;
}

export default function UserModal({ isOpen, onClose, user, onRefresh }: UserModalProps) {
    const [loading, setLoading] = useState(false);

    if (!isOpen || !user) return null;

    const handleBlockToggle = async () => {
        const newStatus = user.status === 'active' ? 'suspended' : 'active';
        const action = newStatus === 'suspended' ? 'block' : 'unblock';

        if (!confirm(`Are you sure you want to ${action} ${user.full_name || user.email}?`)) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('users')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', user.id);

            if (error) throw error;

            alert(`User ${action}ed successfully.`);
            onRefresh();
            onClose();
        } catch (error: any) {
            alert('Error updating user: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleForceLogout = async () => {
        if (!confirm(`Force logout ${user.full_name || user.email}? They will need to re-authenticate.`)) return;

        setLoading(true);
        try {
            // This requires Supabase Admin API in production
            // await supabase.auth.admin.signOut(user.auth_user_id)
            alert('Force logout functionality requires Supabase Admin API integration.');
            onClose();
        } catch (error: any) {
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const getRoleBadge = (role: string) => {
        const colors = {
            super_admin: 'bg-purple-100 text-purple-700 border-purple-200',
            org_admin: 'bg-blue-100 text-blue-700 border-blue-200',
            teacher: 'bg-green-100 text-green-700 border-green-200',
        };
        return colors[role as keyof typeof colors] || 'bg-slate-100 text-slate-700 border-slate-200';
    };

    const getStatusBadge = (status: string) => {
        const colors = {
            active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            suspended: 'bg-red-100 text-red-700 border-red-200',
            inactive: 'bg-amber-100 text-amber-700 border-amber-200',
        };
        return colors[status as keyof typeof colors] || 'bg-slate-100 text-slate-700 border-slate-200';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-lg font-bold">
                            {(user.full_name || user.email).substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">{user.full_name || 'No Name'}</h2>
                            <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    {/* Status & Role */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-xl">
                            <div className="flex items-center gap-2 text-slate-600 mb-3">
                                <Shield size={16} />
                                <span className="text-xs font-medium uppercase">Role</span>
                            </div>
                            <span className={`px-3 py-1.5 rounded-lg text-sm font-bold uppercase border ${getRoleBadge(user.role)}`}>
                                {user.role.replace('_', ' ')}
                            </span>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl">
                            <div className="flex items-center gap-2 text-slate-600 mb-3">
                                <Activity size={16} />
                                <span className="text-xs font-medium uppercase">Status</span>
                            </div>
                            <span className={`px-3 py-1.5 rounded-lg text-sm font-bold uppercase border ${getStatusBadge(user.status)}`}>
                                {user.status}
                            </span>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">User Details</h3>

                        <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                            <div className="flex items-center gap-3">
                                <Mail className="text-slate-400" size={18} />
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500 font-medium">Email</p>
                                    <p className="text-sm font-bold text-slate-900">{user.email}</p>
                                </div>
                            </div>

                            {user.organizations && (
                                <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
                                    <Building2 className="text-slate-400" size={18} />
                                    <div className="flex-1">
                                        <p className="text-xs text-slate-500 font-medium">Organization</p>
                                        <p className="text-sm font-bold text-slate-900">{user.organizations.name}</p>
                                        <p className="text-xs text-slate-500">{user.organizations.slug}.qbank.com</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
                                <Calendar className="text-slate-400" size={18} />
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500 font-medium">Member Since</p>
                                    <p className="text-sm font-bold text-slate-900">
                                        {new Date(user.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
                                <Activity className="text-slate-400" size={18} />
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500 font-medium">Last Login</p>
                                    <p className="text-sm font-bold text-slate-900">
                                        {user.last_login_at
                                            ? new Date(user.last_login_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })
                                            : 'Never logged in'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3 pt-6 border-t border-slate-200">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">User Actions</h3>

                        <button
                            onClick={handleBlockToggle}
                            disabled={loading}
                            className={`w-full px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${user.status === 'active'
                                    ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                                } disabled:opacity-50`}
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Ban size={18} />}
                            {user.status === 'active' ? 'Block User' : 'Unblock User'}
                        </button>

                        <button
                            onClick={handleForceLogout}
                            disabled={loading}
                            className="w-full px-4 py-3 bg-orange-50 text-orange-700 rounded-xl font-medium hover:bg-orange-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
                            Force Logout
                        </button>

                        <p className="text-xs text-slate-500 text-center mt-2">
                            Actions will take effect immediately
                        </p>
                    </div>
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
