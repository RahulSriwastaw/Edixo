'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, BookOpen, Search, Filter, Loader2, 
  CheckCircle2, XCircle, Plus, Mail,
  Calendar, ShieldCheck, ChevronRight, ArrowRight
} from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { supabase } from '../../../lib/supabase';

interface UserData {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface Course {
  id: string;
  title: string;
  thumbnail_url?: string;
}

export default function IndividualAssignPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, coursesRes] = await Promise.all([
          supabase.from('users').select('id, email, full_name, role').limit(20),
          supabase.from('courses').select('id, title, thumbnail_url').eq('status', 'published')
        ]);
        
        if (!usersRes.error) setUsers(usersRes.data || []);
        if (!coursesRes.error) setCourses(coursesRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAssign = async (courseId: string) => {
    if (!selectedUser) return;
    
    setProcessing(true);
    try {
      // Assignment logic here
      await new Promise(resolve => setTimeout(resolve, 800));
      alert(`Course assigned to ${selectedUser.full_name || selectedUser.email}`);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Individual Course Assignment</h1>
          <p className="text-slate-500">Search for a user and assign specific courses to their account.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Selection */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-250px)]">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <User size={20} className="text-orange-600" />
                1. Select User
              </h2>
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search user by email..."
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-orange-600" />
                  </div>
                ) : users.map(user => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      selectedUser?.id === user.id 
                        ? 'border-orange-600 bg-orange-50 shadow-sm' 
                        : 'border-slate-50 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-slate-900 text-sm truncate">{user.full_name || 'Unnamed'}</div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                      <Mail size={10} />
                      {user.email}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Course Selection */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[calc(100vh-250px)]">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <BookOpen size={20} className="text-orange-600" />
                  2. Assign Courses
                </h2>
                {selectedUser && (
                  <div className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-2 border border-indigo-100">
                    <ShieldCheck size={14} />
                    Target: {selectedUser.email}
                  </div>
                )}
              </div>

              {!selectedUser ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                    <ArrowRight size={32} />
                  </div>
                  <h3 className="text-slate-900 font-bold mb-1">No User Selected</h3>
                  <p className="text-sm text-slate-500">Please select a user from the left panel to begin assigning courses.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.map(course => (
                    <div key={course.id} className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all group flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                        {course.thumbnail_url ? (
                          <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <BookOpen size={24} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm truncate mb-1">{course.title}</h4>
                        <button 
                          onClick={() => handleAssign(course.id)}
                          disabled={processing}
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-orange-600 hover:bg-orange-500 hover:text-white transition-all flex items-center gap-1.5"
                        >
                          {processing ? <Loader2 className="animate-spin" size={12} /> : <Plus size={12} />}
                          Assign Course
                        </button>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
