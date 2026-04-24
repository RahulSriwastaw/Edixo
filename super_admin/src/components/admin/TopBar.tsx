"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Bell,
  ChevronRight,
  User,
  FileText,
  HelpCircle,
  LogOut,
  Settings,
  PlusCircle,
  BookOpen,
  Sparkles,
  Clock,
  ArrowRight,
  LayoutDashboard,
  CreditCard,
  Users,
  GraduationCap,
  Menu,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/components/theme-provider";

// Breadcrumb mapping
const routeLabels: Record<string, string> = {
  "/": "Dashboard",
  "/analytics": "Analytics",
  "/alerts": "Alerts",
  "/unique-ids": "Unique IDs",
  "/billing": "Billing",
  "/question-bank": "Question Bank",
  "/mockbook": "MockBook",
  "/digital-board": "Digital Board",
  "/website": "Public Website CMS",
  "/student-app": "Student App",
  "/users": "Users",
  "/white-label": "White-Label",
  "/audit-log": "Audit Log",
  "/settings": "Settings",
};

// Mock notification data
const notifications = [
  {
    id: 1,
    type: "org",
    title: "New organization onboarded",
    message: "Apex Academy has completed signup",
    time: "5 min ago",
    read: false,
  },
  {
    id: 2,
    type: "payment",
    title: "Payment received",
    message: "15,000 from Brilliant Coaching",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 3,
    type: "alert",
    title: "AI Service degraded",
    message: "Response time increased to 320ms",
    time: "2 hours ago",
    read: true,
  },
  {
    id: 4,
    type: "id",
    title: "New Unique ID generated",
    message: "GK-TCH-00892 for Apex Academy",
    time: "3 hours ago",
    read: true,
  },
];

// Mock search results
const searchResults = [
  { type: "account", name: "Demo Teacher 1", id: "teacher_01" },
  { type: "account", name: "Demo Teacher 2", id: "teacher_02" },
  { type: "user", name: "Rajesh Kumar", id: "GK-TCH-00892" },
  { type: "question", name: "Newton's Laws of Motion", id: "Q-00001" },
  { type: "invoice", name: "INV-2026-001", id: "15,000" },
];

// Quick actions for command palette
const quickActions = [
  { label: "Create Question", icon: PlusCircle, href: "/question-bank/create", shortcut: "Q" },
  { label: "AI Generate Questions", icon: Sparkles, href: "/question-bank/ai-generate", shortcut: "G" },
  { label: "Whiteboard Accounts", icon: Users, href: "/whiteboard-accounts", shortcut: "W" },
  { label: "Go to Dashboard", icon: LayoutDashboard, href: "/", shortcut: "D" },
  { label: "View Billing", icon: CreditCard, href: "/billing", shortcut: "B" },
  { label: "Manage Users", icon: Users, href: "/users", shortcut: "U" },
  { label: "Student App", icon: GraduationCap, href: "/student-app", shortcut: "S" },
];

// Recent searches (persisted in localStorage)
const recentSearchKey = "eduhub-recent-searches";

