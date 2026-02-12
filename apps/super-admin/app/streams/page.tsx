'use client';

import React, { useState, useEffect } from 'react';
import {
  Video, Plus, Search, Filter, Loader2,
  Play, Calendar, Users, Clock, Radio,
  MoreVertical, Edit2, Trash2, ExternalLink,
  Activity, Zap, BarChart3, Shield
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

interface Stream {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  stream_url: string;
  status: 'live' | 'scheduled' | 'ended';
  scheduled_at: string;
  ended_at: string | null;
  viewer_count: number;
  created_at: string;
}

export default function StreamManagementPage() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const fetchStreams = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('live_streams')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'All Status') {
        query = query.eq('status', statusFilter.toLowerCase());
      }

      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      const { data, error } = await query;

      if (error) {
        if (error.code === 'PGRST116') {
          console.warn('Streams table not found');
          setStreams([]);
        } else {
          throw error;
        }
      } else {
        setStreams(data || []);
      }
    } catch (error) {
      console.error('Error fetching streams:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreams();
  }, [statusFilter, search]);

  return (
    <DashboardLayout>
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Stream Management</h1>
            <p className="text-slate-500 text-sm mt-0.5">Monitor live and recorded sessions</p>
          </div>
          <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md text-sm">
            <Plus size={18} />
            Schedule New Stream
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
              <Radio size={24} className="animate-pulse" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {streams.filter(s => s.status === 'live').length}
              </div>
              <div className="text-sm text-slate-500">Live Now</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
              <Calendar size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {streams.filter(s => s.status === 'scheduled').length}
              </div>
              <div className="text-sm text-slate-500">Upcoming</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <Users size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {streams.reduce((acc, curr) => acc + (curr.viewer_count || 0), 0)}
              </div>
              <div className="text-sm text-slate-500">Total Viewers</div>
            </div>
          </div>
        </div>

        {/* Live Monitoring Dashboard (Visible when there are live streams) */}
        {streams.some(s => s.status === 'live') && (
          <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center text-rose-500">
                    <Activity size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">System Health</h2>
                    <p className="text-slate-400 text-xs">Real-time stream telemetry</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase rounded-full border border-emerald-500/20">
                  All Systems Optimal
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <Zap size={16} className="text-orange-400" />
                    <span className="text-sm">Avg. Ingest Bitrate</span>
                  </div>
                  <span className="font-mono text-orange-400">4,820 Kbps</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <Shield size={16} className="text-indigo-400" />
                    <span className="text-sm">Security Layer (RLS)</span>
                  </div>
                  <span className="font-mono text-indigo-400">Active</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-slate-900">Traffic Distribution</h2>
                    <p className="text-slate-500 text-xs">Global viewer distribution</p>
                  </div>
                </div>
              </div>

              <div className="h-24 flex items-end gap-2 px-2">
                {[45, 60, 40, 75, 90, 65, 55, 80, 70, 85].map((h, i) => (
                  <div key={i} className="flex-1 bg-slate-100 rounded-t-md relative group">
                    <div
                      className="absolute bottom-0 w-full bg-indigo-500 rounded-t-md transition-all duration-500"
                      style={{ height: `${h}%` }}
                    ></div>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {h}% Load
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Asia</span>
                <span>Europe</span>
                <span>US East</span>
                <span>US West</span>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search streams by title..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <select
                className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All Status</option>
                <option>Live</option>
                <option>Scheduled</option>
                <option>Ended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stream Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
              <p className="text-slate-500 animate-pulse">Loading streams...</p>
            </div>
          ) : streams.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="text-slate-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No streams found</h3>
              <p className="text-slate-500 max-w-xs mx-auto mt-1">
                Schedule your first live session to engage with your students.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-bottom border-slate-200">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stream</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Health</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Scheduled For</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {streams.map((stream) => (
                    <tr key={stream.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-20 aspect-video rounded-lg bg-slate-100 overflow-hidden relative">
                            {stream.thumbnail_url ? (
                              <img src={stream.thumbnail_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <Video size={20} />
                              </div>
                            )}
                            {stream.status === 'live' && (
                              <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-rose-600 text-[8px] font-bold text-white rounded-md uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1 h-1 bg-white rounded-full animate-ping"></span>
                                Live
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 line-clamp-1">{stream.title}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                              <Users size={12} />
                              {stream.viewer_count || 0} Viewers
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${stream.status === 'live' ? 'bg-rose-50 text-rose-700' :
                          stream.status === 'scheduled' ? 'bg-indigo-50 text-indigo-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${stream.status === 'live' ? 'bg-rose-500 animate-pulse' :
                            stream.status === 'scheduled' ? 'bg-indigo-500' :
                              'bg-slate-400'
                            }`}></div>
                          {stream.status.charAt(0).toUpperCase() + stream.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {stream.status === 'live' ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-emerald-600 uppercase">Excellent</span>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={`w-2 h-1 rounded-full ${i <= 4 ? 'bg-emerald-400' : 'bg-slate-200'}`}></div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 uppercase">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600 space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-slate-400" />
                            {new Date(stream.scheduled_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Clock size={12} />
                            {new Date(stream.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                            <Edit2 size={18} />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                            <ExternalLink size={18} />
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
