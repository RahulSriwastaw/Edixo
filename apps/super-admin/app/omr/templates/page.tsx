'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, Plus, Search, Filter, Loader2, 
  Grid, Layout, FileText, Download,
  MoreVertical, Edit2, Trash2, Eye,
  CheckCircle2, AlertCircle, Copy
} from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { supabase } from '../../../lib/supabase';

interface OMRTemplate {
  id: string;
  name: string;
  question_count: number;
  options_per_question: number;
  created_at: string;
  status: 'active' | 'draft';
  preview_url?: string;
}

export default function OMRTemplatesPage() {
  const [templates, setTemplates] = useState<OMRTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('omr_sheets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST116') throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching OMR templates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">OMR Sheet Templates</h1>
            <p className="text-slate-500">Design and manage digital OMR sheets for offline exams.</p>
          </div>
          <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-indigo-200">
            <Plus size={18} />
            Create New Template
          </button>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="animate-spin text-orange-600 mb-4" size={40} />
            <p className="text-slate-500 animate-pulse">Loading templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <FileSpreadsheet size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No OMR templates found</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8">
              Create your first OMR template to start processing offline exam results.
            </p>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-all">
              Create OMR Template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group">
                <div className="aspect-[4/5] bg-slate-50 relative overflow-hidden group-hover:bg-slate-100 transition-colors flex items-center justify-center p-8">
                  {/* Fake OMR Preview */}
                  <div className="w-full h-full bg-white rounded-md shadow-sm border border-slate-200 p-3 flex flex-col gap-2">
                    <div className="h-4 w-1/2 bg-slate-100 rounded mb-2"></div>
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
                        <div className="flex gap-1 flex-1">
                          {[...Array(4)].map((_, j) => (
                            <div key={j} className="w-3 h-3 border border-slate-200 rounded-full"></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button className="bg-white text-slate-900 p-2 rounded-lg shadow-lg">
                      <Eye size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{template.name}</h3>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      template.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {template.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 mb-4 font-medium">
                    <div className="flex items-center gap-1">
                      <Layout size={12} />
                      {template.question_count} Questions
                    </div>
                    <div className="flex items-center gap-1">
                      <Grid size={12} />
                      {template.options_per_question} Options
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                      <Edit2 size={14} />
                      Edit
                    </button>
                    <button className="py-2 px-3 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg text-xs font-bold transition-colors">
                      <Download size={16} />
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
