"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Globe, Layers, ShoppingBag, Plus, Sparkles, Upload, History, Settings, LayoutDashboard, LogOut, Sun, Moon, Menu, X, ChevronRight, ArrowLeft } from 'lucide-react';

const navItems = [
  { href: '/question-bank', label: 'Dashboard', icon: LayoutDashboard, section: 'My Question Bank' },
  { href: '/question-bank/questions', label: 'All My Questions', icon: BookOpen, section: 'My Question Bank' },
  { href: '/question-bank/create', label: 'Create Question', icon: Plus, section: 'My Question Bank' },
  { href: '/question-bank/sets', label: 'My Sets', icon: Layers, section: 'My Question Bank' },
  { href: '/dashboard/marketplace', label: 'Marketplace', icon: ShoppingBag, section: 'My Question Bank' },
  { href: '/dashboard/public-questions', label: 'Public Questions', icon: Globe, section: 'My Question Bank' },
  { href: '/dashboard/purchased', label: 'Purchased Packs', icon: ShoppingBag, section: 'My Question Bank' },
  { href: '/question-bank/ai-generate', label: 'AI Generate', icon: Sparkles, section: 'My Question Bank' },
  { href: '/question-bank/usage-log', label: 'Usage Log', icon: History, section: 'My Question Bank' },
];

export default function QuestionBankLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut, theme, toggleTheme } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-body)' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 13 }}>Loading...</div>
        </div>
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="db-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside style={{
        background: 'var(--bg-sidebar)', borderRight: '1px solid var(--divider)', width: '220px',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50, display: 'flex', flexDirection: 'column',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-220px)', transition: 'transform 0.25s ease'
      }}>
        <div style={{ padding: '16px 14px', borderBottom: '1px solid var(--divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={16} color="#fff" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Q-Bank</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="btn btn-ghost btn-icon" style={{ padding: 4 }}>
            <X size={14} />
          </button>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {['My Question Bank'].map(section => (
            <div key={section}>
              <div style={{ padding: '6px 14px 4px', marginBottom: 2 }}>
                <span className="section-header">{section}</span>
              </div>
              {navItems.filter(i => i.section === section).map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
                return (
                  <Link key={href} href={href} className={`nav-item ${isActive ? 'nav-item-active' : ''}`}>
                    <Icon size={15} />
                    <span>{label}</span>
                    {isActive && <ChevronRight size={12} style={{ marginLeft: 'auto' }} />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid var(--divider)', padding: '10px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '6px 0' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || 'User'}
              </div>
              <div className="card-meta" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={toggleTheme} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
              {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
            <button onClick={signOut} className="btn btn-ghost btn-sm btn-icon" title="Sign out">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div style={{
        flex: 1, marginLeft: sidebarOpen ? '220px' : '0', minHeight: '100vh',
        background: 'var(--bg-body)', transition: 'margin-left 0.25s ease'
      }}>
        <div className="db-topbar">
          <button onClick={() => setSidebarOpen(v => !v)} className="btn btn-ghost btn-icon" aria-label="Toggle sidebar">
            <Menu size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Welcome, <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{user?.name || user?.email}</span>
            </span>
          </div>
        </div>
        <main style={{ padding: '20px' }}>{children}</main>
      </div>
    </div>
  );
}