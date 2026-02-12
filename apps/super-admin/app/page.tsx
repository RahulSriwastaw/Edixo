'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Layers, Users, Settings, BarChart3,
    Building2, BookOpen, Activity, Globe, Database
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { supabase } from '../lib/supabase';
import { ECOSYSTEM_URLS } from '../lib/urls';

export default function Page() {
    const router = useRouter();
    const [stats, setStats] = useState({
        totalOrgs: 0,
        totalUsers: 0,
        activeSessions: 0,
        storageUsed: '0 GB'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [orgsCount, usersCount] = await Promise.all([
                    supabase.from('organizations').select('*', { count: 'exact', head: true }),
                    supabase.from('users').select('*', { count: 'exact', head: true })
                ]);

                setStats({
                    totalOrgs: orgsCount.count || 0,
                    totalUsers: usersCount.count || 0,
                    activeSessions: Math.floor((usersCount.count || 0) * 0.4), // Simulated
                    storageUsed: '12.4 GB' // Simulated
                });
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const handleNavigate = (path: string) => {
        if (path === 'whiteboard') {
            window.open(ECOSYSTEM_URLS.WHITEBOARD, '_blank');
        } else {
            router.push(`/${path}`);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                <header className="mb-6">
                    <h1 className="text-xl font-bold text-slate-900">Dashboard Overview</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Super Admin control center</p>
                </header>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Total Organizations', value: stats.totalOrgs, icon: Building2, color: 'text-orange-600', bg: 'bg-orange-50' },
                        { label: 'Platform Users', value: stats.totalUsers, icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
                        { label: 'Active Sessions', value: stats.activeSessions, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Storage Used', value: stats.storageUsed, icon: Database, color: 'text-orange-600', bg: 'bg-orange-50' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center`}>
                                    <stat.icon size={20} />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Live</span>
                            </div>
                            <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Admin Cards Grid */}
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Management Modules</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                        {
                            id: 'organizations',
                            title: 'Organizations',
                            desc: 'Manage all registered organizations, licensing, and access control',
                            icon: Building2,
                            color: 'from-orange-500 to-amber-500',
                            bg: 'bg-orange-50 text-orange-600',
                        },
                        {
                            id: 'users',
                            title: 'User Management',
                            desc: 'Oversee all user accounts, roles, and permissions across the platform',
                            icon: Users,
                            color: 'from-orange-500 to-amber-500',
                            bg: 'bg-orange-50 text-orange-600',
                        },
                        {
                            id: 'analytics',
                            title: 'Analytics',
                            desc: 'View platform-wide usage statistics, performance metrics, and insights',
                            icon: BarChart3,
                            color: 'from-orange-500 to-amber-500',
                            bg: 'bg-orange-50 text-orange-600',
                        },
                        {
                            id: 'qbank',
                            title: 'Q-Bank Studio',
                            desc: 'Access the full Question Bank Studio, Generators, and Content Tools',
                            icon: Layers,
                            color: 'from-orange-500 to-red-500',
                            bg: 'bg-orange-50 text-orange-600',
                        },
                        {
                            id: 'whiteboard',
                            title: 'Whiteboard',
                            desc: 'Launch interactive teaching whiteboard with question import capabilities',
                            icon: BookOpen,
                            color: 'from-orange-500 to-amber-500',
                            bg: 'bg-orange-50 text-orange-600',
                        },
                        {
                            id: 'settings',
                            title: 'Global Settings',
                            desc: 'Configure platform-wide settings, features, and integrations',
                            icon: Settings,
                            color: 'from-orange-500 to-amber-500',
                            bg: 'bg-orange-50 text-orange-600',
                        }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleNavigate(item.id)}
                            className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-orange-200 transition-all text-left flex flex-col h-full hover:-translate-y-0.5"
                        >
                            <div className={`w-11 h-11 ${item.bg} rounded-xl flex items-center justify-center mb-3`}>
                                <item.icon size={22} />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 mb-1.5">{item.title}</h3>
                            <p className="text-slate-500 text-xs leading-snug flex-1 line-clamp-2">
                                {item.desc}
                            </p>
                        </button>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
