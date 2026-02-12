'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileCheck, Upload, Search, Filter, Loader2, 
  User, Book, TrendingUp, AlertCircle,
  MoreVertical, Eye, Download, FileText,
  CheckCircle2, XCircle, Info
} from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { supabase } from '../../../lib/supabase';

interface OMRResult {
  id: string;
  student_name: string;
  exam_name: string;
  score: number;
  total_marks: number;
  processed_at: string;
  accuracy: number;
  status: 'success' | 'warning' | 'error';
}

export default function OMRResultsPage() {
  const [results, setResults] = useState<OMRResult[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    setLoading(true);
    try {
      // Simulating data since real table might not have results yet
      const mockData: OMRResult[] = [
        {
          id: '1',
          student_name: 'Rahul Sharma',
          exam_name: 'NEET Practice Test 01',
          score: 540,
          total_marks: 720,
          processed_at: new Date().toISOString(),
          accuracy: 75,
          status: 'success'
        },
        {
          id: '2',
          student_name: 'Priya Patel',
          exam_name: 'NEET Practice Test 01',
          score: 120,
          total_marks: 720,
          processed_at: new Date().toISOString(),
          accuracy: 16,
          status: 'warning'
        }
      ];
      setResults(mockData);
    } catch (error) {
      console.error('Error fetching OMR results:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">OMR Results</h1>
            <p className="text-slate-500">View and manage processed OMR sheet data.</p>
          </div>
          <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-indigo-200">
            <Upload size={18} />
            Upload Scanned Sheets
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by student or exam name..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none"
            />
          </div>
          <button className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
            <Filter size={18} />
            More Filters
          </button>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="animate-spin text-orange-600 mb-4" size={40} />
              <p className="text-slate-500 animate-pulse">Processing results...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student & Exam</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Accuracy</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {results.map((result) => (
                    <tr key={result.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{result.student_name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Book size={12} />
                            {result.exam_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900">
                          {result.score} <span className="text-slate-400 font-normal">/ {result.total_marks}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-full max-w-[100px] space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500">
                            <span>{result.accuracy}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                result.accuracy > 70 ? 'bg-emerald-500' : 
                                result.accuracy > 40 ? 'bg-amber-500' : 'bg-rose-500'
                              }`} 
                              style={{ width: `${result.accuracy}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          result.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 
                          result.status === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {result.status === 'success' ? <CheckCircle2 size={12} /> : 
                           result.status === 'warning' ? <AlertCircle size={12} /> : <XCircle size={12} />}
                          {result.status}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                            <Eye size={18} />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                            <Download size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
