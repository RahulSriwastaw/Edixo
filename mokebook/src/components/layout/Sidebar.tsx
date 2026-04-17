"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, BookOpen, Zap, Bot, User,
  BarChart3, Library, Settings,
  Sparkles, ClipboardList, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { LucideIcon } from "lucide-react";

type NavItem = {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: string;
  badgeColor?: string;
};

type NavGroup = {
  label: string | null;
  items: NavItem[];
};

const GROUPS: NavGroup[] = [
  {
    label: null,
    items: [
      { icon: Home,          label: "Home",         href: "/" },
    ],
  },
  {
    label: "TESTS",
    items: [
      { icon: ClipboardList, label: "Test Series",  href: "/tests" },
      { icon: Zap,           label: "Practice",     href: "/practice" },
    ],
  },
  {
    label: "LEARNING",
    items: [
      { icon: Bot,           label: "AI Planner",   href: "/study-plans", badge: "NEW", badgeColor: "bg-blue-500" },
      { icon: Library,       label: "My Library",   href: "/library" },
      { icon: BarChart3,     label: "Analytics",    href: "/analytics" },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      { icon: Star,          label: "Refer & Earn", href: "/refer" },
      { icon: User,          label: "Profile",      href: "/profile" },
      { icon: Settings,      label: "Settings",     href: "/settings" },
    ],
  },
];

const MOBILE_TABS = [
  { icon: Home,          label: "Home",    href: "/" },
  { icon: ClipboardList, label: "Tests",   href: "/tests" },
  { icon: Zap,           label: "Practice",href: "/practice" },
  { icon: Bot,           label: "AI",      href: "/study-plans" },
  { icon: User,          label: "Profile", href: "/profile" },
];

function isActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  return pathname === href.split("?")[0] || pathname.startsWith(href.split("?")[0] + "/");
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside
        className="hidden md:flex flex-col w-48 shrink-0 fixed top-14 bottom-0 left-0 z-40 overflow-hidden bg-[#0a111d]"
        style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex-1 overflow-y-auto py-4 no-scrollbar">
          {GROUPS.map((group, gi) => (
            <div key={gi} className={group.label ? "mb-2" : ""}>
              {group.label && (
                <p className="px-5 pt-4 pb-2 text-[10px] font-black tracking-[2px] uppercase text-slate-500 select-none opacity-80">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => {
                const active = isActive(item.href, pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-2.5 mx-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group/item",
                      active
                        ? "bg-blue-600/10 text-blue-400 font-bold"
                        : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-100 font-medium"
                    )}
                  >
                    {active && (
                      <span className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]" />
                    )}
                    <item.icon className={cn("h-4 w-4 shrink-0 transition-colors", active ? "text-blue-400" : "text-slate-500 group-hover/item:text-slate-300")} strokeWidth={active ? 2.5 : 2} />
                    <span className="text-[12px] truncate flex-1 leading-none tracking-tight">{item.label}</span>
                    {item.badge && (
                      <span className={cn("text-[8px] font-black text-white px-1 py-[1px] rounded shrink-0 shadow-sm", item.badgeColor || "bg-blue-600")}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
        
        {/* Bottom decorative section or PRO upgrade */}
        <div className="p-4 mt-auto">
           <Link href="/premium" className="block bg-white/5 rounded-xl p-3 border border-white/5 group hover:border-blue-500/30 transition-all cursor-pointer">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Mockbook Pro</p>
              <p className="text-[11px] text-slate-400 font-bold leading-tight">Unlock 5000+ Premium Mock Tests</p>
           </Link>
        </div>
      </aside>

      <div className="hidden md:block w-48 shrink-0" />

      {/* MOBILE BOTTOM NAV - Refined */}
      <nav
        className="md:hidden fixed bottom-4 left-4 right-4 z-50 flex items-stretch h-14 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-[0_8px_32px_rgba(0,0,0,0.12)] px-2"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {MOBILE_TABS.map((item) => {
          const active = isActive(item.href, pathname);
          return (
            <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center justify-center gap-1 relative overflow-hidden active:scale-90 transition-transform">
              <div className={cn("p-1.5 rounded-xl transition-all", active ? "bg-blue-50" : "bg-transparent")}>
                <item.icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} style={{ color: active ? "#1a73e8" : "#94a3b8" }} />
              </div>
              <span className={cn("text-[10px] font-bold uppercase tracking-tighter", active ? "text-[#1a73e8]" : "text-[#94a3b8]")}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export const navItems = GROUPS.flatMap(g => g.items);
