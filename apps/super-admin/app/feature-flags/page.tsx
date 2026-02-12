'use client';

import React, { useState, useEffect } from 'react';
import {
    Zap,
    ToggleLeft,
    ToggleRight,
    Plus,
    Search,
    Loader2,
    Edit,
    Trash2,
    AlertTriangle
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';

interface FeatureFlag {
    id: string;
    key: string;
    name: string;
    description: string | null;
    enabled: boolean;
    scope: 'platform' | 'organization' | 'user';
    created_at: string;
    updated_at: string;
}

export default function FeatureFlagsPage() {
    const [flags, setFlags] = useState<FeatureFlag[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [scopeFilter, setScopeFilter] = useState('All Scopes');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchFlags = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('feature_flags')
                .select('*')
                .order('name', { ascending: true });

            if (scopeFilter !== 'All Scopes') {
                query = query.eq('scope', scopeFilter.toLowerCase());
            }

            if (search) {
                query = query.or(`name.ilike.%${search}%,key.ilike.%${search}%`);
            }

            const { data, error } = await query;

            if (error) throw error;
            setFlags(data || []);
        } catch (error) {
            console.error('Error fetching feature flags:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlags();
    }, [scopeFilter, search]);

    const handleToggle = async (id: string, currentStatus: boolean) => {
        setUpdatingId(id);
        const newStatus = !currentStatus;

        try {
            const { error } = await supabase
                .from('feature_flags')
                .update({
                    enabled: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

            setFlags(prev => prev.map(f => f.id === id ? { ...f, enabled: newStatus } : f));
        } catch (error: any) {
            alert('Error updating feature flag: ' + error.message);
        } finally {
            setUpdatingId(null);
        }
    };

    const getScopeBadge = (scope: string) => {
        const colors = {
            platform: 'bg-purple-100 text-purple-700',
            organization: 'bg-blue-100 text-blue-700',
            user: 'bg-emerald-100 text-emerald-700',
        };
        return colors[scope as keyof typeof colors] || 'bg-slate-100 text-slate-700';
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Feature Flags</h1>
                        <p className="text-slate-500 text-sm mt-0.5">Control platform-wide features and rollouts</p>
                    </div>
                    <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-md text-sm">
                        <Plus size={18} />
                        New Feature Flag
                    </button>
                </header>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <p className="text-slate-500 text-sm font-medium mb-1">Total Flags</p>
                        <p className="text-xl font-bold text-slate-900">{flags.length}</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <p className="text-slate-500 text-sm font-medium mb-1">Enabled</p>
                        <p className="text-xl font-bold text-emerald-600">
                            {flags.filter(f => f.enabled).length}
                        </p>
                    </div>
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <p className="text-slate-500 text-sm font-medium mb-1">Disabled</p>
                        <p className="text-xl font-bold text-amber-600">
                            {flags.filter(f => !f.enabled).length}
                        </p>
                    </div>
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <p className="text-slate-500 text-sm font-medium mb-1">Platform-wide</p>
                        <p className="text-xl font-bold text-purple-600">
                            {flags.filter(f => f.scope === 'platform').length}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 mb-5 flex items-center gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search feature flags..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-50 border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                        />
                    </div>
                    <select
                        value={scopeFilter}
                        onChange={(e) => setScopeFilter(e.target.value)}
                        className="px-3 py-2.5 rounded-lg bg-slate-50 border-none outline-none text-slate-600 font-medium text-sm"
                    >
                        <option>All Scopes</option>
                        <option>Platform</option>
                        <option>Organization</option>
                        <option>User</option>
                    </select>
                </div>

                {/* Feature Flags List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {flags.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                                <Zap className="mx-auto text-slate-300 mb-3" size={40} />
                                <h3 className="text-base font-bold text-slate-900">No feature flags found</h3>
                                <p className="text-slate-500 text-sm">Create a feature flag to control platform features.</p>
                            </div>
                        ) : (
                            flags.map(flag => (
                                <div
                                    key={flag.id}
                                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${flag.enabled ? 'bg-primary-light text-primary' : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                <Zap size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-base font-bold text-slate-900">{flag.name}</h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getScopeBadge(flag.scope)}`}>
                                                        {flag.scope}
                                                    </span>
                                                    {!flag.enabled && (
                                                        <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold">
                                                            <AlertTriangle size={14} />
                                                            Disabled
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-600 mb-2">
                                                    {flag.description || 'No description provided'}
                                                </p>
                                                <code className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded font-mono">
                                                    {flag.key}
                                                </code>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggle(flag.id, flag.enabled)}
                                                disabled={updatingId === flag.id}
                                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${flag.enabled ? 'bg-primary' : 'bg-slate-300'
                                                    } ${updatingId === flag.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${flag.enabled ? 'translate-x-6' : 'translate-x-1'
                                                    }`} />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary-light rounded-lg transition-colors">
                                                <Edit size={18} />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Warning Banner */}
                <div className="mt-8 bg-amber-50 border-l-4 border-amber-500 p-6 rounded-xl">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <h3 className="font-bold text-amber-900 mb-1">Caution: Global Impact</h3>
                            <p className="text-sm text-amber-800">
                                Changes to feature flags apply immediately across the entire platform and all organizations.
                                Use with caution and test in staging first when possible.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
