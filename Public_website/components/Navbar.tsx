"use client";

import Link from "next/link";
import { BookOpen, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";

export function Navbar() {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 db-topbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center w-full">
        <div className="flex-shrink-0 flex items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg" style={{ color: 'var(--accent)' }}>
            <BookOpen size={20} />
            Q-Bank Pro
          </Link>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Home
          </Link>
          <Link href="/dashboard/global-question-bank" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Global Q-Bank
          </Link>
          <Link href="/dashboard/marketplace" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Marketplace
          </Link>
          {user && (
            <Link href="/dashboard" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Dashboard
            </Link>
          )}
          
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-6px" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
                <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(255,107,43,0.15)', color: 'var(--accent)' }}>
                  {(user.user_metadata?.full_name || user.email || '?')[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium max-w-[120px] truncate" style={{ color: 'var(--text-primary)' }}>
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={signOut}
                className="p-2 rounded-lg transition-all"
                style={{ color: 'var(--text-secondary)' }}
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link href="/login" className="px-4 py-2 rounded-6px btn btn-primary text-sm font-semibold">
              Login
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ color: 'var(--text-secondary)' }}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 border-t" style={{ borderColor: 'var(--divider)', background: 'var(--bg-sidebar)' }}>
          <div className="p-4 flex flex-col gap-4">
            <Link href="/" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Home
            </Link>
            <Link href="/dashboard/global-question-bank" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Global Q-Bank
            </Link>
            <Link href="/dashboard/marketplace" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Marketplace
            </Link>
            {user && (
              <Link href="/dashboard" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Dashboard
              </Link>
            )}
            {!user && (
              <Link href="/login" className="px-4 py-2 rounded-6px btn btn-primary text-sm font-semibold">
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
