'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Building2, BookOpen, Users, ArrowLeft, Loader2, 
  Shield, Globe, Calendar, Mail, CheckCircle2, XCircle
} from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { supabase } from '../../../lib/supabase';

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
    storage_limit_gb?: number;
    whiteboard_enabled?: boolean;
    custom_domain?: string;
    domain_verified?: boolean;
  };
}

interface Course {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  teacher?: {
    full_name: string;
  };
}

interface Student {
  id: string;
  full_name: string;
  email: string;
  status: string;
  created_at: string;
}

export default function OrganizationOverridePage() {
  const { id } = useParams();
  const router = useRouter();
  const [org, setOrg] = useState<Organization | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'courses' | 'students'>('courses');

  useEffect(() => {
    if (id) {
      fetchOrgData();
    }
  }, [id]);

  const fetchOrgData = async () => {
    setLoading(true);
    try {
      // Fetch Org Details
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single();

      if (orgError) throw orgError;
      setOrg(orgData);

      // Fetch Courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*, teacher:users(full_name)')
        .eq('org_id', id)
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;
      setCourses(coursesData || []);

      // Fetch Students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('org_id', id)
        .order('created_at', { ascending: false });

      if (studentsError) throw studentsError;
      setStudents(studentsData || []);

    } catch (error) {
      console.error('Error fetching org data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
          <p className="text-slate-500 font-medium">Fetching organization data assets...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!org) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <XCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-slate-900">Organization Not Found</h2>
          <button 
            onClick={() => router.back()}
            className="mt-4 text-indigo-600 font-bold hover:underline"
          >
            Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-6 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Organizations
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="p-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl font-bold border border-white/20">
                  {org.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{org.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-slate-300">
                    <span className="flex items-center gap-1.5"><Globe size={16} /> {org.settings?.custom_domain || `${org.slug}.qbank.com`}</span>
                    <span className="flex items-center gap-1.5"><Shield size={16} /> {org.plan_type.toUpperCase()}</span>
                    <span className="flex items-center gap-1.5"><Calendar size={16} /> Joined {new Date(org.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${
                  org.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {org.status}
                </span>
                <div className="bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Storage Usage</p>
                  <p className="text-sm font-bold">{org.settings?.storage_limit_gb || 5} GB Allotted</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-8 py-4 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${
                activeTab === 'courses' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Courses ({courses.length})
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-8 py-4 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${
                activeTab === 'students' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Students ({students.length})
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'courses' ? (
              <div className="space-y-4">
                {courses.length === 0 ? (
                  <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    <BookOpen className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-slate-500 font-medium">No courses found for this organization.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courses.map(course => (
                      <div key={course.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-indigo-200 transition-all group">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{course.title}</h3>
                          <span className="px-2 py-0.5 bg-white rounded text-[10px] font-bold uppercase border border-slate-200 text-slate-500">
                            {course.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-4">{course.description || 'No description provided.'}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 text-xs font-bold text-slate-400 uppercase tracking-wider">
                          <span className="flex items-center gap-1.5"><Users size={14} /> {course.teacher?.full_name || 'System'}</span>
                          <span>{new Date(course.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {students.length === 0 ? (
                  <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    <Users className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-slate-500 font-medium">No students registered yet.</p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4">Student</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Joined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {students.map(student => (
                          <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-900">{student.full_name || 'No Name'}</p>
                              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5"><Mail size={12} /> {student.email}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                student.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {student.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs font-bold text-slate-500">
                              {new Date(student.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
          <Shield className="text-amber-600 shrink-0" size={24} />
          <div>
            <h4 className="font-bold text-amber-900 mb-1">Read-Only Override Active</h4>
            <p className="text-sm text-amber-700 leading-relaxed">
              You are currently viewing private organization data in override mode. This interface is strictly read-only to prevent accidental modification of institution records. Any critical changes should be performed by the Organization Administrator.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
