
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlayCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LibraryVideosPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <header className="bg-white border-b p-3 md:p-4">
            <div className="max-w-4xl mx-auto flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 rounded-lg">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-base md:text-lg font-headline font-bold text-slate-900">Saved Videos</h1>
            </div>
          </header>
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
              <PlayCircle className="h-8 w-8" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-slate-900">No videos saved yet</h3>
              <p className="text-[11px] text-slate-500">Bookmark video solutions to see them here.</p>
            </div>
            <Button size="sm" className="bg-primary hover:bg-primary/90 h-9 px-6 font-bold rounded-xl text-xs" onClick={() => router.push('/tests')}>
              Browse Mocks
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
