"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Flame,
  Bell,
  Search,
  User,
  Coins,
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
import { cn } from "@/lib/utils";
import { useOrganization } from "@/providers/OrganizationProvider";
import Image from "next/image";
import { useState } from "react";

export function Navbar() {
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const { org } = useOrganization();
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
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100 shrink-0 shadow-sm">
      <div className="flex h-14 items-center justify-between gap-2 px-3 md:px-5 max-w-full">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            {org?.logoUrl ? (
              <div className="relative w-7 h-7 rounded-lg overflow-hidden shrink-0 shadow-sm border border-slate-100">
                <Image src={org.logoUrl} alt={org.name} fill className="object-cover" />
              </div>
            ) : (
              <span
                className="text-white p-1.5 rounded-lg text-[10px] font-black w-7 h-7 flex items-center justify-center shrink-0 shadow-sm"
                style={{ background: "linear-gradient(135deg, #1a73e8, #0057d9)" }}
              >
                {org?.name?.charAt(0) || "M"}
              </span>
            )}
            <span className="hidden sm:inline text-[15px] font-black tracking-tight text-[#0f1b2d]">
              {org?.name || "Mockbook"}
            </span>
          </Link>
        </div>

        {/* Centre: Search (logged in & desktop only) */}
        {user && (
          <div className="hidden lg:flex flex-1 max-w-md relative mx-8 group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-3.5 w-3.5 text-slate-400 group-focus-within:text-[#1a73e8] transition-colors" />
            </div>
            <input
              type="search"
              placeholder="Search tests, exams, topics..."
              className="h-9 w-full bg-slate-50 border border-slate-200 pl-9 pr-3 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-[#1a73e8] text-[13px] font-medium placeholder:text-slate-400 transition-all"
            />
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {user ? (
            <>
              {/* Mobile Search Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-8 w-8 rounded-lg hover:bg-slate-50"
                onClick={() => setMobileSearchOpen(o => !o)}
              >
                {mobileSearchOpen ? <X className="h-4 w-4 text-slate-600" /> : <Search className="h-4 w-4 text-slate-600" />}
              </Button>

              {/* Points & Streak Chip */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/50 border border-blue-100/50 rounded-lg group hover:bg-blue-50 transition-colors">
                <div className="flex items-center gap-1 text-[#1a73e8]">
                  <Zap className="h-3.5 w-3.5 fill-[#1a73e8]" />
                  <span className="font-black text-[11px] uppercase tracking-tighter">{points.toLocaleString()}</span>
                </div>
                <div className="w-px h-3 bg-blue-200/50 mx-0.5" />
                <div className="flex items-center gap-1 text-orange-500">
                  <Flame className="h-3.5 w-3.5 fill-orange-500" />
                  <span className="font-black text-[11px]">18</span>
                </div>
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-lg hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                <Bell className="h-4 w-4 text-slate-600" />
                <span className="absolute top-1.5 right-1.5 flex h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white" />
              </Button>

              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8 p-0 overflow-hidden border border-slate-200 hover:border-[#1a73e8]/30 transition-all bg-slate-50">
                    <div className="w-full h-full flex items-center justify-center">
                      {user?.photoURL ? (
                        <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-1.5 rounded-xl shadow-2xl border-slate-100 mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* User info */}
                  <div className="p-3 mb-1.5 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-200 overflow-hidden">
                        {user?.photoURL ? (
                          <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                        ) : (
                          <User className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-[13px] text-[#0f1b2d] truncate">{user?.displayName || userDoc.data?.name || "Student"}</p>
                        <p className="text-[11px] font-bold text-slate-400 truncate tracking-tight">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    {[
                      { href: "/tests", icon: LayoutDashboard, label: "Dashboard", color: "text-[#1a73e8]" },
                      { href: "/tests/my-series", icon: BookOpen, label: "My Test Series", color: "text-orange-500" },
                      { href: "/study-plans", icon: Bot, label: "AI Study Plans", color: "text-emerald-500" },
                      { href: "/analytics", icon: BarChart3, label: "Performance", color: "text-[#1a73e8]" },
                      { href: "/settings", icon: Settings, label: "Settings", color: "text-slate-400" },
                    ].map(item => (
                      <DropdownMenuItem key={item.href} asChild className="cursor-pointer text-[13px] font-bold rounded-lg py-2 px-3 focus:bg-slate-50 focus:text-[#1a73e8] transition-colors">
                        <Link href={item.href} className="flex items-center gap-2.5 w-full">
                          <item.icon className={cn("h-4 w-4", item.color)} />
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>

                  <div className="h-px bg-slate-50 my-1 mx-1" />

                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-[13px] font-bold rounded-lg py-2 px-3 text-red-500 focus:bg-red-50 focus:text-red-600 transition-colors">
                    <LogOut className="h-4 w-4 mr-2.5" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <Button variant="ghost" className="text-[13px] font-bold rounded-lg text-slate-600 h-8 px-3" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button
                className="text-[13px] font-black rounded-lg h-8 px-4 text-white border-none shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                style={{ background: "#1a73e8" }}
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
        <div className="lg:hidden px-3 pb-3 pt-1 animate-in slide-in-from-top duration-300">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#1a73e8]" />
            <input
              type="search"
              placeholder="Search tests, exams, topics..."
              autoFocus
              className="h-10 w-full bg-slate-50 border border-slate-200 pl-10 pr-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-[#1a73e8] text-sm font-medium"
            />
          </div>
        </div>
      )}
    </header>
  );
}
