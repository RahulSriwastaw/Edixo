'use client';

import React from 'react';
import { Zap, ChevronsUpDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export function OrganizationSwitcher() {
  return (
    <div className="flex items-center gap-2 p-1.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg cursor-pointer hover:border-[#FF5A1F]/30 transition-all group">
      <div className="h-7 w-7 rounded-md bg-white border border-[#E5E7EB] flex items-center justify-center text-[#FF5A1F] shadow-sm">
        <Zap size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-bold text-slate-900 truncate">Q_Bank</div>
        <div className="text-[10px] text-[#6B7280] font-medium truncate">Premium Plan</div>
      </div>
      <ChevronsUpDown size={12} className="text-slate-400 group-hover:text-[#FF5A1F] transition-colors" />
    </div>
  );
}
