"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardSidebar, SidebarToggleBtn } from '../../components/dashboard/DashboardSidebar';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  // On mobile, default sidebar closed
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-body)' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)', margin: '0 auto 8px' }} />
          <div style={{ fontSize: 13 }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="db-layout">
      <DashboardSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(v => !v)} />

      {/* Main content */}
      <div
        style={{
          flex: 1,
          marginLeft: sidebarOpen ? '220px' : '0',
          minHeight: '100vh',
          background: 'var(--bg-body)',
          transition: 'margin-left 0.25s ease',
        }}
      >
        {/* Topbar */}
        <div className="db-topbar">
          <SidebarToggleBtn onClick={() => setSidebarOpen(v => !v)} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Welcome, <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{user?.name || user?.email}</span>
            </span>
          </div>
        </div>

        {/* Page content */}
        <main style={{ padding: '20px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
