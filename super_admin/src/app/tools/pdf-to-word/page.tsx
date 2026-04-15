"use client";

import React, { useState, useEffect } from 'react';
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import PdfConverter from '../../../components/tools/text-extract/PdfConverter';
import { ArrowLeft } from "lucide-react";
import Link from 'next/link';

export default function PdfToWordPage() {
  const { isOpen } = useSidebarStore();

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
            {/* Tool Header - Cleaned up to feel more integrated */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href="/question-bank" className="p-2 hover:bg-gray-100 rounded-lg transition-colors group">
                  <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-brand-primary" />
                </Link>
                <nav className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <span>Question Bank</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-slate-900 font-bold">PDF to Editable Word</span>
                </nav>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
               <PdfConverter />
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
