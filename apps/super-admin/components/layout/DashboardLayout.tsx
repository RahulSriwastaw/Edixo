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
        <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
