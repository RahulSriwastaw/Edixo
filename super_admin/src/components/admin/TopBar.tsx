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
  Building2,
  PlusCircle,
  BookOpen,
  Sparkles,
  Clock,
  ArrowRight,
  LayoutDashboard,
  CreditCard,
  Users,
  GraduationCap,
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

// Breadcrumb mapping
const routeLabels: Record<string, string> = {
  "/": "Dashboard",
  "/analytics": "Analytics",
  "/alerts": "Alerts",
  "/organizations": "Organizations",
  "/unique-ids": "Unique IDs",
  "/billing": "Billing",
  "/question-bank": "Question Bank",
  "/mockbook": "MockBook",
  "/digital-board": "Digital Board",
  "/website": "Public Website CMS",
  "/student-app": "Student App",
  "/org-admin": "Org Admin Control",
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
    message: "₹15,000 from Brilliant Coaching",
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
  { type: "organization", name: "Apex Academy", id: "GK-ORG-00142" },
  { type: "organization", name: "Brilliant Coaching", id: "GK-ORG-00089" },
  { type: "user", name: "Rajesh Kumar", id: "GK-TCH-00892" },
  { type: "question", name: "Newton's Laws of Motion", id: "Q-00001" },
  { type: "invoice", name: "INV-2026-001", id: "₹15,000" },
];

