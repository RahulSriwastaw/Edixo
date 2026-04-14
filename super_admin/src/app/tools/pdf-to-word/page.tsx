"use client";

import React, { useState, useEffect } from 'react';
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import PdfConverter from '../../../components/tools/text-extract/PdfConverter';
import { Sparkles, ArrowLeft } from "lucide-react";
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
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href="/question-bank" className="p-2 hover:bg-gray-100 rounded-lg">
                  <ArrowLeft className="w-5 h-5 text-gray-500" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">AI PDF to Editable Word</h1>
                  <p className="text-gray-500 text-sm">Convert scanned PDFs and images into professional formatted Word documents.</p>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-white shadow-xl rounded-xl border-slate-100">
               <PdfConverter />
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
