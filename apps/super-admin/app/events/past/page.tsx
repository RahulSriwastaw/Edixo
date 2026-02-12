'use client';

import React, { useState, useEffect } from 'react';
import { 
  History, Search, Filter, Loader2, 
  MapPin, Clock, Users, Video,
  MoreVertical, Eye, Download, FileText
} from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { supabase } from '../../../lib/supabase';

interface PastEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  total_attendees: number;
  recording_url?: string;
  report_url?: string;
  status: 'past';
}

export default function PastEventsPage() {
  const [events, setEvents] = useState<PastEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPastEvents = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('live_events')
          .select('*')
          .eq('status', 'past')
          .order('event_date', { ascending: false });

        if (error && error.code !== 'PGRST116') throw error;
        setEvents(data || []);
      } catch (error) {
        console.error('Error fetching past events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPastEvents();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Past Events Archive</h1>
          <p className="text-slate-500">Review completed sessions, recordings, and attendance reports.</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search past events..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-orange-600 mb-4" size={40} />
              <p className="text-slate-500 animate-pulse">Retrieving archive...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <History className="text-slate-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Archive is empty</h3>
              <p className="text-slate-500 max-w-xs mx-auto mt-1">
                Completed events will appear here once they are moved to the archive.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-bottom border-slate-200">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Event Details</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendees</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Resources</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-bold text-slate-900">{event.title}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <MapPin size={12} />
                            {event.location || 'Online Session'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">
                          {new Date(event.event_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-slate-400" />
                          <span className="text-sm font-medium text-slate-700">{event.total_attendees || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-slate-400 hover:text-orange-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Recording">
                            <Video size={18} />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Download Report">
                            <Download size={18} />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                            <Eye size={18} />
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
