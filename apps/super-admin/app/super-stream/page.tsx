'use client';

import React, { useState, useEffect } from 'react';
import { 
  Radio, Plus, Search, Filter, Loader2, 
  Play, Calendar, Users, Clock, Zap,
  Settings, Monitor, Share2, MessageSquare,
  ChevronRight, AlertCircle
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';

export default function SuperStreamPage() {
  const [activeStreams, setActiveStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuperStreams = async () => {
      setLoading(true);
      try {
        // Fetching streams across all organizations for super admin view
        const { data, error } = await supabase
          .from('streams')
          .select('*, organizations(name)')
          .eq('status', 'live')
          .order('viewer_count', { ascending: false });

        if (error && error.code !== 'PGRST116') throw error;
        setActiveStreams(data || []);
      } catch (error) {
        console.error('Error fetching super streams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuperStreams();
  }, []);

  return (
    <DashboardLayout>
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wider">
                Super Admin
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">Super Stream Control</h1>
            <p className="text-slate-500">Global monitoring and management of all active streams.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-all">
              <Settings size={18} />
              Global Settings
            </button>
            <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-orange-200">
              <Plus size={18} />
              New Multi-Stream
            </button>
          </div>
        </div>

        {/* Live Overview Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Monitor */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-slate-900 rounded-2xl aspect-video relative overflow-hidden group border border-slate-800 shadow-2xl">
              {activeStreams.length > 0 ? (
                <>
                  <img 
                    src={activeStreams[0].thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'} 
                    alt="Main Stream" 
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all group/play border border-white/30">
                      <Play size={40} className="ml-2 fill-current" />
                    </button>
                  </div>
                  <div className="absolute top-6 left-6 flex items-center gap-3">
                    <div className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg flex items-center gap-2 animate-pulse shadow-lg">
                      <Radio size={14} />
                      LIVE MONITORING
                    </div>
                    <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md text-white text-xs font-medium rounded-lg flex items-center gap-2 border border-white/10">
                      <Users size={14} />
                      {activeStreams[0].viewer_count || 0} Viewers
                    </div>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 p-6 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl">
                    <div className="text-white text-xl font-bold mb-2">{activeStreams[0].title}</div>
                    <div className="flex items-center gap-4 text-white/70 text-sm">
                      <span className="flex items-center gap-1.5">
                        <Monitor size={14} />
                        {activeStreams[0].organizations?.name || 'Main Platform'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} />
                        Started 45 mins ago
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-12 text-center">
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Radio size={40} className="text-slate-600" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No Active Streams</h3>
                  <p className="text-slate-400 max-w-md">
                    There are currently no live sessions across the platform. You can schedule a global announcement stream here.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all group text-left">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100 mb-3">
                  <Share2 size={20} />
                </div>
                <div className="font-bold text-slate-900 text-sm">Distribute</div>
                <div className="text-xs text-slate-500">Push to all orgs</div>
              </button>
              <button className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all group text-left">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 mb-3">
                  <MessageSquare size={20} />
                </div>
                <div className="font-bold text-slate-900 text-sm">Broadcast</div>
                <div className="text-xs text-slate-500">Global message</div>
              </button>
              <button className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50 transition-all group text-left">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 group-hover:bg-amber-100 mb-3">
                  <Zap size={20} />
                </div>
                <div className="font-bold text-slate-900 text-sm">Optimize</div>
                <div className="text-xs text-slate-500">CDN Routing</div>
              </button>
              <button className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-rose-500 hover:bg-rose-50 transition-all group text-left">
                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 group-hover:bg-rose-100 mb-3">
                  <AlertCircle size={20} />
                </div>
                <div className="font-bold text-slate-900 text-sm">Emergency</div>
                <div className="text-xs text-slate-500">Kill all streams</div>
              </button>
            </div>
          </div>

          {/* Sidebar Streams */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Radio size={16} className="text-rose-500" />
                  Active Sessions
                </h3>
                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-full">
                  {activeStreams.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[600px] p-4 space-y-4">
                {loading ? (
                  <div className="py-12 flex flex-col items-center">
                    <Loader2 className="animate-spin text-indigo-600 mb-2" size={32} />
                    <p className="text-sm text-slate-500">Scanning servers...</p>
                  </div>
                ) : activeStreams.length === 0 ? (
                  <div className="py-12 text-center text-slate-500">
                    <Monitor size={32} className="mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No other live streams</p>
                  </div>
                ) : (
                  activeStreams.map((stream, idx) => (
                    <div key={stream.id} className="p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer group">
                      <div className="flex gap-3">
                        <div className="w-20 aspect-video rounded-lg bg-slate-100 overflow-hidden shrink-0 relative">
                          <img src={stream.thumbnail_url} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-900 line-clamp-1 mb-1">{stream.title}</div>
                          <div className="text-[10px] text-slate-500 mb-2">{stream.organizations?.name}</div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                              <Users size={10} />
                              {stream.viewer_count}
                            </span>
                            <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-slate-200 bg-slate-50/50">
                <button className="w-full py-2.5 text-indigo-600 text-sm font-bold hover:bg-indigo-50 rounded-xl transition-colors">
                  View Multi-Grid
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg shadow-orange-200">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <Zap size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">Global Broadcast</h3>
              <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                Send an immediate notification or video pop-up to all active students across all organizations.
              </p>
              <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
                Start Global Stream
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
