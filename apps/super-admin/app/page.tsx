'use client';

import { useRouter } from 'next/navigation';
import {
    Layers, Users, Settings, BarChart3,
    Building2, BookOpen
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';

import { ECOSYSTEM_URLS } from '../lib/urls';

export default function Page() {
    const router = useRouter();

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
                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
                    <p className="text-slate-500 mt-2">Welcome to the Super Admin control center.</p>
                </header>

                {/* Admin Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        {
                            id: 'organizations',
                            title: 'Organizations',
                            desc: 'Manage all registered organizations, licensing, and access control',
                            icon: Building2,
                            color: 'from-purple-500 to-pink-500',
                            bg: 'bg-purple-50 text-purple-600',
                        },
                        {
                            id: 'users',
                            title: 'User Management',
                            desc: 'Oversee all user accounts, roles, and permissions across the platform',
                            icon: Users,
                            color: 'from-blue-500 to-cyan-500',
                            bg: 'bg-blue-50 text-blue-600',
                        },
                        {
                            id: 'analytics',
                            title: 'Analytics',
                            desc: 'View platform-wide usage statistics, performance metrics, and insights',
                            icon: BarChart3,
                            color: 'from-green-500 to-emerald-500',
                            bg: 'bg-green-50 text-green-600',
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
                            color: 'from-indigo-500 to-purple-500',
                            bg: 'bg-indigo-50 text-indigo-600',
                        },
                        {
                            id: 'settings',
                            title: 'Global Settings',
                            desc: 'Configure platform-wide settings, features, and integrations',
                            icon: Settings,
                            color: 'from-slate-500 to-gray-500',
                            bg: 'bg-slate-100 text-slate-600',
                        }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleNavigate(item.id)}
                            className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left flex flex-col h-full hover:-translate-y-1"
                        >
                            <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center mb-6`}>
                                <item.icon size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed flex-1">
                                {item.desc}
                            </p>
                        </button>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
