'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserSquare2, Plus, Search, Filter, 
  Mail, Phone, Shield, MoreVertical,
  CheckCircle2, XCircle
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';

interface Teacher {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .in('role', ['teacher', 'org_admin'])
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTeachers(data || []);
      } catch (error) {
        console.error('Error fetching teachers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Teacher Management</h1>
            <p className="text-slate-500 text-sm">Manage and monitor platform teachers and staff</p>
          </div>
          <button className="bg-orange-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20">
            <Plus size={20} />
            Add Teacher
          </button>
        </div>

        {/* Teachers List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 animate-pulse h-48"></div>
            ))
          ) : teachers.length > 0 ? (
            teachers.map((teacher) => (
              <div key={teacher.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 font-bold text-xl">
                    {teacher.full_name?.charAt(0) || teacher.email.charAt(0).toUpperCase()}
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                    teacher.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {teacher.status}
                  </div>
                </div>

                <div className="space-y-1 mb-4">
                  <h3 className="font-bold text-slate-900 truncate">{teacher.full_name || 'Anonymous'}</h3>
                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <Mail size={12} />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{teacher.role.replace('_', ' ')}</span>
                  </div>
                  <button className="text-slate-400 hover:text-orange-600 transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center">
              <UserSquare2 size={48} className="text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No teachers found</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
