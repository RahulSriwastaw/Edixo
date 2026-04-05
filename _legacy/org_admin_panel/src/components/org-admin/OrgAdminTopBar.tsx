"use client";

import { Bell, Menu, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOrgSidebar } from "./OrgAdminSidebar";

interface SelectedOrg {
  id: string;
  name: string;
  domain: string;
  plan: string;
  status: string;
  students: number;
  staff: number;
}

interface OrgAdminTopBarProps {
  selectedOrg?: SelectedOrg | null;
  onChangeOrg?: () => void;
  onExitOrg?: () => void;
}

export function OrgAdminTopBar({ selectedOrg, onChangeOrg, onExitOrg }: OrgAdminTopBarProps) {
  const { setIsOpen } = useOrgSidebar();

  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-6 shadow-sm">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden mr-2"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Breadcrumb / Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold text-gray-900 truncate">
          Org Admin Panel
        </h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search... (⌘K)"
            className="pl-9 w-[200px] lg:w-[300px] input-field h-9"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-gray-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/avatar.png" />
                <AvatarFallback className="bg-orange-500 text-white text-sm font-semibold">
                  RK
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-900">Rahul Kumar</div>
                <div className="text-xs text-gray-500">Org Admin</div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              My Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              Change Password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
