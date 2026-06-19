"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, BookOpen, ShoppingBag, BookMarked, Sparkles,
  LogOut, Sun, Moon, Menu, X, ChevronRight, Layers, Plus, FolderOpen,
  Globe, History, Eye
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Main' },
  { href: '/dashboard/my-question-bank', label: 'My Question Bank', icon: BookMarked, section: 'Question Bank' },
  { href: '/dashboard/my-questions', label: 'All My Questions', icon: BookOpen, section: 'Question Bank' },
  { href: '/dashboard/public-questions', label: 'Public Questions', icon: Eye, section: 'Question Bank' },
  { href: '/dashboard/marketplace', label: 'Marketplace', icon: ShoppingBag, section: 'Question Bank' },
  { href: '/dashboard/purchased', label: 'Purchased Packs', icon: ShoppingBag, section: 'Question Bank' },
  { href: '/dashboard/my-sets', label: 'My Sets', icon: Layers, section: 'Question Bank' },
  { href: '/dashboard/ai-creator', label: 'AI Generator', icon: Sparkles, section: 'Question Bank' },
  { href: '/dashboard/usage-log', label: 'Usage Log', icon: History, section: 'Question Bank' },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function DashboardSidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, signOut, theme, toggleTheme } = useAuth();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={onToggle} />
      )}

      <aside
        style={{
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--divider)',
          width: '220px',
          position: 'fixed',
          top: 0, left: 0, bottom: 0,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(-220px)',
          transition: 'transform 0.25s ease',
        }}
      >
        <div style={{ padding: '16px 14px', borderBottom: '1px solid var(--divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={16} color="#fff" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Q-Bank</span>
          </div>
          <button onClick={onToggle} className="btn btn-ghost btn-icon" style={{ padding: 4 }}>
            <X size={14} />
          </button>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {['Main', 'Question Bank'].map(section => (
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
    </>
  );
}

export function SidebarToggleBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="btn btn-ghost btn-icon" aria-label="Toggle sidebar">
      <Menu size={18} />
    </button>
  );
}