"use client";

import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import { QuestionsList } from "@/components/qbank/QuestionsList";

export default function QuestionsViewPage() {
  const { isOpen } = useSidebarStore();

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-6 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
          <div className="max-w-[1400px] mx-auto w-full h-full flex flex-col animate-fade-in">
            <QuestionsList />
          </div>
        </main>
      </div>
    </div>
  );
}
