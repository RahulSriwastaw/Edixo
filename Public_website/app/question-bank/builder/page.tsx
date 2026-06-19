"use client";




import { cn } from '@/lib/utils'
import { AdvancedSetBuilder } from "@/components/qbank/AdvancedSetBuilder";
import { Suspense } from "react";

function SetBuilderContent() {
  const isOpen = true;

  return (
    <div className="min-h-screen bg-neutral-bg">
      
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "md:ml-60" : "ml-0")}>
        
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
       <div className="flex h-screen items-center justify-center bg-neutral-bg">
         <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-[var(--text-secondary)] animate-pulse">Initializing Set Builder...</p>
         </div>
       </div>
    }>
      <SetBuilderContent />
    </Suspense>
  );
}
