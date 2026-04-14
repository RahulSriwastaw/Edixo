"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolHeaderProps {
  title: string;
  description: string;
  backHref?: string;
  className?: string;
}

export const ToolHeader: React.FC<ToolHeaderProps> = ({ 
  title, 
  description, 
  backHref = "/question-bank/ai-generate",
  className 
}) => {
  return (
    <div className={cn("max-w-5xl mx-auto mb-8", className)}>
      <div className="flex items-center gap-4 mb-4">
        <Link 
          href={backHref}
          className="p-2.5 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-500 hover:text-primary border border-transparent hover:border-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="px-3 py-1 bg-primary/10 rounded-full border border-primary/20 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Premium Tool</span>
        </div>
      </div>
      
      <div className="space-y-1">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          {title}
        </h1>
        <p className="text-slate-500 text-lg">
          {description}
        </p>
      </div>
    </div>
  );
};
