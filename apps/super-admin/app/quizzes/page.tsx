'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function QuizzesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/quizzes/list');
  }, [router]);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-orange-500" size={32} />
          <p className="text-sm text-slate-500">Redirecting to Quiz List...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
