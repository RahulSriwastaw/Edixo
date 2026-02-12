'use client';

import React from 'react';
import { LucideIcon, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { cn } from '../../lib/utils';
import Link from 'next/link';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color?: string;
}

export function DashboardCard({ title, description, icon: Icon, href, color = "bg-orange-50" }: DashboardCardProps) {
  return (
    <Link href={href}>
      <Card className="h-full group cursor-pointer border-[#E5E7EB] hover:border-[#FF5A1F]/30 transition-all">
        <CardHeader className="p-5">
          <div className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110",
            color
          )}>
            <Icon size={20} className="text-[#FF5A1F]" />
          </div>
          <div className="flex items-center justify-between mb-1">
            <CardTitle className="text-base font-bold text-slate-900 group-hover:text-[#FF5A1F] transition-colors">
              {title}
            </CardTitle>
            <ArrowRight size={16} className="text-slate-300 group-hover:text-[#FF5A1F] transition-all transform group-hover:translate-x-1" />
          </div>
          <CardDescription className="text-slate-500 leading-snug line-clamp-2">
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
