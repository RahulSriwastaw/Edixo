'use client';

import React, { useState } from 'react';
import { Mail, Save } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';

export default function EmailSettingsPage() {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    alert('Email settings saved.');
  };

  return (
    <DashboardLayout>
      <div>
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Email Configuration</h1>
            <p className="text-slate-500 text-sm mt-0.5">SMTP and notification email settings</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 text-sm"
          >
            <Save size={18} />
            Save
          </button>
        </header>
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SMTP Host</label>
            <input
              type="text"
              placeholder="smtp.example.com"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">From Email</label>
            <input
              type="email"
              placeholder="noreply@qbank.com"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 outline-none"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
