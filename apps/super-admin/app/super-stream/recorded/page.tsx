'use client';

import React, { useState, useEffect } from 'react';
import { Video, Loader2, Play, Calendar } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { supabase } from '../../../lib/supabase';

export default function RecordedStreamsPage() {
  const [recordings, setRecordings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from('streams')
          .select('*')
          .eq('status', 'ended')
          .order('created_at', { ascending: false });

        if (error && error.code !== 'PGRST116') throw error;
        setRecordings(data || []);
      } catch (e) {
        console.error(e);
        setRecordings([]);
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
          <h1 className="text-xl font-bold text-slate-900">Recorded Streams</h1>
          <p className="text-slate-500 text-sm mt-0.5">Past stream recordings</p>
        </header>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-orange-500" size={32} />
          </div>
        ) : recordings.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <Video className="mx-auto text-slate-300 mb-3" size={40} />
            <h3 className="text-base font-bold text-slate-900">No recordings yet</h3>
            <p className="text-slate-500 text-sm mt-1">Recorded streams will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {recordings.map((r) => (
              <div key={r.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                    <Video size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{r.title || 'Untitled'}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar size={12} /> {r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}
                    </p>
                  </div>
                </div>
                <button className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                  <Play size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
