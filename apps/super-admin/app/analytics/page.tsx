'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3, Building2, Users, BookOpen, FileText,
  TrendingUp, TrendingDown, Activity, Globe, Shield,
  Loader2, RefreshCw, Calendar, Download
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';

interface PlatformStats {
  totalOrganizations: number;
  activeOrganizations: number;
  suspendedOrganizations: number;
  totalUsers: number;
  superAdmins: number;
  orgAdmins: number;
  teachers: number;
  totalStudents: number;
  totalCourses: number;
  totalBlogs: number;
  publishedBlogs: number;
}

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  bgColor: string;
  iconColor: string;
}

function StatCard({ title, value, subtitle, icon, trend, trendValue, bgColor, iconColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center`}>
          <span className={iconColor}>{icon}</span>
        </div>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-600' : 'text-slate-500'
            }`}>
            {trend === 'up' ? <TrendingUp size={16} /> : trend === 'down' ? <TrendingDown size={16} /> : null}
            {trendValue}
          </div>
        )}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-0.5">{value}</h3>
      <p className="text-xs text-slate-500">{title}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch organizations stats
      const { data: orgs, error: orgsError } = await supabase
        .from('organizations')
        .select('id, status');

      if (orgsError) throw orgsError;

      const totalOrgs = orgs?.length || 0;
      const activeOrgs = orgs?.filter(o => o.status === 'active').length || 0;
      const suspendedOrgs = orgs?.filter(o => o.status === 'suspended').length || 0;

      // Fetch users stats
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, role, status');

      if (usersError) throw usersError;

      const totalUsers = users?.length || 0;
      const superAdmins = users?.filter(u => u.role === 'super_admin').length || 0;
      const orgAdmins = users?.filter(u => u.role === 'org_admin').length || 0;
      const teachers = users?.filter(u => u.role === 'teacher').length || 0;

      // Fetch students stats
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id');

      const totalStudents = studentsError ? 0 : (students?.length || 0);

      // Fetch courses stats
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id');

      const totalCourses = coursesError ? 0 : (courses?.length || 0);

      // Fetch blogs stats
      const { data: blogs, error: blogsError } = await supabase
        .from('blogs')
        .select('id, status');

      const totalBlogs = blogsError ? 0 : (blogs?.length || 0);
      const publishedBlogs = blogsError ? 0 : (blogs?.filter(b => b.status === 'published').length || 0);

      setStats({
        totalOrganizations: totalOrgs,
        activeOrganizations: activeOrgs,
        suspendedOrganizations: suspendedOrgs,
        totalUsers,
        superAdmins,
        orgAdmins,
        teachers,
        totalStudents,
        totalCourses,
        totalBlogs,
        publishedBlogs,
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Platform Analytics</h1>
            <p className="text-slate-500 text-sm mt-0.5">Real-time platform statistics</p>
          </div>
          <div className="flex items-center gap-4">
            {lastUpdated && (
              <span className="text-sm text-slate-500 flex items-center gap-2">
                <Calendar size={16} />
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={() => {
                if (!stats) return;
                const csvContent = "data:text/csv;charset=utf-8,"
                  + "Metric,Value\n"
                  + `Total Organizations,${stats.totalOrganizations}\n`
                  + `Active Organizations,${stats.activeOrganizations}\n`
                  + `Suspended Organizations,${stats.suspendedOrganizations}\n`
                  + `Total Users,${stats.totalUsers}\n`
                  + `Super Admins,${stats.superAdmins}\n`
                  + `Org Admins,${stats.orgAdmins}\n`
                  + `Teachers,${stats.teachers}\n`
                  + `Total Students,${stats.totalStudents}\n`
                  + `Total Courses,${stats.totalCourses}\n`
                  + `Total Blogs,${stats.totalBlogs}\n`
                  + `Published Blogs,${stats.publishedBlogs}`;

                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `qbank_analytics_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors"
            >
              <Download size={18} />
              Export CSV
            </button>
            <button
              onClick={fetchStats}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 text-sm"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </header>

        {loading && !stats ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-orange-500" size={32} />
          </div>
        ) : stats ? (
          <>
            {/* Platform Overview */}
            <section className="mb-6">
              <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Activity size={20} className="text-orange-600" />
                Platform Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Organizations"
                  value={stats.totalOrganizations}
                  subtitle={`${stats.activeOrganizations} active, ${stats.suspendedOrganizations} suspended`}
                  icon={<Building2 size={24} />}
                  bgColor="bg-purple-100"
                  iconColor="text-purple-600"
                />
                <StatCard
                  title="Total Users"
                  value={stats.totalUsers}
                  subtitle="Admins, Teachers across all orgs"
                  icon={<Users size={20} />}
                  bgColor="bg-blue-100"
                  iconColor="text-blue-600"
                />
                <StatCard
                  title="Total Students"
                  value={stats.totalStudents}
                  subtitle="Enrolled students platform-wide"
                  icon={<Shield size={20} />}
                  bgColor="bg-emerald-100"
                  iconColor="text-emerald-600"
                />
                <StatCard
                  title="Total Courses"
                  value={stats.totalCourses}
                  subtitle="Courses created by all orgs"
                  icon={<BookOpen size={20} />}
                  bgColor="bg-orange-100"
                  iconColor="text-orange-600"
                />
              </div>
            </section>

            {/* Organization Breakdown */}
            <section className="mb-6">
              <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Building2 size={20} className="text-purple-600" />
                Organization Status
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-600">Active</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                      {stats.totalOrganizations ? Math.round((stats.activeOrganizations / stats.totalOrganizations) * 100) : 0}%
                    </span>
                  </div>
                  <div className="text-xl font-bold text-emerald-600">{stats.activeOrganizations}</div>
                  <div className="w-full h-2 bg-slate-100 rounded-full mt-4">
                    <div
                      className="h-2 bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${stats.totalOrganizations ? (stats.activeOrganizations / stats.totalOrganizations) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-600">Suspended</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                      {stats.totalOrganizations ? Math.round((stats.suspendedOrganizations / stats.totalOrganizations) * 100) : 0}%
                    </span>
                  </div>
                  <div className="text-xl font-bold text-red-600">{stats.suspendedOrganizations}</div>
                  <div className="w-full h-2 bg-slate-100 rounded-full mt-4">
                    <div
                      className="h-2 bg-red-500 rounded-full transition-all"
                      style={{ width: `${stats.totalOrganizations ? (stats.suspendedOrganizations / stats.totalOrganizations) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-600">Trial/Other</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                      {stats.totalOrganizations ? Math.round(((stats.totalOrganizations - stats.activeOrganizations - stats.suspendedOrganizations) / stats.totalOrganizations) * 100) : 0}%
                    </span>
                  </div>
                  <div className="text-xl font-bold text-amber-600">
                    {stats.totalOrganizations - stats.activeOrganizations - stats.suspendedOrganizations}
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full mt-4">
                    <div
                      className="h-2 bg-amber-500 rounded-full transition-all"
                      style={{ width: `${stats.totalOrganizations ? ((stats.totalOrganizations - stats.activeOrganizations - stats.suspendedOrganizations) / stats.totalOrganizations) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </section>

            {/* User Breakdown */}
            <section className="mb-6">
              <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Users size={20} className="text-blue-600" />
                User Role Distribution
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                  title="Super Admins"
                  value={stats.superAdmins}
                  subtitle="Platform administrators"
                  icon={<Shield size={20} />}
                  bgColor="bg-purple-100"
                  iconColor="text-purple-600"
                />
                <StatCard
                  title="Org Admins"
                  value={stats.orgAdmins}
                  subtitle="Organization managers"
                  icon={<Building2 size={24} />}
                  bgColor="bg-blue-100"
                  iconColor="text-blue-600"
                />
                <StatCard
                  title="Teachers"
                  value={stats.teachers}
                  subtitle="Content creators"
                  icon={<Users size={20} />}
                  bgColor="bg-green-100"
                  iconColor="text-green-600"
                />
              </div>
            </section>

            {/* Content Stats */}
            <section className="mb-6">
              <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <FileText size={20} className="text-orange-600" />
                Content Statistics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <FileText size={28} className="text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">{stats.totalBlogs}</h3>
                      <p className="text-sm text-slate-500">Total Blog Posts</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Published</span>
                        <span className="font-medium text-emerald-600">{stats.publishedBlogs}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full">
                        <div
                          className="h-2 bg-emerald-500 rounded-full"
                          style={{ width: `${stats.totalBlogs ? (stats.publishedBlogs / stats.totalBlogs) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Drafts</span>
                        <span className="font-medium text-amber-600">{stats.totalBlogs - stats.publishedBlogs}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full">
                        <div
                          className="h-2 bg-amber-500 rounded-full"
                          style={{ width: `${stats.totalBlogs ? ((stats.totalBlogs - stats.publishedBlogs) / stats.totalBlogs) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
                      <BookOpen size={28} className="text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">{stats.totalCourses}</h3>
                      <p className="text-sm text-slate-500">Total Courses</p>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-600">
                      Courses created across all organizations. Includes free and paid courses.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <section>
              <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Globe size={20} className="text-green-600" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => window.location.href = '/organizations'}
                  className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md hover:border-orange-200 transition-all text-left group"
                >
                  <Building2 size={20} className="text-orange-600 mb-2" />
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-orange-600 transition-colors">Manage Organizations</h3>
                  <p className="text-xs text-slate-500 mt-0.5">View and control organizations</p>
                </button>
                <button
                  onClick={() => window.location.href = '/users'}
                  className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md hover:border-orange-200 transition-all text-left group"
                >
                  <Users size={20} className="text-orange-600 mb-2" />
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-orange-600 transition-colors">Manage Users</h3>
                  <p className="text-xs text-slate-500 mt-0.5">View and manage users</p>
                </button>
                <button
                  onClick={() => window.location.href = '/blogs'}
                  className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md hover:border-orange-200 transition-all text-left group"
                >
                  <FileText size={20} className="text-orange-600 mb-2" />
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-orange-600 transition-colors">Manage Blogs</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Create and publish content</p>
                </button>
              </div>
            </section>
          </>
        ) : (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
            <BarChart3 className="mx-auto text-slate-300 mb-3" size={40} />
            <h2 className="text-base font-bold text-slate-900 mb-1.5">Unable to Load Analytics</h2>
            <p className="text-slate-500 text-sm mb-3">Error loading platform statistics.</p>
            <button
              onClick={fetchStats}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium text-sm inline-flex items-center gap-2 transition-colors"
            >
              <RefreshCw size={18} />
              Try Again
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
