"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BarChart3,
  Bell,
  Building2,
  Fingerprint,
  CreditCard,
  BookOpen,
  ClipboardList,
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
    ],
  },
  {
    title: "CONTENT MANAGEMENT",
    items: [
      {
        label: "Question Bank",
        href: "/question-bank",
        icon: <BookOpen className="w-5 h-5" />,
        children: [
          { label: "Dashboard", href: "/question-bank", icon: <LayoutGrid className="w-4 h-4" /> },
          { label: "Questions", href: "/question-bank/questions", icon: <FileText className="w-4 h-4" /> },
          { label: "Create Question", href: "/question-bank/create", icon: <PlusCircle className="w-4 h-4" /> },
          { label: "Question Sets", href: "/question-bank/sets", icon: <Layers className="w-4 h-4" /> },
          { label: "Marketplace", href: "/question-bank/marketplace", icon: <Store className="w-4 h-4" /> },
          { label: "Generative AI", href: "/question-bank/ai-generate", icon: <Sparkles className="w-4 h-4" /> },
          { label: "Question Reports", href: "/question-bank/reports", icon: <ClipboardList className="w-4 h-4" /> },
        ],
      },
      { label: "MockBook", href: "/mockbook", icon: <ClipboardList className="w-5 h-5" /> },
    ],
  },
  {
    title: "USER MANAGEMENT",
    items: [
      { label: "Students", href: "/students", icon: <GraduationCap className="w-5 h-5" /> },
      { label: "Batches", href: "/batches", icon: <Users className="w-5 h-5" /> },
      { label: "Student App Control", href: "/student-app", icon: <Settings className="w-5 h-5" /> },
    ],
  },
  {
    title: "ADMINISTRATION",
    items: [
      { label: "Staff Management", href: "/staff", icon: <UserCog className="w-5 h-5" /> },
      { label: "Billing & Subscriptions", href: "/billing", icon: <CreditCard className="w-5 h-5" /> },
      { label: "Settings", href: "/settings", icon: <Settings className="w-5 h-5" /> },
    ],
  },
];

function NavItemComponent({ item, pathname }: { item: NavItem; pathname: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = pathname === item.href;
  const isChildActive = hasChildren && item.children?.some(child => pathname === child.href);

  // Auto-expand if child is active
  const shouldExpand = isOpen || isChildActive;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center gap-3 px-4 h-11 transition-all duration-200 cursor-pointer",
            (isActive || isChildActive)
              ? "bg-brand-dark-deep text-white border-l-[3px] border-brand-primary"
              : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
          )}
        >
          <span className="shrink-0">{item.icon}</span>
          <span className="flex-1 text-sm font-medium text-left">{item.label}</span>
          {shouldExpand ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        {shouldExpand && (
          <div className="bg-brand-dark-deep/50 border-l-[3px] border-transparent ml-3">
            {item.children?.map((child) => {
              const childIsActive = pathname === child.href;
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    "flex items-center gap-3 pl-8 pr-4 h-10 transition-all duration-200 cursor-pointer",
                    childIsActive
                      ? "text-brand-primary bg-brand-primary/10"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  )}
                >
                  <span className="shrink-0">{child.icon}</span>
                  <span className="flex-1 text-sm font-medium">{child.label}</span>
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
        "flex items-center gap-3 px-4 h-11 transition-all duration-200 cursor-pointer",
        isActive
          ? "bg-brand-dark-deep text-white border-l-[3px] border-brand-primary"
          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
      )}
    >
      <span className="shrink-0">{item.icon}</span>
      <span className="flex-1 text-sm font-medium">{item.label}</span>
      {item.badge && (
        <Badge className="bg-brand-primary text-white text-[10px] px-1.5 py-0 h-5 min-w-5 flex items-center justify-center">
          {item.badge}
        </Badge>
      )}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <aside className="fixed left-0 top-0 h-screen bg-brand-dark flex flex-col z-50 w-60">
        {/* Logo Block */}
        <div className="h-[72px] flex items-center px-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-brand-primary font-bold text-lg">E</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-semibold text-sm">EduHub</span>
              <Badge className="bg-emerald-600 text-white text-[10px] px-1.5 py-0 h-4 -ml-0.5">
                ORG ADMIN
              </Badge>
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
                <NavItemComponent key={item.href} item={item} pathname={pathname} />
              ))}
            </div>
          ))}
        </nav>

        {/* User Block */}
        <div className="shrink-0 border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9 border-2 border-white/20">
              <AvatarImage src="/avatar.png" />
              <AvatarFallback className="bg-emerald-600 text-white text-sm font-semibold">
                IA
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">Institute Admin</div>
              <div className="text-slate-400 text-xs truncate">admin@eduhub.in</div>
            </div>
            <button className="text-slate-400 hover:text-white transition-colors p-1">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
