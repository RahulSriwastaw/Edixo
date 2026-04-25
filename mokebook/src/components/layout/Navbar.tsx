"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Flame,
  Bell,
  Search,
  User,
  LogOut,
  LayoutDashboard,
  Settings,
  BookOpen,
  Bot,
  Zap,
  BarChart3,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useUser, useAuth, useDoc, useFirestore } from "@/firebase";
import { signOut } from "firebase/auth";
import { doc } from "firebase/firestore";
import { navItems } from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function Navbar() {
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const isFirebaseUser = user !== null && typeof (user as any).getIdToken === 'function';
  const userDoc = useDoc(isFirebaseUser && db ? doc(db, "users", user!.uid) : null);
  const points = userDoc.data?.totalPoints || 0;

  const handleLogout = async () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    if (auth) {
      try {
        await signOut(auth);
        router.push("/login");
      } catch (error) {
        console.error("Logout failed", error);
      }
    } else {
      router.push("/login");
    }
  };

  return (
    <header
      className="sticky top-0 z-50 w-full shrink-0"
      style={{
        background: "var(--bg-sidebar)",
        borderBottom: "var(--divider)",
      }}
    >
      <div className="flex h-12 items-center justify-between gap-2 px-3 md:px-4 max-w-full">

        {/* Left: Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            <span
              className="text-white p-1 rounded-md text-[10px] font-black w-6 h-6 flex items-center justify-center shrink-0"
              style={{ background: "#FF6B2B" }}
            >
              M
            </span>
            <span className="hidden sm:inline text-[16px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Mockbook
            </span>
          </Link>
        </div>

        {/* Centre: Search (logged in & desktop only) */}
        {user && (
          <div className="hidden lg:flex flex-1 max-w-md relative mx-6 group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-3.5 w-3.5 transition-colors" style={{ color: "var(--text-muted)" }} />
            </div>
            <input
              type="search"
              placeholder="Search tests, exams, topics..."
              className="h-8 w-full pl-9 pr-3 rounded-md text-[12px] font-medium transition-all"
              style={{
                background: "var(--bg-input)",
                border: "1px solid var(--border-input)",
                color: "var(--text-primary)",
              }}
            />
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <ThemeToggle />

          {user ? (
            <>
              {/* Mobile Search Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-7 w-7 rounded-md"
                style={{ color: "var(--text-secondary)" }}
                onClick={() => setMobileSearchOpen(o => !o)}
              >
                {mobileSearchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
              </Button>

              {/* Points & Streak Chip */}
              <div
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors"
                style={{
                  background: "var(--bg-main)",
                  border: "var(--border-card)",
                }}
              >
                <div className="flex items-center gap-1" style={{ color: "#FF6B2B" }}>
                  <Zap className="h-3 w-3" />
                  <span className="font-bold text-[10px] uppercase tracking-tighter">{points.toLocaleString()}</span>
                </div>
                <div className="w-px h-3 mx-0.5" style={{ background: "var(--divider)" }} />
                <div className="flex items-center gap-1" style={{ color: "#FF6B2B" }}>
                  <Flame className="h-3 w-3" />
                  <span className="font-bold text-[10px]">18</span>
                </div>
              </div>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="relative h-7 w-7 rounded-md"
                style={{ color: "var(--text-secondary)" }}
              >
                <Bell className="h-4 w-4" />
                <span
                  className="absolute top-1 right-1 flex h-1.5 w-1.5 rounded-full"
                  style={{ background: "#C62828" }}
                />
              </Button>

              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-md h-7 w-7 p-0 overflow-hidden"
                    style={{
                      background: "var(--bg-main)",
                      border: "1px solid var(--border-input)",
                    }}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      {user?.photoURL ? (
                        <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 p-1 rounded-lg mt-2"
                  style={{
                    background: "var(--bg-card)",
                    border: "var(--border-card)",
                  }}
                >
                  {/* User info */}
                  <div
                    className="p-2 mb-1 rounded-md"
                    style={{
                      background: "var(--bg-main)",
                      border: "var(--border-card)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center overflow-hidden"
                        style={{
                          background: "var(--bg-input)",
                          border: "1px solid var(--border-input)",
                        }}
                      >
                        {user?.photoURL ? (
                          <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                        ) : (
                          <User className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[11px] truncate" style={{ color: "var(--text-primary)" }}>
                          {user?.displayName || userDoc.data?.name || "Student"}
                        </p>
                        <p className="text-[9px] truncate tracking-tight" style={{ color: "var(--text-muted)" }}>
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    {[
                      { href: "/tests", icon: LayoutDashboard, label: "Dashboard" },
                      { href: "/tests/my-series", icon: BookOpen, label: "My Test Series" },
                      { href: "/study-plans", icon: Bot, label: "AI Study Plans" },
                      { href: "/analytics", icon: BarChart3, label: "Performance" },
                      { href: "/settings", icon: Settings, label: "Settings" },
                    ].map(item => (
                      <DropdownMenuItem
                        key={item.href}
                        asChild
                        className="cursor-pointer text-[11px] font-medium rounded-md py-1 px-2"
                        style={{ color: "var(--text-primary)" }}
                      >
                        <Link href={item.href} className="flex items-center gap-2 w-full">
                          <item.icon className="h-3.5 w-3.5" style={{ color: "var(--text-secondary)" }} />
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>

                  <div className="h-px my-1 mx-1" style={{ background: "var(--divider)" }} />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-[11px] font-medium rounded-md py-1 px-2"
                    style={{ color: "var(--badge-error-text)" }}
                  >
                    <LogOut className="h-3.5 w-3.5 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                className="text-[11px] font-medium rounded-md h-7 px-2.5"
                style={{ color: "var(--text-secondary)" }}
                asChild
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button
                className="text-[11px] font-bold rounded-md h-7 px-2.5 text-white border-none transition-all"
                style={{ background: "#FF6B2B" }}
                asChild
              >
                <Link href="/login">Join Free</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Bar (expandable) */}
      {user && mobileSearchOpen && (
        <div className="lg:hidden px-3 pb-2 pt-0.5">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
            <input
              type="search"
              placeholder="Search tests, exams, topics..."
              autoFocus
              className="h-8 w-full pl-9 pr-3 rounded-md text-[11px] font-medium"
              style={{
                background: "var(--bg-input)",
                border: "1px solid var(--border-input)",
                color: "var(--text-primary)",
              }}
            />
          </div>
        </div>
      )}
    </header>
  );
}
