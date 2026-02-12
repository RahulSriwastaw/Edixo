'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trophy, Plus, Search, Filter, Loader2, 
  HelpCircle, Clock, Users, BookOpen,
  MoreVertical, Edit2, Trash2, Eye,
  Play, CheckCircle2, AlertCircle
} from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { supabase } from '../../../lib/supabase';

interface Quiz {
  id: string;
  title: string;
  course_name: string;
  question_count: number;
  duration_minutes: number;
  attempt_count: number;
  status: 'active' | 'draft' | 'archived';
  created_at: string;
}

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST116') throw error;
      setQuizzes(data || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quiz Management</h1>
            <p className="text-slate-500">Create and monitor interactive quizzes for your courses.</p>
          </div>
          <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-orange-200">
            <Plus size={18} />
            Create New Quiz
          </button>
        </div>

        {/* Quizzes Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
            <p className="text-slate-500 animate-pulse">Loading quizzes...</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Trophy size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No quizzes found</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8">
              Interactive quizzes help in better student engagement and assessment.
            </p>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-all">
              Create Your First Quiz
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-colors">
                      <Trophy size={24} />
                    </div>
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      quiz.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 
                      quiz.status === 'draft' ? 'bg-slate-100 text-slate-400' : 'bg-rose-100 text-rose-600'
                    }`}>
                      {quiz.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-orange-600 transition-colors">{quiz.title}</h3>
                  <p className="text-xs text-slate-500 mb-6 flex items-center gap-1">
                    <BookOpen size={12} />
                    {quiz.course_name || 'General Quiz'}
                  </p>
                  
                  <div className="grid grid-cols-3 gap-2 py-4 border-y border-slate-100">
                    <div className="text-center">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Questions</div>
                      <div className="text-sm font-bold text-slate-900">{quiz.question_count}</div>
                    </div>
                    <div className="text-center border-x border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Minutes</div>
                      <div className="text-sm font-bold text-slate-900">{quiz.duration_minutes}m</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Attempts</div>
                      <div className="text-sm font-bold text-slate-900">{quiz.attempt_count}</div>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-slate-50 flex items-center justify-between">
                  <div className="text-[10px] text-slate-400 font-medium">
                    Added {new Date(quiz.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex gap-1">
                    <button className="p-2 text-slate-400 hover:text-orange-600 hover:bg-white rounded-lg transition-all shadow-sm shadow-transparent hover:shadow-slate-200">
                      <Edit2 size={16} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-all shadow-sm shadow-transparent hover:shadow-slate-200">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
