"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BarChart3,
  Bell,
  CreditCard,
  BookOpen,
  ClipboardList,
  Monitor,
  Globe,
  GraduationCap,
  Users,
  UserCog,
  Palette,
  FileText,
  Settings,
  LogOut,
  Sparkles,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  Layers,
  Store,
  Tags,
  History,
  Coins,
  LayoutGrid,
  Shield,
  TrendingUp,
  Search,
  Target,
  MousePointer2,
  Database,
  Layout,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  children?: NavItem[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    title: "OVERVIEW",
    items: [
      { label: "Dashboard", href: "/", icon: <LayoutDashboard className="w-5 h-5" /> },
      { label: "Analytics", href: "/analytics", icon: <BarChart3 className="w-5 h-5" /> },
      { label: "Alerts", href: "/alerts", icon: <Bell className="w-5 h-5" />, badge: 3 },
    ],
  },
  {
    title: "PLATFORM",
    items: [
      { label: "Whiteboard Accounts", href: "/whiteboard-accounts", icon: <Users className="w-5 h-5" /> },
      { label: "Billing", href: "/billing", icon: <CreditCard className="w-5 h-5" />, badge: 2 },
    ],
  },
  {
    title: "CONTENT",
    items: [
      {
        label: "Question Bank",
        href: "/question-bank",
        icon: <BookOpen className="w-5 h-5" />,
        children: [
          { label: "Dashboard", href: "/question-bank", icon: <LayoutGrid className="w-4 h-4" /> },
          { label: "Airtable Sync", href: "/question-bank/airtable", icon: <Database className="w-4 h-4" /> },
          { label: "Questions", href: "/question-bank/questions", icon: <FileText className="w-4 h-4" /> },
          { label: "Create Question", href: "/question-bank/create", icon: <PlusCircle className="w-4 h-4" /> },
          { label: "Question Sets", href: "/question-bank/sets", icon: <Layers className="w-4 h-4" /> },
          { label: "Set Builder", href: "/question-bank/builder", icon: <MousePointer2 className="w-4 h-4" /> },
          { label: "Marketplace", href: "/question-bank/marketplace", icon: <Store className="w-4 h-4" /> },
          { label: "Question Generation", href: "/question-bank/ai-generate", icon: <Sparkles className="w-4 h-4" /> },
          { label: "AI MCQ Extractor", href: "/tools/ai-mcq-extractor", icon: <Sparkles className="w-4 h-4 text-[#FF6B2B]" /> },
          { label: "PDF to Editable Word", href: "/tools/pdf-to-word", icon: <FileText className="w-4 h-4 text-[#2196F3]" /> },
          { label: "Taxonomy", href: "/question-bank/taxonomy", icon: <Tags className="w-4 h-4" /> },
          { label: "Usage Log", href: "/question-bank/usage-log", icon: <History className="w-4 h-4" /> },
        ],
      },
      {
        label: "MockBook",
        href: "/mockbook",
        icon: <ClipboardList className="w-5 h-5" />,
        children: [
          { label: "Dashboard", href: "/mockbook", icon: <LayoutGrid className="w-4 h-4" /> },
          { label: "Exam Folders", href: "/mockbook/categories", icon: <Layers className="w-4 h-4" /> },
          { label: "Test Series", href: "/mockbook/test-series", icon: <BookOpen className="w-4 h-4" /> },
          { label: "Mock Tests", href: "/mockbook/mock-tests", icon: <FileText className="w-4 h-4" /> },
          { label: "Interface Themes", href: "/exam-interface-themes", icon: <Layout className="w-4 h-4" /> },
          { label: "Live Monitor", href: "/mockbook/live", icon: <TrendingUp className="w-4 h-4" /> },
          { label: "Students", href: "/mockbook/students", icon: <Users className="w-4 h-4" /> },
          { label: "Plans & Packs", href: "/mockbook/plans", icon: <Target className="w-4 h-4" /> },
          { label: "Analytics", href: "/mockbook/analytics", icon: <BarChart3 className="w-4 h-4" /> },
        ],
      },

      { label: "Digital Board", href: "/digital-board", icon: <Monitor className="w-5 h-5" /> },
      {
        label: "Public Website CMS",
        href: "/website",
        icon: <Globe className="w-5 h-5" />,
        children: [
          { label: "Dashboard", href: "/website", icon: <LayoutGrid className="w-4 h-4" /> },
          { label: "Plans & Packs", href: "/website/plans", icon: <Target className="w-4 h-4" /> },
          { label: "Blogs", href: "/website/blogs", icon: <FileText className="w-4 h-4" /> },
          { label: "Tools", href: "/website/tools", icon: <Layers className="w-4 h-4" /> },
          { label: "Leads", href: "/website/leads", icon: <Users className="w-4 h-4" /> },
          { label: "SEO Settings", href: "/website/seo", icon: <Search className="w-4 h-4" /> },
        ],
      },
    ],
  },
  {
    title: "APPS",
    items: [
      { label: "Student App", href: "/student-app", icon: <GraduationCap className="w-5 h-5" /> },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      { label: "Users", href: "/users", icon: <Users className="w-5 h-5" /> },
      { label: "Staff Management", href: "/admin/staff", icon: <UserCog className="w-5 h-5" /> },
      { label: "Roles & Permissions", href: "/admin/roles", icon: <Shield className="w-5 h-5" /> },
      { label: "White-Label", href: "/white-label", icon: <Palette className="w-5 h-5" /> },
      { label: "Audit Log", href: "/audit-log", icon: <FileText className="w-5 h-5" /> },
      { label: "AI Settings", href: "/settings/ai", icon: <Sparkles className="w-5 h-5 text-[#FF6B2B]" /> },
      { label: "Settings", href: "/settings", icon: <Settings className="w-5 h-5" /> },
    ],
  },
];

