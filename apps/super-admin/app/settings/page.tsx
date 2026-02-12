'use client';

import React, { useState } from 'react';
import { 
  Settings, Globe, Shield, Bell, Database, 
  Smartphone, CreditCard, Mail, Save,
  RefreshCw, Lock, User, Palette, Languages
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSaving(false);
    alert('Settings saved successfully!');
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payment', label: 'Payments', icon: CreditCard },
  ];

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Platform Settings</h1>
            <p className="text-slate-500 text-sm mt-0.5">Configure global settings</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md text-sm"
          >
            {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
            Save Changes
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-2 space-y-0.5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === tab.id 
                      ? 'bg-orange-500 text-white shadow-md' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Settings Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5">
                {activeTab === 'general' && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Platform Name</label>
                        <input 
                          type="text" 
                          defaultValue="Q_Bank"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 outline-none font-medium text-slate-900 text-sm transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Support Email</label>
                        <input 
                          type="email" 
                          defaultValue="support@qbank.com"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 outline-none font-medium text-slate-900 text-sm transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-1.5">Regional Settings</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Timezone</label>
                          <select className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 outline-none font-medium text-slate-900 text-sm transition-all bg-white">
                            <option>(GMT+05:30) Kolkata</option>
                            <option>(GMT+00:00) UTC</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Language</label>
                          <select className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 outline-none font-medium text-slate-900 text-sm transition-all bg-white">
                            <option>English (US)</option>
                            <option>Hindi</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Maintenance Mode</h3>
                      <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
                        <div className="flex gap-2">
                          <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg h-fit">
                            <Settings size={18} />
                          </div>
                          <div>
                            <div className="font-bold text-amber-900 text-xs">Platform Maintenance</div>
                            <div className="text-[11px] text-amber-700/80 mt-0.5">When active, users see a maintenance screen.</div>
                          </div>
                        </div>
                        <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-slate-200">
                          <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300 text-center py-12">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                      <Lock size={24} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Security Configuration</h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto">Manage 2FA, session timeouts, and password policies.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
