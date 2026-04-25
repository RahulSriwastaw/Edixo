"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlayCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LibraryVideosPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-body)", color: "var(--text-primary)" }}>
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <header className="px-3 md:px-4 py-3" style={{ background: "var(--bg-sidebar)", borderBottom: "var(--divider)" }}>
            <div className="max-w-4xl mx-auto flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 rounded-lg" style={{ color: "var(--text-muted)" }}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-base md:text-lg font-bold">Saved Videos</h1>
            </div>
          </header>
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "var(--bg-main)" }}>
              <PlayCircle className="h-8 w-8" style={{ color: "var(--text-muted)" }} />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>No videos saved yet</h3>
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Bookmark video solutions to see them here.</p>
            </div>
            <Button size="sm" className="h-9 px-6 font-bold rounded-lg text-[11px]" style={{ background: "#FF6B2B" }} onClick={() => router.push('/tests')}>
              Browse Mocks
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
