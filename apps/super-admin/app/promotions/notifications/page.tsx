'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, Send, Search, Filter, Loader2, 
  Target, Globe, Users, Clock,
  MoreVertical, Eye, Trash2, CheckCircle2,
  AlertCircle, Smartphone, Mail
} from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { supabase } from '../../../lib/supabase';

interface PushNotification {
  id: string;
  title: string;
  message: string;
  target_audience: 'all' | 'premium' | 'segment';
  sent_at: string;
  status: 'sent' | 'scheduled' | 'failed';
  clicks: number;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sent' | 'scheduled'>('sent');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('sent_at', { ascending: false });

      if (error && error.code !== 'PGRST116') throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Push Notifications</h1>
            <p className="text-slate-500">Send announcements and alerts directly to your students' devices.</p>
          </div>
          <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-indigo-200">
            <Send size={18} />
            Send New Notification
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                <Globe size={24} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Sent</div>
                <div className="text-2xl font-bold text-slate-900">1,284</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md w-fit">
              +12% from last month
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Target size={24} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg. Click Rate</div>
                <div className="text-2xl font-bold text-slate-900">24.8%</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md w-fit">
              High Engagement
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Users size={24} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subscribers</div>
                <div className="text-2xl font-bold text-slate-900">14.2k</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-1 rounded-md w-fit">
              Device: Android, iOS, Web
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-6 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('sent')}
            className={`px-6 py-3 font-bold text-sm transition-all relative ${
              activeTab === 'sent' ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            History
            {activeTab === 'sent' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 rounded-t-full"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('scheduled')}
            className={`px-6 py-3 font-bold text-sm transition-all relative ${
              activeTab === 'scheduled' ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Scheduled
            {activeTab === 'scheduled' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 rounded-t-full"></div>}
          </button>
        </div>

        {/* Notifications Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="animate-spin text-orange-600 mb-4" size={40} />
              <p className="text-slate-500 animate-pulse">Fetching records...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="text-slate-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No notifications sent yet</h3>
              <p className="text-slate-500 max-w-xs mx-auto mt-1">Your notification history will appear here once you start broadcasting.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Content</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Audience</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Engagement</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {notifications.map((notif) => (
                    <tr key={notif.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{notif.title}</div>
                          <div className="text-xs text-slate-500 truncate max-w-xs mt-0.5">{notif.message}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-wider">
                          {notif.target_audience}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            notif.status === 'sent' ? 'bg-emerald-500' : 
                            notif.status === 'scheduled' ? 'bg-amber-500' : 'bg-rose-500'
                          }`}></div>
                          <span className="text-xs text-slate-700 font-medium capitalize">{notif.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Target size={14} className="text-slate-400" />
                          <span className="text-xs font-bold">{notif.clicks} <span className="text-[10px] font-normal text-slate-400">clicks</span></span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-500 font-medium">
                          {new Date(notif.sent_at).toLocaleDateString()}<br/>
                          <span className="text-[10px] text-slate-400">{new Date(notif.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
