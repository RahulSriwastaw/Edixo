"use client";

import { useState, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  CheckCircle2,
  Users,
  IndianRupee,
  Bell,
  Settings,
  LogOut,
  Building2,
  GraduationCap,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// Context for mobile sidebar state
interface OrgSidebarContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  closeSidebar: () => void;
}

const OrgSidebarContext = createContext<OrgSidebarContextType | undefined>(undefined);

export function useOrgSidebar() {
  const context = useContext(OrgSidebarContext);
  if (!context) {
    throw new Error("useOrgSidebar must be used within an OrgSidebarProvider");
  }
  return context;
}

export function OrgSidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const closeSidebar = () => setIsOpen(false);

  return (
    <OrgSidebarContext.Provider value={{ isOpen, setIsOpen, closeSidebar }}>
      {children}
    </OrgSidebarContext.Provider>
  );
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    title: "OVERVIEW",
    items: [
      { label: "Dashboard", href: "/org-admin", icon: <LayoutDashboard className="w-5 h-5" /> },
    ],
  },
  {
    title: "ACADEMICS",
    items: [
      { label: "Tests & Exams", href: "/org-admin/tests", icon: <FileText className="w-5 h-5" /> },
      { label: "Q-Bank", href: "/org-admin/q-bank", icon: <BookOpen className="w-5 h-5" /> },
      { label: "Attendance", href: "/org-admin/attendance", icon: <CheckCircle2 className="w-5 h-5" /> },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      { label: "Students", href: "/org-admin/students", icon: <GraduationCap className="w-5 h-5" /> },
      { label: "Staff", href: "/org-admin/staff", icon: <Users className="w-5 h-5" /> },
      { label: "Fees", href: "/org-admin/fees", icon: <IndianRupee className="w-5 h-5" /> },
      { label: "Notifications", href: "/org-admin/notifications", icon: <Bell className="w-5 h-5" />, badge: 3 },
    ],
  },
  {
    title: "SETTINGS",
    items: [
      { label: "Settings", href: "/org-admin/settings", icon: <Settings className="w-5 h-5" /> },
    ],
  },
];

// Mock org data
const currentOrg = {
  id: "GK-ORG-00142",
  name: "Apex Academy",
  logo: null,
  plan: "Medium",
  appType: "BOTH",
};

function NavItemComponent({ item, pathname, onNavigate }: { item: NavItem; pathname: string; onNavigate?: () => void }) {
  const isActive = pathname === item.href;

  return (
    <Link
      key={item.href}
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 px-4 h-11 transition-all duration-200 cursor-pointer",
        isActive
          ? "bg-orange-500/20 text-white border-l-[3px] border-orange-500"
          : "text-slate-300 hover:bg-white/5 hover:text-white"
      )}
    >
      <span className="shrink-0">{item.icon}</span>
      <span className="flex-1 text-sm font-medium">{item.label}</span>
      {item.badge && (
        <Badge className="bg-orange-500 text-white text-[10px] px-1.5 py-0 h-5 min-w-5 flex items-center justify-center">
          {item.badge}
        </Badge>
      )}
    </Link>
  );
}

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      {/* Logo Block */}
      <div className="h-[72px] flex items-center px-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-semibold text-sm">{currentOrg.name}</span>
            <span className="text-slate-400 text-xs font-mono">{currentOrg.id}</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        {navigation.map((group) => (
          <div key={group.title} className="mb-4">
            <div className="px-4 mb-2">
              <span className="text-[10px] font-semibold text-slate-500 tracking-wider">
                {group.title}
              </span>
            </div>
            {group.items.map((item) => (
              <NavItemComponent key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
            ))}
          </div>
        ))}
      </nav>

      {/* User Block */}
      <div className="shrink-0 border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9 border-2 border-orange-500">
            <AvatarImage src="/avatar.png" />
            <AvatarFallback className="bg-orange-500 text-white text-sm font-semibold">
              RK
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-medium truncate">Rahul Kumar</div>
            <div className="text-slate-400 text-xs truncate">Org Admin</div>
          </div>
          <button className="text-slate-400 hover:text-white transition-colors p-1">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}

export function OrgAdminSidebar() {
  const pathname = usePathname();
  const { isOpen, closeSidebar } = useOrgSidebar();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen bg-slate-900 flex-col z-50 w-60">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile Sidebar (Sheet/Drawer) */}
      <Sheet open={isOpen} onOpenChange={(open) => !open && closeSidebar()}>
        <SheetContent side="left" className="p-0 w-72 bg-slate-900 border-r-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-full">
            <SidebarContent pathname={pathname} onNavigate={closeSidebar} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
