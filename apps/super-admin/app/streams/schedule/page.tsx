'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Loader2, Clock } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { supabase } from '../../../lib/supabase';

export default function StreamSchedulePage() {
  const [scheduled, setScheduled] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from('streams')
          .select('*')
          .eq('status', 'scheduled')
          .order('start_time', { ascending: true });

        if (error && error.code !== 'PGRST116') throw error;
        setScheduled(data || []);
      } catch (e) {
        console.error(e);
        setScheduled([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <DashboardLayout>
      <div>
        <header className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">Stream Schedule</h1>
          <p className="text-slate-500 text-sm mt-0.5">Upcoming scheduled streams</p>
        </header>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-orange-500" size={32} />
          </div>
        ) : scheduled.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <Calendar className="mx-auto text-slate-300 mb-3" size={40} />
            <h3 className="text-base font-bold text-slate-900">No scheduled streams</h3>
            <p className="text-slate-500 text-sm mt-1">Scheduled streams will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {scheduled.map((s) => (
              <div key={s.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{s.title || 'Untitled'}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {s.start_time ? new Date(s.start_time).toLocaleString() : '-'}
                    </p>
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
