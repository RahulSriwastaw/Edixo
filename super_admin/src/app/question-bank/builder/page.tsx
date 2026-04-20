"use client";

import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import { AdvancedSetBuilder } from "@/components/qbank/AdvancedSetBuilder";
import { Suspense } from "react";

function SetBuilderContent() {
  const { isOpen } = useSidebarStore();

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "md:ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-6 overflow-hidden">
          <AdvancedSetBuilder />
        </main>
      </div>
    </div>
  );
}

export default function SetBuilderPage() {
  return (
    <Suspense fallback={
       <div className="flex h-screen items-center justify-center bg-slate-50">
         <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-500 animate-pulse">Initializing Set Builder...</p>
         </div>
       </div>
    }>
      <SetBuilderContent />
    </Suspense>
  );
}
