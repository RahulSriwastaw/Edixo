"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LibraryLessonsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-body)", color: "var(--text-primary)" }}>
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <header className="px-4 py-3" style={{ background: "var(--bg-sidebar)", borderBottom: "var(--divider)" }}>
            <div className="max-w-4xl mx-auto flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9 rounded-lg" style={{ color: "var(--text-muted)" }}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-base font-bold">Saved Lessons</h1>
            </div>
          </header>
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "var(--bg-main)" }}>
              <GraduationCap className="h-10 w-10" style={{ color: "var(--text-muted)" }} />
            </div>
            <div className="text-center">
              <h3 className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>Your lesson library is empty</h3>
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Save conceptual lessons for offline review.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
