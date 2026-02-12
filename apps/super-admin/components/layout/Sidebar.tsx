'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  Shield,
  MonitorPlay,
  Wrench,
  BarChart3,
  Image as ImageIcon,
  Tv,
  PlayCircle,
  GraduationCap,
  Calendar,
  UserCheck,
  Megaphone,
  UserSquare2,
  FileSpreadsheet,
  HelpCircle,
  MoreHorizontal,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

interface SubMenuItem {
  label: string;
  href: string;
}

interface MenuItem {
  icon: any;
  label: string;
  href?: string;
  subItems?: SubMenuItem[];
}

const menuGroups = [
  {
    title: 'MAIN',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
      { 
        icon: FileText, 
        label: 'Content', 
        subItems: [
          { label: 'All Content', href: '/content' },
          { label: 'Add Content', href: '/content/add' },
        ] 
      },
      { 
        icon: Shield, 
        label: 'Admin', 
        subItems: [
          { label: 'Staff Management', href: '/admin/staff' },
          { label: 'Role Permissions', href: '/admin/roles' },
        ] 
      },
      { icon: Users, label: 'Users', href: '/users' },
      { 
        icon: ImageIcon, 
        label: 'Banner', 
        subItems: [
          { label: 'All Banners', href: '/banners' },
          { label: 'Add Banner', href: '/banners/add' },
        ] 
      },
      { 
        icon: Tv, 
        label: 'Super Stream', 
        subItems: [
          { label: 'Live Streams', href: '/super-stream/live' },
          { label: 'Recorded', href: '/super-stream/recorded' },
        ] 
      },
      { 
        icon: PlayCircle, 
        label: 'Stream', 
        subItems: [
          { label: 'Channel List', href: '/streams' },
          { label: 'Schedule', href: '/streams/schedule' },
        ] 
      },
      { 
        icon: GraduationCap, 
        label: 'Courses', 
        subItems: [
          { label: 'Course List', href: '/courses' },
          { label: 'Categories', href: '/courses/categories' },
        ] 
      },
      { 
        icon: Calendar, 
        label: 'Live Event', 
        subItems: [
          { label: 'Upcoming', href: '/events/upcoming' },
          { label: 'Past Events', href: '/events/past' },
        ] 
      },
      { 
        icon: UserCheck, 
        label: 'Assign Courses', 
        subItems: [
          { label: 'Bulk Assign', href: '/assign/bulk' },
          { label: 'Individual', href: '/assign/individual' },
        ] 
      },
      { 
        icon: Megaphone, 
        label: 'Promotion', 
        subItems: [
          { label: 'Coupons', href: '/promotions/coupons' },
          { label: 'Notifications', href: '/promotions/notifications' },
        ] 
      },
      { 
        icon: UserSquare2, 
        label: 'Teacher', 
        subItems: [
          { label: 'Teacher List', href: '/teachers' },
          { label: 'Payouts', href: '/teachers/payouts' },
        ] 
      },
      { 
        icon: FileSpreadsheet, 
        label: 'OMR Sheet', 
        subItems: [
          { label: 'Templates', href: '/omr/templates' },
          { label: 'Results', href: '/omr/results' },
        ] 
      },
      { 
        icon: HelpCircle, 
        label: 'Quiz', 
        subItems: [
          { label: 'Quiz List', href: '/quizzes/list' },
          { label: 'Question Bank', href: '/quizzes/questions' },
        ] 
      },
      { 
        icon: Settings, 
        label: 'Setting', 
        subItems: [
          { label: 'General', href: '/settings' },
          { label: 'Email Config', href: '/settings/email' },
        ] 
      },
      { 
        icon: MoreHorizontal, 
        label: 'Other', 
        subItems: [
          { label: 'Logs', href: '/other/logs' },
          { label: 'Backups', href: '/other/backups' },
        ] 
      },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#1a1c2e] text-slate-300 flex flex-col border-r border-slate-800/50 shadow-xl z-50">
      {/* Brand Logo Section */}
      <div className="p-3">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-3 rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 group hover:scale-[1.02] transition-transform cursor-pointer">
          <div className="bg-white/20 p-1.5 rounded-lg">
            <Shield size={20} className="text-white" />
          </div>
          <h1 className="font-black text-base text-white tracking-tight">Q_Bank</h1>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-2 pb-2 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-0.5">
            <p className="px-3 text-[9px] font-bold text-slate-500 tracking-widest uppercase mb-2">
              {group.title}
            </p>
            <div className="space-y-1">
              {group.items.map((item, iIdx) => {
                const isHasSubItems = item.subItems && item.subItems.length > 0;
                const isOpen = openMenus.includes(item.label);
                const isActive = item.href ? (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))) : false;

                return (
                  <div key={iIdx} className="space-y-1">
                    {item.href ? (
                      <Link
                        href={item.href}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 group ${
                          isActive 
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20' 
                            : 'hover:bg-slate-800/50 hover:text-white'
                        }`}
                      >
                        <item.icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-orange-400'} />
                        <span className="font-medium text-[13px] flex-1">{item.label}</span>
                      </Link>
                    ) : (
                      <button
                        onClick={() => toggleMenu(item.label)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 group ${
                          isOpen 
                            ? 'bg-slate-800/40 text-white' 
                            : 'hover:bg-slate-800/50 hover:text-white'
                        }`}
                      >
                        <div className={`p-1 rounded-md ${isOpen ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-800 text-slate-400 group-hover:text-orange-400'}`}>
                          <item.icon size={16} />
                        </div>
                        <span className="font-medium text-[13px] flex-1 text-left">{item.label}</span>
                        {isHasSubItems && (
                          <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                            <ChevronDown size={14} className="text-slate-500" />
                          </div>
                        )}
                      </button>
                    )}

                    {/* Sub-menu Items */}
                    {isHasSubItems && isOpen && (
                      <div className="ml-8 space-y-0.5 pt-0.5 pb-1.5">
                        {item.subItems?.map((sub, sIdx) => {
                          const isSubActive = pathname === sub.href;
                          return (
                            <Link
                              key={sIdx}
                              href={sub.href}
                              className={`block px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors ${
                                isSubActive 
                                  ? 'bg-orange-500/10 text-orange-400' 
                                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                              }`}
                            >
                              {sub.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="p-2 border-t border-slate-800/50 bg-[#161827]">
        <div className="flex items-center gap-2 px-2 py-2 mb-1.5">
          <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30 shrink-0">
            <span className="text-[10px] font-bold text-orange-400">SA</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-white truncate">Super Admin</p>
            <p className="text-[9px] text-slate-500 truncate">admin@qbank.com</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full transition-all duration-200 group text-left">
          <div className="p-1 rounded-md bg-red-500/10 group-hover:bg-red-500/20">
            <LogOut size={16} />
          </div>
          <span className="font-medium text-[12px]">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
