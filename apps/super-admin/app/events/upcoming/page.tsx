'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Plus, Search, Filter, Loader2, 
  MapPin, Clock, Users, ExternalLink,
  MoreVertical, Edit2, Trash2, CheckCircle2,
  AlertCircle, Share2
} from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

interface LiveEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  meeting_link: string;
  max_attendees: number;
  current_attendees: number;
  status: 'upcoming' | 'ongoing' | 'past';
  created_at: string;
}

export default function UpcomingEventsPage() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('live_events')
        .select('*')
        .neq('status', 'past')
        .order('event_date', { ascending: true });

      if (error) {
        if (error.code === 'PGRST116') {
          setEvents([]);
        } else {
          throw error;
        }
      } else {
        setEvents(data || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Upcoming Live Events</h1>
            <p className="text-slate-500">Manage webinars, workshops, and live sessions.</p>
          </div>
          <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-indigo-200">
            <Plus size={18} />
            Create New Event
          </button>
        </div>

        {/* Search & Filter */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search events by title or location..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 font-medium">
              <Filter size={18} />
              Filters
            </button>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-orange-600 mb-4" size={40} />
            <p className="text-slate-500 animate-pulse">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Calendar size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No upcoming events</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8">
              Get started by scheduling your first live educational event.
            </p>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-all">
              Create Event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                      <Calendar size={24} />
                    </div>
                    <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      event.status === 'ongoing' ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      {event.status}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-6">
                    {event.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Clock size={16} className="text-slate-400" />
                      {new Date(event.event_date).toLocaleDateString()} at {event.start_time}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <MapPin size={16} className="text-slate-400" />
                      {event.location || 'Online Session'}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Users size={16} className="text-slate-400" />
                      {event.current_attendees || 0} / {event.max_attendees || '∞'} Registered
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex gap-2">
                    <button className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-100 rounded-lg transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <a 
                    href={event.meeting_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-orange-600 font-bold text-sm hover:underline"
                  >
                    Join Link
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
