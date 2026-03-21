
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LibraryLessonsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <header className="bg-white border-b p-4">
            <div className="max-w-4xl mx-auto flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-headline font-bold">Saved Lessons</h1>
            </div>
          </header>
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
              <GraduationCap className="h-10 w-10" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-slate-900">Your lesson library is empty</h3>
              <p className="text-sm text-slate-500">Save conceptual lessons for offline review.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
