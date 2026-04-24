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
      { icon: Bot,           label: "AI Planner",   href: "/study-plans", badge: "NEW", badgeColor: "bg-[#FF6B2B]" },
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
        className="hidden md:flex flex-col w-44 shrink-0 fixed top-12 bottom-0 left-0 z-40 overflow-hidden"
        style={{
          background: "var(--bg-sidebar)",
          borderRight: "var(--divider)",
        }}
      >
        <div className="flex-1 overflow-y-auto py-3 no-scrollbar">
          {GROUPS.map((group, gi) => (
            <div key={gi} className={group.label ? "mb-1" : ""}>
              {group.label && (
                <p
                  className="px-4 pt-3 pb-1.5 select-none"
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.8px",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    opacity: 0.8,
                  }}
                >
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
                      "relative flex items-center gap-2.5 mx-2 px-3 rounded-md transition-all duration-200 group/item",
                      active
                        ? "font-semibold"
                        : "font-normal hover:opacity-100"
                    )}
                    style={{
                      height: "38px",
                      maxHeight: "40px",
                      color: active ? "#FF6B2B" : "var(--text-secondary)",
                      background: active ? "rgba(255,107,43,0.08)" : "transparent",
                    }}
                  >
                    {active && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                        style={{ background: "#FF6B2B" }}
                      />
                    )}
                    <item.icon
                      className="h-4 w-4 shrink-0 transition-colors"
                      style={{ color: active ? "#FF6B2B" : "var(--text-muted)" }}
                      strokeWidth={active ? 2.5 : 2}
                    />
                    <span
                      className="truncate flex-1 leading-none"
                      style={{ fontSize: "13px", fontWeight: active ? 600 : 400 }}
                    >
                      {item.label}
                    </span>
                    {item.badge && (
                      <span
                        className={cn("text-[8px] font-bold text-white px-1 py-[1px] rounded shrink-0", item.badgeColor || "bg-[#FF6B2B]")}
                      >
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
        <div className="p-3 mt-auto">
           <Link
             href="/premium"
             className="block rounded-lg p-2.5 group transition-all cursor-pointer"
             style={{
               background: "var(--bg-main)",
               border: "var(--border-card)",
             }}
           >
              <p
                className="mb-0.5"
                style={{
                  fontSize: "10px",
                  fontWeight: 800,
                  color: "#FF6B2B",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                }}
              >
                Mockbook Pro
              </p>
              <p
                className="leading-tight"
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                }}
              >
                Unlock 5000+ Premium Mock Tests
              </p>
           </Link>
        </div>
      </aside>

      <div className="hidden md:block w-44 shrink-0" />

      {/* MOBILE BOTTOM NAV - Refined */}
      <nav
        className="md:hidden fixed bottom-3 left-3 right-3 z-50 flex items-stretch h-12 rounded-xl px-1.5"
        style={{
          background: "var(--bg-sidebar)",
          border: "var(--border-card)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {MOBILE_TABS.map((item) => {
          const active = isActive(item.href, pathname);
          return (
            <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center justify-center gap-0.5 relative overflow-hidden active:scale-90 transition-transform">
              <div
                className="p-1 rounded-md transition-all"
                style={{ background: active ? "rgba(255,107,43,0.08)" : "transparent" }}
              >
                <item.icon
                  className="h-5 w-5"
                  strokeWidth={active ? 2.5 : 2}
                  style={{ color: active ? "#FF6B2B" : "var(--text-muted)" }}
                />
              </div>
              <span
                className="text-[10px] font-semibold uppercase tracking-tighter"
                style={{ color: active ? "#FF6B2B" : "var(--text-muted)" }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export const navItems = GROUPS.flatMap(g => g.items);
