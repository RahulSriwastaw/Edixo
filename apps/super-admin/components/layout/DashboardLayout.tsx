'use client';

import Sidebar from './Sidebar';
import AuthGuard from '../auth/AuthGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 ml-60 p-5 overflow-y-auto h-screen">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
