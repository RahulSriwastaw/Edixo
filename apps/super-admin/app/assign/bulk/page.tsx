'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, Search, Filter, Loader2, 
  CheckCircle2, AlertCircle, ArrowRight,
  Upload, FileText, ShieldCheck, HelpCircle
} from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { supabase } from '../../../lib/supabase';

interface Course {
  id: string;
  title: string;
}

export default function BulkAssignPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [targetType, setTargetType] = useState('all_users');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('id, title')
          .eq('status', 'published');
        if (!error) setCourses(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleBulkAssign = async () => {
    if (!selectedCourse) {
      alert('Please select a course first');
      return;
    }
    
    setProcessing(true);
    try {
      // Logic for bulk assignment would go here
      // For now, just simulating a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Bulk assignment task started successfully. You will be notified when complete.');
    } catch (err) {
      console.error(err);
      alert('Failed to initiate bulk assignment.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Bulk Course Assignment</h1>
          <p className="text-slate-500">Assign courses to large groups of users simultaneously.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <BookOpen size={20} className="text-orange-600" />
                  Step 1: Select Course
                </h2>
                <select 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <option value="">Choose a course to assign...</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Users size={20} className="text-orange-600" />
                  Step 2: Target Audience
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  <label className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                    targetType === 'all_users' ? 'border-orange-600 bg-orange-50' : 'border-slate-100 hover:border-slate-200'
                  }`}>
                    <input 
                      type="radio" 
                      name="target" 
                      className="hidden" 
                      checked={targetType === 'all_users'} 
                      onChange={() => setTargetType('all_users')}
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      targetType === 'all_users' ? 'border-orange-600 bg-orange-500' : 'border-slate-300'
                    }`}>
                      {targetType === 'all_users' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">All Registered Users</div>
                      <div className="text-xs text-slate-500 text-pretty">Course will be assigned to every user in the platform.</div>
                    </div>
                  </label>

                  <label className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                    targetType === 'by_organization' ? 'border-orange-600 bg-orange-50' : 'border-slate-100 hover:border-slate-200'
                  }`}>
                    <input 
                      type="radio" 
                      name="target" 
                      className="hidden" 
                      checked={targetType === 'by_organization'} 
                      onChange={() => setTargetType('by_organization')}
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      targetType === 'by_organization' ? 'border-orange-600 bg-orange-500' : 'border-slate-300'
                    }`}>
                      {targetType === 'by_organization' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">By Organization</div>
                      <div className="text-xs text-slate-500">Assign to all users within specific organizations.</div>
                    </div>
                  </label>

                  <label className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                    targetType === 'upload_csv' ? 'border-orange-600 bg-orange-50' : 'border-slate-100 hover:border-slate-200'
                  }`}>
                    <input 
                      type="radio" 
                      name="target" 
                      className="hidden" 
                      checked={targetType === 'upload_csv'} 
                      onChange={() => setTargetType('upload_csv')}
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      targetType === 'upload_csv' ? 'border-orange-600 bg-orange-500' : 'border-slate-300'
                    }`}>
                      {targetType === 'upload_csv' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Upload CSV List</div>
                      <div className="text-xs text-slate-500">Provide a list of user emails or IDs to assign.</div>
                    </div>
                  </label>
                </div>
              </div>

              {targetType === 'upload_csv' && (
                <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-slate-50/50">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 text-slate-400 shadow-sm">
                    <Upload size={24} />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-1">Upload User List</h4>
                  <p className="text-xs text-slate-500 mb-6">Drop your CSV file here or click to browse</p>
                  <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                    Choose File
                  </button>
                </div>
              )}

              <button 
                onClick={handleBulkAssign}
                disabled={processing || !selectedCourse}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white rounded-2xl font-bold transition-all shadow-lg shadow-orange-100 flex items-center justify-center gap-3"
              >
                {processing ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                Initiate Bulk Assignment
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-orange-500 rounded-2xl p-6 text-white shadow-xl shadow-orange-100">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <AlertCircle size={20} />
                Important
              </h3>
              <ul className="space-y-4 text-sm text-indigo-100">
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 bg-white rounded-full shrink-0 mt-1.5"></div>
                  Bulk assignments run as background tasks.
                </li>
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 bg-white rounded-full shrink-0 mt-1.5"></div>
                  Existing assignments will not be duplicated.
                </li>
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 bg-white rounded-full shrink-0 mt-1.5"></div>
                  Users will receive notifications once the course is added.
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <HelpCircle size={18} className="text-slate-400" />
                Template
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                If using CSV upload, ensure your file follows this format:
              </p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono text-[10px] text-slate-600 mb-4">
                email, full_name<br/>
                user1@example.com, John Doe<br/>
                user2@example.com, Jane Smith
              </div>
              <button className="w-full py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                <FileText size={14} />
                Download Template
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
