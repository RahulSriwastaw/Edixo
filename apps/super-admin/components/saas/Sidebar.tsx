'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  PlusSquare, 
  Database, 
  Users, 
  Settings, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { OrganizationSwitcher } from './OrganizationSwitcher';
import { Avatar } from './ui/Avatar';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/saas-dashboard' },
  { icon: BookOpen, label: 'Courses', href: '/courses' },
  { icon: FileText, label: 'Tests', href: '/quizzes/list' },
  { icon: Zap, label: 'Extract', href: '/extract' },
  { icon: PlusSquare, label: 'Create', href: '/content/add' },
  { icon: Database, label: 'Resources', href: '/content' },
  { icon: Users, label: 'Users', href: '/admin/staff' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export function Sidebar({ 
  isCollapsed, 
  setIsCollapsed 
}: { 
  isCollapsed: boolean; 
  setIsCollapsed: (v: boolean) => void 
}) {
  const pathname = usePathname();

  return (
    <div 
      className={cn(
        "fixed left-0 top-0 bottom-0 bg-white border-r border-[#E5E7EB] transition-all duration-300 z-50 flex flex-col",
        isCollapsed ? "w-[80px]" : "w-[240px]"
      )}
    >
      {/* Top Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-[#E5E7EB]">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 bg-[#FF5A1F] rounded-lg flex items-center justify-center text-white font-black text-lg">
              K
            </div>
            <span className="font-bold text-slate-900 text-base tracking-tight">Q_Bank</span>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-7 w-7 flex items-center justify-center rounded-lg border border-[#E5E7EB] text-slate-400 hover:text-[#FF5A1F] hover:bg-[#FFF7ED] transition-all"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Org Switcher */}
      <div className="p-3">
        {isCollapsed ? (
          <div className="flex justify-center">
            <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-[#FFF7ED] text-[#FF5A1F] border border-[#E5E7EB]">
              <Zap size={18} />
            </div>
          </div>
        ) : (
          <OrganizationSwitcher />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-bold transition-all group relative",
                isActive 
                  ? "bg-[#FFF7ED] text-[#FF5A1F]" 
                  : "text-slate-500 hover:bg-[#F9FAFB] hover:text-slate-900",
                isCollapsed && "justify-center"
              )}
            >
              {isActive && !isCollapsed && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-[#FF5A1F] rounded-r-full" />
              )}
              <item.icon 
                size={18} 
                className={cn(
                  "transition-colors",
                  isActive ? "text-[#FF5A1F]" : "text-slate-400 group-hover:text-slate-600"
                )} 
              />
              {!isCollapsed && <span>{item.label}</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-[#E5E7EB] space-y-4">
        {!isCollapsed && (
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all">
            <ExternalLink size={16} />
            Student Portal
          </button>
        )}
        
        <div className={cn(
          "flex items-center gap-3",
          isCollapsed ? "justify-center" : "px-2"
        )}>
          <Avatar fallback="Rahul" src="" className="h-9 w-9" />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold text-slate-900 truncate">Rahul Sharma</div>
              <div className="text-[11px] text-[#6B7280] truncate">rahul@example.com</div>
            </div>
          )}
          {!isCollapsed && (
            <button className="text-slate-400 hover:text-rose-600 transition-colors">
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
