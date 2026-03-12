
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Flame,
  Bell,
  Search,
  User,
  Menu,
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
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet";
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
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-xl supports-[backdrop-filter]:bg-white/85 shrink-0 shadow-sm transition-all duration-300">
      <div className="flex h-14 items-center justify-between gap-4 px-4 md:px-6 max-w-full">
        {/* Left: Logo + Mobile Menu */}
        <div className="flex items-center gap-2.5">
          {user && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 rounded-xl hover:bg-slate-100 hover:shadow-md transition-all duration-200">
                  <Menu className="h-5 w-5 text-slate-600" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[280px] bg-white">
                <SheetHeader className="p-5 border-b bg-gradient-to-r from-primary/5 to-transparent">
                  <SheetTitle className="text-left font-bold text-primary flex items-center gap-2.5 text-lg">
                    {org?.logoUrl ? (
                      <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0">
                        <Image src={org.logoUrl} alt={org.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <span className="bg-primary text-white p-1.5 rounded-lg text-xs font-black w-8 h-8 flex items-center justify-center shrink-0">
                        {org?.name?.charAt(0) || "M"}
                      </span>
                    )}
                    {org?.name || "Mockbook"}
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex-1 p-3 space-y-1 pt-4">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                    return (
                      <SheetClose asChild key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium",
                            isActive
                              ? "bg-primary text-white font-semibold shadow-sm"
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                          )}
                        >
                          <item.icon className={cn("h-4.5 w-4.5 shrink-0", isActive ? "text-white" : "text-slate-400")} />
                          {item.label}
                        </Link>
                      </SheetClose>
                    );
                  })}
                  <div className="pt-3 mt-3 border-t space-y-1">
                    <SheetClose asChild>
                      <Link
                        href="/settings"
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium",
                          pathname === "/settings"
                            ? "bg-slate-100 text-slate-900 font-semibold"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                        )}
                      >
                        <Settings className="h-4 w-4 shrink-0 text-slate-400" />
                        Settings
                      </Link>
                    </SheetClose>
                  </div>
                </nav>
                {/* User info at bottom */}
                {user && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden shrink-0">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                        ) : (
                          <User className="h-4.5 w-4.5 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{user.displayName || userDoc.data?.name || "Student"}</p>
                        <p className="text-[10px] text-slate-400 truncate">{user.email || "Guest"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          )}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight text-primary">
            {org?.logoUrl ? (
              <div className="relative w-7 h-7 rounded-lg overflow-hidden shrink-0">
                <Image src={org.logoUrl} alt={org.name} fill className="object-cover" />
              </div>
            ) : (
              <span className="bg-primary text-white p-1 rounded-lg text-xs font-black w-7 h-7 flex items-center justify-center shrink-0">
                {org?.name?.charAt(0) || "M"}
              </span>
            )}
            <span className="hidden sm:inline text-slate-800">{org?.name || "Mockbook"}</span>
          </Link>
        </div>

        {/* Centre: Search (logged in only) */}
        {user && (
          <div className="hidden md:flex flex-1 max-w-sm relative mx-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              type="search"
              placeholder="Search mocks, topics..."
              className="h-9 w-full bg-slate-50 border-slate-100 pl-9 rounded-xl focus-visible:ring-primary text-sm placeholder:text-slate-400"
            />
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Points */}
              <Link href="/settings" className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 rounded-xl border border-amber-200 hover:bg-amber-100 transition-colors">
                <Coins className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                <span className="font-bold text-amber-700 text-xs">{points.toLocaleString()}</span>
              </Link>

              {/* Streak */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-50 rounded-xl border border-orange-200">
                <Flame className="h-3.5 w-3.5 text-primary fill-primary" />
                <span className="font-bold text-primary text-xs">18</span>
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl hover:bg-slate-100 hover:shadow-md transition-all duration-200">
                <Bell className="h-4.5 w-4.5 text-slate-500" />
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-red-500 border-2 border-white" />
              </Button>

              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 bg-slate-100 overflow-hidden border-2 border-transparent hover:border-primary/30 hover:shadow-lg transition-all duration-200">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="User" className="h-9 w-9 object-cover" />
                    ) : (
                      <User className="h-4 w-4 text-slate-500" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-1.5 rounded-2xl shadow-xl border-slate-100">
                  <div className="p-3 border-b mb-1.5 bg-gradient-to-r from-primary/5 to-transparent rounded-xl mb-2">
                    <p className="font-bold text-sm text-slate-800 truncate">{user?.displayName || userDoc.data?.name || "Student"}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email || "Guest User"}</p>
                  </div>

                  <DropdownMenuItem asChild className="cursor-pointer text-sm font-medium rounded-xl py-2.5 px-3">
                    <Link href="/tests" className="flex items-center gap-2.5">
                      <LayoutDashboard className="h-4 w-4 text-primary" /> Dashboard
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="cursor-pointer text-sm font-medium rounded-xl py-2.5 px-3">
                    <Link href="/tests/my-series" className="flex items-center gap-2.5">
                      <BookOpen className="h-4 w-4 text-orange-500" /> My Test Series
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="cursor-pointer text-sm font-medium rounded-xl py-2.5 px-3">
                    <Link href="/study-plans" className="flex items-center gap-2.5">
                      <Bot className="h-4 w-4 text-purple-500" /> AI Study Plans
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="cursor-pointer text-sm font-medium rounded-xl py-2.5 px-3">
                    <Link href="/analytics" className="flex items-center gap-2.5">
                      <BarChart3 className="h-4 w-4 text-blue-500" /> Analytics
                    </Link>
                  </DropdownMenuItem>

                  <div className="h-px bg-slate-100 my-1.5 mx-2" />

                  <DropdownMenuItem asChild className="cursor-pointer text-sm font-medium rounded-xl py-2.5 px-3">
                    <Link href="/profile" className="flex items-center gap-2.5">
                      <User className="h-4 w-4 text-slate-500" /> Profile
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="cursor-pointer text-sm font-medium rounded-xl py-2.5 px-3">
                    <Link href="/settings" className="flex items-center gap-2.5">
                      <Settings className="h-4 w-4 text-slate-400" /> Settings
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={handleLogout} className="text-red-500 font-semibold cursor-pointer mt-1 border-t pt-2 rounded-xl text-sm py-2.5 px-3">
                    <LogOut className="h-4 w-4 mr-2.5" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-9 text-sm font-semibold text-slate-600 rounded-xl hover:bg-slate-100 hover:shadow-sm transition-all duration-200" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" className="h-9 text-sm font-semibold bg-primary hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 rounded-xl shadow-sm shadow-primary/20 px-4 transition-all duration-200" asChild>
                <Link href="/login">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