// Quick actions for command palette
const quickActions = [
  { label: "Create Question", icon: PlusCircle, href: "/question-bank/create", shortcut: "Q" },
  { label: "AI Generate Questions", icon: Sparkles, href: "/question-bank/ai-generate", shortcut: "G" },
  { label: "New Organization", icon: Building2, href: "/organizations/new", shortcut: "N" },
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

  // Recent searches - initialize from localStorage on client
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    // This runs only on initial render
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

  // Keyboard shortcut for command palette
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

  // Build breadcrumb
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = [{ label: "Home", href: "/" }];

  let currentPath = "";
  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`;
    if (routeLabels[currentPath]) {
      breadcrumbs.push({ label: routeLabels[currentPath], href: currentPath });
    }
  });

  // If on root, just show Dashboard
  if (pathname === "/") {
    breadcrumbs.length = 0;
    breadcrumbs.push({ label: "Dashboard", href: "/" });
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Handle search selection
  const handleSelect = (type: string, id: string) => {
    // Add to recent searches
    const newRecent = [`${type}:${id}`, ...recentSearches.filter(s => s !== `${type}:${id}`)].slice(0, 6);
    setRecentSearches(newRecent);
    localStorage.setItem(recentSearchKey, JSON.stringify(newRecent));

    // Navigate
    switch (type) {
      case "organization":
        router.push(`/organizations/${id}`);
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

  // Handle quick action
  const handleQuickAction = (href: string) => {
    router.push(href);
    setCommandOpen(false);
  };

  // Filter search results based on query
  const filteredResults = searchQuery
    ? searchResults.filter((r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b border-neutral-border flex items-center px-6 gap-4 shrink-0 transition-all duration-300">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm flex-1">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.href} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
            <a
              href={crumb.href}
              className={`${index === breadcrumbs.length - 1
                ? "text-gray-900 font-medium"
                : "text-gray-500 hover:text-gray-700"
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
        className="w-64 justify-between text-gray-500 bg-gray-50 border-gray-200 hover:bg-gray-100"
        onClick={() => setCommandOpen(true)}
      >
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4" />
          <span>Search...</span>
        </div>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-gray-200 bg-gray-100 px-1.5 font-mono text-[10px] font-medium text-gray-500">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Notifications */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5 text-gray-500" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-brand-primary rounded-full" />
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-80">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              Notifications
              {unreadCount > 0 && (
                <Badge className="bg-brand-primary text-white">{unreadCount} new</Badge>
              )}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border transition-colors cursor-pointer ${notification.read
                  ? "bg-gray-50 border-gray-100"
                  : "bg-brand-primary-tint border-brand-primary/20"
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${notification.type === "org"
                      ? "bg-green-500"
                      : notification.type === "payment"
                        ? "bg-orange-500"
                        : notification.type === "alert"
                          ? "bg-yellow-500"
                          : "bg-blue-500"
                      }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900">
                      {notification.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {notification.message}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {notification.time}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full mt-4 text-brand-primary">
            View All Notifications
          </Button>
        </SheetContent>
      </Sheet>

      {/* User Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 px-2">
            <Avatar className="w-9 h-9">
              <AvatarImage src="/avatar.png" />
              <AvatarFallback className="bg-brand-primary text-white text-sm font-semibold">
                PA
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium text-gray-900">Platform Owner</div>
              <div className="text-xs text-gray-500">Super Admin</div>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <FileText className="mr-2 h-4 w-4" />
            Audit Log
          </DropdownMenuItem>
          <DropdownMenuItem>
            <HelpCircle className="mr-2 h-4 w-4" />
            Help & Support
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Command Palette */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput
          placeholder="Search organizations, users, questions... or type > for actions"
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList className="max-h-[400px]">
          <CommandEmpty>No results found.</CommandEmpty>

          {/* Show quick actions when query starts with > */}
          {searchQuery.startsWith(">") && (
            <CommandGroup heading="Quick Actions">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <CommandItem
                    key={action.label}
                    onSelect={() => handleQuickAction(action.href)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-[#F4511E]" />
                      <span>{action.label}</span>
                    </div>
                    <CommandShortcut>⌘{action.shortcut}</CommandShortcut>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {/* Show recent searches when query is empty */}
          {!searchQuery && recentSearches.length > 0 && (
            <CommandGroup heading="Recent Searches">
              {recentSearches.map((search) => {
                const [type, id] = search.split(":");
                const result = searchResults.find(r => r.type === type && r.id === id);
                if (!result) return null;
                return (
                  <CommandItem
                    key={search}
                    onSelect={() => handleSelect(type, id)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{result.name}</span>
                    </div>
                    <span className="mono text-xs text-gray-400">{id}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {/* Show quick actions when query is empty */}
          {!searchQuery && (
            <CommandGroup heading="Quick Actions">
              {quickActions.slice(0, 4).map((action) => {
                const Icon = action.icon;
                return (
                  <CommandItem
                    key={action.label}
                    onSelect={() => handleQuickAction(action.href)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-[#F4511E]" />
                      <span>{action.label}</span>
                    </div>
                    <CommandShortcut>⌘{action.shortcut}</CommandShortcut>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {/* Search results when there's a query */}
          {searchQuery && !searchQuery.startsWith(">") && (
            <>
              {filteredResults.filter((r) => r.type === "organization").length > 0 && (
                <>
                  <CommandGroup heading="Organizations">
                    {filteredResults
                      .filter((r) => r.type === "organization")
                      .map((result) => (
                        <CommandItem
                          key={result.id}
                          onSelect={() => handleSelect(result.type, result.id)}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-blue-500" />
                            <span>{result.name}</span>
                          </div>
                          <span className="mono text-xs text-gray-400">{result.id}</span>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}

              {filteredResults.filter((r) => r.type === "user").length > 0 && (
                <>
                  <CommandGroup heading="Users">
                    {filteredResults
                      .filter((r) => r.type === "user")
                      .map((result) => (
                        <CommandItem
                          key={result.id}
                          onSelect={() => handleSelect(result.type, result.id)}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-green-500" />
                            <span>{result.name}</span>
                          </div>
                          <span className="mono text-xs text-gray-400">{result.id}</span>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}

              {filteredResults.filter((r) => r.type === "question").length > 0 && (
                <>
                  <CommandGroup heading="Questions">
                    {filteredResults
                      .filter((r) => r.type === "question")
                      .map((result) => (
                        <CommandItem
                          key={result.id}
                          onSelect={() => handleSelect(result.type, result.id)}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-purple-500" />
                            <span>{result.name}</span>
                          </div>
                          <span className="mono text-xs text-gray-400">{result.id}</span>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}

              {filteredResults.filter((r) => r.type === "invoice").length > 0 && (
                <CommandGroup heading="Invoices">
                  {filteredResults
                    .filter((r) => r.type === "invoice")
                    .map((result) => (
                      <CommandItem
                        key={result.id}
                        onSelect={() => handleSelect(result.type, result.id)}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-orange-500" />
                          <span>{result.name}</span>
                        </div>
                        <span className="mono text-xs text-gray-400">{result.id}</span>
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}
            </>
          )}

          {/* Hint for quick actions */}
          {searchQuery === "" && (
            <div className="p-2 text-xs text-gray-400 text-center border-t">
              Type <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">&gt;</kbd> for quick actions
            </div>
          )}
        </CommandList>
      </CommandDialog>
    </header>
  );
}