function NavItemComponent({ item, pathname }: { item: NavItem; pathname: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = pathname === item.href;
  const isChildActive = hasChildren && item.children?.some(child => pathname === child.href);

  const shouldExpand = isOpen || isChildActive;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center gap-3 px-3 h-[40px] transition-all duration-200 cursor-pointer",
            (isActive || isChildActive)
              ? "bg-[var(--bg-main)] text-[var(--text-primary)] border-l-[3px] border-[#FF6B2B]"
              : "text-[var(--text-secondary)] hover:bg-[rgba(128,128,128,0.06)] hover:text-[var(--text-primary)]"
          )}
        >
          <span className={cn("shrink-0", (isActive || isChildActive) ? "text-[#FF6B2B]" : "")}>{item.icon}</span>
          <span className="flex-1 text-[13px] font-normal text-left">{item.label}</span>
          {shouldExpand ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        {shouldExpand && (
          <div className="bg-[var(--bg-main)]/60 border-l-[3px] border-transparent ml-3">
            {item.children?.map((child) => {
              const childIsActive = pathname === child.href;
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    "flex items-center gap-3 pl-7 pr-3 h-[36px] transition-all duration-200 cursor-pointer",
                    childIsActive
                      ? "text-[#FF6B2B] bg-[#FF6B2B]/10"
                      : "text-[var(--text-secondary)] hover:bg-[rgba(128,128,128,0.06)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <span className="shrink-0">{child.icon}</span>
                  <span className="flex-1 text-[13px] font-normal">{child.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      key={item.href}
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 h-[40px] transition-all duration-200 cursor-pointer",
        isActive
          ? "bg-[var(--bg-main)] text-[var(--text-primary)] border-l-[3px] border-[#FF6B2B]"
          : "text-[var(--text-secondary)] hover:bg-[rgba(128,128,128,0.06)] hover:text-[var(--text-primary)]"
      )}
    >
      <span className={cn("shrink-0", isActive ? "text-[#FF6B2B]" : "")}>{item.icon}</span>
      <span className="flex-1 text-[13px] font-normal">{item.label}</span>
      {item.badge && (
        <Badge className="bg-[#FF6B2B] text-white text-[10px] px-1.5 py-0 h-5 min-w-5 flex items-center justify-center">
          {item.badge}
        </Badge>
      )}
    </Link>
  );
}

import { useSidebarStore } from "@/store/sidebarStore";

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, toggle } = useSidebarStore();

  return (
    <TooltipProvider delayDuration={0}>
      <>
        {/* Mobile Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity"
            onClick={toggle}
          />
        )}
        <aside
          className={cn(
            "fixed left-0 top-0 h-screen bg-[var(--bg-sidebar)] flex flex-col z-50 w-60 transition-transform duration-300 ease-in-out border-r border-[var(--divider)]",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Floating Toggle Button */}
          <button
            onClick={toggle}
            className="hidden md:flex absolute top-1/2 -translate-y-1/2 -right-5 w-5 h-16 bg-[var(--bg-sidebar)] items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-r-xl border border-l-0 border-[var(--divider)] transition-colors focus:outline-none"
            title={isOpen ? "Hide Sidebar" : "Show Sidebar"}
          >
            <ChevronRight className={cn("w-4 h-4 transition-transform duration-300", isOpen ? "rotate-180" : "")} />
          </button>

          {/* Logo Block */}
          <div className="h-[64px] flex items-center px-3 border-b border-[var(--divider)] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[var(--bg-card)] rounded-lg flex items-center justify-center border border-[var(--border-card)]">
                <span className="text-[#FF6B2B] font-bold text-lg">E</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[var(--text-primary)] font-semibold text-[13px]">EduHub</span>
                <Badge className="bg-[#FF6B2B] text-white text-[10px] px-1.5 py-0 h-4 -ml-0.5">
                  SUPER ADMIN
                </Badge>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-3 custom-scrollbar">
            {navigation.map((group) => (
              <div key={group.title} className="mb-3">
                <div className="px-3 mb-1.5">
                  <span className="text-[11px] font-semibold text-[var(--text-muted)] tracking-[0.8px] uppercase">
                    {group.title}
                  </span>
                </div>
                {group.items.map((item) => (
                  <NavItemComponent key={item.href} item={item} pathname={pathname} />
                ))}
              </div>
            ))}
          </nav>

          {/* User Block */}
          <div className="shrink-0 border-t border-[var(--divider)] p-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9 border-2 border-[var(--border-card)]">
                <AvatarImage />
                <AvatarFallback className="bg-[#FF6B2B] text-white text-sm font-semibold">
                  PA
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-[var(--text-primary)] text-[13px] font-medium truncate">Platform Owner</div>
                <div className="text-[var(--text-muted)] text-[11px] truncate">admin@eduhub.in</div>
              </div>
              <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>
      </>
    </TooltipProvider>
  );
}
