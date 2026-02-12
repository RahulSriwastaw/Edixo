'use client';

import React, { useEffect, useState } from 'react';
import { 
  Wrench, 
  ToggleLeft, 
  ToggleRight, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Image as ImageIcon,
  FileType,
  Calculator,
  Languages,
  Search,
  Settings2
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';

interface PublicTool {
  id: string;
  name: string;
  key: string;
  description: string | null;
  enabled: boolean;
  category: string;
}

const TOOL_ICONS: Record<string, any> = {
  'image_to_text': ImageIcon,
  'pdf_to_word': FileType,
  'math_solver': Calculator,
  'translator': Languages,
  'plagiarism_checker': Search,
  'default': Wrench
};

export default function PublicToolsPage() {
  const [tools, setTools] = useState<PublicTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchTools = async () => {
    setLoading(true);
    try {
      // For now, we fetch tools from feature_flags table that start with 'tool_'
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .ilike('key', 'tool_%')
        .order('name', { ascending: true });

      if (error) throw error;
      
      // Map to PublicTool interface
      const mappedTools = (data || []).map(item => ({
        id: item.id,
        name: item.name.replace('Tool: ', ''),
        key: item.key.replace('tool_', ''),
        description: item.description,
        enabled: item.enabled,
        category: 'Educational'
      }));

      setTools(mappedTools);
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const handleToggle = async (id: string, currentStatus: boolean, name: string) => {
    setUpdatingId(id);
    const newStatus = !currentStatus;

    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({ enabled: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setTools(prev => prev.map(t => t.id === id ? { ...t, enabled: newStatus } : t));
    } catch (error: any) {
      alert('Error updating tool: ' + error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Public Tools Management</h1>
            <p className="text-slate-500 mt-2">Manage educational tools available on the public website.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-100 text-sm font-medium">
            <AlertCircle size={16} />
            Changes apply globally
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.length === 0 ? (
              <div className="col-span-full bg-white p-12 rounded-3xl border border-dashed border-slate-300 text-center">
                <Wrench className="mx-auto text-slate-300 mb-4" size={48} />
                <h3 className="text-lg font-bold text-slate-900">No tools configured</h3>
                <p className="text-slate-500 mt-2 max-w-md mx-auto">
                  Tools are managed via feature flags with the 'tool_' prefix. 
                  Add new tools in the database to see them here.
                </p>
              </div>
            ) : (
              tools.map(tool => {
                const Icon = TOOL_ICONS[tool.key] || TOOL_ICONS['default'];
                return (
                  <div key={tool.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all group">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tool.enabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                          <Icon size={24} />
                        </div>
                        <button
                          onClick={() => handleToggle(tool.id, tool.enabled, tool.name)}
                          disabled={updatingId === tool.id}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                            tool.enabled ? 'bg-emerald-500' : 'bg-slate-300'
                          } ${updatingId === tool.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                            tool.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{tool.name}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">
                        {tool.description || 'No description provided.'}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${tool.enabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {tool.enabled ? (
                            <>
                              <CheckCircle size={14} />
                              Active
                            </>
                          ) : (
                            <>
                              <AlertCircle size={14} />
                              Disabled
                            </>
                          )}
                        </span>
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                          <Settings2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        <div className="mt-12 bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-2xl font-bold mb-3">Custom Tool Integration</h2>
            <p className="text-indigo-100 mb-6">
              Need to add a new educational tool? You can define new tools in the feature flags table with the <code>tool_</code> prefix to have them automatically appear in this dashboard.
            </p>
            <div className="flex gap-4">
              <button className="bg-white text-indigo-900 px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-50 transition-colors">
                View Documentation
              </button>
              <button className="bg-indigo-800 text-white border border-indigo-700 px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                Request Tool
              </button>
            </div>
          </div>
          <Wrench className="absolute -right-10 -bottom-10 text-indigo-800 opacity-50" size={240} />
        </div>
      </div>
    </DashboardLayout>
  );
}