import { useSidebarStore } from "@/store/sidebarStore";

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isOpen, toggle } = useSidebarStore();
  const { theme, toggleTheme } = useTheme();

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem(recentSearchKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = [{ label: "Home", href: "/" }];

  let currentPath = "";
  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`;
    if (routeLabels[currentPath]) {
      breadcrumbs.push({ label: routeLabels[currentPath], href: currentPath });
    }
  });

  if (pathname === "/") {
    breadcrumbs.length = 0;
    breadcrumbs.push({ label: "Dashboard", href: "/" });
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSelect = (type: string, id: string) => {
    const newRecent = [`${type}:${id}`, ...recentSearches.filter((s) => s !== `${type}:${id}`)].slice(0, 6);
    setRecentSearches(newRecent);
    localStorage.setItem(recentSearchKey, JSON.stringify(newRecent));

    switch (type) {
      case "account":
        router.push(`/whiteboard-accounts?search=${encodeURIComponent(id)}`);
        break;
      case "user":
        router.push(`/users?id=${id}`);
        break;
      case "question":
        router.push(`/question-bank/questions`);
        break;
      case "invoice":
        router.push(`/billing`);
        break;
    }
    setCommandOpen(false);
  };

  const handleQuickAction = (href: string) => {
    router.push(href);
    setCommandOpen(false);
  };

  const filteredResults = searchQuery
    ? searchResults.filter(
      (r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  return (
    <header className="sticky top-0 z-40 h-14 bg-[var(--bg-main)] border-b border-[var(--divider)] flex items-center px-4 md:px-5 gap-3 md:gap-4 shrink-0 transition-all duration-300">
      {/* Mobile Hamburger Menu */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden -ml-2 shrink-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
        onClick={toggle}
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Breadcrumb */}
      <nav className="hidden md:flex items-center gap-1 text-[13px] flex-1">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.href} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />}
            <a
              href={crumb.href}
              className={`${index === breadcrumbs.length - 1
                ? "text-[var(--text-primary)] font-medium"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                } transition-colors`}
            >
              {crumb.label}
            </a>
          </div>
        ))}
      </nav>

      {/* Global Search */}
      <Button
        variant="outline"
        className="flex-1 md:flex-none md:w-60 justify-between text-[var(--text-muted)] bg-[var(--bg-card)] border-[var(--border-input)] hover:bg-[var(--bg-sidebar)] hover:text-[var(--text-secondary)] px-3"
        onClick={() => setCommandOpen(true)}
      >
        <div className="flex items-center gap-2 truncate">
          <Search className="w-4 h-4 shrink-0" />
          <span className="truncate text-[13px]">Search...</span>
        </div>
        <kbd className="hidden md:inline-flex pointer-events-none h-5 select-none items-center gap-1 rounded border border-[var(--border-input)] bg-[var(--bg-sidebar)] px-1.5 font-mono text-[10px] font-medium text-[var(--text-muted)] shrink-0">
          <span className="text-xs">K</span>K
        </kbd>
      </Button>

      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </Button>

      {/* Notifications */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF6B2B] rounded-full" />
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-80 bg-[var(--bg-card)] border-l border-[var(--border-card)]">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between text-[var(--text-primary)] text-[13px] font-semibold">
              Notifications
              {unreadCount > 0 && <Badge className="bg-[#FF6B2B] text-white">{unreadCount} new</Badge>}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border transition-colors cursor-pointer ${notification.read
                  ? "bg-[var(--bg-main)] border-[var(--divider)]"
                  : "bg-[#FF6B2B]/10 border-[#FF6B2B]/20"
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${notification.type === "org"
                      ? "bg-[#4CAF50]"
                      : notification.type === "payment"
                        ? "bg-[#FF6B2B]"
                        : notification.type === "alert"
                          ? "bg-[#FFC107]"
                          : "bg-[#2196F3]"
                      }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[13px] text-[var(--text-primary)]">
                      {notification.title}
                    </div>
                    <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                      {notification.message}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-1">{notification.time}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full mt-4 text-[#FF6B2B] hover:bg-[#FF6B2B]/10">
            View All Notifications
          </Button>
        </SheetContent>
      </Sheet>

      {/* User Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-[var(--bg-card)]">
            <Avatar className="w-8 h-8">
              <AvatarImage />
              <AvatarFallback className="bg-[#FF6B2B] text-white text-sm font-semibold">PA</AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <div className="text-[13px] font-medium text-[var(--text-primary)]">Platform Owner</div>
              <div className="text-[11px] text-[var(--text-secondary)]">Super Admin</div>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-[var(--bg-card)] border-[var(--border-card)]">
          <DropdownMenuLabel className="text-[var(--text-primary)]">My Account</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-[var(--divider)]" />
          <DropdownMenuItem className="text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)] focus:bg-[var(--bg-sidebar)]">
            <User className="mr-2 h-4 w-4 text-[var(--text-secondary)]" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem className="text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)] focus:bg-[var(--bg-sidebar)]">
            <FileText className="mr-2 h-4 w-4 text-[var(--text-secondary)]" />
            Audit Log
          </DropdownMenuItem>
          <DropdownMenuItem className="text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)] focus:bg-[var(--bg-sidebar)]">
            <HelpCircle className="mr-2 h-4 w-4 text-[var(--text-secondary)]" />
            Help & Support
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[var(--divider)]" />
          <DropdownMenuItem
            className="text-[#F44336] cursor-pointer hover:bg-[var(--badge-error-bg)] focus:bg-[var(--badge-error-bg)]"
            onClick={() => {
              document.cookie = "sb_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
              router.push("/login");
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Command Palette */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput
          placeholder="Search accounts, users, questions... or type > for actions"
          value={searchQuery}
          onValueChange={setSearchQuery}
          className="bg-[var(--bg-sidebar)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] border-b border-[var(--divider)]"
        />
        <CommandList className="max-h-[400px] bg-[var(--bg-card)]">
          <CommandEmpty className="text-[var(--text-secondary)]">No results found.</CommandEmpty>

          {searchQuery.startsWith(">") && (
            <CommandGroup
              heading="Quick Actions"
              className="text-[var(--text-muted)] text-[11px] uppercase tracking-[0.8px]"
            >
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <CommandItem
                    key={action.label}
                    onSelect={() => handleQuickAction(action.href)}
                    className="flex items-center justify-between text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)]"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-[#FF6B2B]" />
                      <span className="text-[13px]">{action.label}</span>
                    </div>
                    <CommandShortcut className="text-[var(--text-muted)]">
                      K{action.shortcut}
                    </CommandShortcut>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {!searchQuery && recentSearches.length > 0 && (
            <CommandGroup
              heading="Recent Searches"
              className="text-[var(--text-muted)] text-[11px] uppercase tracking-[0.8px]"
            >
              {recentSearches.map((search) => {
                const [type, id] = search.split(":");
                const result = searchResults.find((r) => r.type === type && r.id === id);
                if (!result) return null;
                return (
                  <CommandItem
                    key={search}
                    onSelect={() => handleSelect(type, id)}
                    className="flex items-center justify-between text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)]"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[var(--text-muted)]" />
                      <span className="text-[13px]">{result.name}</span>
                    </div>
                    <span className="mono text-[11px] text-[var(--text-muted)]">{id}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {!searchQuery && (
            <CommandGroup
              heading="Quick Actions"
              className="text-[var(--text-muted)] text-[11px] uppercase tracking-[0.8px]"
            >
              {quickActions.slice(0, 4).map((action) => {
                const Icon = action.icon;
                return (
                  <CommandItem
                    key={action.label}
                    onSelect={() => handleQuickAction(action.href)}
                    className="flex items-center justify-between text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)]"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-[#FF6B2B]" />
                      <span className="text-[13px]">{action.label}</span>
                    </div>
                    <CommandShortcut className="text-[var(--text-muted)]">
                      K{action.shortcut}
                    </CommandShortcut>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {searchQuery && !searchQuery.startsWith(">") && (
            <>
              {filteredResults.filter((r) => r.type === "account").length > 0 && (
                <>
                  <CommandGroup
                    heading="Whiteboard Accounts"
                    className="text-[var(--text-muted)] text-[11px] uppercase tracking-[0.8px]"
                  >
                    {filteredResults
                      .filter((r) => r.type === "account")
                      .map((result) => (
                        <CommandItem
                          key={result.id}
                          onSelect={() => handleSelect(result.type, result.id)}
                          className="flex items-center justify-between text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)]"
                        >
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-[#2196F3]" />
                            <span className="text-[13px]">{result.name}</span>
                          </div>
                          <span className="mono text-[11px] text-[var(--text-muted)]">{result.id}</span>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                  <CommandSeparator className="bg-[var(--divider)]" />
                </>
              )}

              {filteredResults.filter((r) => r.type === "user").length > 0 && (
                <>
                  <CommandGroup
                    heading="Users"
                    className="text-[var(--text-muted)] text-[11px] uppercase tracking-[0.8px]"
                  >
                    {filteredResults
                      .filter((r) => r.type === "user")
                      .map((result) => (
                        <CommandItem
                          key={result.id}
                          onSelect={() => handleSelect(result.type, result.id)}
                          className="flex items-center justify-between text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)]"
                        >
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-[#4CAF50]" />
                            <span className="text-[13px]">{result.name}</span>
                          </div>
                          <span className="mono text-[11px] text-[var(--text-muted)]">{result.id}</span>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                  <CommandSeparator className="bg-[var(--divider)]" />
                </>
              )}

              {filteredResults.filter((r) => r.type === "question").length > 0 && (
                <>
                  <CommandGroup
                    heading="Questions"
                    className="text-[var(--text-muted)] text-[11px] uppercase tracking-[0.8px]"
                  >
                    {filteredResults
                      .filter((r) => r.type === "question")
                      .map((result) => (
                        <CommandItem
                          key={result.id}
                          onSelect={() => handleSelect(result.type, result.id)}
                          className="flex items-center justify-between text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)]"
                        >
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-[#9C27B0]" />
                            <span className="text-[13px]">{result.name}</span>
                          </div>
                          <span className="mono text-[11px] text-[var(--text-muted)]">{result.id}</span>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                  <CommandSeparator className="bg-[var(--divider)]" />
                </>
              )}

              {filteredResults.filter((r) => r.type === "invoice").length > 0 && (
                <CommandGroup
                  heading="Invoices"
                  className="text-[var(--text-muted)] text-[11px] uppercase tracking-[0.8px]"
                >
                  {filteredResults
                    .filter((r) => r.type === "invoice")
                    .map((result) => (
                      <CommandItem
                        key={result.id}
                        onSelect={() => handleSelect(result.type, result.id)}
                        className="flex items-center justify-between text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)]"
                      >
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-[#FF6B2B]" />
                          <span className="text-[13px]">{result.name}</span>
                        </div>
                        <span className="mono text-[11px] text-[var(--text-muted)]">{result.id}</span>
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}
            </>
          )}

          {searchQuery === "" && (
            <div className="p-2 text-[11px] text-[var(--text-muted)] text-center border-t border-[var(--divider)]">
              Type{" "}
              <kbd className="px-1.5 py-0.5 bg-[var(--bg-card)] border border-[var(--border-card)] rounded text-[var(--text-secondary)]">
                {'>'}
              </kbd>{" "}
              for quick actions
            </div>
          )}
        </CommandList>
      </CommandDialog>
    </header>
  );
}
