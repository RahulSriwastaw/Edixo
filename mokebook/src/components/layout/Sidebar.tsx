
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  BookOpen, 
  Zap, 
  Bot, 
  User,
  Settings,
  Library,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

export const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: BookOpen, label: "Test Series", href: "/tests" },
  { icon: Zap, label: "Practice", href: "/practice" },
  { icon: Library, label: "My Library", href: "/library" },
  { icon: Bot, label: "AI Planner", href: "/study-plans" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: User, label: "Profile", href: "/profile" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r h-full bg-slate-50/50 backdrop-blur-xl overflow-y-auto shrink-0 relative z-40 transition-all duration-300">
      <div className="flex-1 p-4 space-y-8">
        {/* Navigation Group */}
        <div className="space-y-1">
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Main Menu</p>
          {navItems.slice(0, 4).map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group text-sm font-semibold relative",
                  isActive
                    ? "bg-white text-primary shadow-sm shadow-primary/10 border border-slate-200/50"
                    : "text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  isActive ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-slate-600"
                )}>
                  <item.icon className="h-4 w-4 shrink-0" />
                </div>
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <div className="absolute left-0 w-1 h-5 bg-primary rounded-r-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* AI & Insights Group */}
        <div className="space-y-1">
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">AI & Insights</p>
          {navItems.slice(4).map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group text-sm font-semibold relative",
                  isActive
                    ? "bg-white text-primary shadow-sm shadow-primary/10 border border-slate-200/50"
                    : "text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  isActive ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-slate-600"
                )}>
                  <item.icon className="h-4 w-4 shrink-0" />
                </div>
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <div className="absolute left-0 w-1 h-5 bg-primary rounded-r-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer / Settings */}
      <div className="p-4 border-t bg-white/50">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-semibold group",
            pathname === "/settings"
              ? "bg-white text-slate-900 shadow-sm border border-slate-200"
              : "text-slate-500 hover:text-slate-900"
          )}
        >
          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-slate-600 transition-colors">
            <Settings className="h-4 w-4 shrink-0" />
          </div>
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
