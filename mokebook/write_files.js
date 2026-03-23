const fs = require('fs');

const sidebar = `"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, BookOpen, Zap, Bot, User,
  BarChart3, Library, Settings,
  Sparkles, ClipboardList, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

const GROUPS = [
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

function isActive(href, pathname) {
  if (href === "/") return pathname === "/";
  return pathname === href.split("?")[0] || pathname.startsWith(href.split("?")[0] + "/");
}

export function Sidebar() {
  const pathname = usePathname() ?? "";

  return (
    <>
      <aside
        className="hidden md:flex flex-col w-52 shrink-0 fixed top-14 bottom-0 left-0 z-40 overflow-hidden bg-white"
        style={{ borderRight: "1px solid #e5e7eb" }}
      >
        <div className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: "none" }}>
          {GROUPS.map((group, gi) => (
            <div key={gi} className={group.label ? "mb-1" : ""}>
              {group.label && (
                <p className="px-4 pt-3 pb-1 text-[10px] font-bold tracking-widest uppercase text-gray-400 select-none">
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
                      "relative flex items-center gap-2.5 mx-1.5 px-3 py-2 rounded-md text-sm transition-all duration-100",
                      active
                        ? "bg-[#e8f0fe] text-[#1a73e8] font-semibold"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium"
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#1a73e8]" />
                    )}
                    <item.icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.5 : 1.8} />
                    <span className="text-[13px] truncate flex-1 leading-none">{item.label}</span>
                    {item.badge && (
                      <span className={cn("text-[9px] font-black text-white px-1.5 py-[2px] rounded-full shrink-0", item.badgeColor || "bg-blue-500")}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </aside>

      <div className="hidden md:block w-52 shrink-0" />

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch h-[56px] bg-white"
        style={{ borderTop: "1px solid #e5e7eb", boxShadow: "0 -2px 12px rgba(0,0,0,0.06)" }}
      >
        {MOBILE_TABS.map((item) => {
          const active = isActive(item.href, pathname);
          return (
            <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center justify-center gap-[3px] relative">
              {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full bg-[#1a73e8]" />}
              <item.icon className="h-[20px] w-[20px]" strokeWidth={active ? 2.5 : 1.8} style={{ color: active ? "#1a73e8" : "#94a3b8" }} />
              <span className="text-[10px] font-bold" style={{ color: active ? "#1a73e8" : "#94a3b8" }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export const navItems = GROUPS.flatMap(g => g.items);
`;

fs.writeFileSync('src/components/layout/Sidebar.tsx', sidebar, 'utf8');
console.log('Sidebar written OK, length:', sidebar.length);
console.log('First line:', sidebar.split('\n')[0]);
