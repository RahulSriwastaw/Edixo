'use client';

import React, { useState } from 'react';
import { DollarSign, Loader2 } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';

export default function TeacherPayoutsPage() {
  const [loading] = useState(false);

  return (
    <DashboardLayout>
      <div>
        <header className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">Teacher Payouts</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage teacher earnings and payouts</p>
        </header>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-orange-500" size={32} />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <DollarSign className="mx-auto text-slate-300 mb-3" size={40} />
            <h3 className="text-base font-bold text-slate-900">Payout management</h3>
            <p className="text-slate-500 text-sm mt-1">Configure and view teacher payouts.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
