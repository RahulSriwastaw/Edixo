'use client';

import React from 'react';
import { Search, Bell, HelpCircle, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="sticky top-0 right-0 left-0 h-14 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] z-40 flex items-center justify-between px-6 shadow-sm">
      <div className="flex flex-col">
        <h1 className="text-[18px] font-bold text-slate-900 leading-tight tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[12px] text-[#6B7280] font-medium leading-tight">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="hidden md:flex items-center relative group">
          <Search className="absolute left-3 text-slate-400 group-focus-within:text-[#FF5A1F] transition-colors" size={14} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="h-8 w-48 pl-9 pr-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#FF5A1F]/10 focus:border-[#FF5A1F]/50 transition-all"
          />
        </div>

        <div className="flex items-center gap-1 border-l border-[#E5E7EB] pl-3 ml-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 relative text-slate-500 hover:text-[#FF5A1F] hover:bg-[#FFF7ED]">
            <Bell size={18} />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-[#FF5A1F] rounded-full border border-white" />
          </Button>
          
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-[#FF5A1F] hover:bg-[#FFF7ED]">
            <HelpCircle size={18} />
          </Button>

          <Button size="sm" className="hidden sm:flex items-center gap-1.5 ml-1 h-8 px-3 rounded-lg text-xs">
            <Sparkles size={14} />
            Upgrade
          </Button>
        </div>
      </div>
    </header>
  );
}
