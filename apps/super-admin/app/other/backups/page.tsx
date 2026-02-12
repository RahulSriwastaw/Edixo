'use client';

import React, { useState } from 'react';
import { Database, Loader2, Download } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';

export default function BackupsPage() {
  const [loading] = useState(false);

  return (
    <DashboardLayout>
      <div>
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Backups</h1>
            <p className="text-slate-500 text-sm mt-0.5">Database and data backups</p>
          </div>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 text-sm">
            <Download size={18} />
            Create Backup
          </button>
        </header>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-orange-500" size={32} />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <Database className="mx-auto text-slate-300 mb-3" size={40} />
            <h3 className="text-base font-bold text-slate-900">No backups yet</h3>
            <p className="text-slate-500 text-sm mt-1">Create backups to protect your data.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
