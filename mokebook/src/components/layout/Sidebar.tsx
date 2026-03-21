"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, BookOpen, Zap, Bot, User,
  BarChart3, Library, Trophy, Settings,
  Sparkles, ClipboardList, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrganization } from "@/providers/OrganizationProvider";
import Image from "next/image";

// ── Only REAL routes that exist in the app ─────────────────────────────────
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
      { icon: Bot,           label: "AI Planner",   href: "/study-plans", badge: "NEW", badgeColor: "bg-orange-500" },
      { icon: Library,       label: "My Library",   href: "/library" },
      { icon: BarChart3,     label: "Analytics",    href: "/analytics" },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      { icon: Star,          label: "Refer & Earn", href: "/refer" },
      { icon: Sparkles,      label: "Store",        href: "/store" },
      { icon: User,          label: "Profile",      href: "/profile" },
      { icon: Settings,      label: "Settings",     href: "/settings" },
    ],
  },
];

// Mobile bottom tab — 5 most used routes only
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

// ── Sidebar ────────────────────────────────────────────────────────────────
export function Sidebar() {
  const pathname = usePathname() ?? "";
  const { org } = useOrganization();

  return (
    <>
      {/* ── DESKTOP: fixed dark sidebar, content-only scrolls ── */}
      <aside
        className="
          hidden md:flex flex-col
          w-56 shrink-0
          fixed top-16 bottom-0 left-0
          z-40
          overflow-hidden        
        "
        style={{ background: "#1a1c23", borderRight: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Scrollable nav content — background stays fixed */}
        <div
          className="flex-1 overflow-y-auto py-2"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.12) transparent",
          }}
        >
          {GROUPS.map((group, gi) => (
            <div key={gi} className={group.label ? "mb-1" : ""}>
              {group.label && (
                <p
                  className="px-4 pt-4 pb-1 text-[10px] font-bold tracking-widest uppercase select-none"
                  style={{ color: "rgba(255,255,255,0.28)" }}
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
                    className="relative flex items-center gap-3 mx-2 px-3 py-[9px] rounded-xl transition-colors duration-150 group"
                    style={
                      active
                        ? { background: "rgba(255,255,255,0.10)", color: "#fff" }
                        : { color: "rgba(255,255,255,0.55)" }
                    }
                    onMouseEnter={e => {
                      if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                      if (!active) (e.currentTarget as HTMLElement).style.color = "#fff";
                    }}
                    onMouseLeave={e => {
                      if (!active) (e.currentTarget as HTMLElement).style.background = "";
                      if (!active) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)";
                    }}
                  >
                    {/* Active left pill */}
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-violet-400 rounded-r-full" />
                    )}
                    <item.icon
                      className="h-[17px] w-[17px] shrink-0"
                      strokeWidth={active ? 2.5 : 1.8}
                      style={{ color: active ? "#c4b5fd" : "inherit" }}
                    />
                    <span className="text-[13px] font-semibold truncate flex-1 leading-none">
                      {item.label}
                    </span>
                    {(item as any).badge && (
                      <span
                        className={cn(
                          "text-[9px] font-black text-white px-1.5 py-[3px] rounded-full shrink-0 leading-none",
                          (item as any).badgeColor || "bg-violet-500"
                        )}
                      >
                        {(item as any).badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </aside>

      {/* Spacer so page content doesn't go under the fixed sidebar */}
      <div className="hidden md:block w-56 shrink-0" />

      {/* ── MOBILE: fixed bottom tab bar ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch h-16"
        style={{ background: "#1a1c23", borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        {MOBILE_TABS.map((item) => {
          const active = isActive(item.href, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-[3px]"
            >
              <item.icon
                className="h-5 w-5"
                strokeWidth={active ? 2.5 : 1.8}
                style={{ color: active ? "#c4b5fd" : "rgba(255,255,255,0.4)" }}
              />
              <span
                className="text-[9px] font-bold"
                style={{ color: active ? "#c4b5fd" : "rgba(255,255,255,0.4)" }}
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
