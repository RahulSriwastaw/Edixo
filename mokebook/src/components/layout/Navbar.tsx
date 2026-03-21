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
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export function Navbar() {
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const { org } = useOrganization();

  // Only query Firestore for Firebase-authenticated users (not custom backend users)
  const isFirebaseUser = user !== null && typeof (user as any).getIdToken === 'function';
  const userDoc = useDoc(isFirebaseUser && db ? doc(db, "users", user!.uid) : null);
  const points = userDoc.data?.totalPoints || 0;

  const handleLogout = async () => {
    // Clear custom backend token
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
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 shrink-0 transition-all duration-300">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-8 max-w-full">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            {org?.logoUrl ? (
              <div className="relative w-9 h-9 rounded-xl overflow-hidden shrink-0 transition-transform group-hover:scale-105">
                <Image src={org.logoUrl} alt={org.name} fill className="object-cover" />
              </div>
            ) : (
              <span className="bg-primary text-white p-2 rounded-xl text-xs font-black w-9 h-9 flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
                {org?.name?.charAt(0) || "M"}
              </span>
            )}
            <span className="hidden sm:inline text-xl font-bold tracking-tight text-slate-900 group-hover:text-primary transition-colors">{org?.name || "Mockbook"}</span>
          </Link>
        </div>

        {/* Centre: Search (logged in only) */}
        {user && (
          <div className="hidden md:flex flex-1 max-w-md relative mx-8 group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            </div>
            <Input
              type="search"
              placeholder="Search mock tests, topics, or AI plans..."
              className="h-11 w-full bg-slate-100/50 border-transparent pl-11 rounded-2xl focus-visible:bg-white focus-visible:ring-primary/20 focus-visible:border-primary/30 text-sm placeholder:text-slate-500 transition-all shadow-none hover:bg-slate-100"
            />
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
              <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-white px-1.5 font-mono text-[10px] font-medium text-slate-400 opacity-100 shadow-sm">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Points & Streak Group */}
              <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-100/50 rounded-2xl border border-slate-200/50">
                <Link href="/settings" className="flex items-center gap-2 px-3 py-1.5 hover:bg-white rounded-xl transition-all group">
                  <Coins className="h-4 w-4 text-amber-500 fill-amber-500 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-slate-700 text-xs">{points.toLocaleString()}</span>
                </Link>
                <div className="w-px h-4 bg-slate-300 mx-1" />
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl group cursor-default">
                  <Flame className="h-4 w-4 text-orange-500 fill-orange-500 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-slate-700 text-xs">18</span>
                </div>
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-slate-100 transition-all group">
                <Bell className="h-5 w-5 text-slate-600 group-hover:text-primary transition-colors" />
                <span className="absolute top-2.5 right-2.5 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              </Button>

              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-2xl h-10 w-10 p-0 overflow-hidden border-2 border-transparent hover:border-primary/20 hover:shadow-lg transition-all">
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      {user?.photoURL ? (
                        <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-5 w-5 text-slate-500" />
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 p-2 rounded-3xl shadow-2xl border-slate-100 mt-2">
                  <div className="p-4 mb-2 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-200 overflow-hidden">
                        {user?.photoURL ? (
                          <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                        ) : (
                          <User className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-900 truncate">{user?.displayName || userDoc.data?.name || "Student"}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <DropdownMenuItem asChild className="cursor-pointer text-sm font-semibold rounded-xl py-3 px-4 focus:bg-primary/5 focus:text-primary transition-colors">
                      <Link href="/tests" className="flex items-center gap-3 w-full">
                        <LayoutDashboard className="h-4.5 w-4.5" /> Dashboard
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="cursor-pointer text-sm font-semibold rounded-xl py-3 px-4 focus:bg-primary/5 focus:text-primary transition-colors">
                      <Link href="/tests/my-series" className="flex items-center gap-3 w-full">
                        <BookOpen className="h-4.5 w-4.5 text-orange-500" /> My Test Series
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="cursor-pointer text-sm font-semibold rounded-xl py-3 px-4 focus:bg-primary/5 focus:text-primary transition-colors">
                      <Link href="/study-plans" className="flex items-center gap-3 w-full">
                        <Bot className="h-4.5 w-4.5 text-purple-500" /> AI Study Plans
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="cursor-pointer text-sm font-semibold rounded-xl py-3 px-4 focus:bg-primary/5 focus:text-primary transition-colors">
                      <Link href="/analytics" className="flex items-center gap-3 w-full">
                        <BarChart3 className="h-4.5 w-4.5 text-blue-500" /> Performance
                      </Link>
                    </DropdownMenuItem>
                  </div>

                  <div className="h-px bg-slate-100 my-2 mx-2" />

                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-sm font-semibold rounded-xl py-3 px-4 text-red-600 focus:bg-red-50 focus:text-red-700 transition-colors">
                    <LogOut className="h-4.5 w-4.5 mr-3" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="text-sm font-semibold rounded-xl text-slate-600" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button className="text-sm font-bold rounded-xl px-6 bg-primary shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all" asChild>
                <Link href="/login">Join Free</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
